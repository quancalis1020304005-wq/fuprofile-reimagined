import { Search, Home, Users, Menu, MessageCircle, Bell, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NavLink } from "@/components/NavLink";

export const Header = () => {
  return (
    <header className="h-14 border-b border-border bg-card sticky top-0 z-50 px-4">
      <div className="flex items-center justify-between h-full max-w-[1800px] mx-auto">
        {/* Logo */}
        <NavLink to="/feed" className="text-primary font-bold text-xl flex-shrink-0">
          F.U.Profile
        </NavLink>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm trên F.U.Profile"
              className="pl-10 bg-muted/50 border-none h-10"
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2">
          <NavLink to="/feed">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 data-[active]:text-primary data-[active]:border-b-2 data-[active]:border-primary data-[active]:rounded-none"
            >
              <Home className="h-5 w-5" />
            </Button>
          </NavLink>

          <NavLink to="/friends">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Users className="h-5 w-5" />
            </Button>
          </NavLink>

          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Menu className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="h-10 w-10 relative">
            <MessageCircle className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-[10px]">
              3
            </Badge>
          </Button>

          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Bell className="h-5 w-5" />
          </Button>

          <Avatar className="h-9 w-9 cursor-pointer bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
              Q
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
