// js/engine/board.js

class Board {
    constructor() {
        this.grid = Array(CONFIG.ROWS).fill(null).map(() => Array(CONFIG.COLS).fill(0));
        this.initializePieces();
    }

    initializePieces() {
        for (let r = 1; r <= 2; r++) {
            for (let c = 0; c < CONFIG.COLS; c++) {
                this.grid[r][c] = CONFIG.ROBOT;
            }
        }
        for (let r = 5; r <= 6; r++) {
            for (let c = 0; c < CONFIG.COLS; c++) {
                this.grid[r][c] = CONFIG.PLAYER;
            }
        }
    }

    getPiece(row, col) {
        if (this.isOutOfBounds(row, col)) return null;
        return this.grid[row][col];
    }

    isOutOfBounds(row, col) {
        return row < 0 || row >= CONFIG.ROWS || col < 0 || col >= CONFIG.COLS;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.grid[fromRow][fromCol];
        this.grid[toRow][toCol] = piece;
        this.grid[fromRow][fromCol] = CONFIG.EMPTY;
    }

    // حذف الحجر الذي تم أكله
    removePiece(row, col) {
        this.grid[row][col] = CONFIG.EMPTY;
    }

    // التحقق من الترقية إلى "شيخ"
    promoteIfEligible(row, col) {
        const piece = this.grid[row][col];

        // إذا كان الحجر للاعب العادي ووصل للصف رقم 0 (أعلى الرقعة)
        if (piece === CONFIG.PLAYER && row === 0) {
            this.grid[row][col] = CONFIG.PIECE_KING * CONFIG.PLAYER; // يصبح قيمته 2
            return true;
        }
        // إذا كان الحجر للروبوت ووصل للصف الأخير (أسفل الرقعة)
        if (piece === CONFIG.ROBOT && row === CONFIG.ROWS - 1) {
            this.grid[row][col] = CONFIG.PIECE_KING * CONFIG.ROBOT; // يصبح قيمته -2
            return true;
        }
        return false;
    }

    // دالة إحصاء عدد الأحجار والشيوخ لكل لاعب
    countPieces() {
        let scores = {
            playerPieces: 0, playerKings: 0,
            robotPieces: 0, robotKings: 0
        };

        for (let r = 0; r < CONFIG.ROWS; r++) {
            for (let c = 0; c < CONFIG.COLS; c++) {
                const piece = this.grid[r][c];
                if (piece === CONFIG.EMPTY) continue;

                // حساب أحجار اللاعب
                if (Math.sign(piece) === CONFIG.PLAYER) {
                    scores.playerPieces++;
                    if (Math.abs(piece) === CONFIG.PIECE_KING) scores.playerKings++;
                }
                // حساب أحجار الروبوت
                else if (Math.sign(piece) === CONFIG.ROBOT) {
                    scores.robotPieces++;
                    if (Math.abs(piece) === CONFIG.PIECE_KING) scores.robotKings++;
                }
            }
        }
        return scores;
    }
}