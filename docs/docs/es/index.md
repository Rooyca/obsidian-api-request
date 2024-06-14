# 🔎 APIRequest

APIRequest (APIR) es un plugin para [Obsidian](https://obsidian.md/) que te permite realizar solicitudes HTTP y mostrar la respuesta en tus notas.

## 🔥 Características

- Realiza solicitudes HTTP utilizando varios métodos como `GET`, `POST`, `PUT` y `DELETE`.
- Recibe respuestas en diferentes formatos incluyendo JSON, HTML y Markdown.
- Utiliza variables del front-matter dentro de bloques de código.
- Guarda respuestas en `localStorage` para un acceso y reutilización convenientes.
- Desactiva bloques de código según sea necesario para optimizar el rendimiento.
- Repite solicitudes múltiples veces a intervalos especificados, facilitando tareas automatizadas o la recuperación continua de datos sin intervención manual.
- Recibe notificaciones cuando los valores específicos cumplen condiciones predefinidas, permitiendo monitoreo proactivo y alertas.
- Define combinaciones de teclas para ejecutar solicitudes, mejorando la eficiencia y la experiencia del usuario al permitir acceso rápido a solicitudes frecuentemente utilizadas.
- Muestra valores específicos de las respuestas, proporcionando un control detallado sobre la presentación de datos.

## ⚡ Cómo usar

### 👨🏻‍💻 Bloque de código

Para usarlo, crea un bloque de código con el lenguaje establecido en `req`. Dentro del bloque de código, puedes especificar `url`, `method`, `body`, `headers`, `format`, etc. Consulta las [banderas disponibles](codeblocks.md#flags) para más información.

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

### 🛠️ Configuraciones (no todas las funcionalidades están disponibles)

!!! info "Todos los parámetros se pueden definir en la configuración."

Presiona `Ctrl+P` y busca `APIR`. Hay dos opciones:

1. Mostrar respuesta en modal
2. Pegar respuesta en el documento actual (en la línea actual)

[Más información](settings.md)
