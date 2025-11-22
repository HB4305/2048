import { useState, useEffect, useCallback } from "react";
import './App.css';

const App = () => {
  const [board, setBoard] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);

  const [highlightedTiles, setHighlightedTiles] = useState([]);
  // STATE MỚI: Theo dõi vị trí chạm bắt đầu
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  const initializeGame = () => {
    let newBoard = Array(4).fill().map(() => Array(4).fill(0));
    addNewTile(newBoard);
    addNewTile(newBoard);
    setBoard(newBoard);
    setHighlightedTiles([]);
  };

  const addNewTile = (currentBoard) => {
    let emptyTiles = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyTiles.push({ r, c });
      }
    }
    if (emptyTiles.length > 0) {
      let { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
      currentBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
      setHighlightedTiles(prev => [...prev, `${r}-${c}`]);
    }
  };

  const reverse = (matrix) => matrix.map(row => [...row].reverse());
  const transpose = (matrix) => {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  };

  const slideLeft = (board) => {
    let newBoard = [];
    for (let i = 0; i < 4; i++) {
      let row = board[i].filter(num => num !== 0);
      let newRow = [];

      for (let j = 0; j < row.length; j++) {
        if (j < row.length - 1 && row[j] === row[j + 1]) {
          newRow.push(row[j] * 2);
          j++;
        } else {
          newRow.push(row[j]);
        }
      }

      while (newRow.length < 4) {
        newRow.push(0);
      }
      newBoard.push(newRow);
    }
    return newBoard;
  };

  const move = useCallback((direction) => {
    setHighlightedTiles([]);
    setBoard((prevBoard) => {
      let newBoard = JSON.parse(JSON.stringify(prevBoard));
      let changed = false;

      // Biến đổi board về dạng "Slide Left" dựa trên hướng
      if (direction === "RIGHT") {
        newBoard = reverse(newBoard);
      } else if (direction === "UP") {
        newBoard = transpose(newBoard);
      } else if (direction === "DOWN") {
        newBoard = transpose(newBoard);
        newBoard = reverse(newBoard);
      }

      let processedBoard = slideLeft(newBoard);

      if (JSON.stringify(newBoard) !== JSON.stringify(processedBoard)) {
        changed = true;
      }
      newBoard = processedBoard;

      // Trả board về hướng cũ
      if (direction === "RIGHT") {
        newBoard = reverse(newBoard);
      } else if (direction === "UP") {
        newBoard = transpose(newBoard);
      } else if (direction === "DOWN") {
        newBoard = reverse(newBoard);
        newBoard = transpose(newBoard);
      }

      if (changed) {
        addNewTile(newBoard);
        return newBoard;
      }
      return prevBoard;
    });
  }, []);

  const handleKeyDown = useCallback((event) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      const dir = event.key.replace("Arrow", "").toUpperCase();
      move(dir);
    }
  }, [move]);

  // HÀM XỬ LÝ CHẠM (TOUCH HANDLERS)
  const onTouchMove = (e) => {
    e.preventDefault();
  };

  const onTouchEnd = (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    const SWIPE_THRESHOLD = 30;

    if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD) {
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          move("RIGHT");
        } else {
          move("LEFT");
        }
      } else {
        if (dy > 0) {
          move("DOWN");
        } else {
          move("UP");
        }
      }
    }
  };
  // KẾT THÚC HÀM XỬ LÝ CHẠM

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const getTileStyle = (value) => {
    switch (value) {
      case 0: return "bg-[#ffebee]";
      case 2: return "bg-[#f8bbd0] text-[#880e4f]";
      case 4: return "bg-[#f48fb1] text-[#880e4f]";
      case 8: return "bg-[#f06292] text-white";
      case 16: return "bg-[#ec407a] text-white";
      case 32: return "bg-[#e91e63] text-white";
      case 64: return "bg-[#d81b60] text-white";
      case 128: return "bg-[#c2185b] text-white text-3xl";
      case 256: return "bg-[#ad1457] text-white text-3xl";
      case 512: return "bg-[#880e4f] text-white text-3xl";
      case 1024: return "bg-[#6a1b9a] text-white text-2xl";
      case 2048: return "bg-[#4a148c] text-white text-2xl shadow-[0_0_30px_10px_rgba(156,39,176,0.4)]";
      default: return "bg-[#420a32] text-white";
    }
  };

  return (
    <div className="min-h-screen bg-[#fce4ec] flex flex-col items-center justify-center font-sans">
      <div className="w-80 sm:w-96 flex justify-between items-end mb-6">
        <h1 className="text-6xl font-bold text-[#880e4f]">2048</h1>
        <button
          onClick={initializeGame}
          className="bg-[#d81b60] text-white px-4 py-2 rounded font-bold text-lg hover:bg-[#c2185b] transition-colors shadow-lg active:scale-95 transform transition"
        >
          New Game
        </button>
      </div>

      <div
        className="bg-[#e997b6] p-3 rounded-lg w-80 h-80 sm:w-96 sm:h-96 relative shadow-xl"
        // GẮN SỰ KIỆN VUỐT VÀO DIV CHỨA BẢNG GAME
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="grid grid-cols-4 grid-rows-4 gap-3 w-full h-full">
          {board.map((row, rIndex) =>
            row.map((val, cIndex) => {
              const isNew = highlightedTiles.includes(`${rIndex}-${cIndex}`);

              return (
                <div
                  key={`${rIndex}-${cIndex}`}
                  className={`
                    rounded flex justify-center items-center font-bold select-none
                    text-4xl
                    ${getTileStyle(val)}
                    /* Animation classes */
                    transition-all duration-200 ease-in-out
                    ${val !== 0 ? "scale-100" : "scale-100"} 
                    ${isNew ? "animate-pop" : ""}
                  `}
                >
                  {val !== 0 ? val : ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop {
          animation: pop 0.2s ease-in-out backwards;
        }
      `}</style>
    </div>
  );
};

export default App;