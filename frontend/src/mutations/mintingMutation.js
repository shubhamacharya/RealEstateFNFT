import { gql } from "@apollo/client"

const MINT_RNFT = gql`
    mutation mintNFT($name:String!,$images:[String]!,$tokenURI:String!,$price:Int!,$ownerAddress:String!) {
        mintNFT(name: $name,images: $images,tokenURI:$tokenURI,price:$price,ownerAddress:$ownerAddress){
            block
        }
    }
`;

export { MINT_RNFT }