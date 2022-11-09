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
        app.get('/homeservices', async(req, res) => {
            const query = {};
            // const sort = ObjectId.getTimestamp();
            // console.log(sort);
            const cursor = serviceCollection.find(query).sort({_id : -1 });
            const service = await cursor.limit(3).toArray();
            res.send(service);
        })
        app.post('/service', async(req, res) => {
            const service = req.body;            
            console.log(service);
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
    }
    finally{

    }
}

run().catch(err => console.error(err))



app.listen(port, () => {
    console.log(`Wedding Photography server runnig on ${port}`)
})