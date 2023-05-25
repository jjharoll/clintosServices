const axios = require('axios');
const obtenerEstadoFactura = async (xmlData) => {
  try {
    const endpoint = 'http://demoemision21.thefactoryhka.com.co/ws/v1.0/Service.svc';

    const config = {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/IService/FoliosRestantes'
      },
    };

    const response = await axios.post(endpoint, xmlData, config);

    // Procesar la respuesta
    console.log(response.data);
    const respuesta = response.data;
    return respuesta;
  } catch (error) {
    // Manejar el error
    console.error('Ha ocurrido un error:', error.message);
    throw new Error('Ha ocurrido un error');
  }
};

module.exports = obtenerEstadoFactura;
