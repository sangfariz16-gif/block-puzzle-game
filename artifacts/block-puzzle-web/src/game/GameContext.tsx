import { ReactNode, createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { BoardState, Piece, generatePieces, createEmptyBoard, placePiece, checkAndClearLines, canPlacePiece, isGameOver as checkGameOver } from './gameLogic';

interface GameState {
  board: BoardState;
  availablePieces: Piece[];
  score: number;
  bestScore: number;
  combo: number;
  isGameOver: boolean;
}

interface GameContextType extends GameState {
  handlePlacePiece: (pieceId: string, row: number, col: number) => boolean;
  restartGame: () => void;
}

const LOCAL_STORAGE_KEY = 'blockpuzzle_web_v1';

const defaultState: GameState = {
  board: createEmptyBoard(),
  availablePieces: generatePieces(3),
  score: 0,
  bestScore: 0,
  combo: 0,
  isGameOver: false,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load game state', e);
    }
    return defaultState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save game state', e);
    }
  }, [state]);

  const handlePlacePiece = useCallback((pieceId: string, row: number, col: number): boolean => {
    setState((prev) => {
      if (prev.isGameOver) return prev;

      const pieceIndex = prev.availablePieces.findIndex((p) => p.id === pieceId);
      if (pieceIndex === -1) return prev;
      
      const piece = prev.availablePieces[pieceIndex];
      
      if (!canPlacePiece(prev.board, piece, row, col)) {
        return prev; // Invalid move
      }

      // Place the piece
      let newBoard = placePiece(prev.board, piece, row, col);
      
      // Calculate basic placement score (1 per block)
      const blocksPlaced = piece.shape.reduce((sum, r) => sum + r.reduce((s, val) => s + val, 0), 0);
      let points = blocksPlaced;

      // Check for clears
      const { newBoard: clearedBoard, linesCleared } = checkAndClearLines(newBoard);
      newBoard = clearedBoard;
      
      let newCombo = prev.combo;
      if (linesCleared > 0) {
        newCombo += 1;
        // +100 per line, +50 per extra line
        const clearPoints = linesCleared * 100 + (linesCleared > 1 ? (linesCleared - 1) * 50 : 0);
        // Combo multiplier: (1 + (combo-1) * 0.5)
        const multiplier = 1 + (newCombo - 1) * 0.5;
        points += Math.floor(clearPoints * multiplier);
      } else {
        newCombo = 0; // Reset combo if no lines cleared
      }

      const newScore = prev.score + points;
      const newBestScore = Math.max(prev.bestScore, newScore);

      // Remove piece from tray
      let newAvailablePieces = [...prev.availablePieces];
      newAvailablePieces.splice(pieceIndex, 1);

      // Generate new pieces if tray is empty
      if (newAvailablePieces.length === 0) {
        newAvailablePieces = generatePieces(3);
      }

      // Check game over
      const isOver = checkGameOver(newBoard, newAvailablePieces);

      return {
        board: newBoard,
        availablePieces: newAvailablePieces,
        score: newScore,
        bestScore: newBestScore,
        combo: newCombo,
        isGameOver: isOver,
      };
    });

    return true; // Move was valid and executed
  }, []);

  const restartGame = useCallback(() => {
    setState((prev) => ({
      board: createEmptyBoard(),
      availablePieces: generatePieces(3),
      score: 0,
      bestScore: prev.bestScore,
      combo: 0,
      isGameOver: false,
    }));
  }, []);

  const value = useMemo(() => ({
    ...state,
    handlePlacePiece,
    restartGame
  }), [state, handlePlacePiece, restartGame]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
