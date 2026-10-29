---
title: "G4 DMVPN 与传统分支"
date: "2026-10-24T10:00:00+08:00"
draft: false
description: "传统分支的 DMVPN、IPsec、EIGRP、HSRP 与终端接入。"
categories:
  - "计算机网络"
tags:
  - "CCIE"
  - "EVE-NG"
  - "DMVPN"
  - "IPsec"
showToc: true
tocOpen: true
---

课程 M2 Lab 1.11—1.14。Branch 3 双 Spoke、Branch 4 单 Spoke，经 r24 Hub 接入 DC。

## 实验前准备

课程 ZIP 缺少 Branch 3/4；在同一课程工作副本补建 r61、r62、r70、sw601、sw602、sw610、sw700 和 host61/62/71/72。路由器使用 IOL L3，交换机使用 IOL L2，终端使用 VPCS；新增 IOL 均为 512 MB。

WAN VRF、Loopback、SP BGP、加密参数和内部地址属于缺失初始配置的重建，与原始分支基线上的限定修复分别记录。保留 r24 现有隧道源和加密基线；未照抄参考答案中违反“不修改 r24”条件的 hash md5 改动。接口对应见 实际连线。

| 节点 | WAN 接口 | WAN Loopback / 隧道源 | Tunnel0 | BGP AS |
| --- | --- | --- | --- | --- |
| r61 | e0/0 100.5.61.2/30 → r5 .1 | 10.6.255.61/32 | 10.200.0.61/24 | 65006 |
| r62 | e0/0 100.6.62.2/30 → r6 .1 | 10.6.255.62/32 | 10.200.0.62/24 | 65006 |
| r70 | e0/0 100.6.70.2/30 → r6 .1 | 10.7.255.70/32 | 10.200.0.70/24 | 65007 |
| r24 Hub | DC 原有 OSPF 路径 | 10.2.255.24/32 | 10.200.0.1/24 | 65002 |

SP PE 在 fabd2 VRF 中接入 Spoke。r5/r6 使用 as-override，使 Branch 3 同 AS 的两个 NBMA Loopback 能互相学习。r70—sw700 的第二条原图链路已连接，但因未恢复其旧用途而保持关闭；本题业务使用 r70 e0/2 的 10.7.1.0/24。

![课程 EVE 总体拓扑](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/c28672d618be594c2938.png)

## Lab 1.11 DMVPN Phase 3 与 FVRF

<details>
<summary>展开题目完整中文翻译与课程原页</summary>
<p><strong>题目（QUESTION）</strong></p>
<p><strong>按照以下要求，修复导致 DC、分支 3、分支 4 之间 DMVPN 隧道不通的配置问题：</strong></p>
<ol>
<li>DMVPN 必须工作在由 IPsec 保护的 Phase 3 模式。</li>
<li>使用 FVRF 方法，防止任何涉及隧道的潜在递归路由问题影响 DMVPN。</li>
<li>不得创建新的 VRF。</li>
<li>不得修改隧道接口上的 <code>tunnel source</code> 命令。</li>
<li>在 Spoke 上不得添加新的 BGP 邻居；复用当前已建立的邻居，并按需改变其 VRF 归属。</li>
<li>完成本题的整个过程中，不得修改 DC r24 的配置。</li>
</ol>
<p><strong>课程原页</strong></p>
<p><img src="https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/a8ddf2ed51167f9d276a.png" alt="课程原页" /></p>
</details>

为 Branch 3/4 建立到 r24 的 DMVPN/IPsec，隔离外层路由并验证 Phase 3 动态直连。

NBMA 地址是隧道端点在底层网络中的地址，本实验使用各路由器 Loopback；Tunnel0 地址属于内层逻辑网络 `10.200.0.0/24`。NHRP 维护两者映射，Spoke 的 NHS 指向 Hub。

| 配置项 | 作用 |
| --- | --- |
| `tunnel source Loopback0` | 指定外层源接口 |
| `tunnel vrf WAN` | 在 WAN VRF 中查询外层目的路径 |
| `tunnel mode gre multipoint` | 单个 GRE 接口支持多个对端 |
| `ip nhrp nhs` / `ip nhrp map` | 指定 Hub 的隧道地址及 NBMA 映射 |
| `ip nhrp map multicast` | 为隧道中的组播报文提供 Hub 映射 |
| `ip nhrp shortcut` | 接收并使用 Phase 3 的更直接转发映射 |
| `tunnel protection ipsec profile` | 将 IPsec profile 应用于隧道 |

Phase 3 中，Hub 参与初始转发与路径发现，后续数据可走 Spoke 间动态映射。验证需要同时出现 NHRP shortcut、Spoke 间 SA 和流量计数。IKE 的 QM_IDLE 表示协商阶段状态，IPsec encaps/decaps 分别反映加密和解密处理计数。



WAN e0/0、Loopback0 和 BGP 地址族放进 WAN VRF。Tunnel0 留在全局业务表，以 `tunnel vrf WAN` 解析底层 NBMA。这样 EIGRP 学到的业务默认路由不会递归成为隧道底层路径。

### Spoke 配置

r61 关键配置（r62/r70 替换本地地址）：

```text
crypto keyring KR vrf WAN
 pre-shared-key address 0.0.0.0 0.0.0.0 key cisco
crypto isakmp policy 10
 encryption 3des
 hash sha
 authentication pre-share
 group 2
crypto ipsec transform-set trans esp-3des esp-md5-hmac
 mode tunnel
crypto ipsec profile prof
 set transform-set trans
 set security-association lifetime seconds 900
!
interface Tunnel0
 ip address 10.200.0.61 255.255.255.0
 no ip redirects
 ip mtu 1440
 ip nhrp network-id 1010
 ip nhrp nhs 10.200.0.1
 ip nhrp map 10.200.0.1 10.2.255.24
 ip nhrp map multicast 10.2.255.24
 ip nhrp shortcut
 tunnel source Loopback0
 tunnel mode gre multipoint
 tunnel vrf WAN
 tunnel protection ipsec profile prof
```

这些旧算法用于复现课程既有 Hub，参数不能当作新生产网络的设计推荐。

### NHRP、IPsec 与直连验证

**实际 Phase 3 直连位于 r62—r70（2026-10-28）**

在跨分支探测后的两台Spoke对照中，r62 的 `show dmvpn` 显示 NHRP Peers2：Hub `10.2.255.24` / `10.200.0.1` 为UP、属性S；Branch 4 的 `10.7.255.70` / `10.200.0.70` 为UP、属性DT1。D表示动态映射，T1表示相应路由已安装。相同NBMA下显示两条映射条目不表示有两台r70。

`show crypto ipsec sa peer 10.7.255.70` 明确显示本地端点 `10.6.255.62`、远端 `10.7.255.70`，encaps/encrypt70、decaps/decrypt70，发送及接收错误均0，有实际SPI。结合对应动态映射及此前host61/host71双向5/5，确认本轮r62—r70动态加密直连及跨分支业务通过。累计计数不用于反推某一次ping的精确报文数量。

![r62 到 r70 的动态直连和70/70加解密计数](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/649d343b279d886def0f.png)

同次r61仍仅有Hub Peer UP，对r70的定向IPsec查询无条目。该结果与Branch 3双出口设计一致：不能仅查看r61就判定Phase 3失败。当前已有实际r62—r70直连，host61到r62的完整内部逐跳路径未另行采集，不把该输出扩大为所有流量都固定使用r62。

![r61 只有Hub连接，与r62形成直连的状态对照](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/69697c9bde970d1ca7bd.png)

**r61 Hub 加密计数与 Phase 3 验证范围（2026-10-28）**

终端业务通过后，r61 的 `show dmvpn` 采样只有一个Peer：Hub外层 `10.2.255.24`、隧道 `10.200.0.1`，状态UP，属性S（静态映射）。截图内Hub对应的IPsec SA有效，encaps/encrypt78、decaps/decrypt85，发送和接收错误均0，入/出方向ESP状态ACTIVE。

![r61 到 Hub 的有效加密SA及非零计数](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/9b1aecf68a0cd77c9cf6.png)

该结果确认r61—Hub加密隧道已工作，累计计数不单独归因于某一组终端探测。采样未显示r70直连，且IPsec输出停在分页处，不能将截图写成r61—r70直连通过。Branch 3同时有r61/r62出口，后续在持续跨分支流量期间对照两台的DMVPN及到 `10.7.255.70` 的SA，确定实际Spoke间路径；未因缺少单台直连样本而改配置。

**关机后环境恢复复测（2026-10-28）**

重新启动依赖并收敛后，r61 WAN VRF 恢复 Hub `10.2.255.24/32` 的 BGP 路由，下一跳 `100.5.61.1`、距离20；以 `10.6.255.61` 为源到Hub探测5/5。

![关机后 r61 的外层路由和指定源探测恢复](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/5389d7f774a1271751f5.png)

r24 再次显示3个动态 NHRP Peer UP：r61/r62/r70 对应 `10.200.0.61`、`.62`、`.70`；三条IKE SA均为 QM_IDLE/ACTIVE，EIGRP65006的三个邻居均在Tunnel0建立，Q均为0。本次确认控制与路由邻接恢复，终端业务、IPsec实际加解密和Spoke直连仍按后续探测单独确认，未将此前关机后的失败计为配置缺陷。

![关机后 r24 的三分支注册、IKE与EIGRP恢复](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/4c65a6b2706b571c3136.png)

**中途关机后的状态说明（2026-10-28）**

用户补充本轮中途电脑没电并关机，前后样本不属于连续运行条件。最新截图中，r61 的 WAN VRF 再次查不到 Hub `10.2.255.24/32`，指定外层源地址的两组探测均0/5，IKE停在 MM_NO_STATE，含 deleted 条目；r24同样查不到分支外层 `10.6.255.61`，IKE表为空。当前两端外层路由均缺失，先恢复完整依赖与路由收敛，不能据此认定此前配置失效或加密参数不匹配。

![关机后 r61 缺少 Hub 外层路由，探测失败且 IKE 未建立](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/face1e074dc10d9d7a78.png)

![关机后 r24 缺少分支外层路由且 IKE 为空](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/fd1e21beb895701638d7.png)

恢复依赖包含 DC交换机 sw201/sw202/sw211/sw212、DC边界 r21/r22、Hub r24、SP1核心及PE、Spoke r61/r62/r70。先确认运行、OSPF/BGP收敛及外层双向可达，再复查 NHRP、IKE、EIGRP和终端业务。运行中的邻居、SA和动态路由需要重新建立；配置是否保留需回读核对，本次尚无配置丢失证据。不清SA、不补静态、不改加密参数作为起始处理。

**业务探测期间隧道退回 IKE 状态（2026-10-28）**

host61 到 DC `10.2.255.211` 首次超时、后4次收到 `10.6.100.2` 的 ICMP host unreachable；到 host71 `10.7.1.101` 的5次探测也由该本地网关返回不可达。host71 到 `10.6.100.101` 的5次探测由本地网关 `10.7.1.1` 返回不可达。本轮业务未通过，错误消息来源用于定位三层转发路径，不能仅凭不可达消息断言某一条路由或策略为根因。

![两分支业务探测由各自本地网关返回不可达](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/6d34bd96fd6378988dbf.png)

同期 r61 的 DMVPN Hub 状态为 IKE，而非前次UP；IPsec输出显示 `origin_is_acl,ipsec_sa_request_sent`，encaps/decaps均0，send errors45，outbound SPI为0，入/出方向ESP SA均为空。当前没有可用的ESP SA，加密业务未恢复；尚未形成可验证的Phase 3分支直连。

![r61 到 Hub 处于 IKE 状态且没有有效 ESP SA](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/5e6c202b3dad00408f5d.png)

本次远程辅助查询 EVE API 遇到连接中断，随后两个直接控制台连接未取得输出，未获得新的有效设备诊断信息。未清除SA、未修改配置；后续先重新核对外层路由及双向可达性，再检查两端IKE状态。此前三分支UP和IKE正常的采样仍保留为历史恢复状态，不等同当前状态。

**补齐 DC 边界后的恢复结果（2026-10-28）**

启动 r21/r22 并等待路由收敛后，r61 的 WAN VRF 出现 Hub `10.2.255.24/32` 的 BGP 路由，下一跳 `100.5.61.1`、距离20、AS Hops 2。从外层 Loopback `10.6.255.61` 发往 Hub 的探测由先前0/5恢复到5/5。

![r61 学到 Hub 外层路由并探测5/5](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/79e94abddb31019f898a.png)

r24 的 `show dmvpn` 显示 Hub、NHRP Peers 3：外层 `10.6.255.61`、`10.6.255.62`、`10.7.255.70` 分别映射隧道地址 `10.200.0.61`、`10.200.0.62`、`10.200.0.70`，全部 UP，属性D为动态注册。

![r24 三个分支动态注册为 UP](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/7a89d5762807dd107dbd.png)

三条 IKE SA 均为 QM_IDLE/ACTIVE；EIGRP65006 的三个邻居在 Tunnel0 上建立，分别为 `.61`、`.62`、`.70`，采样队列Q均为0。本轮通过节点启动恢复外层路由、NHRP、IKE和隧道路由邻接，没有修改加密或路由策略。IKE状态不替代实际IPsec加解密计数、Phase 3分支直连或终端业务验证，这些继续按后续采样记录。

![r24 的三条 IKE SA 与 Tunnel0 EIGRP 邻居恢复](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/6687b25aefb613898bd5.png)

**DC 边界启动依赖与命令修正（2026-10-28）**

r61 的物理接口、Loopback0 和 Tunnel0 均 up/up；所给 `show bgp ipv4 unicast vrf WAN summary` 在当前镜像报语法错误，实测可用命令为 `show bgp vpnv4 unicast vrf WAN summary`。有效查询显示到 r5 `100.5.61.1` 的 BGP 已建立，收到2个前缀；WAN 表有其他 Spoke 的 `10.6.255.62/32`、`10.7.255.70/32`，但没有 Hub 路由，也没有默认路由。

r5 的 fabd2 表同样查不到 `10.2.255.24`；VPNv4 汇总到 r3 接收0、到 r6接收2。实时 EVE 检查发现 DC 边界 r21、r22 均停止，而 r24、r3、r5、r61 已运行。前面的 G4 启动清单遗漏了 DC 向运营商发布路由的边界节点，本次先补齐这一依赖，再验证 Hub 通告及隧道恢复，不用静态路由绕过。

![r61 接口状态与不适用的 BGP 查询语法](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/84a463e8db6b2787df7e.png)

![r5 缺少 Hub 路由，但本地客户 BGP 已建立](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/164f951ff77cbbb1fd5c.png)

兼容命令和实际路由见 r61 查询、r5 查询。节点停机为明确依赖缺口，启动后仍需用路由和通信结果确认恢复。

**外层可达性定位（2026-10-28）**

r24 的 Tunnel0（`10.200.0.1`）显示 up/up，但 `show dmvpn` 无邻居、`show ip nhrp` 无映射，IKE SA 与 EIGRP65006 邻居也为空。mGRE 接口 up/up 不代表远端注册及加密已成功；Tunnel1/2 属于既有其他配置，不作为本次 Tunnel0 的验收依据。

![r24 Tunnel0 为 up/up，但没有 NHRP 注册](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/66e62e824cccc7b9ea52.png)

r61 在 WAN VRF 查询 Hub 外层地址 `10.2.255.24` 返回 `% Subnet not in table`；从 `10.6.255.61` 为源在 WAN VRF 发起的5次探测全部超时。当前已确认被测外层路径不可达，下一步核对 WAN 表中的默认/明细路由、CE—PE BGP 及 DC 方向通告，尚未修改配置，也未将缺路由直接归因于某一条策略。

![r61 WAN VRF 的 Hub 路由查询及指定源探测失败](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/a64b3fea0175bbf339f6.png)

**本轮初始采样（2026-10-28）**

r24 截图中的 `show devpn` 为命令拼写错误，随后单独输入 dmvpn 触发名称解析；正确查询为 `show dmvpn`。有效的 `show crypto isakmp sa` 未列出 SA，`show ip eigrp neighbors` 显示 AS65006 但没有邻居，本轮尚未确认隧道及动态路由恢复。

![r24 初始空 SA、空 EIGRP 邻居及命令拼写记录](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/e17446448c642ac193dd.png)

EVE API 核对 r24、r61/r62/r70、SP1 r1/r2/r3/r5/r6、DC sw201/sw202/sw211/sw212 均运行。节点运行不等于底层 NBMA 路径、NHRP 注册或 IPsec 已正常；下一步分别检查 Tunnel0、NHRP 与外层可达性。下方三邻居 UP 的结果属于此前实验记录，不作为本轮成功证据。

Hub 实测三个 NHRP 邻居 UP，三条 IKE SA 均为 QM_IDLE/ACTIVE：

![r24 三台 Spoke 已建立](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/5ab64ad81329816e8fb7.png)

跨分支终端通信后，r61 的 NHRP 出现 `10.7.1.0/24 via 10.200.0.70`，NBMA 10.7.255.70，DMVPN 标记 DT1；r70 出现到 Branch 3 用户段的动态 DT1。对应 Spoke 间 IPsec SA 有非零 encaps/decaps（例如 r61→r70 为 16/2，反向对称）。这组证据支持实际形成 Phase 3 直连，而不只是 Hub 隧道连通。原始输出见 `*-phase3-evidence.txt`。

## Lab 1.12 DMVPN EIGRP 与默认路由

<details>
<summary>展开题目完整中文翻译与课程原页</summary>
<p><strong>题目（QUESTION）</strong></p>
<p><strong>按照以下要求优化 DMVPN：</strong></p>
<ol>
<li>确保分支 3、4 通过 DMVPN 中的 EIGRP 只能收到一条默认路由。</li>
<li>默认路由必须由 r24 产生，不能使用任何静态路由、重分发或路由过滤。</li>
<li>为完成此项任务，不得修改分支 3 中 r61、r62 的配置。</li>
<li>允许给分支 4 的 r70 增加配置命令，但不得删除其任何已有配置。</li>
</ol>
<p><strong>按照以下要求配置分支 3 的 sw601、sw602：</strong></p>
<ol>
<li>r61、r62 不得向 sw601、sw602 发送 EIGRP Query。</li>
<li>sw601、sw602 必须允许将任何现有或未来的直连网络在加入 EIGRP 后发布给 r61、r62。</li>
<li>sw601、sw602 必须继续相互转发从 r61、r62 收到的默认路由。选择默认路由时，使用仅含 permit 类型条目的前缀列表。</li>
<li>sw601、sw602 不得将默认路由反向发布给 r61、r62。</li>
<li>如果以后修改了用于允许 sw601、sw602 之间传播指定 EIGRP 已学习网络的前缀列表，则同一组网络必须自动被禁止反向发布给 r61、r62，无需任何额外配置。</li>
</ol>
<p><strong>课程原页</strong></p>
<p><img src="https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/172d216721000ed296d9.png" alt="课程原页" /></p>
</details>

通过隧道 EIGRP 向分支发布默认路由，配置 stub 及受控横向路由传递。

Hub 向 Spoke 发布默认汇总，分支通过默认路径访问总部和 DC，减少需要维护的远端明细。Hub 侧同时生成汇总丢弃路由，本地真实出口需要保持正确优先级。

Branch 3 的 sw601/sw602 设置 EIGRP stub，限制查询范围及常规转告行为。leak-map 允许特定学到的路由横向传递；上联 distribute-list 再阻止这些路由回传。

PERMIT 当前精确匹配 `0.0.0.0/0`，不是允许所有 IPv4 前缀。LEAK 与 UPLINK 共同引用同一列表，使横向允许范围与上行拒绝范围保持一致。



### Hub 默认汇总

**r61 业务表与 WAN 表复查（2026-10-28）**

全局默认路由为 EIGRP65006 内部路由，距离90、metric76800640，下一跳 `10.200.0.1`、出接口 Tunnel0。另有 `10.6.11.0/30`、`10.6.13.0/30` 两条 EIGRP 路由经 `10.6.99.2` / Ethernet0/1，属于分支内部路径；因此“Hub 下发默认”不等于本机所有 EIGRP 来源只能有一条路由。

![r61 通过 Tunnel0 学到业务默认路由](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/e69ce0346bee3c3a5ff7.png)

WAN VRF 无默认路由，但有 BGP 学到的 DC 明细及其他 Spoke 外层 Loopback，下一跳为 `100.5.61.1`。其中 Hub `10.2.255.24/32` 明确走运营商，自己的 `10.6.255.61/32` 为 Loopback0 直连。缺少默认不影响这些有明细路由的外层目标。

![r61 WAN VRF 的外层明细路由经 r5](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/a362cf4505cb9146285f.png)

本轮确认用户业务默认路径与隧道外层解析分离。WAN 表中出现 `10.2.255.211/32` 不证明全局用户业务借用 WAN 表，普通业务查全局表，隧道外层根据 `tunnel vrf WAN` 查询 WAN 表。IPsec 实际加解密、终端租约和跨分支通信继续单独验证。

r24 在 EIGRP65006 的 Tunnel0 上解除 passive，并配置默认汇总；没有用静态或重分发生成分支默认路由。

```text
router eigrp ccie
 address-family ipv4 unicast autonomous-system 65006
  af-interface Tunnel0
   no passive-interface
   summary-address 0.0.0.0 0.0.0.0
```

三台 Spoke 的全局默认均为 EIGRP 内部路由，经 10.200.0.1/Tunnel0。r24 已有 ISP BGP 距离 4，避免 EIGRP 汇总的 Null0 默认抢占本机有效出口。

### Stub 与路由泄漏配置

sw601/sw602 使用同一前缀列表选择需要横向泄漏、同时禁止向上回传的路由：

```text
ip prefix-list PERMIT permit 0.0.0.0/0
route-map LEAK permit 10
 match ip address prefix-list PERMIT
route-map UPLINK deny 10
 match ip address prefix-list PERMIT
route-map UPLINK permit 20
!
router eigrp ccie
 address-family ipv4 unicast autonomous-system 65006
  eigrp stub connected leak-map LEAK
  topology base
   distribute-list route-map UPLINK out Ethernet0/1
   distribute-list route-map UPLINK out Ethernet0/2
```

e0/0 是两台交换机间的 10.6.109.0/30，未套上联过滤。新直连网段加入 EIGRP 后仍可发布；以后在 PERMIT 增加匹配项，UPLINK 的 deny 自动同步，避免参考方案固定 ACL 无法随前缀列表更新的问题。

## Lab 1.13 分支接入、HSRP 与 DHCP

<details>
<summary>展开题目完整中文翻译与课程原页</summary>
<p><strong>题目（QUESTION）</strong></p>
<p><strong>在 DC 的 sw211 上，按照以下要求补全 DHCP 服务器配置：</strong></p>
<ol>
<li>为分支 3 的 VLAN 2000（10.6.100.0/24）、VLAN 2001（10.6.101.0/24）分别创建 IPv4 DHCP 地址池 <code>br3_v2000</code>、<code>br3_v2001</code>。</li>
<li>为分支 4 的 10.7.1.0/24 子网创建 IPv4 DHCP 地址池 <code>br_v1</code>。</li>
<li>每个子网分配 .101 至 .254（包含两端）的地址，并向客户端提供正确网关。</li>
</ol>
<p><strong>在分支 3 上，按照以下要求补全并修正 sw601、sw602、sw610 的配置，使 VLAN 2000、2001 中的 HSRP 和 DHCP Relay 正常工作：</strong></p>
<ol>
<li>HSRP 必须自动使用 0000.0c9f.f000 至 0000.0c9f.ffff 范围内的虚拟 MAC 地址。</li>
<li>VLAN 2000 使用组号 100，VLAN 2001 使用组号 101。</li>
<li>sw601 必须以优先级 110 成为 VLAN 2000 的 Active 网关，Active 角色归属必须是确定的。</li>
<li>sw602 必须以优先级 110 成为 VLAN 2001 的 Active 网关，Active 角色归属必须是确定的。</li>
<li>每台 Active 交换机必须跟踪其 g0/1、g0/2 上联。任一接口 down 时，必须允许另一台交换机成为 Active；但不允许通过跟踪改变 HSRP 优先级完成此项。</li>
<li>sw601、sw602 必须都在 VLAN 2000、2001 上配置 DHCP 中继，指向 sw211 的 10.2.255.211。不过任意时刻，每个 VLAN 中只能由 Active 路由器转发 DHCP 报文。</li>
<li>将 host61、host62 分别放入 VLAN 2000、2001，确保它们获得正确的 IPv4 配置。</li>
<li>不允许使用任何形式的脚本完成此任务。</li>
</ol>
<p><strong>按照以下要求补全 r70 的配置：</strong></p>
<ol>
<li>为 g0/2 分配 IP 地址 10.7.1.1/24。</li>
<li>在该接口启用 DHCP 中继，并指向 sw211 的 DHCP 服务器地址 10.2.255.211。</li>
<li>允许在 r70 上添加一条额外缺失命令，使连接到 g0/2 的客户端能够获得 IPv4 配置。</li>
<li>确保 host71、host72 获得正确的 IPv4 配置。</li>
</ol>
<p>**原文笔误：**r70 段写为 Branch#3，主机写为 host r71/r72；按课程拓扑分别对应分支 4、host71/host72。原文接口编号保留在译文中，实际 IOL 映射见下文。</p>
<p><strong>课程原页</strong></p>
<p><img src="https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/1d58d24b438567ecca47.png" alt="课程原页" /></p>
</details>

配置分支 VLAN、HSRP、DHCP 中继和 DC 回程，验证终端互通与上联故障。

HSRP 为分支终端提供虚拟网关，Active 承担转发，Standby 备用。VLAN2000 首选 sw601，VLAN2001 首选 sw602；`preempt` 允许优先设备恢复后重新取得角色。

本节跟踪对象为上联接口的 line-protocol。`standby ... track ... shutdown` 在跟踪失败时停用对应 HSRP 组，与 G2 的 VRRP 优先级递减机制不同。带 `redundancy` 名称的 helper 绑定 HSRP 组，使 Active 负责 DHCP 中继。

DHCP 获取经过 Discover、Offer、Request、ACK 四个阶段（DORA）。故障后重新申请地址和租约到 T1 时的单播续租是不同测试，以下分别记录。



### 网关与 DHCP 配置

| VLAN | 子网/VIP | 优先 Active | 两台 SVI 地址 | DHCP pool |
| --- | --- | --- | --- | --- |
| 2000 | 10.6.100.0/24，.1 | sw601，110 | sw601 .2 / sw602 .3 | br3_v2000 |
| 2001 | 10.6.101.0/24，.1 | sw602，110 | sw601 .2 / sw602 .3 | br3_v2001 |

均使用 HSRPv2、组100/101及 preempt，另一台优先级100。两条实际上联是 e0/1、e0/2。跟踪失败触发组 shutdown，不递减优先级：

```text
track 1 interface Ethernet0/1 line-protocol
track 2 interface Ethernet0/2 line-protocol
!
interface Vlan2000
 standby version 2
 standby 100 ip 10.6.100.1
 standby 100 priority 110
 standby 100 preempt
 standby 100 name BR3_V2000
 standby 100 track 1 shutdown
 standby 100 track 2 shutdown
 ip helper-address 10.2.255.211 redundancy BR3_V2000
```

两台、两组均设置对应名称，使同一 VLAN 只有 Active 执行 DHCP 中继。sw610 e0/0 接 host61/VLAN2000，e0/1 接 host62/VLAN2001，e0/2—3 上联为 trunk。r70 e0/2 为 10.7.1.1/24，配置 helper 并纳入 EIGRP；sw700 将 host71/72 放入相同接入广播域。

sw211 三个分支池分别使用 10.6.100/24、10.6.101/24、10.7.1/24，排除 .1—.100，网关 .1。实际 DHCP Server Identifier 为 10.2.114.2，不是 helper 中写的 Loopback。

### 租约与终端验证

**关机恢复后的分支业务复测通过（2026-10-28）**

host61 保持 `10.6.100.101/24`、网关 `10.6.100.1`；host71 保持 `10.7.1.101/24`、网关 `10.7.1.1`，两者的 DHCP Server Identifier 均为 `10.2.114.2`。

| 探测 | 本次结果 |
| --- | --- |
| host61 → DC `10.2.255.211` | 5/5 |
| host61 → host71 `10.7.1.101` | 5/5 |
| host71 → host61 `10.6.100.101` | 5/5 |

![分支终端地址、到DC及跨分支双向探测通过](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/cb1095f891057dd5661f.png)

host71 到 host61 的首个应答 TTL60，后续为61，提示采样期间转发路径可能改变；仅凭TTL变化不判定Phase 3直连成功，仍需对照NHRP动态映射与对应Spoke间IPsec SA计数。本轮被测终端业务已恢复，前次关机后失败记录保留其环境条件。

**host61 重新取址与本地网关验证（2026-10-28）**

host61 重新发起 DHCP 后，取得 `10.6.100.101/24`，默认网关 `10.6.100.1`，DHCP Server Identifier 为 `10.2.114.2`。截图中的 ARP 空表出现在取址之前，不单独作为网络故障依据。有效租约表明该次地址分配成功，但不等同于后续续租及所有业务均通过。

![host61 重新取得有效 DHCP 租约](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/93c5abf13b623b10e807.png)

host61 到 HSRP 虚拟网关 `10.6.100.1` 的5次探测全部收到应答，确认该次分支用户接入到网关正常。到 DC DHCP Loopback 及 Branch 4 host71 的主动业务探测仍待本轮继续采集。

![host61 到本地虚拟网关5/5](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/511d1a9a02539e79c5b8.png)

**分支启动后地址与网关采样（2026-10-28）**

host71 启动时完成 DHCP，地址 `10.7.1.101/24`、默认网关 `10.7.1.1`，服务器标识 `10.2.114.2`。host61 同次 `show ip` 为 `0.0.0.0/0`、网关 `0.0.0.0`，尚无有效地址；该输出本身不足以判断中继或服务器故障，下一步重新发起 DHCP 并核对结果。

![host71 已获租约，host61 尚无有效 IPv4 地址](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/9d47baf0718fea5b4128.png)

sw601 的 HSRP 组100（Vlan2000）优先级110、Active local，Standby `10.6.100.3`、VIP `10.6.100.1`；组101（Vlan2001）优先级100、Standby local，Active `10.6.101.3`、VIP `10.6.101.1`，两组均有抢占标记P。该正常分工与设计一致，但不替代 host61 地址及业务验证。

![sw601 的 HSRP 正常主备分工](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/9b5306e8f9d801451243.png)

| 终端 | 实际租约 | 到 DHCP Loopback | 到 HQ host12 | 跨 Branch 3/4 |
| --- | --- | --- | --- | --- |
| host61 | 10.6.100.101/24 | 5/5 | 5/5 | 到 10.7.1.101，5/5 |
| host62 | 10.6.101.101/24 | 5/5 | 5/5 | 到 10.7.1.101，5/5 |
| host71 | 10.7.1.101/24 | 5/5 | 5/5 | 到 10.6.100.101，5/5 |
| host72 | 10.7.1.102/24 | 5/5 | 5/5 | 到 10.6.100.101，5/5 |

首次在路由刚建立时申请地址出现 Selecting/超时；收敛后四台均完成 DORA，保留首次失败与重试日志。VPCS 已 save。

### 上联故障与接管验证

**sw601 单上联故障与恢复实测（2026-10-28）**

关闭 sw601 Ethernet0/1 后，track1由Up变Down，track2仍Up；日志及状态查询确认Vlan2000组100由Active进入Init、Vlan2001组101由Standby进入Init。组优先级仍为110/100，属于跟踪触发组停用，而非优先级递减。故障阶段sw601显示两组Active地址均为sw602的 `.3`，但尚未取得sw602自身同阶段的状态截图。

![sw601 单上联关闭，track1 Down且两组HSRP进入Init](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/d1dc75dfcb540f8e2125.png)

按本轮故障/恢复操作顺序，host61到DC `10.2.255.211` 的故障阶段探测为5/5。该结果支持被测故障期间服务可达，未覆盖关断瞬间的连续流量，不能据此报告无损切换。

![故障阶段host61到DC探测5/5](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/f0bada902c270893f06e.png)

恢复Ethernet0/1后，两跟踪对象均Up，EIGRP物理邻居重新建立，sw601组100恢复Active；组101采样时为Speak，显示Active为 `10.6.101.3`。Speak是参与HSRP协商的状态，尚未采集其稳定为Standby及sw602最终状态，不将全部主备角色恢复提前判定通过。期间接口名误输命令被拒绝，随后正确进入Ethernet0/1执行no shutdown。

![上联与track恢复，组100 Active、组101仍为Speak采样](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/d7466171c31b140bdf8f.png)

恢复后的host61到DC探测再次5/5。随后补查两台最终HSRP角色，sw601的Vlan2001已由Speak稳定为Standby，正常主备分工恢复，本轮单上联故障与恢复验证完成。

| 设备 | Vlan2000 / 组100 | Vlan2001 / 组101 |
| --- | --- | --- |
| sw601 | Active，优先级110 | Standby，优先级100 |
| sw602 | Standby，优先级100 | Active，优先级110 |

两组虚拟网关仍为 `10.6.100.1`、`10.6.101.1`；终端无需修改网关。此次验证覆盖跟踪触发退出、对端接管期间业务可达和恢复后的角色回归，不作为关断瞬间零丢包或精确收敛时间的证据。

![恢复后两台HSRP最终角色正常](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/71ffb70d0fb46a680742.png)

![恢复后host61到DC探测5/5](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/88cdce8e225e3f7ca287.png)

**本轮故障前基线（2026-10-28）**

sw601组100（Vlan2000）优先级110、Active local，组101（Vlan2001）优先级100、Standby local；sw602角色相反，组100为Standby、组101为Active且优先级110。虚拟网关分别为 `10.6.100.1`、`10.6.101.1`，两台均显示抢占标记P。

sw601的track1监控Ethernet0/1、track2监控Ethernet0/2的line-protocol，均Up，两个对象均被两组HSRP跟踪。接管测试只操作sw601 Ethernet0/1，随后恢复，故障配置不保存；当前基线本身尚不作为切换通过证据。

![sw601 正常HSRP角色及两个Up的跟踪对象](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/a4e71b8ebed1374df3e9.png)

![sw602 与sw601相反的正常主备角色](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/56e2b3d3cbbb1b87a796.png)

分别关闭两台交换机 e0/1、e0/2 时，跟踪使 HSRP 进入 Init，配置优先级保持110/100。较早探测出现网关暂不可达，不能称为无损切换。

进一步对每台的 e0/1 保持故障，等待默认 HSRP 收敛后，另一台两个组均变为 Active，关联终端到 DHCP Loopback 为5/5，重新申请地址 DORA 成功。随后恢复上联。结果见 `*-takeover.txt`、`*-takeover-business.txt`，没有把重新申请地址误称为定时器触发的 T1 单播续租。

### DC 回程路由发布

HQ 到分支需要去程路由，分支访问服务后也需要回程。r24 把已有 EIGRP 分支路由引入 OSPF，在 DC 作为 ASBR 产生外部 Type-5 LSA。

`summary-address 10.6.0.0 255.255.0.0` 聚合 Branch 3 明细；`not-advertise` 抑制指定范围的外部通告。Branch 4 的 `10.7.1.0/24` 不属于 `10.6.0.0/16`，需保留独立路由。

r24 在 router ospf 上执行：

```text
redistribute eigrp 65006 subnets tag 150
summary-address 10.6.0.0 255.255.0.0
summary-address 14.0.0.0 255.0.0.0 not-advertise
```

10.6/16 和 Tunnel0 的10.200/24由真实路由来源生成 Type-5；14/8 的既有组播实验 Loopback 不外泄。Branch4 的10.7.1/24同样需要回程，单独发布；题面列的10.6/16并不覆盖它，不能仅凭这两个前缀宣称Branch4可达。

## Lab 1.14 组播命令与设备角色

<details>
<summary>展开题目完整中文翻译与课程原页</summary>
<p><strong>题目（QUESTION）</strong></p>
<p>FABD2 准备在网络中启用 PIM 稀疏模式组播路由。作为操作手册核验的一部分，需要检查不同类型路由器上组播相关命令的适用性，避免错误使用。</p>
<ul>
<li><strong>首跳路由器（First Hop）</strong>：连接组播源的路由器。</li>
<li><strong>末跳路由器（Last Hop）</strong>：连接组播接收者（订阅者）的路由器。</li>
<li><strong>中间路由器（Intermediary Hop）</strong>：位于首跳与末跳之间转发路径上的路由器。</li>
</ul>
<p><strong>针对下表每条配置命令，选出所有适用的路由器类型（可多选）：</strong></p>
<table>
<thead>
<tr>
<th>命令</th>
<th>末跳路由器</th>
<th>首跳路由器</th>
<th>中间路由器</th>
</tr>
</thead>
<tbody>
<tr>
<td>ip igmp spt-threshold</td>
<td>□</td>
<td>□</td>
<td>□</td>
</tr>
<tr>
<td>ip igmp version</td>
<td>□</td>
<td>□</td>
<td>□</td>
</tr>
<tr>
<td>ip pim register-source</td>
<td>□</td>
<td>□</td>
<td>□</td>
</tr>
<tr>
<td>ip pim sparse-mode</td>
<td>□</td>
<td>□</td>
<td>□</td>
</tr>
<tr>
<td>ip pim rp-address</td>
<td>□</td>
<td>□</td>
<td>□</td>
</tr>
</tbody>
</table>
<p>**原文笔误：**第一条命令照录题面，正确命令应为 <code>ip pim spt-threshold</code>。答案与说明放在折叠块后的实施笔记中。</p>
<p><strong>课程原页</strong></p>
<p><img src="https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/627e7f3acb227f551c3e.png" alt="课程原页" /></p>
</details>

按 First Hop、Last Hop 和中间节点整理组播命令归属，本题为角色选择。

First Hop 为靠近组播源的路由器，Last Hop 为靠近接收者的路由器，中间路由器承担组播树转发。IGMP 处理接收者成员关系，PIM 维护路由器之间的组播转发树；RP 为稀疏模式的汇合点。

SPT 是最短路径树，SPT threshold 控制从共享树切向源树的行为。下面按课程角色选择题整理命令归属，未新增组播流量实测。



本题是角色选择，不要求另建组播业务实验。

| 命令 | Last Hop | First Hop | 中间路由器 |
| --- | --- | --- | --- |
| ip pim spt-threshold | ✓ | — | — |
| ip igmp version | ✓ | — | — |
| ip pim register-source | — | ✓ | — |
| ip pim sparse-mode | ✓ | ✓ | ✓ |
| ip pim rp-address | ✓ | ✓ | ✓ |

题面写成 `ip igmp spt-threshold`，实际用于 PIM SPT 切换的是 `ip pim spt-threshold`，不照抄拼写错误。角色是逻辑职责，同一路由器可能同时承担多种角色。参见 [Cisco PIM 配置指南](https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/multicast/multicast-configuration-guide/pim.html)。

全部配置与验证日志保存操作、失败、恢复和终端输出。

**配置与证据索引**

| 功能 | 配置入口 |
| --- | --- |
| Hub 与 DC 路由发布 | [r24](/xvsf/uploads/ccie/ccie-g4/r24.cfg) |
| Branch 3 双 Spoke | [r61](/xvsf/uploads/ccie/ccie-g4/r61.cfg)、[r62](/xvsf/uploads/ccie/ccie-g4/r62.cfg) |
| Branch 3 网关与接入 | [sw601](/xvsf/uploads/ccie/ccie-g4/sw601.cfg)、[sw602](/xvsf/uploads/ccie/ccie-g4/sw602.cfg)、[sw610](/xvsf/uploads/ccie/ccie-g4/sw610.cfg) |
| Branch 4 | [r70](/xvsf/uploads/ccie/ccie-g4/r70.cfg)、[sw700](/xvsf/uploads/ccie/ccie-g4/sw700.cfg) |
| 集中 DHCP | [sw211](/xvsf/uploads/ccie/ccie-g4/sw211.cfg) |

以上为统一目录的阶段快照，包含关键片段以外的 WAN VRF、接口、路由及 DHCP 配置。故障测试记录、动态 NHRP 映射和 IPsec 计数保存在 G4 日志，临时故障配置以恢复后的状态为准。


---

本系列：[G0]({{< relref "/posts/G0-基础网络实验.md" >}}) · [G1]({{< relref "/posts/G1-架构规划与部署条件.md" >}}) · [G2]({{< relref "/posts/G2-园区网络与总部数据中心互联.md" >}}) · [G3]({{< relref "/posts/G3-运营商与跨域路由.md" >}}) · [G4]({{< relref "/posts/G4-DMVPN与传统分支.md" >}}) · [G5]({{< relref "/posts/G5-SDA与SD-WAN.md" >}}) · [G6]({{< relref "/posts/G6-可编程运维与配置恢复.md" >}}) · [完整部署]({{< relref "/posts/G7-项目完整部署执行书.md" >}})
