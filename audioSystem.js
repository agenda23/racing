// オーディオシステム
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.musicVolume = 0.5;
        this.sfxVolume = 0.5;
        this.masterVolume = 0.5;
        this.isInitialized = false;
        
        // エンジン音用のオーディオオシレーター
        this.engineOscillator = null;
        this.engineGainNode = null;
        this.engineFrequency = 100;
        
        this.initializeAudioContext();
        this.createSyntheticSounds();
    }
    
    async initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.isInitialized = false;
        }
    }
    
    // ユーザーインタラクション後にオーディオコンテキストを再開
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('Audio context resumed');
            } catch (error) {
                console.warn('Failed to resume audio context:', error);
            }
        }
    }
    
    createSyntheticSounds() {
        if (!this.isInitialized) return;
        
        // エンジン音の初期化
        this.initializeEngineSound();
        
        // 各種効果音の作成
        this.createClickSound();
        this.createCountdownSound();
        this.createWinSound();
        this.createCrashSound();
        this.createBrakeSound();
        this.createGearShiftSound();
    }
    
    createGearShiftSound() {
        this.sounds.set('gearshift', () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.type = 'square';
            oscillator.frequency.value = 300;
            filter.type = 'bandpass';
            filter.frequency.value = 500;
            filter.Q.value = 10;
            gainNode.gain.value = 0.15 * this.sfxVolume * this.masterVolume;
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // ギアシフトのクリック音エンベロープ
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.2);
        });
    }
    
    initializeEngineSound() {
        if (!this.audioContext) return;
        
        // エンジン音用のオシレーターとゲイン
        this.engineOscillator = this.audioContext.createOscillator();
        this.engineGainNode = this.audioContext.createGain();
        
        // ローパスフィルターで自然な音に
        const lowPassFilter = this.audioContext.createBiquadFilter();
        lowPassFilter.type = 'lowpass';
        lowPassFilter.frequency.value = 800;
        
        this.engineOscillator.type = 'sawtooth';
        this.engineOscillator.frequency.value = this.engineFrequency;
        this.engineGainNode.gain.value = 0;
        
        this.engineOscillator.connect(lowPassFilter);
        lowPassFilter.connect(this.engineGainNode);
        this.engineGainNode.connect(this.audioContext.destination);
        
        this.engineOscillator.start();
    }
    
    createClickSound() {
        this.sounds.set('click', () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.1 * this.sfxVolume * this.masterVolume;
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // エンベロープ
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        });
    }
    
    createCountdownSound() {
        this.sounds.set('countdown', (pitch = 1) => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 440 * pitch;
            gainNode.gain.value = 0.2 * this.sfxVolume * this.masterVolume;
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // ビープ音のエンベロープ
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
        });
    }
    
    createWinSound() {
        this.sounds.set('win', () => {
            if (!this.audioContext) return;
            
            // 勝利音楽（簡単なファンファーレ）
            const frequencies = [523, 659, 784, 1047]; // C, E, G, C
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.type = 'triangle';
                    oscillator.frequency.value = freq;
                    gainNode.gain.value = 0.15 * this.sfxVolume * this.masterVolume;
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);
                    
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.8);
                }, index * 200);
            });
        });
    }
    
    createCrashSound() {
        this.sounds.set('crash', () => {
            if (!this.audioContext) return;
            
            // ノイズを使った衝突音
            const bufferSize = this.audioContext.sampleRate * 0.3;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
            }
            
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
            
            source.buffer = buffer;
            gainNode.gain.value = 0.3 * this.sfxVolume * this.masterVolume;
            
            source.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start();
        });
    }
    
    createBrakeSound() {
        this.sounds.set('brake', () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = 150;
            filter.type = 'highpass';
            filter.frequency.value = 1000;
            gainNode.gain.value = 0.1 * this.sfxVolume * this.masterVolume;
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // ブレーキ音のエンベロープ
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
        });
    }
    
    // エンジン音の更新
    updateEngineSound(rpm, throttle) {
        if (!this.engineOscillator || !this.engineGainNode) return;
        
        // RPMに基づいて周波数を変更
        const baseFrequency = 100;
        const maxFrequency = 800;
        const frequency = baseFrequency + (rpm / 8000) * (maxFrequency - baseFrequency);
        
        this.engineOscillator.frequency.exponentialRampToValueAtTime(
            Math.max(frequency, 20),
            this.audioContext.currentTime + 0.1
        );
        
        // スロットルに基づいて音量を変更
        const volume = (0.1 + throttle * 0.3) * this.sfxVolume * this.masterVolume;
        this.engineGainNode.gain.exponentialRampToValueAtTime(
            Math.max(volume, 0.01),
            this.audioContext.currentTime + 0.1
        );
    }
    
    // 音声再生
    playSound(soundName, ...args) {
        if (!this.isInitialized) return;
        
        const sound = this.sounds.get(soundName);
        if (sound) {
            try {
                sound(...args);
            } catch (error) {
                console.warn(`Failed to play sound ${soundName}:`, error);
            }
        }
    }
    
    // 背景音楽（簡単な環境音）
    startAmbientSound() {
        if (!this.audioContext) return;
        
        // 風の音（ホワイトノイズ）
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        source.loop = true;
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        gainNode.gain.value = 0.05 * this.musicVolume * this.masterVolume;
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start();
        this.ambientSource = source;
    }
    
    stopAmbientSound() {
        if (this.ambientSource) {
            this.ambientSource.stop();
            this.ambientSource = null;
        }
    }
    
    // 音量設定
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }
    
    // カウントダウン音楽
    playCountdown() {
        const pitches = [0.8, 0.8, 0.8, 1.5]; // 3, 2, 1, GO!
        
        pitches.forEach((pitch, index) => {
            setTimeout(() => {
                this.playSound('countdown', pitch);
            }, index * 1000);
        });
    }
    
    // 音楽のフェードイン/アウト
    fadeIn(gainNode, duration = 1.0) {
        if (!gainNode || !this.audioContext) return;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
            this.musicVolume * this.masterVolume,
            this.audioContext.currentTime + duration
        );
    }
    
    fadeOut(gainNode, duration = 1.0) {
        if (!gainNode || !this.audioContext) return;
        
        gainNode.gain.linearRampToValueAtTime(
            0.001,
            this.audioContext.currentTime + duration
        );
    }
    
    // システム破棄
    destroy() {
        if (this.engineOscillator) {
            this.engineOscillator.stop();
            this.engineOscillator = null;
        }
        
        if (this.ambientSource) {
            this.ambientSource.stop();
            this.ambientSource = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.sounds.clear();
    }
}

// オーディオマネージャー（シングルトン）
class AudioManager {
    constructor() {
        if (AudioManager.instance) {
            return AudioManager.instance;
        }
        
        this.audioSystem = new AudioSystem();
        this.isEnabled = true;
        
        AudioManager.instance = this;
        return this;
    }
    
    static getInstance() {
        if (!AudioManager.instance) {
            new AudioManager();
        }
        return AudioManager.instance;
    }
    
    enable() {
        this.isEnabled = true;
    }
    
    disable() {
        this.isEnabled = false;
    }
    
    playSound(soundName, ...args) {
        if (this.isEnabled) {
            this.audioSystem.playSound(soundName, ...args);
        }
    }
    
    updateEngineSound(rpm, throttle) {
        if (this.isEnabled) {
            this.audioSystem.updateEngineSound(rpm, throttle);
        }
    }
    
    startAmbient() {
        if (this.isEnabled) {
            this.audioSystem.startAmbientSound();
        }
    }
    
    stopAmbient() {
        this.audioSystem.stopAmbientSound();
    }
    
    playCountdown() {
        if (this.isEnabled) {
            this.audioSystem.playCountdown();
        }
    }
    
    setVolume(volume) {
        this.audioSystem.setMasterVolume(volume / 100);
    }
    
    resumeContext() {
        return this.audioSystem.resumeAudioContext();
    }
}

// グローバルオーディオマネージャーのインスタンスを作成
window.audioManager = AudioManager.getInstance();