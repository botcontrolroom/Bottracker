
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimeSelect } from "./TimeSelect";
import { DaySelector } from "./DaySelector";
import { NewBotData, platforms } from "@/hooks/useBotOperations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddBotFormProps {
  newBot: NewBotData;
  setNewBot: (bot: NewBotData) => void;
  onSave: () => void;
  onCancel: () => void;
  onDayToggle: (day: string) => void;
}

export const AddBotForm = ({
  newBot,
  setNewBot,
  onSave,
  onCancel,
  onDayToggle,
}: AddBotFormProps) => {
  return (
    <div className="space-y-4 mb-6 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Add New Bot</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Bot Name"
          value={newBot.name}
          onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
        />
        <Input
          placeholder="Machine Name"
          value={newBot.machineName}
          onChange={(e) =>
            setNewBot({ ...newBot, machineName: e.target.value })
          }
        />
      </div>
      <Select
        value={newBot.platform}
        onValueChange={(value) => setNewBot({ ...newBot, platform: value })}
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
          value={newBot.startTime}
          onChange={(value) => setNewBot({ ...newBot, startTime: value })}
        />
        <TimeSelect
          label="End Time"
          value={newBot.endTime}
          onChange={(value) => setNewBot({ ...newBot, endTime: value })}
        />
      </div>
      <DaySelector
        selectedDays={newBot.scheduledDays}
        onDayToggle={onDayToggle}
      />
      <div className="flex gap-2">
        <Button onClick={onSave}>Save Bot</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
