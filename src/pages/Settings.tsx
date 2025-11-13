import { useState, useRef } from "react";
import { Settings as SettingsIcon, Upload, User, Bell, Shield, UserCog, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const Settings = () => {
  const [profile, setProfile] = useState({
    fullName: "Lê Minh Quân",
    username: "Angel Quân",
    email: "quancalis1020304005@gmail.com",
    bio: "Viết vài dòng về bản thân...",
    avatar: ""
  });

  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState({
    posts: true,
    comments: true,
    likes: false,
    messages: true,
    friendRequests: true
  });

  const handleSaveProfile = () => {
    if (avatarPreview) {
      setProfile({ ...profile, avatar: avatarPreview });
    }
    toast.success("Đã lưu thay đổi!");
  };

  const handleUploadAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn file ảnh");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        toast.success("Đã chọn ảnh đại diện mới");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Cài đặt</h1>
          </div>
          <p className="text-muted-foreground">Quản lý tài khoản và tùy chọn của bạn</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/30">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Hồ sơ
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Thông báo
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Bảo mật
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <UserCog className="h-4 w-4" />
              Tài khoản
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ảnh đại diện</CardTitle>
                <CardDescription>PNG, JPG, JPEG tối đa 5MB</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || profile.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {profile.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleUploadAvatar}
                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </button>
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button onClick={handleUploadAvatar} variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Tải ảnh lên
                  </Button>
                  {avatarPreview && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ Đã chọn ảnh mới
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Họ và tên</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={profile.fullName}
                  onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tên người dùng</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={profile.username}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email</CardTitle>
                <CardDescription className="text-primary">Email không thể thay đổi</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={profile.email}
                  disabled
                  className="bg-muted/50"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Giới thiệu</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="resize-none min-h-[120px]"
                  placeholder="Viết vài dòng về bản thân..."
                />
              </CardContent>
            </Card>

            <Button onClick={handleSaveProfile} className="w-full bg-primary hover:bg-primary/90">
              Lưu thay đổi
            </Button>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông báo bài viết</CardTitle>
                <CardDescription>Nhận thông báo khi có bài viết mới từ bạn bè</CardDescription>
              </CardHeader>
              <CardContent>
                <Switch
                  checked={notifications.posts}
                  onCheckedChange={(checked) => setNotifications({...notifications, posts: checked})}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông báo bình luận</CardTitle>
                <CardDescription>Nhận thông báo khi có người bình luận bài viết của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <Switch
                  checked={notifications.comments}
                  onCheckedChange={(checked) => setNotifications({...notifications, comments: checked})}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông báo lượt thích</CardTitle>
                <CardDescription>Nhận thông báo khi có người thích bài viết của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <Switch
                  checked={notifications.likes}
                  onCheckedChange={(checked) => setNotifications({...notifications, likes: checked})}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông báo tin nhắn</CardTitle>
                <CardDescription>Nhận thông báo khi có tin nhắn mới</CardDescription>
              </CardHeader>
              <CardContent>
                <Switch
                  checked={notifications.messages}
                  onCheckedChange={(checked) => setNotifications({...notifications, messages: checked})}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lời mời kết bạn</CardTitle>
                <CardDescription>Nhận thông báo khi có lời mời kết bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <Switch
                  checked={notifications.friendRequests}
                  onCheckedChange={(checked) => setNotifications({...notifications, friendRequests: checked})}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Đổi mật khẩu</CardTitle>
                <CardDescription>Cập nhật mật khẩu của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Cập nhật mật khẩu
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Xác thực hai yếu tố</CardTitle>
                <CardDescription>Thêm lớp bảo mật cho tài khoản của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Kích hoạt xác thực hai yếu tố
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quyền riêng tư</CardTitle>
                <CardDescription>Quản lý quyền riêng tư của tài khoản</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tài khoản riêng tư</p>
                    <p className="text-sm text-muted-foreground">Chỉ bạn bè mới xem được bài viết</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Hiển thị email</p>
                    <p className="text-sm text-muted-foreground">Cho phép người khác xem email của bạn</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Xóa tài khoản</CardTitle>
                <CardDescription>Hành động này không thể hoàn tác</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full">
                  Xóa tài khoản vĩnh viễn
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
