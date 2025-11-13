import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  color: string;
}

const suggestions: Friend[] = [
  { id: "1", name: "Doraemon", username: "@Doraemonbocdauxetai", color: "bg-cyan-500" },
  { id: "2", name: "Nguyễn Thị Thanh Tiên", username: "@Angel Thanh Tien", color: "bg-green-500" },
  { id: "3", name: "Le Minh Tri", username: "@Minh Tri", color: "bg-emerald-500" },
  { id: "4", name: "camly test web", username: "@camlytest", color: "bg-teal-500" },
  { id: "5", name: "Lê Minh Quân", username: "@Angel Quân", color: "bg-green-600" },
];

export const FriendSuggestions = () => {
  const handleAddFriend = (name: string) => {
    toast.success(`Đã gửi lời mời kết bạn tới ${name}`);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="friends" className="text-sm">
              Kết bạn
            </TabsTrigger>
            <TabsTrigger value="groups" className="text-sm">
              Nhóm
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <h3 className="text-sm font-semibold mb-4 text-foreground">Gợi ý kết bạn</h3>
        <div className="space-y-3">
          {suggestions.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className={`h-10 w-10 ${friend.color} flex-shrink-0`}>
                  <AvatarFallback className="text-white font-semibold">
                    {friend.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {friend.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {friend.username}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 hover:bg-muted"
                onClick={() => handleAddFriend(friend.name)}
              >
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
