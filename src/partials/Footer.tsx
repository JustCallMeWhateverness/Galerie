import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Footer() {
  return <footer className='bg-primary fixed-bottom rounded-1 shadow-sm'>
    <Container fluid>
      <Row>
        <Col className="text-center py-3">
          <Link to="/home" className="d-flex flex-column align-items-center text-decoration-none text-black"  >
            <i className="bi bi-house-door-fill fs-1"></i>
          </Link>
        </Col>
        <Col className="text-center py-3">
          <Link to="/auctions" className="d-flex flex-column align-items-center text-decoration-none text-black">
            <i className="bi bi-search fs-1"></i>
          </Link>
        </Col>
        <Col className="text-center py-3">
          <Link to="/create" className="d-flex flex-column align-items-center text-decoration-none text-black">
            <i className="bi bi-plus-lg fs-1"></i>
          </Link>
        </Col>
        <Col className="text-center py-3">
          <Link to="/favourites" className="d-flex flex-column align-items-center text-decoration-none text-black">
            <i className="bi bi-suit-heart-fill fs-1"></i>
          </Link>
        </Col>
        <Col className="text-center py-3 text-bg-primary">
          <Link to="/account" className="d-flex flex-column align-items-center text-decoration-none text-black">
            <i className="bi bi-person-fill fs-1"></i>
          </Link>
        </Col>
      </Row>
    </Container>
  </footer >;
}