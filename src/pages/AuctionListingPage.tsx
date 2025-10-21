import { Row, Col } from "react-bootstrap";
import Image from "../parts/Image";
import { useState } from "react";

AboutPage.route = {
  path: "/listing",
};

export default function AboutPage(favorited: boolean) {
  const [isFavorited, setFavorited] = useState(favorited);

  function onFavorite() {
    setFavorited((isFavorited) => !isFavorited);
  }
  return (
    <>
      <Row>
        <Col>
          <Image
            src="/images/products/3.jpg"
            alt="A group photo of our employees."
          />
        </Col>
      </Row>
      <Row>
        <Col
          md={6}
          className="d-flex justify-content-between align-items-center"
        >
          <h2 className="mb-0">Handmade vase</h2>
          <span role="button" onClick={onFavorite} className="me-3">
            <i
              className={`bi bi-suit-heart${isFavorited ? "-fill" : ""} fs-1`}
            ></i>
          </span>
        </Col>
      </Row>
    </>
  );
}
