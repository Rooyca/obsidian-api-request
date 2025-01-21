# 🔎 概述

APIRequest (APIR) 是笔记应用 [Obsidian](https://obsidian.md/) 的一个插件，它允许您向 api 或其他来源发出请求并在笔记中显示响应。

## 🔥 功能

- 使用各种方法执行 HTTP 请求，例如 `GET`、`POST`、`PUT` 和 `DELETE`。
- 接收不同格式的响应，包括 JSON、HTML 和 Markdown。
- 在代码块内利用前言中的变量。
- 将响应保存在 `localStorage` 中，以方便访问和重用。
- 根据需要禁用代码块以优化性能。
- 以指定的间隔多次重复请求，促进自动化任务或连续数据检索而无需人工干预。
- 当特定值满足预定义条件时接收通知，从而实现主动监控和警报。
- 定义执行请求的快捷方式，通过快速访问常用请求来提高效率和用户体验。
- 显示响应中的特定值，提供对数据呈现的精细控制。

## ⚡ 如何使用

### 👨🏻‍💻 代码块

要使用它，请创建一个代码块，并将语言设置为 `req`。在代码块内，您可以指定`url`、`method`、`body`、`headers`、`format`等。有关更多信息，请参阅[可用标志](codeblocks.md#flags)。

~~~markdown
```req
url: https://my-json-server.typicode.com/typicode/demo/comments
method: post
body: {"id":1}
headers: {"Accept": "application/json"}
show: id
format: <h1>{}</h1>
req-id: id-persona
disabled
```
~~~

### 🛠️ 设置（尚未拥有所有功能）

!!! info "所有参数都可以在设置中定义"

按 `Ctrl+P` 并搜索 `APIR`。有两个选项：

1. 在模态中显示响应
2. 将响应粘贴到当前文档中（在当前行）

[更多信息](settings.md)
