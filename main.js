// メインエントリーポイント
let game = null;

// ページ読み込み完了時にゲームを初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});

function initializeGame() {
    try {
        // ゲームインスタンスを作成
        game = new Game();
        
        console.log('3D Racing Game initialized successfully!');
        console.log('Controls:');
        console.log('- WASD or Arrow Keys: Drive');
        console.log('- Space: Brake');
        console.log('- C: Change camera');
        console.log('- R: Reset');
        console.log('- P/Escape: Pause');
        
        // デバッグ情報の表示（URLパラメータにdebugがある場合）
        if (window.location.search.includes('debug')) {
            enableDebugMode();
        }
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showError('ゲームの初期化に失敗しました。ブラウザがWebGLをサポートしているか確認してください。');
    }
}

function enableDebugMode() {
    console.log('Debug mode enabled');
    
    // パフォーマンス情報を定期的に表示
    setInterval(() => {
        if (game) {
            const perfInfo = game.getPerformanceInfo();
            console.log('Performance Info:', perfInfo);
        }
    }, 5000);
    
    // デバッグ用のグローバル変数を設定
    window.gameDebug = {
        game: game,
        resetCar: () => game.resetCarPosition(),
        togglePause: () => game.togglePause(),
        getPerformance: () => game.getPerformanceInfo(),
        setCameraType: (type) => game.cameraController.switchCameraType(type)
    };
}

function showError(message) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.innerHTML = `
            <div style="color: red; text-align: center;">
                <h2>エラー</h2>
                <p>${message}</p>
                <p>お使いのブラウザでWebGLが有効になっているか確認してください。</p>
            </div>
        `;
    }
}

// WebGLサポートチェック
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
    } catch (e) {
        return false;
    }
}

// ブラウザの互換性チェック
function checkBrowserCompatibility() {
    const issues = [];
    
    if (!checkWebGLSupport()) {
        issues.push('WebGLがサポートされていません');
    }
    
    if (!window.requestAnimationFrame) {
        issues.push('requestAnimationFrameがサポートされていません');
    }
    
    if (!window.performance) {
        issues.push('Performance APIがサポートされていません');
    }
    
    return issues;
}

// 初期化前の互換性チェック
const compatibilityIssues = checkBrowserCompatibility();
if (compatibilityIssues.length > 0) {
    console.warn('Browser compatibility issues:', compatibilityIssues);
    showError('お使いのブラウザは一部の機能をサポートしていません：<br>' + compatibilityIssues.join('<br>'));
}

// エラーハンドリング
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    if (event.error && event.error.message.includes('WebGL')) {
        showError('WebGLエラーが発生しました。グラフィックドライバを更新するか、別のブラウザをお試しください。');
    }
});

// 未処理のPromise拒否をキャッチ
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// パフォーマンス監視（本番環境では無効化）
if (window.location.hostname === 'localhost' || window.location.search.includes('perf')) {
    let frameCount = 0;
    let lastPerfCheck = performance.now();
    
    function monitorPerformance() {
        frameCount++;
        const now = performance.now();
        
        if (now - lastPerfCheck >= 5000) { // 5秒ごと
            const fps = (frameCount * 1000) / (now - lastPerfCheck);
            console.log(`Average FPS: ${fps.toFixed(1)}`);
            
            if (fps < 30) {
                console.warn('Low FPS detected. Consider reducing graphics quality.');
            }
            
            frameCount = 0;
            lastPerfCheck = now;
        }
        
        requestAnimationFrame(monitorPerformance);
    }
    
    requestAnimationFrame(monitorPerformance);
}

// モバイルデバイス対応
function setupMobileControls() {
    if ('ontouchstart' in window) {
        console.log('Touch device detected - mobile controls would be implemented here');
        // タッチコントロールの実装はここに追加
    }
}

// ページの可視性変更時の処理
document.addEventListener('visibilitychange', function() {
    if (game) {
        if (document.hidden) {
            game.pauseGame();
        } else {
            // 自動復帰はしない（ユーザーの意図しない動作を防ぐため）
        }
    }
});

// ゲーム終了時のクリーンアップ
window.addEventListener('beforeunload', function() {
    if (game) {
        // 必要に応じてクリーンアップ処理を追加
        console.log('Game cleanup');
    }
});

// モバイル対応の初期化
setupMobileControls();

