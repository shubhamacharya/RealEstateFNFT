const express = require("express");
const { graphqlHTTP } = require('express-graphql')
require("dotenv").config();
const connectDB = require("./config/db");
const cors = require("cors");
const schema = require("./schema/schema")
const authenticateJWT = require("./utils/verifyJWT");
const bodyParser = require("body-parser");

// const PORT = process.env.GQL_PORT || 4000;
const PORT = 4000
const app = express();
// app.use(bodyParser.text());
// app.use(bodyParser.urlencoded());
app.use(bodyParser.raw());
app.use(bodyParser.json());

app.use(cors({ origin: 'http://localhost:5173' }));
app.use('/graphql', (req, res, next) => {
    if (["login", "register"].includes(req.body.variables.operation.toLowerCase())) {
        next();
    }
    else {
        authenticateJWT(req, res, next)
    }
})
app.use('/graphql', graphqlHTTP({ schema: schema, graphiql: true }));
app.listen(PORT, async () => {
    //Connect to DB
    await connectDB();
    console.log(`Server started on http://localhost:${PORT}/graphql`);
});