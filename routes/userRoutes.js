const express = require('express');
const router = express.Router();
const User = require('../modals/user')
const { jwtAuthMiddleware, generateToken } = require('../jwt')

router.post('/signup', async (req, res) => {

    try {
        const data = req.body; // req.body used to extract data sent by client (typically in JSON format) when hitting this endpoint.

        const newUser = new User(data); // this is new and blank using schema of person

        const response = await newUser.save();

        const payLoad = {
            id: response._id
        }

        const token = generateToken(payLoad);
        // console.log('token is : ', token);


        console.log('data saved');
        res.status(200).json({ response: response, token: token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'internal server error' })
    }

})

router.post('/login', async (req, res) => {
    try {
        const { aadharCardNumber, password } = req.body;
        // finding user with aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });
        const pass = await user.comparePass(password)
        //if user dont exist or pass wrong
        if (!user || !pass) {
            return res.status(401).json({ error: "Invalid username or Password" })
        }

        const payLoad = {
            id: user._id
        }

        const token = generateToken(payLoad);

        res.json({ token })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err: 'internal server error' })
    }
})

// Profile Route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.data; // getting from jwtAuthMiddleware from jwt file where data was extracted from token
        // console.log('userData', userData);

        const userId = userData.id;

        const user = await User.findById(userId)
        console.log('user', user);

        res.status(200).json({ user })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server Error' })

    }
})

router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.data; // Get the ID from the Token
        const { currentPassword, newPassword } = req.body; // Get the update data from the request body
        //  Find the user by userId
        const user = await User.findById(userId);
        const pass = await user.comparePass(currentPassword)

        // if passd wrong
        if (!pass) {
            return res.status(401).json({ error: "Invalid username or Password" })
        }

        // Update user password
        user.password = newPassword;
        await user.save();

        console.log('Password Updated');
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating person:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router