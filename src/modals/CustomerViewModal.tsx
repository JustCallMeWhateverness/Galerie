import { Modal, Button, Col, Row } from 'react-bootstrap';
import type User from '../interfaces/User';

interface CustomerViewModalProps {
  show: boolean;
  onHide: () => void;
  user: Pick<User, "username" | "firstName" | "lastName" | "location" | "email">;
}

export function CustomerViewModal({ show, onHide, user }: CustomerViewModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Customer Information</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light">

        { /* Placeholder for user profile picture */}
        <div className="d-flex flex-column align-items-center mb-3">
          <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style={{ width: 64, height: 64, fontSize: 32 }}>
            <i className="bi bi-person"></i>
          </div>

          <div className="mt-2 fw-bold">{user.username}</div>
        </div>
        <Row className="mb-2">
          <Col xs={5} className="fw-bold text-end">
            Name:
          </Col>
          <Col className="text-muted">{user.firstName} {user.lastName}</Col>
        </Row>
        <Row className="mb-2">
          <Col xs={5} className="fw-bold text-end">
            Location:
          </Col>
          <Col className="text-muted">{user.location || 'N/A'}</Col>
        </Row>
        <Row className="mb-2">
          <Col xs={5} className="fw-bold text-end">
            Email:
          </Col>
          <Col className="text-muted">{user.email || 'N/A'}</Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}