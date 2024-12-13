FROM node:18-alpine

# Crear directorio de la app
WORKDIR /usr/src/app

# Copiar package.json e instalar dependencias (del backend)
COPY package*.json ./
RUN npm install

# Instalar dependencias y construir el frontend
COPY client/package*.json client/
RUN npm install --prefix client
RUN npm run build --prefix client

# Copiar el resto del código del backend
COPY . .

# Asegúrate que el servidor Node sirva los archivos estáticos desde client/dist
# Por ejemplo, si tu servidor Node usa express.static('client/dist'):
# ya tienes los archivos construidos en client/dist debido a los pasos anteriores.

EXPOSE 5000
CMD ["npm", "start"]
