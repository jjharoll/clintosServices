const express = require('express');
const router = express.Router();
const enviarFacturaController = require('../controllers/enviarFacturaController');

// Ruta para enviar la factura
router.post('/', enviarFacturaController.enviarFactura);

module.exports = router;
