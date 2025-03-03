/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { BotDetails } from "@/types/dashboard";
import { supabase } from "@/integrations/supabase/client";
import { Download, Search, FilterX , House , LogIn, Bot , LayoutDashboard, LogOut} from "lucide-react";
import NavBar from "@/components/NavBar";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";


const Details = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bots, setBots] = useState<BotDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    name: string;
    machineName: string;
    platform: string;
    days: string;
  }>({
    name: "",
    machineName: "",
    platform: "",
    days: "",
  });
  


  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const { data, error } = await supabase.from("bots").select("*");

        if (error) {
          throw error;
        }

        if (data) {
          const formattedBots: BotDetails[] = data.map((bot) => ({
            id: bot.id,
            name: bot.name,
            machineName: bot.machine_name,
            startTime: bot.start_time,
            endTime: bot.end_time,
            scheduledDays: bot.scheduled_days,
            platform: bot.platform,
          }));
          setBots(formattedBots);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch bot data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBots();
  }, [toast]);

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value.trim(),
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      name: "",
      machineName: "",
      platform: "",
      days: "",
    });
    setSearchTerm("");
  };

  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Transform the data for Excel
      const excelData = filteredBots.map((bot) => ({
        "Bot Name": bot.name,
        "Machine Name": bot.machineName,
        "Platform": bot.platform,
        "Start Time": bot.startTime,
        "End Time": bot.endTime,
        "Days": bot.scheduledDays.join(", "),
        "Status": isActiveNow(bot.startTime, bot.endTime, bot.scheduledDays) ? "Active" : "Inactive"
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bot Details");
      XLSX.writeFile(workbook, "bot_details.xlsx");
      
      toast({
        title: "Export Successful",
        description: "Bot details exported to Excel",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export bot details",
        variant: "destructive",
      });
    }
  };

  // Determine if bot is currently active
  const isActiveNow = (startTime: string, endTime: string, days: string[]) => {
    const now = new Date();
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    
    // Check if today is in scheduled days
    if (!days.includes(currentDay)) return false;
    
    // Parse times
    const [startHour, startMinute, startPeriod] = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || [];
    const [endHour, endMinute, endPeriod] = endTime.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || [];
    
    if (!startHour || !endHour) return false;
    
    // Convert to 24-hour format
    let start = parseInt(startHour);
    if (startPeriod === "PM" && start < 12) start += 12;
    if (startPeriod === "AM" && start === 12) start = 0;
    
    let end = parseInt(endHour);
    if (endPeriod === "PM" && end < 12) end += 12;
    if (endPeriod === "AM" && end === 12) end = 0;
    
    // Current hour
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Compare times
    if (start < end) {
      // Simple case: start time is before end time
      return (currentHour > start || (currentHour === start && currentMinute >= parseInt(startMinute))) && 
             (currentHour < end || (currentHour === end && currentMinute <= parseInt(endMinute)));
    } else {
      // Overnight case: start time is after end time
      return (currentHour > start || (currentHour === start && currentMinute >= parseInt(startMinute))) || 
             (currentHour < end || (currentHour === end && currentMinute <= parseInt(endMinute)));
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter bots based on search and column filters
  const filteredBots = bots.filter((bot) => {
    // Global search
    if (
      searchTerm &&
      !bot.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !bot.machineName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !bot.platform?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !bot.scheduledDays.some(day => day.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }

    // Column filters
    if (
      filters.name &&
      !bot.name.toLowerCase().includes(filters.name.toLowerCase())
    )
      return false;
    if (
      filters.machineName &&
      !bot.machineName.toLowerCase().includes(filters.machineName.toLowerCase())
    )
      return false;
    if (
      filters.platform &&
      !bot.platform?.toLowerCase().includes(filters.platform.toLowerCase())
    )
      return false;
    if (
      filters.days &&
      !bot.scheduledDays.some(day =>
        day.toLowerCase().includes(filters.days.toLowerCase())
      )
    )
      return false;

    return true;
  });



  return (
    <div className="min-h-screen bg-[#f5f6f7]/80">
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
                onClick={() => navigate("/")}
                variant="outline"
                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 transition-all duration-300"
              >
                <House className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Back to Timeline</span>
              </Button>
              {isAuthenticated ? (
            <>
              <Button
                onClick={() => navigate("/member-dashboard")}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:inline">Dashboard</span>
                
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
                
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden md:inline">Login</span>
              
            </Button>
          )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 mt-16">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">Bot Details</h2>
            <p className="text-slate-500">View and filter all bot information</p>
          </div>
          <Button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search anything..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            <Button
              onClick={clearAllFilters}
              variant="outline"
              className="whitespace-nowrap"
              disabled={!searchTerm && !Object.values(filters).some(v => v)}
            >
              <FilterX className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="text-lg text-slate-600"><img src="/6.svg"></img></div>
              </div>
            ) : filteredBots.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-lg text-slate-600">No bots found matching your search criteria</div>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-3 text-slate-700 font-medium">
                      <div className="flex flex-col space-y-2">
                        <span>Bot Name</span>
                        <Input
                          type="text"
                          placeholder="Filter name"
                          value={filters.name}
                          onChange={(e) => handleFilterChange("name", e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                    </th>
                    <th className="text-left p-3 text-slate-700 font-medium">
                      <div className="flex flex-col space-y-2">
                        <span>Machine Name</span>
                        <Input
                          type="text"
                          placeholder="Filter machine"
                          value={filters.machineName}
                          onChange={(e) => handleFilterChange("machineName", e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                    </th>
                    <th className="text-left p-3 text-slate-700 font-medium">
                      <div className="flex flex-col space-y-2">
                        <span>Platform</span>
                        <Input
                          type="text"
                          placeholder="Filter platform"
                          value={filters.platform}
                          onChange={(e) => handleFilterChange("platform", e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                    </th>
                    <th className="text-left p-3 text-slate-700 font-medium">Start Time</th>
                    <th className="text-left p-3 text-slate-700 font-medium">End Time</th>
                    <th className="text-left p-3 text-slate-700 font-medium">
                      <div className="flex flex-col space-y-2">
                        <span>Scheduled Days</span>
                        <Input
                          type="text"
                          placeholder="Filter days"
                          value={filters.days}
                          onChange={(e) => handleFilterChange("days", e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                    </th>
                    <th className="text-left p-3 text-slate-700 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBots.map((bot) => (
                    <tr key={bot.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-3 text-slate-800">{bot.name}</td>
                      <td className="p-3 text-slate-800">{bot.machineName}</td>
                      <td className="p-3 text-slate-800">{bot.platform}</td>
                      <td className="p-3 text-slate-800">{bot.startTime}</td>
                      <td className="p-3 text-slate-800">{bot.endTime}</td>
                      <td className="p-3 text-slate-800">
                        <div className="flex flex-wrap gap-1">
                          {bot.scheduledDays.map((day) => (
                            <span
                              key={`${bot.id}-${day}`}
                              className="px-2 py-1 text-xs bg-slate-100 rounded-full"
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            isActiveNow(bot.startTime, bot.endTime, bot.scheduledDays)
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {isActiveNow(bot.startTime, bot.endTime, bot.scheduledDays)
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;