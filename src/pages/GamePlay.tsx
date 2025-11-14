import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy, Play, Star, Coins, Brain } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface MiniGame {
  id: string;
  name: string;
  description: string;
  reward: number;
  difficulty: "Dễ" | "Trung bình" | "Khó";
  icon: any;
  played: boolean;
}

const GamePlay = () => {
  const navigate = useNavigate();
  const [happyCamlyCoin, setHappyCamlyCoin] = useState(0);
  const [games, setGames] = useState<MiniGame[]>([]);

  const handlePlayGame = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    if (!game) return;

    // Simulate game completion
    const completed = Math.random() > 0.3; // 70% chance to complete
    
    if (completed) {
      setHappyCamlyCoin((prev) => prev + game.reward);
      setGames((prev) =>
        prev.map((g) => (g.id === gameId ? { ...g, played: true } : g))
      );
      toast.success(`Chúc mừng! Bạn đã hoàn thành ${game.name}`, {
        description: `+${game.reward} Happy CamlyCoin`,
      });
    } else {
      toast.error("Chưa hoàn thành", {
        description: "Hãy thử lại để nhận thưởng!",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Dễ":
        return "bg-success text-background";
      case "Trung bình":
        return "bg-chart-2 text-background";
      case "Khó":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      {/* Header with Balance */}
      <div className="bg-accent/10 border-b border-accent/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-info rounded-full flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-background" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">GamePlay</h1>
                <p className="text-sm text-muted-foreground">
                  Chơi game và kiếm Happy CamlyCoin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-accent to-chart-3 px-6 py-3 rounded-full shadow-lg">
              <Coins className="h-5 w-5 text-background animate-pulse" />
              <div className="text-background">
                <p className="text-xs font-medium">Happy CamlyCoin</p>
                <p className="text-xl font-bold">{happyCamlyCoin.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Game - Memory Game */}
      <div className="container mx-auto px-6 py-8">
        <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-success/10 border-2 border-primary/30 hover:border-primary/50 transition-all duration-300 mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
          <CardHeader className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-2xl">Truy tìm Happy CamlyCoin</CardTitle>
                    <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
                      ⭐ Nổi bật
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    Trò chơi lật thẻ trí nhớ - Đấu với Bot thông minh
                  </CardDescription>
                </div>
              </div>
              <Button 
                size="lg"
                onClick={() => navigate("/memory-game")}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Chơi ngay
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">10 vòng đấu</p>
                  <p className="text-xs text-muted-foreground">Thắng nhiều vòng nhất</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🍎</span>
                </div>
                <div>
                  <p className="text-sm font-medium">20 thẻ trái cây</p>
                  <p className="text-xs text-muted-foreground">Lật cặp giống nhau</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">❤️</span>
                </div>
                <div>
                  <p className="text-sm font-medium">5 máu</p>
                  <p className="text-xs text-muted-foreground">Hồi sau 3 giờ</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Mini Games
          </h2>
          <p className="text-muted-foreground">
            Hoàn thành các trò chơi để nhận Happy CamlyCoin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Card
                key={game.id}
                className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card/50 backdrop-blur-sm border-accent/20 overflow-hidden"
              >
                <div className="h-2 bg-gradient-to-r from-accent via-info to-chart-3" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-info/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7 text-accent" />
                    </div>
                    <Badge className={getDifficultyColor(game.difficulty)}>
                      {game.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{game.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-accent font-semibold">
                      <Coins className="h-4 w-4" />
                      <span>{game.reward}</span>
                    </div>
                    <Button
                      onClick={() => handlePlayGame(game.id)}
                      disabled={game.played}
                      className="bg-gradient-to-r from-accent to-info hover:from-accent/90 hover:to-info/90 text-background"
                    >
                      {game.played ? (
                        <>
                          <Trophy className="h-4 w-4 mr-2" />
                          Đã chơi
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Chơi ngay
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng số game
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{games.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đã hoàn thành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-success">
                {games.filter((g) => g.played).length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng điểm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-chart-3">
                {happyCamlyCoin}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
