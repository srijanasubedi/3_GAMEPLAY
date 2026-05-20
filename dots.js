const dSize = 6; 
let dPlayer = 1, dScores = {1:0, 2:0}, dEdges = [], dotsActive = true;

function initDotsGame() {
    const bContainer = document.getElementById('dots-board');
    bContainer.innerHTML = '';
    dPlayer = 1; dScores = {1:0, 2:0}; dotsActive = true;
    dEdges = Array(dSize).fill(null).map(() => Array(dSize).fill(0));
    document.getElementById('dots-winner-banner').style.display = 'none'; 
    updateDotsUI();

    let gt = '';
    for (let i = 0; i < dSize * 2 + 1; i++) gt += (i % 2 === 0) ? '12px ' : '45px ';
    bContainer.style.gridTemplateColumns = gt; bContainer.style.gridTemplateRows = gt;

    for (let r = 0; r < dSize * 2 + 1; r++) {
        for (let c = 0; c < dSize * 2 + 1; c++) {
            const el = document.createElement('div');
            if (r % 2 === 0 && c % 2 === 0) el.className = 'dot';
            else if (r % 2 === 0 && c % 2 !== 0) { el.className = 'h-line'; el.onclick = () => fillLine(el, r, c, 'h'); } 
            else if (r % 2 !== 0 && c % 2 === 0) { el.className = 'v-line'; el.onclick = () => fillLine(el, r, c, 'v'); } 
            else { el.className = 'box'; el.id = `box-${Math.floor(r/2)}-${Math.floor(c/2)}`; }
            bContainer.appendChild(el);
        }
    }
}

function fillLine(el, r, c, type) {
    if (!dotsActive || el.classList.contains('line-p1') || el.classList.contains('line-p2')) return;
    el.classList.add(dPlayer === 1 ? 'line-p1' : 'line-p2'); el.classList.remove('h-line', 'v-line');
    let scored = false;
    if (type === 'h') { if (checkBox((r/2)-1, Math.floor(c/2))) scored = true; if (checkBox((r/2), Math.floor(c/2))) scored = true; } 
    else { if (checkBox(Math.floor(r/2), (c/2)-1)) scored = true; if (checkBox(Math.floor(r/2), (c/2))) scored = true; }
    if (!scored) dPlayer = dPlayer === 1 ? 2 : 1; 
    updateDotsUI();
}

function checkBox(r, c) {
    if (r < 0 || r >= dSize || c < 0 || c >= dSize) return false;
    dEdges[r][c]++;
    if (dEdges[r][c] === 4) { document.getElementById(`box-${r}-${c}`).classList.add(dPlayer === 1 ? 'box-p1' : 'box-p2'); dScores[dPlayer]++; return true; }
    return false;
}

function updateDotsUI() {
    document.getElementById('dots-score1').innerText = `Score: ${dScores[1]}`;
    document.getElementById('dots-score2').innerText = `Score: ${dScores[2]}`;
    const p1Panel = document.getElementById('panel-p1'); const p2Panel = document.getElementById('panel-p2');
    
    if (dotsActive) {
        document.body.style.backgroundColor = dPlayer === 1 ? '#fbcfe8' : '#e9d5ff';
        if (dPlayer === 1) { p1Panel.classList.add('active-panel'); p2Panel.classList.remove('active-panel'); } 
        else { p2Panel.classList.add('active-panel'); p1Panel.classList.remove('active-panel'); }
    }
    
    if (dScores[1] + dScores[2] === dSize * dSize) {
        dotsActive = false; document.body.style.backgroundColor = 'white';
        p1Panel.classList.remove('active-panel'); p2Panel.classList.remove('active-panel');
        const banner = document.getElementById('dots-winner-banner'); banner.style.display = 'block';
        if (dScores[1] > dScores[2]) { banner.innerText = "⭐ Player 1 is the WINNER! ⭐"; banner.style.color = '#DC2626'; }
        else if (dScores[2] > dScores[1]) { banner.innerText = "⭐ Player 2 is the WINNER! ⭐"; banner.style.color = '#2563EB'; }
        else { banner.innerText = "It's a Tie!"; banner.style.color = '#1F2937'; }
    }
}
initDotsGame();