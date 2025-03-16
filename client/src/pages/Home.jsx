// eslint-disable-next-line no-unused-vars
import { useEffect, useState } from "react";
import { FaSearch, FaHome, FaUsers, FaShieldAlt, FaClock } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

import { useSelector } from "react-redux";


import SearchAutocompleteInput from "../components/SearchAutocompleteInput";
import api from '../utils/apiFetch';

export default function Home() {


  const [searchTerm, setSearchTerm] = useState('');// me permite esccribir en la barra de search(valor inicial empty string)
  const navigate = useNavigate(); //inicilizamos el use-navegador para poder redirigir al usuario
  const [operation, setOperation] = useState('share'); // 'rent' o 'share'
  const location = useLocation();


  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Obtenemos el user de Redux
  const { currentUser } = useSelector((state) => state.user);

  // New states for enhanced UI
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 124,
    properties:  45,
    matches: 22
  });

  const [showBlockedEffect, setShowBlockedEffect] = useState(false);
  const [showBlockedMessage, setShowBlockedMessage] = useState(false);

  const handleRentClick = () => {
    // Show the blocked effect
     setShowBlockedEffect(true);
    setShowBlockedMessage(true);

    // Reset the effect after animation completes
    setTimeout(() => {
      setShowBlockedEffect(false);
    }, 600);

    // Hide the message after a few seconds
    setTimeout(() => {
      setShowBlockedMessage(false);
    }, 3000); 
   // setOperation('rent');
  };


  // Fetch recent matches
  useEffect(() => {
    // In a real implementation, you would fetch this data from your API
    // For now, using mock data
    const fetchRecentMatches = async () => {
      setLoading(true);
      try {
        // Replace with actual API call when endpoint is available
        // const response = await api.get('/matches/recent');
        // setRecentMatches(response.data);

        // Mock data for now
        setRecentMatches([
          {
            _id: '1',
            user1: { _id: 'u1', username: 'Carlos', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
            user2: { _id: 'u2', username: 'María', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
            location: 'Barcelona',
            matchedAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
          },
          {
            _id: '2',
            user1: { _id: 'u3', username: 'Javier', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
            user2: { _id: 'u4', username: 'Ana', avatar: 'https://randomuser.me/api/portraits/women/24.jpg' },
            location: 'Madrid',
            matchedAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
          },
          {
            _id: '3',
            user1: { _id: 'u5', username: 'Miguel', avatar: 'https://randomuser.me/api/portraits/men/62.jpg' },
            user2: { _id: 'u6', username: 'Laura', avatar: 'https://randomuser.me/api/portraits/women/14.jpg' },
            location: 'Valencia',
            matchedAt: new Date(Date.now() - 1000 * 60 * 90) // 1.5 hours ago
          },
          {
            _id: '4',
            user1: { _id: 'u7', username: 'Pablo', avatar: 'https://randomuser.me/api/portraits/men/52.jpg' },
            user2: { _id: 'u8', username: 'Elena', avatar: 'https://randomuser.me/api/portraits/women/34.jpg' },
            location: 'Sevilla',
            matchedAt: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
          },
          {
            _id: '5',
            user1: { _id: 'u9', username: 'Daniel', avatar: 'https://randomuser.me/api/portraits/men/42.jpg' },
            user2: { _id: 'u10', username: 'Sofía', avatar: 'https://randomuser.me/api/portraits/women/64.jpg' },
            location: 'Bilbao',
            matchedAt: new Date(Date.now() - 1000 * 60 * 180) // 3 hours ago
          }
        ]);

      } catch (error) {
        console.error("Error fetching recent matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentMatches();
  }, []);


  // este es codigo replicado de la header (deberia crear una funcion aparte que se use ene los dos sitios para evitar repetir codigo)
  const handleSubmit = (e) => {
    e.preventDefault();//para cque no se haga refreasha  a la pagina
    const urlParams = new URLSearchParams(window.location.search); //Este es un metodo de react que mne permite mediante un constructor de java guardar el contenido de la url de la pagina
    // concrettamente me sirve por que ahi es donde va la infomracioin de la busqueda get?share=true...etc
    urlParams.set('searchTerm', searchTerm);
    urlParams.set('operation', operation);
    const searchQuery = urlParams.toString(); // convertimos en sring porque peuden existir numeros y otras cosas º
    navigate(`/search?${searchQuery}`); // redirigimos a la url de la busqueda 

  }
  //ESTE SIRVE PARA CUANDO CCAMBIE ENTRE URLS SE QUEDA LA BSUQEDA EN LA ABRRA E SEARCH VISIBLE 
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const operationFromUrl = urlParams.get('operation');
    if (searchTermFromUrl) { // si existe algun search term en la url seteamos el estado en ese srearchterm from url asi conservamos la bsuqueda de la pagina anterior 
      setSearchTerm(searchTermFromUrl);
    }
    if (operationFromUrl) {
      setOperation(operationFromUrl);
    }

  }, [location.search])



  // Format time since match
  const formatTimeSince = (date) => {
    const minutes = Math.floor((new Date() - new Date(date)) / 60000);
    if (minutes < 60) return `hace ${minutes} minutos`;
    if (minutes < 1440) return `hace ${Math.floor(minutes / 60)} horas`;
    return `hace ${Math.floor(minutes / 1440)} días`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {showCompleteModal && (
        <CompleteProfileModal
          visible={showCompleteModal}
          currentUser={currentUser}
          onClose={() => setShowCompleteModal(false)}
          onComplete={() => {
            console.log("Se completó la acción en el modal");
            setShowCompleteModal(false);
          }}
        />
      )}

      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-b from-blue-50 to-white py-16 md:py-24 overflow-hidden">
        {/* Abstract Shape Background */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-pink-300"></div>
          <div className="absolute top-60 -left-20 w-60 h-60 rounded-full bg-blue-300"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-yellow-300"></div>
        </div>

        <div className="relative container mx-auto px-4 z-10">
          {/* Hero Content */}
          <div className="flex flex-col gap-6 max-w-3xl mx-auto text-center">
            <h1 className="text-slate-700 font-bold text-4xl lg:text-6xl leading-tight">
              Encuentra tu nuevo
              <span className="block text-blue-500">Compi</span>
            </h1>

            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              La manera más fácil y segura de encontrar el compañero de piso perfecto

            </p>

            {/* Beta indicator */}
            <div className="flex justify-center items-center">
              <span className="text-red-500 font-bold text-sm px-3 py-1 bg-red-50 rounded-full border border-red-200 animate-pulse">
                BETA
              </span>
            </div>

            {/* Search Options Toggle */}
            {/* Search Options Toggle */}
            <div className="relative w-full max-w-xl mx-auto mt-4">
              {/* Red Flash Effect Overlay when blocked */}
              {showBlockedEffect && (
                <div className="absolute inset-0 bg-red-500 opacity-30 rounded-full z-20 animate-pulse-fast pointer-events-none"></div>
              )}

              {/* Blocked Feature Message */}
              {showBlockedMessage && (
                <div className="absolute -top-12 left-0 right-0 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm shadow-md animate-fade-in">
                  Función próximamente disponible
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-100 rotate-45"></div>
                </div>
              )}

              <div className="flex justify-between items-center bg-gray-200 rounded-full p-1 h-12">
                {/* Sliding Highlight */}
                <div
                  className={`absolute inset-y-0 left-0 bg-white shadow-lg rounded-full transition-transform duration-300 ease-in-out w-1/2 ${operation === 'rent' ? 'translate-x-0' : 'translate-x-full'
                    }`}
                ></div>

                {/* Operation Buttons */}
                <button
                  type="button"
                  onClick={handleRentClick}
                  className={`relative z-10 w-1/2 h-full flex justify-center items-center text-sm font-medium transition-colors group whitespace-nowrap px-2  ${operation === 'rent' ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
                    }`}
                >
                  <FaHome className="mr-1.5 flex-shrink-0" /> •••••••
                  <span className="absolute inset-0 bg-transparent group-hover:bg-red-100/20 rounded-full transition-colors"></span>
                </button>
                <button
                  type="button"
                  onClick={() => setOperation('share')}
                  className={`relative z-10 w-1/2 h-full flex justify-center items-center text-sm font-medium transition-colors group whitespace-nowrap px-2  ${operation === 'share' ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
                    }`}
                >
                  <FaUsers className="mr-1.5 flex-shrink-0" /> Buscar Compi
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative bg-white shadow-xl rounded-full p-1.5 w-full max-w-xl flex items-center mx-auto mt-2"
            >
              <SearchAutocompleteInput
                value={searchTerm}
                onChange={(value) => setSearchTerm(value)}
                onSelectPlace={(value) => setSearchTerm(value)}
                placeholder={operation === 'rent' ? "¿Dónde quieres alquilar?" : "¿Dónde buscas compi?"}
                inputClassName="bg-transparent focus:outline-none w-full px-6 py-3.5 text-gray-600 rounded-full"
              />
              <button
                type="submit"
                className="absolute right-1.5 bg-pink-500 text-white p-3 rounded-full hover:bg-pink-600 transition duration-200 flex items-center justify-center"
              >
                <FaSearch />
              </button>
            </form>
          </div>


          {/* Stats Counter */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              <span className="text-3xl font-bold text-blue-500">{stats.users.toLocaleString()}</span>
              <span className="text-gray-500 text-sm">Usuarios registrados</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              <span className="text-3xl font-bold text-pink-500">{stats.properties.toLocaleString()}</span>
              <span className="text-gray-500 text-sm">Busquedas hoy</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              <span className="text-3xl font-bold text-green-500">{stats.matches.toLocaleString()}</span>
              <span className="text-gray-500 text-sm">Compañeros conectados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Matches Section */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Últimos compañeros encontrados
            </h2>
            <button
              className="text-blue-500 hover:text-blue-700 font-medium flex items-center"
              onClick={() => navigate('/search?operation=share')}
            >
              Ver más <span className="ml-1">→</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="relative">
              {/* Scroll hint shadows */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>

              {/* Scrollable matches list */}
              <div className="flex overflow-x-auto pb-6 -mx-4 px-4 space-x-4 scrollbar-hide">
                {recentMatches.map((match) => (
                  <div
                    key={match._id}
                    className="flex-shrink-0 w-80 bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex -space-x-4">
                          <img
                            src={match.user1.avatar}
                            alt={match.user1.username}
                            className="w-12 h-12 rounded-full border-2 border-white object-cover z-10"
                          />
                          <img
                            src={match.user2.avatar}
                            alt={match.user2.username}
                            className="w-12 h-12 rounded-full border-2 border-white object-cover"
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {match.user1.username} y {match.user2.username}
                          </p>
                          <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
                            <FaUsers className="mr-1" /> ¡Han encontrado compañero!
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {match.location}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <FaClock className="mr-1" /> {formatTimeSince(match.matchedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            ¿Por qué elegir CompiTrueno.com?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-pink-500 text-white rounded-lg flex items-center justify-center mb-4">
                <FaUsers size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Compañeros compatibles</h3>
              <p className="text-gray-600">
                Encuentra personas con intereses, horarios y estilo de vida similares para una convivencia armoniosa.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-lg flex items-center justify-center mb-4">
                <FaHome size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Alquileres verificados</h3>
              <p className="text-gray-600">
                Todos los alquileres son verificados por nuestro equipo para garantizar calidad y seguridad.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-500 text-white rounded-lg flex items-center justify-center mb-4">
                <FaShieldAlt size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Sistema seguro</h3>
              <p className="text-gray-600">
                Perfiles verificados, chat integrado y sistema de valoraciones para una experiencia confiable.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-pink-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Encuentra tu lugar ideal hoy mismo
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Únete a miles de personas que ya han encontrado su hogar perfecto o compañero de piso ideal
          </p>
          <button
            onClick={() => navigate('/sign-up')}
            className="bg-white text-blue-600 hover:bg-blue-50 transition-colors px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl"
          >
            Comenzar ahora
          </button>
        </div>
      </div>
    </div>
  );
}