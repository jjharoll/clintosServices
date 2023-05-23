// app.js
const express = require('express');
require('dotenv').config();
const enviarFacturaRoutes = require('./routes/enviarFacturaRoutes');
const adjuntoRoutes = require('./routes/adjuntoRoutes');
const estadoFacturaRoutes = require('./routes/estadoFacturaRoutes');
const enviarCorreoRoutes = require('./routes/enviarCorreoRoutes');

const app = express();

// Configurar middlewares y otros ajustes de la aplicación
// Middleware de análisis de cuerpo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Usar las rutas correspondientes
app.use('/api/enviarFactura', enviarFacturaRoutes);
app.use('/api/adjunto', adjuntoRoutes);
app.use('/api/estadoFactura', estadoFacturaRoutes);
app.use('/api/enviarCorreo', enviarCorreoRoutes);

// Otros ajustes y configuraciones de la aplicación

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor en ejecución en el puerto 3000');
});
