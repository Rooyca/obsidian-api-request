# 👨🏻‍💻 代码块

`codeblock` 是一个多功能块，可用于用不同语言编写代码。在本例中，我们将使用它来发出请求。

## 🏳️ Flag

Flag是指定请求参数以及我们想要的响应格式的方式。

| 标志 | 默认 |
| ------------| ---------|
| [url](#url) |          |
| [method](#method) | GET   |
| [body](#body) |         |
| [headers](#headers) |   |
| [show](#show) | ALL     |
| [req-id](#req-id) | req-general |
| [disabled](#disabled) | |
| [save-as](#save-as) |   |

### url

是唯一的**必需**标志。它指定请求的端点。可以使用 `frontmatter` 中定义的变量。

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/{{this.id}}
```
~~~

!!! note "其中`{{this.id}}`是frontmatter中定义的变量（`id`）。"

### method

指定请求方法。默认值为 `GET`，可用值为：

- GET
- POST
- PUT
- DELETE

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
```
~~~

### body

指定请求的正文。默认值为空对象。数据应为 JSON 格式，双引号用冒号和空格分隔键和值。可以使用 `frontmatter` 中定义的变量。

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
body: {"title": {{this.title}}, "body": "bar", "userId": 1}
```
~~~

!!! note "其中 `{{this.title}}` 是 frontmatter 中定义的变量（`title`）。"

### headers

指定请求的标头。默认值为空对象。数据应为 JSON 格式，双引号将键和值用冒号和空格分隔。可以使用 `frontmatter` 中定义的变量。

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
headers: {"Content-type": "application/json; charset=UTF-8"}
```
~~~

### show

指定要显示的响应数据。使用右箭头 `->` 访问嵌套对象。默认值为 `ALL`。

~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: chess_daily -> last -> rating
```
~~~

可以通过用逗号分隔来显示多个输出。

~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: chess_daily -> last -> rating, chess_daily -> best -> rating
format: <p>Last game: {}</p> <strong>Best game: {}</strong>
render
```
~~~

也可以使用 `{..}` 循环遍历数组。以下示例从所有用户中检索城市 (city)。

~~~markdown
```req
url: https://jsonplaceholder.typicode.com/users
show: {..} -> address -> city
```
~~~

也可以使用 `{n..n}` 循环遍历数组中指定数量的元素。

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: {0..2} -> address -> city
```
~~~

也可以使用 `{n-n-n}` 循环遍历数组的指定范围的索引。

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: {0-2-1} -> address -> city
```
~~~

您可以使用 `{-1}` 访问最后一个元素...

~~~markdown
```req
url:https://api.modrinth.com/v2/project/distanthorizons
show: game_versions -> {-1}
```
~~~

...或者使用 `{len}` 获取数组的长度。

~~~markdown
```req
url:https://api.modrinth.com/v2/project/distanthorizons
show: game_versions -> {len}
```
~~~

使用 `{..}` 时，若要同时访问多个元素，请使用 `&` 分隔键，并使用 `.` 访问值。

~~~markdown
```req 
url: http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=rooyca&api_key=API_KEY&format=json&limit=4
show: recenttracks -> track -> {..} -> name & artist.#text & streamable
maketable: name, artist, stream
```
~~~

### req-id

指定请求的 ID。默认值为 `req-general`。当我们想要将响应存储在 `localStorage` 中并在其他块或注释中使用它时，这很有用。

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
show: name
req-id: name
```
~~~

可以使用带有 `disabled` 标志的 `req-id` 访问存储的响应（不会触发新请求）。

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
req-id: name
disabled
```
~~~

也可以使用 [dataview](https://blacksmithgu.github.io/dataview/) 访问响应。

~~~markdown
```dataview
dv.paragraph(localStorage.getItem("req-name"))
```
~~~

!!! info "在`req-id`标志中定义的任何内容之前，必须使用`req-`"

要从 localStorage 中删除响应，请运行：

~~~markdown
```dataview
localStorage.removeItem("req-name")
```
~~~

要删除所有响应，请转到设置并单击 `Clear ID's` (清除ID) 按钮。

### disabled

禁用请求。如果指定了 `req-id`，APIR 将在`localStorage`中检查响应。如果未找到，它将发出新请求并存储它。之后，APIR 将使用存储的响应。

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
show: name
req-id: name
disabled
```
~~~

### save-as

指定保存响应的路径。它将保存整个响应。需要文件扩展名。它不会创建目录。

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
save-as: posts/1.json
```
~~~
