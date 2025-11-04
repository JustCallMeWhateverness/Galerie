import { useState, useEffect } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";

import type User from "../interfaces/User";
import AuthModal from "../modals/AuthModal";
import Logout from "../components/Logout";
import { Link } from "react-router-dom";
import { ComingSoonModal } from "../modals/ComingSoonModal";
import React from "react";

// Route configuration for the UserPage component
UserPage.route = {
  path: "/user/:id?", // Optional user ID parameter
  menuLabel: "My Profile",
  index: 5,
};

/**
 * UserPage Component
 * Displays user profile information with edit functionality and navigation menu
 * Features: Profile display, inline editing, menu navigation, logout functionality
 */
export default function UserPage() {
  // State management for user data and UI interactions
  const { user, loading } = useAuth();
  const [modalShow, setModalShow] = React.useState(false);
  const [isSaving, setIsSaving] = useState(false); // Loading state for API calls
  const [isEditing, setIsEditing] = useState(false); // Edit mode toggle
  const [editForm, setEditForm] = useState<User>({
    // Form data for editing
    id: 0,
    created: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "",
    password: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<string[]>([]); // Error messages array
  const [successMessage, setSuccessMessage] = useState(""); // Success notification

  /**
   * Fetches current user data from the API
   * Redirects to login page if user is not authenticated
   */
  useEffect(() => {
    if (user) {
      setEditForm({
        id: user.id,
        created: user.created,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || "user",
        password: user.password || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  /**
   * Handles input changes in edit form
   * Updates the editForm state with new values
   */
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: User) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Saves user profile changes to the API
   * Updates local user state on successful save
   */
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
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (response.ok) {
        // Update local user state with new data
        setIsEditing(false);
        setSuccessMessage("Profile updated successfully!");
        // Clear success message after 3 seconds
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

  /**
   * Cancels edit mode and resets form to original user data
   */
  const handleCancel = () => {
    if (user) {
      // Reset form to original user data
      setEditForm({
        id: user.id,
        created: user.created,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || "user",
        password: user.password || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
    setIsEditing(false);
    setErrors([]);
  };

  // Loading state - show spinner while fetching data
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // No user data - show login prompt
  if (!user) {
    return <AuthModal customTitle="Log in to view your profile" />;
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* User Profile Card - Main container for user information */}
      <div
        className="bg-white rounded-3 p-3 p-md-4 mb-4 mx-auto"
        style={{ maxWidth: "600px", border: "1px solid #e9ecef" }}
      >
        <div className="d-flex flex-column flex-md-row align-items-start">
          {/* Profile Picture Section - Avatar placeholder */}
          <div className="me-md-4 mb-3 mb-md-0 text-center text-md-start">
            <div
              className="rounded-3 bg-light d-flex align-items-center justify-content-center mx-auto mx-md-0"
              style={{
                width: "120px",
                height: "120px",
                border: "1px solid #e9ecef",
              }}
            >
              <i
                className="bi bi-person-fill text-muted"
                style={{ fontSize: "3rem" }}
              ></i>
            </div>
          </div>

          {/* User Information Section - Name, role, email, etc. */}
          <div className="flex-grow-1">
            {isEditing ? (
              // Edit Mode - Inline form for editing user information
              <Form>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditChange}
                    placeholder="First Name"
                    className="border-0 bg-transparent fs-4 fw-bold"
                    style={{ padding: "0" }}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditChange}
                    placeholder="Last Name"
                    className="border-0 bg-transparent text-dark"
                    style={{ padding: "0" }}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                    placeholder="Profession"
                    className="border-0 bg-transparent text-dark"
                    style={{ padding: "0" }}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Location"
                    className="border-0 bg-transparent text-dark"
                    style={{ padding: "0" }}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Control
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    placeholder="Email"
                    className="border-0 bg-transparent text-dark"
                    style={{ padding: "0" }}
                  />
                </Form.Group>

                {/* Action buttons for save/cancel */}
                <div className="d-flex gap-2 mt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            ) : (
              // Display Mode - Show user information with edit button
              <div>
                {/* User name display */}
                <h4 className="fw-bold mb-1 text-dark">
                  {user.firstName} {user.lastName}
                </h4>
                {/* User role/profession */}
                <div className="text-dark mb-1">{user.role || "User"}</div>
                {/* Static location placeholder */}
                <div className="text-dark mb-1">Location</div>
                {/* User email */}
                <div className="text-dark mb-1">{user.email}</div>
                {/* Registration date */}
                <div className="text-dark small">
                  Reg.{" "}
                  {user.created
                    ? new Date(user.created).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </div>

                {/* Edit button to enter edit mode */}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => setIsEditing(true)}
                  style={{ borderColor: "#6c757d", color: "#000" }}
                >
                  Edit
                </Button>
                <div className="mt-3 float-end">
                  <Logout />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Message Alert - Shows when profile is updated successfully */}
      {successMessage && (
        <Alert variant="success" className="mb-4">
          {successMessage}
        </Alert>
      )}

      {/* Error Messages Alert - Shows validation or API errors */}
      {errors.length > 0 && (
        <Alert variant="danger" className="mb-4">
          <ul className="mb-0">
            {errors.map((error: string, index: number) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Navigation Menu Section - User action menu with chevron arrows */}
      <div
        className="bg-white rounded-3 p-3 p-md-4 mb-4 mx-auto"
        style={{ maxWidth: "600px", border: "1px solid #e9ecef" }}
      >
        <h6 className="fw-bold text-dark mb-3">Menu</h6>

        <div className="list-group-item border-0 px-0 py-3 border-bottom">
          <Link
            to="/active-bids"
            className="text-dark text-decoration-none  d-flex justify-content-between align-items-center"
          >
            Active bids
            <i className="bi bi-chevron-right text-muted"></i>
          </Link>
        </div>

        <div className="list-group-item border-0 px-0 py-3 border-bottom">
          <Link
            to="/my-purchases"
            className="text-dark text-decoration-none d-flex justify-content-between align-items-center"
          >
            My purchases
            <i className="bi bi-chevron-right text-muted"></i>
          </Link>
        </div>

        <div className="list-group-item border-0 px-0 py-3 border-bottom">
          <Link
            to="/my-sales"
            className="text-dark text-decoration-none d-flex justify-content-between align-items-center"
          >
            My sales
            <i className="bi bi-chevron-right text-muted"></i>
          </Link>
        </div>

        <div className="list-group-item border-0 px-0 py-3 border-bottom">
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

          <ComingSoonModal
            show={modalShow}
            onHide={() => setModalShow(false)}
          />
        </div>
      </div>
    </div>
  );
}
