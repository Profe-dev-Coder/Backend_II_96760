import mongoose from 'mongoose';

/*
Un Schema en Mongoose define la estructura de los documentos
que se guardarán en MongoDB.
Es decir, define qué campos tiene un usuario y qué tipo de datos son.
*/

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
    /*
    required: obliga a que el campo exista
    unique: evita duplicados en la base de datos
    */
  },
  password: {
    type: String,
    required: true
    /*
    Este campo luego debería almacenar el hash de la contraseña
    (no texto plano)
    */
  },
  role: {
    type: String,
    default: 'user'
    //['user', 'admin']
    /*
    Define el rol del usuario para autorización futura
    */
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/*
El modelo es la interfaz que usamos para interactuar con la colección.
MongoDB creará automáticamente la colección "users".
*/

const User = mongoose.model('User', userSchema);

export default User;