import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "./lib/queryClient";

// Pages
import Home from "@/pages/home";
import ProgramDetail from "@/pages/program-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/programs/:id" component={ProgramDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function DataInitializer() {
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      try {
        await apiRequest("GET", "/api/initialize", undefined);
      } catch (error) {
        console.error("Failed to initialize data:", error);
        toast({
          title: "Error",
          description: "Failed to load program data. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    initializeData();
  }, [toast]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataInitializer />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
