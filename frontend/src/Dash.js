import React, { useEffect, useState } from "react";
import api from "./api"; // Axios instance
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Alert,
  TextField,
  Grid,
} from "@mui/material";

const Dashboard = ({ logout }) => {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const [marketStatus, setMarketStatus] = useState(null);
  const [robotStatus, setRobotStatus] = useState("Idle");
  const [form, setForm] = useState({
    ticker: "",
    shortInterval: "",
    longInterval: "",
    amount: "",
  });

  // Fetch account balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await api.get("/api/balance");
        setBalance(response.data);
      } catch (err) {
        console.error("Error fetching balance:", err);
        setError("Failed to fetch balance.");
      }
    };

    const checkMarketStatus = async () => {
      try {
        const marketOpen = await api.get("/api/market-status");
        setMarketStatus(marketOpen.data.open ? "Open" : "Closed");
      } catch (err) {
        console.error("Error checking market status:", err);
        setMarketStatus("Unknown");
      }
    };

    fetchBalance();
    checkMarketStatus();
  }, []);

  // Start trading robot
  const startRobot = async () => {
    try {
      setRobotStatus("Starting...");
      const { ticker, shortInterval, longInterval, amount } = form;
      const response = await api.post("/api/bot/start", {
        symbol: ticker,
        shortWindow: parseInt(shortInterval),
        longWindow: parseInt(longInterval),
        tradeAmount: parseFloat(amount),
      });
      alert(response.data.message);
      setRobotStatus("Running");
    } catch (err) {
      console.error("Error starting robot:", err);
      setRobotStatus("Idle");
    }
  };

  // Stop trading robot
  const stopRobot = async () => {
    try {
      const response = await api.post("/api/bot/stop");
      alert(response.data.message);
      setRobotStatus("Idle");
    } catch (err) {
      console.error("Error stopping robot:", err);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: "bold", textAlign: "center" }}
      >
        InvestCo Dashboard
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={3}>
        {/* Account Balance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Account Balance</Typography>
              {balance ? (
                <Box>
                  <Typography>Cash: ${balance.cash}</Typography>
                  <Typography>Buying Power: ${balance.buying_power}</Typography>
                  <Typography>Equity: ${balance.equity}</Typography>
                </Box>
              ) : (
                <CircularProgress />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Market Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Market Status</Typography>
              <Typography
                sx={{
                  color: marketStatus === "Open" ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {marketStatus || "Checking..."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Trading Robot Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Trading Robot Status</Typography>
              <Typography>{robotStatus}</Typography>
              <Button
                variant="contained"
                color="success"
                onClick={startRobot}
                sx={{ mt: 2 }}
              >
                Start Robot
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={stopRobot}
                sx={{ mt: 2, ml: 2 }}
              >
                Stop Robot
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Trading Robot Form */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Start Trading Robot</Typography>
              <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Stock Ticker"
                  name="ticker"
                  value={form.ticker}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  label="Short-Term Interval"
                  type="number"
                  name="shortInterval"
                  value={form.shortInterval}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  label="Long-Term Interval"
                  type="number"
                  name="longInterval"
                  value={form.longInterval}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  label="Trade Amount ($)"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleInputChange}
                  required
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Button
        variant="contained"
        color="secondary"
        onClick={logout}
        sx={{ mt: 4 }}
      >
        Logout
      </Button>
    </Container>
  );
};

export default Dashboard;
