// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract RNFT is ERC1155, ERC1155Burnable, ERC1155Supply {
    address admin;

    constructor() ERC1155("") {
        admin = msg.sender;
    }

    using Counters for Counters.Counter;
    Counters.Counter public _tokenIdCounter;

    mapping(address => uint256[]) private addressVsNFTOwned;
    mapping(uint256 => uint256) public nftIdVsPrice;
    mapping(uint256 => uint256) public nftIdVsFractionsForSale;
    mapping(uint256 => bool) public nftIdVsIsForSale;

    event NFTCreated(address to, uint256 tokenId, uint256 price);
    event NFTFractioned(address to, uint256 tokenId, uint256 noOfFractions);
    event FractionsForSale(uint256 tokenId, uint256 noOfFractions);
    event NFTForSale(uint256 tokenId, bool isForSale);

    function setURI(string memory newuri) public onlyAdmin {
        _setURI(newuri);
    }

    function createNFT(address to, uint256 price) external onlyAdmin {
        uint256 _tokenId = _tokenIdCounter.current();
        _mint(to, _tokenId, 1, "");
        nftIdVsPrice[_tokenId] = price;
        addressVsNFTOwned[to].push(_tokenId);
        emit NFTCreated(to, _tokenId, price);
        _tokenIdCounter.increment();
    }

    function getNFTOwned(address ownerAddress) external view returns (uint256[] memory) {
        return addressVsNFTOwned[ownerAddress];
    }

    function createFractions( address to, uint256 _tokenId, uint256 _noOfFractions) external onlyOwner(_tokenId) {
        require(exists(_tokenId), "Invalid Token Id");
        _mint(to, _tokenId, _noOfFractions, "");
        emit NFTFractioned(to, _tokenId, _noOfFractions);
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

    function setApprovalForAll(address operator, bool approved) public override {
        _setApprovalForAll(msg.sender, operator, approved);
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
