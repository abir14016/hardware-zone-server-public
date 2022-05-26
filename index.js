//require
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//connect with mongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ecura.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const toolCollection = client.db("hardwareZone").collection("tool");
        const myOrderCollection = client.db("hardwareZone").collection("myOrder");


        // load all tools from database
        app.get('/tool', async (req, res) => {
            const query = {};
            const cursor = toolCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        });


        //load specific tool from database
        app.get('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolCollection.findOne(query);
            res.send(tool);
        });


        //send user's order to database
        app.post('/myorder', async (req, res) => {
            const myOrder = req.body;
            const result = await myOrderCollection.insertOne(myOrder);
            res.send(result);
        });


        //get user's order from database
        app.get('/myorder', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = myOrderCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
    }
    finally {
        //comment
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hardware zone server running');
})

app.listen(port, () => {
    console.log('hardware zone running on port', port);
})