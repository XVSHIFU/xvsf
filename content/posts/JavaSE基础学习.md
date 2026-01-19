---
title: JavaSE基础学习
date: 2025-08-12
categories:
  - Java基础
tags:
  - Java基础
  - 语言基础
---

# JavaSE  学习
[《阿里巴巴Java开发手册（终极版）》.pdf](https://www.yuque.com/attachments/yuque/0/2025/pdf/52403351/1754996125485-6d280e65-80a3-47ca-946f-e310b56897d6.pdf)

[jdk api 1.8_google.CHM](https://www.yuque.com/attachments/yuque/0/2025/chm/52403351/1754996196946-be7db0d3-4135-4dd6-aad8-a639794caeea.chm)

# 基础知识
## Java三大版本
**Write Once,Run Anywhere**

JavaSE：标准版（桌面程序，控制台开发……)

~~JavaME~~：嵌入式开发（手机，小家电……)	

JavaEE：E企业级开发  (web端，服务器开发...)

## JDK&JRE&JVM
JDK: Java Development Kit  
JRE: Java Runtime Environment  
JVM: JAVA Virtual Machine

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250610141507931.jpeg)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601190959219.png)



## HelloWorld
新建一个Java文件，写入代码

```java
public class Hello{
    public static void main(String[] args) {
        System.out.print("Hello, World!");
        System.out.print("nihao!");
    }
}
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250610142459716.png)



在本目录下打开cmd编译Java文件，编译后出现`.class`文件

```java
javac Hello.java
```



运行：

```java
java Hello
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250610142653198.png)



## Java程序运行机制
编译型：所有的一次性“翻译”；

解释型：实时”翻译“；

Java既有编译也有解释：

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250610143736110.png)



# Java基础语法
[《阿里巴巴Java开发手册（终极版）》](https://developer.aliyun.com/ebook/386)

## 1、注释&标识符&关键字
**注释：**

单行注释：`\\`

多行注释：`\* *\`

JavaDoc:文档注释：`\** *\`

**标识符：**

Java所有的组成部分都需要名字。类名、变量名以及方法名都被称为标识符。

+ 标识符开头：字母（A-Z&a-z）,`$`,`_`
+ 首字符之后：字母（A-Z&a-z）,`$`,`_`，数字
+ 关键字不用于变量名或方法名
+ 标识符大小写敏感

**关键字：**

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250610145822724.png)

class:

public:

### static详解:
```java
package oop.demo07;

public class Person {
    //2
    {
        System.out.println("匿名代码块");
    }

    //1，只执行一次
    static {
        System.out.println("静态代码块");
    }
    //3
    public Person(){
        System.out.println("构造方法");
    }

    public static void main(String[] args) {
        Person person = new Person();
        System.out.println("=================");
        Person person2 = new Person();
    }
}

/*运行结果
静态代码块
匿名代码块
构造方法
=================
匿名代码块
构造方法
*/
```

void:

interface:

## 2、数据类型
强类型语言：要求变量的使用要严格符合规定，所有变量都必须先定义后才能使用。

+ 基本类型:
    - 数值类型：
        * 整数：

```java
byte num2 = 20;//1B，8位
short num3 = 30;//2B，16位
int num1 = 10;//4B，32位//最常用
long num4 = 30L;//8B，64位//数据后加L
```

        * 浮点：

```java
float num5 = 50.1F;//4B//数据后加F
double num6 = 3.14159265358;//8B
```

        * 字符：

```java
char name = 'w';//2B，16位
```

    - 布尔类型：占1位

```java
boolean flag = true;
boolean falg = false;
```

+ 引用类型：
    - 类
    - 接口
    - 数组

拓展：

```java
import com.sun.javafx.binding.StringFormatter;
public class Demo03 {
    public static void main(String[] args) {
        //整数拓展： 进制  二进制0b  十进制   八进制0  十六进制0x
        int i = 10;
        int i2 = 010;
        int i3 = 0x10;
        System.out.println(i);//10
        System.out.println(i2);//8
        System.out.println(i3);//16

        //浮点数拓展
        //float 有限 离散 舍入误差 大约 0接近但不等于
        //最好避免完全使用浮点数进行比较，比较要用 BigDecimal 数学工具类
        float f = 0.1f;
        double d = 1.0/10;
        System.out.println(f==d);//flase
        float d1 = 1232312312312f;
        float d2 = d1 + 1;
        System.out.println(d1==d2);//true

        //字符拓展
        //所有的字符本质还是数字。
        char c1 = 'a';
        char c2 = '中';
        System.out.println(c1);
        System.out.println(c2);
        System.out.println((int)c1);//强制转换，97
        System.out.println((int)c2);//20013
        //Unicode编码:  占2B 表示范围：0-65536  Excel:2^16=65536
        char c3 = '\u4e2d';
        System.out.println(c3);//中

        //转义字符  \t 制表符     \n 换行
        System.out.println("Hello\nWorld");

        //对象、内存分析
        String sa = new String("helloworld");
        String sb = new String("helloworld");
        System.out.println(sa==sb);//false

        //布尔值拓展
        //Less is More!
        boolean flag = true;
        if (flag==true) {}
        if (flag) {}
    }
}
```

## 3、类型转换
低		------------------------------------------------->	高

 byte,short,char -> int -> long  -> float -> double

+ 运算中，不同类型的数据先转化为同一类型，然后进行运算。





强制转换  高->低		(类型)变量名  
自动转换  低->高

```java
public class Demo04 {
    public static void main(String[] args) {
        int i = 128;
        byte b = (byte)i;//内存溢出
        System.out.println(b);//-128
        double d = i;
        System.out.println(d);//128.0
        
         //操作比较大的数的时候注意溢出问题
        int money = 10_0000_0000;
        int years = 20;
        int total = money*years;
        System.out.println(total);//-1474836480
        long total2 = money*years;//money*years 计算时仍是 int ，已经出错了
        System.out.println(total2);//-1474836480
        long total3 = money*(long)years;
        System.out.println(total3);//200_0000_0000
        long total4 = (long)money*years;
        System.out.println(total4);//20000000000
    }
}
```



注意点：

1. 不能对布尔值转换
2. 不能把对象类型转换为不相干的东西
3. 高->低：强制转换 
4. 转换时存在内存溢出、精度问题



## 4、变量&常量
```java
public class Demo08 {
    //实例变量：从属于对象；如果不自行初始化，默认值为：0，0.0，false,(除了基本类型其余的默认值都是null)
    String name;
    int age;

    //类变量
    static double salary = 2500;

    //main方法
    public static  void main (String[] args) {
        //局部变量；必须声明和初始化
        //定义变量
        int a = 1;
        char x = 'w';
        double r = 12.3;

        //实例变量使用：变量类型 变量名 = new 变量类型();
        Demo08 demo08 = new Demo08();
        System.out.println(demo08.age);//0
        System.out.println(demo08.name);//null

        //类变量
        System.out.println(salary);//2500.0
    }

    //其他方法
    public void add(){}
}
```



常量：

一般用大写字母

```java
final double PI = 3.14;
final static double PI = 3.14;
static final double PI = 3.14;
```



**变量的命名规范**

+ 所有变量、方法、类名：见名知意
+ 类成员变量：首字母小写和驼峰原则：monthSalary
+ 局部变量：首字母小写和驼峰原则
+ 常量：大写字母和下划线：MAX_VALUE
+ 类名：首字母大写和驼峰原则：Man,GoodMan
+ 方法名：首字母小写和驼峰原则：runO,runRun0





## 5、运算符
### Java语言支持如下运算符：
```java
算术运算符:+，-，*，/，%，++，--
赋值运算符:=
关系运算符:>，<，>=，<=，==，！=，instanceof
逻辑运算符:&&，||，！
位运算符：&，|，^，~，>>，<<，>>>（了解！！！）
条件运算符: ?，:
扩展赋值运算符:+=，-=，*=，/=
```



### 逻辑运算符：
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601190959615.png)

### 自增自减：
```java
package operator;

public class Demo04 {
    public static void main (String[] args) {
        int a = 3;
        int b = a++;//执行完这行代码后，先给b赋值，再自增
        //a = a + 1;
        System.out.println(b);//3
        System.out.println(a);//4
        int c = ++a;//执行完这行代码前，先自增，再给c赋值
        System.out.println(c);//5
    }
}
```



### 幂运算：
```java
double pow = Math.pow(3,2);
System.out.println(pow);//9.0
```



### 位运算：
```java
package operator;

public class Demo06 {
    public  static void main (String[] args) {
        /*
         * A = 0011 1100
         * B = 0000 1101
         * ----------------
         * A & B = 0000 1100
         * A | B = 0011 1101
         * A ^ B = 0011 0001
         * ~A = 1100 0011
         * A << 2 = 0111 1100
         * A >> 2 = 0000 0011
         * A >>> 2 = 0000 0011
         */
        //如何计算2*8？
        System.out.println(2<<3);//16
        /*
        分析：
        0000 0000     1
        0000 0010     2
        0000 0100     4
        0000 1000     8
        0001 0000    16
        <<  相当于 乘2
        >>  相当于 除2
        位运算效率极高！！！
         */
    }
}
```



### 三元运算符：
```java
public class Demo08 {
    public  static void main (String[] args) {
        // x ? y : z
        //如果x为true，则返回y，否则返回z
        int score = 1223;
        String type = score < 60 ? "不及格" : "及格";
        System.out.println(type);//及格
    }
}
```



## 6、包机制
包：本质就是文件夹

+ 命名：一般利用公司域名倒置作为包名：com.kuangstudy.www
+ 语法：`package pkg1[.pkg2[.pkg3...]];`
+ 导包：`import package1[.package2...].(className|*); `
    - 导入这个包下所有的类：`import com.kuang.base.*;`

> <font style="color:rgb(86, 86, 86);">包机制规则：</font>
>
> <font style="color:rgb(86, 86, 86);">参考：</font>[https://www.cnpanda.net/codeaudit/588.html](https://www.cnpanda.net/codeaudit/588.html)
>
> <font style="color:rgb(86, 86, 86);">如上图所示，在 Java 中，会有各种各样的包，大致规则如下：</font>
>
> + <font style="color:rgb(33, 37, 41);">indi ：</font>
>
> <font style="color:rgb(86, 86, 86);">个体项目，指个人发起，但非自己独自完成的项目，可公开或私有项目，copyright主要属于发起者。</font>
>
> <font style="color:rgb(86, 86, 86);">包名为</font>`<font style="color:rgb(232, 62, 140);">indi.发起者名.项目名.模块名.……</font>`
>
> + <font style="color:rgb(33, 37, 41);">pers：</font>
>
> <font style="color:rgb(86, 86, 86);">个人项目，指个人发起，独自完成，可分享的项目，copyright主要属于个人。</font>
>
> <font style="color:rgb(86, 86, 86);">包名为</font>`<font style="color:rgb(232, 62, 140);">pers.个人名.项目名.模块名.……</font>`
>
> + <font style="color:rgb(33, 37, 41);">priv：</font>
>
> <font style="color:rgb(86, 86, 86);">私有项目，指个人发起，独自完成，非公开的私人使用的项目，copyright属于个人</font>
>
> <font style="color:rgb(86, 86, 86);">包名为</font>`<font style="color:rgb(232, 62, 140);">priv.个人名.项目名.模块名.……</font>`
>
> + <font style="color:rgb(33, 37, 41);">onem：</font>
>
> <font style="color:rgb(86, 86, 86);">与“indi”相同，推荐使用“indi”</font>
>
> + <font style="color:rgb(33, 37, 41);">team：</font>
>
> <font style="color:rgb(86, 86, 86);">团队项目，指由团队发起，并由该团队开发的项目，copyright属于该团队所有</font>
>
> <font style="color:rgb(86, 86, 86);">包名为</font>`<font style="color:rgb(232, 62, 140);">team.团队名.项目名.模块名.……</font>`
>
> + <font style="color:rgb(33, 37, 41);">com：</font>
>
> <font style="color:rgb(86, 86, 86);">公司项目，copyright由项目发起的公司所有</font>
>
> <font style="color:rgb(86, 86, 86);">包名为</font>`<font style="color:rgb(232, 62, 140);">com.公司名.项目名.模块名.……</font>`
>
> <font style="color:rgb(86, 86, 86);">持久层：dao、persist、mapper</font>
>
> <font style="color:rgb(86, 86, 86);">实体类：entity、model、bean、javabean、pojo</font>
>
> <font style="color:rgb(86, 86, 86);">业务逻辑：service、biz</font>
>
> <font style="color:rgb(86, 86, 86);">控制器：controller、servlet、action、web</font>
>
> <font style="color:rgb(86, 86, 86);">过滤器：filter</font>
>
> <font style="color:rgb(86, 86, 86);">异常：exception</font>
>
> <font style="color:rgb(86, 86, 86);">监听器：listener</font>
>
> <font style="color:rgb(86, 86, 86);">在不同的框架下一般包的命名规则不同，但大概如上，不同功能的 Java 文件放在不同的包中，根据 Java 文件的功能统一安放及命名。</font>
>

## 7、JavaDoc
[JavaSE8帮助文档](https://docs.oracle.com/javase/8/docs/api/)



JavaDoc命令：用来生成自己的API文档

**参数信息**  
@author作者名  
@version版本号  
@since指明需要最早使用的jdk版本  
@param参数名  
@return返回值情况  
@throws异常抛出情况



### 使用命令行生成：
```java
javadoc -encoding UTF-8 -charset UTF-8 Doc.java
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250610181044430.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250610181109956.png)







### 使用IDEA生成：
[https://blog.csdn.net/qq_44122193/article/details/114789427](https://blog.csdn.net/qq_44122193/article/details/114789427)



<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250610181358214.png)





<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250610181534947.png)





# Java流程控制
## 1、Scanner对象
基本语法：

`Scanner s = new Scanner(System.in);`

+ 通过Scanner类的next)与nextLine0方法获取输入的字符串，在读取前我们一般需要使用hasNext(与hasNextLine()判断是否还有输入的数据。



```java
package scanner;

import java.util.Scanner;

public class Demo01 {
    public static void main (String[] args) {
        //创建一个扫描器对象，用于接收键盘数据
        Scanner scanner = new Scanner(System.in);
        System.out.println("使用next方式接收数据");

        //判断用户有没有输入字符串
        if (scanner.hasNext()){
            //使用next方式接收
            String str = scanner.next();
            System.out.println("输出的内容为："+str);
        }

        //凡是属于IO流的类如果不关闭会一直占用资源
        scanner.close();
    }
}
```

```java
package scanner;

import java.util.Scanner;

public class Demo02 {
    public static void main (String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("使用nextLine方式接收数据");

        if (scanner.hasNextLine()) {
            String str = scanner.nextLine();
            System.out.println("输出内容为："+ str);
        }
        scanner.close();
    }
}
```

```java
package scanner;

import java.util.Scanner;

public class Demo04 {
    public static void main (String[] args) {
        Scanner scanner = new Scanner(System.in);

        int i = 0;
        float f = 0.0f;

        System.out.println("请输入整数：");

        if (scanner.hasNextInt()) {
            i = scanner.nextInt();
            System.out.println("整数数据：" + i);
        }else {
            System.out.println("输入的不是整数数据！");
            scanner.next();//清楚无效输入
        }

        System.out.println("请输入小数：");

        if (scanner.hasNextFloat()) {//hasNextFloat() 方法会将整数输入（如"12"）视为有效的浮点数，因为它可以自动转换为浮点数（12.0）
            f = scanner.nextFloat();
            System.out.println("小数数据：" + f);
        }else {
            System.out.println("输入的不是小数数据！");
            scanner.next();
        }
        scanner.close();
    }
}
```



+ next():
    - 1、一定要读取到有效字符后才可以结束输入。
    - 2、对输入有效字符之前遇到的空白，next())方法会自动将其去掉。
    - 3、只有输入有效字符后才将其后面输入的**空白**作为分隔符或者结束符。
    - 4、next()不能得到带有空格的字符串。
+ nextLine():
    - 1、以Enter为结束符，也就是说nextLine()方法返回的是输入**回车**之前的所有字符。
    - 2、可以获得空白。



```java
package scanner;

import java.util.Scanner;

public class Demo05 {
    public static void main (String[] args) {
        //我们可以输入多个数字，并求其总和与平均数，每输入一个数子用回车确认，通过输入非数字来结束输入并输出执行结果：

        Scanner scanner = new Scanner(System.in);

        //和
        double sum = 0;
        //计算输入了多少哥数字
        int m = 0;

        //通过循环判断是否还有输入，并在里面对每一次进行求和和统计
        while (scanner.hasNextDouble()) {
            double x = scanner.nextDouble();
            m++;
            sum += x;
            System.out.println("你输入了第" + m + "个数据，当前结果sum=" + sum);
        }

        System.out.println(m + "个数的和为" + sum);
        System.out.println(m + "个数的平均值是" + (sum / m));

        scanner.close();


    }
}

```



## 2、顺序结构
+ JAVA的基本结构就是顺序结构，除非特别指明，否则就按照顺序一句一句执行。
+ 顺序结构是最简单的算法结构。
+ 语句与语句之间，框与框之间是按从上到下的顺序进行的，它是由若干个依次执行的处理步骤组成的，它是任何一个算法都离不开的一种基本算法结构。

## 3、选择结构
### (1)if单选择结构
```java
if (布尔表达式){
    //如果为 true 将执行的语句
}
```

### (2)if双选择结构
```java
if (布尔表达式){
    //如果为 true 将执行的语句
}else {
    //如果为 flase 将执行的语句
}
```

### (3)if多选择结构
```java
if (布尔表达式1){
    //如果布尔表达式1为 true 将执行的语句
}else if (布尔表达式2){
    //如果布尔表达式2为 true 将执行的语句
}else if (布尔表达式3){
    //如果布尔表达式3为 true 将执行的语句
}else {
    //如果以上布尔表达式都不为 true 将执行的语句
}
```

### (4)if嵌套结构
```java
if (布尔表达式1){
    //如果布尔表达式1为 true 将执行的语句
    if (布尔表达式2){
        //如果布尔表达式2为 true 将执行的语句
    }
}
```

### (5)switch多选择结构
```java
switch(expression){
    case value :
        //语句
        break;//可选
    case value :
        //语句
        break;//可选
    case value :
        //语句
        break;//可选
    default ://可选
        //语句
}
```



```java
package struct;

public class SwitchDemo01 {
    public static void main(String[] args) {
        //case 穿透 //switch 匹配一个具体的值
        char grade = 'C';

        switch (grade) {
            case 'A':
                System.out.println("Excellent!");
                break;
            case 'B':
                System.out.println("Good!");
                break;
            case 'C':
                System.out.println("Well!");
                break;
            case 'D':
                System.out.println("Pass!");
                break;
            case 'F':
                System.out.println("Fail!");
                break;
            default:
                System.out.println("Error!");
                break;
        }
    }
}
```



**java7开始，支持字符串比较**

```java
package struct;

public class SwitchDemo02 {
    public static void main(String[] args) {
        String name = "哈哈";

        //反编译 java -- class(字节码文件)

        switch (name) {
            case "哈哈":
                System.out.println("哈哈");
                break;
            case "呵呵":
                System.out.println("呵呵");
                break;
            case "呜呜":
                System.out.println("呜呜");
                break;
            default:
                System.out.println("error!");
        }
    }
}

```



通过idea的反编译查看class文件

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250610204156995.png)

## 4、循环结构
### （1）while循环
```java
while (布尔表达式) {
    //循环内容
}
```

+ 只要布尔表达式为true，循环就会一直执行下去。
+ 我们大多数情况是会让循环停止下来的，我们需要一个让表达式失效的方式来结束循环。
+ 少部分情况需要循环一直执行，比如服务器的请求响应监听等。
+ 循环条件一直为true就会造成无限循环【死循环】，我们正常的业务编程中应该尽量避免死循环。会影响程序性能或者造成程序卡死奔溃！

```java
package struct;

public class WhileDemo01 {
    public static void main(String[] args) {
        int i = 0 ;
        while (i < 100) {//也可以写 (i <= 100)
            i++;
            System.out.println(i);
        }
    }
}
```



+ 思考：计算1+2+3+...+100=?

```java
package struct;

public class WhileDemo02 {
    public static void main(String[] args) {
        int i = 0;
        int sum = 0;

        while (i < 101) {
            sum += i;
            i++;
        }
        System.out.println(sum);//5050
    }
}
```

### （2）do...while 循环
```java
do {
    //代码语句
}while{

}
```



```java
package struct;

public class DoWhileDemo01 {
    public static void main(String[] args) {
        int i = 0;
        int sum = 0;

        do {
            sum += i;
            i++;
        }while (i <= 100);

        System.out.println(sum);
    }
}

```

**While和do-While的区别：**

+ while先判断后执行，do...while是先执行后判断。
+ Do..while总是保证循环体会被至少执行一次！

```java
package struct;

public class DoWhileDemo02 {
    public static void main(String[] args) {
        int a = 0;
        while (a < 0) {
            System.out.println(a);
            a++;
        }
        System.out.println("===============");
        do {
            System.out.println(a);
            a++;
        }while (a < 0);
    }
}
/*输出：
===============
0
*/
```



### （3）for 循环
+ for循环语句是支持迭代的一种通用结构，**是最有效、最灵活的循环结构**。
+ 语法格式如下：

```java
for (初始化; 布尔表达式; 迭代/更新) {
    //执行语句
}

//死循环
for (; ; ) {
    
}
```

+ 练习1：计算0到100之间的奇数和，偶数和

```java
package struct;

public class ForDemo02 {
    public static void main(String[] args) {

        int oddSum = 0;
        int evenSum = 0;

        for (int j = 1; j < 100; j += 2) {
            oddSum += j;
        }
        for (int o = 0; o <= 100; o += 2) {
            evenSum += o;
        }
        System.out.println(oddSum);
        System.out.println(evenSum);
    }
}

//另一种方法
package struct;

public class ForDemo02 {
    public static void main(String[] args) {

        int oddSum = 0;
        int evenSum = 0;

        for (int i = 1; i <= 100; i++) {
            if (i % 2 != 0) {
                oddSum += i;
            }else {
                evenSum += i;
            }
        }
        System.out.println(oddSum);
        System.out.println(evenSum);
    }
}
```



+ 练习2：用while或for循环输出1-1000之间能被5整除的数，并且每行输出3个

```java
package struct;

public class ForDemo03 {
    public static void main(String[] args) {
        for (int i = 0; i <= 1000 ; i++) {
            if (i % 5 == 0) {
                System.out.print(i + "\t");//print 输出完不会换行
            }
            if (i % (5 * 3) == 0) {
                System.out.println("\t");// println 输出完会换行
            }
        }
    }
}

```



+ 练习3：打印九九乘法表

```java
package struct;

public class ForDemo04 {
    public static void main(String[] args) {
        for (int j = 1; j <= 9; j++) {
            for (int i = 1; i <= j; i++) {
                System.out.print(i + "*" + j + "=" + (j * i) + "\t");
            }
            System.out.println();
        }
    }
}
/*输出：
1*1=1	
1*2=2	2*2=4	
1*3=3	2*3=6	3*3=9	
1*4=4	2*4=8	3*4=12	4*4=16	
1*5=5	2*5=10	3*5=15	4*5=20	5*5=25	
1*6=6	2*6=12	3*6=18	4*6=24	5*6=30	6*6=36	
1*7=7	2*7=14	3*7=21	4*7=28	5*7=35	6*7=42	7*7=49	
1*8=8	2*8=16	3*8=24	4*8=32	5*8=40	6*8=48	7*8=56	8*8=64	
1*9=9	2*9=18	3*9=27	4*9=36	5*9=45	6*9=54	7*9=63	8*9=72	9*9=81	
*/
```

### （4）增强 for 循环（数组中重点使用）
+ Java5引入了一种主要用于数组或集合的增强型for循环。
+ Java增强for循环语法格式如下:

```java
for (声明语句 : 表达式) {
    //代码
}
```

+ 声明语句：声明新的局部变量，该变量的类型必须和数组元素的类型匹配。其作用域限定在循环语句块，其值与此时数组元素的值相等。
+ 表达式：表达式是要访问的数组名，或者是返回值为数组的方法。

```java
package struct;

public class ForDemo05 {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30, 40, 50};//定义数组

        for (int i = 0; i < 5; i++) {
            System.out.println(numbers[i]);
        }
        //增强for循环
        for (int x:numbers) {
            System.out.println(x);
        }
    }
}
```



## 5、break  continue
+ break在任何循环语句的主体部分，均可用break控制循环的流程。**break用于强行退出循环，不执行循环中剩余的语句。**(break语句也在switch语句中使用）
+ continue语句用在循环语句体中，用于**终止某次循环过程，即跳过循环体中尚未执行的语句，接着进行下一次是否执行循环的判定。**

```java
package struct;

public class BreakDemo01 {
    public static void main (String[] args) {
        int i = 0;
        while (i < 100) {
            i++;
            System.out.print(i);
            if (i == 30) {
                break;//当i等于30时，终止循环
            }
        }
    }
}
/*输出：
123456789101112131415161718192021222324252627282930
*/
```



```java
package struct;

public class ContinueDemo {
    public static void main(String[] args) {
        int i = 0;
        while (i < 100){
            i++;
            if (i % 10 == 0) {
                System.out.println();
                continue;//碰到它，程序就跳回到开始，不执行本次循环以下的代码
            }
            System.out.print(i);/*输出：
            123456789
            111213141516171819
            212223242526272829
            313233343536373839
            414243444546474849
            515253545556575859
            616263646566676869
            717273747576777879
            818283848586878889
            919293949596979899
            */
        }
    }
}

```



### 关于goto关键字（不建议使用）
+ goto关键字很早就在程序设计语言中出现。尽管goto仍是Java的一个保留字，但并未在语言中得到正式使用；Java没有goto。然而，在break和continue这两个关键字的身上，我们仍然能看出一些goto的影子——带标签的break和continue。
+ “标签”是指后面跟一个冒号的标识符，例如：label:
+ 对Java来说唯一用到标签的地方是在循环语句之前。而在循环之前设置标签的唯一理由是：我们希望在其中嵌套另个循环，由于break和continue关键字通常只中断当前循环，但若随同标签使用，它们就会中断到存在标签的地方。

```java
package struct;

public class LabelDemo01 {
    public static void main(String[] args) {
        //打印100-150之间所有质数

        int count=0;

        outer:for (int i = 101; i < 150; i++){
            for (int j = 2; j < i / 2; j++){
                if(i % j == 0){
                    continue outer;
                }
            }
            System.out.print(i+" ");//101 103 107 109 113 127 131 137 139 149 
        }
    }
}
```



## 6、练习-打印三角形&debug
```java
package struct;

public class TestDemo {
    public static void main (String[] args) {

        for (int i = 1; i <= 5 ; i++) {
            for (int j = 5; j >= i ; j--) {
                System.out.print(" ");
            }
            for (int j = 1; j <= i; j++) {
                System.out.print("*");
            }
            for (int j = 1; j < i; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}

```



### debug使用
<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250610221626442.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250610221818771.png)



# Java方法
## 1、何谓方法
Java方法是语句的集合，它们在一起执行一个功能。

+ 方法是解决一类问题的步骤的有序组合
+ 方法包含于类或对象中
+ 方法在程序中被创建，在其他地方被引用

例：System.out.println(): 调用系统类 System 中的标准输出对象 out 中的方法 println()。

System: 系统类

out: 标准输出对象

println(): 方法



设计方法的**原则**：**就是一个方法只完成1个功能。**



**方法的命名规则**

+ 1.方法的名字的第一个单词应以小写字母作为开头，后面的单词则用大写字母开头写，不使用连接符。例如：`addPerson`。
+ 2.下划线可能出现在 JUnit 测试方法名称中用以分隔名称的逻辑组件。一个典型的模式是：`test<MethodUnderTest>_<state>`，例如 `testPop_emptyStack`。

```java
package method;

public class Demo01 {
    // main方法
    public static void main(String[] args) {
        //         int add = add(1, 2);
        //         System.out.println(add);

        test();
    }

    // 加法
    public static int add(int a, int b) {
        return a + b;
    }

    // test
    public static void test() {
        for (int i = 1; i <= 5 ; i++) {
            for (int j = 5; j >= i ; j--) {
                System.out.print(" ");
            }
            for (int j = 1; j <= i; j++) {
                System.out.print("*");
            }
            for (int j = 1; j < i; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}

```



<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611110045481.png)







## 2、方法的定义及调用
### 方法的定义
Java的方法类似于其它语言的函数，是一段用来完成特定功能的代码片段，一般情况下，定义一个方法包含以下语法：

```java
修饰符 返回值类型 方法名(参数类型 参数名) {
    ...
    方法体
    ...
    return 返回值;
}
```

+ 修饰符：可选，定义了该方法的访问类型；
+ 返回值类型：方法可能会返回值。returnValueType 是方法返回值的数据类型。有些方法执行所需的操作，但没有返回值。在这种情况下，returnValueType 是关键字**void**。
+ 方法名：是方法的实际名称。方法名和参数表共同构成方法签名。要遵守命名规则。
+ 参数类型**：**可选，参数像是一个占位符。当方法被调用时，传递值给参数。这个值被称为实参或变量。参数列表是指方法的参数类型、顺序和参数的个数。
    - 形参&实参

```java
    public static void main(String[] args) {
         int add = add(1, 2);// 1,2 是实参
         System.out.println(add);
    }
    
    // 加法
    public static int add(int a, int b) {// a,b 是形参
        return a + b;
    }
```

+ 方法体：方法体包含具体的语句，定义该方法的功能。



### 方法调用
调用方法：对象名.方法名(实参列表)

+ 当方法返回一个值的时候，方法调用通常被当做一个值。例如：`int larger = max(30, 40);`
+ 如果方法返回值是void，方法调用一定是一条语句。例如：`System.out.println("Hello!");`

```java
package method;

public class Demo02 {
    public static void main(String[] args) {
       int max = max(10, 10);
       System.out.println(max);
    }

    // 比大小
    public static int max(int num1, int num2) {
        int result = 0;
        if (num1 > num1) {
            result =  num1;
        }else if (num1 == num2) {
            System.out.println("num1 = num2");
            return 0;// 终止方法
        }else {
            result = num2;
        }
        return  result;
    }
}
```





## 3、方法重载
重载是在一个类里面，方法名字相同，而参数不同。返回类型可以相同也可以不同。

**重载规则:**

+ 参数列表必须不同(参数个数、类型、参数排列顺序不一样)；
+ 方法名称必须相同
+ 方法返回类型可以相同也可以不同
+ 仅仅返回类型不同不足以成为方法的重载

        

```java
package method;

public class Demo02 {
    public static void main(String[] args) {
        //int max = max(10, 10);
        // System.out.println(max);

        double max = max(10.0, 10.6);
        System.out.println(max);
    }

    // 比大小
    public static int max(int num1, int num2) {
        int result = 0;
        if (num1 > num1) {
            result =  num1;
        }else if (num1 == num2) {
            System.out.println("num1 = num2");
            return 0;// 终止方法
        }else {
            result = num2;
        }
        return  result;
    }

    public static double max(double num1, double num2) {
        double result = 0;
        if (num1 > num1) {
            result =  num1;
        }else if (num1 == num2) {
            System.out.println("num1 = num2");
            return 0;// 终止方法
        }else {
            result = num2;
        }
        return  result;
    }
}

```



## 4、命令行传参
找对路径！



```java
package method;

public class Demo03 {
    public static void main(String[] args) {
        // args.length 数组长度
        for (int i = 0; i < args.length; i++) {
            System.out.println("args[" + i + "]:" + args[i]);
        }
    }
}

```



<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611124314255.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611124613276.png)







## 5、可变参数
+ JDK1.5开始，Java支持传递同类型的可变参数给一个方法。
+ 在方法声明中，在指定参数类型后加一个省略号（...）。
+ 一个方法中只能指定一个可变参数，它必须是方法的最后一个参数。任何普通的参数必须在它之前声明。



```java
package method;

public class Demo04 {
    public static void main(String[] args){
        // 调用可变参数的方法
        printMax(12,23,42,23,12,2,23,432,12);
        printMax(new double[]{1,2,3,4});
    }

    public static void printMax(double... numbers) {
        if (numbers.length == 0) {
            System.out.println("No argument passed");
            return;
        }

        double result = numbers[0];

        // 排序
        for (int i = 1; i < numbers.length; i++) {
            if (numbers[i] > result) {
                result = numbers[i];
            }
        }
        System.out.println("The max value is " + result);
    }
}

```



## 6、递归
递归就是：**A方法调用A方法！就是自己调用自己**

		利用递归可以用简单的程序来解决一些复杂的问题。它通常把一个大型复杂的问题层层转化为一个与原问题相似的规模较小的问题来求解，递归策略只需少量的程序就可描述出解题过程所需要的多次重复计算，大大地减少了程序的代码量。递归的能力在于用有限的语句来定义对象的无限集合。

递归结构包括两个部分：

+ 递归头：什么时候不调用自身方法。如果没有头，将陷入死循环。
    - 边界条件：
+ 递归体：什么时候需要调用自身方法。

**错误案例：**

```java
package method;

public class Demo05 {
    public static void main(String[] args){
        Demo05 test = new Demo05();
        test.test();
    }

    public void test() {
        test();
    }
}


/*Exception in thread "main" java.lang.StackOverflowError
    at method.Demo05.test(Demo05.java:10)
    at method.Demo05.test(Demo05.java:10)
    at method.Demo05.test(Demo05.java:10)
    at method.Demo05.test(Demo05.java:10)
    at method.Demo05.test(Demo05.java:10)
    at method.Demo05.test(Demo05.java:10)
    ...
    */
```



StackOverflowError（栈溢出错误）

[【JVM】Java内存溢出分析（堆溢出、栈溢出、方法区溢出、直接内存溢出）](https://blog.csdn.net/FMC_WBL/article/details/134407898)



```java
// 阶乘运算
package method;

public class Demo06 {
    public static void main(String[] args) {
        System.out.println(f(5));
    }

    public static int f(int n) {
        if (n == 1) {
            return 1;
        }else {
            return n * f(n -1);
        }
    }
}

```



`int` 类型最大值为 2³¹-1 (2,147,483,647)。阶乘值超过此值时会产生溢出：

`12! = 479,001,600   ( < 2.1e9，安全)  
13! = 6,227,020,800 ( > 2.1e9，溢出为负数)`

**数据类型**：

+ `int` 最大有效 `n=12`
+ `long` 最大有效 `n=20`
+ `BigInteger` 无理论上限（但需足够堆内存）



## 7、练习-计算器
写一个计算器，要求实现加减乘除功能，并且能够循环接收新的数据，通过用户交互实现。

```java
package method;

import java.util.Scanner;

public class TestDemo {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        boolean continueCalculating = true;

        System.out.println("this is Java calc!");
        System.out.println("支持：加法，减法，乘法，除法");
        System.out.println("输入'exit'退出");

        while (continueCalculating) {
            System.out.println("\n请输入第一个数字：");
            String input = scanner.nextLine();
            if ("exit".equals(input)) {
                break;
            }
            double a = Double.parseDouble(input);

            System.out.print("请输入运算符 (+, -, *, /): ");
            char operator = scanner.nextLine().charAt(0);

            System.out.print("请输入第二个数字: ");
            input = scanner.nextLine();
            if (input.equalsIgnoreCase("exit")) {
                break;
            }
            double b = Double.parseDouble(input);

            double result = 0;
            String operation = "";
            switch (operator) {
                case '+':
                    result = add(a, b);
                    operation = "加法";
                    break;
                case '-':
                    result = subtract(a, b);
                    operation = "减法";
                    break;
                case '*':
                    result = multiply(a, b);
                    operation = "乘法";
                    break;
                case '/':
                    result = divide(a, b);
                    operation = "除法";
                    break;
                default:
                    System.out.println("错误: 无效运算符 '" + operator + "'");
                    continue;
            }
            if (result == (int) result) {
                System.out.printf("%s运算结果: %d%n", operation, (int) result);
            } else {
                System.out.printf("%s运算结果: %.2f%n", operation, result);
            }
        }
        System.out.println("\n感谢使用计算器，再见!");
        scanner.close();
    }

    public static double add(double a, double b) {
        return a + b;
    }

    public static double subtract(double a, double b) {
        return a - b;
    }

    public static double multiply(double a, double b) {
        return a * b;
    }

    public static double divide(double a, double b) {
        if (b == 0) {
            System.out.println("b is 0");
            return 0;
        }
        return a / b;
    }

}

/*
this is Java calc!
支持：加法，减法，乘法，除法
输入'exit'退出

请输入第一个数字：
1
请输入运算符 (+, -, *, /): +
请输入第二个数字: 1
加法运算结果: 2

请输入第一个数字：
1
请输入运算符 (+, -, *, /): -
请输入第二个数字: 2
减法运算结果: -1

请输入第一个数字：
exit

感谢使用计算器，再见!

进程已结束，退出代码为 0
*/
```





# Java数组
## 1、数组概述
+ 数组是相同类型数据的有序集合。
+ 数组描述的是相同类型的若干个数据，按照一定的先后次序排列组合而成。
+ 其中，每一个数据称作一个数组元素，每个数组元素可以通过一个下标来访问它们。

## 2、数组声明创建
声明数组变量：

```java
dataType[] arrayRefVar;	// 首选方法
dataType arrayRefVar[];
```

**数组声明创建：**

```java
dataType[] arrayRefVar = new dataType[arraySize];
```



+ 获取数组长度：`arrays.length`
+ 数组的元素是通过索引访问的，数组索引从 0 开始。



```java
package array;

public class ArrayDemo01 {
    public static void main(String[] args) {
        // 1、声明数组
        int[] nums;
        int nums1[];// c 和 c++ 中的写法

        // 2、创建数组，此数组可以存储10个int类型的数据
        nums = new int[10];

        int[] nums2 = new int[10];// 1、2可以合起来写

        // 3、给数组赋值
        nums[0] = 1;
        nums[1] = 2;
        nums[2] = 3;
        nums[3] = 4;
        nums[4] = 5;
        nums[5] = 6;
        nums[6] = 7;
        nums[7] = 8;
        nums[8] = 9;
        nums[9] = 10;

        System.out.println(nums[3]);// 4

        // 计算所有元素的和
        int sum = 0;

        for (int i = 0; i < nums.length; i++) {
            sum += nums[i];
        }
        System.out.println(sum);//55
    }
}

```



## 3、内存分析
### Java内存分析：
<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611142707512.png)





### 堆&栈：
<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611143535734.png)

数组声明时并不存在，当创建数组时才会生成，一般声明创建会一起进行

`dataType[] arrayRefVar = new dataType[arraySize];`



java.lang.ArrayIndexOutOfBoundsException   数组越界





## 4、三种初始化
+ 静态初始化
+ 动态初始化
+ 默认初始化
    - 数组是引用类型，它的元素相当于类的实例变量，因此数组一经分配空间，其中的每个元素也被按照实例变量同样的方式被隐式初始化。

```java
package array;

public class ArrayDemo02 {
    public static void main(String[] args) {
        // 静态初始化：创建 + 赋值
        int[] a = {1, 2, 3, 4, 5};
        System.out.println(a[0]);// 1

        // 动态初始化：创建 + 动态赋值， 包含默认初始化
        int[] b = new int[10];
        b[0] = 10;

        System.out.println(b[0]);// 10
        System.out.println(b[1]);// 0  // 默认初始化为 0
        System.out.println(b[2]);// 0
        System.out.println(b[9]);// 0
    }
}
```

## 5、数组的四个基本特点
+ 其长度是确定的。数组一旦被创建，它的大小就是不可以改变的。
+ 其元素必须是相同类型，不允许出现混合类型。
+ 数组中的元素可以是任何数据类型，包括基本类型和引用类型。
+ 数组变量属引用类型，数组也可以看成是对象，数组中的每个元素相当于该对象的成员变量。数组本身就是对象，Java中对象是在堆中的，因此数组无论保存原始类型还是其他对象类型，**数组对象本身是在堆中的。**

## 6、数组边界
+ 下标的合法区间：`[0, length - 1]`
+ 越界会报错：`ArrayIndexOutOfBoundsException`   数组下标越界异常

## 7、数组使用
### 基本使用
```java
package array;

public class ArrayDemo03 {
    public static void main(String[] args) {
        int[] arrays = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

        // 打印全部的数组元素
        for (int i = 0; i < arrays.length; i++) {
            System.out.println(arrays[i]);
        }
        System.out.println("==========");

        // 计算所有元素的和
        int sum = 0;
        for (int i = 0; i < arrays.length; i++) {
            sum += arrays[i];
        }
        System.out.println("sum=" + sum);
        System.out.println("==========");

        // 查找最大的元素
        int max = arrays[0];
        for (int i  = 1; i < arrays.length; i++) {
            if (arrays[i] > max) {
                max = arrays[i];
            }
        }
        System.out.println("max=" + max);
    }
}

```



### For-Each循环
```java
package array;

public class ArrayDemo04 {
    public static void main(String[] args) {
        int[] arrays = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

        // for each,没有下标
        for (int array : arrays) {
           System.out.print(array);
        }   
    }
}

/*输出：
12345
*/
```



### 数组作方法入参
```java
package array;

public class ArrayDemo04 {
    public static void main(String[] args) {
        int[] arrays = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        
        printArray(arrays);    
    }

    // 打印数组元素
    public static void printArray(int[] arrays) {
        for (int i = 0; i < arrays.length; i++) {
            System.out.print(arrays[i] + " ");
        }
    }
}

/*输出：
1 2 3 4 5
*/
```



### 数组作返回值
```java
package array;

public class ArrayDemo04 {
    public static void main(String[] args) {
        int[] arrays = {1, 2, 3, 4, 5};

        int[] reverse = reverse(arrays);
        printArray(reverse);
    }

    // 反转数组
    public static int[] reverse(int[] arrays){
        int[] result = new int[arrays.length];

        // 反转的操作
        for (int i = 0, j = result.length - 1; i <  arrays.length; i++, j--) {
            result[j] = arrays[i];
        }
        return result;
    }

    public static void printArray(int[] arrays) {
        for (int i = 0; i < arrays.length; i++) {
            System.out.print(arrays[i] + " ");
        }
    }
}

/*输出：
5 4 3 2 1 
*/
```



## 8、多维数组
多维数组可以看成是数组的数组，比如二维数组就是一个特殊的一维数组，其每一个元素都是一个一维数组。

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611154414402.png)





二维数组：

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611154748058.png)



### 使用
```java
package array;

public class ArrayDemo05 {
    public static void main(String[] args) {

        // [4][2]
        /*
        1,2     array[0]
        3,4     array[1]
        5,6     array[2]
        7,8     array[3]
         */

        int[][] array = {{1,2}, {3,4}, {5,6}, {7,8}};
        System.out.println(array[2][0]);// 5

        int[][][] array1 = {{{1,2}, {3,4}, {5,6}, {7,8}}, {{1,2}, {3,4}, {5,6}, {7,8}}, {{1,2}, {3,4}, {5,6},}};
        System.out.println(array1[0][3][1]);// 8
        
        // 打印数组元素
        for (int i = 0; i < array.length; i++) {
            for (int j = 0; j < array[i].length; j++) {
                System.out.println(array[i][j]);
            }
        }
    }
}
```



## 9、Arrays 类
[Arrays 类](https://docs.oracle.com/javase/8/docs/api/)

[JAVA JDK 1.8 API 中文文档 高清完整版 CHM](https://gitcode.com/Resource-Bundle-Collection/7cdd1)

java.util.Arrays

**常用功能：**

+ 打印数组：toString
+ 给数组赋值：fill
+ 对数组排序：sort，升序。
+ 比较数组：equals方法比较数组中元素值是否相等。
+ 查找数组元素：通过binarySearch方法能对排序好的数组进行二分查找法操作。

```java
package array;

import java.util.Arrays;

public class ArrayDemo06 {
    public static void main(String[] args) {
        int[] a = {1,4,2232,223,34,23,6,456,123,786,345};
        System.out.println(a);// [I@4554617c

        // 打印数组元素 Arrays.toString()
        System.out.println(Arrays.toString(a));// [1, 4, 2232, 223, 34, 23, 6, 456, 123, 786, 345]
   
        // 排序（升序） Arrays.sort()
        Arrays.sort(a);
        System.out.println(Arrays.toString(a));// [1, 4, 6, 23, 34, 123, 223, 345, 456, 786, 2232]
        
        // 数组填充
        Arrays.fill(a, 0);
        System.out.println(Arrays.toString(a));
    }
}
```

## 10、冒泡排序
时间复杂度为O(n2)

```java
package array;
/*
 冒泡排序
 1.比较数组中，俩个相邻的元素，如果第一个数比第二个数大，我们就交换他们的位置
 2.每一次比较，都会产生出一个最大，或者最小的数字
 3.下一轮则可以少一次排序
 4.依次循环，直到结束
 */

import java.util.Arrays;

public class ArrayDemo07 {
    public static void main(String[] args) {
        int[] a = {12,32,5,5466,231,564,21312,2341,21,3};
        int[] sort = sort(a);
        System.out.println(Arrays.toString(sort));

    }


    public static int[] sort(int[] array) {

        // 外层循环，判断这个循环要走多少次
        for (int i = 0; i < array.length - 1; i++) {
            // 内层循环，比较判断俩个数，如果第一个数比第二个数大，则交换位置
            for (int j = 0; j < array.length - 1 - i; j++) {
                if (array[j + 1] > array[j]) {
                    int temp = array[j];// temp 临时变量
                    array[j] = array[j + 1];
                    array[j + 1] = temp;
                }
            }
        }
        return array;
    }
}

/*输出：
[21312, 5466, 2341, 564, 231, 32, 21, 12, 5, 3]
*/
```

```java
// 简单优化
package array;
/*
 冒泡排序
 1.比较数组中，俩个相邻的元素，如果第一个数比第二个数大，我们就交换他们的位置
 2.每一次比较，都会产生出一个最大，或者最小的数字
 3.下一轮则可以少一次排序
 4.依次循环，直到结束
 */

import java.util.Arrays;

public class ArrayDemo07 {
    public static void main(String[] args) {
        int[] a = {12,32,5,5466,231,564,21312,2341,21,3};
        int[] sort = sort(a);
        System.out.println(Arrays.toString(sort));

    }

    public static int[] sort(int[] array) {

        // 外层循环，判断这个循环要走多少次
        for (int i = 0; i < array.length - 1; i++) {

            boolean flag = false;// 通过flag标识位减少没有意义的比较

            // 内层循环，比较判断俩个数，如果第一个数比第二个数大，则交换位置
            for (int j = 0; j < array.length - 1 - i; j++) {
                if (array[j + 1] > array[j]) {
                    int temp = array[j];// temp 临时变量
                    array[j] = array[j + 1];
                    array[j + 1] = temp;
                    flag = true;
                }
            }
            if (flag == false) {
                break;
            }
        }
        return array;
    }
}

```





## 11、稀疏数组（数据结构）
当一个数组中大部分元素为0，或者为同一值的数组时，可以使用稀疏数组来保存该数组。

稀疏数组的处理方式是：

+ 记录数组一共有几行几列，有多少个不同值
+ 把具有不同值的元素和行列及值记录在一个小规模的数组中，从而缩小程序的规模



+ 如下图：左边是原始数组，右边是稀疏数组

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611170448717.png)



```java
package array;

public class ArrayDemo08 {
    public static void main(String[] args) {

        //1.创建一个二维数组 11 * 11， 0：没有棋子  1：黑棋  2：白棋
        int[][] array1 = new int[11][11];
        array1[1][2] = 1;
        array1[2][3] = 2;

        // 输出原始的数组
        System.out.println("输出原始的数组:");
        for (int[] ints : array1) {
            for (int anInt : ints) {
                System.out.print(anInt + "\t");
            }
            System.out.println();
        }

        // 转化为稀疏数组保存
        // 获取有效值的个数
        int sum = 0;
        for (int i = 0; i < 11; i++) {
            for (int j = 0; j < 11; j++) {
                if (array1[i][j] != 0) {
                    sum++;
                }
            }
        }
        System.out.println("===========================================");
        System.out.println("有效值的个数：" + sum);

        //2.创建一个稀疏数组，
        int[][] array2 = new int[sum + 1][3];

        array2[0][0] = 11;
        array2[0][1] = 11;
        array2[0][2] = sum;

        // 遍历二维数组，将非零的值，存放到稀疏数组中
        int count = 0;
        for (int i = 0; i < 11; i++) {
            for (int j = 0; j < 11; j++) {
                if (array1[i][j] != 0) {
                    count++;
                    array2[count][0] = i;
                    array2[count][1] = j;
                    array2[count][2] = array1[i][j];
                }
            }
        }
        // 输出稀疏数组
        System.out.println("===========================================");
        System.out.println("输出稀疏数组:");
        for (int i = 0; i < array2.length; i++) {
            System.out.println(array2[i][0] + "\t"
                            + array2[i][1] + "\t"
                            + array2[i][2]);
        }
        System.out.println("===========================================");
        System.out.println("还原稀疏数组");

        //1.读取稀疏数组
        int[][] array3 = new int[array2[0][0]][array2[0][1]];
        //2.给其中的元素还原它的值
        for (int i = 1; i < array2.length; i++) {
            array3[array2[i][0]][array2[i][1]] =  array2[i][2];
        }
        //3.打印
        System.out.println("输出还原的数组:");

        for (int[] ints : array3) {
            for (int anInt : ints) {
                System.out.print(anInt + "\t");
            }
            System.out.println();
        }
    }
}
/*输出：
输出原始的数组:
0	0	0	0	0	0	0	0	0	0	0	
0	0	1	0	0	0	0	0	0	0	0	
0	0	0	2	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
====================
有效值的个数：2
====================
输出稀疏数组:
11	11	2
1	2	1
2	3	2
====================
还原稀疏数组
输出还原的数组:
0	0	0	0	0	0	0	0	0	0	0	
0	0	1	0	0	0	0	0	0	0	0	
0	0	0	2	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	
0	0	0	0	0	0	0	0	0	0	0	

进程已结束，退出代码为 0

*/
```



# 面向过程
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601190959803.jpeg)



## 1、面向过程&面向对象
+ 面向过程思想
    - 步骤清晰简单，第一步做什么，第二步做什么……
    - 面对过程适合处理一些较为简单的问题
+ 面向对象思想
    - 物以类聚，**分类**的思维模式，思考问题首先会解决问题需要哪些分类，然后对这些分类进行单独思考。最后，才对某个分类下的细节进行面向过程的思索。
    - 面向对象适合处理复杂的问题，适合处理需要多人协作的问题！
+ 对于描述复杂的事物，为了从宏观上把握、从整体上合理分析，我们需要使用面向对象的思路来分析整个系统。但是，具体到微观操作，仍然需要面向过程的思路去处理。

### 面向对象
[Java面向对象（基础总结）](https://blog.csdn.net/zxy144/article/details/108248542)

+ 面向对象编程(Object-Oriented Programming， OOP)
+ 面向对象编程的本质：**以类的方式组织代码，以对象的方式组织（封装）数据。**
+ 抽象：将同一类事物中共有的特征、行为抽取出来，归纳总结
+ 三大特性：
    - 封装
    - 继承
    - 多态
+ 从认识论角度考虑是先有对象后有类。对象，是具体的事物。类，是抽象的，是对对象的抽象
+ 从代码运行角度考虑是先有类后有对象。类是对象的模板。

### 类与对象的关系
+ 类是一种抽象的数据类型，它是对某一类事物整体描述/定义，但是不能代表某一个具体的事物
+ 对象是抽象概念的具体实例



## 2、创建与初始化对象
**使用 **`new`** 关键字创建对象**

+ 使用new关键字创建时，除了分配内存空间之外，还会给创建好的对象进行默认的初始化以及对类中构造器的调用

```java
package oop;

// 学生类
public class Student {
    // 属性
    String name;
    int age;

    // 方法
    public void study() {
        System.out.println(this.name + "在学习");
    }
}

====================================================
// 测试方法
package oop;

// 一个项目应该只存在一个main方法
public class Application {
    public static void main(String[] args) {
        // 类：抽象的，需要实例化
        // 类实例化后会返回一个自己的对象！
        // Student 对象就是一个Student类的具体实例

        Student xiaoming = new Student();
        Student xiaohong = new Student();
//        System.out.println(xiaoming.name);// null
//        System.out.println(xiaohong.age);// 0

        xiaoming.name = "小明";
        xiaoming.age = 1;

        System.out.println(xiaoming.name);// 小明
        System.out.println(xiaoming.age);// 1
    }
}
```

## 3、构造器
+ 类中的构造器也称为构造方法，是在进行创建对象的时候必须要调用的，
+ 特点：
    - 必须和类名相同
    - 必须没有返回类型，也不能写void
+ 作用：
    - new 本质在调用构造方法
    - 初始化对象的值
+ 注意点：
    - 定义有参构造之后，如果想使用无参构造，显示的定义一个无参构造
+ ` alt + insert`

```java
//alt + insert -> 构造函数 -> 确定 -> 有参构造
public Person() {
        this.name = name;
    }
// alt + insert -> 构造函数 -> 无选择 -> 无参构造
public Person() {}
```

```java
package oop;

public class Person {
    // 一个类即使什么都不写，它也会存在一个方法
    // 显示的定义构造器

    String name;

    // 实例化初始值

    // 1.使用new关键字，本质实在调用构造器
    // 2.用来初始化值
    // 无参构造
    public Person() {}

    // 有参构造：一旦定义了有参构造，无参就必须显示定义
    public Person(String name) {
        this.name = name;
    }
}

====================================================
package oop;

// 一个项目应该只存在一个main方法
public class Application {
    public static void main(String[] args) {
        // new 实例化一个对象
        Person person = new Person();
        System.out.println(person.name);
    }
}

```

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611200301211.png)



## 4、创建对象内存分析
```java
package oop;

public class Pet {
    public String name;
    public int age;

    public void shout() {
        System.out.println("叫了一声");
    }
}
====================================================
package oop;

// 一个项目应该只存在一个main方法
public class Application {
    public static void main(String[] args) {
        Pet dog = new Pet();
        dog.name = "旺财";
        dog.age = 1;
        dog.shout();

        System.out.println(dog.name);
        System.out.println(dog.age);
        
        Pet cat = new Pet();
    }
}
```

简单示意图：

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611205103351.png)

## 5、封装
**“高内聚，低耦合”**

属性私有，get/set

意义：

+ 提高程序安全性，保护数据
+ 隐藏代码的实现细节
+ 统一接口
+ 系统可维护性提高

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611211743266.png)

```java
package oop.demo04;

// 类    private - 私有
public class Student {

    // 属性私有
    private String name;
    private int id;
    private char sex;
    private int age;

    // 提供一些可以操作这个属性的方法
    // 提供一些public 的 get、 set 方法

    // get 获得这个数据
    public String getName() {
        return this.name;
    }

    // set 设置这个数据
    public void setName(String name) {
        this.name = name;
    }

    // alt + insert -> getter and setter

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        if (age > 120 || age < 0) {// 过滤不合法数据
            this.age = 3;
        }else {
            this.age = age;
        }
    }
}
====================================================
package oop;
import oop.demo04.Student;

// 一个项目应该只存在一个main方法
public class Application {
    public static void main(String[] args) {
        Student s1 = new Student();

        s1.setName("kk");
        System.out.println(s1.getName());// kk

        s1.setAge(999);// 不合法数据
        System.out.println(s1.getAge());// 3
    }
}
```

## 6、继承
+ 继承的本质是对某一批类的抽象，从而实现对现实世界更好的建模。
+ **`extands`**的意思是“扩展”。子类是父类的扩展。
+ JAVA中类只有单继承，没有多继承！



+ 继承是类和类之间的一种关系。除此之外，类和类之间的关系还有依赖、组合、聚合等。
+ 继承关系的俩个类，一个为子类(派生类)，一个为父类（基类)。子类继承父类，使用关键字extends来表示。
+ 子类和父类之间，从意义上讲应该具有”is a“的关系



+ 修饰符：
    - public
    - protected
    - default
    - private



<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611213758658.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611214317497.png)



私有属性不可继承：

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611214606866.png)



### `Object` 类
`Ctrl + H`：打开层次结构

在Java中，所有的类，都默认直接或间接继承 `Object` 类

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611215158225.png)



### super
super 注意点：

+ super调用父类的构造方法，必须在构造方法的第一个
+ super必须只能出现在子类的方法或构造方法
+ super 和 this 不能同时调用构造方法

对比 this：

+ 代表的对象不同：
    - this：本身调用者的对象
    - super：代表父类对象的应用
+ 前提：
    - this：没有继承也可以使用
    - super：只能在继承条件使用
+ 构造方法：
    - this()：本类的构造
    - super()：父类的构造







<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611220301715.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611221101122.png)





<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250611221707362.png)







### 方法重写
简单理解：



> 子类觉得继承自父类的方法不够用或不合适，就自己**重新写一个同名同参数的方法**来替换它。 
>
> 主要是为了实现**多态**，让不同类型的对象（都是父类的子类）在调用同一个方法名时，能执行各自特有的操作（`Dog` 叫是“汪汪”，`Cat` 叫是“喵喵”，但都调用 `makeSound()`）。
>
> 想象一下：
>
> + 你有一个**父类**（比如 `Animal`），它定义了一个通用的方法（比如 `makeSound()`）。
> + 然后你创建了一个**子类**（比如 `Dog`，它继承自 `Animal`）。
> + 在 `Dog` 类里，你觉得父类 `Animal` 的 `makeSound()` 方法（可能只是打印“动物发出声音”）对于狗来说**不够具体**。
> + 于是，你在 `Dog` 类中**重新写了一个**也叫 `makeSound()` 的方法，但这次让它打印“汪汪汪！”。
>
> **这个过程就叫方法重写！** 子类用自己的具体实现**覆盖**（Override）了从父类继承来的方法实现。
>





+ 静态方法与非静态方法区别很大
    - 静态方法：方法的调用只和左边定义的数据类型有关
    - 非静态方法：父类的引用指向子类，子类重写了父类的方法
+ 重写需要有继承关系，子类重写父类的方法
    - 方法名必须相同
    - 参数列表必须相同
    - 修饰符：范围可以扩大但不能缩小：public>protected>default>private
    - 抛出的异常：范围，可以被缩小，不能扩大：ClassNotFoundException --> Exception(大)
+ 子类和父类必须一致：方法体不同



<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250612125844230.png)





<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250612125950951.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250612130137558.png)



## 7、多态
多态：同一方法可以根据发送对象的不同而采用多种不同的行为方式

一个对象的实际类型是确定的，但可以指向对象的引用的类型又很多

+ 多态存在的条件：
    - 有继承关系
    - 子类重写父类方法
    - 父类引用指向子类对象
+ 多态注意事项：



    - 多态是方法的多态，属性没有多态
    - 父类和子类，有联系；类型转换异常：ClassCastException
    - 存在条件：继承关系，方法需要重写，父类引用指向子类对象
    - 对象能执行哪些方法，主要看对象左边的类型，和右边关系不大
+ static	方法，属于类，它不属于实例
+ final      常量
+ private    方法



<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250612150633401.png)

子类重写父类后，执行子类：

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250612150706364.png)





<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250612151127402.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250612151515275.png)







### `instanceof` 	和   `类型转换 `   （引用类型）
`instanceof`：判断一个对象是什么类型



+ 父类引用指向子类的对象
+ 把子类转换为父类，向上转型
+ 把父类转换为子类，向下转型；强制转换
+ 方便方法的调用，减少重复的代码









```java
package oop;

import oop.demo06.Person;
import oop.demo06.Student;
import oop.demo06.Teacher;

// 一个项目应该只存在一个main方法
public class Application {
    public static void main(String[] args) {

        //Object > Person > Student
        //Object > Person > Teacher
        //Object > String
        Object object = new Student();

        //System.out.println(X instanceof Y); // 查看能不能编译通过，能否编译通过取决于 X 的编译时类型和 Y 是否存在继承/实现关系；

        System.out.println(object instanceof Student);//true
        System.out.println(object instanceof Person);//true
        System.out.println(object instanceof Object);//true
        System.out.println(object instanceof Teacher);//false
        System.out.println(object instanceof String);//false
        System.out.println("===================================");
        Person person = new Student();
        System.out.println(person instanceof Student);//true
        System.out.println(person instanceof Person);//true
        System.out.println(person instanceof Object);//true
        System.out.println(person instanceof Teacher);//false
        //System.out.println(person instanceof String);//编译出错        System.out.println("===================================");
        Student student = new Student();
        System.out.println(student instanceof Student);//true
        System.out.println(student instanceof Person);//true
        System.out.println(student instanceof Object);//true
        //System.out.println(student instanceof Teacher);//编译出错
        //System.out.println(student instanceof String);//编译出错
        System.out.println("===================================");
    }
}
```





```java
package oop;

import oop.demo06.Person;
import oop.demo06.Student;
import oop.demo06.Teacher;

// 一个项目应该只存在一个main方法
public class Application {
    public static void main(String[] args) {
        // 类型之间的转化： 父  子

        //高               低
        Person obj = new Student();

        // student 将这个对象转换为Student类型，我们就可以使用Student 类型的方法了
        //Student student = (Student) obj;
        //student.go();
        ((Student) obj).go();

        // 子类转换为父类，可能丢失自己的本来的一些方法
        Student student = new Student();
        student.go();
        Person person = student;
    }
}
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250612155636329.png)



## 8、抽象类
`abstract`

+ 不能new这个抽象类，只能靠子类去实现它；约束
+ 抽象类里可以写普通方法
+ 抽象方法必须在抽象类中
+ 抽象的抽象：约束
+ 思考：抽象类存在构造器码？



```java
package oop.demo08;

// abstract 抽象类
public abstract class Action {

    // abstract 抽象方法，只有方法名字，没有方法的实现
    public abstract void doSomething();

}
====================================================
package oop.demo08;

//抽象类的所有方法，继承了它的子类，必须实现抽象方法
public class A extends Action {

    @Override
    public void doSomething() {
        System.out.println("A");
    }
}
```





<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250612170909453.png)



## 9、接口
接口：只有规范！自己无法写方法~专业的约束！约束和实现分离：面向接口编程。

接口的本质是契约。

声明类的关键字是`class`，声明接口的关键字是`interface`



作用：

+ 约束
+ 定义一些方法，让不同的人实现
+ public abstract
+ public static final
+ 接口不能被实例化，接口中没有构造方法
+ implements可以实现多个接口
+ 必须要重写接口中的方法



```java
package oop.demo09;

// interface 定义的关键字，接口都需要实现类
public interface UserService {

    //常量
    int AGE = 99;

    // 接口中的所有定义的发法，其实都是抽象的 public abstract
    //public abstract void run(String name);可以省略掉 public abstract
    //void run(String name);

    void add(String name);

    void delete(String name);

    void update(String name);

    void query(String name);
}
====================================================
package oop.demo09;

public interface TimeService {
    void timer();
}
====================================================
package oop.demo09;

//类可以实现接口 implements 接口
// 实现了接口的类。就需要重写接口中的方法

// 多继承，利用接口实现

public class UserServiceImpl implements UserService, TimeService {

    @Override
    public void add(String name) {
        System.out.println("add");
    }

    @Override
    public void delete(String name) {
        System.out.println("delete");
    }

    @Override
    public void update(String name) {
        System.out.println("update");
    }

    @Override
    public void query(String name) {
        System.out.println("query");
    }

    @Override
    public void timer() {
        System.out.println("timer");
    }
}
```









<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250612172305138.png)



## 10、内部类
+ 一个java类中可以有多个class类，但是只能有一个public class
+ 内部类就是在一个类的内部再定义一个类，比如A类中定义了一个B类，那么B就是A的内部类，而A相对B来说就是外部类

```java
package oop.demo10;

public class Outer {

    private int id = 10;
    public void out() {
        System.out.println("这是外部类的方法");
    }

    public class Inner {
        public void in() {
            System.out.println("这是内部类的方法");
        }

        //获得外部类的私有属性
        public void getID() {
            System.out.println(id);
        }
    }
}
=================================================
package oop;

import oop.demo10.Outer;

// 一个项目应该只存在一个main方法
public class Application {
    public static void main(String[] args) {

        Outer outer = new Outer();

        //通过这个外部类来实例化内部类
        Outer.Inner inner = outer.new Inner();
        inner.in();// 这是内部类的方法
        inner.getID();// 10
    }
}

```

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250612174754593.png)



    - 成员内部类：可以操作外部类的私有属性及方法
    - 静态内部类：static修饰，不能访问外部类私有属性
    - 局部内部类：外部类的方法里定义的类
    - 匿名内部类：没有名字初始化类

```java
package oop.demo10;

public class Test {
    public static void main(String[] args) {
        new Apple().eat();
    }
}

class Apple {
    public void eat() {
        System.out.println("Apple");
    }
}
```



## 小结：
1、类与对象

类是一个模板；对象是一个具体的实例

2、方法

定义、调用

3、对象的引用

引用类型：基本类型（8）

	对象是通过引用来操作的：栈 --> 堆

4、属性：字段Filed 成员变量

+ 默认初始化：
    - 数字： 0， 0.0
    - char : u0000
    - boolean : flase
    - 引用 ： null
+ 修饰符       属性类型    属性名 = 属性值！

5、对象的创建和使用

+ 使用 `new` 关键字创建对象，构造器 `Person java = new Person(); `
+ 对象的属性：`java.name`
+ 对象的方法：`java.sleep()`

6、类

+ 静态的属性
+ 动态的行为



# 异常
## 1、Exception&Error
+ Error
    - Error类对象由Java虚拟机生成并抛出，大多数错误与代码编写者所执行的操作无关。
    - Java虚拟机运行错误(VirtualMachineError)，当JVM不再有继续执行操作所需的内存资源  
时，将出现OutOfMemoryError。这些异常发生时，Java虚拟机(JVM)一般会选择线程终  
止；
    - 还有发生在虚拟机试图执行应用时，如类定义错误(NoClassDefFoundError)、链接错误  
(LinkageError)。这些错误是不可查的，因为它们在应用程序的控制和处理能力之外，而且绝大多数是程序运行时不允许出现的状况。
+ Exception
    - 在Exception分支中有一个重要的子类RuntimeException（运行时异常）
        * ArrayIndexOutOfBoundsException(数组下标越界)
        * NulIPointerException(空指针异常)
        * ArithmeticException(算术异常)
        * MissingResourceException(丢失资源)
        * ClassNotFoundException（找不到类）
        * 这些异常是不检查异常，程序中可以选择捕获处理，也可以不处理。
    - 这些异常一般是由程序逻辑错误引起的，程序应该从逻辑角度尽可能避免这类异常的发生；
+ Error和Exception的区别：
    - Error通常是灾难性的致命的错误，是程序无法控制和处理的，当出现这些异常时，Java虚拟机(JVM)一般会选择终止线程；Exception通常情况下是可以被程序处理的，并且在程序中应该尽可能的去处理这些异常。



```java
package exception;

public class Demo01 {
    public static void main(String[] args) {
        new Demo01().a();
    }

    public void a() {
        b();
    }

    public void b() {
        a();
    }
}


//Exception in thread "main" java.lang.StackOverflowError
```



## 2、简单分类
+ 检查性异常：最具代表的检查性异常是用户错误或问题引起的异常，这是程序员无法预见的。例如要打开一个不存在文件时，一个异常就发生了，这些异常在编译时不能被简单地忽略。
+ 运行时异常：运行时异常是可能被程序员避免的异常。与检查性异常相反，运行时异常可以在编译时被忽略。
+ 错误：错误不是异常，而是脱离程序员控制的问题。错误在代码中通常被忽略。例如，当栈溢出时，一个错误就发生了，它们在编译也检查不到的。



## 3、异常体系结构
+ Java把异常当作对象来处理，并定义一个基类`java.lang.Throwable`作为所有异常的超类。
+ 在JavaAPI中已经定义了许多异常类，这些异常类分为两大类，错误**Error**和异常**Exception**。

<!-- 这是一张图片，ocr 内容为： -->
![](https://gitee.com/xvshifu/pic-go/raw/master/img/20250612180754464.png)

## 4、异常机制
异常处理五个关键字：`try catch finally throw throws`

```java
package exception;

public class Test {
    public static void main(String[] args) {
         int a = 1;
         int b = 0;
        throws FileNotFoundException, InvalidDataException {
         try { // try监控区域
             System.out.println(a/b);
         }catch (ArithmeticException e) {// catch(想要捕获的异常类型！) 
             System.out.println("程序出现异常，变量b不能为0");
         }finally {
             System.out.println("finally");
         }
       }
    }
}
```





[Java throw和throws 关键字](https://www.cainiaojc.com/java/java-throw-throws.html)



## 5、自定义异常
```java
package exception;

// 自定义异常类
public class MyException extends Exception{
    // 传递数字 > 10
    private int detail;

    public MyException(int a) {
        detail = a;
    }

    //toString :异常的打印信息
    @Override
    public String toString() {
        return "MyException{" + detail + '}';
    }
}
=====================================================
package exception;

public class Test {

    // 可能会存在异常的方法

    static void test(int a) throws MyException {

        System.out.println("传递的参数为：" + a);

        if (a > 10) {
            throw new MyException(a);// 抛出异常
        }
        System.out.println("OK");
    }

    public static void main(String[] args) {
        try {
            test(11);
        } catch (MyException e) {
            System.out.println("MyException:" + e);
        }
    }
}
```



## **实际应用中的经验总结：**
+ 处理运行时异常时，采用逻辑去合理规避同时辅助try-catch处理
+ 在多重catch块后面，可以加一个catch(Exception)来处理可能会被遗漏的异常
+ 对于不确定的代码，也可以加上try-catch，处理潜在的异常
+ 尽量去处理异常，切忌只是简单地调用printStackTrace)去打印输出
+ 具体如何处理异常，要根据不同的业务需求和异常类型去决定
+ 尽量添加finally语句块去释放占用的资源

