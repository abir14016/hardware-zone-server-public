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
        const myReviewCollection = client.db("hardwareZone").collection("myReview");
        const userProfileCollection = client.db("hardwareZone").collection("userProfile")


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


        //get specific user's order from database
        app.get('/myorder', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = myOrderCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });


        //delete a single order
        app.delete('/myorder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await myOrderCollection.deleteOne(query);
            res.send(result);
        });


        //send user's review to database
        // app.post('/myreview', async (req, res) => {
        //     const myReview = req.body;
        //     const result = await myReviewCollection.insertOne(myReview);
        //     res.send(result);
        // });


        //update or insert user's review to database
        app.put('/myreview/:email', async (req, res) => {
            const email = req.params.email;
            const myReview = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: myReview,
            };
            const result = await myReviewCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })


        //load user's review from database
        app.get('/myreview', async (req, res) => {
            const query = {};
            const cursor = myReviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });


        //save myprofile info to database
        app.post('/userprofile', async (req, res) => {
            const userProfile = req.body;
            const result = await userProfileCollection.insertOne(userProfile);
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