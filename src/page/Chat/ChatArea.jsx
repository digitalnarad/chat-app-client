import { ChevronDown, SendHorizontal } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import api from "../../services/api";
import { handelCatch } from "../../store/globalSlice";
import { Spinner } from "react-bootstrap";

function ChatArea({ socketRef }) {
  const dispatch = useDispatch();
  const { selectedContact } = useSelector((state) => state.global);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const scrollBottomRef = useRef(null);

  const scrollToBottom = () => {
    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isNearBottom = () => {
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
    if (isNearBottom()) scrollToBottom();
  }, []);

  const sendMessage = () => {
    if (!socketRef.current) return;
    const nearBottom = isNearBottom();
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
        if (nearBottom) scrollToBottom();
      }
    );
  };
  const fetchMessages = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const container = containerRef.current;
    const previousScrollHeight = container?.scrollHeight || 0;

    try {
      const res = await api.get(
        `/message/fetch-chats-messages/${selectedContact._id}?page=${page}&limit=20`
      );

      const fetched = res?.data?.response || [];

      if (fetched.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => [...fetched, ...prev]);
        setPage((prev) => prev + 1);

        // ✅ Wait for DOM to fully paint new messages, then adjust scroll
        setTimeout(() => {
          requestAnimationFrame(() => {
            const newScrollHeight = container?.scrollHeight || 0;
            const scrollOffset = newScrollHeight - previousScrollHeight;
            container.scrollTop = container.scrollTop + scrollOffset;
          });
        }, 0);
      }
    } catch (err) {
      dispatch(handelCatch(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedContact?._id) {
      setMessages([]);
      setPage(1);
      setHasMore(true);
      fetchMessages();
    }
  }, [selectedContact?._id]);

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

  return (
    <div className="chat-container">
      <div
        className="chat-messages chat-scroll"
        id="scrollableChatArea"
        ref={containerRef}
        style={{
          height: "100%",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchMessages}
          hasMore={hasMore}
          inverse={true}
          scrollableTarget="scrollableChatArea"
          loader={null}
          endMessage={null}
        >
          <div ref={scrollBottomRef} />
          {loading && (
            <div
              className="top-loader"
              style={{ textAlign: "center", margin: "8px" }}
            >
              <Spinner animation="grow" size="sm" />
            </div>
          )}

          {!hasMore && messages.length > 0 && (
            <div
              className="top-end"
              style={{ textAlign: "center", color: "gray", margin: "8px" }}
            >
              You've reached the beginning.
            </div>
          )}
          {messages.map((message, index) => {
            return (
              <MessageBubble
                key={index}
                text={message.message}
                sender={message?.sender}
                time={message?.createdAt}
              />
            );
          })}
          <div ref={scrollBottomRef} />
        </InfiniteScroll>
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
