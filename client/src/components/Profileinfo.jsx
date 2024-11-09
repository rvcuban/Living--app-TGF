import React, { useState } from 'react';
import InfoItem from './InfoItem2';
import LanguageSection from './LanguajeSection';
import AddressSection from './AddressSection';
import TravelDocuments from './TravelDocuments';
import TrustedContacts from './TrustedContacts';
import PersonalPreferences from './PersonalPreferences';
import ReviewsSection from './ReviewsSections';
import { Frown } from 'lucide-react';

//dependencias para la subida de ficheros a firebase
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';





const profileItems = [
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/7630f2d8f2a9edd111ea306d0cbf7026fb36ffacacd3d89489edc7c36f022b2c?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955", title: "Phone", content: "+1 (123) 456 7890" },
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/571643bde3271252919f61aa9e7e43b32e281b9b5dd35316df8a907ba2777f82?placeholderIfAbsent=true&apiKey=75a06edce8de4127b1443d78918d0955", title: "Date of birth", content: "Add your date of birth" }
];

function ProfileInfo({ currentUser, className }) {
    //para subir documentos 
    const [documents, setDocuments] = useState([]);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');

    //para traer la informacion del usuario actual
    const [formData, setFormData] = useState({
        phone: currentUser.phone || '',
        dateOfBirth: currentUser.dateOfBirth || '',
        address: currentUser.address || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        passportFront: currentUser.passportFront || '',
        idBack: currentUser.idBack || '',
        solvencyDoc: currentUser.solvencyDoc || '',
    });

    //subida de  ver numero de ficheros 
    const handleFileChange = (e, documentType) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFileName(selectedFile.name);
            handleUpload(selectedFile, documentType);
        }
    };

    const handleUpload = () => {
        if (!file) return;
        setUploading(true);
        setUploadError('');
        const storage = getStorage(app);
        const fileName = `${new Date().getTime()}_${file.name}`;
        const storageRef = ref(storage, `documents/${currentUser.id}/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(Math.round(progress));
            },
            (error) => {
                setUploadError('Error uploading file');
                setUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setDocuments((prev) => [...prev, { name: file.name, url: downloadURL }]);
                    setFile(null);
                    setUploading(false);
                    setUploadProgress(0);
                });
            }
        );
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    //esta funcion es la encargada de mandarle la informacion al backend , e utiliza en el form 
    const handleSubmit = async (e) => {
        e.preventDefault(); // evitamos que se haga refresh de la apgina 
        try {
            dispatch(updateUserStart());
            const res = await fetch(`/api/user/update/${currentUser._id}`, { // hacemos el fecth con el id del usuario a actualizar
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),//enviamos el form data por que aqui fue donde guardamos los cambios 
            });
            const data = await res.json();
            if (data.success === false) {
                dispatch(updateUserFailure(data.message));
                return;
            }

            dispatch(updateUserSuccess(data));
            setUpdateSuccess(true);
        } catch (error) {
            dispatch(updateUserFailure(error.message));
        }
    };






    return (
        <form onSubmit={handleSubmit} className=" w-full rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Profile</h2>

            {/* Username */}
            <label className="block mb-4">
                <span className="block text-gray-600 font-semibold">Nombre Completo</span>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter your username"
                />
            </label>

            {/* Email */}
            <label className="block mb-4">
                <span className="block text-gray-600 font-semibold">Email</span>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm text-gray-500 bg-gray-100 cursor-not-allowed opacity-50 p-2"
                    placeholder="Enter your email"
                />
            </label>

            {/* Phone */}
            <label className="block mb-4">
                <span className="block text-gray-600 font-semibold">Phone</span>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200 p-2"
                    placeholder="Enter your phone number"
                />
            </label>

            {/* Date of Birth */}
            <label className="block mb-4">
                <span className="block text-gray-600 font-semibold">Date of Birth</span>
                <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
            </label>

            {/* Address */}
            <label className="block mb-6">
                <span className="block text-gray-600 font-semibold">Address</span>
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter your address"
                />
            </label>

            <label className="block mb-4">
                <span className="block text-gray-600 font-semibold">Gender</span>
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm text-gray-900 bg-white focus:border-blue-500 focus:ring focus:ring-blue-200"
                >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </label>

            <h2 className="text-2xl font-bold mb-4 text-gray-800">My Documents</h2>
            {/* File Upload */}
            <div className="mb-4">
                <label className="block text-gray-600 font-semibold mb-1">
                    Pasaporte o Parte delantera del Carnet de Identidad
                </label>
                <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'passportFront')}
                    className="border border-gray-300 rounded-md p-2 w-full"
                />
                {uploading && (
                    <div className="text-gray-600 font-medium mt-2">
                        Subiendo: {uploadProgress}%
                    </div>
                )}
                {formData.passportFront && (
                    <div className="text-gray-700 font-medium mt-2">
                        Archivo subido: {fileName}
                    </div>
                )}
                {uploadError && (
                    <div className="text-red-600 font-semibold mt-2">{uploadError}</div>
                )}
            </div>


            {/* File Upload */}
            <div className="mb-4">
                <label className="block text-gray-600 font-semibold mb-1">
                    Pasaporte o Parte delantera del Carnet de Identidad
                </label>
                <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'passportFront')}
                    className="border border-gray-300 rounded-md p-2 w-full"
                />
                {uploading && (
                    <div className="text-gray-600 font-medium mt-2">
                        Subiendo: {uploadProgress}%
                    </div>
                )}
                {formData.passportFront && (
                    <div className="text-gray-700 font-medium mt-2">
                        Archivo subido: {fileName}
                    </div>
                )}
                {uploadError && (
                    <div className="text-red-600 font-semibold mt-2">{uploadError}</div>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-gray-600 font-semibold mb-1">
                    Pasaporte o Parte delantera del Carnet de Identidad
                </label>
                <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'passportFront')}
                    className="border border-gray-300 rounded-md p-2 w-full"
                />
                {uploading && (
                    <div className="text-gray-600 font-medium mt-2">
                        Subiendo: {uploadProgress}%
                    </div>
                )}
                {formData.passportFront && (
                    <div className="text-gray-700 font-medium mt-2">
                        Archivo subido: {fileName}
                    </div>
                )}
                {uploadError && (
                    <div className="text-red-600 font-semibold mt-2">{uploadError}</div>
                )}
            </div>

            {/* Display Uploaded Documents */}
            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Uploaded Documents</h3>
                {documents.length > 0 ? (
                    <ul className="space-y-2">
                        {documents.map((doc, index) => (
                            <li key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded-lg shadow-sm">
                                <span className="text-gray-700 font-medium truncate w-2/3">{doc.name}</span>
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline text-sm"
                                >
                                    View
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="p-2 text-gray-600">No documents uploaded yet.</p>
                )}
            </div>




            {/* Submit Button */}
            <button type="submit" className="w-full py-2 px-4 rounded-md bg-blue-600 text-white font-semibold  shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Save Changes
            </button>
        </form>
    );
}

export default ProfileInfo;