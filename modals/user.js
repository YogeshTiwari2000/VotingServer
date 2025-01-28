const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    mobile: {
        type: String,
    },
    email: {
        type: String,
        uniq: true,
    },
    address: {
        type: String,
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter',
        required: true
    },
    isVoted: {
        type: Boolean,
        default: false
    }
});


userSchema.pre('save', async function (next) {

    const person = this;
    // Hash the password only if its modified for new

    if (!person.isModified('password')) return next();
    try {

        // salt generated 
        const salt = await bcrypt.genSalt(10)

        const hashedPass = await bcrypt.hash(person.password, salt);
        person.password = hashedPass;

        next();

    } catch (err) {
        next(err)
    }

})

userSchema.methods.comparePass = async function (candidatePass) {

    try {
        // use bycrpt to compare the machedPass with enteredPass
        const isMatch = await bcrypt.compare(candidatePass, this.password)
        return await bcrypt.compare(candidatePass, this.password);
        return isMatch;

    } catch (err) {
        throw err;
    }
}

const User = mongoose.model('User', userSchema);
module.exports = User;