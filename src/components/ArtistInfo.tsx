import { useState } from "react";
import EditArtistModal from "../modals/EditArtistModal";
import { useArtistInfo } from "../hooks/useArtistInfo";
import { Row, Col, Button } from "react-bootstrap";

//TODO: Make the editbutton work
export default function ArtistInfo() {
  const [show, setShow] = useState(false);
  const { data: artistInfo, loading } = useArtistInfo();

  if (loading) return <p>Loading artist info...</p>;
  return (
    <>
      <Row className="user-profile-row mx-auto">
        <h4 className="user-name">Artist Information</h4>
        <small className="text-muted d-block mb-4">
          This is what other users see on your Artist View.
        </small>
        <Row>
          <Col xs={5} className="user-avatar-col ">
            <div className="user-avatar">
              <i className="bi bi-person-fill"></i>
            </div>
          </Col>
          <Col>
            <div className="mb-2">
              <strong>Business name:</strong>
              <div>{artistInfo?.title || "—"}</div>
            </div>
            <div className="mb-2">
              <strong>Profession / Creative title:</strong>
              <div>{artistInfo?.workTitle || "—"}</div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="mb-3 mt-3">
              <strong>Description:</strong>
              <div>{artistInfo?.description || "No description yet."}</div>
            </div>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col xs="auto" className="d-flex justify-content-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShow(true)}
              className="me-2"
            >
              Edit
            </Button>
          </Col>
        </Row>
        {artistInfo && (
          <EditArtistModal
            show={show}
            onHide={() => setShow(false)}
            editForm={artistInfo}
            onChange={() => {}}
          />
        )}
      </Row>
    </>
  );
}
