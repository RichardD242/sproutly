let musicOn = true;
let audio = null;


function setMusicState(on) {
    musicOn = on;
    if (musicOn) {
        if (!audio) {
            audio = new Audio('../game-objects/MainSong.mp3');
            audio.loop = true;
            audio.volume = 0.3;
        }
        audio.play().catch(err => console.log('Audio play failed:', err));
    } else {
        if (audio) audio.pause();
    }
    
    const menuToggle = document.getElementById('musicToggle');
    const sideToggle = document.getElementById('musicToggleSide');
    if (menuToggle) menuToggle.checked = musicOn;
    if (sideToggle) sideToggle.checked = musicOn;
}

function handleMusicToggle(e) {
    setMusicState(e.target.checked);
}

function setupMusicToggles() {
    const menuToggle = document.getElementById('musicToggle');
    const sideToggle = document.getElementById('musicToggleSide');
    if (menuToggle) {
        menuToggle.removeEventListener('change', handleMusicToggle);
        menuToggle.addEventListener('change', handleMusicToggle);
        menuToggle.checked = musicOn;
    }
    if (sideToggle) {
        sideToggle.removeEventListener('change', handleMusicToggle);
        sideToggle.addEventListener('change', handleMusicToggle);
        sideToggle.checked = musicOn;
    }
}


function setThemeState(isLight) {
    document.body.classList.toggle('light-mode', isLight);
    
    const toggles = [
        document.getElementById('themeToggle'),
        document.getElementById('themeToggleMenu')
    ];
    toggles.forEach(t => { if (t) t.checked = isLight; });
}

function handleThemeToggle(e) {
    setThemeState(e.target.checked);
}

function setupThemeToggles() {
    const toggles = [
        document.getElementById('themeToggle'),
        document.getElementById('themeToggleMenu')
    ];
    toggles.forEach(toggle => {
        if (toggle) {
            toggle.removeEventListener('change', handleThemeToggle);
            toggle.addEventListener('change', handleThemeToggle);
            toggle.checked = document.body.classList.contains('light-mode');
        }
    });
}


function openSettings() {
    document.getElementById('settingsOverlay').classList.remove('hidden');
    document.getElementById('settingsModal').classList.remove('hidden');
    setupMusicToggles();
    setupThemeToggles();
}

function closeSettings() {
    document.getElementById('settingsOverlay').classList.add('hidden');
    document.getElementById('settingsModal').classList.add('hidden');
}


function openPanel(panel) {
    document.querySelectorAll('.left-btn').forEach(btn => btn.classList.remove('active'));
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
    } else if (panel === 'equipment') {
        btn = document.querySelector('.equipment-btn');
        panelDiv = document.getElementById('equipmentPanel');
    } else if (panel === 'leaderboard') {
        btn = document.querySelector('.leaderboard-btn');
        panelDiv = document.getElementById('leaderboardPanel');
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
            setupMusicToggles();
            setupThemeToggles();
        }
    }
}


class SproutlyGame {
    constructor() {
        this.gameData = {
            coins: 50,
            level: 1,
            experience: 0,
            totalHarvests: 0,
            selectedSeed: null,
            garden: this.createEmptyGarden(),
            lastSaved: Date.now(),
            equipment: {
                gloves: false,
                luckLevel: 0, 
                sprinkler1: false,
                sprinkler2: false
            }
        };

        this.seeds = [
            { id: 'apple', name: 'Apple', cost: 5, time: 10, reward: 8, level: 1 },
            { id: 'banana', name: 'Banana', cost: 8, time: 25, reward: 12, level: 2 },
            { id: 'coconut', name: 'Coconut', cost: 12, time: 30, reward: 18, level: 2 },
            { id: 'watermelon', name: 'Watermelon', cost: 45, time: 55, reward: 89, level: 4 },
            { id: 'carrot', name: 'Carrot', cost: 16, time: 35, reward: 25, level: 2 },
            { id: 'strawberry', name: 'Strawberry', cost: 20, time: 18, reward: 40, level: 3 }
        ];

        this.equipmentList = [
            { id: 'gloves', name: 'Gloves', price: 50, icon: '../game-objects/Gloves_t.png', desc: 'Faster planting.' },
            { id: 'luck', name: ['Lucky Charm I', 'Lucky Charm II', 'Lucky Charm III'], price: [100, 200, 400], icon: ['../game-objects/Luck1_t.png','../game-objects/Luck2_t.png','../game-objects/Luck3_t.png'], desc: 'Increases luck for giant plants.' },
            { id: 'sprinkler1', name: 'Sprinkler I', price: 200, icon: '../game-objects/Sprinkler1_t.png', desc: 'Auto-waters plants.' },
            { id: 'sprinkler2', name: 'Sprinkler II', price: 400, icon: '../game-objects/Sprinkler_t.png', desc: 'Waters faster.' }
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
        console.log('Initializing Sproutly Game...');
        
        this.createGarden();
        this.updateUI();
        this.startGameLoop();
        console.log('Sproutly Game Ready!');
    }

    
    saveGame() {
        this.gameData.lastSaved = Date.now();
        try {
            const username = this.gameData.username || 'Player';
            localStorage.setItem('sproutly-save-' + username, JSON.stringify(this.gameData));
        } catch (e) {
            console.warn('Could not save game:', e);
        }
    }

    loadGame() {
        
        const saves = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('sproutly-save-')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    saves.push({ key, username: data.username || 'Unnamed', sproukels: data.coins || 0 });
                } catch {}
            }
        }

        
        const listDiv = document.getElementById('savedGamesList');
        listDiv.innerHTML = '';
        if (saves.length === 0) {
            listDiv.innerHTML = '<p style="color:#aaa;text-align:center;">No saved games found.</p>';
        } else {
            saves.forEach(save => {
                const row = document.createElement('div');
                row.className = 'load-save-row';

                const usernameDiv = document.createElement('div');
                usernameDiv.className = 'load-save-username';
                usernameDiv.textContent = save.username;

                const sproukelsDiv = document.createElement('div');
                sproukelsDiv.className = 'load-save-sproukels';
                const img = document.createElement('img');
                img.src = 'SproukelsIcon.png';
                img.alt = 'Sproukels';
                img.className = 'sproukels-icon';
                img.style.width = '28px';
                img.style.height = '28px';
                sproukelsDiv.appendChild(img);
                const amountSpan = document.createElement('span');
                amountSpan.textContent = save.sproukels;
                sproukelsDiv.appendChild(amountSpan);

                const btn = document.createElement('button');
                btn.className = 'load-save-btn';
                btn.textContent = 'Load';
                btn.onclick = () => {
                    if (!window.game) window.game = new SproutlyGame();
                    window.game.loadGameByKey(save.key);
                    closeLoadGameModal();
                    document.getElementById('menu').classList.add('hidden');
                    document.getElementById('loading').classList.remove('hidden');
                    document.querySelector('.working-message').textContent = `Working, Welcome back!`;
                    const bar = document.getElementById('progressBar');
                    bar.style.width = '0';
                    void bar.offsetWidth;
                    setTimeout(() => {
                        bar.style.width = '100%';
                    }, 50);
                    setTimeout(() => {
                        document.getElementById('loading').classList.add('hidden');
                        document.getElementById('gameUI').classList.remove('hidden');
                        const homerFooter = document.querySelector('.homer_footer_container');
                        if (homerFooter) homerFooter.classList.add('hidden');
                        const orpheusFlag = document.getElementById('orpheusFlag');
                        if (orpheusFlag) orpheusFlag.style.display = 'none';
                    }, 2000);
                };

                row.appendChild(usernameDiv);
                row.appendChild(sproukelsDiv);
                row.appendChild(btn);

                listDiv.appendChild(row);
            });
        }
        document.getElementById('loadGameModal').classList.remove('hidden');
    }

    closeLoadGameModal() {
        document.getElementById('loadGameModal').classList.add('hidden');
        
        
    }

    loadGameByKey(key) {
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const data = JSON.parse(saved);
                this.gameData = { ...this.gameData, ...data };
                this.processOfflineGrowth();
                this.updateUI();
                console.log('Game loaded successfully');
            }
        } catch (e) {
            console.warn('Could not load save file, starting fresh');
        }
    }

    processOfflineGrowth() {
        const now = Date.now();
        const timeDiff = (now - this.gameData.lastSaved) / 1000; 
        
        if (timeDiff > 5) { 
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

    
    plantSeed(row, col) {
        const seed = this.seeds.find(s => s.id === this.gameData.selectedSeed);
        if (!seed) return;
        
        let seedCost = seed.cost;
        if (this.gameData.equipment.gloves) {
            seedCost = Math.ceil(seedCost * 0.75);
        }
        if (this.gameData.coins < seedCost) {
            this.showNotification('Not enough Sproukels!');
            return;
        }

        
        let luckLevel = this.gameData.equipment.luckLevel || 0;
        let giantChance = [0.05, 0.15, 0.3, 0.5][luckLevel]; 
        const isGiant = Math.random() < giantChance;

        let giantSize = 48;
        let giantRewardMultiplier = 1;
        if (isGiant) {
            
            giantSize = Math.floor(Math.random() * (96 - 60 + 1)) + 60;
            
            const minSize = 60, maxSize = 96, minMult = 1.5, maxMult = 3.0;
            let floatMult = minMult + ((giantSize - minSize) / (maxSize - minSize)) * (maxMult - minMult);
            giantRewardMultiplier = Math.round(floatMult); 
        }

        this.gameData.coins -= seedCost;
        this.gameData.garden[row][col] = {
            seedId: seed.id,
            stage: 0,
            plantedAt: Date.now(),
            giant: isGiant,
            giantSize: giantSize,
            giantRewardMultiplier: giantRewardMultiplier
        };

        this.updateUI();
        this.saveGame();
        if (isGiant) {
            this.showNotification(`Wow! You planted a giant ${seed.name}!`);
        } else {
            this.showNotification(`${seed.name} planted!`);
        }
    }

    harvestPlant(row, col) {
        const plant = this.gameData.garden[row][col];
        const seed = this.seeds.find(s => s.id === plant.seedId);
        
        if (!seed) return;

        let reward = seed.reward;
        if (plant.giant) {
            
            reward *= plant.giantRewardMultiplier || 2;
            reward = Math.round(reward); 
        }
        this.gameData.coins += reward;
        this.gameData.experience += 10;
        this.gameData.totalHarvests++;
        this.gameData.garden[row][col] = null;

        
        const newLevel = Math.floor(this.gameData.experience / 100) + 1;
        if (newLevel > this.gameData.level) {
            this.gameData.level = newLevel;
            this.showNotification(`🎉 Level Up! You are now level ${this.gameData.level}!`);
        }

        this.updateUI();
        this.saveGame();
        if (plant.giant) {
            this.showNotification(`Harvested a GIANT ${seed.name} for ${reward} Sproukels!`);
        } else {
            this.showNotification(`Harvested ${seed.name} for ${reward} Sproukels!`);
        }
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

    
    updateUI() {
        this.updateStats();
        this.updateGarden();
        this.updateSeedShop();
        this.updateEquipmentShop();
        this.updateActiveArea();
    }

    updateStats() {
        
        const sproukelsAmount = document.getElementById('sproukelsAmount');
        if (sproukelsAmount) {
            sproukelsAmount.textContent = this.gameData.coins;
        }

        
        const xpAmount = document.getElementById('xpAmount');
        const xpLevel = document.getElementById('xpLevel');
        const xpBarFill = document.getElementById('xpBarFill');
        if (xpAmount && xpLevel && xpBarFill) {
            const xp = this.gameData.experience || 0;
            const level = this.gameData.level || 1;
            const xpForLevel = 100;
            const xpThisLevel = xp % xpForLevel;
            xpAmount.textContent = xp;
            xpLevel.textContent = level;
            const percent = Math.min(100, (xpThisLevel / xpForLevel) * 100);
            xpBarFill.style.width = percent + "%";
        }
    }

    updateGarden() {
        const cells = document.querySelectorAll('.plant-cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const plant = this.gameData.garden[row][col];
            
            cell.className = 'plant-cell';
            cell.innerHTML = '';
            if (plant) {
                const seed = this.seeds.find(s => s.id === plant.seedId);
                if (seed) {
                    cell.classList.add('planted');
                    let imgPath = `../game-objects/Sproutly-${seed.name}/${plant.stage + 1}_t.png`;
                    
                    let imgSize = plant.giant ? (plant.giantSize || 80) : 48;
                    let giantClass = plant.giant ? 'giant-plant' : '';
                    cell.innerHTML = `<div class=\"plant-display ${giantClass}\"><img src=\"${imgPath}\" alt=\"${seed.name}\" width=\"${imgSize}\" height=\"${imgSize}\" style=\"image-rendering: crisp-edges;\"/></div>`;
                    if (plant.giant) cell.classList.add('giant');
                    if (plant.stage === 3) {
                        cell.classList.add('ready');
                        cell.title = `${seed.name} - Ready to harvest!`;
                    } else {
                        cell.title = `${seed.name} - Stage ${plant.stage + 1}/4`;
                        
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
                    cell.innerHTML = '<div class=\"plant-hint\">+</div>';
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
        
        const glovesOwned = this.gameData.equipment.gloves;
        
        const sortedSeeds = [...this.seeds].sort((a, b) => a.level - b.level);
        sortedSeeds.forEach(seed => {
            let displayCost = seed.cost;
            let costString = `${seed.cost} Sproukels`;
            if (glovesOwned) {
                displayCost = Math.ceil(seed.cost * 0.75);
                costString = `${displayCost} (${seed.cost}) Sproukels`;
            }
            const canAfford = this.gameData.coins >= displayCost;
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

            const imgPath = `../game-objects/Sproutly-${seed.name}/4.png`;
            seedCard.innerHTML = `
                <div class="seed-icon">
                    <img src="${imgPath}" alt="${seed.name}" width="40" height="40" style="image-rendering: crisp-edges;"/>
                </div>
                <div class="seed-info">
                    <div class="seed-name">${seed.name}</div>
                    <div class="seed-cost">${costString}</div>
                    <div class="seed-reward">+${seed.reward} Sproukels</div>
                    <div class="seed-level">Unlock at Level ${seed.level}</div>
                </div>
            `;

            if (canUnlock && canAfford) {
                seedCard.addEventListener('click', () => this.selectSeed(seed.id));
                seedCard.style.cursor = 'pointer';
            }

            shop.appendChild(seedCard);
        });
    }

    updateEquipmentShop() {
        const shop = document.getElementById('equipment-shop');
        if (!shop) return;
        shop.innerHTML = '';
        
        function createEquipmentBar({icon, name, price, owned, buyId, onBuy, desc, disabled, isLuck, luckLevel, maxed}) {
            const bar = document.createElement('div');
            bar.className = 'equipment-card';
            bar.style.display = 'flex';
            bar.style.flexDirection = 'row';
            bar.style.alignItems = 'center';
            bar.style.justifyContent = 'flex-start';
            bar.style.gap = '16px';
            bar.style.minWidth = '0';
            bar.style.maxWidth = '100%';
            bar.style.padding = '10px 12px';
            bar.style.margin = '0';
            
            const img = document.createElement('img');
            img.src = icon;
            img.alt = name;
            img.className = 'equipment-icon';
            img.style.width = isLuck ? '48px' : '40px';
            img.style.height = isLuck ? '48px' : '40px';
            img.style.margin = '0 8px 0 0';
            
            const info = document.createElement('div');
            info.style.flex = '1';
            info.style.display = 'flex';
            info.style.flexDirection = 'column';
            info.style.justifyContent = 'center';
            info.style.gap = '2px';
            const n = document.createElement('div');
            n.className = 'equipment-name';
            n.textContent = name;
            n.style.fontSize = '1.05rem';
            n.style.margin = '0';
            const d = document.createElement('div');
            d.style.fontSize = '0.85rem';
            d.style.color = '#ffe066cc';
            d.textContent = desc || '';
            d.style.margin = '0';
            info.appendChild(n);
            if (desc) info.appendChild(d);
            
            const p = document.createElement('div');
            p.className = 'equipment-price';
            p.style.fontSize = '0.98rem';
            if (maxed) {
                p.textContent = 'Maxed';
            } else {
                p.innerHTML = `${price} <img src='SproukelsIcon.png' style='width:16px;vertical-align:middle;'/>`;
            }
            info.appendChild(p);
            
            const btn = document.createElement('button');
            btn.className = 'menu-btn';
            btn.id = buyId;
            btn.textContent = owned ? 'Owned' : (maxed ? 'Owned' : 'Buy');
            btn.disabled = !!owned || !!disabled || !!maxed;
            btn.style.marginLeft = '16px';
            btn.style.minWidth = '64px';
            btn.onclick = onBuy;
            
            bar.appendChild(img);
            bar.appendChild(info);
            bar.appendChild(btn);
            return bar;
        }
        
        const gloves = this.equipmentList.find(e => e.id === 'gloves');
        shop.appendChild(createEquipmentBar({
            icon: gloves.icon,
            name: gloves.name,
            price: gloves.price,
            owned: this.gameData.equipment.gloves,
            buyId: 'buyGlovesBtn',
            onBuy: () => {
                if (this.gameData.equipment.gloves) return;
                if (this.gameData.coins < gloves.price) {
                    this.showNotification('Not enough Sproukels!');
                    return;
                }
                this.gameData.coins -= gloves.price;
                this.gameData.equipment.gloves = true;
                this.updateUI();
                this.saveGame();
                this.showNotification('Gloves purchased!');
            },
            
            desc: 'Reduces all seed prices by 25%.',
            disabled: this.gameData.coins < gloves.price
        }));
        
        const luck = this.equipmentList.find(e => e.id === 'luck');
        const luckLevel = this.gameData.equipment.luckLevel;
        if (luckLevel < 3) {
            shop.appendChild(createEquipmentBar({
                icon: luck.icon[luckLevel],
                name: luck.name[luckLevel],
                price: luck.price[luckLevel],
                owned: false,
                buyId: 'buyLuckBtn',
                onBuy: () => {
                    if (this.gameData.coins < luck.price[luckLevel]) {
                        this.showNotification('Not enough Sproukels!');
                        return;
                    }
                    this.gameData.coins -= luck.price[luckLevel];
                    this.gameData.equipment.luckLevel++;
                    this.updateUI();
                    this.saveGame();
                    this.showNotification(`${luck.name[luckLevel]} purchased!`);
                },
                desc: luck.desc,
                disabled: this.gameData.coins < luck.price[luckLevel],
                isLuck: true,
                luckLevel
            }));
        } else {
            shop.appendChild(createEquipmentBar({
                icon: luck.icon[2],
                name: luck.name[2],
                price: '',
                owned: true,
                buyId: 'buyLuckBtn',
                onBuy: () => {},
                desc: luck.desc,
                maxed: true,
                isLuck: true,
                luckLevel: 3
            }));
        }
        const sprinkler1 = this.equipmentList.find(e => e.id === 'sprinkler1');
        shop.appendChild(createEquipmentBar({
            icon: sprinkler1.icon,
            name: sprinkler1.name,
            price: sprinkler1.price,
            owned: this.gameData.equipment.sprinkler1,
            buyId: 'buySprinkler1Btn',
            onBuy: () => {
                if (this.gameData.equipment.sprinkler1) return;
                if (this.gameData.coins < sprinkler1.price) {
                    this.showNotification('Not enough Sproukels!');
                    return;
                }
                this.gameData.coins -= sprinkler1.price;
                this.gameData.equipment.sprinkler1 = true;
                this.updateUI();
                this.saveGame();
                this.showNotification('Sprinkler I purchased!');
            },
            desc: 'Plants grow 10% faster.',
            disabled: this.gameData.coins < sprinkler1.price
        }));
        const sprinkler2 = this.equipmentList.find(e => e.id === 'sprinkler2');
        shop.appendChild(createEquipmentBar({
            icon: sprinkler2.icon,
            name: sprinkler2.name,
            price: sprinkler2.price,
            owned: this.gameData.equipment.sprinkler2,
            buyId: 'buySprinkler2Btn',
            onBuy: () => {
                if (this.gameData.equipment.sprinkler2) return;
                if (this.gameData.coins < sprinkler2.price) {
                    this.showNotification('Not enough Sproukels!');
                    return;
                }
                this.gameData.coins -= sprinkler2.price;
                this.gameData.equipment.sprinkler2 = true;
                this.updateUI();
                this.saveGame();
                this.showNotification('Sprinkler II purchased!');
            },
            
            desc: 'Plants grow 25% faster.',
            disabled: this.gameData.coins < sprinkler2.price
        }));
    }

    updateActiveArea() {
        const area = document.getElementById('activeAreaContent');
        if (!area) return;
        area.innerHTML = '';
        
        const luck = this.equipmentList.find(e => e.id === 'luck');
        const luckLevel = this.gameData.equipment.luckLevel;
        if (luckLevel > 0) {
            const luckDiv = document.createElement('div');
            luckDiv.style.display = 'flex';
            luckDiv.style.alignItems = 'center';
            luckDiv.style.gap = '8px';
            const img = document.createElement('img');
            img.src = luck.icon[luckLevel-1];
            img.alt = luck.name[luckLevel-1];
            img.style.width = '32px';
            img.style.height = '32px';
            luckDiv.appendChild(img);
            const label = document.createElement('span');
            label.textContent = luck.name[luckLevel-1];
            label.style.color = '#ffe066';
            label.style.fontWeight = '600';
            luckDiv.appendChild(label);
            area.appendChild(luckDiv);
        }
        
        if (this.gameData.equipment.gloves) {
            const gloves = this.equipmentList.find(e => e.id === 'gloves');
            const glovesDiv = document.createElement('div');
            glovesDiv.style.display = 'flex';
            glovesDiv.style.alignItems = 'center';
            glovesDiv.style.gap = '8px';
            const img = document.createElement('img');
            img.src = gloves.icon;
            img.alt = gloves.name;
            img.style.width = '32px';
            img.style.height = '32px';
            glovesDiv.appendChild(img);
            const label = document.createElement('span');
            label.textContent = gloves.name;
            label.style.color = '#ffe066';
            label.style.fontWeight = '600';
            glovesDiv.appendChild(label);
            area.appendChild(glovesDiv);
        }
        
        let sprinklerToShow = null;
        if (this.gameData.equipment.sprinkler2) {
            sprinklerToShow = this.equipmentList.find(e => e.id === 'sprinkler2');
        } else if (this.gameData.equipment.sprinkler1) {
            sprinklerToShow = this.equipmentList.find(e => e.id === 'sprinkler1');
        }
        if (sprinklerToShow) {
            const sDiv = document.createElement('div');
            sDiv.style.display = 'flex';
            sDiv.style.alignItems = 'center';
            sDiv.style.gap = '8px';
            const img = document.createElement('img');
            img.src = sprinklerToShow.icon;
            img.alt = sprinklerToShow.name;
            img.style.width = '32px';
            img.style.height = '32px';
            sDiv.appendChild(img);
            const label = document.createElement('span');
            label.textContent = sprinklerToShow.name;
            label.style.color = '#ffe066';
            label.style.fontWeight = '600';
            sDiv.appendChild(label);
            area.appendChild(sDiv);
        }
        
        if (!area.hasChildNodes()) {
            const none = document.createElement('div');
            none.textContent = 'No equipment active.';
            none.style.color = '#aaa';
            none.style.fontSize = '0.95rem';
            area.appendChild(none);
        }
    }

    
    startGameLoop() {
        
        setInterval(() => {
            this.updatePlantGrowth();
        }, 1000);

        
        setInterval(() => {
            this.saveGame();
        }, 10000);
    }

    updatePlantGrowth() {
        let hasChanges = false;
        const now = Date.now();
        
        let speedup = 1;
        if (this.gameData.equipment.sprinkler2) {
            speedup = 1.25; 
        } else if (this.gameData.equipment.sprinkler1) {
            speedup = 1.10; 
        }
        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                const plant = this.gameData.garden[row][col];
                if (plant && plant.stage < 3) {
                    const seed = this.seeds.find(s => s.id === plant.seedId);
                    if (seed) {
                        const timeSincePlanted = (now - plant.plantedAt) / 1000;
                        
                        const stageTime = (seed.time / 4) / speedup;
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
        
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}


function startNewGame() {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');
    document.querySelector('.working-message').textContent = "Working!";

    
    const usernameInput = document.getElementById('usernameInput');
    const username = usernameInput ? usernameInput.value : 'Player';
    if (window.game) {
        window.game.gameData = {
            coins: 20,
            level: 1,
            experience: 0,
            totalHarvests: 0,
            selectedSeed: null,
            garden: window.game.createEmptyGarden(),
            lastSaved: Date.now(),
            username: username
        };
        window.game.updateUI();
        window.game.saveGame();
    } else {
        window.game = new SproutlyGame();
        window.game.gameData.coins = 20;
        window.game.gameData.username = username;
        window.game.saveGame();
    }
    document.getElementById('sproukelsAmount').textContent = 20;

    
    const bar = document.getElementById('progressBar');
    bar.style.width = '0';
    void bar.offsetWidth;
    setTimeout(() => {
        bar.style.width = '100%';
    }, 50);

    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('gameUI').classList.remove('hidden');
        const homerFooter = document.querySelector('.homer_footer_container');
        if (homerFooter) homerFooter.classList.add('hidden');
        const orpheusFlag = document.getElementById('orpheusFlag');
        if (orpheusFlag) orpheusFlag.style.display = 'none';
    }, 2000);
}

function loadGame() {
    
    const saves = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('sproutly-save-')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                saves.push({ key, username: data.username || 'Unnamed', sproukels: data.coins || 0 });
            } catch {}
        }
    }

    
    const listDiv = document.getElementById('savedGamesList');
    listDiv.innerHTML = '';
    if (saves.length === 0) {
        listDiv.innerHTML = '<p style="color:#aaa;text-align:center;">No saved games found.</p>';
    } else {
        saves.forEach(save => {
            const row = document.createElement('div');
            row.className = 'load-save-row';

            const usernameDiv = document.createElement('div');
            usernameDiv.className = 'load-save-username';
            usernameDiv.textContent = save.username;

            const sproukelsDiv = document.createElement('div');
            sproukelsDiv.className = 'load-save-sproukels';
            const img = document.createElement('img');
            img.src = 'SproukelsIcon.png';
            img.alt = 'Sproukels';
            img.className = 'sproukels-icon';
            img.style.width = '28px';
            img.style.height = '28px';
            sproukelsDiv.appendChild(img);
            const amountSpan = document.createElement('span');
            amountSpan.textContent = save.sproukels;
            sproukelsDiv.appendChild(amountSpan);

            const btn = document.createElement('button');
            btn.className = 'load-save-btn';
            btn.textContent = 'Load';
            btn.onclick = () => {
                if (!window.game) window.game = new SproutlyGame();
                window.game.loadGameByKey(save.key);
                closeLoadGameModal();
                document.getElementById('menu').classList.add('hidden');
                document.getElementById('loading').classList.remove('hidden');
                document.querySelector('.working-message').textContent = `Working, Welcome back!`;
                const bar = document.getElementById('progressBar');
                bar.style.width = '0';
                void bar.offsetWidth;
                setTimeout(() => {
                    bar.style.width = '100%';
                }, 50);
                setTimeout(() => {
                    document.getElementById('loading').classList.add('hidden');
                    document.getElementById('gameUI').classList.remove('hidden');
                    const homerFooter = document.querySelector('.homer_footer_container');
                    if (homerFooter) homerFooter.classList.add('hidden');
                    const orpheusFlag = document.getElementById('orpheusFlag');
                    if (orpheusFlag) orpheusFlag.style.display = 'none';
                }, 2000);
            };

            row.appendChild(usernameDiv);
            row.appendChild(sproukelsDiv);
            row.appendChild(btn);

            listDiv.appendChild(row);
        });
    }
    document.getElementById('loadGameModal').classList.remove('hidden');
}

function closeLoadGameModal() {
    document.getElementById('loadGameModal').classList.add('hidden');
}

function openSettings() {
    
    const modalToggle = document.getElementById('musicToggle');
    const sideToggle = document.getElementById('musicToggleSide');
    console.log('[openSettings] musicToggle exists:', !!modalToggle);
    if (modalToggle) {
        modalToggle.checked = musicOn;
    }
    if (sideToggle) {
        sideToggle.checked = musicOn;
    }
    document.getElementById('settingsOverlay').classList.remove('hidden');
    document.getElementById('settingsModal').classList.remove('hidden');
    
    setTimeout(() => {
        setupMusicToggles();
        const modalToggleNow = document.getElementById('musicToggle');
        console.log('[openSettings] After setTimeout, musicToggle exists:', !!modalToggleNow);
        if (modalToggleNow) {
            console.log('[openSettings] musicToggle.checked:', modalToggleNow.checked, 'musicOn:', musicOn);
        }
    }, 0);
}

function closeSettings() {
    document.getElementById('settingsOverlay').classList.add('hidden');
    document.getElementById('settingsModal').classList.add('hidden');
}


function setThemeState(isLight) {
    if (isLight) {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
    
    const toggles = [
        document.getElementById('themeToggle'),
        document.getElementById('themeToggleMenu')
    ];
    toggles.forEach(t => { if (t) t.checked = isLight; });
}

function handleThemeToggle(e) {
    setThemeState(e.target.checked);
}

function setupThemeToggles() {
    const toggles = [
        document.getElementById('themeToggle'),
        document.getElementById('themeToggleMenu')
    ];
    toggles.forEach(toggle => {
        if (toggle) {
            toggle.removeEventListener('change', handleThemeToggle);
            toggle.addEventListener('change', handleThemeToggle);
            toggle.checked = document.body.classList.contains('light-mode');
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    setupMusicToggles();
    setupThemeToggles();
    
    if (document.getElementById('musicToggle')) {
        document.getElementById('musicToggle').checked = musicOn;
    }
    if (document.getElementById('musicToggleSide')) {
        document.getElementById('musicToggleSide').checked = musicOn;
    }
    if (document.getElementById('themeToggle')) {
        document.getElementById('themeToggle').checked = document.body.classList.contains('light-mode');
    }
    if (document.getElementById('themeToggleMenu')) {
        document.getElementById('themeToggleMenu').checked = document.body.classList.contains('light-mode');
    }
});




const SUPABASE_URL = 'https://rviauvfmupalibfvdyew.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2aWF1dmZtdXBhbGliZnZkeWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzQ3MjQsImV4cCI6MjA2NzIxMDcyNH0._d4IlmlXWZ73maRQNT1XvXKepUL1k30MaSOgdqNP1J4';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


async function fetchLeaderboard(category = 'sproukels') {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('category', category)
    .order('score', { ascending: false })
    .limit(10);
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}


async function submitScore(username, score, category = 'sproukels') {
  const { data, error } = await supabase
    .from('leaderboard')
    .upsert([{ username, score, category }], { onConflict: ['username', 'category'] });
  if (error) {
    console.error(error);
    return false;
  }
  return true;
}


if (typeof window !== 'undefined') {
  window.submitScore = submitScore;
  window.fetchLeaderboard = fetchLeaderboard;
  console.log('submitScore and fetchLeaderboard are now globally available');
}


async function renderLeaderboard(category) {
    
    const leaderboardContent = document.getElementById('leaderboardContent');
    if (!leaderboardContent) return;
    const categories = ['sproukels', 'levels', 'plants'];
    categories.forEach(cat => {
        let list = leaderboardContent.querySelector(`.leaderboard-list[data-category="${cat}"]`);
        if (!list) {
            list = document.createElement('div');
            list.className = 'leaderboard-list';
            list.setAttribute('data-category', cat);
            list.style.display = 'none';
            leaderboardContent.appendChild(list);
        }
    });
    
    const lists = leaderboardContent.querySelectorAll('.leaderboard-list');
    lists.forEach(list => list.style.display = 'none');
    let list = leaderboardContent.querySelector(`.leaderboard-list[data-category="${category}"]`);
    if (!list) return;
    list.innerHTML = '<div class="leaderboard-loading">Loading...</div>';
    list.style.display = '';
    const data = await fetchLeaderboard(category);
    list.innerHTML = '';
    if (!data || data.length === 0) {
        list.innerHTML = '<div class="leaderboard-empty">No scores yet!</div>';
        return;
    }
    
    let scoreLabel = 'Sproukels';
    if (category === 'levels') scoreLabel = 'Levels';
    if (category === 'plants') scoreLabel = 'Planted';
    data.forEach((entry, idx) => {
        const row = document.createElement('div');
        row.className = 'leaderboard-row';
        let trophy = '';
        if (idx === 0) trophy = '../game-objects/First_Place_t.png';
        if (idx === 1) trophy = '../game-objects/Second_Place_t.png';
        if (idx === 2) trophy = '../game-objects/Third_Place_t.png';
        row.innerHTML =
            (idx < 3 ? `<img src="${trophy}" alt="${idx+1}st Place" class="leaderboard-icon" />` : `<span class="leaderboard-rank" style="min-width:48px;text-align:center;font-size:1.2em;">${idx+1}</span>`) +
            `<span class="leaderboard-rank">${idx === 0 ? '1st Place' : idx === 1 ? '2nd Place' : idx === 2 ? '3rd Place' : (idx+1)}</span>` +
            `<span class="leaderboard-name">${entry.username || entry.name || 'Player'}</span>` +
            `<span class="leaderboard-score">${entry.score} ${scoreLabel}</span>`;
        list.appendChild(row);
    });
    
    const tabs = document.querySelectorAll('.leaderboard-tab');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-category') === category) {
            tab.classList.add('active');
            tab.style.background = 'linear-gradient(90deg, #ffe066 60%, #ffd700 100%)';
            tab.style.color = '#232323';
            tab.style.fontWeight = 'bold';
            tab.style.boxShadow = '0 0 0 2px #ffd70099';
        } else {
            tab.classList.remove('active');
            tab.style.background = '';
            tab.style.color = '';
            tab.style.fontWeight = '';
            tab.style.boxShadow = '';
        }
    });
    
    if (typeof currentLeaderboardCategory !== 'undefined') {
        currentLeaderboardCategory = category;
    }
}



document.addEventListener('DOMContentLoaded', () => {
    setupMusicToggles();
    setupThemeToggles();
    
    if (document.getElementById('musicToggle')) {
        document.getElementById('musicToggle').checked = musicOn;
    }
    if (document.getElementById('musicToggleSide')) {
        document.getElementById('musicToggleSide').checked = musicOn;
    }
    if (document.getElementById('themeToggle')) {
        document.getElementById('themeToggle').checked = document.body.classList.contains('light-mode');
    }
    if (document.getElementById('themeToggleMenu')) {
        document.getElementById('themeToggleMenu').checked = document.body.classList.contains('light-mode');
    }

    
    const tabs = document.querySelectorAll('.leaderboard-tab');
    const activeCategory = (typeof currentLeaderboardCategory !== 'undefined' ? currentLeaderboardCategory : 'sproukels');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-category') === activeCategory) {
            tab.classList.add('active');
            tab.style.background = 'linear-gradient(90deg, #ffe066 60%, #ffd700 100%)';
            tab.style.color = '#232323';
            tab.style.fontWeight = 'bold';
            tab.style.boxShadow = '0 0 0 2px #ffd70099';
        } else {
            tab.classList.remove('active');
            tab.style.background = '';
            tab.style.color = '';
            tab.style.fontWeight = '';
            tab.style.boxShadow = '';
        }
    });
});




async function submitAllScores() {
    if (!window.game || !window.game.gameData) return;
    const username = window.game.gameData.username || 'Player';
    const sproukels = window.game.gameData.coins || 0;
    const level = window.game.gameData.level || 1;
    const plants = window.game.gameData.totalHarvests || 0;
    await Promise.all([
        submitScore(username, sproukels, 'sproukels'),
        submitScore(username, level, 'levels'),
        submitScore(username, plants, 'plants')
    ]);
}

if (typeof window !== 'undefined') {
  window.submitAllScores = submitAllScores;
}


let leaderboardRefreshTimer = null;
let leaderboardSubmitTimer = null;
let currentLeaderboardCategory = 'sproukels';

function startLeaderboardAutoTasks() {
    if (leaderboardRefreshTimer) clearInterval(leaderboardRefreshTimer);
    if (leaderboardSubmitTimer) clearInterval(leaderboardSubmitTimer);
    
    leaderboardRefreshTimer = setInterval(() => {
        renderLeaderboard(currentLeaderboardCategory);
    }, 10000);
    leaderboardSubmitTimer = setInterval(() => {
        submitAllScores();
    }, 10000);
    
    const originalPlantSeed = SproutlyGame.prototype.plantSeed;
    SproutlyGame.prototype.plantSeed = function(row, col) {
        originalPlantSeed.call(this, row, col);
        submitAllScores();
    };
}


document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        startLeaderboardAutoTasks();
    }, 1000); 
});

function hideOrpheus() {
    document.getElementById('orpheusFlag').style.display = 'none';
}

function unlockCell(btn) {
    
    const hiddenCells = document.querySelectorAll('.plant-cell.hidden');
    if (hiddenCells.length > 0) {
        hiddenCells[0].classList.remove('hidden');
        
        hiddenCells[0].classList.add('locked');
        hiddenCells[0].appendChild(btn);
    } else {
        
        btn.style.display = 'none';
    }
    
    alert("Sproukels")
}

function openPanel(panel) {
    
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
    } else if (panel === 'equipment') {
        btn = document.querySelector('.equipment-btn');
        panelDiv = document.getElementById('equipmentPanel');
    } else if (panel === 'leaderboard') {
        btn = document.querySelector('.leaderboard-btn');
        panelDiv = document.getElementById('leaderboardPanel');
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
            
            if (document.getElementById('musicToggleSide')) {
                document.getElementById('musicToggleSide').checked = musicOn;
            }
            if (document.getElementById('themeToggle')) {
                document.getElementById('themeToggle').checked = document.body.classList.contains('light-mode');
            }
            setupMusicToggles(); 
        }
    }
}



document.addEventListener('DOMContentLoaded', () => {
    console.log('Sproutly Ready to Start...');
});


document.addEventListener('visibilitychange', () => {
    if (window.game && document.visibilityState === 'visible') {
        window.game.processOfflineGrowth();
        window.game.updateUI();
    }
});

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
    
    document.getElementById('settingsOverlay').classList.add('hidden');
    document.getElementById('settingsModal').classList.add('hidden');
}

function confirmBackToMenu(yes) {
    if (yes) {
        document.getElementById('gameUI').classList.add('hidden');
        document.getElementById('menu').classList.remove('hidden');
        
        const homerFooter = document.querySelector('.homer_footer_container');
        if (homerFooter) homerFooter.classList.remove('hidden');
        
        const orpheusFlag = document.getElementById('orpheusFlag');
        if (orpheusFlag) orpheusFlag.style.display = 'block';
        closePanelOverlay();
    } else {
        closePanelOverlay();
    }
}