// Sproutly Game - Complete Implementation
class SproutlyGame {
    constructor() {
        this.gameData = {
            coins: 50,
            level: 1,
            experience: 0,
            totalHarvests: 0,
            selectedSeed: null,
            garden: this.createEmptyGarden(),
            lastSaved: Date.now()
        };

        this.seeds = [
            { id: 'carrot', name: 'Carrot', cost: 5, time: 10, reward: 8, icon: '🥕', level: 1 },
            { id: 'tomato', name: 'Tomato', cost: 8, time: 15, reward: 12, icon: '🍅', level: 1 },
            { id: 'lettuce', name: 'Lettuce', cost: 6, time: 8, reward: 10, icon: '🥬', level: 2 },
            { id: 'corn', name: 'Corn', cost: 12, time: 20, reward: 18, icon: '🌽', level: 2 },
            { id: 'pumpkin', name: 'Pumpkin', cost: 20, time: 30, reward: 35, icon: '🎃', level: 3 },
            { id: 'strawberry', name: 'Strawberry', cost: 15, time: 18, reward: 25, icon: '🍓', level: 3 },
            { id: 'watermelon', name: 'Watermelon', cost: 25, time: 35, reward: 45, icon: '🍉', level: 4 },
            { id: 'eggplant', name: 'Eggplant', cost: 18, time: 22, reward: 30, icon: '🍆', level: 4 }
        ];

        this.stageIcons = ['🌱', '🌿', '🌾', ''];
        this.gridSize = { rows: 6, cols: 8 };
        
        this.init();
    }

    createEmptyGarden() {
        const garden = [];
        for (let row = 0; row < 6; row++) {
            garden[row] = [];
            for (let col = 0; col < 8; col++) {
                garden[row][col] = null;
            }
        }
        return garden;
    }

    init() {
        console.log('🌱 Initializing Sproutly Game...');
        this.loadGame();
        this.createGarden();
        this.updateUI();
        this.startGameLoop();
        console.log('✅ Sproutly Game Ready!');
    }

    // Save/Load System
    saveGame() {
        this.gameData.lastSaved = Date.now();
        try {
            localStorage.setItem('sproutly-save', JSON.stringify(this.gameData));
        } catch (e) {
            console.warn('Could not save game:', e);
        }
    }

    loadGame() {
        try {
            const saved = localStorage.getItem('sproutly-save');
            if (saved) {
                const data = JSON.parse(saved);
                this.gameData = { ...this.gameData, ...data };
                this.processOfflineGrowth();
                console.log('Game loaded successfully');
            }
        } catch (e) {
            console.warn('Could not load save file, starting fresh');
        }
    }

    processOfflineGrowth() {
        const now = Date.now();
        const timeDiff = (now - this.gameData.lastSaved) / 1000; // seconds
        
        if (timeDiff > 5) { // Only process if away for more than 5 seconds
            let plantsGrown = 0;
            for (let row = 0; row < this.gridSize.rows; row++) {
                for (let col = 0; col < this.gridSize.cols; col++) {
                    const plant = this.gameData.garden[row][col];
                    if (plant && plant.stage < 3) {
                        const seed = this.seeds.find(s => s.id === plant.seedId);
                        if (seed) {
                            const stageTime = seed.time / 4;
                            const stagesGrown = Math.floor(timeDiff / stageTime);
                            const newStage = Math.min(plant.stage + stagesGrown, 3);
                            if (newStage > plant.stage) {
                                plant.stage = newStage;
                                plantsGrown++;
                            }
                        }
                    }
                }
            }
            if (plantsGrown > 0) {
                this.showNotification(`Welcome back! ${plantsGrown} plants grew while you were away!`);
            }
        }
    }

    // Garden Creation
    createGarden() {
        const garden = document.getElementById('garden');
        if (!garden) {
            console.error('Garden element not found!');
            return;
        }
        
        garden.innerHTML = '';
        
        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'plant-cell empty';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleCellRightClick(row, col);
                });
                
                garden.appendChild(cell);
            }
        }
        
        console.log(`Garden created: ${this.gridSize.rows}x${this.gridSize.cols} = ${garden.children.length} cells`);
    }

    // Cell Interactions
    handleCellClick(row, col) {
        const plant = this.gameData.garden[row][col];
        
        if (!plant && this.gameData.selectedSeed) {
            this.plantSeed(row, col);
        } else if (plant && plant.stage === 3) {
            this.harvestPlant(row, col);
        }
    }

    handleCellRightClick(row, col) {
        const plant = this.gameData.garden[row][col];
        if (plant) {
            this.gameData.garden[row][col] = null;
            this.updateUI();
            this.saveGame();
            this.showNotification('Plant removed!');
        }
    }

    // Game Actions
    plantSeed(row, col) {
        const seed = this.seeds.find(s => s.id === this.gameData.selectedSeed);
        if (!seed || this.gameData.coins < seed.cost) {
            this.showNotification('Not enough coins!');
            return;
        }

        this.gameData.coins -= seed.cost;
        this.gameData.garden[row][col] = {
            seedId: seed.id,
            stage: 0,
            plantedAt: Date.now()
        };

        this.updateUI();
        this.saveGame();
        this.showNotification(`${seed.name} planted!`);
    }

    harvestPlant(row, col) {
        const plant = this.gameData.garden[row][col];
        const seed = this.seeds.find(s => s.id === plant.seedId);
        
        if (!seed) return;

        this.gameData.coins += seed.reward;
        this.gameData.experience += 10;
        this.gameData.totalHarvests++;
        this.gameData.garden[row][col] = null;

        // Level up check
        const newLevel = Math.floor(this.gameData.experience / 100) + 1;
        if (newLevel > this.gameData.level) {
            this.gameData.level = newLevel;
            this.showNotification(`🎉 Level Up! You are now level ${this.gameData.level}!`);
        }

        this.updateUI();
        this.saveGame();
        this.showNotification(`Harvested ${seed.name} for ${seed.reward} coins!`);
    }

    selectSeed(seedId) {
        const seed = this.seeds.find(s => s.id === seedId);
        if (!seed || this.gameData.coins < seed.cost || seed.level > this.gameData.level) {
            this.showNotification('Cannot select this seed!');
            return;
        }

        this.gameData.selectedSeed = this.gameData.selectedSeed === seedId ? null : seedId;
        this.updateUI();
        
        if (this.gameData.selectedSeed) {
            this.showNotification(`${seed.name} selected!`);
        }
    }

    // UI Updates
    updateUI() {
        this.updateStats();
        this.updateGarden();
        this.updateSeedShop();
    }

    updateStats() {
        // Update sproukels counter
        const sproukelsAmount = document.getElementById('sproukelsAmount');
        if (sproukelsAmount) {
            sproukelsAmount.textContent = this.gameData.coins;
        }
    }

    updateGarden() {
        const cells = document.querySelectorAll('.plant-cell');
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const plant = this.gameData.garden[row][col];
            
            // Reset cell
            cell.className = 'plant-cell';
            cell.innerHTML = '';
            
            if (plant) {
                const seed = this.seeds.find(s => s.id === plant.seedId);
                if (seed) {
                    cell.classList.add('planted');
                    if (plant.stage === 3) {
                        cell.classList.add('ready');
                        cell.innerHTML = `<div class="plant-display">${seed.icon}</div>`;
                        cell.title = `${seed.name} - Ready to harvest!`;
                    } else {
                        const stageIcon = this.stageIcons[plant.stage];
                        cell.innerHTML = `<div class="plant-display">${stageIcon}</div>`;
                        cell.title = `${seed.name} - Stage ${plant.stage + 1}/4`;
                        
                        // Add growth progress bar
                        const progressBar = document.createElement('div');
                        progressBar.className = 'growth-progress';
                        progressBar.style.width = `${(plant.stage / 3) * 100}%`;
                        cell.appendChild(progressBar);
                    }
                }
            } else {
                cell.classList.add('empty');
                if (this.gameData.selectedSeed) {
                    cell.classList.add('plantable');
                    cell.innerHTML = '<div class="plant-hint">+</div>';
                    cell.title = 'Click to plant';
                } else {
                    cell.title = 'Empty plot - Select a seed to plant';
                }
            }
        });
    }

    updateSeedShop() {
        const shop = document.getElementById('seed-shop');
        if (!shop) return;
        
        shop.innerHTML = '';

        this.seeds.forEach(seed => {
            const canAfford = this.gameData.coins >= seed.cost;
            const canUnlock = seed.level <= this.gameData.level;
            const isSelected = this.gameData.selectedSeed === seed.id;

            const seedCard = document.createElement('div');
            seedCard.className = 'seed-card';
            
            if (!canUnlock) {
                seedCard.classList.add('locked');
            } else if (isSelected) {
                seedCard.classList.add('selected');
            } else if (canAfford) {
                seedCard.classList.add('available');
            } else {
                seedCard.classList.add('unavailable');
            }

            seedCard.innerHTML = `
                <div class="seed-icon">${seed.icon}</div>
                <div class="seed-info">
                    <div class="seed-name">${seed.name}</div>
                    <div class="seed-cost">${seed.cost} coins</div>
                    <div class="seed-reward">+${seed.reward} coins</div>
                    ${!canUnlock ? `<div class="seed-level">Unlock at Level ${seed.level}</div>` : ''}
                </div>
            `;

            if (canUnlock && canAfford) {
                seedCard.addEventListener('click', () => this.selectSeed(seed.id));
                seedCard.style.cursor = 'pointer';
            }

            shop.appendChild(seedCard);
        });
    }

    // Game Loop
    startGameLoop() {
        // Update plant growth every second
        setInterval(() => {
            this.updatePlantGrowth();
        }, 1000);

        // Auto-save every 10 seconds
        setInterval(() => {
            this.saveGame();
        }, 10000);
    }

    updatePlantGrowth() {
        let hasChanges = false;
        const now = Date.now();

        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                const plant = this.gameData.garden[row][col];
                if (plant && plant.stage < 3) {
                    const seed = this.seeds.find(s => s.id === plant.seedId);
                    if (seed) {
                        const timeSincePlanted = (now - plant.plantedAt) / 1000;
                        const stageTime = seed.time / 4;
                        const expectedStage = Math.min(Math.floor(timeSincePlanted / stageTime), 3);
                        
                        if (expectedStage > plant.stage) {
                            plant.stage = expectedStage;
                            hasChanges = true;
                        }
                    }
                }
            }
        }

        if (hasChanges) {
            this.updateGarden();
        }
    }

    showNotification(message) {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        // Create new notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Menu and UI Functions
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
        
        // Initialize game if not already done
        if (!window.game) {
            window.game = new SproutlyGame();
        }
    }, 2000);
}

function loadGame() {
    const saved = localStorage.getItem('sproutly-save');
    if (saved) {
        const gameState = JSON.parse(saved);
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('loading').classList.remove('hidden');
        document.querySelector('.working-message').textContent = `Working, Welcome back!`;
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
            
            // Initialize game if not already done
            if (!window.game) {
                window.game = new SproutlyGame();
            }
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
    musicOn = document.getElementById('musicToggle').checked;
    const sideToggle = document.getElementById('musicToggleSide');
    if (sideToggle) sideToggle.checked = musicOn;
    
    if (musicOn) {
        if (!audio) {
            audio = new Audio('your-music-file.mp3');
            audio.loop = true;
        }
        audio.play().catch(e => console.log('Audio play failed:', e));
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
    // Remove all active classes
    document.querySelectorAll('.left-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.side-panel').forEach(panelDiv => {
        panelDiv.classList.add('hidden');
        panelDiv.classList.remove('show');
    });
    document.getElementById('panelOverlay').classList.remove('hidden');

    let btn, panelDiv;
    if (panel === 'sell') {
        btn = document.querySelector('.sell-btn');
        panelDiv = document.getElementById('sellPanel');
    } else if (panel === 'shop') {
        btn = document.querySelector('.shop-btn');
        panelDiv = document.getElementById('shopPanel');
    } else if (panel === 'settings') {
        btn = document.querySelector('.settings-btn');
        panelDiv = document.getElementById('settingsPanel');
    } else if (panel === 'backmenu') {
        btn = document.querySelector('.backmenu-btn');
        panelDiv = document.getElementById('backMenuPanel');
    }

    if (btn && panelDiv) {
        btn.classList.add('active');
        panelDiv.classList.remove('hidden');
        panelDiv.classList.add('show');
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
        // Show homepage button/footer again
        const homerFooter = document.querySelector('.homer_footer_container');
        if (homerFooter) homerFooter.classList.remove('hidden');
        // Show Orpheus flag again
        const orpheusFlag = document.getElementById('orpheusFlag');
        if (orpheusFlag) orpheusFlag.style.display = 'block';
        closePanelOverlay();
    } else {
        closePanelOverlay();
    }
}

function toggleTheme() {
    // Use either toggle as the source of truth
    const isLight = document.getElementById('themeToggle').checked;
    document.body.classList.toggle('light-mode', isLight);

    // Sync both toggles if you have one in the menu as well
    const menuThemeToggle = document.getElementById('themeToggleMenu');
    if (menuThemeToggle) menuThemeToggle.checked = isLight;
    document.getElementById('themeToggle').checked = isLight;
}

// Initialize game when page loads (but only when game UI is shown)
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌱 Sproutly Ready to Start...');
});

// Handle page visibility for better performance
document.addEventListener('visibilitychange', () => {
    if (window.game && document.visibilityState === 'visible') {
        window.game.processOfflineGrowth();
        window.game.updateUI();
    }
});