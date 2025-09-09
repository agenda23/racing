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
            steerRight: false
        };
        
        // 車両の状態
        this.speed = 0; // 現在の速度 (km/h)
        this.rpm = 800; // エンジンRPM
        this.gear = 1; // ギア
        
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
        if (this.input.accelerate) {
            const speedRatio = currentSpeed / (this.maxSpeed / 3.6); // km/h to m/s
            engineForce = this.enginePower * (1 - speedRatio * 0.8);
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
        
        // RPMの計算（簡易版）
        this.rpm = 800 + (this.speed * 30);
        this.rpm = Utils.clamp(this.rpm, 800, 7000);
    }
    
    // 車両をリセット
    reset() {
        this.mesh.position.set(0, 1, 0);
        this.mesh.rotation.set(0, 0, 0);
        this.resetPhysics();
        this.steerAngle = 0;
        this.speed = 0;
        this.rpm = 800;
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

