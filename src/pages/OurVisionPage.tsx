import { Row, Col } from 'react-bootstrap';
import Image from '../parts/Image';

OurVisionPage.route = {
  path: '/our-vision',
  menuLabel: 'Our Vision',
  index: 3
};

export default function OurVisionPage() {
  return <>
    <Row>
      <Col>
        <h2 className="text-primary">We run with our vision!</h2>
        <Image
          src="/images/start.jpg"
          alt="A runner's legs and hands at the starting line of a track race."
        />
      </Col>
    </Row>
    <Row>
      <Col md={6}>
        <p>We run with our vision to transform how people think about food shopping, creating a community where quality, sustainability, and genuine care come together naturally. Like dedicated runners, we pursue our goals with persistence and purpose.</p>
        <p>We dream of a food system that honors both the earth and the people who cultivate it. Every partnership we build with farmers and producers reflects our commitment to fair trade, environmental stewardship, and supporting local economies wherever possible.</p>
        <p>Innovation guides our approach to traditional values. We embrace modern techniques for freshness and efficiency while maintaining the personal relationships and attention to detail that define exceptional service.</p>
      </Col>
      <Col md={6}>
        <p>Our customers are partners in this vision, running alongside us as we make conscious choices that ripple outward to support sustainable agriculture and healthier communities. Together, we're proving that grocery shopping can be both convenient and conscientious.</p>
        <p>Looking ahead, we see The Good Grocery as a model for responsible retail, inspiring other businesses to prioritize people and planet alongside profit. Through education, transparency, and unwavering commitment to quality, we're building a future where good food and good values are accessible to everyone in our community.</p>
      </Col>
    </Row>
  </>;
}