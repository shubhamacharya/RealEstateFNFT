import { gql } from "@apollo/client"

const GET_USER = gql`
    mutation loginUser($email:String!,$password:String!) {
        users(email: $email,password: $password){
            name
            email
            role
        }
    }
`;

const MINT_RNFT = gql`
    mutation mintNFT($name:String!,$images:String!,$tokenURI:String!,$price:Int!,$ownerAddress:String!,$adminAddress:String!) {
        mintNFT(name: $name,images: $images,tokenURI:$tokenURI,price:$price,ownerAddress:$ownerAddress,adminAddress:$adminAddress){
            name
        }
    }
`;

export { GET_USER, MINT_RNFT }