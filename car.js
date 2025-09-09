// 車両クラス
class Car extends PhysicsObject {
    constructor(scene) {
        super(1000); // 車の質量 (kg)
        
        this.scene = scene;
        this.mesh = null;
        this.wheels = [];
        
        // 車両の物理パラメータ
        this.enginePower = 2000; // エンジンパワー (N)
        this.maxSpeed = 200; // 最高速度 (km/h)
        this.brakeForce = 3000; // ブレーキ力 (N)
        this.steerAngle = 0; // ステアリング角度
        this.maxSteerAngle = Utils.degToRad(30); // 最大ステアリング角度
        
        // 入力状態
        this.input = {
            accelerate: false,
            brake: false,
            steerLeft: false,
            steerRight: false,
            shiftUp: false,
            shiftDown: false,
            toggleTransmission: false,
            clutch: false
        };
        
        // 車両の状態
        this.speed = 0; // 現在の速度 (km/h)
        this.rpm = 800; // エンジンRPM
        this.gear = 1; // ギア
        
        // ギアシステム
        this.maxGear = 6; // 最大ギア数
        this.minGear = 1; // 最小ギア（リバースは-1）
        this.isAutomatic = true; // オートマチック/マニュアル切替
        this.gearRatios = [
            -2.5, // リバース (gear = -1)
            0,    // ニュートラル (gear = 0) 
            3.5,  // 1速 (gear = 1)
            2.2,  // 2速 (gear = 2)
            1.7,  // 3速 (gear = 3)
            1.3,  // 4速 (gear = 4)
            1.0,  // 5速 (gear = 5)
            0.8   // 6速 (gear = 6)
        ];
        this.clutch = 1.0; // クラッチ接続度（0-1）
        this.gearChangeTimer = 0; // ギアチェンジ中のタイマー
        this.isShifting = false; // ギアチェンジ中フラグ
        
        this.createCarMesh();
        this.setupPhysics();
    }
    
    createCarMesh() {
        // 車体の作成
        const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 2);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.position.y = 1;
        this.scene.add(this.mesh);
        
        // ホイールの作成
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        const wheelPositions = [
            { x: -1.5, y: 0.4, z: 1.2 },  // 左前
            { x: 1.5, y: 0.4, z: 1.2 },   // 右前
            { x: -1.5, y: 0.4, z: -1.2 }, // 左後
            { x: 1.5, y: 0.4, z: -1.2 }   // 右後
        ];
        
        wheelPositions.forEach((pos, index) => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos.x, pos.y, pos.z);
            wheel.rotation.z = Math.PI / 2;
            this.mesh.add(wheel);
            this.wheels.push({
                mesh: wheel,
                isFront: index < 2,
                isLeft: index % 2 === 0,
                steerAngle: 0
            });
        });
    }
    
    setupPhysics() {
        // 車両固有の物理設定
        this.physics.friction = 0.9;
        this.physics.restitution = 0.1;
        this.physics.onGround = true;
        
        // 車両の初期位置
        this.mesh.position.set(0, 1, 0);
    }
    
    update(deltaTime) {
        this.handleInput(deltaTime);
        this.updateGearSystem(deltaTime);
        this.updatePhysics(deltaTime);
        this.updateVisuals(deltaTime);
        this.updateSpeed();
    }
    
    handleInput(deltaTime) {
        const steerSpeed = 2.0; // ステアリング速度
        const steerReturn = 5.0; // ステアリング復帰速度
        
        // ステアリング処理
        if (this.input.steerLeft) {
            this.steerAngle = Math.min(this.steerAngle + steerSpeed * deltaTime, this.maxSteerAngle);
        } else if (this.input.steerRight) {
            this.steerAngle = Math.max(this.steerAngle - steerSpeed * deltaTime, -this.maxSteerAngle);
        } else {
            // ステアリングを中央に戻す
            if (this.steerAngle > 0) {
                this.steerAngle = Math.max(0, this.steerAngle - steerReturn * deltaTime);
            } else if (this.steerAngle < 0) {
                this.steerAngle = Math.min(0, this.steerAngle + steerReturn * deltaTime);
            }
        }
        
        // 前輪のステアリング角度を更新
        this.wheels.forEach(wheel => {
            if (wheel.isFront) {
                wheel.steerAngle = this.steerAngle;
            }
        });
        
        // ギア操作処理
        this.handleGearInput();
    }
    
    // ギア操作の処理
    handleGearInput() {
        // トランスミッションモード切替
        if (this.input.toggleTransmission && !this.wasTogglePressed) {
            this.isAutomatic = !this.isAutomatic;
            if (window.audioManager) {
                window.audioManager.playSound('click');
            }
            if (window.notificationSystem) {
                const mode = this.isAutomatic ? 'オートマチック' : 'マニュアル';
                window.notificationSystem.show(`${mode}モードに切り替えました`, 'info', 2000);
            }
        }
        this.wasTogglePressed = this.input.toggleTransmission;
        
        // マニュアルモードでのギア操作
        if (!this.isAutomatic && !this.isShifting) {
            if (this.input.shiftUp && !this.wasShiftUpPressed) {
                this.shiftUp();
            }
            if (this.input.shiftDown && !this.wasShiftDownPressed) {
                this.shiftDown();
            }
        }
        
        this.wasShiftUpPressed = this.input.shiftUp;
        this.wasShiftDownPressed = this.input.shiftDown;
    }
    
    // ギアシステムの更新
    updateGearSystem(deltaTime) {
        // ギアチェンジ中の処理
        if (this.isShifting) {
            this.gearChangeTimer += deltaTime;
            // ギアチェンジ中はクラッチを切る
            this.clutch = Math.max(0, 1 - (this.gearChangeTimer * 4));
            
            // ギアチェンジ完了判定
            if (this.gearChangeTimer >= 0.3) {
                this.isShifting = false;
                this.gearChangeTimer = 0;
                this.clutch = 1.0;
            }
        }
        
        // オートマチックモードでの自動ギア変速
        if (this.isAutomatic && !this.isShifting) {
            this.autoShift();
        }
        
        // クラッチ操作（マニュアルモード時）
        if (!this.isAutomatic) {
            if (this.input.clutch) {
                this.clutch = Math.max(0, this.clutch - deltaTime * 3);
            } else if (!this.isShifting) {
                this.clutch = Math.min(1, this.clutch + deltaTime * 2);
            }
        }
    }
    
    // ギアアップ
    shiftUp() {
        if (this.gear < this.maxGear && !this.isShifting) {
            if (this.gear === -1) {
                this.gear = 0; // リバースからニュートラル
            } else if (this.gear === 0) {
                this.gear = 1; // ニュートラルから1速
            } else {
                this.gear++; // 通常のギアアップ
            }
            this.startGearChange();
        }
    }
    
    // ギアダウン
    shiftDown() {
        if (this.gear > -1 && !this.isShifting) {
            if (this.gear === 1) {
                this.gear = 0; // 1速からニュートラル
            } else if (this.gear === 0) {
                this.gear = -1; // ニュートラルからリバース
            } else {
                this.gear--; // 通常のギアダウン
            }
            this.startGearChange();
        }
    }
    
    // ギアチェンジ開始
    startGearChange() {
        this.isShifting = true;
        this.gearChangeTimer = 0;
        
        // 音響効果
        if (window.audioManager) {
            window.audioManager.playSound('gearshift');
        }
    }
    
    // オートマチック変速制御
    autoShift() {
        const currentSpeedKmh = this.speed;
        const currentRpm = this.rpm;
        
        // アップシフト条件
        if (this.gear < this.maxGear && currentRpm > 6000) {
            this.shiftUp();
        }
        // ダウンシフト条件  
        else if (this.gear > 1 && currentRpm < 2000 && currentSpeedKmh > 10) {
            this.shiftDown();
        }
        
        // 停車時は1速に戻す
        if (currentSpeedKmh < 5 && this.gear > 1) {
            this.gear = 1;
        }
    }
    
    updatePhysics(deltaTime) {
        // 現在の速度を計算
        const currentSpeed = Utils.vectorLength(
            this.physics.velocity.x,
            0,
            this.physics.velocity.z
        );
        
        // エンジン力の計算
        let engineForce = 0;
        if (this.input.accelerate && this.gear !== 0) {
            // ギア比を取得（配列のインデックス調整）
            const gearRatio = this.getGearRatio(this.gear);
            const speedRatio = currentSpeed / (this.maxSpeed / 3.6); // km/h to m/s
            
            // クラッチ接続度とギア比を考慮
            const baseForce = this.enginePower * (1 - speedRatio * 0.6);
            engineForce = baseForce * Math.abs(gearRatio) * this.clutch;
            
            // リバース時は後進
            if (this.gear === -1) {
                engineForce = -engineForce;
            }
        }
        
        // ブレーキ力の計算
        let brakeForce = 0;
        if (this.input.brake) {
            brakeForce = this.brakeForce;
        }
        
        // 車両の向きベクトル
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(this.mesh.quaternion);
        
        // 力の適用
        if (engineForce > 0) {
            this.applyForce({
                x: forward.x * engineForce,
                y: 0,
                z: forward.z * engineForce
            });
        }
        
        // ブレーキの適用
        if (brakeForce > 0) {
            const brakeDirection = {
                x: -this.physics.velocity.x,
                y: 0,
                z: -this.physics.velocity.z
            };
            const brakeNorm = Utils.normalizeVector(brakeDirection.x, brakeDirection.y, brakeDirection.z);
            
            this.applyForce({
                x: brakeNorm.x * brakeForce,
                y: 0,
                z: brakeNorm.z * brakeForce
            });
        }
        
        // ステアリングによる回転
        if (Math.abs(this.steerAngle) > 0.01 && currentSpeed > 0.1) {
            const turnRate = this.steerAngle * currentSpeed * 0.02;
            this.physics.angularVelocity.y = turnRate;
        } else {
            this.physics.angularVelocity.y *= 0.9; // 角速度の減衰
        }
        
        // 物理更新
        this.mesh.position.x += this.physics.velocity.x * deltaTime;
        this.mesh.position.z += this.physics.velocity.z * deltaTime;
        
        // 回転の適用
        this.mesh.rotation.y += this.physics.angularVelocity.y * deltaTime;
        
        // 速度の減衰
        this.physics.velocity.x *= 0.98;
        this.physics.velocity.z *= 0.98;
        this.physics.acceleration = { x: 0, y: 0, z: 0 };
    }
    
    updateVisuals(deltaTime) {
        // ホイールの回転
        const wheelRotationSpeed = this.speed * 0.1;
        
        this.wheels.forEach(wheel => {
            // ホイールの回転
            wheel.mesh.rotation.x += wheelRotationSpeed * deltaTime;
            
            // 前輪のステアリング
            if (wheel.isFront) {
                wheel.mesh.rotation.y = wheel.steerAngle;
            }
        });
    }
    
    updateSpeed() {
        // 速度をkm/hで計算
        const velocityMagnitude = Utils.vectorLength(
            this.physics.velocity.x,
            0,
            this.physics.velocity.z
        );
        this.speed = velocityMagnitude * 3.6; // m/s to km/h
        
        // RPMの計算（ギア比を考慮）
        this.updateRPM();
    }
    
    // RPM更新（ギア比ベース）
    updateRPM() {
        const idleRPM = 800;
        const maxRPM = 7500;
        
        if (this.gear === 0) {
            // ニュートラル時はアイドル回転
            this.rpm = idleRPM;
        } else {
            const gearRatio = Math.abs(this.getGearRatio(this.gear));
            // 速度とギア比からRPMを計算
            const speedBasedRPM = idleRPM + (this.speed * gearRatio * 15);
            
            // アクセル時はRPMが上がりやすく
            if (this.input.accelerate) {
                const targetRPM = Math.min(maxRPM, speedBasedRPM * 1.2);
                this.rpm = Utils.lerp(this.rpm, targetRPM, 0.1);
            } else {
                // エンジンブレーキ効果
                const targetRPM = Math.max(idleRPM, speedBasedRPM * 0.8);
                this.rpm = Utils.lerp(this.rpm, targetRPM, 0.05);
            }
        }
        
        this.rpm = Utils.clamp(this.rpm, idleRPM, maxRPM);
    }
    
    // ギア比取得ヘルパー関数
    getGearRatio(gear) {
        // 配列インデックスに変換（gear -1 → index 0, gear 0 → index 1, etc.）
        const index = gear + 1;
        return this.gearRatios[index] || 1.0;
    }
    
    // 車両をリセット
    reset() {
        this.mesh.position.set(0, 1, 0);
        this.mesh.rotation.set(0, 0, 0);
        this.resetPhysics();
        this.steerAngle = 0;
        this.speed = 0;
        this.rpm = 800;
        this.gear = 1;
        this.clutch = 1.0;
        this.isShifting = false;
        this.gearChangeTimer = 0;
    }
    
    // 入力の設定
    setInput(input) {
        this.input = { ...this.input, ...input };
    }
    
    // 位置の取得
    getPosition() {
        return this.mesh.position.clone();
    }
    
    // 向きの取得
    getForward() {
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(this.mesh.quaternion);
        return forward;
    }
}

