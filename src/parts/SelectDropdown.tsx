import { useId, useState } from "react";
import type SelectDropdownProps from "../interfaces/SelectDropdown";
import { Dropdown, Form } from "react-bootstrap";

export default function SelectDropdown({
  label,
  title,
  value,
  changeHandler,
  options,
  className,
}: SelectDropdownProps) {
  const id = useId();
  const [show, setShow] = useState(false);

  const active = options.find(o => o.value === value) ?? null;
  const toggleText = active?.label ?? title;
  const groupName = `${id}-group`;

  function pick(v: string) {
    changeHandler(v);
    setShow(false);
  }

  return (
    <div className={className}>
      {label && <div className="mb-2">{label}</div>}
      <Dropdown show={show} onToggle={(next) => setShow(!!next)}>
        <Dropdown.Toggle
          id={`${id}-toggle`}
          className=" w-100 border-secondary bg-light border rounded-3 text-start px-3 py-2"
          as="button"
        >
          {toggleText}
        </Dropdown.Toggle>

        <Dropdown.Menu className="w-100" aria-labelledby={`${id}-toggle`}>
          <Form className="px-3 py-2 custom-checkbox">
            {options.map(option => (
              <Form.Check
                key={option.value}
                type="radio"
                id={`${id}-${option.value}`}
                name={groupName}
                label={option.label}
                checked={value === option.value}
                onChange={() => pick(option.value)}
                className="mb-1"
              />
            ))}
          </Form>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
