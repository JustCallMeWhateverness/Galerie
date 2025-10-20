import type Product from '../interfaces/Product';
import { Row, Col } from 'react-bootstrap';
import { Link, useLoaderData } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';
import Image from '../parts/Image';
import productsLoader from '../utils/productsLoader';

ProductDetailsPage.route = {
  path: '/products/:slug',
  parent: '/',
  loader: productsLoader
};

export default function ProductDetailsPage() {

  const product =
    useLoaderData().products[0] as Product;

  // if no product found, show 404
  if (!product) {
    return <NotFoundPage />;
  }

  const { id, name, quantity, price$, description } = product;

  return <article className="product-details">
    <Row>
      <Col>
        <h2 className="text-primary">{name}</h2>
        <Image
          src={'/images/products/' + id + '.jpg'}
          alt={'Product image of the product ' + name + '.'}
        />
        {description.split('\n').map((x, i) => <p key={i}>{x}</p>)}
      </Col>
    </Row>
    <Row>
      <Col className="px-4 pb-4">
        <Row className="p-3 bg-primary-subtle rounded">
          <Col className="pe-4 pe-sm-5 border-end border-primary">
            <strong>Quantity</strong>:
            <span
              className="d-block d-sm-inline float-sm-end"
            >
              {quantity}
            </span>
          </Col>
          <Col className="ps-4 ps-sm-5 text-end text-sm-start">
            <strong>Price</strong>:
            <span
              className="d-block d-sm-inline float-sm-end"
            >
              ${price$.toFixed(2)}
            </span>
          </Col>
        </Row>
      </Col>
    </Row >
    <Row>
      <Col>
        <Link to="/" className="btn btn-primary float-end">
          Back to the product list
        </Link>
      </Col>
    </Row>
  </article >;
}