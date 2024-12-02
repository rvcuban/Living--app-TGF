// api/utils/firebaseAdmin.js

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Definir __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer las credenciales del archivo JSON
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'secrets/serviceAccountKey.json'), 'utf8')
);

// Inicializar la aplicación con las credenciales del servicio
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'livingapp-ce503.appspot.com', // Reemplaza con tu bucket de Firebase Storage
});

// Exportar el bucket para usarlo en otros archivos
const bucket = admin.storage().bucket();
export default bucket;
