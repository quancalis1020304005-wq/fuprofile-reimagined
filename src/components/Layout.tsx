import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          {/* Header with trigger */}
          <header className="h-14 border-b border-border bg-card sticky top-0 z-10 flex items-center px-4">
            <SidebarTrigger className="mr-4">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <span className="font-semibold text-foreground">F.U.Profile</span>
          </header>

          {/* Main content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
