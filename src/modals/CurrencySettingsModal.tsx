import { Modal, Form, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
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
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency);

  useEffect(() => {
    if (show) {
      setSelectedCurrency(currency);
    }
  }, [show, currency]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurrency(e.target.value as Currency);
  };

  const handleSave = () => {
    setCurrency(selectedCurrency);
    onHide();
  };

  const handleClose = () => {
    setSelectedCurrency(currency);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Currency Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Select Currency</Form.Label>
          <Form.Select value={selectedCurrency} onChange={handleChange}>
            {currencies.map((curr) => (
              <option key={curr} value={curr}>
                {curr} - {currencyNames[curr]}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
