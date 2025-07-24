import { useEffect, useRef, useState } from "react";
import ChatArea from "./ChatArea";
import ChatHeader from "./ChatHeader";
import ChatSidebar from "./ChatSidebar";
import "./Chat.css";
import api from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchContacts,
  fetchRequests,
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
  const { selectedContact, socketConnected } = useSelector(
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
        dispatch({ type: "socket/connect" });
        dispatch({
          type: "socket/emit",
          payload: {
            event: "update-my-status",
            data: { status: "online" },
            callback: () => {
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
      } else if (document.visibilityState === "visible" && !socketConnected) {
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

  useEffect(() => {
    dispatch(fetchContacts());
    dispatch(fetchRequests());
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
          fetchAllRequest={() => {
            dispatch(fetchRequests());
          }}
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
