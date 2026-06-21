import { useGame } from '../game/GameContext';
import { useDrag } from '../game/DragContext';
import { canPlacePiece } from '../game/gameLogic';

export function Board() {
  const { board } = useGame();
  const { boardRef, dragState } = useDrag();

  const previewActive = dragState.isDragging && dragState.piece && dragState.hoveredCell;
  const isPlacementValid = previewActive 
    ? canPlacePiece(board, dragState.piece!, dragState.hoveredCell!.row, dragState.hoveredCell!.col)
    : false;

  return (
    <div 
      ref={boardRef}
      className="relative aspect-square w-full max-w-[500px] bg-card/50 rounded-xl p-2 sm:p-3 border border-border shadow-xl mx-auto"
    >
      <div className="grid grid-cols-10 grid-rows-10 gap-1 sm:gap-1.5 h-full w-full">
        {board.map((row, rIndex) => 
          row.map((cell, cIndex) => {
            
            // Check if this cell is part of the preview
            let isPreview = false;
            let previewColor = null;
            let isValid = false;

            if (previewActive && dragState.piece) {
              const pRow = rIndex - dragState.hoveredCell!.row;
              const pCol = cIndex - dragState.hoveredCell!.col;
              
              if (
                pRow >= 0 && pRow < dragState.piece.shape.length &&
                pCol >= 0 && pCol < dragState.piece.shape[0].length &&
                dragState.piece.shape[pRow][pCol] === 1
              ) {
                isPreview = true;
                isValid = isPlacementValid;
                previewColor = isValid ? dragState.piece.color : '#ef4444'; // Red if invalid
              }
            }

            return (
              <div 
                key={`${rIndex}-${cIndex}`}
                className={`rounded-sm transition-all duration-300 ${
                  cell.filled 
                    ? 'shadow-sm animate-pop-in' 
                    : isPreview 
                      ? isValid ? 'opacity-80' : 'opacity-50' 
                      : 'bg-muted/30'
                }`}
                style={{
                  backgroundColor: cell.filled 
                    ? cell.color! 
                    : isPreview ? previewColor! : undefined
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
