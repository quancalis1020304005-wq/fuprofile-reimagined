import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full min-w-0">
          {/* Header */}
          <Header />

          {/* Main content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
