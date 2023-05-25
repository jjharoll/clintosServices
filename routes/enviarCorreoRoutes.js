const express = require('express');
const router = express.Router();
const { consumirEndpointSOAP } = require('../controllers/enviarCorreoController'); // Importa la función consumirEndpointSOAP desde el módulo

// Ruta para consumir el endpoint SOAP
router.post('/', async (req, res) => {
  try {
    const { tokenEmpresa, tokenPassword, numeroDocumento, correo, adjuntos } = req.body;

    // Consumir el endpoint SOAP y obtener la respuesta
    const respuesta = await consumirEndpointSOAP(tokenEmpresa, tokenPassword, numeroDocumento, correo, adjuntos);

    // Responder con la respuesta obtenida
    res.send(respuesta);
  } catch (error) {
    // Manejo de errores
    console.error('Error en la solicitud:', error);
    res.status(500).json({ error: 'Ha ocurrido un error en el servidor' });
  }
});

module.exports = router;
