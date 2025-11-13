import { useState, useEffect } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommentItem } from "./CommentItem";

interface CommentSectionProps {
  postId: string;
  initialCommentCount: number;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_comment_id: string | null;
}

export const CommentSection = ({ postId, initialCommentCount }: CommentSectionProps) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>();

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (showComments) {
      fetchComments();
      subscribeToComments();
    }
  }, [showComments, postId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id);
  };

  const fetchComments = async () => {
    try {
      const { data, error } = (await supabase
        .from('comments' as any)
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })) as any;

      if (error) throw error;

      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const subscribeToComments = () => {
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !currentUserId) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = (await supabase
        .from('comments' as any)
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: newComment.trim(),
          parent_comment_id: null,
        })) as any;

      if (error) throw error;

      toast.success("Đã thêm bình luận");
      setNewComment("");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Không thể thêm bình luận");
    } finally {
      setIsSubmitting(false);
    }
  };

  const organizeComments = () => {
    const commentMap = new Map<string, Comment & { replies: Comment[] }>();
    const rootComments: (Comment & { replies: Comment[] })[] = [];

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies.push(commentMap.get(comment.id)!);
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    return rootComments;
  };

  return (
    <div className="border-t border-border pt-3 space-y-3">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground w-full justify-start"
        onClick={() => setShowComments(!showComments)}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm">
          {comments.length > 0 ? `${comments.length} bình luận` : 'Chưa có bình luận'}
        </span>
      </Button>

      {showComments && (
        <div className="space-y-3">
          {/* Comment input */}
          <div className="flex gap-2">
            <Textarea
              placeholder="Viết bình luận..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none flex-1"
              disabled={isSubmitting}
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              className="h-10 w-10 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Comments list */}
          <div className="space-y-3">
            {organizeComments().map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                currentUserId={currentUserId}
                onReplyAdded={fetchComments}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
