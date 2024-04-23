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
| url | The URL to send the request to (You can use variables defined in the frontmatter)|  |
| method | Request method (GET, POST, PUT, DELETE)| GET |
| body | Data to send with the request. Data should by in JSON format (You can use variables defined in the frontmatter)|  |
| headers | Header(s) for the request. Data should by in JSON format (You can use variables defined in the frontmatter)|  |
| show | Response data to display. You can use a right arrow `->` to access nested objects| ALL |
| format | Format in which the response should be displayed| {} |
| response-type | The type of response we are getting (json, txt or md)| json |

The plugin will automatically replace the code block with the response from the API. Here are a quick examples:

If you want to show data from nested objects, you can do that by using a right arrow `->`. For example, if you want to show the `last` from the `chess_daily` object, you can do that like this:

```req
url: https://api.chess.com/pub/player/hikaru/stats
show: chess_daily -> last
```

You can show the entire response by only specifying the url:

```req
url: https://jsonplaceholder.typicode.com/todos/1
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

### With Configuration

To use the plugin, press `Ctrl+P` and search for "APIR". The plugin will present you with two options:

1. Show response in modal
2. Paste response in current document (at current line)

Select the option that suits your needs. Additionally, you can configure the plugin to output the response in either JSON block format or as an Obsidian variable. This option can be accessed through the plugin's settings.

#### Settings

The plugin has a few settings that you can configure:

- **URL**: The URL to send the request to.
- **Output format**: Choose between JSON block or Obsidian variable.
- **Request Method**: Choose between GET, POST, PUT & DELETE.
- **Request Data**: The data to send with the request. Data should by in JSON format.
- **Header Data**: The header data to send with the request. Data should by in JSON format. (`{"Content-Type": "application/json", "Authorization": "Bearer TOKEN"}`)
- **Response Data**: The response data to display. If empty all data will be display. You can use a right arrow `->` to access nested objects. For example, if you want to show the `title` from the `user` object, you can do that like this: `user -> title`.

## To-do

- [x] Add more request types (POST, PUT, DELETE)
- [x] Add support for authentication
- [x] Add customizability for modal output (e.g. show only specific fields, change color scheme, add custom CSS)
- [x] Add customizability for variable output (e.g. show only specific fields, change variable name)

## Feedback and Contributions

If you encounter any issues or have feedback on the plugin, feel free to open an issue on the [GitHub repository](https://github.com/Rooyca/obsidian-api-request). Contributions are also welcome!