const express = require('express');
const router = express.Router();
const { consumirEndpointSOAP } = require('../controllers/folioRestanteController'); // Importa la función consumirEndpointSOAP desde el módulo

// Ruta para consumir el endpoint SOAP
router.post('/', async (req, res) => {
  try {
    const { tokenEmpresa, tokenPassword} = req.body;
    const usuarioConsumidor = req.usuarioConsumidor;
    // Consumir el endpoint SOAP y obtener la respuesta
    const respuesta = await consumirEndpointSOAP(tokenEmpresa, tokenPassword, usuarioConsumidor);

    // Responder con la respuesta obtenida
    res.send(respuesta);
  } catch (error) {
    // Manejo de errores
    console.error('Error en la solicitud:', error);
    res.status(500).json({ error: 'Ha ocurrido un error en el servidor' });
  }
});

module.exports = router;
