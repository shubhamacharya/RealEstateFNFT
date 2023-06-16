const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe('RNFT Contract', () => {
    var owner, S1, B1, B2, B3, rnftContract, RNFT, Escrow, escrowContract

    before(async () => {
        [owner, S1, B1, B2, B3] = await ethers.getSigners();
        RNFT = await ethers.getContractFactory('RNFT');
        rnftContract = await RNFT.deploy();
        Escrow = await ethers.getContractFactory('Escrow1155');
        escrowContract = await Escrow.deploy(rnftContract.target);
    });

    it('should mint new token', async () => {
        expect(await rnftContract.connect(owner).createNFT(S1, 10)).to.emit(rnftContract, "NFTCreated");
    });

    it('should return NFT owned by user', async () => {
        expect(await rnftContract.getNFTOwned(S1)).to.include(BigInt(0));
    });

    it('should create fractions of property', async () => {
        expect(await rnftContract.connect(S1).createFractions(S1, 0, 10)).to.emit(rnftContract, "NFTFractioned");
    });

    it('should approve escrow as a spender', async () => {
        expect(await rnftContract.connect(S1).setApprovalForAll(escrowContract.target, true));
    });

    describe('Escrow Contract', async () => {
        it('should deposite token to escrow', async() => {
            await escrowContract.connect(S1).depositToken(0, 5);
        });
    });

})