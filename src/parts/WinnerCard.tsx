import { Alert, Button, Card } from "react-bootstrap";

type Props = {
  hasBeenPaid: boolean,
  amount: number,
  buttonPress: () => void
}

export default function WinnerCard({ hasBeenPaid, amount, buttonPress }: Props) {
  return (
    <Card className="text-center pb-3 w-80">
      <Card.Body>
        <Card.Title className="mb-3 ">
          Congratulations!
        </Card.Title>
        <Card.Text className="mb-4">
          You won the auction with a bid of <b>{amount} SEK</b>
        </Card.Text>
        {hasBeenPaid ? (
          <Alert variant="success" className="d-flex align-items-center justify-content-center mb-0">
            Payment received!
          </Alert>
        ) : (
          <div className="d-flex justify-content-center">
            <Button
              variant="secondary"
              onClick={buttonPress}
              className="mb-2"
            >
              Pay {amount} SEK
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}