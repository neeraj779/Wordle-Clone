const tileDisplay = document.querySelector(".tile-container");
const keyBoard = document.querySelector(".key-container");
const messageDisplay = document.querySelector(".message-container");

const wordList = [
  "about", "after", "again", "basic", "break", "cause", "chair", "clean",
  "comes", "cross", "doubt", "early", "earth", "empty", "equal", "faith",
  "fight", "final", "floor", "force", "found", "front", "fruit", "glass",
  "grant", "green", "guess", "happy", "heard", "horse", "house", "human",
  "ideas", "image", "issue", "learn", "light", "local", "lunch", "maybe",
  "month", "music", "north", "occur", "offer", "often", "peace", "place",
  "plant", "power", "price", "proud", "quiet", "ready", "river", "rough",
  "round", "scale", "scene", "south", "speak", "stage", "start", "story",
  "study", "teach", "tears", "thank", "think", "those", "touch", "train",
  "trees", "truck", "truth", "visit", "voice", "waste", "watch", "white"
]; 

const wrongGuessSound = new Audio("assets/sounds/wrongGuessSound.mp3");
const winSound = new Audio("assets/sounds/winSound.mp3");
const gameOverSound = new Audio("assets/sounds/gameOverSound.wav");

const randomIndex = getRandomInt(0, wordList.length);

let wordle = wordList[randomIndex].toUpperCase();
let currentRow = 0;
let currentTile = 0;
let isGameOver = false;
let isAnimating = false;

const guessRows = Array.from({ length: 6 }, () =>
  Array.from({ length: 5 }, () => "")
);

function initializeGame() {
  let dontShowInstructions = localStorage.getItem("dontShowInstructions");
  if (!dontShowInstructions) {
    Swal.fire({
      title: "<strong>How To Play</strong>",
      html: `
        <div class="instruction-card">
        <p>Guess the Wordle in 6 tries.</p>
          <p>Each guess must be a valid 5-letter word.</p>
          <p>The color of the tiles will change to show how close your guess was to the word.</p>
          <ul>
              <li>A green square means the letter is correct and in the right position.</li>
              <li>A yellow square means the letter is correct but in the wrong position.</li>
              <li>A gray square means the letter is not in the word.</li>
          </ul>
          <p>Your goal is to guess the word in as few tries as possible.</p>
          <p>Good luck and have fun!</p>
        </div>
      `,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: "Play!",
      cancelButtonText: "Don't show again",
    }).then((result) => {
      if (result.dismiss) {
        localStorage.setItem("dontShowInstructions", true);
      }
    });
  }

  createGrid();
  createKeyBoard();
}

function createGrid() {
  guessRows.forEach((guessRow, guessRowIndex) => {
    const rowElem = document.createElement("div");
    rowElem.setAttribute("id", `guessRow-${guessRowIndex}`);
    rowElem.classList.add("guess-row");

    guessRow.forEach((guess, guessIndex) => {
      const tileElem = document.createElement("div");
      tileElem.setAttribute(
        "id",
        `guessRow-${guessRowIndex}-tile-${guessIndex}`
      );
      tileElem.classList.add("tile");
      rowElem.appendChild(tileElem);
    });

    tileDisplay.appendChild(rowElem);
  });
}

function createKeyBoard() {
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "<<"],
  ];

  const keyboardContainer = document.querySelector(".keyboard");

  rows.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");

    row.forEach((key) => {
      const keyDiv = document.createElement("div");
      keyDiv.classList.add("key");
      keyDiv.textContent = key;
      keyDiv.setAttribute("id", key);
      keyDiv.addEventListener("click", () => handleClick(key));

      if (key === "Backspace" || key === "Enter") {
        keyDiv.classList.add("wide");
      } else if (key === "Space") {
        keyDiv.classList.add("space");
      }

      rowDiv.appendChild(keyDiv);
    });

    keyboardContainer.appendChild(rowDiv);
  });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function handleClick(key) {
  if (!isGameOver && !isAnimating) {
    switch (key) {
      case "<<":
        deleteLetter();
        break;
      case "BACKSPACE":
        deleteLetter();
        break;
      case "ENTER":
        checkRow();
        break;
      default:
        addLetter(key);
        break;
    }
  }
}

function addLetter(letter) {
  if (currentRow < 6 && currentTile < 5) {
    const tile = document.getElementById(
      `guessRow-${currentRow}-tile-${currentTile}`
    );
    tile.textContent = letter;
    guessRows[currentRow][currentTile] = letter;
    tile.setAttribute("data", letter);
    currentTile++;
  }
}

function deleteLetter() {
  if (currentTile > 0) {
    currentTile--;
    const tile = document.getElementById(
      `guessRow-${currentRow}-tile-${currentTile}`
    );
    tile.textContent = "";
    guessRows[currentRow][currentTile] = "";
    tile.setAttribute("data", "");
  }
}

function checkRow() {
  const guess = guessRows[currentRow].join("");

  if (currentTile > 4) {
    flipTile();

    if (wordle === guess && currentRow < 5) {
      showMessage("Magnificent! You guessed the word!", 1);
      isGameOver = true;
      winSound.play();
      return;
    } else if (wordle === guess) {
      showMessage("Great job! You guessed the word!", 1);
      isGameOver = true;
      winSound.play();
      return;
    }

    if (currentRow >= 5) {
      showMessage(`Game Over! The word was ${wordle}`, 0);
      isGameOver = true;
      gameOverSound.play();
      return;
    }

    setTimeout(() => {
      wrongGuessSound.play();
    }, 500 * 5);

    currentRow++;
    currentTile = 0;
  }
}

function showMessage(message, outcome) {
  const messageElem = document.createElement("p");
  messageElem.textContent = message;
  messageElem.classList.add("message");
  messageDisplay.appendChild(messageElem);

  if (outcome === 1) {
    gifImg = "won.gif";
    title = "Yoo Hoo! You Won! 🏆";
  } else {
    gifImg = "lost.gif";
    title = "Opps buddy! You Lost! ☹️";
  }

  setTimeout(() => {
    Swal.fire({
      title: title,
      text: message,
      color: "#ffffff",
      imageUrl: `assets/gifs/${gifImg}`,
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: "Custom image",
      allowOutsideClick: false,
      confirmButtonText: "Play Again!",
    }).then((result) => {
      if (result.isConfirmed) {
        location.reload();
      }
    });
  }, 4000);
}

function flipTile() {
  isAnimating = true;
  const rowTiles = Array.from(
    document.querySelector(`#guessRow-${currentRow}`).childNodes
  );
  let checkWordle = wordle;
  const guess = [];

  rowTiles.forEach((tile) => {
    guess.push({ letter: tile.getAttribute("data"), color: "grey" });
  });

  guess.forEach((guess, index) => {
    if (guess.letter === wordle[index]) {
      guess.color = "green";
      checkWordle = checkWordle.replace(guess.letter, "");
    }
  });

  guess.forEach((guess) => {
    if (checkWordle.includes(guess.letter)) {
      guess.color = "yellow";
      checkWordle = checkWordle.replace(guess.letter, "");
    }
  });

  rowTiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("flip");
      tile.classList.add(guess[index].color);
      addColorToKey(guess[index].letter, guess[index].color);
      if (index === rowTiles.length - 1) {
        isAnimating = false;
      }
    }, 500 * index);
  });
}

function addColorToKey(keyLetter, color) {
  const key = document.getElementById(keyLetter);
  key.classList.add(color);
}

document.addEventListener("keydown", function (event) {
  const key = event.key.toUpperCase();
  const allowedKeys = /^[A-Z]$/;

  if (key.match(allowedKeys) || key === "ENTER" || key === "BACKSPACE") {
    handleClick(key);
  } else {
    event.preventDefault();
  }
});

initializeGame();
