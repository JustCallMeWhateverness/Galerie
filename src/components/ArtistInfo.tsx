import { useState, useEffect } from "react";
import EditArtistModal from "../modals/EditArtistModal";
import { useArtistInfo } from "../hooks/useArtistInfo";
import { Row, Col, Button } from "react-bootstrap";
import { updateArtistProfile } from "../api/editArtistProfile";
import type InterfaceArtistInfo from "../interfaces/InterfaceArtistInfo";

//TODO: Make the editbutton work
export default function ArtistInfo() {
  const [show, setShow] = useState(false);
  const { data: artistInfo, loading } = useArtistInfo();

  const [editForm, setEditForm] = useState<InterfaceArtistInfo>({
    id: "",
    title: "",
    workTitle: "",
    description: "",
    customer: "",
  });
  const [saving, setSaving] = useState(false);

  const openModal = () => {
    if (!artistInfo) return;
    setEditForm({
      id: String(artistInfo.id ?? ""),
      title: artistInfo.title ?? "",
      workTitle: artistInfo.workTitle ?? "",
      description: artistInfo.description ?? "",
      customer: artistInfo.customer ?? "",
    });
    setShow(true);
  };

  if (loading) return <p>Loading artist info...</p>;

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editForm.id) return;
    setSaving(true);
    try {
      await updateArtistProfile(editForm.id, {
        title: editForm.title,
        workTitle: editForm.workTitle,
        description: editForm.description,
      });
      setShow(false);

      window.location.reload();
    } finally {
      setSaving(false);
    }
  };
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
              onClick={openModal}
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
            onSave={handleSave}
            editForm={editForm}
            onChange={handleEditChange}
          />
        )}
      </Row>
    </>
  );
}
