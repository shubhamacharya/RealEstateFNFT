const mongoose = require('mongoose');
const userDetails = mongoose.Schema({
    id: {
        type: String
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    role: {
        type: String
    },
    password: {
        type: String
    }
});

module.exports = mongoose.model('userDetails', userDetails);
