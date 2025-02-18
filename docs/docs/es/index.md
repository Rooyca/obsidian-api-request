# 🔎 APIRequest

APIRequest (APIR) es un plugin para [Obsidian](https://obsidian.md/) que te permite realizar solicitudes HTTP y mostrar la respuesta en tus notas.

## 🔥 Características

- Realiza solicitudes HTTP utilizando varios métodos como `GET`, `POST`, `PUT` y `DELETE`.
- Utiliza variables del front-matter dentro de bloques de código.
- Guarda respuestas en `localStorage` para un acceso y reutilización convenientes.
- Desactiva bloques de código según sea necesario para optimizar el rendimiento.
- Muestra valores específicos de las respuestas, proporcionando un control detallado sobre la presentación de datos.

## ⚡ Cómo usar

### 👨🏻‍💻 Bloque de código

Para usarlo, crea un bloque de código con el lenguaje establecido en `req`. Dentro del bloque de código, puedes especificar `url`, `method`, `body`, `headers`, etc. Consulta las [banderas disponibles](codeblocks.md#flags) para más información.

~~~markdown
```req
url: https://my-json-server.typicode.com/typicode/demo/comments
method: post
body: {"id":1}
headers: {"Accept": "application/json"}
show: $.id
req-uuid: id-persona
disabled
```
~~~