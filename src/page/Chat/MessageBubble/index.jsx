import React from "react";
import "./MessageBubble.css";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
function MessageBubble({ text, sender, time }) {
  const { selectedContact } = useSelector((state) => state.global);

  const isUser = sender !== selectedContact?.participant?._id;

  return (
    <div
      className={`message-bubble-container ${
        isUser ? "message-user" : "message-other"
      }`}
    >
      <div
        className={`message-bubble ${
          isUser ? "message-sent" : "message-received"
        }`}
      >
        <p className="message-text">{text}</p>
      </div>
      <span className="message-time">{dayjs(time).format("HH:mm")}</span>
    </div>
  );
}

export default React.memo(MessageBubble);
