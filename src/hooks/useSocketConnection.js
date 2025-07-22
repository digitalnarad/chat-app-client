// hooks/useSocketConnection.js
import { useCallback, useRef, useEffect } from "react";

export const useSocketConnection = (
  socketConnected,
  dispatch,
  selectedContactRef,
  throwError
) => {
  const reconnectTimeoutRef = useRef(null);
  const isReconnectingRef = useRef(false);

  const handleUserOffline = useCallback(() => {
    if (!socketConnected || isReconnectingRef.current) return;

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
  }, [socketConnected, selectedContactRef, dispatch, throwError]);

  const connectSocket = useCallback(() => {
    const token = localStorage.getItem("token");

    if (!token || socketConnected || isReconnectingRef.current) {
      return;
    }

    isReconnectingRef.current = true;

    dispatch({ type: "socket/connect" });
    dispatch({
      type: "socket/emit",
      payload: {
        event: "update-my-status",
        data: { status: "online" },
        callback: () => {
          isReconnectingRef.current = false;

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
  }, [socketConnected, dispatch, selectedContactRef]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found");
      return;
    }

    connectSocket();

    let visibilityTimeout;
    const handleVisibilityChange = () => {
      clearTimeout(visibilityTimeout);

      visibilityTimeout = setTimeout(() => {
        if (document.visibilityState === "hidden" && socketConnected) {
          handleUserOffline();
        } else if (document.visibilityState === "visible" && !socketConnected) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectSocket();
          }, 1000);
        }
      }, 200);
    };

    const handlePageHide = (event) => {
      if (!event.persisted && socketConnected) {
        handleUserOffline();
      }
    };

    const handleOnline = () => {
      if (!socketConnected) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSocket();
        }, 1000);
      }
    };

    const handleOffline = () => {
      if (socketConnected) {
        handleUserOffline();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearTimeout(visibilityTimeout);
      clearTimeout(reconnectTimeoutRef.current);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { connectSocket, handleUserOffline };
};
