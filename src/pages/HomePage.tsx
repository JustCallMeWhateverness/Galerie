import { Row, Col, Container } from "react-bootstrap";
import CarouselComponent from "../parts/CarouselComponent";
import AuctionCard from "../parts/AuctionCard";


HomePage.route = {
  path: "/",
};

export default function HomePage() {
  const today = new Date();
  const sampleCarouselItems = [
    {
      id: 1,
      src: "/images/products/1.jpg",
      title: "Scarf",
      startTime: new Date("2025-12-02T09:00:00"),
      endTime: new Date("2025-11-31T11:49:00"),

    },
    {
      id: 2,
      src: "/images/products/2.jpg",
      title: "Mug",
      startTime: new Date("2025-12-29T09:00:00"),
      endTime: new Date("2025-11-11T11:49:00"),
    },
    {
      id: 3,
      src: "/images/products/3.jpg",
      title: "Art",
      startTime: new Date("2025-11-15T09:00:00"),
      endTime: new Date("2025-11-21T11:49:00"),


    },
    {
      id: 4,
      src: "/images/products/4.jpg",
      title: "Jewelry from the Louvre",
      startTime: new Date("2025-12-27T09:00:00"),
      endTime: new Date("2025-11-21T11:49:00"),

    },
  ];

  const sampleAuctions = [
    {
      id: 1,
      title: "Scarf",
      currentBid: 33,
      endTime: new Date("2025-10-31T11:49:00"),
      startTime: new Date("2025-10-02T09:00:00"),
      favorited: false,
      favouritesCount: 10,
    },
    {
      id: 2,
      title: "Mug",
      currentBid: 30,
      endTime: new Date("2025-11-01T11:49:00"),
      startTime: new Date("2025-10-29T09:00:00"),
      favorited: false,
      favouritesCount: 5,
    },
    {
      id: 3,
      title: "Art",
      currentBid: 50,
      endTime: new Date("2025-11-21T11:49:00"),
      startTime: new Date("2025-11-15T09:00:00"),
      favorited: false,
      favouritesCount: 20,
    },
    {
      id: 4,
      title: "Jewelry from the Louvre",
      currentBid: 50,
      endTime: new Date("2025-11-21T11:49:00"),
      startTime: new Date("2025-10-27T09:00:00"),
      favorited: false,
      favouritesCount: 150,
    },
    {
      id: 5,
      title: "Mona Lisa",
      currentBid: 50,
      endTime: new Date("2025-10-30T11:49:00"),
      startTime: new Date("2025-10-20T09:00:00"),
      favorited: false,
      favouritesCount: 300,
    },
    {
      id: 6,
      title: "Sculpture",
      currentBid: 50,
      endTime: new Date("2025-11-01T11:49:00"),
      startTime: new Date("2025-10-25T09:00:00"),
      favorited: false,
      favouritesCount: 34,
    },
    {
      id: 7,
      title: "Painting",
      currentBid: 50,
      endTime: new Date("2025-12-21T11:49:00"),
      startTime: new Date("2025-12-15T09:00:00"),
      favorited: false,
      favouritesCount: 0,
    },
  ];


  return (
    <>
      <Row>
        <Col>
          <CarouselComponent items={sampleCarouselItems.filter(item => item.startTime > today)} />
        </Col>
      </Row>

      <h4>Popular Auctions</h4>
      <Container className="mb-4">
        <Row className="flex-nowrap overflow-auto scroll">
          {[...sampleAuctions]
            .filter((auction) => auction.favouritesCount > 50)
            .sort((a, b) => b.favouritesCount - a.favouritesCount)
            .map((auction) => (
              <Col key={auction.id} xs={6} md={6}>
                <AuctionCard {...auction} />
              </Col>
            ))}
        </Row>
      </Container>

      <h4>Last Chance</h4>
      <Container className="mb-4">
        <Row className="flex-nowrap overflow-auto scroll">
          {[...sampleAuctions]
            .filter(
              (auction) =>
                auction.endTime.getTime() - Date.now() > 0 &&
                auction.endTime.getTime() - Date.now() < 24 * 60 * 60 * 1000
            )
            .sort(
              (a, b) =>
                new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
            )
            .map((auction) => (
              <Col key={auction.id} xs={6} md={6}>
                <AuctionCard {...auction} />
              </Col>
            ))}
        </Row>
      </Container>

      <h4>New Auctions</h4>
      <Container className="mb-4">
        <Row className="flex-nowrap overflow-auto scroll">
          {[...sampleAuctions]
            .filter((auction) => {
              const days = 7;
              return Date.now() - auction.startTime.getTime() < days * 24 * 60 * 60 * 1000
                && Date.now() - auction.startTime.getTime() > 0;
            })
            .sort(
              (a, b) =>
                new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
            )
            .map((auction) => (
              <Col key={auction.id} xs={6} md={6}>
                <AuctionCard {...auction} />
              </Col>
            ))}
        </Row>
      </Container>
    </>
  );
}
