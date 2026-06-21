import { GameProvider } from '../game/GameContext';
import { DragProvider } from '../game/DragContext';
import { Board } from '../components/Board';
import { PieceTray } from '../components/PieceTray';
import { ScoreBar } from '../components/ScoreBar';
import { GameOverModal } from '../components/GameOverModal';

export default function Game() {
  return (
    <GameProvider>
      <DragProvider>
        <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden">
          <div className="w-full max-w-[500px] flex-1 flex flex-col justify-center pb-8 sm:pb-12">
            <ScoreBar />
            <Board />
            <PieceTray />
          </div>
          <GameOverModal />
        </div>
      </DragProvider>
    </GameProvider>
  );
}
