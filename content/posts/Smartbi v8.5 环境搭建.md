---
title: Smartbi v8.5 环境搭建
date: 2025-08-07T16:00:00+08:00
tags:
  - "环境搭建"
categories:
  - "环境搭建"
description: Smartbi v8.5 环境搭建
showToc: true
draft: false
tocOpen: true
---
# Smartbi v8.5 环境搭建

## 一、安装

通过网盘分享的文件：Smartbi Insight Edition-2018-11-22.zip
链接: https://pan.baidu.com/s/15caJ59nCdUvNJcwwGx_VJQ 提取码: wan4 



![20250730142614982](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072207593.png)

用户名和公司名称随意

![20250730142606223](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072207797.png)

更改安装目录

![20250730142705002](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072207535.png)

**此处，不要选择“安装演示库”，否则会报“报表数量超过限制”的错误**

![20250730142800593](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072207934.png)

不选择“注册为Windows服务”，内存大小默认即可

![20250730142851342](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072211381.png)

登录首页的密码

![20250730142859437](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072211551.png)



![20250730142905276](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072211744.png)

## 二、license获取

官网地址：https://www.smartbi.com.cn/

license申请地址：https://my.smartbi.com.cn/index/index/customerindex/form_id/3.html

这里第一次进入需要注册\登录：

![20250730201318600](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072211274.png)

之后便可以申请了，邮箱要填正确，之后会将 license 发到邮箱里

![20250806200815728](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072212883.png)

![image-20250807221345227](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072213347.png)

选择个人版

![20250730201536174](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072214816.png)

之后在邮箱里可以看到发的：Smartbi-License.xml

![20250730201709835](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072214979.png)



### 获取 licence 后，将其放置在 `E:\Smartbi\Tomcat\bin`文件夹下

![20250730203434407](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072214848.png)







## 三、创建数据库

首先连接 `Smartbi` ：

![20250730202151890](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072215810.png)

创建`Smartbi` 数据库：

**第一步连接好之后，是没有 smartbi 数据库的，需要自己创建**

![20250730202209089](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072215211.png)





下面是 MySQL 的配置：

`database-name` 在选择安装“演示数据库”时是：`smartbidemo`；咋们没有选择，所以默认是：`smartbi`。

E:\Smartbi\Tomcat\bin\smartbi-config.xml

![20250730202402962](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072215236.png)



## 四、解决浏览器版本误判

这一步可以看下面问题中的 `1、`



## 五、启动程序

### 方法一：

E:\Smartbi\Tomcat\bin\startup.cmd

运行 startup.cmd ，启动服务器



### 方法二：

系统开始菜单中找到 Smartbi 的安装目录，单击启动Smartbi服务

![20250730203101194](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072215033.png)



没有报错的话，就是启动成功了，

**若到这一步服务启动有错，重启电脑！！！**

![20250730203306884](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072215464.png)







## 六、配置程序

访问Smartbi:

![20250730203519660](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072216056.png)

首次访问，需输入密码，这里的密码随意，我的是 `admin`

![20250730203618192](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072216206.png)

接下来的配置按照图中所示即可：

![20250730204159549](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072216156.png)



## 七、进入主页

重启服务后，再次点击`访问Smartbi`，会进入下方页面：

http://localhost:18080/smartbi/vision/index.jsp

首次访问登录页：

![20250730204745953](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072216556.png)

此处的旧密码是`manager`，之后自行修改一个新密码：

![20250730204612002](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072217262.png)

这是之后访问登录页：

![20250730204403222](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072217160.png)

登录系统：

![20250730204932051](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072217230.png)



至此，Smartbi v8.5 环境搭建完成。





# 搭建时遇到的问题（按照上述方法安装后应该不会有下列问题）：

## 1、浏览器版本被错误检测

![20250730194311903](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072217317.png)







参考：https://www.xiaoheiwoo.com/windows-11-internet-explorer/



### 方法一：从“管理加载项”窗口打开 Internet Explorer

用过 IE浏览器的人应该知道，IE中是可以通过 Internet属性 窗口，对浏览器进行功能设置的。

虽然 Win11默认找不到 IE的入口，但是 Internet属性 程序依然可以正常运行，我们可以点击其中的 管理加载项 功能，打开 IE 浏览器。

步骤是：

1. 首先，按 `Win + R` 打开运行窗口
2. 接下来，在运行命令框中输入 `inetcpl.cpl`
3. 单击 `确定` 进入 Internet 属性窗口
4. 选择 `程序` 选项卡，点击 `管理加载项` 按钮
   1. 然后，点击窗口底部 `了解有关工具栏和扩展的详细信息`
   1. 铛铛铛，你要的 IE浏览器出现啦~


### 方法二：注释掉判断语句

进入 E:\Smartbi\Tomcat\webapps\smartbi\vision

找到文件 config.jsp

将判断部分注释掉

![20250729143004181](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072219561.png)



## 2、报表数量超过限制

07-29 20:27:27 ERROR activate(smartbi.framework.Framework:85) - 报表数量超过限制
报表数量超过限制:ReportCount:452&gt;20

![20250729211037212](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508072219949.png)

**这个问题是由于安装时选择了安装`演示数据库` ，不安装即可。**







































