# Usecases

A collection of use cases for this plugin. **If you have a one, please share it with us.**

## Using inline responses with [Dataview](https://blacksmithgu.github.io/obsidian-dataview/)

First, make a request and store the response using `req-uuid`:

~~~markdown
```req
url: https://jsonplaceholder.typicode.com/comments/1
req-uuid: test
hidden
```
~~~

Next, with **DataviewJS** and inline JavaScript queries enabled, you can access the saved data like this:

```markdown
The email is `$=dv.el("span", JSON.parse(localStorage.getItem("req-test")).email)`  
and the ID is `$=dv.el("span", JSON.parse(localStorage.getItem("req-test")).id, { cls: "mod-warning" })`
```

This retrieves the email and ID from the saved response (the `req-` prefix is always required).
Here, we’re also adding a custom class to the second inline query.

Rendered output will look like this:

> The email is [Eliseo@gardner.biz](mailto:Eliseo@gardner.biz) and the ID is <span style="color:red;">1</span> 

## Check BITCOIN (or any crypto) price

~~~makdown
```req 
url: https://api.coincap.io/v2/rates/bitcoin
show: $.data.rateUsd
```
~~~

> 64992.8972508856324769

## Get the weather

~~~makdown
```req
url: https://api.openweathermap.org/data/2.5/weather?q=<CITY>&appid=YOUR_API_KEY
show: $.main.temp
```
~~~

## Search movies

~~~makdown
```req
url: https://api.themoviedb.org/3/search/movie?query={{this.title}}&api_key=YOUR_API_KEY
show: $.results[0:].title
```
~~~

!!! info "Note the use of `{{this.title}}`. This is a feature that allows you to pass front-matter properties."

## Render data

~~~markdown
```req
url: https://mapi.mobilelegends.com/hero/detail?id=1
show: $.data[cover_picture,name,type]
format: ![img]({}) <br> <strong>Name:</strong> {} <br> <strong>Type:</strong> {}
```
~~~

## Get TODOS from [todoist](https://todoist.com/)

~~~makdown
```req
url: https://api.todoist.com/rest/v2/tasks
headers: {"Authorization": "Bearer YOUR_TOKEN"}
show: $..content
format: - [ ] {}
req-id: todos
```
~~~

!!! warning "This will save the response in localStorage under the key `req-todos`"

## Your use case

> **If you want to share your use case, please feel free to open a PR or a [Issue](https://github.com/Rooyca/obsidian-api-request/issues/new/choose).**
