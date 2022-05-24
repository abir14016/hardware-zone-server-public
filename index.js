//require
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hardware zone server running');
})

app.listen(port, () => {
    console.log('hardware zone running on port', port);
})