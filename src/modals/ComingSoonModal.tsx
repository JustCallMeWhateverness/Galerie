import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export function ComingSoonModal({
  show,
  onHide,
}: {
  show: boolean;
  onHide: () => void;
}) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Coming Soon!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          We're putting the final brushstrokes on this feature 🎨 <br />
          Soon you'll be able to chat directly with artists about their work and
          ask any questions you like!
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
