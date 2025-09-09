// 簡易物理エンジン
class PhysicsEngine {
    constructor() {
        this.gravity = -9.81; // 重力加速度 (m/s²)
        this.airResistance = 0.98; // 空気抵抗係数
        this.groundFriction = 0.95; // 地面摩擦係数
    }
    
    // 物体の物理更新
    updatePhysics(object, deltaTime) {
        if (!object.physics) return;
        
        const physics = object.physics;
        
        // 重力の適用
        if (!physics.onGround) {
            physics.velocity.y += this.gravity * deltaTime;
        }
        
        // 空気抵抗の適用
        physics.velocity.x *= this.airResistance;
        physics.velocity.z *= this.airResistance;
        
        // 地面摩擦の適用（地面にいる場合）
        if (physics.onGround) {
            physics.velocity.x *= this.groundFriction;
            physics.velocity.z *= this.groundFriction;
        }
        
        // 位置の更新
        object.position.x += physics.velocity.x * deltaTime;
        object.position.y += physics.velocity.y * deltaTime;
        object.position.z += physics.velocity.z * deltaTime;
        
        // 地面との衝突判定（簡易版）
        if (object.position.y <= 0) {
            object.position.y = 0;
            physics.velocity.y = 0;
            physics.onGround = true;
        } else {
            physics.onGround = false;
        }
    }
}

// 衝突判定クラス
class CollisionDetector {
    constructor() {
        this.collisionPairs = [];
    }
    
    // AABBによる衝突判定
    checkAABBCollision(box1, box2) {
        return (
            box1.min.x <= box2.max.x &&
            box1.max.x >= box2.min.x &&
            box1.min.y <= box2.max.y &&
            box1.max.y >= box2.min.y &&
            box1.min.z <= box2.max.z &&
            box1.max.z >= box2.min.z
        );
    }
    
    // 球体同士の衝突判定
    checkSphereCollision(sphere1, sphere2) {
        const dx = sphere1.position.x - sphere2.position.x;
        const dy = sphere1.position.y - sphere2.position.y;
        const dz = sphere1.position.z - sphere2.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        return distance <= (sphere1.radius + sphere2.radius);
    }
    
    // レイキャスティング（地面との衝突判定用）
    raycast(origin, direction, maxDistance = 1000) {
        // 簡易版：Y=0の平面との交点を計算
        if (direction.y >= 0) return null; // 上向きまたは水平の場合は交点なし
        
        const t = -origin.y / direction.y;
        if (t < 0 || t > maxDistance) return null;
        
        return {
            point: {
                x: origin.x + direction.x * t,
                y: 0,
                z: origin.z + direction.z * t
            },
            distance: t,
            normal: { x: 0, y: 1, z: 0 }
        };
    }
    
    // 物体にバウンディングボックスを設定
    updateBoundingBox(object) {
        if (!object.geometry) return;
        
        object.geometry.computeBoundingBox();
        const box = object.geometry.boundingBox;
        
        object.boundingBox = {
            min: {
                x: object.position.x + box.min.x,
                y: object.position.y + box.min.y,
                z: object.position.z + box.min.z
            },
            max: {
                x: object.position.x + box.max.x,
                y: object.position.y + box.max.y,
                z: object.position.z + box.max.z
            }
        };
    }
}

// 物理プロパティを持つオブジェクトの基底クラス
class PhysicsObject {
    constructor(mass = 1) {
        this.physics = {
            mass: mass,
            velocity: { x: 0, y: 0, z: 0 },
            acceleration: { x: 0, y: 0, z: 0 },
            angularVelocity: { x: 0, y: 0, z: 0 },
            onGround: false,
            friction: 0.8,
            restitution: 0.3 // 反発係数
        };
    }
    
    // 力を加える
    applyForce(force) {
        this.physics.acceleration.x += force.x / this.physics.mass;
        this.physics.acceleration.y += force.y / this.physics.mass;
        this.physics.acceleration.z += force.z / this.physics.mass;
    }
    
    // インパルスを加える（瞬間的な力）
    applyImpulse(impulse) {
        this.physics.velocity.x += impulse.x / this.physics.mass;
        this.physics.velocity.y += impulse.y / this.physics.mass;
        this.physics.velocity.z += impulse.z / this.physics.mass;
    }
    
    // 物理プロパティをリセット
    resetPhysics() {
        this.physics.velocity = { x: 0, y: 0, z: 0 };
        this.physics.acceleration = { x: 0, y: 0, z: 0 };
        this.physics.angularVelocity = { x: 0, y: 0, z: 0 };
    }
}

