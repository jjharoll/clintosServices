const amqp = require('amqplib');

async function connectAndSubscribe() {
  try {
    // Conectarse al servidor RabbitMQ
    const connection = await amqp.connect('amqps://jharolperez:2456963Eithan*@b-14df11f4-84b4-4c45-80d0-93af86e77869.mq.us-east-2.amazonaws.com');
    const channel = await connection.createChannel();
    
    
    // const queue = 'estadoFactura';
    // Crear la cola si no existe
    const queue = 'mi_cola';
    await channel.assertQueue(queue, { durable: false });

    console.log('Esperando mensajes. Para salir, presiona CTRL+C');

    // Suscribirse a la cola y recibir mensajes
    channel.consume(
      queue,
      (message) => {
        const content = message.content.toString();
        console.log(`Mensaje recibido: ${content}`);
      },
      { noAck: true }
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

// Llamar a la función para conectar y suscribirse
connectAndSubscribe();
