const express = require('express');
const router = express.Router();
const db = require('../db'); 
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
const FINNHUB_API_KEY = process.env.FINHUB;



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
  console.log("[/bot/start] Request body:", req.body);

  const { symbol, shortWindow, longWindow, tradeAmount } = req.body;

  // 1. Validate request
  if (!symbol || !shortWindow || !longWindow || !tradeAmount) {
    console.log("[/bot/start] Missing required fields:", { symbol, shortWindow, longWindow, tradeAmount });
    return res.status(400).json({
      message: 'All fields (symbol, shortWindow, longWindow, tradeAmount) are required'
    });
  }

  if (tradeAmount <= 0) {
    console.log("[/bot/start] Invalid tradeAmount:", tradeAmount);
    return res.status(400).json({
      message: 'Trade amount must be greater than zero'
    });
  }

  if (botIntervalId) {
    console.log("[/bot/start] Bot is already running in-memory (botIntervalId is set).");
    return res.status(400).json({
      message: 'Bot is already running (in-memory).'
    });
  }

  try {
    // 2. Validate symbol with Alpaca (this is an async call, so we await it)
    console.log("[/bot/start] Validating symbol with Alpaca:", symbol);
    const symbolIsValid = await isValidSymbol(symbol);
    console.log("[/bot/start] symbolIsValid result:", symbolIsValid);
    if (!symbolIsValid) {
      console.log("[/bot/start] Symbol is invalid:", symbol);
      return res.status(400).json({ message: `Invalid symbol: ${symbol}` });
    }

    // 3. Check DB if there's already a row for this symbol with status=running
    console.log("[/bot/start] Checking DB for existing row with symbol:", symbol);

    db.get('SELECT * FROM bot WHERE symbol = ?', [symbol], (err, existingRow) => {
      if (err) {
        console.error("[/bot/start] Error selecting row:", err);
        return res.status(500).json({ message: 'Database error (select)' });
      }


      console.log("[/bot/start] Deleting any existing row for symbol:", symbol);
      db.run('DELETE FROM bot WHERE symbol = ?', [symbol], (deleteErr) => {
        if (deleteErr) {
          console.error("[/bot/start] Error deleting row:", deleteErr);
          return res.status(500).json({ message: 'Database error (delete)' });
        }

        console.log("[/bot/start] Inserting new row for symbol:", symbol);
        const insertQuery = `
          INSERT INTO bot (
            symbol, status, initial_balance, long_interval, short_interval, strategy, trade_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const strategy = 'moving_average';

        db.run(insertQuery, [
          symbol,
          'running',
          tradeAmount,
          longWindow,
          shortWindow,
          strategy,
          tradeAmount
        ], function(insertErr) {
          if (insertErr) {
            console.error("[/bot/start] Error inserting row:", insertErr);
            return res.status(500).json({ message: 'Database error (insert)' });
          }

   
          console.log("[/bot/start] Starting interval for tradingBot...");
          botIntervalId = setInterval(async () => {
            console.log("[botInterval] Executing tradingBot...");
            await tradingBot(symbol, parseInt(shortWindow), parseInt(longWindow), parseFloat(tradeAmount));
          }, 60_000);

          console.log("[/bot/start] Bot started successfully for symbol:", symbol);
          return res.json({ message: `Bot for ${symbol} started successfully` });
        }); // end db.run (insert)
      }); // end db.run (delete)
    }); // end db.get
  } catch (error) {
    console.error("[/bot/start] Error starting bot:", error);
    return res.status(500).json({ message: 'Error starting bot' });
  }
});


router.post('/bot/stop', (req, res) => {
  if (!botIntervalId) {
    return res.status(400).json({ message: 'No bot is currently running (in-memory).' });
  }

  clearInterval(botIntervalId);
  botIntervalId = null;

  db.run('UPDATE bot SET status = ? WHERE status = ?', ['stopped', 'running'], function(err) {
    if (err) {
      console.error("[/bot/stop] Error updating row:", err);
      return res.status(500).json({ message: 'Database error (update)' });
    }

    return res.json({ message: 'Bot stopped successfully' });
  });
});




router.get('/bot/status', async (req, res) => {
  try {
    // 1) Check if we have an in-memory interval reference
    //    This is a quick check to see if the bot is running in code.
    //    If you're allowing multiple bots, store them in an object/dict by symbol.
    if (!botIntervalId) {
      return res.json(false); 
    }

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
    let marketValue = 0;
    try {
      const positionResponse = await axios.get(
        `${ALPACA_BASE_URL}/v2/positions/${row.symbol}`,
        {
          headers: {
            'APCA-API-KEY-ID': ALPACA_API_KEY,
            'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
          },
        }
      );

      // Alpaca's positions response includes `market_value`
      marketValue = parseFloat(positionResponse.data.market_value); 
    } catch (positionError) {
      // If we have no position for this symbol, the server returns 404
      if (positionError.response && positionError.response.status === 404) {
        marketValue = 0; // means we have no position in that symbol
      } else {
        // Other errors should be thrown
        throw positionError;
      }
    }

    const responseData = {
      tickerTrading: row.symbol,             
      balance: marketValue,   
      strategy: row.strategy,                
      shortTermInterval: row.short_interval, 
      longTermInterval: row.long_interval,  
      startAmount: row.initial_balance,         
      status: row.status,                   
    };


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