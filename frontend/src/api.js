import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001", // Replace with your backend URL
});

export default api;
