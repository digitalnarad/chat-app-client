import { LogOut, Search, Settings } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout, setAuthData } from "../../store/globalSlice";

function ChatSidebar() {
  const dispatch = useDispatch();

  const contacts = [
    {
      id: "1",
      name: "Sarah Johnson",
      lastMessage: "Hey! How's your day going?",
      time: "10:30 AM",
      avatar: "SJ",
      unread: 2,
    },
    {
      id: "2",
      name: "Mike Chen",
      lastMessage: "Thanks for the quick response!",
      time: "9:45 AM",
      avatar: "MC",
    },
    {
      id: "3",
      name: "Team Design",
      lastMessage: "New mockups are ready for review",
      time: "Yesterday",
      avatar: "TD",
      unread: 5,
    },
    {
      id: "4",
      name: "Alex Rivera",
      lastMessage: "Let's catch up soon 😊",
      time: "Yesterday",
      avatar: "AR",
    },
    {
      id: "5",
      name: "Emma Watson",
      lastMessage: "Perfect! See you at 3 PM",
      time: "Tuesday",
      avatar: "EW",
    },
    {
      id: "6",
      name: "David Kim",
      lastMessage: "The project looks amazing!",
      time: "Monday",
      avatar: "DK",
    },
    {
      id: "7",
      name: "Sarah Johnson",
      lastMessage: "Hey! How's your day going?",
      time: "10:30 AM",
      avatar: "SJ",
      unread: 2,
    },
    {
      id: "8",
      name: "Mike Chen",
      lastMessage: "Thanks for the quick response!",
      time: "9:45 AM",
      avatar: "MC",
    },
    {
      id: "3",
      name: "Team Design",
      lastMessage: "New mockups are ready for review",
      time: "Yesterday",
      avatar: "TD",
      unread: 5,
    },
    {
      id: "4",
      name: "Alex Rivera",
      lastMessage: "Let's catch up soon 😊",
      time: "Yesterday",
      avatar: "AR",
    },
    {
      id: "5",
      name: "Emma Watson",
      lastMessage: "Perfect! See you at 3 PM",
      time: "Tuesday",
      avatar: "EW",
    },
    {
      id: "6",
      name: "David Kim",
      lastMessage: "The project looks amazing!",
      time: "Monday",
      avatar: "DK",
    },
    {
      id: "5",
      name: "Emma Watson",
      lastMessage: "Perfect! See you at 3 PM",
      time: "Tuesday",
      avatar: "EW",
    },
    {
      id: "6",
      name: "David Kim",
      lastMessage: "The project looks amazing!",
      time: "Monday",
      avatar: "DK",
    },
    {
      id: "5",
      name: "Emma Watson",
      lastMessage: "Perfect! See you at 3 PM",
      time: "Tuesday",
      avatar: "EW",
    },
    {
      id: "6",
      name: "David Kim",
      lastMessage: "The project looks amazing!",
      time: "Monday",
      avatar: "DK",
    },
    {
      id: "5",
      name: "Emma Watson",
      lastMessage: "Perfect! See you at 3 PM",
      time: "Tuesday",
      avatar: "EW",
    },
    {
      id: "6",
      name: "David Kim",
      lastMessage: "The project looks amazing!",
      time: "Monday",
      avatar: "DK",
    },
    {
      id: "5",
      name: "Emma Watson",
      lastMessage: "Perfect! See you at 3 PM",
      time: "Tuesday",
      avatar: "EW",
    },
    {
      id: "6",
      name: "David Kim",
      lastMessage: "The project looks amazing!",
      time: "Monday",
      avatar: "DK",
    },
  ];
  return (
    <div className="chat-sidebar">
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
        {contacts.map((contact, index) => {
          return (
            <div key={index} className="contact-item">
              {/* Avatar */}
              <div className="contact-avatar">{contact.avatar}</div>

              {/* Contact Info */}
              <div className="contact-info">
                <div className="contact-header">
                  <h3 className="contact-name">{contact.name}</h3>
                  <span className="contact-time">{contact.time}</span>
                </div>
                <div className="contact-message-row">
                  <p className="contact-message">{contact.lastMessage}</p>
                  {contact.unread && (
                    <span className="contact-unread">{contact.unread}</span>
                  )}
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
