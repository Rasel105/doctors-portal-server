
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
const { MongoClient, ServerApiVersion, MongoDBNamespace } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000;


// middleware  
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ubb0j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("doctors_portal").collection("services");
    const bookingCollection = client.db("doctors_portal").collection("bookings");
    const userCollection = client.db("doctors_portal").collection("users");

    app.put("/user/:email", async (req, res) => {
      const email = req.params;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };

      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    // warning  
    // this is not the proper way to query 
    // after learning more about MongoDBNamespace. use aggreagte lookup, pipiline, match, group

    app.get("/available", async (req, res) => {
      const date = req.query.date;

      // step 1: 
      const services = await serviceCollection.find().toArray();

      //step 2: get the booking of that day
      const query = { date: date };
      const bookings = await bookingCollection.find(query).toArray();

      // step 3:  for each services 
      services.forEach(service => {
        // find bookings for that service , output [{}, {}, {}]
        const serviceBookings = bookings.filter(book => book.treatment === service.name);
        // step 5: select slots for the sevice Bookings: ['', "", ""]

        const bookedSlots = serviceBookings.map(book => book.slot);
        // step 6: select those slots that are not in bookedSlots 

        const available = service.slots.filter(slot => !bookedSlots.includes(slot));
        // step 7 : set availabe  to slots to make it easier



        service.slots = available;

      });




      res.send(services);
    });

    // post patient info 
    // app.post('/patients', async (req, res) => {
    //   const newPatient = req.body;
    //   const result = await patientCollection.insertOne(newPatient);
    //   res.send(result);
    // });

    /**
        * API naming onvenstion
        * app.get("/booking") get all booking or more than one by filter
        * app.get("/booking/:id")  get a specific booking
        * app.post("/booking") add a new booking
        * app.patch("/booking/:id") /update
        * app.delete("/booking/:id") /delete
        */

    app.get("/booking", async (req, res) => {
      const patientEmail = req.query.patientEmail;
      const query = { patientEmail: patientEmail };
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
    })


    app.post('/booking', async (req, res) => {
      const booking = req.body;
      const query = { treatment: booking.treatment, date: booking.date, patient: booking.patient };
      const exists = await bookingCollection.findOne(query);
      if (exists) {
        return res.send({ success: false, booking: exists });
      }
      const result = await bookingCollection.insertOne(booking);
      return res.send({ success: true, result });
    });

  }
  finally {

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello From doctor Uncle')
})

app.listen(port, () => {
  console.log(`Doctor app listening on port ${port}`)
})
