// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "hardhat/console.sol";

contract Escrow1155 is IERC1155Receiver {
    enum Status {
        newEscrow,
        tokenDeposited,
        cancelTokenTransfer,
        ethDeposited,
        canceledBeforeDelivery,
        deliveryInitiated,
        delivered
    }

    address payable public sellerAddress;
    address payable public buyerAddress;
    address public ERC1155Address;
    uint256 tokenID;
    uint256 amount;
    bool buyerCancel = false;
    bool sellerCancel = false;
    Status public tokenState;

    event TokenDepoisted(uint256, uint256);

    constructor(address _ERC1155Address) {
        tokenState = Status.newEscrow;
        ERC1155Address = _ERC1155Address;
    }

    function depositToken(uint256 _TokenID, uint256 _amount) public currentStatus(Status.newEscrow)
    {
        tokenID = _TokenID;
        amount = _amount;
        sellerAddress = payable(msg.sender);
        ERC1155(ERC1155Address).safeTransferFrom(msg.sender, address(this), tokenID, amount, "");
        tokenState = Status.tokenDeposited;
        emit TokenDepoisted(_TokenID, _amount);
    }

    function cancelAtNFT() public currentStatus(Status.tokenDeposited) onlySeller
    {
        ERC1155(ERC1155Address).safeTransferFrom(address(this), msg.sender, tokenID, amount, "");
        tokenState = Status.cancelTokenTransfer;
    }

    function cancelBeforeDelivery(bool _state) public payable currentStatus(Status.ethDeposited) BuyerOrSeller
    {
        if (msg.sender == sellerAddress) {
            sellerCancel = _state;
        } else {
            buyerCancel = _state;
        }

        if (sellerCancel == true && buyerCancel == true) {
            ERC1155(ERC1155Address).safeTransferFrom(
                address(this),
                sellerAddress,
                tokenID,
                amount,
                ""
            );
            buyerAddress.transfer(address(this).balance);
            tokenState = Status.canceledBeforeDelivery;
        }
    }

    function depositETH() public payable currentStatus(Status.tokenDeposited) {
        buyerAddress = payable(msg.sender);
        tokenState = Status.ethDeposited;
    }

    function initiateDelivery() public currentStatus(Status.ethDeposited) onlySeller noDispute
    {
        tokenState = Status.deliveryInitiated;
    }

    function confirmDelivery() public payable currentStatus(Status.deliveryInitiated) onlyBuyer
    {
        ERC1155(ERC1155Address).safeTransferFrom(
            address(this),
            buyerAddress,
            tokenID,
            amount,
            ""
        );
        payable(sellerAddress).transfer(address(this).balance);
        tokenState = Status.delivered;
    }

    function getBalance() public view returns (uint256 balance) {
        return address(this).balance;
    }

    function getTokenStatus() public view returns (string memory) {
        Status temp = tokenState;
        if (temp == Status.newEscrow) return "New Escrow";
        else if (temp == Status.tokenDeposited) return "NFT Deposited";
        else if (temp == Status.cancelTokenTransfer) return "Cancel NFT";
        else if (temp == Status.ethDeposited) return "ETH Deposited";
        else if (temp == Status.canceledBeforeDelivery)
            return "Cancelled Before Delivery";
        else if (temp == Status.deliveryInitiated) return "Delivery Initiated";
        else return "Delivered";
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

    modifier onlySeller() {
        require(
            msg.sender == sellerAddress,
            "Caller address is not the seller."
        );
        _;
    }

    modifier onlyBuyer() {
        require(msg.sender == buyerAddress, "Caller address is not the buyer.");
        _;
    }

    modifier noDispute() {
        require(
            buyerCancel == false && sellerCancel == false,
            "Either buyer or seller cancled deal."
        );
        _;
    }

    modifier BuyerOrSeller() {
        require(
            msg.sender == buyerAddress || msg.sender == sellerAddress,
            "Caller is not buyer or seller."
        );
        _;
    }

    modifier currentStatus(Status _state) {
        require(tokenState == _state);
        _;
    }
}
