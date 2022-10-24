const moveAudio = new Audio('./assets/audio/move.mp3');

const createDomNode = (element, ...classNames) => {
    let node = document.createElement(element);
    node.classList.add(...classNames);

    return node;
}

let moves = 0;

const WRAPPER = createDomNode('div', 'wrapper');
document.body.prepend(WRAPPER);

const BOARD = createDomNode('div', 'board');
const controls = createDomNode('div', 'controls');

const timeContainer = createDomNode('span', 'time');
timeContainer.textContent = `Time: 00:00`;

const movesContainer = createDomNode('span', 'moves');
movesContainer.textContent = `Moves: ${moves}`;

const playAudio = createDomNode('button', 'play');

const fieldSizeContainer = createDomNode('div', 'board-size');
const BUTTONS_CONTAINER = createDomNode('div', 'buttons');

const NEW_GAME_BUTTON = createDomNode('button', 'button');
NEW_GAME_BUTTON.textContent = 'New Game';

const SAVE_BUTTON = createDomNode('button', 'button');
SAVE_BUTTON.textContent = 'Save';

const LAST_GAME_BUTTON = createDomNode('button', 'button');
LAST_GAME_BUTTON.textContent = 'Last Game';

// const RESULTS_BUTTON = createDomNode('button', 'button');
// RESULTS_BUTTON.textContent = 'Score';

const popup = createDomNode('div', 'popup');
const overlay = createDomNode('div', 'overlay');

WRAPPER.prepend(BUTTONS_CONTAINER, controls);
controls.append(timeContainer, movesContainer);
WRAPPER.append(playAudio, BOARD, fieldSizeContainer);
BUTTONS_CONTAINER.append(NEW_GAME_BUTTON, SAVE_BUTTON, LAST_GAME_BUTTON);

const renderRadios = () => {
    for (let i = 3; i < 9; i++) {
        const label = createDomNode('label', 'board-size__label');
        label.setAttribute('for', `size-${i}`);
        label.textContent = `${i}x${i}`;
        const input = createDomNode('input', 'board-size__radio');
        input.id = `size-${i}`;
        input.type = 'radio';
        input.name = 'board-size';
        input.value = i;
        if (i === 4) input.checked = true;
        fieldSizeContainer.append(input);
        fieldSizeContainer.append(label);
    }
}

renderRadios();

const initField = () => {
    let matrix = [];
    let counter = 1;

    for (let row = 0; row < CELL_COUNT; row++) {
        matrix.push([]);
        for (let col = 0; col < CELL_COUNT; col++) {
            matrix[row][col] = counter++;
        }
    }

    return matrix;
}

let CELL_COUNT = 4;
let board = initField();
let gameWinField = initField();
let nullCellNumber = CELL_COUNT ** 2;

document.querySelectorAll('input[name="board-size"]').forEach(input => {
    input.addEventListener('change', () => {
        clearTime();
        clearField();
        moves = 0;
        movesContainer.textContent = `Moves: ${moves}`;
        timeContainer.textContent = `Time: 00:00`;

        CELL_COUNT = +input.value;
        nullCellNumber = CELL_COUNT ** 2;
        board = initField();
        gameWinField = initField();
    });
})

const renderField = (matrix) => {
    for (let x = 0; x < matrix.length; x++) {
        for (let y = 0; y < matrix[x].length; y++) {
            const cell = createDomNode('button', 'cell');
            cell.textContent = matrix[x][y];
            BOARD.append(cell);
            setCellStyles(cell, x, y);
        }
    }
}

const setCellStyles = (cell, x, y) => {
    const shift = 100;
    if (+cell.textContent === CELL_COUNT ** 2) cell.style.visibility = 'hidden';
    cell.style.width = `calc(100% /${CELL_COUNT})`;
    cell.style.height = `calc(100%/${CELL_COUNT})`;
    cell.style.transform = `translate(${y * shift}%, ${x * shift}%)`;
}

const shuffleField = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

const getInversions = (array) => {
    let count = 0;

    for (let i = 0; i < array.length - 1; i++) {
        for (let j = i + 1; j < array.length; j++) {
            if (array[i] > array[j]) count++;
        }
    }

    return count;
}

const isBoardSolvable = (array) => {
    const inversions = getInversions(array);
    let sum = 0;
    const nullCellCoords = getCoords(nullCellNumber, getMatrix(array));
    sum = inversions + nullCellCoords.x;

    if (inversions % 2 !== 0 && CELL_COUNT % 2 !== 0) {
        return false;
    } else if (inversions % 2 === 0 && CELL_COUNT % 2 !== 0) {
        return true;
    }

    if (sum % 2 !== 0 && CELL_COUNT % 2 === 0) {
        return true;
    } else if (sum % 2 === 0 && CELL_COUNT % 2 === 0) {
        return false;
    }
}

const getMatrix = (array) => {
    let matrix = [];
    for (let i = 0; i < array.length; i = i + CELL_COUNT) {
        matrix.push(array.slice(i, i + CELL_COUNT));
    }

    return matrix;
}

const clearField = () => {
    while (BOARD.firstChild) {
        BOARD.removeChild(BOARD.firstChild);
    }
}

const getCoords = (number, board) => {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[j][i] === number) {
                return { x: j, y: i };
            }
        }
    }
}

const checkWin = (matrix) => {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (matrix[i][j] !== gameWinField[i][j]) {
                return false;
            }
        }
    }

    return true;
}

const moveCell = (cellNode, coordsCell, coordsNullCell, matrix) => {
    const canMoveVertical = (Math.abs(coordsCell.x - coordsNullCell.x) === 1) && coordsCell.y === coordsNullCell.y;
    const canMoveHorizontal = (Math.abs(coordsCell.y - coordsNullCell.y) === 1) && coordsCell.x === coordsNullCell.x;

    if (canMoveVertical || canMoveHorizontal) {
        if (!playAudio.classList.contains('off')) {
            moveAudio.play();
        }
        matrix[coordsNullCell.x][coordsNullCell.y] = matrix[coordsCell.x][coordsCell.y];
        matrix[coordsCell.x][coordsCell.y] = nullCellNumber;
        setCellStyles(cellNode, coordsNullCell.x, coordsNullCell.y);

        moves++;
        movesContainer.textContent = `Moves: ${moves}`
    }

    if (checkWin(matrix)) {
        clearTime();
        WRAPPER.append(overlay, popup);
        popup.textContent = `Hooray! You solved the puzzle in ${timeContainer.textContent.slice(6)} and ${moves} moves!`;
    }
}

overlay.addEventListener('click', () => {
    WRAPPER.removeChild(overlay);
    WRAPPER.removeChild(popup);
    clearField();
    clearTime();
    timeContainer.textContent = `Time: 00:00`;
    moves = 0;
    movesContainer.textContent = `Moves: ${moves}`
})

const setTime = (seconds) => {
    const date = new Date('0');
    date.setSeconds(seconds);

    return date.toLocaleTimeString('ru', {
        minute: '2-digit', second: '2-digit'
    })
}

let timeout;

const showTime = () => {
    timeContainer.textContent = `Time: ${setTime(time++)}`;
    timeout = setTimeout(showTime, 1000);
}

const clearTime = () => {
    time = 0;
    clearTimeout(timeout);
}

let time = 0;

NEW_GAME_BUTTON.onclick = () => {
    let shuffledField = shuffleField(board.flat());

    while (!isBoardSolvable(shuffledField)) {
        shuffledField = shuffleField(board.flat());
    }

    board = getMatrix(shuffledField);

    clearField();
    renderField(board);
    moves = 0;
    movesContainer.textContent = `Moves: ${moves}`;

    clearTime();
    showTime();
}

BOARD.addEventListener('click', e => {
    if (e.target.classList.contains('cell')) {
        const cellNumber = +e.target.textContent;
        const cellCoords = getCoords(cellNumber, board);
        const nullCellCoords = getCoords(nullCellNumber, board);

        const cellNode = e.target;
        moveCell(cellNode, cellCoords, nullCellCoords, board);
    }
})

function setLocalStorage() {
    let state = {
        moves,
        time: timeContainer.textContent.slice(6),
        board,
        size: CELL_COUNT,
        radio: document.querySelector('input[name="board-size"]:checked').value,
    }

    localStorage.setItem('state', JSON.stringify(state));

    return state;
}

function getLocalStorage() {
    let state = JSON.parse(localStorage.getItem('state'));

    if (state) {
        moves = state.moves;
        movesContainer.textContent = `Moves: ${moves}`;
        board = state.board;
        CELL_COUNT = state.size;
        nullCellNumber = CELL_COUNT ** 2;
        renderField(board);
        document.querySelectorAll('input[name="board-size"]').forEach(input => {
            if (input.value === state.radio) {
                input.checked = true;
            }
        });

        let timeArray = state.time.split(':');
        let savedTime = timeArray[0] * 60 + (+timeArray[1]);
        time = savedTime;

        showTime();
    }
}

LAST_GAME_BUTTON.addEventListener('click', () => {
    clearField();
    clearTime();
    getLocalStorage();
})

SAVE_BUTTON.addEventListener('click', () => {
    setLocalStorage();
})

playAudio.addEventListener('click', () => {
    playAudio.classList.toggle('off');
})