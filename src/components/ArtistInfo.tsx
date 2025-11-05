import { Form } from "react-bootstrap";
import { useState } from "react";
import EditArtistModal from "../modals/EditArtistModal";
import type InterfaceArtistInfo from "../interfaces/InterfaceArtistInfo";

//When press save - TODO create artist profile, add savebutton. when save - modal with artistinfo gets shown
export default function ArtistInfo() {
  const [show, setShow] = useState(true);
  const [editForm, setEditForm] = useState<InterfaceArtistInfo>({
    id: "",
    title: "",
    customer: "",
    description: "",
    workTitle: "",
  });

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <>
      <Form.Check
        type="checkbox"
        id="artist-toggle"
        label="I am an artist (create my Artist profile)"
      />
      <button onClick={() => setShow(true)}>Öppna modal</button>

      <EditArtistModal
        show={show} 
        onHide={() => setShow(false)}
        editForm={editForm} 
        onChange={handleEditChange} 
      />

      <div className="mt-2">
        <small className="text-muted">
          Checking this will create an ArtistInfo linked to your account.
        </small>
      </div>
    </>
  );
}
