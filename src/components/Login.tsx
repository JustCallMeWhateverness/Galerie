import { useState } from "react";
import { Form, Button } from "react-bootstrap";


export default function Login({
  onSwitchToRegister,
  onSwitchToForgotPassword
}: {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}) {

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  function setProperty(name: string, value: string) {
    setLoginData({ ...loginData, [name]: value });
  }
  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });
    if (response.ok) {
      const data = await response.json();
      console.log("Login successful:", data);
    } else {
      console.error("Login failed");
    }
  }

  return (
    <Form onSubmit={handleLogin}>
      <Button variant="outline-secondary" type="button" onClick={onSwitchToRegister} className="mb-2">
        No account yet? Register
      </Button>
      <Form.Group controlId="formEmail">
        <Form.Label >Email address</Form.Label>
        <Form.Control required
          type="email"
          placeholder="Enter email"
          value={loginData.email}
          onChange={(e) => setProperty("email", e.target.value)}
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