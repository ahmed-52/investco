# AI-Driven Pre-Market Stock Trading Strategy

## Overview
This strategy utilizes **machine learning** to predict whether a stock that is **rallying in the pre-market** is a **buy** or **not a buy** based on its **past 29 days of trading data**.

## Objective
The goal is to train an **AI model** that evaluates a stock's pre-market performance and its **historical open/close prices** to determine if it is likely to continue its rally after market open.

## Data Requirements
To implement this strategy, we need the following data:

1. **Pre-Market Movers**: 
   - Stocks that have **gained significantly** in pre-market trading.
   - Pre-market **open price, close price, volume, and percentage change**.

2. **Historical Trading Data** (Past 29 Days):
   - **Open & Close Prices**
   - **Daily Price Range (High-Low Difference)**
   - **Volume Traded**
   - **Daily % Change**
   - **Final Close Price Outcome** (Did it close higher or lower than open?)

3. **Labels for Training**:
   - If the stock **continued rallying** after market open (Buy ✅).
   - If the stock **fizzled out** after market open (Not a Buy ❌).

## Model Architecture
We will use a **supervised learning** approach to classify stocks as **BUY** or **NOT BUY** based on pre-market data and historical trends.

### **Feature Engineering**
The following features will be used for AI training:
- **Pre-market price movement** (e.g., % change from previous close)
- **Pre-market volume compared to 29-day average**
- **Average True Range (ATR) of past 29 days**
- **Volatility (Standard deviation of past daily % changes)**
- **Relative Strength Index (RSI) for trend analysis**
- **Moving Averages (5-day, 10-day, 29-day)**
- **MACD Signal for trend confirmation**

### **Model Selection**
The following models will be tested:
1. **Random Forest Classifier** (Baseline Model)
2. **Gradient Boosting (XGBoost, LightGBM)**
3. **Neural Network (LSTM or MLP for sequence analysis)**

## Trading Execution Logic
1. **Identify Pre-Market Movers**
   - Scan stocks with **significant pre-market gains (e.g., >3%)**.
   - Fetch **past 29-day trading data** for each.

2. **Run AI Model on Selected Stocks**
   - Feed the pre-market and historical data into the model.
   - Get a **prediction: Buy ✅ / Not Buy ❌**.

3. **Trade Execution**
   - If **BUY**: Place a market order at open.
   - If **NOT BUY**: Ignore and move to the next stock.

## Risk Management
- **Stop Loss**: Exit trade if stock falls **5%** below entry.
- **Profit Target**: Consider exiting at **+10% gain** or trailing stop.
- **Max Positions**: Hold **no more than 5 trades** at once.

## Future Improvements
- **Reinforcement Learning** to optimize exit strategies.
- **Sentiment Analysis** from news & earnings reports.
- **Volume-weighted ranking system** for prioritizing trades.

## Summary
This AI-driven strategy aims to predict whether a stock that rallies in the **pre-market** will continue to perform well after the market opens by analyzing its **past 29 days of trading data**. The model will help filter high-probability trades and improve decision-making for intraday trading.
