---
title: Switch JDK versions in Windows
date: 2025-11-12 8:00:00
tags:
  - 环境配置
  - 调试工具
categories:
  - 小工具&环境搭建
description: Switch JDK versions in Windows
showToc: true
draft: false
tocOpen: true
---
# Switch JDK versions in Windows 



最近在安装工具时常常用到不同的 JDK 版本，而想要切换就得一条一条去修改环境变量，实在浪费时间。因此，通过 AI + 人工调试，终于推出了一款可以自动扫描已安装的所有 JDK 版本，并且快速切换的脚本。



## 内容：

```
# -----------------------------
# PowerShell 脚本：switchjdk.ps1
# 功能：在 Windows 下快速切换 Java 版本（自动检测 + 安全刷新）
# 用法： PowerShell 管理员模式下直接执行：.\switchjdk.ps1
# -----------------------------

# JDK 根目录（根据自己的 JDK 安装路径调整）
$javaBase = "D:\Java"

Write-Host "`n==========================" -ForegroundColor Cyan
Write-Host "🔍 扫描到已有的 Java JDK 版本：" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# 获取所有 JDK 目录（按名称排序，防止索引错位）
$jdkList = Get-ChildItem -Path $javaBase -Directory |
    Where-Object { $_.Name -match "^jdk" } |
    Sort-Object Name

if (-not $jdkList) {
    Write-Host "❌ 未找到任何 JDK 版本，请检查目录：$javaBase" -ForegroundColor Red
    exit 1
}

# 显示可选版本
$index = 1
foreach ($jdk in $jdkList) {
    Write-Host "$index. $($jdk.Name)"
    $index++
}

# 获取当前 JAVA_HOME
$currentJavaHome = [Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")
if ($currentJavaHome) {
    Write-Host "`n💡 当前版本为：$currentJavaHome" -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️ 当前系统未设置 JAVA_HOME" -ForegroundColor Yellow
}

# 提示用户选择版本
$choice = Read-Host "`n👉 请选择要更换的 JDK 序号（1-${jdkList.Count}）"
if (-not ($choice -as [int]) -or $choice -lt 1 -or $choice -gt $jdkList.Count) {
    Write-Host "❌ 无效选择，操作已取消。" -ForegroundColor Red
    exit 1
}

# 精确取选中版本
$selectedJdk = $jdkList | Sort-Object Name | Select-Object -Index ($choice - 1)
$javaHome = $selectedJdk.FullName

Write-Host "`n✅ 选择的 JDK：$javaHome" -ForegroundColor Green

# 修改 JAVA_HOME（系统与用户级）
[Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "Machine")
Write-Host "✅ JAVA_HOME 已更新为 $javaHome" -ForegroundColor Green

# 更新 Path：移除旧 JDK/bin，添加新 JDK/bin
$oldPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
$newPathParts = $oldPath -split ';' | Where-Object {
    ($_ -notmatch "Java\\jdk") -and ($_ -notmatch "Java\\jre")
}
$newPath = ($newPathParts + "$javaHome\bin") -join ';'
[Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
Write-Host "🔁 系统 Path 已更新。" -ForegroundColor Yellow

# 通知系统环境变量更新（立即生效）
try {
    $signature = @"
[DllImport("user32.dll", SetLastError=true, CharSet=CharSet.Auto)]
public static extern IntPtr SendMessageTimeout(
    IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam,
    uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
"@
    Add-Type -MemberDefinition $signature -Name "NativeMethods" -Namespace "WinAPI"

    $HWND_BROADCAST = [IntPtr]0xffff
    $WM_SETTINGCHANGE = 0x1A
    $result = [UIntPtr]::Zero

    [void][WinAPI.NativeMethods]::SendMessageTimeout(
        $HWND_BROADCAST, $WM_SETTINGCHANGE,
        [UIntPtr]::Zero, "Environment",
        0, 1000, [ref]$result
    )
    Write-Host "✅ System environment change broadcasted." -ForegroundColor Green
} catch {
    Write-Host "⚠️ Broadcast failed (但环境变量已更新)" -ForegroundColor Yellow
}

# 更新当前会话环境变量
$env:JAVA_HOME = $javaHome
$env:Path = $newPath

# ⚙️ 清除 PowerShell 命令缓存，确保生效新版本
try {
    if (Get-Command java -ErrorAction SilentlyContinue) {
        Remove-Item -Path Function:\java -ErrorAction SilentlyContinue
        Remove-Item -Path Alias:\java -ErrorAction SilentlyContinue
    }
    # 清除缓存路径
    $env:Path = $newPath
    [System.Environment]::SetEnvironmentVariable("Path", $newPath, "Process")
    # 强制重新定位 java 可执行路径
    $null = & where.exe java
} catch {
    Write-Host "⚠️ PowerShell 缓存刷新失败，但环境变量已更新" -ForegroundColor Yellow
}

Write-Host "`n==========================" -ForegroundColor Cyan
Write-Host "Final check (java -version):" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
& java -version

```





## 使用：

首先将以上脚本内容进行保存，

![image-20251112081219320](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511120812589.png)

点击`另存为`

![image-20251112081235257](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511120812372.png)

一般来说**保存到 JDK 的安装目录**即可，保存类型为 **`所有文件(*.*)`** ，编码选择 **`UTF-8 BOM`**。

![image-20251112081321848](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511120813936.png)

最后**保存**



先看一下我当前的 Java 版本吧：

![image-20251112081651218](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511120816302.png)



以**管理员身份执行 PowerShell**，切换到脚本所在目录

![image-20251112081803639](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511120818722.png)



执行**`.\switchjdk.ps1`** ，就可以看到当前电脑安装的 JDK 版本啦。

![image-20251112081848201](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511120818286.png)



输入对应的序号进行切换：

显示已切换，

![image-20251112081948912](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511120819997.png)



那么我们在另一个终端进行验证：

可以看到成功切换到我们想要的 JDK 版本了~

![image-20251112082027656](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511120820736.png)



