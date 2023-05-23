const express = require('express');
const app = express();

// Middlewares y configuración
app.use(express.json());

// Rutas
const enviarFacturaRoutes = require('./routes/enviarFacturaRoutes');
const adjuntoRoutes = require('./routes/adjuntoRoutes');
const estadoFacturaRoutes = require('./routes/estadoFacturaRoutes');
const enviarCorreoRoutes = require('./routes/enviarCorreoRoutes');

app.use('/enviarFactura', enviarFacturaRoutes);
app.use('/adjunto', adjuntoRoutes);
app.use('/estadoFactura', estadoFacturaRoutes);
app.use('/enviarCorreo', enviarCorreoRoutes);

// Inicio del servidor
app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});
