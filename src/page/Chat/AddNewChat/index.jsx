import { Button, Modal } from "react-bootstrap";
import "./AddNewChat.css";
import { Search, Sparkles, UserX, X } from "lucide-react";
import { useDispatch } from "react-redux";
import api from "../../../services/api";
import {
  handelCatch,
  showSuccess,
  throwError,
} from "../../../store/globalSlice";
import { useCallback, useState } from "react";
import { debounce } from "../../../assets/helper";
import CrazyLoader from "../../../components/CrazyLoader";

function AddNewChat({ show, onHide, socketRef }) {
  const dispatch = useDispatch();

  const [searchUsers, setSearchUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isSearchUsers, setIsSearchUsers] = useState(false);
  const [isLoadRequest, setIsLoadRequests] = useState(false);

  const fetchUsers = async (search_str) => {
    try {
      const res = await api.post(`/user/get-search-users`, { search_str });
      if (res.status === 200) {
        const users = res.data?.response || [];
        setSearchUsers(users);
      } else {
        dispatch(throwError(res.data.message));
      }
    } catch (error) {
      dispatch(handelCatch(error));
    } finally {
      setIsSearchUsers(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((val) => fetchUsers(val), 1000),
    []
  );

  const sentNewRequest = async (receiver_id, message = "") => {
    setIsLoadRequests(true);
    try {
      if (!socketRef.current) return;
      socketRef.current.emit(
        "sent-new-request",
        { receiver_id, message },
        (response) => {
          if (!response.success) dispatch(throwError(response.message));
          fetchUsers(searchText);
          dispatch(showSuccess(response.message));
        }
      );
    } catch (error) {
      dispatch(handelCatch(error));
    } finally {
      setIsLoadRequests(false);
    }
  };

  const cancelRequest = async (receiver_id) => {
    setIsLoadRequests(true);
    try {
      if (!socketRef.current) return;
      socketRef.current.emit("cancel-request", { receiver_id }, (response) => {
        if (!response.success) dispatch(throwError(response.message));
        fetchUsers(searchText);
        dispatch(showSuccess(response.message));
      });
    } catch (error) {
      dispatch(handelCatch(error));
    } finally {
      setIsLoadRequests(false);
    }
  };

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
          <h4 className="modal-title">Sent new message request</h4>
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
              value={searchText}
              onChange={(e) => {
                const userName = e.target.value.trim().toLowerCase();
                const regex = /^[a-zA-Z0-9_.]+$/;
                if (!userName) {
                  setSearchText("");
                  debouncedSearch(userName);
                  setIsSearchUsers(true);
                }
                const isValidUserName = regex.test(userName);
                if (!isValidUserName) return;

                setSearchText(userName);
                debouncedSearch(userName);
                setIsSearchUsers(true);
              }}
            />
          </div>
          <div className="sent-request-list chat-scroll">
            {}

            {isSearchUsers ? (
              <CrazyLoader label="Sending into the void..." />
            ) : searchUsers.length !== 0 ? (
              searchUsers.map((ele) => {
                return (
                  <div className="sent-request-item" key={ele._id}>
                    <div className="sent-request-avatar">{`${ele.first_name?.[0].toUpperCase()}${ele.last_name?.[0].toUpperCase()}`}</div>
                    <div className="sent-request-info">
                      <div className="sent-request-name">
                        {ele.first_name} {ele.last_name}
                      </div>
                      <div className="sent-request-status">{ele.user_name}</div>
                    </div>
                    <div className="sent-request-btn-group">
                      <Button
                        variant={ele.request_sent ? "light" : "primary"}
                        size="sm"
                        className="sent-btn"
                        onClick={() => {
                          if (ele.request_sent) {
                            cancelRequest(ele._id);
                            return;
                          }
                          sentNewRequest(ele._id);
                        }}
                      >
                        {!ele.request_sent ? "Sent Request" : "Cancel Request"}
                        {isLoadRequest && (
                          <Spinner animation="grow" size="sm" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-result">
                <UserX size={40} className="bounce-icon" />
                <p className="no-user-text">No users found with that name.</p>
                <div className="crazy-message">
                  <Sparkles size={18} className="icon-spin" />
                  <span>Maybe they're lost in another galaxy...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default AddNewChat;
