// js/ui/renderer.js

class Renderer {
    constructor(boardInstance) {
        this.board = boardInstance;
        // استهداف حاوية الرقعة الموجودة في HTML
        this.boardElement = document.getElementById('dama-board');
    }

    // الدالة الرئيسية لرسم الرقعة بالكامل بناءً على المصفوفة الحالية
    drawBoard() {
        // تفريغ الرقعة القديمة قبل إعادة الرسم (مهم عند تحديث اللوحة)
        this.boardElement.innerHTML = '';

        for (let row = 0; row < CONFIG.ROWS; row++) {
            for (let col = 0; col < CONFIG.COLS; col++) {

                // 1. إنشاء المربع
                const square = document.createElement('div');
                square.classList.add('square');
                // حفظ إحداثيات المربع ليسهل الرجوع إليها عند النقر
                square.dataset.row = row;
                square.dataset.col = col;

                // 2. التحقق مما إذا كان هناك حجر في هذا المربع بالمصفوفة
                const pieceValue = this.board.getPiece(row, col);

                if (pieceValue !== CONFIG.EMPTY) {
                    // إنشاء عنصر الحجر
                    const piece = document.createElement('div');
                    piece.classList.add('piece');

                    // تحديد لمن يتبع هذا الحجر (لاعب أم روبوت)
                    // نستخدم Math.sign لأن قيمة الشيخ قد تكون 2 أو -2
                    if (Math.sign(pieceValue) === CONFIG.PLAYER) {
                        piece.classList.add('player');
                    } else if (Math.sign(pieceValue) === CONFIG.ROBOT) {
                        piece.classList.add('robot');
                    }

                    // التحقق مما إذا كان الحجر قد تمت ترقيته لـ "شيخ"
                    // Math.abs يعطينا القيمة المطلقة (سواء كانت 2 أو -2 ستصبح 2)
                    if (Math.abs(pieceValue) === CONFIG.PIECE_KING) {
                        piece.classList.add('king');
                    }

                    // وضع الحجر داخل المربع
                    square.appendChild(piece);
                }

                // 3. إضافة المربع (وبداخله الحجر إن وُجد) إلى الرقعة في الشاشة
                this.boardElement.appendChild(square);
            }
        }
    }

    // دالة لتحديث لوحة النتائج العلوية
    updateDashboard(playerPieces, playerKings, robotPieces, robotKings) {
        document.getElementById('player-pieces').textContent = playerPieces;
        document.getElementById('player-kings').textContent = playerKings;

        document.getElementById('robot-pieces').textContent = robotPieces;
        document.getElementById('robot-kings').textContent = robotKings;
    }
    // دالة إظهار نافذة النهاية
    showGameOver(title, message, time) {
        document.getElementById('end-title').textContent = title;
        document.getElementById('end-message').textContent = message;
        document.getElementById('end-time').textContent = time;
        document.getElementById('game-over-modal').classList.add('active');
    }

    // دالة إخفاء النافذة
    hideGameOver() {
        document.getElementById('game-over-modal').classList.remove('active');
    }
}