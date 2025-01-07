import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from './api';
const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await api.get('/api/portfolio'); // Backend route
        setPositions(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching positions:', err.message);
        setError('Failed to load positions.');
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading positions...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="bg-white p-4 shadow h-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-sm">
            <th className="py-3 px-4">Symbol</th>
            <th className="py-3 px-4 text-right">Qty</th>
            <th className="py-3 px-4 text-right">Avg Price</th>
            <th className="py-3 px-4 text-right">Market Value</th>
            <th className="py-3 px-4 text-right">Unrealized P/L</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position, index) => (
            <tr
              key={index}
              className={`text-sm ${
                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              } hover:bg-gray-100`}
            >
              <td className="py-3 px-4">{position.symbol}</td>
              <td className="py-3 px-4 text-right">{position.qty}</td>
              <td className="py-3 px-4 text-right">
                ${parseFloat(position.avg_entry_price).toLocaleString()}
              </td>
              <td className="py-3 px-4 text-right">
                ${parseFloat(position.market_value).toLocaleString()}
              </td>
              <td
                className={`py-3 px-4 text-right font-bold ${
                  parseFloat(position.unrealized_pl) >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                ${parseFloat(position.unrealized_pl).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Positions;
