import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Importamos Link y useNavigate
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { storage } from '../firebase'; // Asegúrate de que la ruta es correcta
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import ReactModal from 'react-modal';

import { Document, Page, pdfjs } from 'react-pdf';
import SignaturePad from '../components/SignaturePad';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Important: Set worker to local file path in public directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Configure the modal root
ReactModal.setAppElement('#root');


// Componente para visualizar el contrato en PDF
const ContractViewer = ({ contractUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [viewerError, setViewerError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth); // Add this line
  const [scale, setScale] = useState(1.0); // Add this line
  const [currentPage, setCurrentPage] = useState(1); // For pagination

  // Add responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);

      // Adjust scale based on screen size
      if (window.innerWidth < 480) {
        setScale(0.8); // Smaller scale for mobile
      } else if (window.innerWidth < 768) {
        setScale(0.9); // Medium scale for tablets
      } else {
        setScale(1.0); // Full scale for desktop
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setViewerError(true);
    setLoading(false);
  };

  return (
    <div className="contract-viewer flex flex-col items-center">
      {loading && (
        <div className="text-center py-4 w-full">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p>Cargando documento...</p>
        </div>
      )}

      {viewerError && (
        <div className="w-full mb-4">
          <div className="text-center py-3 mb-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-700 font-medium">El visor de PDF no está disponible</p>
          </div>

          <iframe
            src={contractUrl}
            className="w-full h-[500px] border rounded mb-3"
            title="Vista previa del contrato"
          ></iframe>

          <div className="flex justify-center space-x-3 mt-4">
            <a
              href={contractUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              Ver en nueva pestaña
            </a>
          </div>
        </div>
      )}

      {!viewerError && (
        <Document
          file={contractUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          error={null}
        >
          {Array.from(new Array(numPages || 0), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={Math.min(450, viewportWidth - 60)}
              scale={scale}
            />
          ))}
        </Document>
      )}
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

  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [signingApplication, setSigningApplication] = useState(null);

  // Add this function to handle signature saving
  const handleSaveSignature = async (signatureData, signatureType) => {
    try {
      if (!signingApplication) return;

      setSignatureModalOpen(false);
      setSignatureData(signatureData);

      // Show loading indicator
      toast.info('Firmando contrato, por favor espere...');

      const res = await fetch(`/api/applications/${signingApplication._id}/sign-contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          signatureData: signatureData,
          signatureType: signatureType,
          signedBy: 'owner', // Since this is the property owner's view
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Contrato firmado correctamente');

        // Update application in state
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app._id === signingApplication._id ? data.application : app
          )
        );

        // Show signed contract
        setContractUrl(data.signedContractUrl);
        setContractPreview(true);
        openModal(data.application);
      } else {
        toast.error(data.message || 'Error al firmar el contrato');
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      toast.error('Error al firmar el contrato');
    }
  };

  // Add this function to open signature modal
  const openSignatureModal = (application) => {
    setSigningApplication(application);
    setSignatureModalOpen(true);
  };

  // Replace the "Firmar y enviar" button with this new function
  const handleSignAndSendContract = (applicationId) => {
    const application = applications.find(app => app._id === applicationId);
    if (!application) {
      toast.error('No se encontró la aplicación');
      return;
    }

    // Open signature modal
    openSignatureModal(application);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };


  const openModal = (application) => {
    console.log('Opening modal with application:', application);
    setSelectedApplication(application);

    // If this application has a contract, show it
    if (application?.contract?.url) {
      setContractUrl(application.contract.url);
      setContractPreview(true);
      console.log(`Setting contract URL to: ${application.contract.url}`);
    } else {
      setContractPreview(false);
      setContractUrl('');
      console.log('No contract URL found for this application');
    }

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
      console.log(`Generating contract for application: ${applicationId}`);

      const res = await fetch(`/api/applications/${applicationId}/generate-contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });

      const data = await res.json();
      console.log('Contract generation response:', data);

      if (data.success) {
        toast.success('Contrato generado correctamente.');

        // Store contract URL immediately
        const contractUrl = data.contractUrl;
        setContractUrl(contractUrl);

        console.log(`Contract URL received: ${contractUrl}`);

        // Update application locally with the complete contract data
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app._id === applicationId
              ? {
                ...app,
                status: 'Contrato Generado',
                contractGenerated: true,
                contractUploaded: true,
                contract: {
                  ...app.contract,
                  url: contractUrl,
                  fileName: data.application.contract.fileName,
                  generatedAt: new Date().toISOString()
                },
                // IMPORTANT: Add this explicitly to make the button appear
                ownerSignature: {
                  verified: false,
                  date: null
                }
              }
              : app
          )
        );

        // Then open modal with preview
        const updatedApplication = {
          ...applications.find(app => app._id === applicationId),
          status: 'Contrato Generado',
          contractGenerated: true,
          contractUploaded: true,
          contract: {
            url: contractUrl,
            fileName: data.application.contract.fileName,
            generatedAt: new Date().toISOString()
          },
          ownerSignature: {
            verified: false,
            date: null
          }
        };

        setTimeout(() => {
          openModal(updatedApplication);
          setContractPreview(true);
        }, 300);
      } else {
        toast.error(data.message || 'Error al generar el contrato.');
      }
    } catch (error) {
      console.error('Error generating contract:', error);
      toast.error('Error al generar el contrato.');
    }
  };

  const handleUploadContract = async (applicationId, file) => {

    const fileName = `contrato_manual_${applicationId}.pdf`;
    const filePath = `contracts/${fileName}`; // Save this separate variable
    const storageRef = ref(storage, filePath);

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
            body: JSON.stringify({ 
              contractUrl: downloadURL, 
              fileName,
              filePath 
            }),
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
                      // OJO: guarda la URL devuelta por el backend (o la que mande).
                      url: data.contractUrl, // <--- important
                      filePath: filePath, // Store the path in the app state
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
      // Show loading toast
      const loadingToast = toast.info('Enviando contrato al inquilino...', { autoClose: false });

      const res = await fetch(`/api/applications/${applicationId}/send-contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });

      const data = await res.json();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success('Contrato enviado al inquilino correctamente.');

        // Update application state to reflect the new status
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app._id === applicationId
              ? {
                ...app,
                status: 'Contrato Notificado',  // Update the status
                contractSent: true, // Add a flag to track that the contract was sent
              }
              : app
          )
        );

        // Close the modal if it's open
        if (selectedApplication && selectedApplication._id === applicationId) {
          closeModal();
        }

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

  console.log("Current Applications State:", applications.map(app => ({
    id: app._id,
    status: app.status,
    contractGenerated: app.contractGenerated,
    contractUploaded: app.contractUploaded,
    contractUrl: app.contract?.url,
    fileName: app.contract?.fileName
  })));

  console.log('listingId:', listingId);

  console.log('listingId:', listingId); // 

  const hasProblematicApplication = applications.some(app =>
    app.status === 'Contrato Generado' && (!app.contractGenerated || !app.contract?.url)
  );

  // Filtrar cuántas apps tienen el estado 'Firmado' (o 'Aceptada' según tu lógica):
  const acceptedCount = applications.filter(app => app.status === 'Firmado').length;
  return (
    <div className="max-w-6xl mx-auto p-4 min-h-[calc(100vh-200px)] flex flex-col">
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


                  {['Aceptada', 'Contrato Generado', 'Contrato Subido', 'Contrato Notificado', 'Firmado por Propietario', 'Firmado por Inquilino'].includes(application.status) && (
                    <>
                      {/* If contract has been uploaded or generated, show view/send/delete buttons */}
                      {application.contractUploaded || application.contract?.url ? (
                        <div className="flex flex-col">
                          <p className="mb-2">
                            <strong>Contrato:</strong> {' '} {application.contract?.fileName
                              ? application.contract.fileName.split('/').pop()
                              : 'Contrato'}
                          </p>
                          <div className="flex flex-col md:flex-row">
                            <a
                              href={application.contract?.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-500 text-white px-4 py-2 rounded mr-2 mb-2 md:mb-0"
                            >
                              Ver Contrato
                            </a>

                            <button
                              className="flex-none bg-red-600 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0"
                              onClick={() => handleDeleteContract(application._id)}
                            >
                              Eliminar Contrato
                            </button>

                            {/* Show different buttons depending on signature status */}
                            {application.status === 'Firmado por Propietario' ? (
                              <button
                                className="flex-none bg-green-500 text-white px-4 py-2 rounded"
                                onClick={() => handleSendContract(application._id)}
                              >
                                Enviar al inquilino
                              </button>
                            ) : (
                              // This simplified condition is more robust - if ownerSignature doesn't exist or isn't verified, show the button
                              (application.ownerSignature?.verified !== true) && (
                                <button
                                  className="flex-none bg-green-500 text-white px-4 py-2 rounded"
                                  onClick={() => handleSignAndSendContract(application._id)}
                                >
                                  Firmar y enviar
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Show buttons for generating or uploading contract */}
                          <div className="flex flex-col">
                            <p className="mb-2">
                              <strong>Contrato:</strong> {application.contract?.fileName || 'No generado'}
                            </p>
                            {/* Buttons for generating/uploading contract */}
                            {!application.contractGenerated && (
                              <div className='flex flex-col md:flex-row mb-2'>
                                <button
                                  className="flex-none bg-yellow-500 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0"
                                  onClick={() => openModal(application)}
                                >
                                  Generar Contrato
                                </button>

                                {/*<label
                                  htmlFor={`file-upload-${application._id}`}
                                  className="bg-purple-500 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0 cursor-pointer text-center"
                                >
                                  Subir mi Contrato
                                </label>*/}

                                <input
                                  id={`file-upload-${  application._id}`}
                                  type="file"
                                  accept="application/pdf"
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleUploadContract(application._id, e.target.files[0])}
                                />
                              </div>
                            )}

                            {/* If contract is generated but not uploaded, show these buttons */}
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
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* For fully signed contracts, just show view button */}
                  {application.status === 'Firmado' && (
                    <div className="flex flex-col md:flex-row">
                      <a
                        href={application.contract?.url}
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
            style={{
              content: {
                maxWidth: '500px',
                width: '90%',
                margin: 'auto',
                padding: '20px',
                borderRadius: '8px'
              },
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }
            }}
          >
            {selectedApplication && (
              <div className='bg-white p-6 mx-auto rounded-xl shadow-lg w-full'>
                <h2 className="text-2xl mb-4">
                  {contractPreview ? 'Contrato Generado' : 'Generar Contrato'}
                </h2>

                {contractPreview ? (
                  <div>
                    {contractUrl ? (
                      <div>
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                          <p className="font-medium mb-3">El contrato ha sido generado correctamente</p>

                          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                            <a
                              href={contractUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center justify-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver contrato completo
                            </a>

                            <a
                              href={contractUrl}
                              download="contrato.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded inline-flex items-center justify-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Descargar PDF
                            </a>
                          </div>

                          <p className="text-xs text-gray-500 mt-2">
                            El contrato se abrirá en una nueva pestaña
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-yellow-50 p-4 rounded border border-yellow-200">
                        <p className="font-medium mb-2 text-yellow-700">No se ha podido cargar el contrato.</p>
                        <p className="text-sm mb-3">El contrato se ha generado correctamente pero no se puede visualizar en este momento.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Keep the existing contract generation form
                  <div className="space-y-4">
                    <p>¿Deseas generar un contrato automático para esta solicitud?</p>
                    <div className="flex justify-end space-x-2">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={() => handleGenerateContract(selectedApplication._id)}
                      >
                        Generar Contrato
                      </button>
                      <button
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        onClick={closeModal}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Replace the bottom buttons section if contractPreview is true */}
                {contractPreview && contractUrl && (
                  <div className="mt-6 flex justify-between">
                    <button
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                      onClick={() => {
                        closeModal();
                        // Update UI to show contract is available
                        setApplications(prevApps => [...prevApps]);
                      }}
                    >
                      Cerrar
                    </button>

                    {/* Only show the appropriate action button based on signature status */}
                    {selectedApplication && selectedApplication.ownerSignature?.verified === true ? (
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={() => handleSendContract(selectedApplication._id)}
                      >
                        Enviar al inquilino
                      </button>
                    ) : (
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                        onClick={() => handleSignAndSendContract(selectedApplication._id)}
                      >
                        Firmar contrato
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </ReactModal>
          <ReactModal
            isOpen={signatureModalOpen}
            onRequestClose={() => setSignatureModalOpen(false)}
            contentLabel="Firmar Contrato"
            className="modal"
            overlayClassName="modal-overlay"
          >
            <div className='bg-white p-6 mx-auto rounded-xl shadow-lg w-11/12 max-w-xl'>
              <h2 className="text-2xl mb-6 text-center">Firmar Contrato</h2>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Al firmar este contrato, usted confirma que ha leído, entendido y está de acuerdo con todos los términos y condiciones establecidos en el mismo. Esta firma tendrá el mismo valor legal que una firma manuscrita.
                </p>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-sm text-yellow-700">
                    <strong>Importante:</strong> Una vez firmado el documento, no se podrá modificar. Asegúrese de revisar cuidadosamente el contrato antes de firmarlo.
                  </p>
                </div>
              </div>

              <SignaturePad
                onSave={handleSaveSignature}
                onCancel={() => setSignatureModalOpen(false)}
              />
            </div>
          </ReactModal>
        </ul>

      ) : (
        <p className="text-center text-gray-600">
          No hay solicitudes para esta propiedad.
        </p>
      )}
      {hasProblematicApplication && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-700">
            <strong>Aviso:</strong> Algunas solicitudes tienen estado inconsistente.
            Si tienes problemas con los contratos, por favor refresca la página.
          </p>
        </div>
      )}
    </div>

  );
}