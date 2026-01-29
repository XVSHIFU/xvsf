---
title: "Scrapy 爬虫框架"
date: 2026-01-27T10:00:00+08:00
categories:
  - "Python网络爬虫与信息提取"
---



# Scrapy 爬虫框架介绍
官网：[https://www.scrapy.org/](https://www.scrapy.org/)

文档：[https://docs.scrapy.net.cn/en/latest/](https://docs.scrapy.net.cn/en/latest/)

快速功能强大的网络爬虫框架



# Scrapy 的安装
`pip install scrapy`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512131268-5006b66f-5513-49a0-991d-580e5ef336f8.png)



`scrapy -h`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512159786-d1bb8df9-d808-4b19-acfb-345d1143c48d.png)



# Scrapy 爬虫框架结构
Scrapy不是一个函数功能库，而是一个**爬虫框架**。

爬虫框架是**实现爬虫功能的一个软件结构和功能组件集合**。

爬虫框架是**一个半成品，能够帮助用户实现专业网络爬虫**。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512204013-67108727-aff5-4778-a4b7-2ae2759a7381.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512213878-ee88a8e7-681c-4f96-9035-bf274f6042a8.png)



## Scrapy 爬虫框架解析
### 数据流的三个路径
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512229939-016f5e07-c35e-49e1-aa35-255513f1daac.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512237198-1d8745fa-5f90-4b7a-a4b1-152096925be0.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512243211-4fd2455d-8ebf-4061-b418-6ca1d4fc2694.png)

### 数据流的出入口
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512253418-313b16b2-5e04-4351-b723-b4736cfacf8f.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512259650-573066df-7335-4435-a354-cc3cc19b7dc1.png)



### "5 + 2"结构


<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512352173-027814e6-d6e5-45bc-ae9a-3d8273575787.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512357807-50602af4-f640-44fd-957a-e871437c03e8.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512365065-83272830-9a44-415f-becb-7ae991422ac5.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512381584-a3f2d31e-d8ca-46e8-bf16-29c69fe836d2.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512388180-be961e00-d185-42ef-9128-cb88a597ff01.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512393626-589a1c22-5e31-48fa-8cfb-761f26663577.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512399359-816dfff1-0718-4d33-a886-af3f5fce275c.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512403937-ec7c8b0b-c0b6-48be-9a7d-14fda8c9569f.png)



### 小结：
Scrapy 爬虫框架是一个包含5个主要模块和2个中间键的框架。其中，

`engine`模块是整个框架的核心，控制所有模块之间的数据流；

`downloader`模块负责根据用户提供的请求下载网页；

`scheduler`模块对爬取请求进行调度管理；

`spider`模块解析下载器返回的响应，产生爬取项和额外的爬取请求；

`item pipelines`模块以流水线的方式处理爬取项，对数据进行清理、检验、查重等操作。

用户主要需要编写`spider`模块和`item pipelines`模块的相关代码，可以通过中间键对请求、响应和爬取项进行操作和配置。

# requests 库和 Scrapy 爬虫的比较
## 相同点：
两者都可以进行页面请求和爬取，Python爬虫的两个重要技术路线

两者可用性都好，文档丰富，入门简单

两者都没有处理js、提交表单、应对验证码等功能（可扩展）

## 不同点：
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512449830-8dc2af5d-af11-40e5-bb4b-4aa68ba2a3d9.png)



## 选用哪个技术路线开发爬虫呢？
非常小的需求，requests库

不太小的需求，Scrapy框架

定制程度很高的需求（不考虑规模），自搭框架，requests > Scrapy



# Scrapy 爬虫的常用命令
Scrapy 是为持续运行设计的专业爬虫框架，提供操作的 Scrapy 命令行



## Scrapy 命令行格式
`>scrapy <command> [options] [args]`



## 常用命令
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769512588957-4e89f1d4-30a6-4b3b-9c15-3c98d80430bb.png)





# Scrapy 爬虫的使用


应用Scrapy爬虫框架主要是编写配置型代码





## 第一个实例
### 步骤1：建立一个Scrapy爬虫工程
选取一个目录（D:\pycodes\），然后执行如下命令：

`scrapy startproject python123demo`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769513609750-9e301eb9-9540-4ecc-8e75-3f416e7ee1b2.png)

**生成的工程目录：**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769513319048-6929a25e-1a40-43d0-b837-a310acd928ba.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769513375944-8a991d48-3e03-46fb-8878-13d49134d51d.png)





### 步骤2：在工程中产生一个Scrapy爬虫
进入工程目录（D:\pycodes\python123demo），然后执行如下命令：

`scrapy genspider demo python123.io`

该命令作用：

(1) 生成一个名称为demo的spider

(2) 在spiders目录下增加代码文件demo.py

该命令仅用于生成demo.py，该文件也可以手工生成

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769513472168-75798deb-5edb-445b-a4fd-2982da56eaf0.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769513678079-6de20bf1-ce4d-4538-81fd-9494c743bee6.png)



### 步骤3：配置产生的spider爬虫
配置：（1）初始URL地址

（2）获取页面后的解析方式

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769513487599-6362b646-8c65-4482-adf2-7c6ba1b9d7f0.png)



```python
import scrapy


class DemoSpider(scrapy.Spider):
    name = "demo"
    allowed_domains = ["python123.io"]
    start_urls = ["https://python123.io/ws/demo.html"]

    def parse(self, response):
        fname = response.url.split("/")[-1]
        with open(fname, "wb") as f:
            f.write(response.body)
        self.log('Saved %s' % fname)

```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769513768147-12d102f2-7cc2-4d40-9ea6-097fcc2355f7.png)

### 步骤4：运行爬虫，获取网页
在命令行下，执行如下命令：

`scrapy crawl demo`

demo爬虫被执行，捕获页面存储在demo.html





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769513854360-aaabdc07-8e09-4092-9502-ddcdc6e4e001.png)





## yield 关键字的使用


### yield 关键字
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769513915730-5e4d3072-3ff1-4f89-bd90-d8552f0294c1.png)



### 实例
生成器每调用一次在 yield 位置产生一个值，直到函数执行结束

```python
def gen(n):
    for i in range(n):
        yield i**2

    
for i in gen(5):
    print(i, " ", end="")

    
0  1  4  9  16  
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769513987448-27aa80e8-3bdb-4a1e-b801-0f3cdba0b4cc.png)





### 为什么要有生成器？
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769514023046-0e8a527d-cdda-4ff7-8948-559a1adedc34.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769514041352-f78291ea-089e-4da3-b2b8-68add9853729.png)





### 改进 demo.py
```python
import scrapy

class DemoSpider(scrapy.Spider):
    name = "demo"

    def start_requests(self):
        urls = [
            "https://python123.io/ws/demo.html",
        ]
        #把 URL 交给 Scrapy 的调度器，让 Scrapy 去“异步下载页面，并在下载完成后自动调用 parse 处理结果”。
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)


    def parse(self, response):
        fname = response.url.split("/")[-1]
        with open(fname, "wb") as f:
            f.write(response.body)
        self.log('Saved %s' % fname)

```



`yield scrapy.Request()`  
是 Scrapy 爬虫的 **入口**  
负责把 URL 提交给调度器  
下载完成后自动调用回调函数处理响应  



## Scrapy 爬虫的使用步骤
步骤1：创建一个工程和Spider模板

步骤2：编写Spider

步骤3：编写Item Pipeline

步骤4：优化配置策略



## Scrapy 爬虫的数据类型
### Request类
`class scrapy.http.Request()`

Request对象表示一个HTTP请求

由Spider生成，由Downloader执行

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769514380301-7a12d865-4792-45f9-958b-92adac386305.png)





### Response类
`class scrapy.http.Response()`

Response对象表示一个HTTP响应

由Downloader生成，由Spider处理



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769514397520-d5faa656-7318-40a9-b256-3bc3195a39c0.png)







### Item类
`class scrapy.item.Item()`

Item 对象表示一个从 HTML 页面中提取的信息内容

由 Spider 生成，由 Item Pipeline 处理

Item 类似字典类型，可以按照字典类型操作





## Scrapy 爬虫提取信息的方法
Scrapy爬虫支持多种HTML信息提取方法：

• Beautiful Soup

• lxml

• re

• XPath Selector

• CSS Selector



### CSS Selector 的基本使用
`<HTML>.css('a::attr(href)').extract()`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769514522666-fd99e9df-30c2-43ea-aa65-98afe49206c4.png)





## 实例：“股票数据 Scrapy 爬虫”
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769514605123-51447e40-5032-489c-9f10-21b561eda7bf.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769514610653-2db9c481-a51d-4352-ac2e-fb9fe753411e.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769514617355-e4323c16-43b1-40bd-82d4-9524d9dad937.png)

### 步骤
步骤1：建立工程和Spider模板

步骤2：编写Spider

步骤3：编写ITEM Pipelines





```python
D:\pycodes>scrapy startproject BaiduStocks
New Scrapy project 'BaiduStocks', using template directory 'C:\Users\SZZY\AppData\Local\Programs\Python\Python310\Lib\site-packages\scrapy\templates\project', created in:
    D:\pycodes\BaiduStocks

You can start your first spider with:
    cd BaiduStocks
    scrapy genspider example example.com

D:\pycodes>cd BaiduStocks

D:\pycodes\BaiduStocks>scrapy genspider stocks baidu.com
Created spider 'stocks' using template 'basic' in module:
  BaiduStocks.spiders.stocks

D:\pycodes\BaiduStocks>
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769514718524-4927ab47-6f2c-438a-85dd-bdd69b399687.png)



stocks.py

```python
import scrapy
import re

class StocksSpider(scrapy.Spider):
    name = "stocks"
    start_urls = ['http://quote.eastmoney.com/stocklist.html']

    def parse_stock(self, response):
        infoDict = {}
        stockInfo = response.css('.stock-bets')
        name = stockInfo.css('.bets-name').extract()[0]
        keyList = stockInfo.css('dt').extract()
        valueList = stockInfo.css('dd').extract()
        for i in range(len(keyList)):
            key = re.findall(r'>.*<\dt>', keyList[i])[0][1:-5]
            try:
                val = re.findall(r'>.*<\dt>', valueList[i])[0][0:-5]
            except:
                val = '--'
            infoDict[key] = val

        infoDict.update(
            {
                '股票名称': re.findall('\s.*\(', name)[0].split()[0] + re.findall('\>.*\<', name)[0][1:-1]
            }
        )

        yield infoDict


```



pipeline.py



```python
from itemadapter import ItemAdapter


class BaidustocksPipeline(object):
    def process_item(self, item, spider):
        return item

class BaiduStocksPipeline(object):
    def open_spider(self, spider):
        self.f = open('BaiduStocks.txt','w')
        
    def close_spider(self, spider):
        self.f.close()
        
    def process_item(self, item, spider):
        try:
            line = str(dict(item)) + "\n" 
            self.f.write(str(item))
        except:
            pass
        return item
            
```



setting.py

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769515536163-1df40b47-5b2f-4aab-a06a-cc9e06d60178.png)







<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/52403351/1769516187851-6a0a5868-3d99-45a1-ba62-7aee56a4f63c.png)







