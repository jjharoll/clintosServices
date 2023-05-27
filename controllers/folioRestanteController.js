const axios = require('axios');
const sql = require('mssql');

const consumirEndpointSOAP = async (tokenEmpresa, tokenPassword,usuarioConsumidor) => {
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

    const response = await axios.post(endpoint, xmlData, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/IService/FoliosRestantes'
      }
    });

    console.log(response.data);
    let metodo = 'folioRestantes';
    // Expresión regular para extraer el valor de mensajeDocumento
    const regex = /<a:mensaje>(.*?)<\/a:mensaje>/;
    const match = response.data.match(regex);

    let observacion; // Declarar la variable fuera del bloque if

    // Verificar si se encontró una coincidencia
    if (match && match[1]) {
      const mensajeDocumento = match[1];
      observacion = mensajeDocumento; // Asignar el valor a la variable observacion
      console.log(observacion);
    } else {
      console.error('No se pudo encontrar el valor de mensajeDocumento en la respuesta.');
    }
    let query = '';
    let intentos = '1';
    let numeroDocumento= '';

    const estadoRespuesta = response.status === 200 && response.data.includes('<a:codigo>200</a:codigo>');
    
    if (estadoRespuesta) {
      status = response.status;
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
          ,@xmlData
          ,@respuesta
          ,@intentos
          ,@metodo
          ,@numeroDocumento
          ,@observacion
          ,@usuarioConsumidor
          ,@status)
      `;
    } else {
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
          ,@xmlData
          ,@respuesta
          ,@intentos
          ,@metodo
          ,@numeroDocumento
          ,@observacion
          ,@usuarioConsumidor
          ,@status)
      `;
    }

    const request = new sql.Request(pool);
    request.input('metodo', sql.NVarChar, metodo);
    request.input('observacion', sql.NVarChar, observacion);
    request.input('usuarioConsumidor', sql.NVarChar, usuarioConsumidor);
    request.input('intentos', sql.NVarChar, intentos);
    request.input('xmlData', sql.NVarChar, xmlData);
    request.input('respuesta', sql.NVarChar, response.data);
    request.input('numeroDocumento', sql.NVarChar, numeroDocumento);
    request.input('status', sql.Int, status);

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
