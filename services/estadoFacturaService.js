const axios = require('axios');
const sql = require('mssql');

const obtenerEstadoFactura = async (xmlData, numeroDocumento) => {
  try {
    const endpoint = 'http://demoemision21.thefactoryhka.com.co/ws/v1.0/Service.svc';

    const config = {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/IService/EstadoDocumento'
      },
    };

    const response = await axios.post(endpoint, xmlData, config);

    // Procesar la respuesta
    console.log(response.data);
    const respuesta = response.data;

    const dbConfig = {
      user: 'admin',
      password: 'admin123',
      server: 'clintos.czzdknftpzkc.us-east-2.rds.amazonaws.com',
      database: 'servicios',
      options: {
        encrypt: true,
        trustServerCertificate: true,
        port: 1433, // El puerto predeterminado para SQL Server
        requestTimeout: 30000, // Opcional: tiempo de espera de la solicitud en milisegundos
        connectionTimeout: 30000 // Opcional: tiempo de espera de la conexión en milisegundos
      }
    };
    const pool = await sql.connect(dbConfig);
    console.log('Conexión establecida correctamente');

    // Verificar conexión exitosa
    sql.on('error', err => {
      console.error('Error en la conexión a la base de datos:', err);
    });

    const request = new sql.Request(pool);
    const query = `
      INSERT INTO [dbo].[logWS]
        ([fecha_consumo]
        ,[request]
        ,[response]
        ,[intentos])
      VALUES
        (GETDATE()
        ,@xmlData
        ,@respuesta
        ,1)
    `;
    request.input('xmlData', sql.NVarChar, xmlData);
    request.input('respuesta', sql.NVarChar, respuesta);
    await request.query(query);
    await request.query(query).catch(err => {
      console.error('Error al ejecutar la consulta SQL:', err);
    });
    

    sql.close();

    return respuesta;
  } catch (error) {
    // Manejar el error
    console.error('Ha ocurrido un error:', error.message);
    throw new Error('Ha ocurrido un error');
  }
};

module.exports = obtenerEstadoFactura;
