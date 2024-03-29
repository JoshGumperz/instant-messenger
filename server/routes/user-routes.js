const router = require('express').Router();
const User = require("../models/User")
const CryptoJS = require("crypto-js")
const jwt = require("jsonwebtoken");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } = require('../utils/verifyToken');


// CREATE NEW USER -> /API/REGISTER 
router.post('/register', async (req, res) => {
    try {
        let savedUser
        if(req.body.username && req.body.email && req.body.password) {
                const newUser = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_PHRASE).toString()
                })
                savedUser = await newUser.save()
            } else {
            res.status(400).json({ message: "Missing Credentials" });
            return;
            }
        const {password, ...others} = savedUser._doc
        const accessToken = jwt.sign({
            id: savedUser._id,
            admin: savedUser.isAdmin
        }, 
        process.env.JWT_SEC,
        {expiresIn:"4h"}
        )
        res.status(201).json({...others, accessToken});    
    } catch (err) {
        if(err.code === 11000) {
            res.status(402).json({message: "User Already Exists"})
            return;
        }
        console.log(err);
        return res.status(500).json(err);
    }
})

// LOGIN -> /API/LOGIN
router.post('/login', async (req, res) => {
    try {
        const conditions = !req.body.username ? { email: req.body.email } : { username: req.body.username };
        const user = await User.findOne(conditions);
        if(!user) {
            res.status(400).json({ message: 'Invalid Login Credentials' });
            return;
        } 
        const hashedPassword = CryptoJS.AES.decrypt(
            user.password, 
            process.env.PASS_PHRASE
        );
        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
        if(originalPassword !== req.body.password) {
            res.status(400).json({ message: 'Invalid Login Credentials' });
            return;
        } 

        const {password, ...others} = user._doc

        const accessToken = jwt.sign({
            id: user._id,
            username: user.username,
            admin: user.isAdmin
        }, 
        process.env.JWT_SEC,
        {expiresIn:"4h"}
        )

        res.status(200).json({...others, accessToken});    
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);  
    }
})

// LOGOUT -> /API/LOGOUT
router.post('/logout', verifyToken, async (req, res) => {
    try {
        res.status(204).json({message: "logged out"}).end();
    } catch (err) {
        res.status(500).json(err)
    }
})

// EDIT USER -> /API/SETTINGS/:id
router.put('/user/:id', verifyTokenAndAuthorization, async (req, res) => {
    if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.PASS_PHRASE).toString();
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new: true})

        const {password, ...others} = updatedUser._doc

        res.status(200).json(others);
    } catch (err) {
        if(err.code === 11000) {
            res.status(409).json({message: "A User With That Username Already Exists"})
            return;
        }
        console.log(err);
        return res.status(500).json(err);  
    }
})

// DELETE USER -> /API/DELETE/:id
router.delete('/delete/:id', verifyTokenAndAuthorization, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json({message: "user deleted successfully"})
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);  
    }
})

// GET ALL USERS -> /API/FIND
router.get('/find', verifyTokenAndAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users)
    } catch (err) {
        console.log(err);       
        return res.status(500).json(err);
    }
})


// GET SPECIFIC USER -> /API/FIND/:id
router.get('/find/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id) 
        const {password, ...others} = user._doc
        res.status(200).json(others)
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
})

router.get('/find/username/:username', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }) 
        if(user) {
            const {password, ...others} = user._doc
            res.status(200).json(others)
        } else {
            res.status(404).json({ message: 'User Not Found' })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
})


module.exports = router;