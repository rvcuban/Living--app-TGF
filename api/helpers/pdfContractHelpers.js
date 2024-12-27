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
    `Don/Doña ${data.nombrePropietario}, mayor de edad, con domicilio en ${data.domicilioPropietario} ` +
    `y DNI/Pasaporte/NIE número ${data.numIdentPropietario}.\n\n` +
    `Actúa en su propio nombre y representación (en adelante, el/los "Propietario/s").`
  );

  doc.moveDown();

  // Inquilino(s)
  doc.fontSize(12).text(
    `De otra parte,\n\n` +
    `Don/Doña ${data.nombreInquilino1}, mayor de edad, con domicilio en ${data.domicilioInquilino1} ` +
    `y DNI/Pasaporte/NIE número ${data.numIdentInquilino1}.\n\n` +
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

  doc.fontSize(12)
    .text(
      `1º.- Que el Propietario, es propietaria de la vivienda sita en ${data.direccionInmueble}, calle ${data.calleInmueble} (${data.descripcionInmueble}), ` +
      'El Propietario manifiesta expresamente que el Inmueble cumple con todos los requisitos y condiciones necesarias para ser destinado a satisfacer las necesidades permanentes de vivienda del Inquilino.\n\n' +
      '(En adelante, la vivienda y sus dependencias descritas, conjuntamente, el "Inmueble").\n\n' +
      `2º.- Que el Inquilino, manifiesta su interés en tomar en arrendamiento el citado Inmueble descrito en el Expositivo 1º, ` +
      'para su uso propio (y, en su caso, el de su familia) como vivienda habitual y permanente.\n\n' +
      `3º.- Ambas partes libremente reconocen entender y aceptar el presente CONTRATO DE ARRENDAMIENTO DE VIVIENDA (el "Contrato"), ` +
      'conforme a las disposiciones de la Ley 29/1994 de 24 de noviembre de Arrendamientos Urbanos (la "LAU"), reconociéndose mutuamente ' +
      'capacidad jurídica para suscribirlo, con sujeción a las siguientes:'
    )
    .moveDown(2);

}


/**
 * Añade las cláusulas (PRIMERA: OBJETO, etc.)
 */
export function addClausulasSection(doc, data) {
  doc
    .fontSize(14)
    .text('CLÁUSULAS', { underline: true })
    .moveDown();

  // PRIMERA: OBJETO
  addClausulaPrimera(doc, data);
  
  // SEGUNDA: PLAZO DE VIGENCIA
  addClausulaSegunda(doc, data);

  // TERCERA: ENTREGA DEL INMUEBLE
  addClausulaTercera(doc, data);

  // CUARTA: RENTA
  addClausulaCuarta(doc, data);

  // QUINTA: GARANTÍA DEL CONTRATO
  addClausulaQuinta(doc, data);

  // SEXTA: SERVICIOS Y GASTOS
  addClausulaSexta(doc, data);

  // SÉPTIMA: GASTOS DE REPARACIÓN Y CONSERVACIÓN
  addClausulaSeptima(doc, data);

  // OCTAVA: OBRAS EN EL INMUEBLE
  addClausulaOctava(doc, data);

  // NOVENA: DEVOLUCIÓN DEL INMUEBLE
  addClausulaNovena(doc, data);

  // DÉCIMA: DERECHO DE TANTEO Y RETRACTO
  addClausulaDecima(doc, data);

  // DÉCIMO PRIMERA: CAUSAS DE TERMINACIÓN DEL CONTRATO
  addClausulaDecimaPrimera(doc, data);

  // DÉCIMO SEGUNDA: PROTECCIÓN DE DATOS. INCLUSIÓN EN FICHERO DE MOROSIDAD
  addClausulaDecimaSegunda(doc, data);

  // DÉCIMO TERCERA: LEY APLICABLE Y JURISDICCIÓN
  addClausulaDecimaTercera(doc, data);

  // DÉCIMO CUARTA: NOTIFICACIONES
  addClausulaDecimaCuarta(doc, data);

  // DÉCIMO QUINTA: FIRMA DEL CONTRATO
  addClausulaDecimaQuinta(doc, data);
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



/**
 * Añade la cláusula PRIMERA: OBJETO
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaPrimera(doc, data) {
  doc
    .fontSize(13)
    .text('PRIMERA: OBJETO', { underline: true })
    .moveDown(1);

  doc
    .fontSize(12)
    .text(
      '1.1. El Propietario arrienda al Inquilino, que acepta en este acto, el Inmueble descrito en el Expositivo 1º, que el Inquilino acepta en este acto.\n\n' +
      '1.2. El Inquilino se compromete a usar dicho Inmueble exclusivamente como vivienda del Inquilino y de su familia directa, en su caso.\n\n' +
      '1.3. En relación con el uso del Inmueble, queda estrictamente prohibido:\n'
    )
    .moveDown(0.5);

  // Lista de prohibiciones
  const prohibiciones = [
    'a) Cualquier otro tipo de uso distinto al descrito en el apartado anterior.',
    'b) El subarrendamiento, total o parcial.',
    'c) La cesión del contrato sin el consentimiento previo y por escrito del Arrendador.',
    'd) El uso del Inmueble para comercio, industria ni oficina o despacho profesional.',
    'e) Destinarla al hospedaje de carácter vacacional.'
  ];

  prohibiciones.forEach(item => {
    doc.text(item, {
      indent: 20
    });
  });

  doc
    .fontSize(12)
    .text(
      '\nEl incumplimiento por el Inquilino de esta obligación esencial facultará al Propietario a resolver el presente Contrato.\n\n'
    )
    .moveDown();

  doc
    .fontSize(12)
    .text(
      `1.4. Por las dimensiones del Inmueble, el número máximo de personas que podrán ocuparlo es de ${data.numeroPersonas}, incluyendo al Inquilino.\n\n` +
      `1.5. ${data.comunidadPropietariosTexto}\n\n` +
      `1.6. Mascotas:\n\n` +
      (data.mascotasOpcion === 1 ?
        'Se prohíbe expresamente al Inquilino tener en el Inmueble cualquier tipo de animal doméstico, salvo consentimiento expreso por escrito del Propietario. El incumplimiento de la presente obligación será considerado causa suficiente para la resolución del Contrato, de conformidad con lo establecido en el artículo 27.1 de la vigente LAU.\n\n' :
        'Se permite expresamente al Inquilino tener en el Inmueble cualquier tipo de animal doméstico.\n\n')
    )
    .moveDown(2);
}

/**
 * Añade la cláusula SEGUNDA: PLAZO DE VIGENCIA
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaSegunda(doc, data) {
  doc
    .fontSize(13)
    .text('SEGUNDA: PLAZO DE VIGENCIA', { underline: true })
    .moveDown(1);

  doc
    .fontSize(12)
    .text(
      `2.1. El Contrato entrará en vigor en la fecha ${data.fechaEntradaVigor} con una duración inicial obligatoria de un (1) año a partir de la fecha de entrada en vigor del Contrato.\n\n` +
      `2.2. El Contrato se prorrogará tácitamente (sin necesidad de aviso previo) en cada anualidad hasta un máximo legal de cinco (5) años, salvo que el Inquilino manifieste al Propietario, con treinta (30) días de antelación a la fecha de terminación del Contrato o de cualquiera de sus prórrogas, su voluntad de no renovar el Contrato.\n\n` +
      `2.3. Una vez transcurridos como mínimo cinco (5) años de duración del Contrato, si ninguna de las Partes hubiese notificado a la otra, con al menos cuatro (4) meses de antelación en el caso del Propietario, o con al menos con dos (2) meses de antelación en el caso del Inquilino, a la fecha de finalización su voluntad de no renovar el Contrato, el Contrato se prorrogará obligatoriamente por anualidades hasta un máximo de tres (3) años, salvo que el Inquilino manifieste al arrendador con un mes de antelación a la fecha de terminación de cualquiera de las anualidades, su voluntad de no renovar el Contrato.\n\n` +
      `2.4. El Inquilino podrá desistir del Contrato una vez que hayan transcurrido al menos seis (6) meses a contar desde la fecha de entrada en vigor del Contrato, siempre que notifique por escrito con treinta (30) días de antelación al Propietario. El desistimiento dará lugar a una indemnización equivalente a la parte proporcional de la renta arrendaticia de una mensualidad con relación a los meses que falten por cumplir de un año.\n\n`
    )
    .moveDown(2);
}

/**
 * Añade la cláusula TERCERA: ENTREGA DEL INMUEBLE
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaTercera(doc, data) {
  doc
    .fontSize(13)
    .text('TERCERA: ENTREGA DEL INMUEBLE', { underline: true })
    .moveDown(1);

  doc
    .fontSize(12)
    .text(
      `3.1. El Propietario entrega al Inquilino el Inmueble en perfectas condiciones de habitabilidad, buen estado de conservación y funcionamiento de sus servicios y a la entera satisfacción de éste.\n\n`
    )
    .moveDown();

  doc
    .fontSize(12)
    .text(
      `[Opciones sobre el estado de la vivienda]:\n\n` +
      (data.opcionEstadoVivienda === 1 ?
        'Opción 1: Ambas Partes confirman que el Inmueble se entrega con cocina no equipada y vivienda sin muebles.\n\n' :
        (data.opcionEstadoVivienda === 2 ?
          'Opción 2: Ambas Partes confirman que el Inmueble se entrega con cocina equipada y vivienda sin muebles.\n\n' :
          'Opción 3: Ambas Partes confirman que el Inmueble se entrega con cocina equipada y vivienda amueblada.\n\n'))
    )
    .moveDown();

  if (data.inventarioAdjunto) {
    doc
      .fontSize(12)
      .text('Se adjunta como Anexo el inventario, con sus correspondientes fotos, recogiendo el detalle del mobiliario del Inmueble.\n\n')
      .moveDown();
  }

  doc
    .fontSize(12)
    .text(
      `3.2. En este acto el Propietario hace entrega al Inquilino de ${data.numeroLlaves} juegos de llaves completos de acceso al Inmueble.\n\n`
    )
    .moveDown();
}

/**
 * Añade la cláusula CUARTA: RENTA
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaCuarta(doc, data) {
  doc
    .fontSize(13)
    .text('CUARTA: RENTA', { underline: true })
    .moveDown(1);

  doc
    .fontSize(12)
    .text('Renta arrendaticia\n\n')
    .moveDown();

  doc
    .fontSize(12)
    .text(
      `4.1. Ambas Partes acuerdan fijar una renta anual de ${data.rentaAnual} EUROS (€), que será pagada por el Inquilino en doce (12) mensualidades iguales de ${data.rentaMensual} EUROS (€) cada una de ellas.\n\n` +
      (data.zonaResidencialTensionada ?
        `Sólo para el caso de que la vivienda esté ubicada en una zona de mercado residencial tensionado y haya estado alquilada en los últimos cinco (5) años: En cumplimiento de lo dispuesto en el artículo 31.3 de la Ley 12/2023, de 24 de mayo, se informa de que la cuantía de la última renta del contrato de arrendamiento, vigente en los últimos cinco (5) años en la misma vivienda, es de ${data.rentaAnterior} EUROS (€) y el valor que resulta de su actualización es de ${data.rentaActualizada} EUROS (€).\n\n` : '')
    )
    .moveDown();

  doc
    .fontSize(12)
    .text(
      `4.2. La falta de pago de una (1) mensualidad de renta será causa suficiente para que el Propietario pueda dar por resuelto este Contrato y ejercite la acción de desahucio.\n\n` +
      'Inicio del devengo de la renta\n\n' +
      (data.devengoRentaOpcion === 1 ?
        `4.3. Se establece que la renta se devengará a partir de la fecha de entrada en vigor del presente Contrato. El Inquilino paga al Propietario el importe de la renta correspondiente a los días que quedan para finalizar el mes en curso, que el Propietario declara haber recibido a su entera satisfacción, sirviendo el presente Contrato como recibo de pago.\n\n` :
        `4.3. Se establece que la renta se devengará a partir del día 1 del mes siguiente a la fecha de entrada en vigor del presente Contrato.\n\n`)
    )
    .moveDown();

  // Método de pago
  if (data.metodoPago === 1) {
    // Opción 1: Transferencia bancaria
    doc
      .fontSize(12)
      .text(
        '4.4. El método de pago será mediante transferencia bancaria. El Inquilino abonará la renta por mensualidades anticipadas, dentro de los cinco (5) primeros días laborables de cada mes, mediante transferencia bancaria a la siguiente cuenta titularidad del Propietario:\n\n' +
        `Titular: ${data.titularCuentaPropietario}. Entidad: ${data.entidadPropietario}.\n` +
        `Nº de Cuenta/IBAN: ${data.cuentaPropietario}.\n\n`
      )
      .moveDown();
  } else if (data.metodoPago === 2) {
    // Opción 2: Domiciliación bancaria
    doc
      .fontSize(12)
      .text(
        '4.4. El método de pago será por domiciliación bancaria. El Inquilino abonará la renta del presente Contrato por mensualidades anticipadas, dentro de los cinco (5) primeros días de cada mes, mediante domiciliación bancaria con cargo en la siguiente cuenta titularidad del Inquilino:\n\n' +
        `Entidad: ${data.entidadInquilino}.\n` +
        `Nº de Cuenta/IBAN: ${data.cuentaInquilino}.\n\n`
      )
      .moveDown();
  }

  // Actualización de la renta
  if (data.actualizacionRenta === 1) {
    // Opción 1: No actualizar renta
    // No se añade nada
  } else if (data.actualizacionRenta === 2) {
    // Opción 2: Actualizar renta
    doc
      .fontSize(12)
      .text(
        '4.5. La renta pactada será actualizada anualmente y de manera acumulativa, en cada ' +
        `${data.fechaActualizacionRenta}, conforme a las variaciones que experimente el índice General Nacional del Sistema de Precios al Consumo ("I.P.C."), ` +
        'publicado por el Instituto Nacional de Estadística teniendo en consideración las variaciones en los doce (12) meses inmediatamente anteriores.\n\n' +
        (data.actualizacionNegativa ?
          '4.5.1. En caso de que la variación experimentada por el I.P.C. fuera negativa, la renta permanecerá igual, sin actualizarse.\n\n' : '') +
        '4.6. Dada la demora con que se publica el I.P.C, las Partes acuerdan que las revisiones anuales tendrán efectos retroactivos a la fecha en que hubiera correspondido su aplicación, quedando obligadas las Partes (según corresponda) a satisfacer las diferencias correspondientes de una sola vez. La revisión se efectuará por años naturales, repercutiendo en el recibo emitido al mes siguiente de la publicación del IPC los atrasos habidos desde el mes de enero del año en curso, o, en su caso desde el mes de la firma del contrato. En ningún caso, la demora en aplicar la revisión supondrá renuncia o caducidad de la misma. En el caso de que el Instituto Nacional de Estadística dejase de publicar los índices a que se refiere esta Cláusula, la revisión que se establece se calculará en base a los índices o módulos que los sustituyan.\n\n' +
        '4.7. Sin perjuicio de todo lo anterior, si la legislación aplicable sustituye de forma imperativa el I.P.C. por otro índice de referencia que deba ser de aplicación, se calculará la actualización de la renta de conformidad con el índice de referencia que sea de obligado cumplimiento en cada momento.\n\n'
      )
      .moveDown();

    // Actualización negativa ya se manejó arriba
  }

  doc.moveDown(2);
}

/**
 * Añade la cláusula QUINTA: GARANTÍA DEL CONTRATO
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaQuinta(doc, data) {
  doc
    .fontSize(13)
    .text('QUINTA: GARANTÍA DEL CONTRATO', { underline: true })
    .moveDown(1);

  // Fianza arrendaticia
  doc
    .fontSize(12)
    .text('Fianza arrendaticia\n\n');

  if (data.fianzaOpcion === 1) {
    // Opción 1: Fianza en metálico
    doc
      .fontSize(12)
      .text(
        `5.1. El Inquilino entrega en la entrega de llaves al Propietario, quien declara recibirla, la cantidad de ${data.valorFianza} EUROS (€), ` +
        `equivalente a ${data.numeroMesesFianza} mensualidad de renta, por concepto de fianza legal, según lo establecido en el apartado primero del Artículo 36 de la LAU para garantizar el cumplimiento de las obligaciones que asume en virtud del presente Contrato.\n\n`
      )
      .moveDown();
  } else if (data.fianzaOpcion === 2) {
    // Opción 2: Fianza en transferencia
    doc
      .fontSize(12)
      .text(
        `5.1. El Inquilino entrega en este acto al Propietario, quien declara recibirla, la cantidad de ${data.valorFianza} EUROS (€), ` +
        `equivalente a ${data.numeroMesesFianza} mensualidad de renta, por concepto de fianza legal, según lo establecido en el apartado primero del Artículo 36 de la LAU para garantizar el cumplimiento de las obligaciones que asume en virtud del presente Contrato.\n\n`
      )
      .moveDown();
  }

  // Garantía adicional
  if (data.garantiaAdicionalOpcion === 1) {
    // Opción 1: Depósito
    doc
      .fontSize(12)
      .text(
        `5.5. A efectos de garantizar el fiel cumplimiento del presente Contrato:\n\n` +
        `- El Inquilino entrega en la entrega de llaves al Propietario, mediante ${data.formaDeposito}, quien declara recibirla, la cantidad de ${data.valorDeposito} EUROS (€), ` +
        `en concepto de garantía adicional, para garantizar el cumplimiento de las obligaciones que asume en virtud del presente Contrato.\n\n`
      )
      .moveDown();
  } else if (data.garantiaAdicionalOpcion === 2) {
    // Opción 2: Aval bancario
    doc
      .fontSize(12)
      .text(
        `5.5. A efectos de garantizar el fiel cumplimiento del presente Contrato:\n\n` +
        `El Inquilino entrega en este acto un aval bancario por un importe máximo garantizado de ${data.valorAval} EUROS (€), a primer requerimiento y como garantía de todas las responsabilidades económicas asumidas por el Inquilino en virtud del presente Contrato. El referido aval se incorpora al presente Contrato como Anexo. El/los Inquilino(s) se compromete a mantener vigente el referido Aval durante toda la vigencia del Contrato.\n\n`
      )
      .moveDown();
  }

  doc
    .fontSize(12)
    .text(
      `5.2. Para aquellas comunidades autónomas en las que sea necesario depositar la fianza: El Propietario se compromete a depositar la fianza en el organismo u oficina pública correspondiente a la Comunidad Autónoma en la que se encuentra el Inmueble.\n\n` +
      `5.3. El importe de la fianza servirá para cubrir cualquier desperfecto o daño tanto en el Inmueble como en su mobiliario (según corresponda) así como garantizar el cumplimiento de las obligaciones que asume el Inquilino en virtud de este Contrato.\n\n` +
      `5.4. Durante los primeros cinco (5) años de duración del Contrato, la fianza no estará sujeta a actualización, transcurrido dicho plazo, se actualizará en la cuantía que corresponda hasta que aquella sea igual a una mensualidad de la renta vigente en cada momento.\n\n`
    )
    .moveDown(2);
}

/**
 * Añade la cláusula SEXTA: SERVICIOS Y GASTOS
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaSexta(doc, data) {
  doc
    .fontSize(13)
    .text('SEXTA: SERVICIOS Y GASTOS', { underline: true })
    .moveDown(1);

  // 6.1
  doc
    .fontSize(12)
    .text(
      '6.1. El Inquilino se obliga a pagar cualquier gasto relacionado con la contratación de los servicios y suministros individualizados por aparatos contadores (tales como luz, agua, gas, teléfono e internet) con los que cuenta el Inmueble y que serán íntegramente asumidos por el Inquilino a partir de ' +
      `${data.fechaInicioPagoSuministros}.\n\n`
    )
    .moveDown();

  // 6.2: Titularidad suministros
  if (data.titularidadSuministrosOpcion === 1) {
    // Opción 1: Cambio de titularidad
    doc
      .fontSize(12)
      .text(
        `6.2. El Inquilino se pondrá en contacto con las diferentes compañías suministradoras para:\n\n` +
        `a) Que los recibos que emitan se carguen en la cuenta bancaria que el mismo indique, quedando, en consecuencia, obligado a la domiciliación bancaria de dichos recibos; y\n` +
        `b) Realizar el cambio de titularidad de cada suministro.\n\n`
      )
      .moveDown();
  } else if (data.titularidadSuministrosOpcion === 2) {
    // Opción 2: No cambio de titularidad
    doc
      .fontSize(12)
      .text(
        `6.2. El Inquilino se pondrá en contacto con las diferentes compañías suministradoras para que los recibos que emitan se carguen en la cuenta bancaria que el mismo indique, quedando, en consecuencia, obligado a la domiciliación bancaria de dichos recibos, ` +
        `sin que ello conlleve el cambio de titularidad de cada suministro, que seguirá a nombre del Propietario.\n\n`
      )
      .moveDown();
  }

  // 6.3: Gastos comunidad e IBI
  doc
    .fontSize(12)
    .text(
      '6.3. Gastos comunidad e IBI\n\n' +
      (data.gastosComunidadIBIOpcion === 1 ?
        'Los gastos de Comunidad de Propietarios así como el Impuesto sobre Bienes Inmuebles (I.B.I.), serán satisfechos íntegramente por el Propietario.\n\n' :
        (data.gastosComunidadIBIOpcion === 2 ?
          'Los gastos de Comunidad de Propietarios así como el Impuesto sobre Bienes Inmuebles (I.B.I.), serán satisfechos íntegramente por el Inquilino.\n\n' :
          'Los gastos de Comunidad de Propietarios serán por cuenta del Inquilino, si bien el Impuesto sobre Bienes Inmuebles (I.B.I.), será satisfecho íntegramente por el Propietario.\n\n'))
    )
    .moveDown();

  // 6.4: Pago de tasas
  doc
    .fontSize(12)
    .text(
      '6.4. Pago de tasas\n\n' +
      (data.pagoTasasOpcion === 1 ?
        'La tasa por recogida de residuos sólidos urbanos y la tasa por paso de carruajes (en su caso) será de cuenta del Inquilino.\n\n' :
        'La tasa por recogida de residuos sólidos urbanos y la tasa por paso de carruajes (en su caso) será de cuenta del Propietario.\n\n')
    )
    .moveDown();

  // 6.5
  doc
    .fontSize(12)
    .text(
      '6.5. El Propietario no asume responsabilidad alguna por las interrupciones que pudieran producirse en cualquiera de los servicios comunes o individuales, ni estará obligado a efectuar revisiones de renta por dichas interrupciones.\n\n'
    )
    .moveDown(2);
}

/**
 * Añade la cláusula SÉPTIMA: GASTOS DE REPARACIÓN Y CONSERVACIÓN
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaSeptima(doc, data) {
  doc
    .fontSize(13)
    .text('SÉPTIMA: GASTOS DE REPARACIÓN Y CONSERVACIÓN', { underline: true })
    .moveDown(1);

  doc
    .fontSize(12)
    .text(
      `7.1. El Propietario se obliga a realizar las reparaciones que fueran necesarias en el Inmueble para conservar la vivienda en condiciones de habitabilidad para el uso convenido, salvo las derivadas de la negligencia o culpa o debido al desgaste ocasionado por el uso ordinario del Inmueble por parte del Inquilino o sus ocupantes, incluidas las de los electrodomésticos y demás instalaciones del Inmueble. El Inquilino será el único responsable de cuantos daños, tanto físicos como materiales puedan ocasionarse a terceros, como consecuencia, directa e indirecta de su habitabilidad en el Inmueble, eximiendo de toda responsabilidad al Propietario, incluso por daños derivados de instalaciones para servicios o suministros.\n\n` +
      (data.clausulaReparacionOpcion === 1 ?
        'En caso de que el Inquilino realice reparaciones necesarias para el mantenimiento y correcto funcionamiento de los electrodomésticos y/o muebles del Inmueble cuando los desperfectos hayan sido ocasionados por el Inquilino o sus ocupantes, ya sea por un uso negligente o por el desgaste derivado del uso habitual y diligente de dichos elementos. En consecuencia, el Inquilino declara conocer el estado de los electrodomésticos y/o muebles en el momento de la entrega del Inmueble.\n\n' :
        '')
    )
    .moveDown();
}

/**
 * Añade la cláusula OCTAVA: OBRAS EN EL INMUEBLE
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaOctava(doc, data) {
  doc
    .fontSize(13)
    .text('OCTAVA: OBRAS EN EL INMUEBLE', { underline: true })
    .moveDown(1);

  doc
    .fontSize(12)
    .text(
      `8.1. El Inquilino no podrá realizar obras, instalaciones, ni mejoras de ningún tipo en el Inmueble sin el expreso consentimiento previo del Propietario por escrito. Especialmente, se requerirá el consentimiento escrito del Propietario para:\n\n` +
      `a) La instalación de cualquier electrodoméstico, mueble o aparato de aire acondicionado adherido al Inmueble; y\n` +
      `b) Realizar cualquier tipo de alteraciones en las paredes, azulejos y baldosas del Inmueble (en particular, cualquier tipo de orificios o ranuras de forma manual o con herramientas mecánicas).\n\n` +
      (data.obrasComunidadPropietarios ?
        'Que, en todo caso, habrá de cumplir con la normativa de la Comunidad de Propietarios.\n\n' :
        '')
    )
    .moveDown();

  doc
    .fontSize(12)
    .text(
      `8.2. A la terminación del presente Contrato de arrendamiento, las obras y mejoras quedarán en beneficio del Inmueble, sin derecho del Inquilino a resarcirse de ellas, salvo pacto en contrario.\n\n` +
      `8.3. En el supuesto de que el Inquilino realizase obras sin el permiso previo del Propietario, éste podrá instar la resolución del presente Contrato y exigir al Inquilino la reposición del Inmueble a su estado originario.\n\n`
    )
    .moveDown(2);
}

/**
 * Añade la cláusula NOVENA: DEVOLUCIÓN DEL INMUEBLE
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaNovena(doc, data) {
  doc
    .fontSize(13)
    .text('NOVENA: DEVOLUCIÓN DEL INMUEBLE', { underline: true })
    .moveDown(1);

  doc
    .fontSize(12)
    .text(
      `9.1. Llegada la fecha de terminación del presente Contrato y, en su caso la de cualquiera de sus prórrogas, el Inquilino deberá abandonar el Inmueble sin que sea necesario para ello requerimiento alguno por parte del Propietario.\n\n` +
      `9.2. El Inquilino se compromete desde ahora y para entonces a devolver el Inmueble y las llaves del mismo en la fecha de terminación del presente Contrato entregándolo en perfecto estado, sin más deterioros que los que se hubieran producido por el mero paso del tiempo y el uso ordinario, libre de los enseres personales del Inquilino y totalmente desocupado.\n\n` +
      `9.3. El Inquilino se obliga expresamente a reparar cualquier desperfecto (a modo ejemplificativo: azulejos, baldosas, armarios, marcos de madera, grifería o sanitarios, etc.) antes de su devolución al Propietario.\n\n` +
      `9.4. El retraso en el desalojo del Inmueble por parte del Inquilino devengará a favor del Propietario, en concepto de penalización por cada día de retraso, un importe igual al doble de la renta diaria que estuviera vigente en ese momento. Todo ello, sin perjuicio de la obligación del Inquilino de abandonar el Inmueble de inmediato.\n\n`
    )
    .moveDown(2);
}

/**
 * Añade la cláusula DÉCIMA: DERECHO DE TANTEO Y RETRACTO
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaDecima(doc, data) {
  doc
    .fontSize(13)
    .text('DÉCIMA: DERECHO DE TANTEO Y RETRACTO', { underline: true })
    .moveDown(1);

  doc
    .fontSize(12)
    .text(
      (data.derechoTanteoOpcion === 1 ?
        '10.1. El Inquilino renuncia expresamente a los derechos de tanteo y retracto que por dicha condición pudieren corresponderle.\n\n' :
        '10.1. Corresponden al Inquilino los derechos de tanteo y retracto a los que se refiere el artículo 25 de la vigente LAU.\n\n')
    )
    .moveDown(2);
}

/**
 * Añade la cláusula DÉCIMO PRIMERA: CAUSAS DE TERMINACIÓN DEL CONTRATO
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaDecimaPrimera(doc, data) {
  doc
    .fontSize(13)
    .text('DÉCIMO PRIMERA: CAUSAS DE TERMINACIÓN DEL CONTRATO', { underline: true })
    .moveDown(1);

  doc
    .fontSize(12)
    .text(
      '11.1. Serán causas de terminación del Contrato, además de las legalmente establecidas y las previstas en este Contrato, las que se mencionan a continuación:\n' +
      'a) A efectos del artículo 14 de la LAU y a cuantos otros pudieran resultar pertinentes, la enajenación del Inmueble extinguirá el arrendamiento.\n' +
      'b) Una vez transcurrido el primer año de duración del Contrato, en caso de necesidad del Propietario de ocupar el Inmueble antes del transcurso de cinco años, para destinarla a vivienda permanente para sí o sus familiares en primer grado de consanguinidad o por adopción o para su cónyuge en los supuestos de sentencia firme de separación, divorcio o nulidad matrimonial de conformidad con el artículo 9.3 de la LAU. El Propietario deberá comunicar dicha necesidad con al menos dos meses de antelación a la fecha en la que la vivienda se vaya a necesitar y el Inquilino estará obligado a entregar el Inmueble en dicho plazo si las partes no llegan a un acuerdo distinto.\n\n'
    )
    .moveDown(2);
}

/**
 * Añade la cláusula DÉCIMO SEGUNDA: PROTECCIÓN DE DATOS. INCLUSIÓN EN FICHERO DE MOROSIDAD
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaDecimaSegunda(doc, data) {
  doc
    .fontSize(13)
    .text('DÉCIMO SEGUNDA: PROTECCIÓN DE DATOS. INCLUSIÓN EN FICHERO DE MOROSIDAD', { underline: true })
    .moveDown(1);

  doc
    .fontSize(12)
    .text(
      `12.1. Los datos personales que el Inquilino facilita en el presente contrato y que pueda facilitar en el futuro son necesarios para la celebración del presente contrato, y serán tratados por el Propietario con la finalidad de gestionar el contrato de arrendamiento de la vivienda y sobre la base de la ejecución de dicha relación contractual. El Propietario no comunicará los datos personales del Inquilino a terceros, salvo cuando sea necesario para el cumplimiento de obligaciones legales, sin perjuicio de que los prestadores de servicios de gestión administrativa del Propietario puedan tener acceso a los datos personales del Inquilino para la prestación de dichos servicios. El Propietario no llevará a cabo transferencias internacionales de datos personales.\n\n` +
      `El Propietario conservará los datos en tanto que la relación contractual se mantenga vigente, conservándolos posteriormente, debidamente bloqueados, por el plazo de prescripción de las acciones de acuerdo con la normativa civil aplicable.\n\n` +
      `El Inquilino podrá ejercitar sus derechos de acceso, rectificación, supresión y a la portabilidad de sus datos, así como a la limitación del tratamiento de los mismos, dirigiéndose al Propietario en la dirección que figura en el encabezamiento del presente contrato, y acreditando debidamente su identidad. Asimismo, el Inquilino tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos.\n\n` +
      `12.2. El Propietario informa al Inquilino que en caso de impago de las cantidades de la renta, sus datos personales podrán ser cedidos al fichero de solvencia patrimonial negativo gestionado por Base de Datos de Morosidad Inmobiliaria, S.L.U. (https://www.idealista.com/base-datos-inquilinos-morosos/) en base al interés legítimo de prevención del fraude mediante el proceso de https://www.idealista.com/base-datos-inquilinos-morosos/como-incluir-morosos. En caso de incorporación de los datos de impagos del Inquilino en un fichero de solvencia patrimonial negativo, el Inquilino recibirá, en el plazo máximo de un mes desde la inscripción de la deuda en el fichero, una comunicación del titular de dicho fichero informándole de la incorporación de sus datos personales en el mismo.\n\n`
    )
    .moveDown(2);
}

/**
 * Añade la cláusula DÉCIMO TERCERA: LEY APLICABLE Y JURISDICCIÓN
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaDecimaTercera(doc, data) {
  doc
    .fontSize(13)
    .text('DÉCIMO TERCERA: LEY APLICABLE Y JURISDICCIÓN', { underline: true })
    .moveDown(1);

  doc
    .fontSize(12)
    .text(
      `13.1. De conformidad con lo previsto en el artículo 4, apartado 2 de la vigente LAU, el presente Contrato se regirá por la voluntad de las Partes manifestada en el Contrato, en su defecto, por lo dispuesto en el Título II de la mencionada LAU y, supletoriamente, por lo dispuesto en el Código Civil.\n\n` +
      `13.2. La competencia para conocer de cualquier controversia relacionada con el presente Contrato corresponderá a los juzgados y tribunales del lugar en el que radique el Inmueble.\n\n`
    )
    .moveDown(2);
}

/**
 * Añade la cláusula DÉCIMO CUARTA: NOTIFICACIONES
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaDecimaCuarta(doc, data) {
  doc
    .fontSize(13)
    .text('DÉCIMO CUARTA: NOTIFICACIONES', { underline: true })
    .moveDown(1);

  doc
    .fontSize(12)
    .text(
      `14.1. Todas las notificaciones, requerimientos, peticiones y otras comunicaciones que hayan de efectuarse en relación con el presente Contrato deberán realizarse por escrito y se entenderá que han sido debidamente recibidas cuando hayan sido entregadas en mano o bien remitidas por correo certificado a las direcciones que figuran en el encabezamiento del presente Contrato, o a las direcciones que cualquiera de las Partes comunique a la otra por escrito en la forma prevista en esta cláusula.\n\n` +
      `14.2. Asimismo, y a fin de facilitar las comunicaciones entre las partes se designan las siguientes direcciones de correo electrónico, siempre que se garantice la autenticidad de la comunicación y de su contenido y quede constancia fehaciente de la remisión y recepción íntegras y del momento en que se hicieron:\n\n` +
      `Por el Inquilino:\n` +
      `- Mail: ${data.mailInquilino}\n` +
      `- Número de teléfono: ${data.telefonoInquilino}\n\n` +
      `Por el Propietario:\n` +
      `- Mail: ${data.mailPropietario}\n` +
      `- Número de teléfono: ${data.telefonoPropietario}\n\n`
    )
    .moveDown(2);
}

/**
 * Añade la cláusula DÉCIMO QUINTA: FIRMA DEL CONTRATO
 * @param {PDFDocument} doc 
 * @param {Object} data 
 */
function addClausulaDecimaQuinta(doc, data) {
  doc
    .fontSize(13)
    .text('DÉCIMO QUINTA: FIRMA DEL CONTRATO', { underline: true })
    .moveDown(1);

  doc
    .fontSize(12)
    .text(
      'Las partes aceptan el presente contrato, así como sus correspondientes anexos y sus efectos jurídicos y se comprometen a su cumplimiento de buena fe.\n\n'
    )
    .moveDown();
}
