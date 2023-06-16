const RNFT = artifacts.require("RNFT");
const Escrow1155 = artifacts.require("Escrow1155");

module.exports = async function (deployer) {
  deployer.deploy(RNFT);
  //deployer.deploy(Escrow1155);
};
