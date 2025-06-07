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
    try {
      const { companyInfo, challenges, selectedIndustries, selectedItems, workingHours } = await request.json();
      return NextResponse.json(generateMockAnalysis({ companyInfo, challenges, selections: { selectedIndustries, selectedItems, workingHours } }));
    } catch (parseError) {
      console.error('Failed to parse request JSON for fallback:', parseError);
      return NextResponse.json({ error: 'Analysis failed and unable to generate fallback data' }, { status: 500 });
    }
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
${companyInfo?.rawText || companyInfo || '企業情報が提供されていません'}

## 業界
${selectedIndustries?.join(', ') || '未指定'}

## 現在の課題・ニーズ
${challengesText}

## 選択された業務項目
${selectedItemsText}

## 依頼内容
上記の情報を基に、以下の形式で5タブ構成の提案書を作成してください。

【重要な指示】
- 提供された情報から明確に判断できない項目については、推測や創作をせず「情報不足により特定不可」と記載してください
- 企業名が不明な場合は「企業名：情報不足により特定不可」
- 従業員数が不明な場合は「従業員数：情報不足により特定不可」
- 課題が具体的に記載されていない場合は、一般論ではなく「詳細情報が必要」と記載
- 常に正確性を重視し、不確実な情報は明確にその旨を示してください

## Tab1: 課題整理

### 現状分析
企業名：[企業名を記載]
業界：[業界を記載]
従業員数：[従業員規模を記載]

### 課題マッピング
以下の表形式で3つの領域について記載してください：

| 領域 | 現状 | 理想 | ギャップ |
|------|------|------|---------|
| [領域1名] | [現状詳細] | [理想詳細] | [ギャップ分析] |
| [領域2名] | [現状詳細] | [理想詳細] | [ギャップ分析] |
| [領域3名] | [現状詳細] | [理想詳細] | [ギャップ分析] |

### 課題の深掘り

#### 表面的な課題
[表面的に見えている問題を具体的に記載]

#### 本質的な課題
[真の原因・構造的な問題を記載]

#### 放置した場合の影響
- 短期（3ヶ月）: [具体的なリスクを記載]
- 中期（6ヶ月）: [具体的なリスクを記載]
- 長期（1年）: [具体的なリスクを記載]

## Tab2: プロジェクト設計

### プロジェクト概要

#### ミッション
[このプロジェクトで実現することを記載]

#### スコープ定義

##### 含むもの
✅ [スコープ1]
✅ [スコープ2]
✅ [スコープ3]

##### 含まないもの
❌ [対象外1]
❌ [対象外2]

### フェーズ設計

#### Phase 1: [フェーズ名]（[期間]）

##### 目的
[このフェーズのゴールを記載]

##### 主要タスク
- [タスク1]
  詳細：[具体的な作業内容]
  期限：[日数/週数]
- [タスク2]
  詳細：[具体的な作業内容]
  期限：[日数/週数]
- [タスク3]
  詳細：[具体的な作業内容]
  期限：[日数/週数]

##### 成果物
📄 [成果物1]
📊 [成果物2]
🔧 [成果物3]

##### マイルストーン
[具体的な達成基準を記載]

#### Phase 2: [フェーズ名]（[期間]）

##### 目的
[このフェーズのゴールを記載]

##### 主要タスク
- [タスク1]
  詳細：[具体的な作業内容]
  期限：[日数/週数]
- [タスク2]
  詳細：[具体的な作業内容]
  期限：[日数/週数]

##### 成果物
📈 [成果物1]
🚀 [成果物2]

##### マイルストーン
[具体的な達成基準を記載]

簡潔で実践的な提案を心がけ、副業/兼業人材（月10-80時間、デフォルト30時間、リモート中心）の制約を考慮してください。
`;
}

function parseGeminiResponse(text, companyInfo, industry, selectedItems) {
  // Parse 5-tab structure from Gemini response
  
  return {
    // Tab1: 課題整理
    challengeAnalysis: {
      // 現状分析
      companyName: extractFieldValue(text, '企業名') || (companyInfo?.rawText ? extractCompanyName(companyInfo.rawText) : null) || '情報不足により特定不可',
      industryName: extractFieldValue(text, '業界') || industry?.join?.(', ') || industry || '情報不足により特定不可',
      employeeCount: extractFieldValue(text, '従業員数') || '情報不足により特定不可',
      
      // 課題マッピング（表形式データの抽出）
      challengeMapping: extractChallengeMapping(text) || [
        { area: '営業プロセス', current: '手動作業が多い', ideal: '自動化とデータ活用', gap: '効率性とスピードの大幅な改善が必要' },
        { area: 'データ管理', current: '分散した情報管理', ideal: '統合されたデータ基盤', gap: 'データの一元化と活用体制の構築' },
        { area: '組織体制', current: '縦割り組織', ideal: '横断的なチーム編成', gap: 'コラボレーションと情報共有の仕組み化' }
      ],
      
      // 課題の深掘り
      surfaceChallenges: extractSection(text, '表面的な課題') || '詳細な課題情報が必要です',
      rootChallenges: extractSection(text, '本質的な課題') || '根本原因の特定には更なる情報収集が必要',
      impactRisks: {
        shortTerm: extractRiskByTerm(text, '短期') || '情報不足により影響予測不可',
        mediumTerm: extractRiskByTerm(text, '中期') || '情報不足により影響予測不可',
        longTerm: extractRiskByTerm(text, '長期') || '情報不足により影響予測不可'
      }
    },
    
    // Tab2: プロジェクト設計
    projectDesign: {
      // プロジェクト概要
      mission: extractSection(text, 'ミッション') || 'デジタル変革による業務効率化と競争力強化を実現する',
      scopeIncluded: extractScopeItems(text, '含むもの') || [
        '選択された業務領域の最適化',
        'データ活用基盤の構築',
        '組織体制の改善提案'
      ],
      scopeExcluded: extractScopeItems(text, '含まないもの') || [
        'システム開発・実装',
        '人事制度の変更'
      ],
      
      // フェーズ設計
      phases: extractPhases(text) || [
        {
          name: '現状分析・戦略設計',
          period: '4-6週間',
          purpose: '現状の課題を詳細分析し、改善戦略を設計する',
          tasks: [
            { name: '現状業務フローの詳細分析', detail: 'ヒアリングと業務観察による詳細調査', deadline: '2週間' },
            { name: 'データ収集・分析', detail: '既存データの整理と分析基盤の設計', deadline: '2週間' },
            { name: '改善戦略の策定', detail: '課題に対する具体的な解決策の設計', deadline: '2週間' }
          ],
          deliverables: ['📄 現状分析レポート', '📊 改善戦略書', '🔧 実行計画書'],
          milestone: '改善戦略の承認と次フェーズへの移行決定'
        },
        {
          name: '実装・改善実行',
          period: '8-10週間',
          purpose: '策定した改善策を段階的に実行し、効果を検証する',
          tasks: [
            { name: 'パイロット実装', detail: '重要度の高い領域での試行実装', deadline: '4週間' },
            { name: '効果測定・調整', detail: 'KPI測定と改善策の調整', deadline: '4週間' }
          ],
          deliverables: ['📈 効果測定レポート', '🚀 本格展開計画'],
          milestone: '目標KPIの達成と本格展開の準備完了'
        }
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

function extractFieldValue(text, fieldName) {
  const regex = new RegExp(`${fieldName}[：:]\\s*(.+)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function extractChallengeMapping(text) {
  const tableRegex = /\|\s*領域\s*\|\s*現状\s*\|\s*理想\s*\|\s*ギャップ\s*\|([\s\S]*?)(?=\n\n|\n###|$)/i;
  const match = text.match(tableRegex);
  
  if (!match) return null;
  
  const rows = match[1].split('\n').filter(line => line.includes('|') && !line.includes('---'));
  const mapping = [];
  
  rows.forEach(row => {
    const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
    if (cells.length >= 4) {
      mapping.push({
        area: cells[0],
        current: cells[1],
        ideal: cells[2],
        gap: cells[3]
      });
    }
  });
  
  return mapping.length > 0 ? mapping : null;
}

function extractRiskByTerm(text, term) {
  const regex = new RegExp(`${term}[（(].*?[）)]\\s*[：:]\\s*(.+)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function extractScopeItems(text, scopeType) {
  const startRegex = new RegExp(`${scopeType}\\s*\n`, 'i');
  const match = text.match(startRegex);
  
  if (!match) return null;
  
  const startIndex = match.index + match[0].length;
  const afterText = text.substring(startIndex);
  const lines = afterText.split('\n');
  const items = [];
  
  for (const line of lines) {
    if (line.includes('✅') || line.includes('❌')) {
      const item = line.replace(/[✅❌]/g, '').trim();
      if (item) items.push(item);
    } else if (line.includes('#') || (items.length > 0 && line.trim() === '')) {
      break;
    }
  }
  
  return items.length > 0 ? items : null;
}

function extractPhases(text) {
  const phaseRegex = /#### Phase \d+:\s*(.+?)（(.+?)）([\s\S]*?)(?=#### Phase|$)/gi;
  const phases = [];
  let match;
  
  while ((match = phaseRegex.exec(text)) !== null) {
    const phaseName = match[1].trim();
    const period = match[2].trim();
    const content = match[3];
    
    const purpose = extractSection(content, '目的') || '';
    const tasks = extractPhaseTasks(content) || [];
    const deliverables = extractPhaseDeliverables(content) || [];
    const milestone = extractSection(content, 'マイルストーン') || '';
    
    phases.push({
      name: phaseName,
      period: period,
      purpose: purpose,
      tasks: tasks,
      deliverables: deliverables,
      milestone: milestone
    });
  }
  
  return phases.length > 0 ? phases : null;
}

function extractPhaseTasks(text) {
  const taskRegex = /- (.+?)\n\s*詳細[：:](.+?)\n\s*期限[：:](.+?)(?=\n-|\n#|$)/gi;
  const tasks = [];
  let match;
  
  while ((match = taskRegex.exec(text)) !== null) {
    tasks.push({
      name: match[1].trim(),
      detail: match[2].trim(),
      deadline: match[3].trim()
    });
  }
  
  return tasks.length > 0 ? tasks : null;
}

function extractPhaseDeliverables(text) {
  const deliverableRegex = /[📄📊🔧📈🚀]\s*(.+?)(?=\n|$)/g;
  const deliverables = [];
  let match;
  
  while ((match = deliverableRegex.exec(text)) !== null) {
    const fullMatch = match[0].trim();
    if (fullMatch) deliverables.push(fullMatch);
  }
  
  return deliverables.length > 0 ? deliverables : null;
}

// Helper functions for extracting information from company info text
function extractCompanyName(text) {
  // Try to extract company name from various patterns
  const patterns = [
    /会社名[：:]\s*(.+?)[\n\r]/,
    /企業名[：:]\s*(.+?)[\n\r]/,
    /(.+?)株式会社/,
    /株式会社(.+)/,
    /(.+?)会社/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

function extractEmployeeCount(text) {
  // Try to extract employee count from various patterns
  const patterns = [
    /従業員数?[：:]\s*(\d+[人名]?)/,
    /社員数[：:]\s*(\d+[人名]?)/,
    /(\d+)人/,
    /従業員規模[：:]\s*(.+?)[\n\r]/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

function generateMockAnalysis(analysisData) {
  const { companyInfo, challenges, selections } = analysisData;
  const { selectedIndustries, selectedItems, workingHours } = selections || {};
  const totalHours = selectedItems?.reduce((total, item) => total + (item.workingHours || 0), 0) || workingHours || 0;
  
  return {
    // Tab1: 課題整理
    challengeAnalysis: {
      // 現状分析
      companyName: (companyInfo?.rawText ? extractCompanyName(companyInfo.rawText) : null) || '情報不足により特定不可',
      industryName: selectedIndustries?.join(', ') || '情報不足により特定不可',
      employeeCount: (companyInfo?.rawText ? extractEmployeeCount(companyInfo.rawText) : null) || '情報不足により特定不可',
      
      // 課題マッピング
      challengeMapping: [
        { 
          area: '営業プロセス', 
          current: '手動での顧客管理と提案書作成', 
          ideal: 'CRMを活用した自動化と効率化', 
          gap: 'システム化により50%の工数削減が可能' 
        },
        { 
          area: 'データ管理', 
          current: 'Excel分散管理による非効率', 
          ideal: '統合データベースによる一元管理', 
          gap: 'データ品質向上と分析基盤の構築が必要' 
        },
        { 
          area: '組織連携', 
          current: '部門間の情報共有が限定的', 
          ideal: '横断的なコラボレーション体制', 
          gap: 'コミュニケーションツールと仕組みの整備' 
        }
      ],
      
      // 課題の深掘り
      surfaceChallenges: '業務時間の増加、ミスの発生、顧客対応の遅延が目立つようになってきている',
      rootChallenges: 'デジタル化の遅れと組織間連携の不足が根本的な原因となっており、データ活用できる体制が整っていない',
      impactRisks: {
        shortTerm: '作業時間の更なる増加により残業時間が増え、従業員満足度が低下',
        mediumTerm: '競合他社との差が拡大し、新規顧客獲得が困難になる可能性',
        longTerm: '事業成長の停滞と優秀な人材の流出により、長期的な競争力を失う'
      }
    },
    
    // Tab2: プロジェクト設計
    projectDesign: {
      // プロジェクト概要
      mission: `${selectedIndustries?.join(', ') || '対象'}業界における競争優位性を構築するため、デジタル変革による業務効率化と組織力強化を実現する`,
      scopeIncluded: [
        '選択された業務領域の詳細分析と最適化',
        'データ活用基盤の設計と導入支援',
        '組織体制改善と運用ルールの策定'
      ],
      scopeExcluded: [
        'システム開発・カスタマイズ作業',
        '人事制度や給与体系の変更'
      ],
      
      // フェーズ設計
      phases: [
        {
          name: '現状分析・戦略設計',
          period: '4-6週間',
          purpose: '現状の業務プロセスを詳細分析し、改善戦略を設計する',
          tasks: [
            { 
              name: '現状業務フローの詳細分析', 
              detail: '各部門へのヒアリングと業務観察による現状把握', 
              deadline: '2週間' 
            },
            { 
              name: 'データ収集・分析', 
              detail: '既存データの整理と活用可能性の評価', 
              deadline: '2週間' 
            },
            { 
              name: '改善戦略の策定', 
              detail: '課題解決のための具体的なアクションプランの設計', 
              deadline: '2週間' 
            }
          ],
          deliverables: ['📄 現状分析レポート', '📊 改善戦略書', '🔧 実行計画書'],
          milestone: '改善戦略の承認と次フェーズへの移行決定'
        },
        {
          name: '実装・改善実行',
          period: '8-10週間',
          purpose: '策定した改善策を段階的に実行し、効果を検証する',
          tasks: [
            { 
              name: 'パイロット実装', 
              detail: '重要度の高い1-2領域での試行実装とテスト', 
              deadline: '4週間' 
            },
            { 
              name: '効果測定・調整', 
              detail: 'KPI測定と改善策の微調整、本格展開準備', 
              deadline: '4週間' 
            }
          ],
          deliverables: ['📈 効果測定レポート', '🚀 本格展開計画'],
          milestone: '目標KPI達成と全社展開の準備完了'
        }
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