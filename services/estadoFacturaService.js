// estadoFacturaService.js
const axios = require('axios');

const obtenerEstadoFactura = (xmlData) => {
  return axios.post('http://demoemision21v4.thefactoryhka.com.co/ws/v1.0/Service.svc?wsdl', xmlData, {
    headers: {
      'Content-Type': 'text/xml',
    },
  })
    .then(response => {
      // Procesar la respuesta
      return response.data;
    })
    .catch(error => {
      // Manejar el error
      throw error;
    });
};

module.exports = obtenerEstadoFactura;
