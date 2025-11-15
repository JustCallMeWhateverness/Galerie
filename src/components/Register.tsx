import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import ErrorToast from '../parts/ErrorToast';
import flattenErrorMessages from '../utils/flattenErrorMessages';

export default function Register({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {

  const [registerData, setRegisterData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    location: '',
    phone: '',
    email: '',
    password: ''
  });


  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

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
      const content = await response.json()

      setErrorMessage(flattenErrorMessages(content))

      setShowToast(true)

    }
  }

  return (
    <Form onSubmit={handleRegister}>
      {
        errorMessage && <ErrorToast
          show={showToast}
          onClose={() => setShowToast(false)}
          title="Registration problem"
          message={errorMessage}
        />
      }
      <Form.Group controlId="formUsername" className='mb-3'>
        <Form.Label>Username</Form.Label>
        <Form.Control required
          type="text"
          placeholder="Enter username"
          value={registerData.username}
          onChange={(e) => setProperty('username', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formFirstName" className='mb-3'>
        <Form.Label>First Name</Form.Label>
        <Form.Control required
          type="text"
          placeholder="Enter first name"
          value={registerData.firstName}
          onChange={(e) => setProperty('firstName', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formLastName" className='mb-3'>
        <Form.Label>Last Name</Form.Label>
        <Form.Control required
          type="text"
          placeholder="Enter last name"
          value={registerData.lastName}
          onChange={(e) => setProperty('lastName', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formLocation" className='mb-3'>
        <Form.Label>Location</Form.Label>
        <Form.Control required
          type="text"
          placeholder="Enter location"
          value={registerData.location}
          onChange={(e) => setProperty('location', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formPhoneNumber" className='mb-3'>
        <Form.Label>Phone Number</Form.Label>
        <Form.Control required
          type="text"
          placeholder="Enter phone number"
          value={registerData.phone}
          onChange={(e) => setProperty('phone', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formEmail" className='mb-3'>
        <Form.Label>Email address</Form.Label>
        <Form.Control required
          type="email"
          placeholder="Enter email"
          value={registerData.email}
          onChange={(e) => setProperty('email', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formPassword" className='mb-1'>
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