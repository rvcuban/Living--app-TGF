
import PropertyCard from './PropertyCard';
export default function ApplicationCard({ application, onCancel, onViewContract, onSignContract, needsTenantSignature }) {
    if (!application) return null;

    const hasContract = application.contract?.url;
    const needsSignature = needsTenantSignature(application);

    // Helper function to determine the REAL signature status
    const getActualContractStatus = () => {
        if (!application?.contract?.url) return null;

        // Check the ACTUAL signature status based on signature objects, not just the status field
        const ownerSigned = application.ownerSignature?.verified === true;
        const tenantSigned = application.tenantSignature?.verified === true;

        if (ownerSigned && tenantSigned) {
            return {
                status: 'completed',
                label: 'Firmado completamente',
                className: 'bg-green-100 text-green-800'
            };
        } else if (ownerSigned && !tenantSigned) {
            return {
                status: 'needsTenantSignature',
                label: 'Tu firma pendiente',
                className: 'bg-blue-100 text-blue-800'
            };
        } else if (!ownerSigned && tenantSigned) {
            return {
                status: 'needsOwnerSignature',
                label: 'Firma propietario pendiente',
                className: 'bg-yellow-100 text-yellow-800'
            };
        } else {
            return {
                status: 'noSignatures',
                label: 'Firmas pendientes',
                className: 'bg-gray-100 text-gray-800'
            };
        }
    };

    const actualStatus = getActualContractStatus();

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Show the PropertyCard */}
            <PropertyCard
                property={application.listingId}
                applicationStatus={application.status}
                applicationId={application._id}
                isApplication={true}
                onCancelApplication={onCancel}
                rentalDuration={application.rentalDurationMonths}
            />

            {/* Only show contract section if there is a contract */}
            {hasContract && (application.status === 'Contrato Notificado' ||
                application.status === 'Firmado' ||
                application.status === 'Firmado por Inquilino' ||
                application.status === 'Firmado por Propietario') && (
                    <div className="mt-4 pt-3 border-t">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">Contrato</h3>

                            {/* Better status badge - based on actual signature status */}
                            {actualStatus && (
                                <span className={`${actualStatus.className} text-xs font-medium px-2 py-1 rounded-full`}>
                                    {actualStatus.label}
                                </span>
                            )}
                        </div>

                        {/* Signature status summary */}
                        <div className="my-2 p-2 bg-gray-50 rounded text-xs">
                            <div className="flex justify-between">
                                <div>
                                    <span className="font-medium">Firma propietario:</span>
                                    <span className={application.ownerSignature?.verified === true ? "text-green-600" : "text-gray-500"}>
                                        {application.ownerSignature?.verified === true ? "✓ Firmado" : "○ Pendiente"}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium">Tu firma:</span>
                                    <span className={application.tenantSignature?.verified === true ? "text-green-600" : "text-blue-600"}>
                                        {application.tenantSignature?.verified === true ? "✓ Firmado" : "○ Pendiente"}
                                    </span>
                                </div>
                            </div>


                        </div>
                        {application.contract?.url && !application.tenantSignature?.verified && (
                            <div className="my-2 p-2 bg-blue-50 border-l-4 border-blue-500 text-sm">
                                <p className="font-medium text-blue-700">
                                    ⚠️ Este contrato requiere tu firma
                                </p>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => onViewContract(application)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            >
                                Ver contrato
                            </button>

                            {/* Only show sign button if contract exists and tenant hasn't signed yet */}
                            {application.contract?.url &&
                                !application.tenantSignature?.verified && (
                                    <button
                                        onClick={(e) => {
                                            // Prevent event from bubbling up to parent elements
                                            e.stopPropagation();
                                            onSignContract(application);
                                        }}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Firmar contrato
                                    </button>
                                )}
                        </div>
                    </div>
                )}
        </div>
    );
}