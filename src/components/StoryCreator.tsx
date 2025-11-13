import { useState, useRef } from "react";
import { Plus, Type, Mic, Music, Image as ImageIcon, Video, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type StoryType = "text" | "audio" | "music" | "image" | "video";

export const StoryCreator = () => {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<StoryType | null>(null);
  const [textContent, setTextContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  const storyTypes = [
    { type: "text" as StoryType, icon: Type, label: "Văn bản", color: "bg-blue-500" },
    { type: "audio" as StoryType, icon: Mic, label: "Âm thanh", color: "bg-green-500" },
    { type: "music" as StoryType, icon: Music, label: "Âm nhạc", color: "bg-purple-500" },
    { type: "image" as StoryType, icon: ImageIcon, label: "Hình ảnh", color: "bg-orange-500" },
    { type: "video" as StoryType, icon: Video, label: "Video", color: "bg-red-500" },
  ];

  const handleTypeSelect = (type: StoryType) => {
    setSelectedType(type);
    if (type === "audio") {
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success("Bắt đầu ghi âm");
    } catch (error) {
      toast.error("Không thể truy cập microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      toast.success("Đã dừng ghi âm");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`Đã chọn: ${file.name}`);
    }
  };

  const handlePublish = () => {
    if (selectedType === "text" && !textContent.trim()) {
      toast.error("Vui lòng nhập nội dung");
      return;
    }
    
    if ((selectedType === "music" || selectedType === "image" || selectedType === "video") && !selectedFile) {
      toast.error("Vui lòng chọn file");
      return;
    }
    
    toast.success("Đã đăng tin thành công!");
    setOpen(false);
    setSelectedType(null);
    setTextContent("");
    setSelectedFile(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Card 
        className="bg-muted/30 border-dashed border-2 border-muted-foreground/20 h-[180px] flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(true)}
      >
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-2">
          <Plus className="h-6 w-6 text-primary-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Tạo tin</p>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo tin mới</DialogTitle>
          </DialogHeader>

          {!selectedType ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-6">
              {storyTypes.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => handleTypeSelect(item.type)}
                    className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border hover:border-primary transition-colors group"
                  >
                    <div className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="font-medium text-foreground">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {storyTypes.find(t => t.type === selectedType)?.label}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedType(null);
                    setTextContent("");
                    setSelectedFile(null);
                    stopRecording();
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {selectedType === "text" && (
                <div className="space-y-4">
                  <Label htmlFor="text-content">Nội dung</Label>
                  <Textarea
                    id="text-content"
                    placeholder="Chia sẻ suy nghĩ của bạn..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="min-h-[200px] text-base"
                  />
                </div>
              )}

              {selectedType === "audio" && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-border rounded-lg">
                    {!isRecording ? (
                      <Button onClick={startRecording} size="lg" className="gap-2">
                        <Mic className="h-5 w-5" />
                        Bắt đầu ghi âm
                      </Button>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-2xl font-mono font-bold text-foreground">
                            {formatTime(recordingTime)}
                          </span>
                        </div>
                        <Button onClick={stopRecording} variant="destructive" size="lg">
                          Dừng ghi âm
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {(selectedType === "music" || selectedType === "image" || selectedType === "video") && (
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={
                      selectedType === "music" ? "audio/*" :
                      selectedType === "image" ? "image/*" :
                      "video/*"
                    }
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {!selectedFile ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-12 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors flex flex-col items-center gap-3"
                    >
                      {selectedType === "music" && <Music className="h-12 w-12 text-muted-foreground" />}
                      {selectedType === "image" && <ImageIcon className="h-12 w-12 text-muted-foreground" />}
                      {selectedType === "video" && <Video className="h-12 w-12 text-muted-foreground" />}
                      <span className="text-sm text-muted-foreground">
                        Nhấn để chọn {selectedType === "music" ? "file âm nhạc" : selectedType === "image" ? "hình ảnh" : "video"}
                      </span>
                    </button>
                  ) : (
                    <div className="p-6 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {selectedType === "music" && <Music className="h-8 w-8 text-primary" />}
                          {selectedType === "image" && <ImageIcon className="h-8 w-8 text-primary" />}
                          {selectedType === "video" && <Video className="h-8 w-8 text-primary" />}
                          <div>
                            <p className="font-medium text-foreground">{selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handlePublish}>
                  Đăng tin
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
