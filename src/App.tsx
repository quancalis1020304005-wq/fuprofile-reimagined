import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Feed from "./pages/Feed";
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
          <Route path="/feed" element={<Layout><Feed /></Layout>} />
          <Route path="/friends" element={<Layout><div className="p-8 text-center text-muted-foreground">Trang bạn bè đang được phát triển</div></Layout>} />
          <Route path="/notifications" element={<Layout><div className="p-8 text-center text-muted-foreground">Trang thông báo đang được phát triển</div></Layout>} />
          <Route path="/messages" element={<Layout><div className="p-8 text-center text-muted-foreground">Trang tin nhắn đang được phát triển</div></Layout>} />
          <Route path="/profile" element={<Layout><div className="p-8 text-center text-muted-foreground">Trang hồ sơ đang được phát triển</div></Layout>} />
          <Route path="/settings" element={<Layout><div className="p-8 text-center text-muted-foreground">Trang cài đặt đang được phát triển</div></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
