let { Web3 } = require('web3');
require("dotenv").config({ path: "../.env" });
const fsPromise = require('fs/promises');
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
var RNFTContract, Escrow1155Contract;
const abiDecoder = require('abi-decoder');

const NFTDetails = require('../models/nftDetails');
const FractionsDetails = require('../models/fractionsDetails');
const Transactions = require('../models/transactions');

const getABI = async (filePath) => {
    const data = await fsPromise.readFile(filePath, 'utf-8');
    return await JSON.parse(data)['abi'];
}

const deployContract = async (contractName) => {
    if (contractName === "RNFT") {
        const rnftABI = await getABI(process.env.RNFT_CONTRACT_ABI_PATH);
        RNFTContract = new web3.eth.Contract(rnftABI, process.env.RNFT_CONTRACT_ADDRESS);
        RNFTContract.options.handleRevert = true;
    }
    else {
        const escrow1155ABI = await getABI(process.env.ESCROW1155_CONTRACT_ABI_PATH);
        Escrow1155Contract = new web3.eth.Contract(escrow1155ABI, process.env.Escrow1155_CONTRACT_ADDRESS);
        Escrow1155Contract.options.handleRevert = true;
    }
}

const getContractObj = async (contractName) => {
    if (RNFTContract === undefined || Escrow1155Contract === undefined) {
        await deployContract(contractName);
    }
    return contractName === "RNFT" ? RNFTContract : Escrow1155Contract
}

const mintNFTCallout = async (args) => {
    RNFTContract = await getContractObj("RNFT");
    await RNFTContract.methods.setEscrowAddress(process.env.Escrow1155_CONTRACT_ADDRESS).send({ from: args.adminAddress });
    await RNFTContract.methods.createNFT(args.ownerAddress, args.price).send({ from: args.adminAddress, gas: 1000000 });

    let res = await RNFTContract.getPastEvents();
    let nftReceipt = new NFTDetails();
    let transactionReceipt = new Transactions();

    nftReceipt.tokenId = parseInt(res[1].returnValues.tokenId);
    nftReceipt.name = args.name;
    nftReceipt.tokenURI = args.tokenURI;
    nftReceipt.price = parseInt(res[1].returnValues.price);
    nftReceipt.ownerAddress = res[1].returnValues.to.toLowerCase();
    nftReceipt.blockNo = parseInt(res[1].blockNumber);
    nftReceipt.txId = res[1].transactionHash;
    nftReceipt.tokenImg = args.images;

    transactionReceipt.tokenId = parseInt(res[1].returnValues.tokenId);
    transactionReceipt.quantity = parseInt(res[0].returnValues.value);
    transactionReceipt.to = res[0].returnValues.to.toLowerCase();
    transactionReceipt.from = res[0].returnValues.from.toLowerCase();
    transactionReceipt.blockNumber = parseInt(res[0].returnValues.blockNumber);
    transactionReceipt.txId = res[0].transactionHash;

    await nftReceipt.save();
    await transactionReceipt.save();
    return res[0].transactionHash;
}

const sellNFTCallout = async (args) => {
    RNFTContract = await getContractObj("RNFT");
    let transactionReceipt = new Transactions();

    await RNFTContract.methods.sellToken(args.tokenId).send({ from: args.ownerAddress, gas: 1000000 })

    let res = await RNFTContract.getPastEvents();
    if (res[0]["returnValues"]["2"]) {
        let nftReceipt = await NFTDetails.findOne({ tokenId: args.tokenId })

        nftReceipt.forSale = true;
        transactionReceipt.tokenId = parseInt(res[2].returnValues.id);
        transactionReceipt.quantity = parseInt(res[2].returnValues.value);
        transactionReceipt.to = res[2].returnValues.to.toLowerCase();
        transactionReceipt.from = res[2].returnValues.from.toLowerCase();
        transactionReceipt.blockNumber = parseInt(res[2].blockNumber);
        transactionReceipt.txId = res[2].transactionHash;

        await nftReceipt.save();
        await transactionReceipt.save();
        return res[2].transactionHash;
    }
}

module.exports = { mintNFTCallout, sellNFTCallout }