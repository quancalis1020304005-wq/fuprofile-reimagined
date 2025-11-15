import { useState, useRef } from "react";
import { Image, Video, X, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const postSchema = z.object({
  content: z.string().max(5000, 'Post content must be less than 5000 characters')
});

export const CreatePost = () => {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const newFiles = [...mediaFiles, ...fileArray];
    
    if (newFiles.length > 10) {
      toast.error("Chỉ có thể upload tối đa 10 file");
      return;
    }

    setMediaFiles(newFiles);

    // Create preview URLs
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Vui lòng nhập nội dung hoặc thêm ảnh/video");
      return;
    }

    // Validate content length
    if (content.trim()) {
      const validation = postSchema.safeParse({ content: content.trim() });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }
    }

    setIsPosting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vui lòng đăng nhập để đăng bài");
        return;
      }

      const mediaUrls: string[] = [];
      const mediaTypes: string[] = [];

      // Upload media files
      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('posts-media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('posts-media')
          .getPublicUrl(fileName);

        mediaUrls.push(publicUrl);
        if (file.type.startsWith('video/')) {
          mediaTypes.push('video');
        } else if (file.type.startsWith('audio/')) {
          mediaTypes.push('audio');
        } else {
          mediaTypes.push('image');
        }
      }

      // Create post
      const { error: insertError } = (await supabase
        .from('posts' as any)
        .insert({
          user_id: user.id,
          content: content.trim() || null,
          media_urls: mediaUrls.length > 0 ? mediaUrls : null,
          media_types: mediaTypes.length > 0 ? mediaTypes : null,
        })) as any;

      if (insertError) throw insertError;

      toast.success("Đã đăng bài viết thành công!");
      setContent("");
      setMediaFiles([]);
      setMediaPreview([]);
    } catch (error) {
      console.error('Error posting:', error);
      toast.error("Có lỗi xảy ra khi đăng bài");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="border-border">
      <CardContent className="pt-4">
        <div className="space-y-1 mb-4">
          <Textarea
            placeholder="Bạn đang nghĩ gì?"
            className="min-h-[100px] resize-none border-border bg-muted/30"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPosting}
          />
          <div className="text-xs text-muted-foreground px-1">
            {content.length}/5000 ký tự
          </div>
        </div>

        {/* Media Preview */}
        {mediaPreview.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {mediaPreview.map((preview, index) => (
              <div key={index} className="relative group">
                {mediaFiles[index].type.startsWith('video/') ? (
                  <video 
                    src={preview} 
                    className="w-full h-48 object-cover rounded-lg"
                    controls
                  />
                ) : mediaFiles[index].type.startsWith('audio/') ? (
                  <div className="w-full h-48 bg-muted/50 rounded-lg flex flex-col items-center justify-center gap-3">
                    <Music className="h-12 w-12 text-primary" />
                    <p className="text-sm text-muted-foreground px-4 truncate max-w-full">
                      {mediaFiles[index].name}
                    </p>
                    <audio src={preview} controls className="w-[90%]" />
                  </div>
                ) : (
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => removeMedia(index)}
                  disabled={isPosting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'image')}
              disabled={isPosting}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'video')}
              disabled={isPosting}
            />
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/mpeg,audio/mp3"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'audio')}
              disabled={isPosting}
            />
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => imageInputRef.current?.click()}
              disabled={isPosting}
            >
              <Image className="h-4 w-4" />
              <span>Ảnh</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => videoInputRef.current?.click()}
              disabled={isPosting}
            >
              <Video className="h-4 w-4" />
              <span>Video</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => audioInputRef.current?.click()}
              disabled={isPosting}
            >
              <Music className="h-4 w-4" />
              <span>MP3</span>
            </Button>
          </div>
          <Button 
            onClick={handlePost} 
            className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-primary-foreground px-6 shadow-md shadow-primary/30 transition-all"
            disabled={isPosting}
          >
            {isPosting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang đăng...
              </>
            ) : (
              "Đăng"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
