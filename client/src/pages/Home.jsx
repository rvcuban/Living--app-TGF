// eslint-disable-next-line no-unused-vars
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";



export default function Home() {


  const [searchTerm, setSearchTerm] = useState('');// me permite esccribir en la barra de search(valor inicial empty string)
  const navigate = useNavigate(); //inicilizamos el use-navegador para poder redirigir al usuario


  // este es codigo replicado de la header (deberia crear una funcion aparte que se use ene los dos sitios para evitar repetir codigo)
  const handleSubmit = (e) => {
    e.preventDefault();//para cque no se haga refreasha  a la pagina
    const urlParams = new URLSearchParams(window.location.search); //Este es un metodo de react que mne permite mediante un constructor de java guardar el contenido de la url de la pagina
    // concrettamente me sirve por que ahi es donde va la infomracioin de la busqueda get?share=true...etc
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString(); // convertimos en sring porque peuden existir numeros y otras cosas º
    navigate(`/search?${searchQuery}`); // redirigimos a la url de la busqueda 

  }
  //ESTE SIRVE PARA CUANDO CCAMBIE ENTRE URLS SE QUEDA LA BSUQEDA EN LA ABRRA E SEARCH VISIBLE 
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) { // si existe algun search term en la url seteamos el estado en ese srearchterm from url asi conservamos la bsuqueda de la pagina anterior 
      setSearchTerm(searchTermFromUrl);
    }

  }, [location.search])





  return (
    <div className='flex flex-col justify-center items-center '>
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
          La manera mas facil y sencilla de encoentrar un sitio donde vivir.
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative bg-white shadow-lg rounded-full p-1 w-full max-w-xl flex items-center mx-auto"
        >
          <input
            placeholder="Buscar destinos..."
            className="bg-transparent focus:outline-none w-full sm:w-64 px-4 py-3 text-gray-600 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            
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
