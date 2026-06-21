export type Cell = { filled: boolean; color: string | null };
export type BoardState = Cell[][];
export type Piece = { id: string; shape: number[][]; color: string };

const BOARD_SIZE = 10;

const COLORS = [
  '#FF6B9D', // Pink
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96E6A1', // Light Green
  '#FFD166', // Yellow
  '#9B72CF', // Purple
  '#FF8C42', // Orange
  '#5FB8FF'  // Light Blue
];

const SHAPES = [
  // 1x1
  [[1]],
  // 1x2 H, 2x1 V
  [[1,1]], [[1],[1]],
  // 1x3 H, 3x1 V
  [[1,1,1]], [[1],[1],[1]],
  // 1x4 H, 4x1 V
  [[1,1,1,1]], [[1],[1],[1],[1]],
  // 1x5 H, 5x1 V
  [[1,1,1,1,1]], [[1],[1],[1],[1],[1]],
  // 2x2, 3x3
  [[1,1],[1,1]], [[1,1,1],[1,1,1],[1,1,1]],
  // L shapes
  [[1,0],[1,0],[1,1]], [[1,1],[1,0],[1,0]], [[0,1],[0,1],[1,1]], [[1,1],[0,1],[0,1]],
  [[1,0,0],[1,0,0],[1,1,1]], [[1,1,1],[1,0,0],[1,0,0]], [[1,1,1],[0,0,1],[0,0,1]], [[0,0,1],[0,0,1],[1,1,1]],
  // S/Z
  [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]], [[1,0],[1,1],[0,1]], [[0,1],[1,1],[1,0]],
  // T
  [[1,1,1],[0,1,0]], [[0,1,0],[1,1,1]], [[1,0],[1,1],[1,0]], [[0,1],[1,1],[0,1]],
  // 2x3 / 3x2
  [[1,1,1],[1,1,1]], [[1,1],[1,1],[1,1]],
  // Small corners
  [[1,1],[1,0]], [[1,1],[0,1]], [[1,0],[1,1]], [[0,1],[1,1]],
  // 3x3 corners
  [[1,1,1],[1,0,0],[1,0,0]], [[1,1,1],[0,0,1],[0,0,1]], [[1,0,0],[1,0,0],[1,1,1]], [[0,0,1],[0,0,1],[1,1,1]],
];

export function createEmptyBoard(): BoardState {
  return Array(BOARD_SIZE).fill(null).map(() => 
    Array(BOARD_SIZE).fill(null).map(() => ({ filled: false, color: null }))
  );
}

export function generatePieces(count: number): Piece[] {
  return Array(count).fill(null).map(() => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    return { id, shape, color };
  });
}

export function canPlacePiece(board: BoardState, piece: Piece, startRow: number, startCol: number): boolean {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const boardR = startRow + r;
        const boardC = startCol + c;
        if (
          boardR < 0 || boardR >= BOARD_SIZE ||
          boardC < 0 || boardC >= BOARD_SIZE ||
          board[boardR][boardC].filled
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

export function placePiece(board: BoardState, piece: Piece, startRow: number, startCol: number): BoardState {
  const newBoard = board.map(row => [...row.map(cell => ({ ...cell }))]);
  
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        newBoard[startRow + r][startCol + c] = { filled: true, color: piece.color };
      }
    }
  }
  
  return newBoard;
}

export function checkAndClearLines(board: BoardState): { newBoard: BoardState, linesCleared: number } {
  const newBoard = board.map(row => [...row.map(cell => ({ ...cell }))]);
  let linesCleared = 0;
  
  const rowsToClear: number[] = [];
  const colsToClear: number[] = [];

  // Check rows
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (newBoard[r].every(cell => cell.filled)) {
      rowsToClear.push(r);
    }
  }

  // Check columns
  for (let c = 0; c < BOARD_SIZE; c++) {
    let colFilled = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (!newBoard[r][c].filled) {
        colFilled = false;
        break;
      }
    }
    if (colFilled) {
      colsToClear.push(c);
    }
  }

  // Clear
  rowsToClear.forEach(r => {
    for (let c = 0; c < BOARD_SIZE; c++) {
      newBoard[r][c] = { filled: false, color: null };
    }
  });

  colsToClear.forEach(c => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      newBoard[r][c] = { filled: false, color: null };
    }
  });

  linesCleared = rowsToClear.length + colsToClear.length;

  return { newBoard, linesCleared };
}

export function isGameOver(board: BoardState, availablePieces: Piece[]): boolean {
  for (const piece of availablePieces) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlacePiece(board, piece, r, c)) {
          return false; // Can still play
        }
      }
    }
  }
  return true; // No available pieces can fit anywhere
}
