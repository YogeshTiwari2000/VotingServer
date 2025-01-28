const jwt = require('jsonwebtoken');
const User = require('./modals/user');

const jwtAuthMiddleware = (req, res, next) => {
    // extract the jwt from request header
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthrized" })

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.data = decoded; // extracting data from token here // using this data in profile page using jwtmiddlware there

        next();
    }
    catch (err) {
        console.log(err);
        res.status(401).json({ error: "invalid token" })
    }
}

//  function to generate JWT token
const generateToken = (userData) => {
    // return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 3000 })// its 30sec
    return jwt.sign(userData, process.env.JWT_SECRET)
}

module.exports = { jwtAuthMiddleware, generateToken }