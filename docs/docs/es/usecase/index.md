# Ejemplos de uso

A collection of use cases for this plugin. **If you have a one, please share it with us.**
Una colección ejemplos de uso para este plugin. **Si tienes uno, por favor compártelo con nosotros.**


## Renderizar Markdown

~~~makdown
```req
url: https://raw.githubusercontent.com/Rooyca/Rooyca/main/README.md
```
~~~

## Ver el precio de BITCOIN (o cualquier criptomoneda)

~~~makdown
```req 
url: api.coincap.io/v2/rates/bitcoin
show: data -> rateUsd
```
~~~

> 64992.8972508856324769

Si queremos repetir esta solicitud 100 veces cada 5 segundos, podemos hacerlo de la siguiente manera:

~~~makdown
```req 
url: api.coincap.io/v2/rates/bitcoin
show: data -> rateUsd
req-repeat: 100@5
```
~~~

Si deseamos llevar esto un paso más allá y recibir una notificación cuando el precio supere los 65000, podemos hacerlo de la siguiente manera:

~~~makdown
```req 
url: api.coincap.io/v2/rates/bitcoin
show: data -> rateUsd
req-repeat: 100@5
notify-if: data.rateUsd > 65000
```
~~~

!!! warning "Ten presente el uso de `data.rateUsd` en lugar de `data -> rateUsd`"

## Obtener el clima

~~~makdown
```req
url: api.openweathermap.org/data/2.5/weather?q=<CITY>&appid=YOUR_API_KEY
show: main -> temp
```
~~~

## Buscar peliculas

~~~makdown
```req
url: https://api.themoviedb.org/3/search/movie?query={{this.title}}&api_key=YOUR_API_KEY
show: results -> {..} -> title
```
~~~

!!! info "Nota el uso de `{{this.title}}`. Esta es una característica que te permite pasar propiedades del front-matter."

## Renderizar datos

~~~makdown
```req
url: https://mapi.mobilelegends.com/hero/detail?id={{this.file.name}}
show: data -> cover_picture, data -> name, data -> type
format: ![img]({}) <br> **Name:** {} <br> **Type:** {}
render
```
~~~

![data-rendering](/en/usecase/data-rendering.jpg)

## Obtener Tareas de [todoist](https://todoist.com/)

~~~makdown
```req
url: https://api.todoist.com/rest/v2/tasks
headers: {"Authorization": "Bearer YOUR_TOKEN"}
show: {..} -> content
format: - [ ] {}
req-id: todos
render
```
~~~

!!! warning "Esto guardará la respuesta en localStorage bajo la clave `req-todos`"

## Tu caso de uso

> **Si deseas compartir tu caso de uso, por favor siéntete libre de abrir una PR o un [Issue](https://github.com/Rooyca/obsidian-api-request/issues/new/choose)**