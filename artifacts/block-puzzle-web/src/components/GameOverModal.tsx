import { useGame } from '../game/GameContext';
import { Button } from './ui/button';
import { RefreshCcw } from 'lucide-react';

export function GameOverModal() {
  const { isGameOver, score, bestScore, restartGame } = useGame();

  if (!isGameOver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border shadow-2xl rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-pop-in">
        <h2 className="text-3xl font-black mb-2 text-foreground">Game Over</h2>
        <p className="text-muted-foreground mb-8">No more valid moves available.</p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Score</div>
            <div className="text-3xl font-bold text-primary">{score}</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Best</div>
            <div className="text-3xl font-bold text-foreground">{bestScore}</div>
          </div>
        </div>

        <Button 
          size="lg" 
          className="w-full text-lg font-bold h-14"
          onClick={restartGame}
        >
          <RefreshCcw className="w-5 h-5 mr-2" />
          Play Again
        </Button>
      </div>
    </div>
  );
}
