const express = require('express');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const cors=require('cors');
const app = express();
const port = 3000;


app.use(cors());
const mongoURI="mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"
//const mongoURI = 'mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });

const cryptoSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String,
});

const Crypto = mongoose.model('Crypto', cryptoSchema);

app.get('/cryptos', async (req, res) => {
  try {
    const cryptos = await Crypto.find();
    res.json(cryptos);
  } catch (err) {
    console.error('Error retrieving data from MongoDB:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/fetch-data', async (req, res) => {
  try {
    const response = await fetch('https://api.wazirx.com/api/v2/tickers');
    const data = await response.json();
    const top10Data = Object.values(data).slice(0, 10);

    await Crypto.deleteMany({});
    await Crypto.insertMany(top10Data);

    console.log('Data stored in MongoDB Atlas');

    res.json({ message: 'Data fetched and stored successfully' });
  } catch (err) {
    console.error('Error fetching and storing data:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
