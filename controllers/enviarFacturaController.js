const axios = require('axios');
const sql = require('mssql');

// Función para enviar la factura
const enviarFactura = async (xmlData, usuarioConsumidor) => {
  try {
    const endpoint = 'http://demoemision21.thefactoryhka.com.co/ws/v1.0/Service.svc';

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

    const pool = await sql.connect(dbConfig);
    console.log('Conexión establecida correctamente');

    sql.on('error', err => {
      console.error('Error en la conexión a la base de datos:', err);
    });

    // Realizar la solicitud POST al endpoint SOAP con el cuerpo y encabezados adecuados
    const response = await axios.post(endpoint, xmlData, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/IService/Enviar'
      }
    });

    console.log(response.data);

    let intentos = 1;
    let metodo = 'envioFactura';
    let query = '';

    const estadoRespuesta = response.status === 200;

    // Expresión regular para extraer el valor de mensajeDocumento
    const regex = /<a:mensaje>(.*?)<\/a:mensaje>/;
    const regexStatus = /<a:codigo>(.*?)<\/a:codigo>/;
    const match = response.data.match(regex);
    const match1 = response.data.match(regexStatus);
    let observacion; // Declarar la variable fuera del bloque if
    let status = '';
    let numeroDocumento = '';
    // Verificar si se encontró una coincidencia
    if (match && match[1]) {
      const mensajeDocumento = match[1];
      observacion = mensajeDocumento; // Asignar el valor a la variable observacion
      console.log(observacion);
    } else {
      console.error('No se pudo encontrar el valor de mensajeDocumento en la respuesta.');
    }
    if (match1 && match1[1]) {
      const mensajeDocumento = match1[1];
      status = mensajeDocumento; // Asignar el valor a la variable observacion
      console.log(status);
    } else {
      console.error('No se pudo encontrar el valor de estatus en la respuesta.');
    }

    if (estadoRespuesta) {
      query = `
        INSERT INTO [dbo].[logWS]
          ([fecha_consumo]
          ,[request]
          ,[response]
          ,[intentos]
          ,[metodo]
          ,[numeroDocumento]
          ,[observacion]
          ,[usuarioConsumidor]
          ,[code_status])
        VALUES
          (GETDATE()
          ,''
          ,@respuesta
          ,@intentos
          ,@metodo
          ,@numeroDocumento
          ,@observacion
          ,@usuarioConsumidor
          ,@status)
      `;
    } else {
      intentos++;
      query = `
        INSERT INTO [dbo].[logWS]
          ([fecha_consumo]
          ,[request]
          ,[response]
          ,[intentos]
          ,[metodo]
          ,[numeroDocumento]
          ,[observacion]
          ,[usuarioConsumidor]
          ,[code_status])
        VALUES
          (GETDATE()
          ,''
          ,@respuesta
          ,@intentos
          ,@metodo
          ,@numeroDocumento
          ,@observacion
          ,@usuarioConsumidor
          ,@status)
      `;
    }

    const request = new sql.Request(); // Crear una instancia de sql.Request
    request.input('respuesta', sql.NVarChar, response.data);
    request.input('intentos', sql.Int, intentos);
    request.input('metodo', sql.NVarChar, metodo);
    request.input('numeroDocumento', sql.NVarChar, numeroDocumento);
    request.input('observacion', sql.NVarChar, observacion);
    request.input('status', sql.Int, status);
    request.input('usuarioConsumidor', sql.NVarChar, usuarioConsumidor);
    await request.query(query).catch(err => {
      console.error('Error al ejecutar la consulta SQL:', err);
    });

    sql.close();
    return response.data;
  } catch (error) {
    console.error('Ha ocurrido un error:', error.message);
  }
};

module.exports = {
  enviarFactura,
};
