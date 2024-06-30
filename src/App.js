import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

const FactorsAndMultiplesGame = () => {
  const [numbers, setNumbers] = useState(Array.from({ length: 100 }, (_, i) => ({
    value: i + 1,
    crossed: false
  })));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [invalidMove, setInvalidMove] = useState(null);
  const [gameMode, setGameMode] = useState('pvp'); // 'pvp' or 'ai'
  const [isAIThinking, setIsAIThinking] = useState(false);

  const isValidMove = (num, lastMove) => {
    if (!lastMove) {
      return num % 2 === 0 && num <= 50;
    }
    return lastMove % num === 0 || num % lastMove === 0;
  };

  const getValidMoves = (nums, lastMove) => {
    return nums.filter(n => !n.crossed && isValidMove(n.value, lastMove));
  };

  const makeMove = (num) => {
    setNumbers(numbers.map(n => n.value === num ? { ...n, crossed: true } : n));
    setMoveHistory([...moveHistory, num]);
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  const handleNumberClick = (num) => {
    if (gameOver || (gameMode === 'ai' && currentPlayer === 2)) return;

    if (!isValidMove(num, moveHistory[moveHistory.length - 1])) {
      setInvalidMove(num);
      setTimeout(() => setInvalidMove(null), 2000);
      return;
    }

    makeMove(num);
  };

  const countOpponentMoves = (nums, move) => {
    const newNums = nums.map(n => n.value === move ? { ...n, crossed: true } : n);
    return getValidMoves(newNums, move).length;
  };

  const findBestMove = () => {
    const validMoves = getValidMoves(numbers, moveHistory[moveHistory.length - 1]);
    let bestMoves = [];
    let leastOpponentMoves = Infinity;

    for (let move of validMoves) {
      const opponentMoves = countOpponentMoves(numbers, move.value);
      if (opponentMoves < leastOpponentMoves) {
        leastOpponentMoves = opponentMoves;
        bestMoves = [move.value];
      } else if (opponentMoves === leastOpponentMoves) {
        bestMoves.push(move.value);
      }
    }

    if (bestMoves.length > 1) {
      let bestMoveValues = [];
      let maxAIOptions = -Infinity;
  
      for (let move of bestMoves) {
        let minAIOptions = Infinity;
        
        // Simulate opponent's best moves
        const opponentValidMoves = getValidMoves(
          numbers.map(n => n.value === move ? { ...n, crossed: true } : n),
          move
        );
  
        for (let opponentMove of opponentValidMoves) {
          // Count AI's options after opponent's best move
          const aiOptions = countOpponentMoves(
            numbers.map(n => (n.value === move || n.value === opponentMove.value) ? { ...n, crossed: true } : n),
            opponentMove.value
          );
          minAIOptions = Math.min(minAIOptions, aiOptions);
        }
  
        // Update best moves if this move is better
        if (minAIOptions > maxAIOptions) {
          maxAIOptions = minAIOptions;
          bestMoveValues = [move];
        } else if (minAIOptions === maxAIOptions) {
          bestMoveValues.push(move);
        }
      }
  
      // Randomly select from the best moves
      return bestMoveValues[Math.floor(Math.random() * bestMoveValues.length)];
    }
  
    // If there's only one best move, return it
    return bestMoves[0];
  };
  const handleAIMove = () => {
    setIsAIThinking(true);
    setTimeout(() => {
      const bestMove = findBestMove();
      if (bestMove) {
        makeMove(bestMove);
      }
      setIsAIThinking(false);
    }, 1000); // Simulate AI "thinking" for 1 second
  };

  useEffect(() => {
    const validMoves = getValidMoves(numbers, moveHistory[moveHistory.length - 1]);
    if (validMoves.length === 0 && moveHistory.length > 0) {
      setGameOver(true);
      setWinner(currentPlayer === 1 ? 2 : 1);
    } else if (gameMode === 'ai' && currentPlayer === 2 && !gameOver) {
      handleAIMove();
    }
  }, [numbers, currentPlayer, moveHistory, gameMode]);

  const resetGame = () => {
    setNumbers(Array.from({ length: 100 }, (_, i) => ({ value: i + 1, crossed: false })));
    setCurrentPlayer(1);
    setMoveHistory([]);
    setGameOver(false);
    setWinner(null);
    setInvalidMove(null);
    setIsAIThinking(false);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Factors and Multiples Game</h1>
      
      <div className="mb-4">
        <Select value={gameMode} onValueChange={value => { setGameMode(value); resetGame(); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select game mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pvp">Player vs Player</SelectItem>
            <SelectItem value="ai">Player vs AI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Move History</h2>
        <div className="grid grid-cols-10 gap-2 mb-4">
          {moveHistory.map((move, index) => (
            <Button
              key={index}
              disabled
              className={`w-12 h-12 ${
                index % 2 === 0 ? 'bg-blue-300' : 'bg-red-300'
              } ${
                index === moveHistory.length - 1 ? 'ring-2 ring-yellow-500' : ''
              }`}
            >
              {move}
            </Button>
          ))}
        </div>
        
        <p className="text-lg">Current Player: {currentPlayer} {isAIThinking ? '(AI is thinking...)' : ''}</p>
        {invalidMove && (
          <Alert variant="destructive" className="mt-2">
            <AlertTitle>Invalid Move</AlertTitle>
            <AlertDescription>
              {moveHistory.length === 0
                ? `Player 1 must choose an even number less than or equal to 50.` 
                : `Player ${currentPlayer} must choose a factor or multiple of ${moveHistory[moveHistory.length - 1]}.`}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-10 gap-2 mb-4">
        {numbers.map(({ value, crossed }) => (
          <Button
            key={value}
            onClick={() => handleNumberClick(value)}
            disabled={gameOver || crossed || (gameMode === 'ai' && currentPlayer === 2) || isAIThinking}
            className={`w-12 h-12 ${
              crossed 
                ? 'bg-gray-300 line-through text-gray-500'
                : value === moveHistory[moveHistory.length - 1]
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {value}
          </Button>
        ))}
      </div>

      {gameOver && (
        <Alert className="mt-4">
          <AlertTitle>Game Over!</AlertTitle>
          <AlertDescription>
            {winner === 1 ? 'Player 1' : (gameMode === 'ai' ? 'AI' : 'Player 2')} wins!
          </AlertDescription>
        </Alert>
      )}

      <Button onClick={resetGame} className="mt-4">
        Reset Game
      </Button>
    </div>
  );
};

export default FactorsAndMultiplesGame;