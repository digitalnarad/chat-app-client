import { setContacts, setRequests, showSuccess } from "../store/globalSlice";

export function socketFunctions(store) {
  const { dispatch } = store;
  const updateUserStatus = (payload) => {
    console.log("payload", payload);
    const contacts = store.getState().global.contacts;
    const updatedContacts = contacts.map((c) => {
      if (c.participant._id === payload.userId) {
        console.log(c.participant._id, c.participant.active_status.status);
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

  return {
    updateUserStatus,
    receiveRequest,
    removeRequest,
  };
}
