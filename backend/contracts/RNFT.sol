// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "contracts/Escrow1155.sol";

contract RNFT is ERC1155Supply, ERC1155Receiver, ERC1155Burnable {
    address public admin;
    address public escrowContract;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _fractionIdCounter;

    constructor() ERC1155("") {
        admin = msg.sender;
        _tokenIdCounter.increment();
        _fractionIdCounter.increment();
    }

    struct Token {
        uint256 tokenId;
        address owner;
        bool forSale;
        uint256 price;
        uint256 totalFractions;
    }

    struct Fractions {
        uint256 fractionId;
        uint256 tokenId;
        address owner;
        uint256 price;
        bool forSale;
    }

    mapping(uint256 => Token) public tokenIdVsToken;
    mapping(uint256 => uint256[]) private tokenIdVsFractionIds;
    mapping(uint256 => Fractions) public fractionIdVsFraction;
    mapping(uint256 => address) public _tokenApprovals;

    event NFTCreated(address to, uint256 indexed tokenId, uint256 price);
    event NFTFractioned(
        address to,
        uint256 indexed tokenId,
        uint256[] fractionId,
        uint256 pricePerFraction,
        uint256 noOfFractions
    );

    event FractionsForSale(uint256 indexed tokenId, uint256 noOfFractions);
    event NFTForSale(uint256 indexed tokenId, bool isForSale);

    function setURI(string memory newuri) public onlyAdmin {
        _setURI(newuri);
    }

    function setEscrow(address _escrowAddress) public onlyAdmin {
        escrowContract = _escrowAddress;
    }

    function createNFT(uint256 price) external {
        Token memory token;
        token.tokenId = _tokenIdCounter.current();
        token.owner = msg.sender;
        token.forSale = false;
        token.price = price;
        tokenIdVsToken[token.tokenId] = token;
        _mint(token.owner, token.tokenId, 1, "");
        _tokenIdCounter.increment();
        emit NFTCreated(msg.sender, token.tokenId, price);
    }

    function createFractions(uint256 _tokenId, uint256 _noOfFractions)
        external
        onlyOwner(_tokenId)
    {
        require(exists(_tokenId), "Invalid Token Id");
        Token storage tempToken = tokenIdVsToken[_tokenId];
        for (uint256 index = 1; index <= _noOfFractions; index++) {
            Fractions memory tempFractions;
            tempFractions.fractionId =
                (tempToken.tokenId * 100) +
                _fractionIdCounter.current();
            tempFractions.price = tempToken.price / _noOfFractions;
            tempFractions.owner = msg.sender;
            tempFractions.tokenId = _tokenId;
            _mint(tempToken.owner, tempFractions.fractionId, 1, "");
            tokenIdVsFractionIds[tempToken.tokenId].push(
                tempFractions.fractionId
            );
            fractionIdVsFraction[tempFractions.fractionId] = tempFractions;
            _fractionIdCounter.increment();
        }

        tempToken.totalFractions = _noOfFractions;
        safeTransferFrom(msg.sender, address(this), _tokenId, 1, "");
        tempToken.owner = address(this);

        tokenIdVsToken[tempToken.tokenId] = tempToken;

        emit NFTFractioned(
            tempToken.owner,
            tempToken.tokenId,
            tokenIdVsFractionIds[tempToken.tokenId],
            (tempToken.price / _noOfFractions),
            _noOfFractions
        );
    }

    function sellFractions(uint256 _tokenId, uint256 _noOfFractions) public {
        uint256[] memory _fractionIds = tokenIdVsFractionIds[_tokenId];
        require(_fractionIds.length > 0, "No Fractions Found for given tokenId");
        for (uint256 index = 0; index < _noOfFractions; index++) {
            require(
                balanceOf(msg.sender, _fractionIds[index]) == 1,
                "Not enough tokens."
            );
            setApproval(msg.sender, escrowContract, _fractionIds[index], true);
            fractionIdVsFraction[_fractionIds[index]].forSale = true;
            Escrow1155(escrowContract).depositToken(
                msg.sender,
                _fractionIds[index],
                _tokenId,
                fractionIdVsFraction[_fractionIds[index]].price,
                1
            );
        }
    }

    function sellNFT(uint256 _tokenId) public {
        require(balanceOf(msg.sender, _tokenId) == 1, "Not enough tokens.");
        setApproval(msg.sender, escrowContract, _tokenId, true);
        tokenIdVsToken[_tokenId].forSale = true;
        Escrow1155(escrowContract).depositToken(
            msg.sender,
            _tokenId,
            0x0000000000,
            tokenIdVsToken[_tokenId].price,
            1
        );
    }

    // function addNFTForSale(uint256 _tokenId) public {
    //     tokenIdVsToken[_tokenId].forSale = true;
    //     emit NFTForSale(_tokenId, tokenIdVsToken[_tokenId].forSale);

    // }

    // function addFractionsForSale(uint256 _tokenId, uint256 _noOfFractions) public {
    //     uint256[] memory _fractionIds = tokenIdVsFractionIds[_tokenId];
    //     for (uint256 index = 1; index <= _noOfFractions; index++) {
    //         require(
    //             balanceOf(msg.sender, _fractionIds[index]) == 1,
    //             "Not enough tokens."
    //         );

    //         fractionIdVsFraction[_fractionIds[index]].forSale = true;

    //     }
    // }

    function claimNFT(uint256 _tokenId) public checkAllFractions(_tokenId) {
        uint256[] memory _fractionIds = tokenIdVsFractionIds[_tokenId];
        
        for (uint256 index = 0; index < _fractionIds.length; index++) {
            setApproval(msg.sender,address(this),_fractionIds[index],true);
            burn(address(this), _fractionIds[index], 1);
            delete fractionIdVsFraction[_fractionIds[index]];
            setApproval(msg.sender,address(this),_fractionIds[index],false);
        }

        delete tokenIdVsFractionIds[_tokenId];
        
        Token storage tempToken = tokenIdVsToken[_tokenId];

        tempToken.totalFractions = 0;

        tempToken.owner = msg.sender;

        tokenIdVsToken[tempToken.tokenId] = tempToken;

        _safeTransferFrom(address(this), msg.sender, _tokenId, 1, "");

        require(balanceOf(msg.sender, _tokenId) == 1, "Issue while transferring NFT");    
    }

    function setApproval(
        address owner,
        address operator,
        uint256 _tokenId,
        bool approved
    ) public {
        _setApprovalForAll(owner, operator, approved);
        if (approved) {
            _tokenApprovals[_tokenId] = operator;
        } else {
            delete _tokenApprovals[_tokenId];
        }
        emit ApprovalForAll(owner, operator, approved);
    }

    function isApprovedForId(address operator, uint256 _tokenId) public view returns (bool) {
        if(_tokenApprovals[_tokenId] == operator){
            return true;
        }
        else{
            return false;
        }
    }

    function onERC1155Received(
        address,
        address,
        uint256 _tokenID,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return
            bytes4(
                keccak256(
                    "onERC1155Received(address,address,uint256,uint256,bytes)"
                )
            );
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, ERC1155Receiver)
        returns (bool)
    {
        return
            ERC1155.supportsInterface(interfaceId) ||
            ERC1155Receiver.supportsInterface(interfaceId);
    }

    function getTokenIdVsFractionIds(uint256 _tokenId)
        external
        view
        returns (uint256[] memory)
    {
        return tokenIdVsFractionIds[_tokenId];
    }

     function burn(address account, uint256 id, uint256 value) public override {
        // if(!isApprovedForId(account, id)) {
        //     revert ERC1155MissingApprovalForAll(_msgSender(), account);
        // }
        _burn(msg.sender, id, value);
    }

    // function _update(
    //     address from,
    //     address to,
    //     uint256[] memory ids,
    //     uint256[] memory amounts
    // ) internal {
    //     super._update(from, to, ids, amounts);
    // }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not Admin");
        _;
    }

    modifier onlyOwner(uint256 _tokenId) {
        require(
            msg.sender == address(tokenIdVsToken[_tokenId].owner),
            "Caller is not Owner"
        );
        require(balanceOf(msg.sender, _tokenId) > 0, "Caller is not Owner");
        _;
    }

    modifier checkAllFractions(uint256 _tokenId){
        require(balanceOf(address(this), _tokenId) == 1, "No tokens found.");
        uint256[] memory _fractionIds = tokenIdVsFractionIds[_tokenId];
        for (uint256 index=0; index < _fractionIds.length ; index++) 
        {
            require(balanceOf(msg.sender, _fractionIds[index]) == 1, "Caller don't own all the fractions.");
        }
        _;
    }
}
