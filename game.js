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
        
        // タイミング
        this.clock = new THREE.Clock();
        this.lastTime = 0;
        
        this.initialize();
    }
    
    initialize() {
        this.setupRenderer();
        this.setupScene();
        this.setupLighting();
        this.setupGameObjects();
        this.setupEventListeners();
        this.setupUI();
        
        // ゲーム開始
        this.startGame();
    }
    
    setupRenderer() {
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // パフォーマンス最適化
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // パフォーマンス設定
        this.renderer.info.autoReset = false;
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
    
    handleKeyDown(event) {
        switch (event.code) {
            case 'KeyC':
                this.cameraController.nextCameraType();
                break;
            case 'KeyR':
                this.resetGame();
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
            steerRight: this.inputManager.keys['KeyD'] || this.inputManager.keys['ArrowRight']
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

