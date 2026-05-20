// ==========================================
// SNAKES AND LADDERS LOGIC (Realistic & Animated)
// ==========================================

// 1. Define where the Snakes and Ladders are located
const snakes = { 17:7, 54:34, 62:19, 87:24, 93:73, 95:75, 99:78 }; 
const ladders = { 2:38, 9:31, 21:42, 28:84, 51:67, 71:91, 80:100 };

// 2. Game State Variables
let slPos = {1: 1, 2: 1}; // Both players start at square 1
let slPlayer = 1;         // Player 1 starts
let slActive = true;      // Is the game currently running?
let isAnimating = false;  // Prevents clicking the dice while pieces are moving

// 3. Coordinate Calculator
// This math finds the exact X and Y pixel coordinates for any square (1-100)
// Assuming a 450x450px board where each cell is 45px.
function getCoords(num) {
    let rowBottom = Math.floor((num - 1) / 10);
    let col = (rowBottom % 2 === 0) ? (num - 1) % 10 : 9 - ((num - 1) % 10);
    return { x: col * 45 + 22.5, y: (9 - rowBottom) * 45 + 22.5 };
}

// 4. Board & "Real" Graphics Generator
function initSLBoard() {
    const board = document.getElementById('sl-board');
    board.innerHTML = ''; // Clear board
    
    // Create the 100 numbered squares
    for (let row = 9; row >= 0; row--) {
        for (let col = 0; col < 10; col++) {
            const num = row % 2 === 0 ? (row * 10 + col + 1) : (row * 10 + (9 - col) + 1);
            const cell = document.createElement('div');
            cell.className = 'sl-cell'; 
            cell.id = `cell-${num}`; 
            cell.innerText = num;
            
            // Highlight Start and End squares
            if(num === 1) cell.style.background = '#dbeafe';
            if(num === 100) cell.style.background = '#dcfce7';
            board.appendChild(cell);
        }
    }
    
    // Draw "Real" SVG Snakes and Ladders over the board
    let svgHtml = `
        <defs>
            <filter id="ds" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="3" dy="5" stdDeviation="3" flood-color="#000" flood-opacity="0.5"/>
            </filter>
        </defs>
    `;
    
    // Generate Authentic Ladders (Rails + Rungs)
    for (let [start, end] of Object.entries(ladders)) {
        let s = getCoords(start), e = getCoords(end);
        let dx = e.x - s.x, dy = e.y - s.y, angle = Math.atan2(dy, dx);
        let offX = 8 * Math.sin(angle), offY = -8 * Math.cos(angle);
        
        // Draw Rails
        svgHtml += `<line x1="${s.x - offX}" y1="${s.y - offY}" x2="${e.x - offX}" y2="${e.y - offY}" stroke="#d97706" stroke-width="5" filter="url(#ds)"/>`;
        svgHtml += `<line x1="${s.x + offX}" y1="${s.y + offY}" x2="${e.x + offX}" y2="${e.y + offY}" stroke="#d97706" stroke-width="5" filter="url(#ds)"/>`;
        
        // Draw Rungs
        let length = Math.sqrt(dx*dx + dy*dy);
        let numRungs = Math.floor(length / 15);
        for(let i=1; i<numRungs; i++) {
            let rx = s.x + dx * (i/numRungs); let ry = s.y + dy * (i/numRungs);
            svgHtml += `<line x1="${rx - offX}" y1="${ry - offY}" x2="${rx + offX}" y2="${ry + offY}" stroke="#b45309" stroke-width="3" filter="url(#ds)"/>`;
        }
    }

    // Generate Authentic Snakes (Curved Body + Head)
    for (let [start, end] of Object.entries(snakes)) {
        let s = getCoords(start), e = getCoords(end), midX = (s.x + e.x) / 2 + 25;
        
        // Snake Body
        svgHtml += `<path d="M${s.x},${s.y} Q${midX},${(s.y+e.y)/2} ${e.x},${e.y}" stroke="#10b981" stroke-width="10" fill="none" filter="url(#ds)" />`;
        
        // Snake Head and Eyes
        let headAngle = Math.atan2(((s.y+e.y)/2) - s.y, midX - s.x) * 180 / Math.PI + 90;
        svgHtml += `<ellipse cx="${s.x}" cy="${s.y}" rx="10" ry="14" fill="#047857" transform="rotate(${headAngle} ${s.x} ${s.y})" filter="url(#ds)"/>`;
        svgHtml += `<circle cx="${s.x - 4}" cy="${s.y - 4}" r="2" fill="white" transform="rotate(${headAngle} ${s.x} ${s.y})"/>`;
        svgHtml += `<circle cx="${s.x + 4}" cy="${s.y - 4}" r="2" fill="white" transform="rotate(${headAngle} ${s.x} ${s.y})"/>`;
    }
    
    document.getElementById('sl-svg').innerHTML = svgHtml;

    // Add Player Tokens to the board
    board.innerHTML += `<div id="sl-token1" class="token token-p1"></div>`;
    board.innerHTML += `<div id="sl-token2" class="token token-p2"></div>`;
    
    updateSLUI();
}

// 5. UI Updater
function updateSLUI() {
    // Snap tokens to their current square positions
    [1, 2].forEach(p => {
        let coords = getCoords(slPos[p]);
        const token = document.getElementById(`sl-token${p}`);
        if (token) { 
            token.style.left = coords.x + 'px'; 
            token.style.top = coords.y + 'px'; 
        }
        // document.getElementById(`p${p}-status-txt`).innerText = slPos[p];
    });

    // Move the dice to the active player's side
    if (slActive && !isAnimating) {
        document.body.style.backgroundColor = slPlayer === 1 ? '#fecaca' : '#bfdbfe';
        const dice = document.getElementById('flying-dice');
        if (slPlayer === 1) { 
            dice.style.top = '10%'; 
            dice.style.borderColor = '#DC2626'; 
        } else { 
            dice.style.top = '70%'; 
            dice.style.borderColor = '#2563EB'; 
        }
    }
}

// 6. Action Popup System
function showMessage(text, color) {
    const msg = document.getElementById('sl-action-msg');
    msg.innerText = text; 
    msg.style.borderColor = color; 
    msg.style.color = color;
    msg.classList.add('show'); 
    
    // Hide the message after 2 seconds
    setTimeout(() => msg.classList.remove('show'), 2000);
}

// 7. Core Game Logic (The Dice Roll & Step-by-Step Movement)
async function rollDice() {
    if (!slActive || isAnimating) return;
    isAnimating = true;

    // A. Animate the 3D Dice spinning
    const cube = document.getElementById('main-cube');
    cube.classList.remove('show-1','show-2','show-3','show-4','show-5','show-6');
    cube.classList.add('rolling');
    
    await new Promise(r => setTimeout(r, 600)); // Let it spin for 0.6 seconds

    // B. Calculate Random Roll and Show Result
    const roll = Math.floor(Math.random() * 6) + 1;
    cube.classList.remove('rolling'); 
    cube.classList.add(`show-${roll}`);
    
    await new Promise(r => setTimeout(r, 500)); // Pause so player sees the number
    
    let targetPos = slPos[slPlayer] + roll;
    if (targetPos > 100) targetPos = 100; // Cap at 100

    // C. Step-by-Step Walking Animation
    // Show what number was rolled!
showMessage(`The number is ${roll}!`, slPlayer === 1 ? "#DC2626" : "#2563EB");
await new Promise(r => setTimeout(r, 1000)); // Wait 1 second so they can read it

for (let step = slPos[slPlayer] + 1; step <= targetPos; step++) {
    slPos[slPlayer] = step; 
    
    // Update token position
    let coords = getCoords(step);
    document.getElementById(`sl-token${slPlayer}`).style.left = coords.x + 'px';
    document.getElementById(`sl-token${slPlayer}`).style.top = coords.y + 'px';
    
    // Update the text to just show the number without "Square"
    //document.getElementById(`p${slPlayer}-status-txt`).innerText = step;
    
    await new Promise(r => setTimeout(r, 250)); // Wait a quarter second per hop
}

    // D. Check for Snakes and Ladders
    if (snakes[slPos[slPlayer]]) {
        // Snake Bite Command
        showMessage("Ouch .Snake Attack!Ssssliding down...", "#DC2626"); 
        await new Promise(r => setTimeout(r, 1200));
        slPos[slPlayer] = snakes[slPos[slPlayer]]; // Move down
    } 
    else if (ladders[slPos[slPlayer]]) {
        // Ladder Climb Command
        showMessage("i am  Climbing up!", "#10B981"); 
        await new Promise(r => setTimeout(r, 1200));
        slPos[slPlayer] = ladders[slPos[slPlayer]]; // Move up
    }
    
    // Final position update after snake/ladder
    updateSLUI(); 
    await new Promise(r => setTimeout(r, 500));

    // E. Check for Winner or Switch Turns
    if (slPos[slPlayer] === 100) {
        slActive = false; 
        document.body.style.backgroundColor = '#f3f4f6';
        const banner = document.getElementById('sl-winner-banner'); 
        banner.style.display = 'block';
        banner.innerText = `⭐ PLAYER ${slPlayer} WINS! ⭐`; 
        banner.style.color = slPlayer === 1 ? '#DC2626' : '#2563EB';
        document.getElementById('flying-dice').style.display = 'none';
    } else {
        slPlayer = slPlayer === 1 ? 2 : 1; // Switch player
        document.getElementById('main-cube').className = "cube show-1"; // Reset dice visually
    }
    
    isAnimating = false; // Unlock game for next click
    updateSLUI();
}

// 8. Reset Game
function resetSL() {
    if(isAnimating) return; // Don't allow reset mid-animation
    slPos = {1: 1, 2: 1}; 
    slPlayer = 1; 
    slActive = true;
    document.getElementById('main-cube').className = "cube show-1";
    document.getElementById('sl-winner-banner').style.display = 'none';
    document.getElementById('flying-dice').style.display = 'flex';
    updateSLUI();
}

// Initialize the board when the script loads
initSLBoard();