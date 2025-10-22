import { useState, useEffect, useCallback } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type User from '../interfaces/User';

// Route configuration for the UserPage component
UserPage.route = {
  path: '/user/:id?', // Optional user ID parameter
  menuLabel: 'My Profile',
  index: 5
};

/**
 * UserPage Component
 * Displays user profile information with edit functionality and navigation menu
 * Features: Profile display, inline editing, menu navigation, logout functionality
 */
export default function UserPage() {
  const navigate = useNavigate();
  
  // State management for user data and UI interactions
  const [user, setUser] = useState<User | null>(null); // Current user data
  const [isLoading, setIsLoading] = useState(true); // Loading state for API calls
  const [isEditing, setIsEditing] = useState(false); // Edit mode toggle
  const [editForm, setEditForm] = useState<User>({ // Form data for editing
    id: 0,
    email: '',
    name: '',
    role: ''
  });
  const [errors, setErrors] = useState<string[]>([]); // Error messages array
  const [successMessage, setSuccessMessage] = useState(''); // Success notification

  /**
   * Fetches current user data from the API
   * Redirects to login page if user is not authenticated
   */
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/login');
      const result = await response.json();
      
      if (response.ok && !result.error) {
        // User is authenticated, set user data and form
        setUser(result);
        setEditForm({
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role || 'user'
        });
      } else {
        // User not authenticated, redirect to login
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Load user data on component mount
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  /**
   * Handles input changes in edit form
   * Updates the editForm state with new values
   */
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: User) => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Saves user profile changes to the API
   * Updates local user state on successful save
   */
  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    setErrors([]);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (response.ok) {
        // Update local user state with new data
        setUser({ ...user, ...editForm });
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors([result.error || 'Update failed']);
      }
    } catch {
      setErrors(['Network error. Please try again.']);
    } finally {
      setIsLoading(false);
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
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      });
    }
    setIsEditing(false);
    setErrors([]);
  };

  /**
   * Handles user logout
   * Calls logout API and redirects to login page
   */
  const handleLogout = async () => {
    try {
      await fetch('/api/login', {
        method: 'DELETE',
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Loading state - show spinner while fetching data
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // No user data - show login prompt
  if (!user) {
    return (
      <div className="text-center mt-5">
        <Alert variant="warning">
          Please log in to view your profile.
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* User Profile Card - Main container for user information */}
      <div className="bg-white rounded-3 p-3 p-md-4 mb-4 mx-auto" style={{ maxWidth: '600px', border: '1px solid #e9ecef' }}>
        <div className="d-flex flex-column flex-md-row align-items-start">
          {/* Profile Picture Section - Avatar placeholder */}
          <div className="me-md-4 mb-3 mb-md-0 text-center text-md-start">
            <div 
              className="rounded-3 bg-light d-flex align-items-center justify-content-center mx-auto mx-md-0"
              style={{ width: '120px', height: '120px', border: '1px solid #e9ecef' }}
            >
              <i className="bi bi-person-fill text-muted" style={{ fontSize: '3rem' }}></i>
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
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    placeholder="Full Name"
                    className="border-0 bg-transparent fs-4 fw-bold"
                    style={{ padding: '0' }}
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
                    style={{ padding: '0' }}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Location"
                    className="border-0 bg-transparent text-dark"
                    style={{ padding: '0' }}
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
                    style={{ padding: '0' }}
                  />
                </Form.Group>

                {/* Action buttons for save/cancel */}
                <div className="d-flex gap-2 mt-3">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
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
                <h4 className="fw-bold mb-1 text-dark">{user.name}</h4>
                {/* User role/profession */}
                <div className="text-dark mb-1">{user.role || 'User'}</div>
                {/* Static location placeholder */}
                <div className="text-dark mb-1">Location</div>
                {/* User email */}
                <div className="text-dark mb-1">{user.email}</div>
                {/* Registration date */}
                <div className="text-dark small">
                  Reg. {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </div>
                
                {/* Edit button to enter edit mode */}
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  className="mt-3"
                  onClick={() => setIsEditing(true)}
                  style={{ borderColor: '#6c757d', color: '#000' }}
                >
                  Edit
                </Button>
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
      <div className="bg-white rounded-3 p-3 p-md-4 mb-4 mx-auto" style={{ maxWidth: '600px', border: '1px solid #e9ecef' }}>
        <h6 className="fw-bold text-dark mb-3">Menu</h6>
        
        <div className="list-group list-group-flush">
          {/* Active bids menu item */}
          <div className="list-group-item border-0 px-0 py-3 d-flex justify-content-between align-items-center border-bottom">
            <span className="text-dark">Active bids</span>
            <i className="bi bi-chevron-right text-muted"></i>
          </div>
          
          {/* My purchases menu item */}
          <div className="list-group-item border-0 px-0 py-3 d-flex justify-content-between align-items-center border-bottom">
            <span className="text-dark">My purchases</span>
            <i className="bi bi-chevron-right text-muted"></i>
          </div>
          
          {/* My sales menu item */}
          <div className="list-group-item border-0 px-0 py-3 d-flex justify-content-between align-items-center border-bottom">
            <span className="text-dark">My sales</span>
            <i className="bi bi-chevron-right text-muted"></i>
          </div>
          
          {/* Messages menu item */}
          <div className="list-group-item border-0 px-0 py-3 d-flex justify-content-between align-items-center">
            <span className="text-dark">Messages</span>
            <i className="bi bi-chevron-right text-muted"></i>
          </div>
        </div>
      </div>

      {/* Logout Button - Full width button with custom color */}
      <div className="text-center mb-5 mx-auto" style={{ maxWidth: '600px' }}>
        <Button 
          variant="primary" 
          className="w-100 py-3 fw-semibold"
          onClick={handleLogout}
          style={{ backgroundColor: '#087990', borderColor: '#087990' }}
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
