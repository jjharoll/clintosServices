// router.js
const express = require('express');
const router = express.Router();
const { enviarFactura } = require('../controllers/enviarFacturaController'); // Importa la función enviarFactura desde el controlador

// Ruta para enviar la factura
router.post('/', async (req, res) => {
  try {
    const xml = req;
    const usuarioConsumidor = req.usuarioConsumidor;
    // Llamar a la función enviarFactura y obtener la respuesta
    const respuesta = await enviarFactura(xml,usuarioConsumidor);

    // Responder con la respuesta obtenida
    res.send(respuesta);
  } catch (error) {
    // Manejo de errores
    console.error('Error en la solicitud:', error);
    res.status(500).json({ error: 'Ha ocurrido un error en el servidor' });
  }
});

module.exports = router;
