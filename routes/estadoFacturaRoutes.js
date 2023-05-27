const express = require('express');
const router = express.Router();
const estadoFacturaController = require('../controllers/estadoFacturaController');

router.post('/', async (req, res) => {
  try {
    const { tokenEmpresa, tokenPassword, numeroDocumento } = req.body;
    const usuarioConsumidor = req.usuarioConsumidor;

    const respuesta = await estadoFacturaController.consumirEndpointSOAP(tokenEmpresa, tokenPassword, numeroDocumento, usuarioConsumidor);

    res.status(200).json(respuesta);
  } catch (error) {
    console.error('Ha ocurrido un error:', error.message);
    res.status(500).json({ error: 'Ha ocurrido un error' });
  }
});

module.exports = router;
