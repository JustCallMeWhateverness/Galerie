import React from "react";
import { useState, useEffect } from "react";
import { Button, Alert, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useArtistInfo } from "../hooks/useArtistInfo";
import type User from "../interfaces/User";
import AuthModal from "../modals/AuthModal";
import EditProfileModal from "../modals/EditProfileModal";
import { ComingSoonModal } from "../modals/ComingSoonModal";
import Logout from "../components/Logout";
import ArtistInfo from "../components/ArtistInfo";
import { createArtistProfile } from "../api/createArtistProfile";
import CurrencySettingsModal from "../modals/CurrencySettingsModal";
import ProfileCard from "../components/ProfileCard";
import BackButton from "../components/BackButton";

UserPage.route = {
  path: "/user/:id?",
};

export default function UserPage() {
  const { user, loading } = useAuth();
  const [modalShow, setModalShow] = React.useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<User>({
    id: 0,
    created: "",
    email: "",
    firstName: "",
    lastName: "",
    username: "",
    location: "",
    roles: [],
    password: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isArtistChecked, setIsArtistChecked] = useState(false);
  const [createArtist, setCreatingArtist] = useState(false);
  const { data: artistInfo } = useArtistInfo();
  const hasArtistInfo = Boolean(artistInfo);

  useEffect(() => {
    if (user) {
      setEditForm({
        id: user.id,
        created: user.created,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        location: user.location || "",
        roles: user.roles || ["user"],
        password: user.password || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: User) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setErrors([]);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (response.ok) {
        setIsEditing(false);
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrors([result.error || "Update failed"]);
      }
    } catch {
      setErrors(["Network error. Please try again."]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        id: user.id,
        created: user.created,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        location: user.location || "",
        roles: user.roles || ["user"],
        password: user.password || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
    setIsEditing(false);
    setErrors([]);
  };

  const handleCreateArtist = async () => {
    if (!user || hasArtistInfo) return;
    setCreatingArtist(true);
    try {
      await createArtistProfile(String(user.id), user.username);
      window.location.reload(); // Temporary quick fix: reload to update UI after creating ArtistInfo
    } finally {
      setCreatingArtist(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal customTitle="Log in to view your profile" />;
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      <div className="mx-auto mb-3 px-3 px-md-4" style={{ maxWidth: '600px' }}>
        <BackButton fallbackTo="/" />
      </div>
      <ProfileCard
        title={
          (user.firstName || user.lastName)
            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
            : user.username || 'User'
        }
        fields={[
          ...((user.firstName || user.lastName) && user.username ? [{ value: user.username }] : []),
          { value: user.phoneNumber },
          { value: user.location },
          { value: user.email },
        ]}
        dateInfo={{
          label: "Created",
          value: user.created
            ? new Date(user.created).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : null,
          position: "avatar",
        }}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="me-2"
            >
              Edit
            </Button>
            <Logout />
          </>
        }
      />
      {successMessage && (
        <div className="mx-auto" style={{ maxWidth: '600px' }}>
          <Alert variant="success" className="mb-4">
            {successMessage}
          </Alert>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mx-auto" style={{ maxWidth: '600px' }}>
          <Alert variant="danger" className="mb-4">
            <ul className="mb-0">
              {errors.map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        </div>
      )}

      {artistInfo && (
        <Row>
          <Col>
            <ArtistInfo></ArtistInfo>
          </Col>
        </Row>
      )}

      <div className="bg-white rounded-3 p-3 p-md-4 mb-4 mx-auto" style={{ maxWidth: '600px' }}>
        <h6 className="fw-bold text-dark mb-3">Menu</h6>
        <div className="list-group list-group-flush">
          <Link
            to="/active-bids"
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center text-dark text-decoration-none"
            style={{ borderBottom: '1px solid #e9ecef', padding: '1rem 0' }}
          >
            Active bids
            <i className="bi bi-chevron-right text-muted"></i>
          </Link>
          <Link
            to="/my-purchases"
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center text-dark text-decoration-none"
            style={{ borderBottom: '1px solid #e9ecef', padding: '1rem 0' }}
          >
            My purchases
            <i className="bi bi-chevron-right text-muted"></i>
          </Link>
          <Link
            to="/my-sales"
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center text-dark text-decoration-none"
            style={{ borderBottom: '1px solid #e9ecef', padding: '1rem 0' }}
          >
            My sales
            <i className="bi bi-chevron-right text-muted"></i>
          </Link>
          <Link
            to="/messages"
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center text-dark text-decoration-none"
            style={{ borderBottom: '1px solid #e9ecef', padding: '1rem 0' }}
            onClick={(e) => {
              e.preventDefault();
              setModalShow(true);
            }}
          >
            Messages
            <i className="bi bi-chevron-right text-muted"></i>
          </Link>
          <Link
            to="#"
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center text-dark text-decoration-none"
            style={{ borderBottom: '1px solid #e9ecef', padding: '1rem 0' }}
            onClick={(e) => {
              e.preventDefault();
              setShowCurrencyModal(true);
            }}
          >
            Settings
            <i className="bi bi-chevron-right text-muted"></i>
          </Link>
        </div>
      </div>
      <ComingSoonModal show={modalShow} onHide={() => setModalShow(false)} />
      <EditProfileModal
        show={isEditing}
        onHide={() => setIsEditing(false)}
        editForm={editForm}
        onChange={handleEditChange}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
        isArtistChecked={isArtistChecked}
        creatingArtist={createArtist}
        onToggleArtist={setIsArtistChecked}
        onCreateArtist={handleCreateArtist}
        hasArtistInfo={hasArtistInfo}
      />
      <CurrencySettingsModal
        show={showCurrencyModal}
        onHide={() => setShowCurrencyModal(false)}
      />
    </div>
  );
}
