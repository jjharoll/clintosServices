<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
 
</head>
<body>
  <h1>Proyecto de Microservicios para Procesamiento de Facturas</h1>

  <h2>Tecnologías Utilizadas</h2>
  <ul>
    <li>Node.js: plataforma de desarrollo en tiempo de ejecución de JavaScript.</li>
    <li>Express: framework de aplicaciones web para Node.js.</li>
    <li>JSON: formato de intercambio de datos utilizado para recibir información.</li>
    <li>XML: formato utilizado para procesar y enviar la factura a servicios externos.</li>
    <li>Axios: cliente HTTP utilizado para realizar peticiones a los servicios externos.</li>
    <li>Nodemailer: librería utilizada para enviar correos electrónicos.</li>
  </ul>

  <h2>Arquitectura</h2>
  <p>El proyecto sigue una arquitectura basada en microservicios, donde cada funcionalidad se descompone en unidades independientes. Esto permite una mayor modularidad, escalabilidad y mantenibilidad del sistema.</p>

  <h3>Estructura de Archivos</h3>
  <pre>
  - app.js               # Archivo principal para inicializar la aplicación
  - config/              # Configuración del proyecto
    - index.js           # Configuración general de la aplicación
  - controllers/         # Controladores de los microservicios
    - enviarFactura.js   # Controlador para el microservicio de envío de facturas
    - adjuntarFactura.js # Controlador para el microservicio de adjuntar facturas
    - estadoFactura.js   # Controlador para el microservicio de estado de factura
    - enviarCorreo.js    # Controlador para el microservicio de envío de correos
  - routes/              # Rutas de la aplicación
    - enviar.js          # Ruta para el microservicio de envío de facturas
    - adjuntar.js        # Ruta para el microservicio de adjuntar facturas
    - estado.js          # Ruta para el microservicio de estado de factura
    - correo.js          # Ruta para el microservicio de envío de correos
  - services/            # Servicios externos
    - facturaService.js  # Servicio para consumir el servicio de facturación externo
    - adjuntoService.js  # Servicio para consumir el servicio de adjuntar factura externo
  - utils/               # Utilidades y funciones auxiliares
    - xmlConverter.js    # Módulo para convertir JSON a XML
    - emailService.js    # Módulo para enviar correos electrónicos
  - package.json         # Archivo de configuración de npm con las dependencias del proyecto
  - .gitignore           # Archivo para ignorar archivos y directorios en el control de versiones
  - README.md            # Documentación del proyecto
  </pre>

  
  <h3>Configuración</h3>
  <p>La configuración general de la aplicación se encuentra en el archivo <code>config/index.js</code>. Aquí se pueden establecer variables de entorno, datos de conexión a servicios externos y cualquier otra configuración relevante para el proyecto.</p>

  <h3>Controladores</h3>
  <p>Los controladores se encuentran en la carpeta <code>controllers/</code> y son responsables de manejar la lógica de negocio de cada microservicio. Cada controlador se encarga de recibir las solicitudes, procesar los datos y utilizar los servicios externos correspondientes.</p>

  <h3>Rutas</h3>
  <p>Las rutas se definen en la carpeta <code>routes/</code> y se encargan de asociar las URL con los controladores correspondientes. Aquí se definen los puntos de entrada para cada microservicio y se establecen las acciones a ejecutar según el verbo HTTP utilizado.</p>

  <h3>Servicios Externos</h3>
  <p>Los servicios externos se encuentran en la carpeta <code>services/</code> y se encargan de interactuar con los servicios externos necesarios para el procesamiento de las facturas. Estos servicios utilizan librerías como Axios para realizar las peticiones HTTP correspondientes.</p>

  <h3>Utilidades</h3>
  <p>La carpeta <code>utils/</code> contiene módulos y funciones auxiliares utilizados en el proyecto. Por ejemplo, el módulo <code>xmlConverter.js</code> se encarga de convertir los datos recibidos en formato JSON a XML, mientras que el módulo <code>emailService.js</code> se utiliza para enviar correos electrónicos a los clientes.</p>

  <h3>Ejecución</h3>
  <p>Para ejecutar el proyecto, sigue los siguientes pasos:</p>
  <ol>
    <li>Clona el repositorio desde GitHub: <code>git clone https://github.com/jjharoll/clintosServices.git</code>.</li>
    <li>Ingresa al directorio del proyecto: <code>cd clintosServices</code>.</li>
    <li>Instala las dependencias del proyecto: <code>npm install</code>.</li>
    <li>Inicia la aplicación: <code>node app.js</code> o <code>npm start</code>.</li>
    <li>Accede a la aplicación en tu navegador: <code>http://localhost:3000</code>.</li>
  </ol>

  <h3>Contribución</h3>
  <p>Si deseas contribuir a este proyecto, puedes realizar los siguientes pasos:</p>
  <ol>
    <li>Crea un fork de este repositorio.</li>
    <li>Realiza los cambios o mejoras en tu propio repositorio.</li>
    <li>Crea un Pull Request en este repositorio con tus cambios propuestos.</li>
    <li>Espera a que tus cambios sean revisados y fusionados.</li>
  </ol>

  <h3>Notas Finales</h3>
  <p>Este proyecto sigue las mejores prácticas de desarrollo en Node.js y Express, utilizando una arquitectura de microservicios para lograr una solución escalable y modular. Si tienes alguna pregunta o inquietud, no dudes en contactar al equipo de desarrollo.</p>

  <p>Unicia SAS</p>
</body>
</html>
