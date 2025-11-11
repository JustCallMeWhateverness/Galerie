import { Carousel } from "react-bootstrap";
import Image from "./Image";
import { Link } from "react-router-dom";

export type CarouselItem = {
  id: string;
  title: string;
  src?: string;
  alt?: string;
  startTime?: Date;
  endTime?: Date;
  link?: string;
  imageUpload?: {
    paths: string[];
    mediaTexts?: string[];
  };
};

type Props = {
  items: CarouselItem[];
  showIndicators?: boolean;
  showControls?: boolean;
  height?: number;
};

export default function CarouselComponent({
  items,
  showIndicators = true,
  showControls = true,
  height = 360,
}: Props) {
  if (!items?.length) return null;

  return (
    <>
      <Carousel
        fade
        indicators={showIndicators}
        controls={showControls}
        prevIcon={<i className="bi bi-chevron-left text-secondary fs-2"></i>}
        nextIcon={<i className="bi bi-chevron-right text-secondary fs-2"></i>}
        style={{ position: 'relative' }}
      >
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 10,
            color: 'black',
            // fontSize: '24px',
            // fontWeight: 'bold',
            backgroundColor: 'rgba(255,255,255,0.75',
            padding: '5px 10px',
            borderRadius: '5px'
          }}
        >
          <h5>
            Upcoming Auctions
          </h5>
        </div>

        {items.map((item) => {
          const imagePath = item.imageUpload?.paths?.[0];

          let imageUrl: string;
          if (!imagePath) {
            imageUrl = "/images/placeholder.jpg";
          } else if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://") ||
            imagePath.startsWith("/media/")
          ) {
            imageUrl = imagePath;
          } else {
            imageUrl = `/media/${imagePath}`;
          }

          const alt = item.alt || item.imageUpload?.mediaTexts?.[0] || item.title || "";

          const Img = (
            <Image
              src={imageUrl}
              alt={alt}
              // loading="lazy"
              className="d-block w-100 carousel-img"
              style={{
                height,
                objectFit: "contain",
                objectPosition: "center",
                cursor: item.link ? "pointer" : "default",
              }}
            />
          );

          return (
            <Carousel.Item key={item.id}>
              {item.link ? <Link to={item.link}>{Img}</Link> : Img}
              {(item.title || item.startTime) && (
                <Carousel.Caption
                  style={{
                    textShadow: '4px 4px 6px rgba(0,0,0,0.8)'
                  }}
                >
                  {item.title && <h3>{item.title}</h3>}
                </Carousel.Caption>
              )}
            </Carousel.Item>
          );
        })}
      </Carousel>
    </>);
}
