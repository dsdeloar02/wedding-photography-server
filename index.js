const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Wedding Photography server runnig')
})

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;


const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.myxtuht.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT (req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'Unauthorized access'})
    }
    
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message : 'Forbidden Access'})
        }
        req.decoded = decoded;
        next()
    })
}

async function run() {
    try{
        const serviceCollection = client.db('photoGraphar').collection('service');
        const reviewsCollection = client.db('photoGraphar').collection('reviews');
        const instrumentCollection = client.db('photoGraphar').collection('instrument');
        const bannerCollection = client.db('photoGraphar').collection('banner');

        app.get('/banners', async(req, res) => {
            const query = {};
            const cursor = bannerCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);
        })
        app.get('/instruments', async(req, res) => {
            const query = {};
            const cursor = instrumentCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);
        })

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
            res.send({token});
        })
        
        app.get('/homeservices', async(req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query).sort({_id : -1 });
            const service = await cursor.limit(3).toArray();
            res.send(service);
        })
        app.get('/allservice', async(req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);
        })

        app.post('/service', async(req, res) => {
            const service = req.body;     
            const result = await serviceCollection.insertOne(service);
            res.send(result)
        })
        app.get('/homeservices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id:ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })
        app.put('/homeservices/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {_id : ObjectId(id)};
            const service = req.body;
            console.log(service)
            const option = {upsert : true};
            const updatedUser = {
                $set: {
                    package_name : service.package_name,
                    thumbnail : service.thumbnail,
                    price : service.price,
                    description : service.description
                }
            }
            const result = await serviceCollection.updateOne(filter, updatedUser, option);
            res.send(result)
        })

        app.delete('/homeservices/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const result = await serviceCollection.deleteOne(query)
            console.log(result)
            res.send(result)
        })

        // reviews api

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review)
            res.send(result)
            console.log(result)
        })
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id:ObjectId(id)};
            const review = await reviewsCollection.findOne(query);
            res.send(review)
        })

        app.get('/reviews', async(req, res) => {
            let query = {};
            if(req.query.service){
                query = {
                    service: req.query.service
                }
            }
            const cursor = reviewsCollection.find(query).sort({_id : -1 });
            const review = await cursor.toArray();
            res.send(review);
        })

        
        
        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {_id : ObjectId(id)};
            const review = req.body;
            console.log(review)
            const option = {upsert : true};
            const updatedReview = {
                $set: {
                    userName : review.userName,
                    review : review.review,
                    ratting : review.ratting
                }
            }
            const result = await reviewsCollection.updateOne(filter, updatedReview, option);
            res.send(result)
        })

// my reviews api

        // app.get('/myreviews', async (req, res) => {
        //     const query = {};
        //     const cursor = reviewsCollection.find(query);
        //     const myreviews = await cursor.toArray();
        //     res.send(myreviews);
        // })

        app.get('/myreviews', verifyJWT, async(req, res) => {
            const decoded = req.decoded;
            
            if(decoded.email !== req.query.userEmail){
                res.status(403).send({message : 'unauthorized access'})
            }
            console.log(req.query)
            let query = {};
            if(req.query.userEmail){
                query = {
                    userEmail: req.query.userEmail
                }
            }
            const cursor = reviewsCollection.find(query);
            const myreview = await cursor.toArray();
            res.send(myreview);
        })



    }
    finally{

    }
}

run().catch(err => console.error(err))



app.listen(port, () => {
    console.log(`Wedding Photography server runnig on ${port}`)
})