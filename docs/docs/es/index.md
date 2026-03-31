# 🔎 Descripción General

APIRequest (APIR) es un plugin para la aplicación de toma de notas [Obsidian](https://obsidian.md/) que te permite realizar solicitudes a APIs y mostrar la respuesta directamente en tus notas.

## 🔥 Características

- **Múltiples Métodos HTTP**: Realiza solicitudes usando `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD` y `OPTIONS`.
- **Sustitución de Variables**: Utiliza variables del `front-matter`, variables globales o incluso reutiliza respuestas de otros bloques de código.
- **Caché de Respuestas**: Guarda respuestas en `localStorage` para acceso y reutilización conveniente entre notas.
- **Control de Rendimiento**: Desactiva bloques de código según sea necesario para optimizar el rendimiento.
- **Extracción Precisa de Datos**: Muestra valores específicos de las respuestas usando JSONPath, proporcionando control granular sobre la presentación de datos.
- **Seguridad Primero**: Validación y sanitización de entradas incorporada para proteger contra XSS, ataques de inyección y directory traversal.
- **Auto-actualización**: Actualiza automáticamente respuestas en caché cuando sea necesario.
- **Formato de Salida**: Formato HTML/texto personalizado para datos de respuesta.

## 🔒 Características de Seguridad

APIRequest implementa medidas de seguridad completas:

- ✅ **Validación de URL**: Solo se permiten protocolos HTTPS y HTTP
- ✅ **Sanitización de Entradas**: Todas las entradas de usuario son validadas y sanitizadas
- ✅ **Prevención de XSS**: La salida HTML es sanitizada para prevenir inyección de scripts
- ✅ **Protección contra Directory Traversal**: Las rutas de archivos son validadas para prevenir acceso no autorizado
- ✅ **JSONPath Seguro**: Las expresiones JSONPath son validadas antes de la ejecución
- ✅ **Sanitización de UUID**: Los identificadores de solicitud son sanitizados para prevenir ataques de inyección

!!! warning "Mejores Prácticas de Seguridad"
    - Siempre usa URLs HTTPS al realizar solicitudes API
    - Almacena claves API en variables globales (Configuración → APIRequest → Variables globales), nunca en notas
    - Revisa y limpia regularmente respuestas en caché (Configuración → APIRequest → Solicitudes API Guardadas)
    - Solo conéctate a endpoints API de confianza

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
req-uuid: IDpersona
disabled
```
~~~

## 📚 Inicio Rápido

1. **Solicitud GET Simple**

~~~markdown
```req
url: https://api.github.com/users/octocat
show: $.name
```
~~~

2. **Usando Variables**

~~~markdown
```req
url: https://api.example.com/user/{{this.userId}}
headers: {"Authorization": "Bearer {{API_TOKEN}}"}
show: $.data.name
```
~~~

3. **Almacenando Respuestas en Caché**

~~~markdown
```req
url: https://api.example.com/data
req-uuid: mydata
show: $.result
```
~~~

4. **Reutilizando Datos en Caché**

~~~markdown
```req
url: https://api.example.com/more-data
headers: {"X-Token": "{{ls.mydata>$.token}}"}
```
~~~

Para documentación detallada sobre todas las banderas y características, consulta [Bloques de código](codeblocks.md).
