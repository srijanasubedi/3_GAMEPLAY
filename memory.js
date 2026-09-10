// Card shapes and emojis for the memory game
const cardSymbols = [
    '🌟', '🌟',
    '❤️', '❤️',
    '🎨', '🎨',
    '🎭', '🎭',
    '🎪', '🎪',
    '🎸', '🎸',
    '🎯', '🎯',
    '🎲', '🎲'
];

// Game state
let gameState = {
    mode: null,
    cards: [],
    flipped: [],
    matched: 0,
    player1Score: 0,
    player2Score: 0,
    currentPlayer: 1,
    gameActive: true,
    readonly: false
};

// Initialize game
function startGame(mode) {
    gameState.mode = mode;
    gameState.player1Score = 0;
    gameState.player2Score = 0;
    gameState.currentPlayer = 1;
    gameState.matched = 0;
    gameState.gameActive = true;
    gameState.readonly = false;
    gameState.flipped = [];
    
    document.getElementById('modeSelection').style.display = 'none';
    document.getElementById('gameContainer').classList.remove('hidden');
    
    // Update labels
    if (mode === '2player') {
        document.getElementById('player1Label').textContent = 'Player 1';
        document.getElementById('player2Label').textContent = 'Player 2';
    } else {
        document.getElementById('player1Label').textContent = 'You';
        document.getElementById('player2Label').textContent = 'Bot';
    }
    
    initializeBoard();
}

function initializeBoard() {
    // Shuffle cards
    gameState.cards = [...cardSymbols].sort(() => Math.random() - 0.5);
    
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    gameState.cards.forEach((symbol, index) => {
        const card = document.createElement('button');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.symbol = symbol;
        card.textContent = '?';
        card.onclick = () => flipCard(index);
        gameBoard.appendChild(card);
    });
    
    updateUI();
}

function flipCard(index) {
    if (!gameState.gameActive || gameState.readonly) return;
    if (gameState.flipped.includes(index)) return;
    
    const card = document.querySelector(`[data-index="${index}"]`);
    
    // If card is already matched, don't flip
    if (card.classList.contains('matched')) return;
    
    // Flip the card
    card.classList.add('flipped');
    card.textContent = card.dataset.symbol;
    gameState.flipped.push(index);
    
    // If two cards are flipped, check for match
    if (gameState.flipped.length === 2) {
        gameState.readonly = true;
        checkMatch();
    } else if (gameState.flipped.length === 1 && gameState.mode === 'bot' && gameState.currentPlayer === 2) {
        // Bot's turn - make a move
        setTimeout(botMove, 800);
    }
}

function checkMatch() {
    const [index1, index2] = gameState.flipped;
    const symbol1 = gameState.cards[index1];
    const symbol2 = gameState.cards[index2];
    
    if (symbol1 === symbol2) {
        // Match found
        gameState.matched++;
        
        const card1 = document.querySelector(`[data-index="${index1}"]`);
        const card2 = document.querySelector(`[data-index="${index2}"]`);
        
        card1.classList.add('matched');
        card2.classList.add('matched');
        
        // Award points to current player
        if (gameState.currentPlayer === 1) {
            gameState.player1Score++;
        } else {
            gameState.player2Score++;
        }
        
        document.getElementById('matchesFound').textContent = gameState.matched;
        
        gameState.flipped = [];
        gameState.readonly = false;
        
        // Check if game is won
        if (gameState.matched === 8) {
            endGame();
        } else {
            updateUI();
        }
    } else {
        // No match - flip back after a delay
        setTimeout(() => {
            const card1 = document.querySelector(`[data-index="${index1}"]`);
            const card2 = document.querySelector(`[data-index="${index2}"]`);
            
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '?';
            card2.textContent = '?';
            
            gameState.flipped = [];
            
            // Switch player
            switchPlayer();
            gameState.readonly = false;
            updateUI();
        }, 1000);
    }
}

function switchPlayer() {
    if (gameState.mode === '2player') {
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    } else {
        // vs Bot
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    }
}

function botMove() {
    if (!gameState.gameActive || gameState.flipped.length !== 1) return;
    
    // Bot strategy: try to find matching card
    const firstCardSymbol = gameState.cards[gameState.flipped[0]];
    let secondIndex = -1;
    
    // Look for matching card
    for (let i = 0; i < gameState.cards.length; i++) {
        if (i !== gameState.flipped[0] && 
            gameState.cards[i] === firstCardSymbol && 
            !document.querySelector(`[data-index="${i}"]`).classList.contains('matched') &&
            !document.querySelector(`[data-index="${i}"]`).classList.contains('flipped')) {
            secondIndex = i;
            break;
        }
    }
    
    // If no matching card found, pick random
    if (secondIndex === -1) {
        const availableCards = [];
        for (let i = 0; i < gameState.cards.length; i++) {
            if (i !== gameState.flipped[0] && 
                !document.querySelector(`[data-index="${i}"]`).classList.contains('matched') &&
                !document.querySelector(`[data-index="${i}"]`).classList.contains('flipped')) {
                availableCards.push(i);
            }
        }
        secondIndex = availableCards[Math.floor(Math.random() * availableCards.length)];
    }
    
    flipCard(secondIndex);
}

function endGame() {
    gameState.gameActive = false;
    
    const modal = document.getElementById('winnerModal');
    const winnerText = document.getElementById('winnerText');
    
    if (gameState.player1Score > gameState.player2Score) {
        if (gameState.mode === '2player') {
            winnerText.textContent = '🎉 Player 1 Wins!';
        } else {
            winnerText.textContent = '🎉 You Won! 🎉';
        }
    } else if (gameState.player2Score > gameState.player1Score) {
        if (gameState.mode === '2player') {
            winnerText.textContent = '🎉 Player 2 Wins!';
        } else {
            winnerText.textContent = '🤖 Bot Wins!';
        }
    } else {
        winnerText.textContent = "🤝 It's a Tie!";
    }
    
    modal.classList.remove('hidden');
}

function updateUI() {
    document.getElementById('player1Score').textContent = gameState.player1Score;
    document.getElementById('player2Score').textContent = gameState.player2Score;
    
    const turnElement = document.getElementById('currentTurn');
    if (gameState.currentPlayer === 1) {
        turnElement.textContent = gameState.mode === '2player' ? "Player 1's Turn" : "Your Turn";
        turnElement.className = 'current-turn player1';
    } else {
        turnElement.textContent = gameState.mode === '2player' ? "Player 2's Turn" : "Bot's Turn";
        turnElement.className = 'current-turn ' + (gameState.mode === '2player' ? 'player2' : 'bot');
    }
}

function resetGame() {
    document.getElementById('winnerModal').classList.add('hidden');
    gameState.player1Score = 0;
    gameState.player2Score = 0;
    gameState.currentPlayer = 1;
    gameState.matched = 0;
    gameState.gameActive = true;
    gameState.readonly = false;
    gameState.flipped = [];
    document.getElementById('matchesFound').textContent = '0';
    initializeBoard();
}

function backToMode() {
    document.getElementById('gameContainer').classList.add('hidden');
    document.getElementById('modeSelection').style.display = 'flex';
    document.getElementById('modeSelection').style.alignItems = 'center';
    document.getElementById('modeSelection').style.justifyContent = 'center';
    document.getElementById('winnerModal').classList.add('hidden');
}
