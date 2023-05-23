const estadoFacturaService = require('../services/estadoFacturaService');

// Controlador para obtener el estado de la factura
const obtenerEstadoFactura = (req, res) => {
  const facturaId = req.params.facturaId;

  estadoFacturaService.obtenerEstadoFactura(facturaId)
    .then(estado => {
      res.status(200).json({ estado });
    })
    .catch(error => {
      res.status(500).json({ error: 'Error al obtener el estado de la factura' });
    });
};

module.exports = {
  obtenerEstadoFactura,
};
