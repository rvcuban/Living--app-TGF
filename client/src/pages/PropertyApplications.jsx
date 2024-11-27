import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Importamos Link y useNavigate
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { storage } from '../firebase'; // Asegúrate de que la ruta es correcta
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import ReactModal from 'react-modal';

// Configurar el elemento root para el modal
ReactModal.setAppElement('#root');


export default function PropertyApplications() {
  const { listingId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate(); // Para redirigir al usuario

  // modal que se abre al generar contrato
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [uploadProgress, setUploadProgress] = useState({}); // Para mostrar el progreso de subida


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
        // Actualizar el estado de la aplicación en el estado local
        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app._id === applicationId
              ? {
                ...app,
                contract: {
                  ...app.contract,
                  generatedAt: new Date(),
                  contractGenerated: true,
                },
                contractGenerated: true,
              }
              : app
          )
        );
        // Cerrar el modal
        closeModal();
      } else {
        toast.error(data.message || 'Error al generar el contrato.');
      }
    } catch (error) {
      console.error('Error generating contract:', error);
      toast.error('Error al generar el contrato.');
    }
  };

  const handleUploadContract = async (applicationId, file) => {
    if (!file) {
      toast.error('Por favor, selecciona un archivo PDF.');
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10 MB
      toast.error('El archivo excede el tamaño máximo de 10MB.');
      return;
    }

    const storageRef = ref(storage, `contracts/${applicationId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Subiendo contrato: ${progress}% completado`);
        setUploadProgress((prevProgress) => ({
          ...prevProgress,
          [applicationId]: progress,
        }));
      },
      (error) => {
        console.error('Error al subir el contrato:', error);
        toast.error('Error al subir el contrato.');
        setUploadProgress((prevProgress) => ({
          ...prevProgress,
          [applicationId]: 0,
        }));
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          try {
            const res = await fetch(`/api/applications/${applicationId}/upload-contract`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`,
              },
              body: JSON.stringify({ contractUrl: downloadURL, fileName: file.name }), // Enviar 'fileName'
            });
            const data = await res.json();
            if (data.success) {
              toast.success('Contrato subido correctamente.');
              setApplications((prevApplications) =>
                prevApplications.map((app) =>
                  app._id === applicationId
                    ? {
                      ...app,
                      contractUrl: data.contractUrl,     // A nivel raíz
                      contractUploaded: true,            // A nivel raíz
                      contract: {
                        ...app.contract,
                        uploadedAt: new Date(),
                        fileName: data.fileName,
                      },
                    }
                    : app
                )
              );

              setUploadProgress((prevProgress) => ({
                ...prevProgress,
                [applicationId]: 100,
              }));
            } else {
              toast.error(data.message || 'Error al subir el contrato.');
            }
          } catch (error) {
            console.error('Error al actualizar el contrato en el backend:', error);
            toast.error('Error al actualizar el contrato en el backend.');
          }
        });
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
      // Obtener la URL del contrato
      const application = applications.find(app => app._id === applicationId);
      if (!application || !application.contract.url) {
        toast.error('Contrato no encontrado.');
        return;
      }

      // Obtener la referencia del archivo en Firebase Storage
      const fileRef = ref(storage, `contracts/${applicationId}/${application.contract.fileName}`);

      // Eliminar el archivo de Firebase Storage
      await deleteObject(fileRef);
      console.log('Contrato eliminado de Firebase Storage.');

      // Eliminar la URL del contrato en el backend
      const res = await fetch(`/api/applications/${applicationId}/delete-contract`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Contrato eliminado correctamente.');
        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app._id === applicationId
              ? {
                ...app,
                contractUrl: '',               // A nivel raíz
                contractUploaded: false,       // A nivel raíz
                contract: {
                  url: '',
                  uploadedAt: null,
                  contractUploaded: false,
                  fileName: '',
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

  console.log('listingId:', listingId);

  console.log('listingId:', listingId); // Añade este console.log

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        Solicitudes para tu Propiedad
      </h1>
      {applications.length > 0 ? (
        <ul className="space-y-4">
          {applications.map((application) => {
            console.log('Aplicación:', application);
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
                      className="  text-red-500 "
                      onClick={() => handleContact(user._id)}
                    >
                      Contactar
                    </button>
                  </div>
                </Link>
                {/* Botones de acción */}
                <div className="flex flex-col md:flex-row mt-4 md:mt-0 md:ml-auto">

                  {application.status === 'Enviada' && (
                    <>
                      <div className=''>

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

                  {application.status === 'Aceptada' && (
                    <>
                      {/* Si el contrato NO ha sido subido, mostrar botones de Generar y Subir */}
                      {!application.contractUploaded && (

                        <>
                          <div className="flex flex-col">
                            <p className="mb-2">
                              <strong>Contrato Subido:</strong> {application.contract.fileName}
                            </p>
                            <div className="flex flex-col md:flex-row">
                              {/* Botón para Generar Contrato */}
                              {!application.contractGenerated && (
                                <button
                                  className="bg-yellow-500 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0"
                                  onClick={() => openModal(application)}
                                >
                                  Generar Contrato
                                </button>
                              )}

                              {/* Botón para Subir Contrato */}
                              <div className="flex flex-col">

                                <label
                                  htmlFor={`contract-${application._id}`}
                                  className="bg-purple-500 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0 cursor-pointer"
                                >
                                  Subir Contrato
                                </label>
                                <input
                                  type="file"
                                  id={`contract-${application._id}`}
                                  accept="application/pdf"
                                  style={{ display: 'none' }}
                                  onChange={(e) =>
                                    handleUploadContract(application._id, e.target.files[0])
                                  }
                                />
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
                            </div>
                          </div>
                        </>
                      )}

                      {/* Si el contrato ha sido subido, mostrar nombre del archivo y botones Ver, Eliminar, Enviar */}
                      {application.contractUploaded && (
                        <div className="flex flex-col">
                          <p className="mb-2">
                            <strong>Contrato Subido:</strong> {application.contract.fileName}
                          </p>
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
                              className="flex-none bg-red-600 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0"
                              onClick={() => handleDeleteContract(application._id)}
                            >
                              Eliminar Contrato
                            </button>
                            <button
                              className="flex-none bg-indigo-500 text-white px-4 py-2 rounded mr-2"
                              onClick={() => handleSendContract(application._id)}
                            >
                              Enviar Contrato
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}



                </div>
              </li>
            );
          })}
          <ReactModal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Generar Contrato"
            className="modal"
            overlayClassName="modal-overlay"
          >
            {selectedApplication && (
              <div className='bg-white p-6 mx-auto rounded-xl shadow-lg w-11/12 max-w-sm sm:max-w-md md:max-w-lg'>
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
                     Generar automaticamente
                  </button>
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                    onClick={closeModal}
                  >
                    Cancelar
                  </button>
                </div>
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