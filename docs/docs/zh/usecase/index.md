# 用例

此插件的用例集合。 **如果您有，请与我们分享。**


## 检查比特币（或任何加密货币）价格

~~~makdown
```req 
url: https://api.coincap.io/v2/rates/bitcoin
show: $.data.rateUsd
```
~~~

> 64992.8972508856324769

## 获取天气

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

!!! info "请注意使用 `{{this.title}}`。此功能允许您传递前置属性。"

## 获得多个结果

~~~makdown
```req
url: https://mapi.mobilelegends.com/hero/detail?id={{this.file.name}}
show: $.data[cover_picture,name,type]
```
~~~

## 从 [todoist](https://todoist.com/) 获取 TODOS

~~~makdown
```req
url: https://api.todoist.com/rest/v2/tasks
headers: {"Authorization": "Bearer YOUR_TOKEN"}
show: $..content
format: - [ ] {}
req-id: todos
```
~~~

!!! warning "这将把响应保存在 localStorage 中的键 `req-todos` 下"

## 您的用例

> **如果您想分享您的用例，请随时打开 PR 或 [Issue](https://github.com/Rooyca/obsidian-api-request/issues/new/choose)。**
