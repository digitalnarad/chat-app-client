import { setContacts } from "../store/globalSlice";

export function socketFunctions(store) {
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
    store.dispatch(setContacts(updatedContacts));
  };

  return {
    updateUserStatus,
  };
}
