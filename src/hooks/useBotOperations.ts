
import { useState } from "react";
import { BotDetails } from "@/types/dashboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const platforms = [
  "Automation Anywhere",
  "Blue Prism",
  "Power Automate Desktop",
  "UiPath",
  "Power Automate Cloud"
];

export interface NewBotData {
  name: string;
  machineName: string;
  platform: string;
  startTime: {
    hour: string;
    minute: string;
    period: string;
  };
  endTime: {
    hour: string;
    minute: string;
    period: string;
  };
  scheduledDays: string[];
}

export const useBotOperations = (bots: BotDetails[], setBots: (bots: BotDetails[]) => void) => {
  const { toast } = useToast();
  const [isAddingBot, setIsAddingBot] = useState(false);
  const [selectedBot, setSelectedBot] = useState<BotDetails | null>(null);
  const [newBot, setNewBot] = useState<NewBotData>({
    name: "",
    machineName: "",
    platform: platforms[0],
    startTime: {
      hour: "12",
      minute: "00",
      period: "AM"
    },
    endTime: {
      hour: "12",
      minute: "00",
      period: "AM"
    },
    scheduledDays: [],
  });

  const formatTimeFromObject = (timeObj: { hour: string; minute: string; period: string }) => {
    return `${timeObj.hour}:${timeObj.minute} ${timeObj.period}`;
  };

  const handleAddBot = async () => {
    try {
      const startTime = formatTimeFromObject(newBot.startTime);
      const endTime = formatTimeFromObject(newBot.endTime);

      const { data, error } = await supabase
        .from('bots')
        .insert([{
          name: newBot.name,
          machine_name: newBot.machineName,
          platform: newBot.platform,
          start_time: startTime,
          end_time: endTime,
          scheduled_days: newBot.scheduledDays,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setBots([...bots, {
          id: data.id,
          name: data.name,
          machineName: data.machine_name,
          platform: data.platform,
          startTime: data.start_time,
          endTime: data.end_time,
          scheduledDays: data.scheduled_days,
        }]);

        setNewBot({
          name: "",
          machineName: "",
          platform: platforms[0],
          startTime: { hour: "12", minute: "00", period: "AM" },
          endTime: { hour: "12", minute: "00", period: "AM" },
          scheduledDays: []
        });
        setIsAddingBot(false);

        toast({
          title: "Bot Created",
          description: `Successfully created bot "${data.name}"`,
          className: "bg-green-50 border-green-200 text-green-800",
        });
      }
    } catch (error) {
      console.error('Error creating bot:', error);
      toast({
        title: "Error",
        description: "Failed to create bot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddBotsBatch = async (newBots: NewBotData[]) => {
    try {
      if (newBots.length === 0) return;

      // Format the bots data for Supabase
      const botsToInsert = newBots.map(bot => ({
        name: bot.name,
        machine_name: bot.machineName,
        platform: bot.platform,
        start_time: formatTimeFromObject(bot.startTime),
        end_time: formatTimeFromObject(bot.endTime),
        scheduled_days: bot.scheduledDays,
      }));

      const { data, error } = await supabase
        .from('bots')
        .insert(botsToInsert)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Format the response data to match our BotDetails interface
        const newBotsFormatted: BotDetails[] = data.map(bot => ({
          id: bot.id,
          name: bot.name,
          machineName: bot.machine_name,
          platform: bot.platform,
          startTime: bot.start_time,
          endTime: bot.end_time,
          scheduledDays: bot.scheduled_days,
        }));

        // Update the state with the new bots
        setBots([...bots, ...newBotsFormatted]);

        toast({
          title: "Bots Imported",
          description: `Successfully imported ${data.length} bots`,
          className: "bg-green-50 border-green-200 text-green-800",
        });
      }
    } catch (error) {
      console.error('Error importing bots:', error);
      toast({
        title: "Import Error",
        description: "Failed to import bots. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBot = async () => {
    if (selectedBot) {
      try {
        const { error } = await supabase
          .from('bots')
          .update({
            name: selectedBot.name,
            machine_name: selectedBot.machineName,
            platform: selectedBot.platform,
            start_time: selectedBot.startTime,
            end_time: selectedBot.endTime,
            scheduled_days: selectedBot.scheduledDays,
          })
          .eq('id', selectedBot.id);

        if (error) throw error;

        setBots(bots.map(bot => bot.id === selectedBot.id ? selectedBot : bot));
        toast({
          title: "Bot Updated",
          description: `Successfully updated bot "${selectedBot.name}"`,
        });
        setSelectedBot(null);
      } catch (error) {
        console.error('Error updating bot:', error);
        toast({
          title: "Error",
          description: "Failed to update bot. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteBot = async () => {
    if (selectedBot) {
      try {
        const { error } = await supabase
          .from('bots')
          .delete()
          .eq('id', selectedBot.id);

        if (error) throw error;

        setBots(bots.filter(bot => bot.id !== selectedBot.id));
        toast({
          title: "Bot Deleted",
          description: `Successfully deleted bot "${selectedBot.name}"`,
          variant: "destructive",
        });
        setSelectedBot(null);
      } catch (error) {
        console.error('Error deleting bot:', error);
        toast({
          title: "Error",
          description: "Failed to delete bot. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return {
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
  };
};
