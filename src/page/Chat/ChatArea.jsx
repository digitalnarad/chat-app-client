import { SendHorizontal } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { useSelector } from "react-redux";
import { chatMessages } from "./constant";
import { use, useCallback, useEffect, useState } from "react";

function ChatArea({ socketRef }) {
  const { selectedContact } = useSelector((state) => state.global);
  // const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [contactDetails, setContactDetails] = useState(selectedContact);

  const handleReceiveMessage = useCallback((message) => {
    console.log("Received message:", message);
    // setChatMessages((prev) => [...prev, message]);
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
      console.warn("Socket not connected");
      return;
    }

    socketRef.current.emit("send-message", {
      message: messageText,
      chatId: selectedContact?._id,
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-messages chat-scroll">
        {chatMessages.map((message, index) => (
          <MessageBubble
            key={index}
            text={message.text}
            sender={message.sender}
            time={message.time}
          />
        ))}
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
