from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import uuid
import nltk
nltk.download('words')
from nltk.corpus import words

five_letter_words = [word.lower() for word in words.words() if len(word) == 5 and word.isalpha()]

app = FastAPI()

# ✅ CORS config for your React frontend hosted on GitHub Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ayshaaiqb.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🎮 In-memory store of game state
games = {}

# 📦 Pydantic models for API schema
class StartResponse(BaseModel):
    game_id: str

class GuessRequest(BaseModel):
    game_id: str
    guess: str

class GuessResponse(BaseModel):
    result: list[str]
    win: bool
    attempts_left: int

# 🟢 API: Start a new game
@app.post("/start", response_model=StartResponse)
def start_game():
    game_id = str(uuid.uuid4())
    secret_word = random.choice(five_letter_words)
    games[game_id] = {
        "secret": secret_word,
        "guesses": [],
        "max_attempts": 6
    }
    return StartResponse(game_id=game_id)

# 🟡 Compare guess with target word
def check_guess(secret: str, guess: str):
    result = []
    secret_letters = list(secret)
    guess_letters = list(guess)

    # First pass: green
    for i in range(len(guess_letters)):
        if guess_letters[i] == secret_letters[i]:
            result.append("green")
            secret_letters[i] = None
        else:
            result.append(None)

    # Second pass: yellow / gray
    for i in range(len(guess_letters)):
        if result[i] is None:
            if guess_letters[i] in secret_letters:
                result[i] = "yellow"
                secret_letters[secret_letters.index(guess_letters[i])] = None
            else:
                result[i] = "gray"
    return result

# 🟠 API: Make a guess
@app.post("/guess", response_model=GuessResponse)
def guess_word(req: GuessRequest):
    game = games.get(req.game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    if len(req.guess) != len(game["secret"]):
        raise HTTPException(status_code=400, detail="Guess length mismatch")
    if len(game["guesses"]) >= game["max_attempts"]:
        raise HTTPException(status_code=400, detail="No attempts left")

    guess = req.guess.lower()
    result = check_guess(game["secret"], guess)
    game["guesses"].append({"guess": guess, "result": result})

    win = all(r == "green" for r in result)
    attempts_left = game["max_attempts"] - len(game["guesses"])
    return GuessResponse(result=result, win=win, attempts_left=attempts_left)

# 🔵 API: Get current game status
@app.get("/status/{game_id}")
def status(game_id: str):
    game = games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return {
        "guesses": game["guesses"],
        "attempts_left": game["max_attempts"] - len(game["guesses"]),
        "finished": len(game["guesses"]) >= game["max_attempts"] or
                    any(all(r == "green" for r in g["result"]) for g in game["guesses"])
    }

# 🔙 Optional root route
@app.get("/")
def root():
    return {"message": "Wordle API is running!"}
