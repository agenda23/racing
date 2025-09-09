// メインゲームクラス
class Game {
    constructor() {
        // Three.js基本要素
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // ゲームオブジェクト
        this.car = null;
        this.track = null;
        this.cameraController = null;
        
        // 物理エンジン
        this.physicsEngine = new PhysicsEngine();
        this.collisionDetector = new CollisionDetector();
        
        // ゲーム状態
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            currentLap: 1,
            totalLaps: 3,
            lapTime: 0,
            bestLapTime: null,
            totalTime: 0
        };
        
        // 入力管理
        this.inputManager = {
            keys: {},
            mouseX: 0,
            mouseY: 0
        };
        
        // パフォーマンス監視
        this.performanceMonitor = new PerformanceMonitor();
        
        // タイミング（後で初期化）
        this.clock = null;
        this.lastTime = 0;
        
        // 初期化は非同期で実行
        this.initPromise = this.initialize();
    }
    
    async initialize() {
        try {
            // THREE.jsの初期化（まずクロックを作成）
            this.clock = new THREE.Clock();
            
            await this.setupRenderer();
            this.setupScene();
            this.setupLighting();
                this.setupGameObjects();
            this.setupEventListeners();
            this.setupUI();
            
            // ゲーム開始
            this.startGame();
            
            console.log('✅ ゲーム初期化完了');
        } catch (error) {
            console.error('❌ ゲーム初期化エラー:', error);
            this.showErrorMessage('ゲームの初期化に失敗しました: ' + error.message);
        }
    }
    
    async setupRenderer() {
        // WebGL診断実行
        const diagnostic = new WebGLDiagnostic();
        const diagnosticResult = await diagnostic.runDiagnostic();
        
        console.log('🔍 WebGL診断結果:', diagnosticResult);
        
        // 診断結果を確認
        if (!diagnosticResult.supported || diagnosticResult.errors.length > 0) {
            const userMessage = diagnostic.getUserMessage();
            this.handleWebGLError(userMessage, diagnosticResult);
            throw new Error('WebGL initialization failed');
        }
        
        // WebGL警告がある場合は通知
        if (diagnosticResult.warnings.length > 0) {
            const userMessage = diagnostic.getUserMessage();
            this.showWebGLWarning(userMessage);
        }
        
        // レンダラー設定を診断結果に基づいて最適化
        const rendererOptions = this.getOptimizedRendererOptions(diagnosticResult);
        
        try {
            this.renderer = new THREE.WebGLRenderer(rendererOptions);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            
            // 診断結果に基づいて機能を調整
            this.configureRendererFeatures(diagnosticResult);
            
            // パフォーマンス設定
            this.renderer.info.autoReset = false;
            
            console.log('✅ WebGLレンダラー初期化成功');
            
        } catch (error) {
            console.error('WebGLレンダラー作成エラー:', error);
            
            // フォールバック試行
            await this.attemptWebGLFallback(diagnosticResult);
        }
    }
    
    // 診断結果に基づくレンダラーオプション最適化
    getOptimizedRendererOptions(diagnosticResult) {
        const canvas = document.getElementById('gameCanvas');
        const baseOptions = {
            canvas: canvas,
            alpha: false
        };
        
        // 低性能環境での最適化
        if (diagnosticResult.maxTextureSize < 4096 || 
            diagnosticResult.warnings.some(w => w.includes('ソフトウェア'))) {
            
            console.log('⚠️ 低性能環境を検出、設定を最適化します');
            return {
                ...baseOptions,
                antialias: false,
                powerPreference: "default",
                precision: "mediump",
                preserveDrawingBuffer: false
            };
        }
        
        // 高性能環境での設定
        return {
            ...baseOptions,
            antialias: true,
            powerPreference: "high-performance",
            precision: "highp",
            preserveDrawingBuffer: false
        };
    }
    
    // レンダラー機能設定
    configureRendererFeatures(diagnosticResult) {
        // シャドウマッピング
        const hasGoodPerformance = diagnosticResult.maxTextureSize >= 4096 &&
                                  !diagnosticResult.warnings.some(w => w.includes('ソフトウェア'));
        
        if (hasGoodPerformance) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            console.log('✅ 高品質シャドウマッピング有効');
        } else {
            console.log('⚠️ 低性能環境のためシャドウマッピングを無効化');
            this.renderer.shadowMap.enabled = false;
        }
        
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // 診断結果をゲームオブジェクトに保存
        this.webglDiagnostic = diagnosticResult;
    }
    
    // WebGLフォールバック試行
    async attemptWebGLFallback(diagnosticResult) {
        console.log('🔧 WebGLフォールバックを試行します...');
        
        // WebGL修復を試行
        await WebGLDiagnostic.attemptRepair();
        
        // 最低限の設定で再試行
        try {
            const canvas = document.getElementById('gameCanvas');
            this.renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                alpha: false,
                antialias: false,
                precision: "lowp",
                powerPreference: "default"
            });
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.shadowMap.enabled = false;
            
            console.log('✅ フォールバックモードでWebGL初期化成功');
            
            // 低品質モード通知
            if (window.notificationSystem) {
                window.notificationSystem.show(
                    '⚠️ 低品質モードで動作しています', 
                    'warning', 
                    3000
                );
            }
            
        } catch (fallbackError) {
            console.error('❌ フォールバックも失敗:', fallbackError);
            this.handleWebGLError({
                type: 'error',
                title: 'WebGL初期化完全失敗',
                message: 'WebGLの初期化に完全に失敗しました。ブラウザまたはシステムの問題の可能性があります。',
                actions: ['ブラウザを再起動', 'システムを再起動', 'グラフィックドライバを更新']
            }, diagnosticResult);
            
            throw new Error('WebGL fallback failed');
        }
    }
    
    // WebGLエラーハンドリング
    handleWebGLError(userMessage, diagnosticResult) {
        console.error('❌ WebGL初期化失敗:', diagnosticResult);
        
        // エラーハンドラーに詳細情報を送信
        if (window.errorHandler) {
            window.errorHandler.handleError({
                type: 'WebGL Initialization Error',
                message: userMessage.message,
                severity: 'critical',
                details: diagnosticResult
            });
        }
        
        // ユーザーへの詳細説明モーダル表示
        this.showWebGLErrorModal(userMessage, diagnosticResult);
    }
    
    // WebGL警告表示
    showWebGLWarning(userMessage) {
        console.warn('⚠️ WebGL警告:', userMessage.message);
        
        if (window.notificationSystem) {
            window.notificationSystem.show(
                `⚠️ ${userMessage.message}`, 
                'warning', 
                5000
            );
        }
    }
    
    // WebGLエラーモーダル表示
    showWebGLErrorModal(userMessage, diagnosticResult) {
        const modal = document.createElement('div');
        modal.id = 'webgl-error-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            font-family: Arial, sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="background: #1a1a1a; color: white; padding: 2rem; border-radius: 10px; max-width: 600px; max-height: 80vh; overflow-y: auto; text-align: center;">
                <h2 style="color: #ff4444; margin-bottom: 1rem;">🚨 ${userMessage.title}</h2>
                <p style="margin-bottom: 1.5rem; font-size: 16px; line-height: 1.4;">${userMessage.message}</p>
                
                <div style="text-align: left; background: #2a2a2a; padding: 1rem; border-radius: 5px; margin: 1rem 0; font-size: 14px;">
                    <strong>📊 診断情報:</strong><br>
                    <div style="margin: 0.5rem 0;">
                        ブラウザ: ${navigator.userAgent.split(' ').slice(0, 2).join(' ')}<br>
                        WebGL対応: ${diagnosticResult.supported ? '✅ 対応' : '❌ 非対応'}<br>
                        ${diagnosticResult.version ? `WebGLバージョン: ${diagnosticResult.version}<br>` : ''}
                        ${diagnosticResult.renderer ? `GPU: ${diagnosticResult.renderer}<br>` : ''}
                        ${diagnosticResult.vendor ? `ベンダー: ${diagnosticResult.vendor}<br>` : ''}
                        ${diagnosticResult.maxTextureSize > 0 ? `最大テクスチャサイズ: ${diagnosticResult.maxTextureSize}px<br>` : ''}
                    </div>
                    ${diagnosticResult.errors.length > 0 ? `<div style="color: #ff4444;">❌ エラー: ${diagnosticResult.errors.join(', ')}</div>` : ''}
                    ${diagnosticResult.warnings.length > 0 ? `<div style="color: #ffaa00;">⚠️ 警告: ${diagnosticResult.warnings.join(', ')}</div>` : ''}
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <strong>🔧 推奨される対処法:</strong>
                    <ul style="text-align: left; margin: 0.5rem 0; padding-left: 1.5rem;">
                        ${userMessage.actions.map(action => `<li style="margin: 0.3rem 0;">${action}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button onclick="location.reload()" style="padding: 0.8rem 1.5rem; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                        🔄 ページを再読み込み
                    </button>
                    <button onclick="document.getElementById('webgl-error-modal').remove()" style="padding: 0.8rem 1.5rem; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                        ❌ 閉じる
                    </button>
                    <button onclick="navigator.clipboard.writeText(JSON.stringify(${JSON.stringify(diagnosticResult).replace(/"/g, '\\"')}, null, 2)).then(() => alert('診断情報をクリップボードにコピーしました'))" style="padding: 0.8rem 1.5rem; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                        📋 診断情報コピー
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // 空色
        
        // フォグの追加（遠景をぼかす）
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 300);
        
        // カメラの設定
        this.camera = new THREE.PerspectiveCamera(
            75, // FOV
            window.innerWidth / window.innerHeight, // アスペクト比
            0.1, // Near
            1000 // Far
        );
    }
    
    setupLighting() {
        // 環境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // 太陽光（方向光）
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        
        // シャドウマップの設定
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(directionalLight);
        
        // 追加の光源（車のヘッドライト風）
        const spotLight = new THREE.SpotLight(0xffffff, 0.5);
        spotLight.position.set(0, 10, 0);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.1;
        spotLight.decay = 2;
        spotLight.distance = 50;
        this.scene.add(spotLight);
    }
    
    setupGameObjects() {
        // トラックの作成
        this.track = new Track(this.scene);
        
        // 車の作成
        this.car = new Car(this.scene);
        
        // カメラコントローラーの作成
        this.cameraController = new CameraController(this.camera, this.car);
        
        // 車を初期位置に配置
        this.resetCarPosition();
    }
    
    setupEventListeners() {
        // キーボードイベント
        document.addEventListener('keydown', (event) => {
            this.inputManager.keys[event.code] = true;
            this.handleKeyDown(event);
        });
        
        document.addEventListener('keyup', (event) => {
            this.inputManager.keys[event.code] = false;
        });
        
        // マウスイベント
        document.addEventListener('mousemove', (event) => {
            this.inputManager.mouseX = event.clientX;
            this.inputManager.mouseY = event.clientY;
        });
        
        // ウィンドウリサイズ
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // フォーカス管理
        window.addEventListener('blur', () => {
            this.pauseGame();
        });
        
        window.addEventListener('focus', () => {
            if (this.gameState.isPaused) {
                this.resumeGame();
            }
        });
    }
    
    setupUI() {
        // ローディング画面を非表示
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
    
    // エラーメッセージ表示
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            text-align: center;
            z-index: 10000;
            max-width: 80%;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;
        errorDiv.innerHTML = `
            <h3>🚫 エラー</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                background: #fff;
                color: #000;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">リロード</button>
        `;
        document.body.appendChild(errorDiv);
    }
    
    handleKeyDown(event) {
        switch (event.code) {
            case 'KeyC':
                this.cameraController.nextCameraType();
                break;
            case 'KeyR':
                this.resetGame();
                break;
            case 'KeyQ':
                // ギアダウン
                if (this.car) {
                    this.car.setInput({ shiftDown: true });
                }
                break;
            case 'KeyE':
                // ギアアップ
                if (this.car) {
                    this.car.setInput({ shiftUp: true });
                }
                break;
            case 'KeyT':
                // トランスミッションモード切替
                if (this.car) {
                    this.car.setInput({ toggleTransmission: true });
                }
                break;
            case 'KeyP':
            case 'Escape':
                this.togglePause();
                break;
        }
    }
    
    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    startGame() {
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        this.clock.start();
        this.gameLoop();
    }
    
    pauseGame() {
        this.gameState.isPaused = true;
    }
    
    resumeGame() {
        this.gameState.isPaused = false;
        this.clock.start();
    }
    
    togglePause() {
        if (this.gameState.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }
    
    resetGame() {
        this.resetCarPosition();
        this.gameState.currentLap = 1;
        this.gameState.lapTime = 0;
        this.gameState.totalTime = 0;
        this.track.resetCheckpoints();
        this.cameraController.reset();
    }
    
    resetCarPosition() {
        const startPos = this.track.getStartPosition();
        const startRot = this.track.getStartRotation();
        
        this.car.mesh.position.set(startPos.x, startPos.y, startPos.z);
        this.car.mesh.rotation.set(startRot.x, startRot.y, startRot.z);
        this.car.resetPhysics();
    }
    
    gameLoop() {
        if (!this.gameState.isPlaying) return;
        
        requestAnimationFrame(() => this.gameLoop());
        
        if (this.gameState.isPaused) return;
        
        const deltaTime = this.clock.getDelta();
        this.update(deltaTime);
        this.render();
        
        // パフォーマンス監視
        this.performanceMonitor.update();
    }
    
    update(deltaTime) {
        // 入力処理
        this.updateInput();
        
        // 車の更新
        this.car.update(deltaTime);
        
        // 物理演算
        this.physicsEngine.updatePhysics(this.car, deltaTime);
        
        // 衝突判定
        this.updateCollisions();
        
        // カメラの更新
        this.cameraController.update(deltaTime);
        
        // ゲーム状態の更新
        this.updateGameState(deltaTime);
        
        // UI更新
        this.updateUI();
    }
    
    updateInput() {
        const input = {
            accelerate: this.inputManager.keys['KeyW'] || this.inputManager.keys['ArrowUp'],
            brake: this.inputManager.keys['KeyS'] || this.inputManager.keys['ArrowDown'] || this.inputManager.keys['Space'],
            steerLeft: this.inputManager.keys['KeyA'] || this.inputManager.keys['ArrowLeft'],
            steerRight: this.inputManager.keys['KeyD'] || this.inputManager.keys['ArrowRight'],
            shiftUp: this.inputManager.keys['KeyE'],
            shiftDown: this.inputManager.keys['KeyQ'],
            toggleTransmission: this.inputManager.keys['KeyT'],
            clutch: this.inputManager.keys['ShiftLeft']
        };
        
        this.car.setInput(input);
    }
    
    updateCollisions() {
        const carPosition = this.car.getPosition();
        
        // バリアとの衝突判定
        const barrierCollision = this.track.checkBarrierCollision(carPosition);
        if (barrierCollision.collision) {
            // 衝突時の処理
            this.handleBarrierCollision(barrierCollision);
        }
        
        // トラック外判定
        if (!this.track.isOnTrack(carPosition)) {
            // トラック外ペナルティ（速度減少）
            this.car.physics.velocity.x *= 0.95;
            this.car.physics.velocity.z *= 0.95;
        }
        
        // チェックポイント判定
        const checkpointResult = this.track.checkCheckpoints(carPosition);
        if (checkpointResult) {
            this.handleCheckpoint(checkpointResult);
        }
    }
    
    handleBarrierCollision(collision) {
        // 反発処理
        const reflectionForce = 500;
        this.car.applyImpulse({
            x: collision.normal.x * reflectionForce,
            y: 0,
            z: collision.normal.z * reflectionForce
        });
        
        // カメラ振動
        this.cameraController.shake(2, 0.3);
        
        // 速度減少
        this.car.physics.velocity.x *= 0.7;
        this.car.physics.velocity.z *= 0.7;
    }
    
    handleCheckpoint(result) {
        if (result.type === 'lap_complete') {
            // ラップ完了
            if (this.gameState.bestLapTime === null || 
                this.gameState.lapTime < this.gameState.bestLapTime) {
                this.gameState.bestLapTime = this.gameState.lapTime;
            }
            
            this.gameState.currentLap++;
            this.gameState.lapTime = 0;
            
            if (this.gameState.currentLap > this.gameState.totalLaps) {
                this.endRace();
            }
        }
    }
    
    updateGameState(deltaTime) {
        if (this.gameState.isPlaying && !this.gameState.isPaused) {
            this.gameState.lapTime += deltaTime;
            this.gameState.totalTime += deltaTime;
        }
    }
    
    updateUI() {
        // 速度表示
        const speedElement = document.getElementById('speed');
        if (speedElement) {
            speedElement.textContent = Math.round(this.car.speed);
        }
        
        // FPS表示（デバッグ用）
        if (window.location.search.includes('debug')) {
            const fps = this.performanceMonitor.getFPS();
            console.log(`FPS: ${fps}`);
        }
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
        
        // レンダリング情報をリセット（パフォーマンス監視用）
        this.renderer.info.reset();
    }
    
    endRace() {
        this.gameState.isPlaying = false;
        alert(`レース完了！\n総時間: ${this.formatTime(this.gameState.totalTime)}\nベストラップ: ${this.formatTime(this.gameState.bestLapTime)}`);
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(2);
        return `${minutes}:${secs.padStart(5, '0')}`;
    }
    
    // パフォーマンス情報を取得
    getPerformanceInfo() {
        return {
            fps: this.performanceMonitor.getFPS(),
            renderCalls: this.renderer.info.render.calls,
            triangles: this.renderer.info.render.triangles,
            geometries: this.renderer.info.memory.geometries,
            textures: this.renderer.info.memory.textures
        };
    }
}

