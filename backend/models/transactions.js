const mongoose = require("mongoose");
const transactionDtails = mongoose.Schema({
  tokenId: {
    type: Number,
    //required: true, // [true, "Please Enter the Token URI"],
  },
  quantity: {
    type: Number,
    //required: true, // [true, "Please Enter Total Supply"],
  },
  price: {
    type: Number,
    //required: true, //[true, "Please Enter the Price"],
  },
  to: {
    type: String,
    // required: true, //[true, "Please Enter the Email Address"],
  },
  from: {
    type: String,
    // required: true,
  },
  blockNo: {
    type: Number,
    // require: true
  },
  txId: {
    type: String,
  },
  txNo: {
    type: Number,
    default: 0
  },
  parentTokenId: {
    type: Number,
    default: 0
  },
  error: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("transactionDtails", transactionDtails);
