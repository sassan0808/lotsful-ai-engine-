import { NextResponse } from 'next/server';

export async function POST(request) {
  let requestData;
  
  try {
    // リクエストボディを一度だけ読み込む
    requestData = await request.json();
    const { template, selectedIndustries, selectedItems, workingHours, talentCount } = requestData;
    
    // 必須フィールドの検証
    if (!template || !selectedItems || selectedItems.length === 0) {
      return NextResponse.json(
        { error: 'テンプレートと選択業務項目が必要です' },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using mock data');
      return NextResponse.json(generateMockFinalAnalysis(template, selectedItems));
    }

    // 最終統合分析プロンプトを作成
    const prompt = createFinalAnalysisPrompt(template, selectedItems, workingHours, talentCount);
    
    // Gemini API呼び出し
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 3000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('Invalid response from Gemini API');
    }

    // AI応答を解析して5タブ提案書形式に変換
    const analysisResult = parseFinalResponse(generatedText, template, selectedItems);
    
    return NextResponse.json(analysisResult);
    
  } catch (error) {
    console.error('Final Analysis API error:', error);
    
    // エラー時はモックデータを返す
    if (requestData && requestData.template && requestData.selectedItems) {
      return NextResponse.json(generateMockFinalAnalysis(requestData.template, requestData.selectedItems));
    } else {
      console.error('Request data not available for fallback');
      return NextResponse.json(generateMockFinalAnalysis({}, []));
    }
  }
}

function createFinalAnalysisPrompt(template, selectedItems, workingHours, talentCount) {
  // 業界特性分析
  const industries = Array.isArray(template.companyProfile?.industry) ? template.companyProfile.industry : [];
  const industryContext = industries.length > 0 ? `この企業は${industries.join('×')}の交差領域で事業を展開しており、` : '';
  
  // 選択業務の深い分析
  const selectedCategories = [...new Set(selectedItems.map(item => item.category))];
  const selectedPhases = [...new Set(selectedItems.map(item => item.phase))];
  
  return `
あなたは日本トップクラスの戦略コンサルタントであり、副業/兼業人材活用のエキスパートです。
以下の企業データを深く分析し、経営層を説得できる高品質な提案書を生成してください。

## 🔍 分析対象企業の全体像

### 企業プロファイル
- **企業名**: ${template.companyProfile?.name || '情報不足により特定不可'}
- **業界特性**: ${industryContext}${industries.join(', ') || '情報不足により特定不可'}
- **規模**: 従業員数 ${template.companyProfile?.employeeCount || '未確認'} / 年商 ${template.companyProfile?.revenue || '未確認'}
- **事業内容**: ${template.companyProfile?.businessDescription || '情報不足により特定不可'}
- **企業文化**: ${template.researchData?.organizationCulture || '情報不足により特定不可'}

### 🎯 現状の深層分析
**事業フェーズ**: ${template.currentAnalysis?.businessPhase || '情報不足'}
**直面している課題群**: ${Array.isArray(template.currentAnalysis?.challengeCategories) ? template.currentAnalysis.challengeCategories.join(', ') : '情報不足'}
**過去の取り組みと学び**: ${template.currentAnalysis?.previousEfforts || '情報不足'}
**根本的な失敗要因**: ${template.currentAnalysis?.failureReasons || '情報不足'}
**組織の弱点**: 不足スキル（${Array.isArray(template.currentAnalysis?.missingSkills) ? template.currentAnalysis.missingSkills.join(', ') : '未確認'}）

### 💡 プロジェクトビジョン
**解決すべき本質的課題**: ${template.projectDesign?.challengeSummary || '情報不足'}
**なぜ今なのか**: ${template.projectDesign?.urgencyReason || '情報不足'}
**3ヶ月後の成功イメージ**: ${template.projectDesign?.idealState3Months || '情報不足'}
**期待される成果物**: ${Array.isArray(template.projectDesign?.deliverables) ? template.projectDesign.deliverables.join(', ') : '情報不足'}

## 📋 選択された重点業務（${selectedItems.length}項目）
${selectedItems.map((item, idx) => `${idx + 1}. **${item.category}** [${item.phase}フェーズ]: ${item.item}`).join('\n')}

### 業務分析サマリー
- 重点カテゴリ: ${selectedCategories.join(', ')}
- 対象フェーズ: ${selectedPhases.join(', ')}
- 総稼働時間: ${workingHours}時間/月を${talentCount}名で分担

## 🎨 プロンプト指示

### 思考プロセス（Chain of Thought）

1. **深層分析フェーズ**
   - 表面的な課題の背後にある構造的問題を特定
   - 業界特性を踏まえた競争環境分析
   - 組織文化と課題の相関関係を考察

2. **戦略立案フェーズ**
   - 選択された業務項目から戦略的優先順位を導出
   - Quick Win と中長期成果のバランス設計
   - リスクとリターンの評価

3. **実行計画フェーズ**
   - 具体的なアクションプランの策定
   - マイルストーンとKPIの設定
   - 想定される障害と対策

## 📊 出力フォーマット

### Tab1: 課題整理【洞察的分析】
\`\`\`markdown
# 🎯 課題の本質的理解

## 企業概要
**${template.companyProfile?.name || '[企業名]'}**
- 業界: ${industries.join(' × ') || '[業界]'}
- 規模: ${template.companyProfile?.employeeCount || '[規模]'} / ${template.companyProfile?.revenue || '[年商]'}
- フェーズ: ${template.currentAnalysis?.businessPhase || '[事業フェーズ]'}

## 課題の三層構造分析

### 🔍 第1層：表面的症状
${template.currentAnalysis?.challengeCategories ? template.currentAnalysis.challengeCategories.map(cat => `- ${cat}の顕在化`).join('\n') : '- [観察可能な問題]'}

### 🔬 第2層：構造的要因
1. **組織能力のギャップ**
   - 現状: ${template.currentAnalysis?.previousEfforts || '[これまでの取り組み]'}
   - 理想: ${template.projectDesign?.idealState3Months || '[目指す姿]'}
   - Gap: ${template.currentAnalysis?.missingSkills ? template.currentAnalysis.missingSkills.join(', ') + 'の欠如' : '[能力ギャップ]'}

2. **失敗の本質的原因**
   ${template.currentAnalysis?.failureReasons || '[根本原因の深掘り分析]'}

### 💥 第3層：放置した場合のインパクト

#### 短期（1-3ヶ月）
- 機会損失額: 推定[X]万円/月
- 競合他社との差: [具体的な遅れ]
- 組織モラル: [士気への影響]

#### 中期（3-6ヶ月）  
- 市場シェア: [Y]%の低下リスク
- 人材流出: 優秀層の[Z]%が転職検討
- 収益性: 営業利益率[A]ポイント低下

#### 長期（6-12ヶ月）
- 事業存続性: [深刻なリスクシナリオ]
- ブランド価値: [回復困難な毀損]
- 投資価値: 企業価値[B]%減少

## 📊 課題の優先順位マトリクス

| 優先度 | 課題 | インパクト | 緊急度 | 解決難易度 |
|--------|------|------------|--------|------------|
| **🥇 1** | [最重要課題] | ★★★★★ | 🔴 至急 | 中 |
| **🥈 2** | [次点課題] | ★★★★☆ | 🟡 重要 | 低 |
| **🥉 3** | [第3課題] | ★★★☆☆ | 🟢 通常 | 高 |

### 💡 戦略的洞察
${template.projectDesign?.urgencyReason ? `「${template.projectDesign.urgencyReason}」という緊急性を踏まえ、` : ''}選択された${selectedItems.length}の業務領域（${selectedCategories.join(', ')}）に焦点を当てた即効性のあるアプローチが必要。
\`\`\`

### Tab2: プロジェクト設計【実行可能な青写真】
\`\`\`markdown
# 🚀 プロジェクト実行計画

## プロジェクトミッション
> **「${template.projectDesign?.challengeSummary || '[中核となる課題]'}」を解決し、**
> **${template.projectDesign?.idealState3Months || '[3ヶ月後の理想状態]'}を実現する**

## 🎯 成功の定義（Success Criteria）

### 定量目標
1. **業務効率**: ${selectedItems.some(i => i.category.includes('効率')) ? '20-30%の生産性向上' : '[定量目標1]'}
2. **コスト削減**: ${selectedItems.some(i => i.category.includes('コスト')) ? '月額X万円の削減' : '[定量目標2]'}
3. **売上貢献**: ${selectedItems.some(i => i.category.includes('売上') || i.category.includes('営業')) ? 'Y%の売上増' : '[定量目標3]'}

### 定性目標
- チーム能力: ${template.currentAnalysis?.missingSkills ? template.currentAnalysis.missingSkills.join(', ') + 'の獲得' : '[能力向上]'}
- 組織文化: [文化変革の具体像]
- 競争優位: [差別化要因の確立]

## 📅 フェーズ別実行計画

### 🏃 Phase 1: 基盤構築期（Month 1）

#### 目的
現状の詳細把握と改善基盤の整備

#### 主要アクティビティ
${selectedItems.filter(i => i.phase === 'リサーチ' || i.phase === '戦略').slice(0, 3).map((item, idx) => `
##### Week ${idx + 1}: ${item.item}
- 実施内容: [具体的なタスク]
- 必要リソース: [人/ツール/予算]
- 成功指標: [完了基準]`).join('')}

#### 成果物
1. 📊 **現状分析レポート**
   - As-Is業務フロー図
   - 課題の定量化データ
   - 改善機会マップ

2. 📋 **改善計画書**
   - To-Be業務設計
   - 実行ロードマップ
   - ROI試算

### 🚀 Phase 2: 実行加速期（Month 2-3）

#### 目的
計画の実行と成果の可視化

#### 主要アクティビティ
${selectedItems.filter(i => i.phase === '実行' || i.phase === '運用').slice(0, 3).map((item, idx) => `
##### Month ${idx + 2}: ${item.item}
- 実施内容: [具体的な実行タスク]
- 期待成果: [測定可能な成果]
- リスク対策: [想定リスクと対応]`).join('')}

#### 成果物
${template.projectDesign?.deliverables ? template.projectDesign.deliverables.map(d => `- 📄 ${d}`).join('\n') : `- 📄 実行進捗レポート
- 🔧 改善ツール/システム
- 📊 成果測定ダッシュボード`}

## 🎯 スコープ管理

### ✅ 含むもの（In Scope）
${selectedItems.slice(0, 5).map(item => `- ${item.category}: ${item.item}`).join('\n')}

### ❌ 含まないもの（Out of Scope）
- 大規模なシステム開発（別途検討）
- 組織再編を伴う施策（経営判断事項）
- ${talentCount}名を超える人員配置が必要な施策

## 🔄 プロジェクト運営体制

### ガバナンス構造
\`\`\`
[経営層]
   |
[ステアリングコミッティ]（月1回）
   |
[プロジェクトオーナー]（${template.companyProfile?.name || '貴社'}側）
   |
[プロジェクトリーダー]（副業人材）
   |
[実行チーム]（${talentCount}名体制）
\`\`\`

### コミュニケーションプラン
- **日次**: Slack/Teamsでの進捗共有
- **週次**: 30分のスタンドアップMTG
- **月次**: 2時間の成果報告会
\`\`\`

### Tab3: 人材提案【最適なチーム編成】
\`\`\`markdown
# 👥 推奨人材ポートフォリオ

## 🎯 チーム構成戦略

### 基本方針
**${talentCount}名体制**で**月${workingHours}時間**の稼働を最適配分
${talentCount > 1 ? `- 1名あたり: 月${Math.round(workingHours/talentCount)}時間（週${Math.round(workingHours/talentCount/4)}時間）` : ''}
- 完全リモート対応（月1-2回の対面MTG）
- ${selectedCategories.join('、')}に特化した専門性

## 📊 人材要件マトリクス

${talentCount === 1 ? `
### 💎 オールラウンダー型人材（1名体制）

#### 必須要件
| カテゴリ | 要件詳細 | 重要度 |
|----------|----------|--------|
| **専門スキル** | ${template.currentAnalysis?.missingSkills ? template.currentAnalysis.missingSkills.slice(0, 3).join(', ') : '[必須スキル群]'} | ★★★★★ |
| **業界経験** | ${industries.length > 0 ? industries[0] + '業界3年以上' : '[業界経験]'} | ★★★★☆ |
| **実績** | ${selectedItems[0]?.item || '[類似プロジェクト]'}の成功経験 | ★★★★☆ |
| **ソフトスキル** | 自走力、コミュニケーション力、柔軟性 | ★★★★★ |
` : `
### 🤝 チーム編成案（${talentCount}名体制）

${Array.from({length: talentCount}, (_, i) => `
#### 人材${i + 1}: ${i === 0 ? 'リードコンサルタント' : `スペシャリスト${i}`}

##### 役割
${i === 0 ? '全体統括・戦略立案・ステークホルダー管理' : selectedCategories[i] ? `${selectedCategories[i]}領域の専門実行` : '特定領域の深堀り'}

##### 必須スキル
- ${template.currentAnalysis?.missingSkills && template.currentAnalysis.missingSkills[i] ? template.currentAnalysis.missingSkills[i] : '[専門スキル]'}
- ${selectedItems[i] ? selectedItems[i].item + 'の実務経験' : '[実務経験]'}

##### 稼働配分
- 月${Math.round(workingHours/talentCount)}時間（週${Math.round(workingHours/talentCount/4)}時間）
- ${i === 0 ? 'プロジェクト全体の30%、実行の70%' : '担当領域に100%集中'}
`).join('')}
`}

## 🎨 理想的な人物像

### マインドセット
- **起業家精神**: 0→1を作り出す創造力
- **当事者意識**: ${template.companyProfile?.name || '貴社'}の一員としての責任感  
- **学習意欲**: ${industries.join('×')}領域への好奇心
- **成果志向**: ${workingHours}時間で最大価値を生む効率性

### ワークスタイル
- **自律性**: リモートでも高いパフォーマンス
- **協調性**: 既存チームとの円滑な連携
- **柔軟性**: ${template.currentAnalysis?.businessPhase || '成長期'}に応じた対応力
- **透明性**: 進捗・課題の率直な共有

## 📅 稼働イメージ

### 週次スケジュール例（${workingHours}時間/月の場合）

| 曜日 | 時間帯 | 活動内容 |
|------|--------|----------|
| 月 | 10:00-12:00 | 週次定例MTG・計画確認 |
| 火-木 | フレキシブル | 実行作業（計${Math.round(workingHours/4*0.6)}時間） |
| 金 | 14:00-16:00 | 成果確認・翌週準備 |

### 月次配分
\`\`\`
企画・分析: ${Math.round(workingHours * 0.3)}時間（30%）
実行・実装: ${Math.round(workingHours * 0.5)}時間（50%）  
MTG・報告: ${Math.round(workingHours * 0.2)}時間（20%）
\`\`\`

## 🔍 選考プロセス

### 推奨ステップ
1. **書類選考**（2-3日）
   - 職務経歴書での実績確認
   - ${selectedItems[0]?.category || '重点領域'}の専門性評価

2. **1次面談**（30-45分）
   - カルチャーフィット確認  
   - 基本的なスキルセット評価

3. **2次面談**（60分）
   - 具体的なプロジェクト討議
   - ${template.projectDesign?.challengeSummary ? '「' + template.projectDesign.challengeSummary + '」への' : ''}アプローチ提案

4. **最終確認**（30分）
   - 条件面の合意
   - スタート時期の調整

### 💰 予算配分案

月額${workingHours}時間 × 時間単価 = 月額予算
${talentCount > 1 ? `（${talentCount}名で分担）` : ''}

- スキルレベル別単価目安
  - ジュニア: 5,000-8,000円/時
  - ミドル: 8,000-15,000円/時  
  - シニア: 15,000-25,000円/時
\`\`\`

## 🎯 重要な注意事項

### AI Honestyポリシー
- 提供された情報に「情報不足により特定不可」と記載された項目は、追加ヒアリングが必要
- 推測や一般論ではなく、実データに基づいた提案を心がけている
- ${industries.length > 0 ? industries.join('×') + '業界の' : ''}特性を考慮した現実的な内容

### 副業/兼業人材活用の制約
- フルタイムコミットは不可（最大月80時間）
- 完全リモート前提（オフィス常駐不可）
- 雇用ではなく業務委託契約
- 他社での副業も並行している前提

### 成功のカギ
1. **明確な役割定義**: ${selectedItems.length}の選択業務に集中
2. **適切な権限委譲**: 意思決定の迅速化
3. **成果の可視化**: 定期的な価値証明
4. **既存社員との協働**: 内製化への道筋
`;
}

function parseFinalResponse(text, template, selectedItems) {
  return {
    tab1: {
      title: "課題整理",
      content: extractSection(text, 'Tab1: 課題整理', 'Tab2:') || generateTab1Content(template, selectedItems),
      type: "analysis"
    },
    tab2: {
      title: "プロジェクト設計", 
      content: extractSection(text, 'Tab2: プロジェクト設計', 'Tab3:') || generateTab2Content(template, selectedItems),
      type: "project"
    },
    tab3: {
      title: "人材提案",
      content: extractSection(text, 'Tab3: 人材提案', '🎯 重要な注意事項') || generateTab3Content(template, selectedItems),
      type: "talent"
    },
    tab4: {
      title: "期待成果",
      content: "Coming Soon - 手動生成ボタンで生成可能",
      type: "outcome",
      generated: false
    },
    tab5: {
      title: "実施要項", 
      content: "Coming Soon - 手動生成ボタンで生成可能",
      type: "implementation",
      generated: false
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      template: template,
      selectedItems: selectedItems,
      analysisType: 'final_integration'
    }
  };
}

function extractSection(text, startMarker, endMarker) {
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) return null;
  
  const contentStart = startIndex + startMarker.length;
  const endIndex = endMarker ? text.indexOf(endMarker, contentStart) : text.length;
  
  if (endIndex === -1) {
    return text.substring(contentStart).trim();
  }
  
  return text.substring(contentStart, endIndex).trim();
}

function generateTab1Content(template, selectedItems) {
  const industries = Array.isArray(template.companyProfile?.industry) ? template.companyProfile.industry : [];
  const challenges = Array.isArray(template.currentAnalysis?.challengeCategories) ? template.currentAnalysis.challengeCategories : [];
  const selectedCategories = [...new Set(selectedItems.map(item => item.category))];
  
  return `
# 🎯 課題の本質的理解

## 企業概要
**${template.companyProfile?.name || '[企業名未設定]'}**
- 業界: ${industries.length > 0 ? industries.join(' × ') : '情報不足により特定不可'}
- 規模: ${template.companyProfile?.employeeCount || '情報不足'} / ${template.companyProfile?.revenue || '情報不足'}
- フェーズ: ${template.currentAnalysis?.businessPhase || '情報不足により特定不可'}

## 課題の三層構造分析

### 🔍 第1層：表面的症状
${challenges.length > 0 ? challenges.map(cat => `- ${cat}の顕在化`).join('\n') : '- 情報不足により特定不可'}

### 🔬 第2層：構造的要因
1. **組織能力のギャップ**
   - 現状: ${template.currentAnalysis?.previousEfforts || '情報不足'}
   - 理想: ${template.projectDesign?.idealState3Months || '情報不足'}
   - Gap: ${template.currentAnalysis?.missingSkills ? template.currentAnalysis.missingSkills.join(', ') + 'の欠如' : '情報不足'}

2. **失敗の本質的原因**
   ${template.currentAnalysis?.failureReasons || '詳細な分析には追加情報が必要'}

### 💥 第3層：放置した場合のインパクト

#### 短期（1-3ヶ月）
- 競合他社との差が拡大
- チームの士気低下
- 機会損失のリスク顕在化

#### 中期（3-6ヶ月）  
- 市場シェアの低下
- 優秀人材の流出リスク
- 収益性の悪化

#### 長期（6-12ヶ月）
- 事業の持続可能性への疑義
- ブランド価値の毀損
- 企業価値の低下

## 📊 課題の優先順位マトリクス

| 優先度 | 課題 | インパクト | 緊急度 | 解決難易度 |
|--------|------|------------|--------|------------|
| **🥇 1** | ${challenges[0] || '組織能力強化'} | ★★★★★ | 🔴 至急 | 中 |
| **🥈 2** | ${challenges[1] || '効率化推進'} | ★★★★☆ | 🟡 重要 | 低 |
| **🥉 3** | ${challenges[2] || '新規取り組み'} | ★★★☆☆ | 🟢 通常 | 高 |

### 💡 戦略的洞察
${template.projectDesign?.urgencyReason ? `「${template.projectDesign.urgencyReason}」という緊急性を踏まえ、` : ''}選択された${selectedItems.length}の業務領域（${selectedCategories.join(', ')}）に焦点を当てた即効性のあるアプローチが必要。
`.trim();
}

function generateTab2Content(template, selectedItems) {
  const workingHours = template.metadata?.actualWorkingHours || 30;
  const selectedCategories = [...new Set(selectedItems.map(item => item.category))];
  
  return `
# 🚀 プロジェクト実行計画

## プロジェクトミッション
> **「${template.projectDesign?.challengeSummary || '組織能力強化と効率化推進'}」を解決し、**
> **${template.projectDesign?.idealState3Months || '3ヶ月後の理想状態'}を実現する**

## 🎯 成功の定義（Success Criteria）

### 定量目標
1. **業務効率**: ${selectedItems.some(i => i.category.includes('効率')) ? '20-30%の生産性向上' : '定量的な成果指標を設定'}
2. **コスト削減**: 月額コストの15%削減
3. **売上貢献**: 新規ビジネス機会の創出

### 定性目標
- チーム能力: ${template.currentAnalysis?.missingSkills ? template.currentAnalysis.missingSkills.join(', ') + 'の獲得' : '必要スキルの内製化'}
- 組織文化: データドリブンな意思決定文化の醸成
- 競争優位: 業界内での差別化要因の確立

## 📅 フェーズ別実行計画

### 🏃 Phase 1: 基盤構築期（Month 1）

#### 目的
現状の詳細把握と改善基盤の整備

#### 主要アクティビティ
${selectedItems.slice(0, 3).map((item, idx) => `
##### Week ${idx + 1}: ${item.item}
- 実施内容: ${item.category}領域の現状分析と改善計画
- 成功指標: 分析完了とアクションプラン策定`).join('')}

#### 成果物
1. 📊 **現状分析レポート**
   - As-Is業務フロー図
   - 課題の定量化データ
   - 改善機会マップ

2. 📋 **改善計画書**
   - To-Be業務設計
   - 実行ロードマップ
   - ROI試算

### 🚀 Phase 2: 実行加速期（Month 2-3）

#### 目的
計画の実行と成果の可視化

#### 主要アクティビティ
- 改善施策の実装と導入
- チームへのトレーニング実施
- 効果測定と最適化

#### 成果物
${template.projectDesign?.deliverables ? template.projectDesign.deliverables.map(d => `- 📄 ${d}`).join('\n') : `- 📄 実行進捗レポート
- 🔧 改善ツール/プロセス
- 📊 成果測定ダッシュボード`}

## 🎯 スコープ管理

### ✅ 含むもの（In Scope）
${selectedItems.slice(0, 5).map(item => `- ${item.category}: ${item.item}`).join('\n')}

### ❌ 含まないもの（Out of Scope）
- 大規模なシステム開発
- 組織再編を伴う施策
- 本プロジェクト範囲外の業務

## 🔄 プロジェクト運営体制

### コミュニケーションプラン
- **日次**: Slack/Teamsでの進捗共有
- **週次**: 30分のスタンドアップMTG
- **月次**: 2時間の成果報告会
`.trim();
}

function generateTab3Content(template, selectedItems) {
  const talentCount = template.metadata?.talentCount || 1;
  const workingHours = template.metadata?.actualWorkingHours || 30;
  const industries = Array.isArray(template.companyProfile?.industry) ? template.companyProfile.industry : [];
  const selectedCategories = [...new Set(selectedItems.map(item => item.category))];
  
  return `
# 👥 推奨人材ポートフォリオ

## 🎯 チーム構成戦略

### 基本方針
**${talentCount}名体制**で**月${workingHours}時間**の稼働を最適配分
${talentCount > 1 ? `- 1名あたり: 月${Math.round(workingHours/talentCount)}時間（週${Math.round(workingHours/talentCount/4)}時間）` : ''}
- 完全リモート対応（月1-2回の対面MTG）
- ${selectedCategories.join('、')}に特化した専門性

## 📊 人材要件マトリクス

${talentCount === 1 ? `
### 💎 オールラウンダー型人材（1名体制）

#### 必須要件
| カテゴリ | 要件詳細 | 重要度 |
|----------|----------|--------|
| **専門スキル** | ${template.currentAnalysis?.missingSkills ? template.currentAnalysis.missingSkills.slice(0, 3).join(', ') : '業務分析、改善企画、プロジェクト管理'} | ★★★★★ |
| **業界経験** | ${industries.length > 0 ? industries[0] + '業界3年以上' : '関連業界での実務経験'} | ★★★★☆ |
| **実績** | ${selectedItems[0]?.item || '類似プロジェクト'}の成功経験 | ★★★★☆ |
| **ソフトスキル** | 自走力、コミュニケーション力、柔軟性 | ★★★★★ |
` : `
### 🤝 チーム編成案（${talentCount}名体制）

${Array.from({length: talentCount}, (_, i) => `
#### 人材${i + 1}: ${i === 0 ? 'リードコンサルタント' : `スペシャリスト${i}`}

##### 役割
${i === 0 ? '全体統括・戦略立案' : selectedCategories[i] ? `${selectedCategories[i]}領域専門` : '特定領域の専門実行'}

##### 必須スキル
- ${template.currentAnalysis?.missingSkills && template.currentAnalysis.missingSkills[i] ? template.currentAnalysis.missingSkills[i] : '専門スキル'}
- ${selectedItems[i] ? selectedItems[i].item + 'の実務経験' : '関連実務経験'}

##### 稼働配分
- 月${Math.round(workingHours/talentCount)}時間（週${Math.round(workingHours/talentCount/4)}時間）
`).join('')}
`}

## 🎨 理想的な人物像

### マインドセット
- **起業家精神**: 0→1を作り出す創造力
- **当事者意識**: ${template.companyProfile?.name || '貴社'}の一員としての責任感  
- **学習意欲**: ${industries.join('×')}領域への好奇心
- **成果志向**: ${workingHours}時間で最大価値を生む効率性

### ワークスタイル
- **自律性**: リモートでも高いパフォーマンス
- **協調性**: 既存チームとの円滑な連携
- **柔軟性**: ${template.currentAnalysis?.businessPhase || '成長期'}に応じた対応力
- **透明性**: 進捗・課題の率直な共有

## 📅 稼働イメージ

### 週次スケジュール例（${workingHours}時間/月の場合）

| 曜日 | 時間帯 | 活動内容 |
|------|--------|----------|
| 月 | 10:00-12:00 | 週次定例MTG・計画確認 |
| 火-木 | フレキシブル | 実行作業（計${Math.round(workingHours/4*0.6)}時間） |
| 金 | 14:00-16:00 | 成果確認・翌週準備 |

### 月次配分
\`\`\`
企画・分析: ${Math.round(workingHours * 0.3)}時間（30%）
実行・実装: ${Math.round(workingHours * 0.5)}時間（50%）  
MTG・報告: ${Math.round(workingHours * 0.2)}時間（20%）
\`\`\`

## 🔍 選考プロセス

### 推奨ステップ
1. **書類選考**（2-3日）
   - 職務経歴書での実績確認
   - ${selectedItems[0]?.category || '重点領域'}の専門性評価

2. **1次面談**（30-45分）
   - カルチャーフィット確認  
   - 基本的なスキルセット評価

3. **2次面談**（60分）
   - 具体的なプロジェクト討議
   - ${template.projectDesign?.challengeSummary ? '「' + template.projectDesign.challengeSummary + '」への' : ''}アプローチ提案

4. **最終確認**（30分）
   - 条件面の合意
   - スタート時期の調整

### 💰 予算配分案

月額${workingHours}時間 × 時間単価 = 月額予算
${talentCount > 1 ? `（${talentCount}名で分担）` : ''}

- スキルレベル別単価目安
  - ジュニア: 5,000-8,000円/時
  - ミドル: 8,000-15,000円/時  
  - シニア: 15,000-25,000円/時
`.trim();
}

function generateMockFinalAnalysis(template, selectedItems) {
  return {
    tab1: {
      title: "課題整理",
      content: generateTab1Content(template, selectedItems),
      type: "analysis"
    },
    tab2: {
      title: "プロジェクト設計",
      content: generateTab2Content(template, selectedItems),  
      type: "project"
    },
    tab3: {
      title: "人材提案",
      content: generateTab3Content(template, selectedItems),
      type: "talent"
    },
    tab4: {
      title: "期待成果",
      content: "Coming Soon - 手動生成ボタンで生成可能",
      type: "outcome",
      generated: false
    },
    tab5: {
      title: "実施要項",
      content: "Coming Soon - 手動生成ボタンで生成可能", 
      type: "implementation",
      generated: false
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      template: template,
      selectedItems: selectedItems,
      analysisType: 'final_integration',
      isMockData: true
    }
  };
}