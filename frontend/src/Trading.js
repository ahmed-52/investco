import api from "./api";
import Positions from "./Chart"
import { useEffect, useState } from "react";

const Trading = () => {


    const [botRunning, setBotRunning] = useState(false);
    const [symbol, setSymbol] = useState("");
    const [strategy, setStrategy] = useState("");
    const [shortTermInterval, setShortTermInterval] = useState(null);
    const [longTermInterval, setLongTermInterval] = useState(null);
    const [startAmount, setStartAmount] = useState(0);
    const [allocated, setAllocated] = useState(0);
    const [statusText, setStatusText] = useState("Idle");
    const [balance, setBalance] = useState(null);
  
    useEffect(() => {
      const fetchBotStatus = async () => {
        try {
          const res = await api.get("/api/bot/status");


          console.log("Bot status data:", res.data);

          if (res.data === false) {
            setBotRunning(false);
            setStatusText("Inactive");
            setSymbol("");
            setStrategy("");
            setShortTermInterval(null);
            setLongTermInterval(null);
            setStartAmount(0);
            setAllocated(0);
          } else {

            setBotRunning(true);
            setStatusText("Active");
            setSymbol(res.data.symbol || "");
            setStrategy(res.data.strategy || "");
            setShortTermInterval(res.data.short_interval || 0);
            setLongTermInterval(res.data.long_interval || 0);
            setStartAmount(res.data.initial_balance || 0);
            setAllocated(res.data.marketValue || 0);
          }
        } catch (error) {
          console.error("Error fetching bot status:", error);
          setBotRunning(false);
          setStatusText("Error fetching bot status");
        }
      };
      const fetchBalance = async () => {
        try {
          const response = await api.get("/api/balance");
          setBalance(response.data);
        } catch (err) {
          console.error("Error fetching balance:", err);
        }
      };
  
      fetchBotStatus();
      fetchBalance();
    }, []);

    const [form, setForm] = useState({
      ticker: "",
      shortInterval: "",
      longInterval: "",
      amount: "",
    });


    // functions to start and stop the trading bot


    const startBot = async () => {
      try {
        setStatusText("Starting...");
        const { ticker, shortInterval, longInterval, amount } = form;
        const response = await api.post("/api/bot/start", {
          symbol: ticker,
          shortWindow: parseInt(shortInterval),
          longWindow: parseInt(longInterval),
          tradeAmount: parseFloat(amount),
        });
        alert(response.data.message);
        setBotRunning(true);
        setStatusText("Active");
      } catch (err) {
        console.error("Error starting bot:", err);
        setStatusText("Idle");
      }
    };
    
    const stopBot = async () => {
      try {
        const response = await api.post("/api/bot/stop");
        alert(response.data.message);
        setBotRunning(false);
        setStatusText("Idle");
      } catch (err) {
        console.error("Error stopping bot:", err);
      }
    };





    function formatBalance(balance) {
      const formattedBalance = {};
    
      for (const key in balance) {
        if (balance.hasOwnProperty(key)) {
          const value = balance[key];
          // Convert string to number before formatting
          if (!isNaN(value)) {
            formattedBalance[key] = Number(value).toLocaleString('en-US', {
              minimumFractionDigits: 2, // Keep two decimal places
              maximumFractionDigits: 2,
            });
          } else {
            formattedBalance[key] = value; // Keep non-numeric values unchanged
          }
        }
      }
    
      return formattedBalance;
    }

    const balance2 = formatBalance(balance);
    // console.log(balance2);

    return (
        <div className="flex w-full h-screen">
            <aside className="bg-[#eeeeee] basis-[10%] shrink-0 h-full">
                Sidebar
            </aside>
            <main className="basis-[90%] mx-[15px] mt-[30px]">
                <section>
                    <h2 className="text-xs text-[#505050] text-start">Pages / Dashboard</h2>
                    <h1 className="font-space font-bold text-2xl text-start">
                        Welcome Back Ahmed Abdulla
                    </h1>
                </section>

                <div className="grid grid-cols-[2fr,1fr] gap-4 w-full">
      {/* LEFT COLUMN: Portfolio (top) + Balance (bottom) */}
      <div className="flex flex-col gap-4">
        
        {/* Portfolio block */}
        <div className="bg-gray-100 p-4">
  <h2 className="text-lg font-bold mb-3 font-space">Your Portfolio</h2>

      <div className="bg-gray-300 h-52 overflow-y-scroll">
        <Positions />
      </div>
    </div>

        
        {/* Balance block */}
        <div className="bg-gray-100 p-4">
          <h2 className="text-lg font-bold mb-3 font-space">Balance</h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Cash */}
            <div className="text-center">
              <p className="text-2xl font-bold font-space">${balance2.cash}</p>
              <p className="text-sm font-space">Cash</p>
            </div>
            {/* Buying Power */}
            <div className="text-center">
              <p className="text-2xl font-bold font-space">${balance2.buying_power}</p>
              <p className="text-sm font-space">Buying Power</p>
            </div>
            {/* Daily Change */}
            <div className="text-center">
              <p className="text-2xl font-bold font-space">${balance2.equity}</p>
              <p className="text-sm font-space">Eauity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-4 flex flex-col">
        {/* Header: Title + Status */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Trading Bot</h2>
          <span className="text-green-600 font-bold">{statusText}</span>
        </div>

        {statusText === "Active" ? (
                <>
      
        <div className="flex flex-wrap gap-x-8 gap-y-2">
        <div>
          <p className="uppercase text-xs">Ticker Trading</p>
          <p className="text-xl font-bold">{symbol}</p>
        </div>
        <div>
          <p className="uppercase text-xs">Balance</p>
          <p className="text-xl font-bold">{allocated}</p>
        </div>
        <div>
          <p className="uppercase text-xs">Strategy</p>
          <p className="text-xl font-bold">Moving Average</p>
        </div>
      </div>

      <div className="flex gap-x-8 mt-4">
          <div>
            <p className="uppercase text-xs">Short-Term Interval</p>
            <p className="text-xl font-bold">{longTermInterval}</p>
          </div>
          <div>
            <p className="uppercase text-xs">Long-Term Interval</p>
            <p className="text-xl font-bold">{shortTermInterval}</p>
          </div>
        </div>

           {/* Start Amount */}
           <div className="mt-4">
          <p className="uppercase text-xs">Start Amount</p>
          <p className="text-xl font-bold">{startAmount}</p>
        </div>


      </> ) : 
      ( <>
        {/* Form to Start Bot */}
        <form className="grid grid-cols-1 gap-6">
          {/* Stock Symbol */}
          <div>
            <label htmlFor="botSymbol" className="block text-xs text-gray-500 uppercase mb-1">
              Stock Symbol
            </label>
            <input
              id="botSymbol"
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter stock symbol (e.g., TSLA)"
              name="ticker"
              value={form.ticker}
              onChange={(e) =>
                setForm((prevForm) => ({ ...prevForm, [e.target.name]: e.target.value }))
              }
            />
          </div>
  
          {/* Short Interval */}
          <div>
            <label htmlFor="shortInterval" className="block text-xs text-gray-500 uppercase mb-1">
              Short-Term Interval (s)
            </label>
            <input
              id="shortInterval"
              type="number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter short-term interval"
              name="shortInterval"
              value={form.shortInterval}
              onChange={(e) =>
                setForm((prevForm) => ({ ...prevForm, [e.target.name]: e.target.value }))
              }
            />
          </div>
  
          {/* Long Interval */}
          <div>
            <label htmlFor="longInterval" className="block text-xs text-gray-500 uppercase mb-1">
              Long-Term Interval (s)
            </label>
            <input
              id="longInterval"
              type="number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter long-term interval"
              name="longInterval"
              value={form.longInterval}
              onChange={(e) =>
                setForm((prevForm) => ({ ...prevForm, [e.target.name]: e.target.value }))
              }
            />
          </div>
  
          <div>
            <label htmlFor="tradeAmount" className="block text-xs text-gray-500 uppercase mb-1">
              Starting Amount ($)
            </label>
            <input
              id="tradeAmount"
              type="number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter starting amount"
              name="amount"
              value={form.amount}
              onChange={(e) =>
                setForm((prevForm) => ({ ...prevForm, [e.target.name]: e.target.value }))
              }
            />
          </div>
        </form>
      </>)
      
      
      }


     

        {/* Stop Bot button */}

        
        {statusText === "Active" ? (

          <button 
        onClick={stopBot}
        className="bg-red-700 hover:bg-red-950 rounded-lg text-white mt-4 px-4 py-2 w-fit">
          Stop Bot
        </button>   ):

         (  <button 
        onClick={startBot}
        className="bg-green-700 hover:bg-green-950 rounded-lg text-white mt-4 px-4 py-2 w-fit">
          Start Bot
        </button>
            )}

        {/* Bot Log (scroll area) */}
        <div className="bg-white mt-4 p-2 flex-1 overflow-y-auto">
          <p className="text-sm">[Bot] Checking symbol RKLB | shortWindow=10, longWindow=100, tradeAmount=10000</p>
          <p className="text-sm">[Bot] Short MA: 26.939, Long MA: 26.789</p>
          <p className="text-sm">[Bot] Currently holding 370 shares of RKLB.</p>
          <p className="text-sm">[Bot] Bullish signal, but we already hold shares. Doing nothing.</p>
        </div>
      </div>
          </div>



          <div className="bg-white p-4 mt-6 shadow rounded">
          <h2 className="text-lg font-bold mb-3">Trade Stocks</h2>
          <form className="flex flex-col gap-4">
            {/* Symbol Input */}
            <div>
              <label className="text-sm font-medium" htmlFor="tradeSymbol">
                Symbol
              </label>
              <input
                id="tradeSymbol"
                type="text"
                className="border border-gray-300 rounded w-full px-2 py-1"
                placeholder="Enter stock symbol (e.g., AAPL)"
              />
            </div>

            {/* Quantity Input */}
            <div>
              <label className="text-sm font-medium" htmlFor="tradeQty">
                Quantity
              </label>
              <input
                id="tradeQty"
                type="number"
                className="border border-gray-300 rounded w-full px-2 py-1"
                placeholder="Enter quantity"
              />
            </div>

            {/* Buy/Sell Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Buy
              </button>
              <button
                type="button"
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Sell
              </button>
            </div>
          </form>
        </div>



            </main>
        </div>
    );
};

export default Trading;
