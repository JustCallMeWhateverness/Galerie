import { useId, useMemo, useState } from "react";
import { Dropdown, Form, Button, Badge } from "react-bootstrap";
import type MultiSelectDropdownProps from "../interfaces/MultiSelectDropdown";

export default function MultiSelectDropdown({
  label,
  values,
  options,
  onChange,
  showApply = false,
  className,
}: MultiSelectDropdownProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  const [temp, setTemp] = useState<string[]>(values);

  const active = showApply ? temp : values;
  const picked = useMemo(() => new Set(active), [active]);

  const toggle = (val: string) => {
    const base = showApply ? temp : values;
    const next = picked.has(val)
      ? base.filter(v => v !== val)
      : [...base, val];
    showApply ? setTemp(next) : onChange(next);
  };

  const clear = () => (showApply ? setTemp([]) : onChange([]));
  const apply = () => {
    onChange(temp);
    setShow(false);
  };

  const count = active.length;
  const toggleText = (
    <>
      {label}
      {count > 0 && <Badge bg="secondary" className="ms-2">{count}</Badge>}
    </>
  );

  return (
    <div className={className}>
      <Dropdown show={show} onToggle={(next) => { setShow(!!next); if (next) setTemp(values); }}>
        <Dropdown.Toggle
          id={`${id}-toggle`}
          className=" border-secondary bg-light border rounded-3 text-start px-3 py-2"
          as="button"
        >
          {toggleText}
        </Dropdown.Toggle>

        <Dropdown.Menu className="w-100  my-filter-scope" aria-labelledby={`${id}-toggle`} style={{ minWidth: 260 }}>
          <Form className="px-3 py-2 custom-checkbox">
            {options.map(opt => (
              <Form.Check
                key={opt.value}
                type="checkbox"
                id={`${id}-${opt.value}`}
                label={opt.label}
                checked={picked.has(opt.value)}
                onChange={() => toggle(opt.value)}
                className="mb-1"
              />
            ))}

            <div className="d-flex gap-2 mt-2">
              <Button size="sm" variant="outline-secondary" onClick={clear}>Clear</Button>

              <Button size="sm" variant="secondary" className="ms-auto" onClick={apply}>
                Apply
              </Button>

            </div>
          </Form>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
