const axios = require('axios');
const consumirEndpointSOAP = async (numeroDocumento) => {
  try {
    const endpoint = 'http://demoemision21.thefactoryhka.com.co/ws/v1.0/Service.svc';

    const xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
      <soapenv:Header/>
      <soapenv:Body>
         <tem:EstadoDocumento>
            <!--Optional:-->
            <tem:tokenEmpresa>${process.env.TOKEN_EMPRESA}</tem:tokenEmpresa>
            <!--Optional:-->
            <tem:tokenPassword>${process.env.TOKEN_PASSWORD}</tem:tokenPassword>
            <!--Optional:-->
            <tem:documento>${numeroDocumento}</tem:documento>
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
    console.log(response.data);
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
