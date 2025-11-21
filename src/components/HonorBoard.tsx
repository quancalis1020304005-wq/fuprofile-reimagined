import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingUp, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HonorBoardProps {
  userId: string;
}

export const HonorBoard = ({ userId }: HonorBoardProps) => {
  const [totalRewards, setTotalRewards] = useState(0);
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  // Fetch total rewards
  const fetchTotalRewards = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("amount")
        .eq("receiver_id", userId)
        .eq("status", "completed");

      if (error) throw error;

      const total = data?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
      setTotalRewards(total);
    } catch (error) {
      console.error("Error fetching rewards:", error);
    }
  };

  // Animate number counting up
  useEffect(() => {
    if (totalRewards === displayValue) return;

    setIsAnimating(true);
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepValue = (totalRewards - displayValue) / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(totalRewards);
        setIsAnimating(false);
        clearInterval(interval);
      } else {
        setDisplayValue((prev) => prev + stepValue);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [totalRewards, displayValue]);

  // Real-time updates
  useEffect(() => {
    fetchTotalRewards();

    const channel = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const newAmount = parseFloat(payload.new.amount.toString());
          setTotalRewards((prev) => prev + newAmount);
          
          toast({
            title: "🎉 Nhận thưởng mới!",
            description: `+${newAmount.toLocaleString("vi-VN")} VNĐ`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, toast]);

  // Get color based on milestone
  const getColorClass = () => {
    if (totalRewards >= 100000) return "text-yellow-300 animate-pulse";
    if (totalRewards >= 10000) return "text-yellow-400";
    if (totalRewards >= 1000) return "text-yellow-500";
    return "text-foreground";
  };

  const getGlowClass = () => {
    if (totalRewards >= 100000) return "shadow-[0_0_30px_rgba(253,224,71,0.6)]";
    if (totalRewards >= 10000) return "shadow-[0_0_20px_rgba(250,204,21,0.4)]";
    if (totalRewards >= 1000) return "shadow-[0_0_10px_rgba(234,179,8,0.3)]";
    return "";
  };

  return (
    <Card className={`transition-all duration-500 ${getGlowClass()}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Honor Board
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Rewards Display */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Total Reward Received
            </span>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          
          <div className={`text-5xl font-bold ${getColorClass()} transition-all duration-300`}>
            {displayValue.toLocaleString("vi-VN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            <span className="text-2xl ml-2">VNĐ</span>
          </div>

          {/* Milestone badges */}
          <div className="flex gap-2 mt-4">
            {totalRewards >= 1000 && (
              <div className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-semibold border border-yellow-500/30">
                ⭐ 1K Club
              </div>
            )}
            {totalRewards >= 10000 && (
              <div className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-xs font-semibold border border-yellow-400/30">
                ⭐⭐ 10K Elite
              </div>
            )}
            {totalRewards >= 100000 && (
              <div className="px-3 py-1 bg-yellow-300/20 text-yellow-300 rounded-full text-xs font-semibold border border-yellow-300/30 animate-pulse">
                ⭐⭐⭐ 100K Legend
              </div>
            )}
          </div>
        </div>

        {/* Confetti effect for milestones */}
        {isAnimating && totalRewards >= 1000 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="confetti absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
