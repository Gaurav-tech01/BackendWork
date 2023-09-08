const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const fetchuser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: "Please authenticate using a vaid token" })
    }
    try {
        const data = jwt.verify(token, process.env.SECRET)
        req.user = data.user
        next()
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a vaid token" })
    }
}

module.exports = fetchuser