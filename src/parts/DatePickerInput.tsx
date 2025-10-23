import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
interface DatePickerInputProps {
  value?: Date | null;
  minimumDate?: Date;
  onChange: (date: Date | null) => void;
  placeholder?: string | Date;
}

export default function DatePickerInput({
  value,
  onChange,
  minimumDate,
  placeholder = "Select date and time" }: DatePickerInputProps) {

  if (placeholder instanceof Date) {
    placeholder = placeholder.toLocaleString('sv-SE')
  }

  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      dateFormat="yyyy-MM-dd HH:mm"
      timeFormat="HH:mm"
      placeholderText={placeholder}
      className="form-control"
      showTimeSelect
      timeIntervals={60}
      minDate={minimumDate}
      wrapperClassName="d-block"
      withPortal
    />
  );
};
