---
title: "从网络基础到校园网实战：三层架构、VLAN、路由、DHCP、NAT、ACL 与 HSRP"
date: 2025-08-20T10:00:00+08:00
tags:
  - 计算机网络
  - 校园网架构
  - VLAN
  - 路由交换
categories:
  - 计算机网络
description: "从网络基础、Cisco Packet Tracer 配置到校园网三层架构实战，系统梳理 VLAN、路由、DHCP、NAT、ACL、HSRP 等核心知识。"
showToc: true
draft: false
tocOpen: true
---

# 从网络基础到校园网实战：三层架构、VLAN、路由、DHCP、NAT、ACL 与 HSRP

这篇文章来自一次校园网络架构实践项目的整理。原始材料里既有计算机网络基础笔记，也有 Cisco Packet Tracer 命令、VLAN/路由/NAT/ACL 实验，以及最后形成的校园网规划汇报。直接把这些内容拼在一起会很乱，所以我按一条学习路径重新组织：

先建立网络知识框架，再理解 Cisco 设备怎么配置，最后把这些能力落到一个完整校园网项目里。

我一直觉得网络入门可以抓住三句话（当然是一位老师教给我的）：

> 网内交换机。  
> 网间路由器。  
> 安全防火墙。

交换机解决“同一个网络里怎么互联”，路由器和三层交换机解决“不同网络之间怎么转发”，防火墙或 ACL 解决“哪些流量该允许，哪些流量该拒绝”。校园网设计，本质上就是把教学、办公、宿舍、服务器这些业务边界，翻译成 VLAN、网段、路由和访问控制策略。

## 目录

- [1. 学习地图：把零散知识放进一张网](#1-学习地图把零散知识放进一张网)
- [2. 网络基础：命令、OSI 与 TCP/IP](#2-网络基础命令osi-与-tcpip)
- [3. IP 编址与常见协议](#3-ip-编址与常见协议)
- [4. Cisco IOS 与 Packet Tracer 基础](#4-cisco-ios-与-packet-tracer-基础)
- [5. 路由知识体系：直连、静态、默认、动态](#5-路由知识体系直连静态默认动态)
- [6. 交换网络知识体系：VLAN、Trunk、三层交换、VTP](#6-交换网络知识体系vlantrunk三层交换vtp)
- [7. 核心服务与安全：DHCP、DNS、NAT、ACL](#7-核心服务与安全dhcpdnsnatacl)
- [8. 高可用与链路能力：HSRP、VRRP、LACP](#8-高可用与链路能力hsrpvrrplacp)
- [9. 校园网项目实战](#9-校园网项目实战)
- [10. 教学楼综合实验：把知识点串起来](#10-教学楼综合实验把知识点串起来)
- [11. 验证与排障清单](#11-验证与排障清单)
- [12. 复盘：网络设计不是堆命令](#12-复盘网络设计不是堆命令)

## 1. 学习地图：把零散知识放进一张网

网络知识很容易学散。今天学 OSI，明天学 TCP，后天学 VLAN，再后面看到 NAT、ACL、OSPF、HSRP，就像一堆互不相干的命令。整理时我更推荐用“分层 + 场景”的方式理解。

| 层次 | 你要回答的问题 | 常见技术 |
| :--- | :--- | :--- |
| 物理与链路 | 设备如何接入同一个局域网 | 网线、光纤、交换机、MAC、ARP |
| 网络层 | 不同网段之间如何通信 | IP、子网、路由表、静态路由、OSPF |
| 传输层 | 应用之间如何可靠或快速传输 | TCP、UDP、端口 |
| 应用层 | 用户最终访问什么服务 | HTTP、DNS、DHCP、FTP、SSH |
| 安全与边界 | 谁能访问谁，哪些服务对外开放 | VLAN 隔离、ACL、NAT、防火墙 |
| 可用性 | 设备或链路故障后是否还能工作 | HSRP、VRRP、链路聚合 |

对校园网来说，这些知识都会落地：

- 教学楼、宿舍、办公楼要划不同 VLAN。
- 每个 VLAN 要有自己的网关和 IP 地址池。
- 终端通过 DHCP 自动拿地址。
- 内网访问外网要做 NAT。
- 外网只能访问 Web 服务器，不能访问教务系统。
- 核心交换机不能成为单点故障，所以要做网关冗余。

下面先从基础知识开始铺路。

## 2. 网络基础：命令、OSI 与 TCP/IP

### 2.1 什么是网络

网络是指通过通信协议和物理介质，把独立设备连接起来，实现信息传输和资源共享的系统。按范围可以分为局域网 LAN、城域网 MAN、广域网 WAN、个域网 PAN 等；按地址可达性又可以分为公网和私网。

校园网一般属于大型局域网或园区网。它内部会使用私有地址，例如 `192.168.0.0/16`，通过出口设备 NAT 后访问互联网。

### 2.2 常用排障命令

网络排障的第一步不是改配置，而是确认问题在哪一层。

| 命令 | Windows | Linux/macOS | 用途 |
| :--- | :--- | :--- | :--- |
| 连通性测试 | `ping` | `ping` | 判断目标是否可达 |
| 查看本机地址 | `ipconfig` | `ip addr` / `ip a` | 查看 IP、掩码、网关 |
| 路径追踪 | `tracert` | `traceroute` | 查看数据包经过哪些跳 |
| DNS 查询 | `nslookup` | `dig` / `nslookup` | 验证域名解析 |

推荐排障顺序：

1. `ipconfig` 或 `ip addr`：先看自己有没有正确地址、掩码、网关、DNS。
2. `ping 网关`：确认本 VLAN 内到网关可达。
3. `ping 远端地址`：确认跨网段路由是否正常。
4. `tracert` / `traceroute`：定位数据包丢在哪一跳。
5. 查设备侧 `show ip route`、`show ip interface brief`、`show vlan brief`。

这个顺序很重要。很多网络问题不是“配置都错了”，而是某个接口没 up、某个 VLAN 没建、某条路由缺失，或者 ACL 方向写反了。

### 2.3 OSI 七层模型

OSI 是开放系统互连参考模型，不是某个具体协议。它把网络通信拆成七层：

| OSI 层次 | 作用 | 常见例子 |
| :--- | :--- | :--- |
| 7 应用层 | 为应用提供网络服务 | HTTP、DNS、FTP、SMTP |
| 6 表示层 | 编码、压缩、加密 | TLS、编码转换 |
| 5 会话层 | 建立和管理会话 | 会话控制 |
| 4 传输层 | 端到端传输 | TCP、UDP |
| 3 网络层 | 寻址与路由 | IP、ICMP、路由器 |
| 2 数据链路层 | 同一链路中的帧转发 | Ethernet、MAC、交换机、ARP |
| 1 物理层 | 比特流传输 | 网线、光纤、接口 |

这张图可以帮助记住 OSI 的上下关系。

![OSI 七层模型](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202605032026364.png)

在工程实践里，我们不需要为了背模型而背模型，而是把新知识放进去：VLAN 更偏二层，IP 和路由是三层，TCP/UDP 是四层，HTTP/DNS/DHCP 是应用层。

### 2.4 TCP/IP 模型

实际互联网更多使用 TCP/IP 协议栈来描述：

| TCP/IP 层次 | 对应 OSI | 典型协议 |
| :--- | :--- | :--- |
| 应用层 | 应用/表示/会话 | HTTP、DNS、DHCP、FTP、SSH |
| 传输层 | 传输层 | TCP、UDP |
| 网络层 | 网络层 | IP、ICMP |
| 网络接口层 | 数据链路/物理 | Ethernet、ARP |

OSI 更适合理解分层思想，TCP/IP 更贴近真实网络。

## 3. IP 编址与常见协议

### 3.1 IPv4 地址：网号 + 主机号

IPv4 地址是 32 位二进制，通常写成 4 段十进制，例如：

```plain
192.168.1.1/24
```

这里 `/24` 表示前 24 位是网络位，后 8 位是主机位。也可以写成子网掩码：

```plain
255.255.255.0
```

IP 地址不是孤立看的，必须和掩码一起看。`192.168.1.1/24` 和 `192.168.1.1/27` 代表的网络范围完全不同。

### 3.2 子网计算例子：192.168.1.129/27

已知 IP 地址为：

```plain
192.168.1.129/27
```

求网络地址、广播地址、可用 IP 范围和地址数量。

`/27` 表示网络位 27 位，主机位：

```plain
32 - 27 = 5 位
```

主机位 5 位，所以总地址数：

```plain
2^5 = 32
```

最后一段按块大小划分。`/27` 的块大小是 32：

```plain
0, 32, 64, 96, 128, 160, 192, 224
```

`129` 落在 `128 - 159` 这个块内。

| 项目 | 结果 |
| :--- | :--- |
| 网络地址 | `192.168.1.128` |
| 广播地址 | `192.168.1.159` |
| 最小可用 IP | `192.168.1.129` |
| 最大可用 IP | `192.168.1.158` |
| 总地址数 | 32 |
| 可用地址数 | 30 |

注意，可用地址数通常要排除网络地址和广播地址，所以是 `32 - 2 = 30`。

### 3.3 私有地址

常见私有 IPv4 地址范围：

| 地址范围 | CIDR |
| :--- | :--- |
| `10.0.0.0 - 10.255.255.255` | `10.0.0.0/8` |
| `172.16.0.0 - 172.31.255.255` | `172.16.0.0/12` |
| `192.168.0.0 - 192.168.255.255` | `192.168.0.0/16` |

校园网项目里大量使用 `192.168.0.0/16`，不同区域再继续划分成 `192.168.10.0/24`、`192.168.60.0/23` 等子网。

### 3.4 常见协议与端口

| 协议 | 端口 | 作用 |
| :--- | :--- | :--- |
| HTTP | TCP 80 | Web 页面访问 |
| HTTPS | TCP 443 | 加密 Web 访问 |
| FTP | TCP 20/21 | 文件传输 |
| SSH | TCP 22 | 安全远程登录 |
| Telnet | TCP 23 | 明文远程登录，不推荐 |
| SMTP | TCP 25 | 邮件发送 |
| DNS | UDP/TCP 53 | 域名解析 |
| DHCP | UDP 67/68 | 自动分配 IP |
| POP3 | TCP 110 | 邮件接收 |
| TFTP | UDP 69 | 简单文件传输 |
| SNMP | UDP 161/162 | 网络管理 |

协议和端口在 ACL、NAT 和故障排查里很重要。比如“只开放 Web”在配置里就会变成只允许 TCP 80/443 到 Web 服务器。

### 3.5 TCP 与 UDP

TCP 是面向连接、可靠传输的协议，会进行确认、重传、流量控制。HTTP、HTTPS、FTP、SSH 这类应用通常使用 TCP。

UDP 是无连接、低开销、尽力而为的协议。DNS、DHCP、语音、视频流常用 UDP。

可以粗略理解为：

| 协议 | 特点 | 适合场景 |
| :--- | :--- | :--- |
| TCP | 可靠、有连接、开销较高 | Web、文件传输、邮件 |
| UDP | 简单、无连接、低延迟 | DNS、DHCP、视频、语音 |

### 3.6 三次握手与四次挥手

TCP 建立连接需要三次握手：

1. 客户端发送 SYN。
2. 服务端回复 SYN + ACK。
3. 客户端回复 ACK。

断开连接通常需要四次挥手：

1. 一方发送 FIN。
2. 对方回复 ACK。
3. 对方发送 FIN。
4. 原发送方回复 ACK。

在校园网项目中，不一定需要详细分析 TCP 报文，但理解 TCP/UDP 的差异有助于写 ACL：限制 Web 访问时一般匹配 TCP 80/443，限制 DNS 时要考虑 UDP 53。

## 4. Cisco IOS 与 Packet Tracer 基础

### 4.1 Cisco IOS 三种常见模式

Cisco 设备配置通常从几个模式开始：

| 模式 | 提示符 | 进入方式 | 用途 |
| :--- | :--- | :--- | :--- |
| 用户执行模式 | `Router>` | 登录后默认进入 | 基础查看 |
| 特权执行模式 | `Router#` | `enable` | 查看配置、保存配置 |
| 全局配置模式 | `Router(config)#` | `configure terminal` | 修改设备配置 |
| 接口配置模式 | `Router(config-if)#` | `interface f0/0` | 配置接口 |

基础流程：

```plain
Router> enable
Router# configure terminal
Router(config)# interface f0/0
Router(config-if)# ip address 192.168.1.254 255.255.255.0
Router(config-if)# no shutdown
```

### 4.2 常用命令速查

原始笔记里有很长的 Cisco 命令大全。真正做实验时，优先掌握下面这些：

| 命令 | 作用 |
| :--- | :--- |
| `show running-config` | 查看当前运行配置 |
| `show startup-config` | 查看启动配置 |
| `copy running-config startup-config` | 保存配置 |
| `show ip interface brief` | 查看接口 IP 和 up/down 状态 |
| `show interfaces` | 查看接口详细状态 |
| `show ip route` | 查看路由表 |
| `show vlan brief` | 查看 VLAN 和端口归属 |
| `show cdp neighbors detail` | 查看直连邻居信息 |
| `show access-lists` | 查看 ACL |
| `show ip nat translations` | 查看 NAT 转换 |
| `show standby brief` | 查看 HSRP 状态 |
| `ping` | 连通性测试 |
| `traceroute` | 路径追踪 |

### 4.3 常用配置习惯

关闭 DNS 误解析：

```bash
no ip domain-lookup
```

进入接口并启用：

```bash
interface f0/0
 ip address 192.168.1.254 255.255.255.0
 no shutdown
```

保存配置：

```bash
copy running-config startup-config
```

如果是 Packet Tracer 实验，经常还会用：

```bash
do show ip route
do show vlan brief
```

`do` 可以让你在配置模式下直接执行特权模式的 show 命令，很省事。

## 5. 路由知识体系：直连、静态、默认、动态

### 5.1 什么是路由

路由是指导 IP 报文转发的路径信息。路由器收到一个数据包后，会查看目的 IP，然后查询路由表，决定下一跳发给谁。

路由表里通常有：

- 直连网络：接口配置了 IP 并且 up 后自动出现。
- 静态路由：管理员手工配置。
- 默认路由：匹配所有未知目的地址。
- 动态路由：通过 RIP、OSPF、EIGRP、BGP 等协议学习。

查看路由表：

```bash
show ip route
```

### 5.2 直连路由

只要接口配置 IP 并处于 up 状态，设备就会自动生成直连路由。

```bash
interface f0/0
 ip address 192.168.1.254 255.255.255.0
 no shutdown
```

此时路由表中会出现：

```plain
C 192.168.1.0/24 is directly connected, FastEthernet0/0
```

### 5.3 静态路由

静态路由格式：

```bash
ip route 目的网络 子网掩码 下一跳地址
```

例如 Router0 要去 `10.10.10.0/24`，下一跳是 `11.11.11.2`：

```bash
ip route 10.10.10.0 255.255.255.0 11.11.11.2
```

优点是简单、可控；缺点是网络变大后维护成本高。

### 5.4 默认路由

默认路由匹配所有未知目的地址，常用于出口方向：

```bash
ip route 0.0.0.0 0.0.0.0 192.168.200.254
```

含义是：如果路由表里没有更具体的目的网络，就把流量发给 `192.168.200.254`。

### 5.5 浮动静态路由

可以通过管理距离做备份路由：

```bash
ip route 0.0.0.0 0.0.0.0 192.168.200.1
ip route 0.0.0.0 0.0.0.0 192.168.201.1 10
```

第一条默认管理距离为 1，优先使用；第二条管理距离为 10，只有主路由失效时才生效。

### 5.6 动态路由：以 OSPF 为例

动态路由适合规模更大的网络。OSPF 是链路状态路由协议，常用于企业和园区网。

示例：

```bash
router ospf 1
 network 192.168.1.0 0.0.0.255 area 0
 network 192.168.2.0 0.0.0.3 area 0
```

验证命令：

```bash
show ip ospf neighbor
show ip route ospf
```

原始笔记里还列到了 RIP、IGRP、EIGRP、IS-IS、BGP。可以这样放进体系里理解：

| 协议 | 类型 | 常见场景 |
| :--- | :--- | :--- |
| RIP | 距离矢量 | 小型实验，实际较少 |
| EIGRP | 高级距离矢量 | Cisco 环境 |
| OSPF | 链路状态 | 企业/园区网常用 |
| IS-IS | 链路状态 | 运营商、大型网络 |
| BGP | 路径矢量 | AS 之间、互联网边界 |

校园网项目里，静态路由已经能表达核心思路；如果规模继续扩大，可以引入 OSPF。

## 6. 交换网络知识体系：VLAN、Trunk、三层交换、VTP

### 6.1 交换机做什么

交换机工作在数据链路层，主要根据 MAC 地址转发以太网帧。它解决的是同一个局域网内多台设备互联的问题。

但是如果一个校园里所有终端都在同一个二层广播域，广播流量会大，安全边界也很差。所以要用 VLAN 切分网络。

### 6.2 VLAN：把一个物理网络切成多个逻辑网络

VLAN 是虚拟局域网。它可以把同一批交换机上的端口划进不同广播域。

例如：

| VLAN | 区域 |
| :--- | :--- |
| VLAN 10 | 教学楼 |
| VLAN 20 | 电脑教室 |
| VLAN 40 | 办公楼 |
| VLAN 60 | 男生宿舍 |
| VLAN 70 | 女生宿舍 |
| VLAN 90 | 服务器区 |

创建 VLAN：

```bash
vlan 10
 name JIAOXUE
vlan 20
 name COMPUTER_ROOM
```

把端口加入 VLAN：

```bash
interface f0/1
 switchport mode access
 switchport access vlan 10
```

验证：

```bash
show vlan brief
```

### 6.3 Access 与 Trunk

Access 端口一般连接终端，只属于一个 VLAN。Trunk 端口一般连接交换机或三层设备，可以承载多个 VLAN。

配置 Trunk：

```bash
interface f0/1
 switchport trunk encapsulation dot1q
 switchport mode trunk
```

常见报错：

```plain
command rejected: An interface whose trunk encapsulation is "Auto" can not be configured to "trunk" mode
```

解决方法通常是先指定封装：

```bash
switchport trunk encapsulation dot1q
switchport mode trunk
```

### 6.4 三层交换机与 SVI

普通二层交换机只能在同一 VLAN 内转发。不同 VLAN 之间通信，需要三层设备。

三层交换机可以创建 SVI，也就是 VLAN 虚拟接口：

```bash
interface vlan 10
 ip address 192.168.10.254 255.255.255.0
 no shutdown

interface vlan 20
 ip address 192.168.20.254 255.255.255.0
 no shutdown

ip routing
```

`ip routing` 用来开启三层转发。此时 VLAN 10 和 VLAN 20 之间可以通过三层交换机路由。

### 6.5 VTP

VTP 是 Cisco 的 VLAN Trunking Protocol，用来在多台交换机之间同步 VLAN 信息。

典型配置：

```bash
vtp domain abc
vtp mode server
```

客户端：

```bash
vtp domain abc
vtp mode client
```

VTP 能减少重复创建 VLAN 的工作量，但真实网络中要谨慎使用，因为错误的 VTP 信息可能影响整个交换域。实验里可以用它理解 VLAN 同步机制。

### 6.6 为什么校园网要按区域划 VLAN

校园网不是简单按楼层连线。教学区、办公区、宿舍区、服务器区的安全要求不同，终端数量不同，访问权限也不同。

按区域划 VLAN 有几个收益：

- 减小广播域。
- 地址规划更清楚。
- 便于按业务做 ACL。
- 故障影响范围更小。
- 后续扩展更容易。

## 7. 核心服务与安全：DHCP、DNS、NAT、ACL

### 7.1 DHCP：自动分配地址

DHCP 用于自动给客户端分配 IP 地址、掩码、网关、DNS 等信息。

如果 DHCP 服务器和客户端在同一网段，可以直接响应；如果不在同一 VLAN，就需要在网关接口上配置 DHCP Relay，也就是 `ip helper-address`。

三层交换机配置：

```bash
interface vlan 10
 ip address 192.168.10.253 255.255.255.0
 ip helper-address 192.168.100.100
```

DHCP 地址池示例：

```bash
ip dhcp excluded-address 192.168.10.1 192.168.10.20
ip dhcp pool VLAN10_POOL
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.254
 dns-server 192.168.100.100
```

验证：

```bash
show ip dhcp binding
show ip dhcp pool
```

### 7.2 DNS：把域名解析成 IP

DNS 是域名系统，用来把域名映射为 IP 地址。项目中可以用 Packet Tracer 的 Server 配置 DNS，例如：

```plain
www.school.test -> 192.168.100.100
www.baidu.com   -> 2.2.2.100
```

真实校园网里通常会区分内外网解析：

- 内网 DNS：解析教务系统、内部门户、文件服务等。
- 公网 DNS：只解析对外发布的网站。

### 7.3 NAT：私网访问公网，公网访问内网服务

NAT 是网络地址转换。校园网内部使用私有地址，访问外网时需要转换成公网地址。

静态 NAT 常用于对外发布服务器：

```bash
interface f0/0
 ip nat inside

interface s0/0/0
 ip nat outside

ip nat inside source static 192.168.100.100 200.1.1.200
```

动态 NAT/PAT 常用于内网用户访问互联网：

```bash
access-list 1 permit 192.168.0.0 0.0.255.255

interface f0/0
 ip nat inside

interface s0/0/0
 ip nat outside

ip nat inside source list 1 interface s0/0/0 overload
```

其中 `overload` 表示端口复用，也就是多个内网用户共用一个公网地址访问外网。

验证：

```bash
show ip nat translations
show ip nat statistics
```

### 7.4 ACL：访问控制列表

ACL 用来匹配流量并允许或拒绝。它有两个重要细节：

1. ACL 有方向，`in` 和 `out` 是站在接口视角看的。
2. ACL 末尾有隐式 `deny any`，没有明确允许的流量会被拒绝。

标准 ACL 只能根据源地址匹配：

```bash
access-list 1 deny 192.168.1.1
access-list 1 permit any

interface f0/0
 ip access-group 1 out
```

扩展 ACL 可以匹配源、目的、协议、端口：

```bash
access-list 102 deny tcp 192.168.2.0 0.0.0.255 192.168.90.200 0.0.0.0 eq 80
access-list 102 permit ip any any
```

校园网里更推荐使用扩展 ACL，因为“谁能访问哪台服务器的哪个端口”比“谁能访问某个网段”更精确。

## 8. 高可用与链路能力：HSRP、VRRP、LACP

### 8.1 HSRP 与 VRRP

HSRP 和 VRRP 都是网关冗余协议。它们的目标类似：多台三层设备共同提供一个虚拟网关地址。

| 协议 | 厂商属性 | Cisco 常见命令 |
| :--- | :--- | :--- |
| HSRP | Cisco 私有 | `standby` |
| VRRP | 标准协议 | `vrrp` |

原始项目材料里写了 VRRP，但命令使用的是：

```bash
standby 10 ip 192.168.10.254
```

所以本文统一称为 HSRP。这里不是抠字眼，这个点在汇报或答辩里很关键。

### 8.2 HSRP 配置示例

MS1：

```bash
interface vlan 10
 ip address 192.168.10.253 255.255.255.0
 standby 10 ip 192.168.10.254
 standby 10 priority 110
 standby 10 preempt
```

MS0：

```bash
interface vlan 10
 ip address 192.168.10.252 255.255.255.0
 standby 10 ip 192.168.10.254
 standby 10 priority 100
 standby 10 preempt
```

终端默认网关配置为 `192.168.10.254`。正常情况下 MS1 是 Active；当 MS1 故障时，MS0 接管。

验证：

```bash
show standby brief
```

### 8.3 LACP 与链路聚合

链路聚合可以把多条物理链路捆绑成一条逻辑链路，提高带宽并提供冗余。

静态聚合示例：

```bash
interface range f0/2 - 3
 channel-group 1 mode on
```

如果使用 LACP，常见模式是：

```bash
interface range f0/2 - 3
 channel-group 1 mode active
```

校园网核心层和汇聚层之间，链路聚合可以增强主干链路能力。

## 9. 校园网项目实战

### 9.1 项目需求

某高校现有建筑包括教学楼、图书馆、两栋学生宿舍、食堂、办公楼、体育馆和 3 间电脑教室。项目需要满足：

- 所有建筑接入互联网。
- 学生宿舍约 480 个宿舍网口。
- 3 间电脑教室，每间 50 台终端。
- 办公楼超过 100 台终端。
- 服务器机房集中部署 Web、教务、DNS、DHCP 等服务。
- 仅 Web 服务器允许公网访问，其他服务器仅内网访问。
- 宿舍区不能直接访问服务器管理端口。
- 主干网络使用光纤以太技术，保证高带宽和低延迟。

这个需求可以归纳成四个关键词：

| 关键词 | 具体含义 |
| :--- | :--- |
| 覆盖 | 教学、办公、宿舍、食堂、体育馆都要接入 |
| 隔离 | 不同区域不能随意互访 |
| 管理 | 地址分配、网关、DNS 要集中规划 |
| 可靠 | 核心设备和主干链路要考虑冗余 |

### 9.2 三层架构总览

项目采用核心层、汇聚层、接入层三层架构：

![校园网络拓扑图](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202605032026833.png)

核心层负责全校流量转发、跨 VLAN 路由和出口互联。汇聚层按教学区、办公区、生活区、服务器区聚合。接入层负责终端接入。

这种设计的好处是职责清晰：

- 接入层只管把终端放进正确 VLAN。
- 汇聚层负责区域流量收敛。
- 核心层负责高速转发和网关冗余。

### 9.3 VLAN 与 IP 地址规划

最初如果所有区域都用 `/24`，会出现两个问题：小区域地址浪费，宿舍区地址不够。因此规划要结合终端数量调整。

原始材料中对 IP 规划做了优化：

![IP 地址规划优化](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202605032026624.png)

整理后的规划表：

| VLAN | 区域 | 网段 | HSRP 虚拟网关 | 用途 |
| :--- | :--- | :--- | :--- | :--- |
| 10 | 教学楼 | `192.168.10.0/24` | `192.168.10.254` | 教学终端 |
| 20 | 电脑教室 | `192.168.20.0/24` | `192.168.20.254` | 实验电脑 |
| 30 | 图书馆 | `192.168.30.0/24` | `192.168.30.254` | 查询与办公 |
| 40 | 办公楼 | `192.168.40.0/24` | `192.168.40.254` | 办公终端 |
| 50 | 体育馆 | `192.168.50.0/25` | `192.168.50.126` | 活动与直播 |
| 60 | 男生宿舍 | `192.168.60.0/23` | `192.168.60.254` | 高密度接入 |
| 70 | 女生宿舍 | `192.168.70.0/23` | `192.168.70.254` | 高密度接入 |
| 80 | 食堂 | `192.168.80.0/25` | `192.168.80.126` | 收银与管理 |
| 90 | 服务器区 | `192.168.90.0/25` | `192.168.90.126` | 教务、内部服务 |
| 100 | Web/服务发布区 | `192.168.100.0/24` | `192.168.100.254` | Web、DNS、DHCP |

注意：表里的网关规划可以根据实际设备调整。关键不是死记这些数字，而是让地址容量和业务规模匹配。

### 9.4 核心交换机配置：VLAN、Trunk、SVI

设备：MS1  
目的：创建 VLAN、开启 Trunk、配置三层网关和 DHCP 中继。

```bash
enable
configure terminal

vlan 10
vlan 20
vlan 30
vlan 40
vlan 50
vlan 60
vlan 70
vlan 80
vlan 90
vlan 100

interface range f0/1 - 4
 switchport trunk encapsulation dot1q
 switchport mode trunk
 exit

interface vlan 10
 ip address 192.168.10.253 255.255.255.0
 ip helper-address 192.168.100.100
 no shutdown

interface vlan 20
 ip address 192.168.20.253 255.255.255.0
 ip helper-address 192.168.100.100
 no shutdown

interface vlan 90
 ip address 192.168.90.253 255.255.255.0
 ip helper-address 192.168.100.100
 no shutdown

interface vlan 100
 ip address 192.168.100.253 255.255.255.0
 ip helper-address 192.168.100.100
 no shutdown

ip routing
```

验证：

```bash
show vlan brief
show ip interface brief
show ip route
```

### 9.5 二层交换机接入端口配置

设备：接入交换机  
目的：把不同终端端口划入对应 VLAN。

```bash
interface f0/1
 switchport mode access
 switchport access vlan 10

interface f0/5
 switchport mode access
 switchport access vlan 20

interface f0/3
 switchport mode access
 switchport access vlan 30
```

服务器区接入示例：

```bash
interface f0/1
 switchport mode access
 switchport access vlan 90

interface f0/3
 switchport mode access
 switchport access vlan 100
```

验证：

```bash
show vlan brief
```

### 9.6 DHCP Relay

项目中 DHCP 服务器位于 `192.168.100.100`，各 VLAN 的网关接口需要转发 DHCP 请求：

```bash
interface vlan 10
 ip helper-address 192.168.100.100

interface vlan 20
 ip helper-address 192.168.100.100

interface vlan 30
 ip helper-address 192.168.100.100
```

Packet Tracer 中验证时，可以把 PC 设置为 DHCP，检查是否获取到对应网段地址。

### 9.7 NAT 与公网访问

出口路由器连接校园内网和公网。内网侧为 `192.168.200.254`，公网侧为 `200.1.1.1`。

```bash
interface f0/0
 ip address 192.168.200.254 255.255.255.0
 ip nat inside
 no shutdown

interface s0/0/0
 ip address 200.1.1.1 255.255.255.0
 ip nat outside
 no shutdown
```

静态 NAT：把校园 Web 映射到公网地址：

```bash
ip nat inside source static 192.168.100.100 200.1.1.200
```

路由配置：

```bash
ip route 0.0.0.0 0.0.0.0 200.1.1.254
ip route 192.168.0.0 255.255.0.0 192.168.200.1
```

验证：

```bash
show ip nat translations
ping 200.1.1.200
```

### 9.8 ACL：限制教务系统访问

需求：仅教学相关区域可以访问教务系统，生活区和公网不能访问。

如果教务服务器在 `192.168.90.200`，建议使用扩展 ACL 更精确控制：

```bash
ip access-list extended PROTECT_JW
 permit ip 192.168.10.0 0.0.0.255 host 192.168.90.200
 permit ip 192.168.20.0 0.0.0.255 host 192.168.90.200
 permit ip 192.168.30.0 0.0.0.255 host 192.168.90.200
 deny ip any host 192.168.90.200
 permit ip any any
```

应用到服务器 VLAN 的方向要结合拓扑判断。常见做法是在靠近目标服务器的三层接口入方向或出方向控制：

```bash
interface vlan 90
 ip access-group PROTECT_JW out
```

验证：

- 教学楼 PC 访问教务服务器，应成功。
- 宿舍 PC 访问教务服务器，应失败。
- 其他正常上网流量不应被误伤。

### 9.9 HSRP：核心网关冗余

MS1：

```bash
interface vlan 10
 ip address 192.168.10.253 255.255.255.0
 standby 10 ip 192.168.10.254
 standby 10 priority 110
 standby 10 preempt

interface vlan 20
 ip address 192.168.20.253 255.255.255.0
 standby 20 ip 192.168.20.254
 standby 20 priority 110
 standby 20 preempt
```

MS0：

```bash
interface vlan 10
 ip address 192.168.10.252 255.255.255.0
 standby 10 ip 192.168.10.254
 standby 10 priority 100
 standby 10 preempt

interface vlan 20
 ip address 192.168.20.252 255.255.255.0
 standby 20 ip 192.168.20.254
 standby 20 priority 100
 standby 20 preempt
```

验证：

```bash
show standby brief
```

终端默认网关应配置为虚拟地址，例如 `192.168.10.254`，而不是某台核心交换机的真实地址。

## 10. 教学楼综合实验：把知识点串起来

原始笔记中有一个“教学楼网络搭建”实验，可以看作校园网项目的缩小版。需求如下：

1. 教学楼有七层，划分七个 VLAN，减少广播域。
2. 出口配置 NAT。
3. 所有用户自动获取 IP 和 DNS。
4. 内网 Web 服务器映射到公网，允许外网访问。
5. 第七层教务服务器只允许第六层教师访问。

编址思路：

```plain
VLAN 1 -> 192.168.1.0/24
VLAN 2 -> 192.168.2.0/24
...
VLAN 7 -> 192.168.7.0/24
```

三层交换机配置骨架：

```bash
vlan 2
vlan 3
vlan 4
vlan 5
vlan 6
vlan 7

interface vlan 1
 ip address 192.168.1.254 255.255.255.0
 no shutdown

interface vlan 2
 ip address 192.168.2.254 255.255.255.0
 no shutdown

interface vlan 7
 ip address 192.168.7.254 255.255.255.0
 no shutdown

ip routing
```

DHCP Relay：

```bash
interface vlan 1
 ip helper-address 192.168.7.100

interface vlan 2
 ip helper-address 192.168.7.100

interface vlan 7
 ip helper-address 192.168.7.100
```

出口 NAT：

```bash
interface f0/0
 ip address 192.168.200.254 255.255.255.0
 ip nat inside
 no shutdown

interface s0/0/0
 ip address 1.1.1.1 255.255.255.0
 ip nat outside
 no shutdown

access-list 1 permit 192.168.0.0 0.0.255.255
ip nat inside source list 1 interface s0/0/0 overload
ip nat inside source static tcp 192.168.7.100 80 1.1.1.1 80
```

限制教务服务器访问：

```bash
ip access-list extended PROTECT_SERVER
 permit ip 192.168.6.0 0.0.0.255 host 192.168.7.200
 deny ip any host 192.168.7.200
 permit ip any any

interface vlan 7
 ip access-group PROTECT_SERVER out
```

这个实验很适合作为校园网项目之前的练手：它包含 VLAN、三层交换、DHCP Relay、NAT、ACL，规模小但知识点完整。

## 11. 验证与排障清单

一个网络项目是否完成，不看配置写了多少，而看验证是否闭环。

### 11.1 地址获取

客户端设为 DHCP 后，应获得对应 VLAN 的地址：

| 区域 | 预期地址 |
| :--- | :--- |
| 教学楼 | `192.168.10.x` |
| 电脑教室 | `192.168.20.x` |
| 宿舍区 | `192.168.60.x` 或 `192.168.70.x` |
| 办公楼 | `192.168.40.x` |

排查命令：

```bash
show ip interface brief
show ip dhcp binding
show vlan brief
```

### 11.2 连通性

按顺序测试：

1. PC ping 自己网关。
2. PC ping 其他 VLAN 网关。
3. PC ping 服务器。
4. PC ping 公网模拟地址。
5. 外网 PC 访问公网 Web 映射地址。

如果某一步失败，就从这一层往回查。

### 11.3 NAT

```bash
show ip nat translations
show ip nat statistics
```

如果没有转换记录，重点查：

- inside/outside 接口方向是否正确。
- ACL 是否匹配内网地址。
- 默认路由是否存在。
- 回程路由是否存在。

### 11.4 ACL

ACL 验证要同时测“允许”和“拒绝”：

| 测试 | 预期 |
| :--- | :--- |
| 教学区访问教务服务器 | 成功 |
| 宿舍区访问教务服务器 | 失败 |
| 外网访问 Web | 成功 |
| 外网访问教务系统 | 失败 |
| 宿舍区正常访问互联网 | 成功 |

查看 ACL：

```bash
show access-lists
show ip interface
```

### 11.5 HSRP

```bash
show standby brief
```

模拟主核心故障后，观察备用设备是否成为 Active。终端默认网关不需要改变，仍然指向虚拟 IP。

## 12. 复盘：网络设计不是堆命令

这次校园网项目把很多网络基础知识串了起来：

- OSI/TCP-IP 帮我们定位协议所在层次。
- IP 编址和子网划分决定地址是否够用。
- VLAN 决定广播域和业务边界。
- 三层交换和路由决定不同区域如何互通。
- DHCP 和 DNS 决定终端使用体验。
- NAT 决定内外网如何转换。
- ACL 决定谁能访问谁。
- HSRP 和链路聚合决定核心故障时能不能稳住。

我觉得最核心的一句话是：

> 网络设计的本质，是把业务边界翻译成网络边界。

教学区、办公区、宿舍区、服务器区不是随便分出来的，它们代表不同的人、不同的设备、不同的风险和不同的访问关系。VLAN、网段、路由、ACL、NAT、HSRP 这些技术，最终都是为了让这些关系稳定、清晰、可控地运行。

如果后续继续优化这个项目，我会优先做这些事：

1. 把服务器区拆成内部业务区和 DMZ，Web 放 DMZ，教务系统放内部业务区。
2. 使用更精确的扩展 ACL，按端口开放服务，而不是粗放地按网段允许。
3. 为核心层和汇聚层补充链路聚合配置和故障切换测试。
4. 如果规模继续扩大，引入 OSPF 替代大量静态路由。
5. 给每个验证项补截图，形成“配置 - 现象 - 结论”的实验闭环。

这篇文章虽然很长，但它其实是在讲一条学习路径：从网络基础，到设备命令，到路由交换，再到校园网项目。只要能把这条线走通，后面看更复杂的园区网、企业网和数据中心网络，都会容易很多。
