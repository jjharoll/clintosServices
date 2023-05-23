// estadoFacturaRoutes.js
const express = require('express');
const estadoFacturaController = require('../controllers/estadoFacturaController');

const router = express.Router();

// Ruta para obtener el estado de factura
router.post('/estadoFactura', estadoFacturaController.obtenerEstadoFactura);

module.exports = router;
