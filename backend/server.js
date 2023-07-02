const express = require("express");
require("dotenv").config();
const connectDB = require("./config/db");
const cors = require("cors");
const schema = require("./schema/schema")
const { graphqlHTTP } = require("express-graphql");

const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors());
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}));

app.listen(PORT, async () => {
    //Connect to DB
    await connectDB();
    console.log(`Server started on http://localhost:${PORT}/graphql`);
});