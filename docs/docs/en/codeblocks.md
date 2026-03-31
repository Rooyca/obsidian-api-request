# 👨🏻‍💻 Codeblocks

The `codeblock` is a versatile block that can be used to make API requests directly from your notes. This guide covers all available flags and how to use them effectively and securely.

## 🏳️ Flags

Flags are the way to specify the parameters of our request. All flags are **case-insensitive**.

| Flag         | Default  | Required | Description |
| ------------| ---------| -------- | ----------- |
| [url](#url) |          | ✅ Yes   | The API endpoint to request |
| [method](#method) | GET   | No | HTTP method (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS) |
| [body](#body) |         | No | Request body (JSON format) |
| [headers](#headers) |   | No | Request headers (JSON format) |
| [show](#show) | ALL     | No | JSONPath to extract specific data |
| [req-uuid](#req-uuid) | req-general | No | Unique ID for caching |
| [hidden](#hidden) | FALSE | No | Hide the output |
| [disabled](#disabled) | | No | Disable the request |
| [save-as](#save-as) |   | No | Save response to file |
| [auto-update](#auto-update) | FALSE | No | Always fetch fresh data |
| [format](#format) | | No | Custom output format |
| [properties](#properties) | | No | Update frontmatter properties |

---

## 🔒 Security Considerations

!!! danger "Important Security Guidelines"
    - **Always use HTTPS**: Use `https://` URLs to ensure encrypted communication
    - **Protect API Keys**: Store sensitive tokens in global variables, never hardcode them in notes
    - **Validate Inputs**: The plugin validates all inputs, but only connect to trusted APIs
    - **Review Cached Data**: Regularly clear old cached responses from Settings

### Input Validation

All user inputs are automatically validated:

- **URLs**: Only `http://` and `https://` protocols are allowed
- **UUIDs**: Sanitized to alphanumeric, hyphens, and underscores only
- **File Paths**: Directory traversal (`..`) and absolute paths are blocked
- **JSONPath**: Expressions are validated to prevent script injection
- **Format Strings**: HTML is sanitized to prevent XSS attacks

---

## 📖 Variables & Data Reuse

### LocalStorage & Variables

API responses can be stored in `localStorage` and reused in other codeblocks or notes. To store a response, you must assign it a unique identifier using the `req-uuid` flag.

You can access stored responses using the following syntax:

```
{{ls.UUID>JSONPath}}
```

* `UUID`: The unique identifier defined in the `req-uuid` flag (without the `req-` prefix)
* `JSONPath`: The path to the specific data you want from the response

**Example:**
If you have a request with `req-uuid: user`, you can access the user's name like this:

```
{{ls.user>$.name}}
```

!!! info "Security Note"
    UUIDs are automatically sanitized. Only alphanumeric characters, hyphens, and underscores are allowed.

---

### Frontmatter Variables

You can reference variables defined in the note's **frontmatter** using:

```
{{this.variableName}}
```

**Example:**

Frontmatter:
```yaml
---
userId: 12345
title: "My Note"
---
```

Usage in request:
~~~markdown
```req
url: https://api.example.com/user/{{this.userId}}
```
~~~

!!! warning "Security Warning"
    Avoid storing sensitive API keys in frontmatter. Use global variables instead.

---

### Global Variables

Define reusable variables in plugin settings (Settings → APIRequest → Global variables). These are stored securely and can be accessed with:

```
{{VARIABLE_NAME}}
```

**Example:**

1. In plugin settings, add:
   - Key: `API_KEY`
   - Value: `your-secret-key`

2. In your request:

~~~markdown
```req
url: https://api.example.com/data
headers: {"Authorization": "Bearer {{API_KEY}}"}
```
~~~

!!! tip "Best Practice"
    Store all API keys and tokens as global variables to keep your notes secure and portable.

---

### Special Variables

- `{{this.file.name}}` - Current file's basename (without extension)

---

## Flag Details

### url

The only **required** flag. It specifies the endpoint of the API request.

**Syntax:**
~~~markdown
```req 
url: https://api.example.com/endpoint
```
~~~

**With variables:**
~~~markdown
```req 
# this is just a comment
url: https://jsonplaceholder.typicode.com/users/{{this.id}}
```
~~~

!!! note "Where `{{this.id}}` is a variable (`id`) defined in the frontmatter."

!!! danger "Security"
    Only HTTPS and HTTP URLs are allowed. Other protocols (file://, javascript:, etc.) are blocked for security.

---

### method

Specifies the HTTP request method. The default value is `GET`.

**Available methods:**
- GET (default)
- POST
- PUT
- DELETE
- PATCH
- HEAD
- OPTIONS

**Example:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
```
~~~


---

### body

Specifies the body of the request. The data should be in JSON format.

**Example:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
body: {"title": "{{this.filename}}", "body": "bar", "userId": 1}
```
~~~

!!! note "Where `{{this.filename}}` is the name of the working file."

**Advanced usage with variables:**
~~~markdown
```req 
url: https://api.example.com/create
method: post
body: {"userId": {{this.userId}}, "token": "{{API_TOKEN}}"}
```
~~~

---

### headers

Specifies the request headers. The data should be in JSON format.

**Example:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
headers: {"Content-type": "application/json; charset=UTF-8"}
```
~~~

**Using cached responses as headers:**

You can use responses from other requests as headers/body/url/show. For example, if you have a request with `req-uuid: token`, you can use it like this:

~~~markdown
```req
url: https://api.todoist.com/rest/v2/tasks
headers: {"Authorization": "Bearer {{ls.token>$.access_token}}"}
show: $..content
format: - [ ] {}
req-uuid: todos
```
~~~

!!! tip "Common Headers"
    - `Content-Type: application/json` - For JSON data
    - `Authorization: Bearer TOKEN` - For API authentication
    - `Accept: application/json` - To request JSON responses

---

### show

Specifies which data from the response to display using JSONPath expressions. See [JSONPath examples](https://github.com/JSONPath-Plus/JSONPath?tab=readme-ov-file#syntax-through-examples), or try the online tool by [jsonpath-plus](https://jsonpath-plus.github.io/JSONPath/demo/).

**Simple example:**
~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: $['chess_daily']['last']['rating']
```
~~~

**Multiple outputs using brackets:**
~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: $.chess_daily[last,best].rating
```
~~~

**Multiple outputs using +:**
~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: $.chess_daily[last,best].rating + $.chess960_daily[last,best].rating
```
~~~

**Looping over arrays:**

Get city from all users:
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..address.city
```
~~~

**Looping over first N elements:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..[:3].address.city
```
~~~

**Specific array indexes:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..[3,2,6].address.city
```
~~~

**Last element:**

You can access the last element using `(@.length-1)` or just `[-1:]`:
~~~markdown
```req
url: https://api.modrinth.com/v2/project/distanthorizons
show: $.game_versions[(@.length-1)]
```
~~~

**Multiple properties:**
~~~markdown
```req 
url: http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=rooyca&api_key={{API_KEY}}&format=json&limit=4
show: $..recenttracks.track[0:][streamable,name,artist]
```
~~~

!!! info "Security Note"
    JSONPath expressions are validated to prevent script injection. Malicious expressions will be blocked.

---

### req-uuid

Specifies the unique identifier for caching the request response in `localStorage`.

**Example:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
show: $.name
req-uuid: test-{{this.username}}
```
~~~

!!! note "Where `{{this.username}}` is a variable (`username`) defined in the frontmatter."

**Accessing cached responses:**

Stored responses can be accessed using the `req-uuid` (which won't trigger a new request):

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
req-uuid: name
```
~~~

**Using with Dataview:**

Responses can also be accessed using [dataview](https://blacksmithgu.github.io/obsidian-dataview/):

~~~markdown
```dataviewjs
dv.paragraph(localStorage.getItem("req-UUID"))
```
~~~

!!! info "Always use `req-` prefix when accessing via localStorage"
    When accessing directly through localStorage, use: `localStorage.getItem("req-UUID")`

**Removing cached responses:**

From code:
~~~markdown
```dataviewjs
localStorage.removeItem("req-name")
```
~~~

From settings:
Go to Settings → APIRequest → Saved API Requests and click on the response you want to delete.

!!! tip "Cache Management"
    Regularly review and clear old cached responses to free up localStorage space.

---

### hidden

Executes the code block without displaying its output. Useful for background requests that cache data.

**Example:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
req-uuid: name
hidden
```
~~~

!!! tip "Use Case"
    Great for fetching authentication tokens or other data you want to cache but not display.

---

### disabled

Disables the request. The codeblock won't be executed. Useful for temporarily disabling requests without deleting them.

**Example:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
show: $.name
req-uuid: name
disabled
```
~~~

!!! tip "Development Tip"
    Use `disabled` during development to prevent hitting API rate limits.

---

### save-as

Saves the entire response to a file. A file extension is required.

**Example:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
save-as: posts/1.json
```
~~~

!!! warning "Important"
    - File paths are validated for security
    - Directory traversal (`..`) is blocked
    - Absolute paths are not allowed
    - The file path is relative to your vault root
    - Directories are NOT created automatically

!!! tip "File Management"
    Create the target directory in your vault before using `save-as`.

---

### auto-update

Forces the codeblock to fetch fresh data every time, ignoring cached responses.

**Example:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
req-uuid: firstPost
auto-update
save-as: posts/1.json
```
~~~

!!! note "When to use"
    Use `auto-update` when you need real-time data or when the cached response becomes stale.

**Without `req-uuid`:** Requests always run fresh by default.  
**With `req-uuid`:** Without `auto-update`, cached responses are used.  
**With `auto-update`:** Ignores cache and always fetches fresh data.

---

### format

Specifies a custom format for displaying the response. Supports HTML and uses `{}` as placeholders.

**Example:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
show: $.[title,body]
format: <h1>{}</h1> <p>{}</p>
```
~~~

!!! note "In this example, the first `{}` will be replaced with the *title*, and the second `{}` will be replaced with the *body*."

**Advanced formatting:**
~~~markdown
```req
url: https://api.example.com/user/1
show: $.[name,email,age]
format: **Name:** {} | **Email:** {} | **Age:** {}
```
~~~

**List formatting:**
~~~markdown
```req
url: https://api.todoist.com/rest/v2/tasks
headers: {"Authorization": "Bearer {{TODOIST_TOKEN}}"}
show: $..content
format: - [ ] {}
```
~~~

!!! danger "Security Warning"
    Format strings are sanitized to prevent XSS attacks. Script tags, event handlers, and javascript: URIs are automatically removed.

---

### properties

Updates frontmatter properties with response data. Requires a JSON response and the `show` flag.

**Syntax:**
The data should be property names separated by commas.

**Example:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
show: $.[id,title]
properties: id, title
```
~~~

**For internal links, use `[[..]]` syntax:**
~~~markdown
```req 
url: https://api.example.com/related
show: $.[id,name]
properties: relatedId, [[relatedNote]]
```
~~~

This will create:
```yaml
---
relatedId: 123
relatedNote: "[[Note Name]]"
---
```

!!! tip "Use Case"
    Great for automatically populating metadata from API responses.

---

## 💡 Common Patterns

### Authentication Flow

1. Get auth token (hidden):
~~~markdown
```req
url: https://api.example.com/auth/login
method: post
body: {"username": "{{this.username}}", "password": "{{this.password}}"}
req-uuid: auth
hidden
```
~~~

2. Use token in subsequent requests:
~~~markdown
```req
url: https://api.example.com/user/data
headers: {"Authorization": "Bearer {{ls.auth>$.token}}"}
```
~~~

### Error Handling

If a request fails, an error message will be displayed:

```
Error: Failed to fetch
```

Common errors:

- **Network Error**: Check your internet connection
- **401 Unauthorized**: Check your API key/token
- **404 Not Found**: Verify the URL is correct
- **Invalid JSONPath**: Check your `show:` expression

---

## 📚 Further Reading

- [JSONPath Syntax Examples](https://github.com/JSONPath-Plus/JSONPath?tab=readme-ov-file#syntax-through-examples)
- [JSONPath Online Tester](https://jsonpath-plus.github.io/JSONPath/demo/)
- [Use Cases](usecase/index.md) - Real-world examples

---

## ❓ Troubleshooting

**Request not working?**

- Check the console (Ctrl+Shift+I) for detailed error messages
- Verify your URL is correct and uses https://
- Check that all required flags are present
- Ensure your JSONPath expression is valid

**Cached data not updating?**

- Remove `req-uuid` to always fetch fresh data
- Or add `auto-update` flag to force refreshing
- Or manually clear cache in Settings

**Variables not resolving?**

- Check frontmatter syntax is correct
- Verify global variables are defined in settings
- Ensure you're using the correct variable syntax

---

!!! tip "Need Help?"
    If you encounter issues or have questions, please open an issue on [GitHub](https://github.com/Rooyca/obsidian-api-request/issues).
