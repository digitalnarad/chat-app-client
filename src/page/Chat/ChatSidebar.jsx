import { LogOut, Search, Settings } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout, setSelectedContact } from "../../store/globalSlice";
import { parseTimeAndDate } from "../../assets/helper";
import { useEffect, useMemo, useState } from "react";
import { Spinner } from "react-bootstrap";
import CrazyLoader from "../../components/CrazyLoader";

function ChatSidebar({ setIsMessageRequest, setIsAddNewChat }) {
  const dispatch = useDispatch();
  const { contacts, selectedContact, requests, loading } = useSelector(
    (state) => state.global
  );

  const [isLogout, setIsLogout] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    if (selectedContact) {
      setSelectedChat(selectedContact);
    }
  }, [selectedContact]);

  const getRequestCount = useMemo(() => {
    return requests.length;
  }, [requests.length]);

  const memoizedChats = useMemo(() => {
    return contacts;
  }, [JSON.stringify(contacts)]);

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <div className="logo-setting">
          <h1 className="chat-logo">Chats</h1>
          <div className="setting-btn-group">
            <div className="setting-btn">
              {!isLogout ? (
                <LogOut
                  size={22}
                  onClick={() => {
                    setIsLogout(true);
                    dispatch({
                      type: "socket/emit",
                      payload: {
                        event: "update-my-status",
                        data: { status: "offline" },
                        callback: () => {
                          dispatch(logout());
                        },
                      },
                    });
                    // setTimeout(() => {}, 2000);
                  }}
                />
              ) : (
                <Spinner size="sm" style={{ color: "#2f7eff" }} />
              )}
            </div>
            <div className="setting-btn">
              <Settings size={22} />
            </div>
          </div>
        </div>
        <div className="new-chat-btn-group">
          <button
            className="add-new-chat-btn"
            onClick={() => setIsAddNewChat(true)}
          >
            <span className="btn-text">New Chat</span>
          </button>
          <button
            className="add-new-chat-btn request-btn"
            onClick={() => setIsMessageRequest(true)}
          >
            <span className="btn-text">Chat Request</span>
            <div className="bobble-count">{getRequestCount}</div>
          </button>
        </div>
        <div className="chat-search-box">
          <label htmlFor="chat_search" className="chat-search-label">
            <Search size={18} strokeWidth={2} />
          </label>
          <input
            type="text"
            name="chat_search"
            className="chat-search-input"
            placeholder="Search or start new chat."
          />
        </div>
      </div>
      <div className="contact-list chat-scroll">
        {loading.contacts ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CrazyLoader label="Sending into the void..." />
          </div>
        ) : (
          memoizedChats.map((contact) => {
            const { participant } = contact;
            const selected = selectedChat?._id === contact._id;
            return (
              <div
                key={contact._id}
                className={`contact-item ${selected ? "selected" : ""}`}
                onClick={() => dispatch(setSelectedContact(contact))}
              >
                <div className="contact-avatar">
                  {(participant?.first_name?.[0] || "") +
                    (participant?.last_name?.[0] || "")}
                  {participant.active_status.status === "online" && (
                    <div className="contact-status"></div>
                  )}
                </div>

                <div className="contact-info">
                  <div className="contact-header">
                    <div className="contact-name">
                      {(participant?.first_name || "") +
                        " " +
                        (participant?.last_name || "")}
                    </div>
                    <span className="contact-time">
                      {parseTimeAndDate(contact?.updatedAt)}
                    </span>
                  </div>
                  <div className="contact-message-row">
                    <span className="contact-message">
                      {contact?.lastMessage || "Join this chat...!"}
                    </span>
                    <span
                      className={`contact-unread ${
                        contact?.unread_count > 0 ? "" : "contact-read"
                      }`}
                    >
                      {contact?.unread_count > 99
                        ? "99+"
                        : contact?.unread_count}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ChatSidebar;
