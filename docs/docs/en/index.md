# 🔎 Overview

APIRequest (APIR) is a plugin for the note taking app [Obsidian](https://obsidian.md/) that allows you to make requests to apis display the response in your notes.

## 🔥 Features

- Perform requests using various methods such as `GET`, `POST`, `PUT`, and `DELETE`.
- Utilize variables from the `front-matter`, global variables or even reuse responses from another codeblocks.
- Save responses in the `localStorage` for convenient access and reuse.
- Disable code blocks as needed to optimize performance.
- Display specific values from responses, providing granular control over the presentation of data.

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

