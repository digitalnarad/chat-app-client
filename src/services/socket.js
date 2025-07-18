// src/socket.js
import { io } from "socket.io-client";

// const baseURL = "http://localhost:8000";
const baseURL = "https://chat-app-server-54ar.onrender.com";
export const createSocket = (token) => {
  return io(baseURL, {
    transports: ["websocket"],
    autoConnect: false,
    auth: {
      token: token,
    },
    withCredentials: true,
  });
};
