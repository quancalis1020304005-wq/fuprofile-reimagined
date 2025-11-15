import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface NPCDialogProps {
  onAccept: () => void;
  onDecline: () => void;
}

const dialogues = [
  "Tuyệt vời! Bạn đã chiến thắng một cách xuất sắc!",
  "Bạn thông minh và cực kỳ kiên trì!",
  "Bạn đã khiến bot phải nể phục.",
  "Tiếp tục giữ phong độ nhé!",
];

export const NPCDialog = ({ onAccept, onDecline }: NPCDialogProps) => {
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);

  useEffect(() => {
    if (currentDialogIndex < dialogues.length) {
      const timer = setTimeout(() => {
        setCurrentDialogIndex(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowChoices(true);
    }
  }, [currentDialogIndex]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="p-8 flex flex-col items-center gap-6 max-w-md">
        <div className="text-6xl">👨‍💼</div>
        <div className="text-xl font-bold">NPC Quản lý</div>
        
        <div className="min-h-[100px] flex flex-col gap-2">
          {dialogues.slice(0, currentDialogIndex + 1).map((text, index) => (
            <p
              key={index}
              className="text-center text-muted-foreground animate-fade-in"
            >
              {text}
            </p>
          ))}
        </div>

        {showChoices && (
          <div className="flex flex-col gap-4 w-full animate-fade-in">
            <p className="text-center font-medium">
              Bạn có muốn nhận phần thưởng không?
            </p>
            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={onAccept}
                className="flex-1"
              >
                Có (+10,000 điểm)
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onDecline}
                className="flex-1"
              >
                Không (+5,000 điểm)
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
