import { CreatePost } from "@/components/CreatePost";
import { PostCard } from "@/components/PostCard";

const Feed = () => {
  const posts = [
    {
      id: 1,
      author: "Nguyễn Văn A",
      timeAgo: "2 giờ trước",
      content: "Chào mọi người! Hôm nay là một ngày tuyệt vời để học tập và phát triển bản thân. 🌟",
      likes: 45,
      comments: 12,
    },
    {
      id: 2,
      author: "Trần Thị B",
      avatar: "",
      timeAgo: "5 giờ trước",
      content: "Vừa hoàn thành dự án lớn của mình! Cảm ơn mọi người đã hỗ trợ. 🎉\n\n#achievement #teamwork",
      likes: 128,
      comments: 24,
    },
    {
      id: 3,
      author: "Lê Văn C",
      timeAgo: "1 ngày trước",
      content: "Chia sẻ một số tips học tập hiệu quả mà mình đã áp dụng:\n\n1. Lập kế hoạch cụ thể\n2. Chia nhỏ mục tiêu\n3. Nghỉ ngơi hợp lý\n4. Ôn tập thường xuyên\n\nChúc mọi người học tốt! 📚",
      likes: 89,
      comments: 31,
    },
    {
      id: 4,
      author: "Phạm Thị D",
      timeAgo: "2 ngày trước",
      content: "Cuối tuần này có ai muốn đi cafe và làm việc nhóm không? Mình đang tìm bạn cùng học! ☕",
      likes: 34,
      comments: 18,
    },
    {
      id: 5,
      author: "Hoàng Văn E",
      timeAgo: "3 ngày trước",
      content: "Chia sẻ tài liệu học tập mới nhất về lập trình web. Ai cần thì inbox mình nhé! 💻\n\n#programming #webdev",
      likes: 156,
      comments: 45,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Bảng tin</h1>
          <p className="text-sm text-muted-foreground">Cập nhật mới nhất từ bạn bè</p>
        </div>

        {/* Create Post */}
        <CreatePost />

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>

        {/* Load More */}
        <div className="mt-6 text-center">
          <button className="text-sm text-primary hover:text-accent font-medium transition-colors">
            Xem thêm bài viết
          </button>
        </div>
      </div>
    </div>
  );
};

export default Feed;
