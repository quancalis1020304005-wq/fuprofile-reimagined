import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Groups = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }
    
    const newGroup = {
      id: Date.now(),
      name: groupName,
      description: groupDescription,
      members: 1,
      avatar: "",
    };
    
    setGroups([...groups, newGroup]);
    toast.success("Đã tạo nhóm thành công!");
    setGroupName("");
    setGroupDescription("");
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Nhóm của bạn</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" />
                Tạo nhóm
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo nhóm mới</DialogTitle>
                <DialogDescription>
                  Tạo một nhóm mới để kết nối với mọi người
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên nhóm</Label>
                  <Input
                    id="name"
                    placeholder="Nhập tên nhóm..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả (tùy chọn)</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả về nhóm của bạn..."
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    className="resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateGroup} className="bg-primary hover:bg-primary/90">
                  Tạo nhóm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {groups.length === 0 ? (
          <Card className="p-16 text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Bạn chưa tham gia nhóm nào
              </h3>
              <p className="text-muted-foreground">
                Tạo nhóm mới để kết nối với bạn bè và chia sẻ nội dung
              </p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <Plus className="h-4 w-4" />
              Tạo nhóm đầu tiên
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Card key={group.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 truncate">
                      {group.name}
                    </h3>
                    {group.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {group.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {group.members} thành viên
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
