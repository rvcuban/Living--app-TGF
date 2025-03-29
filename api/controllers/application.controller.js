// controllers/application.controller.js

import Application from '../models/application.model.js';
import Listing from '../models/listing.model.js';
import { errorHandle } from '../utils/error.js';
import transporter from '../utils/email.js';
import User from '../models/user.model.js';
import bucket from '../utils/firebaseAdmin.js'; // Ajusta la ruta según tu estructura de carpetas

import { dirname, join } from 'path';

import { fileURLToPath } from 'url';




// Importamos nuestros helpers:
import {
  addContractHeader,
  addReunidosSection,
  addExponenSection,
  addClausulasSection,
  addFirma,
} from '../helpers/pdfContractHelpers.js';

import PDFDocument from 'pdfkit';



// Definir __filename y __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



export const getUserApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate('listingId') // Popula los datos de la propiedad
      .exec();
    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    next(errorHandle(500, 'Error al obtener las aplicaciones.'));
  }
};

// Crear una nueva aplicación
export const createApplication = async (req, res, next) => {
  const { listingId } = req.body;

  if (!listingId) {
    return next(errorHandle(400, 'listingId es requerido.'));
  }

  try {
    // Verificar que la propiedad exista
    const property = await Listing.findById(listingId);
    if (!property) {
      return next(errorHandle(404, 'Propiedad no encontrada.'));
    }

    // Verificar si ya existe una aplicación para esta propiedad por el mismo usuario
    const existingApplication = await Application.findOne({ userId: req.user.id, listingId });
    if (existingApplication) {
      return next(errorHandle(400, 'Ya has aplicado a esta propiedad.'));
    }

    const newApplication = new Application({
      userId: req.user.id,
      listingId,
      status: 'Enviada',
      history: [{ status: 'Enviada', timestamp: new Date() }],
      rentalDurationMonths: req.body.rentalDurationMonths,
    });

    await newApplication.save();
    await Listing.findByIdAndUpdate( // hago esto para añadir la appplication al schema del listing en un vector de appilcations 
      listingId,
      { $push: { applications: newApplication._id } },
      { new: true }
    );

    res.status(201).json({ success: true, application: newApplication });
  } catch (error) {
    console.error('Error creating application:', error);
    next(errorHandle(500, 'Error al crear la aplicación.'));
  }
};

// Cancelar una aplicación específica
export const cancelApplication = async (req, res, next) => {
  const { applicationId } = req.params;

  console.log('Intentando cancelar la aplicación:', applicationId);
  console.log('Usuario autenticado:', req.user);

  try {
    const application = await Application.findById(applicationId);
    if (!application) {
      console.log('Aplicación no encontrada.');
      return next(errorHandle(404, 'Aplicación no encontrada.'));
    }

    // Verificar que la aplicación pertenece al usuario (dado que las dos partes deben poder cancelar la applicaction quiote la comprobacion)
    /*if (application.userId.toString() !== req.user.id) {
      console.log('Usuario no autorizado para cancelar esta aplicación.');
      return next(errorHandle(401, 'No estás autorizado para cancelar esta aplicación.'));
    }*/

    await application.deleteOne(); //borro la pplication
    console.log('Aplicación cancelada correctamente.');
    await Listing.findByIdAndUpdate( //la borro del array de Listings
      application.listingId,
      { $pull: { applications: application._id } },
      { new: true }
    );


    res.status(200).json({ success: true, message: 'Aplicación cancelada correctamente.' });
  } catch (error) {
    console.error('Error canceling application:', error);
    next(errorHandle(500, 'Error al cancelar la aplicación.'));
  }
};

// Actualizar el estado de una aplicación (opcional)
export const updateApplication = async (req, res, next) => {
  const { applicationId } = req.params;
  const { status, content } = req.body;

  if (!status) {
    return next(errorHandle(400, 'El estado es requerido.'));
  }

  // Validar que el estado está dentro de los permitidos
  const validStatuses = ['Enviada', 'Aceptada', 'Rechazada', 'Generando Contrato', 'Esperando Confirmación', 'Revisando Modificaciones', 'Confirmación Final'];
  if (!validStatuses.includes(status)) {
    return next(errorHandle(400, 'Estado inválido.'));
  }

  try {
    const application = await Application.findById(applicationId);
    if (!application) {
      return next(errorHandle(404, 'Aplicación no encontrada.'));
    }

    // Verificar que la aplicación pertenece al usuario o al propietario de la propiedad
    const property = await Listing.findById(application.listingId);
    if (
      application.userId.toString() !== req.user.id &&
      property.userRef.toString() !== req.user.id
    ) {
      return next(errorHandle(401, 'No estás autorizado para actualizar esta aplicación.'));
    }

    // Actualizar el estado y el historial
    application.status = status;
    application.history.push({ status, timestamp: new Date() });

    if (content) {
      application.contract.content = content;
      // Incrementar la versión del contrato
      application.contract.version += 1;
    }

    await application.save();

    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error('Error updating application:', error);
    next(errorHandle(500, 'Error al actualizar la aplicación.'));
  }
};

// application.controller.js

export const getApplicationsByProperty = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    // Verificar que la propiedad existe y pertenece al usuario autenticado
    const property = await Listing.findById(listingId);
    if (!property) {
      return next(errorHandle(404, 'Propiedad no encontrada.'));
    }

    if (property.userRef.toString() !== req.user.id) {
      return next(errorHandle(401, 'No estás autorizado para ver las solicitudes de esta propiedad.'));
    }

    // Obtener las solicitudes de esta propiedad
    const applications = await Application.find({ listingId })
      .populate('userId', '_id username avatar email phoneNumber gender idDocument')
      .exec();


    const applicationsWithScore = applications.map((application) => {
      const user = application.userId;
      let score = 0;
      if (user.email) score += 20;
      if (user.phoneNumber) score += 20;
      if (user.gender) score += 20;
      if (user.idDocument) score += 40; // Puedes ajustar los valores como desees

      return {
        ...application.toObject(),
        userScore: score,
      };
    });
    res.status(200).json({ success: true, applications: applicationsWithScore });

  } catch (error) {
    console.error('Error al obtener las solicitudes:', error);
    next(errorHandle(500, 'Error al obtener las solicitudes.'));
  }
};


// Aceptar una solicitud específica
export const acceptApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    // Buscar la aplicación
    const application = await Application.findById(applicationId).populate('listingId');
    if (!application) {
      return next(errorHandle(404, 'Aplicación no encontrada.'));
    }

    // Verificar que la propiedad pertenece al usuario autenticado
    if (application.listingId.userRef.toString() !== req.user.id) {
      return next(errorHandle(401, 'No estás autorizado para aceptar esta solicitud.'));
    }

    // Verificar que la solicitud aún está en estado 'Enviada'
    if (application.status !== 'Enviada') {
      return next(errorHandle(400, 'La solicitud ya ha sido procesada.'));
    }

    // Actualizar el estado de la solicitud a 'Aceptada'
    application.status = 'Aceptada';
    application.history.push({ status: 'Aceptada', timestamp: new Date() });

    await application.save();

    res.status(200).json({ success: true, message: 'Solicitud aceptada correctamente.' });
  } catch (error) {
    console.error('Error al aceptar la solicitud:', error);
    next(errorHandle(500, 'Error al aceptar la solicitud.'));
  }
};

// Rechazar una solicitud específica
export const rejectApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    // Buscar la aplicación
    const application = await Application.findById(applicationId).populate('listingId');
    if (!application) {
      return next(errorHandle(404, 'Aplicación no encontrada.'));
    }

    // Verificar que la propiedad pertenece al usuario autenticado
    if (application.listingId.userRef.toString() !== req.user.id) {
      return next(errorHandle(401, 'No estás autorizado para rechazar esta solicitud.'));
    }

    // Verificar que la solicitud aún está en estado 'Enviada'
    if (application.status !== 'Enviada') {
      return next(errorHandle(400, 'La solicitud ya ha sido procesada.'));
    }

    // Actualizar el estado de la solicitud a 'Rechazada'
    application.status = 'Rechazada';
    application.history.push({ status: 'Rechazada', timestamp: new Date() });

    await application.save();

    res.status(200).json({ success: true, message: 'Solicitud rechazada correctamente.' });
  } catch (error) {
    console.error('Error al rechazar la solicitud:', error);
    next(errorHandle(500, 'Error al rechazar la solicitud.'));
  }
};

// Función para subir el contrato

export const uploadContract = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { contractUrl, fileName } = req.body;

    // Validaciones
    if (!contractUrl || !fileName) {
      return next(errorHandle(400, 'URL del contrato y nombre del archivo son requeridos.'));
    }

    // Buscar la aplicación
    const application = await Application.findById(applicationId).populate('listingId');
    if (!application) {
      return next(errorHandle(404, 'Aplicación no encontrada.'));
    }

    // Verificar permisos
    if (application.listingId.userRef.toString() !== req.user.id) {
      return next(errorHandle(401, 'No estás autorizado para subir el contrato.'));
    }

    // Asegúrate de guardarlo en BOTH (si quieres) y *especialmente* en `application.contract.url`
    // para ser consistente con la lógica "generateContract".
    application.contractUploaded = true;
    application.contractUrl = contractUrl; // <-- si deseas en la raíz (opcional)
    application.status = 'Contrato Subido';
    application.contract.fileName = fileName;
    application.contract.uploadedAt = new Date();
    application.contract = {
      ...application.contract,
      uploadedAt: new Date(),
      url: contractUrl,   // <-- Ojo: la propiedad "url" dentro de "contract"
      fileName: fileName,
    };

    application.history.push({
      status: 'Contrato Subido',
      timestamp: new Date(),
    });

    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Contrato subido correctamente.',
      application: application

    });
  } catch (error) {
    console.error('Error uploading contract:', error);
    next(errorHandle(500, 'Error al subir el contrato.'));
  }
};


// Función para enviar el contrato al inquilino por correo
// Controlador para “enviar” (o notificar) la disponibilidad del contrato al inquilino
export const sendContractToTenant = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    // Buscar la aplicación
    const application = await Application.findById(applicationId)
      .populate('listingId')
      .populate('userId');
    if (!application) {
      return next(errorHandle(404, 'Aplicación no encontrada.'));
    }

    // Verificar permisos: solo el propietario puede marcar el contrato como enviado
    if (application.listingId.userRef.toString() !== req.user.id) {
      return next(errorHandle(401, 'No autorizado para notificar el contrato de esta solicitud.'));
    }

    // Verificar que el contrato existe o haya sido subido/generado
    if (!application.contract.url) {
      return next(errorHandle(400, 'El contrato aún no ha sido subido o generado.'));
    }

    // 1. Cambiar el estado de la aplicación a algo más representativo
    application.status = 'Firmado';
    // (Puedes llamarlo “Enviado al Inquilino”, “Notificado”, “Entrega de Contrato”, etc.)

    // 2. Agregar un entry en el historial
    application.history.push({
      status: 'Contrato Notificado',
      timestamp: new Date()
    });

    // Guardar los cambios
    await application.save();

    // Retornar la aplicación para que el front pueda actualizar la vista si lo desea
    return res.status(200).json({
      success: true,
      message: 'Contrato marcado como enviado/notificado al inquilino.',
      application
    });
  } catch (error) {
    console.error('Error al notificar disponibilidad del contrato:', error);
    next(errorHandle(500, 'Error al notificar disponibilidad del contrato.'));
  }
};



//---------GENERACION AUTOMATIOCA DE CONTRATOS-----------------

export const generateContract = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    console.log('Iniciando generación de contrato para applicationId:', applicationId);

    // Buscar la aplicación y poblar datos con todos los campos necesarios
    const application = await Application.findById(applicationId)
      .populate({
        path: 'listingId'
      })
      .populate('userId', '_id username email address nationality numeroIdentificacion tipoIdentificacion phone fullLegalName occupation');

    if (!application) {
      console.error('Aplicación no encontrada.');
      return next(errorHandle(404, 'Aplicación no encontrada.'));
    }

    // Get property owner independently since population isn't working as expected
    const propietario = await User.findById(application.listingId.userRef);
    if (!propietario) {
      console.error('Propietario no encontrado.');
      return next(errorHandle(404, 'Propietario no encontrado.'));
    }

    console.log('Owner ID comparison:', {
      listingUserRef: application.listingId.userRef,
      requestUserId: req.user.id,
      match: application.listingId.userRef === req.user.id
    });

    // Verify authorization
    if (application.listingId.userRef !== req.user.id) {
      console.error('No estás autorizado para generar el contrato.');
      return next(errorHandle(401, 'No autorizado.'));
    }

    const propiedad = application.listingId;
    const inquilino = application.userId;

    console.log('Datos del propietario completos:', propietario);
    console.log('Datos del inquilino completos:', inquilino);

    // Data para Helpers y generacion de Plantilla
    const data = {
      // Fecha y lugar
      lugar: 'a través de DCT',
      fecha: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),

      // Datos propietario
      nombrePropietario: propietario.fullLegalName || propietario.username || 'Propietario (sin nombre)',
      nacionalidadPropietario: propietario.nationality || 'No especificada',
      domicilioPropietario: propietario.address || 'No especificada',
      numeroIdentificacionPropietario: propietario.tipoIdentificacion && propietario.numeroIdentificacion ?
        `${propietario.tipoIdentificacion}: ${propietario.numeroIdentificacion}` :
        'Identificación no disponible',
      telefonoPropietario: propietario.phone || 'No disponible',
      emailPropietario: propietario.email || 'No disponible',
      // Datos inquilino
      nombreInquilino: inquilino.fullLegalName || inquilino.username || 'Inquilino (sin nombre)',
      nacionalidadInquilino: inquilino.nationality || 'No especificada',
      domicilioInquilino: inquilino.address || 'No especificado',
      numeroIdentificacionInquilino: inquilino.tipoIdentificacion && inquilino.numeroIdentificacion ?
        `${inquilino.tipoIdentificacion}: ${inquilino.numeroIdentificacion}` :
        'Identificación no disponible',
      telefonoInquilino: inquilino.phone || 'No disponible',
      emailInquilino: inquilino.email || 'No disponible',
      ocupacionInquilino: inquilino.occupation || 'No especificada',
      // Datos listing
      direccionInmueble: propiedad.address || 'Dirección no disponible',
      descripcionInmueble: propiedad.description || 'Sin descripción',
      isAmueblado: propiedad.furnished ? 'Sí' : 'No',
      rentalDurationMonths: application.rentalDurationMonths || 12,
      precioAlquilerMensual: propiedad.regularPrice || 0,
      fianza: propiedad.deposit || (propiedad.regularPrice ? propiedad.regularPrice : 0),
      metrosCuadrados: propiedad.squareMeters || 'No especificados',
      habitaciones: propiedad.bedrooms || 'No especificadas',
      banos: propiedad.bathrooms || 'No especificados',
      tipoPropiedad: propiedad.type === 'rent' ? 'Alquiler' : 'Venta',
      fechaInicio: new Date().toLocaleDateString('es-ES'),
      fechaFin: (() => {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (application.rentalDurationMonths || 12));
        return endDate.toLocaleDateString('es-ES');
      })()
    };

    console.log('Generando contrato con datos:', {
      propietario: data.nombrePropietario,
      inquilino: data.nombreInquilino,
      direccion: data.direccionInmueble
    });

    console.log('Datos completos para el contrato:', JSON.stringify(data, null, 2));
    // Crear doc PDFKit y capturar en memoria
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);

      try {
        // Subir a Firebase
        const storagePath = `contracts/contrato_gen_${applicationId}_${Date.now()}.pdf`;
        const file = bucket.file(storagePath);

        await file.save(pdfData, {
          metadata: { contentType: 'application/pdf' },
        });

        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2030',
        });

        const fileName = storagePath.split('/').pop();
        console.log('Contrato generado:', fileName);

        // Actualizar en la BD
        application.status = 'Contrato Generado';
        application.contractGenerated = true;
        application.contractUploaded = true;
        application.contract = {
          ...application.contract,
          generatedAt: new Date(),
          fileName: storagePath,
          url: url
        };
        application.history.push({ status: 'Contrato Generado (PDFKit)', timestamp: new Date() });
        await application.save();

        console.log('Contrato PDFKit listo. URL:', url);
        res.status(200).json({
          success: true,
          message: 'Contrato (PDFKit) generado correctamente.',
          application: application,
          contractUrl: url
        });
      } catch (uploadError) {
        console.error('Error al subir contrato a Firebase:', uploadError);
        next(errorHandle(500, 'Error al guardar el contrato generado: ' + uploadError.message));
      }
    });

    // =========== Llamadas a Helpers ==============
    addContractHeader(doc, data);
    addReunidosSection(doc, data);
    addExponenSection(doc, data);
    addClausulasSection(doc, data);
    addFirma(doc, data);

    // Cerrar doc
    doc.end();

  } catch (error) {
    console.error('Error generando contrato PDFKit:', error);
    next(errorHandle(500, 'Error al generar el contrato con PDFKit: ' + error.message));
  }
};

export const deleteContract = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    // 1. Verificamos la app
    const application = await Application.findById(applicationId).populate('listingId');
    if (!application) return next(errorHandle(404, 'Aplicación no encontrada.'));

    // 2. Verificamos permisos
    if (application.listingId.userRef.toString() !== req.user.id) {
      return next(errorHandle(401, 'No autorizado.'));
    }

    const fileName = application.contract.fileName;
    if (!fileName) {
      return next(errorHandle(400, 'No hay contrato para eliminar.'));
    }

    // 3. Borramos el archivo en Firebase Storage (Admin SDK).
    // El fileName ya contiene "contracts/...".
    await bucket.file(fileName).delete();

    // 4. Reseteamos los datos en la BD
    application.contractGenerated = false;
    application.contractUploaded = false;
    application.contract.url = '';
    application.contract.fileName = '';
    application.contract.uploadedAt = null;
    application.contract.generatedAt = null;
    // etc, si hay más flags

    application.history.push({
      status: 'Contrato Eliminado',
      timestamp: new Date(),
    });

    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Contrato eliminado correctamente.',
    });
  } catch (err) {
    console.error('Error al eliminar el contrato: ', err);
    return next(errorHandle(500, 'Error al eliminar el contrato.'));
  }
};

export const signContract = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { signatureData, signatureType, signedBy } = req.body;
    
    console.log(`Starting contract signature process for application ${applicationId} by ${signedBy}`);

    // 1. Find the application with full population
    const application = await Application.findById(applicationId)
      .populate('listingId')
      .populate('userId');

    if (!application) {
      return next(errorHandle(404, 'Aplicación no encontrada.'));
    }

    // 2. Perform detailed logging of current state to track the issue
    console.log("BEFORE SIGNING - Current application state:", {
      id: application._id,
      status: application.status,
      contractFileName: application.contract?.fileName,
      contractSignedFileName: application.contract?.signedFileName,
      contractUrl: application.contract?.url,
      ownerSignatureVerified: application.ownerSignature?.verified,
      tenantSignatureVerified: application.tenantSignature?.verified
    });

    // 3. Validate basics
    if (!application.contract?.url) {
      return next(errorHandle(400, 'No hay contrato disponible para firmar.'));
    }

    // 4. Authorization check
    if (
      application.listingId.userRef !== req.user.id &&
      application.userId._id.toString() !== req.user.id
    ) {
      return next(errorHandle(401, 'No autorizado para firmar este contrato.'));
    }

    // 5. Process signature data
    let buffer;
    try {
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64Data = signatureData.split(',')[1];
      if (!base64Data) {
        return next(errorHandle(400, 'Formato de firma inválido.'));
      }
      buffer = Buffer.from(base64Data, 'base64');
    } catch (error) {
      console.error('Error processing signature data:', error);
      return next(errorHandle(500, 'Error al procesar los datos de la firma.'));
    }

    // 6. Setup the file paths and names
    const timestamp = Date.now();
    const signedFileName = `signed_${applicationId}_${timestamp}.pdf`;
    const signedFilePath = `contracts/signed/${signedFileName}`;

    // 7. Get the most recent contract file
    let sourceContractPath;
    
    // IMPORTANT: Determine which contract file to use as source
    if (application.contract.signedFileName) {
      sourceContractPath = application.contract.signedFileName;
      console.log(`Using previously signed contract: ${sourceContractPath}`);
    } else {
      sourceContractPath = application.contract.fileName;
      console.log(`Using original contract: ${sourceContractPath}`);
    }

    try {
      // 8. Download the source contract
      const sourceContract = await bucket.file(sourceContractPath);
      const [contractBuffer] = await sourceContract.download();
      
      // 9. Import PDF library
      const PDFLib = await import('pdf-lib');
      const { PDFDocument } = PDFLib;
      
      // 10. Load PDF and prepare for editing
      const pdfDoc = await PDFDocument.load(contractBuffer);
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const { width, height } = lastPage.getSize();
      
      // 11. Embed and size signature
      const signatureImage = await pdfDoc.embedPng(buffer);
      const signatureWidth = Math.min(200, width * 0.3);
      const aspectRatio = signatureImage.height / signatureImage.width;
      const signatureHeight = signatureWidth * aspectRatio;
      
      // 12. Place signature based on signer
      if (signedBy === 'owner') {
        // Place owner signature on left
        lastPage.drawImage(signatureImage, {
          x: 50,
          y: 120,
          width: signatureWidth,
          height: signatureHeight,
        });
        
        lastPage.drawText('Firma del Propietario', {
          x: 50,
          y: 110,
          size: 10,
        });
      } else {
        // Place tenant signature on right
        lastPage.drawImage(signatureImage, {
          x: width - signatureWidth - 50,
          y: 120,
          width: signatureWidth,
          height: signatureHeight,
        });
        
        lastPage.drawText('Firma del Inquilino', {
          x: width - signatureWidth - 50,
          y: 110,
          size: 10,
        });
      }
      
      // 13. Add date
      const date = new Date().toLocaleDateString('es-ES');
      lastPage.drawText(`Fecha: ${date}`, {
        x: signedBy === 'owner' ? 50 : (width - 150),
        y: 90,
        size: 10,
      });
      
      // 14. Save changes and upload PDF
      const signedPdfBytes = await pdfDoc.save();
      const signedFile = bucket.file(signedFilePath);
      await signedFile.save(signedPdfBytes, { metadata: { contentType: 'application/pdf' } });
      
      // 15. Get new URL
      const [signedUrl] = await signedFile.getSignedUrl({
        action: 'read',
        expires: '03-01-2030',
      });
      
      // 16. CRITICAL PART: Update application with correct values
      // Store current state as backup before changes
      const prevOwnerSignatureVerified = application.ownerSignature?.verified;
      const prevTenantSignatureVerified = application.tenantSignature?.verified;
      
      // 17. Prepare updates
      const updates = {
        contract: {
          fileName: application.contract.fileName,  // Keep original file name
          url: signedUrl,                          // Update URL
          signedFileName: signedFilePath,          // IMPORTANT: Update signed file path
          generatedAt: application.contract.generatedAt || new Date()
        }
      };
      
      // 18. Update signature status based on signer
      if (signedBy === 'owner') {
        updates.ownerSignature = {
          verified: true,
          date: new Date()
        };
        
        // Preserve tenant signature if exists
        if (prevTenantSignatureVerified) {
          updates.tenantSignature = application.tenantSignature;
        }
        
        // Set status
        updates.status = prevTenantSignatureVerified ? 'Firmado' : 'Firmado por Propietario';
      } else {
        updates.tenantSignature = {
          verified: true,
          date: new Date()
        };
        
        // CRITICAL: Preserve owner signature
        if (prevOwnerSignatureVerified) {
          updates.ownerSignature = application.ownerSignature;
        }
        
        // Set status
        updates.status = prevOwnerSignatureVerified ? 'Firmado' : 'Firmado por Inquilino';
      }
      
      // 19. Update application history
      updates.history = [
        ...application.history || [],
        {
          status: updates.status,
          timestamp: new Date()
        }
      ];
      
      // 20. CRITICAL: Use findByIdAndUpdate to properly update all fields
      const updatedApplication = await Application.findByIdAndUpdate(
        applicationId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      
      // 21. Detailed logging after update
      console.log("AFTER SIGNING - Updated application state:", {
        id: updatedApplication._id,
        status: updatedApplication.status,
        contractFileName: updatedApplication.contract?.fileName,
        contractSignedFileName: updatedApplication.contract?.signedFileName,
        contractUrl: updatedApplication.contract?.url,
        ownerSignatureVerified: updatedApplication.ownerSignature?.verified,
        tenantSignatureVerified: updatedApplication.tenantSignature?.verified
      });
      
      // 22. Return response
      return res.status(200).json({
        success: true,
        message: 'Contrato firmado con éxito',
        application: updatedApplication,
        signedContractUrl: signedUrl
      });
      
    } catch (error) {
      console.error('Error processing contract signature:', error);
      return next(errorHandle(500, `Error al firmar el contrato: ${error.message}`));
    }
  } catch (error) {
    console.error('Error in sign contract function:', error);
    return next(errorHandle(500, 'Error al procesar la firma del contrato.'));
  }
};