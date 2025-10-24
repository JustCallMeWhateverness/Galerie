import { useState } from "react";
import SelectDropdown from "../parts/SelectDropdown";
import type { Option } from "../interfaces/SelectDropdown";
import MultiSelectDropdown from "../parts/MultiSelectDropdown";
import { Row, Col } from "react-bootstrap";

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

  return (
    <>
      <Row>
        <Col md={4} className="mt-4">
          <SelectDropdown
            title="Sort By"
            value={selected}
            changeHandler={setSelected}
            options={sortOptions}
          />
        </Col>

        <Col md={4} className="mt-4">
          <MultiSelectDropdown
            label="Categories"
            values={cats}
            onChange={setCats}
            options={categoryOptions} title={""}
          />
        </Col>
        <Col md={4} className="mt-4">

          <MultiSelectDropdown
            label="Colors"
            values={colors}
            onChange={setColors}
            options={colorOptions} title={""}
          />
        </Col>
      </Row>
    </>
  );

}
