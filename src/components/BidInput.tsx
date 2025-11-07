import { Button, Form, InputGroup } from "react-bootstrap";
import { useState } from "react";
import { useCurrency } from '../hooks/useCurrency';

interface Props {
  miniBid: number
}


export default function BidInput({ miniBid }: Props) {
  const [result, setResult] = useState("");
  const [value, setValue] = useState("");
  const { getCurrencySymbol, convertToSEK } = useCurrency();
  const step = 25

  const [validated, setValidated] = useState(false)


  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const numValue = parseFloat(value)


    const amountInSelectedCurrency = parseFloat(value);
    const amountInSEK = convertToSEK(amountInSelectedCurrency);
    setResult(`Form has been submitted with Input: ${value} ${getCurrencySymbol()} (${amountInSEK.toFixed(2)} SEK)`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  };

  return (
    <Form className="mt-4" onSubmit={handleSubmit}>
      <div className="position-relative mb-3">
        {/* TODO: min value will depend on the current bid - maybe use step? */}

        <InputGroup>
          <Form.Control
            type="number"
            min={miniBid}
            // step={step}
            placeholder={`Enter your bid, minimum ${miniBid}`}
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

      <h4>{result}</h4> {/*TODO: Remove when not needed for testing*/}
    </Form>
  );
}
