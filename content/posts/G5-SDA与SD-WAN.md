---
title: "G5 SD-WAN 与分支互联"
date: "2026-10-26T10:00:00+08:00"
draft: false
description: "Viptela SD-WAN 控制器、vEdge、业务 VPN 与分支互联记录。"
categories:
  - "计算机网络"
tags:
  - "CCIE"
  - "EVE-NG"
  - "SD-WAN"
showToc: true
tocOpen: true
---

## 当前项目范围与进度

本项目实施真实 SD-WAN 控制与转发、vManage 管理、SP2 接入、业务 VPN、Guest 隔离和基本跨站通信。SDA、DNAC/ISE、Fabric VN 与主机自动接入不纳入完成要求。

当前五台真实 Edge 已部署，分支经 SP2 接入。VPN200 员工终端、跨分支通信、DC 服务访问已完成；Branch 2 两台 Edge 使用 VRRP 网关，主设备员工接口关闭期间业务仍可达，随后已恢复。Guest VPN199 与已有 vManage 模板保留。配置与结果见文末“普通员工接入与双 Edge 网关”。

下方保留课程原题、翻译与分步实施记录。其中“缺 SDA 平台”“Fabric 待验收”等描述仅表示课程拓展部分未做，不再计入本项目待办。文件名保留，避免破坏已有引用。

## 实验前准备

### Branch 1 控制与数据连接检查（2026-10-28）

**员工与访客路由表对照**

`show ip routes vpn 200` 的已采集部分包含总部内部链路前缀 `10.1.10.0/30`、`10.1.11.0/30`，协议为OMP，经DC Edge的TLOC `10.2.255.224/225` 转发。相同前缀的多行对应不同Edge及color路径，不表示多个业务网段。F表示已进入转发表，S表示已选中。

`show ip routes vpn 199` 的已采集部分包含OMP默认路由 `0.0.0.0/0`，经 `10.2.255.225` 的default和biz-internet两条路径；另有 `10.2.123.0/24`、`10.2.224.0/24` 等DC Guest侧前缀。员工与访客分别查询自身VPN路由表，员工业务可学习企业路由，访客通过DC出口访问模拟公网。默认路由本身不能证明访客隔离，仍需结合DC Guest VRF、策略和负向探测。

两次输出均出现 `Aborted: by user`，本次只核对可见条目，不据此认定完整路由清单、无其他企业前缀或全部隔离通过。

![Branch 1 员工VPN200与访客VPN199路由采样](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/5b7e57138b1c41bb236f.png)

在 `vEdge41-Real` 查询 control connections、OMP peers 和 BFD sessions。vSmart `10.2.255.222` 的 DTLS 控制连接及 OMP 均 Up，OMP 的 R/I/S 为516/516/2；这些是协议统计，不是516台设备或业务成功次数。vBond连接也为Up，本次输出没有vManage连接，管理连接需另查，不能据此认定三类控制器连接均正常。

BFD 列出6条Up的IPsec数据会话：DC的 `10.2.255.224`、`10.2.255.225` 各两条，Branch 2的 `10.5.255.51`、`10.5.255.52` 各一条。Branch 1传输源为 `101.40.0.2`，到Branch 2的传输目的分别为 `101.51.0.2`、`101.52.0.2`。system-ip标识设备，传输地址用于实际隧道端点；多条会话可对应同一台设备的不同TLOC。当前采样支持控制与数据连接建立，终端业务仍按VPN路由和实际探测验收。

![Branch 1 的控制连接、OMP 和六条 BFD 数据会话](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/3097a5e25ea248b373b9.png)

使用现有五台真实 vEdge 与 vManage、vBond、vSmart。控制器证书、设备身份登记和模板下发已有结果。Guest VPN199 保留原 DHCP 与出口配置，Employees VPN200 采用普通 LAN 接入；本轮完整业务配置与结果见文末。

![课程 EVE 总体拓扑](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/c28672d618be594c2938.png)

**16 GB 资源与接口映射**

EVE 已扩至 16 GB、8 vCPU，Linux 实测总内存 16002 MiB。vManage 使用 EVE 模板的 16384 MiB / 4 vCPU，vSmart 为 2048 MiB / 2 vCPU，vBond 为 1024 MiB / 1 vCPU。初始阶段仅启动控制器和 sw211、sw212；业务验证阶段再按依赖启动 Edge、服务路由器和客户端，其他课程配置保留。

![EVE 扩容后的内存](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/a4fbe6bea8440749400d.png)

| 节点 | 实际版本 | system-ip | VPN 0 传输口、地址 | VPN 512 管理口、DHCP 地址 |
| --- | --- | --- | --- | --- |
| vManage-Real（35） | 18.4.3 | 10.2.255.223 | eth0，10.2.253.2/24 → sw212 e1/2 | eth1，192.168.1.36 |
| vSmart-Real（37） | **18.4.4** | 10.2.255.222 | eth0，10.2.250.2/24 → sw211 e1/3 | eth1，192.168.1.34 |
| vBond-Real（36） | 18.4.3 | 10.2.255.221 | ge0/0，10.2.251.2/24 → sw211 e1/2 | eth0，192.168.1.35 |

vSmart 镜像目录虽然名为 `vtsmart-18.4.3`，实际 `show version` 返回 18.4.4，以设备输出为准。vBond 的 QEMU 第 0 张网卡是管理 eth0，第 1 张才是 ge0/0，不能直接套用 vSmart 的端口顺序。三个传输网关均为对应网段的 .1；sw211/sw212 沿课程已有 OSPF 互联。

完整管理服务启动后，EVE 可用内存曾降至 76 MiB，swap 使用 2184 MiB。16 GB 已允许控制器启动与验证，但不足以舒适地同时运行全部课程设备、CSR 和 SD-WAN。采用分阶段启动，不改变课程拓扑、不执行 Wipe。

**基础配置与企业 CA**

`organization-name` 标识组织，`system-ip` 是控制平面设备标识，`site-id` 标识站点；它们与实际传输接口地址用途不同。VPN0 需要到控制器的可达路径，VPN512 用于独立管理。

企业 CA 流程包含设备生成 CSR、根 CA 签发、根证书安装、设备证书安装和身份登记。CSR 携带设备公钥及主体信息，证书签名建立身份信任；证书文件有效与设备已纳管分别验证。

三个控制器统一 `organization-name CCIE-EI-LAB`、`site-id 2`，vBond 地址为 `10.2.251.2`。vBond 配置 `vbond 10.2.251.2 local`。VPN 0 配置传输地址、隧道和默认路由，VPN 512 使用管理网络 DHCP。vManage 的第二块 100 GB 薄置备磁盘已完成首次初始化。

以 vSmart 为例，实际提交的主要配置：

```text
config
system
 host-name vSmart-Real
 system-ip 10.2.255.222
 site-id 2
 organization-name CCIE-EI-LAB
 vbond 10.2.251.2
exit
vpn 0
 interface eth0
  no ip dhcp-client
  ip address 10.2.250.2/24
  tunnel-interface
   allow-service all
  exit
  no shutdown
 exit
 ip route 0.0.0.0/0 10.2.250.1
exit
commit and-quit
```

实验传输网当前放通控制器管理服务，便于 vManage 发现与证书同步。`allow-service all` 是本次实验配置，不作为生产环境管理面访问策略。

本地创建实验企业根 CA，控制器分别生成 CSR，以原 CSR 的主体和公钥签发证书。根 CA 私钥保存在 `backups-private/G5-CA`，不写入笔记。控制器证书有效期至 2027-10-26。

```text
request csr upload /home/admin/vsmart.csr
request root-cert-chain install /home/admin/root.pem
request certificate install /home/admin/vsmart.pem
show control local-properties
```

CSR 交互中的 organization-unit 两次输入 `CCIE-EI-LAB`。vBond 使用 `show orchestrator local-properties` 验证编排角色；其 `show control local-properties` 显示底层 vedge personality，不应据此误判没有运行 vBond。

vManage 在 Administration → Settings 中设置组织、vBond 地址及 Enterprise Root CA；对应真实实例 API：

```text
POST /dataservice/settings/configuration/organization
POST /dataservice/settings/configuration/device
POST /dataservice/settings/configuration/certificate
PUT  /dataservice/settings/configuration/certificate/enterpriserootca
POST /dataservice/system/device
POST /dataservice/certificate/generate/csr
POST /dataservice/certificate/install/signedCert
```

vBond、vSmart 使用传输地址注册。vManage 自身证书必须通过其管理流程登记 CSR 和安装签名证书；仅在 CLI 安装会出现设备已安装、管理数据库仍为 Not-Installed 的差异。实际通过 API 重新生成 vManage CSR、签发并安装后，三台的 `certInstallStatus` 均为 Installed，清单已同步至 vBond。

![三台控制器证书及清单同步](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/301a530d905e7308eca1.png)

**控制平面验收**

DTLS Up 表示对应控制连接建立。OMP 邻居用于 Overlay 路由交换，模板管理状态用于确认设备受 vManage 管理；终端数据转发还依赖跨站 Edge、业务前缀与数据隧道。

以下仪表盘为控制器初次验收阶段，WAN Edge 0 是当时状态。后续两台 Edge 的纳管和模板结果见后文。

```text
vManage-Real# show control connections
vSmart-Real# show control connections
vBond-Real# show orchestrator connections
vBond-Real# show orchestrator valid-vsmarts
```

实际验证：vSmart ↔ vManage 为 DTLS Up，vSmart ↔ vBond、vManage ↔ vBond 均为 Up；多条记录对应控制器的多个实例端口。vBond 授权控制器清单包含当前 vSmart、vManage 证书序列号。安装和清单同步前产生过 CRTREJSER、SERNTPRES，不能把历史错误当作当前连接状态。

初次控制器验收时，真实 GUI `https://192.168.1.36` 已登录，Dashboard 显示 vSmart 1、vBond 1、vManage 1，Control Up 1、证书 Invalid 0。此阶段 WAN Edge 0、Site 0；两台 Edge 的后续纳管结果见下一部分。

![真实 vManage 仪表盘](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/36701e9753a3a91f7080.png)

配置及验收输出集中保存在 G5 验证目录：`*-bootstrap.txt`、`*-certificate-install.txt`、`*-connections-check.txt`、`controllers-registered-verified.json`。镜像原始校验见 上传校验。

**Edge 资源与接口**

两台 Edge 都是 `vtedge-18.4.3` QEMU，实际版本 18.4.3，1 vCPU、1024 MiB、4 张网卡。system-ip 使用 .224/.225，避开控制器 .221—.223 和原 r21/r22 的地址。

| 项目 | vEdge21-Real（39） | vEdge22-Real（40） |
| --- | --- | --- |
| system-ip / BGP router-id | 10.2.255.224 | 10.2.255.225 |
| VPN512 eth0（第 0 张网卡） | DHCP 192.168.1.37 | DHCP 192.168.1.38 |
| VPN0 ge0/0（第 1 张） | 10.2.201.1/29 → sw201 e1/3 | 10.2.201.2/29 → sw201 e0/2 |
| VPN0 ge0/1（第 2 张） | 10.2.202.1/29 → sw202 e0/2 | 10.2.202.2/29 → sw202 e1/3 |
| VPN199 ge0/2（第 3 张） | 10.2.123.2/24 → r23 e0/3 | 10.2.224.2/24 → r24 e0/3 |

VPN0 两条默认路由分别指向 10.2.201.3、10.2.202.3。已有交换机 Trunk 的 native VLAN 是 4000，因此这些传输接口使用不带标签的地址；没有把管理 eth0 当作 ge0/0。两个 Edge 到 vBond `10.2.251.2` 的 ping 都为 3/3，只验证传输网络，不代表证书认证通过。


**设备身份与入网方式**

证书签发、设备身份登记和商业许可分别处理。18.4 官方流程包含授权设备清单及自动/手动证书认证；本实验采用 Enterprise CA，并通过 `request vedge add serial-num <实际证书序列号> chassis-num <实际机箱号>` 登记设备。验证分为本机列表、控制连接、vManage 纳管、模板下发及重启持久性。前四项已有后续结果，重启后的登记持久性尚未单独验收。

已核对的 CSV 入网教程使用 16.3.2 控制器起步后升级 18.4.4，与本实验的初始版本不同。本副本的实际路径为现有镜像、企业 CA 签发及本地身份登记，结果以对应设备输出为依据。

参考：[18.4 官方帮助](https://www.cisco.com/c/dam/en/us/td/docs/routers/sdwan/vManage-Help/vmanage-help-18-4.pdf)、[官方 request vedge 命令](https://www.cisco.com/c/en/us/td/docs/routers/sdwan/command/sdwan-cr-book/operational-cmd.html)。两台设备的实际证书、身份登记及验收输出分别保留。

**vEdge21 CSR 生成与证书签发**

EVE 管理地址改为 `10.32.228.100`，SSH 与控制台连接成功。主机内存 16002 MiB，可用 12758 MiB。vBond、vSmart、两台 vEdge 正在运行，vManage 停止。vEdge21 的 VPN 512 管理口仍显示旧租约 `192.168.1.37/24`，此次通过 EVE 控制台访问。

在真实 vEdge21（18.4.3）执行：

```text
request csr upload /home/admin/vedge21-lab-20261027.csr
```

两次组织单元均填写 `CCIE-EI-LAB`，设备返回 `CSR upload successful`。取回设备生成的 CSR，检查 CSR 签名有效，再用既有实验根 CA 签发证书，保持 CSR 中的设备身份和公钥。没有修改机箱号或生成激活令牌。

签发后的证书已放到设备 `/home/admin/vedge21-lab-20261027.pem`。在设备 shell 检查：

```text
openssl verify -CAfile /home/admin/root.pem /home/admin/vedge21-lab-20261027.pem
/home/admin/vedge21-lab-20261027.pem: OK
```

实际证书序列号：`22E26CA8BBFAF83CFEBE0C6F356487F226671B90`。

证书安装及本地属性查询命令，执行位置为 vEdge21 的 `#` 提示符：

```text
request certificate install /home/admin/vedge21-lab-20261027.pem
show control local-properties
```

该阶段输出对应证书签发与文件校验，安装前 vBond 的 `show orchestrator valid-vedges` 为空。设备安装、登记和控制连接的结果记录在下一节。

原始输出：CSR 生成、证书准备与校验、Edge 初始状态、vBond 清单与命令。

**设备证书安装、身份登记与 OMP**

vEdge21 安装证书后显示 `certificate-status Installed`、`certificate-validity Valid`。`token Invalid` 仍保留，但本次后续实测能够建立 DTLS 和 OMP，不能只凭 token 字段判定入网失败。

![vEdge21 安装企业 CA 签发的设备证书](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/42eb26347907017b8136.png)

![vEdge21 设备身份与传输接口](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/f0e1c28795dcbbac7266.png)

在 vBond、vSmart 各执行一次真实机箱号与证书序列号登记：

```text
request vedge add serial-num 22E26CA8BBFAF83CFEBE0C6F356487F226671B90 chassis-num 758e7fc4-481d-4924-bfaf-d4c83519a5a3 org-name CCIE-EI-LAB
request vedge add serial-num 1BA2F206EE94DB9A046D96A873492C336E29982A chassis-num 90a4ef5b-809c-40d2-90b3-2a34b4c8f752 org-name CCIE-EI-LAB
```

第一条对应 vEdge21，第二条对应 vEdge22。第二台设备同样使用自身生成的 CSR，由实验 CA 签发并安装证书。最终证书包含与第一台一致的 Authority Key Identifier 扩展。vBond 的 `show orchestrator valid-vedges`、vSmart 的 `show control valid-vedges` 均接受登记。

首次检查时，四台 DC 交换机处于停止状态，控制器与 Edge 返回 `Network is unreachable`。启动 sw211、sw201、sw202、sw212 后恢复底层依赖；其中 sw202 首次启动日志报端口绑定冲突，需单独重试。没有执行 Wipe。

验证命令：

```text
show control connections
show omp peers
show omp tlocs
```

| 检查项 | vEdge21 | vEdge22 |
| --- | --- | --- |
| 系统 IP | 10.2.255.224 | 10.2.255.225 |
| 到 vSmart 10.2.255.222 的 default 路径 DTLS | up | up |
| 到 vBond 的 default 路径 DTLS | up | up |
| OMP 邻居 10.2.255.222 | up | up |
| OMP R/I/S（双路径恢复后） | 2/0/2 | 2/0/2 |
| biz-internet 到 vBond、vSmart 的 DTLS | up | up |

vSmart 反向检查同样显示两台 Edge 的 OMP 为 up。这里证明的是现有 18.4.3 Edge 与 18.4.4 vSmart 的企业 CA、手工登记及控制平面可用，未使用 Cisco PnP 导出的设备清单。OMP 的安装计数为 0，不作为业务转发成功的证据。

该阶段 vManage 尚未启动，结果限于设备证书、身份登记、DTLS 与 OMP。后续已完成数据库纳管和模板下发；重启后清单持久性及跨站终端业务仍待验收。

原始验证：vEdge21、vEdge22、vSmart。

恢复 sw202 后，两台 Edge 的 default、biz-internet 两条路径到 vBond 和 vSmart 均为 up，OMP 保持 up。最终输出：vEdge21 双路径、vEdge22 双路径。

**平台备份与分时运行**

**初次控制器备份与入网状态**

控制器管理验收后，先执行 `request nms all stop` 并核对核心服务为 not running，再停止 vManage 节点，释放内存给 Edge/DC 阶段。此时 EVE 可用内存约 12453 MiB，约 603 MiB swap 是之前换出的存量。vManage 磁盘和配置保留，没有 Wipe；服务状态查询为 `request nms all status`，未运行时使用 `request nms all start`。

vSmart、vBond、两台 Edge 已 Export CFG 并设置为 Exported 启动配置。vManage 的 EVE Export CFG 返回 HTTP 400，已另存其实际运行配置，并对停止状态下的两块差分磁盘做独立备份，保存在 `backups-private/G5-vManage-disks-20261026/`（约 645 MB 与 2.35 GB，SHA-256 和基础镜像路径见 manifest.json）。数据库 backup 命令本次没有取得完整成功证明，不计作已验收备份；磁盘副本不等于已经完成独立恢复演练。

课程拓扑另存为 `backups-private/CCIE-EI-Course-G5-real-20261026.zip`，ZIP CRC 校验通过；它不包含真实 QEMU 基础镜像、控制器数据库和私钥。恢复真实控制器还需要匹配的基础镜像、差分磁盘及企业 CA 文件。

初次备份时 WAN Edge List 为 0，两台 Edge 尚未安装设备证书。后续已使用设备自身 CSR、企业 CA 和手工登记完成 DTLS、OMP、vManage 纳管及模板下发；此处保存的是早期平台快照。

真实 DNA Center、ISE 和 SDA 边界设备仍缺失，无法产生 Branch1/2 的真实 VN/Border 下发配置和 host41/host51 的 Fabric 接入证据。Guest iBGP 的本地验证不能替代这些题目要求，也不能替代 Guest 客户端的 DHCP、PAT 与隔离负向验证。

## Lab 2.1 DNAC 管理地址修复

<details>
<summary>展开题目完整中文翻译与课程原页</summary>
<p><strong>题目（QUESTION）</strong></p>
<p>Cisco DNA Center 首次与分支 1、2 的受管交换机建立 IP 连通后，由于设备序列号与其记录不同，会将交换机置于维护模式。与此同时，DNAC 中的管理 IP 地址会被自动追加 dummy.com 字符串。因此，首次接触后 DNAC 会失去与交换机的连接，除非修正其设置中的管理 IP 地址。</p>
<p><strong>按照以下要求，修正 DNAC 中受管交换机的 IP 地址：</strong></p>
<ol>
<li>使用 host11 等主机访问 DNAC GUI：<code>https://203.0.113.11</code>。</li>
<li>继续操作前，对所有交换机执行 Provision → Devices → Inventory → Global → Actions → Inventory → Resync Device。</li>
<li>DNAC API 参考和测试沙箱位于 <code>https://203.0.113.11/dna/apitester</code>。</li>
<li><code>network-device/update-maintenance-device-ip-address</code> API 的说明和沙箱位于 API 参考的 inventory 部分。</li>
<li>使用该 API 修正分支 1、2 交换机被追加文本的 IP 地址。</li>
</ol>
<p>**注意：**不能直接在 DNAC GUI 中修改这些地址，否则会自动再次失效；这是题目描述的 DNAC 内置行为。</p>
<p><strong>课程原页</strong></p>
<p><img src="https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/8394a922d8d967cb6b96.png" alt="课程原页" /></p>
</details>

通过 DNAC API 修复受管交换机的维护态管理地址；真实 DNAC 条件尚未具备。

Inventory 保存受管设备的标识和管理地址，Resync 用于重新同步设备信息。本题的故障发生在管理地址字段：追加文本使原 IP 地址失效，API 修复针对平台库存数据，并非交换机接口重新编址。

配置依赖为真实 DNAC 实例、目标设备 ID、维护态记录及匹配版本的 API。当前仅保留题面参数与调用入口，尚无该平台修复实测。



题面要求先对 Branch 1/2 交换机执行 Inventory Resync，再通过 `network-device/update-maintenance-device-ip-address` API 修复带 `dummy.com` 的维护态地址。真实 DNAC 尚缺，设备 ID、维护态记录、API 版本及调用结果待补。

后续入口为课程 DNAC `https://203.0.113.11`，API 文档入口 `/dna/apitester`。API 方法、请求字段和设备 ID 以该实例文档及库存数据为准。

## Lab 2.2 VN 地址池与集中 DHCP

<details>
<summary>展开题目完整中文翻译与课程原页</summary>
<p><strong>题目（QUESTION）</strong></p>
<p><strong>使用 DNA Center GUI，按照以下要求完成配置：</strong></p>
<ol>
<li>为分支 1、2 的物联网网络新增名为 IoT 的虚拟网络（VN）。</li>
<li>为 IoT VN 创建地址池：全局级别命名为 Branch1-ForIoT、Branch2-ForIoT，分支级别命名为 Branch1-IoT、Branch2-IoT。</li>
<li>为分支 1 的 IoT VN 分配 10.4.198.0/24 子网，网关为 10.4.198.1。</li>
<li>为分支 2 的 IoT VN 分配 10.5.198.0/24 子网，网关为 10.5.198.1。</li>
<li>在相应分支将 Branch1-IoT、Branch2-IoT 地址池关联到 IoT VN。</li>
<li>补全 DNAC 中 Guest VN 的地址池配置，使分支 1、2 能接入访客。如果需要新建地址池并分配地址范围，应遵循既定地址规划。</li>
<li>所有地址池均使用 DHCP 服务器 10.2.255.211 向客户端分配地址。</li>
</ol>
<p><strong>在 sw211 上，按照以下要求补全 DHCP 服务器配置：</strong></p>
<ol>
<li>为两个分支各自的 IoT、Employees VN 新建四个 DHCP 地址池：
<ul>
<li>br1_iot：分支 1 的 IoT VN。</li>
<li>br1_emp：分支 1 的 Employees VN。</li>
<li>br2_iot：分支 2 的 IoT VN。</li>
<li>br2_emp：分支 2 的 Employees VN。</li>
</ul>
</li>
<li>每个子网分配 .101 至 .254（包含两端）的地址，并向客户端提供正确网关。</li>
</ol>
<p>**原文笔误：**分支级地址池名称重复写为 Branch1-IoT；结合第 5 条，第二个应为 Branch2-IoT。</p>
<p><strong>课程原页</strong></p>
<p><img src="https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/3056ddffdb36642b64ef.png" alt="课程原页" /></p>
</details>

建立 IoT/Employees 的 VN 地址池和集中 DHCP 池，核对业务域、子网与网关。

VN 定义业务隔离范围，站点地址池定义该 VN 在分支使用的子网，DHCP pool 提供可分配地址和网关。三项配置分别位于 SDA 管理平台和服务器，需要对应一致。

IoT 的 Branch 1/2 分别使用 `10.4.198.0/24`、`10.5.198.0/24`，都由 sw211 的 `10.2.255.211` 提供 DHCP。服务器配置完成后，终端取址还依赖 Fabric 接入及到服务器的中继路径。



### VN 与地址池规划

| 站点 | VN | 子网 | 网关 | sw211 DHCP pool |
| --- | --- | --- | --- | --- |
| Branch 1 | IoT | 10.4.198.0/24 | 10.4.198.1 | br1_iot |
| Branch 1 | Employees | 10.4.200.0/24 | 10.4.200.1 | br1_emp |
| Branch 2 | IoT | 10.5.198.0/24 | 10.5.198.1 | br2_iot |
| Branch 2 | Employees | 10.5.200.0/24 | 10.5.200.1 | br2_emp |

### 集中 DHCP 配置

sw211 已建立四个地址池，排除每段 .1—.100，可分配主机范围 .101—.254。Branch 1 Employees 及 Guest 地址沿用课程的站点号/VPN 号规划，仍需与真实 DNAC 原始池核对；没有以本地地址池代替 VN 创建和关联。

示例：

```text
ip dhcp excluded-address 10.4.198.1 10.4.198.100
ip dhcp pool br1_iot
 network 10.4.198.0 255.255.255.0
 default-router 10.4.198.1
```

IoT 全局池名为 Branch1-ForIoT、Branch2-ForIoT，站点池为 Branch1-IoT、Branch2-IoT，DHCP Server 均指向 10.2.255.211。平台创建与客户端租约待真实 Fabric 就绪。

## Lab 2.3 SDA VN 与 SD-WAN VPN 映射

<details>
<summary>展开题目完整中文翻译与课程原页</summary>
<p><strong>题目（QUESTION）</strong></p>
<p><strong>M2 2.3：使用 vManage GUI，按照以下要求完成配置：</strong></p>
<ol>
<li>使用 host11 等任意主机访问 vManage GUI：<code>https://203.0.113.21</code>。</li>
<li>创建三个新的 SD-WAN VPN 承载 SDA VN 流量：
<ul>
<li>IoT VN：VPN ID 198。</li>
<li>Guest VN：VPN ID 199。</li>
<li>Employees VN：VPN ID 200。</li>
</ul>
</li>
<li>在分支 1、2 的 vEdge 上，对每个上述 VPN：
<ul>
<li>在朝向 SDA Border 交换机的接口上新建子接口，子接口的 VLAN ID 和 IP 地址必须与 DNAC 为该 VN 在 Border 上生成的配置一致。</li>
<li>在 vEdge 与 SDA Border 交换机之间建立 iBGP，确保同一 VPN 的所有站点相互可达。</li>
</ul>
</li>
</ol>
<p><strong>课程原页</strong></p>
<p><img src="https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/b920aac8d5b824325ac1.png" alt="课程原页" /></p>
</details>

将 SDA VN 映射到 SD-WAN 服务 VPN，并记录真实 Edge 模板管理结果。



业务经过 SDA Border 进入 vEdge 的对应服务 VPN，同一业务域的跨站路由由 SD-WAN 承载。子接口 VLAN、地址和 BGP 邻居以 Border 实际配置为依据。


| VN/用途 | VPN ID | 泄漏到 VPN999 的标签 |
| --- | --- | --- |
| IoT | 198 | 198 |
| Guest | 199 | 不参与企业 VPN 泄漏 |
| Employees | 200 | 200 |
| SDA Underlay | 999 | 保留原有语义 |

vEdge 子接口的 VLAN 和地址依据 DNAC 实际生成的 Border 配置确定；VPN ID 与 VLAN 号分别记录。边界与 vEdge 使用 iBGP，目标为同一 VPN 跨站互通。


### 设备发现与模板预览

EVE 管理地址恢复为 `192.168.1.19`。vManage 原先保留 `10.32.228.116` 租约；检查发现 pnet0 仅有 eth0，五台 SD-WAN 虚机的管理 TAP 口未加入网桥。根据实验 XML 的 network 54 → pnet0 映射恢复管理 TAP 桥接，再对 vManage VPN512/eth1 shutdown、提交、no shutdown、提交，重新获得 `192.168.1.36/24`。

vManage 18.4.3 启动时 NMS 进程先显示 running，8443 尚未监听；随后应用日志继续更新且 8443 开始监听。未修改 Java 参数，未将初始化期间的高 CPU 判为永久故障。

在 vManage 执行与 vBond、vSmart 相同的两条 `request vedge add`，两台 Edge 的 DTLS 到 vManage 均建立。随后 API 与 GUI 共同确认：

| 项目 | vEdge21 / vEdge22 |
| --- | --- |
| uploadSource | Auto Discovered |
| deviceState | READY |
| reachability | reachable |
| configStatusMessage | In Sync |
| templateApplyLog | Sync-from successful |
| configOperationMode | cli（尚未下发模板） |

仪表盘 WAN Edge Total、Authorized、Deployed 均为 2，Control Up 为 3，证书 Invalid 为 0。Site Health 仍显示 No WAN Connectivity，不能将设备纳管等同于跨站业务完成。

![vManage 两台 Edge 纳管仪表盘](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/6ea9a8987e44eb454b27.png)

![WAN Edge 自动发现与配置列表](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/57cfe63291208e27e5fd.png)

原始 API 输出：设备管理列表、设备状态、证书列表。

首台模板使用 `G5-vEdge21-Baseline`，设备模型 vEdge Cloud，仅绑定 vEdge21。模板源自该设备当前运行配置，保留控制连接、VPN0、Guest VPN199 和管理 VPN512，并显式保留已有 MTU、Hello 与 BGP 定时器。机箱号为平台保留变量，API 不允许手工写入模板；由目标设备身份对应。

模板操作入口：Configuration → Templates → G5-vEdge21-Baseline → Attach Devices → 选择 vEdge21-Real → Attach → Config Preview / Config Diff → Configure Devices。下图为提交前预览；任务成功、配置同步、管理模式及 OMP 结果分别记录于下发验证部分。

最终 Config Diff 仅显示 `chassis-number` 为差异项；尝试显式保留时，vManage 返回 `MTEMP0009: chassis-number is a reserved variable`，因此模板不手写该字段，目标设备仍按相同 UUID 选择。其余运行参数已对齐。实际下发结果尚待验证。

![vEdge21 模板下发前预览](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/50578f31b229f57c522f.png)

### vEdge21 模板下发

在预览页面点击 Configure Devices 后，任务先显示 Validation Success、In Progress，随后变为 Total Task: 1 / Success: 1。任务日志记录 2026-10-27 03:59:52 UTC（北京时间 11:59:52）`Template successfully attached to device`，模板为 `G5-vEdge21-Baseline`。

![模板下发中](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/e09583f9ed74e1fe2a7d.png)

![模板下发成功](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/ac5a1b5f58cae4973a41.png)

下发后通过 vManage API 与设备控制台复核：

```text
show control connections
show omp peers
show system status
```

| 检查项 | 实际结果 |
| --- | --- |
| vManage 管理模式 | vmanage |
| 配置状态 / 可达性 | In Sync / reachable |
| vManaged | true |
| Commit pending | false |
| Configuration template | G5-vEdge21-Baseline |
| 系统状态 | GREEN，All daemons up |
| default、biz-internet 到 vSmart / vBond | 均 up |
| 到 vManage 的控制连接 | up，biz-internet |
| OMP 邻居 10.2.255.222 | up，R/I/S 2/0/2 |

vEdge22 仍为 CLI 模式、In Sync，本次只下发 vEdge21。设备自身时钟显示 2026-10-26，和 vManage 日志不一致，故本节任务时间采用 vManage 日志；后续需统一时钟。该结果验证企业 CA、手工登记、自动发现、配置同步和首次模板下发链路，不代表 SDA 或跨站业务已完成。

验证输出：管理 API、设备控制台。

### vEdge22 模板下发

将 vEdge22 的实际运行配置创建为 `G5-vEdge22-Baseline`，预览后仅绑定 vEdge22-Real。2026-10-27 04:07:32 UTC（北京时间 12:07:32），任务返回 `Template successfully attached to device`，Success 为 1。

![vEdge22 模板下发成功](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/564f97758167ff025024.png)

两台设备的管理 API 均显示 `configOperationMode: vmanage`、`In Sync`、`reachable`。vEdge22 控制台复核：

```text
show system status
show control connections
show omp peers
show bgp summary
```

系统为 GREEN，vManaged 为 true，Commit pending 为 false，配置模板为 G5-vEdge22-Baseline。两种 color 到 vSmart、vBond 的 DTLS 均 up，到 vManage 的连接 up；OMP 邻居 10.2.255.222 为 up，R/I/S 为 2/0/2。

检查同时发现 Guest BGP 邻居 10.2.224.1 为 Active；EVE 显示 r23、r24 均处于停止状态，已启动这两台依赖设备，保留原有配置。

验证输出：模板任务结果、两台设备管理状态、vEdge22 下发后控制台。


启动后，r23—vEdge21、r24—vEdge22 的 Guest iBGP 均恢复 Established。vEdge21 安装默认路由及 10.2.255.211/32，vEdge22 安装默认路由；两台到各自 Guest 邻居的 ping 均为 3/3。r23/r24 接收前缀为 0，当前尚无分支 Guest 前缀输入；此阶段尚无终端探测，NAT 转换与命中计数为 0；随后启动 Internet_SP 并完成主动探测及 PAT 验证。

本次恢复仅启动停止的依赖设备，没有修改 BGP 参数。原始输出：r23、r24、vEdge21、vEdge22。

## Lab 2.4 业务 VPN 路由泄漏

<details>
<summary>展开题目完整中文翻译与课程原页</summary>
<p><strong>题目（QUESTION）</strong></p>
<p><strong>M2 2.4：为使 FABD2 传统网络与 Employees、IoT VPN/VN 通信，按照以下要求配置 SD-WAN 路由泄漏：</strong></p>
<ol>
<li>将 IoT VPN 198 的前缀导入已有 SDA Underlay VPN 999，并打上值为 198 的 tag。</li>
<li>将 Employees VPN 200 的前缀导入已有 SDA Underlay VPN 999，并打上值为 200 的 tag。</li>
<li>拒绝 DC 在 SDA Underlay VPN 999 中发布的、属于 10.4.0.0/15 范围的前缀。接受 DC 在该 VPN 发布的其他前缀，同时将其导入 IoT VPN 198 和 Employees VPN 200。</li>
<li>分支 1、2 的 VPN 999 中，从 OMP 向 OSPF 重分发时必须排除 tag 为 198、200 的 vRoute。</li>
<li>将 host41 放入 Employees VN，将 host51 放入 IoT VN，确保两台主机通过 DHCP 获得 IP 配置。</li>
<li>确保分支 1、2 的 IoT 和 Employees VPN 能访问分支 3、4。为完成此项，允许修改 VPN 999 设置。</li>
</ol>
<p><strong>课程原页</strong></p>
<p><img src="https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/9d68800ee54a34853ce0.png" alt="课程原页" /></p>
</details>

配置 IoT/Employees 与 VPN999 之间的受控路由泄漏，通过 tag 限制反馈。



路由泄漏是将选定路由从一个转发域导入另一个转发域。IoT/Employees 与 VPN999 之间有受控互访，Guest 保持独立。tag198/200 标记路由来源，反向 OMP→OSPF 引入时排除这些标记，限制路由反馈。

策略次序：VPN198/200 路由导入 VPN999 时分别打 tag198/200；DC 在 VPN999 发布的 10.4.0.0/15 范围拒收，其余允许并导入 VPN198/200；Branch 1/2 的 VPN999 中，OMP→OSPF 排除 tag198/200，防止回灌。host41 归 Employees，host51 归 IoT，验证应包含 DHCP、同 VPN 跨站和到传统 Branch 3/4 的去回程。当前策略实施与路由结果见下方；SDA 终端部分仍待实际平台。


### VPN 路由泄漏与防回灌配置

vSmart 已配置并应用两条入方向控制策略。DC 使用 site-id 2，分支使用 site-id 4、5。默认动作 accept，保留未匹配路由和 TLOC 的正常通告。

| 策略 | 匹配 | 动作 |
|---|---|---|
| G5-Branch-Leak，序号10 | 分支 VPN198 | 接受，标记 omp-tag198，导出到 VPN999 |
| G5-Branch-Leak，序号20 | 分支 VPN200 | 接受，标记 omp-tag200，导出到 VPN999 |
| G5-DC-Leak，序号10 | DC VPN999 的 10.4.0.0/15 及其明细 | 拒绝 |
| G5-DC-Leak，序号20 | DC VPN999 的其余前缀 | 接受，并导出到 VPN198、VPN200 |

```text
apply-policy
 site-list G5-Branches
  control-policy G5-Branch-Leak in
 !
 site-list G5-DC
  control-policy G5-DC-Leak in
 !
```

完整输入命令、定义与提交、应用及运行配置。通过 CLI 配置真实 vSmart；当前不是 vManage GUI 策略对象，后续若改用 GUI 集中管理，应先迁入这两条策略再激活，避免覆盖。

三台分支 Edge 已建立 IoT VPN198、Employees VPN200、SDA-Underlay VPN999。VPN999 的 OSPF 重分发使用下列本地策略：

```text
policy
 route-policy G5-No-Feedback
  sequence 10
   match
    omp-tag 198
   !
   action reject
   !
  !
  sequence 20
   match
    omp-tag 200
   !
   action reject
   !
  !
  default-action accept
 !
!
vpn 999
 router
  ospf
   redistribute omp route-policy G5-No-Feedback
```

三台均已 commit。实际配置与结果：vEdge41、vEdge51、vEdge52。尚无真实 Fabric Border 接入，VPN999 的 OSPF 暂不配置虚假的邻接接口。

DC 发布的 10.2.255.211/32 已出现在 vSmart 的 VPN198、VPN200 中，标记 C,R,Ext；通告对象包括三台分支 Edge。分支路由表可见该 OMP 路由，状态 F,S，说明 DC→企业 VPN 的路由导入实际生效。路由输出。

![vSmart 路由导出与分支接收对象](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/f4ecdeaaa771f0a96e23.png)

该结果证明控制策略和路由分发已实施；IoT/Employees 尚无真实 SDA 终端前缀，反向标签命中、Fabric OSPF 重分发、host41/host51 取址及到传统分支的业务通信仍缺实际接入条件。VPN199 不在上述导出列表内。

语法核对：[Cisco 控制策略与路由泄漏示例](https://www.cisco.com/c/en/us/support/docs/routers/sd-wan/217758-cisco-sd-wan-zone-based-firewall-zbfw.html)、[Cisco 本地路由策略说明](https://www.cisco.com/c/en/us/td/docs/routers/sdwan/configuration/policies/vedge/policies-book/control-policies.html)。

## Lab 2.5 Guest 隔离与互联网出口

<details>
<summary>展开题目完整中文翻译与课程原页</summary>
<p><strong>题目（QUESTION）</strong></p>
<p>分支 1、2 的 Guest VN/VPN 必须与公司网络的其余部分隔离，只允许通过 DC 的 r23、r24 访问互联网。</p>
<p><strong>按照以下要求，为 Guest VPN 启用互联网连接：</strong></p>
<ol>
<li>在 vEdge21、vEdge22 上，将 ge0/2 接口放入 Guest VPN 199。</li>
<li>在 r23、r24 上创建名为 Guest 的 VRF，RD 为 65002:199，并将 g4 接口放入该 VRF。</li>
<li>为这些接口分配地址：
<ul>
<li>r23 g4：10.2.123.1/24。</li>
<li>r24 g4：10.2.224.1/24。</li>
<li>vEdge21 ge0/2：10.2.123.2/24。</li>
<li>vEdge22 ge0/2：10.2.224.2/24。</li>
</ul>
</li>
<li>在 Guest VRF/VPN 中，为 r23 与 vEdge21 建立 iBGP 对等关系。</li>
<li>在 Guest VRF/VPN 中，为 r24 与 vEdge22 建立 iBGP 对等关系。</li>
<li>确保 r23、r24 通过 iBGP 学到 Guest VRF/VPN 内的路由。</li>
<li>在 r23、r24 的 Guest VRF 中配置静态默认路由，分别指向相应 ISP 地址 200.99.23.1、200.99.24.1，并通过 iBGP 向 vEdge21、vEdge22 发布该默认路由。</li>
<li>在 r23、r24 上配置 PAT，将 Guest VPN 流量转换为路由器连接 ISP 的接口地址，使其能访问互联网。复用已有 NAT ACL，不得使用 NAT 地址池。</li>
</ol>
<p><strong>按照以下要求，将 r23 配置为 Guest VPN 的 DHCP 服务器：</strong></p>
<ol>
<li>在 r23 上创建关联 Guest VRF 的 Loopback1，IP 地址为 10.2.255.211/32。</li>
<li>通过 BGP 向 vEdge21 发布该前缀。</li>
<li>为分支 1 的 Guest 子网创建地址池 br1_guest。</li>
<li>为分支 2 的 Guest 子网创建地址池 br2_guest。</li>
<li>显式地将这两个 DHCP 地址池关联到 Guest VRF。</li>
<li>每个子网分配 .101 至 .254（包含两端）的地址，并提供正确网关。</li>
<li>在 DNAC 中将 host42、host52 关联到 Guest VN，确保两台主机都获得正确地址。</li>
<li>确保 host42、host52 能 ping ISP 云中的 8.8.8.8。</li>
</ol>
<p><strong>课程原页</strong></p>
<p><img src="https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/ccd91dba22a9355dad3c.png" alt="课程原页" /></p>
</details>

隔离 Guest 路由，在 DC 提供 DHCP、默认出口与 PAT，检查 OMP 发布及访问范围。

Guest 使用独立 VRF/VPN，接入 DC 出口后通过默认路由访问实验互联网。r23/r24 在 Guest VRF 与 vEdge 建立 iBGP，企业全局表与 Guest 表分开。


静态路由末尾的 `global` 表示下一跳从全局表解析，不等于把全部企业路由导入 Guest。Guest DHCP 的 `10.2.255.211/32` 位于 r23 的 Guest 表，与 sw211 全局表中的同名地址是两个独立对象。

本节是 DC 侧基线；后续 PAT、OMP 和隔离结果记录在真实平台部分。分支客户端测试仍依赖 SDA 与分支 Edge。



### DC Guest VRF 配置

r23/r24 已创建 Guest VRF（RD 65002:199），将实际连接 vEdge 的 e0/3 置入该 VRF，移除原先无地址接口上的全局 OSPF 绑定。普通企业 PAT 保留。

| 节点 | Guest e0/3 | iBGP 对端 | VRF 默认下一跳 |
| --- | --- | --- | --- |
| r23 | 10.2.123.1/24 | 10.2.123.2 | 200.99.23.1 global |
| r24 | 10.2.224.1/24 | 10.2.224.2 | 200.99.24.1 global |

```text
vrf definition Guest
 rd 65002:199
 address-family ipv4
!
interface Ethernet0/3
 vrf forwarding Guest
 ip address 10.2.123.1 255.255.255.0
 ip nat inside
!
ip route vrf Guest 0.0.0.0 0.0.0.0 200.99.23.1 global
ip nat inside source list NAT interface Ethernet0/0 vrf Guest overload
!
router bgp 65002
 address-family ipv4 vrf Guest
  neighbor 10.2.123.2 remote-as 65002
  neighbor 10.2.123.2 activate
  network 0.0.0.0
```

r24 使用其对应地址。r23 的 Guest Loopback1 为 10.2.255.211/32，并在 Guest BGP 发布；它与全局 sw211 同地址但处于不同路由表。r23 已创建绑定 Guest VRF 的 br1_guest、br2_guest，子网分别为 10.4.199.0/24、10.5.199.0/24，网关 .1，排除 .1—.100。

`show ip route vrf Guest` 已见静态默认和本 VRF 直连前缀，没有企业内部明细泄漏。真实 vEdge 已接入后，两组 Guest iBGP 均为 Established，接收前缀和截图见下文。分支 Guest 客户端租约和跨站 PAT 尚待验证；后续已完成 DC Edge 发起的 PAT 与指定企业地址隔离对照，见文末。

实际输出见 G5 日志。

### Guest iBGP 配置与验证

vEdge21 的 Guest 配置如下，vEdge22 将 router-id 改为 `10.2.255.225`，链路和邻居改为 `10.2.224.2/24`、`10.2.224.1`：

```text
config
vpn 199
 name Guest
 interface ge0/2
  ip address 10.2.123.2/24
  no shutdown
 exit
 router bgp 65002
  router-id 10.2.255.224
  neighbor 10.2.123.1
   remote-as 65002
   address-family ipv4-unicast
   exit
   no shutdown
  exit
 exit
exit
commit and-quit
```

Viptela 的 `router bgp` 退出后仍有 router 层级，因此实际交互中以 `commit and-quit` 统一提交并返回操作模式；设备返回 `Commit complete.`。完整命令及最终配置分别保存在 `tests/G5/vEdge*-bootstrap.txt`、`backups-private/vEdge*-running-20261026.txt`。

验收命令：

```text
show bgp summary vpn 199
show ip routes vpn 199
ping 10.2.123.1 vpn 199 count 3
```

| 检查 | vEdge21 | vEdge22 |
| --- | --- | --- |
| Guest iBGP | 10.2.123.1 Established | 10.2.224.1 Established |
| 接收并安装的 BGP 前缀 | 0.0.0.0/0、10.2.255.211/32 | 0.0.0.0/0 |
| Guest 直连对端 ping | 3/3 | 3/3 |
| 当前 Guest 路由表 | 默认、Guest 链路、Guest DHCP /32 | 默认、Guest 链路 |

![vEdge21 Guest 邻接与路由](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/44d137c3f50f452a2d72.png)

![vEdge22 Guest 邻接与路由](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/6886509e7fecb0182c21.png)

r23/r24 的 `show bgp vpnv4 unicast vrf Guest summary` 同样确认邻接建立。此时 Edge 尚未向 DC 通告分支业务前缀，因此 r23/r24 的接收前缀数为 0；不能将 0 错读成邻接未建立。

### PAT、OMP 与隔离验证

Guest 业务路由经过两种协议：服务侧 iBGP 从 r23/r24 提供默认及 DHCP 路由，OMP 将相应前缀交给 vSmart。`advertise bgp` 与 `redistribute omp` 分别对应两个引入方向。

TLOC 标识传输侧端点，包含 system-ip、color 等属性。default 与 biz-internet 在本实验标识两条传输路径；同一前缀存在两条 TLOC，说明控制平面保存了多条传输定位信息，跨站数据转发仍需独立业务验证。

Internet_SP 原处于停止状态。核对实际链路：r23 e0/0—Internet_SP e0/1 使用 network 14，r24 e0/0—Internet_SP e0/2 使用 network 15。启动 Internet_SP，确认 Loopback0 为题目模拟公网地址 8.8.8.8，两条 ISP 接口分别为 200.99.23.1、200.99.24.1。此地址是课程模拟公网，不是对真实互联网连通性的测试。

在两台 Edge 执行：

```text
ping 8.8.8.8 vpn 199 count 3
```

两台均 3/3。随即在 r23、r24 执行 `show ip nat translations`、`show ip nat statistics`，确认实际经过 PAT：

| 出口 | Inside local | Inside global | 目的地址 | 首轮结果 |
| --- | --- | --- | --- | --- |
| r23 | 10.2.123.2 | 200.99.23.2 | 8.8.8.8 | ICMP 动态转换，Hits 6 |
| r24 | 10.2.224.2 | 200.99.24.2 | 8.8.8.8 | ICMP 动态转换，Hits 6 |

![r23 实际 Guest PAT 转换与计数](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/cebfc5949bf85cb067f5.png)

截图为重复探测后的计数 Hits 12。文本证据：Edge21 探测、Edge22 探测、r23 转换、r24 转换。

原基线仅有 OMP connected/static 发布，Guest BGP 学到的默认路由和 DHCP /32 没有进入 OMP。通过两台现有 vManage CLI 模板补充以下配置并重新下发，任务结果为 Success 2：

```text
vpn 199
 router
  bgp 65002
   address-family ipv4-unicast
    redistribute omp
   !
  !
 !
 omp
  advertise bgp
 !
!
```

`advertise bgp` 将本 VPN 的 BGP 路由送入 OMP；`redistribute omp` 为今后从 Overlay 学到的 Guest 前缀进入 DC BGP 准备反向路径。该配置仅作用于 VPN199，不做企业 VPN 路由泄漏。语法参考 [Cisco vEdge 路由配置文档](https://www.cisco.com/c/en/us/td/docs/routers/sdwan/configuration/routing/vEdge-20-x/routing-book/m-unicast-routing.html)，并由本机 18.4.3 模板校验、提交及运行配置确认。

vSmart 的 `show omp routes vpn 199` 已收到两台 Edge 发布的默认路由，各有 default、biz-internet 两条 TLOC；10.2.255.211/32 由 vEdge21 发布，origin-proto 为 iBGP。这两台 DC Edge 均为 site-id 2；新增分支站点与跨站数据测试见下文。

隔离对照使用已启动的 sw201 Loopback 10.2.255.201：两台 Edge 在 VPN0 中均 3/3，在 VPN199 中均 0/3，并收到 ISP 下一跳的 Destination Host Unreachable。这证明当前被测企业地址没有经 Guest 默认出口绕通；不代表所有企业地址和未来策略都已全面验证。

证据：下发结果、vSmart OMP 路由、Edge21 配置、Edge22 配置、Edge21 隔离对照、Edge22 隔离对照。

课程原始 host42/host52 经 SDA Fabric 的接入测试仍需真实平台。下文的诊断客户端只验证独立 SD-WAN Guest 路径。


![vSmart 收到 Guest DHCP 服务器前缀的两条 TLOC](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/bfe80c6327b4cfef657b.png)

G6 分时测试结束后已重新启动 vManage。HTTPS 返回 200，两台真实 Edge 均 reachable、In Sync，配置模式为 vmanage，原模板绑定保留。恢复后设备状态。

### 分支 Guest 接入与 DHCP 实测

在原课程工作副本中新增两台真实 vEdge Cloud 18.4.3。暂借 DC 的两条 VPN0 传输网段建立分支控制及数据连接；这是传输条件受限时的验证接法，与课程原始分支 WAN 链路不同。没有启用同名 IOL 占位。

| 节点 | site-id / system-ip | ge0/0 / ge0/1 | VPN199 ge0/2 |
| --- | --- | --- | --- |
| vEdge41-Real（46） | 4 / 10.4.255.41 | 10.2.201.4/29 / 10.2.202.4/29 | 10.4.199.1/24，network56 |
| vEdge51-Real（49） | 5 / 10.5.255.51 | 10.2.201.5/29 / 10.2.202.5/29 | 10.5.199.1/24，network57 |

两台使用实验 CA 签发证书，在 vBond、vSmart、vManage 登记真实 chassis/serial；vSmart 双 color 控制连接、OMP 和到 DC 的 BFD/IPsec 会话均建立。两个分支前缀已由 DC Edge 从 OMP 引入 Guest iBGP，r23/r24 具备回程路由。

分支接口实际提交配置（Branch 2 将地址换为 10.5.199.1/24）：

```text
config
vpn 199
 name Guest
 interface ge0/2
  ip address 10.4.199.1/24
  dhcp-helper 10.2.123.1
  no shutdown
 commit
end
```

**DHCP 选池与回复地址**

r23 最初能收到中继请求，却报告 `there is no address pool for 10.4.199.1`。地址池已经绑定 Guest，但接收中继请求时还需要启用 remote VRF 选池：

```text
configure terminal
ip dhcp use vrf remote
end
write memory
```

启用后 debug 显示 `client's VPN is Guest`，服务器正确分配地址并发送 Offer。`ip dhcp use vrf connected` 只处理直连客户端，不能解决这个中继请求问题。

抓包进一步发现：向 Loopback 10.2.255.211 发送请求时，r23 的 Offer/ACK 源地址及 Option54 是出口接口 10.2.123.1；当前 vEdge helper 使用 Loopback 地址时客户端无法完成租约。改为同一台 r23 的实际回复地址 10.2.123.1 后继续测试。**这是当前 IOL/vEdge 组合的兼容接法，尚未满足原题指定 Loopback 作为 DHCP 目标的要求。** 地址池、Guest VRF 和服务器设备均未换成分支本地 DHCP。

VPCS 收到 Offer 后仍停在 `DORRR`，服务器有 ACK，但客户端侧未收到完整回复。为隔离客户端差异，在同一实验增加 `G5-DHCP-Diagnostic`（IOL 节点52），仅用作 DHCP 客户端，关闭 IP 路由，不承担 SDA 功能：

```text
configure terminal
no service config
no ip domain lookup
no ip routing
interface Ethernet0/0
 ip address dhcp
 no shutdown
end
show dhcp lease
show ip route
ping 8.8.8.8
write memory
```

同一个诊断客户端先接 network56，保存后停止、切到 network57 再启动；两次均通过 DHCP 自动取得地址、掩码和默认网关，没有配置静态业务地址。

| 接入位置 | DHCP 地址 | 默认网关 | DHCP 状态 | 模拟公网 8.8.8.8 |
| --- | --- | --- | --- | --- |
| Branch 1 | 10.4.199.106/24 | 10.4.199.1 | Bound | 5/5 |
| Branch 2 | 10.5.199.102/24 | 10.5.199.1 | Bound | 5/5 |

![Branch 1 DHCP 地址、默认网关与模拟公网探测](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/c3344118eb7f92a9c772.jpg)

![Branch 2 DHCP 与模拟公网实测](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/47628aa8f38c064ff091.jpg)

Branch 2 同时探测已存在的企业地址 10.2.255.201，结果 0/5，模拟公网为 5/5；这里只证明被测地址的隔离，不扩大为所有企业前缀的全面验收。诊断客户端最终保留在 Branch 2。

文本证据：Branch 1 租约和业务、Branch 2 租约和业务、VRF 选池诊断、DHCP Offer 抓包、ACK 对照抓包。VPCS 的失败记录与 IOS 成功记录分别保留，不能以服务器绑定表代替终端证据。

### vManage 身份登记恢复

复查发现 DC 两台 Edge 的 vSmart 连接正常，但 vManage 连接被 `BIDNTVRFD` 拒绝。`show control valid-vedges` 中缺少两台 DC 的身份，补回原实验登记后恢复。四台 Edge 均为 reachable、In Sync；DC 两台保持 vmanage 模板模式，新分支目前为 CLI 模式。手工实验登记需要在控制器重启后复核，不能把模板 In Sync 当作控制连接正常的证明。

恢复使用已有证书的真实序列号与 chassis：

```text
request vedge add serial-num <已有证书序列号> chassis-num <设备UUID> org-name CCIE-EI-LAB
show control valid-vedges
```

登记前后输出保存了实际参数；证书私钥不放入笔记。四台设备最终状态、Branch 1 控制与 BFD、Branch 2 控制与 BFD。

配置已保存并导出课程工作副本，备份文件为 `backups-private/CCIE-EI-Course-G5-branches-20261027.zip`；ZIP 备份不包含 QEMU 镜像和完整运行磁盘，不能当作虚拟机快照。

**仍受平台条件限制的范围**：DNAC 管理修复、Fabric Host Onboarding、VN 与 Border 自动生成接口、原始 Fabric 终端访问，以及依赖这些业务前缀的 VPN198/200/999 路由泄漏仍不能按课程完整验收。现有诊断接法仅完成真实 SD-WAN Guest 数据路径，不把它作为 SDA 实施完成。

## Lab 2.6 静默主机

<details>
<summary>展开题目完整中文翻译与课程原页</summary>
<p><strong>题目（QUESTION）</strong></p>
<p>本题包含多个问题，可能需要向下滚动才能看到全部内容。</p>
<p><strong>未来分支 2 将部署基于 IP 的 IoT 终端。这些终端仅在被请求时才响应，也称为静默主机（silent hosts）。下列哪项 SDA 功能能使这些 IoT 终端正常连通？</strong></p>
<ol type="a">
<li>二层扩展（Layer 2 Extension）。</li>
<li>原生组播（Native Multicast）。</li>
<li>二层泛洪（Layer 2 Flooding）。</li>
<li>终端移动性（Endpoint Mobility）。</li>
</ol>
<p><strong>从下列选项中选出一项，补全句子，使其成为正确陈述：</strong></p>
<p>为了让 SDA 支持静默主机，其 Underlay 必须满足的前提是：</p>
<ol type="a">
<li>必须启用使用 PIM-SM 的 IP 组播路由。</li>
<li>除单播 IP 连通外，不需要任何额外能力。</li>
<li>必须使用 IS-IS 作为路由协议。</li>
<li>必须启用 DHCP Snooping。</li>
</ol>
<p><strong>课程原页</strong></p>
<p><img src="https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/ad554a3068d68701daef.png" alt="课程原页" /></p>
</details>

确定静默 IoT 主机的二层泛洪方案及 Underlay 组播依赖。

静默主机长时间不主动发包时，Fabric 可能尚无可用的终端定位信息。Layer 2 Flooding 将所需二层广播扩散到对应范围，使目标有机会接收 ARP 并回应。该路径依赖 Underlay 组播能力，涉及接入、发现和广播承载，不只是增加一条普通路由。



题目对应选择 Layer 2 Flooding；该方案的 Underlay 需要组播支持（PIM-SM）。静默主机通常需要收到 ARP 广播才响应，Fabric 默认的控制平面转发并不自动完成这种唤醒。此处是原理核对，未宣称实际开启功能。依据：[Cisco SD-Access 设计指南](https://www.cisco.com/c/en/us/td/docs/solutions/CVD/Campus/cisco-sda-design-guide.html)。


### DC VPN999 服务侧接入（2026-10-28）

vEdge21、vEdge22 的现有 vManage CLI 模板已补入 VPN999，分别通过 ge0/0.3999、ge0/1.3999 与 sw201、sw202 建立 OSPF area 0。四组交换机与Edge邻接均为 FULL，两台Edge到sw211 Loopback均3/3。配置、地址表、实际输出与控制器截图集中放在 [G2 的 VLAN3999 互联]({{< relref "/posts/G2-园区网络与总部数据中心互联.md#真实-edge-的-vlan3999-互联" >}})。

本项完成 DC 与 SD-WAN 服务侧接入基线。分支课程 SP2 路径和受控路由泄漏已在后续实施；普通员工终端接入已在文末完成，SDA 不在项目范围内。


### Branch 2 第二台 Edge 与 SP2 接入准备

Global_SP2 使用原课程 IOL 节点14，AS10001，Ethernet0/0 为101.22.0.1/30，与r22的101.22.0.2建立BGP邻居。启动后已收到DC服务网段和控制器网段；初始配置与路由输出保存了实际状态。

Branch 2 新增真实 vEdge52-Real（节点20、控制台32788），镜像vtedge-18.4.3，1 vCPU、1024MB RAM，位置在Branch 2分区内。创建时仅 eth0 接管理网络54；后续已安装证书并通过 SP2 加入控制平面，见下节。双 Edge 员工业务采用文末的普通 LAN 与 VRRP 接入。节点记录。创建前的完整拓扑已备份到本地私有备份目录。


vEdge52管理基线已提交：system-ip为10.5.255.52、site-id为5、organization-name为CCIE-EI-LAB、vBond为10.2.251.2。VPN512的eth0经DHCP取得192.168.1.58/24，接口Up/Up。完整配置命令与提交结果。该管理地址由DHCP分配，后续连接前需核对。


### vEdge52 的证书与课程 SP2 链路

在设备生成CSR，由现有实验CA签发设备证书，安装根证书和设备证书；三台控制器按该证书序列号与设备机箱号登记。本机显示Installed、Valid。私钥留在私有备份目录，不写入笔记。

```text
request csr upload /home/admin/vedge52-lab-20261028.csr
request root-cert-chain install /home/admin/root.pem
request certificate install /home/admin/vedge52-lab-20261028.pem
```

按课程原图，SP2与vEdge52使用101.52.0.0/30，SP2为.1、Edge为.2。实际映射为Global_SP2 Ethernet0/3 ↔ vEdge52 ge0/1，EVE网络58。SP2在BGP10001发布该直连网段；Edge通过101.52.0.1默认路由访问DC控制器。

```text
! Global_SP2
interface Ethernet0/3
 description Branch2-vEdge52-ge0/1
 ip address 101.52.0.1 255.255.255.252
 no shutdown
router bgp 10001
 network 101.52.0.0 mask 255.255.255.252
```

Edge的ge0/1在VPN0配置101.52.0.2/30，启用IPsec传输隧道、biz-internet颜色。到vBond 10.2.251.2实测3/3，说明SP2去回程已通。SP2配置、Edge配置、链路与ping结果。

初次控制连接报BIDNTVRFD。检查发现vBond、vSmart时钟停在10月27日05:49 UTC，早于新证书的10月27日08:28 UTC生效时间；两台已用`clock set date ... time ...`校准到实际UTC时间。证书、时钟命令和结果分别见证书安装、vBond时钟、vSmart时钟。


校准后vEdge52到vBond、vSmart、vManage三条DTLS连接均Up，OMP邻居10.2.255.222为Up；实际命令输出。当前OMP路由计数0/0/0，因为尚未配置该Edge的业务VPN，不代表业务网已完成。

![vManage显示五台真实Edge在线](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/2f48f06678b7c75da5e2.png)

vEdge41、vEdge51的课程SP2迁移结果见下节。后续继续补业务侧VPN。vEdge52后续已加入Branch 2员工LAN与VRRP，见文末。


### Branch 1、Branch 2 传输接入课程 SP2

两台分支 Edge 的 VPN0 已迁到课程 SP2。vEdge41-Real 对应课程 Branch 1 的 vEdge40 角色；节点名称保持现有名称。断开旧的 DC 直连传输接口，保留管理接口和 Guest VPN199 接口。

| 实际设备 | SP2 接口 | SP2 地址 | Edge ge0/1 地址 | EVE 网络 |
|---|---|---|---|---|
| vEdge41-Real（课程 vEdge40） | Ethernet0/1 | 101.40.0.1/30 | 101.40.0.2/30 | 59 |
| vEdge51-Real | Ethernet0/2 | 101.51.0.1/30 | 101.51.0.2/30 | 60 |
| vEdge52-Real | Ethernet0/3 | 101.52.0.1/30 | 101.52.0.2/30 | 58 |

SP2 在 BGP 10001 发布三个传输网段。分支沿 SP2 → r22 → DC 访问控制器。ge0/1 沿用 IPsec 隧道和 biz-internet 颜色。

以 vEdge41 为例，迁移命令如下；vEdge51 的地址与下一跳分别替换为 101.51.0.2/30、101.51.0.1。

```text
config
vpn 0
 no interface ge0/0
 interface ge0/1
  ip address 101.40.0.2/30
 exit
 no ip route 0.0.0.0/0 10.2.201.3
 no ip route 0.0.0.0/0 10.2.202.3
 ip route 0.0.0.0/0 101.40.0.1
exit
commit and-quit
```

提交后逐台停机调整传输连线再启动，未执行 Wipe。两台的 vBond、vSmart、vManage 连接均 Up，OMP 均 Up。vEdge51 在 VPN199 ping vEdge41 的 10.4.199.1，3/3 成功，说明迁移后的跨分支 Guest 路由路径可用；此项是 Edge 业务接口间通信，不作为 SDA 终端接入完成的依据。

SP2 命令、vEdge41 配置、vEdge41 控制状态、vEdge51 配置、vEdge51 控制与 Guest 通信结果。

![课程 SP2 迁移后五台 Edge 在线](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/0b0519d114d0b62e6691.png)

页面显示五台 WAN Edge 在线、控制状态均 Up。Site Health 仍显示 Partial，不据此宣称所有站点业务完成。后续内容是业务 VPN198/200/999 与课程服务侧对接。


### 配置与材料保存

本次 vSmart 路由泄漏策略、vEdge41/51/52 的完整运行配置已分别保存至 `backups-private/G5-route-leak-20261028/`，该目录包含认证配置，不在公开笔记展开。当前拓扑备份为 `backups-private/after-branch-sp2-migration.unl`。运行配置已 commit；拓扑文件与文本配置不能替代 QEMU 虚拟磁盘备份。

当前已做到：课程 SP2 传输接入、Branch 2 第二台真实 Edge、DC VLAN3999 OSPF、控制平面路由泄漏、分支标签过滤。仍缺真实 SDA 管理与 Fabric 接入，因此 DNAC 管理修复、VN/地址池下发、Border 自动生成服务接口、host41/host51 DHCP 及完整企业业务互通尚未完成。


### SDA 部署条件核对

EVE 当前48台设备中没有 DNAC/Catalyst Center、ISE、sw400、sw501、sw502、sw510。已安装 QEMU 镜像包含真实 SD-WAN 控制器、vEdge、CSR1000v、IOSv/IOSvL2 等，但没有 DNAC/Catalyst Center 或 ISE；普通 IOSvL2 不能替代课程 Fabric 功能平台。设备与镜像清单。

若单独学习 SDA，需另备课程兼容环境：管理平台、身份平台及支持课程 Fabric 角色的交换设备，也可以是已经搭好的远程实验环境。当前缺的是这些实际平台，SD-WAN 的证书与身份登记已完成，无需再补 WAN Edge 授权资料。

G1—G6 的本地图片与文件链接已检查，没有缺失链接；运行配置、原始输出与实际截图分别保存在私有备份、tests 和 images 目录。


## 普通员工接入与双 Edge 网关

### 实际接线与地址

采用普通 LAN 直接接入 Employees VPN200，满足本项目分支互联需求。已有 Guest VPN199 的 ge0/2 和终端保持原接法，不使用 SDA Fabric。

| 设备 | 业务接口 / 地址 | EVE 网络 | 终端网关 |
|---|---|---|---|
| vEdge41-Real | ge0/0，10.4.200.1/24 | 61，BR1-Employees | 10.4.200.1 |
| host41-Employees（节点23） | eth0，10.4.200.101/24 | 61 | 10.4.200.1 |
| vEdge51-Real | ge0/0，10.5.200.2/24 | 62，BR2-Employees | VRRP虚拟地址10.5.200.1 |
| vEdge52-Real | ge0/0，10.5.200.3/24 | 62 | 同上 |
| host51-Employees（节点24） | eth0，10.5.200.101/24 | 62 | 10.5.200.1 |

节点23、24为新增 VPCS 员工终端。使用静态业务地址，Guest 的 DHCP 实验仍按原记录保留。调整 Edge 空闲 ge0/0 连线时逐台停止、连接再启动，未执行 Wipe。

### VPN200 配置

ge0/0 从未使用的 VPN0 接口移到 VPN200。现有 OMP `advertise connected` 发布员工网段；vSmart 已有策略把 VPN200 路由带 tag200 导入 DC VPN999，DC Edge 再通过 OSPF 将回程交给 sw201/sw202。

```text
! vEdge41
config
vpn 0
 no interface ge0/0
exit
vpn 200
 interface ge0/0
  ip address 10.4.200.1/24
  no shutdown
 exit
exit
commit and-quit
```

Branch 2 使用相同的 VPN200，但两台 Edge 分别为 .2、.3，共用 VRRP .1。vEdge51 优先级110，vEdge52为100；`track-omp` 将网关选举与 OMP 状态关联。

```text
! vEdge51；vEdge52 将接口地址改为10.5.200.3/24，priority改为100
config
vpn 0
 no interface ge0/0
exit
vpn 200
 interface ge0/0
  ip address 10.5.200.2/24
  no shutdown
  vrrp 1
   priority 110
   ipv4 10.5.200.1
   track-omp
  exit
 exit
exit
commit and-quit
```

VPCS 分别执行以下地址命令，再 `save`：

```text
! host41
ip 10.4.200.101/24 10.4.200.1
save
! host51
ip 10.5.200.101/24 10.5.200.1
save
```

### 业务与网关结果（2026-10-28）

**员工终端跟做复查**

host41的IPv4为 `10.4.200.101/24`，网关 `10.4.200.1`。到Branch 2员工终端 `10.5.200.101`、到DC sw211服务地址 `10.2.255.211` 的两组探测均为首包超时、后四包应答，即各4/5。确认本次两条路径可达；首包超时未抓包定位，不直接归因于ARP、隧道建立或收敛，也未记为5/5。待原命令重测后补充稳定性结果。

![host41员工地址、跨分支与DC探测各4/5](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/c58b70c13aa8b33ac402.png)

员工到数据中心的路径为 `终端 → VPN200 → SD-WAN/IPsec → DC Edge VPN999 → OSPF → DC服务`；两个分支之间在 VPN200 内通过 SD-WAN 通信。

| 操作 | 实际结果 |
|---|---|
| host41 → sw211 10.2.255.211 | 3/3 |
| host51 → sw211 10.2.255.211 | 3/3 |
| host41 ↔ host51 | 两个方向各3/3 |
| host51 → HQ host12 10.1.101.101 | 首包超时，后续2次应答，已确认可达 |
| 正常 VRRP | vEdge51 Master / priority110；vEdge52 Backup / priority100，OMP均Up |
| 关闭 vEdge51 的 VPN200 ge0/0 后 | host51到DC和host41均3/3，终端网关地址不变 |
| 恢复 ge0/0 | 已no shutdown并commit；vEdge51恢复Master，接口Up/Up，vEdge52为Backup |

![员工终端地址与跨分支通信](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/6e6ba38606400efe1d7e.png)

截图中单独的 `-c 3` 是浏览器输入未完整送达产生的报错；其后的完整 `ping 10.5.200.101 -c 3` 三次应答才是跨分支证据。到DC的完整输出保存在下方日志。

![Branch 2 主网关与 OMP 状态](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/e861f012a31ba4b2f4e9.png)

接口关闭后首次采集 vEdge52 状态时仍为 Backup，采样早于接管；后续主接口保持关闭期间，终端两组探测成功。这里记录接口故障后的可用性，不推断无损切换或精确收敛时间。

冗余范围是 Branch 2 员工 LAN 的双 Edge 网关，以及现有 DC 双 Edge 路径。Branch 1 仍为单 Edge，Branch 2 两条传输都接同一 SP2；不称为双运营商冗余，也不称为 SD-WAN 与 DMVPN 互为双活。

配置：vEdge41、vEdge51、vEdge52。结果：host41、host51、访问总部、主接口关闭、关闭期间的终端结果、接口恢复、最终Master、最终Backup。

IOS配置已write memory，Edge配置已commit，VPCS地址已save。最终运行配置存于 `backups-private/closeout-20261028/`，课程拓扑为 `backups-private/after-G3-G5-closeout-20261028.unl`。本项目范围内的普通员工业务接入已补齐；SDA课程原题仅作参考。


## SD-WAN 与 DMVPN 业务分流和互备

复用原诊断节点为 G5-Hybrid-GW（IOL，512 MB），增加同一业务客户端 10.4.210.110。网关两条上联分别连接现有 SD-WAN 员工网和传统分支 HSRP 网关，不替换原分支终端。

| 网关接口 | 地址 | 连接职责 |
|---|---|---|
| e0/0 | 10.4.210.1/24 | Hybrid-Users-Linux，网络65，NAT inside |
| e0/1 | 10.4.200.254/24 | SD-WAN 下一跳10.4.200.1，网络61，NAT outside |
| e0/2 | 10.6.100.254/24 | DMVPN 下一跳10.6.100.1，网络48，NAT outside |

两条路径按目的地址分担业务：DC 入口走 SD-WAN，云侧直达入口走 DMVPN。IP SLA 41/61 跟踪 DC Loopback 与 DMVPN Hub，任一路径故障时使用另一条。PAT 使回程返回实际使用的上联；e0/0 的 TCP MSS 调整为1300，适应隧道封装。

```text
interface Ethernet0/0
 ip tcp adjust-mss 1300
ip route 0.0.0.0 0.0.0.0 10.4.200.1 track 41
ip route 0.0.0.0 0.0.0.0 10.6.100.1 200 track 61
ip route 10.3.101.0 255.255.255.0 10.6.100.1 track 61
ip route 10.3.101.0 255.255.255.0 10.4.200.1 200 track 41
```

完整接口、NAT、SLA 命令见网关配置脚本。SLA frequency 为5秒，timeout使用设备默认值；不作为毫秒级恢复实验。

云网段由 OSPF 外部路由到达 DC。两台 DC vEdge 补充以下发布规则，才可经 OMP 和既有 VPN 泄漏策略抵达分支：

```text
omp
 advertise ospf external
```

设备与控制器模板均已保存 `advertise ospf external`。EVE 扩容至32GB后，vManage 恢复运行，两台 DC Edge 使用当前设备配置合并后的 CLI 模板下发，任务结果为 **Success 2/2**。VPN199、VPN999、接口与现有路由设置一并保留。

![两台 DC Edge 模板下发成功](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/6e1c596782d9ef4e1ee7.png)

模板任务结果、模板回读。下发后两条 Track 均 Up，DC 原入口与云侧入口 HTTPS 均200，订单均3条且摘要一致，见最终业务结果。三台控制组件与五台 Edge 均 reachable。

控制器重启后，本实验的手工 Edge 身份登记需要恢复；已按原有证书序列号和真实 chassis 恢复全部五台，未更换证书或身份。恢复脚本供后续完整关机启动时使用，执行位置为项目目录，命令为 `python tools/restore_lab_identities.py`。这是实验身份清单的恢复步骤，不是新增授权申请。

| 场景 | DC 原入口 | 云侧直达入口 | 诊断结果 |
|---|---|---|---|
| 正常分流 | 200 | 200 | PASS |
| 关闭 SD-WAN 上联 | 200 | 200 | DEGRADED，指出e0/1关闭 |
| 关闭 DMVPN 上联，补齐 OMP 后 | 200 | 200 | DEGRADED，指出e0/2关闭 |

两条上联均已恢复并 write memory。首次 DMVPN 故障检查暴露云路由缺失，补充 OMP 外部路由发布后该项通过；原失败输出保留，最终结果以修复后输出为准。

![混合网关实际路由](https://raw.githubusercontent.com/XVSHIFU/Picture-bed/img/ccie-lab/73babf5fd720933c1b30.png)

证据：正常分流与 NAT、SD-WAN 中断、恢复后状态。这是按业务分流和故障接管的实验；没有运营商账单，未计算实际节省金额。


---

本系列：[G0]({{< relref "/posts/G0-基础网络实验.md" >}}) · [G1]({{< relref "/posts/G1-架构规划与部署条件.md" >}}) · [G2]({{< relref "/posts/G2-园区网络与总部数据中心互联.md" >}}) · [G3]({{< relref "/posts/G3-运营商与跨域路由.md" >}}) · [G4]({{< relref "/posts/G4-DMVPN与传统分支.md" >}}) · [G5]({{< relref "/posts/G5-SDA与SD-WAN.md" >}}) · [G6]({{< relref "/posts/G6-可编程运维与配置恢复.md" >}}) · [完整部署]({{< relref "/posts/G7-项目完整部署执行书.md" >}})
