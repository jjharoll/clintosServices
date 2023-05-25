const express = require('express');
const router = express.Router();
const enviarCorreoController = require('../controllers/enviarCorreoController');

// Ruta para enviar el correo
router.post('/', enviarCorreoController.enviarCorreo);

module.exports = router;
