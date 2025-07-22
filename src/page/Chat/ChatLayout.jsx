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
  setRequests,
  setSelectedContact,
  throwError,
} from "../../store/globalSlice";
import AddNewChat from "./AddNewChat";
import MessageRequest from "./MessageRequest";

function ChatLayout() {
  const dispatch = useDispatch();
  const { selectedContact, socketConnected, requests } = useSelector(
    (state) => state.global
  );
  const [isAddNewChat, setIsAddNewChat] = useState(false);
  const [isMessageRequest, setIsMessageRequest] = useState(false);

  const selectedContactRef = useRef(null);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    const connectSocket = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token found");
        return;
      }

      // Only connect if page is loaded and socket is not connected
      if (token && !socketConnected) {
        console.log("🔌 Connecting socket after page load");
        dispatch({ type: "socket/connect" });
        dispatch({
          type: "socket/emit",
          payload: {
            event: "update-my-status",
            data: { status: "online" },
            callback: () => {
              console.log("✅ Status set to online after page load");
              if (selectedContactRef?.current?._id) {
                dispatch({
                  type: "socket/emit",
                  payload: {
                    event: "join-chat",
                    data: { chatId: selectedContactRef?.current?._id },
                    callback: () => {},
                  },
                });
              }
            },
          },
        });
      }
    };

    connectSocket();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && socketConnected) {
        handleUserOffline();
      } else if (
        document.visibilityState === "visible" &&
        !socketConnected &&
        isPageLoaded
      ) {
        connectSocket(); // Reconnect only if page was loaded
      }
    };

    const handleBeforeUnload = () => {
      if (socketConnected) {
        handleUserOffline();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("offline", handleUserOffline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("offline", handleUserOffline);
    };
  }, [socketConnected]); // Add isPageLoaded to dependencies

  const handleUserOffline = () => {
    if (!socketConnected) return;

    const chatId = selectedContactRef?.current?._id;

    if (!chatId) {
      dispatch({
        type: "socket/emit",
        payload: {
          event: "update-my-status",
          data: { status: "offline" },
          callback: () => {
            dispatch({ type: "socket/disconnect" });
          },
        },
      });
      return;
    }

    dispatch({
      type: "socket/emit",
      payload: {
        event: "leave-chat",
        data: { chatId },
        callback: (response) => {
          if (!response?.success) {
            dispatch(throwError(response.message));
            return;
          }

          dispatch({
            type: "socket/emit",
            payload: {
              event: "update-my-status",
              data: { status: "offline" },
              callback: () => {
                dispatch({ type: "socket/disconnect" });
              },
            },
          });
        },
      },
    });
  };

  const fetchAllContacts = async () => {
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
      dispatch(handelCatch(error.message));
    }
  };

  const fetchAllRequest = async () => {
    try {
      const res = await api.get("/request/fetch-all-requests");
      if (res.status === 200) {
        dispatch(setRequests(res?.data?.response || []));
      } else {
        dispatch(throwError(res.data.message));
      }
    } catch (err) {
      dispatch(handelCatch(err));
    }
  };

  useEffect(() => {
    fetchAllContacts();
    fetchAllRequest();
  }, []);

  return (
    <div className="chat-layout-component">
      {isAddNewChat && (
        <AddNewChat show={isAddNewChat} onHide={() => setIsAddNewChat(false)} />
      )}
      {isMessageRequest && (
        <MessageRequest
          show={isMessageRequest}
          onHide={() => setIsMessageRequest(false)}
          fetchAllRequest={fetchAllRequest}
        />
      )}
      <div className="chat-layout">
        <div className="chat-layout-sidebar">
          <ChatSidebar
            setIsAddNewChat={setIsAddNewChat}
            setIsMessageRequest={setIsMessageRequest}
          />
        </div>
        <div className="chat-layout-chat-area">
          <ChatHeader />
          <ChatArea />
        </div>
      </div>
    </div>
  );
}

export default ChatLayout;
