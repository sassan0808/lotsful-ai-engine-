# Lotsful AI Engine

企業の業務切り出しを支援し、副業/兼業人材との最適なマッチングを実現するAI分析システム

## 🎯 プロジェクト概要

段階的情報蓄積アプローチにより、各ステップでAI分析を行い、構造化テンプレートに情報を蓄積。最終的に包括的な提案書を生成する営業支援ツール。

### 主要機能

- **Step1**: 企業リサーチ情報の自動構造化
- **Step2**: 課題・プロジェクト設計の統合編集とAI補完
- **Step3**: 業務選択と最終統合分析による提案書生成
- **AI分析**: Google Gemini 2.5を活用した高精度分析
- **1次情報管理**: データベース不要のセッションベース管理

## 🚀 技術スタック

- **Frontend**: Next.js 15.3.3 + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.5 Flash Preview-05-20
- **Deployment**: Vercel
- **Data**: セッションストレージ（軽量・高速）

## 📋 セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/sassan0808/lotsful-ai-engine-.git
cd lotsful-ai-engine-/lotsful-next

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.local.example .env.local
# .env.localにGEMINI_API_KEYを設定

# 開発サーバーを起動
npm run dev
```

### 環境変数設定

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🎮 使い方

### 基本フロー

1. **Step1: 企業リサーチ入力**
   - 企業の基本情報や調査結果を入力
   - AIが自動的に構造化データに変換

2. **Step2: 情報統合編集**
   - 自由記述での商談議事録入力
   - AI分析による自動データ補完
   - 手動編集による詳細調整

3. **Step3: 最終分析**
   - 業務マトリックスでの業務選択
   - 包括的な提案書の自動生成

### 主要画面

- `/` - メイン画面（3ステップフロー）
- テンプレート編集画面（Step2）
- 分析結果表示（5タブ提案書）

## 🏗️ システム構成

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Step1         │ →  │     Step2        │ →  │     Step3       │
│ 企業情報収集     │    │  情報統合編集     │    │  最終統合分析    │
│ (AI自動構造化)   │    │ (自由記述+AI補完) │    │ (提案書生成)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
          ↓                      ↓                      ↓
    ┌─────────────────────────────────────────────────────────────┐
    │              統合テンプレート (セッション管理)                │
    │        企業情報 + 現状分析 + プロジェクト設計              │
    └─────────────────────────────────────────────────────────────┘
```

## 🤖 AI分析機能

### AI Honesty機能
情報不足時は推測せず「情報不足により特定不可」と正直に回答

### 段階的分析
- **Step1**: 企業基本情報の抽出・分類
- **Step2**: 課題構造化と解決アプローチ提案
- **Step3**: 包括的プロジェクト設計と人材マッチング

## 📊 データ構造

### テンプレート構成
- 🏢 **企業情報**: 基本情報、業界、規模
- 🔍 **リサーチデータ**: 調査結果、仮説、洞察
- 📊 **現状分析**: 課題、チーム構成、不足スキル
- 🎯 **プロジェクト設計**: 目標、スコープ、予算

## 🚢 デプロイ

### Vercel (推奨)
```bash
# Vercel CLIでデプロイ
npm install -g vercel
vercel

# 環境変数を設定
vercel env add GEMINI_API_KEY
```

### 手動ビルド
```bash
npm run build
npm start
```

## 📝 開発

### 主要コマンド
```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run start        # プロダクション起動
npm run lint         # ESLint実行
```

### プロジェクト構造
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   └── page.tsx        # メインページ
├── components/         # React コンポーネント
│   ├── ThreeStepFlow/  # メインフロー
│   ├── TemplateEditor/ # Step2編集画面
│   └── Analysis/       # 分析結果表示
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ
└── data/               # 静的データ
```

## 📋 要件定義

詳細な仕様については [PROJECT_SPEC.md](./PROJECT_SPEC.md) を参照してください。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 📞 サポート

質問や問題がある場合は、[Issues](https://github.com/sassan0808/lotsful-ai-engine-/issues) で報告してください。

---

**Built with ❤️ using Next.js and AI**