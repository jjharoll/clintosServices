const obtenerEstadoFactura = (xmlData) => {
  return axios.post('http://demoemision21.thefactoryhka.com.co/ws/v1.0/Service.svc', xmlData, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://tempuri.org/IService/EstadoDocumento'
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
