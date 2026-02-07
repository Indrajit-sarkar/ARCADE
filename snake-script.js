class SnakeGame {
    constructor() {
        this.boardSize = 20; // 20x20 grid
        this.cellSize = 30;
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.apple = { x: 15, y: 15 };
        this.score = 0;
        this.length = 1; // Start with actual length of 1
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = 200; // milliseconds
        this.gameLoop = null;
        
        // Game stats
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.applesEaten = 0;
        this.speedLevel = 1;
        this.gameStartTime = null;
        this.gameTime = 0;
        this.gameTimer = null;
        
        // Achievements
        this.achievements = {
            firstApple: false,
            length10: false,
            score100: false,
            speedDemon: false
        };
        
        // Load achievements from localStorage
        const savedAchievements = localStorage.getItem('snakeAchievements');
        if (savedAchievements) {
            this.achievements = { ...this.achievements, ...JSON.parse(savedAchievements) };
        }
        
        // DOM elements
        this.gameBoard = document.getElementById('snake-game-board');
        this.statusText = document.getElementById('status-text');
        this.resetBtn = document.getElementById('reset-btn');
        this.timerDisplay = document.getElementById('timer-display');
        this.scoreDisplay = document.getElementById('score-clock');
        this.lengthDisplay = document.getElementById('length-clock');
        this.highScoreDisplay = document.getElementById('high-score');
        this.applesEatenDisplay = document.getElementById('apples-eaten');
        this.speedLevelDisplay = document.getElementById('speed-level');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.finalScore = document.getElementById('final-score');
        this.finalLength = document.getElementById('final-length');
        this.finalTime = document.getElementById('final-time');
        
        // Mode buttons
        this.easyModeBtn = document.getElementById('easy-mode-btn');
        this.mediumModeBtn = document.getElementById('medium-mode-btn');
        this.hardModeBtn = document.getElementById('hard-mode-btn');
        
        this.initializeGame();
        this.setupEventListeners();
        this.updateDisplay();
        this.updateAchievements();
    }
    
    initializeGame() {
        this.createBoard();
        this.placeApple();
        this.render();
        this.updateStats();
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Button events
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        
        // Mode selection
        this.easyModeBtn.addEventListener('click', () => this.setDifficulty('easy'));
        this.mediumModeBtn.addEventListener('click', () => this.setDifficulty('medium'));
        this.hardModeBtn.addEventListener('click', () => this.setDifficulty('hard'));
    }
    
    createBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.width = `${this.boardSize * this.cellSize}px`;
        this.gameBoard.style.height = `${this.boardSize * this.cellSize}px`;
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning && !this.gamePaused) {
            this.startGame();
        }
        
        switch (e.code) {
            case 'ArrowUp':
                e.preventDefault();
                if (this.direction.y !== 1) {
                    soundManager.playMove();
                    this.direction = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (this.direction.y !== -1) {
                    soundManager.playMove();
                    this.direction = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (this.direction.x !== 1) {
                    soundManager.playMove();
                    this.direction = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (this.direction.x !== -1) {
                    soundManager.playMove();
                    this.direction = { x: 1, y: 0 };
                }
                break;
            case 'Space':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameStartTime = Date.now();
        this.statusText.textContent = 'PLAYING';
        this.statusText.className = 'status-text playing';
        this.timerDisplay.classList.add('pulsing');
        
        this.gameLoop = setInterval(() => {
            if (!this.gamePaused) {
                this.update();
            }
        }, this.gameSpeed);
        
        this.gameTimer = setInterval(() => {
            this.updateGameTimer();
        }, 1000);
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            soundManager.playPause();
            this.statusText.textContent = 'PAUSED - PRESS SPACE TO CONTINUE';
            this.statusText.className = 'status-text paused';
        } else {
            soundManager.playResume();
            this.statusText.textContent = 'PLAYING';
            this.statusText.className = 'status-text playing';
        }
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        // Move snake
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.boardSize || head.y < 0 || head.y >= this.boardSize) {
            soundManager.playCollision();
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            soundManager.playCollision();
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check apple collision
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.eatApple();
        } else {
            this.snake.pop();
        }
        
        this.render();
    }
    
    eatApple() {
        soundManager.playCapture();
        
        this.score += 10;
        this.applesEaten++;
        this.length = this.snake.length; // Update length to match actual snake length
        
        // Increase speed every 5 apples
        if (this.applesEaten % 5 === 0) {
            soundManager.playLevelUp();
            this.speedLevel++;
            this.gameSpeed = Math.max(50, this.gameSpeed - 20);
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => {
                if (!this.gamePaused) {
                    this.update();
                }
            }, this.gameSpeed);
        }
        
        this.placeApple();
        this.updateDisplay();
        this.updateStats();
        this.checkAchievements();
        
        // Add eating effect
        this.addEatingEffect();
    }
    
    addEatingEffect() {
        // Create particle effect for eating apple
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = '#ff4444';
            particle.style.borderRadius = '50%';
            particle.style.left = `${this.apple.x * this.cellSize + 12}px`;
            particle.style.top = `${this.apple.y * this.cellSize + 12}px`;
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '20';
            
            const angle = (i / 8) * Math.PI * 2;
            const velocity = 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            this.gameBoard.appendChild(particle);
            
            let opacity = 1;
            let x = this.apple.x * this.cellSize + 12;
            let y = this.apple.y * this.cellSize + 12;
            
            const animateParticle = () => {
                x += vx * 0.02;
                y += vy * 0.02;
                opacity -= 0.02;
                
                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                particle.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animateParticle);
                } else {
                    particle.remove();
                }
            };
            
            requestAnimationFrame(animateParticle);
        }
    }
    
    placeApple() {
        let newApple;
        do {
            newApple = {
                x: Math.floor(Math.random() * this.boardSize),
                y: Math.floor(Math.random() * this.boardSize)
            };
        } while (this.snake.some(segment => segment.x === newApple.x && segment.y === newApple.y));
        
        this.apple = newApple;
    }
    
    render() {
        // Clear board
        this.gameBoard.innerHTML = '';
        
        // Render snake
        this.snake.forEach((segment, index) => {
            const segmentElement = document.createElement('div');
            segmentElement.className = `snake-segment ${index === 0 ? 'snake-head' : 'snake-body'}`;
            segmentElement.style.left = `${segment.x * this.cellSize + 1}px`;
            segmentElement.style.top = `${segment.y * this.cellSize + 1}px`;
            
            // Add 3D rotation effect based on direction
            if (index === 0) {
                let rotation = 0;
                if (this.direction.x === 1) rotation = 90;
                else if (this.direction.x === -1) rotation = -90;
                else if (this.direction.y === 1) rotation = 180;
                
                segmentElement.style.transform = `translateZ(8px) rotate(${rotation}deg)`;
                
                // Add tongue element that appears periodically
                if (Math.random() < 0.3) { // 30% chance to show tongue
                    const tongue = document.createElement('div');
                    tongue.className = 'snake-tongue';
                    tongue.style.position = 'absolute';
                    tongue.style.width = '8px';
                    tongue.style.height = '2px';
                    tongue.style.background = '#ff0066';
                    tongue.style.borderRadius = '1px';
                    tongue.style.zIndex = '15';
                    
                    // Position tongue based on direction
                    if (this.direction.x === 1) { // Right
                        tongue.style.right = '-6px';
                        tongue.style.top = '13px';
                    } else if (this.direction.x === -1) { // Left
                        tongue.style.left = '-6px';
                        tongue.style.top = '13px';
                    } else if (this.direction.y === 1) { // Down
                        tongue.style.bottom = '-6px';
                        tongue.style.left = '13px';
                        tongue.style.transform = 'rotate(90deg)';
                    } else if (this.direction.y === -1) { // Up
                        tongue.style.top = '-6px';
                        tongue.style.left = '13px';
                        tongue.style.transform = 'rotate(90deg)';
                    } else {
                        tongue.style.right = '-6px';
                        tongue.style.top = '13px';
                    }
                    
                    segmentElement.appendChild(tongue);
                    
                    // Remove tongue after short time
                    setTimeout(() => {
                        if (tongue.parentNode) {
                            tongue.remove();
                        }
                    }, 200);
                }
            }
            
            this.gameBoard.appendChild(segmentElement);
        });
        
        // Render apple
        const appleElement = document.createElement('div');
        appleElement.className = 'apple';
        appleElement.style.left = `${this.apple.x * this.cellSize + 2}px`;
        appleElement.style.top = `${this.apple.y * this.cellSize + 2}px`;
        this.gameBoard.appendChild(appleElement);
    }
    
    updateDisplay() {
        // Update score with flip animation
        this.updateFlipClock(this.scoreDisplay, this.score);
        
        // Update length with flip animation
        this.updateFlipClock(this.lengthDisplay, this.length);
    }
    
    updateFlipClock(clockElement, newValue) {
        const frontDigit = clockElement.querySelector('.flip-card-front .score-digit');
        const backDigit = clockElement.querySelector('.flip-card-back .score-digit');
        const flipCard = clockElement.querySelector('.flip-card');
        
        if (frontDigit.textContent !== newValue.toString()) {
            backDigit.textContent = newValue;
            flipCard.classList.add('flipping');
            flipCard.classList.add('score-glow');
            
            setTimeout(() => {
                frontDigit.textContent = newValue;
                flipCard.classList.remove('flipping');
                setTimeout(() => {
                    flipCard.classList.remove('score-glow');
                }, 1500);
            }, 300);
        }
    }
    
    updateStats() {
        this.highScoreDisplay.textContent = Math.max(this.score, this.highScore);
        this.applesEatenDisplay.textContent = this.applesEaten;
        this.speedLevelDisplay.textContent = this.speedLevel;
    }
    
    updateGameTimer() {
        if (this.gameRunning && !this.gamePaused && this.gameStartTime) {
            this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
            const minutes = Math.floor(this.gameTime / 60);
            const seconds = this.gameTime % 60;
            this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    checkAchievements() {
        let newAchievements = false;
        
        // First Apple
        if (!this.achievements.firstApple && this.applesEaten >= 1) {
            this.achievements.firstApple = true;
            this.unlockAchievement('achievement-first-apple');
            newAchievements = true;
        }
        
        // Length 10
        if (!this.achievements.length10 && this.length >= 10) {
            this.achievements.length10 = true;
            this.unlockAchievement('achievement-length-10');
            newAchievements = true;
        }
        
        // Score 100
        if (!this.achievements.score100 && this.score >= 100) {
            this.achievements.score100 = true;
            this.unlockAchievement('achievement-score-100');
            newAchievements = true;
        }
        
        // Speed Demon (reach speed level 5)
        if (!this.achievements.speedDemon && this.speedLevel >= 5) {
            this.achievements.speedDemon = true;
            this.unlockAchievement('achievement-speed-demon');
            newAchievements = true;
        }
        
        if (newAchievements) {
            localStorage.setItem('snakeAchievements', JSON.stringify(this.achievements));
        }
    }
    
    unlockAchievement(achievementId) {
        soundManager.playAchievement();
        const achievementElement = document.getElementById(achievementId);
        if (achievementElement) {
            achievementElement.classList.remove('locked');
            achievementElement.classList.add('unlocked');
        }
    }
    
    updateAchievements() {
        Object.keys(this.achievements).forEach(key => {
            if (this.achievements[key]) {
                const achievementId = `achievement-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                this.unlockAchievement(achievementId);
            }
        });
    }
    
    setDifficulty(difficulty) {
        // Remove active class from all mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        
        switch (difficulty) {
            case 'easy':
                this.gameSpeed = 300;
                this.easyModeBtn.classList.add('active');
                break;
            case 'medium':
                this.gameSpeed = 200;
                this.mediumModeBtn.classList.add('active');
                break;
            case 'hard':
                this.gameSpeed = 100;
                this.hardModeBtn.classList.add('active');
                break;
        }
        
        // Restart game loop with new speed if game is running
        if (this.gameRunning) {
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => {
                if (!this.gamePaused) {
                    this.update();
                }
            }, this.gameSpeed);
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        clearInterval(this.gameLoop);
        clearInterval(this.gameTimer);
        
        this.statusText.textContent = 'GAME OVER';
        this.statusText.className = 'status-text';
        this.timerDisplay.classList.remove('pulsing');
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
            this.highScoreDisplay.textContent = this.highScore;
        }
        
        // Show game over overlay
        this.showGameOverOverlay();
    }
    
    showGameOverOverlay() {
        this.finalScore.textContent = this.score;
        this.finalLength.textContent = this.length;
        
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        this.finalTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.gameOverOverlay.classList.add('show');
    }
    
    resetGame() {
        // Hide game over overlay
        this.gameOverOverlay.classList.remove('show');
        
        // Clear intervals
        clearInterval(this.gameLoop);
        clearInterval(this.gameTimer);
        
        // Reset game state
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.score = 0;
        this.length = 1; // Reset to actual starting length
        this.applesEaten = 0;
        this.speedLevel = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameTime = 0;
        this.gameStartTime = null;
        
        // Reset speed based on current difficulty
        const activeModeBtn = document.querySelector('.mode-btn.active');
        if (activeModeBtn.id === 'easy-mode-btn') {
            this.gameSpeed = 300;
        } else if (activeModeBtn.id === 'medium-mode-btn') {
            this.gameSpeed = 200;
        } else {
            this.gameSpeed = 100;
        }
        
        // Reset display
        this.statusText.textContent = 'PRESS ARROW KEYS TO START';
        this.statusText.className = 'status-text';
        this.timerDisplay.textContent = '00:00';
        this.timerDisplay.classList.remove('pulsing');
        
        // Reset game
        this.placeApple();
        this.render();
        this.updateDisplay();
        this.updateStats();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});