const axios = require('axios');

// URL del endpoint
const endpointURL = 'http://demoemision21.thefactoryhka.com.co/ws/adjuntos/Service.svc?wsdl';

// Servicio para radicar el adjunto
const radicarAdjunto = (xmlData) => {
  return new Promise((resolve, reject) => {
    // Realizar la solicitud HTTP al endpoint con el XML como payload
    axios.post(endpointURL, xmlData, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
    .then(response => {
      //respuesta exitosa del endpoint
      resolve({ success: true });
    })
    .catch(error => {
      // Manejar cualquier error de la solicitud
      reject(error);
    });
  });
};

module.exports = {
  radicarAdjunto,
};
