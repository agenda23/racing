# 🤝 Contributing to Ultimate 3D Racing Game

Ultimate 3D Racing Game へのコントリビューションをありがとうございます！このドキュメントでは、プロジェクトに貢献する方法を説明します。

## 📋 コントリビューションガイドライン

### 🚀 はじめに

1. **プロジェクトをフォーク**してください
2. **新しいブランチを作成**してください (`git checkout -b feature/amazing-feature`)
3. **変更をコミット**してください (`git commit -m 'Add some amazing feature'`)
4. **ブランチにプッシュ**してください (`git push origin feature/amazing-feature`)
5. **Pull Request を作成**してください

### 🎯 コントリビューションの種類

#### バグレポート
- バグを発見した場合は [Issues](https://github.com/your-username/ultimate-3d-racing-game/issues) で報告してください
- 以下の情報を含めてください：
  - ブラウザとバージョン
  - OS とバージョン
  - 再現手順
  - 期待される動作と実際の動作
  - エラーメッセージ（あれば）

#### 新機能の提案
- 新機能のアイデアがある場合は Issues で提案してください
- 以下を含めてください：
  - 機能の詳細説明
  - 使用例
  - 実装の提案（可能であれば）

#### コードの改善
- パフォーマンス最適化
- コードの可読性向上
- バグ修正
- 新機能の実装

#### ドキュメントの改善
- README の改善
- コメントの追加・改善
- 技術文書の更新
- 翻訳（英語版など）

## 🛠️ 開発環境のセットアップ

### 必要な環境
- モダンブラウザ（Chrome, Firefox, Safari, Edge 最新版）
- テキストエディタまたは IDE
- ローカルサーバー（Python HTTP Server または Node.js serve など）

### セットアップ手順
```bash
# リポジトリをクローン
git clone https://github.com/your-username/ultimate-3d-racing-game.git
cd ultimate-3d-racing-game

# ローカルサーバーを起動
python -m http.server 8000
# または
npx serve .

# ブラウザでアクセス
# http://localhost:8000/final-game.html
```

## 📝 コーディング規約

### JavaScript
- **ES6+** の機能を使用してください
- **明確な変数名**を使用してください
- **適切なコメント**を追加してください
- **一貫したインデント**（4スペース）を使用してください

### 例：
```javascript
// Good
class VehicleController {
    constructor(scene, physicsEngine) {
        this.scene = scene;
        this.physicsEngine = physicsEngine;
        this.speed = 0; // km/h
    }
    
    /**
     * 車両の速度を更新
     * @param {number} deltaTime - フレーム間の経過時間
     */
    updateSpeed(deltaTime) {
        // スピード計算ロジック
    }
}

// Bad
class VC {
    constructor(s, pe) {
        this.s = s;
        this.pe = pe;
        this.spd = 0;
    }
    
    upd(dt) {
        // スピード計算
    }
}
```

### HTML/CSS
- **セマンティックHTML**を使用してください
- **レスポンシブデザイン**を考慮してください
- **アクセシビリティ**を考慮してください

## 🔍 テスト

### マニュアルテスト
現在、自動テストは実装されていませんが、以下を手動で確認してください：

1. **基本機能**
   - ゲームの起動
   - 車両の操作
   - カメラの切り替え
   - UI の表示

2. **パフォーマンス**
   - 60fps での動作
   - メモリリークの確認
   - 長時間プレイでの安定性

3. **クロスブラウザ**
   - Chrome での動作
   - Firefox での動作  
   - Safari での動作
   - Edge での動作

### テスト手順
```bash
# 各ブラウザでテスト
1. final-game.html を開く
2. 全ての車両タイプでテスト
3. 全てのカメラモードでテスト
4. 完走まで正常に動作するか確認
5. パフォーマンスモニタで FPS を確認
```

## 🎨 デザインガイドライン

### UI/UX
- **日本語ユーザーフレンドリー**なデザイン
- **直感的な操作**
- **明確な視覚的フィードバック**
- **高い可読性**

### カラーパレット
- ダーク系背景: `rgba(0,0,0,0.8)`
- アクセント: `rgba(255,255,255,0.2)`
- テキスト: `white` with text-shadow
- エラー: `#ff4444`
- 成功: `#44ff44`

## 🚀 リリース プロセス

### バージョニング
セマンティックバージョニング（SemVer）を使用：
- **MAJOR**: 破壊的な変更
- **MINOR**: 新機能追加
- **PATCH**: バグ修正

### ブランチ戦略
- `main`: 本番リリース用
- `develop`: 開発用
- `feature/*`: 新機能開発
- `hotfix/*`: 緊急修正

## 📋 Pull Request チェックリスト

Pull Request を作成する前に以下を確認してください：

- [ ] コードが正常に動作することを確認
- [ ] 既存の機能を破壊していないことを確認
- [ ] 適切なコメントを追加
- [ ] README の更新（必要に応じて）
- [ ] ライセンス条項に従っていることを確認

### PR テンプレート
```markdown
## 概要
<!-- 変更の概要を記述 -->

## 変更点
<!-- 具体的な変更内容をリストアップ -->
- [ ] 新機能: XXX を追加
- [ ] バグ修正: XXX を修正
- [ ] 改善: XXX を最適化

## テスト
<!-- テスト内容を記述 -->
- [ ] Chrome でテスト済み
- [ ] Firefox でテスト済み
- [ ] パフォーマンステスト済み

## スクリーンショット
<!-- 必要に応じてスクリーンショットを追加 -->

## その他
<!-- 追加情報があれば記述 -->
```

## 🏷️ Issue ラベル

| ラベル | 説明 |
|--------|------|
| `bug` | バグレポート |
| `enhancement` | 新機能・改善 |
| `documentation` | ドキュメント関連 |
| `performance` | パフォーマンス関連 |
| `ui/ux` | UI/UX 改善 |
| `good first issue` | 初回貢献者向け |
| `help wanted` | コミュニティからの支援が必要 |

## 🌍 国際化

### 多言語対応
現在は日本語のみですが、将来的に以下の言語対応を検討：
- 英語
- 中国語（簡体字・繁体字）
- 韓国語

### 貢献方法
- 翻訳ファイルの作成
- UI テキストの外部化
- 文化的配慮の実装

## 💬 コミュニケーション

### Discussions
- 質問や提案は [GitHub Discussions](https://github.com/your-username/ultimate-3d-racing-game/discussions) を使用
- 技術的な議論や アイデアの共有

### Issue
- バグレポートや具体的な改善提案

### Pull Request
- コードの変更提案

## 🎉 謝辞

コントリビューターの皆様：
- あなたの貢献がプロジェクトをより良いものにします
- すべてのコントリビューションに感謝します
- コミュニティの力でゲームを進化させましょう

## 📄 ライセンス

このプロジェクトに貢献することで、あなたの貢献が MIT License の下でライセンスされることに同意したことになります。

---

**Happy Coding! 🎮🏎️**