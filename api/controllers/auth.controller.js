import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandle } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
  try {
    const { email, password, generateUsername } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandle(400, 'El email ya está registrado'));
    }
    
    // Generate a username if requested
    let username;
    if (generateUsername) {
      // Generate a random username based on email or use a username generator
      username = email.split('@')[0] + Math.floor(Math.random() * 10000);
      
      // Make sure username is unique
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        username = email.split('@')[0] + Math.floor(Math.random() * 100000);
      }
    } else if (!req.body.username) {
      return next(errorHandle(400, 'El nombre de usuario es obligatorio'));
    } else {
      username = req.body.username;
    }
    
    // Hash password
    const hashedPassword = bcryptjs.hashSync(password, 10);
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    
    await newUser.save();
    res.status(201).json({ success: true, message: 'Usuario creado correctamente' });
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

        const token = jwt.sign({ id: ValidUser._id }, process.env.JWT_SECRET); // aqui utilizamos una variable de entorno que servira para hashear y encriptar el id de usuario en el token
        const { password: pass, ...rest } = ValidUser._doc //aqui creamo una variable que separa la contraseña del resto para poder enviarle un json al user 
        // de que todo esta correcto pero sin enviar la contrraseña aunque este encryptada 

        res.cookie('access_token', token, { httpOnly: true }) //aqui creamos la cookie para dejar autentificao el usaurio en nuestra web , el primer parametro es el nombre el segundo el toiken y lo tercero e para no permitir acceso e aplicaciones de tercero y hacer la cookie mas segura 
            .status(200) //devolvemos un nstatus 200 de forma que todo a ido correcto 
            .json({
              success: true,
              message: "Login exitoso",
              user: rest, // <-- aquí van los datos del usuario
              isNewUser: ValidUser.isNewUser // <-- aquí el flag de nuevo usuario
            });
    } catch (error) {
        next(error);
    }

};
export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET,{ expiresIn: '1d' });
      const { password: pass, ...rest } = user._doc;
      res
        .cookie('access_token', token, 
          { httpOnly: true ,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000

        })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(' ').join('').toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie('access_token', token, { 
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 24 * 60 * 60 * 1000})
        .status(200)
        .json({
          success: true,
          message: "Login exitoso",
          user: rest,
          isNewUser: newUser.isNewUser,
        });
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json('User has been logged out!');
  } catch (error) {
    next(error);
  }
};


export const signupAutoLogin = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    // 1) Hashear password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // 2) Crear el usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      // avatar o lo que necesites inicial
    });
    await newUser.save();

    // 3) Crear token JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

    // 4) Excluir password del objeto de respuesta
    const { password: pass, ...userData } = newUser._doc;

    // 5) Retornar
    return res.status(201).json({
      success: true,
      token,
      user: userData,
      message: "Usuario creado y logueado automáticamente"
    });
  } catch (error) {
    // Manejo de errores
    next(error);
  }
};