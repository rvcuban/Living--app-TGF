import { useState,useEffect } from "react";
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

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

 
  const handleModalClose = () => {
    setShowCompleteModal(false);
  };

  const handleModalComplete = () => {
    // El user completó su perfil
    setShowCompleteModal(false);
  };


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
      console.log("Backend response =>", data);
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;

      }
      dispatch(signInSuccess(data));

      console.log(data);
      if (data.isNewUser) {
        navigate('/onboarding'); 
      } else {
        navigate('/');
      }//usamos esto apra que una vez que se ha creado el usaurio sin errores navegar ahsta la mpapgina de inicio de sesion
      // posiblemente en un futuro lo cambie por navegar directamente dentro del eprfil paara mejorar la experiencia de ususario 
    } catch (error) {
      dispatch(signInFailure(error.message))
    }

  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4 pt-6">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-semibold text-center text-gray-900 mb-6">
          Bienvenido a TFGStartup
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              required
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              placeholder="********"
              required
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full   py-3 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-75 font-medium"
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>
        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 text-gray-500 text-sm">O</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="flex justify-center">
          <OAuth />
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link to="/sign-up" className="text-indigo-600 hover:underline">
            Regístrate
          </Link>
        </p>
        {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}