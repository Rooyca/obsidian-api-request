# Overview

APIR (shorthand for api-request) is an [Obsidian](https://obsidian.md/) plugin that allows you to make requests and show the responses in your notes. This aims to be an easy way to integrate APIs into your notes.

## How to use

### Code-block

To use it, create a code-block with the language set to `req`. Inside the code-block, you can specify `url`, `method`, `body`, `headers`, `format`, etc. See the [available flags](codeblock/flags.md) for more information.

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

### Configuration (don't have all functionalities yet)

!!! info "All parameters can be defined in settings."

Press `Ctrl+P` and search for `APIR`. There are two options:

1. Show response in modal
2. Paste response in current document (at current line)
