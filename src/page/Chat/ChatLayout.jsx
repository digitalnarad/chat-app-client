import ChatArea from "./ChatArea";
import ChatHeader from "./ChatHeader";
import ChatSidebar from "./ChatSidebar";
import "./index.css";

function ChatLayout() {
  return (
    <div className="chat-layout-component">
      <div className="chat-layout">
        <div className="chat-layout-sidebar">
          <ChatSidebar />
        </div>
        <div className="chat-layout-chat-area">
          <ChatHeader />
          <ChatArea />
        </div>
      </div>
    </div>
  );
}

export default ChatLayout;
