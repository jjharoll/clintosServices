const express = require('express');
const router = express.Router();
const estadoFacturaController = require('../controllers/estadoFacturaController');

// Ruta para obtener el estado de la factura
router.get('/:facturaId', estadoFacturaController.obtenerEstadoFactura);

module.exports = router;
