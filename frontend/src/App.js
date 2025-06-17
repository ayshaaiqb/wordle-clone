import React, { useEffect, useState } from "react";
import { startGame, makeGuess } from "./api";
import "./styles.css";

function App() {
  const [gameId, setGameId] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [attemptsLeft, setAttemptsLeft] = useState(6);
  const [currentGuess, setCurrentGuess] = useState(["", "", "", "", ""]);
  const [win, setWin] = useState(false);
  const [error, setError] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    startGame().then((data) => {
      setGameId(data.game_id);
    });
  }, []);

  const handleTryAgain = async () => {
    try {
      const data = await startGame();
      setGameId(data.game_id);
      setGuesses([]);
      setAttemptsLeft(6);
      setCurrentGuess(["", "", "", "", ""]);
      setWin(false);
      setError(null);
      setGameOver(false);
    } catch (err) {
      setError("Failed to start a new game. Try again later.");
    }
  };


  const handleGuess = async () => {
    const guessString = currentGuess.join("");
    if (guessString.length !== 5 || currentGuess.includes("")) {
      setError("Guess must be 5 letters.");
      return;
    }

    try {
      const result = await makeGuess(gameId, guessString);
      setGuesses([...guesses, { guess: guessString, result: result.result }]);
      setAttemptsLeft(result.attempts_left);
      setWin(result.win);
      setGameOver(result.win || result.attempts_left === 0);
      setCurrentGuess(["", "", "", "", ""]);
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
          {currentGuess.map((letter, idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              value={letter}
              onChange={(e) => {
                const val = e.target.value.toLowerCase();
                if (/^[a-z]?$/.test(val)) {
                  const newGuess = [...currentGuess];
                  newGuess[idx] = val;
                  setCurrentGuess(newGuess);
                  if (val && idx < 4) {
                    const nextInput = document.getElementById(`letter-${idx + 1}`);
                    if (nextInput) nextInput.focus();
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  if (!currentGuess[idx] && idx > 0) {
                    const prevInput = document.getElementById(`letter-${idx - 1}`);
                    if (prevInput) prevInput.focus();
                  }
                }
              }}
              id={`letter-${idx}`}
              className="letter-box"
              autoComplete="off"
            />
          ))}
          <button onClick={handleGuess}>Guess</button>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {gameOver && (
        <div className="result-message">
          <p>{win ? "🎉 You won!" : "❌ Game over!"}</p>
          <button onClick={handleTryAgain}>Try Again</button>
        </div>
      )}
    </div>
  );
}

export default App;
