import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Lock, Unlock, Star, Coins } from "lucide-react";
import confetti from "canvas-confetti";

interface Bee {
  x: number;
  y: number;
  size: number;
  isMoving: boolean;
}

interface Flower {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  emoji: string;
  state: "idle" | "attacking" | "hit" | "wilting";
  targetX?: number;
  targetY?: number;
  animationFrame: number;
}

interface PathPoint {
  x: number;
  y: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BEE_SIZE = 30;
const FLOWER_SIZE = 40;
const GRID_SIZE = 40;
const FLOWER_EMOJIS = ["🌸", "🌺", "🌻", "🌼", "🌷", "💐", "🏵️"];

// Predefined paths for different paintings
const PAINTING_PATHS = [
  // Heart shape
  [
    { x: 400, y: 200 }, { x: 450, y: 150 }, { x: 500, y: 150 }, { x: 550, y: 200 },
    { x: 550, y: 250 }, { x: 500, y: 300 }, { x: 450, y: 350 }, { x: 400, y: 400 },
    { x: 350, y: 350 }, { x: 300, y: 300 }, { x: 250, y: 250 }, { x: 250, y: 200 },
    { x: 300, y: 150 }, { x: 350, y: 150 }, { x: 400, y: 200 }
  ],
  // Star shape
  [
    { x: 400, y: 150 }, { x: 440, y: 280 }, { x: 550, y: 320 }, { x: 450, y: 380 },
    { x: 480, y: 500 }, { x: 400, y: 420 }, { x: 320, y: 500 }, { x: 350, y: 380 },
    { x: 250, y: 320 }, { x: 360, y: 280 }, { x: 400, y: 150 }
  ],
  // Circle
  Array.from({ length: 20 }, (_, i) => ({
    x: 400 + Math.cos((i / 20) * Math.PI * 2) * 200,
    y: 300 + Math.sin((i / 20) * Math.PI * 2) * 200
  }))
];

const AngelArtGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasKey, setHasKey] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPainting, setCurrentPainting] = useState(0);
  const [pathProgress, setPathProgress] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [bee, setBee] = useState<Bee>({
    x: PAINTING_PATHS[0][0].x,
    y: PAINTING_PATHS[0][0].y,
    size: BEE_SIZE,
    isMoving: false
  });
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const animationFrameRef = useRef<number>();

  // Check if user has the secret key from Memory Game
  useEffect(() => {
    const checkKey = () => {
      const hasSecretKey = localStorage.getItem("memoryGameSecretKey") === "true";
      setHasKey(hasSecretKey);
    };
    checkKey();
  }, []);

  // Fetch total coins
  useEffect(() => {
    const fetchCoins = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("transactions")
        .select("amount")
        .eq("receiver_id", user.id)
        .eq("type", "reward");

      const total = data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      setTotalCoins(total);
    };
    fetchCoins();
  }, []);

  // Initialize flowers
  const initializeFlowers = useCallback(() => {
    const newFlowers: Flower[] = [];
    for (let i = 0; i < 15; i++) {
      newFlowers.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        speedX: (Math.random() - 0.5) * 4,
        speedY: (Math.random() - 0.5) * 4,
        size: FLOWER_SIZE,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5,
        emoji: FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)],
        state: "idle",
        animationFrame: 0
      });
    }
    setFlowers(newFlowers);
  }, []);

  // Handle unlock animation
  const handleUnlock = () => {
    setIsUnlocking(true);
    setTimeout(() => {
      setIsLocked(false);
      setIsUnlocking(false);
      toast.success("Đã mở khóa! Bắt đầu sáng tạo!", {
        description: "Điều khiển ong bằng WASD, đứng im để tránh hoa"
      });
    }, 2000);
  };

  // Start game
  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setPathProgress(0);
    setIsPaused(false);
    const startPoint = PAINTING_PATHS[currentPainting][0];
    setBee({ x: startPoint.x, y: startPoint.y, size: BEE_SIZE, isMoving: false });
    initializeFlowers();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        setKeysPressed(prev => new Set(prev).add(key));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeysPressed(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Check collision
  const checkCollision = useCallback((beePos: { x: number; y: number }, flower: Flower) => {
    const dx = beePos.x - flower.x;
    const dy = beePos.y - flower.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (BEE_SIZE + flower.size) / 2;
  }, []);

  // Check if bee is on path
  const isOnPath = useCallback((x: number, y: number) => {
    const path = PAINTING_PATHS[currentPainting];
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];
      
      const lineLength = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const dot = ((x - p1.x) * (p2.x - p1.x) + (y - p1.y) * (p2.y - p1.y)) / Math.pow(lineLength, 2);
      
      const closestX = p1.x + dot * (p2.x - p1.x);
      const closestY = p1.y + dot * (p2.y - p1.y);
      
      const distance = Math.sqrt(Math.pow(x - closestX, 2) + Math.pow(y - closestY, 2));
      
      if (distance < GRID_SIZE / 2 && dot >= 0 && dot <= 1) {
        return true;
      }
    }
    return false;
  }, [currentPainting]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || isGameOver || isPaused) return;

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw background
      ctx.fillStyle = "#f0f9ff";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw path
      const path = PAINTING_PATHS[currentPainting];
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = GRID_SIZE;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();

      // Draw completed path
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = GRID_SIZE - 10;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      const completedPoints = Math.floor((pathProgress / 100) * path.length);
      for (let i = 1; i < completedPoints; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();

      // Update and draw bee
      setBee(prevBee => {
        let newX = prevBee.x;
        let newY = prevBee.y;
        let isMoving = false;

        const speed = 3;
        if (keysPressed.has("w")) { newY -= speed; isMoving = true; }
        if (keysPressed.has("s")) { newY += speed; isMoving = true; }
        if (keysPressed.has("a")) { newX -= speed; isMoving = true; }
        if (keysPressed.has("d")) { newX += speed; isMoving = true; }

        // Boundary check
        newX = Math.max(BEE_SIZE, Math.min(CANVAS_WIDTH - BEE_SIZE, newX));
        newY = Math.max(BEE_SIZE, Math.min(CANVAS_HEIGHT - BEE_SIZE, newY));

        // Update path progress
        if (isOnPath(newX, newY)) {
          setPathProgress(prev => Math.min(100, prev + 0.5));
        }

        // Check collision only when moving
        if (isMoving) {
          setFlowers(prevFlowers => prevFlowers.map(flower => {
            if (flower.state === "idle" && checkCollision({ x: newX, y: newY }, flower)) {
              setIsGameOver(true);
              toast.error("Chạm hoa rồi! Bắt đầu lại từ đầu", {
                description: "Nhớ đứng im khi hoa bay qua nhé!"
              });
              return { ...flower, state: "hit" as const };
            }
            return flower;
          }));
        }

        // Draw bee
        ctx.font = `${BEE_SIZE}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🐝", newX, newY);

        return { ...prevBee, x: newX, y: newY, isMoving };
      });

      // Update and draw flowers
      setFlowers(prevFlowers => prevFlowers.map(flower => {
        let newFlower = { ...flower };
        newFlower.animationFrame++;

        // Update position based on state
        if (flower.state === "idle") {
          newFlower.x += flower.speedX;
          newFlower.y += flower.speedY;
          newFlower.rotation += flower.rotationSpeed;

          // Bounce off walls
          if (newFlower.x < 0 || newFlower.x > CANVAS_WIDTH) newFlower.speedX *= -1;
          if (newFlower.y < 0 || newFlower.y > CANVAS_HEIGHT) newFlower.speedY *= -1;

          // Randomly attack
          if (Math.random() < 0.005 && !bee.isMoving) {
            newFlower.state = "attacking";
            newFlower.targetX = bee.x;
            newFlower.targetY = bee.y;
          }
        } else if (flower.state === "attacking") {
          if (flower.targetX && flower.targetY) {
            const dx = flower.targetX - flower.x;
            const dy = flower.targetY - flower.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
              newFlower.x += (dx / distance) * 6;
              newFlower.y += (dy / distance) * 6;
              newFlower.rotation += 15;
            } else {
              newFlower.state = "idle";
            }
          }
        } else if (flower.state === "wilting") {
          newFlower.y += 5;
          newFlower.rotation += 10;
          newFlower.size *= 0.95;
        }

        // Draw flower with animations
        ctx.save();
        ctx.translate(newFlower.x, newFlower.y);
        ctx.rotate((newFlower.rotation * Math.PI) / 180);
        
        const scale = flower.state === "attacking" ? 1 + Math.sin(flower.animationFrame * 0.2) * 0.2 : 1;
        ctx.scale(scale, scale);
        
        ctx.font = `${newFlower.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(newFlower.emoji, 0, 0);
        ctx.restore();

        return newFlower;
      }));

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isGameOver, isPaused, keysPressed, bee, checkCollision, isOnPath, currentPainting]);

  // Check if painting is complete
  useEffect(() => {
    if (pathProgress >= 100 && !isGameOver) {
      setIsPlaying(false);
      setIsPaused(true);
      
      // Wilt all flowers
      setFlowers(prev => prev.map(f => ({ ...f, state: "wilting" as const })));
      
      // Confetti
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });

      // Award coins
      const awardCoins = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("transactions").insert({
          receiver_id: user.id,
          amount: 1000000,
          type: "reward",
          status: "completed",
          description: "Hoàn thành bức tranh Sáng tạo cùng Angel",
          currency: "CAMLY"
        });

        setTotalCoins(prev => prev + 1000000);
      };
      awardCoins();

      toast.success("Hoàn thành bức tranh! 🎨", {
        description: "+1,000,000 Happy CamlyCoin"
      });

      // Move to next painting after animation
      setTimeout(() => {
        setCurrentPainting(prev => (prev + 1) % PAINTING_PATHS.length);
        setPathProgress(0);
        setIsPaused(false);
      }, 3000);
    }
  }, [pathProgress, isGameOver]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/gameplay")}>
            <ArrowLeft className="mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent px-6 py-3 rounded-full">
            <Coins className="h-5 w-5 text-primary-foreground animate-pulse" />
            <span className="text-primary-foreground font-bold">
              {totalCoins.toLocaleString()}
            </span>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto overflow-hidden">
          <div className="bg-gradient-to-r from-primary via-accent to-success p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                  🎨 Sáng tạo cùng Angel
                </h1>
                <p className="text-primary-foreground/80">
                  Điều khiển ong vẽ theo đường viền - Đứng im để tránh hoa!
                </p>
              </div>
              <Badge variant="secondary" className="text-xl px-4 py-2">
                Bức tranh {currentPainting + 1}/{PAINTING_PATHS.length}
              </Badge>
            </div>
          </div>

          {isLocked ? (
            <div className="p-12 text-center">
              <div className={`text-8xl mb-6 ${isUnlocking ? "animate-bounce" : ""}`}>
                {hasKey ? <Unlock className="h-24 w-24 mx-auto text-success" /> : <Lock className="h-24 w-24 mx-auto text-muted-foreground" />}
              </div>
              {hasKey ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">Bạn có chìa khóa!</h2>
                  <p className="text-muted-foreground mb-6">
                    Bấm vào ngôi sao để mở khóa trò chơi
                  </p>
                  <Button
                    size="lg"
                    onClick={handleUnlock}
                    disabled={isUnlocking}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    <Star className="mr-2 h-5 w-5" />
                    {isUnlocking ? "Đang mở khóa..." : "Mở khóa"}
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4">Cần chìa khóa!</h2>
                  <p className="text-muted-foreground mb-6">
                    Thắng hoàn toàn trò lật thẻ để lấy chìa khóa
                  </p>
                  <Button
                    size="lg"
                    onClick={() => navigate("/memory-game")}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    Chơi game lật thẻ
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="p-6">
              {!isPlaying && !isGameOver ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">🐝🌸</div>
                  <h3 className="text-xl font-bold mb-4">Cách chơi</h3>
                  <ul className="text-left max-w-md mx-auto space-y-2 mb-6">
                    <li>✨ Dùng <kbd className="kbd">W</kbd><kbd className="kbd">A</kbd><kbd className="kbd">S</kbd><kbd className="kbd">D</kbd> để điều khiển ong</li>
                    <li>🎨 Vẽ theo đường viền màu xám</li>
                    <li>🌸 Đứng im khi hoa bay qua - Di chuyển thì chạm hoa = chết!</li>
                    <li>🪙 Hoàn thành = 1,000,000 Happy CamlyCoin</li>
                  </ul>
                  <Button size="lg" onClick={startGame} className="bg-gradient-to-r from-primary to-accent">
                    Bắt đầu vẽ
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-4">
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        Tiến độ: {Math.floor(pathProgress)}%
                      </Badge>
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        Hoa: {flowers.filter(f => f.state !== "wilting").length}
                      </Badge>
                    </div>
                    {isGameOver && (
                      <Button onClick={startGame} variant="destructive">
                        Chơi lại
                      </Button>
                    )}
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="border-4 border-accent rounded-lg w-full"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                  <div className="mt-4 p-4 bg-accent/10 rounded-lg">
                    <p className="text-center text-sm text-muted-foreground">
                      💡 Mẹo: Hoa chỉ tấn công khi bạn đứng yên. Hãy tận dụng!
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AngelArtGame;
