import { LogOut, Search, Settings } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout, setSelectedContact } from "../../store/globalSlice";
import { parseTimeAndDate } from "../../assets/helper";
import AddNewChat from "./AddNewChat";
import { use, useState } from "react";

function ChatSidebar({ socketRef }) {
  const dispatch = useDispatch();
  const { contacts, selectedContact } = useSelector((state) => state.global);
  const [show, setShow] = useState(false);

  return (
    <div className="chat-sidebar">
      {<AddNewChat show={show} onHide={() => setShow(false)} />}
      <div className="chat-sidebar-header">
        <div className="logo-setting">
          <h1 className="chat-logo">Chats</h1>
          <div className="setting-btn-group">
            <div className="setting-btn">
              <LogOut
                size={22}
                onClick={() => {
                  dispatch(logout());
                }}
              />
            </div>
            <div className="setting-btn">
              <Settings size={22} />
            </div>
          </div>
        </div>
        <div className="new-chat-btn-group">
          <button className="add-new-chat-btn" onClick={() => setShow(true)}>
            <span className="btn-text">New Chat</span>
          </button>
          <button className="add-new-chat-btn" onClick={() => setShow(true)}>
            <span className="btn-text">Chat Request</span>
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
        {(contacts || []).map((contact, index) => {
          const { participant } = contact;
          const selected = selectedContact?._id === contact._id;
          return (
            <div
              key={index}
              className={`contact-item ${selected ? "selected" : ""}`}
              onClick={() => dispatch(setSelectedContact(contact))}
            >
              <div className="contact-avatar">
                {participant?.firstName?.[0] + participant?.lastName?.[0]}
              </div>

              <div className="contact-info">
                <div className="contact-header">
                  <div className="contact-name">
                    {participant?.firstName + " " + participant?.lastName}
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
                      contact?.unread ? "" : "contact-read"
                    }`}
                  >
                    {1}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChatSidebar;
