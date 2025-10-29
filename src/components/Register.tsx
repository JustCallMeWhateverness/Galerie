import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

export default function Register({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {

  const [registerData, setRegisterData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: ''
  });
  function setProperty(name: string, value: string) {
    setRegisterData({ ...registerData, [name]: value });
  }
  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    });
    if (response.ok) {
      onSwitchToLogin();
    } else {
      const error = await response.json();
      console.error('Registration failed', error);
    }
  }

  return (
    <Form onSubmit={handleRegister}>
      <Form.Group controlId="formUsername">
        <Form.Label>Username</Form.Label>
        <Form.Control required
          type="text"
          placeholder="Enter username"
          value={registerData.username}
          onChange={(e) => setProperty('username', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formFirstName">
        <Form.Label>First Name</Form.Label>
        <Form.Control required
          type="text"
          placeholder="Enter first name"
          value={registerData.firstName}
          onChange={(e) => setProperty('firstName', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formLastName">
        <Form.Label>Last Name</Form.Label>
        <Form.Control required
          type="text"
          placeholder="Enter last name"
          value={registerData.lastName}
          onChange={(e) => setProperty('lastName', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formPhoneNumber">
        <Form.Label>Phone Number</Form.Label>
        <Form.Control required
          type="text"
          placeholder="Enter phone number"
          value={registerData.phone}
          onChange={(e) => setProperty('phone', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control required
          type="email"
          placeholder="Enter email"
          value={registerData.email}
          onChange={(e) => setProperty('email', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control required
          type="password"
          placeholder="Enter password"
          value={registerData.password}
          onChange={(e) => setProperty('password', e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit" className="mt-2 float-end">
        Register
      </Button>
    </Form>
  );
}