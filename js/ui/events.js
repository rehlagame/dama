// js/ui/events.js

class Events {
    constructor(board, renderer, rules, ai) {
        this.board = board;
        this.renderer = renderer;
        this.rules = rules;
        this.ai = ai;
        this.currentPlayer = CONFIG.PLAYER;
        this.selectedSquare = null;
        this.validMoves = [];
        this.isChainCapturing = false;
        this.isGameOver = false; // متغير جديد لمنع اللعب بعد النهاية
        this.boardElement = document.getElementById('dama-board');
        this.initEvents();
    }

    initEvents() {
        this.boardElement.addEventListener('click', (e) => {
            if (this.currentPlayer === CONFIG.ROBOT || this.isGameOver) return;

            const square = e.target.closest('.square');
            if (!square) return;
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            this.handleSquareClick(row, col);
        });
    }

    handleSquareClick(row, col) {
        const piece = this.board.getPiece(row, col);

        if (this.isChainCapturing) {
            const move = this.validMoves.find(m => m.row === row && m.col === col);
            if (move) this.executeMove(move);
            return;
        }

        if (piece !== CONFIG.EMPTY && Math.sign(piece) === this.currentPlayer) {
            const globalCaptures = this.rules.getAllCaptures(this.board, this.currentPlayer);
            if (globalCaptures.length > 0) {
                const canThisPieceCapture = globalCaptures.some(c => c.fromRow === row && c.fromCol === col);
                if (!canThisPieceCapture) return;
            }

            this.selectedSquare = { row, col };
            this.validMoves = this.rules.getValidMoves(this.board, row, col, this.currentPlayer);
            this.updateUI();
            return;
        }

        if (this.selectedSquare) {
            const move = this.validMoves.find(m => m.row === row && m.col === col);
            if (move) {
                this.executeMove(move);
            } else {
                this.selectedSquare = null;
                this.validMoves = [];
                this.updateUI();
            }
        }
    }

    executeMove(move) {
        const fromRow = this.selectedSquare.row;
        const fromCol = this.selectedSquare.col;

        this.board.movePiece(fromRow, fromCol, move.row, move.col);
        let continuedCapture = false;

        if (move.type === 'capture') {
            this.board.removePiece(move.capturedRow, move.capturedCol);
            this.board.promoteIfEligible(move.row, move.col);

            const nextMoves = this.rules.getValidMoves(this.board, move.row, move.col, this.currentPlayer);
            const nextCaptures = nextMoves.filter(m => m.type === 'capture');

            if (nextCaptures.length > 0) {
                continuedCapture = true;
                this.isChainCapturing = true;
                this.selectedSquare = { row: move.row, col: move.col };
                this.validMoves = nextCaptures;
            }
        } else {
            this.board.promoteIfEligible(move.row, move.col);
        }

        if (!continuedCapture) {
            this.endTurn();
        } else {
            this.updateUI();
            if (this.currentPlayer === CONFIG.ROBOT) {
                setTimeout(() => {
                    let nextMove = this.validMoves[0];
                    if (this.validMoves.length > 1) {
                        nextMove = this.ai.getBestChainCapture(this.board, this.validMoves, move.row, move.col, CONFIG.ROBOT);
                    }
                    this.executeMove(nextMove);
                }, 600);
            }
        }
    }

    endTurn() {
        this.isChainCapturing = false;
        this.selectedSquare = null;
        this.validMoves = [];
        this.currentPlayer = this.currentPlayer === CONFIG.PLAYER ? CONFIG.ROBOT : CONFIG.PLAYER;
        this.updateUI();

        // فحص حالة النهاية قبل تسليم الدور
        const winner = this.checkGameOver(this.currentPlayer);
        if (winner) {
            this.handleGameEnd(winner);
            return;
        }

        if (this.currentPlayer === CONFIG.ROBOT) {
            setTimeout(() => this.playAI(), 700);
        }
    }

    // دالة فحص من الفائز
    checkGameOver(playerToPlay) {
        const scores = this.board.countPieces();
        if (scores.playerPieces === 0) return CONFIG.ROBOT;
        if (scores.robotPieces === 0) return CONFIG.PLAYER;

        // هل اللاعب الذي عليه الدور محاصر (لا يملك حركات)؟
        let hasMoves = false;
        for (let r = 0; r < CONFIG.ROWS; r++) {
            for (let c = 0; c < CONFIG.COLS; c++) {
                if (Math.sign(this.board.getPiece(r, c)) === playerToPlay) {
                    if (this.rules.getValidMoves(this.board, r, c, playerToPlay).length > 0) {
                        hasMoves = true; break;
                    }
                }
            }
            if (hasMoves) break;
        }

        if (!hasMoves) {
            return playerToPlay === CONFIG.PLAYER ? CONFIG.ROBOT : CONFIG.PLAYER;
        }
        return null;
    }

    // تنفيذ إجراءات نهاية اللعبة
    handleGameEnd(winner) {
        this.isGameOver = true; // إيقاف اللعب
        window.gameTimer.stop(); // إيقاف العداد

        const timeStr = document.getElementById('game-timer').textContent;
        const title = winner === CONFIG.PLAYER ? "كفو.. أنت البطل!" : "للأسف.. هاردلك!";
        const msg = winner === CONFIG.PLAYER ? "لقد سحقت الذكاء الاصطناعي ببراعة، خططك كانت أذكى." : "الروبوت حسم المعركة هذه المرة، حاول أن تنصب له فخاً في المرة القادمة!";

        // إظهار اللوحة بعد نصف ثانية ليرى اللاعب آخر حركة
        setTimeout(() => {
            this.renderer.showGameOver(title, msg, timeStr);
        }, 500);
    }

    playAI() {
        const bestPlay = this.ai.getBestMove(this.board, CONFIG.ROBOT);
        if (bestPlay) {
            this.selectedSquare = bestPlay.from;
            this.validMoves = this.rules.getValidMoves(this.board, bestPlay.from.row, bestPlay.from.col, CONFIG.ROBOT);
            this.executeMove(bestPlay.to);
        } else {
            this.handleGameEnd(CONFIG.PLAYER);
        }
    }

    updateUI() {
        this.renderer.drawBoard();
        const scores = this.board.countPieces();
        this.renderer.updateDashboard(scores.playerPieces, scores.playerKings, scores.robotPieces, scores.robotKings);

        if (this.selectedSquare && this.currentPlayer === CONFIG.PLAYER) {
            const index = this.selectedSquare.row * CONFIG.COLS + this.selectedSquare.col;
            this.boardElement.children[index].classList.add('selected');
        }

        if (this.currentPlayer === CONFIG.PLAYER) {
            this.validMoves.forEach(move => {
                const index = move.row * CONFIG.COLS + move.col;
                this.boardElement.children[index].classList.add('valid-move');
            });
        }
    }
}