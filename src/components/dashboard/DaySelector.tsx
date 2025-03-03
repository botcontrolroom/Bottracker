
import { Button } from "@/components/ui/button";

interface DaySelectorProps {
  selectedDays: string[];
  onDayToggle: (day: string) => void;
}

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const DaySelector = ({ selectedDays, onDayToggle }: DaySelectorProps) => {
  return (
    <div>
      <label className="text-sm font-medium">Scheduled Days</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {weekDays.map((day) => (
          <Button
            key={day}
            type="button"
            variant={selectedDays.includes(day) ? "default" : "outline"}
            onClick={() => onDayToggle(day)}
          >
            {day}
          </Button>
        ))}
      </div>
    </div>
  );
};
