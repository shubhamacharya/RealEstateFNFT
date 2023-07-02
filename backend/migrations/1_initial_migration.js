const RNFT = artifacts.require("RNFT");
const Escrow1155 = artifacts.require("Escrow1155");

module.exports = async function (deployer) {
  deployer.deploy(RNFT).then(() => {
    return deployer.deploy(Escrow1155, RNFT.address)
  });
};
