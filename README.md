# APIR - Api Request

Obsidian plugin that allows you to make requests to APIs and receive responses in the format of a JSON block or an Obsidian variable.

> [!IMPORTANT]
> 
> We now support JSON, TEXT and MARKDOWN responses

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/rooyca/obsidian-api-request?logo=github&color=ee8449&style=flat-square)](https://github.com/rooyca/obsidian-api-request/releases/latest)
[![Obsidian plugin release](https://img.shields.io/badge/Obsidian%20plugin%20release-purple?logo=obsidian&style=flat-square)](https://obsidian.md/plugins?id=api-request)

![conf_img](apir.gif)

## Installation

The plugin can be installed from within Obsidian or manually.

### Obsidian Community Plugin Browser (Recommended)

- Go to `Settings` -> `Community plugins`
- Make sure `Restricted mode` is **off**
- Click `Browse`
- Search for `APIRequest`
- Click `Install` and then `Enable`

## Usage

There are two ways to use the plugin:

### With Markdown Block (Easier)

To use the plugin, create a code block with the language set to `req`. Inside the code block, you can specify things like the URL, request method, request data, headers, and the response data you want to display.

| Key| Description| Default|
| ---| -----------|---------|
| disabled | Disables the request|  |
| req-id | Where response is store | req-general |
| url | The URL to send the request to (You can use variables defined in the frontmatter)|  |
| method | Request method (GET, POST, PUT, DELETE)| GET |
| body | Data to send with the request. Data should by in JSON format (You can use variables defined in the frontmatter)|  |
| headers | Header(s) for the request. Data should by in JSON format (You can use variables defined in the frontmatter)|  |
| show | Response data to display. You can use a right arrow `->` to access nested objects| ALL |
| format | Format in which the response should be displayed| `<li>{}</li>` |
| response-type | The type of response we are getting (json, txt or md)| json |

The plugin will automatically replace the code block with the response from the API. Here are a quick examples:

If you want to show data from nested objects, you can do that by using a right arrow `->`. For example, if you want to show the `last` from the `chess_daily` object, you can do that like this:

```req
url: https://api.chess.com/pub/player/hikaru/stats
show: chess_daily -> last -> rating
```
It's also posible to show multiple outputs by separating them with a comma:

```req
url: https://api.chess.com/pub/player/hikaru/stats
show: chess_daily -> last -> rating, chess_daily -> best -> rating
format: <p>Last game: {}</p> <strong>Best game: {}</strong>
```

You can show the entire response by only specifying the url:

```req
url: https://jsonplaceholder.typicode.com/todos/1
```
Or you can loop over an array. The following example will give you the city from all users:

```req
url: https://jsonplaceholder.typicode.com/users
show: {..} -> address -> city
```

You can use the frontmatter variables in the URL, for instance, if you have a variable `numb` defined in the frontmatter, you can use it like this:

```req
url: https://jsonplaceholder.typicode.com/todos/{{this.numb}}
```

You can specify the response type you are getting:

```req
url: https://raw.githubusercontent.com/Rooyca/Rooyca/main/README.md
response-type: md
```

You can also specify the request method, request data, headers, and the response format:

```req
url: https://my-json-server.typicode.com/typicode/demo/comments
format: Here: <h1>{}</h1> is the ID
method: post
body: {"id":1}
headers: {"Accept": "application/json"}
show: id
```

In the example above, the response will be displayed in a h1 tag.

---

Now we can store the response in `localStore` and use it in other blocks. For example, if we want to store the response in a variable called `idPersona`:

```req
url: https://jsonplaceholder.typicode.com/users/1
show: id
req-id: idPersona
```

With this with can also disable a request and still get the response:

```req
url: https://jsonplaceholder.typicode.com/users/1
show: id
req-id: idPersona
disabled
```

This will check for the response in the `localStore` and if it's not there, it will make it.

#### How to get responses from localStore

For this you would need [dataview](https://obsidian.md/plugins?id=dataview).

```dataviewjs
dv.paragraph(localStorage.getItem("req-idPersona"))
```

Is mandatory to use `req-` before whatever you defined in `req-id` flag.

You could also used inline:

`$=localStorage.getItem("req-idPersona")`

But this is a little buggy and don't work all the time. (Use this for short and unformated responses)


### With Configuration

To use the plugin, press `Ctrl+P` and search for "APIR". The plugin will present you with two options:

1. Show response in modal
2. Paste response in current document (at current line)

Select the option that suits your needs. Additionally, you can configure the plugin to output the response in either JSON block format or as an Obsidian variable. This option can be accessed through the plugin's settings.

#### Settings

The plugin has a few settings that you can configure:

- **URL**: The URL to send the request to.
- **Format Output**: Just JSON blocks (for now).
- **Method**: Choose between GET, POST, PUT & DELETE.
- **Body**: The data to send with the request. Data should by in JSON format.
- **Headers**: The header data to send with the request. Data should by in JSON format. (`{"Content-Type": "application/json", "Authorization": "Bearer TOKEN"}`)
- **Response**: The response data to display. If empty all data will be display. You can use a right arrow `->` to access nested objects. For example, if you want to show the `title` from the `user` object, you can do that like this: `user -> title`.

## To-do

- [x] Add more request types (POST, PUT, DELETE)
- [x] Add support for authentication
- [x] Add customizability for modal output (e.g. show only specific fields, change color scheme, add custom CSS)
- [x] Add customizability for variable output (e.g. show only specific fields, change variable name)

## Feedback and Contributions

If you encounter any issues or have feedback on the plugin, feel free to open an issue on the [GitHub repository](https://github.com/Rooyca/obsidian-api-request). Contributions are also welcome!