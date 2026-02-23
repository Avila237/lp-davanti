import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminAB from "./pages/AdminAB";
import InstagramRedirect from "./pages/InstagramRedirect";
import Careers from "./pages/Careers";
import CareerDetail from "./pages/CareerDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/ab" element={<AdminAB />} />
          <Route path="/carreiras" element={<Careers />} />
          <Route path="/carreiras/:id" element={<CareerDetail />} />
          <Route path="/instagram" element={<InstagramRedirect />} />
          <Route path="/insta" element={<InstagramRedirect />} />
          <Route path="/bio" element={<InstagramRedirect />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
