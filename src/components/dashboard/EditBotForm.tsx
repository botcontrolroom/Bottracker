
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimeSelect } from "./TimeSelect";
import { DaySelector } from "./DaySelector";
import { Trash2 } from "lucide-react";
import { BotDetails } from "@/types/dashboard";
import { platforms } from "@/hooks/useBotOperations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditBotFormProps {
  selectedBot: BotDetails;
  onUpdate: (bot: BotDetails) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onDayToggle: (day: string) => void;
}

export const EditBotForm = ({
  selectedBot,
  onUpdate,
  onSave,
  onCancel,
  onDelete,
  onDayToggle,
}: EditBotFormProps) => {
  return (
    <div className="space-y-4 mb-6 p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Edit Details</h3>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onDelete}
        >
          <Trash2 size={16} />
          <span className="hidden md:inline">Delete Bot</span>
          
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Bot Name"
          value={selectedBot.name}
          onChange={(e) => onUpdate({ ...selectedBot, name: e.target.value })}
        />
        <Input
          placeholder="Machine Name"
          value={selectedBot.machineName}
          onChange={(e) => onUpdate({ ...selectedBot, machineName: e.target.value })}
        />
      </div>
      <Select
        value={selectedBot.platform}
        onValueChange={(value) => onUpdate({ ...selectedBot, platform: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Platform" />
        </SelectTrigger>
        <SelectContent>
          {platforms.map((platform) => (
            <SelectItem key={platform} value={platform}>
              {platform}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimeSelect
          label="Start Time"
          value={{
            hour: selectedBot.startTime.split(":")[0],
            minute: selectedBot.startTime.split(":")[1].split(" ")[0],
            period: selectedBot.startTime.split(" ")[1]
          }}
          onChange={(value) => onUpdate({
            ...selectedBot,
            startTime: `${value.hour}:${value.minute} ${value.period}`
          })}
        />
        <TimeSelect
          label="End Time"
          value={{
            hour: selectedBot.endTime.split(":")[0],
            minute: selectedBot.endTime.split(":")[1].split(" ")[0],
            period: selectedBot.endTime.split(" ")[1]
          }}
          onChange={(value) => onUpdate({
            ...selectedBot,
            endTime: `${value.hour}:${value.minute} ${value.period}`
          })}
        />
      </div>
      <DaySelector
        selectedDays={selectedBot.scheduledDays}
        onDayToggle={onDayToggle}
      />
      <div className="flex gap-2">
        <Button onClick={onSave}>Save Changes</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
