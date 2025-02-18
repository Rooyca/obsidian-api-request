# Ejemplos de uso

A collection of use cases for this plugin. **If you have a one, please share it with us.**
Una colección ejemplos de uso para este plugin. **Si tienes uno, por favor compártelo con nosotros.**

## Ver el precio de BITCOIN (o cualquier criptomoneda)

~~~makdown
```req 
url: https://api.coincap.io/v2/rates/bitcoin
show: $.data.rateUsd
```
~~~

> 64992.8972508856324769

## Obtener el clima

~~~makdown
```req
url: https://api.openweathermap.org/data/2.5/weather?q=<CITY>&appid=YOUR_API_KEY
show: $.main.temp
```
~~~

## Buscar peliculas

~~~makdown
```req
url: https://api.themoviedb.org/3/search/movie?query={{this.title}}&api_key=YOUR_API_KEY
show: $.results[0:].title
```
~~~

!!! info "Nota el uso de `{{this.title}}`. Esta es una característica que te permite pasar propiedades del front-matter."

## Obtener más de un resultado

~~~makdown
```req
url: https://mapi.mobilelegends.com/hero/detail?id={{this.file.name}}
show: $.data[cover_picture,name,type]
```
~~~

## Obtener Tareas de [todoist](https://todoist.com/)

~~~makdown
```req
url: https://api.todoist.com/rest/v2/tasks
headers: {"Authorization": "Bearer YOUR_TOKEN"}
show: $..content
req-uuid: todos
```
~~~

!!! warning "Esto guardará la respuesta en localStorage bajo la clave `req-todos`"

## Tu caso de uso

> **Si deseas compartir tu caso de uso, por favor siéntete libre de abrir una PR o un [Issue](https://github.com/Rooyca/obsidian-api-request/issues/new/choose)**