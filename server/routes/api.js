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




router.post('/bot/start', async (req, res) => {
  const { symbol, shortWindow, longWindow, tradeAmount, strategy } = req.body;

  // 1. Validate request
  if (!symbol || !shortWindow || !longWindow || !tradeAmount || !strategy) {
    return res.status(400).json({
      message: 'All fields (symbol, shortWindow, longWindow, tradeAmount, strategy) are required'
    });
  }

  if (tradeAmount <= 0) {
    return res.status(400).json({
      message: 'Trade amount must be greater than zero'
    });
  }

  if (botIntervalId) {
    return res.status(400).json({
      message: 'Bot is already running (in-memory).'
    });
  }

  try {
    // 2. Validate symbol with Alpaca
    const symbolIsValid = await isValidSymbol(symbol);
    if (!symbolIsValid) {
      return res.status(400).json({ message: `Invalid symbol: ${symbol}` });
    }

    // 3. Check DB if there's already a row for this symbol with status=running
    const row = db.prepare('SELECT * FROM bot WHERE symbol = ?').get(symbol);
    if (row && row.status === 'running') {
      return res.status(400).json({
        message: `Bot for symbol ${symbol} is already running in the DB!`
      });
    }

    // 4. Upsert the row into `bot` table: set status=running, etc.
    // For simplicity, let's do a two-step approach: delete existing, then insert a fresh row
    // or you can do an actual SQL "INSERT OR REPLACE" if you'd like.
    db.prepare('DELETE FROM bot WHERE symbol = ?').run(symbol);
    db.prepare(`
      INSERT INTO bot (symbol, status, initial_balance, long_interval, short_interval, strategy, trade_amount)
      VALUES (@symbol, @status, @initial_balance, @long_interval, @short_interval, @strategy, @trade_amount)
    `).run({
      symbol,
      status: 'running',
      initial_balance: 0, // or pass something from your logic
      long_interval: longWindow,
      short_interval: shortWindow,
      strategy,
      trade_amount: tradeAmount
    });

    // 5. Start the in-memory interval
    botIntervalId = setInterval(async () => {
      await tradingBot(symbol, parseInt(shortWindow), parseInt(longWindow), parseFloat(tradeAmount));
    }, 60_000);

    return res.json({ message: `Bot for ${symbol} started successfully` });

  } catch (error) {
    console.error("Error starting bot:", error);
    return res.status(500).json({ message: 'Error starting bot' });
  }
});



// 4. Route: Stop Trading Bot
// routes/trading.js

router.post('/bot/stop', (req, res) => {


  if (!botIntervalId) {
    return res.status(400).json({ message: 'No bot is currently running (in-memory).' });
  }

  clearInterval(botIntervalId);
  botIntervalId = null;

  db.prepare('UPDATE bot SET status = ? WHERE status = ?').run('stopped', 'running');

  return res.json({ message: 'Bot stopped successfully' });
});



router.get('/bot/status', async (req, res) => {
  try {
    // 1) Check if we have an in-memory interval reference
    //    This is a quick check to see if the bot is running in code.
    //    If you're allowing multiple bots, store them in an object/dict by symbol.
    if (!botIntervalId) {
      return res.json(false); 
      // If you prefer a more descriptive object, do:
      // return res.json({ isBotRunning: false });
    }

    // 2) Fetch the current bot row from the database
    //    For simplicity, let's assume you only allow 1 bot at a time.
    const row = db.prepare(`
      SELECT * 
      FROM bot
      WHERE status = 'running'
      LIMIT 1
    `).get();

    // If there's no row in DB, treat it as "no bot running"
    if (!row) {
      return res.json(false);
    }

    // 3) Retrieve the Alpaca account balance
    const accountResponse = await axios.get(`${ALPACA_BASE_URL}/v2/account`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
    });
    const { cash, buying_power, equity } = accountResponse.data;

    // 4) Format the response similar to your Figma design:
    const responseData = {
      tickerTrading: row.symbol,             // e.g. "$RKLB"
      balance: Number(equity).toFixed(2),    // e.g. 52405 -> "52405.00"
      strategy: row.strategy,                // e.g. "Moving Average"
      shortTermInterval: row.short_interval, // e.g. 10
      longTermInterval: row.long_interval,   // e.g. 100
      startAmount: row.trade_amount,         // e.g. 40000 (or however you stored it)
      status: row.status,                    // e.g. "running"
    };

    // 5) Return the JSON
    return res.json(responseData);

  } catch (error) {
    console.error('Error getting bot status:', error.message);
    return res.status(500).json({ error: 'Failed to get bot status' });
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