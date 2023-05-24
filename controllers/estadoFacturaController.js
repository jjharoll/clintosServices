const axios = require('axios');
const sql = require('mssql');

const buscarNumeroDocumento = (body, numeroDocumento) => {
  const regex = new RegExp(numeroDocumento, 'gi');
  return body.match(regex);
};

const consumirEndpointSOAP = async (tokenEmpresa, tokenPassword, numeroDocumento) => {
  try {
    const endpoint = 'http://demoemision21.thefactoryhka.com.co/ws/v1.0/Service.svc';

    const xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
      <soapenv:Header/>
      <soapenv:Body>
         <tem:EstadoDocumento>
            <!--Optional:-->
            <tem:tokenEmpresa>${tokenEmpresa}</tem:tokenEmpresa>
            <!--Optional:-->
            <tem:tokenPassword>${tokenPassword}</tem:tokenPassword>
            <!--Optional:-->
            <tem:documento>${numeroDocumento}</tem:documento>
         </tem:EstadoDocumento>
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
        'SOAPAction': 'http://tempuri.org/IService/EstadoDocumento'
      }
    });

    console.log(response.data);

    const numeroDocumentoEncontrado = buscarNumeroDocumento(response.data, numeroDocumento);
    let intentos = 1;
    let metodo = 'estadoFactura';
    let observacion = '';

    const obtenerIntentosQuery = `
      SELECT intentos
      FROM [dbo].[logWS]
      WHERE numeroDocumento = @numeroDocumento
    `;
    const obtenerIntentosRequest = new sql.Request(pool);
    obtenerIntentosRequest.input('numeroDocumento', sql.NVarChar, numeroDocumento);
    const obtenerIntentosResult = await obtenerIntentosRequest.query(obtenerIntentosQuery).catch(err => {
      console.error('Error al obtener los intentos:', err);
    });

    if (obtenerIntentosResult.recordset.length > 0) {
      intentos = obtenerIntentosResult.recordset[0].intentos;
      observacion = 'Intento existente';
    } else {
      observacion = 'Primer intento';
    }

    const request = new sql.Request(pool);
    let query = '';

    const estadoRespuesta = response.status === 200 && response.data.includes('<a:codigo>200</a:codigo>');

    if (estadoRespuesta) {
      observacion = 'Consumo correcto';
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
      request.input('metodo', sql.NVarChar, metodo);
      request.input('observacion', sql.NVarChar, observacion);
    } else {
      intentos++;
      observacion = 'No existe respuesta, por algún factor externo';
      query = `
        UPDATE [dbo].[logWS]
        SET intentos = @nuevosIntentos
        WHERE numeroDocumento = @numeroDocumento
      `;
      request.input('nuevosIntentos', sql.Int, intentos);
    }

    request.input('xmlData', sql.NVarChar, xmlData);
    request.input('respuesta', sql.NVarChar, response.data);
    request.input('intentos', sql.Int, intentos);
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
