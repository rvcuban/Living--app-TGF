// api/helpers/pdfContractHelpers.js

import PDFDocument from 'pdfkit';

/**
 * Añade la portada o cabecera del contrato.
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
export function addContractHeader(doc, data) {
  doc
    .fontSize(18)
    .text('CONTRATO DE ARRENDAMIENTO DE VIVIENDA', { align: 'center' });
  
  doc.moveDown();
  doc.fontSize(12).text(`En ${data.lugar} a fecha de ${data.fecha}.`, {
    align: 'left',
  });
  doc.moveDown(2);
}

/**
 * Añade la sección "Reunidos".
 */
export function addReunidosSection(doc, data) {
  doc.fontSize(14).text('REUNIDOS', { underline: true });
  doc.moveDown();

  // Propietario
  doc.fontSize(12).text(
    `De una parte,\n\n` +
    `Don/Doña ${data.nombrePropietario}, mayor de edad, de nacionalidad ${data.nacionalidadPropietario}, con domicilio en ${data.domicilioPropietario} ` +
    `y DNI/Pasaporte/NIE número ${data.numIdentPropietario}.\n\n` +
    `Actúa en su propio nombre y representación (en adelante, el/los "Propietario/s").`
  );
  
  doc.moveDown();

  // Inquilino(s)
  doc.fontSize(12).text(
    `De otra parte,\n\n` +
    `Don/Doña ${data.nombreInquilino1}, mayor de edad, de nacionalidad ${data.nacionalidadInquilino1}, con domicilio en ${data.domicilioInquilino1} ` +
    `y DNI/Pasaporte/NIE número ${data.numIdentInquilino1}.\n\n` +
    `Don/Doña ${data.nombreInquilino2}, mayor de edad, de nacionalidad ${data.nacionalidadInquilino2}, con domicilio en ${data.domicilioInquilino2} ` +
    `y DNI/Pasaporte/NIE número ${data.numIdentInquilino2}.\n\n` +
    `(en adelante, el/los "Inquilino/s").`
  );

  doc.moveDown();

  // Breve texto 
  doc.fontSize(12).text(
    'El Propietario y el Inquilino serán denominadas conjuntamente como las “Partes”.\n\n' +
    'Ambas partes, en la calidad con la que actúan, se reconocen recíprocamente capacidad jurídica ' +
    'para contratar y obligarse, y en especial para el otorgamiento del presente CONTRATO DE ARRENDAMIENTO DE VIVIENDA, y'
  );
  doc.moveDown(2);
}

/**
 * Añade la sección EXPONEN con los puntos 1º, 2º, 3º...
 */
export function addExponenSection(doc, data) {
  doc.fontSize(14).text('EXPONEN', { underline: true });
  doc.moveDown();

  doc.fontSize(12).text(
    `1º.- Que el Propietario es propietario de la vivienda sita en ${data.direccionInmueble} (descripción: ${data.descripcionInmueble}), etc...`
  );
  doc.moveDown();

  // Ejemplo de bullet points
  doc.text('- REF. CATASTRAL: ' + data.refCatastral);
  doc.text('- Comunidad de propietarios: ' + (data.comunidadPropietariosDesc || 'No especificado'));
  doc.text('- Nº Cédula de habitabilidad: ' + (data.cedulaHabitabilidad || '[No consta]'));
  doc.text('- Certificado de eficiencia energética: ' + (data.certEficEnergetica || '[No consta]'));
  
  doc.moveDown();

  doc.text(
    'El Propietario manifiesta expresamente que el Inmueble cumple con todos los requisitos y condiciones necesarias ' +
    'para ser destinado a satisfacer las necesidades permanentes de vivienda del Inquilino.\n\n' +
    '(En adelante, la vivienda y sus dependencias descritas, conjuntamente, el "Inmueble").'
  );

  doc.moveDown(2);

  // 2º
  doc.text(
    '2º.- Que el Inquilino manifiesta su interés en tomar en arrendamiento el citado Inmueble descrito en el Expositivo 1º, ' +
    'para su uso propio (y, en su caso, el de su familia) como vivienda habitual y permanente.'
  );
  doc.moveDown(2);

  // 3º
  doc.text(
    '3º.- Ambas partes libremente reconocen entender y aceptar el presente CONTRATO DE ARRENDAMIENTO DE VIVIENDA ' +
    '(el "Contrato"), conforme a las disposiciones de la Ley 29/1994 de 24 de noviembre de Arrendamientos Urbanos (la "LAU"), ' +
    'reconociéndose mutuamente capacidad jurídica para suscribirlo, con sujeción a las siguientes:'
  );
  doc.moveDown(2);
}

/**
 * Añade las cláusulas (PRIMERA: OBJETO, etc.)
 */
export function addClausulas(doc, data) {
  doc.fontSize(14).text('CLÁUSULAS', { underline: true });
  doc.moveDown();

  // PRIMERA: OBJETO
  doc.fontSize(13).text('PRIMERA: OBJETO', { underline: true });
  doc.moveDown(1);

  doc.fontSize(12).text(
    '1.1. El Propietario arrienda al Inquilino, que acepta en este acto, el Inmueble descrito ' +
    'en el Expositivo 1º, que el Inquilino acepta en este acto.\n\n' +
    '1.2. El Inquilino se compromete a usar dicho Inmueble exclusivamente como vivienda del Inquilino ' +
    'y de su familia directa, en su caso.\n\n' +
    '1.3. En relación con el uso del Inmueble, queda estrictamente prohibido:\n' +
    '    a) Cualquier otro tipo de uso distinto...\n' +
    '    b) El subarrendamiento...\n' +
    '    c) La cesión...\n' +
    '    d) El uso del inmueble para comercio, industria...\n' +
    '    e) Destinarla al hospedaje...\n\n' +
    'El incumplimiento por el Inquilino de esta obligación esencial facultará al Propietario a resolver el presente Contrato.\n\n' +
    '1.4. Por las dimensiones del Inmueble, el número máximo de personas...\n\n' +
    '1.5. (Comunidad de propietarios)...\n\n' +
    '1.6. Mascotas:\n' +
    '    [Opción 1: ...] etc.\n'
  );
  doc.moveDown(2);

  // SEGUNDA: PLAZO DE VIGENCIA ...
  // Y así sucesivamente
}

/**
 * Añade firma final, etc.
 */
export function addFirma(doc, data) {
  doc.addPage(); // por ejemplo, si quieres que la firma esté en una página nueva

  doc.fontSize(12).text(
    `En ${data.lugar}, a fecha de ${data.fecha}.\n\n\n` +
    'El Propietario:\n\n' +
    '__________________________\n' +
    `[${data.nombrePropietario}]\n\n\n` +
    'El/Los Inquilino/s:\n\n' +
    '__________________________\n' +
    `[${data.nombreInquilino1}]\n\n\n` +
    '__________________________\n' +
    `[${data.nombreInquilino2}]`
  );
}
