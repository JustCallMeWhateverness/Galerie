import { useState } from "react";
import SelectDropdown from "../parts/SelectDropdown";
import type { Option } from "../interfaces/SelectDropdown";
import MultiSelectDropdown from "../parts/MultiSelectDropdown";
import RangeDropdown from "../parts/RangeDropdown";
import { Button, Modal } from "react-bootstrap";
import BackButton from "../components/BackButton";

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

interface FilterModalProps {
  show: boolean;
  onHide: () => void;
  onApply: (params: URLSearchParams) => void;
}

export default function FilterModal({ show, onHide, onApply }: FilterModalProps) {
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
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Filter Auctions</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
        <Button variant="primary" className="w-100 mb-3" >Apply</Button>
        <Button variant="secondary" onClick={clear} className="w-100">Clear All</Button>
      </Modal.Body>
    </Modal>
  );
}