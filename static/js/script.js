const tileDisplay = document.querySelector(".tile-container");
const keyBoard = document.querySelector(".key-container");
const messageDisplay = document.querySelector(".message-container");

const wordList = [
  "about", "after", "again", "basic", "break", "cause", "chair", "clean", "comes", "cross",
  "doubt", "early", "earth", "empty", "equal", "faith", "fight", "final", "floor", "force",
  "found", "front", "fruit", "glass", "grant", "green", "guess", "happy", "heard", "horse",
  "house", "human", "ideas", "image", "issue", "learn", "light", "local", "lunch", "maybe",
  "month", "music", "north", "occur", "offer", "often", "peace", "place", "plant", "power",
  "price", "proud", "quiet", "ready", "river", "rough", "round", "scale", "scene", "south",
  "speak", "stage", "start", "story", "study", "teach", "tears", "thank", "think", "those",
  "touch", "train", "trees", "truck", "truth", "visit", "voice", "waste", "watch", "white"
];

const randomIndex = getRandomInt(0, wordList.length);

let wordle = wordList[randomIndex].toUpperCase();
let currentRow = 0;
let currentTile = 0;
let isGameOver = false;

const guessRows = Array.from({ length: 6 }, () =>
  Array.from({ length: 5 }, () => "")
);

function initializeGame() {
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
  if (!isGameOver) {
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

async function checkRow() {
  const guess = guessRows[currentRow].join("");

  if (currentTile > 4) {
    flipTile();

    if (wordle === guess) {
      showMessage("Yeeey! You guessed the word!");
    }

    if (currentRow >= 5) {
      showMessage(`Game Over! The word is ${wordle}`);
    }

    currentRow++;
    currentTile = 0;
  }
}

function showMessage(message) {
  const messageElem = document.createElement("p");
  messageElem.textContent = message;
  messageDisplay.appendChild(messageElem);
}

function flipTile() {
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
