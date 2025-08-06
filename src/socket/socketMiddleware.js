import { io } from "socket.io-client";
import {
  setAuthToken,
  setAuthData,
  setSocketConnected,
} from "../store/globalSlice";
import { socketFunctions } from "./socketFunctions";

let socket = null;

const socketMiddleware = (store) => (next) => (action) => {
  if (action.type === "socket/connect") {
    const token = store.getState().global.authToken;

    // ✅ Check if token exists before connecting
    if (!token) {
      console.log("❌ No token available, socket connection skipped");
      store.dispatch(setSocketConnected(false));
      return next(action);
    }

    if (socket) socket.disconnect();

    const baseURL = "http://localhost:8000";
    // const baseURL = "https://chat-app-server-54ar.onrender.com";

    socket = io(baseURL, {
      auth: { token },
    });

    // Handle connection success
    socket.on("connect", () => {
      console.log("✅ Socket connected successfully");
      store.dispatch(setSocketConnected(true));
    });

    // Handle connection error (invalid token, etc.)
    socket.on("connect_error", (error) => {
      console.log("❌ Socket connection failed:", error.message);
      store.dispatch(setSocketConnected(false));

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
      store.dispatch(setSocketConnected(false));
    });

    const socketFunc = socketFunctions(store);

    // ✅ Set up all socket listeners using the action creators
    socket.on("update-user-status", socketFunc.updateUserStatus);

    socket.on("remove-request", socketFunc.removeRequest);

    socket.on("receive-request", socketFunc.receiveRequest);

    socket.on("receive-message", socketFunc.receiveMessage);

    socket.on("receive-updated-message-chat", socketFunc.updateChatRecipients);

    socket.on("typing", socketFunc.receiveUserTyping);

    socket.on("read-receipt", (data) => {
      console.log("Read receipt received:", data);
    });

    socket.on("accept-request", socketFunc.acceptRequest);

    socket.on("new-chat", socketFunc.newChat);

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
      store.dispatch(setSocketConnected(false));
    }
  }

  // ✅ Auto-connect when auth data is set
  // if (action.type === "global/setAuthData") {
  //   const authData = action.payload;
  //   const currentToken = store.getState().global.authToken;

  //   if (authData && currentToken && !socket) {
  //     setTimeout(() => {
  //       store.dispatch({ type: "socket/connect" });
  //     }, 100);
  //   }
  // }

  if (action.type === "socket/emit") {
    const { event, data, callback } = action.payload;
    console.log("event", event);

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
      store.dispatch(setSocketConnected(false));
    }
  }

  return next(action);
};

export default socketMiddleware;
