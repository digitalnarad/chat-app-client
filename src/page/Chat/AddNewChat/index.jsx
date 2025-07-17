import { Button, Modal } from "react-bootstrap";
import "./AddNewChat.css";

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
        <h4>Centered Modal</h4>
        <p>
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
          dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
          consectetur ac, vestibulum at eros.
        </p>

        <Button onClick={onHide}>Close</Button>
      </div>
    </Modal>
  );
}

export default AddNewChat;
