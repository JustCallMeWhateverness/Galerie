import { useState } from "react";
import SelectDropdown from "../parts/SelectDropdown";
import type { Option } from "../interfaces/SelectDropdown";
import MultiSelectDropdown from "../parts/MultiSelectDropdown";
import RangeDropdown from "../parts/RangeDropdown";
import { Row, Col, Button } from "react-bootstrap";

FilterPage.route = {
  path: "/filter",
  menuLabel: "Filter",
  index: 4,
};

const sortOptions: Option[] = [
  { value: "low", label: "Lowest current bid" },
  { value: "high", label: "Highest current bid" },
  { value: "newest", label: "Newest First" },
  { value: "time", label: "Time remaining" },
  { value: "distance", label: "Closest to me" },
];

const categoryOptions: Option[] = [
  { value: "art", label: "Art" },
  { value: "ceramic", label: "Ceramic" },
  { value: "wood", label: "Wood" },
  { value: "silver/gold", label: "Silver/Gold" },
  { value: "furniture", label: "Furniture" },
  { value: "textile", label: "Textile" },
];

const colorOptions: Option[] = [
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "gray", label: "Gray" },
  { value: "beige", label: "Beige" },
  { value: "brown", label: "Brown" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "orange", label: "Orange" },
  { value: "yellow", label: "Yellow" },
  { value: "pink", label: "Pink" },
  { value: "purple", label: "Purple" },
];

export default function FilterPage() {
  const [selected, setSelected] = useState<string>("");
  const [cats, setCats] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const clear = () => {
    setSelected("");
    setCats([]);
    setColors([]);
    setDistance(null);
  };

  return (
    <>
      <Row >
        <Col xs={12} md={4} lg={3} xl={3} xxl={3} className="mt-4">
          <SelectDropdown
            title="Sort By"
            value={selected}
            changeHandler={setSelected}
            options={sortOptions}
            className="mb-4"
          />

          <MultiSelectDropdown
            title="Categories"
            values={cats}
            onChange={setCats}
            options={categoryOptions}
            className="mb-4"
          />


          <MultiSelectDropdown
            title="Colors"
            values={colors}
            onChange={setColors}
            options={colorOptions}
            className="mb-4"
          />

          <RangeDropdown
            label="Distance"
            value={distance}
            onChange={setDistance}
            min={0}
            max={100}
            step={1}
            className="mb-4"
          />
          <Button variant="primary" className="w-100 mb-4">Apply</Button>
          <Button variant="secondary" onClick={clear} className="w-100 mb-4">Clear All</Button>
        </Col>
      </Row>
    </>
  );

}
