# Usa una imagen base oficial de Node.js
FROM node:16-alpine

# Crea y usa el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos de dependencias (package.json, package-lock.json)
COPY package*.json ./

# Instala las dependencias del proyecto (esto incluye Puppeteer)
RUN npm install

# Copia el resto de los archivos de tu proyecto al contenedor
COPY . .

# En Render no es necesario establecer variables específicas en Dockerfile,
# pero si quieres forzar la descarga de Chromium, asegúrate de no tener PUPPETEER_SKIP_DOWNLOAD
# y de ejecutar la instalación del browser.
# Por ejemplo, puedes hacer:
RUN npx puppeteer browsers install chromium

# Indica el puerto en el que corre tu aplicación (Render lo detectará)
EXPOSE 5000

# Comando para iniciar tu aplicación
CMD ["npm", "start"]
