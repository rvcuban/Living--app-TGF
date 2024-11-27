const data = {
    // Datos del propietario
    nombrePropietario: 'Juan Pérez',
    nacionalidadPropietario: 'Española',
    domicilioPropietario: 'Calle Falsa 123, Madrid',
    dniPropietario: '12345678A',
    emailPropietario: 'juan.perez@example.com',
    telefonoPropietario: '600123456',
    entidadBancariaPropietario: 'Banco de España',
    cuentaBancariaPropietario: 'ES7620770024003102575766',
  
    // Datos del inmueble
    lugar: 'Madrid',
    fecha: '01/11/2023',
    direccionInmueble: 'Calle Real 45',
    calleInmueble: 'Calle Real',
    descripcionInmueble: 'Piso 3ºB, con garaje y trastero',
    refCatastral: '1234567UF4613S0001BB',
    comunidadPropietarios: 'Sí',
    cedulaHabitabilidad: 'CH-789456',
    certificadoEnergetico: 'CEE-123456',
  
    // Lista de inquilinos
    inquilinos: [
      {
        nombre: 'María García',
        nacionalidad: 'Española',
        domicilio: 'Avenida Siempre Viva 742, Barcelona',
        dni: '87654321B',
        email: 'maria.garcia@example.com',
        telefono: '600654321',
      },
      {
        nombre: 'Carlos López',
        nacionalidad: 'Española',
        domicilio: 'Avenida Siempre Viva 742, Barcelona',
        dni: '56789012C',
        email: 'carlos.lopez@example.com',
        telefono: '600987654',
      },
    ],
  
    // Otros datos necesarios
    numeroMaximoPersonas: 4,
    mascotasPermitidas: 'No',
  
    fechaEntradaVigor: '01/12/2023',
    rentaAnual: 12000,
    rentaMensual: 1000,
  
    zonaTensionada: 'No',
    ultimaRentaAnual: null,
    valorActualizadoRenta: null,
  
    inicioDevengoRenta: 'Opción 1', // 'Opción 1' o 'Opción 2'
    metodoPago: 'Transferencia', // 'Transferencia' o 'Domiciliación'
  
    entidadBancariaInquilino: 'Banco Popular',
    cuentaBancariaInquilino: 'ES7620770024003102575777',
  
    actualizacionRenta: 'Sí',
    fechaActualizacion: '01/12/2024',
    actualizacionNegativa: 'No',
  
    entregaFianza: 'En este acto', // 'En este acto' o 'En la entrega de llaves'
    valorFianza: 2000,
    mesesFianza: 2,
    depositoFianza: 'Sí',
  
    garantiaAdicional: 'No Aplica', // 'Depósito', 'Aval', 'No Aplica'
  
    fechaInicioSuministros: '01/12/2023',
    cambioTitularidadSuministros: 'Sí',
  
    gastosComunidadIBI: 'Propietario', // 'Propietario', 'Inquilino', 'Mixto'
    pagoTasas: 'Inquilino', // 'Inquilino' o 'Propietario'
  
    estadoVivienda: 'Opción 3', // 'Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'
    incluyeFotos: 'No',
  
    numeroLlaves: 2,
  
    // Añade cualquier otro dato necesario
  };
  
  module.exports = data;
  