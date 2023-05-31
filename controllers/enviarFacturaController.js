const axios = require('axios');
const sql = require('mssql');
const { verificarEndpoint } = require('../utils/validarEndpoint');

const enviarFactura = async (xmlData, usuarioConsumidor) => {
  try {
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

    const endpoint = 'http://demoemision21.thefactoryhka.com.co/ws/v1.0/Service.svc2';

    await verificarEndpoint(endpoint);
    let response;

    try {
      response = await axios.post(endpoint, xmlData, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IService/Enviar'
        }
      });
    } catch (error) {
      response = {
        status: 900,
        data: `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
        <s:Body>
            <servicioUniciaResponse xmlns="http://tempuri.org/">
                <servicioUniciaResult xmlns:a="http://schemas.datacontract.org/2004/07/ServiceSoap.UBL2._0.Response"
                    xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                    <a:codigo>900</a:codigo>
                    <a:mensaje>No se logró comunicar con el proveedor theFactory, número de intentos 3 de consumo con 3 segundos</a:mensaje>
                    <a:resultado>Error</a:resultado>
                </servicioUniciaResult>
            </servicioUniciaResponse>
        </s:Body>
      </s:Envelope>`
      };
    }

    console.log(response.data);

    let intentos = 1;
    let metodo = 'EnviarFactura';
    let query = '';

    const isResponseSuccessful = response.status === 200;

    const regexMensajeDocumento = /<a:mensaje>(.*?)<\/a:mensaje>/;
    const regexStatus = /<a:codigo>(.*?)<\/a:codigo>/;
    const matchMensajeDocumento = response.data.match(regexMensajeDocumento);
    const matchStatus = response.data.match(regexStatus);
    let observacion;
    let status = '';
    let numeroDocumento = '';

    if (matchMensajeDocumento && matchMensajeDocumento[1]) {
      observacion = matchMensajeDocumento[1];
      console.log(observacion);
    } else {
      console.error('No se pudo encontrar el valor de mensajeDocumento en la respuesta.');
    }

    if (matchStatus && matchStatus[1]) {
      status = matchStatus[1];
      console.log(status);
    } else {
      console.error('No se pudo encontrar el valor de estatus en la respuesta.');
    }

    if (isResponseSuccessful) {
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

    const request = pool.request();
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

    return response.data;
  } catch (error) {
    return `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
    <s:Body>
        <servicioUniciaResponse xmlns="http://tempuri.org/">
            <servicioUniciaResult xmlns:a="http://schemas.datacontract.org/2004/07/ServiceSoap.UBL2._0.Response"
                xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                <a:codigo>900</a:codigo>
                <a:mensaje>No se logró comunicar con el proveedor theFactory, número de intentos 3 de consumo con 3 segundos</a:mensaje>
                <a:resultado>Error</a:resultado>
            </servicioUniciaResult>
        </servicioUniciaResponse>
    </s:Body>
  </s:Envelope>`;
  } finally {
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
    const request = pool.request();
    const query = `
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
        ,'<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
        <s:Body>
            <servicioUniciaResponse xmlns="http://tempuri.org/">
                <servicioUniciaResult xmlns:a="http://schemas.datacontract.org/2004/07/ServiceSoap.UBL2._0.Response"
                    xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                    <a:codigo>900</a:codigo>
                    <a:mensaje>No se logró comunicar con theFactory, número de intentos 3</a:mensaje>
                    <a:resultado>Error</a:resultado>
                </servicioUniciaResult>
            </servicioUniciaResponse>
        </s:Body>
    </s:Envelope>'
        ,'3'
        ,'EnviarFactura'
        ,''
        ,'No se logró comunicar con la TheFactory, número de intentos 3'
        ,@usuarioConsumidor
        ,'900')
      `;

      
      request.input('usuarioConsumidor', sql.NVarChar, usuarioConsumidor);
      await request.query(query).catch(err => {
        console.error('Error al ejecutar la consulta SQL:', err);
      });
    sql.close();
  }
};

module.exports = {
  enviarFactura,
};
