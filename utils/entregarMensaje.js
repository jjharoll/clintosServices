const amqp = require('amqplib');

async function sendMessage() {
  let connection; // Declarar la variable connection

  try {
    // Conectarse al servidor RabbitMQ
    connection = await amqp.connect('amqps://jharolperez:2456963Eithan*@b-14df11f4-84b4-4c45-80d0-93af86e77869.mq.us-east-2.amazonaws.com');
    const channel = await connection.createChannel();

    // Crear la cola si no existe
    const queue = 'envioFactura';
    await channel.assertQueue(queue);

    // Enviar mensajes a la cola
    const message = 'FCFE239';


    channel.sendToQueue(queue, Buffer.from(message));

    console.log('Mensaje enviado a la cola.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Cerrar la conexión
    if (connection) { // Verificar si la conexión está definida
      setTimeout(() => {
        connection.close();
        process.exit(0);
      }, 500);
    }
  }
}

// Llamar a la función para enviar el mensaje
sendMessage();
