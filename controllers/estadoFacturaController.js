// estadoFacturaController.js
const estadoFacturaService = require('../services/estadoFacturaService');

const obtenerEstadoFactura = async (req, res) => {
  try {
    // Obtener los datos necesarios del cuerpo de la solicitud
    const { tipoDocumento, numeroDocumento } = req.body;

    // Construir el objeto con los datos del XML
    const xmlData = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:ser="http://schemas.datacontract.org/2004/07/ServiceSoap.UBL2._0.Models.Object" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
        <soapenv:Header/>
        <soapenv:Body>
          <tem:EstadoDocumento>
            <tem:tokenEmpresa>${process.env.TOKEN_EMPRESA}</tem:tokenEmpresa>
            <tem:tokenPassword>${process.env.TOKEN_PASSWORD}</tem:tokenPassword>
            <tem:tipoDocumento>${tipoDocumento}</tem:tipoDocumento>
            <tem:numeroDocumento>${numeroDocumento}</tem:numeroDocumento>
          </tem:EstadoDocumento>
        </soapenv:Body>
      </soapenv:Envelope>`;

    // Llamar al servicio estadoFactura
    const response = await estadoFacturaService(xmlData);

    // Enviar la respuesta al cliente
    res.status(200).json(response);
  } catch (error) {
    // Manejar el error
    res.status(500).json({ error: 'Ha ocurrido un error' });
  }
};

module.exports = { obtenerEstadoFactura };
