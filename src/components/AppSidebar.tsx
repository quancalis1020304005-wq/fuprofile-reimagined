import { Home, Users, UsersRound, ShoppingBag, Wallet, Gamepad2, Settings, Music } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Trang chủ", url: "/feed", icon: Home },
  { title: "FunBạn bè", url: "/friends", icon: Users },
  { title: "FunNhóm", url: "/groups", icon: UsersRound },
  { title: "FunMarketplace", url: "/marketplace", icon: ShoppingBag },
  { title: "FunVí", url: "/wallet", icon: Wallet },
  { title: "FunGamePlay", url: "/gameplay", icon: Gamepad2 },
  { title: "FunMusics", url: "/funmusics", icon: Music },
  { title: "Cài đặt", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent rounded-lg px-3 py-2.5 transition-all"
                      activeClassName="bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent text-primary-foreground font-medium shadow-md shadow-primary/20"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
