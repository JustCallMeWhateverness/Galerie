import { Row, Col } from "react-bootstrap";
import CarouselComponent from "../parts/CarouselComponent";

HomePage.route = {
  path: "/home",
  menuLabel: "Home",
  index: 1,
};

export default function HomePage() {
  const items = [
    {
      src: "/images/products/1.jpg",
      label: "First image label",
      caption: "This is the caption text for the first image.",
      alt: "A close-up of product number one",
    },
    {
      src: "/images/products/2.jpg",
      label: "Second image label",
      caption: "This is the second image caption.",
      alt: "Product number two displayed on a table",
    },
    {
      src: "/images/products/3.jpg",
      label: "Third image label",
      caption: "Final product in the carousel.",
      alt: "Product number three with packaging",
    },
  ];

  return (
    <>
      <Row>
        <Col>
          <CarouselComponent items={items} />
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <h1>Home Page</h1>
          <p>Here we will display various sorted auctions.</p>
        </Col>
      </Row>
    </>
  );
}
