export type Option = { value: string; label: string; };

export default interface SelectDropdownProps {
  label?: string;
  title: string;
  value: string;
  changeHandler: (value: string) => void;
  options: Option[];
  className?: string;
}
