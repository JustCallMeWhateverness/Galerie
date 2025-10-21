import { Row, Col } from "react-bootstrap";
import { Carousel } from "react-bootstrap";
import ExampleCarouselImage from "../parts/ExampleCarouselImage";

HomePage.route = {
  path: "/",
  menuLabel: "Home",
  index: 1,
};

export default function HomePage() {
  return (
    <>
      <Row>
        <Col>
          {" "}
          <Carousel fade>
            <Carousel.Item>
              <ExampleCarouselImage text="First slide" />
              <Carousel.Caption>
                <h3>First slide label</h3>
                <p>
                  Nulla vitae elit libero, a pharetra augue mollis interdum.
                </p>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <ExampleCarouselImage text="Second slide" />
              <Carousel.Caption>
                <h3>Second slide label</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <ExampleCarouselImage text="Third slide" />
              <Carousel.Caption>
                <h3>Third slide label</h3>
                <p>
                  Praesent commodo cursus magna, vel scelerisque nisl
                  consectetur.
                </p>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
        </Col>
      </Row>
      <Row>
        <Col md={6}></Col>
      </Row>
    </>
  );
}
