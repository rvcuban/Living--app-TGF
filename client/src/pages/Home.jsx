// eslint-disable-next-line no-unused-vars
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

import { useSelector } from "react-redux";
import CompleteProfileModal from "../components/CompleteProfileModal";

import SearchAutocompleteInput from "../components/SearchAutocompleteInput";

export default function Home() {


  const [searchTerm, setSearchTerm] = useState('');// me permite esccribir en la barra de search(valor inicial empty string)
  const navigate = useNavigate(); //inicilizamos el use-navegador para poder redirigir al usuario
  const [operation, setOperation] = useState('rent'); // 'rent' o 'share'
  const location = useLocation();


  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Obtenemos el user de Redux
  const { currentUser } = useSelector((state) => state.user);


  useEffect(() => {
    // Si user existe y user.isNew === true => mostrar modal
    if (currentUser && currentUser.isNewUser) {
      setShowCompleteModal(true);
    }
  }, [currentUser]);


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





  return (
    <div className='flex flex-col justify-center items-center '>

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



      {/*top side*/}


      <div className='flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto text-center'>
        <h1 className="text-slate-700 font-bold text-3xl lg:text-6xl">
          Encuentra tu nuevo
          <br />
          <span className="text-slate-500">
            hogar
          </span>

        </h1>

        <div className='text-gray-400 text-xs sm:text-sm'>
          MI app es actualmente el mejor sitio donde buscar tu nuevo hogar
          <br />
          La manera mas facil y sencilla de encontrar un sitio donde vivir.
        </div>

        {/* Opciones de Búsqueda: Alquileres y Compañeros de Piso */}
        <div className="relative w-full max-w-xl mx-auto">
          <div className="flex justify-between items-center bg-gray-200 rounded-full p-1 h-10">
            {/* Resaltado deslizante */}
            <div
              className={`absolute inset-y-0 left-0 bg-white shadow-lg rounded-full transition-transform duration-300 ease-in-out w-1/2 ${operation === 'rent' ? 'translate-x-0' : 'translate-x-full'
                }`}
            ></div>

            {/* Botones de operación */}
            <button
              type="button"
              onClick={() => setOperation('rent')}
              className={`relative z-10 w-1/2 h-full flex justify-center items-center text-sm font-medium ${operation === 'rent' ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
                }`}
            >
              Alquilar
            </button>
            <button
              type="button"
              onClick={() => setOperation('share')}
              className={`relative z-10 w-1/2 h-full flex justify-center items-center text-sm font-medium ${operation === 'share' ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
                }`}
            >
              Buscar Compi
            </button>
          </div>
        </div>

        {/* Formulario de Búsqueda */}
        <form
          onSubmit={handleSubmit}
          className="relative bg-white shadow-lg rounded-full p-1 w-full max-w-xl flex items-center mx-auto"
        >
            <SearchAutocompleteInput
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
            onSelectPlace={(value) => setSearchTerm(value)}
            placeholder="Buscar destinos..."
            inputClassName="bg-transparent focus:outline-none w-full sm:w-64 px-4 py-3 text-gray-600 rounded-full"
          />
          <button
            type="submit"
            className="absolute right-1 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200"
          >
            <FaSearch />
          </button>
        </form>
      </div>



      {/* swiper */}



      {/* listing results for offers , salee and rent */}


    </div>

  )
}
