import { LogOut, Search, Settings } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  handelCatch,
  logout,
  setSelectedContact,
  throwError,
} from "../../store/globalSlice";
import { parseTimeAndDate } from "../../assets/helper";
import AddNewChat from "./AddNewChat";
import { use, useEffect, useMemo, useState } from "react";
import MessageRequest from "./MessageRequest";
import api from "../../services/api";

function ChatSidebar({ socketRef }) {
  const dispatch = useDispatch();
  const { contacts, selectedContact, authData } = useSelector(
    (state) => state.global
  );
  const [isAddNewChat, setIsAddNewChat] = useState(false);
  const [isMessageRequest, setIsMessageRequest] = useState(false);
  const [requests, setRequests] = useState([]);

  const getRequestCount = useMemo(() => {
    return requests.length;
  }, [requests.length]);

  const fetchAllRequest = async () => {
    try {
      const res = await api.get("/request/fetch-all-requests");
      if (res.status === 200) {
        setRequests(res?.data?.response || []);
      } else {
        dispatch(throwError(res.data.message));
      }
    } catch (err) {
      dispatch(handelCatch(err));
    }
  };

  useEffect(() => {
    fetchAllRequest();
  }, []);

  return (
    <div className="chat-sidebar">
      {isAddNewChat && (
        <AddNewChat
          show={isAddNewChat}
          onHide={() => setIsAddNewChat(false)}
          socketRef={socketRef}
        />
      )}
      {isMessageRequest && (
        <MessageRequest
          requestList={requests}
          show={isMessageRequest}
          onHide={() => setIsMessageRequest(false)}
          fetchAllRequest={fetchAllRequest}
        />
      )}
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
        {(contacts || []).map((contact, index) => {
          console.log("contact", contact);
          const { participant } = contact;
          const selected = selectedContact?._id === contact._id;
          const isYou = !participant?._id;
          console.log("isYou", isYou);
          return (
            <div
              key={contact._id}
              className={`contact-item ${selected ? "selected" : ""}`}
              onClick={() => dispatch(setSelectedContact(contact))}
            >
              <div className="contact-avatar">
                {participant?.first_name?.[0] ||
                  "" + participant?.last_name?.[0] ||
                  ""}
              </div>

              <div className="contact-info">
                <div className="contact-header">
                  <div className="contact-name">
                    {participant?.first_name ||
                      "" + " " + participant?.last_name ||
                      ""}
                  </div>
                  <span className="contact-time">
                    {parseTimeAndDate(contact?.updatedAt)}
                  </span>
                </div>
                <div className="contact-message-row">
                  <span className="contact-message">
                    {contact?.lastMessage?.message || "Join this chat...!"}
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
