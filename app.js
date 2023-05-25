// app.js
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const amqp = require('amqplib');
const bodyParser = require('body-parser');

const enviarFacturaRoutes = require('./routes/enviarFacturaRoutes');
const adjuntoRoutes = require('./routes/adjuntoRoutes');
const estadoFacturaRoutes = require('./routes/estadoFacturaRoutes');
const enviarCorreoRoutes = require('./routes/enviarCorreoRoutes');
const folioRestanteRoutes = require('./routes/folioRestanteRoutes');
const descargaPdfRoutes = require('./routes/descargaPdfRoutes');
const descargaXmlRoutes = require('./routes/descargaXmlRoutes');
const estadoFacturaController = require('./controllers/estadoFacturaController');

const app = express();

// Configurar middlewares y otros ajustes de la aplicación
// Middleware de análisis de cuerpo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// Ruta al archivo Swagger/OpenAPI YAML
const swaggerDocument = YAML.load('./swagger.yaml');

// Configurar y usar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Usar las rutas correspondientes
app.use('/api/enviarFactura', enviarFacturaRoutes);
app.use('/api/adjunto', adjuntoRoutes);
app.use('/api/estadoFactura', estadoFacturaRoutes);
app.use('/api/enviarCorreo', enviarCorreoRoutes);
app.use('/api/foliosRestantes', folioRestanteRoutes);
app.use('/api/descargaPdf', descargaPdfRoutes);
app.use('/api/descargaXml', descargaXmlRoutes);

// Otros ajustes y configuraciones de la aplicación
const consumeEstadoFacturaQueue = async () => {
  try {
    const connection = await amqp.connect('amqps://jharolperez:2456963Eithan*@b-14df11f4-84b4-4c45-80d0-93af86e77869.mq.us-east-2.amazonaws.com');
    const channel = await connection.createChannel(); 

    const queue = 'estadoFactura';
    await channel.assertQueue(queue);
    console.log('Esperando mensajes en la cola estadoFactura...');

    channel.consume(queue, async (message) => {
      const data = JSON.parse(message.content.toString()); // Parsear el contenido del mensaje como objeto JSON
      const numeroDocumento = data.numeroDocumento;
      const tokenEmpresa = data.tokenEmpresa;
      const tokenPassword = data.tokenPassword;
      console.log('Mensaje recibido numeroDocumento:', numeroDocumento);
      console.log('Mensaje recibido tokenEmpresa:', tokenEmpresa);
      console.log('Mensaje recibido tokenPassword: ', tokenPassword);
    
      try {
        // Procesar el mensaje utilizando el controlador o servicio de estadoFactura
        await estadoFacturaController.consumirEndpointSOAP(tokenEmpresa, tokenPassword, numeroDocumento);
        channel.ack(message); // Confirmar el mensaje como procesado exitosamente
      } catch (error) {
        console.error('Error al procesar el mensaje:', error);
        channel.nack(message); // Rechazar el mensaje para que vuelva a la cola
      }
    });
    
  } catch (error) {
    console.error('Error al establecer conexión con RabbitMQ:', error);
  }
};

// Consumir la cola de RabbitMQ al iniciar el servidor
consumeEstadoFacturaQueue();

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor en ejecución en el puerto 3000');
});
