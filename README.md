# 🏎️ Ultimate 3D Racing Game

WebGL と Three.js を使用した高性能 3D レーシングゲーム

![Game Preview](https://img.shields.io/badge/WebGL-3D%20Racing-blue)
![Three.js](https://img.shields.io/badge/Three.js-r155-green)
![Performance](https://img.shields.io/badge/Performance-60fps-orange)
![Language](https://img.shields.io/badge/Language-Japanese-red)

## 🎮 ゲーム概要

Ultimate 3D Racing Game は、モダンなWeb技術を駆使して開発されたブラウザベースの3Dレーシングゲームです。Three.js とカスタム物理エンジンにより、60fps での安定したパフォーマンスと本格的なレーシング体験を提供します。

### ✨ 主な特徴

- 🚀 **高性能**: 60fps安定動作を実現
- 🎨 **美麗グラフィックス**: HDR、シャドウマッピング、パーティクルエフェクト
- 🚗 **3種類の車両**: スポーツカー、フォーミュラカー、ラリーカー
- 📷 **4つのカメラモード**: Follow、Chase、Cockpit、Overhead
- 🏁 **完全なレースシステム**: 3ラップレース、タイム計測、チェックポイント
- 🌍 **日本語完全対応**: UI、操作ガイド、すべて日本語

## 🚀 クイックスタート

### 1. ファイルをダウンロード
```bash
git clone https://github.com/your-username/racing-game.git
cd racing-game
```

### 2. ゲームを開始
**推奨**: `ultimate-game.html` をブラウザで開く（完全版・最新機能搭載）

または、ローカルサーバーで実行:
```bash
# Python 3の場合
python -m http.server 8000

# Node.jsの場合
npx serve .
```

### 3. プレイ開始
ブラウザで `http://localhost:8000/ultimate-game.html` にアクセス

#### 📋 ゲームバージョン比較
| ファイル | レベル | 機能 |
|---------|--------|------|
| `ultimate-game.html` | ★★★★★ | 完全版：メニュー、音響、データ保存、エラーハンドリング |
| `final-game.html` | ★★★★☆ | 高機能版：3Dグラフィックス、物理エンジン |
| `enhanced-game.html` | ★★★☆☆ | 拡張版：基本機能＋高級グラフィックス |
| `simple-game.html` | ★★☆☆☆ | シンプル版：基本的なゲームプレイ |
| `index.html` | ★☆☆☆☆ | プロトタイプ：基本3Dシーン |

## 🎮 操作方法

### キーボード操作
| キー | 機能 |
|------|------|
| `W` / `↑` | 加速 |
| `S` / `↓` | 減速・バック |
| `A` / `←` | 左ステアリング |
| `D` / `→` | 右ステアリング |
| `Space` | ハンドブレーキ |
| `R` | 車両リセット |
| `C` | カメラモード切替 |
| `V` | 視点切替 |
| `Q` / `E` | ギアダウン / ギアアップ (MT時) |
| `T` | オートマチック/マニュアル切替 |
| `Left Shift` | クラッチ (MT時) |
| `1-3` | 車両選択 |

### カメラモード
1. **Follow**: 車両後方追従
2. **Chase**: 車両追跡
3. **Cockpit**: コックピット視点
4. **Overhead**: 上空俯瞰

## 📁 プロジェクト構造

```
racing/
├── README.md                 # このファイル
├── ultimate-game.html       # 完全版ゲーム (最新・推奨) 🆕
├── final-game.html          # 完成版ゲーム
├── enhanced-game.html       # 拡張版
├── simple-game.html         # シンプル版
├── index.html              # 基本版
├── game.js                 # メインゲームロジック
├── car.js                  # 車両システム
├── track.js                # トラック生成
├── camera.js               # カメラ制御
├── physics.js              # 物理エンジン
├── utils.js                # ユーティリティ
├── main.js                 # 初期化処理
├── three.js                # Three.js ライブラリ
├── gameStateManager.js     # ゲーム状態管理 🆕
├── audioSystem.js          # 音響システム 🆕
├── dataManager.js          # データ永続化 🆕
├── errorHandler.js         # エラーハンドリング 🆕
├── package.json            # プロジェクト設定 🆕
├── LICENSE                 # ライセンス情報 🆕
├── CONTRIBUTING.md         # 貢献ガイド 🆕
├── CHANGELOG.md            # 変更履歴 🆕
└── docs/
    ├── project-analysis.md  # 詳細プロジェクト分析
    ├── Ultimate 3D Racing Game.md # 機能説明書
    └── research_summary.md  # 技術調査レポート
```

## 🛠️ 技術仕様

### 使用技術
- **Three.js (r155)**: 3Dレンダリングエンジン
- **WebGL 2.0**: ハードウェアアクセラレーション
- **JavaScript ES6+**: ゲームロジック
- **HTML5 Canvas**: レンダリング表面
- **CSS3**: UI/UXデザイン

### システム要件
- **ブラウザ**: Chrome, Firefox, Safari, Edge (最新版)
- **WebGL**: 2.0対応必須
- **メモリ**: 4GB以上推奨
- **GPU**: 専用グラフィックカード推奨

## 🎯 ゲーム機能

### 車両システム
| 車両タイプ | 最高速度 | 特徴 |
|-----------|----------|------|
| 🏎️ スポーツカー | 280 km/h | バランス型 |
| 🏁 フォーミュラカー | 350 km/h | 高性能 |
| 🚙 ラリーカー | 220 km/h | オフロード仕様 |

### レーストラック
- **楕円形コース**: 半径120m、幅15m
- **チェックポイント**: 8箇所の通過判定
- **施設**: 観客席、ピットレーン、ガレージ
- **安全設備**: タイヤバリア、コンクリートバリア

### グラフィックス
- **4096x4096 シャドウマッピング**
- **HDR トーンマッピング (ACES Filmic)**
- **リアルタイムフォグエフェクト**
- **パーティクルエフェクト** (排気ガス、ダスト)

## 📊 パフォーマンス

### 最適化機能
- ✅ 効率的なレンダリングパイプライン
- ✅ メモリ効率的なテクスチャ管理
- ✅ 最適化されたゲームループ
- ✅ リアルタイムパフォーマンス監視

### 監視項目
- FPS (フレームレート)
- 三角形数 (ジオメトリ複雑度)
- 描画コール数
- メモリ使用量

## 🔧 開発者向け情報

### ファイル詳細
- **final-game.html**: 全機能統合済み完成版 (1,805行)
- **game.js**: メインゲームクラス (404行)
- **track.js**: トラック生成システム (272行)
- **car.js**: 車両物理・レンダリング (237行)
- **camera.js**: カメラ制御システム (225行)

### アーキテクチャ
- **モジュラー設計**: 機能別クラス分離
- **オブジェクト指向**: 継承とポリモーフィズム
- **イベント駆動**: リアルタイム入力処理
- **パフォーマンス重視**: 最適化されたレンダリング

## 🎮 プレイのコツ

1. **車両選択**: 初心者はスポーツカーがおすすめ
2. **コーナリング**: 早めにブレーキして内側を攻める
3. **ドリフト**: ハンドブレーキを使ってコーナーを攻略
4. **カメラ**: 状況に応じてカメラモードを切り替え
5. **ベストタイム**: ラップタイムの短縮を目指そう

## 🐛 トラブルシューティング

### パフォーマンス問題
- ブラウザを最新版に更新
- 他のタブを閉じてメモリを確保
- グラフィックドライバを更新

### 表示問題
- WebGL 2.0対応を確認
- ハードウェアアクセラレーションを有効化
- セキュリティ設定でWebGLを許可

## 📝 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🤝 貢献

プルリクエストや Issue の報告を歓迎します：

1. Fork する
2. Feature ブランチを作成
3. 変更をコミット
4. Push してプルリクエストを作成

## 📞 サポート

- 🐛 [Issues](https://github.com/your-username/racing-game/issues)
- 📧 [Email](mailto:support@example.com)
- 📖 [ドキュメント](docs/)

## 🏆 クレジット

- **開発**: Manus AI
- **Three.js**: Three.js Team
- **WebGL**: Khronos Group

---

**🏁 Ultimate 3D Racing Game で最高のレーシング体験をお楽しみください！**

[![Play Now](https://img.shields.io/badge/🎮-Play%20Now-success?style=for-the-badge)](final-game.html)