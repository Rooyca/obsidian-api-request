# APIR - Api Request

Obsidian plugin that allows you to make requests to APIs and receive responses in the format of a JSON block or an Obsidian variable. 

![conf_img](config_img.png)

## Obsidian Community Plugin Browser

- Go to Settings -> Third-party plugin
- Make sure Restricted mode is **off**
- Click Browse community plugins
- Search for "API Request"
- Click Install

## Maunal Installation

- Copy over `main.js` and `manifest.json` to your vault. `VaultFolder/.obsidian/plugins/obsidian-api-request/`.

## Usage

### With Configuration

To use the plugin, press `Ctrl+P` and search for "API Request". The plugin will present you with two options:

1. Show response in modal
2. Paste response in current document (at current line)

Select the option that suits your needs. Additionally, you can configure the plugin to output the response in either JSON block format or as an Obsidian variable. This option can be accessed through the plugin's settings.

### With Markdown Block

To use the plugin, create a code block with the language set to `apir`. Inside the code block, you can specify the url and what to show from that request. The plugin will automatically replace the code block with the response from the API. A quick example:

```apir
url: https://jsonplaceholder.typicode.com/todos/1
showthis: title
```

Or you can input only the url and the plugin will show the whole response.

## Settings

The plugin has a few settings that you can configure:

- **URL**: The URL to send the request to.
- **Output format**: Choose between JSON block or Obsidian variable.
- **Request Method**: Choose between GET, POST, PUT & DELETE.
- **Request Data**: The data to send with the request. Data should by in JSON format.
- **Response Data**: The response data to display. If empty all data will be display.

## To-do

- [x] Add more request types (POST, PUT, DELETE)
- [ ] Add support for authentication
- [x] Add customizability for modal output (e.g. show only specific fields, change color scheme, add custom CSS)
- [x] Add customizability for variable output (e.g. show only specific fields, change variable name)
- [ ] Improve error handling and provide meaningful error messages
- [ ] Provide comprehensive documentation and examples for users to reference


## Feedback and Contributions

If you encounter any issues or have feedback on the plugin, feel free to open an issue on the [GitHub repository](https://github.com/Rooyca/obsidian-api-request). Contributions are also welcome!
