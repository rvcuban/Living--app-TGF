import React from 'react';
import { FaUsers, FaSearch, FaHandshake, FaShieldAlt } from 'react-icons/fa';
import { MdSecurity, MdOutlineRateReview } from 'react-icons/md';
import { RiTeamFill } from 'react-icons/ri';
import { BsQuestionCircle } from 'react-icons/bs';

export default function About() {
  return (
    <div className='py-16 px-4 max-w-6xl mx-auto font-poppins'>
      {/* Hero Section */}
      <div className='mb-16 text-center'>
        <h1 className='text-4xl md:text-5xl font-bold text-slate-800 mb-6'>Sobre Living App</h1>
        <p className='text-xl text-slate-600 max-w-3xl mx-auto'>
          Conectando personas y creando hogares compartidos, un compi a la vez.
        </p>
      </div>

      {/* Mission Section */}
      <div className='mb-16 bg-blue-50 rounded-xl p-8 shadow-sm'>
        <h2 className='text-2xl md:text-3xl font-bold text-slate-800 mb-4'>Nuestra Misión</h2>
        <p className='text-lg text-slate-700 mb-4'>
          En Living App, creemos que encontrar el compañero de piso ideal no debería ser un proceso estresante. 
          Nuestra misión es simplificar la búsqueda de compañeros de piso creando conexiones significativas basadas en 
          compatibilidad, confianza y objetivos compartidos.
        </p>
        <p className='text-lg text-slate-700'>
          Sabemos que compartir vivienda va más allá de dividir gastos - se trata de crear un ambiente donde todos 
          puedan prosperar juntos.
        </p>
      </div>

      {/* Features Section */}
      <div className='mb-16'>
        <h2 className='text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center'>¿Por qué elegir Living App?</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {/* Feature 1 */}
          <div className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'>
            <div className='flex items-center mb-4'>
              <FaUsers className='text-blue-500 text-3xl mr-3' />
              <h3 className='text-xl font-semibold text-slate-800'>Perfiles Detallados</h3>
            </div>
            <p className='text-slate-600'>
              Crea un perfil que refleje realmente tu estilo de vida, horarios y preferencias para encontrar 
              compañeros verdaderamente compatibles.
            </p>
          </div>

          {/* Feature 2 */}
          <div className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'>
            <div className='flex items-center mb-4'>
              <FaSearch className='text-blue-500 text-3xl mr-3' />
              <h3 className='text-xl font-semibold text-slate-800'>Búsqueda Inteligente</h3>
            </div>
            <p className='text-slate-600'>
              Nuestro algoritmo personalizado te ayuda a encontrar compañeros que comparten tus intereses, 
              estilo de vida y expectativas de convivencia.
            </p>
          </div>

          {/* Feature 3 */}
          <div className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'>
            <div className='flex items-center mb-4'>
              <FaShieldAlt className='text-blue-500 text-3xl mr-3' />
              <h3 className='text-xl font-semibold text-slate-800'>Verificación de Usuarios</h3>
            </div>
            <p className='text-slate-600'>
              Todos los perfiles pasan por un proceso de verificación para asegurar una comunidad de confianza 
              y seguridad para todos nuestros usuarios.
            </p>
          </div>

          {/* Feature 4 */}
          <div className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'>
            <div className='flex items-center mb-4'>
              <MdOutlineRateReview className='text-blue-500 text-3xl mr-3' />
              <h3 className='text-xl font-semibold text-slate-800'>Sistema de Reseñas</h3>
            </div>
            <p className='text-slate-600'>
              Las reseñas y valoraciones ayudan a construir confianza y te permiten tomar decisiones informadas 
              al elegir a tu próximo compañero.
            </p>
          </div>

          {/* Feature 5 */}
          <div className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'>
            <div className='flex items-center mb-4'>
              <MdSecurity className='text-blue-500 text-3xl mr-3' />
              <h3 className='text-xl font-semibold text-slate-800'>Comunicación Segura</h3>
            </div>
            <p className='text-slate-600'>
              Chatea con potenciales compañeros dentro de nuestra plataforma segura antes de compartir 
              información personal.
            </p>
          </div>

          {/* Feature 6 */}
          <div className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'>
            <div className='flex items-center mb-4'>
              <FaHandshake className='text-blue-500 text-3xl mr-3' />
              <h3 className='text-xl font-semibold text-slate-800'>Compatibilidad</h3>
            </div>
            <p className='text-slate-600'>
              Nuestro sistema evalúa la compatibilidad en aspectos como horarios, hábitos, intereses y 
              expectativas para sugerir las mejores coincidencias.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className='mb-16 bg-gradient-to-r from-blue-500 to-teal-400 rounded-xl p-8 text-white'>
        <div className='text-center mb-8'>
          <h2 className='text-2xl md:text-3xl font-bold mb-2'>Una Comunidad en Crecimiento</h2>
          <p className='text-lg opacity-90'>Uniendo personas y creando hogares compartidos cada día</p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-center'>
          <div>
            <p className='text-4xl md:text-5xl font-bold'>5,000+</p>
            <p className='text-lg mt-2 opacity-90'>Usuarios Activos</p>
          </div>
          <div>
            <p className='text-4xl md:text-5xl font-bold'>850+</p>
            <p className='text-lg mt-2 opacity-90'>Coincidencias Exitosas</p>
          </div>
          <div>
            <p className='text-4xl md:text-5xl font-bold'>15+</p>
            <p className='text-lg mt-2 opacity-90'>Ciudades</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className='mb-16'>
        <div className='flex items-center mb-6'>
          <RiTeamFill className='text-blue-500 text-3xl mr-3' />
          <h2 className='text-2xl md:text-3xl font-bold text-slate-800'>Nuestro Equipo</h2>
        </div>
        <p className='text-lg text-slate-700 mb-4'>
          Living App nació como un proyecto de Trabajo de Fin de Grado (TFG) por un estudiante 
          apasionado por resolver problemas reales utilizando la tecnología.
        </p>
        <p className='text-lg text-slate-700 mb-4'>
          La idea surgió de las experiencias personales al buscar compañeros de piso y las dificultades 
          encontradas en el proceso. Decidimos crear una solución que simplificara esta búsqueda y 
          garantizara mejores coincidencias basadas en compatibilidad real.
        </p>
        <p className='text-lg text-slate-700'>
          Hoy, continuamos mejorando la plataforma con nuevas funcionalidades y expandiendo 
          nuestra comunidad para ayudar a más personas a encontrar el compañero ideal.
        </p>
      </div>

      {/* FAQ Section */}
      <div className='mb-16'>
        <div className='flex items-center mb-6'>
          <BsQuestionCircle className='text-blue-500 text-3xl mr-3' />
          <h2 className='text-2xl md:text-3xl font-bold text-slate-800'>Preguntas Frecuentes</h2>
        </div>
        <div className='space-y-6'>
          <div>
            <h3 className='text-xl font-semibold text-slate-800 mb-2'>¿Cómo funciona Living App?</h3>
            <p className='text-slate-600'>
              Crear tu perfil, indicar tus preferencias y utilizar nuestras herramientas de búsqueda para 
              encontrar compañeros compatibles. Puedes contactar directamente con ellos a través de nuestra 
              plataforma segura.
            </p>
          </div>
          <div>
            <h3 className='text-xl font-semibold text-slate-800 mb-2'>¿Es gratuita la plataforma?</h3>
            <p className='text-slate-600'>
              Living App ofrece funciones básicas gratuitas para todos los usuarios. También disponemos de 
              opciones premium con características avanzadas para mejorar tu experiencia.
            </p>
          </div>
          <div>
            <h3 className='text-xl font-semibold text-slate-800 mb-2'>¿Cómo garantizan la seguridad?</h3>
            <p className='text-slate-600'>
              Verificamos los perfiles de los usuarios, ofrecemos comunicación interna segura y contamos con 
              un sistema de reseñas para construir confianza dentro de la comunidad.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className='bg-gray-50 rounded-xl p-8'>
        <h2 className='text-2xl md:text-3xl font-bold text-slate-800 mb-4 text-center'>Contacta con Nosotros</h2>
        <p className='text-lg text-slate-700 text-center mb-6'>
          ¿Tienes preguntas o sugerencias? Nos encantaría escucharte.
        </p>
        <div className='flex flex-col md:flex-row justify-center items-center gap-4'>
          <a href="mailto:info@livingapp.com" className='bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors'>
            Envíanos un Email
          </a>
          <a href="#" className='bg-white text-blue-500 border border-blue-500 px-6 py-3 rounded-md hover:bg-blue-50 transition-colors'>
            Síguenos en Redes Sociales
          </a>
        </div>
      </div>
    </div>
  );
}