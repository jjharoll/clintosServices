require('dotenv').config(); // Cargar las variables de entorno desde .env

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const amqp = require('amqplib');
const basicAuth = require('basic-auth');
const mssql = require('mssql');
const crypto = require('crypto');
const { parseStringPromise } = require('xml2js');


const enviarFacturaRoutes = require('./routes/enviarFacturaRoutes');
const adjuntoRoutes = require('./routes/adjuntoRoutes');
const estadoFacturaRoutes = require('./routes/estadoFacturaRoutes');
const enviarCorreoRoutes = require('./routes/enviarCorreoRoutes');
const folioRestanteRoutes = require('./routes/folioRestanteRoutes');
const descargaPdfRoutes = require('./routes/descargaPdfRoutes');
const descargaXmlRoutes = require('./routes/descargaXmlRoutes');

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
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
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

// Middleware para agregar el usuario consumidor a la solicitud
function agregarUsuarioConsumidor(req, res, next) {
  const user = basicAuth(req);
  const usuarioConsumidor = user && user.name ? user.name : null;
  req.usuarioConsumidor = usuarioConsumidor;
  next();
}

// Usar las rutas correspondientes
app.use('/api/enviarFactura', authenticate, agregarUsuarioConsumidor, enviarFacturaRoutes);
app.use('/api/adjunto', authenticate, agregarUsuarioConsumidor, adjuntoRoutes);
app.use('/api/estadoFactura', authenticate, agregarUsuarioConsumidor, estadoFacturaRoutes);
app.use('/api/enviarCorreo', authenticate, agregarUsuarioConsumidor, enviarCorreoRoutes);
app.use('/api/foliosRestantes', authenticate, agregarUsuarioConsumidor, folioRestanteRoutes);
app.use('/api/descargaPdf', authenticate, agregarUsuarioConsumidor, descargaPdfRoutes);
app.use('/api/descargaXml', authenticate, agregarUsuarioConsumidor, descargaXmlRoutes);

// Otros ajustes y configuraciones de la aplicación
const consumeEstadoFacturaQueue = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    const methodQueueMap = {
      // Aquí puedes definir la relación entre cada método y la cola correspondiente
      metodo1: 'enviarFactura',
      metodo2: 'estadoFactura',
      metodo3: 'enviarCorreo',
      metodo4: 'foliosRestantes',
      metodo5: 'descargaPdf',
      metodo6: 'descargaXml'
    };

    const methods = Object.keys(methodQueueMap);

    for (const method of methods) {
      const queue = methodQueueMap[method];
      await channel.assertQueue(queue);
      console.log(`Esperando mensajes en la cola ${queue} para el método ${method}...`);
      
      channel.consume(queue, async (message) => {
        // const data = JSON.parse(message.content.toString()); // Parsear el contenido del mensaje como objeto JSON
        // console.log(`Mensaje recibido para el método ${method}:`, data);
        
        try {
          // Procesar el mensaje utilizando el controlador o servicio correspondiente al método
          switch (method) {
            case 'metodo1': {
              const enviarFacturaController = require('./controllers/enviarFacturaController');
              const data = await parseStringPromise(message.content && message.content.toString(), { explicitArray: false });
              console.log(`Mensaje recibido para el método ${method}:`, data);
              await enviarFacturaController.enviarFactura(data,message.properties.headers.usuarioConsumidor);
              break;
            }
            case 'metodo2':
              const estadoFacturaController = require('./controllers/estadoFacturaController');
              const data = JSON.parse(message.content.toString()); // Parsear el contenido del mensaje como objeto JSON
              console.log(`Mensaje recibido para el método ${method}:`, data);
              await estadoFacturaController.consumirEndpointSOAP(
                data.tokenEmpresa,
                data.tokenPassword,
                data.numeroDocumento,
                'RabbitMQ',
              );
              break;
            case 'metodo3': {
              const enviarCorreoController = require('./controllers/enviarCorreoController');
              const data = JSON.parse(message.content.toString()); // Parsear el contenido del mensaje como objeto JSON
              console.log(`Mensaje recibido para el método ${method}:`, data);
              await enviarCorreoController.consumirEndpointSOAP(
                data.tokenEmpresa,
                data.tokenPassword,
                data.numeroDocumento,
                data.correo,
                data.adjuntos,
              'RabbitMQ'
              );
              break;
            }
            case 'metodo4': {
              const folioRestanteController = require('./controllers/folioRestanteController');
              const data = JSON.parse(message.content.toString()); // Parsear el contenido del mensaje como objeto JSON
              console.log(`Mensaje recibido para el método ${method}:`, data);
              await folioRestanteController.consumirEndpointSOAP(
                data.tokenEmpresa,
                data.tokenPassword,
                'RabbitMQ'
              );
              break;
            }
            case 'metodo5': {
              const descargaPdfController = require('./controllers/descargaPdfController');
              const data = JSON.parse(message.content.toString()); // Parsear el contenido del mensaje como objeto JSON
              console.log(`Mensaje recibido para el método ${method}:`, data);
              await descargaPdfController.consumirEndpointSOAP(
                data.tokenEmpresa,
                data.tokenPassword,
                data.numeroDocumento,
                'RabbitMQ'
              );
              break;
            }
            case 'metodo6': {
              const descargaXmlController = require('./controllers/descargaXmlController');
              const data = JSON.parse(message.content.toString()); // Parsear el contenido del mensaje como objeto JSON
              console.log(`Mensaje recibido para el método ${method}:`, data);
              await descargaXmlController.consumirEndpointSOAP(
                data.tokenEmpresa,
                data.tokenPassword,
                data.numeroDocumento,
                'RabbitMQ'
              );
              break;
            }
            default:
              console.error(`Método desconocido: ${method}`);
              channel.nack(message); // Rechazar el mensaje para que vuelva a la cola
              return;
          }

          channel.ack(message); // Confirmar el mensaje como procesado exitosamente
        } catch (error) {
          console.error(`Error al procesar el mensaje para el método ${method}:`, error);
          channel.nack(message); // Rechazar el mensaje para que vuelva a la cola
        }
      });
    }
  } catch (error) {
    console.error('Error al establecer conexión con RabbitMQ:', error);
  }
};

// Consumir las colas de RabbitMQ al iniciar el servidor
consumeEstadoFacturaQueue();

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor en ejecución en el puerto 3000');
});
