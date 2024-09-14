import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

export default function Search() {
    const navigate = useNavigate();
    const [sidebardata, setSidebardata] = useState({ //valores iniciales para los campos 
        searchTerm: '',
        type: '',
        parking: false,
        furnished: false,
        offer: false,
        sort: 'created_at',
        order: 'desc',
    });

    const [loading, setLoading] = useState(false);
    const [listings, setListings] = useState([]);
    const [showMore, setShowMore] = useState(false);
    console.log(listings);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get('searchTerm');
        const typeFromUrl = urlParams.get('type');
        const parkingFromUrl = urlParams.get('parking');
        const furnishedFromUrl = urlParams.get('furnished');
        const offerFromUrl = urlParams.get('offer');
        const sortFromUrl = urlParams.get('sort');
        const orderFromUrl = urlParams.get('order');

        if (
            searchTermFromUrl ||
            typeFromUrl ||
            parkingFromUrl ||
            furnishedFromUrl ||
            offerFromUrl ||
            sortFromUrl ||
            orderFromUrl
        ) {
            setSidebardata({
                searchTerm: searchTermFromUrl || '',
                type: typeFromUrl || 'all',
                parking: parkingFromUrl === 'true' ? true : false,
                furnished: furnishedFromUrl === 'true' ? true : false,
                offer: offerFromUrl === 'true' ? true : false,
                sort: sortFromUrl || 'created_at',
                order: orderFromUrl || 'desc',
            });
        }
        //dentreo del useeffect para mantener la infromacion de las barras de bsuqueda y el url sincronizada hacemos el fecth con los datos de la base de datos 
        const fetchListings = async () => {
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
    }, [location.search]);




    const handleChange = (e) => {
        if (
            e.target.id === 'all' ||
            e.target.id === 'rent' ||
            e.target.id === 'share'
        ) {
            setSidebardata({ ...sidebardata, type: e.target.id }); // comprobamos el typo de bsuqueda y seteamos el type a ese 
        }

        if (e.target.id === 'searchTerm') {
            setSidebardata({ ...sidebardata, searchTerm: e.target.value }); // aqui manejamos el nombre de la busqueda 
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
        const searchQuery = urlParams.toString();
        navigate(`/search?${searchQuery}`);
    };



    return (
        <div className='flex flex-col md:flex-row '>
            <div className='p-7 border-b-2 md:border-r-2 md:min-h-screen'>
                <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
                    <div className='flex items-center gap-2 '>
                        <label className='whitespace-nowrap font-semibold' > Busqueda</label>
                        <input type="text"
                            id='searchTerm'
                            placeholder=' Buscar...'
                            className='border rounded-lg p-3 w-full'
                            value={sidebardata.searchTerm}
                            onChange={handleChange}
                        />
                    </div>

                    <div className='flex gap-2 flex-wrap items-center'>

                        <label className='font-semibold'>Filtros:</label>
                        <div className='flex gap-2'>
                            <input type="checkbox" id="all" className='w-5'
                                onChange={handleChange}
                                checked={sidebardata.type === 'all'} />
                            <span>Todo</span>
                        </div>

                        <div className='flex gap-2'>
                            <input type="checkbox" id="alquilar" className='w-5'
                                onChange={handleChange}
                                checked={sidebardata.type === 'rent'} />
                            <span>Alquilar</span>
                        </div>

                        <div className='flex gap-2'>
                            <input type="checkbox" id="compartir" className='w-5'
                                onChange={handleChange}
                                checked={sidebardata.type === 'share'} />
                            <span>Compartir</span>
                        </div>

                        <div className='flex gap-2'>
                            <input type="checkbox" id="offer" className='w-5'
                                onChange={handleChange}
                                checked={sidebardata.offer} />
                            <span>Precio rebajado</span>
                        </div>
                    </div>



                    <div className='flex gap-2 flex-wrap items-center'>

                        <label className='font-semibold'>Caracteristicas:</label>
                        <div className='flex gap-2'>
                            <input type="checkbox" id="parking" className='w-5'
                                onChange={handleChange}
                                checked={sidebardata.parking} />
                            <span>parking</span>
                        </div>

                        <div className='flex gap-2'>
                            <input type="checkbox" id="furnished" className='w-5'
                                onChange={handleChange}
                                checked={sidebardata.furnished} />
                            <span>Amueblado</span>
                        </div>
                    </div>


                    <div className='flex items-center gap-2'>
                        <label className='font-semibold'> Ordenar por:</label>
                        <select
                            onChange={handleChange}
                            defaultValue={'created_at_desc'}
                            id="sort_order" className='border rounded-lg p-3'
                        >
                            <option value='regularPrice_desc'> Mas baratos</option>
                            <option value='regularPrice_asc'> Precio de mayor a menor</option>
                            <option value='createdAt_desc'> Mas recientes</option>
                            <option value='createdAt_asc'> Mas antiguos</option>

                        </select>
                    </div>
                    <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95'> Buscar </button>


                </form>
            </div>


            <div className=''>
                <h1 className='text-3xl font-semibold border-b p-3 text-slate-700 mt-5'>Resulados: </h1>

                <div className='p-7 flex flex-wrap gap-4'>
                    {!loading && listings.length === 0 && (
                        <p className='text-xl text-slate-700'>No listing found!</p>
                    )}
                    {loading && (
                        <p className='text-xl text-slate-700 text-center w-full'>
                            Loading...
                        </p>
                    )}

                    {!loading &&
                        listings &&
                        listings.map((listing) => (
                            <ListingItem key={listing._id} listing={listing} />
                        ))}

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
    )
}
