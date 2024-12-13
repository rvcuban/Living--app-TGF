FROM node:18-alpine

# Crear directorio de la app
WORKDIR /usr/src/app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Instalar Chrome estable con puppeteer
RUN npx puppeteer browsers install chrome@stable

# Exponer el puerto (asumiendo que tu app corre en 5000)
EXPOSE 5000

# Comando para iniciar tu servidor Node
CMD ["npm", "start"]
