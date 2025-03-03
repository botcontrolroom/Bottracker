
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hours12, minutes, periods, parseTime } from "@/utils/timeUtils";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
}

export const TimeInput = ({ value, onChange, className = "", label = "" }: TimeInputProps) => {
  const { hours, minutes: mins, period } = parseTime(value);

  const handleChange = (field: 'hours' | 'minutes' | 'period', newValue: string) => {
    const currentTime = parseTime(value);
    const updatedTime = {
      ...currentTime,
      [field]: field === 'minutes' ? newValue.padStart(2, '0') : newValue
    };
    const formattedTime = `${updatedTime.hours}:${updatedTime.minutes} ${updatedTime.period}`;
    onChange(formattedTime);
  };

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`}>
      {label && <span className="text-sm font-medium">{label}</span>}
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-[70px] justify-between"
            >
              {hours}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[70px] max-h-[200px] overflow-y-auto">
            <DropdownMenuGroup>
              {hours12.map((h) => (
                <DropdownMenuItem
                  key={h}
                  onClick={() => handleChange('hours', h)}
                >
                  {h}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="flex items-center">:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-[70px] justify-between"
            >
              {mins}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[70px] max-h-[200px] overflow-y-auto">
            <DropdownMenuGroup>
              {minutes.map((m) => (
                <DropdownMenuItem
                  key={m}
                  onClick={() => handleChange('minutes', m)}
                >
                  {m}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-[70px] justify-between"
            >
              {period}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[70px]">
            <DropdownMenuGroup>
              {periods.map((p) => (
                <DropdownMenuItem
                  key={p}
                  onClick={() => handleChange('period', p)}
                >
                  {p}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
