// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Escrow1155 is IERC1155Receiver, ReentrancyGuard {
    
    using Counters for Counters.Counter;
    Counters.Counter public _transactionIdCounter;

    struct Transaction {
        uint256 id;
        address payable seller;
        address payable buyer;
        uint256 tokenID;
        uint256 amount;
        uint256 noOfTokens;
        Status transactionStatus;
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

    Transaction[] transactionArray;

    address public ERC1155Address;
    bool buyerCancel = false;
    bool sellerCancel = false;

    mapping(address=>uint256) private buyerVsTransactionId;
    mapping(address=>uint256) private sellerVsTransactionId;

    event TokenDepoisted(uint256, uint256);

    constructor(address _ERC1155Address) {
        ERC1155Address = _ERC1155Address;
    }

    function depositToken(address sellerAddress, uint256 _tokenID, uint256 _amount, uint256 _noOfTokens) public {
        Transaction memory txn;

        txn.id = _transactionIdCounter.current();
        txn.tokenID = _tokenID;
        txn.amount = _amount;
        txn.noOfTokens = _noOfTokens;
        txn.seller = payable(sellerAddress);
        txn.buyer = payable(msg.sender);
        txn.transactionStatus = Status.DEPOSITE;

        ERC1155(ERC1155Address).safeTransferFrom(sellerAddress, address(this), txn.tokenID, txn.noOfTokens, "");
        transactionArray[txn.id] = txn;
        _transactionIdCounter.increment();
        
        emit TokenDepoisted(_tokenID, _amount);
    }

    function cancelBeforePayment(uint256 _transactionId) public currentStatus(Status.DEPOSITE, _transactionId) onlySeller(_transactionId)
    {
        Transaction memory txn = transactionArray[_transactionId];
        ERC1155(ERC1155Address).safeTransferFrom(address(this), msg.sender, txn.tokenID, txn.noOfTokens, "");
        sellerCancel = true;
        txn.transactionStatus = Status.WITHDRAWED;
    }

    function depositETH(uint256 _transactionId) public payable currentStatus(Status.DEPOSITE, _transactionId) {
        Transaction memory txn = transactionArray[_transactionId];
        require(txn.amount == msg.value, "Amount must to equal to selling price of the property.");
        txn.buyer = payable(msg.sender);
        txn.transactionStatus = Status.PAYMENT;
    }

    function cancelBeforeDelivery(uint256 _transactionId) public payable currentStatus(Status.PAYMENT,_transactionId) BuyerOrSeller(_transactionId)
    {
        Transaction memory txn = transactionArray[_transactionId];
        if (msg.sender == txn.seller) {
            sellerCancel = true;
            txn.transactionStatus = Status.WITHDRAWED;
        } else {
            buyerCancel = true;
            txn.transactionStatus = Status.REFUND;
        }

        if (sellerCancel == true && buyerCancel == true) {
            ERC1155(ERC1155Address).safeTransferFrom(
                address(this),
                txn.seller,
                txn.tokenID,
                txn.noOfTokens,
                ""
            );
            txn.buyer.transfer(txn.amount);
            txn.transactionStatus = Status.CLOSED;
        }
        else{
            txn.transactionStatus = Status.DISPUTTED;
        }
    }

    function initiateDelivery(uint256 _transactionId) public currentStatus(Status.PAYMENT, _transactionId) onlySeller(_transactionId) noDispute(_transactionId)
    {
        transactionArray[_transactionId].transactionStatus = Status.DELIVERY;
    }

    function confirmDelivery(uint256 _transactionId) public payable currentStatus(Status.DELIVERY, _transactionId) onlyBuyer(_transactionId)
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
        txn.transactionStatus = Status.CONFIRMED;
    }

    function getBalance() public view returns (uint256 balance) {
        return address(this).balance;
    }

    function getTransactionStatus(uint256 _transactionId) public view returns (string memory) {

        Status temp = transactionArray[_transactionId].transactionStatus;
        if (temp == Status.DEPOSITE) return "Tokens Deposited";
        else if (temp == Status.WITHDRAWED) return "Cancelled by seller";
        else if (temp == Status.PAYMENT) return "ETH Deposited";
        else if (temp == Status.DELIVERY) return "Delivery Initiated";
        else if (temp == Status.REFUND) return "Cancelled by buyer";
        else if (temp == Status.CONFIRMED) return "Delivery Success";
        else return "In Dispute";
    }

    function onERC1155Received( address operator, address from, uint256 id, uint256 value, bytes calldata data) external pure override returns (bytes4) {
        return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
    }

    function onERC1155BatchReceived( address operator, address from, uint256[] calldata ids, uint256[] calldata values, bytes calldata data) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) external view returns (bool)
    {
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
        require(msg.sender == transactionArray[_transactionId].buyer, "Caller address is not the buyer.");
        _;
    }

    modifier noDispute(uint256 _transactionId) {
        require(
            buyerCancel == false && sellerCancel == false,
            "Either buyer or seller cancelled deal."
        );
        _;
    }

    modifier BuyerOrSeller(uint256 _transactionId) {
        require(
            msg.sender == transactionArray[_transactionId].buyer || msg.sender == transactionArray[_transactionId].seller,
            "Caller is not buyer or seller."
        );
        _;
    }

    modifier currentStatus(Status _state,uint256 _transactionId) {
        require(transactionArray[_transactionId].transactionStatus == _state);
        _;
    }
}
