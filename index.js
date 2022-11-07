const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Wedding Photography server runnig')
})

// const dbUser = process.env.DB_USER;
// const dbPassword = process.env.DB_PASSWORD;



app.listen(port, () => {
    console.log(`Wedding Photography server runnig on ${port}`)
})