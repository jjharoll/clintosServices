const express = require('express');
const router = express.Router();
const estadoFacturaController = require('../controllers/estadoFacturaController');

router.post('/', async (req, res) => {
  try {
    console.log(req.body);
    const { tokenEmpresa } = req.body;
    const { tokenPassword } = req.body;
    const { numeroDocumento } = req.body;

    const respuesta = await estadoFacturaController.consumirEndpointSOAP(tokenEmpresa,tokenPassword,numeroDocumento);

    res.status(200).json(respuesta);
  } catch (error) {
    console.error('Ha ocurrido un error:', error.message);
    res.status(500).json({ error: 'Ha ocurrido un error' });
  }
});

module.exports = router;
