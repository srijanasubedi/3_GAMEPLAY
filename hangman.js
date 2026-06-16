const words = [
    'JAVASCRIPT', 'PROGRAMMING', 'COMPUTER', 'INTERNET', 'KEYBOARD',
    'HANGMAN', 'PUZZLE', 'ALGORITHM', 'DATABASE', 'FUNCTION',
    'VARIABLE', 'ARRAY', 'OBJECT', 'METHOD', 'SYNTAX',
    'RAINBOW', 'BUTTERFLY', 'ELEPHANT', 'DINOSAUR', 'ADVENTURE'
];

let word = '';
let guessedLetters = [];
let wrongGuesses = [];
const maxWrongGuesses = 6;
let gameOver = false;
let gameWon = false;

const bodyParts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];

function init() {
    word = words[Math.floor(Math.random() * words.length)];
    guessedLetters = [];
    wrongGuesses = [];
    gameOver = false;
    gameWon = false;
    renderLetterButtons();
    updateDisplay();
    document.getElementById('messageBox').textContent = '';
    document.getElementById('messageBox').className = 'message-box';
}

function renderLetterButtons() {
    const container = document.getElementById('letterButtons');
    container.innerHTML = '';
    
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    alphabet.forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.className = 'letter-btn';
        button.onclick = () => guessLetter(letter, button);
        button.disabled = guessedLetters.includes(letter) || wrongGuesses.includes(letter) || gameOver;
        container.appendChild(button);
    });
}

function guessLetter(letter, button) {
    if (gameOver || gameWon) return;
    
    button.disabled = true;
    
    if (word.includes(letter)) {
        guessedLetters.push(letter);
    } else {
        wrongGuesses.push(letter);
        showBodyPart();
    }
    
    updateDisplay();
    checkGameStatus();
}

function showBodyPart() {
    if (wrongGuesses.length <= bodyParts.length) {
        document.getElementById(bodyParts[wrongGuesses.length - 1]).style.display = 'block';
    }
}

function updateDisplay() {
    // Update word display
    const displayWord = word
        .split('')
        .map(letter => guessedLetters.includes(letter) ? letter : '_')
        .join(' ');
    document.getElementById('wordDisplay').textContent = displayWord;
    
    // Update stats
    document.getElementById('wrongCount').textContent = wrongGuesses.length;
    document.getElementById('guessedLetters').textContent = wrongGuesses.join(', ') || '(none)';
}

function checkGameStatus() {
    // Check if won
    const allGuessed = word.split('').every(letter => guessedLetters.includes(letter));
    if (allGuessed) {
        gameWon = true;
        gameOver = true;
        showMessage('🎉 You Won! Great job!', 'win');
        disableAllButtons();
        return;
    }
    
    // Check if lost
    if (wrongGuesses.length >= maxWrongGuesses) {
        gameOver = true;
        showMessage(`😢 Game Over! The word was: ${word}`, 'lose');
        disableAllButtons();
    }
}

function showMessage(text, type) {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = text;
    messageBox.className = `message-box ${type}`;
}

function disableAllButtons() {
    document.querySelectorAll('.letter-btn').forEach(btn => btn.disabled = true);
}

function resetGame() {
    // Clear all body parts
    bodyParts.forEach(part => document.getElementById(part).style.display = 'none');
    init();
}

// Initialize game on page load
init();