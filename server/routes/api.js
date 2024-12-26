const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const ALPACA_API_KEY = process.env.API;
const ALPACA_SECRET_KEY = process.env.SECRET;
const ALPACA_BASE_URL = 'https://paper-api.alpaca.markets';

// 1. Route: Get Account Balance
router.get('/balance', async (req, res) => {
  try {
    const response = await axios.get(`${ALPACA_BASE_URL}/v2/account`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
    });
    const { cash, buying_power, equity } = response.data;
    res.json({ cash, buying_power, equity });
  } catch (error) {
    console.error('Error fetching balance:', error.message);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// 2. Route: Get Portfolio (Current Positions)
router.get('/portfolio', async (req, res) => {
  try {
    const response = await axios.get(`${ALPACA_BASE_URL}/v2/positions`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
    });
    res.json(response.data); // Send portfolio data
  } catch (error) {
    console.error('Error fetching portfolio:', error.message);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// 3. Route: Start Trading Bot
router.post('/bot/start', async (req, res) => {
  const { symbol, short_window, long_window } = req.body;

  try {
    // Placeholder for bot logic (e.g., Moving Average Strategy)
    res.json({ message: `Bot started for ${symbol} with strategy: ${short_window}-${long_window}` });
  } catch (error) {
    console.error('Error starting bot:', error.message);
    res.status(500).json({ error: 'Failed to start bot' });
  }
});

// 4. Route: Stop Trading Bot
router.post('/bot/stop', (req, res) => {
  try {
    // Placeholder for stopping the bot
    res.json({ message: 'Bot stopped successfully' });
  } catch (error) {
    console.error('Error stopping bot:', error.message);
    res.status(500).json({ error: 'Failed to stop bot' });
  }
});

// 5. Route: Get Historical Data
router.get('/historical/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
    const response = await axios.get(`${ALPACA_BASE_URL}/v2/stocks/${symbol}/bars`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
      params: {
        timeframe: '1D', // Daily data
        start: '2023-01-01', // Replace with dynamic date if needed
        end: '2023-12-31', // Replace with dynamic date if needed
      },
    });
    res.json(response.data); // Send historical data
  } catch (error) {
    console.error('Error fetching historical data:', error.message);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// 6. Route: Get Market News
router.get('/news', async (req, res) => {
  try {
    const response = await axios.get(`${ALPACA_BASE_URL}/v2/news`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
    });
    res.json(response.data); // Send market news
  } catch (error) {
    console.error('Error fetching market news:', error.message);
    res.status(500).json({ error: 'Failed to fetch market news' });
  }
});

// 7. Route: Place an Order
router.post('/order', async (req, res) => {
  const { symbol, qty, side, type, time_in_force } = req.body;

  try {
    const response = await axios.post(
      `${ALPACA_BASE_URL}/v2/orders`,
      {
        symbol,
        qty,
        side,
        type,
        time_in_force,
      },
      {
        headers: {
          'APCA-API-KEY-ID': ALPACA_API_KEY,
          'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
        }
      }
    );
    res.json(response.data); // Send order confirmation
  } catch (error) {
    console.error('Error placing order:', error.message);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// 8. Route: Get Open Orders
router.get('/orders', async (req, res) => {
  try {
    const response = await axios.get(`${ALPACA_BASE_URL}/v2/orders`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
    });
    res.json(response.data); // Send open orders
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
