import type { Option } from "./SelectDropdown";

export default interface MultiSelectDropdownProps {
  title: string;
  values: string[];
  onChange: (next: string[]) => void;
  options: Option[];
  className?: string;
};

