import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
//he importado y añadido esta ibreria de swiper para anvegar entre las imagenes de las casas,pd.lo escribo por que leugo se me olvidara pra que utilizo esta ibreria 
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux'; // eto apra tener los datos del usuario y armar la funcionalidad de contactar propietario
import { Navigation } from 'swiper/modules';

import 'swiper/css/bundle';




import {
    FaBath,
    FaBed,
    FaChair,
    FaMapMarkedAlt,
    FaMapMarkerAlt,
    FaParking,
    FaShare,
    FaArrowLeft,
    FaArrowRight
} from 'react-icons/fa';
import Contact from '../components/Contact';


export default function Listing() {
    SwiperCore.use([Navigation]);
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { currentUser } = useSelector((state) => state.user);
    const [copied, setCopied] = useState(false);
    const [contact, setContact] = useState(false);

    const params = useParams();
    useEffect(() => {
        const fetchListing = async () => {

            try {
                setLoading(true);
                const res = await fetch(`/api/listing/get/${params.listingId}`);
                const data = await res.json();

                if (data.success === false) {
                    setError(true);
                    setLoading(false);
                    return;
                }
                setListing(data);
                setLoading(false);
                setError(false);

            } catch (error) {
                setError(true);

            }

        };
        fetchListing();

    }, [params.listingId])


    //para que las fotos y ell slider se vean bien:
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);

    const openModal = (index) => {
        setCurrentImage(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };


    return (
        <main>
            {loading && <p className='text-center my-7 text-2xl'>Loading...</p>}
            {error && (
                <p className='text-center my-7 text-2xl'>Something went wrong!</p>
            )}
            {listing && !loading && !error && (
                <div className='max-w-[1720px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <div>
                        <div className='grid grid-cols-2 gap-4 h-[358px]'>
                            {/* Columna izquierda con una imagen más grande */}
                            <div className='col-span-1 h-full h-[300px] lg:h-[400px]'>
                                <SwiperSlide key={listing.imageUrls[0]}>
                                    <div
                                        className='h-full w-full'
                                        onClick={() => openModal(0)}
                                        style={{
                                            background: `url(${listing.imageUrls[0]}) center no-repeat`,
                                            backgroundSize: 'cover',
                                        }}
                                    ></div>
                                </SwiperSlide>
                            </div>

                            {/* Columna derecha con dos imágenes más pequeñas */}
                            <div className='col-span-1 grid grid-rows-2 gap-4'>
                                {listing.imageUrls.slice(1, 3).map((url, index) => (
                                    <SwiperSlide key={url} className='h-full'>
                                        <div
                                            className='h-full w-full cursor-pointer'
                                            onClick={() => openModal(index + 1)}
                                            style={{
                                                background: `url(${url}) center no-repeat`,
                                                backgroundSize: 'cover',
                                            }}
                                        ></div>
                                    </SwiperSlide>
                                ))}
                            </div>
                        </div>

                        <div className='relative mt-4'>
                            <div className='absolute top-[-10%] right-0 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer'>
                                <FaShare
                                    className='text-slate-500'
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        setCopied(true);
                                        setTimeout(() => {
                                            setCopied(false);
                                        }, 2000);
                                    }}
                                />
                            </div>
                            {copied && (
                                <p className='fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2'>
                                    Link copied!
                                </p>
                            )}
                        </div>
                        <div className='bg-white p-6 shadow-lg rounded-lg mt-6'>
                            <p className='text-3xl font-bold mb-4'>
                                {listing.name} - ${' '}
                                {listing.offer
                                    ? listing.discountPrice.toLocaleString('en-US')
                                    : listing.regularPrice.toLocaleString('en-US')}
                                {listing.type === 'rent' && ' / month'}
                            </p>
                            <p className='flex items-center mt-6 gap-2 text-slate-600  text-sm'>
                                <FaMapMarkerAlt className='text-green-700' />
                                {listing.address}
                            </p>
                            <div className='flex gap-4  mb-4'>
                                <p className='bg-red-900 text-white text-center p-2 rounded-md'>
                                    {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                                </p>
                                {listing.offer && (
                                    <p className='bg-green-900 text-white text-center p-2 rounded-md'>
                                        ${+listing.regularPrice - +listing.discountPrice} OFF
                                    </p>
                                )}
                            </div>
                            <p className='text-slate-800 leading-relaxed'>
                                <span className='font-semibold'>Description - </span>
                                {listing.description}
                            </p>
                            <ul className='text-green-900 font-semibold text-sm flex flex-wrap gap-4 mt-6'>
                                <li className='flex items-center gap-1 whitespace-nowrap '>
                                    <FaBed className='text-lg' />
                                    {listing.bedrooms > 1
                                        ? `${listing.bedrooms} beds `
                                        : `${listing.bedrooms} bed `}
                                </li>
                                <li className='flex items-center gap-1 whitespace-nowrap '>
                                    <FaBath className='text-lg' />
                                    {listing.bathrooms > 1
                                        ? `${listing.bathrooms} baths `
                                        : `${listing.bathrooms} bath `}
                                </li>
                                <li className='flex items-center gap-1 whitespace-nowrap '>
                                    <FaParking className='text-lg' />
                                    {listing.parking ? 'Parking spot' : 'No Parking'}
                                </li>
                                <li className='flex items-center gap-1 whitespace-nowrap '>
                                    <FaChair className='text-lg' />
                                    {listing.furnished ? 'Furnished' : 'Unfurnished'}
                                </li>
                            </ul>

                            {/* Nuevo recuadro para mejorar la confiabilidad*/}
                            <div className="mt-8 bg-white border border-gray-300 p-6 shadow-lg rounded-lg">
                                <h4 className="text-xl font-semibold">Trusted and Verified</h4>
                                <p className="mt-4 text-gray-600">
                                    We ensure that all our listings are verified and meet our high-quality standards.
                                    Feel confident in booking this property with us, knowing that it's been reviewed
                                    by professionals and is ready for you.
                                </p>
                                <ul className="mt-4 space-y-2 text-gray-800">
                                    <li>✔ 100% verified listings</li>
                                    <li>✔ Professional customer support</li>
                                    <li>✔ Secure transactions</li>
                                </ul>
                            </div>

                        </div>

                        {/* Modal de imágenes a pantalla completa */}
                        {isModalOpen && (
                            <div className='fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center'>
                                <button
                                    onClick={closeModal}
                                    className='absolute top-4 right-4 text-white text-2xl'
                                >
                                    &times;
                                </button>
                                <img
                                    src={listing.imageUrls[currentImage]}
                                    alt='Full screen'
                                    className='max-w-3xl max-h-[60vh]  object-cover rounded-lg'
                                />
                                <div className='absolute bottom-[10%] flex gap-4'>
                                    <FaArrowLeft
                                        onClick={() =>
                                            setCurrentImage(
                                                currentImage === 0 ? listing.imageUrls.length - 1 : currentImage - 1
                                            )
                                        }
                                        className='text-white text-4xl cursor-pointer hover:scale-110 transition-transform'
                                    />
                                    <FaArrowRight
                                        onClick={() =>
                                            setCurrentImage(
                                                currentImage === listing.imageUrls.length - 1 ? 0 : currentImage + 1
                                            )
                                        }
                                        className='text-white text-4xl cursor-pointer hover:scale-110 transition-transform'
                                    />
                                </div>
                            </div>
                        )}

                    </div>
                    {/* Segunda columna: tarjeta de reserva */}
                    <div className="bg-white p-6 shadow-lg rounded-lg">
                        <h3 className="text-3xl font-bold text-center">Book Now</h3>
                        <form className="mt-6 flex flex-col gap-4">
                            <div>
                                <label htmlFor="checkIn" className="text-lg font-semibold">Check-in Date</label>
                                <input type="date" id="checkIn" className="w-full mt-2 p-3 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label htmlFor="checkOut" className="text-lg font-semibold">Check-out Date</label>
                                <input type="date" id="checkOut" className="w-full mt-2 p-3 border border-gray-300 rounded-lg" />
                            </div>
                            <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-500">Reserve Now</button>
                        </form>
                        {currentUser && listing.userRef !== currentUser._id && !contact && (
                            <button onClick={() => setContact(true)} className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-95  p-3 mt-6'>
                                Contact landlord
                            </button>
                        )}
                        {contact && <Contact listing={listing} />}


                        <div className="mt-8 bg-white border border-gray-300 p-6 shadow-lg rounded-lg">
                            <h4 className="text-xl font-semibold">Additional Info</h4>
                            <p className="mt-4 text-gray-600">
                                Some additional information about the property or booking options can be displayed here.
                            </p>
                        </div>

                    </div>
                </div >
            )
            }
        </main >
    );
}
