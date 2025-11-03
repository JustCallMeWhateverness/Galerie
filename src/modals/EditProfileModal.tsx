import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import type User from '../interfaces/User';

interface EditProfileModalProps {
  show: boolean;
  onHide: () => void;
  editForm: User;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export default function EditProfileModal({
  show,
  onHide,
  editForm,
  onChange,
  onSave,
  onCancel,
  isSaving
}: EditProfileModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered className="editprofile-modal">
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="firstName"
              value={editForm.firstName}
              onChange={onChange}
              placeholder="First Name"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              name="lastName"
              value={editForm.lastName}
              onChange={onChange}
              placeholder="Last Name"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              name="role"
              value={editForm.role}
              onChange={onChange}
              placeholder="Profession"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              placeholder="Location"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Control
              type="email"
              name="email"
              value={editForm.email}
              onChange={onChange}
              placeholder="Email"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}