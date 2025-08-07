import api from "../services/api";
import {
  fetchContacts,
  setContacts,
  setContactsLoading,
  setLiveMessages,
  setReadReceipts,
  setRequests,
  setSelectedContact,
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
    const findContact = contacts.find((c) => c._id === payload._id);
    let updatedReadRecipients = false;
    if (selectedContact?._id === payload._id) {
      console.log("selectedContact?.participant?._id", selectedContact);
      dispatch({
        type: "socket/emit",
        payload: {
          event: "mark-as-read",
          data: {
            chat_id: payload._id,
            receiver_id: selectedContact?.participant?._id,
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
    dispatch(
      setContacts([
        {
          ...findContact,
          unread_count:
            selectedContact?._id === payload._id ? 0 : payload.unread_count,
        },
        ...filteredContacts,
      ])
    );
  };

  const receiveUserTyping = (payload) => {
    const { chatId, isTyping, userId } = payload;
    const contacts = store.getState().global.contacts;
    const selectedContact = store.getState().global.selectedContact;
    if (selectedContact?._id === chatId.toString()) {
      dispatch(
        setSelectedContact({ ...selectedContact, isUserTyping: isTyping })
      );
    }
    const updatedContacts = contacts.map((c) => {
      if (c._id.toString() === chatId.toString()) {
        return {
          ...c,
          isUserTyping: isTyping,
        };
      }
      return c;
    });
    dispatch(setContacts([...updatedContacts]));
  };

  const updateMessageRecipients = (payload) => {
    const selectedContact = store.getState().global.selectedContact;
    const { chatId } = payload;

    if (selectedContact?._id === chatId.toString()) {
      dispatch(
        setReadReceipts([
          {
            ...payload,
          },
        ])
      );
    }
  };

  return {
    updateUserStatus,
    receiveRequest,
    removeRequest,
    newChat,
    acceptRequest,
    receiveMessage,
    updateChatRecipients,
    receiveUserTyping,
    updateMessageRecipients,
  };
}
