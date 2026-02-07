class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.gameActive = true;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.gameMode = 'bot'; // 'bot' or 'twoPlayer'
        this.player1Name = 'PLAYER 1';
        this.player2Name = 'ALEX';
        this.playerColor = 'white'; // Player's chosen color
        this.opponentColor = 'black'; // Opponent's color
        this.selectedSquare = null;
        this.possibleMoves = [];
        
        // Chess-specific state
        this.moveHistory = [];
        this.castlingRights = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
        };
        this.enPassantTarget = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.isInCheck = { white: false, black: false };
        
        // Match timer variables
        this.matchStartTime = null;
        this.matchTimer = null;
        this.isMatchActive = false;
        
        // Captured pieces
        this.capturedWhite = [];
        this.capturedBlack = [];
        
        this.chessBoard = document.getElementById('chess-board');
        this.statusText = document.getElementById('status-text');
        this.resetBtn = document.getElementById('reset-btn');
        this.winnerOverlay = document.getElementById('winner-overlay');
        this.winnerText = document.getElementById('winner-text');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.playerScoreEl = document.getElementById('player-score-clock');
        this.opponentScoreEl = document.getElementById('opponent-score-clock');
        this.player1Label = document.getElementById('player1-label');
        this.player2Label = document.getElementById('player2-label');
        this.botModeBtn = document.getElementById('bot-mode-btn');
        this.twoPlayerBtn = document.getElementById('two-player-btn');
        this.player1NameInput = document.getElementById('player1-name-input');
        this.player2NameInput = document.getElementById('player2-name-input');
        this.whiteColorBtn = document.getElementById('white-color-btn');
        this.blackColorBtn = document.getElementById('black-color-btn');
        this.timerDisplay = document.getElementById('timer-display');
        this.capturedWhiteEl = document.getElementById('captured-white');
        this.capturedBlackEl = document.getElementById('captured-black');
        
        this.pieceSymbols = {
            'white': {
                'king': '♔', 'queen': '♕', 'rook': '♖', 
                'bishop': '♗', 'knight': '♘', 'pawn': '♙'
            },
            'black': {
                'king': '♚', 'queen': '♛', 'rook': '♜', 
                'bishop': '♝', 'knight': '♞', 'pawn': '♟'
            }
        };
        
        this.initializeGame();
    }
    
    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Place pawns
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black' };
            board[6][i] = { type: 'pawn', color: 'white' };
        }
        
        // Place other pieces
        const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let i = 0; i < 8; i++) {
            board[0][i] = { type: pieceOrder[i], color: 'black' };
            board[7][i] = { type: pieceOrder[i], color: 'white' };
        }
        
        return board;
    }
    
    initializeGame() {
        this.createBoard();
        this.updateDisplay();
        
        // Event listeners
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.botModeBtn.addEventListener('click', () => this.setGameMode('bot'));
        this.twoPlayerBtn.addEventListener('click', () => this.setGameMode('twoPlayer'));
        
        // Color selection event listeners
        this.whiteColorBtn.addEventListener('click', () => this.setPlayerColor('white'));
        this.blackColorBtn.addEventListener('click', () => this.setPlayerColor('black'));
        
        // Name input event listeners
        this.player1NameInput.addEventListener('input', (e) => this.updatePlayerName(1, e.target.value));
        this.player2NameInput.addEventListener('input', (e) => this.updatePlayerName(2, e.target.value));
        this.player1NameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') e.target.blur();
        });
        this.player2NameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') e.target.blur();
        });
        
        this.initializeMatchTimer();
        this.updateNameInputVisibility();
        this.addParticleEffect();
    }
    
    createBoard() {
        this.chessBoard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `chess-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `chess-piece ${piece.color}`;
                    const symbol = this.pieceSymbols[piece.color][piece.type];
                    pieceElement.textContent = symbol;
                    pieceElement.setAttribute('data-piece', symbol);
                    square.appendChild(pieceElement);
                }
                
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                this.chessBoard.appendChild(square);
            }
        }
    }
    
    handleSquareClick(row, col) {
        console.log('=== SQUARE CLICKED ===');
        console.log('Row:', row, 'Col:', col);
        console.log('Current player:', this.currentPlayer);
        console.log('Game active:', this.gameActive);
        
        if (!this.gameActive) {
            console.log('Game not active, ignoring click');
            return;
        }
        
        // Play click sound
        soundManager.playClick();
        
        // Start timer on first move
        if (!this.isMatchActive) {
            this.startMatchTimer();
        }
        
        const piece = this.board[row][col];
        console.log('Clicked piece:', piece);
        
        // If no piece is selected
        if (!this.selectedSquare) {
            console.log('No piece selected');
            // Only allow selecting pieces of the current player
            if (piece && piece.color === this.currentPlayer) {
                console.log('Selecting piece');
                this.selectSquare(row, col);
            } else {
                console.log('Cannot select this piece');
            }
            return;
        }
        
        console.log('Piece already selected:', this.selectedSquare);
        
        // If clicking on the same square, deselect
        if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
            console.log('Deselecting same square');
            this.deselectSquare();
            return;
        }
        
        // If clicking on another piece of the same color, select it
        if (piece && piece.color === this.currentPlayer) {
            console.log('Selecting different piece of same color');
            this.deselectSquare();
            this.selectSquare(row, col);
            return;
        }
        
        // Try to make a move
        console.log('Attempting to make move');
        if (this.isValidMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
            console.log('Move is valid, making move');
            this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
        } else {
            console.log('Move is invalid, deselecting');
            this.deselectSquare();
        }
    }
    
    selectSquare(row, col) {
        this.selectedSquare = { row, col };
        const square = this.getSquareElement(row, col);
        square.classList.add('selected');
        
        // Calculate and show all possible moves for this piece
        this.possibleMoves = this.calculatePossibleMoves(row, col);
        this.highlightPossibleMoves();
    }
    
    deselectSquare() {
        if (this.selectedSquare) {
            const square = this.getSquareElement(this.selectedSquare.row, this.selectedSquare.col);
            square.classList.remove('selected');
            this.selectedSquare = null;
        }
        this.clearPossibleMoves();
    }
    
    highlightPossibleMoves() {
        this.possibleMoves.forEach(move => {
            const square = this.getSquareElement(move.row, move.col);
            if (move.isCapture) {
                square.classList.add('possible-capture');
            } else {
                square.classList.add('possible-move');
            }
        });
    }
    
    clearPossibleMoves() {
        this.possibleMoves.forEach(move => {
            const square = this.getSquareElement(move.row, move.col);
            square.classList.remove('possible-move', 'possible-capture');
        });
        this.possibleMoves = [];
    }
    
    calculatePossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col, piece.color);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col, piece.color);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col, piece.color);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col, piece.color);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col, piece.color);
                break;
            case 'king':
                moves = this.getKingMoves(row, col, piece.color);
                break;
        }
        
        // Filter out moves that would leave king in check
        moves = moves.filter(move => {
            if (move.isCastling) {
                // Castling checks are already done in canCastle methods
                return true;
            }
            return !this.wouldMoveLeaveKingInCheck(row, col, move.row, move.col);
        });
        
        return moves;
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        const promotionRow = color === 'white' ? 0 : 7;
        
        // Move forward one square
        const newRow = row + direction;
        if (this.isValidPosition(newRow, col) && !this.board[newRow][col]) {
            const isPromotion = newRow === promotionRow;
            moves.push({ row: newRow, col, isCapture: false, isPromotion });
            
            // Move forward two squares on first move
            if (row === startRow) {
                const twoStepRow = row + (direction * 2);
                if (this.isValidPosition(twoStepRow, col) && !this.board[twoStepRow][col]) {
                    moves.push({ row: twoStepRow, col, isCapture: false, isEnPassantEligible: true });
                }
            }
        }
        
        // Capture diagonally
        const capturePositions = [
            { row: newRow, col: col - 1 },
            { row: newRow, col: col + 1 }
        ];
        
        capturePositions.forEach(pos => {
            if (this.isValidPosition(pos.row, pos.col)) {
                const targetPiece = this.board[pos.row][pos.col];
                if (targetPiece && targetPiece.color !== color) {
                    const isPromotion = pos.row === promotionRow;
                    moves.push({ row: pos.row, col: pos.col, isCapture: true, isPromotion });
                }
                
                // En passant capture
                if (this.enPassantTarget && 
                    this.enPassantTarget.row === pos.row && 
                    this.enPassantTarget.col === pos.col) {
                    moves.push({ row: pos.row, col: pos.col, isCapture: true, isEnPassant: true });
                }
            }
        });
        
        return moves;
    }
    
    getRookMoves(row, col, color) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + (dr * i);
                const newCol = col + (dc * i);
                
                if (!this.isValidPosition(newRow, newCol)) break;
                
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol, isCapture: false });
                } else {
                    if (targetPiece.color !== color) {
                        moves.push({ row: newRow, col: newCol, isCapture: true });
                    }
                    break;
                }
            }
        });
        
        return moves;
    }
    
    getKnightMoves(row, col, color) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        knightMoves.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol, isCapture: false });
                } else if (targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol, isCapture: true });
                }
            }
        });
        
        return moves;
    }
    
    getBishopMoves(row, col, color) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + (dr * i);
                const newCol = col + (dc * i);
                
                if (!this.isValidPosition(newRow, newCol)) break;
                
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol, isCapture: false });
                } else {
                    if (targetPiece.color !== color) {
                        moves.push({ row: newRow, col: newCol, isCapture: true });
                    }
                    break;
                }
            }
        });
        
        return moves;
    }
    
    getQueenMoves(row, col, color) {
        // Queen moves like rook + bishop
        return [
            ...this.getRookMoves(row, col, color),
            ...this.getBishopMoves(row, col, color)
        ];
    }
    
    getKingMoves(row, col, color) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        directions.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol, isCapture: false });
                } else if (targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol, isCapture: true });
                }
            }
        });
        
        // Castling
        if (this.castlingRights[color].kingSide && this.canCastleKingSide(color, row, col)) {
            moves.push({ row, col: col + 2, isCapture: false, isCastling: true, castlingSide: 'king' });
        }
        if (this.castlingRights[color].queenSide && this.canCastleQueenSide(color, row, col)) {
            moves.push({ row, col: col - 2, isCapture: false, isCastling: true, castlingSide: 'queen' });
        }
        
        return moves;
    }
    
    canCastleKingSide(color, row, col) {
        // Check if squares between king and rook are empty
        if (this.board[row][col + 1] || this.board[row][col + 2]) return false;
        
        // Check if rook is in position
        const rook = this.board[row][7];
        if (!rook || rook.type !== 'rook' || rook.color !== color) return false;
        
        // Check if king is in check or passes through check
        if (this.isSquareUnderAttack(row, col, color)) return false;
        if (this.isSquareUnderAttack(row, col + 1, color)) return false;
        if (this.isSquareUnderAttack(row, col + 2, color)) return false;
        
        return true;
    }
    
    canCastleQueenSide(color, row, col) {
        // Check if squares between king and rook are empty
        if (this.board[row][col - 1] || this.board[row][col - 2] || this.board[row][col - 3]) return false;
        
        // Check if rook is in position
        const rook = this.board[row][0];
        if (!rook || rook.type !== 'rook' || rook.color !== color) return false;
        
        // Check if king is in check or passes through check
        if (this.isSquareUnderAttack(row, col, color)) return false;
        if (this.isSquareUnderAttack(row, col - 1, color)) return false;
        if (this.isSquareUnderAttack(row, col - 2, color)) return false;
        
        return true;
    }
    
    isSquareUnderAttack(row, col, colorOfPieceOnSquare) {
        const opponentColor = colorOfPieceOnSquare === 'white' ? 'black' : 'white';
        
        // Check all opponent pieces to see if they can attack this square
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === opponentColor) {
                    const attacks = this.getPieceAttacks(r, c, piece);
                    if (attacks.some(attack => attack.row === row && attack.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    getPieceAttacks(row, col, piece) {
        // Similar to getPossibleMoves but doesn't check for check
        switch (piece.type) {
            case 'pawn':
                return this.getPawnAttacks(row, col, piece.color);
            case 'rook':
                return this.getRookMoves(row, col, piece.color);
            case 'knight':
                return this.getKnightMoves(row, col, piece.color);
            case 'bishop':
                return this.getBishopMoves(row, col, piece.color);
            case 'queen':
                return this.getQueenMoves(row, col, piece.color);
            case 'king':
                return this.getKingAttacks(row, col, piece.color);
            default:
                return [];
        }
    }
    
    getPawnAttacks(row, col, color) {
        const attacks = [];
        const direction = color === 'white' ? -1 : 1;
        const newRow = row + direction;
        
        // Pawns attack diagonally
        const attackPositions = [
            { row: newRow, col: col - 1 },
            { row: newRow, col: col + 1 }
        ];
        
        attackPositions.forEach(pos => {
            if (this.isValidPosition(pos.row, pos.col)) {
                attacks.push({ row: pos.row, col: pos.col });
            }
        });
        
        return attacks;
    }
    
    getKingAttacks(row, col, color) {
        const attacks = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        directions.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidPosition(newRow, newCol)) {
                attacks.push({ row: newRow, col: newCol });
            }
        });
        
        return attacks;
    }
    
    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }
    
    isKingInCheck(color) {
        const kingPos = this.findKing(color);
        if (!kingPos) return false;
        return this.isSquareUnderAttack(kingPos.row, kingPos.col, color);
    }
    
    wouldMoveLeaveKingInCheck(fromRow, fromCol, toRow, toCol) {
        // Make temporary move
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Check if king is in check
        const inCheck = this.isKingInCheck(piece.color);
        
        // Undo move
        this.board[fromRow][fromCol] = piece;
        this.board[toRow][toCol] = capturedPiece;
        
        return inCheck;
    }
    
    isValidMove(fromRow, fromCol, toRow, toCol) {
        console.log('=== VALIDATING MOVE ===');
        console.log('From:', fromRow, fromCol, 'To:', toRow, toCol);
        console.log('Possible moves:', this.possibleMoves);
        
        // Check if the move is in the list of possible moves
        const isValid = this.possibleMoves.some(move => move.row === toRow && move.col === toCol);
        console.log('Move valid:', isValid);
        
        return isValid;
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        console.log('=== MAKE MOVE ===');
        console.log('Moving from', fromRow, fromCol, 'to', toRow, toCol);
        console.log('Current player:', this.currentPlayer);
        
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        const moveInfo = this.possibleMoves.find(m => m.row === toRow && m.col === toCol);
        
        console.log('Piece:', piece);
        console.log('Move info:', moveInfo);
        
        // Play move or capture sound
        if (capturedPiece) {
            soundManager.playCapture();
        } else {
            soundManager.playMove();
        }
        
        // Add moving animation
        const fromSquare = this.getSquareElement(fromRow, fromCol);
        const pieceElement = fromSquare.querySelector('.chess-piece');
        if (pieceElement) {
            pieceElement.classList.add('moving');
        }
        
        // Wait for animation to complete
        setTimeout(() => {
            console.log('Animation complete, processing move...');
            
            // Handle en passant capture
            if (moveInfo && moveInfo.isEnPassant) {
                const captureRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
                const enPassantCaptured = this.board[captureRow][toCol];
                if (enPassantCaptured) {
                    if (enPassantCaptured.color === 'white') {
                        this.capturedWhite.push(enPassantCaptured);
                    } else {
                        this.capturedBlack.push(enPassantCaptured);
                    }
                }
                this.board[captureRow][toCol] = null;
            }
            
            // Handle regular capture
            if (capturedPiece) {
                if (capturedPiece.color === 'white') {
                    this.capturedWhite.push(capturedPiece);
                } else {
                    this.capturedBlack.push(capturedPiece);
                }
                this.updateCapturedPieces();
            }
            
            // Handle castling
            if (moveInfo && moveInfo.isCastling) {
                const row = fromRow;
                if (moveInfo.castlingSide === 'king') {
                    // Move rook for king-side castling
                    this.board[row][5] = this.board[row][7];
                    this.board[row][7] = null;
                } else {
                    // Move rook for queen-side castling
                    this.board[row][3] = this.board[row][0];
                    this.board[row][0] = null;
                }
            }
            
            // Update en passant target
            if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
                this.enPassantTarget = {
                    row: piece.color === 'white' ? toRow + 1 : toRow - 1,
                    col: toCol
                };
            } else {
                this.enPassantTarget = null;
            }
            
            // Update castling rights
            if (piece.type === 'king') {
                this.castlingRights[piece.color].kingSide = false;
                this.castlingRights[piece.color].queenSide = false;
            }
            if (piece.type === 'rook') {
                if (fromCol === 0) {
                    this.castlingRights[piece.color].queenSide = false;
                } else if (fromCol === 7) {
                    this.castlingRights[piece.color].kingSide = false;
                }
            }
            
            // Move the piece
            this.board[toRow][toCol] = piece;
            this.board[fromRow][fromCol] = null;
            
            console.log('Piece moved, checking for promotion...');
            
            // Handle pawn promotion
            if (moveInfo && moveInfo.isPromotion) {
                console.log('Pawn promotion detected');
                this.handlePawnPromotion(toRow, toCol, piece.color);
            } else {
                console.log('No promotion, continuing...');
                this.continueAfterMove();
            }
        }, 500);
    }
    
    handlePawnPromotion(row, col, color) {
        // Auto-promote to queen for now (can be enhanced with UI selection)
        this.board[row][col] = { type: 'queen', color: color };
        this.continueAfterMove();
    }
    
    continueAfterMove() {
        console.log('=== CONTINUE AFTER MOVE ===');
        console.log('Before switch - Current player:', this.currentPlayer);
        
        // Switch players FIRST
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        console.log('After switch - Current player:', this.currentPlayer);
        console.log('Player color:', this.playerColor);
        console.log('Opponent color:', this.opponentColor);
        console.log('Game mode:', this.gameMode);
        
        // Update the visual board
        this.createBoard();
        this.deselectSquare();
        
        // Update check status
        this.isInCheck.white = this.isKingInCheck('white');
        this.isInCheck.black = this.isKingInCheck('black');
        
        console.log('Check status:', this.isInCheck);
        
        // Check for game end conditions for the NEW current player
        if (this.isCheckmate(this.currentPlayer)) {
            console.log('CHECKMATE detected!');
            this.handleGameEnd('checkmate');
        } else if (this.isStalemate(this.currentPlayer)) {
            console.log('STALEMATE detected!');
            this.handleGameEnd('stalemate');
        } else {
            console.log('Game continues...');
            
            // Update display
            this.updateDisplay();
            
            // AI move for bot mode
            const shouldAIMove = this.gameMode === 'bot' && this.currentPlayer === this.opponentColor && this.gameActive;
            console.log('Should AI move?', shouldAIMove);
            
            if (shouldAIMove) {
                console.log('Scheduling AI move in 800ms...');
                setTimeout(() => this.makeAIMove(), 800);
            }
        }
    }
    
    isCheckmate(color) {
        // King must be in check
        if (!this.isKingInCheck(color)) return false;
        
        // Check if any move can get out of check
        return !this.hasLegalMoves(color);
    }
    
    isStalemate(color) {
        // King must NOT be in check
        if (this.isKingInCheck(color)) return false;
        
        // Check if there are no legal moves
        return !this.hasLegalMoves(color);
    }
    
    hasLegalMoves(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.calculatePossibleMoves(row, col);
                    if (moves.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    makeAIMove() {
        console.log('=== AI MOVE START ===');
        console.log('Game active:', this.gameActive);
        console.log('Game mode:', this.gameMode);
        console.log('Current player:', this.currentPlayer);
        console.log('Opponent color:', this.opponentColor);
        
        if (!this.gameActive) {
            console.log('Game not active, AI stopping');
            return;
        }
        
        if (this.gameMode !== 'bot') {
            console.log('Not in bot mode, AI stopping');
            return;
        }
        
        if (this.currentPlayer !== this.opponentColor) {
            console.log('Not AI turn, AI stopping');
            return;
        }
        
        console.log('AI calculating moves...');
        
        // Get all valid moves for AI
        const validMoves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentPlayer) {
                    const moves = this.calculatePossibleMoves(row, col);
                    moves.forEach(move => {
                        validMoves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.row,
                            toCol: move.col,
                            isCapture: move.isCapture,
                            piece: piece.type
                        });
                    });
                }
            }
        }
        
        console.log('AI found', validMoves.length, 'valid moves:', validMoves);
        
        if (validMoves.length === 0) {
            console.log('ERROR: AI has no valid moves!');
            return;
        }
        
        // Prioritize captures
        const captures = validMoves.filter(m => m.isCapture);
        const moveToMake = captures.length > 0 && Math.random() > 0.3
            ? captures[Math.floor(Math.random() * captures.length)]
            : validMoves[Math.floor(Math.random() * validMoves.length)];
        
        console.log('AI selected move:', moveToMake);
        
        // Temporarily select the piece to show what AI is doing
        this.selectedSquare = { row: moveToMake.fromRow, col: moveToMake.fromCol };
        this.possibleMoves = this.calculatePossibleMoves(moveToMake.fromRow, moveToMake.fromCol);
        this.createBoard();
        this.highlightPossibleMoves();
        
        // Make the move after showing selection
        setTimeout(() => {
            console.log('AI executing move...');
            this.makeMove(moveToMake.fromRow, moveToMake.fromCol, moveToMake.toRow, moveToMake.toCol);
        }, 400);
    }
    
    isGameOver() {
        // Check for checkmate or stalemate
        const opponentColor = this.currentPlayer === 'white' ? 'black' : 'white';
        return this.isCheckmate(opponentColor) || this.isStalemate(opponentColor);
    }
    
    handleGameEnd(endType) {
        this.gameActive = false;
        this.stopMatchTimer();
        
        if (endType === 'checkmate') {
            // The player who just moved (previous player) wins
            const winner = this.currentPlayer === 'white' ? 'black' : 'white';
            
            soundManager.playSuccess();
            
            if (winner === this.playerColor) {
                this.playerScore++;
                this.updateFlipClock(this.playerScoreEl, this.playerScore);
                this.showWinner(`${this.player1Name} WINS BY CHECKMATE!`, 'player-wins');
            } else {
                this.opponentScore++;
                this.updateFlipClock(this.opponentScoreEl, this.opponentScore);
                this.showWinner(`${this.player2Name} WINS BY CHECKMATE!`, 'opponent-wins');
            }
        } else if (endType === 'stalemate') {
            soundManager.playError();
            this.showWinner('STALEMATE - DRAW!', 'draw');
        }
        
        this.createFireworks();
    }
    
    updateCapturedPieces() {
        // Update captured white pieces
        this.capturedWhiteEl.innerHTML = '';
        this.capturedWhite.forEach(piece => {
            const pieceEl = document.createElement('span');
            pieceEl.textContent = this.pieceSymbols[piece.color][piece.type];
            pieceEl.style.fontSize = '1.2rem';
            pieceEl.style.margin = '2px';
            pieceEl.style.color = piece.color === 'white' ? '#ffffff' : '#666666';
            this.capturedWhiteEl.appendChild(pieceEl);
        });
        
        // Update captured black pieces
        this.capturedBlackEl.innerHTML = '';
        this.capturedBlack.forEach(piece => {
            const pieceEl = document.createElement('span');
            pieceEl.textContent = this.pieceSymbols[piece.color][piece.type];
            pieceEl.style.fontSize = '1.2rem';
            pieceEl.style.margin = '2px';
            pieceEl.style.color = piece.color === 'white' ? '#ffffff' : '#666666';
            this.capturedBlackEl.appendChild(pieceEl);
        });
    }
    
    getSquareElement(row, col) {
        return this.chessBoard.children[row * 8 + col];
    }
    
    setPlayerColor(color) {
        this.playerColor = color;
        this.opponentColor = color === 'white' ? 'black' : 'white';
        
        // Update button states
        this.whiteColorBtn.classList.toggle('active', color === 'white');
        this.blackColorBtn.classList.toggle('active', color === 'black');
        
        // Reset game to apply new colors
        this.resetGame();
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        
        // Update button states
        this.botModeBtn.classList.toggle('active', mode === 'bot');
        this.twoPlayerBtn.classList.toggle('active', mode === 'twoPlayer');
        
        // Update labels and names
        if (mode === 'bot') {
            this.player2Name = 'ALEX';
            this.player2Label.textContent = 'ALEX';
            this.player2NameInput.value = '';
        } else {
            const customName = this.player2NameInput.value.trim().toUpperCase();
            this.player2Name = customName || 'PLAYER 2';
            this.player2Label.textContent = this.player2Name;
        }
        
        // Update name input visibility
        this.updateNameInputVisibility();
        
        // Reset game when mode changes
        this.resetGame();
    }
    
    updatePlayerName(playerNumber, name) {
        const trimmedName = name.trim().toUpperCase();
        
        if (playerNumber === 1) {
            this.player1Name = trimmedName || 'PLAYER 1';
            this.player1Label.textContent = this.player1Name;
        } else {
            if (this.gameMode === 'twoPlayer') {
                this.player2Name = trimmedName || 'PLAYER 2';
                this.player2Label.textContent = this.player2Name;
            }
        }
        
        this.updateDisplay();
    }
    
    updateNameInputVisibility() {
        const player2Input = this.player2NameInput.parentElement;
        if (this.gameMode === 'bot') {
            player2Input.style.opacity = '0.5';
            player2Input.style.pointerEvents = 'none';
            this.player2NameInput.placeholder = 'Bot mode';
        } else {
            player2Input.style.opacity = '1';
            player2Input.style.pointerEvents = 'auto';
            this.player2NameInput.placeholder = 'Enter name';
        }
    }
    
    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.gameActive = true;
        this.selectedSquare = null;
        this.possibleMoves = [];
        this.capturedWhite = [];
        this.capturedBlack = [];
        
        // Reset chess-specific state
        this.moveHistory = [];
        this.castlingRights = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
        };
        this.enPassantTarget = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.isInCheck = { white: false, black: false };
        
        // Reset the match timer
        this.resetMatchTimer();
        
        this.createBoard();
        this.updateCapturedPieces();
        this.updateDisplay();
    }
    
    playAgain() {
        this.winnerOverlay.classList.remove('show');
        this.resetGame();
    }
    
    updateDisplay() {
        if (this.gameActive) {
            const currentPlayerName = this.currentPlayer === this.playerColor ? this.player1Name : 
                                    (this.gameMode === 'bot' ? 'ALEX' : this.player2Name);
            
            console.log('Current turn:', this.currentPlayer, '- Player name:', currentPlayerName);
            
            // Check if current player is in check
            if (this.isInCheck[this.currentPlayer]) {
                this.statusText.textContent = `${currentPlayerName}'S TURN - CHECK!`;
                this.statusText.style.color = '#ff3232';
                this.statusText.style.animation = 'checkPulse 1s ease-in-out infinite';
            } else {
                this.statusText.textContent = `${currentPlayerName}'S TURN`;
                this.statusText.style.color = this.currentPlayer === 'white' ? '#ffffff' : '#888888';
                this.statusText.style.animation = 'none';
            }
        }
    }
    
    showWinner(message, className) {
        this.winnerText.textContent = message;
        this.winnerText.className = `winner-text ${className}`;
        this.winnerOverlay.classList.add('show');
    }
    
    createFireworks() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.style.position = 'fixed';
                firework.style.width = '4px';
                firework.style.height = '4px';
                firework.style.backgroundColor = Math.random() > 0.5 ? '#ff6b35' : '#00bfff';
                firework.style.borderRadius = '50%';
                firework.style.left = Math.random() * window.innerWidth + 'px';
                firework.style.top = Math.random() * window.innerHeight + 'px';
                firework.style.pointerEvents = 'none';
                firework.style.animation = 'firework 2s ease-out forwards';
                
                document.body.appendChild(firework);
                
                setTimeout(() => firework.remove(), 2000);
            }, i * 50);
        }
    }
    
    // Match timer methods (same as Tic Tac Toe)
    initializeMatchTimer() {
        this.resetMatchTimer();
    }
    
    startMatchTimer() {
        if (!this.isMatchActive) {
            this.matchStartTime = Date.now();
            this.isMatchActive = true;
            this.timerDisplay.classList.add('pulsing');
            
            this.matchTimer = setInterval(() => {
                this.updateMatchTimer();
            }, 1000);
        }
    }
    
    updateMatchTimer() {
        if (this.isMatchActive && this.matchStartTime) {
            const elapsed = Math.floor((Date.now() - this.matchStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            this.timerDisplay.textContent = timeString;
        }
    }
    
    stopMatchTimer() {
        if (this.matchTimer) {
            clearInterval(this.matchTimer);
            this.matchTimer = null;
        }
        this.isMatchActive = false;
        this.timerDisplay.classList.remove('pulsing');
    }
    
    resetMatchTimer() {
        this.stopMatchTimer();
        this.matchStartTime = null;
        this.timerDisplay.textContent = '00:00';
    }
    
    updateFlipClock(clockElement, newScore) {
        const flipCard = clockElement.querySelector('.flip-card');
        const frontDigit = flipCard.querySelector('.flip-card-front .score-digit');
        const backDigit = flipCard.querySelector('.flip-card-back .score-digit');
        
        // Get current score for animation direction
        const currentScore = parseInt(frontDigit.textContent);
        const isIncreasing = newScore > currentScore;
        
        // Set the back digit to the new score
        backDigit.textContent = newScore;
        
        // Add appropriate flip animation class
        flipCard.classList.add('flipping', 'score-glow');
        if (isIncreasing) {
            flipCard.classList.add('flip-up');
        } else {
            flipCard.classList.add('flip-down');
        }
        
        // Create mechanical click sound effect (visual)
        this.createFlipEffect(flipCard);
        
        // After half the animation, update the front digit
        setTimeout(() => {
            frontDigit.textContent = newScore;
        }, 400);
        
        // Remove animation classes after animation completes
        setTimeout(() => {
            flipCard.classList.remove('flipping', 'score-glow', 'flip-up', 'flip-down');
        }, 1500);
    }
    
    createFlipEffect(flipCard) {
        // Add a subtle shake effect to simulate mechanical movement
        flipCard.style.transform = 'translateY(-1px)';
        
        setTimeout(() => {
            flipCard.style.transform = 'translateY(1px)';
        }, 100);
        
        setTimeout(() => {
            flipCard.style.transform = 'translateY(0px)';
        }, 200);
        
        // Create particle effect for the flip
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = '2px';
                particle.style.height = '2px';
                particle.style.backgroundColor = 'rgba(255, 165, 0, 0.8)';
                particle.style.borderRadius = '50%';
                particle.style.left = (flipCard.offsetLeft + Math.random() * flipCard.offsetWidth) + 'px';
                particle.style.top = (flipCard.offsetTop + flipCard.offsetHeight) + 'px';
                particle.style.pointerEvents = 'none';
                particle.style.animation = 'flipParticle 0.8s ease-out forwards';
                particle.style.zIndex = '1000';
                
                flipCard.parentElement.appendChild(particle);
                
                setTimeout(() => particle.remove(), 800);
            }, i * 50);
        }
    }
    
    addParticleEffect() {
        setInterval(() => {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '2px';
            particle.style.height = '2px';
            particle.style.backgroundColor = Math.random() > 0.5 ? 'rgba(255, 107, 53, 0.5)' : 'rgba(0, 191, 255, 0.5)';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = '-5px';
            particle.style.pointerEvents = 'none';
            particle.style.animation = 'fall 3s linear forwards';
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 3000);
        }, 200);
    }
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes firework {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(0);
            opacity: 0;
        }
    }
    
    @keyframes fall {
        to {
            transform: translateY(100vh);
            opacity: 0;
        }
    }
    
    @keyframes flipParticle {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 0.8;
        }
        100% {
            transform: translateY(-40px) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new ChessGame();
        console.log('Chess game initialized successfully');
    } catch (error) {
        console.error('Error initializing chess game:', error);
        // Fallback: at least show the basic layout
        document.body.style.background = 'linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a2e 50%, #16213e 75%, #0f3460 100%)';
        document.body.style.color = '#ffffff';
        document.body.style.fontFamily = 'Orbitron, monospace';
    }
});