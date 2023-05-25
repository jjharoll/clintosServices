const axios = require('axios');

const obtenerEstadoFactura = async (req, res) => {
  try {
    const endpoint = 'http://demoemision21.thefactoryhka.com.co/ws/v1.0/Service.svc';

    const xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
    <soapenv:Header/>
    <soapenv:Body>
       <tem:EstadoDocumento>
          <!--Optional:-->
          <tem:tokenEmpresa>f5b3f7c5473468780baa9f5f6dccf4359383a265</tem:tokenEmpresa>
          <!--Optional:-->
          <tem:tokenPassword>9fc1511e2f9b44dd154a6b5c03c29b52a6a2e190</tem:tokenPassword>
          <!--Optional:-->
          <tem:documento>FCFE239</tem:documento>
       </tem:EstadoDocumento>
    </soapenv:Body>
 </soapenv:Envelope>`;

    const config = {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/IService/EstadoDocumento'
      },
    };

    const response = await axios.post(endpoint, xmlData, config);

    // Procesar la respuesta
    res.status(200).json(response.data);
  } catch (error) {
    // Manejar el error
    res.status(500).json({ error: 'Ha ocurrido un error' });
  }
};

module.exports = { obtenerEstadoFactura };
