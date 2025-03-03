/* eslint-disable prefer-const */

import { useEffect, useState } from "react";
import { Bot, Clock, Monitor, Calendar, ChevronRight ,Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

interface TimelineBot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  status: "active" | "inactive";
  machine_name?: string;
  scheduled_days?: string[];
  platform?: string;
}

const Timeline = () => {
  const [bots, setBots] = useState<TimelineBot[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [expandedBot, setExpandedBot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const { data, error } = await supabase
          .from('bots')
          .select('*');

        if (error) {
          throw error;
        }

        if (data) {
          setBots(data.map(bot => ({
            ...bot,
            status: "active" // We'll update this based on isActive calculation
          })));
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching bots:', error);
        toast({
          title: "Error",
          description: "Failed to load bots. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchBots();

    const channel = supabase
      .channel('public:bots')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'bots'
        }, 
        async (payload) => {
          console.log('Change received!', payload);
          const { data, error } = await supabase
            .from('bots')
            .select('*');
          
          if (error) {
            console.error('Error refreshing bots:', error);
            return;
          }

          if (data) {
            setBots(data.map(bot => ({
              ...bot,
              status: "active"
            })));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const convertTo24Hour = (time: string) => {
    const [timeStr, period] = time.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  };

  const isActive = (bot: TimelineBot) => {
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const startTimeMinutes = convertTo24Hour(bot.start_time);
    const endTimeMinutes = convertTo24Hour(bot.end_time);
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];
    
    // If end time is less than start time, it means the schedule crosses midnight
    if (endTimeMinutes < startTimeMinutes) {
      // Check if current time is either after start time OR before end time
      return bot.scheduled_days?.includes(currentDay) && 
             (currentMinutes >= startTimeMinutes || currentMinutes <= endTimeMinutes);
    }
    
    // Normal time range check
    return bot.scheduled_days?.includes(currentDay) && 
           currentMinutes >= startTimeMinutes && 
           currentMinutes <= endTimeMinutes;
  };

  const filteredBots = bots.filter(bot => {
    const searchLower = searchTerm.toLowerCase();
    return (
      bot.name.toLowerCase().includes(searchLower) ||
      (bot.machine_name && bot.machine_name.toLowerCase().includes(searchLower)) ||
      (bot.platform && bot.platform.toLowerCase().includes(searchLower))
    );
  });

  const sortedBots = [...filteredBots].sort((a, b) => {
    const aActive = isActive(a);
    const bActive = isActive(b);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return 0;
  });

  const finalBots = showOnlyActive
    ? sortedBots.filter(bot => isActive(bot))
    : sortedBots;

  if (isLoading) {
    return (
      <div className="timeline-container mt-8 flex justify-center items-center min-h-[200px]">
        <div className="text-muted-foreground"><img src="/6.svg"></img></div>
      </div>
    );
  }

  return (
    <div className="timeline-container mt-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4">
        <div className="text-sm font-medium text-muted-foreground">
          Current Time: {currentTime.toLocaleTimeString()}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Switch
              id="active-filter"
              checked={showOnlyActive}
              onCheckedChange={setShowOnlyActive}
            />
            <Label htmlFor="active-filter">Show only active bots</Label>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              Active
            </span>
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              Inactive
            </span>
          </div>
        </div>
      </div>
      <div className="mb-4 relative">
        <Input
          type="text"
          placeholder="Search bots by name, machine or platform..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      </div>
      <div className="timeline-grid bg-white rounded-lg p-2 sm:p-4 border border-slate-200">
        <div className="timeline-content">
        {finalBots.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
               {searchTerm ? "No bots found matching your search." : "No bots found. Add some bots to get started."}
            </div>
          ) : (
            finalBots.map((bot) => (
              <div
                key={bot.id}
                className={`bot-row p-3 sm:p-4 border-b border-gray-100 transition-colors ${
                  isActive(bot) ? "bg-green-50" : "bg-white"
                }`}
              >
                <div 
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setExpandedBot(expandedBot === bot.id ? null : bot.id)}
                >
                  <Bot className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{bot.name}</h3>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isActive(bot)
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {isActive(bot) ? "Active" : "Inactive"}
                      </div>
                    </div>
                    
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Monitor className="h-3.5 w-3.5" />
                        <span className="text-xs">{bot.machine_name}</span>
                      </div>
                      {bot.platform && (
                        <div className="text-xs text-muted-foreground">
                          Platform: {bot.platform}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs">
                            {bot.start_time} - {bot.end_time}
                          </span>
                        </div>
                        
                        <div className="hidden sm:flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs">
                            {bot.scheduled_days?.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {expandedBot === bot.id && (
                      <div className="sm:hidden mt-3 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Schedule:</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {bot.scheduled_days?.map(day => (
                            <span 
                              key={day}
                              className="px-2 py-0.5 bg-gray-100 rounded-full text-xs"
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <ChevronRight 
                    className={`h-4 w-4 text-gray-400 sm:hidden transition-transform ${
                      expandedBot === bot.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
