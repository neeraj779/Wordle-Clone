document.addEventListener("DOMContentLoaded", () => {
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
  ]; // prettier-ignore

  const sounds = {
    wrongGuess: new Audio("assets/sounds/wrongGuessSound.mp3"),
    win: new Audio("assets/sounds/winSound.m4a"),
    gameOver: new Audio("assets/sounds/gameOverSound.wav"),
    bgMusic: new Audio(`assets/musics/${getRandomInt(1, 9)}.mp3`),
  };

  const randomIndex = getRandomInt(0, wordList.length);
  let wordle = wordList[randomIndex].toUpperCase();
  let currentRow = 0;
  let currentTile = 0;
  let isGameOver = false;
  let isAnimating = false;
  let guessRows = Array.from({ length: 6 }, () => Array(5).fill(""));
  let isBgMusicStopped = false;

  function initializeGame() {
    showInstructions();
    createGrid();
    createKeyBoard();
  }

  function showInstructions() {
    const dontShowInstructions = localStorage.getItem("dontShowInstructions");
    const dontShowMusic = localStorage.getItem("dontShowMusic");

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
        focusConfirm: false,
        showConfirmButton: true,
        showCancelButton: true,
        cancelButtonText: "Don't show again",
        confirmButtonText: "Start Game!",
        showClass: {
          popup: "animate__animated animate__zoomInUp",
        },
        hideClass: {
          popup: "animate__animated animate__backOutDown",
        },
      }).then((result) => {
        if (result.isDismissed) {
          localStorage.setItem("dontShowInstructions", true);
          if (!dontShowMusic) showMusicSwal();
        }
        if (result.isConfirmed) if (!dontShowMusic) showMusicSwal();
      });
    } else if (!dontShowMusic) showMusicSwal();
  }

  function createGrid() {
    const tileDisplay = document.querySelector(".tile-container");

    guessRows.forEach((guessRow, guessRowIndex) => {
      const rowElem = document.createElement("div");
      rowElem.setAttribute("id", `guessRow-${guessRowIndex}`);
      rowElem.classList.add("guess-row");

      guessRow.forEach((_, guessIndex) => {
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
      ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
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

        if (key === "DEL" || key === "ENTER") keyDiv.classList.add("wide");

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
        case "DEL":
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

      if (wordle === guess) {
        showMessage("Magnificent! You guessed the word!", 1);
        isGameOver = true;
        sounds.bgMusic.pause();
        sounds.win.play();
        return;
      }

      if (currentRow >= 5) {
        showMessage(`Game Over! The word was ${wordle}`, 0);
        isGameOver = true;
        sounds.bgMusic.pause();
        sounds.gameOver.play();
        return;
      }

      setTimeout(() => {
        sounds.bgMusic.volume = 0.5;
        sounds.wrongGuess.play();
      }, 500 * 5);

      currentRow++;
      currentTile = 0;
    }
  }

  function showMessage(message, outcome) {
    const messageDisplay = document.querySelector(".message-container");

    const messageElem = document.createElement("p");
    messageElem.textContent = message;
    messageElem.classList.add("message");
    messageDisplay.appendChild(messageElem);

    let gifImg, title;
    if (outcome === 1) {
      gifImg = "won.gif";
      title = "Yoo Hoo! You Won! 🏆";
    } else {
      gifImg = "lost.gif";
      title = "Oops buddy! You Lost! ☹️";
    }

    setTimeout(() => {
      Swal.fire({
        title: title,
        text: message,
        color: "#ffffff",
        imageUrl: `assets/gifs/${gifImg}`,
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: "image",
        allowOutsideClick: false,
        confirmButtonText: "Play Again!",
      }).then((result) => {
        if (result.isConfirmed) {
          resetGame();
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

  function showMusicSwal() {
    Swal.fire({
      title: "Want to play some music? 🎧",
      text: "Hey there! Want to play some music while you play the game?",
      color: "#ffffff",
      imageUrl: `assets/gifs/music.gif`,
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: "music",
      allowOutsideClick: false,
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Turn on the music!",
      cancelButtonText: "Don't show again",
      denyButtonText: "No, thanks!",
      showClass: {
        popup: "animate__animated animate__bounceInDown",
      },
      hideClass: {
        popup: "animate__animated animate__bounceOutDown",
      },
    }).then((result) => {
      if (result.isConfirmed) sounds.bgMusic.play();
      if (result.isDismissed) localStorage.setItem("dontShowMusic", true);
    });
  }

  function stopSounds() {
    sounds.win.pause();
    sounds.gameOver.pause();
    sounds.win.currentTime = 0;
    sounds.gameOver.currentTime = 0;
  }

  function resetGame() {
    wordle = wordList[getRandomInt(0, wordList.length)].toUpperCase();
    currentRow = 0;
    currentTile = 0;
    isGameOver = false;
    isAnimating = false;
    guessRows = Array.from({ length: 6 }, () => Array(5).fill(""));

    document.querySelector(".tile-container").innerHTML = "";
    document.querySelector(".message-container").innerHTML = "";
    document.querySelector(".keyboard").innerHTML = "";

    stopSounds();
    if (!isBgMusicStopped && sounds.bgMusic.currentTime > 0)
      sounds.bgMusic.play();

    createGrid();
    createKeyBoard();
  }

  function resetSettings() {
    localStorage.removeItem("dontShowInstructions");
    localStorage.removeItem("dontShowMusic");
    Swal.fire({
      icon: "success",
      title: "Settings Reset!",
      text: "Your instructions and music settings have been restored and will be shown next time you play.",
      showConfirmButton: false,
      toast: true,
      position: "top-end",
      timer: 4000,
      timerProgressBar: true,
      background: "#121213",
    });
  }

  document.addEventListener("keydown", (event) => {
    const key = event.key.toUpperCase();
    const allowedKeys = /^[A-Z]$/;
    const specialKeys = ["ENTER", "BACKSPACE"];

    if (allowedKeys.test(key) || specialKeys.includes(key)) {
      handleClick(key);
    } else {
      event.preventDefault();
    }
  });

  const playButton = document.getElementById("play-button");
  const pauseButton = document.getElementById("pause-button");
  const resetButton = document.getElementById("reset-button");

  playButton.addEventListener("click", () => {
    sounds.bgMusic.play();
    isBgMusicStopped = false;
  });

  pauseButton.addEventListener("click", () => {
    sounds.bgMusic.pause();
    isBgMusicStopped = true;
  });

  resetButton.addEventListener("click", () => {
    resetSettings();
  });

  initializeGame();
});
