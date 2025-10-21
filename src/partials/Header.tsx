import { Navbar, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {

  const { user, setUser } = useAuth();

  async function handleLogout() {
    const response = await fetch("/api/login", { method: "DELETE", credentials: "include" });
    if (response.ok) {
      setUser(null);

    }
    else { alert("Logout failed."); }
  }

  return (
    <header>

      <Navbar
        bg="primary"
        data-bs-theme="light"
        fixed="top"
        className="justify-content-center shadow-sm rounded-1"
      >
        {user && (
          <Button variant="danger" type="button" onClick={handleLogout} className="position-absolute end-0 m-2">
            Logout
          </Button>
        )}
        <Navbar.Brand as={Link} to="/home" className=" fw-bold text-center">
          Auction App
        </Navbar.Brand>
      </Navbar>
    </header>
  );
}
