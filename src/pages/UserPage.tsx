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
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit") === "artist") {
      setIsEditing(true);
    }
  }, []);
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
      <Row className="justify-content-center align-items-center user-loading-row">
        <Col xs="auto">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Col>
      </Row>
    );
  }

  if (!user) {
    return <AuthModal customTitle="Log in to view your profile" />;
  }

  return (
    <div>
      <Row className="user-profile-row mx-auto">
        <Col xs={5} className="user-avatar-col">
          <div className="user-avatar">
            <i className="bi bi-person-fill"></i>
          </div>
          <div className="user-created">
            Created:{" "}
            {user.created
              ? new Date(user.created).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              : "N/A"}
          </div>
        </Col>

        <Col>
          <div>
            <h4 className="user-name">
              {user.firstName} {user.lastName}
            </h4>
            <div className="username">{user.username}</div>
            <div className="phone-number">{user.phoneNumber}</div>
            <div className="user-location">{user.location}</div>
            <div className="user-email">{user.email}</div>

            <Row className="mt-3">
              <Col xs="auto" className="d-flex justify-content-between">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="me-2"
                >
                  Edit
                </Button>
                <Logout />
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
      {successMessage && (
        <Row>
          <Col>
            <Alert variant="success" className="user-alert-success">
              {successMessage}
            </Alert>
          </Col>
        </Row>
      )}

      {errors.length > 0 && (
        <Row>
          <Col>
            <Alert variant="danger" className="user-alert-error">
              <ul className="mb-0">
                {errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          </Col>
        </Row>
      )}

      {artistInfo && (
        <Row>
          <Col>
            <ArtistInfo></ArtistInfo>
          </Col>
        </Row>
      )}

      <Row className="user-menu-row mx-auto">
        <Col>
          <h6 className="user-menu-title">Menu</h6>
          <div className="list-group list-group-flush user-menu-list">
            <Row className="list-group-item d-flex justify-content-between align-items-center user-menu-item">
              <Link
                to="/active-bids"
                className="text-dark text-decoration-none  d-flex justify-content-between align-items-center"
              >
                Active bids
                <i className="bi bi-chevron-right text-muted"></i>
              </Link>
            </Row>
            <Row className="list-group-item d-flex justify-content-between align-items-center user-menu-item">
              <Link
                to="/my-purchases"
                className="text-dark text-decoration-none  d-flex justify-content-between align-items-center"
              >
                My purchases
                <i className="bi bi-chevron-right text-muted"></i>
              </Link>
            </Row>
            <Row className="list-group-item d-flex justify-content-between align-items-center user-menu-item">
              <Link
                to="/my-sales"
                className="text-dark text-decoration-none  d-flex justify-content-between align-items-center"
              >
                My sales
                <i className="bi bi-chevron-right text-muted"></i>
              </Link>
            </Row>
            <Row className="list-group-item d-flex justify-content-between align-items-center user-menu-item">
              <Link
                to="/messages"
                className="text-dark text-decoration-none d-flex justify-content-between align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  setModalShow(true);
                }}
              >
                Messages
                <i className="bi bi-chevron-right text-muted"></i>
              </Link>
            </Row>
            <Row className="list-group-item d-flex justify-content-between align-items-center user-menu-item">
              <Link
                to="#"
                className="text-dark text-decoration-none d-flex justify-content-between align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  setShowCurrencyModal(true);
                }}
              >
                Settings
                <i className="bi bi-chevron-right text-muted"></i>
              </Link>
            </Row>
          </div>
        </Col>
      </Row>
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
