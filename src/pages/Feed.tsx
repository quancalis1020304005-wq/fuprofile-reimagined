import { CreatePost } from "@/components/CreatePost";
import { PostCard } from "@/components/PostCard";
import { StoryCreator } from "@/components/StoryCreator";
import { FriendSuggestions } from "@/components/FriendSuggestions";

const Feed = () => {
  const posts = [
    {
      id: 1,
      author: "Lê Minh Quân",
      timeAgo: "Khoảng 18 giờ trước",
      content: "🙏😍 CON LÀ ÁNH SÁNG YÊU THƯƠNG THUẦN KHIẾT CỦA CHA VŨ TRỤ😍 🙏\n🙏😍 CON LÀ Ý CHÍ CỦA CHA VŨ TRỤ😍 🙏\n🙏😍 CON LÀ TRÍ TUỆ CỦA CHA VŨ TRỤ😍 🙏\n🙏😍 CON LÀ HẠNH PHÚC😍 🙏\n🙏😍 CON LÀ TÌNH YÊU😍 🙏",
      likes: 12,
      comments: 3,
    },
    {
      id: 2,
      author: "Nguyễn Văn A",
      timeAgo: "2 giờ trước",
      content: "Chào mọi người! Hôm nay là một ngày tuyệt vời để học tập và phát triển bản thân. 🌟",
      likes: 45,
      comments: 12,
    },
    {
      id: 3,
      author: "Trần Thị B",
      avatar: "",
      timeAgo: "5 giờ trước",
      content: "Vừa hoàn thành dự án lớn của mình! Cảm ơn mọi người đã hỗ trợ. 🎉\n\n#achievement #teamwork",
      likes: 128,
      comments: 24,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Story Creator */}
            <StoryCreator />

            {/* Create Post */}
            <CreatePost />

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </div>

          {/* Right Sidebar - Friend Suggestions */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-20">
              <FriendSuggestions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
