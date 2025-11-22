import { useEffect, useRef } from "react";
import { PostCard } from "./PostCard";
import { Loader2, Filter, WifiOff } from "lucide-react";
import { useFeed, FeedMode } from "@/hooks/useFeed";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";

export const PostsFeed = () => {
  const [mode, setMode] = useState<FeedMode>('top');
  const { posts, loading, hasMore, loadMore, refresh } = useFeed({ mode, limit: 20 });
  const { isOnline, queueLength } = useOfflineQueue();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadMore]);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return postDate.toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-4">
      {/* Offline Alert */}
      {!isOnline && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Bạn đang offline. {queueLength > 0 && `${queueLength} hành động đang chờ đồng bộ.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Filter Header */}
      <div className="flex items-center justify-between bg-card rounded-lg p-3 border">
        <h3 className="font-semibold text-sm">Bảng tin</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              {mode === 'top' ? 'Nổi bật' : 'Mới nhất'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setMode('top')}>
              Nổi bật
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMode('recent')}>
              Mới nhất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Posts */}
      {posts.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!
        </div>
      )}

      {posts.map((post) => (
        <PostCard
          key={post.id}
          id={post.id}
          author={post.author?.name || 'Người dùng'}
          timeAgo={getTimeAgo(post.created_at)}
          content={post.content || ''}
          images={post.media_urls?.map((url, index) => ({
            url,
            type: post.media_types?.[index] || 'image'
          }))}
          likes={post.metrics?.likes || 0}
          comments={post.metrics?.comments || 0}
        />
      ))}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="h-10" />

      {/* End message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Bạn đã xem hết tất cả bài viết
        </div>
      )}
    </div>
  );
};

// Helper function
const getTimeAgo = (timestamp: string) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return postDate.toLocaleDateString('vi-VN');
};
