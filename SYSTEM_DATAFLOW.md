# Lotsful AI Engine - システムデータフロー図

## 概要
このドキュメントは、Lotsful AI Engineの段階的情報蓄積システムのデータフローを可視化したものです。

## システム全体のデータフロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant UI as UI Components
    participant TM as TemplateManager
    participant API as API Routes
    participant AI as Gemini AI
    participant S as SessionStorage

    Note over U,S: Step1: 企業基本情報入力
    U->>UI: 企業情報テキスト入力
    UI->>UI: CompanyInfoInput表示
    U->>UI: AI分析実行ボタンクリック
    UI->>API: POST /api/analyze-step1
    API->>AI: Gemini API呼び出し
    AI-->>API: 構造化データ返却
    API-->>UI: {companyProfile, researchData}
    UI->>TM: updateStep1()
    TM->>S: テンプレート保存
    UI->>UI: 抽出結果表示
    Note right of UI: 業界情報を自動連携

    Note over U,S: Step2: 情報統合編集（任意）
    U->>UI: Step2へ進む
    UI->>TM: loadTemplate()
    TM-->>UI: 既存テンプレート読込
    UI->>UI: TemplateEditor表示
    U->>UI: 自由記述テキスト入力
    U->>UI: AI分析ボタンクリック
    UI->>API: POST /api/analyze-step2
    API->>AI: Gemini API呼び出し（既存データ含む）
    AI-->>API: 追加構造化データ返却
    API-->>UI: {currentAnalysis, projectDesign}
    UI->>TM: updateStep2()
    TM->>S: テンプレート更新
    UI->>UI: 統合データ表示

    Note over U,S: Step3: 業務選択
    U->>UI: Step3へ進む
    UI->>UI: IndustrySelector表示
    Note right of UI: Step1の業界が自動反映
    UI->>UI: BusinessMatrix表示
    U->>UI: 業務項目選択・人数設定
    U->>UI: データ統合・確認へボタン
    UI->>TM: updateStep3()
    TM->>S: 選択項目保存

    Note over U,S: Step4: データ統合確認
    U->>UI: Step4へ進む
    UI->>TM: loadTemplate()
    TM-->>UI: 完全テンプレート読込
    UI->>UI: TemplateIntegration表示
    UI->>UI: 分析精度スコア計算
    Note right of UI: データ品質評価
    U->>UI: インライン編集（任意）
    UI->>TM: saveTemplate()
    TM->>S: 編集内容保存
    U->>UI: 最終AI分析を開始
    UI->>API: POST /api/analyze-final
    API->>AI: Gemini API呼び出し（全データ）
    AI-->>API: 5タブ提案書データ
    API-->>UI: {tab1-5, metadata}
    UI->>UI: handleFinalAnalyze()
    UI->>UI: setAnalysisResults()
    
    Note over U,S: 5タブ提案書表示
    UI->>UI: ProposalTabs表示
    Note right of UI: Step4非表示
    U->>UI: Tab3手動生成ボタン（任意）
    UI->>API: POST /api/generate-talent-proposal
    API->>AI: Gemini API呼び出し
    AI-->>API: 人材提案詳細
    API-->>UI: {talentProposal}
    UI->>UI: TalentProposal表示

    Note over U,S: データ確認に戻る
    U->>UI: データ確認に戻るボタン
    UI->>UI: handleBackToDataConfirmation()
    UI->>UI: setAnalysisResults(null)
    UI->>UI: TemplateIntegration再表示
```

## データ構造の流れ

```mermaid
graph TD
    A[Step1: リサーチテキスト] -->|AI分析| B[companyProfile + researchData]
    B --> C[TemplateManager]
    
    D[Step2: 自由記述テキスト] -->|AI分析| E[currentAnalysis + projectDesign]
    E --> C
    
    F[Step3: 業務選択] --> G[selectedBusinessItems + metadata]
    G --> C
    
    C --> H[完全テンプレート]
    H -->|最終AI分析| I[5タブ提案書]
    
    I --> J[Tab1: 課題整理]
    I --> K[Tab2: プロジェクト設計]
    I --> L[Tab3: 人材提案]
    I --> M[Tab4: 期待成果]
    I --> N[Tab5: 実施要項]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style D fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#f9f,stroke:#333,stroke-width:2px
    style I fill:#9f9,stroke:#333,stroke-width:2px
```

## API呼び出し関係

```mermaid
graph LR
    subgraph "フロントエンド"
        A[CompanyInfoInput]
        B[TemplateEditor]
        C[TemplateIntegration]
        D[ProposalTabs]
    end
    
    subgraph "API Routes"
        E[/api/analyze-step1]
        F[/api/analyze-step2]
        G[/api/analyze-final]
        H[/api/generate-talent-proposal]
    end
    
    subgraph "AI Engine"
        I[Gemini 2.5 Flash]
    end
    
    A -->|POST| E
    B -->|POST| F
    C -->|POST| G
    D -->|POST| H
    
    E --> I
    F --> I
    G --> I
    H --> I
    
    style E fill:#fbb,stroke:#333,stroke-width:2px
    style F fill:#fbb,stroke:#333,stroke-width:2px
    style G fill:#fbb,stroke:#333,stroke-width:2px
    style H fill:#fbb,stroke:#333,stroke-width:2px
```

## 状態管理フロー

```mermaid
stateDiagram-v2
    [*] --> Step1入力
    Step1入力 --> Step1分析中: AI分析実行
    Step1分析中 --> Step1完了: 分析成功
    Step1完了 --> Step2編集: 次へ
    
    Step2編集 --> Step2分析中: AI分析実行
    Step2分析中 --> Step2完了: 分析成功
    Step2編集 --> Step3選択: 次へ（スキップ可）
    Step2完了 --> Step3選択: 次へ
    
    Step3選択 --> Step4確認: データ統合・確認へ
    
    Step4確認 --> 最終分析中: 最終AI分析を開始
    最終分析中 --> 5タブ表示: 分析完了
    
    5タブ表示 --> Step4確認: データ確認に戻る
    5タブ表示 --> [*]: 新しい分析を開始
    
    note right of Step1分析中: isAnalyzing = true
    note right of Step1完了: template.metadata.step1Completed = true
    note right of 最終分析中: isTemplateFinalAnalyzing = true
    note right of 5タブ表示: analysisResults != null
```

## エラー処理フロー

```mermaid
graph TD
    A[API呼び出し] --> B{成功?}
    B -->|Yes| C[データ処理]
    B -->|No| D[エラーハンドリング]
    
    D --> E{エラータイプ}
    E -->|ネットワーク| F[接続エラー表示]
    E -->|データ不足| G[AI Honesty表示]
    E -->|API制限| H[モックデータ返却]
    
    C --> I[UI更新]
    F --> J[再試行ボタン表示]
    G --> K["情報不足により特定不可"表示]
    H --> I
    
    style D fill:#faa,stroke:#333,stroke-width:2px
    style E fill:#faa,stroke:#333,stroke-width:2px
    style F fill:#faa,stroke:#333,stroke-width:2px
    style G fill:#faa,stroke:#333,stroke-width:2px
    style H fill:#faa,stroke:#333,stroke-width:2px
```

## テンプレートデータの蓄積過程

```mermaid
graph TB
    subgraph "初期状態"
        A[空のテンプレート]
    end
    
    subgraph "Step1後"
        B[companyProfile<br/>researchData]
    end
    
    subgraph "Step2後"
        C[companyProfile<br/>researchData<br/>currentAnalysis<br/>projectDesign]
    end
    
    subgraph "Step3後"
        D[companyProfile<br/>researchData<br/>currentAnalysis<br/>projectDesign<br/>metadata.selectedBusinessItems]
    end
    
    subgraph "Step4分析後"
        E[完全テンプレート<br/>+<br/>5タブ提案書]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    
    style B fill:#e6f3ff,stroke:#333,stroke-width:2px
    style C fill:#cce7ff,stroke:#333,stroke-width:2px
    style D fill:#b3daff,stroke:#333,stroke-width:2px
    style E fill:#99ceff,stroke:#333,stroke-width:2px
```

## 主要コンポーネント間の関係

```mermaid
graph TD
    A[ThreeStepFlow] --> B[CompanyInfoInput]
    A --> C[TemplateEditor]
    A --> D[IndustrySelector]
    A --> E[BusinessMatrix]
    A --> F[TemplateIntegration]
    A --> G[ProposalTabs]
    
    B --> H[TemplateManager]
    C --> H
    D --> H
    E --> H
    F --> H
    
    G --> I[TalentProposal]
    G --> J[Tab1: ChallengeAnalysis]
    G --> K[Tab2: ProjectDesign]
    G --> L[Tab3: TalentProposal]
    G --> M[Tab4: ExpectedResults]
    G --> N[Tab5: Implementation]
    
    H --> O[SessionStorage]
    
    style A fill:#ffd700,stroke:#333,stroke-width:3px
    style H fill:#90EE90,stroke:#333,stroke-width:2px
    style O fill:#87CEEB,stroke:#333,stroke-width:2px
```

## 使用方法

このMermaid図をGitHub、VSCode、またはMermaid対応のツールで表示することで、システムの動作を視覚的に理解できます。

### 表示方法
1. **GitHub**: このファイルをGitHubで開くと自動的にレンダリングされます
2. **VSCode**: Mermaid Preview拡張機能をインストールして表示
3. **オンラインツール**: [mermaid.live](https://mermaid.live/)にコピペして表示

## 更新履歴
- 2025-06-10: 初版作成 - 4ステップフロー、5タブ生成システム対応