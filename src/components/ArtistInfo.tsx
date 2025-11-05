import { Form } from "react-bootstrap";
import { useState } from "react";
import EditArtistModal from "../modals/EditArtistModal";
import { useArtistInfo } from "../hooks/useArtistInfo";

//When press save - TODO create artist profile, add savebutton. when save - modal with artistinfo gets shown
export default function ArtistInfo() {
  const [show, setShow] = useState(true);
  const { data: artistInfo, loading } = useArtistInfo();

  if (loading) return <p>Loading artist info...</p>;
  return (
    <>
      <Form.Check
        type="checkbox"
        id="artist-toggle"
        label="I am an artist (create my Artist profile)"
      />
      <button onClick={() => setShow(true)}>Öppna modal</button>

      {artistInfo && (
        <EditArtistModal
          show={show}
          onHide={() => setShow(false)}
          editForm={artistInfo}
          onChange={() => {}}
        />
      )}

      <div className="mt-2">
        <small className="text-muted">
          Checking this will create an ArtistInfo linked to your account.
        </small>
      </div>
    </>
  );
}
