import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/login";
import Register from "./auth/Register";
import Dashboard from "./Dash";
import "./App.css";

// Check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem("token"); // Check if token exists
};

// Logout function
const logout = () => {
  localStorage.removeItem("token"); // Remove token from localStorage
  window.location.href = "/login"; // Redirect to login page
};

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Public route wrapper
const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard logout={logout} /> {/* Pass logout function as a prop */}
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
