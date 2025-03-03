
import { BotDetails } from "@/types/dashboard";

interface BotCardProps {
  bot: BotDetails;
  onSelect: (bot: BotDetails) => void;
}

export const BotCard = ({ bot, onSelect }: BotCardProps) => {
  return (
    <div 
      className="p-6 rounded-xl border border-slate-200/60 bg-gradient-to-br from-white/80 to-slate-50/80 shadow-sm hover:shadow-md hover:border-slate-300/80 cursor-pointer transition-all duration-300" 
      onClick={() => onSelect(bot)}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium text-slate-800">{bot.name}</h4>
          <p className="text-sm text-slate-500 mt-1">{bot.machineName}</p>
          <p className="text-sm text-slate-500 mt-1">{bot.platform}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600">
            Time: {bot.startTime} - {bot.endTime}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {bot.scheduledDays.map((day) => (
              <span
                key={day}
                className="px-3 py-1 text-xs bg-slate-50 border border-slate-200/80 rounded-full text-slate-600"
              >
                {day}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
