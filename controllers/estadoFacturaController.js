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

    const response = await axios.post(endpoint, xmlData, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/IService/EstadoDocumento'
      }
    });

    // Procesar la respuesta
    console.log(response.data);

    const numeroDocumentoEncontrado = buscarNumeroDocumento(response.data, numeroDocumento);
    let intentos = 1;
    let metodo = 'estadoFactura';
    if (numeroDocumentoEncontrado) {
      // Realizar consulta para obtener el número de intentos actual
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
        intentos = obtenerIntentosResult.recordset[0].intentos + 1;
      } else {
        // Si el número de documento no existe en la base de datos, insertar un nuevo registro
        const insertarIntentosQuery = `
          INSERT INTO [dbo].[logWS]
            ([fecha_consumo]
            ,[request]
            ,[response]
            ,[intentos]
            ,[metodo]
            ,[numeroDocumento])
          VALUES
            (GETDATE()
            ,@xmlData
            ,@respuesta
            ,@intentos
            ,'estadoFactura'
            ,@numeroDocumento)
        `;
        const insertarIntentosRequest = new sql.Request(pool);
        insertarIntentosRequest.input('xmlData', sql.NVarChar, xmlData);
        insertarIntentosRequest.input('respuesta', sql.NVarChar, response.data);
        insertarIntentosRequest.input('intentos', sql.Int, intentos);
        insertarIntentosRequest.input('numeroDocumento', sql.NVarChar, numeroDocumento);
        await insertarIntentosRequest.query(insertarIntentosQuery).catch(err => {
          console.error('Error al insertar los intentos:', err);
        });
      }
    }

    const request = new sql.Request(pool);
    const query = `
      UPDATE [dbo].[logWS]
      SET intentos = @intentos
      WHERE numeroDocumento = @numeroDocumento
    `;
    request.input('intentos', sql.Int, intentos);
    request.input('numeroDocumento', sql.NVarChar, numeroDocumento);
    console.log(query);
    await request.query(query).catch(err => {
      console.error('Error al ejecutar la consulta SQL:', err);
    });

    sql.close();
    return response.data;
  } catch (error) {
    // Manejar el error
    console.error('Ha ocurrido un error:', error.message);
    throw new Error('Ha ocurrido un error');
  }
};

module.exports = {
  consumirEndpointSOAP,
};
