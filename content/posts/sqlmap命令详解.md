---
title: sqlmap命令详解
date: 2025-11-02T14:00:00+08:00
tags:
  - "sqlmap命令详解"
  - "转载"
categories:
  - "漏洞"
description: sqlmap命令详解
showToc: true
draft: false
tocOpen: true
---
# sqlmap命令详解

> 转载自： [全栈程序员站长](https://cloud.tencent.com/developer/user/8223537)      原文：https://cloud.tencent.com/developer/article/2148285



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

![img](https://ask.qcloudimg.com/http-save/yehe-8223537/8ebeb446b4b0bc8fb88b0ec56e7f5048.png)

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

