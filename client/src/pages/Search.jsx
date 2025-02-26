import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ListingItem from '../components/ListingItem';
import { toast } from 'react-toastify';
import UserItem from '../components/UserItem';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
    location: '', // Añadido el campo 'location'
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Detectar si es móvil
  const [showFilters, setShowFilters] = useState(false); // Controlar la visibilidad de los filtros en móviles

  // Estado para manejar la operación: 'rent' o 'share'
  const [operation, setOperation] = useState('rent'); // 'rent' o 'share'
  const [users, setUsers] = useState([]); // Nuevo estado para usuarios



  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');
    const operationFromUrl = urlParams.get('operation') || 'rent';
    const locationFromUrl = urlParams.get('location') || '';

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl||
      operationFromUrl ||
      locationFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        parking: parkingFromUrl === 'true' ? true : false,
        furnished: furnishedFromUrl === 'true' ? true : false,
        offer: offerFromUrl === 'true' ? true : false,
        sort: sortFromUrl || 'created_at',
        order: orderFromUrl || 'desc',
        location: locationFromUrl || '',
        
      });
      setOperation(operationFromUrl); // Actualizar estado 'operation'
    }

    const fetchData = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();

      try {
        if (operationFromUrl === 'rent') {
          // Buscar en listings
          const res = await fetch(`/api/listing/get?${searchQuery}`);
          const data = await res.json();
          console.log('Listings recibidos:', data);
          if (data.length > 8) {
            setShowMore(true);
          } else {
            setShowMore(false);
          }
          setListings(data);
          setUsers([]); // Limpiar usuarios
        } else if (operationFromUrl === 'share') {
          // Buscar en users
          const res = await fetch(`/api/user/get?${searchQuery}`);
          const data = await res.json();
          console.log('Usuarios recibidos:', data.data); // Log para depuración
          console.log("Término normalizado:", data.normalizedSearchTerm);
          if (data.data && data.data.length > 8) {
            setShowMore(true);
          } else {
            setShowMore(false);
          }
          setUsers(data.data);
          console.log(users);
          setListings([]); // Limpiar listings
          console.log('Estado users actualizado:', data); // Log adicional
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        toast.error('Error al obtener los resultados de búsqueda.');
      }

      setLoading(false);
    };
    fetchData();
  }, [location.search]);

  /*const fetchListings = async () => {
    setLoading(true);
    setShowMore(false);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/listing/get?${searchQuery}`);
    const data = await res.json();
    if (data.length > 8) {
      setShowMore(true);
    } else {
      setShowMore(false);
    }
    setListings(data);
    setLoading(false);
  };

  fetchListings();
}, [location.search]);*/










  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleChange = (e) => {
    if (
      e.target.id === 'all' ||
      e.target.id === 'rent' ||
      e.target.id === 'sale'
    ) {
      setSidebardata({ ...sidebardata, type: e.target.id });
    }

    if (e.target.id === 'searchTerm' || id === 'location') {
      setSidebardata({ ...sidebardata, searchTerm: e.target.value });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setSidebardata({
        ...sidebardata,
        [e.target.id]:
          e.target.checked || e.target.checked === 'true' ? true : false,
      });
    }

    if (e.target.id === 'sort_order') {
      const sort = e.target.value.split('_')[0] || 'created_at';

      const order = e.target.value.split('_')[1] || 'desc';

      setSidebardata({ ...sidebardata, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', sidebardata.searchTerm);
    urlParams.set('type', sidebardata.type);
    urlParams.set('parking', sidebardata.parking);
    urlParams.set('furnished', sidebardata.furnished);
    urlParams.set('offer', sidebardata.offer);
    urlParams.set('sort', sidebardata.sort);
    urlParams.set('order', sidebardata.order);
    urlParams.set('location', sidebardata.location);

    urlParams.set('operation', operation); // Incluir operación
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    const urlParams = new URLSearchParams(location.search);
    if (operation === 'rent') {
      const startIndex = listings.length;
      urlParams.set('startIndex', startIndex);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      if (data.length < 9) {
        setShowMore(false);
      }
      setListings([...listings, ...data]);
    } else if (operation === 'share') {
      const startIndex = users.length;
      urlParams.set('startIndex', startIndex);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/user/get?${searchQuery}`);
      const data = await res.json();
      if (data.data && data.data.length < 9) {
        setShowMore(false);
      }
      setUsers([...users, ...(data.data || [])]);
    }
  };

  console.log('Estado operation:', operation);
  console.log('Estado listings.length:', listings.length);
  console.log('Estado users.length:', users.length);
  return (
    <div className='flex flex-col md:flex-row'>

      {/* Mostrar botón de "Filtros" en móviles */}
      {isMobile && (
        <button
          className=" bg-blue-500 text-white px-4 py-2 rounded hover:bg-sah-primary-light transition-colors"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Cerrar filtros' : 'Mostrar filtros'}
        </button>
      )}


      {(showFilters || !isMobile) && (

        <div className='p-7  border-b-2 md:border-r-2 md:min-h-screen lg:w-1/4 lg:max-w-xs'>
          <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
            <div className='flex items-center gap-2'>
              <label className='whitespace-nowrap font-semibold'>
                Search Term:
              </label>
              <input
                type='text'
                id='searchTerm'
                placeholder='Search...'
                className='border rounded-lg p-3 w-full'
                value={sidebardata.searchTerm}
                onChange={handleChange}
              />
            </div>
            {/* Filtros específicos según el tipo */}
            <div className='flex gap-2 flex-col '>
              <label className='font-semibold'>Tipo:</label>
              <div className='flex gap-2'>
                <input
                  type='checkbox'
                  id='all'
                  className='w-5'
                  onChange={handleChange}
                  checked={sidebardata.type === 'all'}
                />
                <span>Rent & Sale</span>
              </div>
              <div className='flex gap-2'>
                <input
                  type='checkbox'
                  id='rent'
                  className='w-5'
                  onChange={handleChange}
                  checked={sidebardata.type === 'rent'}
                />
                <span>Rent</span>
              </div>
              <div className='flex gap-2'>
                <input
                  type='checkbox'
                  id='sale'
                  className='w-5'
                  onChange={handleChange}
                  checked={sidebardata.type === 'sale'}
                />
                <span>Sale</span>
              </div>
              <div className='flex gap-2'>
                <input
                  type='checkbox'
                  id='offer'
                  className='w-5'
                  onChange={handleChange}
                  checked={sidebardata.offer}
                />
                <span>Offer</span>
              </div>
            </div>

            <div className='flex gap-2 flex-col '>
              <label className='font-semibold'>Amenities:</label>
              <div className='flex gap-2'>
                <input
                  type='checkbox'
                  id='parking'
                  className='w-5'
                  onChange={handleChange}
                  checked={sidebardata.parking}
                />
                <span>Parking</span>
              </div>
              <div className='flex gap-2'>
                <input
                  type='checkbox'
                  id='furnished'
                  className='w-5'
                  onChange={handleChange}
                  checked={sidebardata.furnished}
                />
                <span>Furnished</span>
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='font-semibold'>Ordenar por:</label>
              <select
                onChange={handleChange}
                defaultValue={'created_at_desc'}
                id='sort_order'
                className='border rounded-lg p-3'
              >
                {operation === 'rent' ? (
                  <>
                    <option value='regularPrice_desc'>Precio alto a bajo</option>
                    <option value='regularPrice_asc'>Precio bajo a alto</option>
                    <option value='created_at_desc'>Más recientes</option>
                    <option value='created_at_asc'>Más antiguos</option>
                  </>
                ) : (
                  <>
                    <option value='averageRating_desc'>Calificación alta a baja</option>
                    <option value='averageRating_asc'>Calificación baja a alta</option>
                    <option value='created_at_desc'>Más recientes</option>
                    <option value='created_at_asc'>Más antiguos</option>
                  </>
                )}
              </select>
            </div>

            <button className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-sah-primary-light transition-colors uppercase hover:opacity-95'>
              Buscar
            </button>
          </form>
        </div>
      )}

      <div className='flex-1'>
        <h1 className='text-3xl font-semibold border-b p-3 text-slate-700 mt-5'>
          Resultados:
        </h1>
        <div className='p-7 flex flex-wrap gap-4'>
          {!loading && listings.length === 0 && operation === 'rent' && (
            <p className='text-xl text-slate-700'>No listing found!</p>
          )}
          {loading && (
            <p className='text-xl text-slate-700 text-center w-full'>
              Loading...
            </p>
          )}

          {/* Renderizar Listings o Users */}
          {!loading && operation === 'rent' && listings.map((listing) => (
            <ListingItem key={listing._id} listing={listing} />
          ))}
          {!loading && operation === 'share' && users.map((user) => (
            <UserItem key={user._id} user={user} />
          ))}

          {!loading && operation === 'share' && users.length === 0 && (
            <p className='text-xl text-slate-700'>No se encontraron usuarios.</p>
          )}

          {showMore && (
            <button
              onClick={onShowMoreClick}
              className='text-green-700 hover:underline p-7 text-center w-full'
            >
              Show more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}