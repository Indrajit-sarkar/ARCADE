class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.gameMode = 'bot'; // 'bot' or 'twoPlayer'
        this.player1Name = 'PLAYER 1';
        this.player2Name = 'ALEX';
        this.playerSymbol = 'X'; // Player's chosen symbol
        this.opponentSymbol = 'O'; // Opponent's symbol
        
        // Match timer variables
        this.matchStartTime = null;
        this.matchTimer = null;
        this.isMatchActive = false;
        
        this.cells = document.querySelectorAll('.cell');
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
        this.xSymbolBtn = document.getElementById('x-symbol-btn');
        this.oSymbolBtn = document.getElementById('o-symbol-btn');
        this.timerDisplay = document.getElementById('timer-display');
        
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
            cell.addEventListener('mouseenter', () => this.handleCellHover(cell));
            cell.addEventListener('mouseleave', () => this.handleCellLeave(cell));
        });
        
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.botModeBtn.addEventListener('click', () => this.setGameMode('bot'));
        this.twoPlayerBtn.addEventListener('click', () => this.setGameMode('twoPlayer'));
        
        // Name input event listeners
        this.player1NameInput.addEventListener('input', (e) => this.updatePlayerName(1, e.target.value));
        this.player2NameInput.addEventListener('input', (e) => this.updatePlayerName(2, e.target.value));
        this.player1NameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') e.target.blur();
        });
        this.player2NameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') e.target.blur();
        });
        // Symbol selection event listeners
        this.xSymbolBtn.addEventListener('click', () => this.setPlayerSymbol('X'));
        this.oSymbolBtn.addEventListener('click', () => this.setPlayerSymbol('O'));
        
        this.updateDisplay();
        this.addParticleEffect();
        this.updateNameInputVisibility();
        this.initializeMatchTimer();
    }
    
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
    
    setPlayerSymbol(symbol) {
        this.playerSymbol = symbol;
        this.opponentSymbol = symbol === 'X' ? 'O' : 'X';
        
        // Update button states
        this.xSymbolBtn.classList.toggle('active', symbol === 'X');
        this.oSymbolBtn.classList.toggle('active', symbol === 'O');
        
        // Reset game to apply new symbols
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
    
    handleCellClick(index) {
        if (this.board[index] !== '' || !this.gameActive) return;
        
        // Play click sound
        soundManager.playClick();
        
        // Start timer on first move
        if (!this.isMatchActive) {
            this.startMatchTimer();
        }
        
        this.board[index] = this.currentPlayer;
        this.updateCell(index);
        
        if (this.checkWinner()) {
            this.handleGameEnd();
        } else if (this.board.every(cell => cell !== '')) {
            this.handleDraw();
        } else {
            this.currentPlayer = this.currentPlayer === this.playerSymbol ? this.opponentSymbol : this.playerSymbol;
            this.updateDisplay();
            
            // AI move for bot mode only when it's the opponent's turn
            if (this.gameMode === 'bot' && this.currentPlayer === this.opponentSymbol && this.gameActive) {
                setTimeout(() => this.makeAIMove(), 500);
            }
        }
    }
    
    handleCellHover(cell) {
        if (!cell.textContent && this.gameActive) {
            soundManager.playHover();
            cell.style.transform = 'scale(1.1) rotateZ(5deg)';
            cell.style.boxShadow = '0 0 30px rgba(255, 165, 0, 0.5)';
        }
    }
    
    handleCellLeave(cell) {
        if (!cell.textContent && this.gameActive) {
            cell.style.transform = '';
            cell.style.boxShadow = '';
        }
    }
    
    updateCell(index) {
        const cell = this.cells[index];
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        
        // Add ripple effect
        this.createRipple(cell);
    }
    
    createRipple(cell) {
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = this.currentPlayer === 'X' 
            ? 'rgba(255, 107, 53, 0.6)' 
            : 'rgba(0, 191, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.marginLeft = '-10px';
        ripple.style.marginTop = '-10px';
        
        cell.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    makeAIMove() {
        if (!this.gameActive || this.gameMode !== 'bot') return;
        
        // Simple AI: Try to win, block player, or take center/corners
        let move = this.getBestMove();
        
        if (move !== -1) {
            this.board[move] = this.opponentSymbol;
            this.updateCell(move);
            
            if (this.checkWinner()) {
                this.handleGameEnd();
            } else if (this.board.every(cell => cell !== '')) {
                this.handleDraw();
            } else {
                this.currentPlayer = this.playerSymbol;
                this.updateDisplay();
            }
        }
    }
    
    getBestMove() {
        // Try to win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = this.opponentSymbol;
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Block player from winning
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = this.playerSymbol;
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Take center
        if (this.board[4] === '') return 4;
        
        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take any available spot
        const availableSpots = this.board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
        return availableSpots.length > 0 ? availableSpots[Math.floor(Math.random() * availableSpots.length)] : -1;
    }
    
    checkWinner() {
        return this.winningConditions.some(condition => {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winningCells = condition;
                return true;
            }
            return false;
        });
    }
    
    handleGameEnd() {
        this.gameActive = false;
        const winner = this.currentPlayer;
        
        // Stop the match timer
        this.stopMatchTimer();
        
        // Highlight winning cells
        this.winningCells.forEach(index => {
            this.cells[index].classList.add('winning');
        });
        
        // Update scores and show winner
        if (winner === this.playerSymbol) {
            soundManager.playSuccess();
            this.playerScore++;
            this.updateFlipClock(this.playerScoreEl, this.playerScore);
            this.showWinner(`${this.player1Name} WINS!`, 'player-wins');
        } else {
            soundManager.playSuccess();
            this.opponentScore++;
            this.updateFlipClock(this.opponentScoreEl, this.opponentScore);
            this.showWinner(`${this.player2Name} WINS!`, 'opponent-wins');
        }
        
        this.createFireworks();
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
    
    handleDraw() {
        this.gameActive = false;
        
        // Stop the match timer
        this.stopMatchTimer();
        
        this.showWinner('DRAW!', 'draw');
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
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = this.playerSymbol; // Always start with player's symbol
        this.gameActive = true;
        this.winningCells = [];
        
        // Reset the match timer
        this.resetMatchTimer();
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        this.updateDisplay();
    }
    
    playAgain() {
        this.winnerOverlay.classList.remove('show');
        this.resetGame();
    }
    
    updateDisplay() {
        if (this.gameActive) {
            if (this.currentPlayer === this.playerSymbol) {
                this.statusText.textContent = `${this.player1Name}'S TURN`;
                this.statusText.style.color = this.playerSymbol === 'X' ? '#ff6b35' : '#00bfff';
            } else {
                if (this.gameMode === 'bot') {
                    this.statusText.textContent = "ALEX'S TURN";
                } else {
                    this.statusText.textContent = `${this.player2Name}'S TURN`;
                }
                this.statusText.style.color = this.opponentSymbol === 'X' ? '#ff6b35' : '#00bfff';
            }
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
`;
document.head.appendChild(style);

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
});