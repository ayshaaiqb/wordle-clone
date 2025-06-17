
const API_BASE_URL = "https://wordle-clone-tgqi.onrender.com";

export async function startGame() {
  const response = await fetch(`${API_BASE_URL}/start`, { method: "POST" });
  return response.json();
}

export async function makeGuess(gameId, guess) {
  const response = await fetch(`${API_BASE_URL}/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_id: gameId, guess }),
  });
  return response.json();
}

export async function getStatus(gameId) {
  const response = await fetch(`${API_BASE_URL}/status/${gameId}`);
  return response.json();
}
