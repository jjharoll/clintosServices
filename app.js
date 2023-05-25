const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const amqp = require('amqplib');
const basicAuth = require('basic-auth');
const mssql = require('mssql');
const crypto = require('crypto');

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

function authenticate(req, res, next) {
  const user = basicAuth(req);

  // Verificar si se proporcionaron las credenciales de autenticación
  if (!user || !user.name || !user.pass) {
    res.set('WWW-Authenticate', 'Basic realm="Authentication Required"');
    res.status(401).send('Requiere autenticacion');
    return;
  }

  // Verificar las credenciales de autenticación consultando la base de datos
  const dbConfig = {
    user: 'admin',
    password: 'admin123',
    server: 'clintos.czzdknftpzkc.us-east-2.rds.amazonaws.com',
    database: 'servicios',
    options: {
      encrypt: true,
      trustServerCertificate: true,
      port: 1433,
      requestTimeout: 30000,
      connectionTimeout: 30000
    }
  };

  const pool = new mssql.ConnectionPool(dbConfig);
  pool.connect((err) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    const request = new mssql.Request(pool);
    const username = user.name;
    const password = crypto.createHash('sha1').update(user.pass).digest('hex');

    // Realizar la consulta para verificar las credenciales
    const query = `SELECT COUNT(*) AS count FROM logWS_usuarios WHERE username = '${username}' AND password = '${password}'`;
    request.query(query, (err, result) => {
      if (err) {
        console.error('Error al consultar la base de datos:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      const count = result.recordset[0].count;
      if (count === 1) {
        // Las credenciales son válidas, continuar con la siguiente ruta
        next();
      } else {
        res.set('WWW-Authenticate', 'Basic realm="Authentication Required"');
        res.status(401).send('Authentication Required');
      }
    });
  });
}

// Ruta al archivo Swagger/OpenAPI YAML
const swaggerDocument = YAML.load('./swagger.yaml');

// Configurar y usar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Usar las rutas correspondientes
app.use('/api/enviarFactura', authenticate, enviarFacturaRoutes);
app.use('/api/adjunto', authenticate , adjuntoRoutes);
app.use('/api/estadoFactura', authenticate ,estadoFacturaRoutes);
app.use('/api/enviarCorreo', authenticate, enviarCorreoRoutes);
app.use('/api/foliosRestantes', authenticate ,folioRestanteRoutes);
app.use('/api/descargaPdf', authenticate, descargaPdfRoutes);
app.use('/api/descargaXml', authenticate, descargaXmlRoutes);

// Otros ajustes y configuraciones de la aplicación
const consumeEstadoFacturaQueue = async () => {
  try {
    const connection = await amqp.connect(
      'amqps://jharolperez:2456963Eithan*@b-14df11f4-84b4-4c45-80d0-93af86e77869.mq.us-east-2.amazonaws.com'
    );
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
