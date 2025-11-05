import { Form } from "react-bootstrap";


export function ArtistInfo() {
  return (
    <>
      <Form.Check
        type="checkbox"
        id="artist-toggle"
        label="I am an artist (create my Artist profile)"
      
      />
      <div className="mt-2">
        <small className="text-muted">
          Checking this will create an ArtistInfo linked to your account.
        </small>
      </div>
    </>
  );
}
