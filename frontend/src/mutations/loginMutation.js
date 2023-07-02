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

export { GET_USER }