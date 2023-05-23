const nodemailer = require('nodemailer');

// Configuración del servicio de correo electrónico
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jharol.perezoz@amigo.edu.co',
    pass: '2456963Eithan*'
  }
});

// Función para enviar un correo electrónico
async function enviarCorreo(destinatario, asunto, contenido) {
  try {
    // Definir el contenido del correo electrónico
    const mailOptions = {
      from: 'jharol.perezoz@amigo.edu.co',
      to: destinatario,
      subject: asunto,
      html: contenido
    };

    // Enviar el correo electrónico
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo electrónico enviado:', info.response);
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
  }
}

module.exports = enviarCorreo;
