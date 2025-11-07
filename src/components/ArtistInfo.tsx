import { useState } from "react";
import EditArtistModal from "../modals/EditArtistModal";
import { useArtistInfo } from "../hooks/useArtistInfo";
import { Row, Col, Button } from "react-bootstrap";
import { updateArtistProfile } from "../api/editArtistProfile";
import type InterfaceArtistInfo from "../interfaces/InterfaceArtistInfo";

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

  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const openModal = () => {
    if (!artistInfo) return;
    setEditForm({
      id: String(artistInfo.id ?? ""),
      title: artistInfo.title ?? "",
      workTitle: artistInfo.workTitle ?? "",
      description: artistInfo.description ?? "",
      customer: artistInfo.customer ?? "",
      profileImage: artistInfo.profileImage, // behåll ev. befintlig bild
    });
    setImagePaths(artistInfo.profileImage?.paths ?? []); // initiera paths
    setShow(true);
  };

  if (loading) return <p>Loading artist info...</p>;

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUploaded = (res: { url: string; fileName: string; path: string; }) => {
    setImagePaths([res.path]); // enkel: en bild
  };

  const handleSave = async () => {
    if (!editForm.id) return;
    setSaving(true);
    try {
      await updateArtistProfile(editForm.id, {
        title: editForm.title,
        workTitle: editForm.workTitle,
        description: editForm.description,
        // ⬇️ lägg bara med om vi har paths (ren payload)
        profileImage: imagePaths.length ? { paths: imagePaths, mediaTexts: [""] } : undefined,
      });
      setShow(false);
      window.location.reload(); // behåll er temporära refresh
    } finally {
      setSaving(false);
    }
  };

  // liten helper för bild-url
  const resolveMediaUrl = (p?: string) =>
    !p ? "/images/avatar-placeholder.png"
      : p.startsWith("http") || p.startsWith("/media/") ? p : `/media/${p}`;

  return (
    <>
      <Row className="user-profile-row mx-auto">
        <h4 className="user-name">Artist Information</h4>
        <small className="text-muted d-block mb-4">
          This is what other users see on your Artist View.
        </small>

        <Row>
          <Col xs={5} className="user-avatar-col">
            <div className="user-avatar d-flex align-items-center justify-content-center">
              <img
                src={resolveMediaUrl(artistInfo?.profileImage?.paths?.[0])}
                alt="Artist avatar"
                style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "50%" }}
              />
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
          <Col xs="auto">
            <Button variant="secondary" size="sm" onClick={openModal} className="me-2">
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
            onImageUploaded={handleImageUploaded}
          />
        )}
      </Row>
    </>
  );
}
