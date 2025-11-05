//Here is Edit/Add artist info
import { Modal, Button, Form, Col } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import type InterfaceArtistInfo from "../interfaces/InterfaceArtistInfo";

interface EditArtistModalProps {
  show: boolean;
  onHide: () => void;
  editForm: InterfaceArtistInfo;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EditArtistModal({
  show,
  onHide,
  editForm,
  onChange,
}: EditArtistModalProps) {
  const { user } = useAuth();
  const customerName = user?.firstName || user?.username || user?.id || "";
  return (
    <Modal show={show} onHide={onHide} centered className="editartist-modal">
      <Modal.Header closeButton>
        <Modal.Title>Artist Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Col>
            <Form.Group className="mb-2">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                name="customer"
                value={customerName}
                disabled
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-2">
              <Form.Label>Profession / Creative title</Form.Label>
              <Form.Control
                type="text"
                name="workTitle"
                value={editForm?.workTitle ?? ""}
                onChange={onChange}
                placeholder="e.g. Musician, Painter, Sculptor"
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Group className="mb-2">
              <Form.Label>Business name</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editForm?.title ?? ""}
                onChange={onChange}
                placeholder="e.g. your business, studio, or artist brand."
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-2">
              <Form.Label>Description of your business</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="description"
                value={editForm?.description ?? ""}
                onChange={onChange}
                placeholder="Brief intro about your work, style, and focus"
              />
            </Form.Group>
          </Col>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
