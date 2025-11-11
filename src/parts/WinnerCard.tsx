import { Alert, Button, Card } from "react-bootstrap";

type Props = {
  hasBeenPaid: boolean,
  amount: number,
  buttonPress: () => void

}


export default function WinnerCard({ hasBeenPaid, amount, buttonPress }: Props) {
  return <Card>
    <Card.Title>
      Congratulations!
    </Card.Title>
    <Card.Text>You won the auction with the bid of {amount} SEK</Card.Text>
    {hasBeenPaid ?
      <Alert variant="info">You have paid in full!</Alert> :
      <Button onClick={buttonPress}>Pay {amount}</Button>}


  </Card>
}