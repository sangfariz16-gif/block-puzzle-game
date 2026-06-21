import { createContext, useContext, useState, ReactNode, useRef, useCallback } from 'react';
import { Piece } from './gameLogic';
import { useGame } from './GameContext';

export interface DragState {
  isDragging: boolean;
  piece: Piece | null;
  cursorX: number;
  cursorY: number;
  hoveredCell: { row: number; col: number } | null;
  boardCellPx: number;
}

interface DragContextType {
  dragState: DragState;
  startDrag: (piece: Piece, e: React.MouseEvent | React.TouchEvent) => void;
  boardRef: React.RefObject<HTMLDivElement | null>;
}

const DragContext = createContext<DragContextType | undefined>(undefined);

const RESET: DragState = {
  isDragging: false,
  piece: null,
  cursorX: 0,
  cursorY: 0,
  hoveredCell: null,
  boardCellPx: 40,
};

function getBoardMetrics(boardEl: HTMLDivElement) {
  const rect = boardEl.getBoundingClientRect();
  const style = window.getComputedStyle(boardEl);
  const pl = parseFloat(style.paddingLeft);
  const pt = parseFloat(style.paddingTop);
  const gridW = rect.width - pl * 2;
  const gridH = rect.height - pt * 2;
  return {
    rect,
    gridLeft: rect.left + pl,
    gridTop: rect.top + pt,
    cellW: gridW / 10,
    cellH: gridH / 10,
  };
}

export function DragProvider({ children }: { children: ReactNode }) {
  const { handlePlacePiece } = useGame();
  const boardRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>(RESET);

  // ref mirrors latest state — event handlers read from here, never close over stale state
  const stateRef = useRef<DragState>(RESET);

  const computeHoveredCell = useCallback(
    (cursorX: number, cursorY: number, piece: Piece) => {
      if (!boardRef.current) return null;
      const { gridLeft, gridTop, cellW, cellH } = getBoardMetrics(boardRef.current);

      // centre the piece bounding-box on the cursor
      const pieceCols = piece.shape[0].length;
      const pieceRows = piece.shape.length;
      const pieceLeft = cursorX - (pieceCols / 2) * cellW;
      const pieceTop  = cursorY - (pieceRows / 2) * cellH;

      const col = Math.floor((pieceLeft - gridLeft) / cellW);
      const row = Math.floor((pieceTop  - gridTop)  / cellH);
      return { row, col };
    },
    [],
  );

  const startDrag = useCallback(
    (piece: Piece, e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const cursorX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cursorY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const boardCellPx = boardRef.current
        ? getBoardMetrics(boardRef.current).cellW
        : 40;

      const initial: DragState = {
        isDragging: true,
        piece,
        cursorX,
        cursorY,
        hoveredCell: computeHoveredCell(cursorX, cursorY, piece),
        boardCellPx,
      };
      stateRef.current = initial;
      setDragState(initial);

      const handleMove = (ev: MouseEvent | TouchEvent) => {
        ev.preventDefault();
        const x = 'touches' in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX;
        const y = 'touches' in ev ? ev.touches[0].clientY : (ev as MouseEvent).clientY;
        const cur = stateRef.current;
        if (!cur.piece) return;
        const next: DragState = {
          ...cur,
          cursorX: x,
          cursorY: y,
          hoveredCell: computeHoveredCell(x, y, cur.piece),
        };
        stateRef.current = next;
        setDragState(next);
      };

      const handleEnd = () => {
        const { hoveredCell, piece: p } = stateRef.current;
        if (hoveredCell && p) {
          handlePlacePiece(p.id, hoveredCell.row, hoveredCell.col);
        }
        stateRef.current = RESET;
        setDragState(RESET);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchend', handleEnd);
      };

      window.addEventListener('mousemove', handleMove, { passive: false });
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchend', handleEnd);
    },
    [computeHoveredCell, handlePlacePiece],
  );

  return (
    <DragContext.Provider value={{ dragState, startDrag, boardRef }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const ctx = useContext(DragContext);
  if (!ctx) throw new Error('useDrag must be used within DragProvider');
  return ctx;
}
