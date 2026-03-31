# 使用案例

这是该插件的使用案例集合。**如果您有其他使用案例，请与我们分享。**

## 使用内联响应与 [Dataview](https://blacksmithgu.github.io/obsidian-dataview/) 结合

首先，使用 `req-uuid` 发起请求并存储响应：

~~~markdown
```req
url: https://jsonplaceholder.typicode.com/comments/1
req-uuid: test
hidden
```
~~~

然后，启用 **DataviewJS** 和内联 JavaScript 查询后，您可以像这样访问保存的数据：

```markdown
邮箱是 `$=dv.el("span", JSON.parse(localStorage.getItem("req-test")).email)`  
ID 是 `$=dv.el("span", JSON.parse(localStorage.getItem("req-test")).id, { cls: "mod-warning" })`
```

这将从保存的响应中检索邮箱和 ID（始终需要 `req-` 前缀）。
在这里，我们还为第二个内联查询添加了自定义类。

渲染输出将如下所示：

> 邮箱是 [Eliseo@gardner.biz](mailto:Eliseo@gardner.biz)，ID 是 <span style="color:red;">1</span> 

## 查询比特币（或任何加密货币）价格

~~~makdown
```req 
url: https://api.coincap.io/v2/rates/bitcoin
show: $.data.rateUsd
```
~~~

> 64992.8972508856324769

## 获取天气信息

~~~makdown
```req
url: https://api.openweathermap.org/data/2.5/weather?q=<CITY>&appid=YOUR_API_KEY
show: $.main.temp
```
~~~

## 搜索电影

~~~makdown
```req
url: https://api.themoviedb.org/3/search/movie?query={{this.title}}&api_key=YOUR_API_KEY
show: $.results[0:].title
```
~~~

!!! info "注意 `{{this.title}}` 的使用。这是一个允许您传递 front-matter 属性的功能。"

## 渲染数据

~~~markdown
```req
url: https://mapi.mobilelegends.com/hero/detail?id=1
show: $.data[cover_picture,name,type]
format: ![img]({}) <br> <strong>Name:</strong> {} <br> <strong>Type:</strong> {}
```
~~~

## 从 [todoist](https://todoist.com/) 获取待办事项

~~~makdown
```req
url: https://api.todoist.com/rest/v2/tasks
headers: {"Authorization": "Bearer YOUR_TOKEN"}
show: $..content
format: - [ ] {}
req-id: todos
```
~~~

!!! warning "这将把响应保存在 localStorage 中，键名为 `req-todos`"

## 您的使用案例

> **如果您想分享您的使用案例，请随时提交 PR 或创建 [Issue](https://github.com/Rooyca/obsidian-api-request/issues/new/choose)。**
