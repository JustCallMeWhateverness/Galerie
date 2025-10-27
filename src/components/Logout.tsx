import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Logout() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    const response = await fetch("/api/login", { method: "DELETE", credentials: "include" });
    if (response.ok) {
      setUser(null);
      navigate("/");
    }
    else { alert("Logout failed."); }
  }
  return (
    <>
      {user && (
        <Button onClick={handleLogout} size="sm">Logout</Button>
      )}
    </>
  );
}
