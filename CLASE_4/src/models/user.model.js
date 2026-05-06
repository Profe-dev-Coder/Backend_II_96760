import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Un Schema define la estructura de los documentos en MongoDB
const userSchema = new mongoose.Schema({

  name: { 
    type: String, 
    required: true 
  },

  email: { 
    type: String, 
    required: true, 
    unique: true 
  },

  // La contraseña NO se guarda en texto plano
  // Se almacenará hasheada (transformada irreversible)
  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    required: true
  }

}, {
  timestamps: true
})

/*
PRE HOOK DE MONGOOSE

Este código se ejecuta ANTES de guardar el documento en la base de datos.

Objetivo:
Evitar guardar contraseñas en texto plano.

¿Por qué?
Si la base de datos se filtra, las contraseñas quedarían expuestas.

Qué hace bcrypt:
- Aplica un algoritmo de hashing
- Transforma la contraseña en un string irreversible
- No se puede "deshashear", solo comparar

Flujo:
req.body.password → (texto plano)
↓
pre('save') → hash
↓
se guarda en DB

Si NO hacemos esto:
- Vulnerabilidad crítica de seguridad
*/

userSchema.pre('save', async function(next) {

  // this representa el documento actual (el usuario que se está guardando)

  // Si la contraseña no fue modificada, no la volvemos a hashear
  if (!this.isModified('password')) return next()

  // Generamos un "salt"
  // El salt agrega aleatoriedad al hash
  const salt = await bcrypt.genSalt(10)

  // Hasheamos la contraseña
  this.password = await bcrypt.hash(this.password, salt)

  next()
})

/*
Método para comparar contraseñas en login

No se compara texto plano vs texto plano
Se compara:
password ingresada → hash → comparación con hash guardado
*/

userSchema.methods.comparePassword = async function(passwordIngresada) {
  return bcrypt.compare(passwordIngresada, this.password)
}

export const User = mongoose.model('User', userSchema)
