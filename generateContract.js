const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

// Para manejar expresiones y lógica condicional
const expressions = require('expressions');
const createReport = require('docxtemplater').createReport;

const generateContract = (data) => {
  // Ruta a la plantilla
  const templatePath = path.resolve(__dirname, 'templates', 'contrato_template.docx');

  // Leer el contenido de la plantilla
  const content = fs.readFileSync(templatePath, 'binary');

  // Cargar el contenido en PizZip
  const zip = new PizZip(content);

  // Crear una instancia de Docxtemplater
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    // Configurar el parser para manejar expresiones
    parser: function (tag) {
      return {
        get: function (scope) {
          const expr = expressions.compile(tag);
          return expr(scope);
        },
      };
    },
  });

  try {
    // Asignar los datos al documento
    doc.render(data);
  } catch (error) {
    // Manejo de errores
    console.error('Error al renderizar el documento:', error);
    throw error;
  }

  // Generar el documento
  const buf = doc.getZip().generate({ type: 'nodebuffer' });

  // Crear la carpeta de salida si no existe
  const outputDir = path.resolve(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Guardar el documento generado
  const outputPath = path.resolve(outputDir, `contrato_${data.inquilinos[0].nombre.replace(/ /g, '_')}.docx`);
  fs.writeFileSync(outputPath, buf);

  return outputPath;
};

module.exports = generateContract;
