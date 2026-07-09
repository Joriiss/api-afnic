import { useCallback, useEffect, useState, type ReactElement } from 'react';

const ROWS = 9;
const COLS = 9;
const MINES = 10;

type CellState = 'hidden' | 'revealed' | 'flagged';

type Cell = {
  mine: boolean;
  adjacent: number;
  state: CellState;
};

type GameStatus = 'ready' | 'playing' | 'won' | 'lost';

function createEmptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      adjacent: 0,
      state: 'hidden' as CellState,
    })),
  );
}

function placeMines(board: Cell[][], safeRow: number, safeCol: number) {
  let placed = 0;

  while (placed < MINES) {
    const row = Math.floor(Math.random() * ROWS);
    const col = Math.floor(Math.random() * COLS);

    if (board[row][col].mine) {
      continue;
    }

    if (Math.abs(row - safeRow) <= 1 && Math.abs(col - safeCol) <= 1) {
      continue;
    }

    board[row][col].mine = true;
    placed += 1;
  }

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      if (board[row][col].mine) {
        continue;
      }

      let count = 0;
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          if (dr === 0 && dc === 0) {
            continue;
          }

          const nr = row + dr;
          const nc = col + dc;

          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) {
            count += 1;
          }
        }
      }

      board[row][col].adjacent = count;
    }
  }
}

function cloneBoard(board: Cell[][]) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function revealCells(board: Cell[][], row: number, col: number): Cell[][] {
  const next = cloneBoard(board);
  const stack: Array<[number, number]> = [[row, col]];

  while (stack.length > 0) {
    const [currentRow, currentCol] = stack.pop()!;
    const cell = next[currentRow][currentCol];

    if (cell.state !== 'hidden' || cell.mine) {
      continue;
    }

    cell.state = 'revealed';

    if (cell.adjacent === 0) {
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          if (dr === 0 && dc === 0) {
            continue;
          }

          const nr = currentRow + dr;
          const nc = currentCol + dc;

          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            stack.push([nr, nc]);
          }
        }
      }
    }
  }

  return next;
}

function countFlags(board: Cell[][]) {
  return board.flat().filter((cell) => cell.state === 'flagged').length;
}

function checkWin(board: Cell[][]) {
  return board.flat().every((cell) => cell.mine || cell.state === 'revealed');
}

function revealAllMines(board: Cell[][]) {
  const next = cloneBoard(board);

  for (const row of next) {
    for (const cell of row) {
      if (cell.mine) {
        cell.state = 'revealed';
      }
    }
  }

  return next;
}

function formatCounter(value: number) {
  const clamped = Math.max(0, Math.min(999, value));
  return String(clamped).padStart(3, '0');
}

function formatTimer(seconds: number) {
  return formatCounter(seconds);
}

const NUMBER_COLORS = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080'];

export function Win98Minesweeper() {
  const [board, setBoard] = useState<Cell[][]>(createEmptyBoard);
  const [status, setStatus] = useState<GameStatus>('ready');
  const [seconds, setSeconds] = useState(0);
  const [facePressed, setFacePressed] = useState(false);

  const reset = useCallback(() => {
    setBoard(createEmptyBoard());
    setStatus('ready');
    setSeconds(0);
    setFacePressed(false);
  }, []);

  useEffect(() => {
    if (status !== 'playing') {
      return;
    }

    const timer = window.setInterval(() => {
      setSeconds((current) => Math.min(999, current + 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  function handleReveal(row: number, col: number) {
    if (status === 'won' || status === 'lost') {
      return;
    }

    setBoard((current) => {
      const cell = current[row][col];
      if (cell.state === 'flagged' || cell.state === 'revealed') {
        return current;
      }

      let next = current;

      if (status === 'ready') {
        next = createEmptyBoard();
        placeMines(next, row, col);
      }

      if (next[row][col].mine) {
        setStatus('lost');
        return revealAllMines(next);
      }

      const revealed = revealCells(next, row, col);
      if (checkWin(revealed)) {
        setStatus('won');
      } else if (status === 'ready') {
        setStatus('playing');
      }

      return revealed;
    });

    if (status === 'ready') {
      setStatus('playing');
    }
  }

  function handleFlag(row: number, col: number) {
    if (status === 'won' || status === 'lost') {
      return;
    }

    setBoard((current) => {
      const next = cloneBoard(current);
      const cell = next[row][col];

      if (cell.state === 'revealed') {
        return current;
      }

      cell.state = cell.state === 'flagged' ? 'hidden' : 'flagged';
      return next;
    });

    if (status === 'ready') {
      setStatus('playing');
    }
  }

  const flags = countFlags(board);
  const mineCount = MINES - flags;
  const face =
    status === 'won' ? '😎' : status === 'lost' ? '😵' : facePressed ? '😮' : '🙂';

  return (
    <div className="minesweeper">
      <div className="minesweeper-header">
        <span className="minesweeper-counter">{formatCounter(mineCount)}</span>
        <button
          type="button"
          className="minesweeper-face"
          onClick={reset}
          onMouseDown={() => setFacePressed(true)}
          onMouseUp={() => setFacePressed(false)}
          onMouseLeave={() => setFacePressed(false)}
          aria-label="Nouvelle partie"
        >
          {face}
        </button>
        <span className="minesweeper-counter">{formatTimer(seconds)}</span>
      </div>

      <div
        className="minesweeper-grid"
        role="grid"
        aria-label="Grille du démineur"
        onContextMenu={(event) => event.preventDefault()}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            let content: number | ReactElement | null = null;

            if (cell.state === 'flagged') {
              content = <span className="minesweeper-flag" aria-hidden="true" />;
            } else if (cell.state === 'revealed') {
              if (cell.mine) {
                content = <span className="minesweeper-mine" aria-hidden="true" />;
              } else if (cell.adjacent > 0) {
                content = cell.adjacent;
              }
            }

            const isRevealed = cell.state === 'revealed';

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                className={`minesweeper-cell ${isRevealed ? 'minesweeper-cell-revealed' : ''} ${
                  isRevealed && cell.mine ? 'minesweeper-cell-mine' : ''
                }`}
                style={
                  isRevealed && cell.adjacent > 0
                    ? { color: NUMBER_COLORS[cell.adjacent] }
                    : undefined
                }
                onClick={() => handleReveal(rowIndex, colIndex)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  handleFlag(rowIndex, colIndex);
                }}
                aria-label={`Case ${rowIndex + 1}, ${colIndex + 1}`}
              >
                {content}
              </button>
            );
          }),
        )}
      </div>

      <p className="minesweeper-hint">Clic gauche : révéler · Clic droit : drapeau</p>
    </div>
  );
}
