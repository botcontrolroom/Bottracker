
import NavBar from "@/components/NavBar";
import Timeline from "@/components/Timeline";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

const Index = () => {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    toast({
      title: "Welcome to Bot Timeline Tracker",
      description: "View live bot activities and their schedules.",
      duration: 3000,
    });

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <NavBar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4">
            {currentTime.toLocaleTimeString()}
          </h1>
          <p className="text-2xl text-slate-600 mb-4">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Timeline />
      </main>
    </div>
  );
};

export default Index;
