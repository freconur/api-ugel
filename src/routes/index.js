// const { Router } = require('express');
// const {app} = require('../app')
// const admin = require("firebase-admin");


// const router = Router()
// router.get('/', async (req, res) => {

//   const referencia = admin.firestore().collection('usuarios')

//   const snapshot = await referencia.get();
//   const arrayDocumentos = []
//   snapshot.forEach(doc => {
//     // console.log(doc.id, '=>', doc.data());
//     arrayDocumentos.push({ ...doc.data(), id: doc.id })
//   });
//   console.log('arrayDocumentos', arrayDocumentos)
//   res.send('holiwis')
// })

// module.exports = router