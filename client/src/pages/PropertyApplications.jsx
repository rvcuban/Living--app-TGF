import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Importamos Link y useNavigate
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { storage } from '../firebase'; // Asegúrate de que la ruta es correcta
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import ReactModal from 'react-modal';

import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Configurar el worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Configurar el worker de pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js`;
// Configurar el elemento root para el modal
ReactModal.setAppElement('#root');


// Componente para visualizar el contrato en PDF
const ContractViewer = ({ contractUrl }) => {
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div>
      <Document
        file={contractUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading="Cargando contrato..."
        error="Error al cargar el contrato."
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>
    </div>
  );
};



export default function PropertyApplications() {
  const { listingId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [applications, setApplications] = useState([]);
  const [capacity, setCapacity] = useState(0);
  const navigate = useNavigate(); // Para redirigir al usuario
   

  // modal que se abre al generar contrato
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [uploadProgress, setUploadProgress] = useState({}); // Para mostrar el progreso de subida


  //estados para la vista previa del pdf
  const [contractPreview, setContractPreview] = useState(false);
  const [contractUrl, setContractUrl] = useState('');
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };


  const openModal = (application) => {
    setSelectedApplication(application);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedApplication(null);
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`/api/applications/listing/${listingId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setApplications(data.applications);
          console.log(data);
          
        
          
        } else {
          toast.error(data.message || 'Error al obtener las solicitudes.');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Error al obtener las solicitudes.');
      }
    };

    fetchApplications();
  }, [listingId, currentUser.token]);


  useEffect(() => {
    const fetchListingSummary = async () => {
      try {
        const res = await fetch(`/api/listing/${listingId}/summary`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          // data.data.capacity es tu número máximo de inquilinos
          setCapacity(data.data.capacity);
        } else {
          toast.error(data.message || 'Error al obtener el resumen de la propiedad.');
        }
      } catch (error) {
        console.error('Error al obtener la capacidad:', error);
        toast.error('Error al obtener la capacidad.');
      }
    };
  
    if (listingId) {
      fetchListingSummary();
    }
  }, [listingId, currentUser.token]);

  const calculateUserScore = (user) => {
    let score = 0;
    if (user.email) score += 20;
    if (user.phoneNumber) score += 20;
    if (user.gender) score += 20;
    if (user.idDocument) score += 40;
    return score;
  };

  const handleAccept = async (applicationId) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Solicitud aceptada.');
        // Actualizar el estado de la aplicación en el estado local
        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app._id === applicationId ? { ...app, status: 'Aceptada' } : app
          )
        );
      } else {
        toast.error(data.message || 'Error al aceptar la solicitud.');
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('Error al aceptar la solicitud.');
    }
  };



  const handleReject = async (applicationId) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Solicitud rechazada.');
        // Eliminar la aplicación del estado local
        setApplications((prevApplications) =>
          prevApplications.filter((app) => app._id !== applicationId)
        );
      } else {
        toast.error(data.message || 'Error al rechazar la solicitud.');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Error al rechazar la solicitud.');
    }
  };

  const handleGenerateContract = async (applicationId) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/generate-contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Contrato generado correctamente.');
        // Establecer la URL del contrato y mostrar la vista previa
        setContractUrl(data.contractUrl);
        setContractPreview(true);

        const updatedApp = data.application;
        // Actualizar el estado de la aplicación en el estado local
        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app._id === applicationId
              ? updatedApp // <--- aqui sustituyes la entera
              : app
          )
        );
      } else {
        toast.error(data.message || 'Error al generar el contrato.');
      }
    } catch (error) {
      console.error('Error generating contract:', error);
      toast.error('Error al generar el contrato.');
    }
  };


  const handleUploadContract = async (applicationId, file) => {
    // ... validaciones
    const fileName = `contrato_manual_${applicationId}.pdf`
    const storageRef = ref(storage, `contracts/${fileName}`)

    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress((prev) => ({ ...prev, [applicationId]: progress }));
      },
      (error) => {
        console.error('Error al subir el contrato:', error);
        toast.error('Error al subir el contrato.');
        setUploadProgress((prev) => ({ ...prev, [applicationId]: 0 }));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const res = await fetch(`/api/applications/${applicationId}/upload-contract`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentUser.token}`,
            },
            body: JSON.stringify({ contractUrl: downloadURL, fileName }),
          });
          const data = await res.json();

          if (data.success) {
            toast.success('Contrato subido correctamente.');
            setApplications((prevApps) =>
              prevApps.map((app) =>
                app._id === applicationId
                  ? {
                    ...app,
                    contractUploaded: true,
                    contract: {
                      ...app.contract,
                      // OJO: guarda la URL devuelta por el backend (o la que mandaste).
                      url: data.contractUrl, // <--- important
                      uploadedAt: new Date(),
                      fileName: data.fileName,
                    },
                  }
                  : app
              )
            );
            setContractPreview(false);
            setContractUrl('');
            closeModal();
            setUploadProgress((prev) => ({ ...prev, [applicationId]: 100 }));
          } else {
            toast.error(data.message || 'Error al subir el contrato.');
          }
        } catch (error) {
          console.error('Error al actualizar el contrato en el backend:', error);
          toast.error('Error al actualizar el contrato en el backend.');
        }
      }
    );
  };








  const handleSendContract = async (applicationId) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/send-contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Contrato enviado al inquilino correctamente.');
      } else {
        toast.error(data.message || 'Error al enviar el contrato.');
      }
    } catch (error) {
      console.error('Error sending contract:', error);
      toast.error('Error al enviar el contrato.');
    }
  };


  // Función para eliminar el contrato
  const handleDeleteContract = async (applicationId) => {
    try {
      // Llamamos a la ruta de backend
      const res = await fetch(`/api/applications/${applicationId}/delete-contract`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Contrato eliminado correctamente.');
        // Actualizar estado local:
        setApplications((prevApps) =>
          prevApps.map((app) =>
            app._id === applicationId
              ? {
                ...app,
                contractUrl: '', // o contract?.url = ''
                contractUploaded: false,
                contractGenerated: false,
                contract: {
                  ...app.contract,
                  url: '',
                  fileName: '',
                  uploadedAt: null,
                  generatedAt: null,
                },
              }
              : app
          )
        );
      } else {
        toast.error(data.message || 'Error al eliminar el contrato.');
      }
    } catch (error) {
      console.error('Error eliminando el contrato:', error);
      toast.error('Error al eliminar el contrato.');
    }
  };


  const handleContact = (userId) => {
    // Navegar a la página de mensajes o abrir una ventana de chat
    navigate(`/messages/${userId}`);
  };


  // Función para eliminar una aplicación (Nuevo)
  const handleDeleteApplication = async (applicationId) => {
    try {
      // Opcional: Confirmación antes de eliminar
      const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.');
      if (!confirmDelete) return;

      const res = await fetch(`/api/applications/${applicationId}/cancel`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Solicitud eliminada correctamente.');
        // Actualizar el estado local eliminando la aplicación
        setApplications((prevApplications) =>
          prevApplications.filter((app) => app._id !== applicationId)
        );
      } else {
        toast.error(data.message || 'Error al eliminar la solicitud.');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Error al eliminar la solicitud.');
    }
  };



  console.log('listingId:', listingId);

  console.log('listingId:', listingId); // Añade este console.log

  // Filtrar cuántas apps tienen el estado 'Firmado' (o 'Aceptada' según tu lógica):
  const acceptedCount = applications.filter(app => app.status === 'Firmado').length;
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        Solicitudes para tu Propiedad
      </h1>
      {/* Contador de inquilinos */}
      <div className="text-center mb-4 text-gray-700 font-medium">
        {acceptedCount}/{capacity} inquilinos Firmado
      </div> 
      {applications.length > 0 ? (
        <ul className="space-y-4">
          {applications.map((application) => {
            const user = application.userId;
            const userScore = calculateUserScore(user);

            return (
              <li
                key={application._id}
                className="border p-4 rounded-md shadow flex flex-col md:flex-row items-center md:items-start"
              >
                {/* Enlace a perfil público */}
                <Link
                  to={`/user/${user._id}`}
                  className="flex flex-col items-center md:flex-row md:items-center mb-4 md:mb-0 md:mr-4 text-center md:text-left mx-auto md:mx-0"
                >
                  <img
                    src={user.avatar || '/default-profile.png'}
                    alt={`${user.username || 'Usuario'} profile`}
                    className="w-16 h-16 rounded-full mb-2 md:mb-0 md:mr-4"
                  />
                </Link>
                <div>
                  <h2 className="text-xl font-semibold">
                    {user.username || 'Usuario'}
                  </h2>
                  <p className="text-gray-600">
                    Puntaje del usuario: {userScore}
                  </p>
                  <p className="text-gray-600">
                    Estado de la solicitud: {application.status}
                  </p>

                  {/* Botón de Contactar siempre disponible */}
                  <button
                    className="text-red-500 mr-2"
                    onClick={() => handleContact(user._id)}
                  >
                    Contactar
                  </button>

                  <button
                    className="text-red-500"
                    onClick={() => handleDeleteApplication(application._id)}
                  >
                    Eliminar
                  </button>
                </div>




                {/* Botones de acción */}
                <div className="flex flex-col md:flex-row mt-4 md:mt-0 md:ml-auto">
                  {/* Botón de Eliminar Aplicación - Siempre Visible */}


                  {application.status === 'Enviada' && (
                    <>
                      <div>
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0"
                          onClick={() => handleAccept(application._id)}
                        >
                          Aceptar
                        </button>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0"
                          onClick={() => handleReject(application._id)}
                        >
                          Rechazar
                        </button>
                      </div>
                    </>
                  )}


                  {['Aceptada', 'Contrato Generado', 'Contrato Subido', 'Contrato Notificado'].includes(application.status) && (
                    <>
                      {/* Si el contrato ha sido subido, mostrar botones Ver, Eliminar, Enviar */}
                      {/* split / es para que el filename no muestre el nombre de la carpeta que lo contiene */}
                      {application.contractUploaded ? (
                        <div className="flex flex-col">
                          <p className="mb-2">
                            <strong>Contrato:</strong> {' '} {application.contract.fileName
                              ? application.contract.fileName.split('/').pop()
                              : ''}
                          </p>
                          <div className="flex flex-col md:flex-row">
                            <a
                              href={application.contract.url}  // la url del storage
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                            >
                              Ver Contrato
                            </a>
                            <button
                              className="flex-none bg-red-600 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0"
                              onClick={() => handleDeleteContract(application._id)}
                            >
                              Eliminar Contrato
                            </button>
                            <button
                              className="flex-none bg-green-500 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0"
                              onClick={() => handleSendContract(application._id)}
                            >
                              Firmar y enviar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Mostrar botones para generar o subir contrato */}
                          <div className="flex flex-col">
                            <p className="mb-2">
                              <strong>Contrato:</strong> {application.contract.fileName}
                            </p>
                            {/* Botón para Generar Contrato */}
                            {!application.contractGenerated && (
                              <div className='flex flex-col md:flex-row mb-2'>

                                <button
                                  className="flex-none bg-yellow-500 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0"
                                  onClick={() => openModal(application)}
                                >
                                  Generar Contrato
                                </button>

                                <label
                                  htmlFor={`file-upload-${application._id}`}
                                  className="bg-purple-500 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0 cursor-pointer text-center"
                                >
                                  Subir mi Contrato
                                </label>

                                {/* Input type="file" oculto, que dispara onChange cuando el usuario seleccione un PDF */}
                                <input
                                  id={`file-upload-${application._id}`}
                                  type="file"
                                  accept="application/pdf"
                                  style={{ display: 'none' }}
                                  onChange={(e) =>
                                    handleUploadContract(application._id, e.target.files[0])
                                  }
                                />
                              </div>

                            )}

                            {/* Botón para Subir Contrato */}
                            {application.contractGenerated && !application.contractUploaded && (
                              <div className="flex flex-col md:items-end">
                                <div className="flex flex-col md:flex-row">
                                  <a
                                    href={application.contract.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-none text-center bg-blue-500 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0 cursor-pointer"
                                  >
                                    Ver Contrato
                                  </a>
                                  <button
                                    className="flex-none text-center bg-green-500 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0 cursor-pointer"
                                    onClick={() => handleSendContract(application._id)}
                                  >
                                    Enviar Contrato
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Barra de progreso */}
                            {uploadProgress[application._id] > 0 &&
                              uploadProgress[application._id] < 100 && (
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                  <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${uploadProgress[application._id]}%` }}
                                  ></div>
                                </div>
                              )}
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {application.status === 'Firmado' && (
                    <div className="flex flex-col md:flex-row">
                      <a
                        href={application.contract.url}  // la url del storage
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                      >
                        Ver Contrato
                      </a>
                    </div>
                  )}

                </div>
              </li>
            );
          })}
          {/* Modal para Generar Contrato */}
          <ReactModal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Generar Contrato"
            className="modal"
            overlayClassName="modal-overlay"
          >
            {selectedApplication && (
              <div className='bg-white p-6 mx-auto rounded-xl shadow-lg w-11/12 max-w-sm sm:max-w-md md:max-w-lg'>
                {!contractPreview ? (
                  <>
                    <h2 className="text-2xl mb-4">Generar Contrato</h2>
                    <p><strong>Propietario:</strong> {currentUser.username}</p>
                    <p><strong>Inquilino:</strong> {selectedApplication.userId.username}</p>
                    <p><strong>Propiedad:</strong> {selectedApplication.listingId.name}</p>
                    {/* Mostrar más datos si es necesario */}
                    <div className="mt-4">
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded mr-2 mb-2"
                        onClick={() => handleGenerateContract(selectedApplication._id)}
                      >
                        Generar automáticamente
                      </button>
                      <button
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                        onClick={closeModal}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl mb-4">Vista Previa del Contrato</h2>
                    <div className="overflow-auto" style={{ maxHeight: '60vh' }}>
                      <Document
                        file={contractUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading="Cargando contrato..."
                      >
                        {Array.from(new Array(numPages), (el, index) => (
                          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                        ))}
                      </Document>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <a
                        href={contractUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                      >
                        Ver Archivo
                      </a>
                      <button
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                        onClick={closeModal}
                      >
                        Cerrar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </ReactModal>
        </ul>

      ) : (
        <p className="text-center text-gray-600">
          No hay solicitudes para esta propiedad.
        </p>
      )}
    </div>
  );
}