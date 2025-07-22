import { configureStore } from "@reduxjs/toolkit";
import globalSlice from "./globalSlice";
import socketMiddleware from "../socket/socketMiddleware";

const store = configureStore({
  reducer: {
    global: globalSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore socket-related actions in serializable check
        ignoredActions: ["socket/connect", "socket/emit", "socket/disconnect"],
        // Ignore socket instance in state
        ignoredPaths: ["socket"],
      },
    }).concat(socketMiddleware),
});

export default store;
