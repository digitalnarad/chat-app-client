import React from "react";
import "./MessageBubble.css";
import dayjs from "dayjs";
function MessageBubble({ text, isUser, time }) {
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

export default MessageBubble;
