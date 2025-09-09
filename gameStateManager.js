// ゲーム状態管理システム
class GameStateManager {
    constructor() {
        this.currentState = 'menu';
        this.states = {
            'menu': new MenuState(this),
            'playing': new PlayingState(this),
            'paused': new PausedState(this),
            'results': new ResultsState(this),
            'settings': new SettingsState(this),
            'tutorial': new TutorialState(this)
        };
        
        this.game = null;
        this.ui = null;
        
        this.initializeUI();
    }
    
    setState(newState) {
        if (this.states[this.currentState]) {
            this.states[this.currentState].exit();
        }
        
        this.currentState = newState;
        
        if (this.states[this.currentState]) {
            this.states[this.currentState].enter();
        }
        
        this.updateUI();
    }
    
    getCurrentState() {
        return this.states[this.currentState];
    }
    
    update(deltaTime) {
        if (this.states[this.currentState]) {
            this.states[this.currentState].update(deltaTime);
        }
    }
    
    initializeUI() {
        this.createMenuUI();
        this.createPauseUI();
        this.createResultsUI();
        this.createSettingsUI();
        this.createTutorialUI();
    }
    
    createMenuUI() {
        const menuContainer = document.createElement('div');
        menuContainer.id = 'menuContainer';
        menuContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
            display: none;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;
        
        menuContainer.innerHTML = `
            <div style="text-align: center; color: white;">
                <h1 style="font-size: 4rem; margin-bottom: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                    🏎️ Ultimate 3D Racing
                </h1>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <button id="startGame" class="menu-btn">🚀 レース開始</button>
                    <button id="tutorial" class="menu-btn">📚 チュートリアル</button>
                    <button id="settings" class="menu-btn">⚙️ 設定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(menuContainer);
        this.addMenuButtonStyles();
        this.bindMenuEvents();
    }
    
    createPauseUI() {
        const pauseContainer = document.createElement('div');
        pauseContainer.id = 'pauseContainer';
        pauseContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            display: none;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;
        
        pauseContainer.innerHTML = `
            <div style="text-align: center; color: white; background: rgba(0,0,0,0.9); padding: 2rem; border-radius: 10px;">
                <h2 style="font-size: 2rem; margin-bottom: 1.5rem;">⏸️ 一時停止</h2>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <button id="resumeGame" class="menu-btn">▶️ 再開</button>
                    <button id="restartRace" class="menu-btn">🔄 リスタート</button>
                    <button id="backToMenu" class="menu-btn">🏠 メニューに戻る</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(pauseContainer);
        this.bindPauseEvents();
    }
    
    createResultsUI() {
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'resultsContainer';
        resultsContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.9);
            display: none;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;
        
        resultsContainer.innerHTML = `
            <div style="text-align: center; color: white; background: rgba(0,0,0,0.9); padding: 2rem; border-radius: 10px; max-width: 500px;">
                <h2 style="font-size: 2.5rem; margin-bottom: 1.5rem;">🏁 レース結果</h2>
                <div id="resultsData" style="margin-bottom: 2rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>総タイム: <span id="totalTime">--:--</span></div>
                        <div>ベストラップ: <span id="bestLap">--:--</span></div>
                        <div>平均ラップ: <span id="avgLap">--:--</span></div>
                        <div>最高速度: <span id="maxSpeed">--- km/h</span></div>
                    </div>
                    <div id="lapTimes" style="max-height: 150px; overflow-y: auto; text-align: left; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 5px;">
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="raceAgain" class="menu-btn">🔄 もう一度</button>
                    <button id="backToMenuFromResults" class="menu-btn">🏠 メニュー</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(resultsContainer);
        this.bindResultsEvents();
    }
    
    createSettingsUI() {
        const settingsContainer = document.createElement('div');
        settingsContainer.id = 'settingsContainer';
        settingsContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.9);
            display: none;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;
        
        settingsContainer.innerHTML = `
            <div style="text-align: center; color: white; background: rgba(0,0,0,0.9); padding: 2rem; border-radius: 10px; max-width: 400px;">
                <h2 style="font-size: 2rem; margin-bottom: 1.5rem;">⚙️ 設定</h2>
                <div style="text-align: left; margin-bottom: 2rem;">
                    <div style="margin-bottom: 1rem;">
                        <label>🔊 音量: <span id="volumeDisplay">50%</span></label>
                        <input type="range" id="volumeSlider" min="0" max="100" value="50" style="width: 100%; margin-top: 0.5rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label>🎨 画質:</label>
                        <select id="qualitySelect" style="width: 100%; margin-top: 0.5rem; padding: 0.5rem;">
                            <option value="low">低画質</option>
                            <option value="medium" selected>中画質</option>
                            <option value="high">高画質</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label>🎮 操作感度: <span id="sensitivityDisplay">50%</span></label>
                        <input type="range" id="sensitivitySlider" min="10" max="100" value="50" style="width: 100%; margin-top: 0.5rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label>
                            <input type="checkbox" id="showFPS" style="margin-right: 0.5rem;">
                            FPS表示
                        </label>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label>
                            <input type="checkbox" id="enableParticles" checked style="margin-right: 0.5rem;">
                            パーティクルエフェクト
                        </label>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="saveSettings" class="menu-btn">💾 保存</button>
                    <button id="backToMenuFromSettings" class="menu-btn">🏠 戻る</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(settingsContainer);
        this.bindSettingsEvents();
    }
    
    createTutorialUI() {
        const tutorialContainer = document.createElement('div');
        tutorialContainer.id = 'tutorialContainer';
        tutorialContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.9);
            display: none;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;
        
        tutorialContainer.innerHTML = `
            <div style="text-align: center; color: white; background: rgba(0,0,0,0.9); padding: 2rem; border-radius: 10px; max-width: 600px;">
                <h2 style="font-size: 2rem; margin-bottom: 1.5rem;">📚 操作方法</h2>
                <div id="tutorialContent" style="text-align: left; margin-bottom: 2rem;">
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="color: #4CAF50; margin-bottom: 0.5rem;">🎮 基本操作</h3>
                        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.5rem; font-size: 0.9rem;">
                            <div>W / ↑</div><div>加速</div>
                            <div>S / ↓</div><div>減速・バック</div>
                            <div>A / ←</div><div>左ステアリング</div>
                            <div>D / →</div><div>右ステアリング</div>
                            <div>Space</div><div>ハンドブレーキ</div>
                            <div>R</div><div>車両リセット</div>
                        </div>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="color: #2196F3; margin-bottom: 0.5rem;">📷 カメラ操作</h3>
                        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.5rem; font-size: 0.9rem;">
                            <div>C</div><div>カメラモード切替</div>
                            <div>V</div><div>視点切替</div>
                            <div>Q/E</div><div>ギア↓/↑ (MT時)</div>
                            <div>T</div><div>AT/MT切替</div>
                            <div>Left Shift</div><div>クラッチ (MT時)</div>
                            <div>ESC</div><div>一時停止</div>
                        </div>
                    </div>
                    <div>
                        <h3 style="color: #FF9800; margin-bottom: 0.5rem;">🏁 レースのコツ</h3>
                        <ul style="font-size: 0.9rem; padding-left: 1.5rem;">
                            <li>コーナーでは早めにブレーキをかけましょう</li>
                            <li>ハンドブレーキでドリフトが可能です</li>
                            <li>マニュアルモード(MT)では手動ギア操作が可能</li>
                            <li>高回転でのギアアップでパワーを維持</li>
                            <li>チェックポイントを順番に通過してください</li>
                            <li>ベストタイムを目指して練習しましょう</li>
                        </ul>
                    </div>
                </div>
                <button id="backToMenuFromTutorial" class="menu-btn">🏠 戻る</button>
            </div>
        `;
        
        document.body.appendChild(tutorialContainer);
        this.bindTutorialEvents();
    }
    
    addMenuButtonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .menu-btn {
                padding: 1rem 2rem;
                font-size: 1.2rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
            
            .menu-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
            }
            
            .menu-btn:active {
                transform: translateY(0);
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
        `;
        document.head.appendChild(style);
    }
    
    bindMenuEvents() {
        document.getElementById('startGame').addEventListener('click', () => {
            this.setState('playing');
        });
        
        document.getElementById('tutorial').addEventListener('click', () => {
            this.setState('tutorial');
        });
        
        document.getElementById('settings').addEventListener('click', () => {
            this.setState('settings');
        });
    }
    
    bindPauseEvents() {
        document.getElementById('resumeGame').addEventListener('click', () => {
            this.setState('playing');
        });
        
        document.getElementById('restartRace').addEventListener('click', () => {
            if (this.game) {
                this.game.resetRace();
            }
            this.setState('playing');
        });
        
        document.getElementById('backToMenu').addEventListener('click', () => {
            this.setState('menu');
        });
    }
    
    bindResultsEvents() {
        document.getElementById('raceAgain').addEventListener('click', () => {
            if (this.game) {
                this.game.resetRace();
            }
            this.setState('playing');
        });
        
        document.getElementById('backToMenuFromResults').addEventListener('click', () => {
            this.setState('menu');
        });
    }
    
    bindSettingsEvents() {
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeDisplay = document.getElementById('volumeDisplay');
        const sensitivitySlider = document.getElementById('sensitivitySlider');
        const sensitivityDisplay = document.getElementById('sensitivityDisplay');
        
        volumeSlider.addEventListener('input', (e) => {
            volumeDisplay.textContent = e.target.value + '%';
        });
        
        sensitivitySlider.addEventListener('input', (e) => {
            sensitivityDisplay.textContent = e.target.value + '%';
        });
        
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
            this.setState('menu');
        });
        
        document.getElementById('backToMenuFromSettings').addEventListener('click', () => {
            this.setState('menu');
        });
    }
    
    bindTutorialEvents() {
        document.getElementById('backToMenuFromTutorial').addEventListener('click', () => {
            this.setState('menu');
        });
    }
    
    updateUI() {
        // すべてのUIを非表示
        ['menuContainer', 'pauseContainer', 'resultsContainer', 'settingsContainer', 'tutorialContainer'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });
        
        // 現在の状態に応じてUIを表示
        let containerId = '';
        switch (this.currentState) {
            case 'menu':
                containerId = 'menuContainer';
                break;
            case 'paused':
                containerId = 'pauseContainer';
                break;
            case 'results':
                containerId = 'resultsContainer';
                this.updateResultsDisplay();
                break;
            case 'settings':
                containerId = 'settingsContainer';
                this.loadSettings();
                break;
            case 'tutorial':
                containerId = 'tutorialContainer';
                break;
        }
        
        if (containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                container.style.display = 'flex';
            }
        }
    }
    
    updateResultsDisplay() {
        if (!this.game || !this.game.gameState) return;
        
        const gameState = this.game.gameState;
        const lapTimes = gameState.lapTimes || [];
        
        // 総タイム
        document.getElementById('totalTime').textContent = this.formatTime(gameState.totalTime || 0);
        
        // ベストラップ
        const bestLap = lapTimes.length > 0 ? Math.min(...lapTimes) : 0;
        document.getElementById('bestLap').textContent = this.formatTime(bestLap);
        
        // 平均ラップ
        const avgLap = lapTimes.length > 0 ? lapTimes.reduce((a, b) => a + b, 0) / lapTimes.length : 0;
        document.getElementById('avgLap').textContent = this.formatTime(avgLap);
        
        // 最高速度
        document.getElementById('maxSpeed').textContent = Math.round(gameState.maxSpeed || 0) + ' km/h';
        
        // ラップタイム一覧
        const lapTimesContainer = document.getElementById('lapTimes');
        lapTimesContainer.innerHTML = '';
        lapTimes.forEach((time, index) => {
            const lapElement = document.createElement('div');
            lapElement.textContent = `ラップ ${index + 1}: ${this.formatTime(time)}`;
            lapTimesContainer.appendChild(lapElement);
        });
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toFixed(2).padStart(5, '0')}`;
    }
    
    saveSettings() {
        const settings = {
            volume: document.getElementById('volumeSlider').value,
            quality: document.getElementById('qualitySelect').value,
            sensitivity: document.getElementById('sensitivitySlider').value,
            showFPS: document.getElementById('showFPS').checked,
            enableParticles: document.getElementById('enableParticles').checked
        };
        
        localStorage.setItem('racingGameSettings', JSON.stringify(settings));
        
        // ゲームに設定を適用
        if (this.game) {
            this.game.applySettings(settings);
        }
    }
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('racingGameSettings') || '{}');
        
        if (settings.volume !== undefined) {
            document.getElementById('volumeSlider').value = settings.volume;
            document.getElementById('volumeDisplay').textContent = settings.volume + '%';
        }
        
        if (settings.quality !== undefined) {
            document.getElementById('qualitySelect').value = settings.quality;
        }
        
        if (settings.sensitivity !== undefined) {
            document.getElementById('sensitivitySlider').value = settings.sensitivity;
            document.getElementById('sensitivityDisplay').textContent = settings.sensitivity + '%';
        }
        
        if (settings.showFPS !== undefined) {
            document.getElementById('showFPS').checked = settings.showFPS;
        }
        
        if (settings.enableParticles !== undefined) {
            document.getElementById('enableParticles').checked = settings.enableParticles;
        }
    }
}

// ゲーム状態クラス
class GameState {
    constructor(manager) {
        this.manager = manager;
    }
    
    enter() {}
    exit() {}
    update(deltaTime) {}
}

class MenuState extends GameState {
    enter() {
        if (this.manager.game) {
            this.manager.game.pause();
        }
    }
}

class PlayingState extends GameState {
    enter() {
        if (this.manager.game) {
            this.manager.game.resume();
        }
    }
    
    update(deltaTime) {
        // ESCキーで一時停止
        if (this.manager.game && this.manager.game.inputManager.keys['Escape']) {
            this.manager.setState('paused');
        }
        
        // レース終了チェック
        if (this.manager.game && this.manager.game.gameState.raceFinished) {
            this.manager.setState('results');
        }
    }
}

class PausedState extends GameState {
    enter() {
        if (this.manager.game) {
            this.manager.game.pause();
        }
    }
}

class ResultsState extends GameState {
    enter() {
        if (this.manager.game) {
            this.manager.game.pause();
        }
    }
}

class SettingsState extends GameState {}

class TutorialState extends GameState {}