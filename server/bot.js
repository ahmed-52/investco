const axios = require('axios');

// Alpaca credentials
const ALPACA_API_KEY = process.env.API;
const ALPACA_SECRET_KEY = process.env.SECRET;
const ALPACA_BASE_URL = 'https://paper-api.alpaca.markets';
const ALPACA_DATA_URL = 'https://data.alpaca.markets/v2';

// Fetch historical data
async function fetchHistoricalData(symbol, timeframe, limit) {
  try {
    const response = await axios.get(`${ALPACA_DATA_URL}/stocks/${symbol}/bars`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
      params: { timeframe, limit },
    });
    return response.data.bars.map(bar => bar.c); 
  } catch (error) {
    console.error('Error fetching historical data:', error.message);
    throw error;
  }
}

// Calculate moving average
function calculateMovingAverage(prices, windowSize) {
  if (prices.length < windowSize) return null;
  const subset = prices.slice(-windowSize); // Get the last `windowSize` prices
  return subset.reduce((sum, price) => sum + price, 0) / windowSize;
}

// Place an order
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
    console.log(`Order placed: ${side} ${qty} shares of ${symbol}`);
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error.message);
    throw error;
  }
}

// Trading bot logic
async function tradingBot(symbol, shortWindow, longWindow) {
  console.log(`Starting bot for ${symbol} with shortWindow=${shortWindow}, longWindow=${longWindow}`);
  const limit = longWindow + 1; // Fetch enough data for the long window

  try {
    // Fetch historical data
    const prices = await fetchHistoricalData(symbol, '1Day', limit);
    console.log(`Prices for ${symbol}:`, prices);

    // Calculate moving averages
    const shortMA = calculateMovingAverage(prices, shortWindow);
    const longMA = calculateMovingAverage(prices, longWindow);
    console.log(`Short MA: ${shortMA}, Long MA: ${longMA}`);

    // Make trading decisions
    if (shortMA > longMA) {
      console.log('Bullish crossover detected, placing BUY order...');
      await placeOrder(symbol, 1, 'buy');
    } else if (shortMA < longMA) {
      console.log('Bearish crossover detected, placing SELL order...');
      await placeOrder(symbol, 1, 'sell');
    } else {
      console.log('No clear signal, holding...');
    }
  } catch (error) {
    console.error('Error in bot execution:', error.message);
  }
}

// Run the bot (example)
tradingBot('AAPL', 10, 50); // Apple stock, 10-day vs. 50-day moving average
