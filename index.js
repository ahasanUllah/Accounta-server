const express = require('express');
const cors = require('cors');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2redmm4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   serverApi: ServerApiVersion.v1,
});

const verifyJWT = (req, res, next) => {
   console.log(req.headers.authorization);
   const authHeader = req.headers.authorization;
   if (!authHeader) {
      return res.status(401).send({ message: 'unauthorized access' });
   }
   const token = authHeader.split(' ')[1];
   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
         return res.status(401).send({ message: 'unautorized access' });
      }
      req.decoded = decoded;
      next();
   });
};

const run = async () => {
   try {
      const serviceCollection = client.db('accounta').collection('services');
      const reviewCollection = client.db('accounta').collection('reviews');

      app.post('/jwt', (req, res) => {
         const user = req.body;
         const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' });
         console.log(user);
         res.send({ token });
      });

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

         res.send(result);
      });

      app.get('/servicehome', async (req, res) => {
         const query = {};
         const cursor = serviceCollection.find(query);
         const services = await cursor.sort({ $natural: -1 }).limit(3).toArray();
         res.send(services);
      });

      app.post('/reviews', async (req, res) => {
         const review = req.body;
         const result = await reviewCollection.insertOne(review);
         res.send(result);
      });

      app.get('/reviews', verifyJWT, async (req, res) => {
         const decoded = req.decoded;
         console.log(decoded);

         if (decoded.email !== req.query.email) {
            res.status(403).send({ message: 'unauthorized access' });
         }

         let query = {};
         if (req.query.email) {
            query = {
               userEmail: req.query.email,
            };
         }
         const cursor = reviewCollection.find(query);
         const result = await cursor.toArray();
         res.send(result);
      });

      app.get('/review/:id', async (req, res) => {
         const id = req.params.id;

         const query = { _id: ObjectId(id) };
         const result = await reviewCollection.findOne(query);
         return res.send(result);
      });

      app.get('/reviews/:id', async (req, res) => {
         const id = req.params.id;
         const query = { serviceId: id };
         const cursor = reviewCollection.find(query);
         const result = await cursor.sort({ date: -1 }).toArray();
         res.send(result);
      });

      app.put('/review/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const review = req.body;

         const option = { upsert: true };
         const updatedDoc = {
            $set: {
               feedback: review.feedback,
            },
         };
         const result = await reviewCollection.updateOne(query, updatedDoc, option);
         res.send(result);
      });
      app.delete('/reviews/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const result = await reviewCollection.deleteOne(query);
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
