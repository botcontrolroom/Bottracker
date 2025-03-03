/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BotManagement from "@/components/dashboard/BotManagement";
import { BotDetails } from "@/types/dashboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { LogOut, Bot, House ,Search , Table } from "lucide-react";
import { Input } from "@/components/ui/input";

const MemberDashboard = () => {
  const [bots, setBots] = useState<BotDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserAndBots = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUsername(user.email.split('@')[0]);
        }

        const { data, error } = await supabase
          .from('bots')
          .select('*');

        if (error) {
          throw error;
        }

        if (data) {
          const formattedBots: BotDetails[] = data.map(bot => ({
            id: bot.id,
            name: bot.name,
            machineName: bot.machine_name,
            startTime: bot.start_time,
            endTime: bot.end_time,
            scheduledDays: bot.scheduled_days,
            platform: bot.platform
          }));
          setBots(formattedBots);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndBots();
  }, [toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

    // Filter bots based on search term
    const filteredBots = bots.filter(bot => {
      const searchLower = searchTerm.toLowerCase();
      return (
        bot.name.toLowerCase().includes(searchLower) ||
        bot.machineName.toLowerCase().includes(searchLower) ||
        (bot.platform && bot.platform.toLowerCase().includes(searchLower))
      );
    });
  
  
  return (
    <div className="min-h-screen bg-[#e5e7eb70]">
      <nav className="glass fixed top-0 w-full z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold flex items-center gap-2">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Bot className="h-6 w-6 md:hidden" />
              <span className="hidden md:inline">Bot Control Room</span>
            </h1>
            </Link>
            <div className="flex items-center gap-3">
            <Button
            onClick={() => navigate("/details")}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Table className="h-4 w-4" />
            <span className="hidden md:inline">Details</span>
            
          </Button>
            <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 transition-all duration-300"
              >
                <House className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Back to Timeline</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-700 transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 mt-16">
        <div className="py-4">
          <h2 className="text-2xl tracking-tight font-light text-slate-800">
            Welcome back, <span className="font-medium italic text-slate-900">{username || 'User'}</span>
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-slate-800 to-slate-400 mt-2 rounded-full"></div>
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

        {isLoading ? (
          <div className="bg-white rounded-lg p-8 text-center border border-slate-200">
            <div className="text-lg text-slate-600 justify-center"><img src="/6.svg"></img></div>
          </div>
        ) : (
           <BotManagement bots={filteredBots} setBots={setBots} />
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;
