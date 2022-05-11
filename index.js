// pass: IqQgrBVlTcnyBYis
// user: Rasel


// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://Rasel:<password>@cluster0.ubb0j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

const express = require('express')
const cors = require('cors');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;


// middleware  
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello From doctor Uncle')
})

app.listen(port, () => {
  console.log(`Doctor app listening on port ${port}`)
})
