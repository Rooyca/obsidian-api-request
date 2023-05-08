# API Request - Obsidian Plugin

The "API Request" is an Obsidian plugin that allows you to make GET requests to APIs and receive responses in the format of a JSON block or an Obsidian variable. We plan to add more request types in the future.

![conf_img](config_img.png)

## Maunal Installation

- Copy over `main.js` and `manifest.json` to your vault. `VaultFolder/.obsidian/plugins/obsidian-api-request/`.

## Usage

To use the plugin, press `Ctrl+P` and search for "API Request". The plugin will present you with two options:

1. Show response in modal
2. Paste response in current document (at current line)

Select the option that suits your needs. Additionally, you can configure the plugin to output the response in either JSON block format or as an Obsidian variable. This option can be accessed through the plugin's settings.

## Settings

The plugin has a few settings that you can configure:

- **URL**: The URL to send the request to.
- **Output format**: Choose between JSON block or Obsidian variable.

## To-do

- [ ] Add more request types (POST, PUT, DELETE, etc.)
- [ ] Add support for authentication
- [ ] Add customizability for modal output (e.g. show only specific fields, change color scheme, add custom CSS)
- [ ] Add customizability for variable output (e.g. show only specific fields, change variable name)
- [ ] Improve error handling and provide meaningful error messages
- [ ] Provide comprehensive documentation and examples for users to reference


## Feedback and Contributions

If you encounter any issues or have feedback on the plugin, feel free to open an issue on the [GitHub repository](https://github.com/Rooyca/obsidian-api-request). Contributions are also welcome!
