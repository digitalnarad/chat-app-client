// store/middleware/socketMiddleware.js
import { io } from "socket.io-client";
import {
  //   messageReceived,
  //   userStatusUpdated,
  //   typingStatusChanged,
  //   requestChanged,
  //   updateUserLastMessage,
  socketConnected,
  socketDisconnected,
  setAuthToken,
  setAuthData,
} from "../store/globalSlice";
import { socketFunctions } from "./socketFunctions";

// ✅ Declare socket at module level
let socket = null;

const socketMiddleware = (store) => (next) => (action) => {
  if (action.type === "socket/connect") {
    const token = store.getState().global.authToken;

    // ✅ Check if token exists before connecting
    if (!token) {
      console.log("❌ No token available, socket connection skipped");
      store.dispatch(socketConnected(false));
      return next(action);
    }

    if (socket) socket.disconnect();

    socket = io("http://localhost:8000", {
      auth: { token },
    });

    // Handle connection success
    socket.on("connect", () => {
      console.log("✅ Socket connected successfully");
      store.dispatch(socketConnected(true));
    });

    // Handle connection error (invalid token, etc.)
    socket.on("connect_error", (error) => {
      console.log("❌ Socket connection failed:", error.message);
      store.dispatch(socketDisconnected());

      // If unauthorized, clear auth data
      if (
        error.message === "Unauthorized" ||
        error.message === "Invalid token"
      ) {
        store.dispatch(setAuthToken(null));
        store.dispatch(setAuthData(null));
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      store.dispatch(socketDisconnected());
    });

    const socketFunc = socketFunctions(store);

    // ✅ Set up all your socket listeners using the action creators
    socket.on("update-user-status", socketFunc.updateUserStatus);

    socket.on("receive-message", (message) => {
      console.log("receive-message", message);
    });

    socket.on("update-user-last-message", (message) => {
      console.log("update-user-last-message", message);
    });

    socket.on("change-request", (data) => {
      console.log("change-request", data);
    });

    socket.on("request-accepted", (data) => {
      console.log("request-accepted", data);
    });

    socket.on("typing", (data) => {
      console.log("typing", data);
    });

    socket.on("read-receipt", (data) => {
      // You might want to add a readReceiptUpdated action to your slice
      console.log("Read receipt received:", data);
    });

    socket.on("new-chat", (data) => {
      // You might want to add a readReceiptUpdated action to your slice
      console.log("new-chat:", data);
    });

    store.socket = socket;
  }

  // ✅ Auto-connect when auth token is set
  if (action.type === "global/setAuthToken") {
    const token = action.payload;

    if (token && !socket) {
      // Token was set and no socket connection exists
      setTimeout(() => {
        store.dispatch({ type: "socket/connect" });
      }, 100);
    } else if (!token && socket) {
      // Token was cleared, disconnect socket
      socket.disconnect();
      socket = null;
      store.dispatch(socketDisconnected());
    }
  }

  // ✅ Auto-connect when auth data is set
  if (action.type === "global/setAuthData") {
    const authData = action.payload;
    const currentToken = store.getState().global.authToken;

    if (authData && currentToken && !socket) {
      setTimeout(() => {
        store.dispatch({ type: "socket/connect" });
      }, 100);
    }
  }

  if (action.type === "socket/emit") {
    const { event, data, callback } = action.payload;
    if (event === "leave-chat") {
      console.log("event", event);
    }

    if (!socket) {
      console.log("❌ Socket not connected, cannot emit event:", event);
      if (callback)
        callback({
          success: false,
          message: "Socket not connected",
        });
      return next(action);
    }

    socket.emit(event, data, callback);
  }

  if (action.type === "socket/disconnect") {
    console.log("socket/disconnect", socket);
    if (socket) {
      socket.disconnect();
      socket = null;
      store.dispatch(socketDisconnected());
    }
  }

  return next(action);
};

export default socketMiddleware;
