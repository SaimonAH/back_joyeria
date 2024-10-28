const express = require("express");
const multer = require('multer');
require("dotenv").config();
const usuarioRoutes = require('./routes/usuarioRoute');
const pedidoRoutes = require('./routes/pedidoRoute');

// CONFIGURACIÓN DE LA APLICACIÓN EXPRESS
const app = express();
const port = process.env.PORT || 5000;

// Middleware para parsear JSON y datos de formulario
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para manejar form-data
const upload = multer();
app.use(upload.none()); // Para datos de formulario sin archivos

// RUTA PRINCIPAL
app.get('/', (req, res) => {
  res.send(`<p>API corriendo...</p>`);
});

// RUTAS
app.use('/usuarios', usuarioRoutes);
app.use('/pedidos', pedidoRoutes);

// INICIO DEL SERVIDOR
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

module.exports = app;