const mongoose = require('mongoose');

const connectDB = async () => {
    const con = await mongoose.connect('mongodb://127.0.0.1:27017/RNFT');
    console.log(`MongoDB Connected : ${con.connection.host}`);
}

module.exports = connectDB;