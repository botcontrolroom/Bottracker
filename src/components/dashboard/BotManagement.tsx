import { Button } from "@/components/ui/button";
import { Plus, X, FileSpreadsheet } from "lucide-react";
import { BotDetails } from "@/types/dashboard";
import { BotCard } from "./BotCard";
import { AddBotForm } from "./AddBotForm";
import { EditBotForm } from "./EditBotForm";
import { ImportBotsModal } from "./ImportBotsModal";
import { useBotOperations } from "@/hooks/useBotOperations";
import { useState } from "react";

interface BotManagementProps {
  bots: BotDetails[];
  setBots: (bots: BotDetails[]) => void;
}

const BotManagement = ({ bots, setBots }: BotManagementProps) => {
  const [isImportingBots, setIsImportingBots] = useState(false);

  const {
    isAddingBot,
    setIsAddingBot,
    selectedBot,
    setSelectedBot,
    newBot,
    setNewBot,
    handleAddBot,
    handleUpdateBot,
    handleDeleteBot,
    handleAddBotsBatch,
  } = useBotOperations(bots, setBots);

  const handleDayToggle = (day: string) => {
    if (selectedBot) {
      const updatedDays = selectedBot.scheduledDays.includes(day)
        ? selectedBot.scheduledDays.filter((d) => d !== day)
        : [...selectedBot.scheduledDays, day];
      setSelectedBot({ ...selectedBot, scheduledDays: updatedDays });
    } else {
      setNewBot((prev) => {
        const updatedDays = prev.scheduledDays.includes(day)
          ? prev.scheduledDays.filter((d) => d !== day)
          : [...prev.scheduledDays, day];
        return { ...prev, scheduledDays: updatedDays };
      });
    }
  };

  return (
    <div className="bg-white/70 rounded-xl border border-slate-200/60 shadow-sm p-6 mb-8 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Bot Management</h2>
        <div className="flex gap-2">
          {isAddingBot || isImportingBots ? (
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingBot(false);
                setIsImportingBots(false);
              }}
              className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 transition-all duration-300"
            >
              <X className="mr-2" />
              Cancel
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setIsImportingBots(true)}
                className="bg-slate-800 hover:bg-slate-900 text-white transition-all duration-300"
              >
                <FileSpreadsheet />
                <span className="hidden md:inline">Import</span>
              </Button>
              <Button
                onClick={() => setIsAddingBot(true)}
                className="bg-slate-800 hover:bg-slate-900 text-white transition-all duration-300"
              >
                <Plus />
                <span className="hidden md:inline">Add New Bot</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {isAddingBot && (
        <div className="bg-slate-50/70 rounded-lg border border-slate-200/60 p-6 mb-6">
          <AddBotForm
            newBot={newBot}
            setNewBot={setNewBot}
            onSave={handleAddBot}
            onCancel={() => setIsAddingBot(false)}
            onDayToggle={handleDayToggle}
          />
        </div>
      )}

      {isImportingBots && (
        <ImportBotsModal
          onImport={(newBots) => {
            handleAddBotsBatch(newBots);
            setIsImportingBots(false);
          }}
          onCancel={() => setIsImportingBots(false)}
        />
      )}

      <div className="space-y-4">
        {bots.map((bot) => (
          <div key={bot.id} className="transition-all duration-300">
            {selectedBot?.id === bot.id ? (
              <div className="bg-slate-50/70 rounded-lg border border-slate-200/60 p-6">
                <EditBotForm
                  selectedBot={selectedBot}
                  onUpdate={setSelectedBot}
                  onSave={handleUpdateBot}
                  onCancel={() => setSelectedBot(null)}
                  onDelete={handleDeleteBot}
                  onDayToggle={handleDayToggle}
                />
              </div>
            ) : (
              <BotCard bot={bot} onSelect={() => setSelectedBot(bot)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BotManagement;
