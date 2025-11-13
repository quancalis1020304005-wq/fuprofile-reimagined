import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

export const StoryCreator = () => {
  const [userProfile, setUserProfile] = useState<{
    avatar_url: string | null;
    username: string | null;
  } | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, username')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserProfile(data);
      }
    }
  };

  const mockStories = [
    { id: 1, name: "Nguyễn Văn A", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1" },
    { id: 2, name: "Trần Thị B", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2" },
    { id: 3, name: "Lê Văn C", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3" },
    { id: 4, name: "Phạm Thị D", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* Create Story Card */}
      <Card 
        className="min-w-[120px] h-[200px] relative cursor-pointer hover:brightness-95 transition-all overflow-hidden group"
        onClick={() => console.log("Create story")}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-muted">
          <Avatar className="w-full h-[140px] rounded-none">
            {userProfile?.avatar_url && (
              <AvatarImage 
                src={userProfile.avatar_url} 
                alt={userProfile.username || "User"} 
                className="object-cover"
              />
            )}
            <AvatarFallback className="rounded-none bg-gradient-to-br from-primary to-accent text-primary-foreground font-medium text-4xl">
              {userProfile?.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-card p-3 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center -mt-8 mb-2 ring-4 ring-card">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xs font-semibold text-center">Tạo tin</span>
        </div>
      </Card>

      {/* Mock Story Cards */}
      {mockStories.map((story) => (
        <Card 
          key={story.id}
          className="min-w-[120px] h-[200px] relative cursor-pointer hover:brightness-95 transition-all overflow-hidden group"
        >
          <img 
            src={`https://picsum.photos/seed/${story.id}/200/300`}
            alt={story.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
          
          {/* Avatar */}
          <Avatar className="absolute top-3 left-3 w-10 h-10 ring-4 ring-primary">
            <AvatarImage src={story.avatar} alt={story.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {story.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white text-xs font-semibold drop-shadow-lg line-clamp-2">
              {story.name}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};
