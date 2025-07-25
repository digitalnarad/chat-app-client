import { createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

const initialState = {
  // Auth state
  authData: null,
  authToken: localStorage.getItem("token") || null,

  // UI state
  errorData: {
    show: false,
    message: "",
    type: "",
  },

  // Chat state - expanded for socket integration
  contacts: [],
  selectedContact: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  requests: [],
  liveMessages: null,

  // Socket state - ADD THIS
  socketConnected: false,

  // Loading states
  loading: {
    contacts: false,
    messages: false,
    request: false,
    sendingMessage: false,
  },
};
const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setAuthData(state, action) {
      state.authData = action.payload;
    },
    setErrorData(state, action) {
      state.errorData = action.payload;
    },
    setAuthToken(state, action) {
      state.authToken = action.payload;
    },

    setSocketConnected(state, action) {
      state.socketConnected = action.payload;
    },

    setSelectedContact(state, action) {
      state.selectedContact = action.payload;
    },

    setContacts(state, action) {
      state.contacts = JSON.parse(JSON.stringify(action.payload));
    },

    setMessages(state, action) {
      state.messages = JSON.parse(JSON.stringify(action.payload));
    },

    setLiveMessages(state, action) {
      state.liveMessages = action.payload;
    },

    addOnlineUsers(state, action) {
      state.onlineUsers = [...state.onlineUsers, action.payload];
    },

    removeOnlineUsers(state, action) {
      state.onlineUsers = state.onlineUsers.filter(
        (user) => user !== action.payload
      );
    },

    addTypingUsers(state, action) {
      state.typingUsers = [...state.typingUsers, action.payload];
    },

    removeTypingUsers(state, action) {
      state.typingUsers = state.typingUsers.filter(
        (user) => user !== action.payload
      );
    },

    setRequests(state, action) {
      state.requests = action.payload;
    },

    // Loading states
    setContactsLoading(state, action) {
      state.loading.contacts = action.payload;
    },
    setMessagesLoading(state, action) {
      state.loading.messages = action.payload;
    },
    setSendingMessageLoading(state, action) {
      state.loading.sendingMessage = action.payload;
    },
    setRequestLoading(state, action) {
      state.loading.request = action.payload;
    },
  },
});

export const handelCatch = (error) => async (dispatch) => {
  let status = error?.response?.status;
  let message =
    error?.response?.data?.message ||
    error?.message ||
    error?.response?.data?.error ||
    "Something went wrong!";
  let returnCatch = {
    status: status,
    message: message,
  };
  if (status === 401) {
    dispatch(throwError("Session is expired"));
    dispatch(setAuthData(null));
    localStorage.removeItem("authData");
  } else {
    dispatch(
      setErrorData({
        show: true,
        message: message,
        type: "error",
      })
    );
  }
  return returnCatch;
};

export const showSuccess = (message) => async (dispatch) => {
  dispatch(
    setErrorData({
      show: true,
      message: message,
      type: "success",
    })
  );
};

export const throwError = (message) => async (dispatch) => {
  let newMessage = message;
  newMessage = message || "Something went wrong!";
  dispatch(
    setErrorData({
      show: true,
      message: newMessage,
      type: "error",
    })
  );
};

export const logout = () => async (dispatch) => {
  dispatch(setAuthToken(null));
  dispatch(setAuthData(null));
  localStorage.removeItem("token");
};

export const verifyToken = (token) => async (dispatch) => {
  try {
    if (!token) return;
    const res = await api.get("/user/token-verification");
    if (res.status === 200) {
      dispatch(setAuthToken(token));
      dispatch(setAuthData(res?.data?.response));
      return;
    }
    dispatch(throwError(res.data.message));
    dispatch(logout(null));
  } catch (error) {
    dispatch(handelCatch(error));
    dispatch(logout(null));
  }
};

export const fetchContacts = () => async (dispatch) => {
  dispatch(setContactsLoading(true));
  try {
    const res = await api.get("/chat/fetch-all-chats");
    if (res.status === 200) {
      const chats = res?.data?.response || [];
      dispatch(setContacts(chats));
      dispatch(setSelectedContact(chats[0] || null));
    } else {
      dispatch(throwError(res.data.message || "Failed to fetch contacts"));
    }
  } catch (error) {
    dispatch(handelCatch(error));
  } finally {
    dispatch(setContactsLoading(false));
  }
};

export const fetchRequests = () => async (dispatch) => {
  dispatch(setRequestLoading(true));
  try {
    const res = await api.get("/request/fetch-all-requests");
    if (res.status === 200) {
      dispatch(setRequests(res?.data?.response || []));
    } else {
      dispatch(throwError(res.data.message));
    }
  } catch (err) {
    dispatch(handelCatch(err));
  } finally {
    dispatch(setRequestLoading(false));
  }
};

export const {
  setAuthData,
  setErrorData,
  setAuthToken,
  setContacts,
  setSelectedContact,
  setSocketConnected,
  addOnlineUsers,
  removeOnlineUsers,
  addTypingUsers,
  removeTypingUsers,
  setRequests,
  setContactsLoading,
  setMessages,
  setMessagesLoading,
  setSendingMessageLoading,
  setRequestLoading,
  setLiveMessages,
} = globalSlice.actions;

export default globalSlice.reducer;
