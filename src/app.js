const express = require('express')
const morgan = require('morgan')
const admin = require("firebase-admin");
const app = express()
const cors = require('cors')
const whitelist = ['http://localhost:3001', 'http://localhost:3000', 'https://attendance-system-blond.vercel.app']
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
app.use(cors(options))


app.get('/', async (req, res) => {

  const referencia = admin.firestore().collection('usuarios')

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
  const rta = await admin.auth().createUser({
    uid: req.body.dni,
    email: req.body.email,
    password: req.body.password,
    emailVerified: false,
    disabled: false
  })
  return res.status(200).json({ ...rta, estado: true })

})
module.exports = app