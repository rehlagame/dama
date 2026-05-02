// js/ai/minimax.js

class AI {
    constructor(rules) {
        this.rules = rules;
        this.MAX_DEPTH = 4; // عمق التفكير (قراءة 4 خطوات للمستقبل)
    }

    getBestMove(board, player) {
        let moves = this.getAllMoves(board, player);
        if (moves.length === 0) return null;

        // قانون الداما: يجب اختيار المسار الذي يأكل أكبر عدد ممكن من الأحجار
        moves = this.filterMajorityCaptures(board, moves, player);

        let bestScore = -Infinity;
        let bestMove = null;

        // تجربة كل حركة متاحة
        for (let move of moves) {
            let newBoard = this.applyMoveSimulation(board, move, player);
            // استدعاء خوارزمية Minimax للحكم على المستقبل
            let score = this.minimax(newBoard, this.MAX_DEPTH - 1, -Infinity, Infinity, false, player);

            // لمسة عشوائية خفيفة جداً لكسر التكرار والنمطية في اللعب
            score += Math.random() * 0.5;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    // خوارزمية التفكير العميق (Minimax with Alpha-Beta Pruning)
    minimax(board, depth, alpha, beta, isMaximizing, botPlayer) {
        if (depth === 0) {
            return Evaluator.evaluate(board, botPlayer);
        }

        let currentPlayer = isMaximizing ? botPlayer : (botPlayer * -1);
        let moves = this.getAllMoves(board, currentPlayer);

        if (moves.length === 0) {
            return isMaximizing ? -99999 : 99999; // خسارة أو فوز محتم
        }

        moves = this.filterMajorityCaptures(board, moves, currentPlayer);

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let move of moves) {
                let newBoard = this.applyMoveSimulation(board, move, currentPlayer);
                let ev = this.minimax(newBoard, depth - 1, alpha, beta, false, botPlayer);
                maxEval = Math.max(maxEval, ev);
                alpha = Math.max(alpha, ev);
                if (beta <= alpha) break; // تقليم ألفا-بيتا (تسريع التفكير)
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let move of moves) {
                let newBoard = this.applyMoveSimulation(board, move, currentPlayer);
                let ev = this.minimax(newBoard, depth - 1, alpha, beta, true, botPlayer);
                minEval = Math.min(minEval, ev);
                beta = Math.min(beta, ev);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    // استخراج جميع الحركات وتصفيتها لاختيار الأكل الإجباري
    getAllMoves(board, player) {
        let allMoves = [];
        const globalCaptures = this.rules.getAllCaptures(board, player);

        if (globalCaptures.length > 0) {
            for (let piece of globalCaptures) {
                for (let capMove of piece.captures) {
                    allMoves.push({ from: {row: piece.fromRow, col: piece.fromCol}, to: capMove });
                }
            }
        } else {
            for (let r = 0; r < CONFIG.ROWS; r++) {
                for (let c = 0; c < CONFIG.COLS; c++) {
                    if (Math.sign(board.getPiece(r, c)) === player) {
                        let moves = this.rules.getValidMoves(board, r, c, player);
                        for (let move of moves) {
                            allMoves.push({ from: {row: r, col: c}, to: move });
                        }
                    }
                }
            }
        }
        return allMoves;
    }

    // تصفية الحركات لاختيار "الأكل الأكثر" (تطبيق قانون الداما الصارم)
    filterMajorityCaptures(board, moves, player) {
        if (moves.length === 0 || moves[0].to.type !== 'capture') return moves;

        let maxCaptures = 0;
        let movesWithCounts = [];

        for (let move of moves) {
            let count = this.getCaptureChainLength(board, move, player);
            movesWithCounts.push({ move: move, count: count });
            if (count > maxCaptures) maxCaptures = count;
        }

        return movesWithCounts.filter(m => m.count === maxCaptures).map(m => m.move);
    }

    // حساب طول سلسلة الأكل لخطوة معينة
    getCaptureChainLength(board, move, player) {
        let newBoard = this.cloneBoard(board);
        newBoard.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);
        newBoard.removePiece(move.to.capturedRow, move.to.capturedCol);
        newBoard.promoteIfEligible(move.to.row, move.to.col);

        let maxSubChain = 0;
        let nextMoves = this.rules.getValidMoves(newBoard, move.to.row, move.to.col, player);
        let nextCaptures = nextMoves.filter(m => m.type === 'capture');

        for (let nextCap of nextCaptures) {
            let nextMoveObj = { from: {row: move.to.row, col: move.to.col}, to: nextCap };
            let len = this.getCaptureChainLength(newBoard, nextMoveObj, player);
            if (len > maxSubChain) maxSubChain = len;
        }
        return 1 + maxSubChain;
    }

    // محاكاة النقلة بالكامل (بما فيها سلسلة الأكل) داخل عقل الروبوت
    applyMoveSimulation(board, move, player) {
        let newBoard = this.cloneBoard(board);
        newBoard.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);

        if (move.to.type === 'capture') {
            newBoard.removePiece(move.to.capturedRow, move.to.capturedCol);
            newBoard.promoteIfEligible(move.to.row, move.to.col);
    // created by Olo tech soluations company
            let currentR = move.to.row;
            let currentC = move.to.col;
            let chaining = true;

            while(chaining) {
                let nextMoves = this.rules.getValidMoves(newBoard, currentR, currentC, player);
                let nextCaptures = nextMoves.filter(m => m.type === 'capture');
                if (nextCaptures.length > 0) {
                    // في المحاكاة، نأخذ المسار الأطول
                    let bestNextCap = this.filterMajorityCaptures(newBoard, nextCaptures.map(c => ({from: {row: currentR, col: currentC}, to: c})), player)[0].to;
                    newBoard.movePiece(currentR, currentC, bestNextCap.row, bestNextCap.col);
                    newBoard.removePiece(bestNextCap.capturedRow, bestNextCap.capturedCol);
                    newBoard.promoteIfEligible(bestNextCap.row, bestNextCap.col);
                    currentR = bestNextCap.row;
                    currentC = bestNextCap.col;
                } else {
                    chaining = false;
                }
            }
        } else {
            newBoard.promoteIfEligible(move.to.row, move.to.col);
        }
        return newBoard;
    }

    // دالة مساعدة لمدير الواجهة: تختار أفضل أكل أثناء سلسلة الأكل
    getBestChainCapture(board, validCaptures, pieceRow, pieceCol, player) {
        let moves = validCaptures.map(cap => ({ from: {row: pieceRow, col: pieceCol}, to: cap }));
        let filtered = this.filterMajorityCaptures(board, moves, player);
        return filtered[0].to;
    }

    cloneBoard(board) {
        let newBoard = new Board();
        for (let r = 0; r < CONFIG.ROWS; r++) {
            for (let c = 0; c < CONFIG.COLS; c++) {
                newBoard.grid[r][c] = board.grid[r][c];
            }
        }
        return newBoard;
    }
}