import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import User from '../models/user.model.js';

const app = express();

// Middleware que permite leer JSON desde req.body
app.use(express.json());

// Variables de entorno
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGODB_URI;

// Conexión a MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error de conexión:', err));

/*
========================================
CONFIGURACIÓN DE SESSION (CLAVE)
========================================
*/

app.use(session({
  secret: 'clave_secreta',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI
  })
}));





























/*
Esto hace lo siguiente en cada request:

1. Lee el identificador de sesión desde req.headers (cookie automática)
2. Busca la sesión en MongoDB
3. Si existe, la carga en req.session

Ejemplo de cómo queda req:
*/
req = {
  "method": "POST",
  "url": "/api/usuarios/123",
  "path": "/api/usuarios/123",
  "headers": {
    "user-agent": "PostmanRuntime/7.29.2",
    "authorization": "Bearer eyJhbGciOiJIUzI1NiIsIn...",
    "content-type": "application/json",
    "content-length": "127"
  },
  "params": {
    "id": "123"
  },
  "query": {
    "rol": "admin",
    "activo": "true"
  },
  "body": {
    "name": "Ana Gómez",
    "email": "ana@ejemplo.com",
  },
  "ip": "::1"
}

//Ejemplos utilizados en clase hablando de datos dentro del objeto req
// req.body = {"name": "Ana Gómez","email": "ana@ejemplo.com",}
// req.body.name = "Ana Gómez"

app.use((req, res, next) => {
  console.log("SESSION ACTUAL:", req.session);
  next();
});


/*
========================================
REGISTRO DE USUARIO
========================================
*/

app.post('/register', DataValid() ,async (req, res) => {

  const { email, password } = req.body;


  if(!email || !password){
    res.send("Datos incompletos")
  }


  const user = await User.create({
    email,
    password, // (acá todavia no la hasheamos)
    role: "user"
  });

  /*
  req.body contiene:
  {
    email: "...",
    password: "..."
  }
  */

  res.send('Usuario registrado');
  
});

/*
========================================
LOGIN CON SESSION
========================================
*/

app.post('/login', async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.password !== password) {
    return res.send('Credenciales incorrectas');
  }

  /*
  ACÁ ES DONDE SE CREA EL ESTADO
  */

  req.session.user = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  /*
  req queda así:

  req.session = {
    user: {
      id: "...",
      email: "...",
      role: "user"
    }
  }
  */

  res.send('Login exitoso');
});

/*
========================================
RUTA PROTEGIDA (USO REAL)
========================================
*/

app.get('/perfil', (req, res) => {

  if (!req.session.user) {
    return res.status(401).send('No autenticado');
  }

  res.json(req.session.user);
});

/*
========================================
LOGOUT
========================================
*/

app.post('/logout', (req, res) => {

  req.session.destroy(() => {
    res.send('Sesión cerrada');
  });

});

/*
========================================
SERVIDOR
========================================
*/

app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
});