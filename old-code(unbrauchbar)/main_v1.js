function startNewGame() {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');
    document.querySelector('.working-message').textContent = "Working!";

    // Animate progress bar
    const bar = document.getElementById('progressBar');
    bar.style.width = '0';
    setTimeout(() => {
        bar.style.width = '100%';
    }, 50);

    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('gameUI').classList.remove('hidden');
        // Hide homepage button/footer
        const homerFooter = document.querySelector('.homer_footer_container');
        if (homerFooter) homerFooter.classList.add('hidden');
        // Hide Orpheus flag
        const orpheusFlag = document.getElementById('orpheusFlag');
        if (orpheusFlag) orpheusFlag.style.display = 'none';
    }, 2000);
}

function loadGame() {
    const saved = localStorage.getItem('sproutlySave');
    if (saved) {
        const gameState = JSON.parse(saved);
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('loading').classList.remove('hidden');
        document.querySelector('.working-message').textContent = `Working, Welcome back ${gameState.playerName}!`;
        // Animate progress bar
        const bar = document.getElementById('progressBar');
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = '100%';
        }, 50);
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('gameUI').classList.remove('hidden');
            // Hide homepage button/footer
            const homerFooter = document.querySelector('.homer_footer_container');
            if (homerFooter) homerFooter.classList.add('hidden');
            // Hide Orpheus flag
            const orpheusFlag = document.getElementById('orpheusFlag');
            if (orpheusFlag) orpheusFlag.style.display = 'none';
        }, 2000);
    } else {
        alert('No saved game found.');
    }
}

let musicOn = true;
let audio = null;

function openSettings() {
    document.getElementById('settingsOverlay').classList.remove('hidden');
    document.getElementById('settingsModal').classList.remove('hidden');
    document.getElementById('musicToggle').checked = musicOn;
}

function closeSettings() {
    document.getElementById('settingsOverlay').classList.add('hidden');
    document.getElementById('settingsModal').classList.add('hidden');
}

function toggleMusic() {
    musicOn = document.getElementById('musicToggle').checked = document.getElementById('musicToggleSide').checked;
    if (musicOn) {
        if (!audio) {
            audio = new Audio('your-music-file.mp3');
            audio.loop = true;
        }
        audio.play();
    } else {
        if (audio) audio.pause();
    }
}

function hideOrpheus() {
    document.getElementById('orpheusFlag').style.display = 'none';
}

function unlockCell(btn) {
    // Find the next hidden cell and show it
    const hiddenCells = document.querySelectorAll('.plant-cell.hidden');
    if (hiddenCells.length > 0) {
        hiddenCells[0].classList.remove('hidden');
        // Optionally, you can move the plus button to the next cell
        hiddenCells[0].classList.add('locked');
        hiddenCells[0].appendChild(btn);
    } else {
        // No more cells to unlock, remove the button
        btn.style.display = 'none';
    }
    // Here you can also deduct "sproukels" or show a message if needed
    alert("Sproukels")
}

function openPanel(panel) {
    // Remove all active and color classes
    document.querySelectorAll('.left-btn').forEach(btn => {
        btn.classList.remove('active', 'active-border-red', 'active-border-green', 'active-border-black', 'active-border-gray');
    });
    document.querySelectorAll('.side-panel').forEach(panelDiv => {
        panelDiv.classList.add('hidden');
        panelDiv.classList.remove('show', 'active-border-red', 'active-border-green', 'active-border-black', 'active-border-gray');
    });
    document.getElementById('panelOverlay').classList.remove('hidden');

    let btn, panelDiv, colorClass;
    if (panel === 'sell') {
        btn = document.querySelector('.sell-btn');
        panelDiv = document.getElementById('sellPanel');
        colorClass = 'active-border-red';
    } else if (panel === 'shop') {
        btn = document.querySelector('.shop-btn');
        panelDiv = document.getElementById('shopPanel');
        colorClass = 'active-border-green';
    } else if (panel === 'settings') {
        btn = document.querySelector('.settings-btn');
        panelDiv = document.getElementById('settingsPanel');
        colorClass = 'active-border-black';
    } else if (panel === 'backmenu') {
        btn = document.querySelector('.backmenu-btn');
        panelDiv = document.getElementById('backMenuPanel');
        colorClass = 'active-border-gray';
    }

    if (btn && panelDiv) {
        btn.classList.add('active', colorClass);
        panelDiv.classList.remove('hidden');
        panelDiv.classList.add('show', colorClass);
        if (panel === 'settings') {
            document.getElementById('musicToggleSide').checked = musicOn;
            document.getElementById('themeToggle').checked = document.body.classList.contains('light-mode');
        }
    }
}

function closePanelOverlay() {
    document.querySelectorAll('.left-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.side-panel').forEach(panel => {
        panel.classList.remove('show');
        setTimeout(() => panel.classList.add('hidden'), 250);
    });
    document.getElementById('panelOverlay').classList.add('hidden');
}

function closeAllPanels() {
    document.querySelectorAll('.left-btn, .menu-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.custom-modal').forEach(modal => modal.classList.add('hidden'));
    // Also close settings if open
    document.getElementById('settingsOverlay').classList.add('hidden');
    document.getElementById('settingsModal').classList.add('hidden');
}

function confirmBackToMenu(yes) {
    if (yes) {
        document.getElementById('gameUI').classList.add('hidden');
        document.getElementById('menu').classList.remove('hidden');
        closePanelOverlay();
    } else {
        closePanelOverlay();
    }
}
yourSproukelsValue = 2
document.getElementById('sproukelsAmount').textContent = yourSproukelsValue;

function toggleTheme() {
    // Use either toggle as the source of truth
    const isLight = document.getElementById('themeToggle').checked;
    document.body.classList.toggle('light-mode', isLight);

    // Sync both toggles if you have one in the menu as well
    const menuThemeToggle = document.getElementById('themeToggleMenu');
    if (menuThemeToggle) menuThemeToggle.checked = isLight;
    document.getElementById('themeToggle').checked = isLight;
    document.getElementById('themeToggleSide').checked = isLight;
}

