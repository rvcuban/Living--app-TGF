import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useState } from 'react'
import { app } from '../firebase';

export default function CreateListing() {
    const [files, setFiles] = useState([]);
    const [formData, setFormData] = useState({
        imageUrls: [],
    });

    const [imageUploadError, setImageUploadError] = useState(false);
    const [uploading, setUploading] = useState(false);
    console.log(formData);

    const handleImageSubmit = (e) => {
        if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
            setUploading(true);
            setImageUploadError(false);
            const promises = [];
            for (let i = 0; i < files.length; i++) {
                promises.push(storeImage(files[i]));

            }
            Promise.all(promises).then((urls) => {
                //aqui añadimos al formdata las imagenes urls pero aemas queremos manteber las antiguas por eso utilizams el concat
                setFormData({
                    ...setFormData, imageUrls: formData.imageUrls.concat(urls),

                });
                setImageUploadError(false);
                setUploading(false);
            }).catch((err) => {
                setImageUploadError('Image upload failed(2 mb amx per image)');
                setUploading(false);
            });
        } else {
            setImageUploadError('Solo puedes subir 6 imagenes por propiedad');
            setUploading(false);
        }
    };

    const storeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const filename = new Date().getTime() + file.name
            const storageRef = ref(storage, filename);
            const uploadTask = uploadBytesResumable(storageRef, file)
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            )
        });
    };

    const handleRemoveImage = (index) => {
        setFormData({
            ...formData,
            imageUrls: formData.imageUrls.filter((_, i) => i !== index),
        });
    };


    return (
        <main className='p-3 max-w-4xl mx-auto'>
            <h1 className='text-3xl font-semibold text-center my-7'>Crea una Propiedad</h1>

            <form className='flex flex-col sm:flex-row gap-4'>
                <div className='flex flex-col gap-4 flex-1'>
                    <input type="text" placeholder='Nombre' className='border p-3 rounded-lg'
                        id='name' maxLength='62' minLength='10' required />

                    <textarea type="text" placeholder='Descripcion' className='border p-3 rounded-lg'
                        id='description' required />

                    <input type="text" placeholder='Direccion' className='border p-3 rounded-lg'
                        id='address' required />


                    <div className='flex gap-6 flex-wrap'>
                        <div className='flex gap-2'>
                            <input type="checkbox" id="rent" className='w-5' />
                            <span> Alquilar</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type="checkbox" id="share" className='w-5' />
                            <span> Compartir</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type="checkbox" id="parking" className='w-5' />
                            <span> Parking</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type="checkbox" id="furnished" className='w-5' />
                            <span>Amueblado</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type="checkbox" id="offer" className='w-5' />
                            <span> Offer </span>
                        </div>

                    </div>

                    <div className='flex flex-wrap gap-6'>
                        <div className='flex items-center gap-2'>
                            <input type="number" id='bedrooms' min='1' max='15' required
                                className='p-3 border border-gray-300 rounded-lg' />
                            <p>Dormitorios</p>
                        </div>

                        <div className='flex items-center gap-2'>
                            <input type="number" id='bathrooms' min='1' max='15' required
                                className='p-3 border border-gray-300 rounded-lg' />
                            <p>baños</p>
                        </div>

                        <div className='flex items-center gap-2'>
                            <input type="number" id='regularPrice' min='1' max='15' required
                                className='p-3 border border-gray-300 rounded-lg' />
                            <div className='flex flex-col items-center'>
                                <p>Precio</p>
                                <span className='text-xs'>(€/mounth)</span>

                            </div>
                        </div>

                        <div className='flex items-center gap-2'>
                            <input type="number" id='discountPrice' min='1' max='15' required
                                className='p-3 border border-gray-300 rounded-lg' />
                            <div className='flex flex-col items-center'>
                                <p>Precio con Descuento</p>
                                <span className='text-xs'>(€/mounth)</span>

                            </div>
                        </div>
                    </div>

                </div>

                <div className='flex flex-col flex-1 gap-4' >
                    <p className='font-semibold'>Imges:
                        <span className='font-normal text-gray-600 mt-2'>The first image will be cover (max 6)</span>
                    </p>

                    <div className='flex gap-4'>
                        <input onChange={(e) => setFiles(e.target.files)} className='p-3 border-gray-300 rounded w-full' type="file" id='images' accept='image/*' multiple />
                        <button type='button' disabled={uploading} onClick={handleImageSubmit} className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'>
                        {uploading ? 'Subiendo...' : 'Subir'}
                        </button>

                    </div>
                    <p className='text-red-700 text-sm'>
                        {imageUploadError && imageUploadError}
                    </p>
                    {formData.imageUrls.length > 0 &&
                        formData.imageUrls.map((url, index) => (
                            <div
                                key={url}
                                className='flex justify-between p-3 border items-center'
                            >
                                <img
                                    src={url}
                                    alt='listing image'
                                    className='w-20 h-20 object-contain rounded-lg'
                                />
                                <button
                                    type='button'
                                    onClick={() => handleRemoveImage(index)}
                                    className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'
                                >
                                    Delete
                                </button>
                            </div>
                        ))}

                    <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>Crear Propiedad </button>
                </div>

            </form>
        </main>
    );
}
