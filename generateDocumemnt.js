const generateContract = require('./generateContract');
const data = require('./testData');

try {
  const outputPath = generateContract(data);
  console.log(`Contrato generado correctamente: ${outputPath}`);
} catch (error) {
  console.error('Error al generar el contrato:', error);
}
