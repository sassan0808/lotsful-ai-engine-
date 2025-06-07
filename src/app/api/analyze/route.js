import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { companyInfo, challenges, selectedIndustries, selectedItems, workingHours } = await request.json();
    
    // Validate required fields
    if (!companyInfo || !selectedItems || selectedItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: companyInfo and selectedItems are required' },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using mock data');
      return NextResponse.json(generateMockAnalysis({ companyInfo, challenges, selections: { selectedIndustries, selectedItems, workingHours } }));
    }

    // Prepare the analysis prompt for Gemini
    const prompt = createAnalysisPrompt(companyInfo, challenges, selectedIndustries, selectedItems);
    
    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
          maxOutputTokens: 2048,
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

    // Parse the AI response and structure it
    const analysisResult = parseGeminiResponse(generatedText, companyInfo, selectedIndustries, selectedItems);
    
    return NextResponse.json(analysisResult);
    
  } catch (error) {
    console.error('Analysis API error:', error);
    
    // Fallback to mock data on error
    const { companyInfo, challenges, selectedIndustries, selectedItems, workingHours } = await request.json();
    return NextResponse.json(generateMockAnalysis({ companyInfo, challenges, selections: { selectedIndustries, selectedItems, workingHours } }));
  }
}

function createAnalysisPrompt(companyInfo, challenges, selectedIndustries, selectedItems) {
  const selectedItemsText = selectedItems.map(item => 
    `- ${item.category} > ${item.phase}: ${item.title} (${item.workingHours}時間/月)`
  ).join('\n');

  const challengesText = challenges && challenges.length > 0 
    ? challenges.map(c => `- ${c.category}: ${c.description}`).join('\n')
    : '特になし';

  return `
企業情報分析とプロジェクト提案を行ってください。

## 企業情報
${companyInfo}

## 業界
${selectedIndustries?.join(', ') || '未指定'}

## 現在の課題・ニーズ
${challengesText}

## 選択された業務項目
${selectedItemsText}

## 依頼内容
上記の情報を基に、以下の形式でプロジェクト提案を作成してください：

### 1. 企業分析サマリー
- 企業の特徴と強み
- 業界における位置づけ
- 成長ステージの分析

### 2. 課題分析
- 特定された主要課題
- 課題の優先度
- 解決のための戦略的アプローチ

### 3. プロジェクト提案
- プロジェクト名
- 期間と工数
- 主要な成果物
- 期待される効果

### 4. 必要な人材・スキル
- 推奨される副業人材のプロフィール
- 必要なスキルセット
- 経験レベル

### 5. 実行プラン
- フェーズ別の実行計画
- マイルストーン
- リスクと対策

簡潔で実践的な提案を心がけ、副業人材（月20-40時間、リモート中心）の制約を考慮してください。
`;
}

function parseGeminiResponse(text, companyInfo, industry, selectedItems) {
  // Basic parsing - in a real implementation, this would be more sophisticated
  const sections = text.split('###').filter(section => section.trim());
  
  return {
    companyAnalysis: {
      summary: extractSection(text, '企業分析サマリー') || '企業の特徴と強みを分析中...',
      strengths: ['データドリブンな意思決定', '柔軟な組織体制', '市場適応力'],
      position: extractSection(text, '業界における位置づけ') || `${industry}業界での競争優位性を持つ企業`
    },
    challenges: {
      primary: extractSection(text, '課題分析') || '主要な課題を特定し、解決策を検討中...',
      priority: 'high',
      approach: '戦略的アプローチによる段階的解決'
    },
    projectProposal: {
      title: extractSection(text, 'プロジェクト名') || '業務最適化・DXプロジェクト',
      duration: '3-6ヶ月',
      workload: selectedItems.reduce((total, item) => total + (item.workingHours || 0), 0),
      deliverables: extractListItems(text, '成果物') || [
        '業務プロセス改善提案書',
        'DX推進ロードマップ',
        '効果測定指標の設定'
      ],
      expectedEffects: extractListItems(text, '期待される効果') || [
        '業務効率20%向上',
        'コスト削減効果',
        '組織の生産性向上'
      ]
    },
    recommendedTalent: {
      profile: extractSection(text, '必要な人材・スキル') || 'ビジネス分析とDX推進の経験を持つ人材',
      skills: extractListItems(text, 'スキルセット') || [
        'ビジネス分析',
        'プロジェクトマネジメント',
        'データ分析',
        'DX戦略立案'
      ],
      experience: '3-5年以上の実務経験'
    },
    executionPlan: {
      phases: extractListItems(text, 'フェーズ別') || [
        'フェーズ1: 現状分析・課題特定 (4週間)',
        'フェーズ2: 解決策設計・プロトタイプ (6週間)',
        'フェーズ3: 実装・検証 (8週間)',
        'フェーズ4: 展開・定着支援 (4週間)'
      ],
      milestones: extractListItems(text, 'マイルストーン') || [
        '現状分析レポート完成',
        '改善提案書作成',
        'パイロット実装',
        '効果測定・報告'
      ],
      risks: extractListItems(text, 'リスク') || [
        '組織の変化への抵抗',
        'リソースの制約',
        '外部環境の変化'
      ]
    },
    metadata: {
      industry,
      selectedItemsCount: selectedItems.length,
      totalWorkingHours: selectedItems.reduce((total, item) => total + (item.workingHours || 0), 0),
      analysisDate: new Date().toISOString()
    }
  };
}

function extractSection(text, sectionName) {
  const regex = new RegExp(`###?\\s*\\d*\\.?\\s*${sectionName}[\\s\\S]*?(?=###|$)`, 'i');
  const match = text.match(regex);
  if (match) {
    return match[0].replace(/###?\s*\d*\.?\s*[^:：\n]+[:：]?\s*/, '').trim();
  }
  return null;
}

function extractListItems(text, context) {
  const lines = text.split('\n');
  const items = [];
  let inContext = false;
  
  for (const line of lines) {
    if (line.includes(context)) {
      inContext = true;
      continue;
    }
    if (inContext && line.startsWith('-')) {
      items.push(line.substring(1).trim());
    }
    if (inContext && line.startsWith('#')) {
      break;
    }
  }
  
  return items.length > 0 ? items : null;
}

function generateMockAnalysis(analysisData) {
  const { companyInfo, challenges, selections } = analysisData;
  const { selectedIndustries, selectedItems, workingHours } = selections || {};
  const totalHours = selectedItems?.reduce((total, item) => total + (item.workingHours || 0), 0) || workingHours || 0;
  
  return {
    companyAnalysis: {
      summary: `${selectedIndustries?.join(', ') || '対象'}業界で事業を展開する企業として、デジタル変革と業務効率化に積極的に取り組む姿勢が見られます。`,
      strengths: [
        'データドリブンな意思決定',
        '柔軟な組織体制',
        '市場適応力の高さ'
      ],
      position: `${selectedIndustries?.join(', ') || '対象'}業界において競争優位性を持つ企業として位置づけられています。`
    },
    challenges: {
      primary: '業務プロセスの最適化とDX推進による競争力向上が主要な課題として特定されました。',
      priority: 'high',
      approach: '段階的なデジタル変革による持続可能な成長戦略'
    },
    projectDefinition: {
      projectName: `${selectedIndustries?.join(', ') || '対象'}業界向け業務最適化・DXプロジェクト`,
      goalDescription: '企業のデジタル化を推進し、競争力強化と業務効率向上を実現する',
      successCriteria: '3ヶ月で基盤構築、6ヶ月で運用開始、1年で目標ROI達成',
      timeline: `${totalHours}時間/月での3-6ヶ月プロジェクト`
    },
    integratedApproach: {
      strategicPlanning: '現状分析→戦略設計→実行計画策定の3段階アプローチ',
      execution: '優先度の高い領域から段階的実装、早期成果創出を重視',
      analysis: 'データ駆動型の継続的改善サイクル確立',
      roadmap: 'フェーズ1: 基盤整備、フェーズ2: 本格展開、フェーズ3: 最適化'
    },
    requiredExpertise: {
      roleDefinition: 'ビジネス分析とDX推進の経験を持つシニアコンサルタント',
      experienceLevel: '3-5年以上の実務経験、類似業界での成功事例',
      skillSet: [
        'ビジネス分析・要件定義',
        'プロジェクトマネジメント',
        'データ分析・可視化',
        'DX戦略立案・実行支援'
      ]
    },
    remoteWorkPlan: {
      communicationFrequency: '週2回の定期MTG＋必要に応じたアドホック相談',
      deliverables: '週次進捗レポート、月次成果報告、フェーズ完了時の詳細分析',
      collaborationTools: 'Slack/Teams + Notion/Confluence + 週次ビデオ会議'
    },
    expectedOutcome: {
      shortTerm: '現状分析完了、改善計画策定、クイックウィン施策実行',
      mediumTerm: '主要施策の実装完了、初期効果測定、改善サイクル確立',
      longTerm: '目標ROI達成、組織能力向上、持続的改善体制構築'
    },
    riskMitigation: {
      potentialChallenges: [
        '組織の変化への抵抗',
        'リソース・予算の制約',
        '外部環境の急激な変化',
        '技術的な実装課題'
      ],
      mitigationStrategies: [
        '経営層との密接な連携体制構築',
        '段階的実装によるリスク分散',
        '外部パートナー活用によるリソース補完',
        '定期的な進捗確認と計画調整'
      ]
    },
    metadata: {
      analysisDate: new Date().toISOString(),
      inputDataSummary: {
        selectedItemsCount: selectedItems?.length || 0,
        workingHours: totalHours,
        selectedIndustries
      },
      isMockData: true
    }
  };
}