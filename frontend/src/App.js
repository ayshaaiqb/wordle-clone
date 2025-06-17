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
      setCurrentGuess("");
      setWin(false);
      setError(null);
      setGameOver(false);
    } catch (err) {
      setError("Failed to start a new game. Try again later.");
    }
  };


  const handleGuess = async (guess) => {
    if (guess.length !== 5 || guess.includes("")) {
      setError("Guess must be 5 letters.");
      return;
    }

    try {
      const result = await makeGuess(gameId, guess);
      setGuesses([...guesses, { guess, result: result.result }]);
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
                if (/^[a-z]?$/.test(val)) { // allow only letters or empty
                  const newGuess = [...currentGuess];
                  newGuess[idx] = val;
                  setCurrentGuess(newGuess);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !currentGuess[idx] && idx > 0) {
                  // Move focus back on backspace if box empty
                  const prevInput = document.getElementById(`letter-${idx - 1}`);
                  if (prevInput) prevInput.focus();
                }
                else if (e.key >= "a" && e.key <= "z" && idx < 4) {
                  // Move focus forward on letter input
                  const nextInput = document.getElementById(`letter-${idx + 1}`);
                  if (nextInput) nextInput.focus();
                }
              }}
              id={`letter-${idx}`}
              className="letter-box"
            />
          ))}
          <button onClick={() => handleGuess(currentGuess.join(""))}>Guess</button>
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
