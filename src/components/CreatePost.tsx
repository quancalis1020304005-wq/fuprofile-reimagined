import { useState } from "react";
import { Image, Video, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export const CreatePost = () => {
  const [content, setContent] = useState("");

  const handlePost = () => {
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung bài viết");
      return;
    }
    toast.success("Đã đăng bài viết thành công!");
    setContent("");
  };

  return (
    <Card className="border-border mb-6">
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
          </Avatar>
          <Textarea
            placeholder="Bạn đang nghĩ gì?"
            className="min-h-[80px] resize-none border-border bg-muted/50"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Ảnh</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Video</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
            <Smile className="h-4 w-4" />
            <span className="hidden sm:inline">Cảm xúc</span>
          </Button>
        </div>
        <Button onClick={handlePost} className="bg-primary hover:bg-accent">
          Đăng bài
        </Button>
      </CardFooter>
    </Card>
  );
};
