// 游戏配置
const CONFIG = {
    BOARD_SIZE: 8,
    GEM_TYPES: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
    SWAP_DURATION: 250,
    FALL_DURATION: 400,
    PARTICLE_COUNT: 15,
    COMBO_BONUS: 1.5
};

// 宝石颜色配置
const GEM_COLORS = {
    red: { primary: '#ff6b6b', secondary: '#ee5a6f', emoji: '🔴', glow: 'rgba(255, 107, 107, 0.6)' },
    blue: { primary: '#4facfe', secondary: '#00f2fe', emoji: '🔵', glow: 'rgba(79, 172, 254, 0.6)' },
    green: { primary: '#43e97b', secondary: '#38f9d7', emoji: '🟢', glow: 'rgba(67, 233, 123, 0.6)' },
    yellow: { primary: '#ffd93d', secondary: '#ffb700', emoji: '🟡', glow: 'rgba(255, 217, 61, 0.6)' },
    purple: { primary: '#a8edea', secondary: '#fed6e3', emoji: '🟣', glow: 'rgba(168, 237, 234, 0.6)' },
    orange: { primary: '#ff9a56', secondary: '#ff6a88', emoji: '🟠', glow: 'rgba(255, 154, 86, 0.6)' }
};

// 游戏状态
let gameState = {
    board: [],
    gems: [],
    score: 0,
    moves: 30,
    level: 1,
    goalScore: 1000,
    selectedGem: null,
    isProcessing: false,
    canvas: null,
    ctx: null,
    gemSize: 0,
    boardOffset: { x: 0, y: 0 },
    touchStart: null,
    activeItem: null,
    items: { hammer: 3, bomb: 2, shuffle: 1 },
    totalScore: 0,
    totalCoins: 0,
    audioEnabled: true,
    animatingGems: []
};

// 宝石对象类
class Gem {
    constructor(type, row, col) {
        this.type = type;
        this.row = row;
        this.col = col;
        this.x = col * gameState.gemSize;
        this.y = row * gameState.gemSize;
        this.targetX = this.x;
        this.targetY = this.y;
        this.scale = 1;
        this.targetScale = 1;
        this.rotation = 0;
        this.alpha = 1;
    }

    update() {
        // 平滑移动
        const speed = 0.3;
        this.x += (this.targetX - this.x) * speed;
        this.y += (this.targetY - this.y) * speed;
        this.scale += (this.targetScale - this.scale) * speed;
    }

    setPosition(row, col) {
        this.row = row;
        this.col = col;
        this.targetX = col * gameState.gemSize;
        this.targetY = row * gameState.gemSize;
    }

    draw(ctx) {
        const colors = GEM_COLORS[this.type];
        const size = gameState.gemSize;
        const padding = size * 0.08;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x + size / 2, this.y + size / 2);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.translate(-size / 2, -size / 2);

        // 绘制发光效果
        if (gameState.selectedGem && 
            gameState.selectedGem.row === this.row && 
            gameState.selectedGem.col === this.col) {
            ctx.shadowColor = colors.glow;
            ctx.shadowBlur = 25;
        } else {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
        }
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // 绘制宝石背景
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(1, colors.secondary);
        ctx.fillStyle = gradient;

        const radius = size * 0.25;
        roundRect(ctx, padding, padding, size - padding * 2, size - padding * 2, radius);
        ctx.fill();

        // 高光效果
        const highlight = ctx.createRadialGradient(
            size * 0.3, size * 0.3, 0,
            size * 0.3, size * 0.3, size * 0.5
        );
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlight;
        ctx.fill();

        // 绘制宝石图标
        ctx.shadowBlur = 0;
        ctx.font = `${size * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(colors.emoji, size / 2, size / 2);

        ctx.restore();
    }
}

// 初始化
window.onload = function() {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'block';
        loadPlayerData();
    }, 1500);
};

// 加载玩家数据
function loadPlayerData() {
    const saved = localStorage.getItem('gemGameData');
    if (saved) {
        const data = JSON.parse(saved);
        gameState.totalScore = data.totalScore || 0;
        gameState.totalCoins = data.totalCoins || 0;
        gameState.level = data.level || 1;
    }
    updateMenuStats();
}

// 保存玩家数据
function savePlayerData() {
    localStorage.setItem('gemGameData', JSON.stringify({
        totalScore: gameState.totalScore,
        totalCoins: gameState.totalCoins,
        level: gameState.level
    }));
}

// 更新菜单统计
function updateMenuStats() {
    document.getElementById('totalScore').textContent = gameState.totalScore;
    document.getElementById('totalCoins').textContent = gameState.totalCoins;
}

// 开始游戏
function startGame() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'flex';
    initGameCanvas();
    resetGame();
    startRandomEvents();
    startGameLoop();
}

// 初始化画布
function initGameCanvas() {
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.ctx = gameState.canvas.getContext('2d');

    const container = gameState.canvas.parentElement;
    const size = Math.min(container.clientWidth, container.clientHeight) - 30;

    gameState.canvas.width = size;
    gameState.canvas.height = size;
    gameState.gemSize = size / CONFIG.BOARD_SIZE;

    // 触摸事件
    gameState.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    gameState.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameState.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // 鼠标事件
    gameState.canvas.addEventListener('mousedown', handleMouseDown);
}

// 游戏循环
function startGameLoop() {
    function loop() {
        if (document.getElementById('gameScreen').style.display === 'flex') {
            updateGame();
            renderGame();
            requestAnimationFrame(loop);
        }
    }
    loop();
}

// 更新游戏
function updateGame() {
    gameState.gems.forEach(row => {
        row.forEach(gem => {
            if (gem) gem.update();
        });
    });
}

// 渲染游戏
function renderGame() {
    const ctx = gameState.ctx;
    ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);

    gameState.gems.forEach(row => {
        row.forEach(gem => {
            if (gem) gem.draw(ctx);
        });
    });
}

// 重置游戏
function resetGame() {
    gameState.score = 0;
    gameState.moves = 30;
    gameState.goalScore = 1000 + (gameState.level - 1) * 500;
    gameState.board = createBoard();
    gameState.gems = createGemObjects();
    gameState.selectedGem = null;
    gameState.isProcessing = false;
    gameState.activeItem = null;
    updateUI();
}

// 创建棋盘
function createBoard() {
    const board = [];
    for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
        board[row] = [];
        for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
            board[row][col] = getRandomGemType();
        }
    }
    removeInitialMatches(board);
    return board;
}

// 创建宝石对象
function createGemObjects() {
    const gems = [];
    for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
        gems[row] = [];
        for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
            gems[row][col] = new Gem(gameState.board[row][col], row, col);
        }
    }
    return gems;
}

// 获取随机宝石
function getRandomGemType() {
    return CONFIG.GEM_TYPES[Math.floor(Math.random() * CONFIG.GEM_TYPES.length)];
}

// 移除初始匹配
function removeInitialMatches(board) {
    let hasMatches = true;
    let attempts = 0;
    while (hasMatches && attempts < 100) {
        hasMatches = false;
        attempts++;
        for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
                if (col < CONFIG.BOARD_SIZE - 2) {
                    if (board[row][col] === board[row][col + 1] &&
                        board[row][col] === board[row][col + 2]) {
                        board[row][col] = getRandomGemType();
                        hasMatches = true;
                    }
                }
                if (row < CONFIG.BOARD_SIZE - 2) {
                    if (board[row][col] === board[row + 1][col] &&
                        board[row][col] === board[row + 2][col]) {
                        board[row][col] = getRandomGemType();
                        hasMatches = true;
                    }
                }
            }
        }
    }
}

// 圆角矩形
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// 触摸开始
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = gameState.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    gameState.touchStart = { x, y };
    handleGemClick(x, y);
}

// 触摸移动
function handleTouchMove(e) {
    e.preventDefault();
}

// 触摸结束
function handleTouchEnd(e) {
    e.preventDefault();
    if (!gameState.touchStart) return;

    const touch = e.changedTouches[0];
    const rect = gameState.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const dx = x - gameState.touchStart.x;
    const dy = y - gameState.touchStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 30 && gameState.selectedGem) {
        handleSwipe(dx, dy);
    }

    gameState.touchStart = null;
}

// 鼠标点击
function handleMouseDown(e) {
    const rect = gameState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleGemClick(x, y);
}

// 处理宝石点击
function handleGemClick(x, y) {
    if (gameState.isProcessing) return;

    const col = Math.floor(x / gameState.gemSize);
    const row = Math.floor(y / gameState.gemSize);

    if (row < 0 || row >= CONFIG.BOARD_SIZE || col < 0 || col >= CONFIG.BOARD_SIZE) return;

    if (gameState.activeItem) {
        useItemOnGem(row, col);
        return;
    }

    if (!gameState.selectedGem) {
        gameState.selectedGem = { row, col };
        gameState.gems[row][col].targetScale = 1.15;
        playSound('select');
    } else {
        if (isAdjacent(gameState.selectedGem, { row, col })) {
            swapGems(gameState.selectedGem, { row, col });
        }
        if (gameState.gems[gameState.selectedGem.row][gameState.selectedGem.col]) {
            gameState.gems[gameState.selectedGem.row][gameState.selectedGem.col].targetScale = 1;
        }
        gameState.selectedGem = null;
    }
}

// 处理滑动
function handleSwipe(dx, dy) {
    if (!gameState.selectedGem) return;

    let targetRow = gameState.selectedGem.row;
    let targetCol = gameState.selectedGem.col;

    if (Math.abs(dx) > Math.abs(dy)) {
        targetCol += dx > 0 ? 1 : -1;
    } else {
        targetRow += dy > 0 ? 1 : -1;
    }

    if (targetRow >= 0 && targetRow < CONFIG.BOARD_SIZE &&
        targetCol >= 0 && targetCol < CONFIG.BOARD_SIZE) {
        swapGems(gameState.selectedGem, { row: targetRow, col: targetCol });
    }

    if (gameState.gems[gameState.selectedGem.row][gameState.selectedGem.col]) {
        gameState.gems[gameState.selectedGem.row][gameState.selectedGem.col].targetScale = 1;
    }
    gameState.selectedGem = null;
}

// 判断相邻
function isAdjacent(gem1, gem2) {
    const rowDiff = Math.abs(gem1.row - gem2.row);
    const colDiff = Math.abs(gem1.col - gem2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// 交换宝石（带动画）
function swapGems(gem1, gem2) {
    gameState.isProcessing = true;

    const g1 = gameState.gems[gem1.row][gem1.col];
    const g2 = gameState.gems[gem2.row][gem2.col];

    // 交换位置动画
    g1.setPosition(gem2.row, gem2.col);
    g2.setPosition(gem1.row, gem1.col);

    // 交换数据
    gameState.gems[gem1.row][gem1.col] = g2;
    gameState.gems[gem2.row][gem2.col] = g1;
    gameState.board[gem1.row][gem1.col] = g2.type;
    gameState.board[gem2.row][gem2.col] = g1.type;

    setTimeout(() => {
        const matches = findMatches();
        if (matches.length > 0) {
            gameState.moves--;
            processMatches(matches);
        } else {
            // 交换回来
            g1.setPosition(gem1.row, gem1.col);
            g2.setPosition(gem2.row, gem2.col);
            gameState.gems[gem1.row][gem1.col] = g1;
            gameState.gems[gem2.row][gem2.col] = g2;
            gameState.board[gem1.row][gem1.col] = g1.type;
            gameState.board[gem2.row][gem2.col] = g2.type;

            setTimeout(() => {
                gameState.isProcessing = false;
            }, CONFIG.SWAP_DURATION);
            playSound('error');
        }
        updateUI();
        checkGameOver();
    }, CONFIG.SWAP_DURATION);
}

// 查找匹配
function findMatches() {
    const matches = new Set();

    for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
        for (let col = 0; col < CONFIG.BOARD_SIZE - 2; col++) {
            const type = gameState.board[row][col];
            if (type && type === gameState.board[row][col + 1] &&
                type === gameState.board[row][col + 2]) {
                matches.add(`${row},${col}`);
                matches.add(`${row},${col + 1}`);
                matches.add(`${row},${col + 2}`);
            }
        }
    }

    for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
        for (let row = 0; row < CONFIG.BOARD_SIZE - 2; row++) {
            const type = gameState.board[row][col];
            if (type && type === gameState.board[row + 1][col] &&
                type === gameState.board[row + 2][col]) {
                matches.add(`${row},${col}`);
                matches.add(`${row + 1},${col}`);
                matches.add(`${row + 2},${col}`);
            }
        }
    }

    return Array.from(matches).map(pos => {
        const [row, col] = pos.split(',').map(Number);
        return { row, col };
    });
}

// 处理匹配（带酷炫特效）
function processMatches(matches) {
    const points = matches.length * 50;
    gameState.score += points;

    matches.forEach(({ row, col }) => {
        const gem = gameState.gems[row][col];
        if (gem) {
            // 消除动画
            gem.targetScale = 0;
            gem.rotation = Math.PI * 2;

            // 创建爆炸粒子
            createExplosionParticles(col, row, gem.type);

            // 显示分数
            showScorePopup(col, row, 50);
        }
        gameState.board[row][col] = null;
        gameState.gems[row][col] = null;
    });

    playSound('match');

    setTimeout(() => {
        fillBoard();

        setTimeout(() => {
            const newMatches = findMatches();
            if (newMatches.length > 0) {
                processMatches(newMatches);
            } else {
                gameState.isProcessing = false;
            }
        }, CONFIG.FALL_DURATION);
    }, 300);
}

// 填充棋盘（带下落动画）
function fillBoard() {
    // 下落
    for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
        let emptySpaces = 0;
        for (let row = CONFIG.BOARD_SIZE - 1; row >= 0; row--) {
            if (gameState.board[row][col] === null) {
                emptySpaces++;
            } else if (emptySpaces > 0) {
                const newRow = row + emptySpaces;
                gameState.board[newRow][col] = gameState.board[row][col];
                gameState.gems[newRow][col] = gameState.gems[row][col];
                gameState.gems[newRow][col].setPosition(newRow, col);
                gameState.board[row][col] = null;
                gameState.gems[row][col] = null;
            }
        }
    }

    // 填充新宝石
    for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
        for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
            if (gameState.board[row][col] === null) {
                const type = getRandomGemType();
                gameState.board[row][col] = type;
                const gem = new Gem(type, row, col);
                gem.y = -gameState.gemSize * (row + 1);
                gem.targetY = row * gameState.gemSize;
                gem.alpha = 0;
                setTimeout(() => { gem.alpha = 1; }, 50);
                gameState.gems[row][col] = gem;
            }
        }
    }
}

// 创建爆炸粒子特效
function createExplosionParticles(col, row, gemType) {
    const container = document.getElementById('particleContainer');
    const rect = gameState.canvas.getBoundingClientRect();
    const x = rect.left + col * gameState.gemSize + gameState.gemSize / 2;
    const y = rect.top + row * gameState.gemSize + gameState.gemSize / 2;

    const colors = GEM_COLORS[gemType];
    const particles = ['✨', '💫', '⭐', '🌟', colors.emoji];

    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];

        const angle = (Math.PI * 2 * i) / CONFIG.PARTICLE_COUNT;
        const distance = 60 + Math.random() * 40;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        particle.style.fontSize = (16 + Math.random() * 12) + 'px';

        container.appendChild(particle);

        setTimeout(() => particle.remove(), 1000);
    }
}

// 显示分数弹出
function showScorePopup(col, row, score) {
    const container = document.getElementById('particleContainer');
    const rect = gameState.canvas.getBoundingClientRect();
    const x = rect.left + col * gameState.gemSize + gameState.gemSize / 2;
    const y = rect.top + row * gameState.gemSize + gameState.gemSize / 2;

    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+' + score;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';

    container.appendChild(popup);

    setTimeout(() => popup.remove(), 1000);
}

// 使用道具
function useItem(itemType) {
    if (gameState.items[itemType] <= 0) {
        showToast('道具不足！');
        return;
    }

    if (gameState.activeItem === itemType) {
        gameState.activeItem = null;
        document.querySelectorAll('.item-button').forEach(btn => {
            btn.classList.remove('active');
        });
    } else {
        gameState.activeItem = itemType;
        document.querySelectorAll('.item-button').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.closest('.item-button').classList.add('active');
        showToast(`选择要使用 ${itemType === 'hammer' ? '🔨锤子' : itemType === 'bomb' ? '💣炸弹' : '🔄洗牌'} 的位置`);
    }
}

// 在宝石上使用道具
function useItemOnGem(row, col) {
    if (!gameState.activeItem) return;

    const itemType = gameState.activeItem;
    gameState.items[itemType]--;
    updateItemCounts();

    if (itemType === 'hammer') {
        const gem = gameState.gems[row][col];
        if (gem) {
            gem.targetScale = 0;
            createExplosionParticles(col, row, gem.type);
        }
        gameState.board[row][col] = null;
        gameState.gems[row][col] = null;
        setTimeout(() => fillBoard(), 300);
    } else if (itemType === 'bomb') {
        for (let r = Math.max(0, row - 1); r <= Math.min(CONFIG.BOARD_SIZE - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(CONFIG.BOARD_SIZE - 1, col + 1); c++) {
                const gem = gameState.gems[r][c];
                if (gem) {
                    gem.targetScale = 0;
                    createExplosionParticles(c, r, gem.type);
                }
                gameState.board[r][c] = null;
                gameState.gems[r][c] = null;
            }
        }
        setTimeout(() => fillBoard(), 300);
    } else if (itemType === 'shuffle') {
        gameState.board = createBoard();
        gameState.gems = createGemObjects();
    }

    gameState.activeItem = null;
    document.querySelectorAll('.item-button').forEach(btn => {
        btn.classList.remove('active');
    });

    playSound('item');
}

// 更新道具数量
function updateItemCounts() {
    document.querySelectorAll('.item-button').forEach(btn => {
        const itemType = btn.dataset.item;
        const countEl = btn.querySelector('.item-count');
        if (countEl) {
            countEl.textContent = gameState.items[itemType];
        }
    });
}

// 更新 UI
function updateUI() {
    document.getElementById('gameScore').textContent = gameState.score;
    document.getElementById('gameMoves').textContent = gameState.moves;
    document.getElementById('currentLevel').textContent = gameState.level;
    document.getElementById('goalText').textContent = `目标: ${gameState.goalScore} 分`;

    const progress = Math.min(100, (gameState.score / gameState.goalScore) * 100);
    document.getElementById('progressFill').style.width = progress + '%';
}

// 检查游戏结束
function checkGameOver() {
    if (gameState.score >= gameState.goalScore) {
        setTimeout(() => showVictory(), 500);
    } else if (gameState.moves <= 0) {
        setTimeout(() => showDefeat(), 500);
    }
}

// 显示胜利
function showVictory() {
    const coins = Math.floor(gameState.score / 10);
    gameState.totalScore += gameState.score;
    gameState.totalCoins += coins;
    savePlayerData();

    document.getElementById('victoryScore').textContent = gameState.score;
    document.getElementById('victoryCoins').textContent = coins;
    document.getElementById('victoryModal').classList.add('show');
    playSound('victory');
}

// 显示失败
function showDefeat() {
    document.getElementById('defeatModal').classList.add('show');
    playSound('defeat');
}

// 下一关
function nextLevel() {
    gameState.level++;
    document.getElementById('victoryModal').classList.remove('show');
    resetGame();
}

// 重新开始
function restartGame() {
    document.getElementById('defeatModal').classList.remove('show');
    resetGame();
}

// 暂停游戏
function pauseGame() {
    document.getElementById('pauseModal').classList.add('show');
}

// 继续游戏
function resumeGame() {
    document.getElementById('pauseModal').classList.remove('show');
}

// 返回菜单
function backToMenu() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'block';
    updateMenuStats();
}

// 显示提示
function showToast(message) {
    const toast = document.getElementById('eventToast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 随机事件
function startRandomEvents() {
    setInterval(() => {
        if (document.getElementById('gameScreen').style.display === 'flex' &&
            !gameState.isProcessing && Math.random() < 0.3) {
            triggerRandomEvent();
        }
    }, 30000);
}

function triggerRandomEvent() {
    const events = [
        {
            name: '神秘商人',
            text: '🧙‍♂️ 神秘商人出现！获得额外道具！',
            effect: () => {
                gameState.items.hammer++;
                updateItemCounts();
            }
        },
        {
            name: '宝石祝福',
            text: '✨ 宝石祝福！获得 200 分奖励！',
            effect: () => {
                gameState.score += 200;
                updateUI();
            }
        },
        {
            name: '额外步数',
            text: '👣 获得 5 步额外步数！',
            effect: () => {
                gameState.moves += 5;
                updateUI();
            }
        }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    showToast(event.text);
    event.effect();
    playSound('event');
}

// 音效
function playSound(type) {
    if (!gameState.audioEnabled) return;
    console.log('Play sound:', type);
}

// 设置
function showSettings() {
    showToast('设置功能开发中...');
}

// 关卡选择
function showLevelSelect() {
    showToast('关卡选择功能开发中...');
}
