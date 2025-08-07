import React from "react";
import "./MessageBubble.css";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { Check, CheckCheck, ClockFading } from "lucide-react";
function MessageBubble({ text, sender, time, type, isNextDate, read_by }) {
  const { selectedContact } = useSelector((state) => state.global);

  const isUser = sender !== selectedContact?.participant?._id;

  const getDisplayDate = (time) => {
    const inputDate = dayjs(time);
    const today = dayjs();
    const yesterday = dayjs().subtract(1, "day");
    const sevenDaysAgo = today.subtract(6, "day");

    if (inputDate.isSame(today, "day")) {
      return "Today";
    }
    if (inputDate.isSame(yesterday, "day")) {
      return "Yesterday";
    }
    if (
      inputDate.isAfter(sevenDaysAgo, "day") &&
      inputDate.isBefore(today, "day")
    ) {
      return inputDate.format("dddd");
    }
    return inputDate.format("DD/MM/YYYY");
  };

  return (
    <div style={{ position: "relative" }}>
      {isNextDate && (
        <span className="line">
          <span className="chat-time">{getDisplayDate(time)}</span>
        </span>
      )}

      {type === "text" && (
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
            {isUser && (
              <div className="read-receipt-status">
                {read_by.length > 0 ? (
                  <CheckCheck size={12} />
                ) : (
                  <Check size={12} />
                )}
              </div>
            )}
          </div>
          <span className="message-time">{dayjs(time).format("HH:mm")}</span>
        </div>
      )}

      {type === "join-chat" && (
        <div className="join-chat-bubble-container">
          <div className="join-chat-bubble">
            {text}
            <span className="join-chat-time">
              {dayjs(time).format("DD/MM/YYYY HH:mm")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(MessageBubble);
