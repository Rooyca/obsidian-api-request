# APIRequest v2: Feature Overview

## Features to Retain

- [x] Support for standard HTTP methods: `GET, POST, PUT, DELETE`
- [x] Headers and Body configuration  
  - [x] Fix quotation marks to support formats beyond double quotes
- [x] Customizable response output using the `jsonpath-plus` library  
  - [x] Display strings when arrays contain a single element
- [ ] Properties configuration (pending implementation)
- [ ] Support for repeated requests (e.g., at fixed intervals or multiple iterations)
- [x] Single-request execution
- [x] Save responses to a file  
  - [x] Automatically save responses upon each code block execution
- [x] Integration with `frontmatter` variables using `{{this.VARNAME}}` syntax
- [x] Global variables (Key/Value pairs) managed via settings

## Features to Remove

- [x] Modals (removed for streamlined functionality)
- [x] `res-type` flag (removed)
- [x] `notify-if` flag (removed to reduce complexity)
- [x] `render` flag (removed to focus on core functionality)
- [x] `maketable` (removed to simplify output)
- [x] `format` flag (removed for streamlined functionality)
- [x] Support for non-JSON formats (e.g., MD, XML) — JSON remains the primary focus

## Features to Add

- [ ] `hide` flag ~do we actually want this?~
- [x] `auto-update` flag
- [x] Unique request identifiers (`req-uuid`) (save it in local storage and use it for subsequent requests unless user use the flag `auto-update`)
- [-] Inline queries (rendered exclusively in "read mode")
- [x] Data re-usage (`{{ls.UUID>JSONPath}}` syntax, where `ls` stands for `localStorage`)
- [x] Support for comments using `#` or `//` syntax 
