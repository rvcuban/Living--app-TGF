import React from 'react'

export default function CreateListing() {
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

                <div className='flex-col flex-1 gap-4' >
                    <p className='font-semibold'>Imges:
                        <span className='font-normal text-gray-600 mt-2'>The first image will be cover (max 6)</span>
                    </p>

                    <div className='flex gap-4'>
                        <input className='p-3 border-gray-300 rounded w-full' type="file" id='images' accept='image/*' multiple />
                        <button className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'> Upload</button>
                    </div>
                <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-85'>Crear Propiedad </button>
                </div>
            </form>
        </main>
    );
}
