FROM ghcr.io/puppeteer/puppeteer:latest

ENV PUPPETEER_SKIP_CHROMIUN_DOWNLOAD=tur \
    PUPPETEER__EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/bin/app

COPY package*.json ./
RUN npm ci 
COPY . .
CMD ["node", "api/index.js"]