import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
//he importado y añadido esta ibreria de swiper para anvegar entre las imagenes de las casas,pd.lo escribo por que leugo se me olvidara pra que utilizo esta ibreria 
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux'; // eto apra tener los datos del usuario y armar la funcionalidad de contactar propietario
import { Navigation } from 'swiper/modules';
import MobileReservationFooter from '../components/MobileReservationFooter';
import { Link } from 'react-router-dom';

import 'swiper/css/bundle';

import { toast } from 'react-toastify';




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
import ReservationCard from '../components/ReservationCar';


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

    const [isExpanded, setIsExpanded] = useState(false);



    const params = useParams();
    console.log("Listing ID:", params.listingId); // Verifica que `listingId` sea válido

    useEffect(() => {
        const fetchListing = async () => {

            try {
                setLoading(true);
                const res = await fetch(`/api/listing/get/${params.listingId}`);
                const data = await res.json();
                console.log('Fetched data:', data); // Log para verificar qué datos se obtienen

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
                console.error('Error inesperado:', error);
                setError(true);

            }

        };
        fetchListing();

    }, [params.listingId])

    // Verifica que `listingId` sea válido regularPrice

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
            name: 'Nearby Apartment',
            location: { lat: 40.73061, lng: -73.935242 },
            iconUrl: 'https://example.com/star-icon.png',
        },
        // Añade más propiedades si es necesario
    ];


    const handleAddReviewClick = () => {
        if (!currentUser) {
            navigate('/sign-in'); // Redirigir a la página de inicio de sesión si no está autenticado
        } else {
            setShowReviewForm(true); // Mostrar el formulario de reseña si el usuario está autenticado
        }
    };


    const handleReviewSubmit = async () => {
        if (rating > 0) {
            try {
                const response = await fetch('/api/review/createReview', {
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
                    toast.success('Tu reseña fue enviada con éxito.');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } catch (error) {
                console.error('Error submitting review:', error);
            }
        } else {
            if (rating < 0) {
                toast.error('Por favor, selecciona al menos 1 estrella.');
                return;

            }
        }
    };

    //leer mas o leer menos estadp para la descripcion
    const toggleDescription = () => {
        setIsExpanded(!isExpanded);
    };


    // Provisional array en Listing.jsx
    const provisionalResidents = [
        {
            id: 1,
            name: "Critina Vaquerizo",
            avatar: "https://via.placeholder.com/50",
            userId: "user1"
        },
        {
            id: 2,
            name: "Jaime Masa",
            avatar: "https://via.placeholder.com/50",
            userId: "user2"
        },

        {
            id: 1,
            name: "Sergio Martin",
            avatar: "https://via.placeholder.com/50",
            userId: "user1"
        },
        {
            id: 2,
            name: "Javier Rodriguez",
            avatar: "https://via.placeholder.com/50",
            userId: "user2"
        },
        // Añade más residentes según necesites
    ];

    //para el boton que te sigue toda la pantalla
    const handleReserveNow = () => {
        // Manejar la acción de reserva o compra
        // Por ejemplo, navegar a una página de reserva o abrir un modal
        if (!currentUser) {
            navigate('/sign-in'); // Redirigir al inicio de sesión si el usuario no está autenticado
        } else {
            // Lógica para reservar o comprar
        }
    };


    /*-----Para el Scrool del FOOTER*/
    // 1) Creamos la referencia para la sección de la tarjeta
    const reservationCardRef = useRef(null);

    // 2) Función que se llamará desde el footer para hacer scroll
    const scrollToReservationCard = () => {
        if (reservationCardRef.current) {
            reservationCardRef.current.scrollIntoView({ behavior: 'smooth' });
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
                            <p className='text-4xl font-bold mb-4 text-sah-primary'>
                                {listing.name}
                                <span className="text-3xl text-sah-medium ml-2">
                                    - ${listing.offer
                                        ? listing.discountPrice.toLocaleString('en-US')
                                        : listing.regularPrice.toLocaleString('en-US')}
                                    {listing.type === 'rent' && ' / month'}
                                </span>
                            </p>

                            <p className='flex items-center mt-4 gap-2 text-sah-medium text-lg'>
                                <FaMapMarkerAlt className='text-sah-success' />
                                {listing.address}
                            </p>



                            <p className='text-sah-dark leading-relaxed mt-4 text-lg'>
                                <span className='font-semibold'>Description:</span>{' '}
                                {isExpanded
                                    ? listing.description
                                    : `${listing.description.slice(0, 100)}...`}
                                <button
                                    onClick={toggleDescription}
                                    className='text-sah-primary ml-2 underline hover:text-sah-primary-light'
                                >
                                    {isExpanded ? 'Leer menos' : 'Leer más'}
                                </button>
                            </p>

                            <ul className='text-sah-primary font-semibold text-lg flex flex-wrap gap-6 mt-6'>
                                <li className='flex items-center gap-1 whitespace-nowrap'>
                                    <FaBed className='text-2xl' />
                                    {listing.bedrooms > 1
                                        ? `${listing.bedrooms} Beds`
                                        : `${listing.bedrooms} Bed`}
                                </li>
                                <li className='flex items-center gap-1 whitespace-nowrap'>
                                    <FaBath className='text-2xl' />
                                    {listing.bathrooms > 1
                                        ? `${listing.bathrooms} Baths`
                                        : `${listing.bathrooms} Bath`}
                                </li>
                                <li className='flex items-center gap-1 whitespace-nowrap'>
                                    <FaParking className='text-2xl' />
                                    {listing.parking ? 'Parking Available' : 'No Parking'}
                                </li>
                                <li className='flex items-center gap-1 whitespace-nowrap'>
                                    <FaChair className='text-2xl' />
                                    {listing.furnished ? 'Furnished' : 'Unfurnished'}
                                </li>
                            </ul>


                            <div className="mt-6 bg-white border border-gray-300 p-6 shadow-lg rounded-xl">
                                <h4 className="text-2xl font-bold text-sah-primary mb-4">Propietario</h4>
                                <div className="flex-1">
                                    {ownerData ? (
                                        <div className=" rounded-xl flex items-center gap-4">
                                            {ownerData && ownerData.avatar ? (
                                                <img
                                                    src={ownerData.avatar}
                                                    alt={`${ownerData.username || 'Usuario'} avatar`}
                                                    className="w-20 h-20 rounded-full object-cover border-2 border-sah-primary"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                            )}
                                            <div className="flex-1">
                                                <h5 className="text-xl font-semibold text-sah-interaction">{ownerData.username}</h5>
                                                <p className="text-gray-600 text-sm">Miembro desde {new Date(ownerData.createdAt).toLocaleDateString()}</p>



                                                {/* Calificación general */}
                                                <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-1">
                                                    <span className="text-sah-success font-medium">Calificación General:</span>
                                                    <div className="flex items-center ml-0 sm:ml-2">
                                                        {Array.from({ length: 5 }, (_, index) => (
                                                            <FaStar
                                                                key={index}
                                                                className={`text-sm sm:text-lg ${index < Math.round(ownerData?.averageRating || 0)
                                                                    ? "text-yellow-500"
                                                                    : "text-gray-300"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                {/* Botón para ver comentarios */}
                                                <button
                                                    onClick={() => navigate(`/user/${ownerData._id}/public`)}
                                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-sah-primary-light transition-colors"
                                                >
                                                    Ver Perfil/Opiniones
                                                </button>


                                                <div className="mt-2 flex flex-col sm:flex-row sm:items-start gap-4">
                                                    {currentUser && listing.userRef !== currentUser._id && !contact && (
                                                        ownerData?.phone && ownerData.phone.trim().length > 0 ? (
                                                            // Caso 1: El propietario SÍ tiene teléfono
                                                            <a
                                                                href={`tel:${ownerData.phone}`}
                                                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-sah-primary-light transition-colors"
                                                            >
                                                                Llamar al Propietario
                                                            </a>
                                                        ) : (
                                                            // Caso 2: No hay teléfono
                                                            <p className="text-gray-500 italic">
                                                                El propietario no ha dejado ningún método de contacto disponible.
                                                            </p>
                                                        )
                                                    )}
                                                    {contact && (
                                                        <div className="w-full">
                                                            <Contact listing={listing} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p>Cargando información del propietario...</p>
                                    )}
                                </div>
                            </div>

                            {/* Nuevo recuadro para mejorar la confiabilidad*/}
                            <div className="mt-8 bg-white border border-gray-300 p-6 shadow-lg rounded-xl">
                                <h4 className="text-xl font-semibold">Trusted and Verified</h4>
                                <p className="mt-4 text-gray-600">
                                    We ensure that all our listings are verified and meet our high-quality standards.
                                    Feel confident in booking this property with us, knowing that it's been reviewed
                                    by professionals and is ready for you.
                                </p>
                                {/*informacion del casero*/}



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
                                    < div className="mt-8 bg-white border border-gray-300 p-6 shadow-lg rounded-xl">
                                        <div className="mt-6 mb-3 border-b border-gray-500 pb-4">
                                            {/* Calcula la media de las estrellas */}
                                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-between">
                                                <p className="text-lg font-semibold text-sah-dark text-center sm:text-left">Puntuacion General de Anteriores Inquilinos: </p>
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
                                    </div>

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
                            <div className="mt-8">
                                <h3 className="text-xl font-semibold mb-4">Explore the Neighborhood</h3>
                                <PropertyMap
                                    listingAddress={listing.address} // Dirección de la propiedad
                                />
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
                        <div ref={reservationCardRef}>
                            <div className='mt-8'>
                                <ReservationCard listingType={listing.type} listingId={listing._id} regularPrice={listing.regularPrice} />
                            </div>


                            {/* Sección de residentes actuales */}

                            <div className="mt-8 bg-white border border-gray-300 p-6 shadow-lg rounded-lg">
                                <h4 className="text-xl font-semibold">Additional Info</h4>
                                <h5 className="text-sm font-medium text-slate-700 mt-4">Quien vive aqui</h5>
                                <ul className="mt-4 space-y-3">
                                    {provisionalResidents && provisionalResidents.length > 0 ? (
                                        provisionalResidents.map((resident, index) => (
                                            <li
                                                key={resident._id || index} // Clave única para cada elemento
                                                className="flex items-center p-2 bg-slate-100 rounded-lg shadow-sm border border-sah-light"
                                            >
                                                <img
                                                    src={resident.avatar || 'default-avatar.jpg'}
                                                    alt={resident.username || 'Resident'}
                                                    className="w-8 h-8 rounded-full mr-4"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-slate-800 font-semibold text-lg">
                                                        {resident.name}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/profile/${resident._id}`)}
                                                    className="ml-auto px-3 py-1 text-white bg-blue-500 rounded-lg hover:bg-sah-primary-dark transition-colors"
                                                >
                                                    View Profile
                                                </button>
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-gray-600 mt-2">No current residents listed.</p>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div>
                        <MobileReservationFooter
                            listing={listing}
                            onReserveClick={scrollToReservationCard}
                        />
                    </div>

                </div >

            )}
        </main >
    );
}
