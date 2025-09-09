// ユーティリティ関数
class Utils {
    // 度をラジアンに変換
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // ラジアンを度に変換
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
    
    // 値を指定範囲内にクランプ
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    // 線形補間
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    // ベクトルの長さを計算
    static vectorLength(x, y, z = 0) {
        return Math.sqrt(x * x + y * y + z * z);
    }
    
    // ベクトルを正規化
    static normalizeVector(x, y, z = 0) {
        const length = this.vectorLength(x, y, z);
        if (length === 0) return { x: 0, y: 0, z: 0 };
        return {
            x: x / length,
            y: y / length,
            z: z / length
        };
    }
    
    // 2つのベクトルの内積
    static dotProduct(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
    
    // 2つのベクトルの外積
    static crossProduct(v1, v2) {
        return {
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x
        };
    }
    
    // ランダムな値を生成
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // パフォーマンス測定用のタイマー
    static createTimer() {
        return {
            start: performance.now(),
            elapsed: function() {
                return performance.now() - this.start;
            },
            reset: function() {
                this.start = performance.now();
            }
        };
    }
}

// デバッグ用のパフォーマンス監視クラス
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        this.frameTime = 0;
        this.updateInterval = 1000; // 1秒間隔で更新
    }
    
    update() {
        this.frameCount++;
        const currentTime = performance.now();
        this.frameTime = currentTime - this.lastTime;
        
        if (this.frameTime >= this.updateInterval) {
            this.fps = Math.round((this.frameCount * 1000) / this.frameTime);
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }
    
    getFPS() {
        return this.fps;
    }
    
    getFrameTime() {
        return this.frameTime;
    }
}

