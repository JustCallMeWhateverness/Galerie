import { Row, Col } from "react-bootstrap";
import CarouselComponent from "../parts/CarouselComponent";
import AuctionCard from "../parts/AuctionCard";

HomePage.route = {
  path: "/home",
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

  const sampleAuctions = [
    {
      id: 1,
      title: "Scarf",
      currentBid: 33,
      endTime: new Date("2025-10-31T11:49:00"),
      favorited: false,
    },
    {
      id: 2,
      title: "Mug",
      currentBid: 30,
      endTime: new Date("2025-11-01T11:49:00"),
      favorited: false,
    },
    {
      id: 3,
      title: "Art",
      currentBid: 50,
      endTime: new Date("2025-11-21T11:49:00"),
      favorited: false,
    },
    {
      id: 4,
      title: "Jewelry from the Louvre",
      currentBid: 50,
      endTime: new Date("2025-11-21T11:49:00"),
      favorited: false,
    },
    {
      id: 5,
      title: "Mona Lisa",
      currentBid: 50,
      endTime: new Date("2025-10-30T11:49:00"),
      favorited: false,
    },
    {
      id: 6,
      title: "Sculpture",
      currentBid: 50,
      endTime: new Date("2025-11-01T11:49:00"),
      favorited: false,
    },
    {
      id: 7,
      title: "Painting",
      currentBid: 50,
      endTime: new Date("2025-12-21T11:49:00"),
      favorited: false,
    },
  ];

  //TODO: Image carousel component with images of upcoming auctions - depends on Start Time from auctions.
  //TODO: List popular auctions - depends on number of bids.
  //TODO: List Last Chance auctions - depends on End Time from auctions.
  //TODO: List New auctions - depends on Start Time from auctions.

  return (
    <>
      <Row>
        <Col>
          <CarouselComponent items={items} />
        </Col>
      </Row>

      <h4>Popular Auctions</h4>
      <div>
        <Row className="flex-nowrap overflow-auto">
          {sampleAuctions.map((auction) => (
            <Col key={auction.id} xs={6} md={6}>
              <AuctionCard {...auction} />
            </Col>
          ))}
        </Row>
      </div>

      <h4>Last Chance</h4>
      <div>
        <Row className="flex-nowrap overflow-auto">
          {[...sampleAuctions]
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
      </div>

      <h4>New Auctions</h4>
      <div>
        <Row className="flex-nowrap overflow-auto">
          {[...sampleAuctions]
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
      </div>
    </>
  );
}
