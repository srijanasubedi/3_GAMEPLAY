const winningLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let boardState = Array(9).fill('');
let currentPlayer = 'X';
gameFinished = false;

function findWinner(board) {
  for (const [a,b,c] of winningLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  boardState.forEach((cellValue, index) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'ttt-cell';
    cell.textContent = cellValue;
    cell.disabled = Boolean(cellValue) || gameFinished;
    cell.setAttribute('aria-label', `Cell ${index + 1}`);
    cell.addEventListener('click', () => handlePlayerMove(index));
    board.appendChild(cell);
  });
}

function updateStatus(message) {
  const status = document.getElementById('status');
  if (status) status.textContent = message;
}

function updateCurrentPlayerLabel() {
  const playerElement = document.getElementById('player');
  if (playerElement) playerElement.textContent = currentPlayer;
}

function showMessage(text, className = 'message') {
  const message = document.getElementById('message');
  if (!message) return;
  message.textContent = text;
  message.className = className;
}

function endGame(winner, draw = false) {
  gameFinished = true;
  const status = document.getElementById('status');
  if (draw) {
    updateStatus("It's a draw!");
    showMessage('🤝 It\'s a tie!', 'message');
  } else {
    updateStatus(`Player ${winner} wins!`);
    showMessage(`🎉 Player ${winner} wins!`, 'message celebrate');
  }
  renderBoard();
}

function handlePlayerMove(index) {
  if (gameFinished || boardState[index]) return;

  boardState[index] = currentPlayer;
  const winner = findWinner(boardState);

  if (winner) {
    endGame(winner);
    return;
  }

  if (boardState.every(Boolean)) {
    endGame(null, true);
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateCurrentPlayerLabel();
  updateStatus(`Player ${currentPlayer}'s turn`);
  renderBoard();
}

function resetGame() {
  boardState = Array(9).fill('');
  currentPlayer = 'X';
  gameFinished = false;
  updateCurrentPlayerLabel();
  updateStatus("Player X's turn");
  showMessage('');
  renderBoard();
}

window.addEventListener('DOMContentLoaded', () => {
  updateCurrentPlayerLabel();
  resetGame();
});
