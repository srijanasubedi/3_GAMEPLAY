// Wood piece shapes and colors
const woodPieces = [
    { shape: [[1]], color: 1 }, // 1x1
    { shape: [[1, 1]], color: 2 }, // 1x2
    { shape: [[1], [1]], color: 3 }, // 2x1
    { shape: [[1, 1, 1]], color: 4 }, // 1x3
    { shape: [[1], [1], [1]], color: 5 }, // 3x1
    { shape: [[1, 1], [1, 1]], color: 6 }, // 2x2
    { shape: [[1, 1, 1], [1, 0, 0]], color: 7 }, // L-shape
    { shape: [[1, 1, 1], [0, 0, 1]], color: 8 }, // L-shape rotated
];

const GRID_SIZE = 10;
const CELL_SIZE = 50;

let gameBoard = [];
let score = 0;
let level = 1;
let availablePieces = [];
let selectedPiece = null;
let dragOffset = { x: 0, y: 0 };

function initGame() {
    // Initialize empty board
    gameBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    score = 0;
    level = 1;
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    
    // Generate initial pieces
    generateNewPieces();
    renderBoard();
    renderPieces();
}

function generateNewPieces() {
    availablePieces = [];
    const numPieces = Math.min(3, 5 - Math.floor(level / 3));
    
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
    board.innerHTML = '';
    
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if (gameBoard[row][col] !== 0) {
                cell.classList.add('filled');
                cell.style.background = getColorByValue(gameBoard[row][col]);
                cell.textContent = gameBoard[row][col];
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
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const block = document.createElement('div');
                if (piece.shape[i] && piece.shape[i][j]) {
                    block.className = `wood-block color-${piece.color}`;
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
    e.currentTarget.classList.add('dragging');
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    selectedPiece = null;
}

function getColorByValue(value) {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B4D8'
    ];
    return colors[(value - 1) % colors.length];
}

// Set up board drop zones
function setupBoardDropZones() {
    const board = document.getElementById('gameBoard');
    board.addEventListener('dragover', handleDragOver);
    board.addEventListener('drop', handleDrop);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.style.background = '';
    
    if (selectedPiece === null) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor(x / (CELL_SIZE + 4));
    const row = Math.floor(y / (CELL_SIZE + 4));
    
    placePiece(selectedPiece, row, col);
}

function placePiece(pieceIndex, startRow, startCol) {
    const piece = availablePieces[pieceIndex];
    const shape = piece.shape;
    const colorValue = piece.color;
    
    // Check if piece can be placed
    if (!canPlacePiece(shape, startRow, startCol)) {
        showMessage('❌ Cannot place piece there!', 'warning');
        return;
    }
    
    // Place the piece
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j]) {
                gameBoard[startRow + i][startCol + j] = colorValue;
            }
        }
    }
    
    // Mark piece as used
    availablePieces[pieceIndex].used = true;
    
    // Check for completed lines
    checkCompletedLines();
    
    // Render updates
    renderBoard();
    renderPieces();
    
    // Generate new pieces if all are used
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
    
    // Clear cells and add score
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
        
        // Level up every 500 points
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
    initGame();
}

// Initialize game on load
window.addEventListener('load', () => {
    initGame();
    setupBoardDropZones();
});
