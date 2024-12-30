const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const {
  fetchHistoricalData,
  calculateMovingAverage,
  placeOrder,
  tradingBot,
  getCurrentPositionForSymbol
} = require('../bot.js');

const ALPACA_API_KEY = process.env.API;
const ALPACA_SECRET_KEY = process.env.SECRET;
const ALPACA_BASE_URL = 'https://paper-api.alpaca.markets';



const marketOpenTime = { hour: 9, minute: 30 };
const marketCloseTime = { hour: 16, minute: 0 };

let botIntervalId = null;

// Optional: check if market is open (basic time check)
function isMarketOpen() {
  const now = new Date();
  const marketOpen = new Date().setHours(marketOpenTime.hour, marketOpenTime.minute, 0);
  const marketClose = new Date().setHours(marketCloseTime.hour, marketCloseTime.minute, 0);
  return now >= marketOpen && now <= marketClose;
}

// Helper to validate symbol
async function isValidSymbol(symbol) {
  try {
    const response = await axios.get(`${ALPACA_BASE_URL}/v2/assets/${symbol}`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
    });
    // Check if the asset is tradable
    if (response.data && response.data.tradable === true) {
      return true;
    } else {
      console.log(`Symbol ${symbol} exists but is not tradable.`);
      return false;
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        console.log(`Symbol ${symbol} not found.`);
        return false; // Symbol not found
      } else if (error.response.status === 401) {
        console.error('Authentication error:', error.response.data);
        return false;
      } else {
        console.error('API Error:', error.response.status, error.response.data);
        return false;
      }
    } else if (error.request) {
      console.error('No response from Alpaca API:', error.request);
      return false;
    } else {
      console.error('Error setting up the request', error.message);
      return false;
    }
  }
}

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
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching portfolio:', error.message);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// 3. Route: Start Trading Bot
router.post('/bot/start', async (req, res) => {
  const { symbol, shortWindow, longWindow, tradeAmount } = req.body;
  if (!symbol || !shortWindow || !longWindow || !tradeAmount) {
    return res.status(400).json({
      message: 'All fields (symbol, shortWindow, longWindow, tradeAmount) are required'
    });
  }

  if (tradeAmount <= 0) {
    return res.status(400).json({
      message: 'Trade amount must be greater than zero'
    });
  }

  if (botIntervalId) {
    return res.status(400).json({
      message: 'Bot is already running'
    });
  }

  try {
    // Validate symbol
    const symbolIsValid = await isValidSymbol(symbol);
    if (!symbolIsValid) {
      return res.status(400).json({ message: `Invalid symbol: ${symbol}` });
    }


    // Start the bot’s interval
    botIntervalId = setInterval(async () => {
      // Only trade during market hours if you like
      // if (!isMarketOpen()) {
      //   console.log("[Bot] Market is closed, skipping this cycle.");
      //   return;
      // }
      await tradingBot(symbol, parseInt(shortWindow), parseInt(longWindow), parseFloat(tradeAmount));
    }, 60_000);

    res.json({ message: 'Bot started successfully' });

  } catch (error) {
    console.error("Error starting bot:", error);
    return res.status(500).json({ message: 'Error starting bot' });
  }
});

// 4. Route: Stop Trading Bot
router.post('/bot/stop', (req, res) => {
  if (!botIntervalId) {
    return res.status(400).json({
      message: 'No bot is currently running'
    });
  }

  clearInterval(botIntervalId);
  botIntervalId = null;
  res.json({ message: 'Bot stopped successfully' });
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
        timeframe: '1D',
        start: '2023-01-01',
        end: '2023-12-31',
      },
    });
    res.json(response.data);
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
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching market news:', error.message);
    res.status(500).json({ error: 'Failed to fetch market news' });
  }
});

// 7. Route: Place an Order (Manual)
router.post('/order', async (req, res) => {
  const { symbol, qty, side, type, time_in_force } = req.body;
  try {
    const response = await axios.post(
      `${ALPACA_BASE_URL}/v2/orders`,
      { symbol, qty, side, type, time_in_force },
      {
        headers: {
          'APCA-API-KEY-ID': ALPACA_API_KEY,
          'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
        }
      }
    );
    res.json(response.data);
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
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;