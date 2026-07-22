---
title: AI 私厨
date: 2026-04-27T10:00:00+08:00
draft: false
description: 基于 LangChain 和多模态 AI 的食谱推荐应用开发实战
categories:
  - AI开发
tags: []
---
# 前言
本项目来自[黑马程序员2026最新版LangChain+LangGraph开发实战全套视频课程，从Agent开发，到LangSmith的监控、调试、评估一套搞定](https://www.bilibili.com/video/BV178w1z7EHQ/)的课程，借此机会学习了一些 AI 通识以及 LangChain 基础开发的知识。 



大一上半学期还在用 deepseek、豆包这些国产大语言模型询问 C 语言，和一些奇奇怪怪的问题：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271745970.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271746532.png)



 当时的 chatGPT 可谓是如日中天，大名鼎鼎（对我来说），奈何不会科学上网，并没有体验到。



大概是在大一下半学期，误打误撞注册了 Google 账号、Github 账号，开始接触国外的一些发展信息，包括 chatGPT、Gemini 等。当然那个时候还处于“网页端的我问你答”环节，完全没有接入 API 开发、使用 Agent 的概念。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271744675.png)



这个环节持续了有一年，都是在用不同 AI 的网页端进行着“我问你答”。在大二上学期的冬天，费了一番功夫去申请了 Github 的学生认证，拿到了 GitHub Copilot 的额度：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271751533.png)

将 Copilot 接入 VS code、PyCharm、IDEA 这些开发工具后，顿时感到科技的进步、AI 的厉害😭。同样的对话框，我发出指令后它不仅有更精确的理解，并且也可以直接帮我修改代码，再也不想去 Ctrl+c、Ctrl+v 来回复、粘贴了。

当然了，这可能就是低配版的 cursor 吧。久闻 cursor 大名，却被价格劝退，而国产的例如 Trea ，当时还远远没有发展起来。





直到今年初春，实验室的大手子给我推荐了 Claude code

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271750858.png)

这个以 CLI 形式运行的智能体编程工具可以在项目中自主阅读代码、修改文件，而在 2026 年初爆发的 OpenClaw 则是一个更通用的、能自主执行各类任务的智能体，相比之下我还是倾向于使用 claude 这个专精编程的 CLI 工具



我目前用的最多的就是 Claude + VS code，

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271748994.png)



当然了，Anthropic 的 claude 也不是想用就可以用的

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271748230.png)



所以每天不是再找公益站就是再找的路上，苦苦哀求一个 key🥲。

直到最近，国产的大模型发展态势良好，对于我这种使用场景来说还是绰绰有余了，包括 **GLM-5.1、Kimi-2.6、DeepSeek-v4**（万众瞩目🌞），这些国内模型并没有那么不堪，已经可以说是**开源模型的顶尖**了，国产模型才是未来，毕竟Claude、GPT 不给中国人用（翻墙、代理什么的另一说）



> 最近也看到很多相关内容的文章，搬运到这里：
>
> [【补档一期吧】我对国产AI模型的看法](https://mp.weixin.qq.com/s/jKFOK6Q24Tv2IdddeKrlKQ)
>
> [讲真，DeepSeek V4+Claude Code 就是国产最强 Agent。](https://mp.weixin.qq.com/s/gPSWy5s9IPoNmsfqD-M91w)
>
> [GPT-5.5凌晨发，DeepSeek V4白天接招：编码跑分登顶，价格屠夫，做题超强。可惜搭配claude agent体验不及预期。。。](https://mp.weixin.qq.com/s/Q5VEK1NirAIeGk1w5QbF_Q)
>
> [DeepSeek V4+Claude Code一手实战！夯爆了还是拉完了？](https://mp.weixin.qq.com/s/pPjMUiOSF3QH1RJ6vRGRdQ)
>
> 
>
> ### 本篇文章以及引用文章都属于个人看法，接受师傅们的批评和建议，欢迎大家在评论区讨论💐
> 
>
> 借用[DeepSeek-V4 预览版：迈入百万上下文普惠时代](https://mp.weixin.qq.com/s/8bxXqS2R8Fx5-1TLDBiEDg)一文中的**「不诱于誉，不恐于诽，率道而行，端然正己。」**
>



给 Claude code  接入 DeepSeek-v4 ，这是我目前使用最多的一种方式。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271748818.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271745918.png)





说了这么多，使用过不少的 AI，但是我对 AI 还是一瓶不满半瓶晃荡，好在线上的资料越来越多，也可以借助 AI 给我们一些学习的建议。在本项目中，跟随视频学习**AI 通识与基础、LangChain 入门、Agent 入门实战**，可谓收获颇丰。





# 笔记记录-目录
> **如果想要学习的话，还是建议大家去学习黑马程序员的**[**飞书文档**](https://my.feishu.cn/wiki/PAb6wSNnziRrlEk1PtNcH38LnJZ)**、**[**视频**](https://www.bilibili.com/video/BV178w1z7EHQ/)**，本人的笔记也就自己能看懂罢了**
>



[第一章 AI 通识与基础](#Vorkq)

[第二篇 LangChain 入门](#qYUrB)

[第三篇 Agent入门实战（AI 私厨）](#31e4bb14)

[第四篇 AI 私厨项目部署](#AtuJT)



说明：文章笔记中类似"**notebooks/第一章-AI通识与基础/1.1_OpenAI.ipynb**"说法指代 [GitHub 仓库内容](https://github.com/XVSHIFU/personal_chief)

---

# 第一篇 AI 通识与基础
# 认识人工智能
**AI（Artificial Intelligence），使机器能够像人类一样思考、学习和解决问题的技术。**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271747465.png)





# 大模型原理
## AI 智能的来源
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271753422.png)





## 神经网络与语言模型
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271750467.png)

### 神经网络结构
AI 的核心是 **Transformer**，这是一种神经网络架构，本质就是在模拟人类大脑神经元。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271749848.png)

将千千万万个神经元连接起来，这就组成了**深度神经网络**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271752551.png)

**深度神经网络**分成很多**层（Layer）**，是神经网路基本的计算单元，分为：

+ 输入层（Input Layer）：入口，接收数据
+ 隐藏层（Hidden Layer）：信息处理和学习。可以有很多层
+ 输出层（Output Layer）：出口，产生结果



#### 单个神经元的工作流：
 <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271749290.png)



$ y=g(\sum_{i=1}^{n} w_i x_i - b) $



$ w_i $: 权重就是用来控制输入参数对模型结果的影响情况

$ \sum_{i=1}^{n} w_i x_i $: 对输入的参数进行加权并求和，加权求和的结果决定了输入的值与目标的接近程度

$ \sum_{i=1}^{n} w_i x_i - b $: b  被称为偏置量，有时候加权求和后得到的结果没有达到预期的值，所以要想达到阈值，就要减去偏置量

$ g(\sum_{i=1}^{n} w_i x_i - b) $: $ g() $就是一个处理函数，此函数用来约束输出的结果



### 模型训练
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271749429.png)

1986年，DavidRumelhart（戴维·莱姆哈特）找到了一个教这个复杂神经网络学习的高效方法，叫做**反向传播（Backpropagation）**。

#### 反向传播基本流程：
+ 前向传播：数据逐层加工，直到输出层产出结果
+ 计算误差：计算产出结果与正确结果的误差（Loss)
+ 反向追责：倒推计算每一层的每个连接对误差的贡献
+ 调整权重：根据每个连接的误差贡献比例，调整其权重参数，使误差变小



### 大语言模型
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271751822.png)

#### 词向量
**词向量（Word Embedding）**就是把词转为多维空间向量的一种技术。

+ 首先，将人类自然语言文字拆分为一个个片段，称为Token（词）
+ 每个Token都经过模型计算转为一个浮点数数组，作为向量坐标
+ 目标：使词向量在多维空间中的不同方向表达不同的语义

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271751722.png)



通过浮点数数组，作为向量坐标，在对应的坐标系画出向量

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271748832.png)

以上只是二维向量、三维向量，而在真实的Token，可能就有成千上万个浮点数数组，那么将 词 转成这个多维空间的一个向量，最终我们要通过训练模型，不断调整这些词在向量空间中的一个坐标位置，也就是要达成**使词向量在多维空间中的不同方向表达不同的语义**的目标。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271746343.png)

词向量例子：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271751166.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271748114.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271749882.png)

图片中，`E()` 都是已经训练好的向量，与紫色向量相同方向的这些向量之间会存在某些相似的关系，同时，与之垂直方向的向量也存在相似的关系。也就是说，经过训练，在这个二维空间中的某些向量有了具体的含义，同时呢，也就可以通过已知的某些向量，进行推理得出一些向量。



#### Transformer-注意力机制
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271749328.png)

2017年Google发表的论文《AttentionisAllYouNeed》中提出了**Transformer** 模型，其中提出的自注意力机  
制（self-attention）使模型能更高效的根据上下文信息处理token，理解token含义.



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271745772.png)

首先知道这是一位_艺人_，当上下文有了更多的信息，_艺人_这个向量就开始一步步进行偏移，最终会偏向某个具体的人物。



词向量在 Transformer 中只是第一步，在这之后还有很多步骤：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271752882.png)

Attention: 基于上下文对词向量中的内容进行调整

MLP: 基于前面的分析，再进一步做深度的推理分析，进一步调整向量值。

在不断的调整中，将这个词向量最终计算出某个具体向量，最后呢，要将这个向量进行反向量化输出为 token 给用户。这个过程就是 softmax 函数来完成的。

> **SoftMax** 会根据模型计算出的向量结果得出下一个 token 的概率分布，然后基于概率的随机采样方式挑选一个作为结果。  
这个概率受模型的 **Temperature** 参数影响，值越大，概率分布越均匀，模型生成结果的随机性越强；反之，结果越确定。
>



#### 示例：
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271751818.png)

当然他不可能只生成一个 token 就结束，而是将这个 token (推)，继续进行 Transformer 推理：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271750840.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271744206.png)



#### 涌现（Emergent Abilities）
Transformer 本来是作为翻译用的，但当**模型规模**和**训l练数据量**增突破某个临界点时，模型像是突然拥有了智能，不仅可以理解人类语言，还能推理、分析。这种现象被称为**“涌现”（Emergent Abilities）**。这种超大规模的语言模型则被称为**大语言模型（Large Language Model).**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271752670.png)







# 大模型应用
GPT是OpenAI公司研发的一个基于Transformer架构的大语言模型。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271747752.png)

### 大语言模型
**大语言模型（Large Language Model, LLM）**是指模型的参数规模、训练数据量、训练成本、智能程度都远超普通模型的一种神经网络模型。



**对话机器人（ChatBot）**是指可以与用户聊天、答疑，而且具有记忆的大模型应用。例如：ChatGpt、通义干问。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271746350.png)





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271749643.png)

### 大模型应用
**大模型应用**是基于**大模型**的推理、分析、生成能力，**结合传统编程**精确计算控制能力，开发出的各种应用。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271744696.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271753857.png)



### 大模型应用结构
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271745635.png)





### 小结
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271753100.png)





# 大模型服务
## 大模型云服务
国内知名的云服务平台都提供了国内知名的大模型的API开放服务，只要花钱，无需部署就能访问。

| 云平台 | 公司 | 地址 |
| :---: | :---: | :---: |
| 阿里百炼 | 阿里巴巴 | [https://bailian.console.aliyun.com](https://bailian.console.aliyun.com) |
| 腾讯TI平台 | 腾讯 | [https://cloud.tencent.com/product/ti](https://cloud.tencent.com/product/ti) |
| 干帆平台 | 百度 | [https://console.bce.baidu.com/qianfan/overview](https://console.bce.baidu.com/qianfan/overview) |
| SiliconCloud | 硅基流动 | [https://siliconflow.cn/zh-cn/siliconcloud](https://siliconflow.cn/zh-cn/siliconcloud) |
| 火山方舟-火山引擎 | 字节跳动 | [https://www.volcengine.com/product/ark](https://www.volcengine.com/product/ark) |


国内还有很多模型厂商，提供了自家模型的API服务：

| 公司 | 模型 | 地址 |
| --- | --- | --- |
| 深度求索 | deepseek | [https://platform.deepseek.com/](https://platform.deepseek.com/) |
| 月之暗面 | kimi | [https://www.moonshot.cn/](https://www.moonshot.cn/) |
| 智谱 | glm | [https://open.bigmodel.cn/](https://open.bigmodel.cn/) |


## 私有部署
本地部署最简单的一种方案就是使用**ollama**，官网地址：[https://ollama.com](https://ollama.com)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271750427.png)







# 模型部署
## 通用 API 测试方法
```bash
curl -X POST <BASE_URL>/chat/completions
-H "Authorization: Bearer <API_KEY>"
-H "Content-Type: application/json"
-d '{
"model": "<MODEL>",
"messages": [
{"role": "system", "content": "You are a helpful assistant."},
{"role": "user", "content": "Hello!"}
],
"stream": false
}'
```



```bash
curl -X POST https://free.9e.nz/chat/completions
-H "Authorization: Bearer sk-cdf103d89a0628439c8889b546519d6bf0baedb700865e27e878a946e90760e9"
-H "Content-Type: application/json"
-d '{
"model": "opus4.6",
"messages": [
{"role": "system", "content": "You are a helpful assistant."},
{"role": "user", "content": "Hello!"}
],
"stream": false
}'
```







## Deepseek
### API key:
test: `sk-xxxxxxxxxxxxxxxxx`



### 接口文档：
[https://api-docs.deepseek.com/zh-cn/](https://api-docs.deepseek.com/zh-cn/)



调用方式：

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        "stream": false
      }'
```



```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        "stream": false
      }'
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271748154.png)





## 阿里百炼
### API Key:
test: `sk-xxxxxxxxxxxxxxxxxxxx`

### 接口文档：
[https://bailian.console.aliyun.com/cn-beijing?tab=api#/api](https://bailian.console.aliyun.com/cn-beijing?tab=api#/api)



```bash
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen-plus",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "你是谁？"
        }
    ]
}'
```



```bash
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer sk-xxxxxxxxxxxxxxxxx" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen-plus",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "你是谁？"
        }
    ]
}'
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271751135.png)





## ollama
### 下载安装
在OllamaSetup.exe所在目录打开cmd命令行，然后命令如下： 

```bash
OllamaSetup.exe /DIR=你要安装的目录位置
```

配置一个环境变量，更改Ollama下载和部署模型的位置。环境变量如下：

```bash
OLLAMA_MODELS=你想要保存模型的目录
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271753261.png)



### 搜索模型
[https://ollama.com/search](https://ollama.com/search)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271744125.png)

这些就是模型的参数大小，越大推理能力就越强，需要的算力也越高。671b版本就是最强的满血版deepseek-r1了。需要注意的是，Ollama提供的DeepSeek是量化压缩版本，对比官网的蒸馏版会更小，对显卡要求更低。对比如下：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271751952.png)



+ ollama也提供了供程序访问的HTTP接口，默认地址是[http://127.0.0.1:11434/api/chat](http://127.0.0.1:11434/api/chat)



```plain
  ollama serve      # Start ollama
  ollama create     # Create a model from a Modelfile
  ollama show       # Show information for a model
  ollama run        # Run a model
  ollama stop       # Stop a running model
  ollama pull       # Pull a model from a registry
  ollama push       # Push a model to a registry
  ollama list       # List models
  ollama ps         # List running models
  ollama cp         # Copy a model
  ollama rm         # Remove a model
  ollama help       # Help about any command
```



### 测试 API
Ollama在本地部署时，会自动提供模型对应的Http接口，访问地址是：[http://localhost:11434/api/chat](http://localhost:11434/api/chat)

```bash
curl http://localhost:11434/api/chat \
  -d '{
    "model": "glm-5.1:cloud",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```



```bash
 curl http://localhost:11434/api/chat -d '{
    "model": "deepseek-r1:8b",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": false
  }'
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271751907.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271751491.png)





# 大模型API
## 接口规范
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271750949.png)



## 会话记忆
大模型提供的服务是无状态的，每一轮请求响应是一次会话，不同会话之间相互独立，并不具备会话记忆能力。



```bash
POST /chat/completions HTTP/1.1
Content-Type: application/json
Authorization: Bearer sk-xxxxxxxxxxxxxxxxxxxxxxxx
User-Agent: Mozilla/5.0 (SymbianOS/9.1; U; de) AppleWebKit/413 (KHTML, like Gecko) Safari/413
Accept: */*
Host: api.deepseek.com
Content-Length: 822

{
  "model": "deepseek-chat",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!你是谁？我是heima" },
    { "role": "assistant", "content": "你好，heima！我是DeepSeek，由深度求索公司创造的AI助手。很高兴认识你！😊\n\n我是一个纯文本模型，可以帮你解答各种问题、协助处理文档、进行对话交流等等。虽然我不支持多模态识别，但我可以处理你上传的文件（图像、txt、pdf、ppt、word、excel等），从中读取文字信息来帮助你。\n\n有什么我可以帮你的吗？无论是学习、工作还是日常问题，我都很乐意为你提供帮助！"},
    { "role": "user", "content": "你记得我是谁吗" }
  ],
  "stream": false
}

```



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271746703.png)



## 环境准备
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271748714.png)

[https://docs.astral.sh/uv/](https://docs.astral.sh/uv/)

[https://uv.doczh.com/](https://uv.doczh.com/)



### 安装UV
[https://uv.doczh.com/](https://uv.doczh.com/)



### 添加镜像源
```plain
setx UV_DEFAULT_INDEX "https://pypi.tuna.tsinghua.edu.cn/simple"
```

常见的国内镜像站点有：

**阿里云**

```plain
https://mirrors.aliyun.com/pypi/simple/
```

**腾讯云**

```plain
https://mirrors.cloud.tencent.com/pypi/simple/
```

**火山引擎**

```plain
https://mirrors.volces.com/pypi/simple/
```

**华为云**

```plain
https://mirrors.huaweicloud.com/repository/pypi/simple/
```

**清华大学**

```plain
https://pypi.tuna.tsinghua.edu.cn/simple/
```

**中国科学技术大学**

```plain
https://pypi.mirrors.ustc.edu.cn/simple/
```

### 创建项目
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271748558.png)



引入notebook依赖

```plain
uv add notebook
```



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271745616.png)





### 测试
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271748640.png)





## 编程调用大模型-OpenAI
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271745131.png)



### 准备工作
安装依赖 `uv add openai`



其他见：**notebooks/第一章-AI通识与基础/1.1_OpenAI.ipynb**



# 第二篇 LangChain 入门
# 认识 LangChain
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271754244.png)

[https://www.langchain.com/](https://www.langchain.com/)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271754117.png)

# 什么是Agent
在人工智能领域，**Agent**（通常翻译为**智能体**或**代理**）是指一种能够**感知环境、进行推理、自主决策并采取行动**以实现特定目标的**智能系统**。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271749599.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271750177.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271750413.png)







# 快速入门 - 案例 - 天气查询智能体
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271752263.png)





## Agent原理
### Agent 执行流程：
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271753634.png)

流程如下：

1. 用户提问（Input）：杭州今天天气如何？
2. 模型分析（Reasoning）：用户询问杭州天气，我不知道，需要调用查询天气的工具`get_weather`
3. 调用工具（Action）：调用工具，`get_weather`，传入城市"杭州"
4. 分析结果（Observation）：工具返回结果，模型分析结果，判断是否足以回答用户问
    1. 是：整理生成响应结果
    2. 否：重复前面步骤
5. 生成结果（Output）：根据工具的结果生成响应给用户

### 模型是如何知道工具的信息的呢？
其实，在大模型提供的API接口中，有一个tools参数，描述了工具的详细信息：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271745369.png)

LangChain会帮助我们把tool的信息封装为此tool参数，与message一起发送给大模型，大模型就了解tool的详细信息，根据用户需求判断是否需要调用tool，需要调用哪个tool.

那么问题来了，当大模型决定调用某个tool时，该如何调用呢？毕竟，tool是我们定义的，模型是没有调用能力的。  
模型确实不能直接调用tool，只能返回字符串。但是它可以把要调用的tool信息、参数信息都以Json格式返回：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271745447.png)

这样一来，LangChain就会帮我们解析响应结果中的Function信息，也就是tool信息，就知道了要调用哪个函数，以及参数是什么了。LangChain就会执行该函数，再把得到的结果再次发送给大模型。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271746275.png)





# 模型（Models)
LangChain支持现在市面上大部分常见的大语言模型（LLM），并且提供了各个模型的对应依赖库。



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271745384.png)



Langchain1.0之后，改用`init_chat_model`自动识别并引入、创建对应的对象

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271745306.png)



## 开发步骤
### 引入依赖
`uv add langchain`

`uv add langchain-deepseek`

### 配置环境
`DEEPSEEK_API_KEY=sk-xxx`

### 初始化模型
```python
from langchain.chat_models import init_chat_model
model = init_chat_model(model="deepseek-chat")
```





## 其他内容见：2.2_models.ipynb
# 消息（Message）
## 消息类型
在LangChain中，发送给模型的消息、模型返回的消息都统一被封装为BaseMessage，并且准备了多个BaseMessage的子类对应不同角色类型的消息。



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271752949.png)









<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271747119.png)







# 提示词（Prompts）
# Tools
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271746380.png)





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271744309.png)







<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271753476.png)





<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271751126.png)





# 记忆（memory）
对于Agent而言，记忆至关重要，因为它能让代理记住之前的交互情况，从反馈中学习，并适应用户的偏好。随着代理处理的任务愈发复杂，涉及的用户交互也越来越多，这种能力对于提高效率和用户满意度而言变得不可或缺。



## 记忆分类
对于智能体而言，记忆分为了两类：

+ 短期记忆（short-term memory）当前任务或会话的上下文（Working Memory 或 Session Memory）
+ 长期记忆（long-term memory)   跨任务或会话的**经验与知识**（Persistent Memory）



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271753923.png)



总结：

|  | **短期记忆** | **长期记忆** |
| :--- | :--- | :--- |
| 生命周期 | 当前会话（短暂） | 跨任务、跨会话（永久） |
| 内容 | 当前任务状态 | 知识、经验、用户偏好 |
| 是否跨任务 | ❌ | ✅ |
| 存储 | Redis/内存 | DB/Vector DB |


## 短期记忆
由于**短期记忆**通常生命周期是当前会话，所以我们也可以称为**会话记忆**。Agent的会话记忆通常包含三部分：

•对话历史

•查询结果

•任务状态





LangChain提供了自动化的记忆管理方案：

+ 首先，LangChain把会话记忆（也就是Messages列表）记录为[**AgentState**](https://reference.langchain.com/python/langchain/agents/middleware/types/AgentState)的一部分

> `AgentState` 定义了智能体在运行过程中需要跟踪、存储和传递的所有数据结构
>
> **AgentState** 就像是智能体随身携带的一个**记事本**。每经过一个处理节点，智能体都会在笔记本上查看当前进度，并写下新的发现。没有这个“笔记本”，智能体就会变成“鱼的记忆”，无法处理复杂的长任务。
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271749575.png)
>

+ AgentState通过**Checkpointer**对象来保存，每一次与AI的交互都会生成一个快照，记录为一个checkpoint，把同一会话的所有checkpoint组合在一起，就是完整的会话历史了。

> **Checkpointer** 检查点管理器，相当于一个节点，将内容实时保存，防止丢失，也可以随时回退查看之前的记忆
>

+ 为了区分不同的会话记忆，不同会话需要设定各自的`thread_id`，相同会话则使用相同`thread_id`

> Thread 线程，在智能体开发中，**Thread 是一个唯一标识符（**`thread_id`**）**，用于将一系列的状态快照（Checkpoints）归类到同一个时间轴上。
>
> 可以把 Thread 想象成一条**时间线**，而 Checkpoint 是这条线上的**刻度**
>

+ 向Agent发起会话时必须指定自己的`thread_id`以唤起对应的会话记忆

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271744733.png)

以 LangChain提供的基于内存的 Checkpointer 为例来演示会话记忆



### InMemorySaver
见 2.6_memory.ipynb



### 持久化 Memory
见 2.6_memory.ipynb





## 记忆管理策略
当历史会话超过上下文，就会出现上下文丢失、“注意力分散”的问题，模型的响应速度、回答质量会大大降低

[https://docs.langchain.com/oss/python/langchain/short-term-memory#common-patterns](https://docs.langchain.com/oss/python/langchain/short-term-memory#common-patterns)

Common patterns 主要用于解决长对话超过 LLM 上下文窗口限制的问题

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271754420.png)

### 修剪消息（Time messages）
修剪消息，在 AgentState 中的消息列表依然是完整的，只不过发送给 LLM 之前会进行修剪，删除最早的或多余的 N 条消息，只保留一部分消息

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271750762.png)



### 删除消息
使用 `RemoveMessage` 指令。这对于清理整个历史记录或删除不再需要的特定中间步骤（如过时的工具调用）非常有用。



### 总结消息
为了避免直接修剪导致的“记忆丢失”，总结模式提供了一种更智能的权衡。

使用另一个（通常是更小、更廉价的）模型对早期的对话进行摘要，然后用这个**摘要**替换掉那些原始的长篇消息。



LangChain 提供了 `SummarizationMiddleware`，可以配置触发条件（如超过 4000 Tokens 时触发）以及保留的消息数量。



用法测试：

见2.6_memory.ipynb







# 第三篇 Agent入门实战（AI 私厨）


# Agent入门实战（AI 私厨）
# 1.需求分析
AI 私厨是一个基于 LangChain 和多模态 AI 的食谱推荐应用。用户可以拍摄自家冰箱或厨房的食物照片，AI 会自动识别图片中的食材，根据食材搜索相关食谱推荐给用户。

## 1.1 功能特性
+ 📸 **图片识别** - 上传食材图片，自动识别其中的食材
+ 🔍 **智能搜索** - 根据识别的食材搜索相关食谱
+ 🍽️ **智能排序** - 按推荐度、难度、营养价值对食谱进行排序
+ 💡 **创意建议** - 当找不到合适食谱时，提供创意搭配建议
+ 💬 **对话交互** - 聊天式界面，支持图片上传 + 文本对话

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271752214.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271744915.png)

## 1.2 预期效果
基本的聊天界面窗口，支持**图片上传**+**文本对话**：

上传图片，根据图片识别食材：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271748150.png)

根据食材搜索食谱，并智能排序：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271753764.png)

## 1.3 实现思路分析
定义一个基础 Agent ，核心就是模型（Model）和工具（Tool）：

+ **模型**：由于要实现多模态输入，所以必须用多模态模型，比如 qwen3.5-plus
+ **工具**：需要联网搜索食谱，所以要用到web搜索工具，推荐Tavily
+ **记忆**：短期记忆我们暂时使用Sqlite来实现

剩下就是提示词了：

```plain
system_prompt = """
 你是一名私人厨师。收到用户提供的食材照片或清单后，请按以下流程操作：
 1.识别和评估食材：若用户提供照片，首先辨识所有可见食材。基于食材的外观状态，评估其新鲜度与可用量，整理出一份“当前可用食材清单”。
 2.智能食谱检索：优先调用 web_search 工具，以“可用食材清单”为核心关键词，查找可行菜谱。
 3.多维度评估与排序：从营养价值和制作难度两个维度对检索到的候选食谱进行量化打分，并根据得分排序，制作简单且营养丰富的排名靠前。
 4.结构化方案输出：把排序后的食谱整理为一份结构清晰的建议报告，要包含食谱信息、得分、推荐理由、食谱的参考图片，帮助用户快速做出决策。
 
 请严格按照流程，优先调用 web_search 工具搜索食谱，搜索不到的情况下才能自己发挥。
 """
```

# 2. 功能模拟（jupyter）
## 2.1 配置
`**.env**` 文件：

```plain
# 阿里百炼
 DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
 DASHSCOPE_API_KEY=sk-36b7386d28524af486314f6156842c0b
 
 
 # tools
 ## Tavily工具
 TAVILY_API_KEY=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
```

## 2.2 依赖
```plain
[project]
 name = "food-recipe-recommender"
 version = "0.1.0"
 description = "AI-powered recipe recommender based on uploaded food images"
 readme = "README.md"
 requires-python = ">=3.10"
 dependencies = [
     "langchain>=0.3.0",
     "langchain-community>=0.3.0",
     "langchain-openai>=0.2.0",
     "langchain-core>=0.3.0",
     "streamlit>=1.40.0",
     "pillow>=11.0.0",
     "python-dotenv>=1.0.0",
     "tavily-python>=0.5.0",
     "langchain-tavily>=0.1.0",
     "fastapi>=0.109.0",
     "uvicorn>=0.27.0",
     "python-multipart>=0.0.6",
     "alibabacloud-oss-v2>=1.2.4",
     "langgraph-checkpoint-sqlite>=3.0.3",
 ]
 
 [tool.uv]
 dev-dependencies = [
     "pytest>=8.0.0",
     "black>=24.0.0",
 ]
```

## 2.3 功能验证
以下内容见：`**2.7_实战.ipynb**`

# 3.LangSmith 联调测试
LangChain的Agent底层是基于LangGraph实现的，而LangGraph提供了完整的后端部署功能，自带非常完善的API接口，无需我们额外处理。

同时，LangChain还提供了基于LangSmith的GUI控制台实现Agent的调试、监控、一键部署。

接下来我们就看看如何利用LangGraph在本地部署测试我们的Agent，并通过LangSmith做测试。

## 3.1 配置 LangSmith
LangSmith提供了对Agent的GUI管理界面，而且还支持一键云部署功能。通常在测试阶段，建议大家在Agent中引入Simth，方便做测试和调试。

首先，我们要注册LangSmith，开通服务，生成API_KEY。

注册地址：[https://smith.langchain.com/](https://smith.langchain.com/)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271745911.png)



```plain
# langsmith
 LANGSMITH_API_KEY=
 LANGSMITH_TRACING=true
```

## 3.2 开发 Agent
把刚才的代码集中到一个py文件中

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271754792.png)

```plain
from langchain.chat_models import init_chat_model
 from langchain_tavily import TavilySearch
 from langchain.agents import create_agent
 import os
 
 # 1.加载环境变量
 from dotenv import load_dotenv
 load_dotenv()
 
 # 2.web搜索工具，使用tavily作为web搜索工具
 web_search = TavilySearch(
     max_results=5,
     topic="general"
 )
 
 # 3.多模态模型
 model = init_chat_model(
     model="qwen3.5-plus",  # 模型名称，这里选择qwen3.5-plus，这是一个多模态模型，支持图片、文本、音频、视频
     model_provider="openai",
     base_url=os.getenv("DASHSCOPE_BASE_URL"),
     api_key=os.getenv("DASHSCOPE_API_KEY")
 )
 
 # 4.Agent系统提示词
 system_prompt = """
 你是一名私人厨师。收到用户提供的食材照片或清单后，请按以下流程操作：
 1.识别和评估食材：若用户提供照片，首先辨识所有可见食材。基于食材的外观状态，评估其新鲜度与可用量，整理出一份“当前可用食材清单”。
 2.智能食谱检索：优先调用 web_search 工具，以“可用食材清单”为核心关键词，查找可行菜谱。
 3.多维度评估与排序：从营养价值和制作难度两个维度对检索到的候选食谱进行量化打分，并根据得分排序，制作简单且营养丰富的排名靠前。
 4.结构化方案输出：把排序后的食谱整理为一份结构清晰的建议报告，要包含食谱信息、得分、推荐理由、食谱的参考图片，帮助用户快速做出决策。
 
 请严格按照流程，优先调用 web_search 工具搜索食谱，搜索不到的情况下才能自己发挥。
 """
 
 # 5.创建Agent
 agent = create_agent(
     model=model,  # 模型
     tools=[web_search],  # 工具
     system_prompt=system_prompt  # 系统提示词
 )
```

## 3.3 本地部署
先安装LangGraph的依赖

`**uv add langgraph-cli[inmem]**`

在项目根目录添加一个langgraph配置文件

```plain
{
     "dependencies": ["."],
     "graphs": {
         "chief_agent": "./app/agents/personal_chief.py:agent"
     },
     "env": ".env"
 }
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271751709.png)

打开Pycharm终端

使用LangGraph命令本地部署Agent

`**uv run langgraph dev**`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271750830.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271749420.png)

## 3.4 LangSmith Studio 测试
由于我们部署时配置了LangSmith，所以可以直接访问LangSmith提供的调试GUI界面：

[https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024](https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024)

这里可以非常方便的调试我们的Agent，查看我们Agent的运行细节：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271746168.png)

可以直接在界面中测试：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271747672.png)

也可以查看详细的调用过程：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271749842.png)

同时，LangSmith还提供了一键云部署功能，可以把Agent部署到云端：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271753916.png)

但是要需要缴付昂贵的费用。。

所以，建议只在Agent测试阶段使用LangSmith吧~

# 4. 实战开发
Agent跑通了，但目前还存在几个问题：

+ 目前的图片信息还是采用base64方式提交给模型，会占用大量内存，性能差
+ 我们没有开发自己的前端，用户体验不好

在向模型提交多模态消息，比如：音频、视频、图片时，我们不建议直接发送文件数据（base64）给模型，这会大量占用内存和会话记忆。更常见的方案是：

+ 先将多模态文件上传至通用的OSS服务，例如：阿里云OSS、腾讯云COS等
+ 获取oss服务的文件url地址，组织多模态消息，发送给大模型

因此，我们需要单独开发一个文件上传的服务接口，让前端先上传好文件，再调用Agent.

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271746574.png)

我们的服务端需要具备以下接口：

+ 对话接口：接收用户聊天消息，并调用Agent
+ 会话管理接口：查询或删除会话历史
+ 文件上传接口：调用OSS提供的客户端，实现文件上传授权，将来由前端完成文件上传，文件不经过服务器。

## 4.1 FastAPI 服务端
首先，安装一些依赖

`**uv add fastapi alibabacloud-oss-v2**`

一个基于FastAPI开发的基础网关：

```plain
app/
   ├── main.py                    # FastAPI 入口，配置路由和静态文件
   │
   ├── agents/
   │   └── personal_chief.py      # AI 代理核心逻辑
   │ 
   ├── api/
   │   └── v1/
   │       ├── chat.py             # 对话 API
   │       │   ├── POST /chat/stream     流式对话
   │       │   ├── GET  /chat/messages   获取历史
   │       │   └── DELETE /chat/messages 清空历史
   │       │
   │       └── oss.py              # OSS 上传签名 URL
   │
   ├── models/
   │   └── schemas.py              # Pydantic 数据模型，请求/响应数据结构定义  
   │
   ├── common/
   │   └── logger.py               # 日志配置
   │
   └── static/                     # Next.js 编译产出的静态网页 
       ├── index.html              # 前端入口
       ├── _next/                  # Next.js 构建资源
       └── ...                     # 其他静态资源
```

## 4.2 OSS 配置
这里我们以阿里云OSS为例来说明

### 注册阿里云
注册地址：

[https://oss.console.aliyun.com/overview](https://oss.console.aliyun.com/overview)

注册登录成功后，访问链接：[https://oss.console.aliyun.com/overview](https://oss.console.aliyun.com/overview)，即可看到oss控制台：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271750728.png)

如果显示【**尚未开通**】，点击【**立即开通**】即可：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271746651.png)

默认为按量付费，价格非常便宜，几乎可以忽略不计：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271750964.png)

开通成功后，即可进入控制台页面：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271749549.png)

### 申请API_KEY
访问链接：[https://ram.console.aliyun.com/overview?activeTab=workflow](https://ram.console.aliyun.com/overview?activeTab=workflow)，进入RAM访问控制页面：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271754252.png)

点击：`**用户**`>`**创建用户**`，填写用户信息：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271751798.png)

创建完成后，一定要记住你的AccessKey的ID和Secret：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271746658.png)

然后，给新添加的用户《新增授权》：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271745593.png)

在授权页面，给新用户添加oss的绝对控制权限：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271747984.png)

### 开通OSS
访问链接：[https://oss.console.aliyun.com/overview](https://oss.console.aliyun.com/overview)，进入oss控制台，选择**创建Bucket**：

填写bucket信息：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271752407.png)

### 设置权限
目前，新建的Bucket还是无法访问的，是私有的。为了方便测试，这里我们**暂时**将其设置为**公共读**。

**注意**：

+ 实际开发中oss中的图片应该设置为**私有**！不可对外暴露！！由额外的CDN服务对外暴露！
+ 本例中，我们为了方便暂时将bucket设置为公共读，测试完毕后**请及时关闭权限**！

首先，进入Bucket管理页面：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271748470.png)

进入具体的Bucket设置，关闭公共访问开关：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271749598.png)

设置权限为公共读：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271752408.png)

接着，我们要开启跨域访问权限：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271751510.png)

点击《**创建规则**》，填写跨域规则：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271746401.png)

### 配置API_KEY
```plain
# 阿里OSS
 OSS_ACCESS_KEY_ID=xxxxxxxxxxxx
 OSS_ACCESS_KEY_SECRET=xxxxxxxxxxxx
 OSS_BUCKET=persxxxxxxxxxxx
```

## 4.3 添加 Checkpointer
完整的 personal_chief.py

```python
from langchain.chat_models import init_chat_model
from langchain_tavily import TavilySearch
from langchain.agents import create_agent
import os
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3

# 1.加载环境变量
from dotenv import load_dotenv
load_dotenv()

# 2.web搜索工具，使用tavily作为web搜索工具
web_search = TavilySearch(
    max_results=5,
    topic="general"
)

# 3.多模态模型
model = init_chat_model(
    model="qwen3.5-plus",  # 模型名称，这里选择qwen3.5-plus，这是一个多模态模型，支持图片、文本、音频、视频
    model_provider="openai",
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
    api_key=os.getenv("DASHSCOPE_API_KEY")
)

# 4.初始化checkpointer
# 连接sqlite
connection = sqlite3.connect("../db/personal_chief.db", check_same_thread=False)
# 初始化checkpointer
checkpointer = SqliteSaver(connection)
# 自动建表
checkpointer.setup()

# 5.Agent系统提示词
system_prompt = """
 你是一名私人厨师。收到用户提供的食材照片或清单后，请按以下流程操作：
 1.识别和评估食材：若用户提供照片，首先辨识所有可见食材。基于食材的外观状态，评估其新鲜度与可用量，整理出一份“当前可用食材清单”。
 2.智能食谱检索：优先调用 web_search 工具，以“可用食材清单”为核心关键词，查找可行菜谱。
 3.多维度评估与排序：从营养价值和制作难度两个维度对检索到的候选食谱进行量化打分，并根据得分排序，制作简单且营养丰富的排名靠前。
 4.结构化方案输出：把排序后的食谱整理为一份结构清晰的建议报告，要包含食谱信息、得分、推荐理由、食谱的参考图片，帮助用户快速做出决策。
 
 请严格按照流程，优先调用 web_search 工具搜索食谱，搜索不到的情况下才能自己发挥。
 """

# 6.创建Agent
agent = create_agent(
    model=model,  # 模型
    tools=[web_search],  # 工具
    checkpointer=checkpointer,  # 记忆
    system_prompt=system_prompt  # 系统提示词
)
```

在app下创建一个db目录，用以存放Sqlite的db文件：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271748780.png)

## 4.4 开发接口
目前在`**agents/personal_cheif.py**`文件中虽然已经开发了Agent，但是外界还是无法访问，我们需要定义Restful的接口供前端使用。

其中，在`**api/v1/chat.py**`中定义了Restful的接口，等待我们实现功能：

```python
from fastapi import APIRouter

router = APIRouter()

@router.post("/chat/stream")
async def chat_endpoint(request: ChatRequest):
    """流式聊天接口"""
    pass

@router.get("/chat/messages")
async def get_chat_messages(thread_id: str):
    """获取历史消息"""
    pass


@router.delete("/chat/messages")
async def clear_chat_messages(thread_id: str):
    """清空历史消息"""
    pass
```

### 4.4.1 功能实现
我们可以在`**agents/personal_cheif.py**`中基于agent开发所需的3个功能：

+ 多模态聊天
+ 获取会话历史
+ 清空会话历史

`**agents/personal_cheif.py**`的完整代码如下：

```python
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, AIMessageChunk, AIMessage
from langchain_core.tools import tool
from langchain_tavily import TavilySearch
from langchain.agents import create_agent
from app.common.logger import logger
import os
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3

# 加载环境变量
from dotenv import load_dotenv

load_dotenv()

# web搜索工具，使用tavily作为web搜索工具
tavily = TavilySearch(
    max_results=5,
    topic="general"
)


# 多模态模型
model = init_chat_model(
    model="qwen3-omni-flash",  # 模型名称，这里选择qwen3.5-plus，这是一个多模态模型，支持图片、文本、音频、视频
    model_provider="openai",
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
    api_key=os.getenv("DASHSCOPE_API_KEY")
)


# 初始化checkpointer
checkpointer = SqliteSaver(sqlite3.connect("db/personal_chief.db", check_same_thread=False))
# 自动建表
checkpointer.setup()

# Agent系统提示词
system_prompt = """
 你是一名私人厨师。收到用户提供的食材照片或清单后，请按以下流程操作：
 1.识别和评估食材：若用户提供照片，首先辨识所有可见食材。基于食材的外观状态，评估其新鲜度与可用量，整理出一份“当前可用食材清单”。
 2.智能食谱检索：优先调用 web_search 工具，以“可用食材清单”为核心关键词，查找可行菜谱。
 3.多维度评估与排序：从营养价值和制作难度两个维度对检索到的候选食谱进行量化打分，并根据得分排序，制作简单且营养丰富的排名靠前。
 4.结构化方案输出：把排序后的食谱整理为一份结构清晰的建议报告，要包含食谱信息、得分、推荐理由、食谱的参考图片，帮助用户快速做出决策。
 
 请严格按照流程，优先调用 web_search 工具搜索食谱，搜索不到的情况下才能自己发挥。
 """

# 创建代理
agent = create_agent(
    model=model,  # 模型
    tools=[tavily],  # 工具
    checkpointer=checkpointer,  # 记忆
    system_prompt=system_prompt  # 系统提示词
)

# 流式对话
async def search_recipes(prompt: str, image: str, thread_id: str):
    """调用agent搜索食谱"""
    logger.info(f"[用户]: {prompt}, image: {image}, thread_id: {thread_id}")
    try:
        # 判断是否有图片，封装不同格式的消息
        if not image or image.strip() == "":
            message = HumanMessage(content=prompt)
        else:
            message = HumanMessage(content=[
                {"type": "image", "url": image},
                {"type": "text", "text": prompt}
            ])

        # 流式调用Agent
        for chunk, metadata in agent.stream(
            {"messages": [message]},
            {"configurable": {"thread_id": thread_id}},
            stream_mode="messages"
        ):
            if isinstance(chunk, AIMessageChunk) and chunk.content:
                yield chunk.content

    except Exception as e:
        logger.error(f"\n[错误]: {str(e)}")
        yield "信息检索失败，试试看手动输入食物列表？"

# 清空会话
def clear_messages(thread_id: str):
    """清空会话"""
    logger.info(f"清空历史消息，thread_id: {thread_id}")
    checkpointer.delete_thread(thread_id)

# 查询会话历史
def get_messages(thread_id: str) -> list[dict[str, str]]:
    """获取会话历史"""
    logger.info(f"获取历史消息，thread_id: {thread_id}")

    # 根据 thread_id 查询 checkpoint
    checkpoint = checkpointer.get({"configurable": {"thread_id": thread_id}})

    # 如果不存在，返回空列表
    if not checkpoint:
        return []

    # 安全获取 messages
    channel_values = checkpoint.get("channel_values")
    if not channel_values:
        return []

    messages = channel_values.get("messages", [])
     if not messages:
         return []
 
     # 转换消息格式
     result = []
     for msg in messages:
         if not msg.content:
             continue
 
         if isinstance(msg, HumanMessage):
             result.append({"role": "user", "content": msg.content})
         elif isinstance(msg, AIMessage):
             result.append({"role": "assistant", "content": msg.content})
 
     return result
```

### 4.4.2 完善接口
修改chat.py文件，导入`**agents.personal_cheif**`中的三个方法，完善接口：

```python
from fastapi import APIRouter
from app.models.schemas import ChatRequest
from fastapi.responses import StreamingResponse
from app.agents.personal_chief import search_recipes, get_messages, clear_messages


router = APIRouter()


@router.post("/chat/stream")
async def chat_endpoint(request: ChatRequest):
    """流式对话"""
    return StreamingResponse(
        search_recipes(request.message, request.image_url, request.thread_id),
        media_type="text/event-stream"
    )


@router.get("/chat/messages")
async def get_chat_messages(thread_id: str):
    """获取历史消息"""
    messages = get_messages(thread_id)
    return {"messages": messages}


@router.delete("/chat/messages")
async def clear_chat_messages(thread_id: str):
    """清空历史消息"""
    clear_messages(thread_id)
    return {"success": True}
```

## 4.5 测试
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271752421.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271753430.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271749537.png)

  








# 第四篇 AI 私厨项目部署
仓库位置：[https://github.com/XVSHIFU/personal_chief](https://github.com/XVSHIFU/personal_chief)



关于 AI 私厨的完整项目源码位于 **lc-course\notebooks\第三章-Agent入门实战（AI私厨）\food-recipe-recommender。**

并且有完整的 **README.md** （notebooks\第三章-Agent入门实战（AI私厨）\food-recipe-recommender\README.md），包括本地构建和 docker 本地部署、docker 镜像推送**阿里云 Registry**，

已有可用镜像 `crpi-z2yvaep8ppb79obm.cn-hangzhou.personal.cr.aliyuncs.com/docker_fast_test/docker-a:1.0.0`，按照说明文档部署即可使用。





## 最后附上我部署的 AI 私厨：[http://39.106.48.91:8001/](http://39.106.48.91:8001/)
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271752692.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604271746773.png)





# food-recipe-recommender
AI 私厨食谱推荐项目：上传食材图片或输入食材描述，后端调用大模型与检索能力生成个性化食谱推荐。

## 项目结构
+ `app/`：FastAPI 后端、Agent、OSS 接口、静态文件服务
+ `frontend/`：Vite + React 前端
+ `db/`：LangGraph / SQLite 会话数据库挂载目录
+ `README.md`：部署与运行说明

## 运行依赖
+ Docker
+ 访问阿里云 OSS / DashScope 所需的密钥
+ Linux 服务器（推荐）或本地开发机

## 环境变量
运行时通过 `.env` 注入，**不要打进镜像**。

**关于env内容，在视频课中已经明确说明，如需立即使用请在笔记中寻找来源或者询问AI。**

```plain
# 阿里百炼
DASHSCOPE_BASE_URL=
DASHSCOPE_API_KEY=


# tools
## Tavily工具
TAVILY_API_KEY=

# LangSmith
LANGSMITH_API_KEY=
LANGSMITH_TRACING=true

# project name
LANGSMITH_PROJECT=

# 阿里OSS
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=3cZXcWqoP5C1jmDrDiuDT5MX
OSS_BUCKET=

```

### 说明
+ `DASHSCOPE_BASE_URL` / `DASHSCOPE_API_KEY`：大模型调用配置
+ `OSS_ENDPOINT` / `OSS_BUCKET`：阿里云 OSS 上传配置
+ `ALIBABA_CLOUD_ACCESS_KEY_ID` / `ALIBABA_CLOUD_ACCESS_KEY_SECRET`：OSS 签名所需凭证

## Docker 本地构建
在项目根目录执行：

```bash
docker build --network=host -t food-recipe-recommender:1.0.0 .
```

## Docker 本地运行
请先准备好 `.env` 文件，然后运行：

```bash
docker run -d \
  --name food-recipe-recommender \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file .env \
  -v /opt/food-recipe/db:/app/db \
  food-recipe-recommender:1.0.0
```

访问地址：`http://127.0.0.1:8001`

## 推送到阿里云 Registry
此处属于我个人的阿里云仓库，相关参数详情见官方文档：[容器镜像服务  
](https://help.aliyun.com/zh/acr/getting-started/build-images-on-container-registry-enterprise-edition-instances?spm=a2c4g.11174283.help-menu-60716.d_1_0.5efa671bPg4c5u&scm=20140722.H_300068._.OR_help-T_cn~zh-V_1)

```bash
docker login --username=xvsf539 crpi-z2yvaep8ppb79obm.cn-hangzhou.personal.cr.aliyuncs.com
docker tag food-recipe-recommender:1.0.0 crpi-z2yvaep8ppb79obm.cn-hangzhou.personal.cr.aliyuncs.com/docker_fast_test/docker-a:1.0.0
docker push crpi-z2yvaep8ppb79obm.cn-hangzhou.personal.cr.aliyuncs.com/docker_fast_test/docker-a:1.0.0
```

## 云服务器部署
服务器上准备好：

+ `/opt/food-recipe/.env`
+ `/opt/food-recipe/db/`（用于持久化 SQLite 数据）

拉取并启动：

```bash
docker pull crpi-z2yvaep8ppb79obm.cn-hangzhou.personal.cr.aliyuncs.com/docker_fast_test/docker-a:1.0.0

docker run -d \
  --name food-recipe-recommender \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file /opt/food-recipe/.env \
  -v /opt/food-recipe/db:/app/db \
  crpi-z2yvaep8ppb79obm.cn-hangzhou.personal.cr.aliyuncs.com/docker_fast_test/docker-a:1.0.0
```

## 常见问题
+ `.env` 不要 `COPY` 到镜像里，运行时通过 `--env-file` 传入
+ `db/` 建议挂载到宿主机，避免容器删除后丢失会话数据
+ 如果拉取或构建依赖慢，`Dockerfile` 已配置国内 PyPI 镜像源













