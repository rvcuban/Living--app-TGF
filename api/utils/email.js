// config/email.js

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Cargar las variables de entorno

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587, // Usa 465 para SSL, 587 para TLS
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: 'apikey', // Este es el nombre de usuario que SendGrid usa
    pass: process.env.SENDGRID_API_KEY, // La API Key que creaste en SendGrid
  },
});

// Aumentar el límite de listeners a 20 (opcional)
transporter.setMaxListeners(20);

// Verificar la conexión del transportador
transporter.verify(function(error, success) {
  if (error) {
    console.error('Error en la configuración del transportador:', error);
  } else {
    console.log('Transportador está listo para enviar correos.');
  }
});

export default transporter;
