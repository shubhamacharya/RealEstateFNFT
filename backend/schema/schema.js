const { GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLScalarType,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLSchema, GraphQLEnumType
} = require("graphql");

const NFTDetails = require('../models/nftDetails');
const FractionsDetails = require('../models/fractionsDetails');
const Transactions = require('../models/transactions');
const Users = require("../models/userDetails");

// Users Type
const UsersType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        role: { type: GraphQLString },
        password: { type: GraphQLString }
    })
})

// Event Details
const EventType = new GraphQLScalarType({
    name: 'JSON',
    description: 'JSON scalar type',
    serialize(value) {
        return value; // JSON can be serialized as is
    },
    parseValue(value) {
        return value; // JSON can be parsed from variables
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.OBJECT) {
            const value = Object.create(null);
            ast.fields.forEach((field) => {
                value[field.name.value] = field.value.value;
            });
            return value;
        }
        return null; // Invalid JSON format
    },
});

// NFT Details
const nftDetailsType = new GraphQLObjectType({
    name: 'NFTDetails',
    fields: () => ({
        id: { type: GraphQLID },
        tokenId: { type: GraphQLInt },
        name: { type: GraphQLString },
        image: { type: GraphQLString },
        tokenURI: { type: GraphQLString },
        price: { type: GraphQLInt },
        ownerAddress: { type: GraphQLString },
        txId: { type: GraphQLString },
        blockNo: { type: GraphQLInt },
        eventData: { type: EventType }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        nft: {
            type: nftDetailsType,
            args: { tokenId: { type: GraphQLInt } },
            resolve(parent, args) {
                return NFTDetails.find({ tokenId: args.tokenId })
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        mintNFT: {
            type: nftDetailsType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                images: { type: new GraphQLNonNull(GraphQLString) },
                tokenURI: { type: new GraphQLNonNull(GraphQLString) },
                price: { type: new GraphQLNonNull(GraphQLInt) },
                ownerAddress: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, args) {
                let res = NFTDetails.save();
            }
        },
        users: {
            type: UsersType,
            args: { email: { type: GraphQLString }, password: { type: GraphQLString } },
            async resolve(parent, args) {
                return Users.findOne({ email: args.email, password: args.password })
            }
        },
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: mutation
})