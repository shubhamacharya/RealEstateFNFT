const mongoose = require('mongoose');

const connectDB = async () => {
    console.log(process.env.DATABASE_URL+process.env.DATABASE_NAME);
    const con = await mongoose.connect(process.env.DATABASE_URL+process.env.DATABASE_NAME);
    console.log(`MongoDB Connected : ${con.connection.host}`);
}

module.exports = connectDB;