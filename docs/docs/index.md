# 🔎 Overview

APIRequest (APIR) is a plugin for the note taking app [Obsidian](https://obsidian.md/) that allows you to make requests to apis display the response in your notes.

## 🔥 Features

- Perform requests using various methods such as `GET`, `POST`, `PUT`, and `DELETE`.
- Use variables from the `front-matter`, global variables or even reuse responses from another codeblocks.
- Save responses in the `localStorage` for convenient access and reuse.
- Disable code blocks as needed to optimize performance.
- Extract and display specific values from responses, giving you fine-grained control over how data is presented.

## ⚡ How to use

To make a request, create a code-block with the language set to `req`. Inside the code-block, you can define parameters such as `url`, `method`, `body`, `headers`, etc. See the [available flags](en/codeblocks#flags) for a complete reference.

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

## 🧩 Use Cases

Check out the [Use Cases](en/usecase) section for examples of how you can use APIRequest in your workflows.
