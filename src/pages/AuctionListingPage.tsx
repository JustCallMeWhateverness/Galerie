import { Row, Col } from "react-bootstrap";
import Image from "../parts/Image";

AboutPage.route = {
  path: "/listing",
};

export default function AboutPage() {
  return (
    <>
      <Row>
        <Col>
          
          <Image
            src="/images/products/3.jpg"
            alt="A group photo of our employees."
          />
          <h2 className="text-primary">About us</h2>
        </Col>
      </Row>
      <Row>
        <Col md={6}></Col>
      </Row>
    </>
  );
}
