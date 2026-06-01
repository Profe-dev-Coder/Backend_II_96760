// ===============================
// IMPORTACIONES
// ===============================

import express from 'express'
import { connectDB } from './config/db.js'
import { User } from './models/user.model.js'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import './config/passport.js'

import errorHandler from './middlewares/errorHandler.js'
import createError from './utils/createError.js'

// ===============================
// CONFIGURACIÓN INICIAL
// ===============================

const app = express()

// Middleware que permite leer JSON desde el body
// Sin esto, req.body sería undefined
app.use(express.json())
app.use(passport.initialize())

/*
CONCEPTO CLAVE:

HTTP no recuerda al usuario entre requests (stateless)

Solución:
- Login → genera token
- Cliente envía token en cada request
- Backend valida token y reconstruye "identidad"
*/


// ===============================
// RUTA BASE
// ===============================

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente')
})


// ===============================
// REGISTRO
// ===============================

app.post('/register', async (req, res, next) => {

  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      // return res.status(400).json({ error: 'Faltan datos' })
      return next(createError('Faltan datos', 400))
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({ error: 'Usuario ya existe' })
    }

    const user = new User({
      name,
      email,
      password,
      role // opcional (por defecto será "user")
    })

    // Al guardar → se ejecuta pre('save') → hash password
    await user.save()

    res.status(201).json({ message: 'Usuario registrado correctamente' })

  } catch (error) {
    res.status(500).json({ error: 'Error en registro' })
  }
})

//////////////////////////////////////////////////////////
/////////CONTINUAR TEMA ROUTERS///////////////////////////
//////////////////////////////////////////////////////////


// ===============================
// LOGIN
// ===============================

app.post('/login', async (req, res) => {

  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas' })
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales inválidas' })
    }

    /*
    Generamos token JWT

    payload:
    - id del usuario
    - role (IMPORTANTE para autorización)

    Este token será enviado por el cliente en cada request
    */

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.json({ token })

  } catch (error) {
    res.status(500).json({ error: 'Error en login' })
  }
})


// ===============================
// LOGIN CON GITHUB
// ===============================

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

app.get('/auth/github/callback', passport.authenticate('github', {failureRedirect: '/login', session:false}), (req, res) => {
  
  // Generar token JWT para el usuario
  const token = jwt.sign(
    {
      id: req.user._id,
      role: req.user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  res.json({ token })

});


// ===============================
// MIDDLEWARE DE AUTENTICACIÓN
// ===============================

const authMiddleware = (req, res, next) => {

  /*
  Este middleware:
  - Lee el token desde headers
  - Lo valida
  - Agrega datos al objeto req
  */

  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  // Formato esperado: "Bearer TOKEN"
  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    /*
    Modificamos req:
    agregamos información del usuario

    Esto permite que las rutas siguientes accedan a req.user
    */
    req.user = decoded

    next()

  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}


// ===============================
// MIDDLEWARE DE AUTORIZACIÓN (RBAC)
// ===============================

const roleMiddleware = (rolesPermitidos) => {

  /*
  Este middleware implementa autorización basada en roles.

  rolesPermitidos: array → ['admin'] o ['admin', 'user']

  Flujo:
  - Lee req.user (cargado por authMiddleware)
  - Verifica si el rol está permitido
  */

  return (req, res, next) => {

    // Si no existe req.user → error de lógica (faltó authMiddleware)
    if (!req.user) {
      return res.status(500).json({ error: 'Error interno: falta autenticación previa' })
    }

    const { role } = req.user

    if (!rolesPermitidos.includes(role)) {
      return res.status(403).json({ error: 'Acceso denegado: rol insuficiente' })
    }

    next()
  }
}


// ===============================
// RUTAS PROTEGIDAS
// ===============================

// Solo usuarios autenticados
app.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {

  res.json({
    message: 'Acceso permitido',
    user: req.user
  })
})


// Solo ADMIN
app.get('/admin', authMiddleware, roleMiddleware(['admin']), (req, res) => {

  res.json({
    message: 'Bienvenido administrador',
    user: req.user
  })
})


// USER o ADMIN
app.get('/dashboard', authMiddleware, roleMiddleware(['user', 'admin']), (req, res) => {

  res.json({
    message: 'Acceso a dashboard',
    user: req.user
  })
})


// ===============================
// LOGOUT
// ===============================

app.post('/logout', (req, res) => {

  /*
  JWT no se almacena en servidor.

  Logout real:
  el cliente elimina el token.

  Backend solo responde confirmación.
  */

  res.json({ message: 'Logout exitoso (cliente debe eliminar token)' })
})


// ===============================
// SERVIDOR
// ===============================

const PORT = process.env.PORT || 8080

connectDB()

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})


