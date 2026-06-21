import { useGame } from '../game/GameContext';
import { DraggablePiece } from './DraggablePiece';

const TRAY_CELL_PX = 22;

export function PieceTray() {
  const { availablePieces } = useGame();

  return (
    <div className="w-full max-w-[500px] mx-auto mt-6 flex justify-around items-center min-h-[100px]">
      {availablePieces.map((piece) => (
        <div key={piece.id} className="flex items-center justify-center p-2">
          <DraggablePiece piece={piece} trayCellPx={TRAY_CELL_PX} />
        </div>
      ))}
    </div>
  );
}
