import { Modal, Form, Button } from 'react-bootstrap';
import { useCurrency } from '../context/CurrencyContext';
import { currencies, currencyNames } from '../utils/currencyRates';
import type { Currency } from '../utils/currencyRates';

interface CurrencySettingsModalProps {
  show: boolean;
  onHide: () => void;
}

export default function CurrencySettingsModal({
  show,
  onHide,
}: CurrencySettingsModalProps) {
  const { currency, setCurrency } = useCurrency();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value as Currency);
  };

  const handleSave = () => {
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Currency Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Select Currency</Form.Label>
          <Form.Select value={currency} onChange={handleChange}>
            {currencies.map((curr) => (
              <option key={curr} value={curr}>
                {curr} - {currencyNames[curr]}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

