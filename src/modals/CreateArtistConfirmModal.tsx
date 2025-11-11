import { Modal, Button } from "react-bootstrap";


export function CreateArtistConfirmModal({
  showCreateArtistConfirm,
  setShowCreateArtistConfirm,
  handleCreateArtist,
  createArtist,
}: {
  showCreateArtistConfirm: boolean;
  setShowCreateArtistConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  handleCreateArtist: () => Promise<void>;
  createArtist: boolean;
}) {
  return (
    <Modal show={showCreateArtistConfirm} onHide={() => setShowCreateArtistConfirm(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Are you sure?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Creating an artist profile is permanent. Are you sure you want to continue?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowCreateArtistConfirm(false)}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={async () => {
            setShowCreateArtistConfirm(false);
            await handleCreateArtist();
          }}
          disabled={createArtist}
        >
          Yes, create artist profile
        </Button>
      </Modal.Footer>
    </Modal>
  )
}