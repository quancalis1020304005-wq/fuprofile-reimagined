import { useState } from "react";
import { Search, MessageCircle, UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Friend {
  id: number;
  name: string;
  username: string;
  avatar?: string;
  status?: "friend" | "pending" | "suggestion";
}

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const allFriends: Friend[] = [
    { id: 1, name: "Doraemon", username: "@Doraemonbocdauxetai", avatar: "", status: "friend" },
  ];

  const suggestions: Friend[] = [
    { id: 2, name: "Nguyễn Văn A", username: "@nguyenvana", avatar: "", status: "suggestion" },
    { id: 3, name: "Trần Thị B", username: "@tranthib", avatar: "", status: "suggestion" },
    { id: 4, name: "Lê Văn C", username: "@levanc", avatar: "", status: "suggestion" },
  ];

  const pendingRequests: Friend[] = [
    { id: 5, name: "Phạm Minh D", username: "@phamminhd", avatar: "", status: "pending" },
  ];

  const handleMessage = (name: string) => {
    toast.success(`Mở tin nhắn với ${name}`);
  };

  const handleRemoveFriend = (name: string) => {
    toast.success(`Đã xóa ${name} khỏi danh sách bạn bè`);
  };

  const handleAddFriend = (name: string) => {
    toast.success(`Đã gửi lời mời kết bạn đến ${name}`);
  };

  const handleAcceptRequest = (name: string) => {
    toast.success(`Đã chấp nhận lời mời kết bạn từ ${name}`);
  };

  const handleRejectRequest = (name: string) => {
    toast.success(`Đã từ chối lời mời kết bạn từ ${name}`);
  };

  const FriendCard = ({ friend, type }: { friend: Friend; type: "friend" | "suggestion" | "pending" }) => (
    <Card className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={friend.avatar} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {friend.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-foreground">{friend.name}</h3>
          <p className="text-sm text-muted-foreground">{friend.username}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {type === "friend" && (
          <>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={() => handleMessage(friend.name)}
            >
              <MessageCircle className="h-4 w-4" />
              Nhắn tin
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRemoveFriend(friend.name)}
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          </>
        )}
        {type === "suggestion" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAddFriend(friend.name)}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
        {type === "pending" && (
          <>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90"
              onClick={() => handleAcceptRequest(friend.name)}
            >
              Chấp nhận
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRejectRequest(friend.name)}
            >
              Từ chối
            </Button>
          </>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Bạn bè</h1>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-muted/30 w-full justify-start gap-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-background">
              Tất cả bạn bè
              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                {allFriends.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-background">
              Lời mời
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="data-[state=active]:bg-background">
              Gợi ý
            </TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bạn bè..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30"
            />
          </div>

          <TabsContent value="all" className="space-y-3">
            {allFriends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} type="friend" />
            ))}
          </TabsContent>

          <TabsContent value="requests" className="space-y-3">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((friend) => (
                <FriendCard key={friend.id} friend={friend} type="pending" />
              ))
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Không có lời mời kết bạn nào</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-3">
            {suggestions.map((friend) => (
              <FriendCard key={friend.id} friend={friend} type="suggestion" />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Friends;
