const express = require('express')
const morgan = require('morgan')
// const admin = require("firebase-admin");
const { auth, db } = require('./firebase')
const app = express()
const cors = require('cors')

const whitelist = ['http://localhost:3001', 'http://localhost:3000', 'https://attendance-system-blond.vercel.app, https://api-ugel-production.up.railway.app']
const options = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('no permitido'));
    }
  }
}
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors(whitelist))


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
  res.header('Access-Control-Allow-Origin', 'https://eva-rouge-zeta.vercel.app' )
  const rta = await auth.createUser({
    uid: req.body.dni,
    email: req.body.email,
    password: req.body.password,
    emailVerified: false,
    disabled: false
  })
  res.json({ ...rta, estado: true })

})

app.post('/crear-docente', async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://eva-rouge-zeta.vercel.app' )
  const rta = await auth.createUser({
    uid: req.body.dni,
    email: req.body.email,
    password: req.body.password,
    emailVerified: false,
    disabled: false
  })
  res.json({ ...rta, estado: true })

})
module.exports = app