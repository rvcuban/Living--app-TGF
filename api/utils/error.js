
export const errorHandle =(statusCode,message)=>{ //esta funcion sera un set manua de un error pasanole el codigo de erorr y el mensaje y usuaremos el constructuror de error de javascript para crear un error 
    const error = new Error()
    error.statusCode = statusCode
    error.message=message
    return error;
};