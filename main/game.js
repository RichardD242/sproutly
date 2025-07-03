// Sproutly Game - Complete Implementation

// Music functionality
let musicOn = true;
let audio = null;

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
                luckLevel: 0, // 0: not owned, 1: I, 2: II, 3: III
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
            { id: 'luck', name: ['Lucky Charm I', 'Lucky Charm II', 'Lucky Charm III'], price: [100, 200, 400], icon: ['../game-objects/Luck1_t.png','../game-objects/Luck2_t.png','../game-objects/Luck3_t.png'], desc: 'Increases luck.' },
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
        console.log('🌱 Initializing Sproutly Game...');
        // this.loadGame(); // REMOVE or comment out this line!
        this.createGarden();
        this.updateUI();
        this.startGameLoop();
        console.log('✅ Sproutly Game Ready!');
    }

    // Save/Load System
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
        // Gather all saves
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

        // Build the list
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
        // Remove or comment out this line:
        // document.getElementById('panelOverlay').classList.add('hidden');
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
        if (!seed) return;
        // Apply gloves discount if owned
        let seedCost = seed.cost;
        if (this.gameData.equipment.gloves) {
            seedCost = Math.ceil(seedCost * 0.75);
        }
        if (this.gameData.coins < seedCost) {
            this.showNotification('Not enough Sproukels!');
            return;
        }

        // Luck-based giant plant chance
        let luckLevel = this.gameData.equipment.luckLevel || 0;
        let giantChance = [0.05, 0.15, 0.3, 0.5][luckLevel]; // 5%, 15%, 30%, 50%
        const isGiant = Math.random() < giantChance;

        let giantSize = 48;
        let giantRewardMultiplier = 1;
        if (isGiant) {
            // Random size between 60 and 96px
            giantSize = Math.floor(Math.random() * (96 - 60 + 1)) + 60;
            // Map size to multiplier: 1.5x for 60px, 3x for 96px (linear)
            const minSize = 60, maxSize = 96, minMult = 1.5, maxMult = 3.0;
            let floatMult = minMult + ((giantSize - minSize) / (maxSize - minSize)) * (maxMult - minMult);
            giantRewardMultiplier = Math.round(floatMult); // round to nearest integer
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
            // Use integer multiplier for giant plants
            reward *= plant.giantRewardMultiplier || 2;
            reward = Math.round(reward); // round to integer
        }
        this.gameData.coins += reward;
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

    // UI Updates
    updateUI() {
        this.updateStats();
        this.updateGarden();
        this.updateSeedShop();
        this.updateEquipmentShop();
        this.updateActiveArea();
    }

    updateStats() {
        // Update sproukels counter
        const sproukelsAmount = document.getElementById('sproukelsAmount');
        if (sproukelsAmount) {
            sproukelsAmount.textContent = this.gameData.coins;
        }

        // XP Counter/Bar
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
            // Reset cell
            cell.className = 'plant-cell';
            cell.innerHTML = '';
            if (plant) {
                const seed = this.seeds.find(s => s.id === plant.seedId);
                if (seed) {
                    cell.classList.add('planted');
                    let imgPath = `../game-objects/Sproutly-${seed.name}/${plant.stage + 1}_t.png`;
                    // Use random size for giant plants
                    let imgSize = plant.giant ? (plant.giantSize || 80) : 48;
                    let giantClass = plant.giant ? 'giant-plant' : '';
                    cell.innerHTML = `<div class=\"plant-display ${giantClass}\"><img src=\"${imgPath}\" alt=\"${seed.name}\" width=\"${imgSize}\" height=\"${imgSize}\" style=\"image-rendering: crisp-edges;\"/></div>`;
                    if (plant.giant) cell.classList.add('giant');
                    if (plant.stage === 3) {
                        cell.classList.add('ready');
                        cell.title = `${seed.name} - Ready to harvest!`;
                    } else {
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
        // Apply gloves discount if owned
        const glovesOwned = this.gameData.equipment.gloves;
        // Sort seeds by required level (ascending)
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

    updateEquipmentShop() {
        const shop = document.getElementById('equipment-shop');
        if (!shop) return;
        shop.innerHTML = '';
        // Helper for card layout
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
            // Icon
            const img = document.createElement('img');
            img.src = icon;
            img.alt = name;
            img.className = 'equipment-icon';
            img.style.width = isLuck ? '48px' : '40px';
            img.style.height = isLuck ? '48px' : '40px';
            img.style.margin = '0 8px 0 0';
            // Info
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
            // Price
            const p = document.createElement('div');
            p.className = 'equipment-price';
            p.style.fontSize = '0.98rem';
            if (maxed) {
                p.textContent = 'Maxed';
            } else {
                p.innerHTML = `${price} <img src='SproukelsIcon.png' style='width:16px;vertical-align:middle;'/>`;
            }
            info.appendChild(p);
            // Button
            const btn = document.createElement('button');
            btn.className = 'menu-btn';
            btn.id = buyId;
            btn.textContent = owned ? 'Owned' : (maxed ? 'Owned' : 'Buy');
            btn.disabled = !!owned || !!disabled || !!maxed;
            btn.style.marginLeft = '16px';
            btn.style.minWidth = '64px';
            btn.onclick = onBuy;
            // Compose
            bar.appendChild(img);
            bar.appendChild(info);
            bar.appendChild(btn);
            return bar;
        }
        // Gloves
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
            // Updated description
            desc: 'Reduces all seed prices by 25%.',
            disabled: this.gameData.coins < gloves.price
        }));
        // Luck Charm (Upgradable)
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
        // Sprinkler I
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
            // Updated description
            desc: 'Plants grow 10% faster.',
            disabled: this.gameData.coins < sprinkler1.price
        }));
        // Sprinkler II
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
            // Updated description
            desc: 'Plants grow 25% faster.',
            disabled: this.gameData.coins < sprinkler2.price
        }));
    }

    updateActiveArea() {
        const area = document.getElementById('activeAreaContent');
        if (!area) return;
        area.innerHTML = '';
        // Luck
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
        // Gloves
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
        // Show only the highest owned sprinkler
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
        // If nothing active
        if (!area.hasChildNodes()) {
            const none = document.createElement('div');
            none.textContent = 'No equipment active.';
            none.style.color = '#aaa';
            none.style.fontSize = '0.95rem';
            area.appendChild(none);
        }
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
        // Sprinkler speedup
        let speedup = 1;
        if (this.gameData.equipment.sprinkler2) {
            speedup = 1.25; // 25% faster
        } else if (this.gameData.equipment.sprinkler1) {
            speedup = 1.10; // 10% faster
        }
        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                const plant = this.gameData.garden[row][col];
                if (plant && plant.stage < 3) {
                    const seed = this.seeds.find(s => s.id === plant.seedId);
                    if (seed) {
                        const timeSincePlanted = (now - plant.plantedAt) / 1000;
                        // Apply speedup to stage time
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

    // Reset all game state including sproukels
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

    // Animate progress bar
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
    // Gather all saves
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

    // Build the list
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
    // Remove or comment out this line:
    // document.getElementById('panelOverlay').classList.add('hidden');
}

function openSettings() {
    document.getElementById('settingsOverlay').classList.remove('hidden');
    document.getElementById('settingsModal').classList.remove('hidden');
    document.getElementById('musicToggle').checked = musicOn;
}

function closeSettings() {
    document.getElementById('settingsOverlay').classList.add('hidden');
    document.getElementById('settingsModal').classList.add('hidden');
}

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
    // Sync both toggles
    if (document.getElementById('musicToggle')) {
        document.getElementById('musicToggle').checked = musicOn;
    }
    if (document.getElementById('musicToggleSide')) {
        document.getElementById('musicToggleSide').checked = musicOn;
    }
}

function handleMusicToggle(e) {
    setMusicState(e.target.checked);
}

// Set up event listeners for both toggles
function setupMusicToggles() {
    const toggle1 = document.getElementById('musicToggle');
    const toggle2 = document.getElementById('musicToggleSide');
    if (toggle1) {
        toggle1.removeEventListener('change', handleMusicToggle);
        toggle1.addEventListener('change', handleMusicToggle);
    }
    if (toggle2) {
        toggle2.removeEventListener('change', handleMusicToggle);
        toggle2.addEventListener('change', handleMusicToggle);
    }
    setMusicState(musicOn); // Set initial state
}

function setThemeState(isLight) {
    document.body.classList.toggle('light-mode', isLight);
    // Sync all theme toggles
    if (document.getElementById('themeToggle')) {
        document.getElementById('themeToggle').checked = isLight;
    }
    if (document.getElementById('themeToggleMenu')) {
        document.getElementById('themeToggleMenu').checked = isLight;
    }
}

function handleThemeToggle(e) {
    setThemeState(e.target.checked);
}

function setupThemeToggles() {
    const toggle1 = document.getElementById('themeToggle');
    const toggle2 = document.getElementById('themeToggleMenu');
    if (toggle1) {
        toggle1.removeEventListener('change', handleThemeToggle);
        toggle1.addEventListener('change', handleThemeToggle);
    }
    if (toggle2) {
        toggle2.removeEventListener('change', handleThemeToggle);
        toggle2.addEventListener('change', handleThemeToggle);
    }
    setThemeState(document.body.classList.contains('light-mode'));
}

// --- Leaderboard data and rendering ---
const leaderboardData = {
    sproukels: [
        { rank: 1, name: 'PlayerOne', score: 9999 },
        { rank: 2, name: 'PlayerTwo', score: 8888 },
        { rank: 3, name: 'PlayerThree', score: 7777 }
    ],
    levels: [
        { rank: 1, name: 'PlayerOne', score: 99 },
        { rank: 2, name: 'PlayerTwo', score: 88 },
        { rank: 3, name: 'PlayerThree', score: 77 }
    ],
    plants: [
        { rank: 1, name: 'PlayerOne', score: 123 },
        { rank: 2, name: 'PlayerTwo', score: 111 },
        { rank: 3, name: 'PlayerThree', score: 100 }
    ]
};

function renderLeaderboard(category) {
    const lists = document.querySelectorAll('#leaderboardContent .leaderboard-list');
    lists.forEach(list => list.style.display = 'none');
    let list = document.querySelector(`#leaderboardContent .leaderboard-list[data-category="${category}"]`);
    if (!list) return;
    list.innerHTML = '';
    leaderboardData[category].forEach(entry => {
        const row = document.createElement('div');
        row.className = 'leaderboard-row';
        let trophy = '../game-objects/First_Place_t.png';
        if (entry.rank === 2) trophy = '../game-objects/Second_Place_t.png';
        if (entry.rank === 3) trophy = '../game-objects/Third_Place_t.png';
        row.innerHTML = `
            <img src="${trophy}" alt="${entry.rank}st Place" class="leaderboard-icon" />
            <span class="leaderboard-rank">${entry.rank === 1 ? '1st Place' : entry.rank === 2 ? '2nd Place' : '3rd Place'}</span>
            <span class="leaderboard-name">${entry.name}</span>
            <span class="leaderboard-score">${entry.score} pts</span>
        `;
        list.appendChild(row);
    });
    list.style.display = '';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupMusicToggles();
    setupThemeToggles();
    // Set initial toggle states
    if (document.getElementById('musicToggle')) {
        document.getElementById('musicToggle').checked = musicOn;
    }
    if (document.getElementById('musicToggleSide')) {
        document.getElementById('musicToggleSide').checked = musicOn;
    }
    
    // Auto-start music if enabled
    if (musicOn) {
        setTimeout(() => toggleMusic(), 1000); // Delay to ensure user interaction
    }

    // Leaderboard tab switching
    const tabs = document.querySelectorAll('.leaderboard-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const cat = tab.getAttribute('data-category');
            renderLeaderboard(cat);
        });
    });
    // Default to first tab
    if (tabs[0]) {
        tabs[0].classList.add('active');
        renderLeaderboard('sproukels');
    }
});

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
            document.getElementById('musicToggleSide').checked = musicOn;
            document.getElementById('themeToggle').checked = document.body.classList.contains('light-mode');
        }
    }
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
    // Deprecated: use handleThemeToggle instead
}