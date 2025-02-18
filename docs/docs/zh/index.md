# 🔎 概述

APIRequest (APIR) 是笔记应用 [Obsidian](https://obsidian.md/) 的一个插件，它允许您向 api 或其他来源发出请求并在笔记中显示响应。

## 🔥 功能

- 使用各种方法执行 HTTP 请求，例如 `GET`、`POST`、`PUT` 和 `DELETE`。
- 在代码块内利用前言中的变量。
- 将响应保存在 `localStorage` 中，以方便访问和重用。
- 根据需要禁用代码块以优化性能。
- 以指定的间隔多次重复请求，促进自动化任务或连续数据检索而无需人工干预。

## ⚡ 如何使用

### 👨🏻‍💻 代码块

要使用它，请创建一个代码块，并将语言设置为 `req`。在代码块内，您可以指定`url`、`method`、`body`、`headers` 等。有关更多信息，请参阅[可用标志](codeblocks.md#flags)。

~~~markdown
```req
url: https://my-json-server.typicode.com/typicode/demo/comments
method: post
body: {"id":1}
headers: {"Accept": "application/json"}
show: $.id
req-uuid: id-persona
disabled
```
~~~
