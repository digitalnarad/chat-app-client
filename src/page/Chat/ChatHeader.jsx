import { EllipsisVertical, Search, Settings } from "lucide-react";
import { useSelector } from "react-redux";
import { parseTimeAndDate } from "../../assets/helper";
import { useMemo } from "react";

function ChatHeader() {
  const { selectedContact, contacts } = useSelector((state) => state.global);

  const memoizedSelectedContact = useMemo(() => {
    if (!selectedContact?._id) return {};

    const chat =
      contacts.find((contact) => contact._id === selectedContact._id) || {};

    return chat;
  }, [
    selectedContact?._id, // Only watch ID changes
    contacts?.length, // Watch array length changes
    JSON.stringify(contacts?.find((c) => c._id === selectedContact?._id)),
  ]);

  const {
    first_name = "",
    last_name = "",
    active_status = {},
  } = memoizedSelectedContact?.participant || {};

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
            <EllipsisVertical size={20} className="btn-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
