import { Row, Col } from 'react-bootstrap';
import Image from '../parts/Image';

AboutPage.route = {
  path: '/about-us',
  menuLabel: 'About us',
  index: 2
};

export default function AboutPage() {
  return <>
    <Row>
      <Col>
        <h2 className="text-primary">About us</h2>
        <Image
          src="/images/us.jpg"
          alt="A group photo of our employees."
        />
      </Col>
    </Row>
    <Row>
      <Col md={6}>
        <p>Founded in 2018 in the heart of Oslo, The Good Grocery began as a simple dream: bringing the finest quality ingredients to our community. What started as a small family business has grown into a trusted source for fresh, organic, and carefully curated products.</p>
        <p>Our commitment goes beyond just selling groceries. We believe in supporting local farmers, choosing sustainable practices, and creating connections between our customers and the stories behind their food. Every product on our shelves is selected with care, ensuring both exceptional quality and responsible sourcing.</p>
      </Col>
      <Col md={6}>
        <p>Today, we serve hundreds of families who share our passion for good food and conscious living. Our team works tirelessly to maintain the personal touch that makes grocery shopping a pleasure, not a chore.</p>
        <p>We source directly from organic farms across Norway and Europe, building relationships that ensure freshness and fair practices. From our hand-picked produce to our artisanal bread selection, every item reflects our dedication to excellence.</p>
        <p>Whether you're planning a simple weeknight dinner or hosting a special celebration, we're here to provide ingredients that make every meal memorable and meaningful.</p>
      </Col>
    </Row>
  </>;
}