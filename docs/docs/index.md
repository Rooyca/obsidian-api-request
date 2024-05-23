# 🔎 Overview

APIRequest (APIR) is a plugin for the note taking app [Obsidian](https://obsidian.md/) that allows you to make requests to apis or other sources and display the response in your notes.

## 🔥 Features

- Perform HTTP requests using various methods such as `GET`, `POST`, `PUT`, and `DELETE`.
- Receive responses in different formats including JSON, HTML, and Markdown.
- Utilize variables from the front-matter within code blocks.
- Save responses in the `localStorage` for convenient access and reuse.
- Disable code blocks as needed to optimize performance.
- Repeat requests multiple times at specified intervals, facilitating automated tasks or continuous data retrieval without manual intervention.
- Receive notifications when specific values meet predefined conditions, enabling proactive monitoring and alerting.
- Define shortcuts for executing requests, enhancing efficiency and user experience by enabling quick access to frequently used requests.
- Display specific values from responses, providing granular control over the presentation of data.

## ⚡ How to use

### 👨🏻‍💻 Code-block

To use it, create a code-block with the language set to `req`. Inside the code-block, you can specify `url`, `method`, `body`, `headers`, `format`, etc. See the [available flags](codeblocks.md#flags) for more information.

~~~markdown
```req
url: https://my-json-server.typicode.com/typicode/demo/comments
method: post
body: {"id":1}
headers: {"Accept": "application/json"}
show: id
format: <h1>{}</h1>
req-id: id-persona
disabled
```
~~~

### 🛠️ Settings (don't have all functionalities yet)

!!! info "All parameters can be defined in settings."

Press `Ctrl+P` and search for `APIR`. There are two options:

1. Show response in modal
2. Paste response in current document (at current line)

[More information](settings.md)

