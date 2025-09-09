// カメラコントロールクラス
class CameraController {
    constructor(camera, car) {
        this.camera = camera;
        this.car = car;
        
        // カメラの種類
        this.cameraTypes = {
            FOLLOW: 'follow',
            CHASE: 'chase',
            COCKPIT: 'cockpit',
            OVERHEAD: 'overhead'
        };
        
        this.currentType = this.cameraTypes.FOLLOW;
        
        // カメラ設定
        this.followDistance = 15;
        this.followHeight = 8;
        this.chaseDistance = 20;
        this.chaseHeight = 10;
        this.cockpitOffset = { x: 0, y: 1.5, z: 1 };
        this.overheadHeight = 50;
        
        // スムージング設定
        this.smoothing = 0.1;
        this.lookSmoothingFollow = 0.05;
        this.lookSmoothingChase = 0.03;
        
        // カメラの現在位置と目標位置
        this.currentPosition = new THREE.Vector3();
        this.targetPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        this.targetLookAt = new THREE.Vector3();
        
        // 初期化
        this.initialize();
    }
    
    initialize() {
        // 初期カメラ位置を設定
        this.updateTargetPositions();
        this.camera.position.copy(this.targetPosition);
        this.camera.lookAt(this.targetLookAt);
        this.currentPosition.copy(this.targetPosition);
        this.currentLookAt.copy(this.targetLookAt);
    }
    
    update(deltaTime) {
        this.updateTargetPositions();
        this.smoothCameraMovement(deltaTime);
        this.updateCameraOrientation();
    }
    
    updateTargetPositions() {
        const carPosition = this.car.getPosition();
        const carForward = this.car.getForward();
        const carRight = new THREE.Vector3(-carForward.z, 0, carForward.x);
        
        switch (this.currentType) {
            case this.cameraTypes.FOLLOW:
                this.updateFollowCamera(carPosition, carForward);
                break;
                
            case this.cameraTypes.CHASE:
                this.updateChaseCamera(carPosition, carForward);
                break;
                
            case this.cameraTypes.COCKPIT:
                this.updateCockpitCamera(carPosition, carForward, carRight);
                break;
                
            case this.cameraTypes.OVERHEAD:
                this.updateOverheadCamera(carPosition);
                break;
        }
    }
    
    updateFollowCamera(carPosition, carForward) {
        // 車の後方にカメラを配置
        this.targetPosition.copy(carPosition);
        this.targetPosition.add(carForward.clone().multiplyScalar(-this.followDistance));
        this.targetPosition.y += this.followHeight;
        
        // 車の少し前方を見る
        this.targetLookAt.copy(carPosition);
        this.targetLookAt.add(carForward.clone().multiplyScalar(5));
        this.targetLookAt.y += 2;
    }
    
    updateChaseCamera(carPosition, carForward) {
        // より遠くから車を追跡
        this.targetPosition.copy(carPosition);
        this.targetPosition.add(carForward.clone().multiplyScalar(-this.chaseDistance));
        this.targetPosition.y += this.chaseHeight;
        
        // 車を直接見る
        this.targetLookAt.copy(carPosition);
        this.targetLookAt.y += 1;
    }
    
    updateCockpitCamera(carPosition, carForward, carRight) {
        // 車内視点
        this.targetPosition.copy(carPosition);
        this.targetPosition.add(carRight.clone().multiplyScalar(this.cockpitOffset.x));
        this.targetPosition.y += this.cockpitOffset.y;
        this.targetPosition.add(carForward.clone().multiplyScalar(this.cockpitOffset.z));
        
        // 前方を見る
        this.targetLookAt.copy(carPosition);
        this.targetLookAt.add(carForward.clone().multiplyScalar(20));
        this.targetLookAt.y += 1;
    }
    
    updateOverheadCamera(carPosition) {
        // 上空から見下ろす
        this.targetPosition.copy(carPosition);
        this.targetPosition.y += this.overheadHeight;
        
        this.targetLookAt.copy(carPosition);
    }
    
    smoothCameraMovement(deltaTime) {
        // 位置のスムージング
        this.currentPosition.lerp(this.targetPosition, this.smoothing);
        
        // 視点のスムージング（カメラタイプに応じて調整）
        let lookSmoothing = this.lookSmoothingFollow;
        if (this.currentType === this.cameraTypes.CHASE) {
            lookSmoothing = this.lookSmoothingChase;
        } else if (this.currentType === this.cameraTypes.COCKPIT) {
            lookSmoothing = 0.1; // コックピット視点は少し速く
        } else if (this.currentType === this.cameraTypes.OVERHEAD) {
            lookSmoothing = 0.05; // オーバーヘッド視点はゆっくり
        }
        
        this.currentLookAt.lerp(this.targetLookAt, lookSmoothing);
    }
    
    updateCameraOrientation() {
        // カメラの位置と向きを更新
        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
        
        // カメラの傾きを調整（車の動きに応じて）
        if (this.currentType === this.cameraTypes.FOLLOW || 
            this.currentType === this.cameraTypes.CHASE) {
            
            const carVelocity = this.car.physics.velocity;
            const velocityMagnitude = Utils.vectorLength(carVelocity.x, 0, carVelocity.z);
            
            // 速度に応じてカメラを少し傾ける
            const tiltAmount = Utils.clamp(velocityMagnitude * 0.001, 0, 0.1);
            this.camera.rotation.z = this.car.steerAngle * tiltAmount;
        }
    }
    
    // カメラタイプを切り替え
    switchCameraType(type) {
        if (this.cameraTypes[type.toUpperCase()]) {
            this.currentType = this.cameraTypes[type.toUpperCase()];
        }
    }
    
    // 次のカメラタイプに切り替え
    nextCameraType() {
        const types = Object.values(this.cameraTypes);
        const currentIndex = types.indexOf(this.currentType);
        const nextIndex = (currentIndex + 1) % types.length;
        this.currentType = types[nextIndex];
    }
    
    // カメラ設定を調整
    adjustSettings(settings) {
        if (settings.followDistance !== undefined) {
            this.followDistance = settings.followDistance;
        }
        if (settings.followHeight !== undefined) {
            this.followHeight = settings.followHeight;
        }
        if (settings.chaseDistance !== undefined) {
            this.chaseDistance = settings.chaseDistance;
        }
        if (settings.chaseHeight !== undefined) {
            this.chaseHeight = settings.chaseHeight;
        }
        if (settings.smoothing !== undefined) {
            this.smoothing = settings.smoothing;
        }
    }
    
    // 現在のカメラタイプを取得
    getCurrentType() {
        return this.currentType;
    }
    
    // カメラをリセット
    reset() {
        this.currentType = this.cameraTypes.FOLLOW;
        this.initialize();
    }
    
    // 手動でカメラを振動させる（衝突時など）
    shake(intensity = 1, duration = 0.5) {
        const originalPosition = this.camera.position.clone();
        const shakeStart = performance.now();
        
        const shakeEffect = () => {
            const elapsed = (performance.now() - shakeStart) / 1000;
            if (elapsed < duration) {
                const shakeAmount = intensity * (1 - elapsed / duration);
                this.camera.position.x = originalPosition.x + (Math.random() - 0.5) * shakeAmount;
                this.camera.position.y = originalPosition.y + (Math.random() - 0.5) * shakeAmount;
                this.camera.position.z = originalPosition.z + (Math.random() - 0.5) * shakeAmount;
                
                requestAnimationFrame(shakeEffect);
            } else {
                this.camera.position.copy(originalPosition);
            }
        };
        
        shakeEffect();
    }
}

