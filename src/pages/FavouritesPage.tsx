import { Row, Col } from 'react-bootstrap';
import { useAuth } from "../hooks/useAuth";

FavouritesPage.route = {
  path: "/favourites",
  menuLabel: "Favourites",
  index: 4,
};

export default function FavouritesPage() {

  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <p className="text-danger"> You must be logged in to see your fa§ </p>;
  return <>
    <Row>
      <Col>
        <h2>Your Favourites</h2>
        <p>This is where your favourite items will be displayed.</p>
      </Col>
    </Row>
  </>;
}