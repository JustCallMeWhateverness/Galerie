import { Button, Form, InputGroup } from "react-bootstrap";
import { useState } from "react";
import { useCurrency } from '../hooks/useCurrency';
import { useAuth } from "../hooks/useAuth";

interface Props {
  miniBid: number,
  auctionId: string,
  onBidSuccess?: () => void,
  addStep: boolean
}

export default function BidInput({ miniBid, auctionId, onBidSuccess, addStep }: Props) {
  const [value, setValue] = useState("");
  const { getCurrencySymbol, convertToSEK } = useCurrency();
  const { user } = useAuth()
  const STEP = 25

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountInSelectedCurrency = parseFloat(value);
    const amountInSEK = convertToSEK(amountInSelectedCurrency);

    sendBid(auctionId, amountInSEK)

  }


  async function sendBid(auctionId: string, amount: number) {
    if (!user?.id || !user?.username) {
      alert("You must be logged in to place a bid.");
      return;
    }

    const body = {
      items: {
        $push: [
          {
            customerId: user?.id,
            amount: amount,
            contentType: "Bid",
            timeStamp: Date.now()
          }
        ]
      }
    };

    try {
      const response = await fetch(`/api/Auction/${auctionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (onBidSuccess) { onBidSuccess() }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending bid:', error);
      throw error;
    }
  }
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  };

  // if the miminum bid is the starting bid you can bid the actual starting price
  // else you need to add 25 sek
  const minimumBid = addStep ? miniBid + STEP : miniBid

  return (
    <Form className="mt-4" onSubmit={handleSubmit}>
      <div className="position-relative mb-3">
        {/* TODO: min value will depend on the current bid - maybe use step? */}

        <InputGroup>
          <Form.Control
            type="number"
            min={minimumBid}
            placeholder={`Enter your bid, minimum ${minimumBid}`}
            value={value}
            onChange={handleChange}
            required
            autoComplete="off"
          />
          <Form.Control.Feedback type="invalid">The bid must be higher than {miniBid}
          </Form.Control.Feedback>
          <InputGroup.Text>{getCurrencySymbol()}</InputGroup.Text>
        </InputGroup>

      </div>
      <Button type="submit" variant="primary" className="w-100">
        Place bid
      </Button>

      {/* <h4>{result}</h4> TODO: Remove when not needed for testing */}
    </Form>
  );
}
