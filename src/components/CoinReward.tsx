import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CoinRewardProps {
  onAccept: () => void;
  onShow: () => void;
}

export const CoinReward = ({ onAccept, onShow }: CoinRewardProps) => {
  const [showButton, setShowButton] = useState(false);
  const [animating, setAnimating] = useState(true);

  const handleAnimationEnd = () => {
    setAnimating(false);
    setShowButton(true);
    onShow();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="p-8 flex flex-col items-center gap-6 max-w-md">
        <div
          className={`text-8xl ${animating ? "animate-coin-spin" : ""}`}
          onAnimationEnd={handleAnimationEnd}
          style={{
            filter: animating ? "drop-shadow(0 0 20px gold)" : "none",
          }}
        >
          🪙
        </div>
        <div className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
          Happy CamlyCoin
        </div>
        <p className="text-center text-muted-foreground">
          Chúc mừng! Bạn đã thắng 5 ván liên tiếp!
        </p>
        {showButton && (
          <Button
            size="lg"
            onClick={onAccept}
            className="animate-fade-in"
          >
            Nhận phần thưởng
          </Button>
        )}
      </Card>
    </div>
  );
};
