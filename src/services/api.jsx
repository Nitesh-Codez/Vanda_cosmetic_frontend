import axios from "axios";

const API = axios.create({
  baseURL: "https://vanda-cosmetic.onrender.com/api/user",
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;