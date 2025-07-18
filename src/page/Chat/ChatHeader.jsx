import { Search, Settings } from "lucide-react";
import { useSelector } from "react-redux";
import { parseTimeAndDate } from "../../assets/helper";

function ChatHeader() {
  const { selectedContact } = useSelector((state) => state.global);

  const {
    first_name = "",
    last_name = "",
    active_status = {},
  } = selectedContact?.participant || {};

  return (
    <div className="chat-header">
      <div className="chat-header-row">
        <div className="chat-header-info">
          <div className="chat-header-avatar">{`${first_name[0]}${last_name[0]}`}</div>
          <div>
            <h2 className="chat-header-name">{`${first_name} ${last_name}`}</h2>
            <p className="chat-header-status">
              {active_status?.status === "online"
                ? "Online"
                : `Offline at ${
                    active_status?.at ? parseTimeAndDate(active_status?.at) : ""
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
