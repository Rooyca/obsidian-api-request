# 👨🏻‍💻 Codeblocks

The `codeblock` is a versatile block that can be used to write code in different languages. In this case, we will use it to make requests.

## 🏳️ Flags

Flags are the way to specify the parameters of our request and also the format in which we want our response.

| Flag         | Default  |
| ------------| ---------|
| [url](#url) |          |
| [method](#method) | GET   |
| [body](#body) |         |
| [headers](#headers) |   |
| [show](#show) | ALL     |
| [format](#format) | `{}` |
| [req-id](#req-id) | req-general |
| [disabled](#disabled) | |
| [req-repeat](#req-repeat) | 1t@1s |
| [notify-if](#notify-if) | |
| [save-to](#save-to) |   |
| [properties](#properties) | |
| [render](#render)| false |
| [res-type](#res-type)| |
| [maketable](#maketable)| |

### url

Is the only **required** flag. It specifies the endpoint of the request. Variables defined in the `frontmatter` can be used.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/{{this.id}}
```
~~~

!!! note "Where `{{this.id}}` is a variable (`id`) defined in the frontmatter."


### method

Specifies the request method. The default value is `GET` and the available values are:

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

Specifies the body of the request. The default value is an empty object. The data should be in JSON format with double quotes separating the keys and values with a colon and space. Variables defined in the `frontmatter` can be used.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
body: {"title": {{this.title}}, "body": "bar", "userId": 1}
```
~~~

!!! note "Where `{{this.title}}` is a variable (`title`) defined in the frontmatter."

### headers

Specifies the headers of the request. The default value is an empty object. The data should be in JSON format with double quotes separating the keys and values with a colon and space. Variables defined in the `frontmatter` can be used.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
headers: {"Content-type": "application/json; charset=UTF-8"}
```
~~~

### show

Specifies the response data to display. Accessing nested objects is done using a right arrow `->`. The default value is `ALL`.

~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: chess_daily -> last -> rating
```
~~~

Multiple outputs can be displayed by separating them with a comma.

~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: chess_daily -> last -> rating, chess_daily -> best -> rating
format: <p>Last game: {}</p> <strong>Best game: {}</strong>
render
```
~~~

Looping over an array is also possible using `{..}`. The following example retrieves the city from all users.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: {..} -> address -> city
```
~~~

Looping over a specified number of elements of the array is also possible using `{n..n}`.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: {0..2} -> address -> city
```
~~~

It's also possible to loop over a specified range of indexes of the array using `{n-n-n}`.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: {0-2-1} -> address -> city
```
~~~

You can access the last element using `{-1}`...

~~~markdown
```req
url:https://api.modrinth.com/v2/project/distanthorizons
show: game_versions -> {-1}
```
~~~

... or get the length of the array using `{len}`.

~~~markdown
```req
url:https://api.modrinth.com/v2/project/distanthorizons
show: game_versions -> {len}
```
~~~

To access multiple elements at the same time when using `{..}` use `&` to separate the keys and use `.` to access the values.

~~~markdown
```req 
url: http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=rooyca&api_key=API_KEY&format=json&limit=4
show: recenttracks -> track -> {..} -> name & artist.#text & streamable
maketable: name, artist, stream
```
~~~

### format

Specifies the format in which the response should be displayed. The default value is `{}`. It can be any string (including `markdown` and `html`). If more than one output is specified, more then one format should be specified, otherwise, the same format will be applied to all outputs.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
show: title, body
format: <h1>{}</h1> <p>{}</p>
render
```
~~~

!!! note "In this example, first `{}` will be replaced by the title, and second `{}` will be replaced by the body."


### req-id

Specifies the id of the request. The default value is `req-general`. This is useful when we want to store the response in `localStorage` and use it in other blocks or notes.


~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
show: name
req-id: name
```
~~~

Stored responses can be accessed using the `req-id` with the `disabled` flag (which won't trigger a new request).

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
req-id: name
disabled
```
~~~

Responses can also be accessed using [dataview](https://blacksmithgu.github.io/dataview/).

~~~markdown
```dataview
dv.paragraph(localStorage.getItem("req-name"))
```
~~~

!!! info "Is mandatory to use `req-` before whatever you defined in `req-id` flag."

To remove responses from localStorage, run:

~~~markdown
```dataview
localStorage.removeItem("req-name")
```
~~~

To remove all responses, go to settings and click on the `Clear ID's` button.

### disabled

Disables the request. If a `req-id` is specified, APIR will check for the response in `localStorage`. If it's not found, it will make a new request and store it. After that, APIR will use the stored response.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
show: name
req-id: name
disabled
```
~~~

### req-repeat

!!! warning "This only works with JSON responses"

Specifies the number of times the request should be repeated and the interval between each repetition. The default value is `1@1` (read as `X time(s) every X second(s)`).


~~~markdown
```req 
url: api.coincap.io/v2/rates/bitcoin
req-repeat: 5@5
render
```
~~~

### notify-if

!!! warning "This only works with JSON responses"

Specifies the condition to trigger a notification. Can be used to monitor a specific value. The path syntax used to access nested objects varies from the `show` flag, here dots are used instead of arrows and not spaces are allowed in the path.

~~~markdown
```req 
url: api.coincap.io/v2/rates/bitcoin
req-repeat: 5@5
notify-if: data.rateUsd < 69889
render
```
~~~

!!! note "In the example above, a notification will be triggered everytime the value of `data.rateUsd` is less than `69889`."

### save-to

Specifies the path to save the response. It'll save the entire response. A file extension is required. It won't create directories.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
save-to: posts/1.json
```
~~~

### properties

!!! warning "To use this flag you need a JSON response and the `show` flag"

Specifies the frontmatter properties to update with the response. The data should be strings separated by commas. To set internal links use the `[[..]]` syntax.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
show: id, title
properties: id, title
```
~~~

### render

If present the response will be rendered as HTML. It's useful when the response is an image or a table. The HTML is sanitized to prevent XSS attacks.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/photos/1
show: url
format: ![img]({})
render
```
~~~

## res-type

Specifies the type of the response. If this flag is not present the plugin will try to guess the type based on the response content-type. This could be used *as an optional fallback feature*.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
res-type: json
```
~~~

## maketable

Converts the response into a table. It's useful when the response is an array of objects. This flags expects a list of titles separated by commas.

~~~markdown
```req 
url: http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=rooyca&api_key=API_KEY&format=json&limit=4
show: recenttracks -> track -> {..} -> name & artist.#text & streamable
maketable: name, artist, stream
```
~~~

!!! note "In the example above, the response will be converted into a table with the titles `name`, `artist`, and `stream`."