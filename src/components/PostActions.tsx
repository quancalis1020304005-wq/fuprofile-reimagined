import { useState } from 'react';
import { MoreHorizontal, EyeOff, Bookmark, Flag, Bell, BellOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PostActionsProps {
  postId: string;
  authorId: string;
  onHide?: () => void;
}

export const PostActions = ({ postId, authorId, onHide }: PostActionsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleHidePost = async () => {
    setLoading(true);
    try {
      // TODO: Implement hide post logic in backend
      toast({
        title: 'Đã ẩn bài viết',
        description: 'Bạn sẽ không thấy bài viết này nữa',
      });
      onHide?.();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể ẩn bài viết',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePost = async () => {
    setLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      // Check if already saved
      const { data: existing, error: checkError } = await supabase
        .from('interactions' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('entity_type', 'post')
        .eq('entity_id', postId)
        .eq('type', 'save')
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        // Unsave
        const { error: deleteError } = await supabase
          .from('interactions' as any)
          .delete()
          .eq('id', (existing as any).id);
        
        if (deleteError) throw deleteError;
        
        toast({
          title: 'Đã bỏ lưu',
          description: 'Bài viết đã được xóa khỏi mục đã lưu',
        });
      } else {
        // Save
        const { error: insertError } = await supabase
          .from('interactions' as any)
          .insert({
            user_id: user.id,
            entity_type: 'post',
            entity_id: postId,
            type: 'save',
          });
        
        if (insertError) throw insertError;
        
        toast({
          title: 'Đã lưu',
          description: 'Bài viết đã được lưu',
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu bài viết',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnoozeAuthor = async () => {
    setLoading(true);
    try {
      // TODO: Implement snooze logic in backend
      toast({
        title: 'Đã tạm ẩn',
        description: 'Bạn sẽ không thấy bài viết từ người này trong 30 ngày',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạm ẩn người dùng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    setLoading(true);
    try {
      // TODO: Implement report logic in backend
      toast({
        title: 'Đã báo cáo',
        description: 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể báo cáo bài viết',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={loading}>
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleSavePost}>
          <Bookmark className="mr-2 h-4 w-4" />
          <span>Lưu bài viết</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleHidePost}>
          <EyeOff className="mr-2 h-4 w-4" />
          <span>Ẩn bài viết</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSnoozeAuthor}>
          <BellOff className="mr-2 h-4 w-4" />
          <span>Tạm ẩn tác giả (30 ngày)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleReport} className="text-destructive">
          <Flag className="mr-2 h-4 w-4" />
          <span>Báo cáo bài viết</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
