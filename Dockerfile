FROM node:18-alpine

WORKDIR /usr/src/app

# Instalar dependencias del backend
COPY package*.json ./
RUN npm install

# Instalar dependencias del frontend
COPY client/package*.json client/
RUN npm install --prefix client

# Ahora copiar todo el frontend incluido index.html
COPY client/ client/

# Ejecutar el build del frontend
RUN npm run build --prefix client

# Copiar el resto del backend
COPY . .

EXPOSE 5000
CMD ["npm", "start"]
