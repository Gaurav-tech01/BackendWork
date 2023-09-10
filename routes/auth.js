const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser')
const dotenv = require('dotenv')
dotenv.config()

router.post('/createuser', [
    body('name', 'Enter valid name').isLength({ min: 3 }),
    body('email', 'Enter valid email').isEmail(),
    body('password', 'Enter password with atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        return res.status(400).json({ err: err.array() })
    }
    try {
        let success = false
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ success,error: "Sorry a user already exists" })
        }
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(req.body.password, salt)
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email
        })
        const data = {
            user:{
                id: user.id
            }
        }
        const authToken = jwt.sign(data, process.env.SECRET)
        success = true
        // console.log(jwtData)
        res.json({success,authToken})
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

//Authenticate a user using: POST "/api/auth/login".
router.post('/login', [
    body('email', 'Enter valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty) {
        return res.status(400).json({errors: errors.array()})
    }
    const {email, password} = req.body;
    try {
        let success = false
        let user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({success, error:"Please try to login with correct credentials"})
        }

        const passComp = await bcrypt.compare(password, user.password)
        if(!passComp){
            return res.status(400).json({success, error:"Please try to login with correct credentials"})
        }

        const data = {
            user:{
                id: user.id
            }
        }
        const authToken = jwt.sign(data, process.env.SECRET)
        success = true
        // console.log(jwtData)
        res.json({success, authToken})
    } catch(error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

//Router 3: Get loggedin User Details using Post
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        let user = await User.findById(userId).select("-password")
        res.send(user)
    } catch(error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})
module.exports = router