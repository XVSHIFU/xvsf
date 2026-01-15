---
title: Smartbi 远程代码执行漏洞复现(QVD-2025-31926)
date: 2025-11-20T14:00:00+08:00
tags:
  - "Java 代码审计"
categories:
  - "Java"
description: Smartbi 远程代码执行漏洞复现(QVD-2025-31926)
showToc: true
draft: false
tocOpen: true
---
**Smartbi 远程代码执行漏洞复现(QVD-2025-31926)**





# 1、 漏洞描述

> 近日，奇安信CERT监测到官方修复Smartbi 远程代码执行漏洞(QVD-2025-31926)，该漏洞源于攻击者可通过默认资源ID绕过身份验证获取权限，配合后台接口实现远程代码执行，可能导致服务器被完全控制、数据泄露或业务系统沦陷。鉴于该漏洞影响范围较大，建议客户尽快做好自查及防护。
>

# 2、影响范围
影响版本

Smartbi <= 11.0.99471.25193

# 3、补丁分析
官网发布了新的补丁，我们可以从补丁入手，看他修复了什么

[https://www.smartbi.com.cn/patchinfo](https://www.smartbi.com.cn/patchinfo)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201431045.png)



下载到的补丁是经过加密的

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201431013.png)



具体解密方法可参考：

[Smartbi 最新认证绕过导致RCE漏洞分析](https://mp.weixin.qq.com/s/aIyGt5OKlYCL-NPfd0G2Jw)



解密

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201436429.png)

<font style="color:rgba(0, 0, 0, 0.9);"></font>

<font style="color:rgba(0, 0, 0, 0.9);">下载为 jar 包：</font>

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201431721.png)

<font style="color:rgba(0, 0, 0, 0.9);"></font>

7-31 的补丁内容：

```java
{
	"version": "1.0",
	"date": "2025-07-31 09:00:00",
	"patches": {
	    "PATCH_20250731": {
	    	"desc": "强化系统安全性，防范特定条件下的非授权访问5 (Patch.20250731  @2025-07-31)",
	    	"desc_zh_TW": "強化系統安全性，防範特定條件下的非授權訪問5 (Patch.20250731  @2025-07-31)",
	    	"desc_en": "Strengthen system security against unauthorized access under certain conditions 5 (Patch.20250731  @2025-07-31)",
	    	"urls": [
	    		{
					"url": "/vision/share.jsp",
					"rules": [
						{
							"type": "ShareRecordPatchRule",
						}
					]
				},
				{
	    			"url": "/smartbix/api/agentEngineMonitor/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/customextension/customsqlnode/nodedefine",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/datamining/config/infos",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/datamining/config/service/infos",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},{
	    			"url": "/smartbix/api/datamining/config/system/infos",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/datamining/customExtensionNode/java/upload",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/datamining/customExtensionNode/python/upload",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/datamining/customtree/type/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/datamining/customnodehelp/update/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/datamining/bind/mining/secret",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/engineMonitor/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/engineMonitor/engineLog/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/engineMonitor/engineMethod/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/engineMonitor/restartComputeNode/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/engineMonitor/agentsystem/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/engineMonitor/agentLog/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/serveMonitor/serviceMethod/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/serveMonitor/serviceServers/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/serveMonitor/serviceLog/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/checkStart",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/jobs",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/jobs/job",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/jobs/job/kill",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/stages",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},{
	    			"url": "/smartbix/api/sparkUiMonitor/stages/stage",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/stages/pool",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/storage",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/storage/rdd",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/environment",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/executors",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/executors/threadDump",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/SQL",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/SQL/execution",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/logPage",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/applications",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/api/v1/applications/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/executorspage",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/log",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/sparkUiMonitor/backMaster",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/dataprepare/sparkfunctions/import",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/dataprepare/sparkfunctions/delete/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/dataprepare/sparkfunctions/reset",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/dataprepare/sparkfunctions/update",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_MINING,MANAGE_ETL,AUGMENTED_DATASET_ETL"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/jobflow/config",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_JOBFLOW,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/jobflow/jobFlowLog/*",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_JOBFLOW,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/jobflow/jobFlowLog",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_JOBFLOW,MANAGE_TOOLKIT_SYSMONITOR"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/user/scheduleIsPasswordValidate",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_USERMANAGEMENT"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/user/isPasswordValidate",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_USERMANAGEMENT"
	    			}]
	    		},
	    		{
	    			"url": "/smartbix/api/admin/clearCache",
	    			"rules": [{
	    				"type": "AssertFunctionUrlPatchRule",
	    				"funcList": "MANAGE_TOOLKIT_EXPORTSYSTEMLOG"
	    			}]
	    		}, {
						"url": "/smartbix/api/login",
	    			"rules": [{
	    				"type": "RejectPatchRule"
	    			}]
					}, {
						"url": "/smartbix/*",
	    			"rules": [{
	    				"type": "RejectInvalidUrlPatchRule"
	    			}]
					}
	    	]
	    },
```





找到漏洞路径`/vision/share.jsp`以及对应补丁代码



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201432716.png)



# 4、漏洞源码分析


这里获取一个资源ID `resid`，如果这个资源ID符合`isPublicShareResourceByShareType`<font style="color:#080808;background-color:#ffffff;"> </font>，不管当前会话是否已登录，都将当前用户切换为`public`用户

也就是说未登录的用户，访问资源时，会获得 `public`的权限。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201432463.png)	



## 注：
> 如果没有添加库，就会如下图所示，找不到对应的方法、类
>
> ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201432807.png)
>
> 
>
> 如果要看到完整的代码，需要把 lib 库添加到项目结构中：
>
> 具体要添加的库：
>
> **E:\Smartbi\Tomcat\lib**
>
> **E:\Smartbi\Tomcat\webapps\smartbi\WEB-INF\lib**
>
> ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201432631.png)
>
> 这样就可以看到完整的源码了
>
> ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201432918.png)
>



接着上文，跟进 `autoLoginByPublicUser`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201432458.png)

该方法的作用： 如果系统允许匿名访问，则使用内部 SERVICE 账户临时授权，把当前用户切换为 public 用户。  

```java
//表示该方法不可通过远程 RMI 调用，只能内部调用
@NotRMI
public boolean autoLoginByPublicUser() {
    //必须有一个 public 用户，否则登录失败
    String userName = "public";
    if (this.getUserByName(userName) == null) {
        return false;
    } else {
        //若本次会话没有，系统 ID，则设置为默认值
        if (this.stateModule.getSystemId() == null) {
            this.stateModule.setSystemId("DEFAULT_SYS");
        }

        // SERVICE 是内部保留的系统用户
        IUser serviceUser = this.getUserById("SERVICE");
        if (serviceUser == null) {
            throw (new SmartbiException(UserManagerErrorCode.NOT_EXIST_USER)).setDetail("SERVICE");
        } else {
            //如果当前用户已经是 public ，不再进行切换操作
            IUser currentUser = this.safeGetCurrentUser();
            if (currentUser != null && "PUBLIC".equals(currentUser.getId())) {
                return true;
            } else {
                //将当前用户强制设置为 SERVICE
                this.stateModule.setCurrentUser(serviceUser);
                this.stateModule.removeSessionAttribute("SMARTBIX_STATE");
                boolean ret = false;

                boolean var5;
                try {
                    //switchUser 执行真正的用户切换
                    ret = this.switchUser(userName);
                    var5 = ret;
                } finally {
                    if (!ret) {
                        this.stateModule.setCurrentUser(currentUser);
                    }

                }

                return var5;
            }
        }
    }
}
```



跟进 `setCurrentUser`，

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201436045.png)

```java
    @NotRMI
    public void setCurrentUser(IUser user) {
        //state 是 Smartbi 的一个独立 Session 状态对象，通常封装：登录用户、本地语言、当前 SystemId、用户权限缓存（role/resource）、登录 token、登录方式
        this.getState().setUser(user);
        //在 HTTP Session 中记录用户名
        this.setSessionAttribute("user", user == null ? null : user.getName());
        //更新 Session 的语言环境
        this.updateSessionLocale(user);
    }
```



跟进 `switchUser`



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201432978.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201432335.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201432421.png)





```java
public boolean switchUser(String username) {
//当前会话必须有用户，在上一步的 autoLoginByPublicUser() 把当前用户设置为 SERVICE
boolean result = false;
String loginFailReason = null;
User currUser = (User)this.userManagerModule.getStateModule().getCurrentUser();
if (currUser == null) {
    return false;
} else {
    //获取当前用户信息
    String currUserName = currUser.getName();
    UserBO userBO = new UserBO(currUser);

    try {
        //跳过登录的校验
        String code = null;
        Collection<LoginCheckItem> skipChecks = new HashSet(Arrays.asList(LoginCheckItem.TWO_FACTOR_AUTH_CHECK));
        //如果是 public ，还要跳过校验  LoginCheckItem.ROLE_ASSIGNMENT_CHECK
        if ("public".equals(username)) {
            skipChecks.add(LoginCheckItem.ROLE_ASSIGNMENT_CHECK);
        }

        //verifyPassword 只有当前用户是 Admin 才允许 switchUser，普通用户不能随意切换
        //而在 autoLoginByPublicUser 在切换 public 时，强制把当前用户变成 SERVICE（管理员），就可以通过 verifyPassword，进行切换
        Supplier<Boolean> verifyPassword = () -> {
            if (userBO.isAdmin()) {
                return true;
            } else {
                throw new SmartbiException(UserManagerErrorCode.NO_PERMISSION);
            }
        };
        //performLoginCheck 会执行用户是否存在、过期等等逻辑
        result = this.performLoginCheck(username, (String)null, code, skipChecks, verifyPassword);
    } catch (SmartbiException e) {
        loginFailReason = e.getDetail() == null ? e.getMsg() : e.getDetail();
    } finally {
        //写日志
        JSONObject obj = new JSONObject();
        Object attr = this.userManagerModule.getStateModule().getRequestAttribute("loginByToken");
        if (attr != null) {
            obj.put("loginByToken", attr.toString());
        }

        obj.put("switchUserBy", currUserName);
        if (result) {
            this.performLoginSucceeded(username, (String)null, () -> obj);
        } else {
            this.performLoginFailed(username, loginFailReason, () -> obj);
        }

    }

    return result;
}
}
```





所以**总结一下**：我们需要找到一个资源 ID 符合 `isPublicShareResourceByShareType`，不管登录与否，都可以获得`public`用户的 `session`





跟进 `isPublicShareResourceByShareType`



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201434142.png)

```java
public boolean isPublicShareResourceByShareType(String relateid, String shareType) {
        if (StringUtil.isNullOrEmpty(relateid)) {
            return false;
        } else {
            try {
                ShareRecord shareRecord = null;
                //根据 shareType 决定查询方式
                if (StringUtil.isNotNullAndEmpty(shareType)) {
                    shareRecord = SocialContactShareDAOFactory.getShareRecordDAO().loadWeChatByRelateid(relateid);
                } else {
                    shareRecord = SocialContactShareDAOFactory.getShareRecordDAO().loadByRelateid(relateid);
                }

                //检查分享记录是否“公开分享且已启用”
                if (shareRecord != null 
                    && shareRecord.getPublicshared() == 1 
                    && shareRecord.getEnabled()) {
                    return true;
                }
            } catch (ParseException e) {
                LOG.error(e);
            }

            return false;
        }
    }
```



跟进 `shareRecord`

`shareRecord.getPublicshared()`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201434690.png)

`shareRecord.getEnabled()`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201434008.png)



**总结满足 **`isPublicShareResourceByShareType`**<font style="color:#080808;background-color:#ffffff;"> 的条件：</font>**

1. `relateid`不为空
2. `shareType`不为空
3. `shareRecord.getPublicshared() == 1`表示公开分享
4. `shareRecord.getEnavled() == true`
    1. `deleted != 1`分享不能被删除
    2. `cancelled != 1`分享不能被取消
    3. `enddate == null`为 null 就是永不过期



具体的构造需要找到对应的参数：

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201434412.png)





`c_deleted!=1 and c_cancelled!=1 and c_publicshared=1`





继续跟入`loadByRelateid`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201434238.png)



 根据 `relateid` 字段查询一条 `ShareRecord` 记录  

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201434058.png)



去查找：<font style="color:#080808;background-color:#ffffff;">"ShareRecord.getShareRecordByRelateid"</font>

表名 ：`t_share_record`

列名 ： `c_relateid`

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201434200.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201436621.png)

构造查询语句：

`select c_relateid from t_share_record where c_deleted != 1 and c_cancelled != 1 and c_publicshared = 1`<font style="color:rgb(0, 0, 0);">  
</font>

可能由于我没有安装演示库，导致什么都查不到

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201435736.png)



> 看其他师傅的文章里是可以查询到结果的
>
> ![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201435287.png)
>



通过以上方法获取到有效 session 就可以在后台调用任意 js 代码达到远程代码执行的目的



由于我没有获得有效的 session，后续就不复现了，，



> 借用 @漫漫安全路 师傅的文章：![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202511201435816.png)
>





# 参考：
[【已复现】Smartbi 远程代码执行漏洞(QVD-2025-31926)安全风险通告](https://mp.weixin.qq.com/s/tBkU0GoH4F1eK9JvP3u04w)

[Smartbi 最新认证绕过导致RCE漏洞分析](https://mp.weixin.qq.com/s/aIyGt5OKlYCL-NPfd0G2Jw)

[smartbi远程代码执行漏洞复现(QVD-2025-31926) - Zephyr07 - 博客园](https://www.cnblogs.com/Zephyr07/articles/19056342)

