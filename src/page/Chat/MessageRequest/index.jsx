import React, { use, useEffect, useState } from "react";
import "./MessageRequest.css";
import { Button, Modal } from "react-bootstrap";
import { MailWarning, MessageSquareWarning, Sparkles, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  handelCatch,
  showSuccess,
  throwError,
} from "../../../store/globalSlice";
import api from "../../../services/api";
function MessageRequest({ show, onHide, fetchAllRequest }) {
  const dispatch = useDispatch();
  const { requests } = useSelector((state) => state.global);
  const [loading, setLoading] = useState(false);
  const [requestList, setRequestList] = useState([]);

  useEffect(() => {
    setRequestList(requests);
    console.log("requests", requests);
  }, [requests]);

  const rejectRequest = async (request) => {
    console.log("request", request);

    const { sender_id, receiver_id } = request;

    dispatch({
      type: "socket/emit",
      payload: {
        event: "cancel-request",
        data: { sender_id, receiver_id },

        callback: (response) => {
          if (!response.success) dispatch(throwError(response.message));
          fetchAllRequest();
        },
      },
    });
  };

  const acceptRequest = async (id) => {
    try {
      dispatch({
        type: "socket/emit",
        payload: {
          event: "accept-request",
          data: { id },
          callback: (response) => {
            if (!response.success) dispatch(throwError(response.message));
            fetchAllRequest();
          },
        },
      });
    } catch (error) {
      dispatch(handelCatch(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="message-request-modal"
    >
      <div className="message-request-content">
        <div className="message-request-header">
          <h4 className="modal-title">Message request</h4>
          <button className="message-request-close-button" onClick={onHide}>
            <X size={20} />
          </button>
        </div>
        <div className="message-request-text">
          You have {requestList.length} new message request
        </div>
        <div className="message-request-box chat-scroll">
          {requestList.map((ele) => {
            const { first_name, last_name, user_name } = ele.senderDetails;
            return (
              <div className="message-request-item" key={ele._id}>
                <div className="message-request-avatar">
                  {`${first_name?.[0].toUpperCase()}${last_name?.[0].toUpperCase()}`}
                </div>
                <div className="message-request-info">
                  <div className="message-request-name">
                    {first_name} {last_name}
                  </div>
                  <div className="message-request-status">{user_name}</div>
                </div>
                <div className="message-request-btn-group">
                  <Button
                    variant="primary"
                    size="sm"
                    className="Request-btn"
                    disabled={loading}
                    onClick={() => acceptRequest(ele._id)}
                  >
                    Accept
                  </Button>

                  <Button
                    variant="light"
                    size="sm"
                    className="Reject-btn"
                    disabled={loading}
                    onClick={() => rejectRequest(ele)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}

          {requestList.length === 0 && (
            <div className="no-result">
              <MessageSquareWarning size={40} className="bounce-icon" />
              <p className="no-user-text">You're all caught up!</p>
              <div className="crazy-message">
                <Sparkles size={18} className="icon-spin" />
                <span>No new cosmic connections right now...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default MessageRequest;
