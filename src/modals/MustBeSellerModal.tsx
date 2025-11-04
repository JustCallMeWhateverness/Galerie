import { Modal, Button } from 'react-bootstrap';

interface MustBeSellerModalProps {
  show: boolean;
  onHide: () => void;
  onUpgrade: () => void;
}
export default function MustBeSellerModal({ show, onHide, onUpgrade }: MustBeSellerModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered className="mustbeseller-modal">
      <Modal.Header closeButton>
        <Modal.Title>Seller Account Required</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>You must have a seller account to create auctions.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={onUpgrade}>
          Upgrade to Seller
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
