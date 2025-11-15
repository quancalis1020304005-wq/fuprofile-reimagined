import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Reply, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().max(1000, 'Comment must be less than 1000 characters')
});

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  currentUserId?: string;
  onReplyAdded: () => void;
}

export const CommentItem = ({ comment, postId, currentUserId, onReplyAdded }: CommentItemProps) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return commentDate.toLocaleDateString('vi-VN');
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !currentUserId) return;

    // Validate reply length
    const validation = commentSchema.safeParse({ content: replyContent.trim() });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments' as any)
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: replyContent.trim(),
          parent_comment_id: comment.id,
        }) as any;

      if (error) throw error;

      toast.success("Đã trả lời bình luận");
      setReplyContent("");
      setShowReplyInput(false);
      onReplyAdded();
    } catch (error) {
      console.error('Error replying:', error);
      toast.error("Không thể trả lời bình luận");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('comments' as any)
        .delete()
        .eq('id', comment.id) as any;

      if (error) throw error;

      toast.success("Đã xóa bình luận");
      onReplyAdded();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Không thể xóa bình luận");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
            U
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 bg-muted/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold">Người dùng</span>
            <span className="text-xs text-muted-foreground">{getTimeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-foreground">{comment.content}</p>
          
          <div className="flex gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Trả lời
            </Button>
            
            {currentUserId === comment.user_id && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Xóa
              </Button>
            )}
          </div>
        </div>
      </div>

      {showReplyInput && (
        <div className="ml-10 space-y-2">
          <div className="space-y-1">
            <Textarea
              placeholder="Viết câu trả lời..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[60px] resize-none"
              disabled={isSubmitting}
            />
            <div className="text-xs text-muted-foreground">
              {replyContent.length}/1000 ký tự
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowReplyInput(false);
                setReplyContent("");
              }}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleReply}
              disabled={!replyContent.trim() || isSubmitting}
            >
              {isSubmitting ? "Đang gửi..." : "Trả lời"}
            </Button>
          </div>
        </div>
      )}

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-10 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
};
