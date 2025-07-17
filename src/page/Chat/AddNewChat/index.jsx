import { Button, Modal } from "react-bootstrap";
import "./AddNewChat.css";
import { Search, X } from "lucide-react";

function AddNewChat({ show, onHide }) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="add-new-chat-modal"
    >
      <div className="add-new-chat-content">
        <div className="new-chat-header">
          <h4 className="modal-title">Message request</h4>
          <button className="new-chat-close-button" onClick={onHide}>
            <X size={20} />
          </button>
        </div>
        <div className="sent-request-body">
          <p className="sent-request-text">
            You have sent a new message request than search with user name.
          </p>
          <div className="sent-request-search-box">
            <label
              htmlFor="request_search"
              className="sent-request-search-label"
            >
              <Search size={18} strokeWidth={2} />
            </label>
            <input
              type="text"
              name="request_search"
              className="sent-request-search-input"
              placeholder="Search or sent new chat request."
            />
          </div>
          <div className="sent-request-list chat-scroll">
            <div className="sent-request-item">
              <div className="sent-request-avatar">AB</div>
              <div className="sent-request-info">
                <div className="sent-request-name">Alice Brown</div>
                <div className="sent-request-status">user_name</div>
              </div>
              <Button variant="primary" size="sm" className="accept-btn">
                Accept
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default AddNewChat;
