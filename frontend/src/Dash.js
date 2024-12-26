import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

  // Fetch balance data
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/balance');
        setBalance(response.data); 
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError('Failed to fetch balance');
      }
    };

    fetchBalance();
  }, []);

  return (
    <div>
      <header>
        <h1>Dashboard</h1>
      </header>
      <main>
        <section>
          <h2>Account Balance</h2>
          {error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : balance ? (
            <div>
              <p>Cash: ${balance.cash}</p>
              <p>Buying Power: ${balance.buying_power}</p>
              <p>Equity: ${balance.equity}</p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </section>
        <section>
          <h2>Section 2</h2>
          <p>Content for section 2</p>
        </section>
        <section>
          <h2>Section 3</h2>
          <p>Content for section 3</p>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
