import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandle } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

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
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Update the google function
export const google = async (req, res, next) => {
  try {
    // Check if we have a credential token from the new OAuth flow
    if (req.body.credential) {
      // Verify the token with Google
      const ticket = await googleClient.verifyIdToken({
        idToken: req.body.credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      // Extract user data from the payload
      const payload = ticket.getPayload();
      
      // Check if user exists
      const user = await User.findOne({ email: payload.email });
      
      if (user) {
        // User exists, log them in
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const { password: pass, ...rest } = user._doc;
        
        res.cookie('access_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 24 * 60 * 60 * 1000
        });
        
        return res.status(200).json({
          success: true,
          ...rest,
          token,
          isNewUser: false,
          message: "Inicio de sesión exitoso"
        });
      } else {
        // Create new user
        const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
        
        // Create username from email and random string
        const username = payload.name.split(' ').join('').toLowerCase() + Math.random().toString(36).slice(-4);
        
        const newUser = new User({
          username,
          email: payload.email,
          password: hashedPassword,
          avatar: payload.picture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
          isNewUser: true
        });
        
        await newUser.save();
        
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const { password: pass, ...rest } = newUser._doc;
        
        res.cookie('access_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 24 * 60 * 60 * 1000
        });
        
        return res.status(200).json({
          success: true,
          ...rest,
          token,
          isNewUser: true,
          message: "Usuario creado y autenticado con éxito"
        });
      }
    } 
    // Fallback for old method if needed
    else if (req.body.name && req.body.email) {
      // Your existing code for handling Firebase auth
      // ...
    } else {
      return next(errorHandle(400, "Datos de autenticación inválidos"));
    }
  } catch (error) {
    console.error("Google auth error:", error);
    next(errorHandle(500, "Error en autenticación con Google"));
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


export const googleCallback = async (req, res, next) => {
  try {
    console.log("Google callback received with query:", req.query);
    
    const { code, state } = req.query;
    
    if (!code) {
      console.error("No authorization code received");
      return res.redirect('/?error=no_code');
    }
    
    // Get hostname and port more reliably
    const fullHost = req.headers.host;
    const hostname = fullHost.split(':')[0];
    const port = fullHost.includes(':') ? fullHost.split(':')[1] : '';
    
    console.log("Host information:", { fullHost, hostname, port });
    
    // Calculate redirect URI in the exact same way as the frontend
    let redirectUri;
    
    if (hostname === 'localhost') {
      // For local development - Use HTTP instead of HTTPS
      // Use the exact same port that was in the original request
      redirectUri = `http://localhost:${port}/api/auth/google/callback`;
    } else if (hostname === 'livingapp-tgf.onrender.com') {
      // For render.com deployment
      redirectUri = 'https://livingapp-tgf.onrender.com/api/auth/google/callback';
    } else {
      // For production domain
      redirectUri = 'https://compitrueno.com/api/auth/google/callback';
    }
    
    console.log("Using token exchange redirect URI:", redirectUri);
    
    // Ensure client secret is available
    if (!process.env.GOOGLE_CLIENT_SECRET) {
      console.error("Missing GOOGLE_CLIENT_SECRET environment variable");
      return res.redirect('/?error=missing_secret');
    }
    
    // Prepare the exchange request
    const tokenURL = 'https://oauth2.googleapis.com/token';
    const params = {
      code,
      client_id: '590776902894-vms5oesvvmemmt9bqvug88gb4prhvbfc.apps.googleusercontent.com',
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };
    
    console.log("Token exchange params (excluding secret):", {
      ...params,
      client_secret: '[REDACTED]' 
    });
    
    // Exchange code for tokens
    const tokenResponse = await fetch(tokenURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });
    
    // Log the full response for debugging
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange error:", errorText);
      return res.redirect(`/?error=token_exchange&details=${encodeURIComponent(errorText)}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error("No access token in response:", tokenData);
      return res.redirect('/?error=no_access_token');
    }
    
    console.log("Token exchange successful");
    
    // Get user info with access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    
    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error("User info fetch error:", errorText);
      return res.redirect('/?error=user_info');
    }
    
    const userInfo = await userInfoResponse.json();
    console.log("Received user info:", {
      email: userInfo.email,
      name: userInfo.name,
      sub: userInfo.sub
    });
    
    // Check if user exists
    const user = await User.findOne({ email: userInfo.email });
    let token;
    
    if (user) {
      // User exists, generate token
      token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      
      // Set cookie
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });
      
      return res.redirect(`/?login=success&token=${token}&userId=${user._id}`);
    } else {
      // Create new user
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const username = userInfo.name.split(' ').join('').toLowerCase() + Math.random().toString(36).slice(-4);
      
      const newUser = new User({
        username,
        email: userInfo.email,
        password: hashedPassword,
        avatar: userInfo.picture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
        isNewUser: true
      });
      
      try {
        await newUser.save();
        token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.cookie('access_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 24 * 60 * 60 * 1000
        });
        
        return res.redirect(`/?login=success&token=${token}&userId=${newUser._id}&isNewUser=true`);
      } catch (saveError) {
        console.error("Error saving new user:", saveError);
        return res.redirect('/?error=user_creation');
      }
    }
  } catch (error) {
    console.error("Google callback error:", error);
    return res.redirect('/?error=server');
  }
};