import { Button, Form } from "react-bootstrap";

export default function InputPlaceBid() {
  return (
    <Form className="mt-4">
      <div className="position-relative mb-3">
        <Form.Control type="number" placeholder="Enter your bid" />

        <span
          className="position-absolute text-muted"
          style={{
            right: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            fontSize: "0.9rem",
            opacity: 0.6,
          }}
        >
          SEK
          {/* TODO : Change this to variable so it can be changed depending on currency? */}
        </span>
      </div>
      <Button type="submit" variant="primary" className="w-100">
        Place bid
      </Button>
    </Form>
  );
}
