# APIR - APIRequest

[![Docs site](https://img.shields.io/badge/docs-GitHub_Pages-blue?style=flat-square)](https://rooyca.github.io/obsidian-api-request/)
[![Obsidian plugin release](https://img.shields.io/badge/Obsidian%20plugin%20release-purple?logo=obsidian&style=flat-square)](https://obsidian.md/plugins?id=api-request)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/rooyca/obsidian-api-request?logo=github&color=ee8449&style=flat-square)](https://github.com/rooyca/obsidian-api-request/releases/latest)
<img alt="GitHub Release" src="https://img.shields.io/github/downloads/rooyca/obsidian-api-request/total?logo=github&&color=ee8449&style=flat-square">

[![Español](https://img.shields.io/badge/Español-8A2BE2)](README.es.md)
[![中文](https://img.shields.io/badge/中文-8A2BE2)](README.zh.md)


This [Obsidian](https://obsidian.md/) plugin enables users to make API requests directly within their notes and display the response in a code-block.

## 🔒 Security

This plugin implements comprehensive security measures including:
- Input validation for URLs, paths, and user data
- XSS prevention through HTML sanitization
- Protection against directory traversal attacks
- Safe JSONPath expression evaluation
- Secure localStorage handling

## 🚀 Installation

The plugin can be installed from within Obsidian.

### Obsidian Community Plugin Browser

- Go to `Settings` -> `Community plugins`
- Make sure `Restricted mode` is **off**
- Click `Browse`
- Search for `APIRequest`
- Click `Install` and then `Enable`

## 🛠️ Usage

### [Read documentation here](https://rooyca.github.io/obsidian-api-request/)

## ✅ To-do

> Check all changes on [TODOS-v2.md](TODOS-v2.md)

- [ ] Translate (& update) documentation
- [x] Data re-usage (`{{ls.UUID>JSONPath}}` syntax, where `ls` stands for `localStorage`)
- [x] Support for comments using `#` or `//` syntax 
- [x] Inline query from response (using **Dataview**)
- [ ] Add tests (!!!)
- [ ] Re-implement `repeat` flag (repeat requests X times or every X seconds)
- [x] Security improvements (input validation, XSS prevention, path traversal protection)
- [x] TypeScript type safety improvements
- [x] Comprehensive error handling

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

### Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode (auto-rebuild)
npm run dev
```

For more details, see [CONTRIBUTING.md](CONTRIBUTING.md).

## 🔒 Security Best Practices

When using this plugin:

1. **Use HTTPS**: Always use HTTPS URLs for API requests
2. **Protect API Keys**: Store API keys in global variables, not in notes
3. **Review Cached Data**: Regularly clear old cached responses
4. **Validate Sources**: Only connect to trusted API endpoints


## ❤️ Sponsors

<a href="https://github.com/tlwt"><img src="https://github.com/tlwt.png" width="40px" /></a>

## ✍️ Feedback and Contributions

If you encounter any issues or have feedback on the plugin, feel free to open an issue on the [GitHub repository](https://github.com/Rooyca/obsidian-api-request). 

Contributions are also welcome!
