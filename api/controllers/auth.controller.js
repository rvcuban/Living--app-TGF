import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
export const signup = async (req, res) => {

    const { username, email, password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password, 10); //usamos bcrypt for haas the password
    const newUser = new User({ username, email, password: hashedPassword });
    try {
        await newUser.save();
        res.status(201).json('user creted succesfull');
    } catch (error) {
        res.status(500).json(error.message);
    }

};