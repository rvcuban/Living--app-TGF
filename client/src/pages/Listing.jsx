import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
//he importado y añadido esta ibreria de swiper para anvegar entre las imagenes de las casas,pd.lo escribo por que leugo se me olvidara pra que utilizo esta ibreria 
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux'; // eto apra tener los datos del usuario y armar la funcionalidad de contactar propietario
import { Navigation } from 'swiper/modules';

import 'swiper/css/bundle';




import {
    FaCheckCircle,
    FaHeadset,
    FaShieldAlt,
    FaUserCheck,
    FaThumbsUp,
    FaStar,
    FaUser,

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
import PropertyMap from '../components/PropertyMap';


export default function Listing() {
    SwiperCore.use([Navigation]);
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { currentUser } = useSelector((state) => state.user);
    const [copied, setCopied] = useState(false);
    const [contact, setContact] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');


    const [ownerData, setOwnerData] = useState(null);



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

                const reviewsRes = await fetch(`/api/review/get/${params.listingId}`);
                const reviewsData = await reviewsRes.json();

                // Agregar las reseñas al listado
                if (reviewsData && !reviewsData.message) {
                    setListing((prevListing) => ({ ...prevListing, reviews: reviewsData }));
                }

                setLoading(false);
                setError(false);

            } catch (error) {
                setError(true);

            }

        };
        fetchListing();

    }, [params.listingId])


    useEffect(() => {
        const fetchOwner = async () => {
            try {
                const res = await fetch(`/api/user/${listing.userRef}`);
                const ownerData = await res.json();
                setOwnerData(ownerData);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        if (listing?.userRef) fetchOwner();
    }, [listing]);





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

    const provisionalProperties = [
        {
            id: 1,
            name: 'Cozy Apartment',
            location: { lat: 40.73061, lng: -73.935242 }, // Ubicación (coordenadas)
            averageRating: 4.5, // Rating para la vista de estrellas
            neighbours: ['John (Carpenter)', 'Emily (Teacher)'], // Información para la vista de vecinos
            utilities: ['Supermarket', 'Carpenter', 'Pharmacy'], // Utilidades cercanas
        },
        {
            id: 2,
            name: 'Modern Loft',
            location: { lat: 40.73061, lng: -73.935742 },
            averageRating: 3.8,
            neighbours: ['Lucas (Plumber)', 'Sophie (Designer)'],
            utilities: ['Grocery Store', 'Plumber', 'Hospital'],
        },
        {
            id: 3,
            name: 'Luxury Condo',
            location: { lat: 40.73261, lng: -73.933242 },
            averageRating: 4.9,
            neighbours: ['Anna (Lawyer)', 'Michael (Engineer)'],
            utilities: ['Bakery', 'Lawyer', 'Gym'],
        },
    ];


    const handleAddReviewClick = () => {
        if (!currentUser) {
            navigate('/sign-in'); // Redirigir a la página de inicio de sesión si no está autenticado
        } else {
            setShowReviewForm(true); // Mostrar el formulario de reseña si el usuario está autenticado
        }
    };


    const handleReviewSubmit = async () => {
        if (rating > 0 && comment.trim() !== '') {
            try {
                const response = await fetch('/api/review/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                    body: JSON.stringify({ listingId: params.listingId, rating, comment }),
                });

                const data = await response.json();
                if (data) {
                    setShowReviewForm(false);
                    setListing((prevListing) => ({
                        ...prevListing,
                        reviews: [...prevListing.reviews, data],
                    }));
                    setRating(0);
                    setComment('');
                }
            } catch (error) {
                console.error('Error submitting review:', error);
            }
        }
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
                            <div className="mt-8 bg-white border border-gray-300 p-6 shadow-lg rounded-xl">
                                <h4 className="text-xl font-semibold">Trusted and Verified</h4>
                                <p className="mt-4 text-gray-600">
                                    We ensure that all our listings are verified and meet our high-quality standards.
                                    Feel confident in booking this property with us, knowing that it's been reviewed
                                    by professionals and is ready for you.
                                </p>
                                {/*informacion del casero*/}
                                {ownerData && (
                                    <div className="mt-8 rounded-xl flex items-center gap-4">
                                        <img src={ownerData.avatar || 'default-avatar.png'} alt={ownerData.username} className="w-12 h-12 rounded-full" />
                                        <div>
                                            <h4 className="text-lg font-semibold">{ownerData.username}</h4>
                                            <button
                                                onClick={() => navigate(`/user/${ownerData._id}`)}
                                                className="text-blue-500 text-sm underline"
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                )}


                                <ul className="mt-4 space-y-4 text-gray-800 list-none">
                                    <li className="flex items-center gap-2">
                                        <FaCheckCircle className="text-sah-success text-lg" />
                                        <span className="text-sah-primary font-medium">100% verified listings</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FaHeadset className="text-sah-success text-lg" />
                                        <span className="text-sah-primary font-medium">Professional customer support</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FaShieldAlt className="text-sah-success text-lg" />
                                        <span className="text-sah-primary font-medium">Secure transactions</span>
                                    </li>
                                    {/* Estado dinámico del landlord */}
                                    {listing.landlordStatus === 'verified' && (
                                        <li className="flex items-center gap-2">
                                            <FaUserCheck className="text-sah-success text-lg" />
                                            <span className="text-sah-primary font-medium">Profile status: Verified landlord</span>
                                        </li>
                                    )}
                                    {listing.landlordStatus === 'trusted' && (
                                        <li className="flex items-center gap-2">
                                            <FaThumbsUp className="text-sah-success text-lg" />
                                            <span className="text-sah-primary font-medium">Profile status: Trusted landlord</span>
                                        </li>
                                    )}
                                    {listing.landlordStatus === 'highly_trusted' && (
                                        <li className="flex items-center gap-2">
                                            <FaStar className="text-sah-success text-lg" />
                                            <span className="text-sah-primary font-medium">Profile status: Highly trusted landlord</span>
                                        </li>
                                    )}
                                    {listing.landlordStatus === 'new' && (
                                        <li className="flex items-center gap-2">
                                            <FaUser className="text-sah-warning text-lg" />
                                            <span className="text-sah-primary font-medium">Profile status: New landlord</span>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {/* Puntuación media de estrellas */}
                            {listing.reviews && listing.reviews.length > 0 ? (
                                <>
                                    {/* Calcula la media de las estrellas */}
                                    <div className="flex items-center mt-4 mb-4">
                                        <p className="text-lg font-medium text-gray-700">Puntuacion General de Anteriores Inquilinos: </p>
                                        <div className="flex items-center ml-2">
                                            {Array.from({ length: 5 }, (_, index) => (
                                                <FaStar
                                                    key={index}
                                                    className={`text-lg ${index < Math.round(listing.averageRating)
                                                        ? "text-yellow-500"
                                                        : "text-gray-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="ml-2 text-sm text-gray-500">({listing.reviews.length} reviews)</p>

                                    </div>



                                    {/* Lista de reseñas */}
                                    <ul className="space-y-4">
                                        {listing.reviews.map((review) => (
                                            <li key={review._id} className="border-b pb-4">
                                                <div className="flex items-start">
                                                    {review.userRef?.avatar ? (
                                                        <img
                                                            src={review.userRef.avatar}
                                                            alt={`${review.userRef.username || 'Usuario'} avatar`}
                                                            className="w-10 h-10 rounded-full mr-4"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full mr-4" />
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <p className="font-semibold text-sah-primary">
                                                                {review.userRef?.username || 'Usuario Anónimo'}
                                                            </p>
                                                            <div className="flex items-center">
                                                                {Array.from({ length: 5 }, (_, i) => (
                                                                    <FaStar
                                                                        key={i}
                                                                        className={`text-sm ${i < review.rating
                                                                            ? 'text-yellow-500'
                                                                            : 'text-gray-300'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-600 mt-2">{review.comment || 'Sin comentario'}</p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {review.createdAt
                                                                ? new Date(review.createdAt).toLocaleDateString()
                                                                : 'Fecha no disponible'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                </>
                            ) : (
                                <div>
                                    <p className="text-gray-600 mt-4">No reviews yet.</p>

                                </div>
                            )}

                            <div>
                                <button onClick={handleAddReviewClick} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Add a Review</button>
                            </div>

                            {/* Modal para añadir reseña */}
                            {showReviewForm && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                    <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
                                        <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                                        <div className="flex items-center mb-4">
                                            {currentUser?.avatar && (
                                                <img
                                                    src={currentUser.avatar}
                                                    alt={`${currentUser.username} avatar`}
                                                    className="w-10 h-10 rounded-full mr-3 "
                                                />
                                            )}
                                            <span className="mr-3">Rating:</span>
                                            {Array.from({ length: 5 }, (_, index) => (
                                                <FaStar
                                                    key={index}
                                                    onClick={() => setRating(index + 1)}
                                                    className={`text-2xl cursor-pointer ${index < rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                                />
                                            ))}

                                        </div>
                                        <textarea
                                            placeholder="Add your comment here"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="border rounded p-2 mb-4 w-full"
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => setShowReviewForm(false)}
                                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleReviewSubmit}
                                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}








                            {/* Mapa */}
                            <div className='mt-8'>
                                <h3 className='text-xl font-semibold mb-4'>Explore the Neighborhood</h3>
                                {listing && listing.address && (
                                    <PropertyMap
                                        properties={provisionalProperties}
                                        center={listing.address}  // Aquí pasamos la ubicación del listing como centro del mapa
                                    />
                                )}
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
                    {/* Tarjeta de reserva */}
                    <div className="bg-white p-6 shadow-lg rounded-lg  relative">
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

                        <div className="fixed-bottom-wrapper md:hidden">
                            <button className="bg-blue-600 text-white py-3 px-6 w-full text-center hover:bg-blue-500">Reserve Now</button>
                        </div>

                        {currentUser && listing.userRef !== currentUser._id && !contact && (
                            <button onClick={() => setContact(true)} className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-95  p-3 mt-6'>
                                Contacta al Propietario
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
