const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLScalarType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLFloat,
  GraphQLBoolean,
  Kind,
} = require("graphql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const NFTDetails = require("../models/nftDetails");
const FractionsDetails = require("../models/fractionsDetails");
const Users = require("../models/userDetails");
const {
  mintNFTCallout,
  sellNFTCallout,
  fractionNFTCallout,
  sellFractionsCallout,
  buyTokensCallout,
} = require("../utils/web3Callouts");

// Users Type
const UsersType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
    password: { type: GraphQLString },
    token: { type: GraphQLString },
  }),
});

// Event Details
const EventType = new GraphQLScalarType({
  name: "JSON",
  description: "JSON scalar type",
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
  name: "NFTDetails",
  fields: () => ({
    _id: { type: GraphQLID },
    tokenId: { type: GraphQLInt },
    name: { type: GraphQLString },
    tokenImg: { type: new GraphQLList(GraphQLString) },
    docs: { type: GraphQLString },
    tokenURI: { type: GraphQLString },
    price: { type: GraphQLFloat },
    ownerAddress: { type: GraphQLString },
    txId: { type: GraphQLString },
    blockNo: { type: GraphQLInt },
    eventData: { type: EventType },
  }),
});

// FNFT Details
const fnftDetailsType = new GraphQLObjectType({
  name: "FNFTDetails",
  fields: () => ({
    _id: { type: GraphQLID },
    tokenId: { type: GraphQLInt },
    fractionId: { type: GraphQLInt },
    tokenOwner: { type: GraphQLString },
    price: { type: GraphQLInt },
    forSale: { type: GraphQLBoolean },
    txId: { type: GraphQLString },
    blockNo: { type: GraphQLInt },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    collectionsOfUser: {
      type: new GraphQLList(nftDetailsType),
      args: { ownerAddress: { type: GraphQLString } },
      async resolve(parent, args) {
        return await NFTDetails.find({
          ownerAddress: args.ownerAddress.toLowerCase(),
        }).exec();
      },
    },
    fnftOfUsers: {
      type: fnftDetailsType,
      args: { NFTId: { type: GraphQLInt } },
      async resolve(parent, args) {
        return await FractionsDetails.findOne({ tokenId: args.NFTId }).exec();
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // To mint new NFT
    mintNFT: {
      type: nftDetailsType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        images: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
        tokenURI: { type: GraphQLString },
        price: { type: new GraphQLNonNull(GraphQLFloat) },
        ownerAddress: { type: new GraphQLNonNull(GraphQLString) },
        docs: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        let txId = await mintNFTCallout(args);
        return await NFTDetails.findOne({ txId }).exec();
      },
    },

    // For login process
    users: {
      type: UsersType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        operation: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        try {
          let user = await Users.findOne({ email: args.email }).exec();
          if (user == null && args.operation.toLowerCase() === "register") {
            let newUser = new Users({
              email: args.email,
              password: await bcrypt.hash(args.password, 10),
              role: "user",
            });

            await newUser.save();
            return newUser;
          } else if (
            user !== null &&
            args.operation.toLowerCase() === "register"
          ) {
            console.log("User exists. Please login");
            return { error: "User exists. Please login" };
          } else if (user == null && args.operation.toLowerCase() === "login") {
            console.log("User does not exist. Please register user");
            return { error: "User does not exist. Please register user" };
          } else if (
            user !== null &&
            !(await bcrypt.compare(args.password, user.password)) &&
            args.operation.toLowerCase() === "login"
          ) {
            console.log("Wrong EmailId or password");
            return { error: "wrong emailid or password" };
          } else {
            user.token = jwt.sign(
              { userId: user._id, email: user.email, role: user.role },
              process.env.JWT_SECRET,
              {
                expiresIn: "1h",
              }
            );
            return user;
          }
        } catch (error) {
          console.log(error);
        }
      },
    },

    // To Sell NFT
    sellNFT: {
      type: nftDetailsType,
      args: {
        tokenId: { type: new GraphQLNonNull(GraphQLInt) },
        ownerAddress: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        let txId = await sellNFTCallout(args);
        return await NFTDetails.findOne({ txId }).exec();
      },
    },

    createFractions: {
      type: fnftDetailsType,
      args: {
        tokenId: { type: new GraphQLNonNull(GraphQLInt) },
        noOfFractions: { type: new GraphQLNonNull(GraphQLInt) },
        ownerAddress: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        let txId = await fractionNFTCallout(args);
        return await FractionsDetails.findOne({ txId }).exec();
      },
    },

    sellFractions: {
      type: fnftDetailsType,
      args: {
        tokenId: { type: new GraphQLNonNull(GraphQLInt) },
        noOfFractions: { type: new GraphQLNonNull(GraphQLInt) },
        ownerAddress: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        let txId = await sellFractionsCallout(args);
        return await FractionsDetails.findOne({ txId }).exec();
      },
    },

    buyTokens: {
      type: fnftDetailsType,
      args: {
        tokenId: { type: new GraphQLNonNull(GraphQLInt) },
        fractionId: { type: new GraphQLNonNull(GraphQLInt) },
        ownerAddress: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        let txId = await buyTokensCallout(args);
        return await FractionsDetails.findOne({ txId }).exec();
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutation,
});
