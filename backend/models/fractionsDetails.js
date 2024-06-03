const { boolean } = require('hardhat/internal/core/params/argumentTypes');
const mongoose = require('mongoose');
const fnftDetails = mongoose.Schema({
    fractionId: {
        type: String,
        //required: true, // [true, "Please Enter the Token URI"],
    },
    tokenId: {
        type: Number,
        //required: true, // [true, "Please Enter Total Supply"],
    },
    owner: {
        type: String
    },
    price: {
        type: Number,
    },
    forSale: {
        type: Boolean,
        default: false
    },
    txId: {
        type: String,
        //required: true, //[true, "Please Enter the trnsaction ID"],
    },
    blockNo: {
        type: Number,
        //require: true
    }
})

module.exports = mongoose.model('fnftDetails', fnftDetails);