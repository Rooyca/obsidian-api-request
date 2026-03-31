# 👨🏻‍💻 代码块

`codeblock` 是一个多功能代码块,可用于直接从你的笔记中发送 API 请求。本指南涵盖所有可用的标志以及如何有效且安全地使用它们。

## 🏳️ 标志

标志是指定请求参数的方式。所有标志都**不区分大小写**。

| 标志         | 默认值  | 必需 | 描述 |
| ------------| ---------| -------- | ----------- |
| [url](#url) |          | ✅ 是   | 要请求的 API 端点 |
| [method](#method) | GET   | 否 | HTTP 方法 (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS) |
| [body](#body) |         | 否 | 请求体 (JSON 格式) |
| [headers](#headers) |   | 否 | 请求头 (JSON 格式) |
| [show](#show) | ALL     | 否 | 用于提取特定数据的 JSONPath |
| [req-uuid](#req-uuid) | req-general | 否 | 用于缓存的唯一 ID |
| [hidden](#hidden) | FALSE | 否 | 隐藏输出 |
| [disabled](#disabled) | | 否 | 禁用请求 |
| [save-as](#save-as) |   | 否 | 将响应保存到文件 |
| [auto-update](#auto-update) | FALSE | 否 | 总是获取新数据 |
| [format](#format) | | 否 | 自定义输出格式 |
| [properties](#properties) | | 否 | 更新前置元数据属性 |

---

## 🔒 安全注意事项

!!! danger "重要安全指南"
    - **始终使用 HTTPS**: 使用 `https://` URL 以确保加密通信
    - **保护 API 密钥**: 将敏感令牌存储在全局变量中,永远不要在笔记中硬编码
    - **验证输入**: 插件会验证所有输入,但只连接到受信任的 API
    - **检查缓存数据**: 定期从设置中清除旧的缓存响应

### 输入验证

所有用户输入都会自动验证:

- **URL**: 只允许 `http://` 和 `https://` 协议
- **UUID**: 仅清理为字母数字、连字符和下划线
- **文件路径**: 阻止目录遍历 (`..`) 和绝对路径
- **JSONPath**: 验证表达式以防止脚本注入
- **格式字符串**: 清理 HTML 以防止 XSS 攻击

---

## 📖 变量与数据复用

### 本地存储与变量

API 响应可以存储在 `localStorage` 中,并在其他代码块或笔记中重用。要存储响应,必须使用 `req-uuid` 标志为其分配唯一标识符。

你可以使用以下语法访问存储的响应:

```
{{ls.UUID>JSONPath}}
```

* `UUID`: 在 `req-uuid` 标志中定义的唯一标识符(不含 `req-` 前缀)
* `JSONPath`: 你想要从响应中获取的特定数据的路径

**示例:**
如果你有一个带有 `req-uuid: user` 的请求,你可以这样访问用户的名字:

```
{{ls.user>$.name}}
```

!!! info "安全说明"
    UUID 会自动清理。只允许字母数字字符、连字符和下划线。

---

### 前置元数据变量

你可以使用以下语法引用笔记**前置元数据**中定义的变量:

```
{{this.variableName}}
```

**示例:**

前置元数据:
```yaml
---
userId: 12345
title: "我的笔记"
---
```

在请求中使用:
~~~markdown
```req
url: https://api.example.com/user/{{this.userId}}
```
~~~

!!! warning "安全警告"
    避免在前置元数据中存储敏感的 API 密钥。请改用全局变量。

---

### 全局变量

在插件设置中定义可重用的变量(设置 → APIRequest → 全局变量)。这些变量会被安全存储,可以通过以下方式访问:

```
{{VARIABLE_NAME}}
```

**示例:**

1. 在插件设置中添加:
   - 键: `API_KEY`
   - 值: `your-secret-key`

2. 在你的请求中:

~~~markdown
```req
url: https://api.example.com/data
headers: {"Authorization": "Bearer {{API_KEY}}"}
```
~~~

!!! tip "最佳实践"
    将所有 API 密钥和令牌存储为全局变量,以保持笔记的安全性和可移植性。

---

### 特殊变量

- `{{this.file.name}}` - 当前文件的基本名称(不含扩展名)

---

## 标志详情

### url

唯一**必需**的标志。它指定 API 请求的端点。

**语法:**
~~~markdown
```req 
url: https://api.example.com/endpoint
```
~~~

**使用变量:**
~~~markdown
```req 
# 这只是一个注释
url: https://jsonplaceholder.typicode.com/users/{{this.id}}
```
~~~

!!! note "其中 `{{this.id}}` 是在前置元数据中定义的变量 (`id`)。"

!!! danger "安全性"
    只允许 HTTPS 和 HTTP URL。出于安全考虑,其他协议(file://、javascript: 等)会被阻止。

---

### method

指定 HTTP 请求方法。默认值为 `GET`。

**可用方法:**
- GET (默认)
- POST
- PUT
- DELETE
- PATCH
- HEAD
- OPTIONS

**示例:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
```
~~~

---

### body

指定请求体。数据应为 JSON 格式。

**示例:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
body: {"title": "{{this.filename}}", "body": "bar", "userId": 1}
```
~~~

!!! note "其中 `{{this.filename}}` 是工作文件的名称。"

**使用变量的高级用法:**
~~~markdown
```req 
url: https://api.example.com/create
method: post
body: {"userId": {{this.userId}}, "token": "{{API_TOKEN}}"}
```
~~~

---

### headers

指定请求头。数据应为 JSON 格式。

**示例:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
headers: {"Content-type": "application/json; charset=UTF-8"}
```
~~~

**使用缓存响应作为请求头:**

你可以使用其他请求的响应作为 headers/body/url/show。例如,如果你有一个带有 `req-uuid: token` 的请求,你可以这样使用:

~~~markdown
```req
url: https://api.todoist.com/rest/v2/tasks
headers: {"Authorization": "Bearer {{ls.token>$.access_token}}"}
show: $..content
format: - [ ] {}
req-uuid: todos
```
~~~

!!! tip "常用请求头"
    - `Content-Type: application/json` - 用于 JSON 数据
    - `Authorization: Bearer TOKEN` - 用于 API 认证
    - `Accept: application/json` - 请求 JSON 响应

---

### show

使用 JSONPath 表达式指定要显示响应中的哪些数据。查看 [JSONPath 示例](https://github.com/JSONPath-Plus/JSONPath?tab=readme-ov-file#syntax-through-examples),或尝试 [jsonpath-plus](https://jsonpath-plus.github.io/JSONPath/demo/) 在线工具。

**简单示例:**
~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: $['chess_daily']['last']['rating']
```
~~~

**使用方括号的多个输出:**
~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: $.chess_daily[last,best].rating
```
~~~

**使用 + 的多个输出:**
~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: $.chess_daily[last,best].rating + $.chess960_daily[last,best].rating
```
~~~

**循环遍历数组:**

获取所有用户的城市:
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..address.city
```
~~~

**循环遍历前 N 个元素:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..[:3].address.city
```
~~~

**特定数组索引:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..[3,2,6].address.city
```
~~~

**最后一个元素:**

你可以使用 `(@.length-1)` 或只使用 `[-1:]` 访问最后一个元素:
~~~markdown
```req
url: https://api.modrinth.com/v2/project/distanthorizons
show: $.game_versions[(@.length-1)]
```
~~~

**多个属性:**
~~~markdown
```req 
url: http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=rooyca&api_key={{API_KEY}}&format=json&limit=4
show: $..recenttracks.track[0:][streamable,name,artist]
```
~~~

!!! info "安全说明"
    JSONPath 表达式会被验证以防止脚本注入。恶意表达式将被阻止。

---

### req-uuid

指定用于在 `localStorage` 中缓存请求响应的唯一标识符。

**示例:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
show: $.name
req-uuid: test-{{this.username}}
```
~~~

!!! note "其中 `{{this.username}}` 是在前置元数据中定义的变量 (`username`)。"

**访问缓存响应:**

可以使用 `req-uuid` 访问存储的响应(这不会触发新请求):

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
req-uuid: name
```
~~~

**与 Dataview 一起使用:**

也可以使用 [dataview](https://blacksmithgu.github.io/obsidian-dataview/) 访问响应:

~~~markdown
```dataviewjs
dv.paragraph(localStorage.getItem("req-UUID"))
```
~~~

!!! info "通过 localStorage 访问时始终使用 `req-` 前缀"
    通过 localStorage 直接访问时,使用: `localStorage.getItem("req-UUID")`

**删除缓存响应:**

从代码中:
~~~markdown
```dataviewjs
localStorage.removeItem("req-name")
```
~~~

从设置中:
转到 设置 → APIRequest → 已保存的 API 请求,然后点击你想删除的响应。

!!! tip "缓存管理"
    定期检查并清除旧的缓存响应以释放 localStorage 空间。

---

### hidden

执行代码块但不显示其输出。适用于缓存数据的后台请求。

**示例:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
req-uuid: name
hidden
```
~~~

!!! tip "用例"
    非常适合获取身份验证令牌或其他你想缓存但不显示的数据。

---

### disabled

禁用请求。代码块不会被执行。适用于临时禁用请求而不删除它们。

**示例:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
show: $.name
req-uuid: name
disabled
```
~~~

!!! tip "开发提示"
    在开发期间使用 `disabled` 以防止达到 API 速率限制。

---

### save-as

将整个响应保存到文件。需要文件扩展名。

**示例:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
save-as: posts/1.json
```
~~~

!!! warning "重要"
    - 文件路径会进行安全验证
    - 阻止目录遍历 (`..`)
    - 不允许绝对路径
    - 文件路径相对于你的仓库根目录
    - 不会自动创建目录

!!! tip "文件管理"
    在使用 `save-as` 之前,在你的仓库中创建目标目录。

---

### auto-update

强制代码块每次都获取新数据,忽略缓存响应。

**示例:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
req-uuid: firstPost
auto-update
save-as: posts/1.json
```
~~~

!!! note "何时使用"
    当你需要实时数据或缓存响应过时时使用 `auto-update`。

**不使用 `req-uuid`:** 请求默认总是获取新数据。  
**使用 `req-uuid`:** 不使用 `auto-update` 时,会使用缓存响应。  
**使用 `auto-update`:** 忽略缓存并总是获取新数据。

---

### format

指定显示响应的自定义格式。支持 HTML 并使用 `{}` 作为占位符。

**示例:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
show: $.[title,body]
format: <h1>{}</h1> <p>{}</p>
```
~~~

!!! note "在此示例中,第一个 `{}` 将被替换为 *title*,第二个 `{}` 将被替换为 *body*。"

**高级格式化:**
~~~markdown
```req
url: https://api.example.com/user/1
show: $.[name,email,age]
format: **Name:** {} | **Email:** {} | **Age:** {}
```
~~~

**列表格式化:**
~~~markdown
```req
url: https://api.todoist.com/rest/v2/tasks
headers: {"Authorization": "Bearer {{TODOIST_TOKEN}}"}
show: $..content
format: - [ ] {}
```
~~~

!!! danger "安全警告"
    格式字符串会被清理以防止 XSS 攻击。脚本标签、事件处理程序和 javascript: URI 会被自动删除。

---

### properties

使用响应数据更新前置元数据属性。需要 JSON 响应和 `show` 标志。

**语法:**
数据应为用逗号分隔的属性名称。

**示例:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
show: $.[id,title]
properties: id, title
```
~~~

**对于内部链接,使用 `[[..]]` 语法:**
~~~markdown
```req 
url: https://api.example.com/related
show: $.[id,name]
properties: relatedId, [[relatedNote]]
```
~~~

这将创建:
```yaml
---
relatedId: 123
relatedNote: "[[Note Name]]"
---
```

!!! tip "用例"
    非常适合从 API 响应中自动填充元数据。

---

## 💡 常见模式

### 身份验证流程

1. 获取身份验证令牌(隐藏):

~~~markdown
```req
url: https://api.example.com/auth/login
method: post
body: {"username": "{{this.username}}", "password": "{{this.password}}"}
req-uuid: auth
hidden
```
~~~

2. 在后续请求中使用令牌:

~~~markdown
```req
url: https://api.example.com/user/data
headers: {"Authorization": "Bearer {{ls.auth>$.token}}"}
```
~~~

### 错误处理

如果请求失败,将显示错误消息:

```
Error: Failed to fetch
```

常见错误:
- **网络错误**: 检查你的互联网连接
- **401 未授权**: 检查你的 API 密钥/令牌
- **404 未找到**: 验证 URL 是否正确
- **无效 JSONPath**: 检查你的 `show:` 表达式

### 性能提示

1. **缓存响应** - 对于不经常更改的数据使用 `req-uuid`
2. **使用 `disabled`** - 在开发期间临时禁用昂贵的请求
3. **使用 `hidden`** - 隐藏后台数据获取的输出

---

## 📚 扩展阅读

- [JSONPath 语法示例](https://github.com/JSONPath-Plus/JSONPath?tab=readme-ov-file#syntax-through-examples)
- [JSONPath 在线测试工具](https://jsonpath-plus.github.io/JSONPath/demo/)
- [用例](usecase/index.md) - 真实世界示例

---

## ❓ 故障排除

**请求不工作?**

- 检查控制台 (Ctrl+Shift+I) 查看详细错误消息
- 验证你的 URL 是否正确并使用 https://
- 检查是否存在所有必需的标志
- 确保你的 JSONPath 表达式有效

**缓存数据未更新?**

- 删除 `req-uuid` 以始终获取新数据
- 或添加 `auto-update` 标志以强制刷新
- 或在设置中手动清除缓存

**变量未解析?**

- 检查前置元数据语法是否正确
- 验证全局变量是否在设置中定义
- 确保你使用正确的变量语法

---

!!! tip "需要帮助?"
    如果你遇到问题或有疑问,请在 [GitHub](https://github.com/Rooyca/obsidian-api-request/issues) 上提出问题。
