
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeSelectProps {
  value: {
    hour: string;
    minute: string;
    period: string;
  };
  onChange: (value: { hour: string; minute: string; period: string }) => void;
  label: string;
}

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const periods = ["AM", "PM"];

export const TimeSelect = ({ value, onChange, label }: TimeSelectProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <Select
          value={value.hour}
          onValueChange={(newHour) =>
            onChange({ ...value, hour: newHour })
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent>
            {hours.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={value.minute}
          onValueChange={(newMinute) =>
            onChange({ ...value, minute: newMinute })
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Minute" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={value.period}
          onValueChange={(newPeriod) =>
            onChange({ ...value, period: newPeriod })
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period} value={period}>
                {period}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
