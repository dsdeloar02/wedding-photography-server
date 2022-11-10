const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
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

async function run() {
    try{
        const serviceCollection = client.db('photoGraphar').collection('service');
        const reviewsCollection = client.db('photoGraphar').collection('reviews');
        
        app.get('/homeservices', async(req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query).sort({_id : -1 });
            const service = await cursor.limit(3).toArray();
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
            const cursor = reviewsCollection.find(query);
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

        app.get('/myreviews', async(req, res) => {
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