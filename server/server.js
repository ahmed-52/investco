const express = require('express');
const apiRoutes = require('./routes/api');
const userRoutes = require('./routes/users');
const cors = require('cors')
const db = require('./db');
const axios = require('axios');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', userRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('server is running!');
});


const runOnServerStart = async () => {
  console.log('Running startup code...');
  try {

    const runningTicker = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM bot WHERE status = "running"', (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });

    if (runningTicker.length > 0) {
      console.log('Found an active bot, starting...');
      const { symbol, short_interval, long_interval, initial_balance } = runningTicker[0];
      console.log('running ticker', runningTicker)
      console.log('Ticker:', symbol);
      try {
        const response = await axios.post('http://localhost:5001/api/bot/start', {
          symbol: symbol,
          shortWindow: short_interval,
          longWindow: long_interval,
          tradeAmount: initial_balance
        });
        console.log('Bot started:', response.data);
      } catch (error) {
        console.error('Error starting bot:', error.message);
      }
    } else {
      console.log('No running ticks found.');
    }
  } catch (e) {
    console.log('Error querying the database:', e);
  }
};

runOnServerStart()

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));