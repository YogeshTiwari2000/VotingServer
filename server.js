
const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();
const { jwtAuthMiddleware } = require('./jwt')

const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use(bodyParser.json())
const PORT = process.env.PORT || 3000

app.use('/user', userRoutes)
app.use('/candidate', candidateRoutes)

app.listen(PORT, () => {
    console.log("listening on 3000")
})






