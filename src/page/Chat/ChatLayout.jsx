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
import AddNewChat from "./AddNewChat";
import MessageRequest from "./MessageRequest";

function ChatLayout() {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const { contacts, selectedContact, socketConnected } = useSelector(
    (state) => state.global
  );
  const [userStatus, setUserStatus] = useState("online");
  const [isAddNewChat, setIsAddNewChat] = useState(false);
  const [isMessageRequest, setIsMessageRequest] = useState(false);
  const [requests, setRequests] = useState([]);

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

    if (!token) {
      console.warn("No token found");
      return;
    }

    if (token && !socketConnected) {
      dispatch({ type: "socket/connect" });
    }

    // const socket = createSocket(token);
    // socketRef.current = socket;

    // socket.connect();

    // socket.on("connect", () => {
    //   setUserStatus("online");
    //   console.log("Socket connected");
    // });

    // socket.on("update-user-status", handleStatusUpdate);
    // socket.on("update-user-last-message", handleContactUpdate);

    // socket.on("disconnect", () => {
    //   setUserStatus("offline");
    //   console.log("Socket disconnected");
    // });

    // return () => {
    //   socket.off("update-user-status", handleStatusUpdate);
    //   socket.off("update-user-last-message", handleContactUpdate);

    //   socket.disconnect();
    // };
  }, []);

  const handleContactUpdate = (lastMessage) => {
    console.log("lastMessage", lastMessage);
    console.log("contactsRef.current", contactsRef.current);
    dispatch(
      setContacts(
        contactsRef.current.map((c) =>
          c._id === lastMessage.chat_id ? { ...c, lastMessage: lastMessage } : c
        )
      )
    );
  };

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

  const fetchAllRequest = async () => {
    try {
      const res = await api.get("/request/fetch-all-requests");
      if (res.status === 200) {
        setRequests(res?.data?.response || []);
      } else {
        dispatch(throwError(res.data.message));
      }
    } catch (err) {
      dispatch(handelCatch(err));
    }
  };

  // useEffect(() => {}, []);

  useEffect(() => {
    fetchAllContacts();
    fetchAllRequest();
  }, []);

  return (
    <div className="chat-layout-component">
      {isAddNewChat && (
        <AddNewChat
          show={isAddNewChat}
          onHide={() => setIsAddNewChat(false)}
          socketRef={socketRef}
        />
      )}
      {isMessageRequest && (
        <MessageRequest
          requestList={requests}
          show={isMessageRequest}
          onHide={() => setIsMessageRequest(false)}
          fetchAllRequest={fetchAllRequest}
        />
      )}
      <div className="chat-layout">
        <div className="chat-layout-sidebar">
          <ChatSidebar socketRef={socketRef} />
        </div>
        <div className="chat-layout-chat-area">
          <ChatHeader />
          <ChatArea socketRef={socketRef} />
        </div>
      </div>
    </div>
  );
}

export default ChatLayout;
