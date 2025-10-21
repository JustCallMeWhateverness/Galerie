import { Carousel } from "react-bootstrap";
import Image from "./Image";

export type CarouselItem = {
  src: string;
  label?: string;
  caption?: string;
  alt?: string;
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
          <Image src={item.src} alt={item.alt || item.label || ""} />
          {(item.label || item.caption) && (
            <Carousel.Caption>
              {item.label && <h3>{item.label}</h3>}
              {item.caption && <p>{item.caption}</p>}
            </Carousel.Caption>
          )}
        </Carousel.Item>
      ))}
    </Carousel>
  );
}
