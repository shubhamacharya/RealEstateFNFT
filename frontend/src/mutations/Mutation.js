export const GET_USER = "mutation Users($email:String!,$password:String!,$operation:String!) {users(email: $email,password: $password,operation: $operation){ _id\nname\nemail\nrole\ntoken}}"
export const MINT_RNFT = `
    mutation mintNFT($name:String!,$images:String!,$tokenURI:String!,$price:Int!,$ownerAddress:String!,$adminAddress:String!) {
        mintNFT(name: $name,images: $images,tokenURI:$tokenURI,price:$price,ownerAddress:$ownerAddress,adminAddress:$adminAddress){
            txId
        }
    }
`;

// const SELL_NFT = gql`
//     mutation sellNFT($tokenId: Int!, $ownerAddress:String!){
//         sellNFT(tokenId: $tokenId, ownerAddress: $ownerAddress){
//             txId
//         }
//     }
// `

// export { GET_USER, MINT_RNFT, SELL_NFT }