import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
interface DatePickerInputProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

export default function DatePickerInput({
  value,
  onChange,
  placeholder = "Select date and time" }: DatePickerInputProps) {
  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      dateFormat="yyyy-MM-dd HH:mm"
      timeFormat="HH:mm"
      placeholderText={placeholder}
      className="border rounded px-3 py-2 w-full"
      showTimeSelect
      timeIntervals={60}
      minDate={new Date()}
    />
  );
};
