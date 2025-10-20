import type Product from '../interfaces/Product';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';
import Image from './Image';

export default function ProductCard(
  { id, name, quantity, price$, slug }: Product
) {
  const navigate = useNavigate();
  return <Card
    className="mb-4 border-0"
    role="button" /*sets the cursor to pointer*/
    onClick={() => navigate('/products/' + slug)}
  >
    <Card.Body as={Row}>
      <Col>
        <Card.Title>{name}</Card.Title>
        <Card.Text className="mb-0">
          <strong className=" d-sm-none">Qty:</strong>
          <strong className="d-none d-none d-sm-inline-block">Quantity:</strong>
          <span className="float-end">{quantity}</span>
        </Card.Text>
        <Card.Text>
          <strong>
            Price:
            <span className="float-end">${price$.toFixed(2)}</span>
          </strong>
        </Card.Text>
        <Button variant="primary">More info</Button>
      </Col>
      <Col>
        <Card.Img
          as={Image}
          src={'/images/products/' + id + '.jpg'}
          alt={'Product image of the product ' + name + '.'}
          className="h-100"
        />
      </Col>
    </Card.Body>
  </Card >;
}