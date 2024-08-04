import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandle } from '../utils/error.js';
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {

    const { username, email, password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password, 10); //usamos bcrypt for haas the password
    const newUser = new User({ username, email, password: hashedPassword });
    try {
        await newUser.save();
        res.status(201).json('user creted succesfull');
    } catch (error) {
        next(error);
    }

};


export const signin = async (req, res, next) => {

    const { email, password } = req.body;

    try {
        const ValidUser = await User.findOne({ email });
        if (!ValidUser) return next(errorHandle(404, 'User not Found'));
        const validPassword = bcryptjs.compareSync(password, ValidUser.password);
        if (!validPassword) return next(errorHandle(401, 'Wrong credentials!'));

        const token = jwt.sign({ id: ValidUser.$getAllSubdocs_id }, process.env.JWT_SECRET) // aqui utilizamos una variable de entorno que servira para hashear y encriptar el id de usuario en el token
        const { password: pass, ...rest } = ValidUser._doc //aqui creamo una variable que separa la contraseña del resto para poder enviarle un json al user 
                                                     // de que todo esta correcto pero sin enviar la contrraseña aunque este encryptada 

        res.cookie('access_token', token, { httpOnly: true }) //aqui creamos la cookie para dejar autentificao el usaurio en nuestra web , el primer parametro es el nombre el segundo el toiken y lo tercero e para no permitir acceso e aplicaciones de tercero y hacer la cookie mas segura 
            .status(200) //devolvemos un nstatus 200 de forma que todo a ido correcto 
            .json(rest); // un json con la informaciond el usaurio validado
    } catch (error) {
        next(error);
    }

};
