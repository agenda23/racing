// データ永続化管理システム
class DataManager {
    constructor() {
        this.storageKey = 'ultimateRacingGameData';
        this.defaultData = {
            settings: {
                volume: 50,
                quality: 'medium',
                sensitivity: 50,
                showFPS: false,
                enableParticles: true,
                cameraMode: 'follow',
                language: 'ja'
            },
            statistics: {
                totalPlayTime: 0,
                racesCompleted: 0,
                totalDistance: 0,
                crashCount: 0,
                bestLapTime: null,
                bestTotalTime: null,
                favoriteVehicle: null,
                achievementsUnlocked: []
            },
            records: {
                bestTimes: {
                    sports: null,
                    formula: null,
                    rally: null
                },
                bestLaps: {
                    sports: null,
                    formula: null,
                    rally: null
                },
                recentRaces: []
            },
            achievements: [],
            preferences: {
                autoSave: true,
                showTutorial: true,
                confirmExit: true,
                showHints: true
            }
        };
        
        this.data = this.loadData();
        this.achievements = new AchievementSystem();
    }
    
    // データの読み込み
    loadData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                // デフォルトデータとマージして不足項目を補完
                return this.mergeWithDefault(parsed, this.defaultData);
            }
        } catch (error) {
            console.warn('Failed to load data:', error);
        }
        
        return JSON.parse(JSON.stringify(this.defaultData));
    }
    
    // データの保存
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            console.log('Data saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }
    
    // デフォルトデータとの再帰的マージ
    mergeWithDefault(saved, defaults) {
        const result = {};
        
        for (const key in defaults) {
            if (saved.hasOwnProperty(key)) {
                if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) {
                    result[key] = this.mergeWithDefault(saved[key] || {}, defaults[key]);
                } else {
                    result[key] = saved[key];
                }
            } else {
                result[key] = defaults[key];
            }
        }
        
        return result;
    }
    
    // 設定の取得・保存
    getSettings() {
        return { ...this.data.settings };
    }
    
    updateSettings(newSettings) {
        Object.assign(this.data.settings, newSettings);
        this.saveData();
    }
    
    getSetting(key) {
        return this.data.settings[key];
    }
    
    setSetting(key, value) {
        this.data.settings[key] = value;
        this.saveData();
    }
    
    // 統計情報
    getStatistics() {
        return { ...this.data.statistics };
    }
    
    updateStatistics(updates) {
        Object.assign(this.data.statistics, updates);
        this.saveData();
    }
    
    incrementStat(key, amount = 1) {
        if (typeof this.data.statistics[key] === 'number') {
            this.data.statistics[key] += amount;
            this.saveData();
        }
    }
    
    // レース記録の管理
    recordRaceResult(raceData) {
        const {
            vehicleType,
            totalTime,
            bestLapTime,
            lapTimes,
            maxSpeed,
            crashes,
            timestamp = Date.now()
        } = raceData;
        
        // ベストタイム更新チェック
        const currentBest = this.data.records.bestTimes[vehicleType];
        if (!currentBest || totalTime < currentBest) {
            this.data.records.bestTimes[vehicleType] = totalTime;
            this.achievements.checkAchievement('newRecord', { vehicleType, time: totalTime });
        }
        
        // ベストラップ更新チェック
        const currentBestLap = this.data.records.bestLaps[vehicleType];
        if (!currentBestLap || bestLapTime < currentBestLap) {
            this.data.records.bestLaps[vehicleType] = bestLapTime;
        }
        
        // 統計更新
        this.data.statistics.racesCompleted++;
        this.data.statistics.crashCount += crashes;
        
        if (!this.data.statistics.bestLapTime || bestLapTime < this.data.statistics.bestLapTime) {
            this.data.statistics.bestLapTime = bestLapTime;
        }
        
        if (!this.data.statistics.bestTotalTime || totalTime < this.data.statistics.bestTotalTime) {
            this.data.statistics.bestTotalTime = totalTime;
        }
        
        // 最近のレース記録
        const recentRace = {
            timestamp,
            vehicleType,
            totalTime,
            bestLapTime,
            lapTimes: [...lapTimes],
            maxSpeed,
            crashes
        };
        
        this.data.records.recentRaces.unshift(recentRace);
        if (this.data.records.recentRaces.length > 10) {
            this.data.records.recentRaces.pop();
        }
        
        // 実績チェック
        this.achievements.checkMultipleAchievements({
            racesCompleted: this.data.statistics.racesCompleted,
            bestLapTime,
            totalTime,
            crashes,
            maxSpeed
        });
        
        this.saveData();
    }
    
    // 記録の取得
    getBestTime(vehicleType) {
        return this.data.records.bestTimes[vehicleType];
    }
    
    getBestLap(vehicleType) {
        return this.data.records.bestLaps[vehicleType];
    }
    
    getRecentRaces() {
        return [...this.data.records.recentRaces];
    }
    
    // 実績システム
    unlockAchievement(achievementId, data = {}) {
        if (!this.data.statistics.achievementsUnlocked.includes(achievementId)) {
            this.data.statistics.achievementsUnlocked.push(achievementId);
            this.data.achievements.push({
                id: achievementId,
                unlockedAt: Date.now(),
                data
            });
            this.saveData();
            return true;
        }
        return false;
    }
    
    hasAchievement(achievementId) {
        return this.data.statistics.achievementsUnlocked.includes(achievementId);
    }
    
    getAchievements() {
        return [...this.data.achievements];
    }
    
    // データのエクスポート/インポート
    exportData() {
        return {
            version: '1.0.0',
            timestamp: Date.now(),
            data: this.data
        };
    }
    
    importData(importedData) {
        try {
            if (importedData.version && importedData.data) {
                this.data = this.mergeWithDefault(importedData.data, this.defaultData);
                this.saveData();
                return true;
            }
        } catch (error) {
            console.error('Failed to import data:', error);
        }
        return false;
    }
    
    // データの初期化
    resetData() {
        this.data = JSON.parse(JSON.stringify(this.defaultData));
        this.saveData();
    }
    
    resetStatistics() {
        this.data.statistics = JSON.parse(JSON.stringify(this.defaultData.statistics));
        this.data.records = JSON.parse(JSON.stringify(this.defaultData.records));
        this.data.achievements = [];
        this.saveData();
    }
    
    // ストレージ容量チェック
    checkStorageQuota() {
        try {
            const testKey = 'storageTest';
            const testData = 'x'.repeat(1024); // 1KB
            localStorage.setItem(testKey, testData);
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }
}

// 実績システム
class AchievementSystem {
    constructor() {
        this.achievements = {
            firstRace: {
                id: 'firstRace',
                name: '初回レース',
                description: '最初のレースを完走する',
                icon: '🏁'
            },
            speedDemon: {
                id: 'speedDemon',
                name: 'スピードデーモン',
                description: '300km/h以上を記録する',
                icon: '⚡'
            },
            perfectRace: {
                id: 'perfectRace',
                name: 'パーフェクトレース',
                description: 'クラッシュなしでレースを完走する',
                icon: '⭐'
            },
            veteran: {
                id: 'veteran',
                name: 'ベテランレーサー',
                description: '50回レースを完走する',
                icon: '🏆'
            },
            lapMaster: {
                id: 'lapMaster',
                name: 'ラップマスター',
                description: '30秒以内のラップタイムを記録する',
                icon: '⏰'
            },
            allVehicles: {
                id: 'allVehicles',
                name: '全車種制覇',
                description: '全ての車種でレースを完走する',
                icon: '🚗'
            }
        };
    }
    
    checkAchievement(type, data) {
        const dataManager = new DataManager();
        
        switch (type) {
            case 'firstRace':
                if (data.racesCompleted === 1) {
                    return dataManager.unlockAchievement('firstRace');
                }
                break;
                
            case 'speedRecord':
                if (data.maxSpeed >= 300) {
                    return dataManager.unlockAchievement('speedDemon', { speed: data.maxSpeed });
                }
                break;
                
            case 'perfectRace':
                if (data.crashes === 0) {
                    return dataManager.unlockAchievement('perfectRace');
                }
                break;
                
            case 'veteran':
                if (data.racesCompleted >= 50) {
                    return dataManager.unlockAchievement('veteran', { races: data.racesCompleted });
                }
                break;
                
            case 'lapMaster':
                if (data.bestLapTime && data.bestLapTime <= 30) {
                    return dataManager.unlockAchievement('lapMaster', { time: data.bestLapTime });
                }
                break;
        }
        
        return false;
    }
    
    checkMultipleAchievements(data) {
        const unlocked = [];
        
        // 初回レース
        if (data.racesCompleted === 1) {
            unlocked.push(this.checkAchievement('firstRace', data));
        }
        
        // スピード記録
        if (data.maxSpeed >= 300) {
            unlocked.push(this.checkAchievement('speedRecord', data));
        }
        
        // パーフェクトレース
        if (data.crashes === 0) {
            unlocked.push(this.checkAchievement('perfectRace', data));
        }
        
        // ベテラン
        if (data.racesCompleted >= 50) {
            unlocked.push(this.checkAchievement('veteran', data));
        }
        
        // ラップマスター
        if (data.bestLapTime <= 30) {
            unlocked.push(this.checkAchievement('lapMaster', data));
        }
        
        return unlocked.filter(Boolean);
    }
    
    getAchievementInfo(achievementId) {
        return this.achievements[achievementId];
    }
    
    getAllAchievements() {
        return Object.values(this.achievements);
    }
}

// 通知システム
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = this.createContainer();
    }
    
    createContainer() {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }
    
    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            margin-bottom: 0.5rem;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-family: Arial, sans-serif;
            font-size: 0.9rem;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        notification.textContent = message;
        this.container.appendChild(notification);
        
        // アニメーション
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // 自動削除
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    getBackgroundColor(type) {
        switch (type) {
            case 'success': return 'linear-gradient(135deg, #4CAF50, #45a049)';
            case 'warning': return 'linear-gradient(135deg, #FF9800, #f57c00)';
            case 'error': return 'linear-gradient(135deg, #f44336, #d32f2f)';
            case 'achievement': return 'linear-gradient(135deg, #FFD700, #FFA500)';
            default: return 'linear-gradient(135deg, #2196F3, #1976D2)';
        }
    }
    
    showAchievement(achievement) {
        this.show(`🏆 実績解除: ${achievement.name}`, 'achievement', 5000);
    }
}

// グローバルインスタンス
window.dataManager = new DataManager();
window.notificationSystem = new NotificationSystem();