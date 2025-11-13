import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const StoryCreator = () => {
  const handleCreateStory = () => {
    toast.info("Tính năng tạo tin đang được phát triển");
  };

  return (
    <Card 
      className="bg-muted/30 border-dashed border-2 border-muted-foreground/20 h-[180px] flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={handleCreateStory}
    >
      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-2">
        <Plus className="h-6 w-6 text-primary-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">Tạo tin</p>
    </Card>
  );
};
