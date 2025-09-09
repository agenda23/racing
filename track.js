// トラッククラス
class Track {
    constructor(scene) {
        this.scene = scene;
        this.trackMesh = null;
        this.barriers = [];
        this.checkpoints = [];
        this.startLine = null;
        
        this.createTrack();
        this.createBarriers();
        this.createCheckpoints();
    }
    
    createTrack() {
        // メイントラックの作成（楕円形）
        const trackWidth = 10;
        const trackLength = 200;
        const trackHeight = 100;
        
        // トラック表面
        const trackGeometry = new THREE.RingGeometry(
            trackHeight - trackWidth / 2,
            trackHeight + trackWidth / 2,
            32
        );
        const trackMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x444444,
            side: THREE.DoubleSide
        });
        
        this.trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
        this.trackMesh.rotation.x = -Math.PI / 2;
        this.trackMesh.position.y = 0.01; // 地面より少し上
        this.scene.add(this.trackMesh);
        
        // トラックの境界線
        this.createTrackLines(trackHeight, trackWidth);
        
        // 地面の作成
        const groundGeometry = new THREE.PlaneGeometry(500, 500);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22 // 緑色の草
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        this.scene.add(ground);
    }
    
    createTrackLines(radius, width) {
        // 内側の白線
        const innerLineGeometry = new THREE.RingGeometry(
            radius - width / 2 - 0.2,
            radius - width / 2,
            64
        );
        const lineMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        
        const innerLine = new THREE.Mesh(innerLineGeometry, lineMaterial);
        innerLine.rotation.x = -Math.PI / 2;
        innerLine.position.y = 0.02;
        this.scene.add(innerLine);
        
        // 外側の白線
        const outerLineGeometry = new THREE.RingGeometry(
            radius + width / 2,
            radius + width / 2 + 0.2,
            64
        );
        
        const outerLine = new THREE.Mesh(outerLineGeometry, lineMaterial);
        outerLine.rotation.x = -Math.PI / 2;
        outerLine.position.y = 0.02;
        this.scene.add(outerLine);
        
        // 中央線（破線風）
        this.createCenterLine(radius, width);
    }
    
    createCenterLine(radius, width) {
        const centerLineMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffff00 // 黄色
        });
        
        // 破線を作成
        const dashCount = 32;
        for (let i = 0; i < dashCount; i++) {
            const angle = (i / dashCount) * Math.PI * 2;
            const dashLength = 3;
            const dashWidth = 0.2;
            
            if (i % 2 === 0) { // 偶数番目のみ表示（破線効果）
                const dashGeometry = new THREE.BoxGeometry(dashLength, 0.01, dashWidth);
                const dash = new THREE.Mesh(dashGeometry, centerLineMaterial);
                
                dash.position.x = Math.cos(angle) * radius;
                dash.position.z = Math.sin(angle) * radius;
                dash.position.y = 0.03;
                dash.rotation.y = angle + Math.PI / 2;
                
                this.scene.add(dash);
            }
        }
    }
    
    createBarriers() {
        const barrierHeight = 2;
        const barrierWidth = 1;
        const trackRadius = 100;
        const trackWidth = 10;
        
        // 内側バリア
        this.createCircularBarriers(
            trackRadius - trackWidth / 2 - 2,
            barrierHeight,
            barrierWidth,
            0xff0000 // 赤色
        );
        
        // 外側バリア
        this.createCircularBarriers(
            trackRadius + trackWidth / 2 + 2,
            barrierHeight,
            barrierWidth,
            0xff0000 // 赤色
        );
    }
    
    createCircularBarriers(radius, height, width, color) {
        const barrierCount = 64;
        const barrierMaterial = new THREE.MeshLambertMaterial({ color: color });
        
        for (let i = 0; i < barrierCount; i++) {
            const angle = (i / barrierCount) * Math.PI * 2;
            const barrierGeometry = new THREE.BoxGeometry(width, height, width);
            const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
            
            barrier.position.x = Math.cos(angle) * radius;
            barrier.position.z = Math.sin(angle) * radius;
            barrier.position.y = height / 2;
            
            this.barriers.push(barrier);
            this.scene.add(barrier);
        }
    }
    
    createCheckpoints() {
        const checkpointCount = 8;
        const trackRadius = 100;
        
        for (let i = 0; i < checkpointCount; i++) {
            const angle = (i / checkpointCount) * Math.PI * 2;
            
            // チェックポイントの視覚的表示
            const checkpointGeometry = new THREE.BoxGeometry(0.5, 5, 15);
            const checkpointMaterial = new THREE.MeshLambertMaterial({ 
                color: i === 0 ? 0x00ff00 : 0x0000ff, // スタートラインは緑、他は青
                transparent: true,
                opacity: 0.7
            });
            
            const checkpoint = new THREE.Mesh(checkpointGeometry, checkpointMaterial);
            checkpoint.position.x = Math.cos(angle) * trackRadius;
            checkpoint.position.z = Math.sin(angle) * trackRadius;
            checkpoint.position.y = 2.5;
            
            this.checkpoints.push({
                mesh: checkpoint,
                position: { x: checkpoint.position.x, z: checkpoint.position.z },
                angle: angle,
                passed: false,
                isStartLine: i === 0
            });
            
            this.scene.add(checkpoint);
        }
        
        this.startLine = this.checkpoints[0];
    }
    
    // 車両がトラック上にいるかチェック
    isOnTrack(position) {
        const distance = Math.sqrt(position.x * position.x + position.z * position.z);
        const trackRadius = 100;
        const trackWidth = 10;
        
        return distance >= (trackRadius - trackWidth / 2) && 
               distance <= (trackRadius + trackWidth / 2);
    }
    
    // チェックポイント通過判定
    checkCheckpoints(carPosition) {
        this.checkpoints.forEach((checkpoint, index) => {
            if (!checkpoint.passed) {
                const distance = Math.sqrt(
                    Math.pow(carPosition.x - checkpoint.position.x, 2) +
                    Math.pow(carPosition.z - checkpoint.position.z, 2)
                );
                
                if (distance < 8) { // チェックポイントの範囲内
                    checkpoint.passed = true;
                    
                    if (checkpoint.isStartLine) {
                        // ラップ完了チェック
                        const allPassed = this.checkpoints.every(cp => cp.passed);
                        if (allPassed) {
                            this.resetCheckpoints();
                            return { type: 'lap_complete', checkpoint: index };
                        }
                    }
                    
                    return { type: 'checkpoint', checkpoint: index };
                }
            }
        });
        
        return null;
    }
    
    // チェックポイントをリセット
    resetCheckpoints() {
        this.checkpoints.forEach(checkpoint => {
            checkpoint.passed = false;
        });
    }
    
    // 車両とバリアの衝突判定
    checkBarrierCollision(carPosition, carRadius = 2) {
        for (let barrier of this.barriers) {
            const distance = Math.sqrt(
                Math.pow(carPosition.x - barrier.position.x, 2) +
                Math.pow(carPosition.z - barrier.position.z, 2)
            );
            
            if (distance < carRadius + 1) {
                return {
                    collision: true,
                    barrier: barrier,
                    normal: {
                        x: (carPosition.x - barrier.position.x) / distance,
                        z: (carPosition.z - barrier.position.z) / distance
                    }
                };
            }
        }
        
        return { collision: false };
    }
    
    // スタート位置を取得
    getStartPosition() {
        return {
            x: 0,
            y: 1,
            z: -90 // トラックの内側
        };
    }
    
    // スタート時の向きを取得
    getStartRotation() {
        return {
            x: 0,
            y: Math.PI / 2, // 東向き
            z: 0
        };
    }
}

