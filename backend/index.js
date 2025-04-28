const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mercadopagoRoutes = require("./mercadopago.js");
const mercadopagoPoint = require("./mercadopagoPoint.js");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Usar la ruta del backend de Mercado Pago
app.use("/mercadopago", mercadopagoRoutes);
app.use("/mercadopagoPoint", mercadopagoPoint);

app.use((err, req, res, next) => {
  console.error(err); // Log del error
  res.status(500).json({ error: 'Algo salió mal, por favor intenta más tarde.' });
});

// Levantar el servidor en el puerto 3001
app.listen(3001, () => {
  console.log("Servidor backend corriendo en http://localhost:3001");
});