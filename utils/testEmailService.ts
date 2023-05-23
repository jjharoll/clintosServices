const enviarCorreo = require('./emailService');

async function enviarCorreoPrueba() {
    const destinatario = 'destinatario@example.com';
    const asunto = 'Prueba de envío de correo';
    const contenido = '<h1>Esto es un correo de prueba</h1><p>Hola, esto es una prueba de envío de correo utilizando node js.</p>';
  
    await enviarCorreo(destinatario, asunto, contenido);
  }
  
  enviarCorreoPrueba();
  