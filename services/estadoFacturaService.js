// Servicio para obtener el estado de la factura
const obtenerEstadoFactura = (facturaId) => {
    return new Promise((resolve, reject) => {
      // Lógica para obtener el estado de la factura según el ID
      // Supongamos que el estado se obtiene correctamente
      const estado = 'finalizado';
      resolve(estado);
    });
  };
  
  module.exports = {
    obtenerEstadoFactura,
  };
  