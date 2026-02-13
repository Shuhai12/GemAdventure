// 游戏配置
const BOARD_SIZE = 8;
const API_URL = 'http://localhost:3001/api';
let GEM_TYPES = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const GEM_ICONS = {
    red: '🔴',
    blue: '🔵',
    green: '🟢',
    yellow: '🟡',
    purple: '🟣',
    orange: '🟠'
};

// 关卡配置
let levelConfig = null;

// 游戏状态
let gameState = {
    board: [],
    score: 0,
    moves: 30,
    level: 1,
    goalScore: 1000,
    selectedGem: null,
    isProcessing: false
};

// 加载关卡配置
async function loadLevelConfig(levelId) {
    try {
        const response = await fetch(`${API_URL}/levels/${levelId}`);
        if (!response.ok) {
            throw new Error('关卡不存在');
        }
        levelConfig = await response.json();

        // 根据配置更新游戏状态
        gameState.moves = levelConfig.moves;
        gameState.goalScore = levelConfig.targetScore;
        gameState.level = levelConfig.id;

        // 更新宝石颜色种类
        GEM_TYPES = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'].slice(0, levelConfig.gemColors);

        // 更新目标文本
        document.getElementById('goalText').textContent = levelConfig.description || `达到 ${levelConfig.targetScore} 分`;

        return true;
    } catch (error) {
        console.error('加载关卡配置失败:', error);
        alert('加载关卡失败，使用默认配置');
        return false;
    }
}

// 初始化游戏
async function initGame() {
    await loadLevelConfig(gameState.level);
    gameState.board = createBoard();
    renderBoard();
    updateUI();
    startRandomEvents();
}

// 创建棋盘
function createBoard() {
    const board = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        board[row] = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            board[row][col] = getRandomGemType();
        }
    }
    // 确保初始没有匹配
    removeInitialMatches(board);
    return board;
}

// 获取随机宝石类型
function getRandomGemType() {
    return GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
}

// 移除初始匹配
function removeInitialMatches(board) {
    let hasMatches = true;
    while (hasMatches) {
        hasMatches = false;
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (col < BOARD_SIZE - 2) {
                    if (board[row][col] === board[row][col + 1] &&
                        board[row][col] === board[row][col + 2]) {
                        board[row][col] = getRandomGemType();
                        hasMatches = true;
                    }
                }
                if (row < BOARD_SIZE - 2) {
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

// 渲染棋盘
function renderBoard() {
    const boardElement = document.getElementById('gameBoard');
    boardElement.innerHTML = '';

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const gemType = gameState.board[row][col];
            const gemElement = document.createElement('div');
            gemElement.className = `gem ${gemType}`;
            gemElement.dataset.row = row;
            gemElement.dataset.col = col;
            gemElement.textContent = GEM_ICONS[gemType];
            gemElement.onclick = () => selectGem(row, col);
            boardElement.appendChild(gemElement);
        }
    }
}

// 选择宝石
function selectGem(row, col) {
    if (gameState.isProcessing) return;

    const gem = { row, col };

    if (!gameState.selectedGem) {
        gameState.selectedGem = gem;
        highlightGem(row, col, true);
    } else {
        if (isAdjacent(gameState.selectedGem, gem)) {
            swapGems(gameState.selectedGem, gem);
        }
        highlightGem(gameState.selectedGem.row, gameState.selectedGem.col, false);
        gameState.selectedGem = null;
    }
}

// 高亮宝石
function highlightGem(row, col, highlight) {
    const gemElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (gemElement) {
        if (highlight) {
            gemElement.classList.add('selected');
        } else {
            gemElement.classList.remove('selected');
        }
    }
}

// 判断是否相邻
function isAdjacent(gem1, gem2) {
    const rowDiff = Math.abs(gem1.row - gem2.row);
    const colDiff = Math.abs(gem1.col - gem2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// 交换宝石
function swapGems(gem1, gem2) {
    gameState.isProcessing = true;

    // 交换数据
    const temp = gameState.board[gem1.row][gem1.col];
    gameState.board[gem1.row][gem1.col] = gameState.board[gem2.row][gem2.col];
    gameState.board[gem2.row][gem2.col] = temp;

    renderBoard();

    setTimeout(() => {
        const matches = findMatches();
        if (matches.length > 0) {
            gameState.moves--;
            processMatches(matches);
        } else {
            // 交换回来
            const temp = gameState.board[gem1.row][gem1.col];
            gameState.board[gem1.row][gem1.col] = gameState.board[gem2.row][gem2.col];
            gameState.board[gem2.row][gem2.col] = temp;
            renderBoard();
            gameState.isProcessing = false;
        }
        updateUI();
        checkGameOver();
    }, 300);
}

// 查找匹配
function findMatches() {
    const matches = new Set();

    // 横向匹配
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE - 2; col++) {
            const type = gameState.board[row][col];
            if (type === gameState.board[row][col + 1] &&
                type === gameState.board[row][col + 2]) {
                matches.add(`${row},${col}`);
                matches.add(`${row},${col + 1}`);
                matches.add(`${row},${col + 2}`);
            }
        }
    }

    // 纵向匹配
    for (let col = 0; col < BOARD_SIZE; col++) {
        for (let row = 0; row < BOARD_SIZE - 2; row++) {
            const type = gameState.board[row][col];
            if (type === gameState.board[row + 1][col] &&
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

// 处理匹配
function processMatches(matches) {
    // 计算分数
    const points = matches.length * 50;
    gameState.score += points;

    // 移除匹配的宝石
    matches.forEach(({ row, col }) => {
        gameState.board[row][col] = null;
    });

    renderBoard();

    setTimeout(() => {
        fillBoard();
        renderBoard();

        setTimeout(() => {
            const newMatches = findMatches();
            if (newMatches.length > 0) {
                processMatches(newMatches);
            } else {
                gameState.isProcessing = false;
            }
        }, 300);
    }, 300);
}

// 填充棋盘
function fillBoard() {
    // 下落
    for (let col = 0; col < BOARD_SIZE; col++) {
        for (let row = BOARD_SIZE - 1; row >= 0; row--) {
            if (gameState.board[row][col] === null) {
                for (let r = row - 1; r >= 0; r--) {
                    if (gameState.board[r][col] !== null) {
                        gameState.board[row][col] = gameState.board[r][col];
                        gameState.board[r][col] = null;
                        break;
                    }
                }
            }
        }
    }

    // 填充新宝石
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameState.board[row][col] === null) {
                gameState.board[row][col] = getRandomGemType();
            }
        }
    }
}

// 更新 UI
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('moves').textContent = gameState.moves;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('goalText').textContent = `达到 ${gameState.goalScore} 分`;
}

// 检查游戏结束
function checkGameOver() {
    if (gameState.score >= gameState.goalScore) {
        showWinModal();
    } else if (gameState.moves <= 0) {
        showLoseModal();
    }
}

// 显示胜利弹窗
function showWinModal() {
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('winModal').style.display = 'flex';
}

// 显示失败弹窗
function showLoseModal() {
    document.getElementById('loseModal').style.display = 'flex';
}

// 下一关
async function nextLevel() {
    gameState.level++;
    gameState.score = 0;
    document.getElementById('winModal').style.display = 'none';
    await initGame();
}

// 重新开始
async function restartLevel() {
    gameState.score = 0;
    document.getElementById('winModal').style.display = 'none';
    document.getElementById('loseModal').style.display = 'none';
    await initGame();
}

// 随机事件
function startRandomEvents() {
    setInterval(() => {
        if (Math.random() < 0.2) {
            triggerRandomEvent();
        }
    }, 30000);
}

function triggerRandomEvent() {
    const events = [
        { name: '神秘商人', text: '神秘商人出现了！获得额外道具！', effect: () => {} },
        { name: '宝石祝福', text: '宝石祝福！接下来获得双倍积分！', effect: () => {} },
        { name: '额外步数', text: '获得了 5 步额外步数！', effect: () => { gameState.moves += 5; updateUI(); } }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    document.getElementById('eventPanel').style.display = 'block';
    document.getElementById('eventText').textContent = event.text;
    event.effect();

    setTimeout(() => {
        document.getElementById('eventPanel').style.display = 'none';
    }, 5000);
}

// 启动游戏
window.onload = initGame;
