import { Modal, Col } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import ForgotPassword from '../components/ForgotPassword';
import { useAuth } from '../hooks/useAuth';

AuthModal.route = {
  path: "/account",
  menuLabel: "Account",
  index: 3,
};

export default function AuthModal() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  // Redirect based on user role
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    }
  }, [user]);

  if (loading) return <p>Loading...</p>;

  // Handle modal close
  const handleClose = () => {
    if (showRegister || showForgotPassword) {
      setShowLogin(true);
      setShowRegister(false);
      setShowForgotPassword(false);
    } else {
      navigate('/home');
    }
  };

  // Determine modal title
  const getTitle = () => {
    if (showLogin) return 'Login';
    if (showRegister) return 'Register';
    if (showForgotPassword) return 'Forgot Password';
    return '';
  };

  return (
    <Modal show={true} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{getTitle()}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Only show auth forms if no user is logged in */}
        {!user && (
          <Col>
            {showLogin && (
              <Login
                onSwitchToRegister={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                }}
                onSwitchToForgotPassword={() => {
                  setShowLogin(false);
                  setShowForgotPassword(true);
                }}
              />
            )}
            {showRegister && (
              <Register
                onSwitchToLogin={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }} />
            )}
            {showForgotPassword && (
              <ForgotPassword
                onSwitchToLogin={() => {
                  setShowForgotPassword(false);
                  setShowLogin(true);
                }} />
            )}
          </Col>
        )}
      </Modal.Body>
    </Modal>
  );
}
