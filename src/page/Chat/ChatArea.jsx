import { ChevronDown, SendHorizontal } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import api from "../../services/api";
import {
  handelCatch,
  setContacts,
  setLiveMessages,
  throwError,
} from "../../store/globalSlice";
import { Spinner } from "react-bootstrap";
import CrazyLoader from "../../components/CrazyLoader";

function ChatArea({}) {
  const dispatch = useDispatch();
  const { selectedContact, liveMessages, contacts, authData } = useSelector(
    (state) => state.global
  );
  const [chatId, setChatId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messagesList, setMessagesList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const scrollBottomRef = useRef(null);

  useEffect(() => {
    if (selectedContact?._id) {
      setChatId(selectedContact._id);
      setMessagesList([]);
      setPage(1);
      setHasMore(true);
    }
  }, [selectedContact?._id]);

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

  useEffect(() => {
    if (
      liveMessages &&
      liveMessages._id !== messagesList[messagesList.length - 1]?._id
    ) {
      setMessagesList((prev) => [...prev, liveMessages]);
      if (isNearBottom()) scrollToBottom();
      dispatch(setLiveMessages(null));
    }
  }, [JSON.stringify(liveMessages)]);

  const sendMessage = () => {
    const nearBottom = isNearBottom();

    dispatch({
      type: "socket/emit",
      payload: {
        event: "send-message",
        data: {
          message: messageText,
          chat_id: chatId,
          message_type: "text",
          receiver_id: selectedContact?.participant?._id,
        },
        callback: (response) => {
          setMessageText("");
          if (!response.success) dispatch(throwError(response.message));
          if (nearBottom) scrollToBottom();
          const filteredContact = contacts.filter(
            (c) => c._id !== selectedContact._id
          );
          dispatch(
            setContacts([
              { ...selectedContact, lastMessage: response?.payload?.message },
              ...filteredContact,
            ])
          );
        },
      },
    });
  };

  const fetchMessages = async () => {
    if (loading || !hasMore) return;

    const container = containerRef.current;
    const previousScrollHeight = container?.scrollHeight || 0;

    try {
      const res = await api.get(
        `/message/fetch-chats-messages/${chatId}?page=${page}&limit=20`
      );

      if (res.status === 200) {
        const fetched = res?.data?.response || [];

        const firstMessage = fetched?.[0];

        if (
          messagesList.length === 0 &&
          firstMessage.sender !== authData?._id &&
          firstMessage?.read_by.filter((r) => r === authData?._id).length ===
            0 &&
          chatId
        ) {
          sendReadMessage(firstMessage);
        }

        setMessagesList((prev) => [...fetched.reverse(), ...prev]);
        setPage((prev) => prev + 1);

        setTimeout(() => {
          const newScrollHeight = container?.scrollHeight || 0;
          const delta = newScrollHeight - previousScrollHeight;
          container.scrollTop += delta - 40;
        }, 0);

        if (fetched.length < 20) {
          setHasMore(false);
        }
      }
    } catch (err) {
      dispatch(handelCatch(err));
    } finally {
      setLoading(false);
    }
  };

  const sendReadMessage = (message) => {
    dispatch({
      type: "socket/emit",
      payload: {
        event: "mark-as-read",
        data: {
          chat_id: message?.chat_id,
        },
        callback: (response) => {
          if (!response.success) {
            dispatch(throwError(response.message));
            return;
          }
          dispatch(
            setContacts(
              contacts.map((c) => {
                if (c._id === selectedContact._id) {
                  return {
                    ...c,
                    unread_count: 0,
                  };
                }
                return c;
              })
            )
          );
        },
      },
    });
  };

  useEffect(() => {
    if (!chatId) return;

    dispatch({
      type: "socket/emit",
      payload: {
        event: "join-chat",
        data: { chatId },
        callback: (response) => {
          if (!response.success) dispatch(throwError(response.message));
        },
      },
    });

    return () => {
      dispatch({
        type: "socket/emit",
        payload: {
          event: "leave-chat",
          data: { chatId },
          callback: (response) => {
            if (!response.success) dispatch(throwError(response.message));
          },
        },
      });
    };
    // socket.on("receive-message", handleReceiveMessage);
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      setLoading(true);
      fetchMessages();
    }
  }, [chatId]);

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
          dataLength={messagesList.length}
          next={(e) => {
            setLoading(true);
            setTimeout(() => {
              fetchMessages();
            }, 1000);
          }}
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
              <Spinner
                animation="border"
                size="lg"
                style={{ color: "#2563eb" }}
              />

              {/* <CrazyLoader /> */}
            </div>
          )}

          {!hasMore && messagesList.length > 0 && (
            <div
              className="top-end"
              style={{ textAlign: "center", color: "gray", margin: "8px" }}
            >
              You've reached the beginning.
            </div>
          )}
          {messagesList.map((message, index) => {
            return (
              <MessageBubble
                key={message._id + message?.createdAt}
                text={message.message}
                sender={message?.sender}
                time={message?.createdAt}
                type={message?.message_type}
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
