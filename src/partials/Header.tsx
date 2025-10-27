import { Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Header() {


  return (
    <header>

      <Navbar
        bg="primary"
        data-bs-theme="light"
        fixed="top"
        className="justify-content-center shadow-sm rounded-1"
      >
        <Navbar.Brand as={Link} to="/home" className=" text-center">
          Galerie
        </Navbar.Brand>
      </Navbar>
    </header>
  );
}
