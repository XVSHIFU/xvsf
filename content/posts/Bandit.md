---

title: Bandit
date: 2026-04-22
categories:
  - 漏洞靶场
tags:
  - 漏洞靶场

---

[https://overthewire.org/wargames/bandit/](https://overthewire.org/wargames/bandit/)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235575.png)



**Bandit** 战争游戏（Wargame）专为完全的初学者设计。它将教你玩其他战争游戏所需的基础知识。如果你发现遗漏了某些关键内容，或者对新关卡有好的想法，请告诉我们！

# 初学者须知
与大多数游戏一样，本游戏也分为若干关卡。你从 **第 0 关（Level 0）** 开始，并尝试“攻克”或“完成”它。完成一个关卡后，你会获得如何开始下一关的信息。本网站上“Level <X>”页面包含了如何从前一关进入第 X 关的信息。例如，“Level 1”页面包含了如何从 Level 0 获得 Level 1 访问权限的信息。本游戏的所有关卡在网站上都有对应页面，你可以在页面左侧的侧边栏菜单中找到它们的链接。

你将会遇到许多完全不知道该做什么的情况。**不要惊慌！不要放弃！** 这个游戏的目的是让你学习基础知识。而学习基础知识的一部分工作就是阅读大量的新信息。如果你以前从未试过命令行，那么这篇[用户命令简介]是一个很好的入门读物。

当你不知道如何继续时，可以尝试以下几种方法：

+ **首先**，如果你知道一个命令但不知道如何使用它，可以输入 `man <command>` 来查看**手册（man page）**。例如，输入 `man ls` 来学习 “ls” 命令。 “man” 命令本身也有手册，去试试吧！在使用 `man` 时，按下 **q** 键退出（你也可以使用 **/**、**n** 和 **N** 进行搜索）。
+ **其次**，如果没有对应的 man 页面，该命令可能是一个**外壳内建命令（shell built-in）**。在这种情况下，请使用 `help <X>` 命令，例如 `help cd`。
+ 此外，你最喜欢的**搜索引擎**是你的好帮手。学会如何使用它！我推荐使用 **Google**。
+ **最后**，如果你仍然卡住了，可以通过**聊天室**加入我们。

你已经准备好开始了！从页面左侧链接的 **Level 0** 开始吧。祝你好运！

**虚拟机（VM）注意事项：** 当虚拟机的网络适配器配置为 NAT 模式时，通过 SSH 连接 overthewire.org 可能会失败并提示“broken pipe error”。在 `/etc/ssh/ssh_config` 中添加设置 `IPQoS throughput` 应该可以解决此问题。如果这不起作用，唯一的选择就是将适配器更改为桥接模式（Bridged mode）。







# <font style="color:rgb(0, 0, 0);">Bandit Level 0</font>
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222234831.png)



**关卡目标** 本关的目标是让你通过 SSH 登录到游戏中。你需要连接的主机地址为`bandit.labs.overthewire.org`，端口号为 `2220`。用户名是 `bandit0`，密码是 `bandit0`。登录成功后，请前往 **Level 1** 页面查看如何攻克第 1 关。

**解决本关可能需要的命令**

+ [**ssh**](https://manpages.ubuntu.com/manpages/noble/man1/ssh.1.html)

**有用的阅读材料**

+ [维基百科上的 Secure Shell (SSH)](https://en.wikipedia.org/wiki/Secure_Shell)
+ [It’s FOSS 上的：如何使用非标准端口的 SSH](https://itsfoss.com/ssh-to-port/)
+ [wikiHow 上的：如何使用 SSH 密钥进行 SSH 连接](https://www.wikihow.com/Use-SSH)





这里我用 Xshell 进行连接：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235881.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222237211.png)



连接之后就可以看到主目录下有一个 `readme` 文件

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222239894.png)





# <font style="color:rgb(0, 0, 0);">Bandit Level 0 → Level 1</font>
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222237770.png)

**关卡目标** 下一关的密码存储在主目录下名为 `readme` 的文件中。请使用该密码通过 SSH 登录到 bandit1。每当你找到一个关卡的密码时，请使用 SSH（通过 2220 端口）登录到该关卡以继续游戏。

**解决本关可能需要的命令**`[ls](https://manpages.ubuntu.com/manpages/noble/man1/ls.1.html)` , `[cd](https://manpages.ubuntu.com/manpages/noble/man1/cd.1posix.html)` , `[cat](https://manpages.ubuntu.com/manpages/noble/man1/cat.1.html)` , `[file](https://manpages.ubuntu.com/manpages/noble/man1/file.1.html)` , `[du](https://manpages.ubuntu.com/manpages/noble/man1/du.1.html)` , `[find](https://manpages.ubuntu.com/manpages/noble/man1/find.1.html)`

**提示：** 在你的本地机器上创建一个记录笔记和密码的文件！ 关卡密码**不会**自动保存。如果你不亲自保存它们，你将需要从 bandit0 重新开始。 密码偶尔也会发生变化。建议记录下解决每个挑战的方法。随着关卡难度增加，详细的笔记将有助于你回到中断的地方、为后续问题提供参考，或者在完成挑战后帮助他人。



`cat readme` 这样就可以看到我们的密码了

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235526.png)

接下来用同样的方法，连接 bandit1：



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222238405.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222239817.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222236947.png)



# <font style="color:rgb(0, 0, 0);">Bandit Level 1 → Level 2</font>
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235185.png)

**<font style="color:rgb(31, 31, 31);">关卡目标</font>**

<font style="color:rgb(31, 31, 31);">下一关的密码存储在主目录下名为 </font>`<font style="color:rgb(68, 71, 70);">-</font>`<font style="color:rgb(31, 31, 31);"> 的文件中。</font>

**<font style="color:rgb(31, 31, 31);">解决本关可能需要的命令</font>**

`[ls](https://manpages.ubuntu.com/manpages/noble/man1/ls.1.html)` , `[cd](https://manpages.ubuntu.com/manpages/noble/man1/cd.1posix.html)` , `[cat](https://manpages.ubuntu.com/manpages/noble/man1/cat.1.html)` , `[file](https://manpages.ubuntu.com/manpages/noble/man1/file.1.html)` , `[du](https://manpages.ubuntu.com/manpages/noble/man1/du.1.html)` , `[find](https://manpages.ubuntu.com/manpages/noble/man1/find.1.html)`

**<font style="color:rgb(31, 31, 31);">有用的阅读材料</font>**

+ [Google 搜索 “dashed filename”（带连字符的文件名）](https://www.google.com/search?q=dashed+filename)
+ [高级 Bash 脚本指南 - 第 3 章 - 特殊字符](https://linux.die.net/abs-guide/special-chars.html)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222236810.png)

在 Linux 中，很多命令（如 `cat`）会将短横线 `-` 识别为 **“标准输入/输出”** 的特殊占位符，而不是一个普通文件名。如果你直接运行 `cat -`，程序会一直等待你输入内容，而不是去读取那个名为 `-` 的文件。

要查看这个文件，需要通过**路径**来消除歧义

以下是几种方法：

`cat ./-`   通过在文件名前加上 `./`（当前目录），告诉系统这是一个具体的文件路径，而不是一个参数开关  

`cat < -`   可以使用输入重定向符号 `<`，让 Shell 负责打开文件并将其内容传递给 `cat`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222236129.png)



接下来就登录到 bandit2:

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222237102.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222238907.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222237486.png)







# <font style="color:rgb(0, 0, 0);">Bandit Level 2 → Level 3</font>

 <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222239226.png)



**<font style="color:rgb(31, 31, 31);">关卡目标</font>**

<font style="color:rgb(31, 31, 31);">下一关的密码存储在主目录下名为 </font>`<font style="color:rgb(68, 71, 70);">--spaces in this filename--</font>`<font style="color:rgb(31, 31, 31);"> 的文件中。</font>

**<font style="color:rgb(31, 31, 31);">解决本关可能需要的命令</font>**

`[ls](https://manpages.ubuntu.com/manpages/noble/man1/ls.1.html)` , `[cd](https://manpages.ubuntu.com/manpages/noble/man1/cd.1posix.html)` , `[cat](https://manpages.ubuntu.com/manpages/noble/man1/cat.1.html)` , `[file](https://manpages.ubuntu.com/manpages/noble/man1/file.1.html)` , `[du](https://manpages.ubuntu.com/manpages/noble/man1/du.1.html)` , `[find](https://manpages.ubuntu.com/manpages/noble/man1/find.1.html)`

**<font style="color:rgb(31, 31, 31);">有用的阅读材料</font>**

+ [Google 搜索 “spaces in filename”（文件名中的空格）](https://www.google.com/search?q=spaces+in+filename)





`cat ./--spaces\ in\ this\ filename--`  可以先输入`--` ，之后通过`TAB`来补全即可（当然愿意一个字母一个字母打也不是不行

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222239176.png)





# <font style="color:rgb(0, 0, 0);">Bandit Level 3 → Level 4</font>
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222236179.png)  
 **<font style="color:rgb(31, 31, 31);">关卡目标</font>**

<font style="color:rgb(31, 31, 31);">下一关的密码存储在 </font>`<font style="color:rgb(68, 71, 70);">inhere</font>`<font style="color:rgb(31, 31, 31);"> 目录下的一个隐藏文件中。</font>

**<font style="color:rgb(31, 31, 31);">解决本关可能需要的命令</font>**

`[ls](https://manpages.ubuntu.com/manpages/noble/man1/ls.1.html)` , `[cd](https://manpages.ubuntu.com/manpages/noble/man1/cd.1posix.html)` , `[cat](https://manpages.ubuntu.com/manpages/noble/man1/cat.1.html)` , `[file](https://manpages.ubuntu.com/manpages/noble/man1/file.1.html)` , `[du](https://manpages.ubuntu.com/manpages/noble/man1/du.1.html)` , `[find](https://manpages.ubuntu.com/manpages/noble/man1/find.1.html)`



对于隐藏目录（目录前有一个`.`），一般只需要 `ls -la` 就可以看到了

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222239767.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222234449.png)







# <font style="color:rgb(0, 0, 0);">Bandit Level 4 → Level 5</font>

 <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222236138.png)



**关卡目标** 下一关的密码存储在 `inhere` 目录下唯一一个**人类可读（human-readable）**的文件中。提示：如果你的终端显示乱码，请尝试使用 `reset` 命令。

**解决本关可能需要的命令**

`[ls](https://manpages.ubuntu.com/manpages/noble/man1/ls.1.html)` , `[cd](https://manpages.ubuntu.com/manpages/noble/man1/cd.1posix.html)` , `[cat](https://manpages.ubuntu.com/manpages/noble/man1/cat.1.html)` , `[file](https://manpages.ubuntu.com/manpages/noble/man1/file.1.html)` , `[du](https://manpages.ubuntu.com/manpages/noble/man1/du.1.html)` , `[find](https://manpages.ubuntu.com/manpages/noble/man1/find.1.html)`





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235189.png)







 使用 `file` 命令  `file ./*`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222237851.png)

+ **data**: 表示这是二进制或不可读的文件。
+ **ASCII text**: 这就是要找的目标！

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235849.png)





# <font style="color:rgb(0, 0, 0);">Bandit Level 5 → Level 6</font>


<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222238155.png)





**关卡目标** 下一关的密码存储在 `inhere` 目录下的某个文件中，该文件具有以下所有属性：

+ **人类可读 (human-readable)**
+ **大小为 1033 字节 (1033 bytes in size)**
+ **不可执行 (not executable)**

**解决本关可能需要的命令**

`[ls](https://manpages.ubuntu.com/manpages/noble/man1/ls.1.html)` , `[cd](https://manpages.ubuntu.com/manpages/noble/man1/cd.1posix.html)` , `[cat](https://manpages.ubuntu.com/manpages/noble/man1/cat.1.html)` , `[file](https://manpages.ubuntu.com/manpages/noble/man1/file.1.html)` , `[du](https://manpages.ubuntu.com/manpages/noble/man1/du.1.html)` , `[find](https://manpages.ubuntu.com/manpages/noble/man1/find.1.html)`







`find . -type f -size 1033c ! -executable`

+ `**.**`: 从当前目录开始搜索。
+ `**-type f**`: 只查找**文件**（排除目录）。
+ `**-size 1033c**`: 查找大小正好为 **1033 字节**的文件（在 `find` 中，数字后的 `c` 代表 bytes）。
+ `**! -executable**`: `!` 表示取反，即查找**不可执行**的文件。
+ **人类可读 (Human-readable)**: 虽然 `find` 没有直接的“人类可读”参数，但满足上述两个硬性条件的文件通常只有一个



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222234474.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222234486.png)





# <font style="color:rgb(0, 0, 0);">Bandit Level 6 → Level 7</font>
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222238326.png)  


**<font style="color:rgb(31, 31, 31);">关卡目标</font>**

<font style="color:rgb(31, 31, 31);">下一关的密码存储在服务器的</font>**<font style="color:rgb(31, 31, 31);">某个位置</font>**<font style="color:rgb(31, 31, 31);">，并且具有以下所有属性：</font>

+ **<font style="color:rgb(31, 31, 31);">所属用户：bandit7</font>**
+ **<font style="color:rgb(31, 31, 31);">所属用户组：bandit6</font>**
+ **<font style="color:rgb(31, 31, 31);">大小为 33 字节</font>**

**<font style="color:rgb(31, 31, 31);">解决本关可能需要的命令</font>**

`[ls](https://manpages.ubuntu.com/manpages/noble/man1/ls.1.html)` , `[cd](https://manpages.ubuntu.com/manpages/noble/man1/cd.1posix.html)` , `[cat](https://manpages.ubuntu.com/manpages/noble/man1/cat.1.html)` , `[file](https://manpages.ubuntu.com/manpages/noble/man1/file.1.html)` , `[du](https://manpages.ubuntu.com/manpages/noble/man1/du.1.html)` , `[find](https://manpages.ubuntu.com/manpages/noble/man1/find.1.html)`<font style="color:rgb(31, 31, 31);"> , </font>`[grep](https://manpages.ubuntu.com/manpages/noble/man1/grep.1.html)`

<font style="color:rgb(68, 71, 70);"></font>

<font style="color:rgb(68, 71, 70);"></font>

<font style="color:rgb(68, 71, 70);"></font>

使用 `find` 命令从根目录 `/` 开始全局搜索。由于根目录下有很多目录（如 `/root`, `/etc`, `/sys`）是作为普通用户无法访问的，搜索时会产生大量的“Permission denied”错误，我们需要把这些噪音过滤掉。

`find / -user bandit7 -group bandit6 -size 33c 2>/dev/null`

+ `**/**`: 告诉 `find` 从**根目录**（系统最顶层）开始搜索。
+ `**-user bandit7**`: 查找所属用户为 `bandit7` 的文件。
+ `**-group bandit6**`: 查找所属组为 `bandit6` 的文件。
+ `**-size 33c**`: 查找大小正好为 **33 字节**的文件（`c` 表示字节）。
+ `**2>/dev/null**`: **这是本关的关键技巧。** * 在 Linux 中，`2` 代表“标准错误输出”。
    - `>/dev/null` 代表将输出重定向到一个名为“黑洞”的虚无设备。
    - 这样做可以让那些烦人的权限报错不再显示在屏幕上，只留下唯一正确的结果。

<font style="color:rgb(68, 71, 70);"></font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235545.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222236359.png)















# <font style="color:rgb(0, 0, 0);">Bandit Level 7 → Level 8</font>

 <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222234922.png)



**关卡目标**

下一关的密码存储在 `data.txt` 文件中，位于单词 `millionth` 的旁边。

**解决本关可能需要的命令**

`man`, `grep`, `sort`, `uniq`, `strings`, `base64`, `tr`, `tar`, `gzip`, `bzip2`, `xxd`





`grep "millionth" data.txt`

+ `**grep**`: 搜索文本中的模式。
+ `**"millionth"**`: 你要寻找的关键词。
+ `**data.txt**`: 目标文件名。



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222236581.png)





# <font style="color:rgb(0, 0, 0);">Bandit Level 8 → Level 9</font>

 <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222238493.png)



**<font style="color:rgb(31, 31, 31);">关卡目标</font>**

<font style="color:rgb(31, 31, 31);">下一关的密码存储在 </font>`<font style="color:rgb(68, 71, 70);">data.txt</font>`<font style="color:rgb(31, 31, 31);"> 文件中，是其中</font>**<font style="color:rgb(31, 31, 31);">唯一一行仅出现过一次</font>**<font style="color:rgb(31, 31, 31);">的文本。</font>

**<font style="color:rgb(31, 31, 31);">解决本关可能需要的命令</font>**

`<font style="color:rgb(68, 71, 70);">grep</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">sort</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">uniq</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">strings</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">base64</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">tr</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">tar</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">gzip</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">bzip2</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">xxd</font>`

**<font style="color:rgb(31, 31, 31);">有用的阅读材料</font>**

[管道与重定向 (Piping and Redirection)](https://ryanstutorials.net/linuxtutorial/piping.php)





`<font style="color:rgb(68, 71, 70);"> sort data.txt | uniq -u  </font>`

+ `**sort data.txt**`<font style="color:rgb(68, 71, 70);">: 将文件中的所有行按字母顺序重新排列，这样相同的行就会挨在一起。</font>
+ `**|**`** (管道符)**<font style="color:rgb(68, 71, 70);">: 将前一个命令的输出传递给后一个命令。</font>
+ `**uniq -u**`<font style="color:rgb(68, 71, 70);">:</font>
    - `<font style="color:rgb(68, 71, 70);">uniq</font>`<font style="color:rgb(68, 71, 70);"> 默认是去除重复。</font>
    - `**-u**`** 参数**<font style="color:rgb(68, 71, 70);">（Unique）非常关键，它告诉程序</font>**只显示那些在原文件中仅出现过一次的行**<font style="color:rgb(68, 71, 70);">。</font>

<font style="color:rgb(68, 71, 70);"></font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222237181.png)

<font style="color:rgb(68, 71, 70);"></font>

<font style="color:rgb(68, 71, 70);"></font>

# <font style="color:rgb(0, 0, 0);">Bandit Level 9 → Level 10</font>
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222236114.png)<font style="color:rgb(68, 71, 70);">  
</font><font style="color:rgb(68, 71, 70);"> </font>

**<font style="color:rgb(31, 31, 31);">关卡目标</font>**

<font style="color:rgb(31, 31, 31);">下一关的密码存储在 </font>`<font style="color:rgb(68, 71, 70);">data.txt</font>`<font style="color:rgb(31, 31, 31);"> 文件中，是少数几个</font>**<font style="color:rgb(31, 31, 31);">人类可读字符串</font>**<font style="color:rgb(31, 31, 31);">之一，并且其前面有多个 </font>`<font style="color:rgb(68, 71, 70);">=</font>`<font style="color:rgb(31, 31, 31);"> 字符。</font>

**<font style="color:rgb(31, 31, 31);">解决本关可能需要的命令</font>**

`<font style="color:rgb(68, 71, 70);">grep</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">sort</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">uniq</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">strings</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">base64</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">tr</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">tar</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">gzip</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">bzip2</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">xxd</font>`

<font style="color:rgb(68, 71, 70);"></font>

<font style="color:rgb(68, 71, 70);"></font>

`<font style="color:rgb(68, 71, 70);">strings</font>`<font style="color:rgb(68, 71, 70);"> 命令专门用于从非文本文件中提取出</font>**可打印的字符序列**<font style="color:rgb(68, 71, 70);">。配合 </font>`<font style="color:rgb(68, 71, 70);">grep</font>`<font style="color:rgb(68, 71, 70);"> 来寻找特定的模式（多个 </font>`<font style="color:rgb(68, 71, 70);">=</font>`<font style="color:rgb(68, 71, 70);">），就能轻松定位密码。  </font>

<font style="color:rgb(68, 71, 70);"></font>

`<font style="color:rgb(68, 71, 70);">strings data.txt | grep "=="</font>`

+ `**strings data.txt**`<font style="color:rgb(68, 71, 70);">: 扫描文件并只输出其中属于“人类可读”范围的字符串（长度默认为 4 个字符及以上）。</font>
+ `**|**`<font style="color:rgb(68, 71, 70);">: 管道符，将提取出的文本传给下一个命令。</font>
+ `**grep "=="**`<font style="color:rgb(68, 71, 70);">: 搜索包含多个等号的行。</font>

<font style="color:rgb(68, 71, 70);"></font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222237172.png)

<font style="color:rgb(68, 71, 70);"></font>

<font style="color:rgb(68, 71, 70);"></font>

<font style="color:rgb(68, 71, 70);"></font>

<font style="color:rgb(68, 71, 70);"></font>

# <font style="color:rgb(0, 0, 0);">Bandit Level 10 → Level 11</font>
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222238776.png)



**<font style="color:rgb(31, 31, 31);">关卡目标</font>**

<font style="color:rgb(31, 31, 31);">下一关的密码存储在 </font>`<font style="color:rgb(68, 71, 70);">data.txt</font>`<font style="color:rgb(31, 31, 31);"> 文件中，该文件包含 </font>**<font style="color:rgb(31, 31, 31);">base64</font>**<font style="color:rgb(31, 31, 31);"> 编码的数据。</font>

**<font style="color:rgb(31, 31, 31);">解决本关可能需要的命令</font>**

`<font style="color:rgb(68, 71, 70);">grep</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">sort</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">uniq</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">strings</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">base64</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">tr</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">tar</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">gzip</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">bzip2</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">xxd</font>`

**<font style="color:rgb(31, 31, 31);">有用的阅读材料</font>**

+ [维基百科上的 Base64](https://en.wikipedia.org/wiki/Base64)

<font style="color:rgb(68, 71, 70);"></font>

<font style="color:rgb(68, 71, 70);"></font>

<font style="color:rgb(68, 71, 70);"></font>

`<font style="color:rgb(68, 71, 70);"> base64 -d data.txt  </font>`

+ `**base64**`<font style="color:rgb(68, 71, 70);">: 调用 Base64 处理工具。</font>
+ `**-d**`<font style="color:rgb(68, 71, 70);">: 执行**解码（decode）**操作（如果不加这个参数，默认是进行编码）。</font>
+ `**data.txt**`<font style="color:rgb(68, 71, 70);">: 包含编码数据的文件。</font>

<font style="color:rgb(68, 71, 70);"></font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222236472.png)	

# <font style="color:rgb(0, 0, 0);">Bandit Level 11 → Level 12</font>
<font style="color:rgb(68, 71, 70);">  
</font><font style="color:rgb(68, 71, 70);"> </font><!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222234498.png)

<font style="color:rgb(68, 71, 70);"></font>

**<font style="color:rgb(31, 31, 31);">关卡目标</font>**

<font style="color:rgb(31, 31, 31);">下一关的密码存储在 </font>`<font style="color:rgb(68, 71, 70);">data.txt</font>`<font style="color:rgb(31, 31, 31);"> 文件中，该文件内所有的所有小写字母 (a-z) 和大写字母 (A-Z) 都经过了 </font>**<font style="color:rgb(31, 31, 31);">13 位的偏移旋转（ROT13）</font>**<font style="color:rgb(31, 31, 31);">。</font>

**<font style="color:rgb(31, 31, 31);">解决本关可能需要的命令</font>**

`<font style="color:rgb(68, 71, 70);">grep</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">sort</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">uniq</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">strings</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">base64</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">tr</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">tar</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">gzip</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">bzip2</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">xxd</font>`

**<font style="color:rgb(31, 31, 31);">有用的阅读材料</font>**

+ [维基百科上的 Rot13](https://en.wikipedia.org/wiki/ROT13)

<font style="color:rgb(68, 71, 70);"></font>



`tr`（translate）命令是处理这种字符转换的最佳工具。它可以将一组字符映射为另一组字符。



`cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'`

+ `**cat data.txt**`: 读取加密后的文本。
+ `**tr 'A-Za-z' 'N-ZA-Mn-za-m'**`:
    - **第一组 **`**A-Za-z**`: 定义了要查找的源字符范围。
    - **第二组 **`**N-ZA-Mn-za-m**`: 定义了对应的目标映射。
        * **逻辑**:
            + `A` 对应 `N` (A 是第 1 个，N 是第 14 个，移动了 13 位)。
            + `Z` 对应 `M` (循环回到开头)。
            + 这个映射同时处理了大写和小写字母。



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235313.png)





# <font style="color:rgb(0, 0, 0);">Bandit Level 12 → Level 13</font>

 <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222238394.png)

**<font style="color:rgb(31, 31, 31);">关卡目标</font>**

<font style="color:rgb(31, 31, 31);">下一关的密码存储在 </font>`<font style="color:rgb(68, 71, 70);">data.txt</font>`<font style="color:rgb(31, 31, 31);"> 文件中，该文件是一个经过多次压缩的文件的 </font>**<font style="color:rgb(31, 31, 31);">十六进制转储（hexdump）</font>**<font style="color:rgb(31, 31, 31);">。对于本关，在 </font>`<font style="color:rgb(68, 71, 70);">/tmp</font>`<font style="color:rgb(31, 31, 31);"> 下创建一个你可以工作的目录会很有帮助。请使用 </font>`<font style="color:rgb(68, 71, 70);">mkdir</font>`<font style="color:rgb(31, 31, 31);"> 命令并起一个难以猜到的目录名；或者更好的办法是使用 </font>`<font style="color:rgb(68, 71, 70);">mktemp -d</font>`<font style="color:rgb(31, 31, 31);"> 命令。然后使用 </font>`<font style="color:rgb(68, 71, 70);">cp</font>`<font style="color:rgb(31, 31, 31);"> 命令复制数据文件，并使用 </font>`<font style="color:rgb(68, 71, 70);">mv</font>`<font style="color:rgb(31, 31, 31);"> 命令对其进行重命名（请阅读相关帮助文档！）。</font>

**<font style="color:rgb(31, 31, 31);">解决本关可能需要的命令</font>**

`<font style="color:rgb(68, 71, 70);">grep</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">sort</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">uniq</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">strings</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">base64</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">tr</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">tar</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">gzip</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">bzip2</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">xxd</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">mkdir</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">cp</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">mv</font>`<font style="color:rgb(31, 31, 31);">, </font>`<font style="color:rgb(68, 71, 70);">file</font>`

**<font style="color:rgb(31, 31, 31);">有用的阅读材料</font>**

+ [维基百科上的 十六进制转储 (Hex dump)](https://en.wikipedia.org/wiki/Hex_dump)





建立工作目录：

因为在共享服务器上，无法在主目录创建文件，所以必须去 `/tmp` 下开辟战场：  

```bash
# 创建一个随机名称的临时目录并进入
MYDIR=$(mktemp -d)
cd $MYDIR
# 将数据文件复制过来
cp ~/data.txt .
```



 将十六进制转为二进制  

```bash
xxd -r data.txt > data.bin
```



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222239994.png)



检查文件类型：

`file data.bin`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222239611.png)



但是接下来自己去手动重复解压过程会十分无聊，所以可不可以做一个自动脚本来





```bash
FILE="data.bin"

while true; do
    # 获取文件类型描述
    TYPE=$(file -b "$FILE")
    echo "当前文件类型: $TYPE"

    case "$TYPE" in
        *gzip*)
            mv "$FILE" "${FILE}.gz"
            gunzip "${FILE}.gz"
            ;;
        *bzip2*)
            mv "$FILE" "${FILE}.bz2"
            bunzip2 "${FILE}.bz2"
            ;;
        *tar*)
            # tar 提取后可能会改变文件名，我们要把它抓回来
            EXTRACTED=$(tar -tf "$FILE" | head -n 1)
            tar -xf "$FILE"
            mv "$EXTRACTED" "$FILE"
            ;;
        *ASCII*)
            echo "--- 成功！密码如下 ---"
            cat "$FILE"
            break
            ;;
        *)
            echo "遇到未知类型或已解压完成。"
            break
            ;;
    esac
done
```





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222239113.png)





当然，我们可以将前面的创建目录过程也加入脚本：

```bash
# 1. 创建并进入随机工作目录
WORK_DIR=$(mktemp -d)
cd "$WORK_DIR"
echo "--- 正在工作目录: $WORK_DIR 中进行操作 ---"

# 2. 将原始十六进制数据还原为二进制文件
xxd -r ~/data.txt > data.bin
CURRENT_FILE="data.bin"

# 3. 自动解压循环
echo "--- 开始自动剥洋葱 ---"
while true; do
    # 获取文件类型（简短模式）
    FTYPE=$(file -b "$CURRENT_FILE")
    echo "[检测到类型]: $FTYPE"

    case "$FTYPE" in
        *gzip*)
            mv "$CURRENT_FILE" "${CURRENT_FILE}.gz"
            gunzip "${FILE}.gz" 2>/dev/null || gunzip -S "" "${CURRENT_FILE}.gz"
            # gunzip 有时会自动去掉后缀，我们需要确保文件名回到 CURRENT_FILE
            CURRENT_FILE=$(ls | grep -v "data.txt" | head -n 1)
            ;;
        *bzip2*)
            mv "$CURRENT_FILE" "${CURRENT_FILE}.bz2"
            bunzip2 "${CURRENT_FILE}.bz2"
            CURRENT_FILE=$(ls | grep -v "data.txt" | head -n 1)
            ;;
        *tar*)
            # 获取压缩包内的文件名并提取
            INTERNAL_FILE=$(tar -tf "$CURRENT_FILE" | head -n 1)
            tar -xf "$CURRENT_FILE"
            # 如果解压出的文件名不是 CURRENT_FILE，则更新它
            CURRENT_FILE="$INTERNAL_FILE"
            ;;
        *ASCII*)
            echo -e "\n--- 最终通关密码 ---"
            cat "$CURRENT_FILE"
            echo -e "------------------\n"
            break
            ;;
        *)
            echo "错误：遇到无法处理的文件类型或已损坏。"
            break
            ;;
    esac
done

# 4. 清理工作（可选）
# cd ~ && rm -rf "$WORK_DIR"
```



密码：`FO5dwFsc0cbaIiH0h8J2eUks2vdTDwAn`





# <font style="color:rgb(0, 0, 0);">Bandit Level 13 → Level 14</font>

 <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235781.png)



下一级的密码保存在 `/etc/bandit_pass/bandit14` 文件中，并且只能由用户 `bandit14` 读取。在这一关，你不会直接获得下一级的密码，而是会得到一个私有 SSH 密钥，可以用它来登录下一级。回想一下你之前登录 bandit 各层级时用过的命令，并找出如何使用这个密钥进入下一级。

**本关可能用到的命令**  
`ssh`, `scp`, `umask`, `chmod`, `cat`, `nc`, `install`

**参考阅读材料**  
[SSH/OpenSSH/Keys](https://help.ubuntu.com/community/SSH/OpenSSH/Keys)





使用 SSH 私钥从 bandit13 登录到 bandit14，然后读取密码文件



<!-- 这是一张图片，ocr 内容为：IT! WE MEAN LA BANDIT13@BANDIT:~$ LS TOTAL 28 315:17 2 4096 APR DRWXR-XR-X ROOT ROOT DRWXR-XR-X 150 ROOT 4096 APR 3 15:20 ROOT LOGOUT 220 MAR 31 2024 .BASH LOG ROOT ROOT 3851 APR 3 15:10 ,BASHRC 1 ROOT ROOT 1 BANDIT14 BANDIT13 467 APR 3 15:17 HINT RW-I 1 ROOT MAR 31 2024 807 ROOT .PROFILE RW-R--R-- BANDIT14 BANDIT13 1679 APR 3 15:17 SSHKEY PRIVATE 1 BA -RW-R BANDIT13@BANDIT:~$ CAT HINT TH THIS LEVEL, NOTE THE FOLLOWING: IF TROUBLE WITH TH HAVE YOU ER LEVELS, THIS LEVEL HAS A WEBSITE WITH INFORMATION: 1) AS FOR ALL OTHER LE HTTPS://OVERTHEWIRE.ORG/WARGAMES/BANDIT/BANDIT14.HTML 2) OT BROKEN. TO VERIFY, SEE: NO, THE LEVEL IS NOT HE HTTPS://STATUS.OVERTHEWIRE.ORG/ NT VERSION OF OVERTHEWIRE PREVENTS LOGGING IN 3) THE CURRENT V GING IN FROM ONE 1) LEVEL TO ANOTHER VIA LOCALHOST. LOG OUT, AND S SEE 4) IF YOU ERRORS, READ THE ERROR MESSAGE ON YOUR SCREEN- GET IT! WE MEAN BANDIT13@BANDIT: -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235380.png)

如果这一关遇到困难，请注意以下几点：

1）和其他所有关卡一样，这一关也有对应的信息页面：  

   [https://overthewire.org/wargames/bandit/bandit14.html](https://overthewire.org/wargames/bandit/bandit14.html)

2）关卡本身没有问题。如需验证，请访问：  

   [https://status.overthewire.org/](https://status.overthewire.org/)

3）当前版本的 OverTheWire 禁止通过 localhost 从一个关卡直接登录到另一个关卡。请退出登录，并参考第 1 点。

4）如果遇到错误，请仔细阅读屏幕上显示的错误信息。  

   我们是认真的！







**关键点：**

  1. 服务器配置变更 - 新版 OverTheWire 禁止了 localhost 之间的 SSH

  连接，所以网上很多旧题解（使用 ssh -i key bandit14@localhost）已经失效。

  2. 正确做法 - 必须从本地电脑使用私钥登录：

    - 用 scp 下载私钥到本地

`scp -P 2220 bandit13@bandit.labs.overthewire.org:sshkey.private ./bandit14.key`

    - 修复 Windows 文件权限（SSH 要求私钥文件权限严格）
    
    - 从本地用私钥连接到远程服务器

  3. Windows 权限修复：

 ` icacls bandit14.key /inheritance:r`

  `icacls bandit14.key /grant:r "$($env:USERNAME):R"`

  4. SSH 私钥认证 - 使用 -i 参数指定私钥文件，无需输入密码即可登录。

` ssh -i bandit14.key bandit14@bandit.labs.overthewire.org -p 2220`



<!-- 这是一张图片，ocr 内容为：ORDER TO GENERATE A RANDOM COMMAND"MKTEMP -D"IN OR NARD TO GUESS AND DIRECTORY IN /TMP/. READ-ACCESS TO BOTH /TMP/ IS DIS DIS S DISABLED A D AND TO /PROC RESTRICTED SO THAT USERS CANNOT SNOOP ON EACHOTHER. FILES AND ILES AND DIRECTORIES PERIODICALLY DE Y DELETED!THE/TMP WITH EASILY GUESSABLE OR SHORT NAMES WILL BE DIRECTORY IS REGULARLY WIPED. PLEASE PLAY NICE: * DON'T LEAVE ORPHAN P N PROCESSES RUNNING * DON'T LEAVE EXPLOIT-FILES LAYING AROUND * DON'T ANNOY OTHER PLAYERS OR SPOILERS * DON'T POST PASSWORDS OR DONT POST SPOILERS! * AGAIN, WRITEUPS OF YOUR SOLUTION ON YOUR BLOG OR WEBSITE! THIS INCLUDES TIPS ]-- THIS MACHINE HAS A 64BIT PROCESSOR AND MANY SECURITY-FEATURES ENABLED HAS BEEN SWITCHED OFF. THE FOLLOWING BY DEFAULT, ALTHOUGH ASLR HAS BEEL COMPILER FLAGS MIGHT BE INTERESTING: COMPILE FOR 32BIT -M32 DISABLE PROPOLICE FNO-STACK-PROTECTOR DISABLE RELRO -WL,-Z,NORELRO IN ADDITION, THE EXECSTACK TOOL CAN BE USED TO FLAG STACK THE AS EXECUTABLE ON ELF BINARIES. FINALLY, NETWO Y, NETWORK-ACCESS IS LIMITED FOR MOST LEVELS BY A LOCAL FIREWALL. --[ TOOLS ]-- FOR YOUR CONVENIENCE WE HAVE INSTALLED A FEW USEFUL TOOLS WHICH YOU CAN FIND IN THE FOLLOWING LOCATIONS: GEF (HTTPS://GITHUB.COM/HUGSY/GEF) IN /OPT/GEF/ * PWNDBG (HTTPS://GITHUB.COM/PWNDBG/PWNDBG) IN /OPT/PWNDBG/ GDBINIT (HTTPS://GITHUB.COM/GDBINIT/GDBINIT) IN /OPT/GDBINIT/ PWNTOOLS (HTTPS://GITHUB.COM/GALLOPSLED/PWNTOOLS) RADARE2 (HTTP://WWW.RADARE.ORG/) MORE INFORMATION FOR MORE INFORMATION REQARDING INDIVIDUAL WARQAMES, VISIT HTTP://WWW.OVERTHEWIRE.ORG/WARGAMES/ FOR SUPPORT, QUESTIONS OR COMMENTS, CONTACT US ON DISCORD OR IRC. ENJOY YOUR STAY! BANDIT14@BANDIT -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222237908.png)

```bash
PS C:\Users\Xvsf\Downloads\111> scp -P 2220 bandit13@bandit.labs.overthewire.org:sshkey.private ./bandit14.key
                         _                     _ _ _
                        | |__   __ _ _ __   __| (_) |_
                        | '_ \ / _` | '_ \ / _` | | __|
                        | |_) | (_| | | | | (_| | | |_
                        |_.__/ \__,_|_| |_|\__,_|_|\__|


                      This is an OverTheWire game server.
            More information on http://www.overthewire.org/wargames

backend: gibson-0
bandit13@bandit.labs.overthewire.org's password:
sshkey.private                                       100% 1679     2.3KB/s   00:00
PS C:\Users\Xvsf\Downloads\111> ssh -i bandit14.key bandit14@bandit.labs.overthewire.org -p 2220
                         _                     _ _ _
                        | |__   __ _ _ __   __| (_) |_
                        | '_ \ / _` | '_ \ / _` | | __|
                        | |_) | (_| | | | | (_| | | |_
                        |_.__/ \__,_|_| |_|\__,_|_|\__|


                      This is an OverTheWire game server.
            More information on http://www.overthewire.org/wargames

backend: gibson-0
Bad permissions. Try removing permissions for user: LAPTOP-XVSF\\CodexSandboxUsers (S-1-5-21-1461795071-488776397-353295033-1012) on file C:/Users/Xvsf/Downloads/111/bandit14.key.
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions for 'bandit14.key' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
Load key "bandit14.key": bad permissions
bandit14@bandit.labs.overthewire.org's password:
PS C:\Users\Xvsf\Downloads\111> icacls bandit14.key /inheritance:r
已处理的文件: bandit14.key
已成功处理 1 个文件; 处理 0 个文件时失败
PS C:\Users\Xvsf\Downloads\111> icacls bandit14.key /grant:r "$($env:USERNAME):R"
已处理的文件: bandit14.key
已成功处理 1 个文件; 处理 0 个文件时失败
PS C:\Users\Xvsf\Downloads\111>  ssh -i bandit14.key bandit14@bandit.labs.overthewire.org -p 2220
                         _                     _ _ _
                        | |__   __ _ _ __   __| (_) |_
                        | '_ \ / _` | '_ \ / _` | | __|
                        | |_) | (_| | | | | (_| | | |_
                        |_.__/ \__,_|_| |_|\__,_|_|\__|


                      This is an OverTheWire game server.
            More information on http://www.overthewire.org/wargames

backend: gibson-0

      ,----..            ,----,          .---.
     /   /   \         ,/   .`|         /. ./|
    /   .     :      ,`   .'  :     .--'.  ' ;
   .   /   ;.  \   ;    ;     /    /__./ \ : |
  .   ;   /  ` ; .'___,/    ,' .--'.  '   \' .
  ;   |  ; \ ; | |    :     | /___/ \ |    ' '
  |   :  | ; | ' ;    |.';  ; ;   \  \;      :
  .   |  ' ' ' : `----'  |  |  \   ;  `      |
  '   ;  \; /  |     '   :  ;   .   \    .\  ;
   \   \  ',  /      |   |  '    \   \   ' \ |
    ;   :    /       '   :  |     :   '  |--"
     \   \ .'        ;   |.'       \   \ ;
  www. `---` ver     '---' he       '---" ire.org


Welcome to OverTheWire!

If you find any problems, please report them to the #wargames channel on
discord or IRC.

--[ Playing the games ]--

  This machine might hold several wargames.
  If you are playing "somegame", then:

    * USERNAMES are somegame0, somegame1, ...
    * Most LEVELS are stored in /somegame/.
    * PASSWORDS for each level are stored in /etc/somegame_pass/.

  Write-access to homedirectories is disabled. It is advised to create a
  working directory with a hard-to-guess name in /tmp/.  You can use the
  command "mktemp -d" in order to generate a random and hard to guess
  directory in /tmp/.  Read-access to both /tmp/ is disabled and to /proc
  restricted so that users cannot snoop on eachother. Files and directories
  with easily guessable or short names will be periodically deleted! The /tmp
  directory is regularly wiped.
  Please play nice:

    * don't leave orphan processes running
    * don't leave exploit-files laying around
    * don't annoy other players
    * don't post passwords or spoilers
    * again, DONT POST SPOILERS!
      This includes writeups of your solution on your blog or website!

--[ Tips ]--

  This machine has a 64bit processor and many security-features enabled
  by default, although ASLR has been switched off.  The following
  compiler flags might be interesting:

    -m32                    compile for 32bit
    -fno-stack-protector    disable ProPolice
    -Wl,-z,norelro          disable relro

  In addition, the execstack tool can be used to flag the stack as
  executable on ELF binaries.

  Finally, network-access is limited for most levels by a local
  firewall.

--[ Tools ]--

 For your convenience we have installed a few useful tools which you can find
 in the following locations:

    * gef (https://github.com/hugsy/gef) in /opt/gef/
    * pwndbg (https://github.com/pwndbg/pwndbg) in /opt/pwndbg/
    * gdbinit (https://github.com/gdbinit/Gdbinit) in /opt/gdbinit/
    * pwntools (https://github.com/Gallopsled/pwntools)
    * radare2 (http://www.radare.org/)

--[ More information ]--

  For more information regarding individual wargames, visit
  http://www.overthewire.org/wargames/

  For support, questions or comments, contact us on discord or IRC.

  Enjoy your stay!

bandit14@bandit:~$
bandit14@bandit:~$ ls -la
total 24
drwxr-xr-x   3 root root 4096 Apr  3 15:17 .
drwxr-xr-x 150 root root 4096 Apr  3 15:20 ..
-rw-r--r--   1 root root  220 Mar 31  2024 .bash_logout
-rw-r--r--   1 root root 3851 Apr  3 15:10 .bashrc
-rw-r--r--   1 root root  807 Mar 31  2024 .profile
drwxr-xr-x   2 root root 4096 Apr  3 15:17 .ssh
bandit14@bandit:~$ cat /etc/bandit_pass/bandit14
MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS
bandit14@bandit:~$
```







# <font style="color:rgb(0, 0, 0);">Bandit Level 14 → Level 15</font>
<!-- 这是一张图片，ocr 内容为：OVARTHEWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDITLEVEL14 LEVEL15 SSH INFORMATION HOST:BANDIT.LABS.OVERTHEWIRE.ORG PORT:2220 LEVEL GOAL DORICH LEVEL 0 ,THE PASSWORD FOR THE NEXT LEVEL CANBE  TO PORT  SUBMITTING  THE PASSWORD OF  THE CURENT LEVED ON LOC LEVEL 0 LEVEL1 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL1-LEVEL2 LEVEL 2-LEVEL 3 SSH,TELNET,NC,OPENSSL,S.CLIENT,NMAP LEVEL 3-LEVEL4 LEVEL4-LEVEL 5 HELPFUL READING MATERIAL LEVEL 5LEVEL 6 LEVEL 6 LEVEL 7 HOW THE INTERNET WORKS IN 5 MINUTES (YOUTUBE)(NOT COMPLETELY ACCURATE,BUT GOOD ENOUGH FOR BEGINNERS) LEVEL 7-LEVEL 8 IP ADDRESSES LEVEL8LEVEL9 IP ADDRESS ON WIKIPEDIA LEVEL9LEVEL 10 LOCALHOST ON WIKIPEDIA LEVEL10LEVEL11 PORTS LEVEL 11-LEVEL 12 PORT(COMPUTER NETWORKING)ON WIKIPEDIA LEVEL 12-LEVEL13 LEVEL 13 LEVEL 14 LEVEL14-LEVEL15 LEVEL15LEVEL 16 LEVEL16LEVEL 17 LEVEL17-LEVEL 18 LEVEL18-LEVEL 19 LEVEL19LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24 LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222234643.png)



下一级的密码可以通过将当前级别的密码发送到本地主机的 30000 端口来获取。

**本关可能用到的命令**  
`ssh`, `telnet`, `nc`, `openssl`, `s_client`, `nmap`

**参考阅读材料**  

+ 《互联网工作原理（5分钟视频）》（YouTube）（不完全准确，但对初学者足够好）  
+ IP 地址  
+ 维基百科：IP 地址  
+ 维基百科：本地主机  
+ 端口  
+ 维基百科：端口（计算机网络）





当前在 bandit14，密码是：`MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS`

使用 nc 链接到 localhost 的 30000 端口并发送密码：

`echo "MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS" | nc localhost 30000`



<!-- 这是一张图片，ocr 内容为："MU4VWETYJK8ROOF1QQMCBPALH71DCPVS" 30000 BANDIT14@BANDIT:~S LOCALHOST NC ECHO CORRECT! 8XCJNMGOKBGLHHFAZIGE5TMU4M2TKJQO BANDIT14@BANDIT:~$ -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222239429.png)



`8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo`







# <font style="color:rgb(0, 0, 0);">Bandit Level 15 → Level 16</font>

 <!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDITLEVEL15LEVEL16 SSH INFORMATION HOST:BANDIT.LABS.OVERTHEWIRE.ORG PORT:2220 LEVEL GOAL BORCH LEVEL 0 LEVEL 0 LEVEL1 HEPRULNATE GETING DONE; TENEGOTLATING" KEYUPDATE7READTHE CONNECTED COMMANDS' SECTON IN TN TN TTEMANDA LEVEL1-LEVEL2 LEVEL 2-LEVEL 3 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL3-LEVEL 4 LEVEL4-LEVEL 5 SSH,TELNET,NG,NCAT,SOCAT,OPENSSL,S.CLIENT,NMAP,NETSTAT,SS LEVEL 5 LEVEL 6 LEVEL 6 LEVEL 7 HELPFUL READING MATERIAL LEVEL 7-LEVEL 8 LEVEL8LEVEL9 SECURE SOCKET LAYER/TRANSPORT LAYER SECURITY ON WIKIPEDIA LEVEL9-LEVEL 10 OPENSSL COOKBOOK-TESTING WITH OPENSSL LEVEL 10 LEVEL 11 LEVEL11LEVEL12 LEVEL 12-LEVEL13 LEVEL13LEVEL14 LEVEL14LEVEL15 LEVEL 16-LEVEL 17 LEVEL 17-LEVEL 18 LEVEL18LEVEL 19 LEVEL 19LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24 LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235404.png)



下一级的密码可以通过使用 SSL/TLS 加密，将当前级别的密码发送到本地主机的 30001 端口来获取。

**有用的提示**：如果遇到 “DONE”、“RENEGOTIATING” 或 “KEYUPDATE” 信息，请阅读手册页中的 “CONNECTED COMMANDS” 部分。

**本关可能用到的命令**  
`ssh`, `telnet`, `nc`, `ncat`, `socat`, `openssl`, `s_client`, `nmap`, `netstat`, `ss`

**参考阅读材料**  

+ 维基百科：安全套接层 / 传输层安全  
+ OpenSSL 手册 - 使用 OpenSSL 进行测试





这一关需要使用 SSL/TLS 加密连接。使用 openssl s_client 连接到端口 30001：

`openssl s_client -connect localhost:30001`

  连接建立后（看到一堆证书信息和 --- 分隔线），输入 bandit15 的密码并按回车。

<!-- 这是一张图片，ocr 内容为：SESSION-ID-CTX: K: 293492ED698E584084805217E670ACIFI8312CB014E8014E286CB9A90024143170117Z7COA130A050A59F6FAA2305423 RESUMPTION PSK: 20B3 PSK IDENTITY:NONE PSK IDENTITY HINT:NONE SRP USERNAME: NONE TLS S S SESSION TICKET LIFETIME HINT: 300 (SECONDS) TLS SESSION TICKET: BSZ V.T.N 00 - 56 C8 74 C7 4E 15 76 27-F6 8A 4A D4 F1 9C D 0000 9P: FF 10 - C1 A5 F6 A3 67 C4 33 12-D4 8A 6D AF 16 42 0010 - DE 9B 20 12 FB B4 8F-E8 A6 6E 92 40 E5 8F 0020 0030 - B3 D4 97 DO A9 83 C0 8A-E7 BE DF E9 AA OB 79 8C .7.TFX\O..0..1 0040 - 9E ED 37 D1 BO 54 66 58-5C 6F 87 9E 30 9D 84 60 /..H...VT.-...T. 0050 - 2F B6 07 48 DF C5 91 B4-76 7B 8D 2D AF AC 54 OD 0060 - 3C 5F FO 17 E5 06 1F 56-8A 02 C6 6B 68 3A 45 5B 5B 5B 6B 6B 1F 56-8A 45 5B-8A 02 C6 6B 68 3A 5 0070 - A3 25 9E CC BD 29 97 DB-46 2C 01 41 DE 3E CA E9 %J..+..K..LY.H - 25 4A CF C4 2B OF ED 6B-87 OE 7C 59 E4 68 CA 48 0080 - 68 07 00 E0 93 2F 81 3F-62 D6 B4 3E AB FB B9 2C H.../.?B..>......................................./././.?.?B.?B.........././././............?B./../.? 0090 8C F6 72 22 70874D86E50E1FC9-E9-E9419980 P.M....... 00AO 7A 3D FA 17 92 20 A9 D1-58 BB D8 D8 98 AB 2B 2B 5C 00B0 9B 1B AC 53 F9 - OC BA D5 3F 1 43 17 F6-7F AA 7D  00CO DDO - 1F 03 92 C4 EO 39 B2 DD-53 7D 6B 03 CO 6C 8D 86 00DO START TIME: 1776862351 TIMEOUT VERIFY RETURN CODE: 18 (SELF-SIGNED CERTIFICATE) EXTENDED MASTER SECRET: NO MAX EARLY DATA: 0 READ R BLOCK 8XCJNMGOKBGLHHFAZ1GE5TMU4M2TKJQO CORRECT! KSKVUPMQ7LBYYCM4GBPVCVT1BFWRYODX CLOSED BANDIT15@BANDIT:~$ -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222236936.png)





  或者用管道直接发送：



  `echo "8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo" | openssl s_client -connect localhost:30001 -ign_eof`

  -ign_eof 参数防止连接过早关闭。

<!-- 这是一张图片，ocr 内容为：SESSION-ID: 01BCCD97C184286B28D13957A7ED63752484E7920FEB3BA63BAEDEDED29C1CDCA SESSION-ID-CTX: PSK:DCASDABDAZZOADLA35AOB888C424539833D313ICCOFFBOODS670AE1179028302830185550654EA6612328640028402466 RESUMPTION PSK: PSK IDENTITY: : NONE PSK IDENTITY HINT:NONE SRP USERNAME: NONE ET LIFETIME HINT: 300 (SECONDS) TLS SESSION TICKET LI TLS SESSION TICKET: 红0398 竖+008 V.T.N.V'... D6 0000-56 C8 74 C7 4E 15 76 27-F6 8A D4 E1 02 0010 - DC 12 B1 5F AB 07 D3 D4-FF CA CE 11 BE 62 ,D,Z,G...6.,B AO 0020 - 97 C8 44 0B 7A EC 3D 47-97 E9 25 83 6807 .CDZ5... 0030-94 14 14 43 64 7A 35 EB 9E-C8 7B C4 FA 6P A499 (. R)B5.. C8 C6 0040-2F8C3D C752296235-D7082C 4 1F CA A0 F9 53 0050 - C9 6C 1C 94 53 C3 D3-21 F2 C4 .L,S.S.S. 5361 0060 - A2 42 48 05 B1 33 EF D4-13 C8 F3 1D BB DO 53 SA BH.3.3. - E1 2E D8 0D 9A 99 DC FE-DO 02 FA BB 2C F6 64 FF 0070 D, 97 B6 BC FC FA 02 4E 24-57 EA B1 41 41 E5 AC 90 00 .N$W..A 0080 35 6B F5 7C 7A 98B5 ED-CC 69 68 C1 7C 83 7B BC 5K. .IH. 小 0090 - 90 04 94 F7 8A 26 B4 E7-6A 2F AF 85 F1 39 33 9:3 00A0 日. 5B B3 00B0. OBO - 50 CE A2 E2 9C 98 8C 1A-90 5C BE 30 C7 3A 5B L 82 CA E9 34 FA8 00C0 - C0 D2 66 B0 54 C7 15 60-D6 3F 2E CA E9 F LE LA FD 00DO - 90 01 CF 63 DD 3B OE B9-15 BD 9D OF 1E START TIME: 1776862403 TIMEOUT VERIFY RETURN CODE: 18 (SELF-SIGNED CERTIFICATE) EXTENDED MASTER SECRET: NO MAX EARLY DATA:O BLOCK READ CORRECT! KSKYUPMQ71BYYCM4GBPVCVT1BFWRYODX CLOSED BANDIT15@BANDIT:~$ -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222240580.png)













`kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx`











# <font style="color:rgb(0, 0, 0);">Bandit Level 16 → Level 17</font>
<!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION RULES WARGAMES WERE HACKERS, AND WE ARE GOOD LOCKING WE THE THE 1%. HELP!? DONATE! BANDITLEVEL16-LEVEL17 SSH INFORMATION PORT:2220 LEVEL GOAL DORIT LEVEL C LEVEL 0 LEVEL1 LEVEL1-LEVEL 2 HEPFULROTE GETTING DONE, RENEGOTING'OR'KEYUPDATE7UPDATE7 READ THE 'CONNECTED COMMANDS'SECTON THE MANP LEVEL 2-LEVEL 3 LEVEL 3 LEVEL 4 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL4LEVEL 5 LEVEL 5 LEVEL 6 SSH,TELNET,NC,NCAT,SOCAT,OPENSSL,S-CLIENT,NMAP,NETSTAT,SS LEVEL 6-LEVEL 7 HELPFUL READING MATERIAL LEVEL 7-LEVEL 8 LEVEL8-LEVEL9 LEVEL9LEVEL10 PORT SCANNER ON WIKIPEDIA LEVEL10-LEVEL 11 LEVEL11LEVEL12 LEVEL 12-LEVEL 13 LEVEL13LEVEL14 LEVEL14LEVEL15 LEVEL15LEVEL16 LEVEL16-LEVEL 17 LEVEL17LEVEL18 LEVEL18-LEVEL 19 LEVEL19LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23 LEVEL 24 LEVEL 24 LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222236926.png)  
 下一级的凭证可以通过将当前级别的密码发送到本地主机上 31000 到 32000 范围内的某个端口来获取。首先找出这些端口中有哪些在监听服务，然后判断哪些端口使用 SSL/TLS 加密，哪些没有。只有一个服务器会返回下一级的凭证，其他服务器只会将你发送的内容原样发回。

**有用的提示**：如果遇到 “DONE”、“RENEGOTIATING” 或 “KEYUPDATE” 信息，请阅读手册页中的 “CONNECTED COMMANDS” 部分。

**本关可能用到的命令**  
`ssh`, `telnet`, `nc`, `ncat`, `socat`, `openssl`, `s_client`, `nmap`, `netstat`, `ss`

**参考阅读材料**  

+ 维基百科：端口扫描器





这一关需要先扫描端口，找到监听的服务，然后测试哪个使用 SSL 并返回凭证。



  步骤1：扫描 31000-32000 端口范围

  nmap -p 31000-32000 localhost

  这会显示哪些端口是开放的。

<!-- 这是一张图片，ocr 内容为：-[ TOOLS ] FOR YOUR CONVENIENCE WE HAVE INSTALLED A FEW USEFUL TOOLS WHICH YOU CAN FIND IN THE FOLLOWING LOCATIONS: GEF (HTTPS://GITHUB.COM/HUGSY/GEF) IN /OPT/GEF/ PWNDBG (HTTPS://GITHUB.COM/PWNDBG/PWNDBG) IN /OPT/PWNDBG/ GDBINIT (HTTPS://GITHUB.COM/GDBINIT/GDBINIT) IN /OPT/GDBINIT/ PWNTOOLS (HTTPS://GITHUB.COM/GALLOPSLED/PWNTOOLS) RADARE2 (HTTP://WWW.RADARE.ORG/) MORE INFORMATION FOR MORE INFORMATION REGARDING INDIVIDUAL WARGAMES, VISIT HTTP://WWW.OVERTHEWIRE.ORG/WARGAMES/ FOR SUPPORT, QUESTIONS OR COMNENTS, CONTACT US ON DISCORD OR IRC. ENJOY YOUR STAY! BANDIT16@BANDIT:~$ STARTING NMAP 7.94SVN( HTTPS://NMAP.ORG) ORG ) AT 2026-04-22 12:55 UTC NMAP SCAN REPORT FOR LOCALHOST (127.0.1) HOST IS UP (0.00012S LATENCY). NOT SHOWN: 996 CLOSED TCP PORTS (CONN-REFUSED) PORT STATE SERVICE 31046/TCP OPEN UNKNOWN 31518/TCP OPEN UN KNOWN 31691/TCP OPEN UNKNOWN 31790/TCP OPEN UN KNOWN 31960/TCP OPEN UN KNOWN (1 HOST UP) SCANNED IN 06 SECONDS NMAP DONE: 1 IP ADDRESS BANDIT16@BANDIT:~$ -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222238636.png)

  步骤2：检测哪些端口使用 SSL

  nmap -sV -p 31000-32000 localhost

  -sV 参数会检测服务版本，能识别出 SSL 服务。

```bash
bandit16@bandit:~$   nmap -p 31000-32000 localhost
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-04-22 12:55 UTC
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).
Not shown: 996 closed tcp ports (conn-refused)
PORT      STATE SERVICE
31046/tcp open  unknown
31518/tcp open  unknown
31691/tcp open  unknown
31790/tcp open  unknown
31960/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 0.06 seconds
bandit16@bandit:~$   nmap -sV -p 31000-32000 localhost
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-04-22 12:55 UTC
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00013s latency).
Not shown: 996 closed tcp ports (conn-refused)
PORT      STATE SERVICE     VERSION
31046/tcp open  echo
31518/tcp open  ssl/echo
31691/tcp open  echo
31790/tcp open  ssl/unknown
31960/tcp open  echo
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port31790-TCP:V=7.94SVN%T=SSL%I=7%D=4/22%Time=69E8C556%P=x86_64-pc-linu
SF:x-gnu%r(GenericLines,32,"Wrong!\x20Please\x20enter\x20the\x20correct\x2
SF:0current\x20password\.\n")%r(GetRequest,32,"Wrong!\x20Please\x20enter\x
SF:20the\x20correct\x20current\x20password\.\n")%r(HTTPOptions,32,"Wrong!\
SF:x20Please\x20enter\x20the\x20correct\x20current\x20password\.\n")%r(RTS
SF:PRequest,32,"Wrong!\x20Please\x20enter\x20the\x20correct\x20current\x20
SF:password\.\n")%r(Help,32,"Wrong!\x20Please\x20enter\x20the\x20correct\x
SF:20current\x20password\.\n")%r(FourOhFourRequest,32,"Wrong!\x20Please\x2
SF:0enter\x20the\x20correct\x20current\x20password\.\n")%r(LPDString,32,"W
SF:rong!\x20Please\x20enter\x20the\x20correct\x20current\x20password\.\n")
SF:%r(SIPOptions,32,"Wrong!\x20Please\x20enter\x20the\x20correct\x20curren
SF:t\x20password\.\n");

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 142.71 seconds
bandit16@bandit:~$ 

```

- 31518 - ssl/echo (只是回显，不是我们要的)

- 31790 - ssl/unknown (这个返回 "Wrong! Please enter the correct current password"，说明它在验证密码！)

**31790 **端口就是目标



  步骤3：对每个 SSL 端口发送密码

  找到 SSL 端口后，用 openssl 连接并发送当前密码：

  echo "kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx" | openssl s_client -connect localhost:31790 -ign_eof -quiet



```bash
bandit16@bandit:~$   echo "kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx" | openssl s_client -connect localhost:31790 -ign_eof -quiet
Can't use SSL_get_servername
depth=0 CN = SnakeOil
verify error:num=18:self-signed certificate
verify return:1
depth=0 CN = SnakeOil
verify return:1
Correct!
-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAvmOkuifmMg6HL2YPIOjon6iWfbp7c3jx34YkYWqUH57SUdyJ
imZzeyGC0gtZPGujUSxiJSWI/oTqexh+cAMTSMlOJf7+BrJObArnxd9Y7YT2bRPQ
Ja6Lzb558YW3FZl87ORiO+rW4LCDCNd2lUvLE/GL2GWyuKN0K5iCd5TbtJzEkQTu
DSt2mcNn4rhAL+JFr56o4T6z8WWAW18BR6yGrMq7Q/kALHYW3OekePQAzL0VUYbW
JGTi65CxbCnzc/w4+mqQyvmzpWtMAzJTzAzQxNbkR2MBGySxDLrjg0LWN6sK7wNX
x0YVztz/zbIkPjfkU1jHS+9EbVNj+D1XFOJuaQIDAQABAoIBABagpxpM1aoLWfvD
KHcj10nqcoBc4oE11aFYQwik7xfW+24pRNuDE6SFthOar69jp5RlLwD1NhPx3iBl
J9nOM8OJ0VToum43UOS8YxF8WwhXriYGnc1sskbwpXOUDc9uX4+UESzH22P29ovd
d8WErY0gPxun8pbJLmxkAtWNhpMvfe0050vk9TL5wqbu9AlbssgTcCXkMQnPw9nC
YNN6DDP2lbcBrvgT9YCNL6C+ZKufD52yOQ9qOkwFTEQpjtF4uNtJom+asvlpmS8A
vLY9r60wYSvmZhNqBUrj7lyCtXMIu1kkd4w7F77k+DjHoAXyxcUp1DGL51sOmama
+TOWWgECgYEA8JtPxP0GRJ+IQkX262jM3dEIkza8ky5moIwUqYdsx0NxHgRRhORT
8c8hAuRBb2G82so8vUHk/fur85OEfc9TncnCY2crpoqsghifKLxrLgtT+qDpfZnx
SatLdt8GfQ85yA7hnWWJ2MxF3NaeSDm75Lsm+tBbAiyc9P2jGRNtMSkCgYEAypHd
HCctNi/FwjulhttFx/rHYKhLidZDFYeiE/v45bN4yFm8x7R/b0iE7KaszX+Exdvt
SghaTdcG0Knyw1bpJVyusavPzpaJMjdJ6tcFhVAbAjm7enCIvGCSx+X3l5SiWg0A
R57hJglezIiVjv3aGwHwvlZvtszK6zV6oXFAu0ECgYAbjo46T4hyP5tJi93V5HDi
Ttiek7xRVxUl+iU7rWkGAXFpMLFteQEsRr7PJ/lemmEY5eTDAFMLy9FL2m9oQWCg
R8VdwSk8r9FGLS+9aKcV5PI/WEKlwgXinB3OhYimtiG2Cg5JCqIZFHxD6MjEGOiu
L8ktHMPvodBwNsSBULpG0QKBgBAplTfC1HOnWiMGOU3KPwYWt0O6CdTkmJOmL8Ni
blh9elyZ9FsGxsgtRBXRsqXuz7wtsQAgLHxbdLq/ZJQ7YfzOKU4ZxEnabvXnvWkU
YOdjHdSOoKvDQNWu6ucyLRAWFuISeXw9a/9p7ftpxm0TSgyvmfLF2MIAEwyzRqaM
77pBAoGAMmjmIJdjp+Ez8duyn3ieo36yrttF5NSsJLAbxFpdlc1gvtGCWW+9Cq0b
dxviW8+TFVEBl1O4f7HVm6EpTscdDxU+bCXWkfjuRb7Dy9GOtt9JPsX8MBTakzh3
vBgsyi/sN3RqRBcGU40fOoZyfAMT8s1m/uYv52O6IgeuZ/ujbjY=
-----END RSA PRIVATE KEY-----

bandit16@bandit:~$ 

```





获得了 bandit17 的 RSA 私钥



创建临时目录并保存私钥

```bash
bandit16@bandit:~$ mkdir -p /tmp/mybandit17
bandit16@bandit:~$ cd /tmp/mybandit17
bandit16@bandit:/tmp/mybandit17$ cat > bandit17.key << 'EOF'
> -----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAvmOkuifmMg6HL2YPIOjon6iWfbp7c3jx34YkYWqUH57SUdyJ
imZzeyGC0gtZPGujUSxiJSWI/oTqexh+cAMTSMlOJf7+BrJObArnxd9Y7YT2bRPQ
Ja6Lzb558YW3FZl87ORiO+rW4LCDCNd2lUvLE/GL2GWyuKN0K5iCd5TbtJzEkQTu
DSt2mcNn4rhAL+JFr56o4T6z8WWAW18BR6yGrMq7Q/kALHYW3OekePQAzL0VUYbW
JGTi65CxbCnzc/w4+mqQyvmzpWtMAzJTzAzQxNbkR2MBGySxDLrjg0LWN6sK7wNX
x0YVztz/zbIkPjfkU1jHS+9EbVNj+D1XFOJuaQIDAQABAoIBABagpxpM1aoLWfvD
KHcj10nqcoBc4oE11aFYQwik7xfW+24pRNuDE6SFthOar69jp5RlLwD1NhPx3iBl
J9nOM8OJ0VToum43UOS8YxF8WwhXriYGnc1sskbwpXOUDc9uX4+UESzH22P29ovd
d8WErY0gPxun8pbJLmxkAtWNhpMvfe0050vk9TL5wqbu9AlbssgTcCXkMQnPw9nC
YNN6DDP2lbcBrvgT9YCNL6C+ZKufD52yOQ9qOkwFTEQpjtF4uNtJom+asvlpmS8A
vLY9r60wYSvmZhNqBUrj7lyCtXMIu1kkd4w7F77k+DjHoAXyxcUp1DGL51sOmama
+TOWWgECgYEA8JtPxP0GRJ+IQkX262jM3dEIkza8ky5moIwUqYdsx0NxHgRRhORT
8c8hAuRBb2G82so8vUHk/fur85OEfc9TncnCY2crpoqsghifKLxrLgtT+qDpfZnx
SatLdt8GfQ85yA7hnWWJ2MxF3NaeSDm75Lsm+tBbAiyc9P2jGRNtMSkCgYEAypHd
HCctNi/FwjulhttFx/rHYKhLidZDFYeiE/v45bN4yFm8x7R/b0iE7KaszX+Exdvt
SghaTdcG0Knyw1bpJVyusavPzpaJMjdJ6tcFhVAbAjm7enCIvGCSx+X3l5SiWg0A
R57hJglezIiVjv3aGwHwvlZvtszK6zV6oXFAu0ECgYAbjo46T4hyP5tJi93V5HDi
Ttiek7xRVxUl+iU7rWkGAXFpMLFteQEsRr7PJ/lemmEY5eTDAFMLy9FL2m9oQWCg
R8VdwSk8r9FGLS+9aKcV5PI/WEKlwgXinB3OhYimtiG2Cg5JCqIZFHxD6MjEGOiu
L8ktHMPvodBwNsSBULpG0QKBgBAplTfC1HOnWiMGOU3KPwYWt0O6CdTkmJOmL8Ni
blh9elyZ9FsGxsgtRBXRsqXuz7wtsQAgLHxbdLq/ZJQ7YfzOKU4ZxEnabvXnvWkU
YOdjHdSOoKvDQNWu6ucyLRAWFuISeXw9a/9p7ftpxm0TSgyvmfLF2MIAEwyzRqaM
77pBAoGAMmjmIJdjp+Ez8duyn3ieo36yrttF5NSsJLAbxFpdlc1gvtGCWW+9Cq0b
dxviW8+TFVEBl1O4f7HVm6EpTscdDxU+bCXWkfjuRb7Dy9GOtt9JPsX8MBTakzh3
vBgsyi/sN3RqRBcGU40fOoZyfAMT8s1m/uYv52O6IgeuZ/ujbjY=
-----END RSA PRIVATE KEY-----
> EOF
bandit16@bandit:/tmp/mybandit17$ chmod 600 bandit17.key
bandit16@bandit:/tmp/mybandit17$ 

```



然后在本地 PowerShell 中，先把私钥复制到本地，再登录 bandit17

`scp -P 2220 bandit16@bandit.labs.overthewire.org:/tmp/mybandit17/bandit17.key ./bandit17.key`

`icacls bandit17.key /inheritance:r`

`icacls bandit17.key /grant:r "$($env:USERNAME):R"`

`ssh -i bandit17.key bandit17@bandit.labs.overthewire.org -p 2220`

```bash
PS C:\Users\Xvsf\Downloads\111> scp -P 2220 bandit16@bandit.labs.overthewire.org:/tmp/mybandit17/bandit17.key ./bandit17.key
                         _                     _ _ _
                        | |__   __ _ _ __   __| (_) |_
                        | '_ \ / _` | '_ \ / _` | | __|
                        | |_) | (_| | | | | (_| | | |_
                        |_.__/ \__,_|_| |_|\__,_|_|\__|


                      This is an OverTheWire game server.
            More information on http://www.overthewire.org/wargames

backend: gibson-0
bandit16@bandit.labs.overthewire.org's password:
bandit17.key                                          100% 1675     2.3KB/s   00:00
PS C:\Users\Xvsf\Downloads\111> icacls bandit17.key /inheritance:r
已处理的文件: bandit17.key
已成功处理 1 个文件; 处理 0 个文件时失败
PS C:\Users\Xvsf\Downloads\111> icacls bandit17.key /grant:r "$($env:USERNAME):R"
已处理的文件: bandit17.key
已成功处理 1 个文件; 处理 0 个文件时失败
PS C:\Users\Xvsf\Downloads\111> ssh -i bandit17.key bandit17@bandit.labs.overthewire.org -p 2220
                         _                     _ _ _
                        | |__   __ _ _ __   __| (_) |_
                        | '_ \ / _` | '_ \ / _` | | __|
                        | |_) | (_| | | | | (_| | | |_
                        |_.__/ \__,_|_| |_|\__,_|_|\__|


                      This is an OverTheWire game server.
            More information on http://www.overthewire.org/wargames

backend: gibson-0

      ,----..            ,----,          .---.
     /   /   \         ,/   .`|         /. ./|
    /   .     :      ,`   .'  :     .--'.  ' ;
   .   /   ;.  \   ;    ;     /    /__./ \ : |
  .   ;   /  ` ; .'___,/    ,' .--'.  '   \' .
  ;   |  ; \ ; | |    :     | /___/ \ |    ' '
  |   :  | ; | ' ;    |.';  ; ;   \  \;      :
  .   |  ' ' ' : `----'  |  |  \   ;  `      |
  '   ;  \; /  |     '   :  ;   .   \    .\  ;
   \   \  ',  /      |   |  '    \   \   ' \ |
    ;   :    /       '   :  |     :   '  |--"
     \   \ .'        ;   |.'       \   \ ;
  www. `---` ver     '---' he       '---" ire.org


Welcome to OverTheWire!

If you find any problems, please report them to the #wargames channel on
discord or IRC.

--[ Playing the games ]--

  This machine might hold several wargames.
  If you are playing "somegame", then:

    * USERNAMES are somegame0, somegame1, ...
    * Most LEVELS are stored in /somegame/.
    * PASSWORDS for each level are stored in /etc/somegame_pass/.

  Write-access to homedirectories is disabled. It is advised to create a
  working directory with a hard-to-guess name in /tmp/.  You can use the
  command "mktemp -d" in order to generate a random and hard to guess
  directory in /tmp/.  Read-access to both /tmp/ is disabled and to /proc
  restricted so that users cannot snoop on eachother. Files and directories
  with easily guessable or short names will be periodically deleted! The /tmp
  directory is regularly wiped.
  Please play nice:

    * don't leave orphan processes running
    * don't leave exploit-files laying around
    * don't annoy other players
    * don't post passwords or spoilers
    * again, DONT POST SPOILERS!
      This includes writeups of your solution on your blog or website!

--[ Tips ]--

  This machine has a 64bit processor and many security-features enabled
  by default, although ASLR has been switched off.  The following
  compiler flags might be interesting:

    -m32                    compile for 32bit
    -fno-stack-protector    disable ProPolice
    -Wl,-z,norelro          disable relro

  In addition, the execstack tool can be used to flag the stack as
  executable on ELF binaries.

  Finally, network-access is limited for most levels by a local
  firewall.

--[ Tools ]--

 For your convenience we have installed a few useful tools which you can find
 in the following locations:

    * gef (https://github.com/hugsy/gef) in /opt/gef/
    * pwndbg (https://github.com/pwndbg/pwndbg) in /opt/pwndbg/
    * gdbinit (https://github.com/gdbinit/Gdbinit) in /opt/gdbinit/
    * pwntools (https://github.com/Gallopsled/pwntools)
    * radare2 (http://www.radare.org/)

--[ More information ]--

  For more information regarding individual wargames, visit
  http://www.overthewire.org/wargames/

  For support, questions or comments, contact us on discord or IRC.

  Enjoy your stay!

bandit17@bandit:~$
```







# <font style="color:rgb(0, 0, 0);">Bandit Level 17 → Level 18</font>

 

<!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION RULES WARGAMES WERE HACKERS, AND WE ARE GOOD LOCKING WIE THE THE 1%. HELP!? DONATE! BANDIT LEVEL17 LEVEL 18 SSH INFORMATION HOST:BANDIT.LABS.OVERTHEWIRE.ORG PORT:2220 LEVEL GOAL DOTICH LEVEL C LEVEL 0 LEVEL1 PASSWORDS.NEW LEVEL1-LEVEL2 NOTE:FFYOUTHAVE SAVED THIS LEVEL AND SEE BYEBYER WHEN TIS ING TO LOG INTO BANDIT8,THIS IS THE NEXEL B LEVEL 2-LEVEL 3 LEVEL 3 LEVEL4 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL4LEVEL 5 LEVEL5LEVEL6 CAT,GREP,LS,DIFF LEVEL 6 LEVEL 7 LEVEL 7-LEVEL 8 LEVEL8-LEVEL9 LEVEL9LEVEL10 LEVEL10-LEVEL 11 LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL 13-LEVEL 14 LEVEL14LEVEL15 LEVEL15LEVEL16 LEVEL 16VEL 17 LEVEL 17-LEVEL 18 LEVEL 18 LEVEL 19 LEVEL 19-LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24 LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222239572.png)



**关卡目标**  
主目录中有两个文件：`passwords.old` 和 `passwords.new`。下一级的密码保存在 `passwords.new` 中，并且是 `passwords.old` 和 `passwords.new` 之间唯一被修改过的那一行。

注意：如果你已解出这一关，并在尝试登录 bandit18 时看到 “Byebye!”，这与下一关（bandit19）有关。

**本关可能用到的命令**  
`cat`, `grep`, `ls`, `diff`





```bash
bandit17@bandit:~$ ls
passwords.new  passwords.old
bandit17@bandit:~$  diff passwords.old passwords.new
42c42
< 390zFj2NETFVZkqYw8UEFdN6h40oGVtT
---
> x2gLTTjFwMOhQ8oWNbMN362QKxfRqGlO
bandit17@bandit:~$
```



`x2gLTTjFwMOhQ8oWNbMN362QKxfRqGlO`



<!-- 这是一张图片，ocr 内容为：IN ADDITION, THE EXECSTACK TOOL CAN BE USED TO FLAG THE STACK AS EXECUTABLE ON ELF BINARIES, FINALLY, NETWORK-ACCESS IS LIMITED FOR MOST LEVELS BY A LOCAL FIREWALL. - [ TOOLS ]- FOR YOUR CONVENIENCE WE HAVE INSTALLED A FEW USEFUL TOOLS WHICH YOU CAN FIND IN THE FOLLOWING LOCATIONS: GEF (HTTPS://GITHUB.COM/HUGSY/GEF) IN /OPT/GEF/ PWNDBG (HTTPS://GITHUB.COM/PWNDBG/PWNDBG) IN /OPT/PWNDBG/ GABINIT (HTTPS://GITHUB.COM/GABINIT/GDBINIT) IN /OPT/GDBINIT/ PWNTOOLS (HTTPS://GITHUB.COM/GALLOPSLED/PWNTOOLS) RADARE2 (HTTP://WWW.RADARE.ORG/) MORE INFORMATION FOR MORE INFORMATION REGARDING INDIVIDUAL WARGAMES, VISIT HTTP://WWW.OVERTHEWIRE.ORG/WARGAMES/ FOR SUPPORT, QUESTIONS OR COMMENTS, CONTACT US ON DISCORD OR IRC, ENJOY YOUR STAY! BYEBYE! CONNECTION CLOSED, DISCONNECTED FROM REMOTE HOST(BANDIT18) AT 21:12:24. HELP' TO LEARN HOW TO USE XSHELL PROMPT. TYPE [C:\~]$ -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222237854.png)









# <font style="color:rgb(0, 0, 0);">Bandit Level 18 → Level 19</font>

 <!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDITLEVEL18 LEVEL 19 SSH INFORMATION HOST:BANDIT.LABS.OVERTHEWIRE.ORG PORT:2220 LEVEL GOAL DORICH LEVEL C LEVEL 0 LEVEL 1 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL1-LEVEL 2 LEVEL 2-LEVEL 3 SSH,IS,CAT LEVEL 3 LEVEL 4 LEVEL 4-LEVEL 5 LEVEL 5 LEVEL 6 LEVEL 6 LEVEL 7 LEVEL7-LEVEL8 LEVEL8LEVEL9 LEVEL9LEVEL10 LEVEL10LEVEL11 LEVEL111-LEVEL12 LEVEL 12-LEVEL 13 LEVEL13-LEVEL14 LEVEL14-LEVEL15 LEVEL 15 LEVEL16 LEVEL 16VEL 17 LEVEL 17-LEVEL 18 LEVEL 18-LEVEL 19 LEVEL 19LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24 LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222239228.png)



**关卡目标**  
下一级的密码存储在主目录下的 `readme` 文件中。不幸的是，有人修改了 `.bashrc`，导致你在使用 SSH 登录时会被直接登出。

**本关可能用到的命令**  
`ssh`, `ls`, `cat`







SSH 登录时直接执行命令

`ssh bandit18@bandit.labs.overthewire.org -p 2220 cat readme`



<!-- 这是一张图片，ocr 内容为：PS C:\USERS\XVSF> SSH BANDITI8QBANDIT.LABS.OVERTHEWIRE.ORG -P 2220 CAT README GNALIE THIS IS AN OVERTHEWIRE GAME SERVER. MORE INFORMATION ON HTTP://WWW.OVERTHEWIRE.ORG/WARGAMES BACKEND:GIBSON-0 BANDIT18@BANDIT.LABS.OVERTHEWIRE.ORG'S PASSWORD: CGWPMAKXVWDUNGPAVJBWYUGHVN9ZL3J8 PS C:\USERS\XVSF> -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222238723.png)





`cGWpMaKXVwDUNgPAVJbWYuGHVn9zl3j8`





# <font style="color:rgb(0, 0, 0);">Bandit Level 19 → Level 20</font>

 <!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDITLEVEL19-LEVEL 20 SSH INFORMATION HOST:BANDIT.LABS.OVERTHEWIRE.ORG PORT:2220 LEVEL GOAL DORICH LEVEL C (LETC/BANDIT-PASS),AFTER YOU HAVE USED THE SETUID BINARY. LEVEL 0 LEVEL1 LEVEL1-LEVEL 2 HELPFULREADINGMATERIAL LEVEL 2-LEVEL 3 LEVEL 3 LEVEL 4 SETUID ON WIKIPEDIA LEVEL4LEVEL 5 LEVEL 5-LEVEL 6 LEVEL 6 LEVEL 7 LEVEL7LEVEL8 LEVEL8-LEVEL9 LEVEL9LEVEL 10 LEVEL10LEVEL11 LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13LEVEL14 LEVEL14-LEVEL15 LEVEL 15LEVEL 16 LEVEL 16VEL 17 LEVEL 17-LEVEL 18 LEVEL 18LEVEL 19 LEVEL 19-LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23 LEVEL 24 LEVEL 24 LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222236456.png)



关卡目标  
要进入下一级，你需要使用主目录中的 setuid 二进制文件。不带参数执行它以了解如何使用。在你使用该 setuid 二进制文件之后，本级密码可以在通常的位置（/etc/bandit_pass）找到。

**参考阅读材料**  
维基百科：setuid



setuid 程序会以文件所有者的权限运行，通常可以用它来执行需要更高权限的命令。看到用法后，用它来读取密码文件：

 `./bandit20-do cat /etc/bandit_pass/bandit20`



```bash
bandit19@bandit:~$ ls -la
total 36
drwxr-xr-x   2 root     root      4096 Apr  3 15:17 .
drwxr-xr-x 150 root     root      4096 Apr  3 15:20 ..
-rwsr-x---   1 bandit20 bandit19 14888 Apr  3 15:17 bandit20-do
-rw-r--r--   1 root     root       220 Mar 31  2024 .bash_logout
-rw-r--r--   1 root     root      3851 Apr  3 15:10 .bashrc
-rw-r--r--   1 root     root       807 Mar 31  2024 .profile
bandit19@bandit:~$ ./bandit20-do
Run a command as another user.
  Example: ./bandit20-do whoami
bandit19@bandit:~$  ./bandit20-do cat /etc/bandit_pass/bandit20
0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO
bandit19@bandit:~$ ^C
bandit19@bandit:~$ 

```

`0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO`



# <font style="color:rgb(0, 0, 0);">Bandit Level 20 → Level 21</font>

 

<!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDITLEVEL 20 > LEVEL 21 SSH INFORMATION HOST:BANDIT.LABS.OVERTHEWIRE.ORG PORT:2220 LEVEL GOAL DORICH LEVEL C LEVEL 0 LEVEL1 LEVEL1-LEVEL 2 NOTE:TRY CONNECTING TO YOUR OWN NETWORK DAEMON TO SEE IF IT WORKS YOU THINK LEVEL 2-LEVEL 3 LEVEL 3-LEVEL4 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL4LEVEL 5 LEVEL 5-LEVEL 6 SSH,NC,CAT,BASH,SCREEN,TMUX,UNIX JOB CONTROL (BG,FG,JOBS,&,CTRL-Z.................................... LEVEL 6 LEVEL 7 LEVEL 7 LEVEL 8 LEVEL8-LEVEL9 LEVEL9LEVEL10 LEVEL10-LEVEL 11 LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13-LEVEL14 LEVEL14-LEVEL 15 LEVEL 15 LEVEL 16 LEVEL 16VEL 17 LEVEL 17-LEVEL 18 LEVEL 18 LEVEL 19 LEVEL 19LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24-LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222237977.png)



关卡目标  
主目录中有一个 setuid 二进制文件，它的功能是：根据你在命令行参数中指定的端口，连接到本地主机的该端口。然后，它会从连接中读取一行文本，并将其与上一级（bandit20）的密码进行比较。如果密码正确，它就会传送下一级（bandit21）的密码。

注意：尝试连接到你自己的网络守护进程，看看它是否按你预期的方式工作。

**本关可能用到的命令**  
`ssh`, `nc`, `cat`, `bash`, `screen`, `tmux`, Unix 作业控制（`bg`, `fg`, `jobs`, `&`, `CTRL-Z` 等）







在后台启动一个监听服务器，发送 bandit20 的密码

 `echo "0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO" | nc -l -p 12345 &`



使用 setuid 程序连接到这个端口

`./suconnect 12345`

```bash
bandit20@bandit:~$ ls -la
total 36
drwxr-xr-x   2 root     root      4096 Apr  3 15:17 .
drwxr-xr-x 150 root     root      4096 Apr  3 15:20 ..
-rw-r--r--   1 root     root       220 Mar 31  2024 .bash_logout
-rw-r--r--   1 root     root      3851 Apr  3 15:10 .bashrc
-rw-r--r--   1 root     root       807 Mar 31  2024 .profile
-rwsr-x---   1 bandit21 bandit20 15612 Apr  3 15:17 suconnect
bandit20@bandit:~$ echo "0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO" | nc -l -p 12345 &
[1] 19
bandit20@bandit:~$ ./suconnect 12345
Read: 0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO
Password matches, sending next password
EeoULMCra2q0dSkYj561DX7s1CpBuOBt
[1]+  Done                    echo "0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO" | nc -l -p 12345
bandit20@bandit:~$
```





`EeoULMCra2q0dSkYj561DX7s1CpBuOBt`







# <font style="color:rgb(0, 0, 0);">Bandit Level 21 → Level 22</font>
<!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDIT LEVEL 21 22 SSH INFORMATION HOST:BANDIT.LABS.OVERTHEWIRE.ORG PORT:2220 LEVEL GOAL DORICH LEVEL 0 LEVEL 0 LEVEL 1 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL1-LEVEL2 LEVEL 2-LEVEL 3 CRON,CRONTAB,CRONTAB(5)(USE"MAN 5 CRONTAB" TO ACCESS THIS) LEVEL 3 LEVEL 4 LEVEL4LEVEL 5 LEVEL 5 LEVEL 6 LEVEL 6 LEVEL 7 LEVEL7 LEVEL8 LEVEL8LEVEL9 LEVEL9LEVEL10 LEVEL10LEVEL11 LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13-LEVEL14 LEVEL14LEVEL 15 LEVEL15LEVEL16 LEVEL 16VEL 17 LEVEL17LEVEL 18 LEVEL 18LEVEL 19 LEVEL 19-LEVEL 20 LEVEL 20LEVEL 21 LEVEL 21-LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23-LEVEL 24 LEVEL 24 LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222234732.png)  
 关卡目标  
有一个程序会通过基于时间的任务调度器 cron 定期自动运行。请查看 `/etc/cron.d/` 目录下的配置，找出正在执行的命令。

**本关可能用到的命令**  
`cron`, `crontab`, `crontab(5)`（使用 `man 5 crontab` 查看）





现在进入 bandit21，查看 cron 配置： 

  ls -la /etc/cron.d/



  查看所有 cron 任务文件，找到与 bandit22 相关的：

  cat /etc/cron.d/cronjob_bandit22



  这会显示定时任务的配置，包括执行的脚本路径。然后查看脚本内容：

  cat /usr/bin/cronjob_bandit22.sh



```bash
bandit21@bandit:~$  ls -la /etc/cron.d/
total 60
drwxr-xr-x   2 root root  4096 Apr  3 15:21 .
drwxr-xr-x 128 root root 12288 Apr  5 12:34 ..
-r--r-----   1 root root    47 Apr  3 15:18 behemoth4_cleanup
-rw-r--r--   1 root root   123 Apr  3 15:10 clean_tmp
-rw-r--r--   1 root root   120 Apr  3 15:17 cronjob_bandit22
-rw-r--r--   1 root root   122 Apr  3 15:17 cronjob_bandit23
-rw-r--r--   1 root root   120 Apr  3 15:17 cronjob_bandit24
-rw-r--r--   1 root root   201 Apr  8  2024 e2scrub_all
-r--r-----   1 root root    48 Apr  3 15:19 leviathan5_cleanup
-rw-------   1 root root   138 Apr  3 15:19 manpage3_resetpw_job
-rwx------   1 root root    52 Apr  3 15:21 otw-tmp-dir
-rw-r--r--   1 root root   102 Mar 31  2024 .placeholder
-rw-r--r--   1 root root   396 Jan  9  2024 sysstat
bandit21@bandit:~$ cat /etc/cron.d/cronjob_bandit22
@reboot bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null
* * * * * bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null
bandit21@bandit:~$ cat /usr/bin/cronjob_bandit22.sh
#!/bin/bash
chmod 644 /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
cat /etc/bandit_pass/bandit22 > /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
bandit21@bandit:~$ cat /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
tRae0UfB9v0UzbCdn9cY0gQnds9GF58Q
bandit21@bandit:~$ 


```





`tRae0UfB9v0UzbCdn9cY0gQnds9GF58Q`



# <font style="color:rgb(0, 0, 0);">Bandit Level 22 → Level 23</font>
<!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDIT LEVEL 22-LEVEL 23 SSH INFORMATION HOST:BANDIT.LABS.OVERTHEWIRE.ORG PORT:2220 LEVEL GOAL DOTICH LEVEL C LEVEL 0 LEVEL1 LEVEL1-LEVEL 2 IT TO SEE THE DEBUG INFORMATION IT PRINTS. LEVEL 2-LEVEL 3 LEVEL 3-LEVEL4 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL4LEVEL 5 LEVEL5LEVEL6 CRON,CRONTAB,CRONTAB(5)(USE 'MAN 5 CRONTAB" TO ACCESS THIS) LEVEL 6 LEVEL 7 LEVEL 7-LEVEL 8 LEVEL8-LEVEL9 LEVEL9LEVEL10 LEVEL10-LEVEL11 LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13-LEVEL14 LEVEL14-LEVEL 15 LEVEL15LEVEL 16 LEVEL 16VEL 17 LEVEL17-LEVEL 18 LEVEL18LEVEL 19 LEVEL 19LEVEL 20 LEVEL 20LEVEL 21 LEVEL 21LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23 LEVEL 24 LEVEL 24-,LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222238637.png)  
 关卡目标  
有一个程序会通过基于时间的任务调度器 cron 定期自动运行。请查看 `/etc/cron.d/` 目录下的配置，找出正在执行的命令。

**注意**：查看他人编写的 shell 脚本是一项非常有用的技能。本关的脚本故意写得易于阅读。如果你在理解它的功能时遇到困难，可以尝试执行它，查看它打印出的调试信息。

**本关可能用到的命令**  
`cron`, `crontab`, `crontab(5)`（使用 `man 5 crontab` 查看）



查看 bandit23 的 cron 任务：



  cat /etc/cron.d/cronjob_bandit23



  然后查看脚本内容：



  cat /usr/bin/cronjob_bandit23.sh



```bash
bandit22@bandit:~$  cat /etc/cron.d/cronjob_bandit23
@reboot bandit23 /usr/bin/cronjob_bandit23.sh  &> /dev/null
* * * * * bandit23 /usr/bin/cronjob_bandit23.sh  &> /dev/null
bandit22@bandit:~$ cat /usr/bin/cronjob_bandit23.sh
#!/bin/bash

myname=$(whoami)
mytarget=$(echo I am user $myname | md5sum | cut -d ' ' -f 1)

echo "Copying passwordfile /etc/bandit_pass/$myname to /tmp/$mytarget"

cat /etc/bandit_pass/$myname > /tmp/$mytarget
bandit22@bandit:~$ 

```





这个脚本的逻辑是：

  1. 获取当前用户名（运行时是 bandit23）

  2. 用 "I am user bandit23" 生成 MD5 哈希作为文件名

  3. 把密码复制到 /tmp/[MD5哈希]



需要计算出 bandit23 的哈希值：



  echo I am user bandit23 | md5sum | cut -d ' ' -f 1

输出一个 MD5 哈希值，然后读取对应的文件

```bash
bandit22@bandit:~$   echo I am user bandit23 | md5sum | cut -d ' ' -f 1
8ca319486bfbbc3663ea0fbe81326349
bandit22@bandit:~$ cat /tmp/8ca319486bfbbc3663ea0fbe81326349
0Zf11ioIjMVN551jX3CmStKLYqjk54Ga
bandit22@bandit:~$  cat /tmp/$(echo I am user bandit23 | md5sum | cut -d ' ' -f 1)
0Zf11ioIjMVN551jX3CmStKLYqjk54Ga
bandit22@bandit:~$ 

```





`0Zf11ioIjMVN551jX3CmStKLYqjk54Ga`





# <font style="color:rgb(0, 0, 0);">Bandit Level 23 → Level 24</font>

 

<!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDITLEVEL 23 LEVEL 24 SSH INFORMATION HOST:BANDIT.LABS.OVERTHEWIRE.ORG PORT:2220 LEVEL GOAL DORIT LEVEL C LEVEL 0 LEVEL1 LEVEL1-LEVEL 2 LEVEL 2-LEVEL 3 NOTE 2: KEEP IN MIND THAT YOUR SHELL SCIIPT IS REMOVED ONCE EXECUTED,SO YOU MAY WANT TO KEEP AROUND. LEVEL 3 LEVEL 4 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL4-LEVEL 5 LEVEL 5-LEVEL 6 CHMOD,CRON,CRONTAB,CRONTAB(5)(USE"MAN 5 CRONTAB- TO ACCESS THIS) LEVEL 6 LEVEL7 LEVEL 7-LEVEL 8 LEVEL8LEVEL9 LEVEL9LEVEL 10 LEVEL10-LEVEL11 LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13LEVEL14 LEVEL14-LEVEL 15 LEVEL15LEVEL16 LEVEL 16VEL 17 LEVEL17LEVEL 18 LEVEL18LEVEL 19 LEVEL 19-LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21-LEVEL 22 LEVEL 22LEVEL 23 LEVEL 23-LEVEL 24 LEVEL 24-LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222238790.png)



关卡目标  
有一个程序会通过基于时间的任务调度器 cron 定期自动运行。请查看 `/etc/cron.d/` 目录下的配置，找出正在执行的命令。

**注意**：这一关需要你创建自己的第一个 shell 脚本。这是一个非常重要的步骤，当你攻克这一关时，你应该为自己感到自豪！

**注意 2**：请记住，你的 shell 脚本在执行后会被删除，因此你可能需要保留一份副本…

**本关可能用到的命令**  
`chmod`, `cron`, `crontab`, `crontab(5)`（使用 `man 5 crontab` 查看）

















先查看 bandit24 的 cron 配置：



  cat /etc/cron.d/cronjob_bandit24

```bash
bandit23@bandit:~$ cat /etc/cron.d/cronjob_bandit24
@reboot bandit24 /usr/bin/cronjob_bandit24.sh &> /dev/null
* * * * * bandit24 /usr/bin/cronjob_bandit24.sh &> /dev/null
bandit23@bandit:~$ cat /usr/bin/cronjob_bandit24.sh
#!/bin/bash

shopt -s nullglob

myname=$(whoami)

cd /var/spool/"$myname"/foo || exit 
echo "Executing and deleting all scripts in /var/spool/$myname/foo:"
for i in * .*;
do
    if [ "$i" != "." ] && [ "$i" != ".." ];
    then
        echo "Handling $i"
        owner="$(stat --format "%U" "./$i")"
        if [ "${owner}" = "bandit23" ] && [ -f "$i" ]; then
            timeout -s 9 60 "./$i"
        fi
        rm -rf "./$i"
    fi
donebandit23@bandit:~$ 

```



脚本会：



  1. 进入 /var/spool/bandit24/foo/ 目录

  2. 执行所有属于 bandit23 的脚本（以 bandit24 身份运行）

  3. 执行后删除脚本



关键步骤：

1. 分析 cron 任务

  cat /etc/cron.d/cronjob_bandit24

  cat /usr/bin/cronjob_bandit24.sh

  1. 发现脚本会以 bandit24 身份执行 /var/spool/bandit24/foo/ 目录下所有属于 bandit23

  的脚本，然后删除。

  2. 创建可写的临时目录

  mktemp -d  # 创建随机临时目录

  cd /tmp/tmp.XXXXXXXX

  touch password

  chmod 666 password

  chmod 777 /tmp/tmp.XXXXXXXX  # 关键：让 bandit24 能访问

  3. 创建脚本读取密码

  cat > /var/spool/bandit24/foo/getpass.sh << 'EOF'

  #!/bin/bash

  cat /etc/bandit_pass/bandit24 > /tmp/tmp.XXXXXX/password

  EOF

  chmod 755 /var/spool/bandit24/foo/getpass.sh

  4. 等待 cron 执行并读取密码

  sleep 65  # 等待下一分钟的 cron 执行

  cat password





临时目录权限必须是 777，否则 bandit24 无法写入文件。



```bash
bandit23@bandit:~$ mktemp -d
/tmp/tmp.tzTi545tIa
bandit23@bandit:~$ cd /tmp/tmp.tzTi545tIa
bandit23@bandit:/tmp/tmp.tzTi545tIa$ touch password
bandit23@bandit:/tmp/tmp.tzTi545tIa$  chmod 666 password
bandit23@bandit:/tmp/tmp.tzTi545tIa$ ls
password
bandit23@bandit:/tmp/tmp.tzTi545tIa$ cat > /var/spool/bandit24/foo/getpass.sh << 'EOF'
#!/bin/bash
  cat /etc/bandit_pass/bandit24 > /tmp/tmp.tzTi545tIa/password
> EOF
bandit23@bandit:/tmp/tmp.tzTi545tIa$ chmod 755 /var/spool/bandit24/foo/getpass.sh
bandit23@bandit:/tmp/tmp.tzTi545tIa$ sleep 65
bandit23@bandit:/tmp/tmp.tzTi545tIa$ cat password
gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8
bandit23@bandit:/tmp/tmp.tzTi545tIa$ 

```



`gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8`





# <font style="color:rgb(0, 0, 0);">Bandit Level 24 → Level 25</font>


<!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDITLEVEL 24 2 LEVEL 25 SSH INFORMATION HOST:BANDIT.LABS.OVERTHEWIRE.ORG PORT:2220 LEVEL GOAL BORICH LEVEL C LEVEL 0 LEVEL1 BY GOING THROUGH ALL OF THE 1000 COMBINATIONS,CALLED BRUTE-TORCING. YOU DO NOT NEED TO CREATE NEW CONNECTIONS EACH TIME LEVEL1-LEVEL 2 LEVEL 2-LEVEL 3 LEVEL 3-LEVEL4 LEVEL4-LEVEL 5 LEVEL 5 LEVEL 6 LEVEL 6 LEVEL 7 LEVEL7LEVEL8 LEVEL8LEVEL9 LEVEL9LEVEL10 LEVEL10LEVEL11 LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13LEVEL14 LEVEL14-LEVEL 15 LEVEL15LEVEL 16 LEVEL 16VEL 17 LEVEL17-LEVEL 18 LEVEL 18VEL 19 LEVEL 19-LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21-LEVEL 22 LEVEL 22LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24-LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222237360.png)



关卡目标  

有一个守护进程监听在 30002 端口。如果你提供 bandit24 的密码以及一个 4 位数字的秘密 PIN 码，它会返回 bandit25 的密码。除了尝试全部 10000 种组合（即暴力破解）之外，没有办法获取这个 PIN 码。  

你不需要每次重新建立连接。





 暴力破解 4 位 PIN 码（000-9999）获取密码



```bash
bandit24@bandit:/tmp/tmp.srCA4y125V$ for i in {0000..9999}; do
> echo "gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8 $i"
> 
> done > combinations.txt
bandit24@bandit:/tmp/tmp.srCA4y125V$ cat combinations.txt | nc localhost 3002 > result.txt
bandit24@bandit:/tmp/tmp.srCA4y125V$ grep -v "Wrong" result.txt
bandit24@bandit:/tmp/tmp.srCA4y125V$ cat result.txt 
bandit24@bandit:/tmp/tmp.srCA4y125V$ cat combinations.txt | nc localhost 30002 | grep -v "Wrong"
I am the pincode checker for user bandit25. Please enter the password for user bandit24 and the secret pincode on a single line, separated by a space.
Correct!
The password of user bandit25 is iCi86ttT4KSNe1armKiwbQNmB3YJP3q4

bandit24@bandit:/tmp/tmp.srCA4y125V$ 

```

`iCi86ttT4KSNe1armKiwbQNmB3YJP3q4`





# <font style="color:rgb(0, 0, 0);">Bandit Level 25 → Level 26</font>

 <!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDITLEVEL 25-LEVEL 26 SSH INFORMATION HOST:BANDIT.LABS.OVERTHEWIRE.ORG PORT:2220 LEVEL GOAL DONCTY LEVEL 0 LEVEL 0 LEVEL1 LEVEL1-LEVEL 2 PROMPT INSTEAD LEVEL 2 LEVEL 3 LEVEL 3-LEVEL4 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL4-LEVEL 5 LEVEL 5 LEVEL 6 SSH,CAT,MORE,VI,LS,ID,PWD LEVEL 6 LEVEL 7 LEVEL 7-LEVEL8 LEVEL8-LEVEL9 LEVEL9LEVEL 10 LEVEL10-LEVEL 11 LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13-LEVEL14 LEVEL14-LEVEL 15 LEVEL15LEVEL 16 LEVEL 16VEL 17 LEVEL17-LEVEL 18 LEVEL 18VEL 19 LEVEL 19LEVEL 20 LEVEL 20LEVEL 21 LEVEL 21LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24-LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222236804.png)



关卡目标  
从 bandit25 登录到 bandit26 应该相当简单……用户 bandit26 所使用的 shell 不是 `/bin/bash`，而是其他东西。找出它是什么、如何工作，以及如何从中脱离。

**注意**：如果你使用的是 Windows 系统，并且通常用 Powershell 通过 ssh 登录 bandit，请注意 Powershell 已知会导致本关预期解决方案出现问题。你应该改用命令提示符。

**本关可能用到的命令**  
`ssh`, `cat`, `more`, `vi`, `ls`, `id`, `pwd`





先查看 bandit26 使用什么 shell  `cat /etc/passwd | grep bandit26`

```bash
bandit25@bandit:~$  cat /etc/passwd | grep bandit26
bandit26:x:11026:11026:bandit level 26:/home/bandit26:/usr/bin/showtext
bandit25@bandit:~$ cat /usr/bin/showtext
#!/bin/sh

export TERM=linux

exec more ~/text.txt
exit 0
bandit25@bandit:~$ ls -la
total 40
drwxr-xr-x   2 root     root     4096 Apr  3 15:17 .
drwxr-xr-x 150 root     root     4096 Apr  3 15:20 ..
-rw-r-----   1 bandit25 bandit25   33 Apr  3 15:17 .bandit24.password
-r--------   1 bandit25 bandit25 1679 Apr  3 15:17 bandit26.sshkey
-rw-r-----   1 bandit25 bandit25  151 Apr  3 15:17 .banner
-rw-r--r--   1 root     root      220 Mar 31  2024 .bash_logout
-rw-r--r--   1 root     root     3851 Apr  3 15:10 .bashrc
-rw-r-----   1 bandit25 bandit25   66 Apr  3 15:17 .flag
-rw-r-----   1 bandit25 bandit25    4 Apr  3 15:17 .pin
-rw-r--r--   1 root     root      807 Mar 31  2024 .profile
bandit25@bandit:~$ 

```



 bandit26 的 shell 是 /usr/bin/showtext    这个脚本执行 more ~/text.txt 然后退出



在 25 有 bandit26.sshkey 私钥



由于 more 只在内容超过终端高度时才会分页，

需要：

  步骤1：缩小终端窗口

+ 把你的终端窗口高度调得很小（只有几行）

  步骤2：使用私钥登录 bandit26  
 ssh -i bandit26.key bandit26@bandit.labs.overthewire.org -p 2220

  步骤3：在 more 分页器中操作

+ 当看到 more 分页提示时，按 v 进入 vi 编辑器
+ 在 vi 中，输入 :set shell=/bin/bash 设置正常 shell
+ 然后输入 :shell 获得 bash shell
+ 或者直接在 vi 中执行 :r /etc/bandit_pass/bandit26 读取密码

  步骤4：获取密码  
  cat /etc/bandit_pass/bandit26

  关键是终端要足够小，让 more 进入分页模式而不是直接显示完就退出。





```bash
PS C:\Users\Xvsf\Downloads\111> scp -P 2220 bandit25@bandit.labs.overthewire.org:~/bandit26.sshkey ./bandit26.key
                         _                     _ _ _
                        | |__   __ _ _ __   __| (_) |_
                        | '_ \ / _` | '_ \ / _` | | __|
                        | |_) | (_| | | | | (_| | | |_
                        |_.__/ \__,_|_| |_|\__,_|_|\__|


                      This is an OverTheWire game server.
            More information on http://www.overthewire.org/wargames

backend: gibson-0
bandit25@bandit.labs.overthewire.org's password:
bandit26.sshkey                                       100% 1679     2.3KB/s   00:00
PS C:\Users\Xvsf\Downloads\111> icacls bandit26.key /inheritance:r
已处理的文件: bandit26.key
已成功处理 1 个文件; 处理 0 个文件时失败
PS C:\Users\Xvsf\Downloads\111>   icacls bandit26.key /grant:r "$($env:USERNAME):R"
已处理的文件: bandit26.key
已成功处理 1 个文件; 处理 0 个文件时失败
PS C:\Users\Xvsf\Downloads\111>
```





<!-- 这是一张图片，ocr 内容为：WINDOWS POWERSHELL ENJOY YOUR STAY! 181515 (50%) MORE -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222234107.png)





<!-- 这是一张图片，ocr 内容为：WINDOWS POWERSHELL :SET SHELL/BIN/BASH -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222239114.png)

<!-- 这是一张图片，ocr 内容为：WINDOWS POWERSHELL 01--1-1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 :SHELL BANDIT26@BANDIT:~$ -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235241.png)

<!-- 这是一张图片，ocr 内容为：WINDOWS POWERSHELL LIGYALLLL2/O1 SHELL BANDIT26@BANDIT:~$ CAT /ETC/BANDIT_PASS/BANDIT26 S0773XXKKOMXFDQOFPRVR9L3JBUOGCZ BANDIT26@BANDIT:~$ -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222234811.png)





`s0773xxkk0MXfdqOfPRVr9L3jJBUOgCZ`





# <font style="color:rgb(0, 0, 0);">Bandit Level 26 → Level 27</font>

 <!-- 这是一张图片，ocr 内容为：OVARTHEWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDITLEVEL 26-LEVEL 27 SSH INFORMATION HOST:BANDIT.LABS.OVERTHEWIRE.ORG PORT:2220 LEVEL GOAL DORICH LEVEL C GOOD JOB GETTING A SHELL! NOW HURRY AND GRAB THE PASSWORD FOR BANDIT27! LEVEL 0 LEVEL 1 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL1-LEVEL 2 LEVEL 2-LEVEL 3 IS LEVEL 3 LEVEL 4 LEVEL 4-LEVEL 5 LEVEL 5-LEVEL 6 LEVEL 6 LEVEL 7 LEVEL 7-LEVEL8 LEVEL8LEVEL9 LEVEL9LEVEL10 LEVEL10LEVEL11 LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13LEVEL14 LEVEL14-LEVEL 15 LEVEL15LEVEL 16 LEVEL 16VEL 17 LEVEL17-LEVEL 18 LEVEL 18VEL 19 LEVEL 19 LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21-LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222239124.png)







```bash
bandit26@bandit:~$ ls -la
total 44
drwxr-xr-x   3 root     root      4096 Apr  3 15:17 .
drwxr-xr-x 150 root     root      4096 Apr  3 15:20 ..
-rwsr-x---   1 bandit27 bandit26 14888 Apr  3 15:17 bandit27-do
-rw-r--r--   1 root     root       220 Mar 31  2024 .bash_logout
-rw-r--r--   1 root     root      3851 Apr  3 15:10 .bashrc
-rw-r--r--   1 root     root       807 Mar 31  2024 .profile
drwxr-xr-x   2 root     root      4096 Apr  3 15:17 .ssh
-rw-r-----   1 bandit26 bandit26   258 Apr  3 15:17 text.txt
bandit26@bandit:~$
bandit26@bandit:~$ ls -la bandit27-do
-rwsr-x--- 1 bandit27 bandit26 14888 Apr  3 15:17 bandit27-do
bandit26@bandit:~$ ./bandit27-do
Run a command as another user.
  Example: ./bandit27-do id
bandit26@bandit:~$ ./bandit27-do cat /etc/bandit_pass/bandit27
upsNCc7vzaRDx6oZC6GiR6ERwe1MowGB
bandit26@bandit:~$
```





`upsNCc7vzaRDx6oZC6GiR6ERwe1MowGB`



# <font style="color:rgb(0, 0, 0);">Bandit Level 27 → Level 28</font>

 <!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION WARGAMES RULES HELP!? DONATE! BANDIT LEVEL 27 LEVEL 2 SSH INFORMATION 128 PORT:2220 LEVEL GOAL DORIT LEVEL 0 BANDIT27. LEVEL 0 LEVEL1 LEVEL1-LEVEL 2 LEVEL 2-LEVEL 3 LEVEL 3 LEVEL 4 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL4-LEVEL 5 LEVEL 5-LEVEL 6 GIT LEVEL 6 LEVEL7 HELPFULREADINGMATERIAL LEVEL 7 LEVEL 8 LEVEL8LEVEL9 LEVEL9LEVEL10 INSTALLING GIT LEVEL 10-LEVEL 11 GIT FROM THE BOTTOM UP LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13LEVEL14 LEVEL14LEVEL15 LEVEL15LEVEL16 LEVEL 16VEL 17 LEVEL17LEVEL18 LEVEL 18VEL 19 LEVEL 19LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21-LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24-LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222236232.png)



关卡目标  
在 `ssh://bandit27-git@bandit.labs.overthewire.org/home/bandit27-git/repo` 地址上有一个 git 仓库，端口为 2220。用户 `bandit27-git` 的密码与用户 `bandit27` 的密码相同。

请从你的本地机器（而不是 OverTheWire 的机器上！）克隆该仓库，并找出下一级的密码。这需要你在本地机器上安装 git。

**本关可能用到的命令**  
`git`

**参考阅读材料**  

+ 安装 Git  
+ 《Git 从上手到底层》





```bash
PS C:\Users\Xvsf\Downloads\111> git clone ssh://bandit27-git@bandit.labs.overthewire.org:2220/home/bandit27-git/repo
Cloning into 'repo'...
                         _                     _ _ _
                        | |__   __ _ _ __   __| (_) |_
                        | '_ \ / _` | '_ \ / _` | | __|
                        | |_) | (_| | | | | (_| | | |_
                        |_.__/ \__,_|_| |_|\__,_|_|\__|


                      This is an OverTheWire game server.
            More information on http://www.overthewire.org/wargames

backend: gibson-0
bandit27-git@bandit.labs.overthewire.org's password:
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (3/3), done.
PS C:\Users\Xvsf\Downloads\111>
PS C:\Users\Xvsf\Downloads\111> ls


    目录: C:\Users\Xvsf\Downloads\111


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         2026/4/22     22:10                repo
-a----         2026/4/22     21:43          15757 aaa.md
-a----         2026/4/22     20:40           1679 bandit14.key
-a----         2026/4/22     21:06           1675 bandit17.key
-a----         2026/4/22     22:00           1679 bandit26.key
-a----         2026/4/22     20:22           1706 sshkey.private


PS C:\Users\Xvsf\Downloads\111> cd .\repo\
PS C:\Users\Xvsf\Downloads\111\repo> ls


    目录: C:\Users\Xvsf\Downloads\111\repo


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         2026/4/22     22:10             68 README


PS C:\Users\Xvsf\Downloads\111\repo> cat .\README
The password to the next level is: Yz9IpL0sBcCeuG7m9uQFt8ZNpS4HZRcN
PS C:\Users\Xvsf\Downloads\111\repo>
```



















<!-- 这是一张图片，ocr 内容为：PS C:\USERS\XVSF\DOWNLOADS\11> GIT CLONE SSH://BANDIT27-GIT27-GIT:LABS.OVERTHEWIRE.ORG 2220/HOME/BANDIT27-GIT/REPO CLONING INTO 'REPO'. BAMDIT THIS IS AN OVERTHEWIRE GAME SE SERVER. MORE INFORMATION ON HTTP://WWW.OVERTHEWIRE.ORG/WARGAMES BACKEND:GIBSON-0 BANDIT27-GIT@BANDIT.LABS.OVERTHEWIRE.ORG'S PASSWORD: REMOTE:ENUMERATING OBJECTS:3,DONE. REMOTE: COUNTING OBJECTS: 100% (3/3), DONE. REMOTE: COMPRESSING OBJECTS: 100% (2/2), DONE. REMOTE: TOTAL 3 (DELTA 0),REUSED O (DELTA 0), PACK-REUSED O RECEIVING OBJECTS: 100% (3/3), DONE. PS C:\USERS\XVSF\DOWNLOADS\11> LS 目录:C:\USERS\XVSF\DOWNLOADS\111 LENGTH NAME MODE LASTWRITETIME 2026/4/22 22:10 REPO 2026/4/22 15757 21:43 AAA.MD 2026/4/22 1679 BANDIT14.KEY 20:40 1675 BANDIT17.KEY 21:06 2026/4/22 1679 BANDIT26.KEY 22:00 2026/4/22 1706 SSHKEY.PRIVATE 2026/4/22 20:22 PS C:\USERS\XVSF\DOWNLOADS\111> CD .\REPO\ PS C:\USERS\XVSF\DOWNLOADS\11\REPO> LS 目录:C:\USERS\XVSF\DOWNLOADS\11\REPO MODE LENGTH LASTWRITETIME NAME 68 README 2026/4/22 22:10 -A---- PS C:\USERS\XVSF\DOWNLOADS\11\REPO> CAT .\README THE PASSWORD TO THE NEXT LEVEL IS: YZ9IPLOSBCCEUG7M9UQFT8ZNPS4HZRCN PS C:\USERS\XVSF\DOWNLOADS\11\REPO> -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222239568.png)







`Yz9IpL0sBcCeuG7m9uQFt8ZNpS4HZRcN`





# <font style="color:rgb(0, 0, 0);">Bandit Level 28 → Level 29</font>

 <!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDIT LEVEL 28 LEVEL 29 SSH INFORMATION PORT:2220 LEVEL GOAL DORIT LEVEL C LEVEL 0 LEVEL1 BANDIT28. LEVEL1-LEVEL 2 LEVEL 2-LEVEL 3 LEVEL 3 LEVEL 4 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL4-LEVEL 5 LEVEL 5-LEVEL 6 GIT LEVEL 6-LEVEL 7 HELPFULREADINGMATERIAL LEVEL 7 LEVEL 8 LEVEL8LEVEL9 LEVEL9LEVEL10 INSTALLING GIT LEVEL 10-LEVEL 11 GIT FROM THE BOTTOM UP LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13LEVEL14 LEVEL14LEVEL15 LEVEL15LEVEL16 LEVEL 16VEL 17 LEVEL17LEVEL18 LEVEL 18VEL 19 LEVEL 19LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21-LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24-LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235299.png)



关卡目标  
在 `ssh://bandit28-git@bandit.labs.overthewire.org/home/bandit28-git/repo` 地址上有一个 git 仓库，端口为 2220。用户 `bandit28-git` 的密码与用户 `bandit28` 的密码相同。

请从你的本地机器（而不是 OverTheWire 的机器上！）克隆该仓库，并找出下一级的密码。这需要你在本地机器上安装 git。

**本关可能用到的命令**  
`git`

**参考阅读材料**  

+ 安装 Git  
+ 《Git 从上手到底层》





```bash
PS C:\Users\Xvsf\Downloads\111\repo>  git clone ssh://bandit28-git@bandit.labs.overthewire.org:2220/home/bandit28-git/repo
Cloning into 'repo'...
                         _                     _ _ _
                        | |__   __ _ _ __   __| (_) |_
                        | '_ \ / _` | '_ \ / _` | | __|
                        | |_) | (_| | | | | (_| | | |_
                        |_.__/ \__,_|_| |_|\__,_|_|\__|


                      This is an OverTheWire game server.
            More information on http://www.overthewire.org/wargames

backend: gibson-0
bandit28-git@bandit.labs.overthewire.org's password:
remote: Enumerating objects: 9, done.
remote: Counting objects: 100% (9/9), done.
remote: Compressing objects: 100% (6/6), done.
Receiving objects: 100% (9/9), done.
remote: Total 9 (delta 2), reused 0 (delta 0), pack-reused 0
Resolving deltas: 100% (2/2), done.
PS C:\Users\Xvsf\Downloads\111\repo> ls


    目录: C:\Users\Xvsf\Downloads\111\repo


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         2026/4/22     22:12                repo
-a----         2026/4/22     22:10             68 README


PS C:\Users\Xvsf\Downloads\111\repo> cd .\repo\
PS C:\Users\Xvsf\Downloads\111\repo\repo> ls


    目录: C:\Users\Xvsf\Downloads\111\repo\repo


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         2026/4/22     22:12            111 README.md
PS C:\Users\Xvsf\Downloads\111\repo\repo> cat .\README.md
# Bandit Notes
Some notes for level29 of bandit.

## credentials

- username: bandit29
- password: xxxxxxxxxx

PS C:\Users\Xvsf\Downloads\111\repo\repo>
```



密码被隐藏了（xxxxxxxxxx）。查看 git 提交历史，密码可能在之前的版本中



<!-- 这是一张图片，ocr 内容为：INITIAL COMMIT OF README.M E.MD PS C:\USERS\XVSF\DOWNLOADS\11\REPO\REPO> GIT LOG-P > MASTER, ORIGIN/MASTER, ORIGIN/H ADC7F885A129BAEE883058B8A870739489F80194 CHEAD COMMIT A EAD AUTHOR: MORLA PORLA <MORLA@OVERTHEWIRE.ORG> FRI APR 3 15:17:54 2026 +000 DATE: FIX INFO LEAK DIFF --GIT A/README.MD B/README.MD INDEX  D4E3B74..5C6457B 100644 A/README.MD +++ B/README.MD ES FOR LEVEL29 OF BANDIT. -4,5 +4,5 @ SOME NOTES F @@ CREDENTIALS ## USERNAME: BANDIT29 PASSWORD: 4PT1T5DENAYUQNQVADYSLOE4QLCDJMJ7 PASSWORD: XXXXXXXXXX COMMIT A3437BDDD447F2D496731658E86B98CBEA9D3C98 AUTHOR:MORLA PORLA <MORLAQOVERTHEWIRE.ORG> FRI APR 3 15:17:54 2026 +0000 DATE: ADD MISSING DATA DIFF --GIT A/README.MD B/README.MD INDEX 7BA2D2F...D4E3B74 100644 A/README.MD ++ B/README.MD @@ -4,5 +4,5 @ SOME NOTES FOR LEVEL29 OF BANDIT. CREDENTIALS BANDIT29 USERNAME: <TBD> PASSWORD: 4PT1T5DENAYUQNQVADYS1OE4QLCDJMJ7 PASSWORD: COMMIT CB630EC182B75BC289595511F8BCF4D47CFEC50D AUTHOR: BEN DOVER <NOONE@OVERTHEWIRE.ORG> FRI APR 3 15:17:54 2026 +0000 DATE: INITIAL README.MD COMMIT OF DIFF --GIT A/README.MD B/README.MD NEW FILE MODE 100644 INDEX 0000000..7BA2D2F /DEV/NULL +++ B/README.MD @@-0,0+1,8@ -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222234359.png)





`4pT1t5DENaYuqnqvadYs1oE4QLCdjmJ7`





# <font style="color:rgb(0, 0, 0);">Bandit Level 29 → Level 30</font>

 <!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDIT LEVEL 29 LEVEL 30 SSH INFORMATION PORT:2220 LEVEL GOAL DORIT LEVEL C LEVEL 0 LEVEL1 BANDIT29. LEVEL1-LEVEL 2 LEVEL 2-LEVEL 3 LEVEL 3 LEVEL 4 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL4-LEVEL 5 LEVEL 5-LEVEL 6 GIT LEVEL 6 LEVEL7 HELPFULREADINGMATERIAL LEVEL 7 LEVEL 8 LEVEL8LEVEL9 LEVEL9LEVEL10 INSTALLING GIT LEVEL 10-LEVEL 11 GIT FROM THE BOTTOM UP LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13LEVEL14 LEVEL14LEVEL15 LEVEL15LEVEL16 LEVEL 16VEL 17 LEVEL17LEVEL18 LEVEL 18VEL 19 LEVEL 19LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21-LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24-LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222237293.png)关卡目标  
在 `ssh://bandit29-git@bandit.labs.overthewire.org/home/bandit29-git/repo` 地址上有一个 git 仓库，端口为 2220。用户 `bandit29-git` 的密码与用户 `bandit29` 的密码相同。

请从你的本地机器（而不是 OverTheWire 的机器上！）克隆该仓库，并找出下一级的密码。这需要你在本地机器上安装 git。

**本关可能用到的命令**  
`git`

**参考阅读材料**  

+ 安装 Git  
+ 《Git 从上手到底层》









```bash
PS C:\Users\Xvsf\Downloads\111\tmp> git clone ssh://bandit29-git@bandit.labs.overthewire.org:2220/home/bandit29-git/repo
Cloning into 'repo'...
                         _                     _ _ _
                        | |__   __ _ _ __   __| (_) |_
                        | '_ \ / _` | '_ \ / _` | | __|
                        | |_) | (_| | | | | (_| | | |_
                        |_.__/ \__,_|_| |_|\__,_|_|\__|


                      This is an OverTheWire game server.
            More information on http://www.overthewire.org/wargames

backend: gibson-0
bandit29-git@bandit.labs.overthewire.org's password:
remote: Enumerating objects: 16, done.
remote: Counting objects: 100% (16/16), done.
remote: Compressing objects: 100% (11/11), done.
remote: Total 16 (delta 2), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (16/16), done.
Resolving deltas: 100% (2/2), done.
PS C:\Users\Xvsf\Downloads\111\tmp> cd .\repo\
PS C:\Users\Xvsf\Downloads\111\tmp\repo> ls


    目录: C:\Users\Xvsf\Downloads\111\tmp\repo


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         2026/4/22     22:17            131 README.md


PS C:\Users\Xvsf\Downloads\111\tmp\repo> cat .\README.md
# Bandit Notes
Some notes for bandit30 of bandit.

## credentials

- username: bandit30
- password: <no passwords in production!>

PS C:\Users\Xvsf\Downloads\111\tmp\repo>
```

提示 "no passwords in production"，说明密码不在主分支



检查其他分支

```bash
PS C:\Users\Xvsf\Downloads\111\tmp\repo> git branch -a
* master
  remotes/origin/HEAD -> origin/master
  remotes/origin/dev
  remotes/origin/master
  remotes/origin/sploits-dev
PS C:\Users\Xvsf\Downloads\111\tmp\repo>
```



切换到 dev 分支查看

```bash
PS C:\Users\Xvsf\Downloads\111\tmp\repo> git checkout dev
branch 'dev' set up to track 'origin/dev'.
Switched to a new branch 'dev'
PS C:\Users\Xvsf\Downloads\111\tmp\repo> cat .\README.md
# Bandit Notes
Some notes for bandit30 of bandit.

## credentials

- username: bandit30
- password: qp30ex3VLz5MDG1n91YowTv4Q8l7CDZL

PS C:\Users\Xvsf\Downloads\111\tmp\repo>
```

<!-- 这是一张图片，ocr 内容为：C:\USERS\XVSF\DOWNLOADS\111\TMP\REPO> PS GIT BRANCH -A MASTER REMOTES/ORIGIN/HEAD -> ORIGIN/MASTER REMOTES/ORIGIN/DEV REMOTES/ORIGIN/MASTER REMOTES/ORIGIN/SPLOITS-DEV UPS C:\USERS\XVSF\DOWNLOADS\111\TMP\REPO> GIT CHECKOUT DEV BRANCH 'DEV' SET UP TO TRACK 'ORIGIN/DEV' SWITCHED TO A NEW BRANCH 'DEV' PS C:\USERS\XVSF\DOWNLOADS\11\TMP\REPO> CAT .\README.MD PS C BANDIT NOTES BANDIT. SOME NOTES FOR BANDIT30 OF CREDENTIALS ## BANDIT30 USERNAME: PASSWORD: QP30EX3VLZ5MDG1N91YOWTV4Q8L7CDZL PS C:\USERS\XVSF\DOWNLOADS\111\TMP\REPO> -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222234120.png)





`qp30ex3VLz5MDG1n91YowTv4Q8l7CDZL`







# <font style="color:rgb(0, 0, 0);">Bandit Level 30 → Level 31</font>

 <!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDITLEVEL30LEVEL31 SSH INFORMATION PORT:2220 LEVEL GOAL DORIT LEVEL 0 LEVEL 0 LEVEL1 BANDIT30. LEVEL1-LEVEL 2 LEVEL 2-LEVEL 3 LEVEL 3 LEVEL 4 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL4-LEVEL 5 LEVEL 5-LEVEL 6 GIT LEVEL 6 LEVEL7 HELPFULREADINGMATERIAL LEVEL 7 LEVEL 8 LEVEL8LEVEL9 LEVEL9LEVEL10 INSTALLING GIT LEVEL 10-LEVEL 11 GIT FROM THE BOTTOM UP LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13LEVEL14 LEVEL14LEVEL15 LEVEL15LEVEL16 LEVEL 16VEL 17 LEVEL17LEVEL18 LEVEL 18VEL 19 LEVEL 19LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21-LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24-LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222237425.png)



关卡目标  
在 `ssh://bandit30-git@bandit.labs.overthewire.org/home/bandit30-git/repo` 地址上有一个 git 仓库，端口为 2220。用户 `bandit30-git` 的密码与用户 `bandit30` 的密码相同。

请从你的本地机器（而不是 OverTheWire 的机器上！）克隆该仓库，并找出下一级的密码。这需要你在本地机器上安装 git。

**本关可能用到的命令**  
`git`

**参考阅读材料**  

+ 安装 Git  
+ 《Git 从上手到底层》





```bash
PS C:\Users\Xvsf\Downloads\111\tmp\repo> git clone ssh://bandit30-git@bandit.labs.overthewire.org:2220/home/bandit30-git/repo
Cloning into 'repo'...
                         _                     _ _ _
                        | |__   __ _ _ __   __| (_) |_
                        | '_ \ / _` | '_ \ / _` | | __|
                        | |_) | (_| | | | | (_| | | |_
                        |_.__/ \__,_|_| |_|\__,_|_|\__|


                      This is an OverTheWire game server.
            More information on http://www.overthewire.org/wargames

backend: gibson-0
bandit30-git@bandit.labs.overthewire.org's password:
remote: Enumerating objects: 4, done.
remote: Counting objects: 100% (4/4), done.
remote: Total 4 (delta 0), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (4/4), done.
PS C:\Users\Xvsf\Downloads\111\tmp\repo> cd .\repo\
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo> ls


    目录: C:\Users\Xvsf\Downloads\111\tmp\repo\repo


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         2026/4/22     22:20             30 README.md


PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo> cat .\README.md
just an epmty file... muahaha
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo>

```



查看所有标签

```bash
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo> git tag
secret
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo> git show secret
fb5S2xb7bRyFmAvQYQGEqsbhVyJqhnDy
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo>
```

<!-- 这是一张图片，ocr 内容为：\USERS\XVSF\DOWNLOADS\111\TMP\REPO\REPO> GIT TAG PS C: SECRET PS C:\USERS\XVSF\DOWNLOADS\111\TMP\REPO\REPO> GIT SHOW SECRET FB5S2XB7BRYFMAVQYQGEQSBHVYJQHNDY TMP\REPO\REPO> PS C:\USERS\XVSF\DOWNLOADS\111 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235660.png)









`fb5S2xb7bRyFmAvQYQGEqsbhVyJqhnDy`



# <font style="color:rgb(0, 0, 0);">Bandit Level 31 → Level 32</font>
<!-- 这是一张图片，ocr 内容为：OVORTHOWIRO INFORMATION WARGAMES RULES HELP!? DONATE! BANDITLEVEL 31 > LEVEL 32 SSH INFORMATION PORT:2220 LEVEL GOAL DORIT LEVEL C LEVEL 0 LEVEL1 BANDIT31 LEVEL1-LEVEL 2 LEVEL 2-LEVEL 3 LEVEL 3 LEVEL 4 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL4LEVEL 5 LEVEL 5-LEVEL 6 GIT LEVEL 6 LEVEL7 HELPFULREADINGMATERIAL LEVEL 7 LEVEL 8 LEVEL8LEVEL9 LEVEL9LEVEL10 INSTALLING GIT LEVEL 10-LEVEL 11 GIT FROM THE BOTTOM UP LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13LEVEL14 LEVEL14LEVEL15 LEVEL15LEVEL16 LEVEL 16VEL 17 LEVEL17LEVEL18 LEVEL 18VEL 19 LEVEL 19LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21-LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24-LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222234767.png)  


关卡目标  
在 `ssh://bandit31-git@bandit.labs.overthewire.org/home/bandit31-git/repo` 地址上有一个 git 仓库，端口为 2220。用户 `bandit31-git` 的密码与用户 `bandit31` 的密码相同。

请从你的本地机器（而不是 OverTheWire 的机器上！）克隆该仓库，并找出下一级的密码。这需要你在本地机器上安装 git。

**本关可能用到的命令**  
`git`

**参考阅读材料**  

+ 安装 Git  
+ 《Git 从上手到底层》





```bash
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo> git clone ssh://bandit31-git@bandit.labs.overthewire.org:2220/home/bandit31-git/repo
Cloning into 'repo'...
                         _                     _ _ _
                        | |__   __ _ _ __   __| (_) |_
                        | '_ \ / _` | '_ \ / _` | | __|
                        | |_) | (_| | | | | (_| | | |_
                        |_.__/ \__,_|_| |_|\__,_|_|\__|


                      This is an OverTheWire game server.
            More information on http://www.overthewire.org/wargames

backend: gibson-0
bandit31-git@bandit.labs.overthewire.org's password:
remote: Enumerating objects: 4, done.
remote: Counting objects: 100% (4/4), done.
remote: Compressing objects: 100% (3/3), done.
remote: Total 4 (delta 0), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (4/4), done.
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo> cd .\repo\
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo> cat .\README.md
This time your task is to push a file to the remote repository.

Details:
    File name: key.txt
    Content: 'May I come in?'
    Branch: master

PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo>
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo> ls


      目录: C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo


  Mode                 LastWriteTime         Length Name
  ----                 -------------         ------ ----
  -a----         2026/4/22     22:23              6 .gitignore
  -a----         2026/4/22     22:23            147 README.md


  PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo> cat .\.gitignore
  *.txt
  PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo>
```

这次需要推送文件到远程仓库。按照要求创建并推送

.gitignore 忽略了所有 .txt 文件。需要强制添加：

```bash
创建文件
echo "May I come in?" > key.txt
添加到 git
git add -f key.txt
提交
git commit -m "Add key.txt"
推送到远程
git push origin master
```





```bash
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo> echo "May I come in?" > key.txt
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo> git add -f key.txt
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo> git commit -m "Add key.txt"
[master e55239e] Add key.txt
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 key.txt
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo> git push origin master
                         _                     _ _ _
                        | |__   __ _ _ __   __| (_) |_
                        | '_ \ / _` | '_ \ / _` | | __|
                        | |_) | (_| | | | | (_| | | |_
                        |_.__/ \__,_|_| |_|\__,_|_|\__|


                      This is an OverTheWire game server.
            More information on http://www.overthewire.org/wargames

backend: gibson-0
bandit31-git@bandit.labs.overthewire.org's password:
Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Delta compression using up to 24 threads
Compressing objects: 100% (2/2), done.
Writing objects: 100% (3/3), 335 bytes | 335.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
remote: ### Attempting to validate files... ####
remote:
remote: .oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.
remote:
remote: Wrong! The file you submitted is UTF-16, not UTF-8/ASCII
remote:
remote: .oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.
remote:
To ssh://bandit.labs.overthewire.org:2220/home/bandit31-git/repo
 ! [remote rejected] master -> master (pre-receive hook declined)
error: failed to push some refs to 'ssh://bandit.labs.overthewire.org:2220/home/bandit31-git/repo'
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo>
```

文件编码错误，PowerShell 的 echo 创建了 UTF-16 文件。需要创建 UTF-8 文件

`"May I come in?" | Out-File -FilePath key.txt -Encoding ASCII -NoNewline`



```bash
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo> "May I come in?" | Out-File -FilePath key.txt -Encoding ASCII -NoNewline
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo> git add -f key.txt
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo> git commit --amend -m "Add key.txt"
[master 6969043] Add key.txt
 Date: Wed Apr 22 22:25:16 2026 +0800
 1 file changed, 1 insertion(+)
 create mode 100644 key.txt
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo> git push origin master
                         _                     _ _ _
                        | |__   __ _ _ __   __| (_) |_
                        | '_ \ / _` | '_ \ / _` | | __|
                        | |_) | (_| | | | | (_| | | |_
                        |_.__/ \__,_|_| |_|\__,_|_|\__|


                      This is an OverTheWire game server.
            More information on http://www.overthewire.org/wargames

backend: gibson-0
bandit31-git@bandit.labs.overthewire.org's password:
Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Delta compression using up to 24 threads
Compressing objects: 100% (2/2), done.
Writing objects: 100% (3/3), 321 bytes | 321.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
remote: ### Attempting to validate files... ####
remote:
remote: .oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.
remote:
remote: Well done! Here is the password for the next level:
remote: 3O9RfhqyAlVBEZpVb6LYStshZoqoSx5K
remote:
remote: .oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.
remote:
To ssh://bandit.labs.overthewire.org:2220/home/bandit31-git/repo
 ! [remote rejected] master -> master (pre-receive hook declined)
error: failed to push some refs to 'ssh://bandit.labs.overthewire.org:2220/home/bandit31-git/repo'
PS C:\Users\Xvsf\Downloads\111\tmp\repo\repo\repo>
```

`3O9RfhqyAlVBEZpVb6LYStshZoqoSx5K`







# <font style="color:rgb(0, 0, 0);">Bandit Level 32 → Level 33</font>

 <!-- 这是一张图片，ocr 内容为：OVARTHEWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDIT LEVEL 32-LEVEL 33 SSH INFORMATION HOST:BANDIT.LABS.OVERTHEWIRE.ORG PORT:2220 LEVEL GOAL DORICH AFTER ALL THIS GIT STUFF,IT'S TIME FOR ANOTHER ESCAPE. GOOD LUCK! LEVEL C LEVEL 0 LEVEL1 COMMANDS YOU MAY NEED TO SOLVE THIS LEVEL LEVEL1-LEVEL 2 LEVEL 2-LEVEL 3 SH,MAN LEVEL 3 LEVEL 4 LEVEL4LEVEL 5 LEVEL 5-LEVEL 6 LEVEL 6 LEVEL 7 LEVEL7-LEVEL8 LEVEL8LEVEL9 LEVEL9LEVEL10 LEVEL10LEVEL11 LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13-LEVEL14 LEVEL14-LEVEL 15 LEVEL15LEVEL 16 LEVEL 16VEL 17 LEVEL17-LEVEL 18 LEVEL 18VEL 19 LEVEL 19LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21-LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24-LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222235927.png)



关卡目标  
在经历了所有这些 git 的内容之后，是时候再次逃逸了。祝你好运！

**本关可能用到的命令**  
`sh`, `man`



这是一个特殊的 shell，会把所有输入转换成大写。需要利用 shell 变量来绕过

<!-- 这是一张图片，ocr 内容为：(HTTPS://GITHUB.COM/HUGSY/GEF) IN /OPT/GEF/ GEF PWNABG (HTTPS://GITHUB.COM/PWNDBG/PWNDBQ) IN /OPT/PWNDBQ/ GABINIT (HTTPS://GITHUB.COM/GDBINIT/GDBINIT) IN /OPT/GDBINIT/ PWNTOOLS (HTTPS://GITHUB.COM/GALLOPSLED/PWNTOOLS) RADARE2 (HTTP://WWW.RADARE.ORG/) MORE INFORMATION FOR MORE INFORMATION REGARDING INDIVIDUAL WEL WER VISIT UAL WARGAMES, HTTP://WWW.OVERTHEWIRE.ORG/WARGAMES/ FOR SUPPORT, QUESTIONS OR COMMENTS, CONTACT US ON DISCORD OR IRC, ENJOY YOUR STAY! WELCOME TO THE UPPERCASE SHELL >SH SH: 1:SH:PERMISSION DENIED MAN SH: 1:MAN: PERMISSION DENIED -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222234499.png)





 $0 是当前 shell 的名称，通常是 /bin/sh 或 /bin/bash。执行它会启动一个新的正常 shell。





<!-- 这是一张图片，ocr 内容为：GEF (HTTPS://GITHUB.COM/HUGSY/GEF) IN /OPT/GEF/ PWNDBG (HTTPS://GITHUB.COM/PWNDBG/PWNDBG) IN /OPT/PWNDBG/ GDBINIT (HTTPS://GITHUB.COM/GDBINIT/GDBINIT) IN /OPT/GDBINIT/ PWNTOOLS (HTTPS://GITHUB.COM/GALLOPSLED/PWNTOOLS) RADARE2 (HTTP://WWW.RADARE.ORG/) [MORE INFORMATION FOR MORE INFORMATION REGARDING INDIVIDUAL VISIT WARGAMES, HTTP://WWW.OVERTHEWIRE.ORG/WARGAMES/ ON DISCORD OR IRC. FOR SUPPORT, QUESTIONS OR COMMENTS, CONTACT US ENJOY YOUR STAY! WELCOME TO THE UPPERCASE SHELL $H-天 SH: 1:.$:PERMISSION DENIED 小$八 $LS UPPERSHELL $ CAYT $ CAT /ETC/BANDIT PASS/BANDIT33 TODTBS5D5I2VJWK08MEYYEYTL8IZOEJ0 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222238541.png)



`tQdtbs5D5i2vJwkO8mEyYEyTL8izoeJ0`



# <font style="color:rgb(0, 0, 0);">Bandit Level 33 → Level 34</font>
<!-- 这是一张图片，ocr 内容为：OVARTHEWIRO INFORMATION RULES WARGAMES HELP!? DONATE! BANDITLEVEL333LEVEL 34 SSH INFORMATION HOST:BANDIT.LABS.OVERTHEWIRE.ORG PORT:2220 AT THIS MOMENT,LEVEL 34 DOES NOT EXIST YET. BORCTT LEVEL 0 LEVEL 0 LEVEL1 LEVEL1-LEVEL 2 LEVEL 2-LEVEL 3 LEVEL 3-LEVEL 4 LEVEL4-LEVEL 5 LEVEL 5-LEVEL 6 LEVEL 6 VEL 7 LEVEL7LEVEL8 LEVEL8LEVEL9 LEVEL9LEVEL10 LEVEL10LEVEL11 LEVEL111LEVEL12 LEVEL 12-LEVEL 13 LEVEL13LEVEL14 LEVEL14-LEVEL 15 LEVEL15LEVEL 16 LEVEL 16VEL 17 LEVEL17-LEVEL 18 LEVEL 18VEL 19 LEVEL 19LEVEL 20 LEVEL 20-LEVEL 21 LEVEL 21-LEVEL 22 LEVEL 22-LEVEL 23 LEVEL 23LEVEL 24 LEVEL 24-LEVEL 25 LEVEL 25-LEVEL 26 LEVEL 26-LEVEL 27 -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604222237590.png)  















