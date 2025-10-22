# 👨🏻‍💻 Codeblocks

The `codeblock` is a versatile block that can be used to write code in different languages. In this case, we will use it to make API requests.

## 🏳️ Flags

Flags are the way to specify the parameters of our request.

| Flag         | Default  |
| ------------| ---------|
| [url](#url) |          |
| [method](#method) | GET   |
| [body](#body) |         |
| [headers](#headers) |   |
| [show](#show) | ALL     |
| [req-uuid](#req-uuid) | req-general |
| [hidden](#hidden) | FALSE |
| [disabled](#disabled) | |
| [save-as](#save-as) |   |
| [auto-update](#auto-update) | FALSE |
| [format](#format) | |
| [properties](#properties) | |

---

### LocalStorage & Variables

API responses can be stored in `localStorage` and reused in other codeblocks or notes. To store a response, you must assign it a unique identifier using the `req-uuid` flag.

You can access stored responses using the following syntax:

```
{{ls.UUID>JSONPath}}
```

* `UUID`: The unique identifier defined in the `req-uuid` flag.
* `JSONPath`: The path to the specific data you want from the response.

**Example:**
If you have a request with `req-uuid: user`, you can access the user’s name like this:

```
{{ls.user>$.name}}
```

---

You can also reference variables defined in the note's **frontmatter** using:

```
{{this.variableName}}
```

---

For **global variables**, you can define them in the plugin settings. These are saved in `localStorage` and can be accessed with:

```
{{ls.variableName}}
```

### url

Is the only **required** flag. It specifies the endpoint of the request.

~~~markdown
```req 
# this is just a comment
url: https://jsonplaceholder.typicode.com/users/{{this.id}}
```
~~~

!!! note "Where `{{this.id}}` is a variable (`id`) defined in the frontmatter."


### method

Specifies the request method. The default value is `GET` and the available methods are:

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

Specifies the body of the request. The default value is an empty object. The data should be in JSON format, separating key and value with a colon plus space (`, `).

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
body: {"title": {{this.filename}}, "body": "bar", "userId": 1}
```
~~~

!!! note "Where `{{this.filename}}` is the name of the working file."

### headers

Specifies the headers of the request. The default value is an empty object. The data should be in JSON format, separating key and value with a colon plus space (`, `).

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
headers: {"Content-type": "application/json; charset=UTF-8"}
```
~~~

You can use responses from other requests as headers/body/url/show. For example, if you have a request with `req-uuid: token`, you can use it like this:

~~~makdown
```req
url: https://api.todoist.com/rest/v2/tasks
headers: {"Authorization": "Bearer {{ls.token>$.access_token}}"}
show: $..content
format: - [ ] {}
req-id: todos
```
~~~

### show

Specifies the response data to display. See [JSONPath examples](https://github.com/JSONPath-Plus/JSONPath?tab=readme-ov-file#syntax-through-examples), or try the online tool by [jsonpath-plus](https://jsonpath-plus.github.io/JSONPath/demo/).


~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: $['chess_daily']['last']['rating']
```
~~~

Multiple outputs can be displayed by using `[]`.

~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: $.chess_daily[last,best].rating
```
~~~

Or you can also use `+` to get multiple outputs.

~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: $.chess_daily[last,best].rating + $.chess960_daily[last,best].rating
```
~~~

Looping over an array is also possible. The following example retrieves the city from all users.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..address.city
```
~~~

Looping over a specified number of elements of the array is also possible.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..[:3].address.city
```
~~~

It's also possible to loop over a specified range of indexes of the array.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..[3,2,6].address.city
```
~~~

You can access the last element using `(@.length-1)` or just `[-1:]`.

~~~markdown
```req
url: https://api.modrinth.com/v2/project/distanthorizons
show: $.game_versions[(@.length-1)]
```
~~~

To access multiple elements at the same time.

~~~markdown
```req 
url: http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=rooyca&api_key=API_KEY&format=json&limit=4
show: $..recenttracks.track[0:][streamable,name,artist]
```
~~~


### req-uuid

Specifies the unique identifier of the request. This is useful when we want to store the response in `localStorage` and use it in other blocks or notes.


~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
show: $.name
req-uuid: test-{{this.username}}
```
~~~

!!! note "Where `{{this.username}}` is a variable (`username`) defined in the frontmatter."

Stored responses can be accessed using the `req-uuid` (which won't trigger a new request).

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
req-uuid: name
```
~~~

Responses can also be accessed using [dataview](https://blacksmithgu.github.io/dataview/).

~~~markdown
```dataviewjs
dv.paragraph(localStorage.getItem("req-UUID"))
```
~~~

!!! info "Is mandatory to use `req-` before whatever you defined in `req-uuid` flag."

To remove responses from localStorage, run:

~~~markdown
```dataviewjs
localStorage.removeItem("req-name")
```
~~~

To remove responses, go to settings and click over the response you want to delete.

### hidden

Executes the code block without displaying its output.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
req-uuid: name
hidden
```
~~~

### disabled

Disables the request. The codeblock won't be executed.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
show: $.name
req-uuid: name
disabled
```
~~~

### save-as

Specifies the path to save the response. It'll save the entire response. A file extension is required. It won't create directories.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
save-as: posts/1.json
```
~~~

### auto-update

If present, the codeblock will automatically update the response every time is possible. This is only needed when using the flag `req-uuid`, because the default behavior of the codeblock is to run every time the note is loaded.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
req-uuid: firstPost
auto-update
save-as: posts/1.json
```
~~~

### format

Specifies the format in which the response should be displayed. It can be any string (including `html`). If more than one output is specified, more then one format should be specified, otherwise it'd just render the first output.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
show: $.[title,body]
format: <h1>{}</h1> <p>{}</p>
```
~~~

!!! note "In this example, first `{}` will be replaced with the *title*, and second `{}` will be replaced with the *body*."

### properties

!!! warning "To use this flag you need a JSON response and the `show` flag"

Specifies the frontmatter properties to update with the response. The data should be strings separated by commas. To set internal links use the this `[[..]]` syntax.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
show: $.[id,title]
properties: id, title
```
~~~
