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
  return `
あなたは経験豊富なビジネスコンサルタントです。蓄積されたテンプレートデータと選択された業務項目から、包括的な5タブ提案書を生成してください。

## 蓄積されたテンプレートデータ

### 企業基本情報
企業名: ${template.companyProfile?.name || '情報不足'}
業界: ${template.companyProfile?.industry?.join(', ') || '情報不足'}
従業員数: ${template.companyProfile?.employeeCount || '情報不足'}
年商: ${template.companyProfile?.revenue || '情報不足'}
事業内容: ${template.companyProfile?.businessDescription || '情報不足'}

### 事前リサーチ情報
組織文化: ${template.researchData?.organizationCulture || '情報不足'}
最近の動き: ${template.researchData?.recentNews || '情報不足'}
仮説・洞察: ${template.researchData?.hypothesisInsights || '情報不足'}

### 現状分析
事業フェーズ: ${template.currentAnalysis?.businessPhase || '情報不足'}
課題カテゴリ: ${template.currentAnalysis?.challengeCategories?.join(', ') || '情報不足'}
これまでの取り組み: ${template.currentAnalysis?.previousEfforts || '情報不足'}
失敗理由: ${template.currentAnalysis?.failureReasons || '情報不足'}
チーム構成: ${JSON.stringify(template.currentAnalysis?.teamComposition) || '情報不足'}
不足スキル: ${template.currentAnalysis?.missingSkills?.join(', ') || '情報不足'}

### プロジェクト設計
課題要約: ${template.projectDesign?.challengeSummary || '情報不足'}
緊急性理由: ${template.projectDesign?.urgencyReason || '情報不足'}
理想状態: ${template.projectDesign?.idealState3Months || '情報不足'}
成果物: ${template.projectDesign?.deliverables?.join(', ') || '情報不足'}

## 選択された業務項目
${selectedItems.map(item => `• ${item.category} / ${item.phase}: ${item.item}`).join('\n')}

## プロジェクト条件
- 稼働時間: ${workingHours}時間/月
- 希望人数: ${talentCount}名
- 副業/兼業人材前提

## 出力指示

以下の形式で5タブ提案書を生成してください：

### Tab1: 課題整理
\`\`\`
現状分析
企業名：[企業名]
業界：[業界]
従業員数：[規模]

課題マッピング
表面的な課題：[見えている問題]
本質的な課題：[根本原因]
放置した場合の影響：[具体的なリスク]

課題の優先度
1. [最優先課題] - [理由]
2. [次優先課題] - [理由]
3. [3番目課題] - [理由]
\`\`\`

### Tab2: プロジェクト設計
\`\`\`
プロジェクト概要
ミッション：[プロジェクトで実現すること]

フェーズ設計
Phase 1：[フェーズ名]（[期間]）
- 目的：[ゴール]
- 主要タスク：[具体的作業]
- 成果物：[deliverable]

Phase 2：[フェーズ名]（[期間]）
- 目的：[ゴール]
- 主要タスク：[具体的作業]
- 成果物：[deliverable]

スコープ定義
含むもの：[スコープ内容]
含まないもの：[対象外]
\`\`\`

### Tab3: 人材提案
\`\`\`
推奨チーム構成：[${talentCount}名体制]

人材要件
求める役割：[期待する役割]
必要スキル：[必須スキル]
経験レベル：[経験年数・レベル]
人物像：[人柄・特徴]

稼働条件
月間稼働：${workingHours}時間
勤務形態：リモート中心
コミュニケーション：[頻度・方法]

想定工数配分
[業務1]：[時間]時間/月
[業務2]：[時間]時間/月
[業務3]：[時間]時間/月
\`\`\`

【重要指示】
- テンプレートに情報がない項目は「情報不足により特定不可」と明記
- 推測や創作は禁止、事実ベースで分析
- 副業/兼業制約（月${workingHours}時間、リモート中心）を考慮
- 選択された業務項目を必ず反映
- 実際の営業現場で使用可能なレベルの具体性を保つ
`;
}

function parseFinalResponse(text, template, selectedItems) {
  return {
    tab1: {
      title: "課題整理",
      content: extractSection(text, 'Tab1: 課題整理', 'Tab2:') || generateTab1Content(template),
      type: "analysis"
    },
    tab2: {
      title: "プロジェクト設計", 
      content: extractSection(text, 'Tab2: プロジェクト設計', 'Tab3:') || generateTab2Content(template),
      type: "project"
    },
    tab3: {
      title: "人材提案",
      content: extractSection(text, 'Tab3: 人材提案', '【重要指示】') || generateTab3Content(template, selectedItems),
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

function generateTab1Content(template) {
  return `
現状分析
企業名：${template.companyProfile?.name || '情報不足により特定不可'}
業界：${template.companyProfile?.industry?.join(', ') || '情報不足により特定不可'}
従業員数：${template.companyProfile?.employeeCount || '情報不足により特定不可'}

課題マッピング
表面的な課題：${template.currentAnalysis?.challengeCategories?.join(', ') || '情報不足により特定不可'}
本質的な課題：${template.currentAnalysis?.failureReasons || '詳細な分析には追加情報が必要'}
放置した場合の影響：競争力低下、機会損失のリスク

課題の優先度
1. 組織能力強化 - 事業成長に向けた基盤構築
2. 効率化推進 - 生産性向上による競争力強化
3. 新規取り組み - 将来成長への投資
`.trim();
}

function generateTab2Content(template) {
  return `
プロジェクト概要
ミッション：${template.projectDesign?.challengeSummary || '組織能力強化と効率化推進'}

フェーズ設計
Phase 1：現状把握・計画策定（1-2ヶ月）
- 目的：課題の詳細分析と改善計画立案
- 主要タスク：現状調査、要因分析、改善計画策定
- 成果物：現状分析レポート、改善計画書

Phase 2：実行・改善（2-3ヶ月）
- 目的：計画の実行と効果測定
- 主要タスク：施策実行、進捗管理、効果検証
- 成果物：実行レポート、改善提案

スコープ定義
含むもの：${template.projectDesign?.deliverables?.join(', ') || '分析・計画・実行支援'}
含まないもの：システム開発、大規模組織変更
`.trim();
}

function generateTab3Content(template, selectedItems) {
  return `
推奨チーム構成：専門人材1名体制

人材要件
求める役割：戦略実行支援、課題解決推進
必要スキル：${template.currentAnalysis?.missingSkills?.join(', ') || '業務分析、改善企画、プロジェクト管理'}
経験レベル：3-5年以上の実務経験
人物像：自走力があり、コミュニケーション能力の高い人材

稼働条件
月間稼働：30時間
勤務形態：リモート中心（月1-2回訪問）
コミュニケーション：週1回定例会議、日常はSlack等

想定工数配分
${selectedItems.slice(0, 3).map((item, index) => 
  `${item.category}（${item.item}）：${Math.round(30 / Math.min(selectedItems.length, 3))}時間/月`
).join('\n')}
`.trim();
}

function generateMockFinalAnalysis(template, selectedItems) {
  return {
    tab1: {
      title: "課題整理",
      content: generateTab1Content(template),
      type: "analysis"
    },
    tab2: {
      title: "プロジェクト設計",
      content: generateTab2Content(template),  
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