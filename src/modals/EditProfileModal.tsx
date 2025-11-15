import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import type User from "../interfaces/User";

interface EditProfileModalProps {
  show: boolean;
  onHide: () => void;
  editForm: User;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isArtistChecked: boolean;
  creatingArtist: boolean;
  onToggleArtist: (checked: boolean) => void;
  onCreateArtist: () => void;
  hasArtistInfo: boolean;
}

export default function EditProfileModal({
  show,
  onHide,
  editForm,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: EditProfileModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered className="editprofile-modal">
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col xs={6}>
              <Form.Group className="mb-2">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={editForm.firstName}
                  onChange={onChange}
                  placeholder="First Name"
                />
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group className="mb-2">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={editForm.lastName}
                  onChange={onChange}
                  placeholder="Last Name"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <Form.Group className="mb-2">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={onChange}
                  placeholder="Username"
                />
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group className="mb-2">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={onChange}
                  placeholder="Location"
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={editForm.email}
              onChange={onChange}
              placeholder="Email"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={editForm.phoneNumber}
              onChange={onChange}
              placeholder="Phone Number"
            />
          </Form.Group>

        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
