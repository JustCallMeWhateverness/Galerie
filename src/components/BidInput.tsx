import { Button, Form, InputGroup } from "react-bootstrap";
import { useState } from "react";
import { useCurrency } from '../hooks/useCurrency';

export default function BidInput() {
  const [result, setResult] = useState("");
  const [value, setValue] = useState("");
  const { getCurrencySymbol, convertToSEK } = useCurrency();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountInSelectedCurrency = parseFloat(value);
    const amountInSEK = convertToSEK(amountInSelectedCurrency);
    setResult(`Form has been submitted with Input: ${value} ${getCurrencySymbol()} (${amountInSEK.toFixed(2)} SEK)`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    setResult("");
  }

  return (
    <Form className="mt-4" onSubmit={handleSubmit}>
      <div className="position-relative mb-3">
        {/* TODO: min value will depend on the current bid - maybe use step? */}

        <InputGroup>
          <Form.Control
            type="number"
            min="1"
            placeholder="Enter your bid"
            value={value}
            onChange={handleChange}
          />
          <InputGroup.Text>{getCurrencySymbol()}</InputGroup.Text>
        </InputGroup>

      </div>
      <Button type="submit" variant="primary" className="w-100">
        Place bid
      </Button>
      <h4>{result}</h4> {/*TODO: Remove when not needed for testing*/}
    </Form>
  );
}
