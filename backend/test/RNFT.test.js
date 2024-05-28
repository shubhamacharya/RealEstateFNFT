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
        await rnftContract.connect(owner).setEscrow(escrowContract.target);
    });

    it('should mint new token', async () => {
        // NFT Id 1
        expect(await rnftContract.connect(S1).createNFT(5)).to.emit(rnftContract, "NFTCreated");
        // NFT Id 2
        expect(await rnftContract.connect(S1).createNFT(10)).to.emit(rnftContract, "NFTCreated");
    });

    it('should create fractions of property', async () => {
        //Fraction Id 11
        expect(await rnftContract.connect(S1).createFractions(1, 5)).to.emit(rnftContract, "NFTFractioned");
        //Fraction Id 22
        expect(await rnftContract.connect(S1).createFractions(2, 5)).to.emit(rnftContract, "NFTFractioned");
    });

    it('should match the number of fractions using tokenIds', async () => {
        // const res = (await rnftContract.connect(S1).getTokenIdVsFractionIds(1)).length
        // console.log(res);
        expect((await rnftContract.connect(S1).getTokenIdVsFractionIds(1)).length).to.be.equals(5)
        expect((await rnftContract.connect(S1).getTokenIdVsFractionIds(2)).length).to.be.equals(5)
        
    })

    it('should claim NFT from smart contract', async () => {
        // NFT ID 2
        await rnftContract.connect(S1).claimNFT(2);
        expect(await rnftContract.exists(22)).to.be.equals(false);
    });

    it('should add NFT for sell', async () => {
        // NFT Id 2 
        // Transaction Id 1
        await rnftContract.connect(S1).sellNFT(2);
        expect(await rnftContract.balanceOf(escrowContract.target, 2)).to.be.equals(1);
    });

    it('should cancel NFT sell from seller side', async () => {
        let txn = await escrowContract.transactionArray(0);
        await escrowContract.connect(S1).cancelTransaction(0);
        expect(await escrowContract.getTransactionStatus(0)).to.be.equals("Cancelled by seller");
        // txn = await escrowContract.transactionArray(2);
        expect(await rnftContract.balanceOf(escrowContract.target, 2)).to.be.equal(0);
        expect(await rnftContract.balanceOf(S1.address, 2)).to.be.equal(1);
    });

    it('should add fractions for sell', async () => {
        // Transaction Id 2
        await rnftContract.connect(S1).sellFractions(1, 2);
        // expect(await rnftContract.connect(S1).balanceOf(S1, 2)).to.be.equal(3);
        expect(Number((await escrowContract.transactionArray(1))[3])).to.be.equals(101)
        expect(await escrowContract.getTransactionStatus(1)).to.be.equals("Tokens Deposited");
        expect(Number((await escrowContract.transactionArray(2))[3])).to.be.equals(102)
        expect(await escrowContract.getTransactionStatus(2)).to.be.equals("Tokens Deposited");
    });

    it('should cancel fractions sell from seller side', async () => {
        let txn = await escrowContract.transactionArray(2);
        await escrowContract.connect(S1).cancelTransaction(2);
        expect(await escrowContract.getTransactionStatus(2)).to.be.equals("Cancelled by seller");
        txn = await escrowContract.transactionArray(2);
        expect(await rnftContract.balanceOf(escrowContract.target, 102)).to.be.equal(0);
        expect(await rnftContract.balanceOf(S1.address, 102)).to.be.equal(1);
    });

    it('should be able to resell from seller side', async () => {
        await escrowContract.connect(S1).resale(2);
        let txn = await escrowContract.transactionArray(2);
        console.log(txn);
        expect(await escrowContract.getTransactionStatus(2)).to.be.equals("Tokens Deposited");
    });

    // it('should check balance of fractions added for sale', async () => {
    //     let txn = await escrowContract.transactionArray(3);
    //     expect(parseInt(txn[5])).to.be.equals(4);
    // });

    it('should deposite ethers to buy fractions added for sale', async () => {
        let txn = await escrowContract.transactionArray(1);
        await escrowContract.connect(B1).depositETH(parseInt(txn[0]), { from: B1.address, value: ethers.parseUnits(parseInt(txn[4]).toString(), "ether") });
        txn = await escrowContract.transactionArray(1);
        expect(txn[2]).to.be.equals(B1.address);
        expect(await escrowContract.getTransactionStatus(1)).to.be.equals("ETH Deposited");
    });

    it('should cancel fractions sell from buyer side', async () => {
        await escrowContract.connect(B1).cancelTransaction(1);
        expect(await escrowContract.getTransactionStatus(1)).to.be.equals("In Dispute");
    });

    it('should be able to refund buyer from seller side', async () => {
        await escrowContract.connect(S1).refundBuyer(1);
        expect(await escrowContract.getTransactionStatus(1)).to.be.equals("Cancelled by buyer");
    });

    it('should be able to resell from seller side', async () => {
        await escrowContract.connect(S1).resale(1);
        expect(await escrowContract.getTransactionStatus(1)).to.be.equals("Tokens Deposited");
    });

    it('should deposite ethers to buy fractions added for sale', async () => {
        let txn = await escrowContract.transactionArray(1);
        await escrowContract.connect(B2).depositETH(parseInt(txn[0]), { from: B2.address, value: ethers.parseUnits(parseInt(txn[4]).toString(), "ether") });
        txn = await escrowContract.transactionArray(1);
        expect(txn[2]).to.be.equals(B2.address);
        expect(await escrowContract.getTransactionStatus(1)).to.be.equals("ETH Deposited");
    });

    it('should initiate the delivery of the tokens', async () => {
        await escrowContract.connect(S1).initiateDelivery(1);
        txn = await escrowContract.transactionArray(1);
        expect(await escrowContract.getTransactionStatus(1)).to.be.equals("Delivery Initiated");
    });

    it('should confirm the delivary from buyer side', async () => {
        await escrowContract.connect(B2).confirmDelivery(1);
        expect(await escrowContract.getTransactionStatus(1)).to.be.equals("Delivery Success");
    });

    it('should check the balance of contract', async () => {
        expect(parseInt(await escrowContract.getBalance())).to.be.equals(0);
    });

    it('should deposite ethers to buy fractions added for sale', async () => {
        let txn = await escrowContract.transactionArray(2);
        await escrowContract.connect(B3).depositETH(parseInt(txn[0]), { from: B3.address, value: ethers.parseUnits(parseInt(txn[4]).toString(), "ether") });
        txn = await escrowContract.transactionArray(2);
        expect(txn[2]).to.be.equals(B3.address);
        expect(await escrowContract.getTransactionStatus(2)).to.be.equals("ETH Deposited");
    });

    it('should cancel fractions sell from buyer side', async () => {
        await escrowContract.connect(B3).cancelTransaction(2);
        expect(await escrowContract.getTransactionStatus(2)).to.be.equals("In Dispute");
    });

    it('should cancel fractions sell from seller side', async () => {
        await escrowContract.connect(S1).cancelTransaction(2);
        expect(await escrowContract.getTransactionStatus(2)).to.be.equals("CLOSED");
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