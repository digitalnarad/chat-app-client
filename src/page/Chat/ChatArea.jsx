import { SendHorizontal } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { handelCatch } from "../../store/globalSlice";

function ChatArea({ socketRef }) {
  const dispatch = useDispatch();
  const { selectedContact } = useSelector((state) => state.global);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const containerRef = useRef(null);
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const observer = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isUserNearBottom = () => {
    const container = containerRef.current;
    if (!container) return false;
    const threshold = 150;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  };

  const handleReceiveMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
    setTimeout(() => {
      if (isUserNearBottom()) scrollToBottom();
    }, 100);
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!selectedContact || !socket) return;
    const chatId = selectedContact._id;
    socket.emit("join-chat", chatId);
    socket.on("receive-message", handleReceiveMessage);
    return () => {
      socket.emit("leave-chat", chatId);
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [selectedContact?._id, handleReceiveMessage]);

  const sendMessage = () => {
    if (!socketRef.current) return;
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
        if (!response.success) dispatch(throwError(response.message));
        if (nearBottom) setTimeout(scrollToBottom, 100);
      }
    );
  };

  const fetchMessages = async ({ isFirstLoad }) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/message/fetch-chats-messages/${selectedContact._id}?page=${page}&limit=20`
      );
      const fetched = res?.data?.response || [];
      if (fetched.length === 0) setHasMore(false);
      else {
        setMessages((prev) => [...fetched.reverse(), ...prev]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      dispatch(handelCatch(err));
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop } = containerRef.current;
    setShowScrollButton(scrollTop < containerRef.current.scrollHeight - 1200);
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
    return () => observer.current?.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    fetchMessages({ isFirstLoad: true });
  }, [selectedContact?._id]);

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
              left: "calc(50% - 25px)",
            }}
            className="scroll-to-bottom-btn"
          >
            ↓
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
            onClick={sendMessage}
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
