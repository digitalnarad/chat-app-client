import { createSlice } from "@reduxjs/toolkit";

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
  onlineUsers: {},
  typingUsers: {},
  requests: [],

  // Socket state - ADD THIS
  socketConnected: false,

  // Loading states
  loading: {
    contacts: false,
    messages: false,
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
    setContacts(state, action) {
      state.contacts = action.payload;
    },
    setSelectedContact(state, action) {
      state.selectedContact = action.payload;
    },

    socketConnected(state, action) {
      state.socketConnected =
        action.payload !== undefined ? action.payload : true;
    },

    socketDisconnected(state) {
      state.socketConnected = false;
      state.onlineUsers = {};
      state.typingUsers = {};
    },
  },
});

export const handelCatch = (error) => async (dispatch) => {
  let status = error?.response?.status;
  let messsage = error?.response?.data?.message || "Something went wrong!";
  let returnCatch = {
    status: status,
    messsage: messsage,
  };
  if (status === 401) {
    dispatch(throwError("Session is expired"));
    dispatch(setAuthData(null));
    localStorage.removeItem("authData");
  } else {
    dispatch(
      setErrorData({
        show: true,
        message: messsage,
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
  localStorage.removeItem("token");
};

export const {
  setAuthData,
  setErrorData,
  setAuthToken,
  setContacts,
  setSelectedContact,
  socketConnected,
  socketDisconnected,
} = globalSlice.actions;

export default globalSlice.reducer;
