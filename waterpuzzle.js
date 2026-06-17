const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
const colorEmoji = ['🔴', '🟢', '🔵', '🟠', '🟡', '🟣', '⚪', '⚫'];

let tubes = [];
let selectedTube = null;
let moves = 0;
let level = 1;
let gameWon = false;

function initGame() {
    tubes = [];
    selectedTube = null;
    moves = 0;
    gameWon = false;
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    document.getElementById('moves').textContent = moves;
    document.getElementById('level').textContent = level;

    const numTubes = 4 + level;
    const numColors = numTubes - 2;

    // Initialize tubes
    for (let i = 0; i < numTubes; i++) {
        tubes.push([]);
    }

    // Fill tubes with colored water (4 layers each)
    const colorSequence = [];
    for (let i = 0; i < numColors; i++) {
        colorSequence.push(colors[i % colors.length]);
        colorSequence.push(colors[i % colors.length]);
        colorSequence.push(colors[i % colors.length]);
        colorSequence.push(colors[i % colors.length]);
    }

    // Shuffle colors
    for (let i = colorSequence.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [colorSequence[i], colorSequence[j]] = [colorSequence[j], colorSequence[i]];
    }

    // Distribute to tubes
    let index = 0;
    for (let i = 0; i < numColors; i++) {
        for (let j = 0; j < 4; j++) {
            tubes[i].push(colorSequence[index++]);
        }
    }

    renderBoard();
}

function renderBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';

    tubes.forEach((tube, tubeIndex) => {
        const tubeDiv = document.createElement('div');
        tubeDiv.className = `tube ${selectedTube === tubeIndex ? 'selected' : ''}`;
        tubeDiv.onclick = () => handleTubeClick(tubeIndex);

        tube.forEach(color => {
            const drop = document.createElement('div');
            drop.className = 'water-drop';
            drop.style.backgroundColor = color;
            drop.textContent = colorEmoji[colors.indexOf(color)];
            tubeDiv.appendChild(drop);
        });

        // Add empty space
        for (let i = tube.length; i < 4; i++) {
            const emptySpace = document.createElement('div');
            emptySpace.className = 'water-drop';
            emptySpace.style.backgroundColor = 'transparent';
            tubeDiv.appendChild(emptySpace);
        }

        board.appendChild(tubeDiv);
    });
}

function handleTubeClick(tubeIndex) {
    if (gameWon) return;

    if (selectedTube === null) {
        // Select a tube
        if (tubes[tubeIndex].length > 0) {
            selectedTube = tubeIndex;
            renderBoard();
        }
    } else {
        if (selectedTube === tubeIndex) {
            // Deselect
            selectedTube = null;
            renderBoard();
        } else {
            // Try to pour
            if (canPour(selectedTube, tubeIndex)) {
                pour(selectedTube, tubeIndex);
                moves++;
                document.getElementById('moves').textContent = moves;
                selectedTube = null;
                renderBoard();
                checkWin();
            } else {
                selectedTube = tubeIndex;
                renderBoard();
            }
        }
    }
}

function canPour(fromIndex, toIndex) {
    const from = tubes[fromIndex];
    const to = tubes[toIndex];

    if (from.length === 0) return false;
    if (to.length >= 4) return false;

    if (to.length === 0) return true;

    return from[from.length - 1] === to[to.length - 1];
}

function pour(fromIndex, toIndex) {
    const from = tubes[fromIndex];
    const to = tubes[toIndex];

    const color = from[from.length - 1];

    // Pour while colors match and space available
    while (from.length > 0 && to.length < 4 && from[from.length - 1] === color) {
        to.push(from.pop());
    }
}

function checkWin() {
    // Check if all tubes are either empty or contain 4 of same color
    let solved = 0;
    for (let tube of tubes) {
        if (tube.length === 0) {
            solved++;
        } else if (tube.length === 4 && tube.every(color => color === tube[0])) {
            solved++;
        }
    }

    if (solved === tubes.length) {
        gameWon = true;
        const message = document.getElementById('message');
        message.className = 'message win';
        message.textContent = `🎉 Level ${level} Complete! (${moves} moves)`;
        setTimeout(() => {
            level++;
            initGame();
        }, 2000);
    }
}

function resetGame() {
    level = 1;
    moves = 0;
    initGame();
}

initGame();
