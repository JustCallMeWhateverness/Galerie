import { Row, Col } from 'react-bootstrap';

interface SelectProps {
  label: string;
  value: string;
  changeHandler: Function;
  options: string[];
}

export default function Select(
  { label, value, changeHandler, options }: SelectProps
) {
  return <label className="w-100">
    <Row>
      <Col xs={3} md={12}>
        <div className="mb-md-2 mt-2 mt-md-0">{label}:</div>
      </Col>
      <Col xs={9} md={12}>
        <select
          role="button"
          className="form-select bg-light mb-4 d-inline w-100"
          value={value}
          onChange={e => changeHandler(e.target.value)}
        >
          {options.map((x, i) => <option key={i}>{x}</option>)}
        </select>
      </Col>
    </Row>
  </label>;
}