// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Escrow1155 is IERC1155Receiver, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter public _transactionIdCounter;
    struct Transaction {
        uint256 id;
        address payable seller;
        address payable buyer;
        uint256 tokenID;
        uint256 parentTokenId;
        uint256 amount;
        uint256 noOfTokens;
        Status transactionStatus;
        bool buyerCancel;
        bool sellerCancel;
    }

    enum Status {
        DEPOSITE,
        PAYMENT,
        DELIVERY,
        CONFIRMED,
        DISPUTTED,
        REFUND,
        WITHDRAWED,
        CLOSED
    }

    mapping(uint256 => Transaction) public transactionArray;

    address public ERC1155Address;
    event TokenDepoisted(uint256, uint256, uint256, uint256);
    event EtherDeposited(uint256, uint256, address);

    constructor(address _ERC1155Address) {
        ERC1155Address = _ERC1155Address;
        _transactionIdCounter.increment();
    }

    function depositToken(
        address tokenOwner,
        uint256 _tokenID,
        uint256 _parentTokenId,
        uint256 _amount,
        uint256 _noOfTokens
    ) public payable {
        Transaction memory txn;
        txn.id = _transactionIdCounter.current();
        txn.tokenID = _tokenID;
        txn.amount = _amount;
        txn.noOfTokens = _noOfTokens;
        txn.seller = payable(tokenOwner);
        txn.transactionStatus = Status.DEPOSITE;
        txn.parentTokenId = _parentTokenId;

        ERC1155(ERC1155Address).safeTransferFrom(
            tokenOwner,
            address(this),
            txn.tokenID,
            txn.noOfTokens,
            ""
        );
        transactionArray[txn.id] = txn;
        _transactionIdCounter.increment();

        emit TokenDepoisted(_parentTokenId, _tokenID, _amount, txn.id);
    }

    function depositETH(
        uint256 _transactionId
    ) public payable currentStatus(Status.DEPOSITE, _transactionId) {
        Transaction memory txn = transactionArray[_transactionId];
        require(
            txn.amount >= msg.value,
            "Amount must to equal to selling price of the property."
        );
        txn.buyer = payable(msg.sender);
        txn.transactionStatus = Status.PAYMENT;
        transactionArray[_transactionId] = txn;
        
        emit EtherDeposited(txn.parentTokenId, txn.tokenID, txn.buyer);
    }

    function cancelTransaction(
        uint256 _transactionId
    ) public payable BuyerOrSeller(_transactionId) {
        Transaction memory txn = transactionArray[_transactionId];
        if (msg.sender == txn.seller) {
            txn.sellerCancel = true;
            ERC1155(ERC1155Address).safeTransferFrom(
                address(this),
                address(msg.sender),
                txn.tokenID,
                txn.noOfTokens,
                ""
            );
            txn.transactionStatus = Status.WITHDRAWED;
        } else {
            txn.buyerCancel = true;
        }

        if (txn.buyer != address(0x0)) {
            if (txn.sellerCancel && txn.buyerCancel) {
                ERC1155(ERC1155Address).safeTransferFrom(
                    address(this),
                    txn.seller,
                    txn.tokenID,
                    txn.noOfTokens,
                    ""
                );
                txn.buyer.transfer(txn.amount);
                txn.transactionStatus = Status.CLOSED;
                txn.buyer = payable(address(0x0));
                txn.buyerCancel = false;
                txn.sellerCancel = false;
            } else {
                txn.transactionStatus = Status.DISPUTTED;
            }
        }
        transactionArray[_transactionId] = txn;
    }

    function refundBuyer(
        uint256 _transactionId
    ) public onlySeller(_transactionId) {
        Transaction memory txn = transactionArray[_transactionId];
        payable(txn.seller).transfer(txn.amount);

        //require(success, "Failed to refund to buyer.");
        txn.transactionStatus = Status.REFUND;
        transactionArray[_transactionId] = txn;
    }

    function resale(
        uint256 _transactionId
    )
        public
        onlySeller(_transactionId)
        
    {
        require(transactionArray[_transactionId].transactionStatus == Status.WITHDRAWED || transactionArray[_transactionId].transactionStatus == Status.DISPUTTED);
        transactionArray[_transactionId].buyerCancel = false;
        transactionArray[_transactionId].sellerCancel = false;
        transactionArray[_transactionId].transactionStatus = Status.DEPOSITE;
    }

    function initiateDelivery(
        uint256 _transactionId
    )
        public
        currentStatus(Status.PAYMENT, _transactionId)
        onlySeller(_transactionId)
        noDispute(_transactionId)
    {
        transactionArray[_transactionId].transactionStatus = Status.DELIVERY;
    }

    function confirmDelivery(
        uint256 _transactionId
    )
        public
        currentStatus(Status.DELIVERY, _transactionId)
        onlyBuyer(_transactionId)
    {
        Transaction memory txn = transactionArray[_transactionId];
        ERC1155(ERC1155Address).safeTransferFrom(
            address(this),
            txn.buyer,
            txn.tokenID,
            txn.noOfTokens,
            ""
        );
        payable(txn.seller).transfer(txn.amount);
        // require(success, "Failed to transfer amount to seller.");
        txn.transactionStatus = Status.CONFIRMED;
        transactionArray[_transactionId] = txn;
    }

    function getBalance() public view returns (uint256 balance) {
        return address(this).balance;
    }

    function getTransactionStatus(
        uint256 _transactionId
    ) public view returns (string memory) {
        Status temp = transactionArray[_transactionId].transactionStatus;
        if (temp == Status.DEPOSITE) return "Tokens Deposited";
        else if (temp == Status.WITHDRAWED) return "Cancelled by seller";
        else if (temp == Status.PAYMENT) return "ETH Deposited";
        else if (temp == Status.DELIVERY) return "Delivery Initiated";
        else if (temp == Status.REFUND) return "Cancelled by buyer";
        else if (temp == Status.CONFIRMED) return "Delivery Success";
        else return "In Dispute";
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external pure returns (bytes4) {
        return
            bytes4(
                keccak256(
                    "onERC1155Received(address,address,uint256,uint256,bytes)"
                )
            );
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) external pure returns (bool) {
        return true;
    }

    modifier condition(bool _condition) {
        require(_condition);
        _;
    }

    modifier onlySeller(uint256 _transactionId) {
        require(
            msg.sender == transactionArray[_transactionId].seller,
            "Caller address is not the seller."
        );
        _;
    }

    modifier onlyBuyer(uint256 _transactionId) {
        require(
            msg.sender == transactionArray[_transactionId].buyer,
            "Caller address is not the buyer."
        );
        _;
    }

    modifier noDispute(uint256 _transactionId) {
        require(
            transactionArray[_transactionId].buyerCancel == false &&
                transactionArray[_transactionId].sellerCancel == false,
            "Either buyer or seller cancelled deal."
        );
        _;
    }

    modifier BuyerOrSeller(uint256 _transactionId) {
        require(
            msg.sender == transactionArray[_transactionId].buyer ||
                msg.sender == transactionArray[_transactionId].seller,
            "Caller is not buyer or seller."
        );
        _;
    }

    modifier currentStatus(Status _state, uint256 _transactionId) {
        require(transactionArray[_transactionId].transactionStatus == _state);
        _;
    }
}