import { Search, Settings } from "lucide-react";
import React from "react";

function ChatHeader() {
  return (
    <div className="chat-header">
      <div className="chat-header-row">
        {/* Contact Info */}
        <div className="chat-header-info">
          <div className="chat-header-avatar">SJ</div>
          <div>
            <h2 className="chat-header-name">Sarah Johnson</h2>
            <p className="chat-header-status">Online</p>
          </div>
        </div>

        {/* Actions */}
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
