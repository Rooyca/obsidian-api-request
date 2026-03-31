# 👨🏻‍💻 Bloques de Código

El `bloque de código` es un bloque versátil que se puede utilizar para realizar solicitudes API directamente desde tus notas. Esta guía cubre todas las banderas disponibles y cómo usarlas de manera efectiva y segura.

## 🏳️ Banderas

Las banderas son la forma de especificar los parámetros de nuestra solicitud. Todas las banderas **no distinguen entre mayúsculas y minúsculas**.

| Bandera         | Por defecto  | Requerido | Descripción |
| ------------| ---------| -------- | ----------- |
| [url](#url) |          | ✅ Sí   | El endpoint de la API a solicitar |
| [method](#method) | GET   | No | Método HTTP (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS) |
| [body](#body) |         | No | Cuerpo de la solicitud (formato JSON) |
| [headers](#headers) |   | No | Encabezados de la solicitud (formato JSON) |
| [show](#show) | ALL     | No | JSONPath para extraer datos específicos |
| [req-uuid](#req-uuid) | req-general | No | ID único para almacenamiento en caché |
| [hidden](#hidden) | FALSE | No | Ocultar la salida |
| [disabled](#disabled) | | No | Deshabilitar la solicitud |
| [save-as](#save-as) |   | No | Guardar la respuesta en un archivo |
| [auto-update](#auto-update) | FALSE | No | Siempre obtener datos frescos |
| [format](#format) | | No | Formato de salida personalizado |
| [properties](#properties) | | No | Actualizar propiedades del frontmatter |

---

## 🔒 Consideraciones de Seguridad

!!! danger "Directrices de Seguridad Importantes"
    - **Siempre usa HTTPS**: Usa URLs `https://` para asegurar comunicación cifrada
    - **Protege las Claves API**: Almacena tokens sensibles en variables globales, nunca los codifiques directamente en las notas
    - **Valida las Entradas**: El plugin valida todas las entradas, pero solo conéctate a APIs de confianza
    - **Revisa los Datos en Caché**: Limpia regularmente las respuestas antiguas en caché desde la Configuración

### Validación de Entradas

Todas las entradas del usuario se validan automáticamente:

- **URLs**: Solo se permiten los protocolos `http://` y `https://`
- **UUIDs**: Sanitizados solo a alfanuméricos, guiones y guiones bajos
- **Rutas de Archivos**: Se bloquean el recorrido de directorios (`..`) y las rutas absolutas
- **JSONPath**: Las expresiones se validan para prevenir inyección de scripts
- **Cadenas de Formato**: El HTML se sanitiza para prevenir ataques XSS

---

## 📖 Variables y Reutilización de Datos

### LocalStorage y Variables

Las respuestas de la API se pueden almacenar en `localStorage` y reutilizar en otros bloques de código o notas. Para almacenar una respuesta, debes asignarle un identificador único usando la bandera `req-uuid`.

Puedes acceder a las respuestas almacenadas usando la siguiente sintaxis:

```
{{ls.UUID>JSONPath}}
```

* `UUID`: El identificador único definido en la bandera `req-uuid` (sin el prefijo `req-`)
* `JSONPath`: La ruta a los datos específicos que deseas de la respuesta

**Ejemplo:**
Si tienes una solicitud con `req-uuid: user`, puedes acceder al nombre del usuario así:

```
{{ls.user>$.name}}
```

!!! info "Nota de Seguridad"
    Los UUIDs se sanitizan automáticamente. Solo se permiten caracteres alfanuméricos, guiones y guiones bajos.

---

### Variables del Frontmatter

Puedes hacer referencia a variables definidas en el **frontmatter** de la nota usando:

```
{{this.variableName}}
```

**Ejemplo:**

Frontmatter:
```yaml
---
userId: 12345
title: "Mi Nota"
---
```

Uso en la solicitud:
~~~markdown
```req
url: https://api.example.com/user/{{this.userId}}
```
~~~

!!! warning "Advertencia de Seguridad"
    Evita almacenar claves API sensibles en el frontmatter. Usa variables globales en su lugar.

---

### Variables Globales

Define variables reutilizables en la configuración del plugin (Configuración → APIRequest → Variables globales). Estas se almacenan de forma segura y se pueden acceder con:

```
{{VARIABLE_NAME}}
```

**Ejemplo:**

1. En la configuración del plugin, agrega:
   - Clave: `API_KEY`
   - Valor: `your-secret-key`

2. En tu solicitud:

~~~markdown
```req
url: https://api.example.com/data
headers: {"Authorization": "Bearer {{API_KEY}}"}
```
~~~

!!! tip "Mejor Práctica"
    Almacena todas las claves API y tokens como variables globales para mantener tus notas seguras y portables.

---

### Variables Especiales

- `{{this.file.name}}` - Nombre base del archivo actual (sin extensión)

---

## Detalles de las Banderas

### url

La única bandera **requerida**. Especifica el endpoint de la solicitud API.

**Sintaxis:**
~~~markdown
```req 
url: https://api.example.com/endpoint
```
~~~

**Con variables:**
~~~markdown
```req 
# esto es solo un comentario
url: https://jsonplaceholder.typicode.com/users/{{this.id}}
```
~~~

!!! note "Donde `{{this.id}}` es una variable (`id`) definida en el frontmatter."

!!! danger "Seguridad"
    Solo se permiten URLs HTTPS y HTTP. Otros protocolos (file://, javascript:, etc.) están bloqueados por seguridad.

---

### method

Especifica el método de solicitud HTTP. El valor por defecto es `GET`.

**Métodos disponibles:**
- GET (por defecto)
- POST
- PUT
- DELETE
- PATCH
- HEAD
- OPTIONS

**Ejemplo:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
```
~~~

---

### body

Especifica el cuerpo de la solicitud. Los datos deben estar en formato JSON.

**Ejemplo:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
body: {"title": "{{this.filename}}", "body": "bar", "userId": 1}
```
~~~

!!! note "Donde `{{this.filename}}` es el nombre del archivo de trabajo."

**Uso avanzado con variables:**
~~~markdown
```req 
url: https://api.example.com/create
method: post
body: {"userId": {{this.userId}}, "token": "{{API_TOKEN}}"}
```
~~~

---

### headers

Especifica los encabezados de la solicitud. Los datos deben estar en formato JSON.

**Ejemplo:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts
method: post
headers: {"Content-type": "application/json; charset=UTF-8"}
```
~~~

**Usando respuestas en caché como encabezados:**

Puedes usar respuestas de otras solicitudes como encabezados/cuerpo/url/show. Por ejemplo, si tienes una solicitud con `req-uuid: token`, puedes usarla así:

~~~markdown
```req
url: https://api.todoist.com/rest/v2/tasks
headers: {"Authorization": "Bearer {{ls.token>$.access_token}}"}
show: $..content
format: - [ ] {}
req-uuid: todos
```
~~~

!!! tip "Encabezados Comunes"
    - `Content-Type: application/json` - Para datos JSON
    - `Authorization: Bearer TOKEN` - Para autenticación API
    - `Accept: application/json` - Para solicitar respuestas JSON

---

### show

Especifica qué datos de la respuesta mostrar usando expresiones JSONPath. Ver [ejemplos de JSONPath](https://github.com/JSONPath-Plus/JSONPath?tab=readme-ov-file#syntax-through-examples), o prueba la herramienta en línea de [jsonpath-plus](https://jsonpath-plus.github.io/JSONPath/demo/).

**Ejemplo simple:**
~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: $['chess_daily']['last']['rating']
```
~~~

**Múltiples salidas usando corchetes:**
~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: $.chess_daily[last,best].rating
```
~~~

**Múltiples salidas usando +:**
~~~markdown
```req
url: https://api.chess.com/pub/player/hikaru/stats
show: $.chess_daily[last,best].rating + $.chess960_daily[last,best].rating
```
~~~

**Iterando sobre arrays:**

Obtener ciudad de todos los usuarios:
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..address.city
```
~~~

**Iterando sobre los primeros N elementos:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..[:3].address.city
```
~~~

**Índices específicos del array:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users
show: $..[3,2,6].address.city
```
~~~

**Último elemento:**

Puedes acceder al último elemento usando `(@.length-1)` o simplemente `[-1:]`:
~~~markdown
```req
url: https://api.modrinth.com/v2/project/distanthorizons
show: $.game_versions[(@.length-1)]
```
~~~

**Múltiples propiedades:**
~~~markdown
```req 
url: http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=rooyca&api_key={{API_KEY}}&format=json&limit=4
show: $..recenttracks.track[0:][streamable,name,artist]
```
~~~

!!! info "Nota de Seguridad"
    Las expresiones JSONPath se validan para prevenir inyección de scripts. Las expresiones maliciosas serán bloqueadas.

---

### req-uuid

Especifica el identificador único para almacenar en caché la respuesta de la solicitud en `localStorage`.

**Ejemplo:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
show: $.name
req-uuid: test-{{this.username}}
```
~~~

!!! note "Donde `{{this.username}}` es una variable (`username`) definida en el frontmatter."

**Accediendo a respuestas en caché:**

Las respuestas almacenadas se pueden acceder usando el `req-uuid` (lo cual no activará una nueva solicitud):

~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
req-uuid: name
```
~~~

**Usando con Dataview:**

Las respuestas también se pueden acceder usando [dataview](https://blacksmithgu.github.io/obsidian-dataview/):

~~~markdown
```dataviewjs
dv.paragraph(localStorage.getItem("req-UUID"))
```
~~~

!!! info "Siempre usa el prefijo `req-` cuando accedas vía localStorage"
    Al acceder directamente a través de localStorage, usa: `localStorage.getItem("req-UUID")`

**Eliminando respuestas en caché:**

Desde código:
~~~markdown
```dataviewjs
localStorage.removeItem("req-name")
```
~~~

Desde configuración:
Ve a Configuración → APIRequest → Solicitudes API Guardadas y haz clic en la respuesta que deseas eliminar.

!!! tip "Gestión de Caché"
    Revisa y limpia regularmente las respuestas antiguas en caché para liberar espacio en localStorage.

---

### hidden

Ejecuta el bloque de código sin mostrar su salida. Útil para solicitudes en segundo plano que almacenan datos en caché.

**Ejemplo:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
req-uuid: name
hidden
```
~~~

!!! tip "Caso de Uso"
    Excelente para obtener tokens de autenticación u otros datos que deseas almacenar en caché pero no mostrar.

---

### disabled

Deshabilita la solicitud. El bloque de código no se ejecutará. Útil para deshabilitar temporalmente solicitudes sin eliminarlas.

**Ejemplo:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/users/1
show: $.name
req-uuid: name
disabled
```
~~~

!!! tip "Consejo de Desarrollo"
    Usa `disabled` durante el desarrollo para evitar alcanzar los límites de tasa de la API.

---

### save-as

Guarda la respuesta completa en un archivo. Se requiere una extensión de archivo.

**Ejemplo:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
save-as: posts/1.json
```
~~~

!!! warning "Importante"
    - Las rutas de archivo se validan por seguridad
    - Se bloquea el recorrido de directorios (`..`)
    - No se permiten rutas absolutas
    - La ruta del archivo es relativa a la raíz de tu bóveda
    - Los directorios NO se crean automáticamente

!!! tip "Gestión de Archivos"
    Crea el directorio de destino en tu bóveda antes de usar `save-as`.

---

### auto-update

Fuerza al bloque de código a obtener datos frescos cada vez, ignorando las respuestas en caché.

**Ejemplo:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
req-uuid: firstPost
auto-update
save-as: posts/1.json
```
~~~

!!! note "Cuándo usar"
    Usa `auto-update` cuando necesites datos en tiempo real o cuando la respuesta en caché se vuelva obsoleta.

**Sin `req-uuid`:** Las solicitudes siempre se ejecutan frescas por defecto.  
**Con `req-uuid`:** Sin `auto-update`, se usan las respuestas en caché.  
**Con `auto-update`:** Ignora el caché y siempre obtiene datos frescos.

---

### format

Especifica un formato personalizado para mostrar la respuesta. Admite HTML y usa `{}` como marcadores de posición.

**Ejemplo:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
show: $.[title,body]
format: <h1>{}</h1> <p>{}</p>
```
~~~

!!! note "En este ejemplo, el primer `{}` será reemplazado con el *título*, y el segundo `{}` será reemplazado con el *cuerpo*."

**Formato avanzado:**
~~~markdown
```req
url: https://api.example.com/user/1
show: $.[name,email,age]
format: **Nombre:** {} | **Email:** {} | **Edad:** {}
```
~~~

**Formato de lista:**
~~~markdown
```req
url: https://api.todoist.com/rest/v2/tasks
headers: {"Authorization": "Bearer {{TODOIST_TOKEN}}"}
show: $..content
format: - [ ] {}
```
~~~

!!! danger "Advertencia de Seguridad"
    Las cadenas de formato se sanitizan para prevenir ataques XSS. Las etiquetas de script, manejadores de eventos y URIs javascript: se eliminan automáticamente.

---

### properties

Actualiza las propiedades del frontmatter con datos de la respuesta. Requiere una respuesta JSON y la bandera `show`.

**Sintaxis:**
Los datos deben ser nombres de propiedades separados por comas.

**Ejemplo:**
~~~markdown
```req 
url: https://jsonplaceholder.typicode.com/posts/1
show: $.[id,title]
properties: id, title
```
~~~

**Para enlaces internos, usa la sintaxis `[[..]]`:**
~~~markdown
```req 
url: https://api.example.com/related
show: $.[id,name]
properties: relatedId, [[relatedNote]]
```
~~~

Esto creará:
```yaml
---
relatedId: 123
relatedNote: "[[Note Name]]"
---
```

!!! tip "Caso de Uso"
    Excelente para poblar automáticamente metadatos desde respuestas API.

---

## 💡 Patrones Comunes

### Flujo de Autenticación

1. Obtener token de autenticación (oculto):

~~~markdown
```req
url: https://api.example.com/auth/login
method: post
body: {"username": "{{this.username}}", "password": "{{this.password}}"}
req-uuid: auth
hidden
```
~~~

2. Usar el token en solicitudes subsecuentes:

~~~markdown
```req
url: https://api.example.com/user/data
headers: {"Authorization": "Bearer {{ls.auth>$.token}}"}
```
~~~

### Manejo de Errores

Si una solicitud falla, se mostrará un mensaje de error:

```
Error: Failed to fetch
```

Errores comunes:
- **Error de Red**: Verifica tu conexión a internet
- **401 No Autorizado**: Verifica tu clave/token API
- **404 No Encontrado**: Verifica que la URL sea correcta
- **JSONPath Inválido**: Verifica tu expresión `show:`

### Consejos de Rendimiento

1. **Almacena en caché las respuestas** - Usa `req-uuid` para datos que no cambian a menudo
2. **Usa `disabled`** - Deshabilita temporalmente solicitudes costosas durante el desarrollo
3. **Usa `hidden`** - Oculta la salida para la obtención de datos en segundo plano

---

## 📚 Lecturas Adicionales

- [Ejemplos de Sintaxis JSONPath](https://github.com/JSONPath-Plus/JSONPath?tab=readme-ov-file#syntax-through-examples)
- [Probador en Línea de JSONPath](https://jsonpath-plus.github.io/JSONPath/demo/)
- [Casos de Uso](usecase/index.md) - Ejemplos del mundo real

---

## ❓ Solución de Problemas

**¿La solicitud no funciona?**

- Verifica la consola (Ctrl+Shift+I) para mensajes de error detallados
- Verifica que tu URL sea correcta y use https://
- Verifica que todas las banderas requeridas estén presentes
- Asegúrate de que tu expresión JSONPath sea válida

**¿Los datos en caché no se actualizan?**

- Elimina `req-uuid` para siempre obtener datos frescos
- O agrega la bandera `auto-update` para forzar la actualización
- O limpia manualmente el caché en Configuración

**¿Las variables no se resuelven?**

- Verifica que la sintaxis del frontmatter sea correcta
- Verifica que las variables globales estén definidas en la configuración
- Asegúrate de estar usando la sintaxis correcta de variables

---

!!! tip "¿Necesitas Ayuda?"
    Si encuentras problemas o tienes preguntas, por favor abre un issue en [GitHub](https://github.com/Rooyca/obsidian-api-request/issues).
