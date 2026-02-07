/**
 * ARCADE Sound Manager
 * Generates sound effects using Web Audio API
 */

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3;
        this.initAudioContext();
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }
    
    // Resume audio context (required for some browsers)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // Play a beep sound
    playBeep(frequency = 440, duration = 0.1, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;
        
        this.resume();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // Click sound
    playClick() {
        this.playBeep(800, 0.05, 'square');
    }
    
    // Hover sound
    playHover() {
        this.playBeep(600, 0.03, 'sine');
    }
    
    // Success/Win sound
    playSuccess() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const notes = [523.25, 659.25, 783.99]; // C, E, G
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playBeep(freq, 0.2, 'sine');
            }, i * 100);
        });
    }
    
    // Error/Fail sound
    playError() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const notes = [400, 350, 300];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playBeep(freq, 0.15, 'sawtooth');
            }, i * 80);
        });
    }
    
    // Move sound
    playMove() {
        this.playBeep(440, 0.08, 'triangle');
    }
    
    // Capture/Eat sound
    playCapture() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        this.playBeep(600, 0.05, 'square');
        setTimeout(() => this.playBeep(800, 0.05, 'square'), 50);
    }
    
    // Level up sound
    playLevelUp() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00]; // C, D, E, G, A
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playBeep(freq, 0.15, 'sine');
            }, i * 80);
        });
    }
    
    // Flap sound (for Flappy Bird)
    playFlap() {
        this.playBeep(300, 0.1, 'square');
    }
    
    // Collision sound
    playCollision() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    // Score sound
    playScore() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        this.playBeep(880, 0.1, 'sine');
        setTimeout(() => this.playBeep(1046.5, 0.15, 'sine'), 100);
    }
    
    // Boss hit sound
    playBossHit() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        this.playBeep(150, 0.1, 'sawtooth');
        setTimeout(() => this.playBeep(200, 0.1, 'square'), 50);
    }
    
    // Boss defeat sound
    playBossDefeat() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const notes = [880, 932, 988, 1047, 1109, 1175, 1245, 1319]; // A to E (octave up)
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playBeep(freq, 0.12, 'sine');
            }, i * 60);
        });
    }
    
    // Achievement unlock sound
    playAchievement() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const notes = [659.25, 783.99, 1046.5]; // E, G, C
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playBeep(freq, 0.2, 'sine');
            }, i * 120);
        });
    }
    
    // Pause sound
    playPause() {
        this.playBeep(523.25, 0.15, 'triangle');
    }
    
    // Resume sound
    playResume() {
        this.playBeep(659.25, 0.15, 'triangle');
    }
    
    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    // Set volume (0.0 to 1.0)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
}

// Create global sound manager instance
const soundManager = new SoundManager();