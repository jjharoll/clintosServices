const fs = require('fs');
const xml2js = require('xml2js');

// Lee el archivo XML
const xml = fs.readFileSync('C:/Users/NITRO 5/Documents/SolucionesUnicia/GeneracionEntregaFactura/documentacion/enviarAdjunto.xml', 'utf-8');

// Crea un nuevo objeto Parser
const parser = new xml2js.Parser();

// Convierte el XML a JSON
parser.parseString(xml, (err, result) => {
  if (err) {
    console.error(err);
  } else {
    // El resultado es un objeto JavaScript
    console.log(result);
    
    // Si deseas convertir el resultado a una cadena JSON
    const json = JSON.stringify(result);
    console.log(json);
    
    // // Puedes guardar el resultado en un archivo JSON si lo deseas
    // fs.writeFileSync('ruta/al/archivo.json', json);
  }
});
