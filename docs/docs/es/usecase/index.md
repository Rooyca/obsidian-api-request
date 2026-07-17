# Casos de uso

Una colección de casos de uso para este complemento. **Si tienes uno, por favor compártelo con nosotros.**

## Uso de respuestas en línea con [Dataview](https://blacksmithgu.github.io/obsidian-dataview/)

Primero, haz una solicitud y almacena la respuesta usando `req-uuid`:

~~~markdown
```req
url: https://jsonplaceholder.typicode.com/comments/1
req-uuid: test
hidden
```
~~~

A continuación, con **DataviewJS** y las consultas JavaScript en línea habilitadas, puedes acceder a los datos guardados de esta manera:

```markdown
El correo electrónico es `$=dv.el("span", JSON.parse(localStorage.getItem("req-test")).email)`  
y el ID es `$=dv.el("span", JSON.parse(localStorage.getItem("req-test")).id, { cls: "mod-warning" })`
```

Esto recupera el correo electrónico y el ID de la respuesta guardada (el prefijo `req-` siempre es requerido).
Aquí, también estamos añadiendo una clase personalizada a la segunda consulta en línea.

La salida renderizada se verá así:

> El correo electrónico es [Eliseo@gardner.biz](mailto:Eliseo@gardner.biz) y el ID es <span style="color:red;">1</span> 

## Consultar el precio de BITCOIN (o cualquier criptomoneda)

~~~makdown
```req 
url: https://api.coinpaprika.com/v1/tickers/btc-bitcoin
show: $.quotes.USD.price
```
~~~

> 64149.230100840585

## Obtener el clima

~~~makdown
```req
url: https://api.openweathermap.org/data/2.5/weather?q=<CITY>&appid=YOUR_API_KEY
show: $.main.temp
```
~~~

## Buscar películas

~~~makdown
```req
url: https://api.themoviedb.org/3/search/movie?query={{this.title}}&api_key=YOUR_API_KEY
show: $.results[0:].title
```
~~~

!!! info "Observa el uso de `{{this.title}}`. Esta es una característica que te permite pasar propiedades del front-matter."

## Renderizar datos

~~~markdown
```req
url: https://mapi.mobilelegends.com/hero/detail?id=1
show: $.data[cover_picture,name,type]
format: ![img]({}) <br> <strong>Name:</strong> {} <br> <strong>Type:</strong> {}
```
~~~

## Obtener TAREAS desde [todoist](https://todoist.com/)

~~~makdown
```req
url: https://api.todoist.com/rest/v2/tasks
headers: {"Authorization": "Bearer YOUR_TOKEN"}
show: $..content
format: - [ ] {}
req-id: todos
```
~~~

!!! warning "Esto guardará la respuesta en localStorage bajo la clave `req-todos`"

## Tu caso de uso

> **Si quieres compartir tu caso de uso, siéntete libre de abrir un PR o un [Issue](https://github.com/Rooyca/obsidian-api-request/issues/new/choose).**