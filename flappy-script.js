class FlappyBirdGame {
    constructor() {
        this.bird = { x: 100, y: 250, velocity: 0, rotation: 0 };
        this.pipes = [];
        this.score = 0;
        this.level = 1;
        this.pipesPassed = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        // Game settings
        this.gravity = 0.5;
        this.flapPower = -8;
        this.pipeSpeed = 3;
        this.pipeGap = 180;
        this.pipeFrequency = 120; // frames between pipes
        this.frameCount = 0;
        
        // Boss mode
        this.bossMode = false;
        this.bossActive = false;
        this.bossHealth = 100;
        this.bossMaxHealth = 100;
        this.bossY = 250;
        this.bossDirection = 1;
        
        // Level system
        this.pipesPerLevel = 10;
        this.levelProgress = 0;
        
        // Game stats
        this.highScore = parseInt(localStorage.getItem('flappyHighScore')) || 0;
        this.gameStartTime = null;
        this.gameTime = 0;
        this.gameTimer = null;
        
        // Achievements
        this.achievements = {
            firstPipe: false,
            level5: false,
            score100: false,
            bossDefeated: false
        };
        
        const savedAchievements = localStorage.getItem('flappyAchievements');
        if (savedAchievements) {
            this.achievements = { ...this.achievements, ...JSON.parse(savedAchievements) };
        }
        
        // DOM elements
        this.gameBoard = document.getElementById('flappy-game-board');
        this.birdElement = document.getElementById('bird');
        this.bossContainer = document.getElementById('boss-container');
        this.bossElement = document.getElementById('boss');
        this.bossHealthFill = document.getElementById('boss-health-fill');
        this.statusText = document.getElementById('status-text');
        this.resetBtn = document.getElementById('reset-btn');
        this.timerDisplay = document.getElementById('timer-display');
        this.scoreDisplay = document.getElementById('score-clock');
        this.levelDisplay = document.getElementById('level-clock');
        this.highScoreDisplay = document.getElementById('high-score');
        this.pipesPassedDisplay = document.getElementById('pipes-passed');
        this.levelProgressBar = document.getElementById('level-progress');
        this.progressText = document.getElementById('progress-text');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.levelUpOverlay = document.getElementById('level-up-overlay');
        this.playAgainBtn = document.getElementById('play-again-btn');
        
        // Mode buttons
        this.normalModeBtn = document.getElementById('normal-mode-btn');
        this.hardModeBtn = document.getElementById('hard-mode-btn');
        this.bossModeBtn = document.getElementById('boss-mode-btn');
        
        this.initializeGame();
        this.setupEventListeners();
        this.updateDisplay();
        this.updateAchievements();
    }
    
    initializeGame() {
        this.updateStats();
        this.updateLevelInfo();
    }
    
    setupEventListeners() {
        // Keyboard and mouse controls
        document.addEventListener('keydown', (e) => this.handleInput(e));
        this.gameBoard.addEventListener('click', () => this.flap());
        
        // Button events
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        
        // Mode selection
        this.normalModeBtn.addEventListener('click', () => this.setDifficulty('normal'));
        this.hardModeBtn.addEventListener('click', () => this.setDifficulty('hard'));
        this.bossModeBtn.addEventListener('click', () => this.setDifficulty('boss'));
    }

    handleInput(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            if (!this.gameRunning && !this.gameOver) {
                this.startGame();
            } else if (this.gameRunning) {
                this.flap();
            }
        } else if (e.code === 'KeyP') {
            e.preventDefault();
            this.togglePause();
        }
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameOver = false;
        this.gameStartTime = Date.now();
        this.statusText.textContent = 'FLYING';
        this.statusText.className = 'status-text playing';
        this.timerDisplay.classList.add('pulsing');
        
        this.gameTimer = setInterval(() => {
            this.updateGameTimer();
        }, 1000);
        
        this.gameLoop();
    }
    
    togglePause() {
        if (!this.gameRunning || this.gameOver) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            soundManager.playPause();
            this.statusText.textContent = 'PAUSED - PRESS P TO CONTINUE';
            this.statusText.className = 'status-text paused';
        } else {
            soundManager.playResume();
            this.statusText.textContent = 'FLYING';
            this.statusText.className = 'status-text playing';
            this.gameLoop();
        }
    }
    
    flap() {
        if (!this.gameRunning || this.gamePaused || this.gameOver) return;
        
        soundManager.playFlap();
        
        this.bird.velocity = this.flapPower;
        this.birdElement.classList.remove('falling');
        this.birdElement.classList.add('flapping');
        
        setTimeout(() => {
            this.birdElement.classList.remove('flapping');
        }, 300);
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused || this.gameOver) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Update bird physics
        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 3, -30), 90);
        
        // Check boundaries
        if (this.bird.y < 0 || this.bird.y > 560) {
            soundManager.playCollision();
            this.endGame();
            return;
        }
        
        // Update pipes
        this.frameCount++;
        if (this.frameCount >= this.pipeFrequency) {
            this.frameCount = 0;
            if (!this.bossActive) {
                this.createPipe();
            }
        }
        
        // Move and check pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Check collision
            if (this.checkCollision(pipe)) {
                soundManager.playCollision();
                this.endGame();
                return;
            }
            
            // Check if passed
            if (!pipe.scored && pipe.x + 60 < this.bird.x) {
                soundManager.playScore();
                pipe.scored = true;
                this.score += 10;
                this.pipesPassed++;
                this.levelProgress++;
                this.updateDisplay();
                this.updateStats();
                this.checkLevelUp();
                this.checkAchievements();
                
                // Add scored animation
                pipe.element.classList.add('scored');
            }
            
            // Remove off-screen pipes
            if (pipe.x < -70) {
                pipe.element.remove();
                this.pipes.splice(i, 1);
            }
        }
        
        // Update boss
        if (this.bossActive) {
            this.updateBoss();
        }
    }
    
    createPipe() {
        const minHeight = 50;
        const maxHeight = 400 - this.pipeGap;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        const pipe = {
            x: 600,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            scored: false,
            element: null
        };
        
        // Create pipe elements
        const pipeContainer = document.createElement('div');
        pipeContainer.style.position = 'absolute';
        pipeContainer.style.left = pipe.x + 'px';
        
        const topPipe = document.createElement('div');
        topPipe.className = 'pipe pipe-top';
        topPipe.style.height = topHeight + 'px';
        topPipe.style.top = '0';
        
        const bottomPipe = document.createElement('div');
        bottomPipe.className = 'pipe pipe-bottom';
        bottomPipe.style.height = (600 - pipe.bottomY) + 'px';
        bottomPipe.style.bottom = '0';
        
        pipeContainer.appendChild(topPipe);
        pipeContainer.appendChild(bottomPipe);
        this.gameBoard.appendChild(pipeContainer);
        
        pipe.element = pipeContainer;
        this.pipes.push(pipe);
    }
    
    checkCollision(pipe) {
        const birdLeft = this.bird.x;
        const birdRight = this.bird.x + 40;
        const birdTop = this.bird.y;
        const birdBottom = this.bird.y + 40;
        
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + 60;
        
        // Check if bird is in pipe's x range
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check if bird hits top or bottom pipe
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
                return true;
            }
        }
        
        return false;
    }
    
    updateBoss() {
        // Move boss up and down
        this.bossY += this.bossDirection * 2;
        if (this.bossY < 50 || this.bossY > 450) {
            this.bossDirection *= -1;
        }
        
        this.bossElement.style.top = this.bossY + 'px';
        
        // Check collision with bird
        const birdLeft = this.bird.x;
        const birdRight = this.bird.x + 40;
        const birdTop = this.bird.y;
        const birdBottom = this.bird.y + 40;
        
        const bossLeft = 450;
        const bossRight = 570;
        const bossTop = this.bossY;
        const bossBottom = this.bossY + 120;
        
        if (birdRight > bossLeft && birdLeft < bossRight &&
            birdBottom > bossTop && birdTop < bossBottom) {
            // Damage boss
            soundManager.playBossHit();
            this.bossHealth -= 2;
            this.bossHealthFill.style.width = (this.bossHealth / this.bossMaxHealth * 100) + '%';
            this.bossElement.classList.add('damaged');
            
            setTimeout(() => {
                this.bossElement.classList.remove('damaged');
            }, 300);
            
            if (this.bossHealth <= 0) {
                this.defeatBoss();
            }
        }
    }
    
    defeatBoss() {
        soundManager.playBossDefeat();
        
        this.bossActive = false;
        this.bossContainer.classList.remove('active');
        this.score += 100;
        this.updateDisplay();
        
        // Unlock achievement
        if (!this.achievements.bossDefeated) {
            this.achievements.bossDefeated = true;
            this.unlockAchievement('achievement-boss-defeated');
            localStorage.setItem('flappyAchievements', JSON.stringify(this.achievements));
        }
        
        // Show victory message
        this.showLevelUp('BOSS DEFEATED!', 'You earned 100 points!');
    }
    
    checkLevelUp() {
        if (this.levelProgress >= this.pipesPerLevel) {
            soundManager.playLevelUp();
            
            this.levelProgress = 0;
            this.level++;
            this.updateFlipClock(this.levelDisplay, this.level);
            
            // Increase difficulty
            this.pipeSpeed += 0.3;
            this.pipeGap = Math.max(120, this.pipeGap - 5);
            this.pipeFrequency = Math.max(80, this.pipeFrequency - 5);
            
            this.updateLevelInfo();
            this.showLevelUp(this.level, 'Speed and difficulty increased!');
            
            // Activate boss at level 5
            if (this.bossMode && this.level === 5 && !this.bossActive) {
                this.activateBoss();
            }
        }
        
        // Update progress bar
        const progress = (this.levelProgress / this.pipesPerLevel) * 100;
        this.levelProgressBar.style.width = progress + '%';
        this.progressText.textContent = `${this.levelProgress}/${this.pipesPerLevel}`;
    }

    activateBoss() {
        this.bossActive = true;
        this.bossHealth = this.bossMaxHealth;
        this.bossHealthFill.style.width = '100%';
        this.bossContainer.classList.add('active');
        
        // Clear all pipes
        this.pipes.forEach(pipe => pipe.element.remove());
        this.pipes = [];
        
        this.showLevelUp('BOSS FIGHT!', 'Defeat the boss to win!');
    }
    
    showLevelUp(level, message) {
        const levelUpNumber = document.getElementById('level-up-number');
        const levelUpMessage = document.getElementById('level-up-message');
        
        if (typeof level === 'number') {
            levelUpNumber.textContent = level;
            levelUpNumber.style.display = 'block';
        } else {
            levelUpNumber.textContent = level;
            levelUpNumber.style.fontSize = '3rem';
            levelUpNumber.style.display = 'block';
        }
        
        levelUpMessage.textContent = message;
        
        this.levelUpOverlay.classList.add('show');
        
        setTimeout(() => {
            this.levelUpOverlay.classList.remove('show');
            levelUpNumber.style.fontSize = '5rem';
        }, 2000);
    }
    
    render() {
        // Update bird position and rotation
        this.birdElement.style.top = this.bird.y + 'px';
        this.birdElement.style.transform = `rotate(${this.bird.rotation}deg)`;
        
        // Update pipes position
        this.pipes.forEach(pipe => {
            pipe.element.style.left = pipe.x + 'px';
        });
    }
    
    updateDisplay() {
        this.updateFlipClock(this.scoreDisplay, this.score);
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
        this.pipesPassedDisplay.textContent = this.pipesPassed;
    }
    
    updateLevelInfo() {
        const difficultyValue = document.getElementById('difficulty-value');
        const speedValue = document.getElementById('speed-value');
        const gapValue = document.getElementById('gap-value');
        
        if (this.bossMode) {
            difficultyValue.textContent = 'Boss Mode';
        } else if (this.pipeSpeed > 4) {
            difficultyValue.textContent = 'Hard';
        } else {
            difficultyValue.textContent = 'Normal';
        }
        
        speedValue.textContent = (this.pipeSpeed / 3).toFixed(1) + 'x';
        
        if (this.pipeGap > 160) {
            gapValue.textContent = 'Large';
        } else if (this.pipeGap > 140) {
            gapValue.textContent = 'Medium';
        } else {
            gapValue.textContent = 'Small';
        }
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
        
        if (!this.achievements.firstPipe && this.pipesPassed >= 1) {
            this.achievements.firstPipe = true;
            this.unlockAchievement('achievement-first-pipe');
            newAchievements = true;
        }
        
        if (!this.achievements.level5 && this.level >= 5) {
            this.achievements.level5 = true;
            this.unlockAchievement('achievement-level-5');
            newAchievements = true;
        }
        
        if (!this.achievements.score100 && this.score >= 100) {
            this.achievements.score100 = true;
            this.unlockAchievement('achievement-score-100');
            newAchievements = true;
        }
        
        if (newAchievements) {
            localStorage.setItem('flappyAchievements', JSON.stringify(this.achievements));
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
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        
        switch (difficulty) {
            case 'normal':
                this.pipeSpeed = 3;
                this.pipeGap = 180;
                this.pipeFrequency = 120;
                this.bossMode = false;
                this.normalModeBtn.classList.add('active');
                break;
            case 'hard':
                this.pipeSpeed = 5;
                this.pipeGap = 150;
                this.pipeFrequency = 100;
                this.bossMode = false;
                this.hardModeBtn.classList.add('active');
                break;
            case 'boss':
                this.pipeSpeed = 3;
                this.pipeGap = 180;
                this.pipeFrequency = 120;
                this.bossMode = true;
                this.bossModeBtn.classList.add('active');
                break;
        }
        
        this.updateLevelInfo();
    }
    
    endGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = true;
        
        clearInterval(this.gameTimer);
        
        this.statusText.textContent = 'GAME OVER';
        this.statusText.className = 'status-text';
        this.timerDisplay.classList.remove('pulsing');
        
        this.birdElement.classList.add('falling');
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('flappyHighScore', this.highScore.toString());
            this.highScoreDisplay.textContent = this.highScore;
        }
        
        this.showGameOverOverlay();
    }
    
    showGameOverOverlay() {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-level').textContent = this.level;
        document.getElementById('final-pipes').textContent = this.pipesPassed;
        
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        document.getElementById('final-time').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.gameOverOverlay.classList.add('show');
    }
    
    resetGame() {
        this.gameOverOverlay.classList.remove('show');
        
        clearInterval(this.gameTimer);
        
        // Clear pipes
        this.pipes.forEach(pipe => pipe.element.remove());
        this.pipes = [];
        
        // Reset bird
        this.bird = { x: 100, y: 250, velocity: 0, rotation: 0 };
        this.birdElement.classList.remove('falling', 'flapping');
        
        // Reset boss
        this.bossActive = false;
        this.bossContainer.classList.remove('active');
        this.bossHealth = this.bossMaxHealth;
        this.bossHealthFill.style.width = '100%';
        
        // Reset game state
        this.score = 0;
        this.level = 1;
        this.pipesPassed = 0;
        this.levelProgress = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.gameTime = 0;
        this.gameStartTime = null;
        this.frameCount = 0;
        
        // Reset difficulty based on current mode
        const activeModeBtn = document.querySelector('.mode-btn.active');
        if (activeModeBtn.id === 'normal-mode-btn') {
            this.setDifficulty('normal');
        } else if (activeModeBtn.id === 'hard-mode-btn') {
            this.setDifficulty('hard');
        } else {
            this.setDifficulty('boss');
        }
        
        // Reset display
        this.statusText.textContent = 'PRESS SPACE OR CLICK TO START';
        this.statusText.className = 'status-text';
        this.timerDisplay.textContent = '00:00';
        this.timerDisplay.classList.remove('pulsing');
        this.levelProgressBar.style.width = '0%';
        this.progressText.textContent = '0/10';
        
        this.updateDisplay();
        this.updateFlipClock(this.levelDisplay, this.level);
        this.updateStats();
        this.updateLevelInfo();
        this.render();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FlappyBirdGame();
});