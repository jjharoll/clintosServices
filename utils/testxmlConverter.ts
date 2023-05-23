const axios = require('axios');
const xmlbuilder = require('xmlbuilder');

// Función para convertir un objeto JSON a XML
function jsonToXml(json) {
  const root = xmlbuilder.create('request');
  Object.keys(json).forEach((key) => {
    const value = json[key];
    const child = root.ele(key);
    child.txt(value);
  });
  return root.end({ pretty: true });
}

// Objeto JSON de ejemplo
const jsonPayload = {
  name: 'John Doe',
  age: 30,
  email: 'johndoe@example.com'
};

// Convertir el JSON a XML
const xmlPayload = jsonToXml(jsonPayload);


console.log(xmlPayload);
// // URL del servicio web
// const url = 'http://demoemision21.thefactoryhka.com.co/ws/adjuntos/Service.svc?wsdl';

// // Realizar la solicitud POST al servicio web con el XML como payload
// axios.post(url, xmlPayload, {
//   headers: {
//     'Content-Type': 'application/xml'
//   }
// })
//   .then((response) => {
//     console.log('Respuesta del servicio web:', response.data);
//   })
//   .catch((error) => {
//     console.error('Error al realizar la solicitud:', error);
//   });
