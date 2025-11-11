import { useId, useState } from "react";
import { Dropdown, Form, Button } from "react-bootstrap";

type RangeDropdownProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

export default function RangeDropdown({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}: RangeDropdownProps) {
  const id = useId();
  const [show, setShow] = useState(false);

  const toggleText =
    value === null
      ? label
      : value === 0
        ? `${label}: 0 km`
        : `${label}: ${value} km`;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const clear = () => onChange(null);

  return (
    <div className={className}>
      <Dropdown show={show} onToggle={(next) => setShow(!!next)}>
        <Dropdown.Toggle
          id={`${id}-toggle`}
          className="border-secondary bg-light border rounded-3 text-start px-3 py-2 w-100"
          as="button"
        >
          {toggleText}
        </Dropdown.Toggle>

        <Dropdown.Menu className="w-100 p-3" aria-labelledby={`${id}-toggle`}>
          <Button
            variant="link"
            size="sm"
            style={{
              position: "absolute",
              top: 4,
              right: 8,
              zIndex: 2,
              color: "#888",
              textDecoration: "none"
            }}
            aria-label="Close"
            onClick={() => setShow(false)}
            tabIndex={0}
          >
            &#10005;
          </Button>
          <Form.Group>
            <Form.Label className="fw-semibold">{label}</Form.Label>
            <Form.Range
              id={`${id}-range`}
              min={min}
              max={max}
              step={step}
              value={value ?? 0}
              onChange={handleSliderChange}
            />
            <div className="d-flex justify-content-between small text-muted">
              <span>{min} km</span>
              <span>{max} km</span>
            </div>
          </Form.Group>

          <div className="d-flex justify-content-end mt-3">
            <Button size="sm" variant="outline-secondary" onClick={clear}>
              Clear
            </Button>
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
