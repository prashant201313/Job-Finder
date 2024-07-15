const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../../schemas/user');

dotenv.config();

router.post("/register", async (req, res) => {
    const { name, email, mobile, password } = req.body;
    const user = await User.findOne({ email });
    if(user) {
        return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({ 
        ...req.body, 
        password: hashedPassword
    });
    await newUser.save();
    res.status(201).json({ message: "User register successfully" });
});

router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
    
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "Wrong credentials" });
        }
    
        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword) {
            return res.status(400).json({ message: "Wrong credentials" });
        }
        else {
            const token = jwt.sign({ _id: user._id}, process.env.TOKEN_SECRET);
            res.header("auth-token", token).json({ message: "Logged in successfully" });
        }
    }
    catch (err) {
        next(err);
    }
});

module.exports = router;
