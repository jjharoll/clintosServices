# Usa una imagen base de Alpine con la última versión estable de Node
FROM node:alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el package.json y el package-lock.json a la carpeta de trabajo
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install

# Copia el resto de los archivos del proyecto a la carpeta de trabajo
COPY . .

# Expone el puerto en el que se ejecuta tu aplicación
EXPOSE 3000

# Inicia tu aplicación cuando se ejecute el contenedor
CMD ["node", "app.js"]