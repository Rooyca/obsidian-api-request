# 🔎 概述

APIRequest (APIR) 是一个用于笔记应用 [Obsidian](https://obsidian.md/) 的插件，允许您向 API 发出请求并直接在笔记中显示响应。

## 🔥 功能特性

- **多种 HTTP 方法**：使用 `GET`、`POST`、`PUT`、`DELETE`、`PATCH`、`HEAD` 和 `OPTIONS` 执行请求。
- **变量替换**：利用 `front-matter` 中的变量、全局变量，甚至重用其他代码块的响应。
- **响应缓存**：将响应保存在 `localStorage` 中，方便跨笔记访问和重用。
- **性能控制**：根据需要禁用代码块以优化性能。
- **精确数据提取**：使用 JSONPath 显示响应中的特定值，提供对数据呈现的细粒度控制。
- **安全优先**：内置输入验证和清理，防止 XSS、注入攻击和目录遍历。
- **自动更新**：在需要时自动刷新缓存的响应。
- **格式化输出**：为响应数据自定义 HTML/文本格式。

## 🔒 安全功能

APIRequest 实现了全面的安全措施：

- ✅ **URL 验证**：仅允许 HTTPS 和 HTTP 协议
- ✅ **输入清理**：所有用户输入都经过验证和清理
- ✅ **XSS 防护**：清理 HTML 输出以防止脚本注入
- ✅ **目录遍历保护**：验证文件路径以防止未授权访问
- ✅ **安全 JSONPath**：在执行前验证 JSONPath 表达式
- ✅ **UUID 清理**：清理请求标识符以防止注入攻击

!!! warning "安全最佳实践"
    - 进行 API 请求时始终使用 HTTPS URL
    - 将 API 密钥存储在全局变量中（设置 → APIRequest → 全局变量），而不是笔记中
    - 定期审查和清除缓存的响应（设置 → APIRequest → 已保存的 API 请求）
    - 仅连接到受信任的 API 端点

## ⚡ 如何使用

### 👨🏻‍💻 代码块

要使用它，创建一个语言设置为 `req` 的代码块。在代码块内，您可以指定 `url`、`method`、`body`、`headers` 等。有关更多信息，请参阅[可用标志](codeblocks.md#flags)。

~~~markdown
```req
url: https://my-json-server.typicode.com/typicode/demo/comments
method: post
body: {"id":1}
headers: {"Accept": "application/json"}
show: $.id
req-uuid: IDpersona
disabled
```
~~~

## 📚 快速开始

1. **简单的 GET 请求**

~~~markdown
```req
url: https://api.github.com/users/octocat
show: $.name
```
~~~

2. **使用变量**

~~~markdown
```req
url: https://api.example.com/user/{{this.userId}}
headers: {"Authorization": "Bearer {{API_TOKEN}}"}
show: $.data.name
```
~~~

3. **缓存响应**

~~~markdown
```req
url: https://api.example.com/data
req-uuid: mydata
show: $.result
```
~~~

4. **重用缓存数据**

~~~markdown
```req
url: https://api.example.com/more-data
headers: {"X-Token": "{{ls.mydata>$.token}}"}
```
~~~

有关所有标志和功能的详细文档，请参阅[代码块](codeblocks.md)。
