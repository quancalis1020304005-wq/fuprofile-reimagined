import { CreatePost } from "@/components/CreatePost";
import { PostCard } from "@/components/PostCard";
import { StoryCreator } from "@/components/StoryCreator";

const Feed = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1000px] mx-auto px-4 py-4">
        <div className="space-y-4">
          {/* Story Creator */}
          <StoryCreator />

          {/* Create Post */}
          <CreatePost />
        </div>
      </div>
    </div>
  );
};

export default Feed;
