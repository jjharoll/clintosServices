// Servicio para enviar el correo
const enviarCorreo = () => {
    return new Promise((resolve, reject) => {
      // Lógica para enviar el correo
      // Supongamos que el envío es exitoso
      const resultado = true;
      if (resultado) {
        resolve({ success: true });
      } else {
        reject('Error al enviar el correo');
      }
    });
  };
  
  module.exports = {
    enviarCorreo,
  };
  