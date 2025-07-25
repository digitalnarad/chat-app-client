import api from "../services/api";
import {
  fetchContacts,
  setContacts,
  setContactsLoading,
  setLiveMessages,
  setRequests,
  showSuccess,
  throwError,
} from "../store/globalSlice";

export function socketFunctions(store) {
  const { dispatch } = store;
  const updateUserStatus = (payload) => {
    const contacts = store.getState().global.contacts;
    const updatedContacts = contacts.map((c) => {
      if (c.participant._id === payload.userId) {
        return {
          ...c,
          participant: {
            ...c.participant,
            active_status: { status: payload.status, at: payload.at },
          },
        };
      }
      return c;
    });
    dispatch(setContacts(updatedContacts));
  };

  const receiveRequest = (payload) => {
    const requests = store.getState().global.requests;
    dispatch(setRequests([...requests, payload.request]));
    dispatch(showSuccess(payload.message));
  }; // TODO: implement request

  const removeRequest = (payload) => {
    const requests = store.getState().global.requests;
    dispatch(setRequests(requests.filter((r) => r._id !== payload._id)));
  };

  const newChat = async (payload) => {
    dispatch(fetchContacts());
  };

  const acceptRequest = (payload) => {
    const requests = store.getState().global.requests;
    dispatch(setRequests(requests.filter((c) => c._id !== payload)));
  };

  const receiveMessage = (payload) => {
    dispatch(setLiveMessages({ ...payload }));
  };

  const updateChatRecipients = (payload) => {
    const contacts = store.getState().global.contacts;
    const selectedContact = store.getState().global.selectedContact;

    const filteredContacts = contacts.filter((c) => c._id !== payload._id);
    let updatedReadRecipients = false;
    if (selectedContact?._id === payload._id) {
      dispatch({
        type: "socket/emit",
        payload: {
          event: "mark-as-read",
          data: {
            chat_id: payload._id,
          },
          callback: (response) => {
            if (!response.success) {
              dispatch(throwError(response.message));
            }
            updatedReadRecipients = true;
          },
        },
      });
    }
    contacts.map((c) => {
      if (c._id === payload._id) {
        return {
          ...c,
          lastMessage: payload.lastMessage,
          unread_count:
            selectedContact?._id === payload._id ? 0 : payload.unread_count,
        };
      }
      return c;
    });
    dispatch(
      setContacts([
        {
          ...payload,
          unread_count:
            selectedContact?._id === payload._id ? 0 : payload.unread_count,
        },
        ...filteredContacts,
      ])
    );
  };

  return {
    updateUserStatus,
    receiveRequest,
    removeRequest,
    newChat,
    acceptRequest,
    receiveMessage,
    updateChatRecipients,
  };
}
