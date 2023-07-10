const express = require("express");
const { graphqlHTTP } = require('express-graphql')
require("dotenv").config();
const connectDB = require("./config/db");
const cors = require("cors");
const schema = require("./schema/schema")

const PORT = process.env.GQL_PORT || 4000;

const app = express();

app.use(cors({origin:'http://localhost:3000'}));

app.use('/graphql', graphqlHTTP({ schema: schema, graphiql: true }));
app.listen(PORT, async () => {
    //Connect to DB
    await connectDB();
    console.log(`Server started on http://localhost:${PORT}/graphql`);
});