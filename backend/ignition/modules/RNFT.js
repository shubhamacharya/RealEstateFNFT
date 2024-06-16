const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("RNFTModule", (m) => {

  const RNFTContract = m.contract("RNFT");

  const Escrow1155Contract = m.contract("Escrow1155", [RNFTContract], {
    after: [RNFTContract], // `receiver` is deployed after `token`
  });


  return { RNFTContract, Escrow1155Contract };
});

