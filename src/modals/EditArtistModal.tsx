import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import type InterfaceArtistInfo from "../interfaces/InterfaceArtistInfo";
import FileUpload from "../components/FileUpload";

interface EditArtistModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
  editForm: InterfaceArtistInfo;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onImageUploaded?: (res: { url: string; fileName: string; path: string; }) => void;
}

export default function EditArtistModal({
  show,
  onHide,
  onSave,
  editForm,
  onChange,
  onImageUploaded,
}: EditArtistModalProps) {

  const resolveMediaUrl = (p?: string) =>
    !p ? "/images/avatar-placeholder.png"
      : p.startsWith("http") || p.startsWith("/media/") ? p : `/media/${p}`;

  const current = resolveMediaUrl(editForm.profileImage?.paths?.[0]);

  return (
    <Modal show={show} onHide={onHide} centered className="editartist-modal">
      <Modal.Header closeButton>
        <Modal.Title>Edit Artist Information</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Col>
            <Form.Group className="mb-2">
              <Form.Label>Your Name</Form.Label>
              <Form.Control type="text" name="customer" value={editForm.customer} disabled />
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
        <Row className="mb-3 align-items-center">
          <Col xs="auto">
            <img
              src={current}
              alt="Artist avatar"
              style={{ width: 96, height: 96, objectFit: "cover", borderRadius: "50%" }}
            />
          </Col>
          <Col>
            <Form.Label className="mb-1">Profile image</Form.Label>
            <FileUpload onUploaded={onImageUploaded} />
          </Col>
        </Row>

      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={onSave}>Save</Button>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}
