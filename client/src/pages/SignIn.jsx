import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice";
import OAuth from "../components/OAuth";


export default function SignIn() {
  const [formData, setFormData] = useState({});
  //cambiados por gestion de esatdos e redux
  //const [error, setError] = useState(null); // eeste etado sera para los errores
  //const [loading, setLoading] = useState(false); // este estado sera pr ala animacion de carga dado que na vez que se enien los datoas no se debe poder volver aa usar el boton de enviar antes de recibir la respuesta 

  //gestion de esatdos e redux
  const { loading, error } = useSelector((state) => state.user);

  const navigate = useNavigate(); //inicailizamos el navigate para poder eredirecccionar a otras paginas
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData(//esto se usa `para conservar el estado y poder mantener siempre el usuario , el email y la contraseña 
      {
        ...formData,
        [e.target.id]: e.target.value
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); //esta funcion nos permitira que una vez que se envien los datos en el form no se refrescque la pagina 
    try {
      //setLoading(true);// una vez que hayamos detecado que se envia una respuesta setteamos el laoding a true //cambiado por estado en redux
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;

      }
      dispatch(signInSuccess(data));
      navigate('/');//usamos esto apra que una vez que se ha creado el usaurio sin errores navegar ahsta la mpapgina de inicio de sesion
      // posiblemente en un futuro lo cambie por navegar directamente dentro del eprfil paara mejorar la experiencia de ususario 
    } catch (error) {
      dispatch(signInFailure(error.message))
    }

  };

  return (
    <div>


      <div className='p-3 max-w-lg mx-auto'>
        <h1 className='text-3xl text-center font-semibold my-7 '>Welcome to TFGStartup</h1>
        <p className="text-gray-400 text-center mb-6">Iniciar sesion</p>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input type="text" placeholder='email' className='border p-3 rounded-lg' id='email' onChange={handleChange} />
          <input type="text" placeholder='password' className='border p-3 rounded-lg' id='password' onChange={handleChange} />
          <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
            {loading ? 'Loading...' : 'Sing In'}
          </button>
          <div className="text-center">
            <p className="text-gray-600">o</p>
          </div>
          <OAuth />
        </form>
        <div className='flex gap-2 mt-5'>
          <p>No account?</p>

          <Link to={"/sign-up"}>
            <span className="text-blue-700">Sign up </span>
          </Link>
        </div>
        {error && <p className="text-red-500 mt-5">{error} </p>}
      </div>
    </div>

    
  );

}
