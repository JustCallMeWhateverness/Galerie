import { useState } from "react";
import { Form, Button } from "react-bootstrap";
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

  const { setUser } = useAuth();

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
      console.log("Login successful:", data);
      setUser(data);
    } else {
      const error = await response.json();
      console.error("Login failed", error);
    }
  }

  return (
    <Form onSubmit={handleLogin}>
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