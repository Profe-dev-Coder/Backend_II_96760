import express from "express"
import cookieParser from "cookie-parser"

const app = express()

app.use(cookieParser())

app.get("/seteo-una-cookie", (req, res)=>{
    res.cookie("nombre_de_la_cookie", "valor_de_mi_cookie", {maxAge:60000 * 60})

    res.send("Creamos una cookie")
})

app.get("/leo-la-cookie", (req, res)=>{
    
    console.log("ACA ESTA LA COOKIE RECUPERADA", req.cookies)

    res.json(req.cookies)
})


//EJEMPLO DE FETCH QUE SE GENERA EN EL FRONT Y ES ENVIADO AL BACKEND

// 1. Ejemplo de datos que queremos enviar desde el frontend  al backend (datos que pueden venir de un formulario):
// const datosFormulario = {
//     nombre: "Juan Perez",
//     email: "juan@ejemplo.com"
// };

// // 2. La petición fetch en sí misma
// fetch('http://localhost:8080/registro', {
//     method: 'POST', // Especificamos el método
//     headers: {
//         'Content-Type': 'application/json' // Decimos que enviamos JSON
//     },
//     // Acá van los datos que estamos enviando al backend
//     body: JSON.stringify(datosFormulario)

        //Con JSON.Stringify convertimos el objeto literal (objeto de Javascrirpt) a JSON como muestro a continuación:

//      // Constante datosFormulario (Objeto de JS) antes de convertirla a JSON:
//      // const datosFormulario = {
//      //     nombre: "Juan Perez",
//      //     email: "juan@ejemplo.com"
//      // };

//      // Constante datosFormulario después de convertirla a JSON:
//      // '{"nombre":"Juan Perez","email":"juan@ejemplo.com"}'

        // Esta conversión debe realizarse porque HTTP, el protocolo que se está utilizando en la comunicación
        // entre frontend y backend, solo permite transportar strings.
        // 
// })
// ... resto del codigo





// CODIGO QUE MUESTRA EN LA TERMINAL EL OBJETO REQ
// app.get("/test", (req, res) => {
//     console.log("===================")
//     console.log(req, {depth: 1})
//     res.send("Prueba objeto req")
// })


app.listen(8080, ()=>{
    console.log("Servidor corriendo en 8080")
})
