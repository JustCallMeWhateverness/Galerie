import React, { useState } from "react";
import { Col, Dropdown, Row, Form } from "react-bootstrap";

FilterPage.route = {
  path: "/filter",
  menuLabel: "Filter",
};

type Option = {
  label: string;
  value: string;
};

const sortOptions: Option[] = [
  { value: "low", label: "Lowest current bid" },
  { value: "high", label: "Highest current bid" },
  { value: "newest", label: "Newest First" },
  { value: "time", label: "Time remaining" },
  { value: "distance", label: "Closest to me" },
];

export default function FilterPage() {
  const [selected, setSelected] = useState<string>("");

  function handleChange(value: string) {
    setSelected(value);
  }


};