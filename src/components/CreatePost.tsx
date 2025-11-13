import { useState } from "react";
import { Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
    <Card className="border-border">
      <CardContent className="pt-4">
        <Textarea
          placeholder="Bạn đang nghĩ gì?"
          className="min-h-[100px] resize-none border-border bg-muted/30 mb-4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Image className="h-4 w-4" />
              <span>Ảnh</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Video className="h-4 w-4" />
              <span>Video</span>
            </Button>
          </div>
          <Button onClick={handlePost} className="bg-primary hover:bg-accent px-6">
            Đăng
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
