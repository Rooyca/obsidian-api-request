# 👨🏻‍💻 Bloque de código

El `bloque de código` es un bloque versátil que se puede usar para escribir código en diferentes lenguajes. En este caso, lo usaremos para realizar solicitudes.

## 🏳️ Banderas

Las banderas son la forma de especificar los parámetros de nuestra solicitud y también el formato en el que queremos nuestra respuesta.

| Bandera | Valor predeterminado |
| ------------| ---------|
| [url](#url) |          |
| [method](#method) | GET   |
| [body](#body) |         |
| [headers](#headers) |   |
| [show](#show) | ALL     |
| [req-uuid](#req-uuid) | |
| [disabled](#disabled) | |
| [save-as](#save-as) |   |

### url

Es la única bandera **obligatoria**. Especifica la URL de la solicitud. Se pueden utilizar variables definidas en el `frontmatter`.

~~~markdown
```req
# un comentario
url: https://jsonplaceholder.typicode.com/users/{{this.id}}
```
~~~

!!! note "Donde `{{this.id}}` es una variable (`id`) definida en el frontmatter."


### method

Especifica el método de solicitud. El valor predeterminado es `GET` y los valores disponibles son:

- GET
- POST
- PUT
- DELETE

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
```
~~~

### body

Especifica el cuerpo de la solicitud. El valor predeterminado es un objeto vacío. Los datos deben estar en formato JSON separando las claves y valores con dos puntos y espacio. Se pueden utilizar variables definidas en el `frontmatter`.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
body: {"title": {{this.title}}, "body": "bar", "userId": 1}
```
~~~

!!! note "Donde `{{this.title}}` es una variable (`title`) definida en el frontmatter."

### headers

Especifica los encabezados de la solicitud. El valor predeterminado es un objeto vacío. Los datos deben estar en formato JSON separando las claves y valores con dos puntos y espacio. Se pueden utilizar variables definidas en el `frontmatter`.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
headers: {"Content-type": "application/json; charset=UTF-8"}
```
~~~

### show

Especifica los datos de respuesta que se van a mostrar. Ver [ejemplos de JSONPath](https://github.com/JSONPath-Plus/JSONPath?tab=readme-ov-file#syntax-through-examples), o prueba la herramienta online de [jsonpath-plus](https://jsonpath-plus.github.io/JSONPath/demo/).

~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: $['chess_daily']['last']['rating']
```
~~~

Se pueden mostrar múltiples resultados usando `[]`.

~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: $.chess_daily[last,best].rating
```
~~~

También es posible iterar sobre un arreglo. El siguiente ejemplo muestra la ciudad de todos los usuarios.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..address.city
```
~~~

También es posible iterar sobre un número especificado de elementos del arreglo.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..[:3].address.city
```
~~~

También es posible iterar sobre un rango especificado de índices del arreglo.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..[3,2,6].address.city
```
~~~

Puedes acceder al último elemento usando `(@.length-1)` o simplemente `[-1:]`.

~~~markdown
```req
url: https://api.modrinth.com/v2/project/distanthorizons
show: $.game_versions[(@.length-1)]
```
~~~

Para acceder a multiples resultados podemos usar:

~~~markdown
```req 
url: http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=rooyca&api_key=API_KEY&format=json&limit=4
show: $..recenttracks.track[0:][streamable,name,artist]
```
~~~

### req-uuid

Especifica el ID con la que se almacenará la solicitud. Esto es útil cuando queremos almacenar la respuesta en `localStorage` y usarla en otros bloques o notas.


~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
show: $.name
req-uuid: name
```
~~~

Las respuestas almacenadas se pueden ver usando el `req-uuid` con la bandera `disabled` (que no activará una nueva solicitud).

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
req-uuid: name
disabled
```
~~~

Las respuestas también se pueden ver usando [dataview](https://blacksmithgu.github.io/dataview/).

~~~markdown
```dataview
dv.paragraph(localStorage.getItem("req-name"))
```
~~~

!!! info "Es obligatorio usar `req-` antes de lo que sea que hayas definido en la bandera `req-uuid`."

Para eliminar respuestas de localStorage, ejecuta:

~~~markdown
```dataview
localStorage.removeItem("req-name")
```
~~~

Para eliminar todas las respuestas, ve a configuraciones y haz clic sobre la respuesta que quieras eliminar.

### disabled

Deshabilita la solicitud. El codeblock no se ejecutará.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
show: $.name
req-uuid: name
disabled
```
~~~

### save-as

Especifica la ruta para guardar la respuesta. Guardará toda la respuesta. Se requiere una extensión de archivo. No creará directorios.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
save-as: posts/1.json
```
~~~

### auto-update

El codeblock se actualizará de manera automatica cada que sea posible. Esto solo es necesario cuando la bandera `req-uuid` está precente, porque el comportamiento predeterminado del codeblock es ejecutarse cada vez que se carga la nota.

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
req-uuid: firstPost
auto-update
save-as: posts/1.json
```
~~~