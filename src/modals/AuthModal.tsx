import { Modal, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import ForgotPassword from '../components/ForgotPassword';

AuthModal.route = {
  path: "/account",
  menuLabel: "Account",
  index: 3,
};

export default function AuthModal() {

  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => {
    if (showRegister || showForgotPassword) {
      setShowLogin(true);
      setShowRegister(false);
      setShowForgotPassword(false);
    } else {
      navigate('/home');
    }
  };

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
      </Modal.Body>
    </Modal>
  );
}