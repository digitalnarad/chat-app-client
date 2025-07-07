import React from "react";
import "./MessageBubble.css";
function MessageBubble({ text, sender, time }) {
  const isUser = sender === "user";
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
      <span className="message-time">{time}</span>
    </div>
  );
}

export default MessageBubble;
