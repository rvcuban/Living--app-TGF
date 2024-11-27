import { useState, useEffect } from 'react';
import { useParams ,Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { storage } from '../firebase'; // Asegúrate de que la ruta es correcta
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';


export default function PropertyApplications() {
  const { listingId } = useParams();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Obtener las solicitudes de la propiedad
    fetch(`/api/applications/property/${listingId}`, {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success !== false) {
          setApplications(data.applications);
        } else {
          console.error('Error fetching applications:', data.message);
        }
      })
      .catch((error) => {
        console.error('Error fetching applications:', error);
      });
  }, [id]);

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
      },
      (error) => {
        console.error('Error al subir el contrato:', error);
        toast.error('Error al subir el contrato.');
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
              body: JSON.stringify({ contractUrl: downloadURL }),
            });
            const data = await res.json();
            if (data.success) {
              toast.success('Contrato subido correctamente.');
              setApplications((prevApplications) =>
                prevApplications.map((app) =>
                  app._id === applicationId
                    ? { ...app, contractUploaded: true, contractUrl: data.contractUrl }
                    : app
                )
              );
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

  const handleContact = (userId) => {
    navigate(`/messages/${userId}`);
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
        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app._id === applicationId ? { ...app, contractGenerated: true } : app
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

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">Solicitudes</h1>
      {applications.length > 0 ? (
        <ul className="space-y-4">
          {/* Mapea y muestra cada solicitud */}
          {applications.map((application) => (
            <li key={application._id} className="bg-white shadow-md rounded-lg p-4">
              {/* Información de la solicitud */}
              <p>Solicitante: {application.userId.username}</p>
              <p>Estado: {application.status}</p>
              {/* Botones para aceptar o rechazar la solicitud */}
              <div className="flex mt-2">
                <button className="bg-green-500 text-white px-4 py-2 rounded mr-2">Aceptar</button>
                <button className="bg-red-500 text-white px-4 py-2 rounded">Rechazar</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes solicitudes para esta propiedad.</p>
      )}
    </div>
  );
}
