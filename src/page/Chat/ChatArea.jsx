import { SendHorizontal } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { useDispatch, useSelector } from "react-redux";
import { chatMessages } from "./constant";
import { use, useCallback, useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { handelCatch } from "../../store/globalSlice";

function ChatArea({ socketRef }) {
  const dispatch = useDispatch();
  const { selectedContact } = useSelector((state) => state.global);
  // const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [contactDetails, setContactDetails] = useState(selectedContact);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const containerRef = useRef(null);
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const observer = useRef(null);

  // const handleReceiveMessage = useCallback((message) => {
  //   console.log("Received message:", message);
  //   setMessages((prev) => [...prev, message]);
  //   if (isUserNearBottom()) {
  //     scrollToBottom(); // auto scroll only if user is near bottom
  //   }
  // }, []);

  const handleReceiveMessage = useCallback((message) => {
    console.log("Received message:", message);
    setMessages((prev) => [...prev, message]);

    // Scroll after DOM updates
    setTimeout(() => {
      if (isUserNearBottom()) {
        scrollToBottom();
      }
    }, 100);
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!contactDetails || !socket) return;

    const chatId = contactDetails._id;

    socket.emit("join-chat", chatId);
    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.emit("leave-chat", chatId);
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [contactDetails?._id, handleReceiveMessage]);

  const sendMessage = () => {
    if (!socketRef.current) {
      dispatch(throwError("Socket not connected"));
      return;
    }

    const nearBottom = isUserNearBottom();

    socketRef.current.emit(
      "send-message",
      {
        message: messageText,
        chat_id: selectedContact?._id,
        message_type: "text",
      },
      (response) => {
        setMessageText("");
        if (!response.success) {
          dispatch(throwError(response.message));
          return;
        }

        if (nearBottom) {
          setTimeout(scrollToBottom, 100);
        }
      }
    );
  };

  const fetchMessages = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await api.get(
        `/message/fetch-chats-messages/${selectedContact._id}?page=${page}&limit=20`
      );

      if (res.status !== 200) {
        dispatch(throwError(res.data.message));
        return;
      }
      const fetched = res?.data?.response || [];

      if (fetched.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => [...fetched.reverse(), ...prev]);
        setPage((prev) => prev + 1);
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop =
              containerRef.current.scrollHeight -
              containerRef.current.clientHeight -
              50;
          }
        }, 100);
      }
    } catch (err) {
      console.error("Message fetch error:", err);
      dispatch(handelCatch(err));
    } finally {
      setLoading(false);
    }
  };

  // 📌 Scroll handling
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop } = containerRef.current;
    setShowScrollButton(scrollTop < -100);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isUserNearBottom = () => {
    const container = containerRef.current;
    if (!container) return false;
    const threshold = 150; // px from bottom
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  };
  useEffect(() => {
    if (!containerRef.current || !topRef.current) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMessages();
        }
      },
      { root: containerRef.current, threshold: 0.1 }
    );

    observer.current.observe(topRef.current);

    return () => {
      observer.current?.disconnect();
    };
  }, [hasMore, loading]);

  useEffect(() => {
    fetchMessages();
  }, [contactDetails?._id]);

  useEffect(() => {
    if (page === 2) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div
        className="chat-messages chat-scroll"
        onScroll={handleScroll}
        ref={containerRef}
      >
        <div ref={topRef}></div>
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            text={message.message}
            isUser={message?.sender !== selectedContact?.participant?._id}
            time={message?.createdAt}
          />
        ))}

        <div ref={bottomRef} />
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            style={{
              position: "absolute",
              bottom: "60px",
              right: "20px",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "#333",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            ↓ Scroll to Bottom
          </button>
        )}
      </div>

      <div className="chat-input-bar">
        <div className="chat-input-row">
          <input
            placeholder="Type a message..."
            className="chat-input-field"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <button
            className="chat-send-btn"
            onClick={() => sendMessage()}
            disabled={!messageText.trim()}
          >
            <SendHorizontal size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatArea;
