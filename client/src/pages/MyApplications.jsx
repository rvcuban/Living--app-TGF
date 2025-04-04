import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import ReactModal from 'react-modal';
import SignaturePad from '../components/SignaturePad';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import ApplicationCard from '../components/ApplicationCard';

// Set PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
ReactModal.setAppElement('#root');

// Simplified ContractViewer component
const ContractViewer = ({ contractUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setCurrentPage(numPages); // Start at the signature page (last page)
    setLoading(false);
  };

  const changePage = (offset) => {
    setCurrentPage(prevPage => Math.min(Math.max(prevPage + offset, 1), numPages));
  };

  if (!contractUrl) return <div className="text-center p-4">No hay contrato disponible</div>;

  return (
    <div className="contract-viewer">
      {loading && <div className="text-center p-4">Cargando documento...</div>}

      {!loading && (
        <>
          <div className="text-center mb-2">
            <p className="text-sm">
              Página {currentPage} de {numPages}
              {currentPage === numPages && <span className="ml-1">(Firmas)</span>}
            </p>
          </div>

          <div className="flex justify-center">
            <Document
              file={contractUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={null}
              error={null}
            >
              <Page
                pageNumber={currentPage}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={Math.min(450, window.innerWidth - 60)}
              />
            </Document>
          </div>

          <div className="flex justify-between mt-3">
            <button
              onClick={() => changePage(-1)}
              disabled={currentPage <= 1}
              className={`px-3 py-1 rounded ${currentPage <= 1 ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
            >
              ← Anterior
            </button>

            <button
              onClick={() => changePage(1)}
              disabled={currentPage >= numPages}
              className={`px-3 py-1 rounded ${currentPage >= numPages ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [contractUrl, setContractUrl] = useState('');
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signingApplication, setSigningApplication] = useState(null);

  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (applications.length > 0) {
      console.log("All applications and their signature status:", 
        applications.map(app => ({
          id: app._id,
          status: app.status,
          contractUrl: !!app.contract?.url, 
          ownerSigned: app.ownerSignature?.verified === true,
          tenantSigned: app.tenantSignature?.verified === true
        }))
      );
    }
  }, [applications]);

  // Helper to check if contract needs tenant signature
  const needsTenantSignature = (application) => {
    if (!application) return false;

    // Add enhanced logging
    console.log("Contract signing eligibility check:", {
      applicationId: application._id,
      status: application.status,
      contractUrl: !!application.contract?.url,
      ownerSigned: application.ownerSignature?.verified === true,
      tenantSigned: application.tenantSignature?.verified === true,
      contractComplete: application.contract?.completed === true
    });

    // Simpler check: Contract exists, owner signed, tenant hasn't signed
    return (
      application.contract?.url &&
      application.ownerSignature?.verified === true &&
      application.tenantSignature?.verified !== true
    );
  };
  // Open contract modal
  const openContractModal = (application) => {
    // Force refresh before showing to make sure we have latest status
    refreshSingleApplication(application._id)
      .then(refreshedApp => {
        const appToShow = refreshedApp || application;

        console.log("Opening contract modal with application:", {
          id: appToShow._id,
          status: appToShow.status,
          ownerSignatureVerified: appToShow.ownerSignature?.verified,
          tenantSignatureVerified: appToShow.tenantSignature?.verified,
          contractUrl: appToShow.contract?.url
        });

        setSelectedApplication(appToShow);
        setContractUrl(appToShow.contract?.url || '');
        setModalIsOpen(true);
      })
      .catch(err => {
        console.error("Error refreshing application:", err);
        setSelectedApplication(application);
        setContractUrl(application.contract?.url || '');
        setModalIsOpen(true);
      });
  };

  // Add this helper function to fetch a single application
  const refreshSingleApplication = async (applicationId) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });

      const data = await res.json();

      if (data.success !== false && data.application) {
        // Update this application in the state
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app._id === applicationId ? data.application : app
          )
        );

        return data.application;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing application:', error);
      return null;
    }
  };

  // Call this periodically to keep data fresh
  useEffect(() => {
    // Fetch fresh data on initial load
    if (currentUser) {
      fetchApplications();

      // Set up a refresh interval for real-time updates
      const refreshInterval = setInterval(() => {
        fetchApplications();
      }, 60000); // Refresh every minute

      return () => clearInterval(refreshInterval);
    }
  }, [currentUser]);

  // Open signature modal
  const openSignatureModal = (application) => {
    setSigningApplication(application);
    setSignatureModalOpen(true);
  };

  // Handle signature save
  const handleSaveSignature = async (signatureData, signatureType) => {
    try {
      if (!signingApplication) return;

      // Store the original application data before signing (for reference)
      const originalApplication = { ...signingApplication };

      setSignatureModalOpen(false);
      toast.info('Firmando contrato, por favor espere...');

      // Add debug logging for pre-signature state
      console.log("Before signing - Application:", signingApplication);
      console.log("Before signing - Owner signature:", signingApplication.ownerSignature);

      const res = await fetch(`/api/applications/${signingApplication._id}/sign-contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          signatureData: signatureData,
          signatureType: signatureType,
          signedBy: 'tenant',
          // IMPORTANT: Pass the owner signature info to preserve it
          preserveOwnerSignature: signingApplication.ownerSignature?.verified === true,
        }),
      });

      const data = await res.json();

      // Add extensive debug logging
      console.log("Sign contract response:", data);
      console.log("After signing - Owner signature:", data.application?.ownerSignature);
      console.log("After signing - Tenant signature:", data.application?.tenantSignature);

      if (data.success) {
        toast.success('Contrato firmado correctamente');

        // Create a properly merged application that preserves both signatures
        const updatedApplication = {
          ...data.application,
          // Ensure we keep the owner signature if it existed before
          ownerSignature: data.application.ownerSignature || originalApplication.ownerSignature,
        };

        // Update application in the list with our merged version
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app._id === signingApplication._id ? updatedApplication : app
          )
        );

        // Show the contract modal with the updated contract
        setContractUrl(data.contract?.url || data.signedContractUrl);
        setSelectedApplication(updatedApplication);
        setModalIsOpen(true);

        // Refresh the application data from server after a short delay
        setTimeout(() => {
          fetchUpdatedApplication(signingApplication._id);
        }, 1000);
      } else {
        toast.error(data.message || 'Error al firmar el contrato');
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      toast.error('Error al firmar el contrato');
    }
  };

  // Add this helper function to fetch just the updated application
  const fetchUpdatedApplication = async (applicationId) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });

      const data = await res.json();

      if (data.success && data.application) {
        // Update this specific application in state
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app._id === applicationId ? data.application : app
          )
        );

        // If this application is currently selected in the modal, update it
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication(data.application);
        }
      }
    } catch (error) {
      console.error('Error fetching updated application:', error);
    }
  };
  // Fetch applications
  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });

      const data = await res.json();

      if (data.success !== false) {
        setApplications(data.applications);
      } else {
        setError(true);
        toast.error('Error al obtener las aplicaciones');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(true);
      toast.error('Error al obtener las aplicaciones');
    } finally {
      setLoading(false);
    }
  };

  // Cancel application
  const handleCancelApplication = async (applicationId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta aplicación?')) {
      return;
    }

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });

      const data = await res.json();

      if (data.success !== false) {
        setApplications((prev) => prev.filter((app) => app._id !== applicationId));
        toast.success('Aplicación cancelada correctamente');
      } else {
        toast.error('Error al cancelar la aplicación');
      }
    } catch (error) {
      console.error('Error canceling application:', error);
      toast.error('Error al cancelar la aplicación');
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchApplications();
    } else {
      setLoading(false);
      setError(true);
    }
  }, [currentUser]);

  // Loading and error states
  if (!currentUser) return <div className="p-4 text-center">Por favor, inicia sesión para ver tus aplicaciones.</div>;
  if (loading) return <div className="p-4 text-center">Cargando aplicaciones...</div>;
  if (error) return <div className="p-4 text-center text-red-600">Error al cargar las aplicaciones.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
      <h1 className="text-xl sm:text-2xl font-semibold mb-4 text-center">Mis Aplicaciones</h1>

      {/* Simple status legend */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-medium mb-2">Estados del contrato:</h3>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Firmado completamente</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>Tu firma pendiente</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Firma propietario pendiente</span>
          </div>
        </div>
      </div>

      {/* Applications list */}
      {applications.length > 0 ? (
        <ul className="space-y-4">
          {applications.map((application) => (
            <li key={application._id}>
              <ApplicationCard
                application={application}
                onCancel={handleCancelApplication}
                onViewContract={openContractModal}
                onSignContract={openSignatureModal}
                needsTenantSignature={needsTenantSignature}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-white p-4 shadow rounded-lg text-center">
          <p className="text-gray-600">No has aplicado a ninguna propiedad aún.</p>
        </div>
      )}

      {/* Simplified Contract Modal */}
      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Ver Contrato"
        className="modal"
        overlayClassName="modal-overlay"
        style={{
          content: {
            width: '95%',
            maxWidth: '700px',
            margin: 'auto',
            borderRadius: '8px',
            padding: '15px',
            maxHeight: '90vh',
            overflow: 'auto'
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px'
          }
        }}
      >
        <div className="bg-white p-4 rounded">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Contrato de Alquiler</h2>
            <div className="text-sm px-2 py-1 bg-gray-100 rounded">
              {selectedApplication?.status || 'No disponible'}
            </div>
          </div>

          {/* Simple signature status */}
          {selectedApplication && (
            <div className="mb-4 p-3 border rounded bg-gray-50">
              <h3 className="text-sm font-medium mb-2">Estado de firmas:</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-medium">Firma del propietario:</p>
                  <p className={`text-sm ${selectedApplication.ownerSignature?.verified === true ? 'text-green-600' : 'text-gray-500'}`}>
                    {selectedApplication.ownerSignature?.verified === true ? '✓ Firmado' : '○ Pendiente'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Tu firma:</p>
                  <p className={`text-sm ${selectedApplication.tenantSignature?.verified === true ? 'text-green-600' : 'text-blue-600'}`}>
                    {selectedApplication.tenantSignature?.verified === true
                      ? '✓ Firmado'
                      : needsTenantSignature(selectedApplication)
                        ? '⚠️ Requiere tu firma'
                        : '○ Pendiente'}
                  </p>
                </div>

                {/* Add a clearer message about the real contract status */}
                <div className="col-span-2 mt-2 pt-2 border-t border-gray-200 text-center">
                  <p className="text-sm font-medium">
                    {selectedApplication.ownerSignature?.verified === true && selectedApplication.tenantSignature?.verified === true
                      ? "✅ El contrato está completamente firmado"
                      : selectedApplication.ownerSignature?.verified === true
                        ? "🔔 Pendiente de tu firma para completar el contrato"
                        : selectedApplication.tenantSignature?.verified === true
                          ? "⏳ Pendiente de firma del propietario"
                          : "⚠️ El contrato requiere firmas de ambas partes"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contract viewer */}
          <div className="border rounded p-2 mb-4" style={{ maxHeight: '60vh', overflow: 'auto' }}>
            {contractUrl ? (
              <ContractViewer contractUrl={contractUrl} />
            ) : (
              <div className="text-center p-4 text-yellow-600">
                No se ha podido cargar el PDF
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => setModalIsOpen(false)}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Cerrar
            </button>

            <div className="flex gap-2">
              {contractUrl && (
                <div className="flex gap-2">
                  <a
                    href={contractUrl}
                    download="contrato.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white px-3 py-1 rounded inline-block"
                  >
                    Descargar
                  </a>

                  {/* Make this condition more reliable for detecting when tenant needs to sign */}
                  {selectedApplication &&
                    selectedApplication.contract?.url &&
                    selectedApplication.ownerSignature?.verified === true &&
                    selectedApplication.tenantSignature?.verified !== true && (
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                        onClick={() => {
                          setModalIsOpen(false);
                          openSignatureModal(selectedApplication);
                        }}
                      >
                        Firmar ahora
                      </button>
                    )}
                </div>
              )}

              {selectedApplication && needsTenantSignature(selectedApplication) && (
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => {
                    setModalIsOpen(false);
                    openSignatureModal(selectedApplication);
                  }}
                >
                  Firmar ahora
                </button>
              )}
            </div>
          </div>
        </div>
      </ReactModal>

      {/* Signature Modal - Kept simple */}
      <ReactModal
        isOpen={signatureModalOpen}
        onRequestClose={() => setSignatureModalOpen(false)}
        contentLabel="Firmar Contrato"
        className="modal"
        overlayClassName="modal-overlay"
        style={{
          content: {
            width: '95%',
            maxWidth: '600px',
            margin: 'auto',
            borderRadius: '8px',
            padding: '15px',
            maxHeight: '90vh',
            overflow: 'auto'
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px'
          }
        }}
      >
        <div className="bg-white p-4 rounded">
          <h2 className="text-xl font-medium mb-4 text-center">Firma del Contrato</h2>

          <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded">
            <p className="text-sm">
              <strong>Importante:</strong> Al firmar este contrato, confirmas que has leído y aceptas todos sus términos y condiciones.
            </p>
            {signingApplication?.contract?.url && (
              <div className="mt-2">
                <a
                  href={signingApplication.contract.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Ver contrato completo
                </a>
              </div>
            )}
          </div>

          {/* Use SignaturePad component for consistency */}
          <SignaturePad
            onSave={handleSaveSignature}
            onCancel={() => setSignatureModalOpen(false)}
          />
        </div>
      </ReactModal>
    </div>
  );
}