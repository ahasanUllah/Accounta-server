const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2redmm4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   serverApi: ServerApiVersion.v1,
});

const run = async () => {
   try {
      const serviceCollection = client.db('accounta').collection('services');

      app.get('/services', async (req, res) => {
         const query = {};
         const cursor = serviceCollection.find(query);
         const services = await cursor.toArray();
         res.send(services);
      });
   } finally {
   }
};
run().catch((error) => console.log(error));

app.get('/', (req, res) => {
   res.send('Server running');
});

app.listen(port, () => {
   console.log(`Accounta app server is running on ${port}`);
});
