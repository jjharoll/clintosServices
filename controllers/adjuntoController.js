const adjuntoService = require('../services/adjuntoService');

// Controlador para radicar el adjunto
const radicarAdjunto = (req, res) => {
  // Obtener el XML de la solicitud
  const xmlData = req.body.xmlData;

  adjuntoService.radicarAdjunto(xmlData)
    .then(result => {
      res.status(200).json({ success: true });
    })
    .catch(error => {
      res.status(500).json({ error: 'Error al radicar el adjunto' });
    });
};

module.exports = {
  radicarAdjunto,
};
