import { useEffect, useRef, useState } from "react";
import ChatArea from "./ChatArea";
import ChatHeader from "./ChatHeader";
import ChatSidebar from "./ChatSidebar";
import "./Chat.css";
import { createSocket } from "../../services/socket";
import api from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import {
  handelCatch,
  setContacts,
  setSelectedContact,
  throwError,
} from "../../store/globalSlice";

function ChatLayout() {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const { contacts, selectedContact } = useSelector((state) => state.global);
  const [userStatus, setUserStatus] = useState("online");

  const contactsRef = useRef([]);
  const selectedContactRef = useRef(null);

  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // if (contacts.length === 0) {
    //   console.warn("No contacts found, fetching...");
    //   fetchAllContacts();
    //   return;
    // }
    if (!token) {
      console.warn("No token found");
      return;
    }

    const socket = createSocket(token);
    socketRef.current = socket;

    socket.connect();

    socket.on("connect", () => {
      setUserStatus("online");
      console.log("Socket connected");
    });

    socket.on("update-user-status", handleStatusUpdate);

    socket.on("disconnect", () => {
      setUserStatus("offline");
      console.log("Socket disconnected");
    });

    return () => {
      socket.off("update-user-status", handleStatusUpdate);
      socket.disconnect();
    };
  }, []);

  const handleStatusUpdate = ({ userId, status, at }) => {
    const activeStatus = { status, at };

    dispatch(
      setContacts(
        contactsRef.current.map((contact) =>
          contact.participant._id === userId
            ? {
                ...contact,
                participant: { ...contact.participant, activeStatus },
              }
            : contact
        )
      )
    );

    const selected = selectedContactRef.current;
    if (selected?.participant._id === userId) {
      dispatch(
        setSelectedContact({
          ...selected,
          participant: { ...selected.participant, activeStatus },
        })
      );
    }
  };

  const fetchAllContacts = async () => {
    try {
      const res = await api.get("/chat/fetch-all-chats");
      if (res.status === 200) {
        // Handle successful response
        const chats = res.data.response || [];
        dispatch(setContacts(chats));
        dispatch(setSelectedContact(chats[0] || null));
      } else {
        dispatch(throwError(res.data.message || "Failed to fetch contacts"));
      }
    } catch (error) {
      dispatch(handelCatch(error.message));
    }
  };

  useEffect(() => {
    fetchAllContacts();
  }, []);
  return (
    <div className="chat-layout-component">
      <div className="chat-layout">
        <div className="chat-layout-sidebar">
          <ChatSidebar socketRef={socketRef} />
        </div>
        <div className="chat-layout-chat-area">
          <ChatHeader />
          {selectedContact && socketRef.current && (
            <ChatArea socketRef={socketRef} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatLayout;
