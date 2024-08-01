let { Web3 } = require("web3");
require("dotenv").config({ path: "../.env" });
const fsPromise = require("fs/promises");
const web3 = new Web3(Web3.givenProvider || process.env.PROVIDER);
var RNFTContract, Escrow1155Contract;
const abiDecoder = require("abi-decoder");

const NFTDetails = require("../models/nftDetails");
const FractionsDetails = require("../models/fractionsDetails");
const Transactions = require("../models/transactions");
const { uploadImageToIPFS } = require("./ipfsOperations");
const { TokenExpiredError } = require("jsonwebtoken");

const getABI = async (filePath) => {
  const data = await fsPromise.readFile(filePath, "utf-8");
  return await JSON.parse(data)["abi"];
};

const deployContract = async (contractName) => {
  if (contractName === "RNFT") {
    const rnftABI = await getABI(process.env.RNFT_CONTRACT_ABI_PATH);
    RNFTContract = new web3.eth.Contract(
      rnftABI,
      process.env.RNFT_CONTRACT_ADDRESS
    );
    RNFTContract.options.handleRevert = true;
  } else {
    const escrow1155ABI = await getABI(
      process.env.ESCROW1155_CONTRACT_ABI_PATH
    );
    Escrow1155Contract = new web3.eth.Contract(
      escrow1155ABI,
      process.env.Escrow1155_CONTRACT_ADDRESS
    );
    Escrow1155Contract.options.handleRevert = true;
  }
};

const getContractObj = async (contractName) => {
  if (RNFTContract === undefined || Escrow1155Contract === undefined) {
    await deployContract(contractName);
  }
  return contractName === "RNFT" ? RNFTContract : Escrow1155Contract;
};

const mintNFTCallout = async (args) => {
  RNFTContract = await getContractObj("RNFT");
  let nftReceipt = new NFTDetails();
  let transactionReceipt = new Transactions();
  let res;
  try {
    if ((await RNFTContract.methods.escrowContract()) != "0x00") {
      await RNFTContract.methods
        .setEscrow(process.env.Escrow1155_CONTRACT_ADDRESS)
        .send({ from: process.env.ADMIN_ADDRESS });
    }
    // Convert price from ethers to wei by multiplying it with 10^18
    const receipt = await RNFTContract.methods
    .createNFT(args.price * Math.pow(10, 18))
    .send({ from: args.ownerAddress, gas: 1000000 });


    console.log(await web3.eth.getTransactionReceipt(receipt['transactionHash']));
    if (receipt.events?.NFTCreated) {
      res = receipt.events.NFTCreated;
      nftReceipt.tokenId = parseInt(res?.returnValues.tokenId);
      nftReceipt.name = args.name;
      nftReceipt.tokenURI = args.tokenURI;
      nftReceipt.price = parseFloat(
        Number(res.returnValues.price) / Number(Math.pow(10, 18))
      );
      nftReceipt.ownerAddress = res.returnValues.to.toLowerCase();
      nftReceipt.blockNo = parseInt(res.blockNumber);
      nftReceipt.txId = res.transactionHash;
      nftReceipt.tokenImg = args.images;

      await nftReceipt.save();
    } else {
      pastEvent = await new web3.eth.Contract(
        await getABI(process.env.RNFT_CONTRACT_ABI_PATH)
      ).events.allEvents({ fromBlock: receipt.blockNumber });

      // console.log(pastEvent);

      console.log("Event Not Generated");
    }
  } catch (error) {
    console.log("err ==> ", error);
    transactionReceipt.error = web3.utils.hexToAscii(error.cause.data);
    transactionReceipt.tokenId = parseInt(res.returnValues.tokenId);
    transactionReceipt.quantity =
      "value" in res.returnValues ? parseInt(res.returnValues.value) : 1;
    transactionReceipt.to = res.returnValues.to.toLowerCase();
    transactionReceipt.from =
      "from" in res.returnValues
        ? res.returnValues.from.toLowerCase()
        : "0x000000000000000000000000";
    transactionReceipt.blockNumber = parseInt(res.returnValues.blockNumber);
    transactionReceipt.txId = res.transactionHash;
    return web3.utils.hexToAscii(error.cause.data);
  } finally {
    transactionReceipt.tokenId = parseInt(res.returnValues.tokenId);
    transactionReceipt.quantity =
      "value" in res.returnValues ? parseInt(res.returnValues.value) : 1;
    transactionReceipt.to = res.returnValues.to.toLowerCase();
    transactionReceipt.from =
      "from" in res.returnValues
        ? res.returnValues.from.toLowerCase()
        : "0x000000000000000000000000";
    transactionReceipt.blockNumber = parseInt(res.returnValues.blockNumber);
    transactionReceipt.txId = res.transactionHash;
    await transactionReceipt.save();
    return res.transactionHash;
  }
};

const sellNFTCallout = async (args) => {
  let transactionReceipt = new Transactions();
  let nftReceipt = await NFTDetails.findOne({ tokenId: args.tokenId });
  let res;
  try {
    RNFTContract = await getContractObj("RNFT");

    await RNFTContract.methods
      .sellNFT(args.tokenId)
      .send({ from: args.ownerAddress, gas: 1000000 })
      .on("receipt", async (receipt) => {
        res = receipt.events.TransferSingle;
        transactionReceipt.tokenId = parseInt(res.returnValues.id);
        transactionReceipt.quantity = parseInt(res.returnValues.value);
        transactionReceipt.to = res.returnValues.to.toLowerCase();
        transactionReceipt.from = res.returnValues.from.toLowerCase();
        transactionReceipt.blockNumber = parseInt(res.blockNumber);
        transactionReceipt.txId = res.transactionHash;

        if (res["returnValues"]["2"]) {
          nftReceipt.forSale = true;

          await nftReceipt.save();
        }
      });
  } catch (error) {
    console.log(error.cause);
    transactionReceipt.error = web3.utils.hexToAscii(error.cause.data);
    return transactionReceipt.error;
  } finally {
    await transactionReceipt.save();
    return transactionReceipt.error
      ? transactionReceipt.error
      : res.transactionHash;
  }
};

const fractionNFTCallout = async (args) => {
  let transactionReceipt = new Transactions();
  let res;
  try {
    RNFTContract = await getContractObj("RNFT");
    await RNFTContract.methods
      .createFractions(args.tokenId, args.noOfFractions)
      .send({ from: args.ownerAddress, gas: 1000000 })
      .on("receipt", async (receipt) => {
        res = receipt.events.NFTFractioned;
        transactionReceipt.tokenId = parseInt(res.returnValues.tokenId);
        transactionReceipt.quantity = parseInt(res.returnValues.noOfFractions);
        transactionReceipt.to = res.returnValues.to.toLowerCase();
        transactionReceipt.from =
          "from" in res.returnValues
            ? res.returnValues.from.toLowerCase()
            : "0x00000000000000000000000000000000";
        transactionReceipt.blockNumber = parseInt(res.blockNumber);
        transactionReceipt.txId = res.transactionHash;

        for (const id of res.returnValues.fractionId) {
          let fractionsReceipt = new FractionsDetails();
          fractionsReceipt.fractionId = parseInt(id);
          fractionsReceipt.tokenId = parseInt(res.returnValues.tokenId);
          fractionsReceipt.owner = res.returnValues.to.toLowerCase();
          fractionsReceipt.price =
            Number(res.returnValues.pricePerFraction) /
            Number(Math.pow(10, 18));
          fractionsReceipt.txId = res.transactionHash;
          fractionsReceipt.blockNumber = parseInt(res.blockNumber);
          await fractionsReceipt.save();
        }
      });
  } catch (error) {
    console.log(error.cause);
    transactionReceipt.error = web3.utils.hexToAscii(error.cause.data);
  } finally {
    await transactionReceipt.save();
    return transactionReceipt.error
      ? transactionReceipt.error
      : transactionReceipt.txId;
  }
};

const sellFractionsCallout = async (args) => {
  let transactionReceipt = new Transactions();
  let res;
  try {
    RNFTContract = await getContractObj("RNFT");
    Escrow1155Contract = await getContractObj("Escrow1155");

    await RNFTContract.methods
      .sellFractions(args.tokenId, args.noOfFractions)
      .send({ from: args.ownerAddress, gas: 1000000 })
      .on("receipt", async (receipt) => {
        res = receipt.events.TransferSingle;

        let escrow1155Events = await Escrow1155Contract.getPastEvents(
          "allEvents"
        );
        if (escrow1155Events.length > 0) {
          escrow1155Events.forEach(async (event) => {
            // Update Fractions Details
            let fractionsData = await FractionsDetails.findOne({
              fractionId: parseInt(event.returnValues[1]),
            });

            fractionsData.forSale = true;
            fractionsData.owner = res.returnValues.to.toLowerCase();

            // Update Transaction Details
            transactionReceipt = new Transactions();
            transactionReceipt.tokenId = parseInt(event.returnValues[1]);
            transactionReceipt.quantity = parseInt(2);
            transactionReceipt.to = res.returnValues.to.toLowerCase();
            transactionReceipt.from =
              "from" in res.returnValues
                ? res.returnValues.from.toLowerCase()
                : "0x00000000000000000000000000000000";
            transactionReceipt.blockNumber = parseInt(event.blockNumber);
            transactionReceipt.txId = event.transactionHash;
            transactionReceipt.txNo = parseInt(event.returnValues[3]);
            transactionReceipt.parentTokenId = parseInt(event.returnValues[0]);

            await transactionReceipt.save();
            await fractionsData.save();
          });
        }
      });
  } catch (error) {
    console.log(error.cause);
    transactionReceipt.error = web3.utils.hexToAscii(error.cause.data);
    console.log(error);
  } finally {
    await transactionReceipt.save();
    return transactionReceipt.error
      ? transactionReceipt.error
      : transactionReceipt.txId;
  }
};

const buyTokensCallout = async (args) => {
  let transactionReceipt = new Transactions();
  let nftReceipt = new NFTDetails();
  let fractionsReceipt = new FractionsDetails();
  let res;
  try {
    RNFTContract = await getContractObj("RNFT");
    Escrow1155Contract = await getContractObj("Escrow1155");
    // Fetch token / fractions details
    let data =
      args.fractionId != 0
        ? await Transactions.findOne({
            parentTokenId: args.tokenId,
            tokenId: args.fractionId,
          })
        : await Transactions.findOne({
            tokenId: args.tokenId,
          });

    console.log("DATA ====> ", data);

    await Escrow1155Contract.methods
      .depositETH(data.txNo)
      .send({
        from: args.ownerAddress,
        gas: 1000000,
        value: Math.pow(10, 18) * args.price + 1000000,
      })
      .on("receipt", async (receipt) => {
        let escrow1155Events = await Escrow1155Contract.getPastEvents(
          "allEvents"
        );
        if (escrow1155Events.length > 0) {
          escrow1155Events.forEach(async (event) => {
            transactionReceipt = new Transactions();
            transactionReceipt.tokenId = parseInt(event.returnValues[1]);
            transactionReceipt.quantity = parseInt(1);
            transactionReceipt.to = receipt.to.toLowerCase();
            transactionReceipt.from =
              "from" in receipt
                ? receipt.from.toLowerCase()
                : "0x00000000000000000000000000000000";
            transactionReceipt.blockNumber = parseInt(event.blockNumber);
            transactionReceipt.parentTokenId = parseInt(event.returnValues[0]);
            transactionReceipt.txId = event.transactionHash;
            await transactionReceipt.save();
          });
        }
      });
  } catch (error) {
    console.log(error.cause);
    transactionReceipt.error = web3.utils.hexToAscii(error.cause.data);
    console.log(error);
  } finally {
  }
};

const intitateTransferCallout = async (args) => {
  let transactionReceipt = new Transactions();
  let nftReceipt = new NFTDetails();
  let fractionsReceipt = new FractionsDetails();
  let res;
  try {
    RNFTContract = await getContractObj("RNFT");
    Escrow1155Contract = await getContractObj("Escrow1155");
    // Fetch token / fractions details
    let data =
      args.fractionId != 0
        ? await Transactions.findOne({
            parentTokenId: args.tokenId,
            tokenId: args.fractionId,
          })
        : await Transactions.findOne({
            tokenId: args.tokenId,
          });

    console.log("DATA ====> ", data);

    await Escrow1155Contract.methods
      .initiateDelivery(data.txNo)
      .send({
        from: args.ownerAddress,
        gas: 1000000,
      })
      .on("receipt", async (receipt) => {
        let escrow1155Events = await Escrow1155Contract.getPastEvents(
          "allEvents"
        );
        console.log("RECEIPT ====> ", receipt);
        if (escrow1155Events.length > 0) {
          escrow1155Events.forEach(async (event) => {
            console.log("Event ====> ", event);
            // transactionReceipt = new Transactions();
            // transactionReceipt.tokenId = parseInt(event.returnValues[1]);
            // transactionReceipt.quantity = parseInt(1);
            // transactionReceipt.to = receipt.to.toLowerCase();
            // transactionReceipt.from =
            //   "from" in receipt
            //     ? receipt.from.toLowerCase()
            //     : "0x00000000000000000000000000000000";
            // transactionReceipt.blockNumber = parseInt(event.blockNumber);
            // transactionReceipt.parentTokenId = parseInt(event.returnValues[0]);
            // transactionReceipt.txId = event.transactionHash;
            // await transactionReceipt.save();
          });
        }
      });
  } catch (error) {
    console.log(error.cause);
    transactionReceipt.error = web3.utils.hexToAscii(error.cause.data);
    console.log(error);
  } finally {
  }
};

module.exports = {
  mintNFTCallout,
  sellNFTCallout,
  fractionNFTCallout,
  sellFractionsCallout,
  buyTokensCallout,
  // intitateTransferCallout,
};
