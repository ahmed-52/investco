const axios = require('axios');

// Alpaca credentials
const ALPACA_API_KEY = process.env.API;
const ALPACA_SECRET_KEY = process.env.SECRET;
const ALPACA_BASE_URL = 'https://paper-api.alpaca.markets';
const ALPACA_DATA_URL = 'https://data.alpaca.markets/v2';

// Fetch historical data
// 1. Fetch historical data
async function fetchHistoricalData(symbol, timeframe, limit) {
  try {
    const response = await axios.get(`${ALPACA_DATA_URL}/stocks/${symbol}/bars`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
      params: { timeframe, limit },
    });

    console.log("Full response from Alpaca:", response.data);

    // Return the 'close' prices as an array
    return response.data.bars.map(bar => bar.c);

  } catch (error) {
    console.error('Error fetching historical data:', error.message);
    throw error;
  }
}

// 2. Calculate Moving Average
function calculateMovingAverage(prices, windowSize) {
  if (prices.length < windowSize) return null;
  const subset = prices.slice(-windowSize);
  const sum = subset.reduce((acc, price) => acc + price, 0);
  return sum / windowSize;
}

// 3. Place an order
async function placeOrder(symbol, qty, side, type = 'market', time_in_force = 'gtc') {
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
    console.log(`Order placed: ${side.toUpperCase()} ${qty} shares of ${symbol}`);
    return response.data;

  } catch (error) {
    console.error('Error placing order:', error.response ? error.response.data : error.message);
    return {
      error: true,
      message: error.response ? error.response.data.message : error.message
    };
  }
}

// 4. Check current position for a symbol
//    Returns the quantity of shares currently held for `symbol`.
async function getCurrentPositionForSymbol(symbol) {
  try {
    const response = await axios.get(`${ALPACA_BASE_URL}/v2/positions/${symbol}`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
    });
    // If found, return the current qty
    return parseFloat(response.data.qty);

  } catch (error) {
    // If error is 404, it means no position exists for this symbol
    if (error.response && error.response.status === 404) {
      return 0;
    }
    // Otherwise, re-throw
    console.error('Error fetching current position:', error.message);
    throw error;
  }
}

// 5. Main Trading Bot Function
async function tradingBot(symbol, shortWindow, longWindow, tradeAmount) {
  console.log(`\n[Bot] Checking symbol ${symbol} | shortWindow=${shortWindow}, longWindow=${longWindow}, tradeAmount=${tradeAmount}`);

  const limit = longWindow + 5;  // a bit extra
  try {
    // Step A: Fetch the historical data
    const prices = await fetchHistoricalData(symbol, '1Hour', limit);
    if (!prices || prices.length < longWindow) {
      console.log(`[Bot] Not enough data to calculate ${longWindow}-bar SMA. Skipping.`);
      return;
    }

    // Step B: Calculate moving averages
    const shortMA = calculateMovingAverage(prices, shortWindow);
    const longMA = calculateMovingAverage(prices, longWindow);

    console.log(`[Bot] Short MA: ${shortMA?.toFixed(3)}, Long MA: ${longMA?.toFixed(3)}`);

    // If for some reason either average is null, skip
    if (!shortMA || !longMA) {
      console.log(`[Bot] Could not calculate MAs properly. Skipping.`);
      return;
    }

    // Step C: Current position check
    const currentPosition = await getCurrentPositionForSymbol(symbol);
    console.log(`[Bot] Currently holding ${currentPosition} shares of ${symbol}.`);

    // Step D: Determine the latest price
    const latestPrice = prices[prices.length - 1];
    if (!latestPrice) {
      console.log(`[Bot] No latest price found. Skipping.`);
      return;
    }

    // Step E: Trading Logic
    //     - If shortMA > longMA => Bullish signal: Buy IF we have no shares
    //     - If shortMA < longMA => Bearish signal: Sell IF we have shares
    //     - Otherwise, hold
    if (shortMA > longMA) {
      if (currentPosition === 0) {
        // Calculate quantity we can buy with tradeAmount
        const quantity = Math.floor(tradeAmount / latestPrice);
        if (quantity <= 0) {
          console.log('[Bot] Not enough tradeAmount to buy even 1 share. Skipping.');
          return;
        }
        console.log(`[Bot] Bullish crossover detected. Placing BUY order for ${quantity} shares...`);
        await placeOrder(symbol, quantity, 'buy');
      } else {
        console.log('[Bot] Bullish signal, but we already hold shares. Doing nothing.');
      }
    } else if (shortMA < longMA) {
      if (currentPosition > 0) {
        console.log(`[Bot] Bearish crossover detected. Selling all ${currentPosition} shares...`);
        await placeOrder(symbol, currentPosition, 'sell');
      } else {
        console.log('[Bot] Bearish signal, but we do not hold any shares. Doing nothing.');
      }
    } else {
      // MAs are essentially equal
      console.log('[Bot] No clear crossover signal. Holding position as is.');
    }

  } catch (error) {
    console.error('[Bot] Error in bot execution:', error.message);
  }
}

module.exports = {
  fetchHistoricalData,
  calculateMovingAverage,
  placeOrder,
  tradingBot,
  getCurrentPositionForSymbol
}