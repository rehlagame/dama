// js/ai/evaluator.js

class Evaluator {
    static evaluate(board, player) {
        let score = 0;

        for (let r = 0; r < CONFIG.ROWS; r++) {
            for (let c = 0; c < CONFIG.COLS; c++) {
                const piece = board.getPiece(r, c);
                if (piece === CONFIG.EMPTY) continue;

                const sign = Math.sign(piece);
                const isKing = Math.abs(piece) === CONFIG.PIECE_KING;

                // 1. القيمة الأساسية (الشيخ قوة ضاربة لا تُقدر بثمن)
                let pieceValue = isKing ? 150 : 10;

                // 2. التقييم الاستراتيجي (الدفاع والهجوم)
                if (!isKing) {
                    if (sign === CONFIG.ROBOT) {
                        // التقدم للهجوم
                        pieceValue += (r * 2);
                        // الدفاع الشرس عن الصف الخلفي (يمنعك من الترقية)
                        if (r === 1 || r === 2) pieceValue += 6;
                    } else if (sign === CONFIG.PLAYER) {
                        pieceValue += ((CONFIG.ROWS - 1 - r) * 2);
                        if (r === 6 || r === 5) pieceValue += 6;
                    }
                    // الأطراف (اليمين واليسار) أكثر أماناً للحجر العادي
                    if (c === 0 || c === 7) pieceValue += 3;
                } else {
                    // الشيخ يُرعب الخصم إذا تمركز في منتصف الرقعة (مربعات السيطرة)
                    if (r >= 2 && r <= 5 && c >= 2 && c <= 5) {
                        pieceValue += 15;
                    }
                }

                // إضافة النقاط للمجموع
                if (sign === player) {
                    score += pieceValue;
                } else {
                    score -= pieceValue;
                }
            }
        }
        return score;
    }
}