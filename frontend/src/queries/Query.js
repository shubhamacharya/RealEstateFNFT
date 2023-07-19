import { gql } from "@apollo/client";

const GET_USER_COLLECTIONS = gql`
    query collectionsOfUser($ownerAddress: String!) {
        collectionsOfUser(ownerAddress: $ownerAddress){
            id,
            tokenId,
            name,
            tokenImg,
            tokenURI,
            price,
            ownerAddress,
            txId,
            blockNo,
            eventData
        }
    }
`;

const GET_FNFT_OF_NFT = gql`
    query fnftOfUsers($NFTId : Int!) {
        fnftOfUsers(NFTId: $NFTId){
            quantity,
            tokenOwners
        }
    }
`;

export { GET_USER_COLLECTIONS }