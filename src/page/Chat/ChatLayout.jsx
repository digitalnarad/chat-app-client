import { useCallback, useEffect, useRef, useState } from "react";
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
  const heartbeatIntervalRef = useRef(null);
  const lastSeenTimestampRef = useRef(Date.now());
  const isReconnectingRef = useRef(false);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    if (socketConnected) {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }
  }, [socketConnected]);

  // Heartbeat mechanism to detect disconnections
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      lastSeenTimestampRef.current = Date.now();
      dispatch({
        type: "socket/emit",
        payload: {
          event: "heartbeat",
          data: { timestamp: lastSeenTimestampRef.current },
          callback: () => {
            // Heartbeat acknowledged
          },
        },
      });
    }, 30000); // Send heartbeat every 30 seconds
  }, [socketConnected]);

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  // Enhanced offline handling with immediate status update
  const handleUserOffline = async (isImmediate = false) => {
    if (!socketConnected) return;

    const chatId = selectedContactRef?.current?._id;

    // For immediate disconnections, use synchronous approach
    if (isImmediate) {
      // Use sendBeacon for reliable delivery during page unload
      const offlineData = {
        event: "update-my-status-immediate",
        data: {
          status: "offline",
          chatId,
          timestamp: Date.now(),
          reason: "immediate_disconnect",
        },
      };

      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(offlineData)], {
          type: "application/json",
        });
        navigator.sendBeacon("/api/user-offline", blob);
      }

      // Also try socket emission with minimal callback
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

    // Regular offline handling (existing logic)
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
                stopHeartbeat();
              },
            },
          });
        },
      },
    });
  };

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
            startHeartbeat(); // Start heartbeat when connected

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

  useEffect(() => {
    connectSocket();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && socketConnected) {
        handleUserOffline();
      } else if (document.visibilityState === "visible" && !socketConnected) {
        connectSocket();
      }
    };

    // Enhanced beforeunload handler
    const handleBeforeUnload = (event) => {
      if (socketConnected) {
        // Use immediate handling for abrupt disconnections
        handleUserOffline(true);

        // Optional: Show confirmation dialog for user-initiated closes
        // event.preventDefault();
        // event.returnValue = '';
      }
    };

    // Page hide event - more reliable than beforeunload
    const handlePageHide = () => {
      if (socketConnected) {
        handleUserOffline(true);
      }
    };

    // Network status handlers
    const handleOnline = () => {
      if (!socketConnected) {
        connectSocket();
      }
    };

    const handleOffline = () => {
      if (socketConnected) {
        handleUserOffline();
      }
    };

    // Enhanced event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide); // More reliable than beforeunload
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Detect browser/tab close via focus/blur
    let isTabActive = true;
    const handleFocus = () => {
      isTabActive = true;
      if (!socketConnected) {
        connectSocket();
      }
    };

    const handleBlur = () => {
      isTabActive = false;
      // Set a timeout to check if user really left
      setTimeout(() => {
        if (!isTabActive && socketConnected) {
          handleUserOffline();
        }
      }, 5000); // Wait 5 seconds before marking offline
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      stopHeartbeat();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [socketConnected]);

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
