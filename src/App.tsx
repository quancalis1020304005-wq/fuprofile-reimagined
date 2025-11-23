import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Feed from "./pages/Feed";
import Friends from "./pages/Friends";
import Groups from "./pages/Groups";
import Marketplace from "./pages/Marketplace";
import Wallet from "./pages/Wallet";
import GamePlay from "./pages/GamePlay";
import MemoryGame from "./pages/MemoryGame";
import AngelArtGame from "./pages/AngelArtGame";
import FunMusics from "./pages/FunMusics";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/feed" element={<ProtectedRoute><Layout><Feed /></Layout></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><Layout><Friends /></Layout></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><Layout><Groups /></Layout></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Layout><Marketplace /></Layout></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Layout><Wallet /></Layout></ProtectedRoute>} />
            <Route path="/gameplay" element={<ProtectedRoute><Layout><GamePlay /></Layout></ProtectedRoute>} />
            <Route path="/memory-game" element={<ProtectedRoute><Layout><MemoryGame /></Layout></ProtectedRoute>} />
            <Route path="/angel-art" element={<ProtectedRoute><Layout><AngelArtGame /></Layout></ProtectedRoute>} />
            <Route path="/funmusics" element={<ProtectedRoute><Layout><FunMusics /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          <Route path="/play" element={<MemoryGame />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
