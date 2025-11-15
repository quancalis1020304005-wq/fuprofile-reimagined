import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface BotAvatarProps {
  character: string;
  isThinking: boolean;
  difficultyLevel: number;
}

const characterEmojis: Record<string, string> = {
  Doraemon: "🤖",
  Nobita: "👦",
  Shizuka: "👧",
  Suneo: "😎",
  Gian: "💪",
};

export const BotAvatar = ({ character, isThinking, difficultyLevel }: BotAvatarProps) => {
  const [shouldPulse, setShouldPulse] = useState(false);

  useEffect(() => {
    if (difficultyLevel > 1) {
      setShouldPulse(true);
      setTimeout(() => setShouldPulse(false), 1000);
    }
  }, [difficultyLevel]);

  return (
    <Card className={`p-6 flex flex-col items-center gap-3 transition-all duration-300 ${
      shouldPulse ? "animate-pulse bg-destructive/20" : ""
    } ${isThinking ? "scale-105 border-destructive" : ""}`}>
      <div className="text-6xl">
        {characterEmojis[character] || "🤖"}
      </div>
      <div className="text-lg font-bold">{character}</div>
      <div className="text-sm text-muted-foreground">
        Độ khó: {difficultyLevel}/5
      </div>
      {shouldPulse && (
        <div className="text-xs text-destructive font-bold animate-fade-in">
          Độ khó tăng!
        </div>
      )}
    </Card>
  );
};
