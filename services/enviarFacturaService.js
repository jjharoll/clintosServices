// Servicio para enviar la factura
const enviarFactura = (xmlData) => {
    return new Promise((resolve, reject) => {
      // Lógica para consumir el servicio de facturación
      // ...
      // Supongamos que el resultado es exitoso
      const resultado = true;
      if (resultado) {
        // Continuar con el flujo
        adjuntoService.radicarAdjunto(xmlData)
          .then(adjuntoResult => {
            // Verificar si el adjunto se radicó correctamente
            if (adjuntoResult.success) {
              // Enviar correo
              enviarCorreoService.enviarCorreo()
                .then(correoResult => {
                  resolve(correoResult);
                })
                .catch(error => {
                  reject(error);
                });
            } else {
              reject('Error al radicar el adjunto');
            }
          })
          .catch(error => {
            reject(error);
          });
      } else {
        reject('Error al enviar la factura');
      }
    });
  };
  
  module.exports = {
    enviarFactura,
  };
  