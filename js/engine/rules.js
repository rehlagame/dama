// js/engine/rules.js

class Rules {
    constructor() {}

    // 1. الدالة الأساسية: تجلب جميع الحركات المتاحة لحجر معين (مع إعطاء الأولوية للأكل)
    getValidMoves(board, row, col, player) {
        let moves = [];
        let captures = [];
        const piece = board.getPiece(row, col);

        if (piece === CONFIG.EMPTY || Math.sign(piece) !== player) return [];

        const isKing = Math.abs(piece) === CONFIG.PIECE_KING;

        if (isKing) {
            // --- حركات "الشيخ" (في جميع الاتجاهات الأربعة المفتوحة) ---
            const directions = [
                CONFIG.DIRECTIONS.UP, CONFIG.DIRECTIONS.DOWN,
                CONFIG.DIRECTIONS.RIGHT, CONFIG.DIRECTIONS.LEFT
            ];

            directions.forEach(dir => {
                let r = row + dir[0];
                let c = col + dir[1];
                let foundEnemy = false;
                let enemyRow = -1, enemyCol = -1;

                while (!board.isOutOfBounds(r, c)) {
                    const currentPiece = board.getPiece(r, c);

                    if (currentPiece === CONFIG.EMPTY) {
                        if (!foundEnemy) {
                            // حركة طيران عادية للشيخ (لا يوجد خصم في الطريق)
                            moves.push({ row: r, col: c, type: 'normal' });
                        } else {
                            // حركة أكل: هبوط الشيخ في المربعات الفارغة التي تلي الخصم
                            captures.push({
                                row: r, col: c,
                                type: 'capture',
                                capturedRow: enemyRow, capturedCol: enemyCol
                            });
                        }
                    }
                    else if (Math.sign(currentPiece) === (player * -1)) {
                        // وجدنا حجر للخصم
                        if (!foundEnemy) {
                            foundEnemy = true;
                            enemyRow = r;
                            enemyCol = c;
                        } else {
                            // لا يُسمح بالقفز فوق حجرين للخصم متتاليين في نفس المسار
                            break;
                        }
                    }
                    else {
                        // وجدنا حجراً صديقاً يغلق المسار
                        break;
                    }

                    r += dir[0];
                    c += dir[1];
                }
            });

        } else {
            // --- حركة الحجر العادي (أمام، يمين، يسار) ---
            const directions = player === CONFIG.PLAYER ?
                [CONFIG.DIRECTIONS.UP, CONFIG.DIRECTIONS.RIGHT, CONFIG.DIRECTIONS.LEFT] :
                [CONFIG.DIRECTIONS.DOWN, CONFIG.DIRECTIONS.RIGHT, CONFIG.DIRECTIONS.LEFT];

            directions.forEach(dir => {
                let r1 = row + dir[0];
                let c1 = col + dir[1];

                if (!board.isOutOfBounds(r1, c1)) {
                    const adjacentPiece = board.getPiece(r1, c1);

                    // إذا كان المربع المجاور فارغاً
                    if (adjacentPiece === CONFIG.EMPTY) {
                        moves.push({ row: r1, col: c1, type: 'normal' });
                    }
                    // إذا كان المربع المجاور به حجر للخصم
                    else if (Math.sign(adjacentPiece) === (player * -1)) {
                        let r2 = row + dir[0] * 2;
                        let c2 = col + dir[1] * 2;

                        // التحقق من أن المربع الذي بعد الخصم فارغ للقفز عليه
                        if (!board.isOutOfBounds(r2, c2) && board.getPiece(r2, c2) === CONFIG.EMPTY) {
                            captures.push({
                                row: r2, col: c2,
                                type: 'capture',
                                capturedRow: r1, capturedCol: c1
                            });
                        }
                    }
                }
            });
        }

        // قانون الأكل الإجباري المحلي: إذا توفرت فرصة أكل، تُلغى الحركات العادية لهذا الحجر
        return captures.length > 0 ? captures : moves;
    }

    // 2. الدالة الجديدة (قانون الإجبار العام): تفحص كل أحجار اللاعب لترى ما إذا كان هناك أي فرصة للأكل إطلاقاً
    getAllCaptures(board, player) {
        let allCaptures = [];

        for (let r = 0; r < CONFIG.ROWS; r++) {
            for (let c = 0; c < CONFIG.COLS; c++) {

                // البحث فقط في أحجار اللاعب الحالي
                if (Math.sign(board.getPiece(r, c)) === player) {
                    const moves = this.getValidMoves(board, r, c, player);
                    const captures = moves.filter(m => m.type === 'capture');

                    // إذا كان هذا الحجر يستطيع الأكل، نضيفه للقائمة الإجبارية
                    if (captures.length > 0) {
                        allCaptures.push({ fromRow: r, fromCol: c, captures: captures });
                    }
                }
            }
        }
        return allCaptures;
    }
}