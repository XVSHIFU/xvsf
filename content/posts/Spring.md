---
title: Spring
date: 2025-08-12T14:00:00+08:00
tags:
  - "框架学习"
categories:
  - "Java基础"
description: Spring
showToc: true
draft: false
tocOpen: true
---
# 1、Spring简介

[Spring 官网](https://spring.io/)

[Spring 5.2.0 官方文档](https://docs.spring.io/spring-framework/docs/5.2.0.RELEASE/spring-framework-reference/core.html#spring-core)

[GitHub - spring-projects/spring-framework: Spring Framework](https://github.com/spring-projects/spring-framework)

[spring-webmvc](https://mvnrepository.com/artifact/org.springframework/spring-webmvc)

```xml
<!-- https://mvnrepository.com/artifact/org.springframework/spring-webmvc -->
<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-webmvc</artifactId>
  <version>5.2.0.RELEASE</version>
</dependency>
```

## 1.1、优点

- Spring是一个开源的免费的框架
- Spring是一个轻量级的、非入侵式的框架
- 控制反转（IOC），面向切面编程（AOP）
- 支持事物的处理，对框架整合的支持

总结一句话：Spring就是一个轻量级的控制反转（IOC）和面向切面编程（AOP）的框架

## 1.2、组成

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749844.gif)

**核心容器（Spring Core）**

核心容器提供Spring框架的基本功能。Spring以bean的方式组织和管理Java应用中的各个组件及其关系。Spring使用BeanFactory来产生和管理Bean，它是工厂模式的实现。BeanFactory使用控制反转(IoC)模式将应用的配置和依赖性规范与实际的应用程序代码分开。

**应用上下文（Spring Context）**

Spring上下文是一个配置文件，向Spring框架提供上下文信息。Spring上下文包括企业服务，如JNDI、EJB、电子邮件、国际化、校验和调度功能。

**Spring面向切面编程（Spring AOP）**

通过配置管理特性，Spring AOP 模块直接将面向方面的编程功能集成到了 Spring框架中。所以，可以很容易地使 Spring框架管理的任何对象支持 AOP。Spring AOP 模块为基于 Spring 的应用程序中的对象提供了事务管理服务。通过使用 Spring AOP，不用依赖 EJB 组件，就可以将声明性事务管理集成到应用程序中。

**JDBC和DAO模块（Spring DAO）**

JDBC、DAO的抽象层提供了有意义的异常层次结构，可用该结构来管理异常处理，和不同数据库供应商所抛出的错误信息。异常层次结构简化了错误处理，并且极大的降低了需要编写的代码数量，比如打开和关闭链接。

**对象实体映射（Spring ORM）**

Spring框架插入了若干个ORM框架，从而提供了ORM对象的关系工具，其中包括了Hibernate、JDO和 IBatis SQL Map等，所有这些都遵从Spring的通用事物和DAO异常层次结构。

**Web模块（Spring Web）**

Web上下文模块建立在应用程序上下文模块之上，为基于web的应用程序提供了上下文。所以Spring框架支持与Struts集成，web模块还简化了处理多部分请求以及将请求参数绑定到域对象的工作。

**MVC模块（Spring Web MVC）**

MVC框架是一个全功能的构建Web应用程序的MVC实现。通过策略接口，MVC框架变成为高度可配置的。MVC容纳了大量视图技术，其中包括JSP、POI等，模型来有JavaBean来构成，存放于m当中，而视图是一个街口，负责实现模型，控制器表示逻辑代码，由c的事情。Spring框架的功能可以用在任何J2EE服务器当中，大多数功能也适用于不受管理的环境。Spring的核心要点就是支持不绑定到特定J2EE服务的可重用业务和数据的访问的对象，毫无疑问这样的对象可以在不同的J2EE环境，独立应用程序和测试环境之间重用。

## 1.3、拓展

现代化的Java开发，说白就是基于 Spring 的开发

- Spring Boot

- - 一个快速开发的脚手架
  - 基于Spring Boot可以快速的开发单个微服务
  - 约定大于配置

- Spring Cloud

- - Spring Cloud 是基于Spring Boot 实现的

# 2、IOC 容器

## 2.1 IOC 理论推导

### 案例一：

1. UserDao 接口

```java
package com.kuang.dao;

public interface UserDao {
    void getUser();
}
```

1. UserDaoImpl 实现类

```java
package com.kuang.dao;

public class UserDaoImpl implements  UserDao{

    @Override
    public void getUser() {
        System.out.println("默认获取用户的数据");
    }
}
package com.kuang.dao;

public class UserDaoMysqlImpl implements UserDao {

    @Override
    public void getUser() {
        System.out.println("mysql 获取用户的数据");
    }
}
```

1. UserService 业务接口

```java
package com.kuang.service;

public interface UserService {
    void getUser();
}
```

1. UserServicelmpl 业务实现类

```java
package com.kuang.service;

import com.kuang.dao.UserDao;
import com.kuang.dao.UserDaoImpl;
import com.kuang.dao.UserDaoMysqlImpl;

public class UserServiceImpl implements UserService {

    //这样的代码，用户的需求可能会影响我们原来的代码，我们需根据用户的需求去修改原代码！
    //private UserDao userDao = new UserDaoImpl();
    //private UserDao userDao = new UserDaoMysqlImpl();

    //使用 Set 接口，避免了根据用户的需求去修改原代码，而是由用户决定需要调用哪个接口。之前，程序是主动创建对象，控制权在程序猿手上；使用 set注入后，程序不再具有主动性，而是变成了被动的接收对象
    // 这种 “控制反转” 的思想，从本质上解决了程序猿管理对象的创建的问题，系统的耦合性大大降低，从而更专注于业务的实现上！
    private UserDao userDao;
    //利用 set 进行动态实现值的注入
    public void setUserDao(UserDao userDao) {
        this.userDao = userDao;
    }

    public void getUser() {
        userDao.getUser();
    }
}
```

1. MyTest 用户层

```java
import com.kuang.dao.UserDaoImpl;
import com.kuang.dao.UserDaoMysqlImpl;
import com.kuang.service.UserService;
import com.kuang.service.UserServiceImpl;

public class MyTest {

    public static void main(String[] args) {
        //用户实际调用的是业务层，dao 层他们不需要接触
        //之前，用户调用什么接口，是由 UserServicelmpl 中写死的，
        // UserService userService  = new UserServiceImpl();
        // userService.getUser();

        //而加入“控制反转” 的思想后，主动权交由用户手中
        UserService userService  = new UserServiceImpl();
        ((UserServiceImpl) userService).setUserDao(new UserDaoImpl());
        userService.getUser();
    }
}
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749159.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311751713.png)

使用 Set 接口，避免了根据用户的需求去修改原代码，而是由用户决定需要调用哪个接口。之前，程序是主动创建对象，控制权在程序猿手上；使用 set注入后，程序不再具有主动性，而是变成了被动的接收对象

这种 “控制反转” 的思想，从本质上解决了程序猿管理对象的创建的问题，系统的耦合性大大降低，从而更专注于业务的实现上！

## 2.2 IOC 本质

**控制反转IoC(Inversion of Control)，是一种设计思想，DI(依赖注入)是实现IoC的一种方法**，也有人认为DI只是IoC的另一种说法。没有IoC的程序中 , 我们使用面向对象编程 , 对象的创建与对象间的依赖关系完全硬编码在程序中，对象的创建由程序自己控制，控制反转后将对象的创建转移给第三方，个人认为所谓控制反转就是：获得依赖对象的方式反转了。

**IoC是Spring框架的核心内容**，使用多种方式完美的实现了IoC，可以使用XML配置，也可以使用注解，新版本的Spring也可以零配置实现IoC。

Spring容器在初始化时先读取配置文件，根据配置文件或元数据创建与组织对象存入容器中，程序使用时再从Ioc容器中取出需要的对象。


 采用XML方式配置Bean的时候，Bean的定义信息是和实现分离的，而采用注解的方式可以把两者合为一体，Bean的定义信息直接以注解的形式定义在实现类中，从而达到了零配置的目的。

**控制反转是一种通过描述（XML或注解）并通过第三方去生产或获取特定对象的方式。在Spring中实现控制反转的是IoC容器，其实现方法是依赖注入（Dependency Injection,DI）。**

## 2.3 HelloSpring

### 案例二

```java
package com.kuang.pojo;

public class Hello {
    private String str;

    public String getStr() {
        return str;
    }

    public void setStr(String str) {
        this.str = str;
    }

    @Override
    public String toString() {
        return "Hello{" +
                "str='" + str + '\'' +
                '}';
    }
}
```



```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

  <!--    使用 Spring 来创建对象，在 Spring 这些都称为 Bean -->
  <bean id="hello" class="com.kuang.pojo.Hello">
    <property name="str" value="Spring"/>

  </bean>

</beans>
```





```java
import com.kuang.pojo.Hello;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MyTest {
    public static void main(String[] args) {

        //获取 Spring 的上下文对象,.解析beans.xml文件 , 生成管理相应的Bean对象
        ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
        //getBean 参数即为spring配置文件中bean的id
        Hello hello = (Hello) context.getBean("hello");
        System.out.println(hello.toString());
    }
}
```



- hello 对象是由Spring创建的
- hello 对象的属性是由Spring容器设置的

这个过程就叫控制反转：

- 控制 : 谁来控制对象的创建 , 传统应用程序的对象是由程序本身控制创建的 , 使用Spring后 , 对象是由Spring来创建的
- 反转 : 程序本身不创建对象 , 而变成被动的接收对象 .

依赖注入 : 就是利用set方法来进行注入的.

IOC是一种编程思想，由主动的编程变成被动的接收

可以通过newClassPathXmlApplicationContext去浏览一下底层源码 .



### 案例一修改

新增 beans.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:util="http://www.springframework.org/schema/util"
  xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/util https://www.springframework.org/schema/util/spring-util.xsd">

  <bean id="mysqlImpl" class="com.kuang.dao.UserDaoMysqlImpl"/>
  <bean id="oracleImpl" class="com.kuang.dao.UserDaoOracleImpl"/>

  <bean id="UserServiceImpl" class="com.kuang.service.UserServiceImpl">
    <!--
    ref : 引用 Spring 容器中创建好的对象
    value : 具体的值，基本数据类型
    -->
    <property name="userDao" ref="mysqlImpl"/>
  </bean>

</beans>
```

修改 MyTest.java

```java
//import com.kuang.dao.UserDaoImpl;
//import com.kuang.dao.UserDaoMysqlImpl;
//import com.kuang.service.UserService;
//import com.kuang.service.UserServiceImpl;
//
//public class MyTest {
//
//    public static void main(String[] args) {
//        //用户实际调用的是业务层，dao 层他们不需要接触
//        //之前，用户调用什么接口，是由 UserServicelmpl 中写死的，
//        // UserService userService  = new UserServiceImpl();
//        // userService.getUser();
//
//        //而加入“控制反转” 的思想后，主动权交由用户手中
//        UserService userService  = new UserServiceImpl();
//        ((UserServiceImpl) userService).setUserDao(new UserDaoMysqlImpl());
//        userService.getUser();
//    }
//}

import com.kuang.service.UserServiceImpl;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MyTest {
    public static void main(String[] args) {

        //获取 ApplicationContext;拿到 Spring 的容器
        ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
        UserServiceImpl userServiceImpl = (UserServiceImpl) context.getBean("UserServiceImpl");
        userServiceImpl.getUser();
    }
}
```

现在呢，案例一想实现了不需要程序猿或者用户改动代码实现不同的操作，只需要在xml配置文件中修改，即可达到目的。

所谓的IoC,一句话搞定 : 对象由Spring 来创建 , 管理 , 装配 ! 





## 2.4 IOC 创建对象方式

### 2.4.1 无参构造

```java
package com.kuang.pojo;

public class User {
    private String name;

    public User() {
        System.out.println("User 的无参构造");
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void show() {
        System.out.println("name=" + name);
    }
}
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

  <bean id="user" class="com.kuang.pojo.User">
    <property name="name" value="qwer"/>
  </bean>
</beans>
import com.kuang.pojo.User;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MyTest {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
        User user = (User) context.getBean("user");
        user.show();

    }
}
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749405.png)**在调用show方法之前，User对象已经通过无参构造初始化了**

### 2.4.2 有参构造

```java
package com.kuang.pojo;

public class User {
    private String name;

    public User(String name) {
        //System.out.println("User 的无参构造");
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void show() {
        System.out.println("name=" + name);
    }
}
import com.kuang.pojo.User;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MyTest {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
        User user = (User) context.getBean("user");
        user.show();

    }
}
```

#### 第一种：下标赋值

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!--第一种，下标赋值    -->
    <bean id="user" class="com.kuang.pojo.User">
        <constructor-arg index="0" value="qaz"/>
    </bean>

</beans>
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311751585.png)

#### 第二种：通过类型创建，不建议使用

```xml
<!--第二种，通过类型创    -->
<bean id="user" class="com.kuang.pojo.User">
  <constructor-arg type="java.lang.String" value="wsx"/>
</bean>
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749314.png)

#### 第三种：直接通过参数名设置

```xml
<!--第三种，直接通过参数名设置    -->
<bean id="user" class="com.kuang.pojo.User">
  <constructor-arg name="name" value="edc"/>
</bean>
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749550.png)

## 2.5 Spring 配置

- 别名

alias 设置别名 , 为bean设置别名 , 可以设置多个别名

```xml
<!--设置别名：在获取Bean的时候可以使用别名获取-->
<alias name="userT" alias="userNew"/>
```

- Bean的配置

```xml
<!--bean就是java对象,由Spring创建和管理-->

<!--
id: 是bean的唯一标识符,如果没有配置id,name就是默认标识符
name: 可以设置多个别名,可以用逗号,分号,空格隔开
class: 是bean的全限定名=包名+类名

如果配置id,又配置了name,那么name是别名
如果不配置id和name,可以根据applicationContext.getBean(.class)获取对象;

-->
<bean id="hello" name="hello2 h2,h3;h4" class="com.kuang.pojo.Hello">
  <property name="name" value="Spring"/>
</bean>
```

- import

团队的合作通过import来实现 .

```xml
<import resource="{path}/beans.xml"/>
```

## 2.6 依赖注入

- 依赖注入（Dependency Injection,DI）。
- 依赖 : 指Bean对象的创建依赖于容器，Bean对象的依赖资源
- 注入 : 指Bean对象所依赖的资源 , 由容器来设置和装配

### 2.6.1 构造器注入

https://www.yuque.com/taohuayuanpang/kfw7zl/rpagg11nwkzm2qh2#Xjgzu

### 2.6.2 Set 方式注入【重点】

#### 案例三

```java
package com.kuang.pojo;

import java.util.*;

public class Student {

    private String name;
    private Address address;
    private String[] books;
    private List<String> hobbys;
    private Map<String,String> card;
    private Set<String> game;
    private String wife;
    private Properties info;

    //下方内容快捷键生成：Alt + Insert , 生成 getter和setter

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public String[] getBooks() {
        return books;
    }

    public void setBooks(String[] books) {
        this.books = books;
    }

    public Map<String, String> getCard() {
        return card;
    }

    public void setCard(Map<String, String> card) {
        this.card = card;
    }

    public List<String> getHobbys() {
        return hobbys;
    }

    public void setHobbys(List<String> hobbys) {
        this.hobbys = hobbys;
    }

    public Set<String> getGame() {
        return game;
    }

    public void setGame(Set<String> game) {
        this.game = game;
    }

    public String getWife() {
        return wife;
    }

    public void setWife(String wife) {
        this.wife = wife;
    }

    public Properties getInfo() {
        return info;
    }

    public void setInfo(Properties info) {
        this.info = info;
    }

    //下方内容快捷键生成：Alt + Insert , 生成 toString
    @Override
    public String toString() {
        return "Student{" +
                "name='" + name + '\'' +
                ", address=" + address +
                ", books=" + Arrays.toString(books) +
                ", hobbys=" + hobbys +
                ", card=" + card +
                ", game=" + game +
                ", wife='" + wife + '\'' +
                ", info=" + info +
                '}';
    }

}
package com.kuang.pojo;

public class Address {
    private String address;

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    @Override
    public String toString() {
        return "Address{" +
                "address='" + address + '\'' +
                '}';
    }
}
import com.kuang.pojo.Student;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MyTest {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
        Student student = (Student) context.getBean("student");
        System.out.println(student.toString());

        /*
        Student{
            name='qwer',
            address=Address{address='北京市海淀区'},
            books=[西游记, 红楼梦, 水浒传],
            hobbys=[听歌, 看电影, 爬山],
            card={中国邮政=456456456465456, 建设=1456682255511},
            game=[LOL, BOB, COC],
            wife='null',
            info={age=18, name=qwer}}
        */
    }
}
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="address" class="com.kuang.pojo.Address">
        <property name="address" value="北京市海淀区"/>
    </bean>

    <bean id="student" class="com.kuang.pojo.Student">
        <!--第一种，普通值注入，value-->
        <property name="name" value="qwer"/>

        <!--第二种，Bean注入，ref-->
        <property name="address" ref="address"/>

        <!--数组-->
        <property name="books">
            <array>
                <value>西游记</value>
                <value>红楼梦</value>
                <value>水浒传</value>
            </array>
        </property>

        <!--List-->
        <property name="hobbys">
            <list>
                <value>听歌</value>
                <value>看电影</value>
                <value>爬山</value>
            </list>
        </property>

        <!--Map-->
        <property name="card">
            <map>
                <entry key="中国邮政" value="456456456465456"/>
                <entry key="建设" value="1456682255511"/>
            </map>
        </property>

        <!--set-->
        <property name="game">
            <set>
                <value>LOL</value>
                <value>BOB</value>
                <value>COC</value>
            </set>
        </property>

        <!--Null-->
        <property name="wife">
            <null/>
        </property>

        <!--Properties-->
        <property name="info">
            <props>
                <prop key="name">qwer</prop>
                <prop key="age">18</prop>
            </props>
        </property>

    </bean>
</beans>
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311752395.png)

### 2 .6.3 拓展方式注入

#### p命名和c命名注入

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311752784.png)

- P命名空间注入 : 需要在头文件中加入约束文件

```xml
导入约束 : xmlns:p="http://www.springframework.org/schema/p"

<!--P(属性: properties)命名空间 , 属性依然要设置set方法-->
<bean id="user" class="com.kuang.pojo.User" p:name="qwer" p:age="12"/>
```

需要导入 junit 包

```xml
<dependency>
  <groupId>junit</groupId>
  <artifactId>junit</artifactId>
  <version>4.12</version>
</dependency>
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311750611.png)

- c 命名空间注入 : 需要在头文件中加入约束文件，同时加上有参构造器

```xml
导入约束 : xmlns:c="http://www.springframework.org/schema/c"
<!--C(构造: Constructor)命名空间 , 属性依然要设置set方法-->
<bean id="user2" class="com.kuang.pojo.User" c:name="qaz" c:age="18"/>
```

有参和无参构造器

```java
public User() {
}

public User(String name, int age) {
    this.name = name;
    this.age = age;
}
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311750287.png)

## 2.7 Bean 作用域

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311750413.png)

几种作用域中，request、session作用域仅在基于web的应用中使用（不必关心你所采用的是什么web应用框架），只能用在基于web的Spring ApplicationContext环境。

### The Singleton Scope （单例模式）

在Spring loC容器中仅存在一个Bean实例，Bean以单例方式存在，默认值

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749740.png)

当一个bean的作用域为Singleton，那么Spring IoC容器中只会存在一个共享的bean实例，并且所有对bean的请求，只要id与该bean定义相匹配，则只会返回bean的同一实例。Singleton是单例类型，就是在创建起容器时就同时自动创建了一个bean的对象，不管你是否使用，他都存在了，每次获取到的对象都是同一个对象。注意，Singleton作用域是Spring中的缺省作用域。要在XML中将bean定义成singleton，可以这样配置：

```xml
 <bean id="user2" class="com.kuang.pojo.User" c:age="12" c:name="qwe" scope="singleton"/>
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311752692.png)



### The Prototype Scope（原型模式）

每次从容器中调用Bean时，都返回一个新的实例，即每次调用getBean()时，相当于执行newXxxBean()

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749744.png)

当一个bean的作用域为Prototype，表示一个bean定义对应多个对象实例。Prototype作用域的bean会导致在每次对该bean请求（将其注入到另一个bean中，或者以程序的方式调用容器的getBean()方法）时都会创建一个新的bean实例。Prototype是原型类型，它在我们创建容器的时候并没有实例化，而是当我们获取bean的时候才会去创建一个对象，而且我们每次获取到的对象都不是同一个对象。根据经验，对有状态的bean应该使用prototype作用域，而对无状态的bean则应该使用singleton作用域。在XML中将bean定义成prototype，可以这样配置：

```xml
<bean id="accountService" class="com.something.DefaultAccountService" scope="prototype"/>
```

### request、session、application 这些只能在 web 开发中使用到

## 2.8 Bean 的自动装配

- 自动装配是使用spring满足bean依赖的一种方法
- spring会在应用上下文中为某个bean寻找其依赖的bean。

**Spring中bean有三种装配方式：**

1. 在xml中显式配置；
2. 在java中显式配置；
3. 隐式的bean发现机制和自动装配。

**Spring的自动装配的两个操作：**

1. 组件扫描(component scanning)：spring会自动发现应用上下文中所创建的bean；
2. 自动装配(autowiring)：spring自动满足bean之间的依赖，也就是我们说的IoC/DI；

组件扫描和自动装配组合发挥巨大威力，使得显示的配置降低到最少。

**推荐不使用自动装配xml配置 , 而使用注解** 



```java
package com.kuang.pojo;

public class Cat {
    public void shout() {
        System.out.println("miao~");
    }
}
package com.kuang.pojo;

public class Dog {
    public void shout() {
        System.out.println("wang~");
    }
}
package com.kuang.pojo;

public class People {
    private Cat cat;
    private Dog dog;
    private String name;

    public Cat getCat() {
        return cat;
    }

    public void setCat(Cat cat) {
        this.cat = cat;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Dog getDog() {
        return dog;
    }

    public void setDog(Dog dog) {
        this.dog = dog;
    }

    @Override
    public String toString() {
        return "People{" +
        "cat=" + cat +
        ", dog=" + dog +
        ", name='" + name + '\'' +
        '}';
    }
}
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

  <bean id="cat" class="com.kuang.pojo.Cat"/>
  <bean id="dog" class="com.kuang.pojo.Dog"/>

  <bean id="people" class="com.kuang.pojo.People">
    <property name="name" value="was"/>
    <property name="dog" ref="dog"/>
    <property name="cat" ref="cat"/>
  </bean>
</beans>
import com.kuang.pojo.People;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MyTest {
    @Test
    public void test1() {
        ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
        People people = context.getBean("people", People.class);
        people.getCat().shout();
        people.getDog().shout();
    }
}
```

### 2.8.1 byName 自动装配

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

  <bean id="cat" class="com.kuang.pojo.Cat"/>
  <bean id="dog" class="com.kuang.pojo.Dog"/>

  <!--byName : 会自动在容器上下文中查找，和自己对象 set 方法后面的值对应的 beanid-->
  <bean id="people" class="com.kuang.pojo.People" autowire="byName">
    <property name="name" value="was"/>
    <!--            <property name="dog" ref="dog"/>-->
    <!--            <property name="cat" ref="cat"/>-->
  </bean>
</beans>
```


![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749984.png)

**byName 强调对象 set 方法对应的beanid唯一**

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749029.png)

### 2.8.2 byType 自动装配

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

  <bean id="cat" class="com.kuang.pojo.Cat"/>
  <bean id="dog222" class="com.kuang.pojo.Dog"/>

  <!--byName : 会自动在容器上下文中查找，和自己对象 set 方法后面的值对应的 beanid-->
  <!--    <bean id="people" class="com.kuang.pojo.People" autowire="byName">-->
  <!--byName : 会自动在容器上下文中查找，和自己对象属性类型相同的 bean-->
  <bean id="people" class="com.kuang.pojo.People" autowire="byType">
    <property name="name" value="was"/>
    <!--            <property name="dog" ref="dog"/>-->
    <!--            <property name="cat" ref="cat"/>-->
  </bean>
</beans>
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311752708.png)

**byType 只允许有一个对象属性**，例如：

```xml
<bean id="dog222" class="com.kuang.pojo.Dog"/>
<bean id="dog22" class="com.kuang.pojo.Dog"/>
```

当有多个对象类型时，会直接报错

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311752316.png)

### 小结：

- byName

- - **需要保证所有bean的id唯一，并且这个bean需要和自动注入的属性的set方法的值一致**
  - 当一个bean节点带有 `autowire byName`的属性时

1. 1. 1. 将查找其类中所有的set方法名，例如setCat，获得将set去掉并且首字母小写的字符串，即cat
      2. 去spring容器中寻找是否有此字符串名称id的对象
      3. 如果有，就取出注入；如果没有，就报空指针异常

- byType

- - **需要保证所有bean的class唯一，并且这个bean需要和自动注入的属性的类型一致**
  - 如果不一致，会报异常：`NoUniqueBeanDefinitionException`

### 2.8.3 使用注解实现自动装配

jdk 1.5支持注解，Spring 2.5 支持注解

**使用注解须知：**

- 导入约束：context
- 配置注解的支持：context:annotation-config

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd">

    <context:annotation-config/>

</beans>
```

#### @Autowired

- 属性上使用
- set方式上使用
- 使用Autowired我们可以不用编写Set方法了，前提是你这个自动装配的属性在IOC（Spring）容器中存在，且符合名字

@Autowired(required=false)  说明：false，对象可以为null；true，对象必须存对象，不能为null。



//如果允许对象为null，设置required = false,默认为true

@Autowired(required = false)

private Cat cat;



测试：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:context="http://www.springframework.org/schema/context"
  xsi:schemaLocation="http://www.springframework.org/schema/beans
  https://www.springframework.org/schema/beans/spring-beans.xsd
  http://www.springframework.org/schema/context
  https://www.springframework.org/schema/context/spring-context.xsd">

  <context:annotation-config/>

  <bean id="cat" class="com.kuang.pojo.Cat"/>
  <bean id="dog" class="com.kuang.pojo.Dog"/>
  <bean id="people" class="com.kuang.pojo.People"/>
</beans
package com.kuang.pojo;

import org.springframework.beans.factory.annotation.Autowired;

public class People {

    @Autowired
    private Cat cat;
    @Autowired
    private Dog dog;
    private String name;

    public Cat getCat() {
        return cat;
    }

    public void setCat(Cat cat) {
        this.cat = cat;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Dog getDog() {
        return dog;
    }

    public void setDog(Dog dog) {
        this.dog = dog;
    }

    @Override
    public String toString() {
        return "People{" +
        "cat=" + cat +
        ", dog=" + dog +
        ", name='" + name + '\'' +
        '}';
    }
}
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749254.png)



![不使用set方法](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749467.png)

####  @Qualifier

- 当存在多个类型的Bean时，加入@Qualifier 可以根据byName的方式自动装配
- @Qualifier不能单独使用

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749701.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749605.png)

#### @Resource

- @Resource如有指定的name属性，先按该属性进行byName方式查找装配；
- 其次再进行默认的byName方式进行装配；
- 如果以上都不成功，则按byType的方式自动装配。
- 都不成功，则报异常。  

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311752141.png)



## 2.9 使用注解开发

在spring4之后，想要使用注解形式，必须得要引入aop的包

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749649.png)
 **使用注解须知：**

- 导入约束：context
- 配置注解的支持：context:annotation-config

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd">

    <context:annotation-config/>

</beans>
```



### 2.9.1 Bean 实现

**@Component**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:context="http://www.springframework.org/schema/context"
  xsi:schemaLocation="http://www.springframework.org/schema/beans
  https://www.springframework.org/schema/beans/spring-beans.xsd
  http://www.springframework.org/schema/context
  https://www.springframework.org/schema/context/spring-context.xsd">

  <!--指定要扫描的包，这个包下面的注解就会生效-->
  <context:component-scan base-package="com.kuang.pojo"/>
  <context:annotation-config/>

</beans>
package com.kuang.pojo;

import org.springframework.stereotype.Component;

//等价于 <bean id="user" class="com.kuang.pojo.User"/>
@Component
public class User {
    public String name = "qwer";
}
import com.kuang.pojo.User;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MyTest {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        User user = (User) context.getBean("user");

        System.out.println(user.name);
    }
}
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749773.png)

### 2.9.2 属性注解

```java
@Value("123")
public String name;
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311753469.png)

### 2.9.3 **衍生注解**

**@Component三个衍生注解**

为了更好的进行分层，Spring可以使用其它三个注解，功能一样，都是将某个类注册到Spring中，装配Bean

- @Controller：web层
- @Service：service层
- @Repository：dao层

### 2.9.4 自动装配注解

@Autowired ：通过类型、名字自动装配

@Qualifier ：如果 @Autowired 不能唯一自动装配上属性，则通过 @Qualifier(value="xxx")

@Resource ： 通过名字、类型自动装配

### 2.9.5 作用域

@scope

- singleton：默认的，Spring会采用单例模式创建这个对象。关闭工厂 ，所有的对象都会销毁。
- prototype：多例模式。关闭工厂 ，所有的对象不会销毁。内部的垃圾回收机制会回收

```java
//等价于 <bean id="user" class="com.kuang.pojo.User"/>
@Component

@Scope("singleton")
//@Scope("prototype")
public class User {

    // 相当于配置文件中 <property name="name" value="123"/>
    @Value("123")
    public String name;
    //public String name = "qwer";
}
```

### 2.9.6 小结

**XML与注解比较**

- XML可以适用任何场景 ，结构清晰，维护方便
- 注解不是自己提供的类使用不了，开发简单方便

**xml与注解整合开发** ：推荐最佳实践

- xml管理Bean
- 注解完成属性注入
- 使用过程中， 必须让注解生效，就需要开启注解的支持

```xml
<!--指定要扫描的包，这个包下面的注解就会生效-->
<context:component-scan base-package="com.kuang"/>
<context:annotation-config/>
```

## 2.10 使用Java的方式进行配置



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311753781.png)

**JavaConfig 是 Spring 的一个子项目，在 Spring4 之后，他成了一个核心**



```java
package com.kuang.pojo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

//@Component 说明这个类被 Spring 容器管理
@Component
public class User {
    private String name;

    public String getName() {
        return name;
    }

    //属性注入值
    @Value("123")
    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "User{" +
        "name='" + name + '\'' +
        '}';
    }
}
package com.kuang.config;

import com.kuang.pojo.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

//也会被 Spring 容器管理，因为它本来就是一个 @Component
//@Configuration 代表这个类是一个配置类，和 xml 配置文件作用一样
@Configuration
@ComponentScan("com.kuang.pojo")
//导入合并其他配置类，类似于配置文件中的 inculde 标签
@Import(Config2.class)
public class Config {

    //注册一个 Bean,相当于之前写的 bean 标签
    //这个方法的名字，相当于 bean 标签的 id
    //这个方法的返回值，相当于 bean 标签的 class
    @Bean
    public User getUser() {
        //new User() 相当于之前写的 <bean class="com.kuang.pojo.User"/>
        return new User();
    }
}
package com.kuang.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class Config2 {
}
import com.kuang.config.Config;
import com.kuang.pojo.User;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class MyTest {
    public static void main(String[] args) {
        //如果完全使用了配置类方式去做，就只能通过 AnnotationConfigApplicationContext 来获取 Bean容器，通过配置类的 class 来获取
        ApplicationContext context = new AnnotationConfigApplicationContext(Config.class);
        User getUser = (User) context.getBean("getUser");
        System.out.println(getUser.getName());
    }
}
```



# 3、代理模式

**代理模式即 SpringAOP 的底层**

**代理模式分为静态代理和动态代理**

原型：

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749099.png) 



## 3.1 **静态代理**

角色分析：

- 抽象角色 ： 一般会使用接口或者抽象类来解决
- 真实角色 ：被代理角色
- 代理角色 ：代理真实角色，
- 客户 ：访问代理对象的人

代理模式的好处：

- 可以使真实角色的操作更加纯粹，不用关注一些公共的业务
- 公共也交给代理角色，实现了业务的分工
- 公共业务发生扩展的时候，方便集中管理

缺点：

- 一个真实角色就会产生一个代理角色，代码量翻倍，开发效率会变低



```java
package com.kuang.demo01;

//租房
public interface Rent {

    public void rent();

}
package com.kuang.demo01;

//房东
public class Host implements Rent{

    @Override
    public void rent() {
        System.out.println("房东要出租房子");
    }
}
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

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749440.png)



另一例:

```java
package com.kuang.demo02;

public interface UserService {
    public void add();
    public void delete();
    public void update();
    public void query();
}
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



在不改变原来的代码的情况下，实现了对原有功能的增强，这是AOP中最核心的思想



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311753869.png)



## 3.2 动态代理

- 动态代理和静态代理角色一样
- 动态代理的代理类是动态生成的，不是我们直接写好的
- 动态代理分为俩大类：基于接口的动态代理，基于类的动态代理

- - 基于接口--JDK 动态代理
  - 基于类--cglib
  - java 字节码实现：javasist

了解俩个类：

- Proxy：代理
- InvocationHandler：调用处理程序

**动态代理的好处**

静态代理有的它都有，静态代理没有的，它也有！

- 可以使得我们的真实角色更加纯粹 . 不再去关注一些公共的事情 .
- 公共的业务由代理来完成 . 实现了业务的分工 ,
- 公共业务发生扩展时变得更加集中和方便 .
- 一个动态代理 , 一般代理某一类业务
- 一个动态代理可以代理多个类，代理的是接口！

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
package com.kuang.demo03;

//租房
public interface Rent {
    public void rent();
}
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



# 4、AOP

### 4.1 AOP 简介

#### 4.1.1 什么是 AOP

AOP（Aspect Oriented Programming）意为：面向切面编程，通过预编译方式和运行期动态代理实现程序功能的统一维护的一种技术。**AOP是OOP的延续**，是软件开发中的一个热点，也是Spring框架中的一个重要内容，是函数式编程的一种衍生范型。利用AOP可以对业务逻辑的各个部分进行隔离，从而使得业务逻辑各部分之间的耦合度降低，提高程序的可重用性，同时提高了开发的效率。

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749875.webp)



#### 4.1.2 Aop在Spring中的作用

**提供声明式事务；允许用户自定义切面**

以下名词简单了解：

- 横切关注点：跨越应用程序多个模块的方法或功能。即是，与我们业务逻辑无关的，但是我们需要关注的部分，就是横切关注点。如日志 , 安全 , 缓存 , 事务等等 ....
- 切面（ASPECT）：横切关注点 被模块化 的特殊对象。即，它是一个类。
- 通知（Advice）：切面必须要完成的工作。即，它是类中的一个方法。
- 目标（Target）：被通知对象。
- 代理（Proxy）：向目标对象应用通知之后创建的对象。
- 切入点（PointCut）：切面通知 执行的 “地点”的定义。
- 连接点（JointPoint）：与切入点匹配的执行点。

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311753712.webp)

SpringAOP中，通过Advice定义横切逻辑，Spring中支持5种类型的Advice:

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311753774.webp)

即 Aop 在 不改变原有代码的情况下 , 去增加新的功能 

#### 4.1.3  使用Spring实现Aop

【重点】使用AOP织入，需要导入一个依赖包！

```xml
<!-- https://mvnrepository.com/artifact/org.aspectj/aspectjweaver -->
<dependency>
  <groupId>org.aspectj</groupId>
  <artifactId>aspectjweaver</artifactId>
  <version>1.9.4</version>
</dependency>
```

首先编写我们的业务接口和实现类

```java
package com.kuang.service;

public interface UserService {
    public void add();
    public void delete();
    public void update();
    public void select();
}
package com.kuang.service;

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
        System.out.println("更新了一个用户");
    }

    @Override
    public void select() {
        System.out.println("查询了一个用户");
    }
}
```

##### 第一种方式： 通过 Spring API 实现



```java
package com.kuang.log;

import org.springframework.aop.MethodBeforeAdvice;
import java.lang.reflect.Method;

public class Log implements MethodBeforeAdvice {

    //method: 要执行的目标对象的方法
    //args: 参数
    //target(o): 目标读写
    @Override
    public void before(Method method, Object[] objects, Object o) throws Throwable {
        System.out.println(o.getClass().getName()+"的"+method.getName()+"被执行了");

    }
}
package com.kuang.log;

import org.springframework.aop.AfterReturningAdvice;

import java.lang.reflect.Method;

public class AfterLog implements AfterReturningAdvice {

    //returnValue;返回值
    @Override
    public void afterReturning(Object returnValue, Method method, Object[] args, Object target) throws Throwable {
        System.out.println("执行了"+method.getName()+"方法，返回结果为："+returnValue );
    }
}
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:aop="http://www.springframework.org/schema/aop"
  xsi:schemaLocation="http://www.springframework.org/schema/beans
  http://www.springframework.org/schema/beans/spring-beans.xsd
  http://www.springframework.org/schema/aop
  http://www.springframework.org/schema/aop/spring-aop.xsd">

  <!--注册 beans-->
  <bean id="userService" class="com.kuang.service.UserServiceImpl"/>
  <bean id="log" class="com.kuang.log.Log"/>
  <bean id="afterLog" class="com.kuang.log.AfterLog"/>

  <!--方式一：使用原生 Spring API 接口-->
  <!--配置 aop: 导入 aop 约束-->
  <aop:config>
    <!--切入点：expression:表达式  execution(要执行的位置***) -->
    <aop:pointcut id="pointcut" expression="execution(* com.kuang.service.UserServiceImpl.*(..))"/>

    <!--执行环绕增加-->
    <aop:advisor advice-ref="log" pointcut-ref="pointcut"/>
    <aop:advisor advice-ref="afterLog" pointcut-ref="pointcut"/>
  </aop:config>

</beans>
import com.kuang.service.UserService;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MyTest {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        //动态代理的是接口
        UserService userService = context.getBean("userService", UserService.class);

        userService.add();
    }
}
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311753241.png)

##### 第二种方式：**自定义类来实现Aop**



目标业务类不变依旧是userServiceImpl

```java
package com.kuang.diy;

public class DiyPointCut {
    public void before(){
        System.out.println("========方法执行前========");
    }

    public void after(){
        System.out.println("========方法执行后========");
    }
}
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:aop="http://www.springframework.org/schema/aop"
  xsi:schemaLocation="http://www.springframework.org/schema/beans
  http://www.springframework.org/schema/beans/spring-beans.xsd
  http://www.springframework.org/schema/aop
  http://www.springframework.org/schema/aop/spring-aop.xsd">

  <!--注册 beans-->
  <bean id="userService" class="com.kuang.service.UserServiceImpl"/>
  <bean id="log" class="com.kuang.log.Log"/>
  <bean id="afterLog" class="com.kuang.log.AfterLog"/>

  <!--    &lt;!&ndash;方式一：使用原生 Spring API 接口&ndash;&gt;-->
  <!--    &lt;!&ndash;配置 aop: 导入 aop 约束&ndash;&gt;-->
  <!--    <aop:config>-->
  <!--        &lt;!&ndash;切入点：expression:表达式  execution(要执行的位置***) &ndash;&gt;-->
  <!--        <aop:pointcut id="pointcut" expression="execution(* com.kuang.service.UserServiceImpl.*(..))"/>-->

  <!--        &lt;!&ndash;执行环绕增加&ndash;&gt;-->
  <!--        <aop:advisor advice-ref="log" pointcut-ref="pointcut"/>-->
  <!--        <aop:advisor advice-ref="afterLog" pointcut-ref="pointcut"/>-->
  <!--    </aop:config>-->

  <!--方式二：自定义类-->
  <bean id="diy" class="com.kuang.diy.DiyPointCut"/>
  <aop:config>
    <!--自定义切面，ref 要引用的类-->
    <aop:aspect ref="diy">
      <!--切入点-->
      <aop:pointcut id="diyPonitcut" expression="execution(* com.kuang.service.UserServiceImpl.*(..))"/>
      <!--通知-->
      <aop:before pointcut-ref="diyPonitcut" method="before"/>
      <aop:after pointcut-ref="diyPonitcut" method="after"/>
    </aop:aspect>
  </aop:config>


</beans>
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749050.png)



##### 第三种方式： 使用注解实现

```java
package com.kuang.diy;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;

//标注这个类是一个切面
@Aspect
public class AnnotationPointCut {

    @Before("execution(* com.kuang.service.UserServiceImpl.*(..))")
    public void before(){
        System.out.println("========方法执行前========");
    }

    @After("execution(* com.kuang.service.UserServiceImpl.*(..))")
    public void after(){
        System.out.println("========方法执行后========");
    }

    //在环绕增强中，我们可以给定一个参数，代表我们要获取处理切入的点
    @Around("execution(* com.kuang.service.UserServiceImpl.*(..))")
    public void around(ProceedingJoinPoint jp) throws Throwable {
        System.out.println("环绕前");
        Object proceed = jp.proceed();
        System.out.println("环绕后");
    }
}
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:aop="http://www.springframework.org/schema/aop"
  xsi:schemaLocation="http://www.springframework.org/schema/beans
  http://www.springframework.org/schema/beans/spring-beans.xsd
  http://www.springframework.org/schema/aop
  http://www.springframework.org/schema/aop/spring-aop.xsd">
  <!--方式三-->
  <bean id="annotationPointcut" class="com.kuang.diy.AnnotationPointCut"/>
  <!--开启注解支持-->
  <aop:aspectj-autoproxy/>
</beans>
```



![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749165.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311753944.png)



# 5、整合 Mybatis（暂时跳过）

### 5.1.1 导入相关 jar 包

(版本可以根据最新版调整)

```xml
<dependencies>
  <dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.12</version>
  </dependency>
  <dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.5.2</version>
  </dependency>
  <dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.47</version>
  </dependency>
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>5.1.10.RELEASE</version>
  </dependency>
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-jdbc</artifactId>
    <version>5.1.10.RELEASE</version>
  </dependency>
  <!-- https://mvnrepository.com/artifact/org.aspectj/aspectjweaver -->
  <dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
    <version>1.9.4</version>
  </dependency>
  <dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis-spring</artifactId>
    <version>2.0.2</version>
  </dependency>
</dependencies>
```



# 6、声明式事务

## 6.1 回顾事务

**事务是逻辑上的一组操作，要么都执行，要么都不执行**

- 把一组业务当成一个业务来做，**要么都成功，要么都失败**。
- 事务在项目开发过程非常重要，涉及到数据的一致性的问题，不容马虎！
- 事务管理是企业级应用程序开发中必备技术，用来确保数据的完整性和一致性。

**事务 ACID 原则**

1. 原子性（atomicity）

- - 事务是原子性操作，由一系列动作组成，事务的原子性确保动作要么全部完成，要么完全不起作用

1. 一致性（consistency）

- - 一旦所有事务动作完成，事务就要被提交。数据和资源处于一种满足业务规则的一致性状态中

1. 隔离性（isolation）

- - 可能多个事务会同时处理相同的数据，因此每个事务都应该与其他事务隔离开来，防止数据损坏

1. 持久性（durability）

- - 事务一旦完成，无论系统发生什么错误，结果都不会受到影响。通常情况下，事务的结果被写到持久化存储器中

 **A、I、D 是手段，C 是目的！**

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202510311749286.png)

## 6.2 Spring中的事务管理

### 6.2.1 Spring 支持的俩种事务管理方式

#### 编程式事务管理

 在代码中手动控制事务的开启、提交和回滚，灵活但耦合业务代码和事务逻辑

使用`TransactionTemplate` 进行编程式事务管理的示例代码如下：

```java
@Autowired
private TransactionTemplate transactionTemplate;
public void testTransaction() {
        //调用 transactionTemplate.execute() 开始事务执行
        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            @Override
            //传入回调 TransactionCallbackWithoutResult，回调中写业务逻辑，transactionStatus 对象表示当前事务的状态，可以用来设置回滚
            protected void doInTransactionWithoutResult(TransactionStatus transactionStatus) {

                try {

                    // ....  业务代码
                } catch (Exception e){
                    //回滚
                    //如果出现异常，调用 transactionStatus.setRollbackOnly()，标记事务为回滚状态
                    transactionStatus.setRollbackOnly();
                }

            }
        });
}
```

使用 `TransactionManager` 进行编程式事务管理的示例代码如下：

```java
@Autowired
//PlatformTransactionManager 可以手动开启、提交、回滚事务
private PlatformTransactionManager transactionManager;

public void testTransaction() {
    //调用 getTransaction() 开启一个事务，返回事务状态对象 status。
    //DefaultTransactionDefinition() 是事务配置，这里使用默认值：传播行为：PROPAGATION_REQUIRED；隔离级别：ISOLATION_DEFAULT
    TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());
          try {
               // ....  业务代码
              //执行成功-调用 transactionManager.commit(status) 提交事务
              transactionManager.commit(status);
          } catch (Exception e) {
              //捕获异常-调用 transactionManager.rollback(status) 回滚事务
              transactionManager.rollback(status);
          }
}
```

#### 声明式事务管理

使用`@Transactional`注解或 XML 配置， Spring AOP 自动管理事务  

```java
//声明式事务注解
//propagation = Propagation.REQUIRED：当前方法有事务则加入该事务；如果当前方法没有事务，则新建一个事务。
@Transactional(propagation = Propagation.REQUIRED)
//业务方法
public void aMethod {
  //do something
  //创建两个对象 b 和 c
  B b = new B();
  C c = new C();
  //调用 B 和 C 的方法
  b.bMethod();
  c.cMethod();
}
```

**spring** **7种事务传播行为****：**

- propagation_requierd：如果当前没有事务，就新建一个事务，如果已存在一个事务中，加入到这个事务中，这是最常见的选择。
- propagation_supports：支持当前事务，如果没有当前事务，就以非事务方法执行。
- propagation_mandatory：使用当前事务，如果没有当前事务，就抛出异常。
- propagation_required_new：新建事务，如果当前存在事务，把当前事务挂起。
- propagation_not_supported：以非事务方式执行操作，如果当前存在事务，就把当前事务挂起。
- propagation_never：以非事务方式执行操作，如果当前事务存在则抛出异常。
- propagation_nested：如果当前存在事务，则在嵌套事务内执行。如果当前没有事务，则执行与propagation_required类似的操作

Spring 默认的事务传播行为是 PROPAGATION_REQUIRED，它适合于绝大多数的情况。

**使用Spring管理事务，注意头文件的约束导入 : tx**

```plain
xmlns:tx="http://www.springframework.org/schema/tx"

http://www.springframework.org/schema/tx
http://www.springframework.org/schema/tx/spring-tx.xsd">
```