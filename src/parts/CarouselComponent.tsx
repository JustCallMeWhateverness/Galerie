import { Carousel } from "react-bootstrap";
import Image from "./Image";
import { Link } from "react-router-dom";


export type CarouselItem = {
  src: string;
  id: number;
  alt?: string;
  title: string;
  startTime?: Date;
  link: string;
};

//TODO: Decide if indicators should be shown or if we create the dots ourselves as intended in the design
type Props = {
  items: CarouselItem[];
  showIndicators?: boolean;
  showControls?: boolean;
};

// TODO: Change link to autoroute link when we have the routes and auctions ready

export default function CarouselComponent({
  items,
  showIndicators = true,
  showControls = true,
}: Props) {
  return (
    <Carousel fade indicators={showIndicators} controls={showControls}>
      {items.map((item, index) => (
        <Carousel.Item key={index}>
          {item.link ? (
            <Link to={item.link}>
              <Image
                src={item.src}
                alt={item.alt || item.title || ""}
                style={{ cursor: "pointer" }}
              />
            </Link>
          ) : (
            <Image src={item.src} alt={item.alt || item.title || ""} />
          )}

          {(item.title || item.startTime) && (
            <Carousel.Caption>
              {item.title && <h3>{item.title}</h3>}
            </Carousel.Caption>
          )}
        </Carousel.Item>
      ))}

    </Carousel>
  );
}
