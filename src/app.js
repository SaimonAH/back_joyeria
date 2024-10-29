const express = require("express");
const cors = require('cors');
require("dotenv").config();
const usuarioRoutes = require('./routes/usuarioRoute');
const pedidoRoutes = require('./routes/pedidoRoute');

// CONFIGURACIÓN DE LA APLICACIÓN EXPRESS
const app = express();
const port = process.env.PORT || 4000;


// Configuración de CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: process.env.CORS_METHODS ? process.env.CORS_METHODS.split(',') : ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: process.env.CORS_HEADERS ? process.env.CORS_HEADERS.split(',') : ['Content-Type', 'Authorization'],
};

// Aplicamos el middleware CORS
app.use(cors(corsOptions));

// Middleware para parsear JSON y datos de formulario
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// RUTA PRINCIPAL
app.get('/', (req, res) => {
  res.send(`<p>API corriendo...</p>`);
});

// RUTAS
app.use('/usuarios', usuarioRoutes);
app.use('/pedidos', pedidoRoutes);

// INICIO DEL SERVIDOR
app.listen(port, () => {
  console.log(`Servidor corriendo en ${corsOptions.origin}:${port}`);
});

module.exports = app;