// const mongoose = require('mongoose');

// const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zw6hky5.mongodb.net/?retryWrites=true&w=majority`;

// mongoose.connect(url, {
//     useNewUrlParser: true, 
//     useUnifiedTopology: true
// }).then(() => console.log('Connected to DB')).catch((e)=> console.log('Error', e))


const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.DB_URI;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to local MongoDB (Docker)"))
.catch((e) => console.error("❌ Error connecting to MongoDB:", e));
