# 极简导航
当前版本为: 1.0.3 <br>
线上地址: [https://nav.zzzmh.cn](https://nav.zzzmh.cn) <br>
开源地址: [https://github.com/zzzmhcn/nav](https://github.com/zzzmhcn/nav) <br>

## 版本更新

#### 2024/05
和风天气免费天气插件没了<br>
我一气之下<br>
~~(想自己开发一个！不受制于人！大丈夫生于天地之间，岂能郁郁久居人下！)~~ <br>
气了一下<br>
<br>
连夜百度又找了两家，设计，品味，和和风都差远了，凑活吧，还能自己开发一个咋地。<br>
主要还是因为没钱！😅<br>
[https://www.tianqi.com/plugin/list](https://www.tianqi.com/plugin/list)<br>
[http://tianqiapi.com/index/plugin](http://tianqiapi.com/index/plugin)<br>
最终用tianqiapi的先凑活着过了<br>

<br>
重大更新！<br>
设置页面里的收藏夹，可以拖动排序了！<br>
小小的研究了一下VueDraggable<br>
笔记：[Vue Draggable 入门 网页列表拖动实现排序](https://leanote.zzzmh.cn/blog/post/admin/6646fa3bda7405001404cd19) <br>

<br>
#### 2023/12
修复开屏闪烁问题<br>
发现公共CDN的Vue.js加载速度不太稳定，快的时候飞快，慢的时候抽风。<br>
如果vue.js没加载起来 v-if就不起作用 导致大量需要隐藏的div就会提前显示出来 并且层级贼高<br>
解决方法是在最外层 #app 加display:none<br>
在js init方法第一行 吧display改回block<br>
<br>
顺便把2个外部依赖从公共CDN改成本地加载 以防不稳定现象出现<br>
<br>
#### 2023/07
加入天气<br>
加入live2d看板娘<br>
<br>
#### 2023/05
在设置中 新增图形化配置收藏列表功能<br>
<br>
## 截图
<br>
![截图](https://s2.loli.net/2024/05/17/3DjbU2eCQIvFkmH.jpg)
<br>
![截图](https://s2.loli.net/2024/05/17/duH7kStTozZYJym.jpg)
<br>

## 使用方法
 1. 点击右上角齿轮
 2. 对外观和收藏夹进行基本配置
 3. 完成所有配置后导出json自行保存备份


## 开发日志 2023/03

#### 前言
由于百度(登录后)的导航功能本身就有点难用的情况下，最近还改成首页强制显示推荐热搜，要多点一下“我的关注”才能看到收藏夹。 <br>
一气之下决定自己写一个导航站，受限于时间和个人水平都十分有限，1.0.0版本中只写我自己需要的最基础的功能。 <br>
代码方面遵循我个人浅薄理解的极简主义，功能会有一些比较偏执的取舍，在下文思路中会解释 <br>
 
#### 思路
 1. 至少在1.0.0版本中，使用纯前端，个人写的纯代码的文本大小控制在20KB左右，第三方依赖尽量少用，且用公共cdn加载，两者的总量控制在50KB左右 (最终压缩后线上版本的 html 6.8kb + js 8.1kb + css 5.4kb = 20.3kb ， 第三方依赖为 vue 35.1kb + idb 2.4kb = 37.5kb ， 另有iconfont约 3kb)
 2. 至少在1.0.0版本中，数据和图片最大限度全部存在客户端本地，没有后端服务器，无接口，不会以任何形式获取到用户个人信息和收藏列表，相对的1.0.0中也不支持云同步书签收藏夹，用户只能自己导出json备份
 2. 至少在1.0.0版本中，开源代码到 github/gitee，个人水平有限，若代码有不妥之处勿怪，本人作为一个后端出身的程序员，前端水平有限
 3. 至少在1.0.0版本中，书签中的网站图标icon只有3个办法设定，要么用户自行配置第三方url或base64到image字段，要么image为null则获取favicon.ico，要么关闭icon开关用第一个字实现css简易icon

#### 资源
 - 图标库: https://www.iconfont.cn/collections/detail?spm=a313x.7781069.1998910419.d9df05512&cid=19238

#### 存在借鉴
 - 由于之前长时间用过百度(登录后)的我的关注，以及简法主页和wetab等新标签页，所以审美多少会收到影响，一些设计可能会借鉴到这些网站扩展的风格。
 
#### 已实现 但不足
 - 搜索联想提示框目前只接入了百度联想 也就是说就算你选择bing搜索 联系词也是百度的(手动滴汗表情) 因为其他家不支持jsoup跨域 https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?jsoncallback=jQuery18003506930398483794_1679647671865&wd=6666&cb=keydata&_=1679648069365
 - 设置中书签收藏栏，本来是想做图形界面形式实现增删改，结果用原生h5+js实现起来太累，果断放弃，暂定用直接操作json方式(对程序员友好 对路人不友好)，按理说就应该做图形化或者图形+json2个都做，但我偷懒了(手动doge表情)
 
#### 未实现 想偷懒
 - doInput方法需要按以下方式防抖节流，keyword改变后延迟1秒执行联想，1秒内无论keyword改变多少次，都以满足1秒后的最后一个关键字去联想，不能高于这个频率（例如用户打字会频繁触发doInput方法，但只有最后输入完成的才需要联想）
 - 有可能的话希望实现一个 支持导入 "从chrome导出的收藏夹" bookmarks_xxx.html 格式 的功能，省得用户自己配置json烦躁
 - 若有一天能解决个人开发者能接入微信扫码登录，可能会实现云同步功能，解决同步过于麻烦等问题

---

## 注意
如果使用本项目制作线上网站，请在网站内著名出处，为此github地址：https://github.com/zzzmhcn/nav

## 感谢
![jb_beam _1_.png](https://s2.loli.net/2023/06/02/caw4KmEWXbOMTFy.png)
感谢 [JetBrains](https://jb.gg/OpenSourceSupport) 为本项目提供免费License支持
