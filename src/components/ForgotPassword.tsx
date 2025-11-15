import { useState } from "react";
import { Form, Button } from "react-bootstrap";

export default function ForgotPassword({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {

  const [email, setEmail] = useState('');

  async function handleForgotPassword(event: React.FormEvent) {
    event.preventDefault();

    const response = await fetch("/api/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });
    if (response.ok) {
      onSwitchToLogin();
    } else {
      console.error("Failed to send password reset email");
    }
  }

  return (
    <Form onSubmit={handleForgotPassword}>
      <Form.Group controlId="formEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit" className="mt-2 float-end">
        Send Reset Password Email
      </Button>
    </Form>
  );
}