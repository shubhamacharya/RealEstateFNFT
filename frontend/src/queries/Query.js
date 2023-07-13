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

export { GET_USER_COLLECTIONS }