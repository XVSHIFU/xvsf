---
title: Shell编程汇总
date: 2026-05-20T15:00:00+08:00
tags:

- Shell编程
- Linux
categories:
- Linux
description: Bash Shell 编程基础、高级特性、最佳实践、常用命令及自动化脚本开发
showToc: true
draft: false
tocOpen: true
---
# Shell 编程（Linux）知识汇总

> 涵盖 Bash Shell 编程基础、高级特性、最佳实践、常用命令及自动化脚本开发

---

## 目录

1. [Shell 基础](#1-shell-基础)
2. [命令执行、管道与重定向](#2-命令执行管道与重定向)
3. [变量与数据类型](#3-变量与数据类型)
4. [流程控制](#4-流程控制)
5. [函数](#5-函数)
6. [Bash 高级特性](#6-bash-高级特性)
7. [文本处理](#7-文本处理)
8. [文件操作](#8-文件操作)
9. [进程管理](#9-进程管理)
10. [网络操作](#10-网络操作)
11. [Shell 脚本最佳实践](#11-shell-脚本最佳实践)
12. [常见陷阱与避坑指南](#12-常见陷阱与避坑指南)
13. [常用命令速查](#13-常用命令速查)
14. [实战练习](#14-实战练习)

---

## 1. Shell 基础

### 1.1 什么是 Shell

**Shell** 是用户与 Linux 内核交互的命令行界面，也是一种脚本语言。

### 1.2 常见 Shell 类型

| Shell          | 路径              | 特点                 |
| -------------- | ----------------- | -------------------- |
| **Bash** | `/bin/bash`     | 最流行，Linux 默认   |
| **Zsh**  | `/bin/zsh`      | 功能强大，macOS 默认 |
| **Fish** | `/usr/bin/fish` | 用户友好，智能补全   |
| **Dash** | `/bin/dash`     | 轻量，POSIX 兼容     |
| **Sh**   | `/bin/sh`       | POSIX 标准 Shell     |

shell 也可分为俩类，一种是系统自带的 Shell，一种是需要额外安装的Shell，在 Linux 上，几乎一定会有 /bin/sh，但 /bin/sh 具体指向谁，不同发行版不一样，

如何查看当前系统有哪些 Shell 呢？

`cat /etc/shells`   这个文件通常记录“允许作为登录 Shell 的 Shell”

![image-20260527213528156](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/image-20260527213528156.png)

查看当前正在使用的 Shell：

![image-20260528150207414](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/image-20260528150207414.png)

### 1.3 Shebang（释伴）

```bash
#!/bin/bash             # 使用 Bash
#!/usr/bin/env bash     # 推荐：自动查找 bash 路径
#!/bin/sh               # POSIX Shell
#!/usr/bin/env python3  # Python 脚本
```

> 只要用了 Bash 特性（[[]]、(( ))、数组、${var^^}、进程替换 等），就用 #!/usr/bin/env bash。
> 纯 POSIX 语法（只用到基础命令、[ ]、for i in），才用 #!/bin/sh。

### 1.4 脚本执行方式

```bash
# 方式 1：添加执行权限后直接运行
chmod +x script.sh
./script.sh

# 方式 2：使用 bash 命令
bash script.sh

# 方式 3：source 或 . 在当前 Shell 执行
source script.sh
. script.sh
```

---

## 2. 命令执行、管道与重定向

### 2.1 退出状态码

每条命令执行后都会返回一个退出状态码，`0` 通常表示成功，非 `0` 表示失败。

```bash
ls /tmp
echo $?  # 查看上一条命令的退出状态

command && echo "成功时执行"
command || echo "失败时执行"
```

> `command` 是 bash 的内置命令，不是可执行文件，它的基本作用就是**以成功（退出码 0）退出**的一个空命令；真正用途，主要是用来**绕过函数或别名，直接调用原始命令**的。
>
> 假设你定义了一个函数覆盖了 ls：
>
> ```bash
> ls() {
>       /bin/ls --color=auto -l "$@"
> }
> ```
>
> 此时调用 ls 会执行这个函数，而不是原来的 ls。如果想跳过函数直接调用系统命令：
>
> `command ls`
>
> 这样就会直接执行 /bin/ls，不会走函数定义。
>
> `command -v`  用来查看某个命令的路径：
>
> ![image-20260528152628001](C:\Users\Xvsf\AppData\Roaming\Typora\typora-user-images\image-20260528152628001.png)

### 2.2 标准输入、输出和错误

| 文件描述符 | 名称   | 说明     |
| ---------- | ------ | -------- |
| `0`      | stdin  | 标准输入 |
| `1`      | stdout | 标准输出 |
| `2`      | stderr | 标准错误 |

```bash
command > out.txt        # 标准输出写入文件（覆盖）
command >> out.txt       # 标准输出追加到文件
command 2> err.txt       # 标准错误写入文件
command > all.txt 2>&1   # stdout 和 stderr 写入同一文件
command &> all.txt       # Bash 简写：stdout 和 stderr 写入同一文件
```

### 2.3 管道

```bash
ps aux | grep nginx      # 将 ps 输出交给 grep
command 2>&1 | tee log   # stdout 和 stderr 合并后进入管道
command |& tee log       # Bash 简写：stdout 和 stderr 一起进入管道
```

### 2.4 命令替换

```bash
now=$(date)
count=$(find . -type f | wc -l)
```

推荐使用 `$(command)`，不推荐旧式反引号 `` `command` ``，因为前者更清晰且更容易嵌套。

### 2.5 算术扩展

`$((...))`  算术展开

`((...))`  算术上下文

```bash
a=3
b=5
sum=$((a + b))

((count++))

if (( sum > 5 )); then
    echo "sum 大于 5"
fi
```

---

## 3. 变量与数据类型

### 3.1 变量定义与使用

```bash
# 定义变量（等号两边不能有空格）
name="John"
age=30

# 使用变量
echo "$name"
echo "${name}"  # 推荐：明确变量边界

# 只读变量
readonly PI=3.14159

# 删除变量
unset name
```

### 3.2 变量类型

| 类型                            | 说明                 | 示例                              |
| ------------------------------- | -------------------- | --------------------------------- |
| **局部变量**              | 当前 Shell 有效      | `var=value`                     |
| **环境变量**              | 子进程可继承         | `export VAR=value`              |
| **Shell 内置/预定义变量** | Shell 自动维护的变量 | `$BASH_VERSION`, `$?`, `$$` |

### 3.3 特殊变量

| 变量            | 含义                       |
| --------------- | -------------------------- |
| `$0`          | 脚本名称                   |
| `$1, $2, ...` | 位置参数                   |
| `$#`          | 参数个数                   |
| `$@`          | 所有参数                   |
| `$*`          | 所有参数                   |
| `$?`          | 上一条命令的退出状态       |
| `$$`          | 当前进程 PID               |
| `$!`          | 后台运行的最后一个进程 PID |

`"$@"` 与 `"$*"` 在加引号时差异很重要，遍历参数时几乎总是使用 `"$@"`。

```bash
set -- "a b" c

for arg in "$@"; do
    echo "|$arg|"
done
# |a b|
# |c|

for arg in "$*"; do
    echo "|$arg|"
done
# |a b c|
```

### 3.4 字符串操作

```bash
str="Hello World"

# 字符串长度
echo "${#str}"  # 11

# 子串提取
echo "${str:0:5}"  # Hello
echo "${str:6}"    # World

# 字符串替换
echo "${str/World/Bash}"  # Hello Bash（替换第一个）
echo "${str//o/O}"        # HellO WOrld（替换所有）
echo "${str/#Hello/Hi}"   # Hi World（替换开头匹配）
echo "${str/%World/Bash}" # Hello Bash（替换结尾匹配）

# 删除匹配
echo "${str#Hello }"   # World（删除开头匹配）
echo "${str%World}"    # Hello （删除结尾匹配）

# 大小写转换
echo "${str^^}"  # HELLO WORLD（全部大写）
echo "${str,,}"  # hello world（全部小写）
```

### 3.5 数组

```bash
# 定义数组
arr=(apple banana cherry)
arr[3]="date"

# 访问元素
echo "${arr[0]}"      # apple
echo "${arr[@]}"      # 所有元素
echo "${#arr[@]}"     # 数组长度

# 遍历数组
for item in "${arr[@]}"; do
    echo "$item"
done

# 关联数组（Bash 4.0+）
declare -A dict
dict[name]="John"
dict[age]=30
echo "${dict[name]}"
```

---

## 4. 流程控制

### 4.1 条件判断

```bash
# if-elif-else
if (( age < 18 )); then
    echo "未成年"
elif (( age < 60 )); then
    echo "成年人"
else
    echo "老年人"
fi

# 测试命令
if command -v git &> /dev/null; then
    echo "Git 已安装"
fi

# 逻辑运算
if (( age > 18 && age < 60 )); then
    echo "成年人"
fi
```

### 4.2 测试操作符

#### 文件测试

| 操作符      | 说明       |
| ----------- | ---------- |
| `-e file` | 文件存在   |
| `-f file` | 是普通文件 |
| `-d file` | 是目录     |
| `-r file` | 可读       |
| `-w file` | 可写       |
| `-x file` | 可执行     |
| `-s file` | 文件非空   |

#### 字符串测试

| 操作符           | 说明       |
| ---------------- | ---------- |
| `-z str`       | 字符串为空 |
| `-n str`       | 字符串非空 |
| `str1 = str2`  | 字符串相等 |
| `str1 != str2` | 字符串不等 |

```bash
if [[ -z $name ]]; then
    echo "name 为空"
fi

if [[ $name == "John" ]]; then
    echo "匹配"
fi
```

#### 数值比较

| 操作符  | 说明     |
| ------- | -------- |
| `-eq` | 等于     |
| `-ne` | 不等于   |
| `-lt` | 小于     |
| `-le` | 小于等于 |
| `-gt` | 大于     |
| `-ge` | 大于等于 |

Bash 中更推荐使用 `(( ... ))` 做整数比较。

```bash
if (( count >= 10 )); then
    echo "count 大于等于 10"
fi
```

#### 正则匹配

`=~` 只能在 `[[ ... ]]` 中使用，捕获组结果保存在 `BASH_REMATCH` 数组中。

```bash
email="user@example.com"
if [[ $email =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
    echo "邮箱格式正确"
fi

date="2026-05-27"
if [[ $date =~ ^([0-9]{4})-([0-9]{2})-([0-9]{2})$ ]]; then
    year=${BASH_REMATCH[1]}
    month=${BASH_REMATCH[2]}
    day=${BASH_REMATCH[3]}
    echo "$year/$month/$day"
fi
```

### 4.3 case 语句

```bash
case ${1:-} in
    start)
        echo "启动服务"
        ;;
    stop)
        echo "停止服务"
        ;;
    restart)
        echo "重启服务"
        ;;
    *)
        echo "用法: $0 {start|stop|restart}"
        exit 1
        ;;
esac
```

### 4.4 循环

```bash
# for 循环
for i in {1..5}; do
    echo "数字: $i"
done

for file in *.txt; do
    echo "处理文件: $file"
done

# C 风格 for 循环
for ((i=0; i<10; i++)); do
    echo "$i"
done

# while 循环
count=0
while (( count < 5 )); do
    echo "$count"
    ((count++))
done

# until 循环
count=0
until (( count >= 5 )); do
    echo "$count"
    ((count++))
done

# 读取文件
while IFS= read -r line; do
    echo "$line"
done < file.txt
```

---

## 5. 函数

### 5.1 函数定义与调用

```bash
# 定义函数
function greet() {
    echo "Hello, $1!"
}

# 或者
greet() {
    echo "Hello, $1!"
}

# 调用函数
greet "World"  # Hello, World!
```

### 5.2 函数参数与返回值

```bash
add() {
    local sum=$(( $1 + $2 ))
    echo "$sum"  # 通过 echo 返回
}

result=$(add 3 5)
echo "结果: $result"  # 结果: 8

# 使用 return（只能返回 0-255 的整数）
is_even() {
    if (( $1 % 2 == 0 )); then
        return 0  # 成功
    else
        return 1  # 失败
    fi
}

if is_even 4; then
    echo "4 是偶数"
fi
```

### 5.3 局部变量

```bash
my_func() {
    local var="局部变量"
    echo "$var"
}

var="全局变量"
my_func
echo "$var"  # 全局变量
```

---

## 6. Bash 高级特性

### 6.1 进程替换

进程替换可以把命令输出当作文件传给其他命令，常用于避免临时文件。

```bash
diff <(sort file1.txt) <(sort file2.txt)
comm -12 <(sort a.txt) <(sort b.txt)
```

### 6.2 mapfile / readarray

```bash
mapfile -t lines < file.txt

for line in "${lines[@]}"; do
    echo "$line"
done
```

`mapfile -t` 会去掉每行末尾换行符，适合一次性读取小到中等大小文件。

### 6.3 shopt 常用选项

```bash
shopt -s nullglob
files=(*.txt)   # 无匹配时为空数组，而不是字面量 *.txt

shopt -s globstar
for file in **/*.log; do
    echo "$file"
done

shopt -s extglob
# rm -- !(*.md)  # 删除非 .md 文件，谨慎使用
```

### 6.4 trap 信号处理

```bash
cleanup() {
    echo "清理资源"
}

trap cleanup EXIT
trap 'echo "收到中断信号"; exit 130' INT
trap 'echo "收到终止信号"; exit 143' TERM
```

`EXIT` 可覆盖正常退出和多数错误退出，但 `kill -9` 或 `exec` 替换进程不会触发。

---

## 7. 文本处理

### 7.1 grep - 文本搜索

```bash
# 基本搜索
grep "pattern" file.txt

# 常用选项
grep -i "pattern" file.txt    # 忽略大小写
grep -v "pattern" file.txt    # 反向匹配
grep -r "pattern" /path       # 递归搜索
grep -n "pattern" file.txt    # 显示行号
grep -c "pattern" file.txt    # 统计匹配行数
grep -E "regex" file.txt      # 扩展正则表达式
grep -A 3 "pattern" file.txt  # 显示匹配行及后 3 行
grep -B 3 "pattern" file.txt  # 显示匹配行及前 3 行
```

### 7.2 sed - 流编辑器

```bash
# 替换
sed 's/old/new/' file.txt           # 替换每行第一个匹配
sed 's/old/new/g' file.txt          # 替换所有匹配
sed 's/old/new/gI' file.txt         # GNU sed：忽略大小写替换
sed -i 's/old/new/g' file.txt       # 直接修改文件

# 删除
sed '/pattern/d' file.txt           # 删除匹配行
sed '1d' file.txt                   # 删除第一行
sed '1,5d' file.txt                 # 删除 1-5 行

# 插入和追加
sed '2i\new line' file.txt          # 在第 2 行前插入
sed '2a\new line' file.txt          # 在第 2 行后追加

# 打印
sed -n '1,5p' file.txt              # 打印 1-5 行
sed -n '/pattern/p' file.txt        # 打印匹配行
```

`sed 's/old/new/gI'` 中的 `I` 是 GNU sed 扩展，macOS/BSD sed 兼容性可能不同。

### 7.3 awk - 文本分析工具

```bash
# 打印列
awk '{print $1}' file.txt           # 打印第一列
awk '{print $1, $3}' file.txt       # 打印第 1 和第 3 列
awk '{print $NF}' file.txt          # 打印最后一列

# 条件过滤
awk '$3 > 100' file.txt             # 第 3 列大于 100
awk '/pattern/ {print $1}' file.txt # 匹配行打印第 1 列

# 内置变量
awk '{print NR, $0}' file.txt       # NR: 行号
awk '{print NF, $0}' file.txt       # NF: 字段数

# 自定义分隔符
awk -F: '{print $1}' /etc/passwd    # 使用 : 作为分隔符

# 统计
awk '{sum += $1} END {print sum}' file.txt  # 求和
awk '{count++} END {print count}' file.txt  # 计数
```

### 7.4 cut - 列提取

```bash
cut -d: -f1 /etc/passwd             # 提取第 1 列（: 分隔）
cut -c1-10 file.txt                 # 提取每行前 10 个字符
```

### 7.5 sort - 排序

```bash
sort file.txt                       # 字典序排序
sort -n file.txt                    # 数值排序
sort -r file.txt                    # 逆序
sort -u file.txt                    # 去重排序
sort -k2 file.txt                   # 按第 2 列排序
```

### 7.6 uniq - 去重

```bash
uniq file.txt                       # 去除连续重复行
sort file.txt | uniq                # 先排序再去重
uniq -c file.txt                    # 统计连续重复次数
uniq -d file.txt                    # 只显示连续重复行
```

`uniq` 只处理连续重复行；如果要全局去重，通常先 `sort` 再 `uniq`，或直接使用 `sort -u`。

---

## 8. 文件操作

### 8.1 文件读写

```bash
# 读取文件
while IFS= read -r line; do
    echo "$line"
done < input.txt

# 写入文件
echo "内容" > file.txt              # 覆盖写入
echo "内容" >> file.txt             # 追加写入

# Here Document
cat << EOF > file.txt
第一行
第二行
EOF

# Here String
cat <<< "单行内容" > file.txt
```

### 8.2 文件查找

```bash
# find
find /path -name "*.txt"            # 按名称查找
find /path -type f                  # 查找文件
find /path -type d                  # 查找目录
find /path -mtime -7                # 7 天内修改的文件
find /path -size +100M              # 大于 100M 的文件
find /path -name "*.log" -print     # 删除前先确认
find /path -name "*.log" -delete    # 确认无误后再删除

# locate（更快，但依赖数据库）
locate filename
updatedb  # 更新数据库
```

### 8.3 文件权限

```bash
# chmod - 修改权限
chmod 755 file.sh                   # rwxr-xr-x
chmod u+x file.sh                   # 所有者添加执行权限
chmod g-w file.txt                  # 组去除写权限

# 分别设置文件和目录权限
find /path -type f -exec chmod 644 {} \;
find /path -type d -exec chmod 755 {} \;

# chown - 修改所有者
chown user:group file.txt
chown -R user:group /path

# umask - 默认权限掩码
umask 022  # 新文件 644，新目录 755
```

不要直接对目录树使用 `chmod -R 644 /path`，目录失去执行权限后会无法进入。

---

## 9. 进程管理

### 9.1 进程查看

```bash
# ps - 查看进程
ps aux                              # 所有进程
ps -ef                              # 完整格式
ps -u username                      # 指定用户进程

# top - 实时监控
top
htop  # 更友好的界面

# pgrep - 按名称查找进程
pgrep nginx
pgrep -u username

# pidof - 查找进程 PID
pidof nginx
```

### 9.2 进程控制

```bash
# 后台运行
command &

# nohup - 忽略挂断信号
nohup command &

# 暂停和恢复
Ctrl+Z  # 暂停当前进程
bg      # 后台继续运行
fg      # 前台继续运行
jobs    # 查看后台任务

# kill - 终止进程
kill PID                            # 发送 SIGTERM
kill -9 PID                         # 发送 SIGKILL（强制，无法被 trap 捕获）
killall process_name                # 按名称终止
pkill -f pattern                    # 按模式终止
```

### 9.3 进程优先级

```bash
# nice - 设置优先级（-20 到 19，越小优先级越高）
nice -n 10 command

# renice - 修改运行中进程的优先级
renice -n 5 -p PID
```

---

## 10. 网络操作

### 10.1 网络测试

```bash
# ping
ping -c 4 google.com                # 发送 4 个包

# curl - HTTP 请求
curl https://api.example.com
curl -X POST -d "data" url          # POST 请求
curl -H "Header: value" url         # 自定义头
curl -o file.txt url                # 下载到文件
curl -I url                         # 只获取头信息

# wget - 下载
wget url
wget -O filename url                # 指定文件名
wget -c url                         # 断点续传
wget -r url                         # 递归下载

# netstat - 网络连接
netstat -tuln                       # 监听端口
netstat -anp | grep :80             # 查看 80 端口

# ss - 更快的 netstat
ss -tuln
ss -anp | grep :80

# nc (netcat) - 网络工具
nc -zv host port 2>&1               # 端口探测，兼容性依实现而异
nc -l 8080                          # 监听端口
```

端口扫描建议在授权环境中使用；需要更完整的扫描能力时可使用 `nmap`。

### 10.2 SSH 操作

```bash
# SSH 连接
ssh user@host
ssh -p 2222 user@host               # 指定端口
ssh -i key.pem user@host            # 使用密钥

# SCP - 文件传输
scp file.txt user@host:/path        # 上传
scp user@host:/path/file.txt .      # 下载
scp -r dir user@host:/path          # 递归传输

# rsync - 同步
rsync -avz source/ dest/
rsync -avz -e ssh source/ user@host:/dest/
```

---

## 11. Shell 脚本最佳实践

### 11.1 脚本模板

```bash
#!/usr/bin/env bash

# 脚本说明
# 作者：
# 日期：
# 用途：

# 严格模式
set -euo pipefail  # -e: 遇错退出, -u: 未定义变量报错, -o pipefail: 管道错误

# 全局变量
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "$0")"

# 颜色输出
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# 日志函数
log_info() {
    printf '%b[INFO]%b %s\n' "$GREEN" "$NC" "$*"
}

log_warn() {
    printf '%b[WARN]%b %s\n' "$YELLOW" "$NC" "$*" >&2
}

log_error() {
    printf '%b[ERROR]%b %s\n' "$RED" "$NC" "$*" >&2
}

# 清理函数
cleanup() {
    log_info "清理资源..."
    # 清理代码
}

# 注册清理函数；kill -9 或 exec 替换进程不会触发 EXIT
trap cleanup EXIT

# 使用说明
usage() {
    cat << EOF
用法: $SCRIPT_NAME [选项] 参数

选项:
    -h, --help      显示帮助信息
    -v, --verbose   详细输出

示例:
    $SCRIPT_NAME -v arg1
EOF
    exit 1
}

# 参数解析
VERBOSE=false
ARGS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --)
            shift
            break
            ;;
        -*)
            log_error "未知选项: $1"
            usage
            ;;
        *)
            ARGS+=("$1")
            shift
            ;;
    esac
done

ARGS+=("$@")

# 主函数
main() {
    log_info "脚本开始执行"

    # 主要逻辑

    log_info "脚本执行完成"
}

# 执行主函数
main "${ARGS[@]}"
```

### 11.2 最佳实践清单

| 实践                                               | 说明                            |
| -------------------------------------------------- | ------------------------------- |
| **使用 `set -euo pipefail`**               | 严格模式，遇错退出              |
| **引用变量**                                 | 使用`"$var"` 而非 `$var`    |
| **使用 `[[` 而非 `[`**                   | `[[` 更安全，支持更多特性     |
| **使用 `$(command)` 而非 `` `command` ``** | 更清晰，可嵌套                  |
| **使用 `readonly` 定义常量**               | 防止意外修改                    |
| **使用 `local` 定义局部变量**              | 避免污染全局作用域              |
| **检查命令是否存在**                         | `command -v cmd &> /dev/null` |
| **使用 `trap` 清理资源**                   | 确保退出时清理                  |
| **提供使用说明**                             | `-h` 或 `--help` 选项       |
| **日志输出**                                 | 使用颜色和级别区分              |

### 11.3 调试技巧

```bash
# 调试模式
bash -x script.sh                   # 显示执行的每条命令

# 在脚本中启用调试
set -x  # 开启
set +x  # 关闭

# 检查语法
bash -n script.sh

# ShellCheck - 静态分析工具
shellcheck script.sh
```

---

## 12. 常见陷阱与避坑指南

### 12.1 变量未加引号

```bash
rm $file       # 不推荐：可能发生单词拆分和通配符展开
rm -- "$file"  # 推荐
```

### 12.2 不要用 `for file in $(ls)` 遍历文件

```bash
for file in $(ls); do   # 不推荐：文件名包含空格时会出错
    echo "$file"
done

for file in *; do       # 推荐
    echo "$file"
done
```

### 12.3 管道中的 while 可能在子 Shell 中执行

```bash
count=0
cat file.txt | while IFS= read -r line; do
    ((count++))
done
echo "$count"  # 某些 Shell 中可能仍是 0
```

推荐：

```bash
count=0
while IFS= read -r line; do
    ((count++))
done < file.txt
echo "$count"
```

### 12.4 `set -e` 不是万能错误处理

`set -e` 在 `if`、`while`、`&&`、`||`、管道等上下文中有例外，关键步骤仍建议显式处理错误。

```bash
if ! cp "$src" "$dst"; then
    echo "复制失败" >&2
    exit 1
fi
```

### 12.5 文件名以 `-` 开头时使用 `--`

```bash
rm -- "$filename"
cp -- "$src" "$dst"
```

### 12.6 通配符无匹配时的行为

```bash
for file in *.log; do
    echo "$file"
done
```

如果没有 `.log` 文件，默认会保留字面量 `*.log`。可使用：

```bash
shopt -s nullglob
```

---

## 13. 常用命令速查

### 13.1 文件操作

```bash
ls -lah         # 列出文件（包括隐藏文件）
cd /path        # 切换目录
pwd             # 当前目录
mkdir -p dir    # 创建目录（包括父目录）
rm -ri dir      # 交互式删除目录
rm -rf dir      # 强制删除目录，危险操作，执行前确认路径
cp -r src dst   # 复制目录
mv src dst      # 移动/重命名
touch file      # 创建空文件
cat file        # 查看文件
less file       # 分页查看
head -n 10 file # 查看前 10 行
tail -n 10 file # 查看后 10 行
tail -f file    # 实时查看文件追加
```

### 13.2 系统信息

```bash
uname -a        # 系统信息
hostname        # 主机名
uptime          # 运行时间
whoami          # 当前用户
id              # 用户 ID 和组 ID
df -h           # 磁盘使用情况
du -sh dir      # 目录大小
free -h         # 内存使用情况
top             # 进程监控
```

### 13.3 压缩解压

```bash
# tar
tar -czf archive.tar.gz dir         # 压缩
tar -xzf archive.tar.gz             # 解压
tar -tzf archive.tar.gz             # 查看内容

# zip
zip -r archive.zip dir              # 压缩
unzip archive.zip                   # 解压
```

### 13.4 用户管理

```bash
useradd username                    # 添加用户
passwd username                     # 设置密码
userdel -r username                 # 删除用户
usermod -aG group username          # 添加到组
groups username                     # 查看用户组
```

---

## 14. 实战练习

| 练习           | 目标                                  | 可用知识点                               |
| -------------- | ------------------------------------- | ---------------------------------------- |
| 批量重命名文件 | 给一批文件统一添加前缀或修改扩展名    | `for`, 参数展开, `mv --`             |
| 日志统计脚本   | 统计访问日志中的状态码、IP 或错误次数 | `grep`, `awk`, `sort`, `uniq -c` |
| 目录备份脚本   | 将指定目录打包并按日期命名            | `tar`, `date`, 变量, 函数            |
| 服务健康检查   | 检查端口、HTTP 状态码或进程是否存在   | `curl`, `ss`, `pgrep`, 退出状态    |
| 资源告警脚本   | 检查 CPU、内存或磁盘占用并输出告警    | `df`, `free`, `awk`, 条件判断      |

---

## 学习资源

### 在线资源

- [Advanced Bash-Scripting Guide](https://tldp.org/LDP/abs/html/)
- [Bash Reference Manual](https://www.gnu.org/software/bash/manual/)
- [ShellCheck](https://www.shellcheck.net/) - 在线语法检查

### 推荐书籍

- 《Linux Shell 脚本攻略》
- 《Shell 脚本学习指南》
- 《鸟哥的 Linux 私房菜》

### 实践平台

- [OverTheWire: Bandit](https://overthewire.org/wargames/bandit/)
- [Exercism: Bash Track](https://exercism.org/tracks/bash)

---

*文档整理于 2026 年 5 月，基于 Bash 4.x/5.x 和 Linux 最佳实践。*
