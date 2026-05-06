
// Importamos mongoose, que es una librería que permite conectar Node.js con MongoDB
import mongoose from 'mongoose'

// Exportamos una función para conectar a la base de datos
export const connectDB = async () => {

  // Usamos try/catch porque la conexión puede fallar (problema de red, DB apagada, URI incorrecta, etc.)
  try {

    // mongoose.connect establece la conexión con la base de datos
    // process.env.MONGO_URI contiene la URL definida en el archivo .env
    await mongoose.connect(process.env.MONGO_URI)

    // Si todo funciona correctamente, mostramos un mensaje en consola
    console.log('MongoDB conectado correctamente')

  } catch (error) {

    // Si ocurre un error, lo mostramos en consola
    console.error('Error al conectar MongoDB:', error)

  }
}