const winningLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let boardState = Array(9).fill('');
let gameFinished = false;
let botTimer = null;

function getWinner(board) {
    for (const [a, b, c] of winningLines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return null;
}

function availableMoves(board) {
    return board.map((value, index) => value ? null : index).filter(index => index !== null);
}

function findWinningMove(mark) {
    for (const index of availableMoves(boardState)) {
        const test = [...boardState];
        test[index] = mark;
        if (getWinner(test) === mark) return index;
    }
    return null;
}

function renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    boardState.forEach((value, index) => {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'ttt-cell';
        cell.textContent = value;
        cell.disabled = Boolean(value) || gameFinished;
        cell.setAttribute('aria-label', `Cell ${index + 1}`);
        cell.addEventListener('click', () => handleHumanMove(index));
        board.appendChild(cell);
    });
}

function finishGame(winner, draw = false) {
    gameFinished = true;
    clearTimeout(botTimer);
    document.getElementById('status').textContent = draw ? "It's a draw!" : (winner === 'X' ? 'You win!' : 'Computer wins!');
    const message = document.getElementById('message');
    message.textContent = draw ? '🤝 Good game!' : (winner === 'X' ? '🎉 Congratulations!' : '🤖 Try again!');
    message.className = 'message celebrate';
    renderBoard();
}

function handleHumanMove(index) {
    if (gameFinished || boardState[index]) return;
    boardState[index] = 'X';
    if (getWinner(boardState) === 'X') return finishGame('X');
    if (boardState.every(Boolean)) return finishGame(null, true);
    document.getElementById('status').textContent = 'Computer is thinking...';
    renderBoard();
    botTimer = setTimeout(makeBotMove, 450);
}

function makeBotMove() {
    if (gameFinished) return;
    let move = findWinningMove('O');
    if (move === null) move = findWinningMove('X');
    if (move === null && boardState[4] === '') move = 4;
    if (move === null) {
        const moves = availableMoves(boardState);
        move = moves[Math.floor(Math.random() * moves.length)];
    }
    boardState[move] = 'O';
    if (getWinner(boardState) === 'O') return finishGame('O');
    if (boardState.every(Boolean)) return finishGame(null, true);
    document.getElementById('status').textContent = 'Your turn (X)';
    renderBoard();
}

function resetGame() {
    clearTimeout(botTimer);
    boardState = Array(9).fill('');
    gameFinished = false;
    document.getElementById('status').textContent = 'Your turn (X)';
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    renderBoard();
}

window.addEventListener('DOMContentLoaded', resetGame);
