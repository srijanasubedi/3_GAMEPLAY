// Wood piece shapes and colors
const woodPieces = [
    { shape: [[1]], color: 1 },
    { shape: [[1, 1]], color: 2 },
    { shape: [[1], [1]], color: 3 },
    { shape: [[1, 1, 1]], color: 4 },
    { shape: [[1], [1], [1]], color: 5 },
    { shape: [[1, 1], [1, 1]], color: 6 },
    { shape: [[1, 1, 1], [1, 0, 0]], color: 7 },
    { shape: [[1, 1, 1], [0, 0, 1]], color: 8 },
];

let GRID_SIZE = 10;
let DIFFICULTY = 'medium';
let gameBoard = [];
let score = 0;
let level = 1;
let availablePieces = [];
let selectedPiece = null;
let draggedElement = null;

function loadSettings() {
    const savedGridSize = sessionStorage.getItem('gridSize');
    const savedDifficulty = sessionStorage.getItem('difficulty');
    
    GRID_SIZE = savedGridSize ? parseInt(savedGridSize) : 10;
    DIFFICULTY = savedDifficulty || 'medium';
}

function getDifficultyMultiplier() {
    const multipliers = {
        'easy': 1.5,
        'medium': 1.0,
        'hard': 0.5
    };
    return multipliers[DIFFICULTY] || 1.0;
}

function initGame() {
    gameBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    score = 0;
    level = 1;
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    
    generateNewPieces();
    renderBoard();
    renderPieces();
}

function generateNewPieces() {
    availablePieces = [];
    const multiplier = getDifficultyMultiplier();
    const numPieces = Math.max(1, Math.ceil(3 * multiplier));
    
    for (let i = 0; i < numPieces; i++) {
        const randomPiece = woodPieces[Math.floor(Math.random() * woodPieces.length)];
        availablePieces.push({
            ...randomPiece,
            id: Math.random(),
            used: false
        });
    }
}

function renderBoard() {
    const board = document.getElementById('gameBoard');
    const cellSize = GRID_SIZE <= 5 ? 60 : GRID_SIZE <= 8 ? 50 : 50;
    
    board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, ${cellSize}px)`;
    board.style.gridTemplateRows = `repeat(${GRID_SIZE}, ${cellSize}px)`;
    board.innerHTML = '';
    
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = cellSize + 'px';
            cell.style.height = cellSize + 'px';
            
            if (gameBoard[row][col] !== 0) {
                cell.classList.add('filled');
                cell.style.background = getColorByValue(gameBoard[row][col]);
            }
            
            cell.dataset.row = row;
            cell.dataset.col = col;
            board.appendChild(cell);
        }
    }
}

function renderPieces() {
    const container = document.getElementById('piecesContainer');
    container.innerHTML = '';
    
    availablePieces.forEach((piece, index) => {
        if (piece.used) return;
        
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'wood-piece';
        pieceDiv.draggable = true;
        pieceDiv.dataset.index = index;
        
        const maxDim = Math.max(piece.shape.length, piece.shape[0].length);
        const blockSize = 30;
        const gridGap = 3;
        const padding = 8;
        
        pieceDiv.style.gridTemplateColumns = `repeat(${maxDim}, ${blockSize}px)`;
        pieceDiv.style.gridTemplateRows = `repeat(${maxDim}, ${blockSize}px)`;
        pieceDiv.style.gap = gridGap + 'px';
        
        for (let i = 0; i < maxDim; i++) {
            for (let j = 0; j < maxDim; j++) {
                const block = document.createElement('div');
                if (piece.shape[i] && piece.shape[i][j]) {
                    block.className = `wood-block color-${piece.color}`;
                    block.style.width = blockSize + 'px';
                    block.style.height = blockSize + 'px';
                }
                pieceDiv.appendChild(block);
            }
        }
        
        pieceDiv.addEventListener('dragstart', (e) => handleDragStart(e, index));
        pieceDiv.addEventListener('dragend', handleDragEnd);
        container.appendChild(pieceDiv);
    });
}

function handleDragStart(e, pieceIndex) {
    selectedPiece = pieceIndex;
    draggedElement = e.currentTarget;
    draggedElement.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('pieceIndex', pieceIndex);
}

function handleDragEnd(e) {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
    }
    draggedElement = null;
    selectedPiece = null;
}

function getColorByValue(value) {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B4D8'
    ];
    return colors[(value - 1) % colors.length];
}

function setupBoardDropZones() {
    const board = document.getElementById('gameBoard');
    board.addEventListener('dragover', handleDragOver);
    board.addEventListener('drop', handleDrop);
    board.addEventListener('dragleave', handleDragLeave);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
}

function handleDragLeave(e) {
    if (e.currentTarget === e.target) {
        e.currentTarget.style.background = '';
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.style.background = '';
    
    const pieceIndex = parseInt(e.dataTransfer.getData('pieceIndex'));
    if (isNaN(pieceIndex)) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cellSize = GRID_SIZE <= 5 ? 60 : 50;
    const col = Math.floor(x / (cellSize + 4));
    const row = Math.floor(y / (cellSize + 4));
    
    placePiece(pieceIndex, row, col);
}

function placePiece(pieceIndex, startRow, startCol) {
    const piece = availablePieces[pieceIndex];
    const shape = piece.shape;
    const colorValue = piece.color;
    
    if (!canPlacePiece(shape, startRow, startCol)) {
        showMessage('❌ Cannot place piece there!', 'warning');
        return;
    }
    
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j]) {
                gameBoard[startRow + i][startCol + j] = colorValue;
            }
        }
    }
    
    availablePieces[pieceIndex].used = true;
    checkCompletedLines();
    
    renderBoard();
    renderPieces();
    
    if (availablePieces.every(p => p.used)) {
        generateNewPieces();
        renderPieces();
    }
}

function canPlacePiece(shape, startRow, startCol) {
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j]) {
                const row = startRow + i;
                const col = startCol + j;
                
                if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
                    return false;
                }
                if (gameBoard[row][col] !== 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

function checkCompletedLines() {
    let clearedCells = new Set();
    
    // Check rows
    for (let row = 0; row < GRID_SIZE; row++) {
        if (gameBoard[row].every(cell => cell !== 0)) {
            for (let col = 0; col < GRID_SIZE; col++) {
                clearedCells.add(`${row},${col}`);
            }
        }
    }
    
    // Check columns
    for (let col = 0; col < GRID_SIZE; col++) {
        let filled = true;
        for (let row = 0; row < GRID_SIZE; row++) {
            if (gameBoard[row][col] === 0) {
                filled = false;
                break;
            }
        }
        if (filled) {
            for (let row = 0; row < GRID_SIZE; row++) {
                clearedCells.add(`${row},${col}`);
            }
        }
    }
    
    // Check main diagonals
    let mainDiagFilled = true;
    for (let i = 0; i < GRID_SIZE; i++) {
        if (gameBoard[i][i] === 0) {
            mainDiagFilled = false;
            break;
        }
    }
    if (mainDiagFilled) {
        for (let i = 0; i < GRID_SIZE; i++) {
            clearedCells.add(`${i},${i}`);
        }
    }
    
    // Check anti-diagonals
    let antiDiagFilled = true;
    for (let i = 0; i < GRID_SIZE; i++) {
        if (gameBoard[i][GRID_SIZE - 1 - i] === 0) {
            antiDiagFilled = false;
            break;
        }
    }
    if (antiDiagFilled) {
        for (let i = 0; i < GRID_SIZE; i++) {
            clearedCells.add(`${i},${GRID_SIZE - 1 - i}`);
        }
    }
    
    if (clearedCells.size > 0) {
        clearedCells.forEach(cell => {
            const [row, col] = cell.split(',').map(Number);
            gameBoard[row][col] = 0;
        });
        
        const pointsPerCell = 10;
        const points = clearedCells.size * pointsPerCell;
        score += points;
        document.getElementById('score').textContent = score;
        
        showMessage(`🎉 +${points} points! Cleared ${clearedCells.size} cells!`, 'score');
        
        const newLevel = Math.floor(score / 500) + 1;
        if (newLevel > level) {
            level = newLevel;
            document.getElementById('level').textContent = level;
        }
    }
}

function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
    
    setTimeout(() => {
        message.textContent = '';
        message.className = 'message';
    }, 2000);
}

function resetGame() {
    window.location.href = './woodblock-settings.html';
}

window.addEventListener('load', () => {
    loadSettings();
    initGame();
    setupBoardDropZones();
});
