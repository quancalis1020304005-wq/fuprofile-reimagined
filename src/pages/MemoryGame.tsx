import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Heart, Trophy, RotateCcw } from "lucide-react";

const FRUITS = ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍑", "🍒", "🥝"];
const MAX_LIVES = 1;
const LIFE_RESPAWN_DELAY = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const MAX_ROUNDS = 5;
const CARDS_COUNT = 20;

interface CardType {
  id: number;
  fruit: string;
  isFlipped: boolean;
  isMatched: boolean;
  owner?: "player" | "bot";
}

interface GameStats {
  lives: number;
  lastLifeLostTime: number | null;
  playerScore: number;
  botScore: number;
  currentRound: number;
  playerRoundWins: number;
  botRoundWins: number;
}

const MemoryGame = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    lives: MAX_LIVES,
    lastLifeLostTime: null,
    playerScore: 0,
    botScore: 0,
    currentRound: 1,
    playerRoundWins: 0,
    botRoundWins: 0,
  });
  const [isGameActive, setIsGameActive] = useState(false);

  // Load game stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem("memoryGameStats");
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      
      // Check if lives should respawn
      if (stats.lives < MAX_LIVES && stats.lastLifeLostTime) {
        const timePassed = Date.now() - stats.lastLifeLostTime;
        if (timePassed >= LIFE_RESPAWN_DELAY) {
          stats.lives = MAX_LIVES;
          stats.lastLifeLostTime = null;
        }
      }
      
      setGameStats(stats);
    }
  }, []);

  // Save game stats to localStorage
  useEffect(() => {
    localStorage.setItem("memoryGameStats", JSON.stringify(gameStats));
  }, [gameStats]);

  // Initialize game
  const initializeGame = () => {
    if (gameStats.lives <= 0) {
      toast.error("Bạn đã thua — quay lại sau 3 giờ để có lại 1 máu");
      return;
    }

    // Create pairs of cards
    const fruits = FRUITS.slice(0, CARDS_COUNT / 2);
    const cardPairs = [...fruits, ...fruits];
    
    // Shuffle cards
    const shuffled = cardPairs
      .map((fruit, index) => ({
        id: index,
        fruit,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedCards([]);
    setIsPlayerTurn(true);
    setIsGameActive(true);
    
    setGameStats(prev => ({
      ...prev,
      playerScore: 0,
      botScore: 0,
    }));
  };

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (!isGameActive || !isPlayerTurn || isBotThinking) return;
    if (flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Flip the card
    setCards(prev =>
      prev.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setTimeout(() => checkMatch(newFlippedCards, "player"), 1000);
    }
  };

  // Check if two flipped cards match
  const checkMatch = (flipped: number[], player: "player" | "bot") => {
    const [first, second] = flipped.map(id => cards.find(c => c.id === id)!);

    if (first.fruit === second.fruit) {
      // Match found
      setCards(prev =>
        prev.map(c =>
          flipped.includes(c.id) ? { ...c, isMatched: true, owner: player } : c
        )
      );

      if (player === "player") {
        setGameStats(prev => ({ ...prev, playerScore: prev.playerScore + 1 }));
        toast.success("Tìm được cặp! +1 điểm");
      } else {
        setGameStats(prev => ({ ...prev, botScore: prev.botScore + 1 }));
        toast.info("Bot tìm được cặp! Bot +1 điểm");
      }

      setFlippedCards([]);

      // Check if round is complete
      setTimeout(() => {
        const allMatched = cards.every(c => c.isMatched || flipped.includes(c.id));
        if (allMatched) {
          endRound();
        } else {
          // Continue turn for the player who got the match
          if (player === "bot") {
            setTimeout(() => botTurn(), 1000);
          }
        }
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        setCards(prev =>
          prev.map(c => (flipped.includes(c.id) ? { ...c, isFlipped: false } : c))
        );
        setFlippedCards([]);
        
        // Switch turns
        if (player === "player") {
          setIsPlayerTurn(false);
          setTimeout(() => botTurn(), 1000);
        } else {
          setIsPlayerTurn(true);
        }
      }, 1000);
    }
  };

  // Bot's turn
  const botTurn = () => {
    if (!isGameActive) return;
    
    setIsBotThinking(true);

    // Simple bot AI: pick 2 random unmatched, unflipped cards
    const availableCards = cards.filter(c => !c.isMatched && !c.isFlipped);
    
    if (availableCards.length < 2) {
      setIsBotThinking(false);
      setIsPlayerTurn(true);
      return;
    }

    // Normal difficulty: 30% chance to remember and match, 70% random
    const shouldMatch = Math.random() < 0.3;
    let botCards: CardType[] = [];

    if (shouldMatch) {
      // Try to find a matching pair
      for (let i = 0; i < availableCards.length; i++) {
        const match = availableCards.find(
          (c, idx) => idx > i && c.fruit === availableCards[i].fruit
        );
        if (match) {
          botCards = [availableCards[i], match];
          break;
        }
      }
    }

    // If no match found or random mode, pick random cards
    if (botCards.length === 0) {
      botCards = availableCards.sort(() => Math.random() - 0.5).slice(0, 2);
    }

    // Flip first card
    setTimeout(() => {
      setCards(prev =>
        prev.map(c => (c.id === botCards[0].id ? { ...c, isFlipped: true } : c))
      );
      setFlippedCards([botCards[0].id]);

      // Flip second card
      setTimeout(() => {
        setCards(prev =>
          prev.map(c => (c.id === botCards[1].id ? { ...c, isFlipped: true } : c))
        );
        setFlippedCards([botCards[0].id, botCards[1].id]);

        // Check match
        setTimeout(() => {
          checkMatch([botCards[0].id, botCards[1].id], "bot");
          setIsBotThinking(false);
        }, 1000);
      }, 800);
    }, 800);
  };

  // End current round
  const endRound = () => {
    const playerWon = gameStats.playerScore > gameStats.botScore;
    const isTie = gameStats.playerScore === gameStats.botScore;

    if (isTie) {
      toast.info(`Ván ${gameStats.currentRound} hòa! ${gameStats.playerScore} - ${gameStats.botScore}`);
    } else if (playerWon) {
      toast.success(`Bạn thắng ván ${gameStats.currentRound}! ${gameStats.playerScore} - ${gameStats.botScore}`);
      setGameStats(prev => ({
        ...prev,
        playerRoundWins: prev.playerRoundWins + 1,
      }));
    } else {
      toast.error(`Bot thắng ván ${gameStats.currentRound}! ${gameStats.playerScore} - ${gameStats.botScore}`);
      setGameStats(prev => ({
        ...prev,
        botRoundWins: prev.botRoundWins + 1,
        lives: prev.lives - 1,
        lastLifeLostTime: Date.now(),
      }));
    }

    setIsGameActive(false);

    // Check if game series is complete
    if (gameStats.currentRound >= MAX_ROUNDS) {
      setTimeout(() => endGame(), 2000);
    } else {
      setGameStats(prev => ({ ...prev, currentRound: prev.currentRound + 1 }));
    }
  };

  // End game series
  const endGame = () => {
    const finalWinner = gameStats.playerRoundWins > gameStats.botRoundWins ? "player" : "bot";
    
    if (finalWinner === "player") {
      toast.success(`🎉 Chúc mừng! Bạn thắng ${gameStats.playerRoundWins}/${MAX_ROUNDS} ván!`);
    } else {
      toast.error(`Bot thắng series ${gameStats.botRoundWins}/${MAX_ROUNDS} ván!`);
    }

    // Reset for new game series
    setGameStats(prev => ({
      ...prev,
      currentRound: 1,
      playerRoundWins: 0,
      botRoundWins: 0,
    }));
  };

  const resetGame = () => {
    setGameStats({
      lives: MAX_LIVES,
      lastLifeLostTime: null,
      playerScore: 0,
      botScore: 0,
      currentRound: 1,
      playerRoundWins: 0,
      botRoundWins: 0,
    });
    setIsGameActive(false);
    setCards([]);
    toast.success("Game đã được reset!");
  };

  // Calculate time until lives respawn
  const getTimeUntilRespawn = () => {
    if (gameStats.lives >= MAX_LIVES || !gameStats.lastLifeLostTime) return "";
    
    const timePassed = Date.now() - gameStats.lastLifeLostTime;
    const timeRemaining = LIFE_RESPAWN_DELAY - timePassed;
    
    if (timeRemaining <= 0) return "Sẵn sàng!";
    
    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent mb-2">
            Truy tìm Happy CamlyCoin
          </h1>
          <p className="text-muted-foreground">
            Lật hai thẻ trái cây giống nhau để ghi điểm. Thắng bot để giành chiến thắng!
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-500" />
            <div>
              <div className="text-sm text-muted-foreground">Máu</div>
              <div className="text-xl font-bold">{gameStats.lives}/{MAX_LIVES}</div>
              {gameStats.lives < MAX_LIVES && (
                <div className="text-xs text-muted-foreground">{getTimeUntilRespawn()}</div>
              )}
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <div>
              <div className="text-sm text-muted-foreground">Ván hiện tại</div>
              <div className="text-xl font-bold">{gameStats.currentRound}/{MAX_ROUNDS}</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Bạn</div>
            <div className="text-2xl font-bold text-primary">{gameStats.playerScore}</div>
            <div className="text-xs text-muted-foreground">Thắng: {gameStats.playerRoundWins}</div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Bot</div>
            <div className="text-2xl font-bold text-destructive">{gameStats.botScore}</div>
            <div className="text-xs text-muted-foreground">Thắng: {gameStats.botRoundWins}</div>
          </Card>
        </div>

        {/* Turn Indicator */}
        {isGameActive && (
          <div className="text-center mb-4">
            <div className={`inline-block px-6 py-2 rounded-full font-medium ${
              isPlayerTurn && !isBotThinking
                ? "bg-primary text-primary-foreground"
                : "bg-destructive text-destructive-foreground"
            }`}>
              {isBotThinking ? "🤖 Bot đang suy nghĩ..." : isPlayerTurn ? "👤 Lượt của bạn" : "🤖 Lượt của Bot"}
            </div>
          </div>
        )}

        {/* Game Board */}
        {isGameActive ? (
          <div className="grid grid-cols-5 gap-3 mb-6">
            {cards.map((card) => (
              <Card
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square flex items-center justify-center text-4xl cursor-pointer transition-all duration-300 ${
                  card.isFlipped || card.isMatched
                    ? card.owner === "player"
                      ? "bg-primary/20 border-primary"
                      : card.owner === "bot"
                      ? "bg-destructive/20 border-destructive"
                      : "bg-accent/20"
                    : "bg-card hover:bg-accent/10 hover:scale-105"
                } ${!isPlayerTurn || isBotThinking ? "cursor-not-allowed opacity-70" : ""}`}
              >
                {card.isFlipped || card.isMatched ? card.fruit : "🎴"}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍎🍊🍋</div>
            <p className="text-muted-foreground mb-6">
              {cards.length === 0 ? "Nhấn 'Bắt đầu chơi' để bắt đầu ván mới!" : "Ván đã kết thúc. Chơi ván tiếp theo?"}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={initializeGame}
            disabled={gameStats.lives <= 0 || isGameActive}
            size="lg"
            className="min-w-[200px]"
          >
            {isGameActive ? "Đang chơi..." : "Bắt đầu chơi"}
          </Button>
          
          <Button
            onClick={resetGame}
            variant="outline"
            size="lg"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Game
          </Button>
        </div>

        {/* Instructions */}
        <Card className="mt-8 p-6">
          <h3 className="font-bold text-lg mb-3">📖 Hướng dẫn chơi</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Lật hai thẻ có cùng trái cây để ghi 1 điểm</li>
            <li>• Bạn và bot thay phiên nhau chơi</li>
            <li>• Nếu tìm được cặp, bạn được chơi tiếp</li>
            <li>• Bên nào tìm được nhiều cặp hơn sẽ thắng ván</li>
            <li>• Thắng tối đa trong 10 ván để chiến thắng</li>
            <li>• Mất 1 máu mỗi khi thua ván (máu hồi sau 3 giờ)</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default MemoryGame;
