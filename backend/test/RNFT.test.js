const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('RNFT Contract', () => {
    var owner, S1, B1, B2, B3, rnftContract, RNFT, Escrow, escrowContract

    before(async () => {
        [owner, S1, B1, B2, B3] = await ethers.getSigners();
        RNFT = await ethers.getContractFactory('RNFT');
        rnftContract = await RNFT.deploy();
        Escrow = await ethers.getContractFactory('Escrow1155');
        escrowContract = await Escrow.deploy(rnftContract.target);
        await rnftContract.connect(owner).setEscrowAddress(escrowContract.target);
    });

    it('should mint new token', async () => {
        // NFT Id 1
        expect(await rnftContract.connect(owner).createNFT(S1, 100)).to.emit(rnftContract, "NFTCreated");
        // NFT Id 2
        expect(await rnftContract.connect(owner).createNFT(S1, 100)).to.emit(rnftContract, "NFTCreated");
    });

    it('should create fractions of property', async () => {
        //Fraction Id 11
        expect(await rnftContract.connect(S1).createFractions(1, 10)).to.emit(rnftContract, "NFTFractioned");
        //Fraction Id 22
        expect(await rnftContract.connect(S1).createFractions(2, 10)).to.emit(rnftContract, "NFTFractioned");
    });

    it('should return fractions to smart contract', async () => {
        // Fraction Id 22 
        await rnftContract.connect(S1).depositeFractions(2);
        expect(await rnftContract.balanceOf(rnftContract.target, 22)).to.be.equals(10);
    });

    it('should claim NFT from smart contract', async () => {
        // NFT ID 2
        await rnftContract.connect(S1).claimNFT(2);
        expect(await rnftContract.exists(22)).to.be.equals(false);
    });

    it('should add NFT for sell', async () => {
        // NFT Id 2 
        // Transaction Id 1
        await rnftContract.connect(S1).sellToken(2);
        expect(await rnftContract.balanceOf(escrowContract.target, 2)).to.be.equals(1);
    });

    it('should add fractions for sell', async () => {
        // Transaction Id 2
        await rnftContract.connect(S1).sellFractions(1, 4);
        expect(await rnftContract.connect(S1).balanceOf(S1, 11)).to.be.equal(6);
        expect(await escrowContract.getTransactionStatus(2)).to.be.equals("Tokens Deposited");
    });

    it('should cancel fractions sell from seller side', async () => {
        let txn = await escrowContract.transactionArray(2);
        await escrowContract.connect(S1).cancelTransaction(2);
        expect(await escrowContract.getTransactionStatus(2)).to.be.equals("Cancelled by seller");
        txn = await escrowContract.transactionArray(2);
        expect(await rnftContract.balanceOf(escrowContract.target, 11)).to.be.equal(0);
        expect(await rnftContract.balanceOf(S1.address, 11)).to.be.equal(10);
    });

    it('should re-add fractions for sell', async () => {
        await rnftContract.connect(S1).sellFractions(1, 4);
        expect(await rnftContract.connect(S1).balanceOf(S1, 11)).to.be.equal(6);
        // Transaction Id 3
        expect(await escrowContract.getTransactionStatus(3)).to.be.equals("Tokens Deposited");
    });

    it('should check balance of fractions added for sale', async () => {
        let txn = await escrowContract.transactionArray(3);
        expect(parseInt(txn[5])).to.be.equals(4);
    });

    it('should deposite ethers to buy fractions added for sale', async () => {
        let txn = await escrowContract.transactionArray(3);
        await escrowContract.connect(B1).depositETH(parseInt(txn[0]), { from: B1.address, value: ethers.parseUnits(parseInt(txn[4]).toString(), "ether") });
        txn = await escrowContract.transactionArray(3);
        expect(txn[2]).to.be.equals(B1.address);
        expect(await escrowContract.getTransactionStatus(3)).to.be.equals("ETH Deposited");
    });

    it('should cancel fractions sell from buyer side', async () => {
        await escrowContract.connect(B1).cancelTransaction(3);
        expect(await escrowContract.getTransactionStatus(3)).to.be.equals("In Dispute");
    });

    it('should be able to refund buyer from seller side', async () => {
        await escrowContract.connect(S1).refundBuyer(3);
        expect(await escrowContract.getTransactionStatus(3)).to.be.equals("Cancelled by buyer");
    });

    it('should be able to resell from seller side', async () => {
        await escrowContract.connect(S1).resale(3);
        expect(await escrowContract.getTransactionStatus(3)).to.be.equals("Tokens Deposited");
    });

    it('should deposite ethers to buy fractions added for sale', async () => {
        let txn = await escrowContract.transactionArray(3);
        await escrowContract.connect(B2).depositETH(parseInt(txn[0]), { from: B2.address, value: ethers.parseUnits(parseInt(txn[4]).toString(), "ether") });
        txn = await escrowContract.transactionArray(3);
        expect(txn[2]).to.be.equals(B2.address);
        expect(await escrowContract.getTransactionStatus(3)).to.be.equals("ETH Deposited");
    });

    it('should initiate the delivery of the tokens', async () => {
        await escrowContract.connect(S1).initiateDelivery(3);
        txn = await escrowContract.transactionArray(3);
        expect(await escrowContract.getTransactionStatus(3)).to.be.equals("Delivery Initiated");
    });

    it('should confirm the delivary from buyer side', async () => {
        await escrowContract.connect(B2).confirmDelivery(3);
        expect(await escrowContract.getTransactionStatus(3)).to.be.equals("Delivery Success");
    });

    it('should check the balance of contract', async () => {
        expect(parseInt(await escrowContract.getBalance())).to.be.equals(0);
    });

    /* it('should approve escrow as a spender', async () => {
        expect(await rnftContract.connect(S1).setApprovalForAll(escrowContract.target, true));
    }); */

    /* describe('Escrow Contract', async () => {
        it('should deposite token to escrow', async() => {
            await escrowContract.connect(S1).depositToken(0, 5);
        });
    }); */

})