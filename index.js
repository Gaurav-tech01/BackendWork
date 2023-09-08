const connectToMongo = require('./db');
const express = require("express");
const notes = require('./routes/notes')
const auth = require('./routes/auth')
const app = express();
const dotenv = require('dotenv')
dotenv.config()

connectToMongo();

app.use(express.json())
//Available Routes
app.use('/auth', auth)
app.use('/notes', notes)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});