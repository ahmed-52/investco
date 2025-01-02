const Trading = () => {
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
          <h2 className="text-lg font-bold mb-3">Your Portfolio</h2>
          <div className="bg-gray-300 h-52 flex items-center justify-center">
            <span>Goal is to display a chart</span>
          </div>
        </div>
        
        {/* Balance block */}
        <div className="bg-gray-100 p-4">
          <h2 className="text-lg font-bold mb-3">Balance</h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Cash */}
            <div className="text-center">
              <p className="text-2xl font-bold">$189k</p>
              <p className="text-sm">Cash</p>
            </div>
            {/* Buying Power */}
            <div className="text-center">
              <p className="text-2xl font-bold">$89k</p>
              <p className="text-sm">Buying Power</p>
            </div>
            {/* Daily Change */}
            <div className="text-center">
              <p className="text-2xl font-bold">- $1040</p>
              <p className="text-sm">Daily Change</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Trading Bot (full height) */}
      <div className="bg-gray-100 p-4 flex flex-col">
        {/* Header: Title + Status */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Trading Bot</h2>
          <span className="text-green-600 font-bold">Active</span>
        </div>

        {/* Bot info row */}
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <p className="uppercase text-xs">Ticker Trading</p>
            <p className="text-xl font-bold">$RKLB</p>
          </div>
          <div>
            <p className="uppercase text-xs">Balance</p>
            <p className="text-xl font-bold">$52,405</p>
          </div>
          <div>
            <p className="uppercase text-xs">Strategy</p>
            <p className="text-xl font-bold">Moving Average</p>
          </div>
        </div>

        {/* Intervals row */}
        <div className="flex gap-x-8 mt-4">
          <div>
            <p className="uppercase text-xs">Short-Term Interval</p>
            <p className="text-xl font-bold">10s</p>
          </div>
          <div>
            <p className="uppercase text-xs">Long-Term Interval</p>
            <p className="text-xl font-bold">1000s</p>
          </div>
        </div>

        {/* Start Amount */}
        <div className="mt-4">
          <p className="uppercase text-xs">Start Amount</p>
          <p className="text-xl font-bold">$40k</p>
        </div>

        {/* Stop Bot button */}
        <button className="bg-red-700 text-white mt-4 px-4 py-2 w-fit">
          Stop Bot
        </button>

        {/* Bot Log (scroll area) */}
        <div className="bg-white mt-4 p-2 flex-1 overflow-y-auto">
          <p className="text-sm">[Bot] Checking symbol RKLB | shortWindow=10, longWindow=100, tradeAmount=10000</p>
          <p className="text-sm">[Bot] Short MA: 26.939, Long MA: 26.789</p>
          <p className="text-sm">[Bot] Currently holding 370 shares of RKLB.</p>
          <p className="text-sm">[Bot] Bullish signal, but we already hold shares. Doing nothing.</p>
        </div>
      </div>
    </div>


            </main>
        </div>
    );
};

export default Trading;
