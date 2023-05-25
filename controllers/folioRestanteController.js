const axios = require('axios');
const sql = require('mssql');

const consumirEndpointSOAP = async (tokenEmpresa, tokenPassword) => {
  try {
    const endpoint = 'http://demoemision21.thefactoryhka.com.co/ws/v1.0/Service.svc';

    const xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
   <soapenv:Header/>
   <soapenv:Body>
      <tem:FoliosRestantes>
         <!--Optional:-->
         <tem:tokenEmpresa>${tokenEmpresa}</tem:tokenEmpresa>
         <!--Optional:-->
         <tem:tokenPassword>${tokenPassword}</tem:tokenPassword>
      </tem:FoliosRestantes>
   </soapenv:Body>
</soapenv:Envelope>`;

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
    const pool = await sql.connect(dbConfig);
    console.log('Conexión establecida correctamente');

    sql.on('error', err => {
      console.error('Error en la conexión a la base de datos:', err);
    });

    const response = await axios.post(endpoint, xmlData, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/IService/FoliosRestantes'
      }
    });

    console.log(response.data);
    let metodo = 'folioRestantes';
    let observacion = '';
    let query = '';
    let intentos = '1';
    let numeroDocumento= '';

    const estadoRespuesta = response.status === 200 && response.data.includes('<a:codigo>200</a:codigo>');

    if (estadoRespuesta) {
      observacion = 'Generacion de Folios';
      query = `
        INSERT INTO [dbo].[logWS]
          ([fecha_consumo]
          ,[request]
          ,[response]
          ,[intentos]
          ,[metodo]
          ,[numeroDocumento]
          ,[observacion])
        VALUES
          (GETDATE()
          ,@xmlData
          ,@respuesta
          ,@intentos
          ,@metodo
          ,@numeroDocumento
          ,@observacion)
      `;
    } else {
      observacion = 'Fallo al consultar numero de Folios';
      query = `
        INSERT INTO [dbo].[logWS]
          ([fecha_consumo]
          ,[request]
          ,[response]
          ,[intentos]
          ,[metodo]
          ,[numeroDocumento]
          ,[observacion])
        VALUES
          (GETDATE()
          ,@xmlData
          ,@respuesta
          ,@intentos
          ,@metodo
          ,@numeroDocumento
          ,@observacion)
      `;
    }

    const request = new sql.Request(pool);
    request.input('metodo', sql.NVarChar, metodo);
    request.input('observacion', sql.NVarChar, observacion);
    request.input('intentos', sql.NVarChar, intentos);
    request.input('xmlData', sql.NVarChar, xmlData);
    request.input('respuesta', sql.NVarChar, response.data);
    request.input('numeroDocumento', sql.NVarChar, numeroDocumento);

    await request.query(query).catch(err => {
      console.error('Error al ejecutar la consulta SQL:', err);
    });

    sql.close();
    return response.data;
  } catch (error) {
    console.error('Ha ocurrido un error:', error.message);
    throw new Error('Ha ocurrido un error');
  }
};

module.exports = {
  consumirEndpointSOAP,
};
