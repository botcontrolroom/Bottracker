import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogIn, LogOut, LayoutDashboard, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const NavBar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  return (
    <nav className="glass fixed top-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center px-6 py-3">
        <Link to="/" className="text-xl font-semibold flex items-center gap-2">
          <Bot className="h-6 w-6 md:hidden" />
          <span className="hidden md:inline">Bot Control Room</span>
        </Link>
        <div className="flex gap-2">
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
    </nav>
  );
};

export default NavBar;
