const enviarCorreoService = require('../services/enviarCorreoService');

// Controlador para enviar el correo
const enviarCorreo = (req, res) => {
  enviarCorreoService.enviarCorreo()
    .then(result => {
      res.status(200).json({ success: true });
    })
    .catch(error => {
      res.status(500).json({ error: 'Error al enviar el correo' });
    });
};

module.exports = {
  enviarCorreo,
};
