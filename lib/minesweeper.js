const gameWidth = 20;
const gameHeight = 10;
const gameSize = Math.round((gameWidth * gameHeight) / 5);
const game = document.getElementById("minesweeper");
const newGame = document.getElementById("smiley");
const timer = document.getElementById("time-left");
const mineCounter = document.getElementById("mines-left");
const mines = [];

let gameOver = false;
let cellsLeft = (gameWidth * gameHeight) - gameSize;
let minesLeft = gameSize;
let timeLeft = gameSize * 24;

timer.innerText = timeLeft;
mineCounter.innerText = minesLeft;

const buildRow = () => {
  let html = "<tr>";
  for (let i = 0; i < gameWidth; i += 1) {
    html += '<td class="unopened" data-index="0"></td>';
  }
  html += "</tr>";
  return html;
};

const buildMinesweeper = () => {
  for (let i = 0; i < gameHeight; i += 1) {
    game.insertAdjacentHTML("beforeend", buildRow());
  }
};

buildMinesweeper();

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const goesBoom = (cell) => {
  mines.forEach((mine) => {
    mine.classList.remove("unopened");
    mine.classList.add("opened");
  });
  cell.classList.add("exploded");
  newGame.innerText = "😵‍💫";
  gameOver = true;
};

const victory = () => {
  mines.forEach((mine) => {
    mine.classList.add("flagged");
  });
  minesLeft = 0;
  newGame.innerText = "😎";
  mineCounter.innerText = minesLeft;
};

const flagToggle = (cell) => {
  if (cell.classList.contains("flagged")) {
    minesLeft += 1;
    cell.classList.remove("flagged");
    cell.classList.add("question");
  } else if (cell.classList.contains("question")) {
    cell.classList.remove("question");
  } else {
    cell.classList.add("flagged");
    minesLeft -= 1;
  }
  mineCounter.innerText = minesLeft;
};

const openCell = (cell) => {
  if (cell.classList.contains("flagged") || cell.classList.contains("question") || cell.classList.contains("opened")) {
    return;
  }
  cell.classList.remove("unopened");
  cell.classList.add("opened");
  if (cell.classList.contains("mine")) {
    goesBoom(cell);
  }
  cellsLeft -= 1;
  if (cellsLeft === 0) {
    gameOver = true;
    victory();
  }
};

const buildMines = () => {
  while (mines.length < gameSize) {
    const x = getRandomInt(gameWidth);
    const y = getRandomInt(gameHeight);
    const cell = game.rows[y].cells[x];
    if (!cell.classList.contains("mine")) {
      cell.classList.add("mine");
      mines.push(cell);
    }
  }
};

const countFlags = cell => cell.classList.contains("flagged");

const doSomethingToAdjacent = (cell, doSomething, log = []) => {
  const result = [];
  for (let i = -1; i <= 1; i += 1) {
    for (let j = -1; j <= 1; j += 1) {
      const x = cell.cellIndex + j;
      const y = cell.parentElement.rowIndex + i;
      if (x >= 0 && x < gameWidth && y >= 0 && y < gameHeight && (i !== 0 || j !== 0)) {
        const adjacentCell = game.rows[y].cells[x];
        if (doSomething(adjacentCell, log)) { result.push(adjacentCell); }
      }
    }
  }
  return result;
};

const setIndex = (cell) => {
  if (!cell.classList.contains("mine")) {
    cell.dataset.index = parseInt(cell.dataset.index, 10) + 1;
  }
};

const buildIndices = () => {
  mines.forEach(mine => doSomethingToAdjacent(mine, setIndex));
};

const clearEmpty = (cell, cleared = []) => {
  const x = cell.cellIndex;
  const y = cell.parentElement.rowIndex;
  const adjacentFlags = doSomethingToAdjacent(cell, countFlags).length;
  if (!cleared.includes(cell) && cell.dataset.index <= adjacentFlags && !cell.classList.contains("flagged")) {
    cleared.push(cell);
    doSomethingToAdjacent(cell, openCell);
    doSomethingToAdjacent(cell, clearEmpty, cleared);
  }
};

const timerDecrement = () => {
  if (timeLeft === 1) {
    timeLeft -= 1;
    mines.forEach(mine => goesBoom(mine));
  } else if (!gameOver) {
    timeLeft -= 1;
  }
  timer.innerText = timeLeft;
};

const startTimer = () => {
  const intervalID = setInterval(timerDecrement, 1000);
};

buildMines();
buildIndices();
startTimer();

game.addEventListener("click", (event) => {
  if (!gameOver) {
    openCell(event.target);
  }
});

game.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const cell = event.target;
  if (!gameOver) {
    if (cell.classList.contains("opened")) {
      clearEmpty(cell);
    } else {
      flagToggle(cell);
    }
  }
});

newGame.addEventListener("click", (event) => {
  window.location.reload();
});
