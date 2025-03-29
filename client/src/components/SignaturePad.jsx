import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function  SignaturePad ({ onSave, onCancel }) {
  const sigCanvas = useRef({});
  const [imageURL, setImageURL] = useState(null);
  const [signatureType, setSignatureType] = useState('draw'); // 'draw' or 'upload'
  const [uploadedSignature, setUploadedSignature] = useState(null);

  const clear = () => {
    sigCanvas.current.clear();
    setImageURL(null);
  };

  const save = () => {
    if (signatureType === 'draw') {
      if (sigCanvas.current.isEmpty()) {
        alert('Por favor dibuje su firma antes de guardar');
        return;
      }
      const dataURL = sigCanvas.current.toDataURL('image/png');
      setImageURL(dataURL);
      onSave(dataURL, 'draw');
    } else {
      if (!uploadedSignature) {
        alert('Por favor suba una imagen de su firma');
        return;
      }
      onSave(uploadedSignature, 'upload');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Por favor, suba solo archivos de imagen');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedSignature(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="signature-container">
      <div className="flex justify-center mb-4">
        <div className="flex space-x-4">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg ${signatureType === 'draw' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSignatureType('draw')}
          >
            Dibujar firma
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg ${signatureType === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSignatureType('upload')}
          >
            Subir firma
          </button>
        </div>
      </div>

      {signatureType === 'draw' ? (
        <>
          <div className="border-2 border-gray-300 rounded-md mb-4">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="blue"
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas'
              }}
            />
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-red-500 text-white rounded mr-2"
            onClick={clear}
          >
            Borrar
          </button>
        </>
      ) : (
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-4"
          />
          {uploadedSignature && (
            <div className="border-2 border-gray-300 rounded-md p-4 mb-4 flex justify-center">
              <img
                src={uploadedSignature}
                alt="Firma cargada"
                style={{ maxHeight: '200px', maxWidth: '100%' }}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          className="px-4 py-2 bg-gray-500 text-white rounded"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={save}
        >
          Guardar firma
        </button>
      </div>
    </div>
  );
};

