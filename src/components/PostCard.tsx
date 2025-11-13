import { Heart, MessageCircle, Share2, MoreHorizontal, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

interface PostCardProps {
  author: string;
  avatar?: string;
  timeAgo: string;
  content: string;
  images?: Array<{ url: string; type: string }>;
  likes: number;
  comments: number;
}

export const PostCard = ({ author, avatar, timeAgo, content, images, likes, comments }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    toast.success(liked ? "Đã bỏ thích" : "Đã thích bài viết");
  };

  const handleComment = () => {
    toast.info("Tính năng bình luận đang được phát triển");
  };

  const handleShare = () => {
    toast.success("Đã sao chép link bài viết");
  };

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/10">
            <AvatarImage src={avatar} alt={author} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
              {author.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm text-foreground">{author}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-foreground whitespace-pre-wrap">{content}</p>
        {images && images.length > 0 && (
          <div className={`mt-3 rounded-lg overflow-hidden ${images.length === 1 ? '' : 'grid grid-cols-2 gap-1'}`}>
            {images.map((media, index) => (
              <div key={index}>
                {media.type === 'video' ? (
                  <video 
                    src={media.url}
                    controls
                    className="w-full h-auto object-cover max-h-[500px]"
                  />
                ) : media.type === 'audio' ? (
                  <div className="w-full bg-muted/30 rounded-lg p-6 flex flex-col items-center gap-4">
                    <Music className="h-16 w-16 text-primary" />
                    <audio src={media.url} controls className="w-full max-w-md" />
                  </div>
                ) : (
                  <img 
                    src={media.url}
                    alt={`Post media ${index + 1}`}
                    className="w-full h-auto object-cover max-h-[500px]"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${liked ? "text-red-500 hover:text-red-600" : "text-muted-foreground"}`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            <span className="text-sm">{likeCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={handleComment}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{comments}</span>
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          <span className="text-sm">Chia sẻ</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
