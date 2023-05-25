const express = require('express');
const router = express.Router();
const adjuntoController = require('../controllers/adjuntoController');

// Ruta para radicar el adjunto
router.post('/', adjuntoController.radicarAdjunto);

module.exports = router;
