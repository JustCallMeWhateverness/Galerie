import { useState } from "react";
import { Form, Button, Alert, Toast, ToastContainer } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";


export default function Login({
  onSwitchToRegister,
  onSwitchToForgotPassword,
}: {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}) {

  const [loginData, setLoginData] = useState({
    usernameOrEmail: '',
    password: ''
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { setUser } = useAuth();
  const [show, setShow] = useState(false)

  function setProperty(name: string, value: string) {
    setLoginData({ ...loginData, [name]: value });
  }
  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });
    if (response.ok) {
      const data = await response.json();
      setErrorMessage(null)
      console.log("Login successful:", data);
      setUser(data);
    } else {
      setShow(true)
      setErrorMessage('Login failed')
    }
  }

  return (
    <Form onSubmit={handleLogin}>
      {
        errorMessage && <ToastContainer
          position="top-end" className="position-absolute" >
          <Toast
            onClose={() => setShow(false)}
            show={show}
            autohide
            delay={3000}
            animation={true}
            className="z-3"
          >
            <Toast.Header className="me-auto" >Login Problem</Toast.Header>
            <Toast.Body>
              {errorMessage}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      }
      <Button variant="outline-secondary" type="button" onClick={onSwitchToRegister} className="mb-2">
        No account yet? Register
      </Button>
      <Form.Group controlId="formUsernameOrEmail">
        <Form.Label>Username or Email</Form.Label>
        <Form.Control required
          type="text"
          placeholder="Enter username or email"
          value={loginData.usernameOrEmail}
          onChange={(e) => setProperty("usernameOrEmail", e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control required
          type="password"
          placeholder="Password"
          value={loginData.password}
          onChange={(e) => setProperty("password", e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit" className="mt-2 float-end">
        Login
      </Button>
      <Button variant="link" type="button" onClick={onSwitchToForgotPassword} className="mt-2">
        <span className="small">Forgot Password?</span>
      </Button>
    </Form>

  );
}