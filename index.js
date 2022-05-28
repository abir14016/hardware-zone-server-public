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

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Accesss' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        await client.connect();
        const toolCollection = client.db("hardwareZone").collection("tool");
        const myOrderCollection = client.db("hardwareZone").collection("myOrder");
        const myReviewCollection = client.db("hardwareZone").collection("myReview");
        const userProfileCollection = client.db("hardwareZone").collection("userProfile");
        const userCollection = client.db("hardwareZone").collection("user");


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
        app.get('/myorder', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = myOrderCollection.find(query);
                const result = await cursor.toArray();
                return res.send(result);
            }
            else {
                return res.status(403).send({ message: 'Forbidden Accesss' });
            }
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
        // app.post('/userprofile', async (req, res) => {
        //     const userProfile = req.body;
        //     const result = await userProfileCollection.insertOne(userProfile);
        //     res.send(result);
        // });


        //update or insert user's profile to database
        app.put('/userprofile/:email', async (req, res) => {
            const email = req.params.email;
            const userProfile = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: userProfile,
            };
            const result = await userProfileCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });


        // upsert userCollection
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '10d'
            });
            res.send({ result, token });
        });


        //load all users
        app.get('/user', verifyJWT, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });


        //onlyAdmin api
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        });


        // onlyUser api
        app.get('/nonadmin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const nonAdmin = user.role !== 'admin';
            res.send({ admin: nonAdmin })
        });


        //make admin api
        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updatedDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updatedDoc);
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'Forbidden Accesss' });
            }
        });



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