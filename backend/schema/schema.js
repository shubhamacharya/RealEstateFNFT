const { GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLScalarType,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLEnumType
} = require("graphql");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NFTDetails = require('../models/nftDetails');
const FractionsDetails = require('../models/fractionsDetails');
const Transactions = require('../models/transactions');
const Users = require("../models/userDetails");
const { mintNFTCallout, sellNFTCallout } = require("../utils/web3Callouts");


// Users Type
const UsersType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        role: { type: GraphQLString },
        password: { type: GraphQLString },
        token: {type: GraphQLString}
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
        _id: { type: GraphQLID },
        tokenId: { type: GraphQLInt },
        name: { type: GraphQLString },
        tokenImg: { type: new GraphQLList(GraphQLString) },
        // tokenImg: { type: new FileList(new File) },
        tokenURI: { type: GraphQLString },
        price: { type: GraphQLInt },
        ownerAddress: { type: GraphQLString },
        txId: { type: GraphQLString },
        blockNo: { type: GraphQLInt },
        eventData: { type: EventType }
    })
});

// FNFT Details
const fnftDetailsType = new GraphQLObjectType({
    name: 'FNFTDetails',
    fields: () => ({
        _id: { type: GraphQLID },
        NFTId: { type: GraphQLInt },
        quantity: { type: GraphQLInt },
        tokenOwners: { type: new GraphQLList(GraphQLString) },
        txId: { type: GraphQLString },
        blockNo: { type: GraphQLInt }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        collectionsOfUser: {
            type: new GraphQLList(nftDetailsType),
            args: { ownerAddress: { type: GraphQLString } },
            async resolve(parent, args) {
                let res = await NFTDetails.find({ ownerAddress: args.ownerAddress.toLowerCase() }).exec();
                return res
            }
        },
        fnftOfUsers: {
            type: fnftDetailsType,
            args: { NFTId: { type: GraphQLInt } },
            async resolve(parent, args) {
                let res = await FractionsDetails.findOne({ NFTId: args.NFTId }).exec();
                return res
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // To mint new NFT  
        mintNFT: {
            type: nftDetailsType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                images: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
                // images: { type: new GraphQLNonNull(new GraphQLList(nftImagesList)) },
                tokenURI: { type: new GraphQLNonNull(GraphQLString) },
                price: { type: new GraphQLNonNull(GraphQLInt) },
                ownerAddress: { type: new GraphQLNonNull(GraphQLString) },
                adminAddress: { type: new GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, args) {
                let txId = await mintNFTCallout(args);
                return await NFTDetails.findOne({ txId })
            }
        },

        // For login process
        users: {
            type: UsersType,
            args: { email: { type: new GraphQLNonNull(GraphQLString) }, password: { type: new GraphQLNonNull(GraphQLString) }, operation: { type: new GraphQLNonNull(GraphQLString) } },
            async resolve(parent, args) {
                try {
                    let users = await Users.findOne({ email: args.email }).exec()
                    if (users == null && args.operation.toLowerCase() === "register") {
                        let user = new Users()
                        user.email = args.email
                        user.password = await bcrypt.hash(args.password, 10)
                        user.role = "user"

                        await user.save();
                        return user
                    }
                    else if (users !== null && args.operation.toLowerCase() === "register"){
                        console.log("User exists. Please login")
                        return { "error": "User exists. Please login" }
                    }
                    else if (users == null && args.operation.toLowerCase() === "login") {
                        console.log("User does not exists. Please register user")
                        return { "error": "User does not exists. Please register user" }
                    }
                    else if (users !== null && !await bcrypt.compare(args.password, users.password) && args.operation.toLowerCase() === "login") {
                        console.log("Wrong EmailId or password");
                        return { "error": "wrong emailid or password" }
                    }
                    else {
                        users.token = jwt.sign({ userId: users._id, email: users.email, role: users.role }, process.env.JWT_SECRET, {
                            expiresIn: '1h',
                        });
                        return users
                    }
                } catch (error) {
                    console.log(error);
                }

            }
        },
        // To Sell NFT
        sellNFT: {
            type: nftDetailsType,
            args: { tokenId: { type: new GraphQLNonNull(GraphQLInt) }, ownerAddress: { type: new GraphQLNonNull(GraphQLString) } },
            async resolve(parent, args) {
                let txId = await sellNFTCallout(args);
                console.log(args);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: mutation
})