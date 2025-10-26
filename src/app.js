const express = require("express");
const morgan = require("morgan");
// const admin = require("firebase-admin");
const { auth, db } = require("./firebase");
const app = express();
const cors = require("cors");

const whitelist = [
  "http://localhost:3001",
  "http://localhost:3000",
  "https://attendance-system-blond.vercel.app, https://api-ugel-production.up.railway.app",
];
const options = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("no permitido"));
    }
  },
};
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: 'https://eva-rouge-zeta.vercel.app', // o http://localhost:3000 en desarrollo
    /* origin: "http://localhost:3000", // o http://localhost:3000 en desarrollo */
    credentials: true,
  })
);

app.get("/", async (req, res) => {
  /* const referencia = db.collection("usuarios"); */

  /* const snapshot = await referencia.get();
  const arrayDocumentos = [];
  snapshot.forEach((doc) => {
    // console.log(doc.id, '=>', doc.data());
    arrayDocumentos.push({ ...doc.data(), id: doc.id });
  }); */
  /* console.log('arrayDocumentos', arrayDocumentos) */
  res.send("holiwis");
});

app.post("/crear-especialista-regional", async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://eva-rouge-zeta.vercel.app')
  /* res.header("Access-Control-Allow-Origin", "http://localhost:3000"); */

  try {
    const userRecord = await auth.getUser(req.body.dni);
    console.log("req.body", req.body);
    console.log("✅ Usuario ya existe con UID:", userRecord.uid);
    
    // Usuario existe - retornar respuesta para el frontend
    res.json({
      warning: "usuario ya existe",
      estado: true,
      exists: true,
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName
    });
    
  } catch (error) {
    // 2. MANEJAR ERROR: Si el usuario NO existe, el error.code será 'auth/user-not-found'
    if (error.code === 'auth/user-not-found') {
      
      console.log(`❌ Usuario con UID "${req.body.dni}" NO encontrado. Procediendo a crear...`);
      
      try {
        // 3. CREAR USUARIO: Si no existe, usa auth.createUser() para crearlo.
        const newUserRecord = await auth.createUser({
          uid: `${req.body.dni}`,
          email: `${req.body.dni}@competencelab.com`,
          password: req.body.dni, // Solo si estás creando con contraseña
          displayName: `${req.body.nombres} ${req.body.apellidos}` || 'Nuevo Usuario'
        });
        
        console.log(`✨ Usuario creado exitosamente con UID: ${newUserRecord.uid}`);
        
        // Solo ejecutar setDoc después de que el usuario se haya creado exitosamente
        await db.collection('usuarios').doc(`${req.body.dni}`).set(req.body);
        console.log(`📄 Documento guardado en Firestore para usuario: ${req.body.dni}`);
        
        // Retornar respuesta de éxito para el frontend
        res.json({
          warning: "usuario creado con éxito",
          estado: true,
          exists: false,
          uid: newUserRecord.uid,
          email: newUserRecord.email,
          displayName: newUserRecord.displayName
        });
        
      } catch (creationError) {
        // Manejar errores si la creación falla por otra razón (ej. email ya en uso)
        console.error('⚠️ Error al crear el usuario:', creationError.message);
        res.status(500).json({
          warning: "Error al crear el usuario",
          estado: false,
          error: creationError.message
        });
      }
      
    } else {
      // Manejar otros errores de la búsqueda inicial (ej. problemas de red o permisos)
      console.error('⚠️ Error inesperado durante la verificación:', error.message);
      res.status(500).json({
        warning: "Error inesperado durante la verificación",
        estado: false,
        error: error.message
      });
    }
  }
});

app.post("/crear-director", async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://eva-rouge-zeta.vercel.app')
  /* res.header("Access-Control-Allow-Origin", "http://localhost:3000"); */

  const usuarioRef = db.collection("usuarios").doc(`${req.body.dni}`);
  await usuarioRef.get().then(async (doc) => {
    if (doc.exists === false) {
      console.log("entroa a no existe");
      const rta = await auth.createUser({
        uid: req.body.dni,
        email: req.body.email,
        password: req.body.password,
        emailVerified: false,
        disabled: false,
      });
      res.json({
        ...rta,
        estado: true,
        warning: "usuario creado con éxito",
        exists: false,
      });
    } else if (doc.exists === true) {
      console.log("entroa a si existe");
      res.json({ warning: "usuario ya existe", estado: true, exists: true });
    }
  });

  // const rta = await auth.createUser({
  //   uid: req.body.dni,
  //   email: req.body.email,
  //   password: req.body.password,
  //   emailVerified: false,
  //   disabled: false
  // })
  // res.json({ ...rta, estado: true })
});

app.post("/crear-docente", async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://eva-rouge-zeta.vercel.app')

  /* res.header('Access-Control-Allow-Origin', 'http://localhost:3000') */

  const usuarioRef = db.collection("usuarios").doc(`${req.body.dni}`);
  await usuarioRef.get().then(async (doc) => {
    if (!doc.exists) {
      const rta = await auth.createUser({
        uid: req.body.dni,
        email: req.body.email,
        password: req.body.password,
        emailVerified: false,
        disabled: false,
      });
      res.json({
        ...rta,
        estado: true,
        warning: "usuario creado con éxito",
        exists: false,
      });
    } else if (doc.exists) {
      res.json({ warning: "usuario ya existe", estado: true, exists: true });
    }
  });
});
app.post("/borrar-usuario", async (req, res) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://eva-rouge-zeta.vercel.app"
  );
  /* res.header('Access-Control-Allow-Origin', 'http://localhost:3000') */
  const usuarioRef = db.collection("usuarios").doc(`${req.body.dni}`);

  await usuarioRef.get().then(async (doc) => {
    if (!doc.exists) {
      res.json({ warning: "usuario no existe", estado: true, delete: false });
    } else if (doc.exists) {
      await db
        .collection("usuarios")
        .doc(`${req.body.dni}`)
        .delete()
        .then((rta) => {
          console.log("res", rta);
          auth
            .deleteUser(`${req.body.dni}`)
            .then(() => {
              console.log("Successfully deleted user");
              res.json({
                warning: "se ha eliminado usuario con exito",
                estado: true,
                delete: true,
              });
            })
            .catch((error) => {
              console.log("Error deleting user:", error);
            });
        });
    }
  });
});
module.exports = app;
