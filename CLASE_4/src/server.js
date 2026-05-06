// ===============================
// IMPORTACIONES
// ===============================

import express from 'express'
import { connectDB } from './config/db.js'
import { User } from './models/user.model.js'
import jwt from 'jsonwebtoken'

// ===============================
// CONFIGURACIÓN INICIAL
// ===============================

const app = express()

// Middleware para leer JSON desde el body de la request
// Modifica req agregando la propiedad req.body
app.use(express.json())


// ===============================
// RUTA BASE
// ===============================

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente')
})


// ===============================
// REGISTRO
// ===============================

app.post('/register', async (req, res) => {

  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Faltan datos' })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({ error: 'Usuario ya existe' })
    }

    const user = new User({
      name,
      email,
      password,
      role
    })

    await user.save()

    res.status(201).json({ message: 'Usuario registrado correctamente' })

  } catch (error) {
    res.status(500).json({ error: 'Error en registro' })
  }
})


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
// MIDDLEWARE DE AUTENTICACIÓN
// ===============================

const authMiddleware = (req, res, next) => {

  // Leemos el header Authorization desde req.headers
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  // Formato esperado: "Bearer TOKEN"
  const token = authHeader.split(' ')[1]

  try {

    // Validamos token con JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Modificamos req agregando información del usuario
    req.user = decoded

    next()

  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}


// ===============================
// RUTA PROTEGIDA (AUTENTICACIÓN)
// ===============================

app.get('/profile', authMiddleware, (req, res) => {

  // req.user fue agregado por el middleware
  res.json({
    message: 'Acceso permitido',
    user: req.user
  })
})


// ===============================
// 🔴 AUTORIZACIÓN (RBAC) → A IMPLEMENTAR EN VIVO
// ===============================

/*
Crear middleware de autorización basado en roles

Concepto:
- authMiddleware responde: ¿quién sos?
- roleMiddleware responde: ¿qué podés hacer?

Debe ser una función que reciba:
rolesPermitidos (array)

Ejemplo:
['admin']
['user', 'admin']

--------------------------------------------------
IMPLEMENTAR:

const roleMiddleware = (rolesPermitidos) => {

  // Retorna una función middleware
  return (req, res, next) => {

    1) Verificar que req.user exista
       (esto significa que authMiddleware ya corrió)

    if (!req.user) {
      return res.status(500).json({ error: 'Falta autenticación previa' })
    }

    2) Obtener rol desde req.user

    const { role } = req.user

    3) Verificar si el rol está dentro de rolesPermitidos

    if (!rolesPermitidos.includes(role)) {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    4) Si pasa validación → next()

  }
}

--------------------------------------------------
EXPLICAR:

- req.user viene del middleware anterior
- includes() verifica si el rol está permitido
- status 403 = autenticado pero sin permisos
*/


// ===============================
// 🔴 RUTAS CON AUTORIZACIÓN
// ===============================

/*
IMPLEMENTAR:

Ruta solo ADMIN

app.get('/admin',
  authMiddleware,
  roleMiddleware(['admin']),
  (req, res) => {
    res.json({ message: 'Zona admin', user: req.user })
  }
)

--------------------------------------------------

Ruta USER o ADMIN

app.get('/dashboard',
  authMiddleware,
  roleMiddleware(['user', 'admin']),
  (req, res) => {
    res.json({ message: 'Dashboard', user: req.user })
  }
)

--------------------------------------------------

EXPLICAR:

Orden de ejecución:
1) authMiddleware → construye req.user
2) roleMiddleware → valida permisos
3) handler final → responde
*/


// ===============================
// LOGOUT
// ===============================

app.post('/logout', (req, res) => {

  res.json({ message: 'Logout (cliente elimina token)' })
})


// ===============================
// SERVIDOR
// ===============================

const PORT = process.env.PORT || 8080

connectDB()

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})