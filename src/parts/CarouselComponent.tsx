import { Carousel } from "react-bootstrap";
import Image from "./Image";

export type CarouselItem = {
  src: string;
  id: number;
  alt?: string;
  title: string;
  startTime?: Date;
};

//TODO: Decide if indicators should be shown or if we create the dots ourselves as intended in the design
type Props = {
  items: CarouselItem[];
  showIndicators?: boolean;
  showControls?: boolean;
};

export default function CarouselComponent({
  items,
  showIndicators = true,
  showControls = true,
}: Props) {
  return (
    <Carousel fade indicators={showIndicators} controls={showControls}>
      {items.map((item, index) => (
        <Carousel.Item key={index}>
          <Image src={item.src} alt={item.alt || item.title || ""} />
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
