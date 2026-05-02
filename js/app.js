// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = new Board();
    const gameRenderer = new Renderer(gameBoard);
    const gameRules = new Rules();
    const gameAI = new AI(gameRules);
    const gameEvents = new Events(gameBoard, gameRenderer, gameRules, gameAI);

    // جعل العداد Global لكي يستطيع قاضي اللعبة إيقافه
    window.gameTimer = new Timer();
    window.gameTimer.start();

    gameRenderer.drawBoard();
    const initialScores = gameBoard.countPieces();
    gameRenderer.updateDashboard(initialScores.playerPieces, 0, initialScores.robotPieces, 0);

    // --- تفعيل الأزرار الرئيسية ---
    document.getElementById('btn-start').addEventListener('click', () => {
        if(confirm('هل أنت متأكد من بدء معركة جديدة؟')) {
            window.location.reload();
        }
    });

    // تفعيل زر إعادة اللعب الموجود داخل نافذة النهاية
    document.getElementById('btn-play-again').addEventListener('click', () => {
        window.location.reload();
    });

    let historyStack = [];
    const btnUndo = document.getElementById('btn-undo');

    const originalHandleClick = gameEvents.handleSquareClick.bind(gameEvents);
    gameEvents.handleSquareClick = function(row, col) {
        if (this.currentPlayer === CONFIG.PLAYER && !this.isChainCapturing && this.selectedSquare && !this.isGameOver) {
            const move = this.validMoves.find(m => m.row === row && m.col === col);
            if (move) {
                const gridCopy = gameBoard.grid.map(arr => [...arr]);
                historyStack.push(gridCopy);
                btnUndo.disabled = false;
            }
        }
        originalHandleClick(row, col);
    };

    btnUndo.addEventListener('click', () => {
        if (gameEvents.currentPlayer === CONFIG.ROBOT || historyStack.length === 0 || gameEvents.isGameOver) return;

        const previousGrid = historyStack.pop();
        gameBoard.grid = previousGrid.map(arr => [...arr]);

        gameEvents.currentPlayer = CONFIG.PLAYER;
        gameEvents.selectedSquare = null;
        gameEvents.validMoves = [];
        gameEvents.isChainCapturing = false;

        if (historyStack.length === 0) {
            btnUndo.disabled = true;
        }

        gameEvents.updateUI();
    });
});