const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
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
      const reviewCollection = client.db('accounta').collection('reviews');

      app.get('/services', async (req, res) => {
         const query = {};

         const cursor = serviceCollection.find(query);
         const services = await cursor.toArray();
         res.send(services);
      });

      app.get('/services/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const result = await serviceCollection.findOne(query);
         res.send(result);
      });

      app.post('/services', async (req, res) => {
         const service = req.body;
         const result = await serviceCollection.insertOne(service);
         console.log(result);
         res.send(result);
      });

      app.get('/servicehome', async (req, res) => {
         const query = {};
         const cursor = serviceCollection.find(query);
         const services = await cursor.limit(3).toArray();
         res.send(services);
      });

      app.post('/reviews', async (req, res) => {
         const review = req.body;
         const result = await reviewCollection.insertOne(review);
         res.send(result);
      });

      app.get('/reviews', async (req, res) => {
         const query = {};
         const cursor = reviewCollection.find(query);
         const result = await cursor.toArray();
         res.send(result);
      });

      app.get('/reviews/:id', async (req, res) => {
         const id = req.params.id;

         const query = { serviceId: id };
         const cursor = reviewCollection.find(query);
         const result = await cursor.sort({ date: -1 }).toArray();
         res.send(result);
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
