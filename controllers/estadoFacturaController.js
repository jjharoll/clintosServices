const axios = require('axios');
const sql = require('mssql');
const { parseStringPromise } = require('xml2js');

const buscarNumeroDocumento = (body, numeroDocumento) => {
  const regex = new RegExp(numeroDocumento, 'gi');
  const match = body.match(regex);
  return match ? match[0] : null;
};

const consumirEndpointSOAP = async (tokenEmpresa, tokenPassword, numeroDocumento, usuarioConsumidor) => {
  try {
    const endpoint = 'http://demoemision21.thefactoryhka.com.co/ws/v1.0/Service.svc';

    const xmlData = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
        <soapenv:Header/>
        <soapenv:Body>
          <tem:EstadoDocumento>
            <tem:tokenEmpresa>${tokenEmpresa}</tem:tokenEmpresa>
            <tem:tokenPassword>${tokenPassword}</tem:tokenPassword>
            <tem:documento>${numeroDocumento}</tem:documento>
          </tem:EstadoDocumento>
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

    const axiosInstance = axios.create({
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/IService/EstadoDocumento'
      }
    });

    const response = await axiosInstance.post(endpoint, xmlData);

    console.log(response.data);
    // Expresión regular para extraer el valor de mensajeDocumento
    const regex = /<a:mensajeDocumento>(.*?)<\/a:mensajeDocumento>/;
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
    const numeroDocumentoEncontrado = buscarNumeroDocumento(response.data, numeroDocumento);
    let intentos = 1;
    let metodo = 'estadoFactura';
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
    } 
    const request = new sql.Request(pool);
    let query = '';

    const estadoRespuesta = response.status === 200 && response.data.includes('<a:codigo>200</a:codigo>');


    


    if (estadoRespuesta) {
      status = response.status; // Estado de respuesta exitoso
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
      request.input('status', sql.Int, status);
    } else {
      intentos++;
      status = response.status; // Estado de respuesta con error
      query = `
        UPDATE [dbo].[logWS]
        SET intentos = @nuevosIntentos
        WHERE numeroDocumento = @numeroDocumento
      `;
      request.input('nuevosIntentos', sql.Int, intentos);
      request.input('status', sql.Int, status);
    }

    request.input('metodo', sql.NVarChar, metodo);
    request.input('observacion', sql.NVarChar, observacion);
    request.input('usuarioConsumidor', sql.NVarChar, usuarioConsumidor);
    request.input('xmlData', sql.NVarChar, xmlData);
    request.input('respuesta', sql.NVarChar, response.data);
    request.input('intentos', sql.Int, intentos);
    request.input('numeroDocumento', sql.NVarChar, numeroDocumento);

    await request.query(query).catch(err => {
      console.error('Error al ejecutar la consulta SQL:', err);
    });

    await sql.close();

    return response.data;
  } catch (error) {
    console.error('Ha ocurrido un error:', error.message);
    throw new Error('Ha ocurrido un error');
  }
};

module.exports = {
  consumirEndpointSOAP,
};
