import { Piece } from '../game/gameLogic';
import { useDrag } from '../game/DragContext';

interface DraggablePieceProps {
  piece: Piece;
  trayCellPx: number;
}

export function DraggablePiece({ piece, trayCellPx }: DraggablePieceProps) {
  const { startDrag, dragState } = useDrag();
  const isDragging = dragState.isDragging && dragState.piece?.id === piece.id;

  const renderCells = (cellPx: number, opacity = 1) => (
    <div className="flex flex-col" style={{ gap: 2, opacity }}>
      {piece.shape.map((row, rIdx) => (
        <div key={rIdx} className="flex" style={{ gap: 2 }}>
          {row.map((cell, cIdx) => (
            <div
              key={cIdx}
              style={{
                width: cellPx,
                height: cellPx,
                borderRadius: 4,
                backgroundColor: cell ? piece.color : 'transparent',
                boxShadow: cell ? `0 2px 6px ${piece.color}55` : 'none',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Tray display — uses trayCellPx */}
      <div
        className={`cursor-grab select-none touch-none transition-transform
          ${isDragging ? 'opacity-30 scale-90' : 'hover:scale-110 active:scale-95'}`}
        onMouseDown={(e) => startDrag(piece, e)}
        onTouchStart={(e) => startDrag(piece, e)}
      >
        {renderCells(trayCellPx)}
      </div>

      {/* Floating ghost — uses board cell size, centered on cursor */}
      {isDragging && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: dragState.cursorX,
            top: dragState.cursorY,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {renderCells(dragState.boardCellPx, 0.85)}
        </div>
      )}
    </>
  );
}
