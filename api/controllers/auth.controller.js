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
      isNewUser: true,
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Remove password from response
    const { password: pass, ...userData } = newUser._doc;

    // Set cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Return user data WITH TOKEN and isNewUser flag
    return res.status(200).json({
      ...userData,
      token,
      isNewUser: true,
      success: true
    });

  } catch (error) {
    next(error);
  }
};


export const signin = async (req, res, next) => {
  try {
    console.log("Sign-in attempt:", req.body); // Debug log

    // Check if required fields exist
    const { email, password } = req.body;
    if (!email || !password) {
      return next(errorHandle(400, 'Todos los campos son obligatorios'));
    }

    // Find the user
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandle(404, 'Usuario no encontrado'));
    }

    // Compare password safely
    let validPassword = false;
    try {
      validPassword = bcryptjs.compareSync(password, validUser.password);
    } catch (err) {
      console.error("Password comparison error:", err);
      return next(errorHandle(500, 'Error al verificar credenciales'));
    }

    if (!validPassword) {
      return next(errorHandle(401, 'Credenciales incorrectas'));
    }

    // Generate token
    const token = jwt.sign(
      { id: validUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Remove password from response
    const { password: pass, ...userData } = validUser._doc;

    // Set cookie with error handling
    try {
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });
    } catch (err) {
      console.error("Cookie setting error:", err);
      // Continue even if cookie fails - token is still returned in JSON
    }

    // Return response
    return res.status(200).json({
      ...userData,
      token,
      isNewUser: false,
      success: true
    });

  } catch (error) {
    console.error("Signin error:", error);
    next(errorHandle(500, 'Error interno del servidor'));
  }
};
export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      const { password: pass, ...rest } = user._doc;
      res
        .cookie('access_token', token,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000

          })
        .status(200)
        .json({
          ...rest,
          token, // Include token in the response
          isNewUser: false
        });
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
          maxAge: 24 * 60 * 60 * 1000
        })
        .status(200)
        .json({
          success: true,
          message: "Login exitoso",
          ...rest,
          token, // Include token here too
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