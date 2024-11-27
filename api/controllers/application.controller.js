// controllers/application.controller.js

import Application from '../models/application.model.js';
import Listing from '../models/listing.model.js';
import { errorHandle } from '../utils/error.js';
import transporter from '../utils/email.js';



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

  try {
    const application = await Application.findById(applicationId);
    if (!application) {
      return next(errorHandle(404, 'Aplicación no encontrada.'));
    }

    // Verificar que la aplicación pertenece al usuario
    if (application.userId.toString() !== req.user.id) {
      return next(errorHandle(401, 'No estás autorizado para cancelar esta aplicación.'));
    }

    await application.deleteOne(); //borro la pplication
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
    const {listingId} = req.params;

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

    if (!contractUrl || !fileName) {
      return next(errorHandle(400, 'URL del contrato y nombre del archivo son requeridos.'));
    }

    // Buscar la aplicación
    const application = await Application.findById(applicationId).populate('listingId');
    if (!application) {
      return next(errorHandle(404, 'Aplicación no encontrada.'));
    }

    // Verificar que la propiedad pertenece al usuario autenticado
    if (application.listingId.userRef.toString() !== req.user.id) {
      return next(errorHandle(401, 'No estás autorizado para subir el contrato de esta solicitud.'));
    }
    
    // Actualizar campos a nivel raíz
    application.contractUrl = contractUrl;
    application.contractUploaded = true;

    // Actualizar información del contrato
    application.contract = {
      ...application.contract,
      uploadedAt: new Date(),
      fileName: fileName,
      // Eliminar 'contractUploaded' de aquí
    };

    application.history.push({ status: 'Contrato Subido', timestamp: new Date() });

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Contrato subido correctamente.',
      contractUrl: application.contractUrl,
      fileName: application.contract.fileName,
    });
  } catch (error) {
    console.error('Error uploading contract:', error);
    next(errorHandle(500, 'Error al subir el contrato.'));
  }
};


// Función para enviar el contrato al inquilino por correo
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

    // Verificar permisos: solo el propietario puede enviar el contrato
    if (application.listingId.userRef.toString() !== req.user.id) {
      return next(errorHandle(401, 'No estás autorizado para enviar el contrato de esta solicitud.'));
    }

    // Verificar que el contrato ha sido subido
    if (!application.contract.url) {
      return next(errorHandle(400, 'El contrato aún no ha sido subido.'));
    }

    // Configurar el contenido del correo
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Usa la variable de entorno para el remitente
      to: application.userId.email,
      subject: 'Tu Contrato de Arrendamiento',
      text: `Hola ${application.userId.username || 'Usuario'},

Tu contrato de arrendamiento ha sido generado y está listo para ser revisado. Puedes acceder al contrato haciendo clic en el siguiente enlace:

${application.contract.url}

Por favor, revisa el contrato y contáctanos si tienes alguna pregunta.

Saludos cordiales,
Tu Empresa`,
      html: `<p>Hola ${application.userId.username || 'Usuario'},</p>
<p>Tu contrato de arrendamiento ha sido generado y está listo para ser revisado. Puedes acceder al contrato haciendo clic en el siguiente enlace:</p>
<p><a href="${application.contract.url}">Ver Contrato</a></p>
<p>Por favor, revisa el contrato y contáctanos si tienes alguna pregunta.</p>
<p>Saludos cordiales,<br/>Tu Empresa</p>`,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    // Actualizar el historial
    application.history.push({ status: 'Contrato Enviado al Inquilino', timestamp: new Date() });
    await application.save();

    res.status(200).json({ success: true, message: 'Contrato enviado al inquilino correctamente.' });
  } catch (error) {
    console.error('Error sending contract email:', error);
    next(errorHandle(500, 'Error al enviar el contrato.'));
  }
};