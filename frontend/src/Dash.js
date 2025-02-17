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
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        mb: 4,
        // Dark background & white text for the entire container
        backgroundColor: "#1A1A1E",
        color: "#FFFFFF",
        minHeight: "100vh",
        borderRadius: 2,
        padding: 4,
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}
      >
        Portfolio
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Portfolio Chart (Placeholder) */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              backgroundColor: "#24252A",
              border: "1px solid #2F3035",
              color: "#FFF",
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Portfolio Chart
              </Typography>
              {/* Placeholder for chart */}
              <Box
                sx={{
                  height: 250,
                  backgroundColor: "#2F3035",
                  borderRadius: 2,
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Wallet (Account Balance) */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              backgroundColor: "#24252A",
              border: "1px solid #2F3035",
              color: "#FFF",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Wallet
              </Typography>
              {balance ? (
                <Box>
                  <Typography>Cash: ${balance.cash}</Typography>
                  <Typography>Buying Power: ${balance.buying_power}</Typography>
                  <Typography>Equity: ${balance.equity}</Typography>
                </Box>
              ) : (
                <CircularProgress sx={{ color: "#FFF" }} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Market Overview */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              backgroundColor: "#24252A",
              border: "1px solid #2F3035",
              color: "#FFF",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Market Overview
              </Typography>
              <Typography
                sx={{
                  color: marketStatus === "Open" ? "#4ADE80" : "#F87171",
                  fontWeight: "bold",
                }}
              >
                {marketStatus || "Checking..."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Strategy Panel (Trading Robot Status) */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              backgroundColor: "#24252A",
              border: "1px solid #2F3035",
              color: "#FFF",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Strategy Panel
              </Typography>
              <Typography>Robot Status: {robotStatus}</Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={startRobot}
                  sx={{
                    backgroundColor: "#4ADE80",
                    color: "#000",
                    "&:hover": { backgroundColor: "#3DBA6C" },
                  }}
                >
                  Start Robot
                </Button>
                <Button
                  variant="contained"
                  onClick={stopRobot}
                  sx={{
                    ml: 2,
                    backgroundColor: "#F87171",
                    color: "#000",
                    "&:hover": { backgroundColor: "#E63946" },
                  }}
                >
                  Stop Robot
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Strategy Settings (Trading Robot Form) */}
        <Grid item xs={12}>
          <Card
            sx={{
              backgroundColor: "#24252A",
              border: "1px solid #2F3035",
              color: "#FFF",
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Set Your Strategy
              </Typography>
              <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  label="Stock Ticker"
                  name="ticker"
                  value={form.ticker}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ style: { color: "#AAA" } }}
                  inputProps={{ style: { color: "#FFF" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#444" },
                      "&:hover fieldset": { borderColor: "#666" },
                    },
                  }}
                />
                <TextField
                  label="Short-Term Interval"
                  type="number"
                  name="shortInterval"
                  value={form.shortInterval}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ style: { color: "#AAA" } }}
                  inputProps={{ style: { color: "#FFF" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#444" },
                      "&:hover fieldset": { borderColor: "#666" },
                    },
                  }}
                />
                <TextField
                  label="Long-Term Interval"
                  type="number"
                  name="longInterval"
                  value={form.longInterval}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ style: { color: "#AAA" } }}
                  inputProps={{ style: { color: "#FFF" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#444" },
                      "&:hover fieldset": { borderColor: "#666" },
                    },
                  }}
                />
                <TextField
                  label="Trade Amount ($)"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ style: { color: "#AAA" } }}
                  inputProps={{ style: { color: "#FFF" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#444" },
                      "&:hover fieldset": { borderColor: "#666" },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Logout Button */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          onClick={logout}
          sx={{
            backgroundColor: "#3B82F6",
            color: "#FFF",
            "&:hover": { backgroundColor: "#2563EB" },
          }}
        >
          Logout
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard;
