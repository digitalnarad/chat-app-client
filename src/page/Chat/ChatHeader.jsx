import { Search, Settings } from "lucide-react";
import { useSelector } from "react-redux";
import { parseTimeAndDate } from "../../assets/helper";

function ChatHeader() {
  const { selectedContact } = useSelector((state) => state.global);

  const {
    firstName = "",
    lastName = "",
    activeStatus = {},
  } = selectedContact?.participant || {};

  return (
    <div className="chat-header">
      <div className="chat-header-row">
        <div className="chat-header-info">
          <div className="chat-header-avatar">{`${firstName[0]}${lastName[0]}`}</div>
          <div>
            <h2 className="chat-header-name">{`${firstName} ${lastName}`}</h2>
            <p className="chat-header-status">
              {activeStatus?.status === "online"
                ? "Online"
                : `Offline at ${
                    activeStatus?.at ? parseTimeAndDate(activeStatus?.at) : ""
                  }`}
            </p>
          </div>
        </div>

        <div className="chat-header-actions">
          <button className="chat-header-action-icon">
            <div className="btn-cover"></div>
            <Search size={20} className="btn-icon" />
          </button>
          <button className="chat-header-action-icon">
            <div className="btn-cover"></div>
            <Settings size={20} className="btn-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
