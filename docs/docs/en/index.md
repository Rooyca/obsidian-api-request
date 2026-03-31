# 🔎 Overview

APIRequest (APIR) is a plugin for the note taking app [Obsidian](https://obsidian.md/) that allows you to make requests to APIs and display the response directly in your notes.

## 🔥 Features

- **Multiple HTTP Methods**: Perform requests using `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, and `OPTIONS`.
- **Variable Substitution**: Utilize variables from the `front-matter`, global variables, or even reuse responses from other code blocks.
- **Response Caching**: Save responses in `localStorage` for convenient access and reuse across notes.
- **Performance Control**: Disable code blocks as needed to optimize performance.
- **Precise Data Extraction**: Display specific values from responses using JSONPath, providing granular control over data presentation.
- **Security First**: Built-in input validation and sanitization to protect against XSS, injection attacks, and directory traversal.
- **Auto-update**: Automatically refresh cached responses when needed.
- **Format Output**: Custom HTML/text formatting for response data.

## 🔒 Security Features

APIRequest implements comprehensive security measures:

- ✅ **URL Validation**: Only HTTPS and HTTP protocols are allowed
- ✅ **Input Sanitization**: All user inputs are validated and sanitized
- ✅ **XSS Prevention**: HTML output is sanitized to prevent script injection
- ✅ **Path Traversal Protection**: File paths are validated to prevent unauthorized access
- ✅ **Safe JSONPath**: JSONPath expressions are validated before execution
- ✅ **UUID Sanitization**: Request identifiers are sanitized to prevent injection attacks

!!! warning "Security Best Practices"
    - Always use HTTPS URLs when making API requests
    - Store API keys in global variables (Settings → APIRequest → Global variables), never in notes
    - Only connect to trusted API endpoints
    - Regularly review and clear cached responses

## ⚡ How to use

### 👨🏻‍💻 Code-block

To use it, create a code-block with the language set to `req`. Inside the code-block, you can specify `url`, `method`, `body`, `headers`, etc. See the [available flags](codeblocks.md#flags) for more information.

~~~markdown
```req
url: https://my-json-server.typicode.com/typicode/demo/comments
method: post
body: {"id":1}
headers: {"Accept": "application/json"}
show: $.id
req-uuid: IDpersona
disabled
```
~~~

## 📚 Quick Start

1. **Simple GET Request**
   ~~~markdown
   ```req
   url: https://api.github.com/users/octocat
   show: $.name
   ```
   ~~~

2. **Using Variables**
   ~~~markdown
   ```req
   url: https://api.example.com/user/{{this.userId}}
   headers: {"Authorization": "Bearer {{API_TOKEN}}"}
   show: $.data.name
   ```
   ~~~

3. **Caching Responses**
   ~~~markdown
   ```req
   url: https://api.example.com/data
   req-uuid: mydata
   show: $.result
   ```
   ~~~

4. **Reusing Cached Data**
   ~~~markdown
   ```req
   url: https://api.example.com/more-data
   headers: {"X-Token": "{{ls.mydata>$.token}}"}
   ```
   ~~~

For detailed documentation on all flags and features, see [Codeblocks](codeblocks.md).

