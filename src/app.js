const express = require('express')
const morgan = require('morgan')
// const admin = require("firebase-admin");
const { auth, db } = require('./firebase')
const app = express()
const cors = require('cors')

const whitelist = [
  'http://localhost:3001',
  'http://localhost:3000',
  'https://attendance-system-blond.vercel.app',
  'https://api-ugel-production.up.railway.app',
  'https://eva-rouge-zeta.vercel.app',
  'https://api-ugel.railway.app'
]

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    
    if (whitelist.includes(origin)) {
      return callback(null, true)
    }

    if (origin.includes('railway.app')) {
      return callback(null, true)
    }

    callback(new Error('No permitido por CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}

app.use((req, res, next) => {
  console.log('Origin:', req.headers.origin)
  console.log('Method:', req.method)
  next()
})

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors(corsOptions))


app.get('/', async (req, res) => {

  const referencia = db.collection('usuarios')

  const snapshot = await referencia.get();
  const arrayDocumentos = []
  snapshot.forEach(doc => {
    // console.log(doc.id, '=>', doc.data());
    arrayDocumentos.push({ ...doc.data(), id: doc.id })
  });
  console.log('arrayDocumentos', arrayDocumentos)
  res.send('holiwis')
})

app.post('/crear-director', async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://eva-rouge-zeta.vercel.app')
  // res.header('Access-Control-Allow-Origin', 'http://localhost:3000')

  const usuarioRef = db.collection('usuarios').doc(`${req.body.dni}`);
  await usuarioRef.get()
    .then(async doc => {
      if (doc.exists === false) {
        console.log('entroa a no existe')
        const rta = await auth.createUser({
          uid: req.body.dni,
          email: req.body.email,
          password: req.body.password,
          emailVerified: false,
          disabled: false
        })
        res.json({ ...rta, estado: true, warning: 'usuario creado con éxito', exists: false })
      } else if (doc.exists === true) {
        console.log('entroa a si existe')
        res.json({ warning: 'usuario ya existe', estado: true, exists: true })
      }
    })


  // const rta = await auth.createUser({
  //   uid: req.body.dni,
  //   email: req.body.email,
  //   password: req.body.password,
  //   emailVerified: false,
  //   disabled: false
  // })
  // res.json({ ...rta, estado: true })

})

app.post('/crear-docente', async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://eva-rouge-zeta.vercel.app')
  // res.header('Access-Control-Allow-Origin', 'http://localhost:3000')

  const usuarioRef = db.collection('usuarios').doc(`${req.body.dni}`);
  await usuarioRef.get()
    .then(async doc => {
      if (!doc.exists) {
        const rta = await auth.createUser({
          uid: req.body.dni,
          email: req.body.email,
          password: req.body.password,
          emailVerified: false,
          disabled: false
        })
        res.json({ ...rta, estado: true, warning: 'usuario creado con éxito', exists: false })
      } else if (doc.exists) {
        res.json({ warning: 'usuario ya existe', estado: true, exists: true })
      }
    })

})
app.post('/borrar-usuario', async (req, res) => {
  const usuarioRef = db.collection('usuarios').doc(`${req.body.dni}`)

  await usuarioRef.get()
    .then(async doc => {
      if (!doc.exists) {
        res.json({ warning: 'usuario no existe', estado: true, delete: false })
      } else if (doc.exists) {
        await db.collection('usuarios').doc(`${req.body.dni}`).delete()
          .then(rta => {
            console.log('res', rta)
            auth.deleteUser(`${req.body.dni}`)
              .then(() => {
                console.log('Successfully deleted user')
                res.json({ warning: 'se ha eliminado usuario con exito', estado: true, delete: true })
              })
              .catch((error) => {
                console.log('Error deleting user:', error)
                res.status(500).json({ error: 'Error al eliminar usuario' })
              })
          })
      }
    })
    .catch(error => {
      console.error('Error:', error)
      res.status(500).json({ error: 'Error en el proceso de eliminación' })
    })
})
module.exports = app