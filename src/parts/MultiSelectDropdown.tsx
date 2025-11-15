import { useId, useMemo, useState } from "react";
import { Dropdown, Form, Button, Badge } from "react-bootstrap";
import type MultiSelectDropdownProps from "../interfaces/MultiSelectDropdown";

export default function MultiSelectDropdown({
  title,
  values,
  options,
  onChange,
  className,
}: MultiSelectDropdownProps) {
  const id = useId();
  const [show, setShow] = useState(false);

  const picked = useMemo(() => new Set(values), [values]);
  const count = values.length;

  const toggle = (val: string) => {
    const next = picked.has(val)
      ? values.filter((v) => v !== val)
      : [...values, val];
    onChange(next);
  };

  const clear = () => onChange([]);

  const toggleText = (
    <>
      {title}
      {count > 0 && (
        <Badge bg="secondary" className="ms-2">
          {count}
        </Badge>
      )}
    </>
  );

  return (
    <div className={className}>
      <Dropdown
        show={show}
        onToggle={(next) => setShow(!!next)}
        autoClose="outside"
      >
        <Dropdown.Toggle
          id={`${id}-toggle`}
          className="w-100 border-secondary bg-light border rounded-3 text-start px-3 py-2"
          as="button"
        >
          {toggleText}
        </Dropdown.Toggle>

        <Dropdown.Menu
          className="w-100  my-filter-scope"
          aria-labelledby={`${id}-toggle`}
          style={{ minWidth: 260, maxHeight: "50vh", overflowY: "auto" }}
        >
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
          <Form className="px-3 py-2 custom-checkbox">
            <div className="d-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {options.map((opt) => (
                <Form.Check
                  key={opt.value}
                  type="checkbox"
                  id={`${id}-${opt.value}`}
                  label={opt.label}
                  checked={picked.has(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="mb-1"
                  onMouseDown={(e) => e.stopPropagation()}
                />
              ))}
            </div>
            <div className="d-flex gap-2 mt-2">
              <Button size="sm" variant="outline-secondary" onClick={clear}>
                Clear
              </Button>
            </div>
          </Form>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
