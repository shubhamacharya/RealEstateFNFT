// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract RNFT is ERC1155, ERC1155Burnable, ERC1155Supply, IERC1155Receiver {
    address admin;
    address escrowContract;

    constructor() ERC1155("") {
        admin = msg.sender;
        _tokenIdCounter.increment();
        _fractionIdCounter.increment();
    }

    struct Token{
        uint256 id;
        address owner;
        uint256 price;
        uint256 fractionId;
        uint256 totalFractions;
        uint256 fractionsOwned;
        address[] owners;
        bool forSale;
    }

    using Counters for Counters.Counter;
    Counters.Counter public _tokenIdCounter;
    Counters.Counter public _fractionIdCounter;

    mapping(uint256 => Token) public tokenIdVsToken;

    event NFTCreated(address to, uint256 tokenId, uint256 price);
    event NFTFractioned(address to, uint256 tokenId, uint256 noOfFractions);
    event FractionsForSale(uint256 tokenId, uint256 noOfFractions);
    event NFTForSale(uint256 tokenId, bool isForSale);

    function setURI(string memory newuri) public onlyAdmin {
        _setURI(newuri);
    }

    function createNFT(address to, uint256 price) external onlyAdmin {
        Token memory tempToken;
        uint256 _tokenId = _tokenIdCounter.current();
        _mint(to, _tokenId, 1, "");
        tempToken.price = price;
        tempToken.id = _tokenId;
        tempToken.owner = to;
        tokenIdVsToken[_tokenId] = tempToken;
        emit NFTCreated(to, _tokenId, price);
        _tokenIdCounter.increment();
    }

    /* function getNFTOwned(address ownerAddress) external view returns (uint256[] memory) {
        return addressVsNFTOwned[ownerAddress];
    } */

    function createFractions( uint256 _tokenId, uint256 _noOfFractions) external onlyOwner(_tokenId) {
        require(exists(_tokenId), "Invalid Token Id");
        Token memory tempToken = tokenIdVsToken[_tokenId];
        uint256 fractionId = _fractionIdCounter.current()*10 + tempToken.id;
        _mint(tempToken.owner, fractionId, _noOfFractions, "");
        safeTransferFrom(tempToken.owner,address(this),tempToken.id,1,"");
        tempToken.fractionsOwned = _noOfFractions;
        tempToken.totalFractions = _noOfFractions;
        tempToken.fractionId = fractionId;
        tempToken.owner = address(this);
        tokenIdVsToken[_tokenId] = tempToken;
        _fractionIdCounter.increment();
        emit NFTFractioned(tempToken.owner, _tokenId, _noOfFractions);
    }

    function claimNFT(uint256 _tokenId) external payable {
        Token memory tempToken = tokenIdVsToken[_tokenId];
        require(balanceOf(address(this),tempToken.fractionId) == totalSupply(tempToken.fractionId));
        safeTransferFrom(address(this), msg.sender, _tokenId, 1, "");
        burn(address(this), tempToken.fractionId, tempToken.totalFractions);
        tempToken.fractionId = 0;
        tempToken.totalFractions = 0;
        tempToken.fractionsOwned = 0;
        tempToken.owner = msg.sender;
        tokenIdVsToken[_tokenId] = tempToken;
    }

    function depositeFractions(uint256 _tokenId) external {
        Token memory tempToken = tokenIdVsToken[_tokenId];
        uint256 amount = balanceOf(msg.sender, tempToken.fractionId);
        safeTransferFrom(msg.sender, address(this), tempToken.fractionId, amount, "");
    }

    /*function addFractionsForSale( uint256 _tokenId, uint256 noOfTokens) external onlyOwner(_tokenId) {
        require( balanceOf(msg.sender, _tokenId) > (nftIdVsFractionsForSale[_tokenId] + noOfTokens), "Not enough tokens to add for sale");
        nftIdVsFractionsForSale[_tokenId] += noOfTokens;
        emit FractionsForSale(_tokenId, noOfTokens);
    }

    function addNFTForSale(uint256 _tokenId) external onlyOwner(_tokenId) {
        require(balanceOf(msg.sender, _tokenId) == totalSupply(_tokenId), "Not owner of the all fractions");
        if (totalSupply(_tokenId) > 1) {
            _burn(msg.sender, _tokenId, balanceOf(msg.sender, _tokenId) - 1);
        }
        nftIdVsIsForSale[_tokenId] = true;
        emit NFTForSale(_tokenId, true);
    }*/

    function setEscrowAddress(address _escrowContractAddress) external {
        escrowContract = _escrowContractAddress;
    }

    function onERC1155Received( address operator, address from, uint256 id, uint256 value, bytes calldata data) external pure override returns (bytes4) {
        return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
    }

    function onERC1155BatchReceived( address operator, address from, uint256[] calldata ids, uint256[] calldata values, bytes calldata data) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function setApprovalForAll(address owner, address operator, bool approved) public  virtual {
        _setApprovalForAll(owner, operator, approved);
        emit ApprovalForAll(owner, operator, approved);
    }


    function _beforeTokenTransfer( address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) internal override(ERC1155, ERC1155Supply) 
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "ERC1155 : Caller is not Admin");
        _;
    }

    modifier onlyOwner(uint256 _tokenId) {
        require(
            balanceOf(msg.sender, _tokenId) > 0,
            "ERC1155 : Caller is not owner"
        );
        _;
    }
}
