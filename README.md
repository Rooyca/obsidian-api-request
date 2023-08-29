# APIR - Api Request

Obsidian plugin that allows you to make requests to APIs and receive responses in the format of a JSON block or an Obsidian variable.

> 🚧 **Attention**:
> 
> At the moment only JSON responses are supported.

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

### Maunal Installation

- Copy over `main.js` and `manifest.json` to your vault. `VaultFolder/.obsidian/plugins/obsidian-api-request/`.

## Usage

There are two ways to use the plugin:

### With Markdown Block (Easier)

To use the plugin, create a code block with the language set to `apir`. Inside the code block, you can specify the url and what to show from that request. The plugin will automatically replace the code block with the response from the API. A quick example:

```apir
url: https://jsonplaceholder.typicode.com/todos/1
showthis: title
```

If you want to show data from nested objects, you can do that by using a right arrow `->`. For example, if you want to show the `last` from the `chess_daily` object, you can do that like this:

```apir
url: https://api.chess.com/pub/player/hikaru/stats
showthis: chess_daily -> last
```

You can also show the entire response by only specifying the url:

```apir
url: https://jsonplaceholder.typicode.com/todos/1
```

> **NOTE:** The codeblock method exclusively supports GET requests.

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
- **Response Data**: The response data to display. If empty all data will be display. You can use a right arrow `->` to access nested objects. For example, if you want to show the `title` from the `user` object, you can do that like this: `user -> title`.

## To-do

- [x] Add more request types (POST, PUT, DELETE)
- [ ] ~Add support for authentication~
- [x] Add customizability for modal output (e.g. show only specific fields, change color scheme, add custom CSS)
- [x] Add customizability for variable output (e.g. show only specific fields, change variable name)

## Feedback and Contributions

If you encounter any issues or have feedback on the plugin, feel free to open an issue on the [GitHub repository](https://github.com/Rooyca/obsidian-api-request). Contributions are also welcome!
