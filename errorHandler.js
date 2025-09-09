// エラーハンドリングシステム
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50;
        this.isInitialized = false;
        this.errorContainer = null;
        
        this.initialize();
    }
    
    initialize() {
        // グローバルエラーハンドラーを設定
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'JavaScript Error',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error ? event.error.stack : null
            });
        });
        
        // Promise拒否のハンドリング
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'Unhandled Promise Rejection',
                message: event.reason ? event.reason.toString() : 'Unknown promise rejection',
                stack: event.reason ? event.reason.stack : null
            });
        });
        
        // WebGLコンテキスト喪失のハンドリング
        this.setupWebGLErrorHandling();
        
        this.createErrorUI();
        this.isInitialized = true;
        
        console.log('Error handler initialized');
    }
    
    setupWebGLErrorHandling() {
        // WebGLコンテキスト喪失の監視
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                this.handleError({
                    type: 'WebGL Context Lost',
                    message: 'WebGLコンテキストが失われました。ページを再読み込みしてください。',
                    severity: 'critical',
                    action: 'reload'
                });
            });
            
            canvas.addEventListener('webglcontextrestored', (event) => {
                console.log('WebGL context restored');
                this.showNotification('WebGLコンテキストが復旧しました', 'success');
            });
        }
    }
    
    createErrorUI() {
        // エラー表示用のモーダル
        const errorModal = document.createElement('div');
        errorModal.id = 'errorModal';
        errorModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            font-family: Arial, sans-serif;
        `;
        
        errorModal.innerHTML = `
            <div style="background: #1a1a1a; color: white; padding: 2rem; border-radius: 10px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                <h2 style="color: #ff4444; margin-bottom: 1rem;">🚨 エラーが発生しました</h2>
                <div id="errorDetails" style="margin-bottom: 1.5rem; font-family: monospace; background: #2a2a2a; padding: 1rem; border-radius: 5px;">
                </div>
                <div id="errorActions" style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="reloadPage" class="error-btn" style="background: #4CAF50;">🔄 ページを再読み込み</button>
                    <button id="continueGame" class="error-btn" style="background: #2196F3;">▶️ 続行</button>
                    <button id="reportError" class="error-btn" style="background: #FF9800;">📋 エラーレポート</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorModal);
        this.errorContainer = errorModal;
        
        // エラーボタンのスタイル
        const style = document.createElement('style');
        style.textContent = `
            .error-btn {
                padding: 0.8rem 1.5rem;
                border: none;
                border-radius: 5px;
                color: white;
                cursor: pointer;
                font-weight: bold;
                transition: opacity 0.2s;
            }
            .error-btn:hover {
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
        
        this.bindErrorUIEvents();
    }
    
    bindErrorUIEvents() {
        document.getElementById('reloadPage').addEventListener('click', () => {
            window.location.reload();
        });
        
        document.getElementById('continueGame').addEventListener('click', () => {
            this.hideErrorModal();
        });
        
        document.getElementById('reportError').addEventListener('click', () => {
            this.generateErrorReport();
        });
    }
    
    handleError(errorInfo) {
        const timestamp = new Date();
        const error = {
            ...errorInfo,
            timestamp,
            id: this.generateErrorId(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // エラーログに追加
        this.errors.unshift(error);
        if (this.errors.length > this.maxErrors) {
            this.errors.pop();
        }
        
        // コンソールに出力
        console.error('Game Error:', error);
        
        // 重要度に応じて処理
        this.processError(error);
        
        // エラー統計の更新
        this.updateErrorStats(error);
    }
    
    processError(error) {
        const severity = error.severity || this.determineSeverity(error);
        
        switch (severity) {
            case 'critical':
                this.showCriticalError(error);
                break;
            case 'warning':
                this.showWarning(error);
                break;
            case 'info':
                this.showNotification(error.message, 'info');
                break;
            default:
                // デフォルトは軽微なエラーとして扱う
                console.warn('Minor error:', error.message);
        }
    }
    
    determineSeverity(error) {
        if (error.type === 'WebGL Context Lost') return 'critical';
        if (error.message.includes('WebGL')) return 'critical';
        if (error.message.includes('THREE')) return 'warning';
        if (error.message.includes('Audio')) return 'warning';
        return 'info';
    }
    
    showCriticalError(error) {
        const errorDetails = document.getElementById('errorDetails');
        errorDetails.innerHTML = `
            <div><strong>タイプ:</strong> ${error.type}</div>
            <div><strong>メッセージ:</strong> ${error.message}</div>
            <div><strong>時刻:</strong> ${error.timestamp.toLocaleString()}</div>
            ${error.filename ? `<div><strong>ファイル:</strong> ${error.filename}:${error.line}</div>` : ''}
            ${error.stack ? `<div><strong>スタック:</strong><pre style="white-space: pre-wrap; margin-top: 0.5rem;">${error.stack}</pre></div>` : ''}
        `;
        
        // アクションボタンの表示制御
        const continueBtn = document.getElementById('continueGame');
        if (error.action === 'reload') {
            continueBtn.style.display = 'none';
        } else {
            continueBtn.style.display = 'inline-block';
        }
        
        this.showErrorModal();
    }
    
    showWarning(error) {
        this.showNotification(`⚠️ 警告: ${error.message}`, 'warning', 5000);
    }
    
    showErrorModal() {
        if (this.errorContainer) {
            this.errorContainer.style.display = 'flex';
        }
    }
    
    hideErrorModal() {
        if (this.errorContainer) {
            this.errorContainer.style.display = 'none';
        }
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        // 通知システムが利用可能な場合は使用
        if (window.notificationSystem) {
            window.notificationSystem.show(message, type, duration);
        } else {
            // フォールバック：シンプルな通知
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${this.getNotificationColor(type)};
                color: white;
                padding: 1rem;
                border-radius: 5px;
                z-index: 9999;
                font-family: Arial, sans-serif;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, duration);
        }
    }
    
    getNotificationColor(type) {
        switch (type) {
            case 'success': return '#4CAF50';
            case 'warning': return '#FF9800';
            case 'error': return '#f44336';
            default: return '#2196F3';
        }
    }
    
    generateErrorId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    updateErrorStats(error) {
        if (window.dataManager) {
            // エラー統計をデータマネージャーに記録
            const stats = window.dataManager.getStatistics();
            const errorStats = stats.errorStats || {};
            
            const errorType = error.type || 'Unknown';
            errorStats[errorType] = (errorStats[errorType] || 0) + 1;
            errorStats.totalErrors = (errorStats.totalErrors || 0) + 1;
            errorStats.lastError = {
                type: errorType,
                message: error.message,
                timestamp: error.timestamp
            };
            
            window.dataManager.updateStatistics({ errorStats });
        }
    }
    
    generateErrorReport() {
        const report = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            errors: this.errors.slice(0, 10), // 最新10件
            gameState: this.getGameStateInfo(),
            systemInfo: this.getSystemInfo()
        };
        
        // レポートをクリップボードにコピー
        this.copyToClipboard(JSON.stringify(report, null, 2));
        this.showNotification('エラーレポートがクリップボードにコピーされました', 'success');
    }
    
    getGameStateInfo() {
        try {
            if (window.game && window.game.gameState) {
                return {
                    isPlaying: window.game.gameState.isPlaying,
                    currentLap: window.game.gameState.currentLap,
                    totalTime: window.game.gameState.totalTime,
                    car: window.game.car ? {
                        speed: window.game.car.speed,
                        position: window.game.car.position
                    } : null
                };
            }
        } catch (e) {
            return { error: 'Failed to get game state' };
        }
        return null;
    }
    
    getSystemInfo() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        return {
            webglSupported: !!gl,
            webglVendor: gl ? gl.getParameter(gl.VENDOR) : null,
            webglRenderer: gl ? gl.getParameter(gl.RENDERER) : null,
            maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : null,
            memoryInfo: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }
    
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            // フォールバック
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }
    
    // パフォーマンス監視
    startPerformanceMonitoring() {
        setInterval(() => {
            this.checkPerformance();
        }, 5000);
    }
    
    checkPerformance() {
        // FPS監視
        if (window.game && window.game.performanceMonitor) {
            const fps = window.game.performanceMonitor.fps;
            
            if (fps < 30) {
                this.handleError({
                    type: 'Performance Warning',
                    message: `フレームレートが低下しています (${fps.toFixed(1)} FPS)`,
                    severity: 'warning'
                });
            }
        }
        
        // メモリ使用量監視
        if (performance.memory) {
            const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
            
            if (memoryUsage > 0.9) {
                this.handleError({
                    type: 'Memory Warning',
                    message: 'メモリ使用量が高くなっています',
                    severity: 'warning'
                });
            }
        }
    }
    
    // WebGL機能チェック
    checkWebGLSupport() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            this.handleError({
                type: 'WebGL Not Supported',
                message: 'WebGLがサポートされていません。モダンブラウザをご使用ください。',
                severity: 'critical',
                action: 'reload'
            });
            return false;
        }
        
        return true;
    }
    
    // エラー統計の取得
    getErrorStats() {
        const stats = {};
        
        this.errors.forEach(error => {
            const type = error.type || 'Unknown';
            stats[type] = (stats[type] || 0) + 1;
        });
        
        return {
            totalErrors: this.errors.length,
            byType: stats,
            recentErrors: this.errors.slice(0, 5)
        };
    }
    
    // システム情報の詳細取得
    getDetailedSystemInfo() {
        return {
            browser: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine
            },
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            },
            window: {
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio
            },
            webgl: this.getSystemInfo(),
            storage: {
                localStorage: !!window.localStorage,
                sessionStorage: !!window.sessionStorage,
                indexedDB: !!window.indexedDB
            }
        };
    }
}

// システム互換性チェック
class CompatibilityChecker {
    static checkCompatibility() {
        const issues = [];
        
        // WebGL確認
        if (!CompatibilityChecker.checkWebGL()) {
            issues.push({
                type: 'WebGL',
                message: 'WebGLがサポートされていません',
                severity: 'critical'
            });
        }
        
        // Web Audio API確認
        if (!window.AudioContext && !window.webkitAudioContext) {
            issues.push({
                type: 'Web Audio',
                message: 'Web Audio APIがサポートされていません',
                severity: 'warning'
            });
        }
        
        // localStorage確認
        if (!window.localStorage) {
            issues.push({
                type: 'localStorage',
                message: 'ローカルストレージが利用できません',
                severity: 'warning'
            });
        }
        
        // Gamepadサポート確認
        if (!navigator.getGamepads) {
            issues.push({
                type: 'Gamepad',
                message: 'ゲームパッドAPIがサポートされていません',
                severity: 'info'
            });
        }
        
        return issues;
    }
    
    static checkWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }
}

// グローバルエラーハンドラーのインスタンスを作成
window.errorHandler = new ErrorHandler();
window.compatibilityChecker = CompatibilityChecker;