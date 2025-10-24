
import type { Option } from "./SelectDropdown";

export default interface MultiSelectDropdownProps {
  label?: string;
  title: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  showApply?: boolean;
  className?: string;
}
