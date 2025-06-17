import React, { useEffect, useState } from "react";
import { startGame, makeGuess } from "./api";
import "./styles.css";

function App() {
  const [gameId, setGameId] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [attemptsLeft, setAttemptsLeft] = useState(6);
  const [currentGuess, setCurrentGuess] = useState("");
  const [win, setWin] = useState(false);
  const [error, setError] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    startGame().then((data) => {
      setGameId(data.game_id);
    });
  }, []);

  const handleGuess = async () => {
    if (currentGuess.length !== 5) {
      setError("Guess must be 5 letters.");
      return;
    }

    try {
      const result = await makeGuess(gameId, currentGuess);
      setGuesses([...guesses, { guess: currentGuess, result: result.result }]);
      setAttemptsLeft(result.attempts_left);
      setWin(result.win);
      setGameOver(result.win || result.attempts_left === 0);
      setCurrentGuess("");
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h1>Wordle Clone</h1>
      <p>Attempts left: {attemptsLeft}</p>

      <div className="guesses">
        {guesses.map((g, idx) => (
          <div key={idx} className="guess-row">
            {g.guess.split("").map((char, i) => (
              <span key={i} className={`tile ${g.result[i]}`}>
                {char.toUpperCase()}
              </span>
            ))}
          </div>
        ))}
      </div>

      {!gameOver && (
        <div className="input-section">
          <input
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value.toLowerCase())}
            maxLength={5}
            placeholder="Enter 5-letter word"
          />
          <button onClick={handleGuess}>Guess</button>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {gameOver && (
        <div className="result-message">
          {win ? "🎉 You won!" : "❌ Game over!"}
        </div>
      )}
    </div>
  );
}

export default App;
