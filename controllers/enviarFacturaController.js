const enviarFacturaService = require('../services/enviarFacturaService');

// Controlador para enviar la factura
const enviarFactura = (req, res) => {
  // Lógica para convertir el JSON a XML
  // ...
  // Llamada al servicio enviarFacturaService
  enviarFacturaService.enviarFactura(xmlData)
    .then(result => {
      res.status(200).json({ success: true });
    })
    .catch(error => {
      res.status(500).json({ error: 'Error al enviar la factura' });
    });
};

module.exports = {
  enviarFactura,
};
