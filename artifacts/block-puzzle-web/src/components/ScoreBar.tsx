import { useGame } from '../game/GameContext';
import { Trophy, Star, Zap } from 'lucide-react';

export function ScoreBar() {
  const { score, bestScore, combo } = useGame();

  return (
    <div className="w-full max-w-[500px] mx-auto mb-6 flex items-center justify-between">
      <div className="flex flex-col">
        <div className="flex items-center text-muted-foreground text-sm font-medium mb-1">
          <Star className="w-4 h-4 mr-1" /> Score
        </div>
        <div className="text-3xl font-bold text-foreground">{score}</div>
      </div>
      
      {combo > 1 && (
        <div className="flex flex-col items-center animate-pop-in">
          <div className="flex items-center text-chart-5 text-sm font-bold mb-1">
            <Zap className="w-4 h-4 mr-1 fill-chart-5" /> Combo
          </div>
          <div className="text-2xl font-black text-chart-5">{combo}x</div>
        </div>
      )}

      <div className="flex flex-col items-end">
        <div className="flex items-center text-muted-foreground text-sm font-medium mb-1">
          <Trophy className="w-4 h-4 mr-1" /> Best
        </div>
        <div className="text-xl font-bold text-foreground/80">{bestScore}</div>
      </div>
    </div>
  );
}
