import { Button, Form } from "react-bootstrap";
import { useState } from "react";
import { useCurrency } from '../hooks/useCurrency';

export default function InputPlaceBid() {
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
        <Form.Control
          type="number"
          min="1"
          placeholder="Enter your bid"
          value={value}
          onChange={handleChange}
        />

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
          {getCurrencySymbol()}
        </span>
      </div>
      <Button type="submit" variant="primary" className="w-100">
        Place bid
      </Button>
      <h4>{result}</h4> {/*TODO: Remove when not needed for testing*/}
    </Form>
  );
}
