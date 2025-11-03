import { Container, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky-top">
      <Navbar bg="primary" data-bs-theme="light" className="shadow-sm">
        <Container fluid className="justify-content-center">
          <Navbar.Brand as={Link} to="/">
            Galerie
          </Navbar.Brand>
        </Container>
      </Navbar>
    </header>
  );
}
