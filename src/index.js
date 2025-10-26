const app = require("./app")


// app.use(cors())
// app.use(cors(options))
// app.use(express.json())
app.listen(process.env.PORT || 3001)
console.log(process.env.PORT)
console.log('servidor corriendo en el puerto 3000')