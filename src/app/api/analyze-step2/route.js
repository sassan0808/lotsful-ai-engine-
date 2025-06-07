import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { template, focusAreas } = await request.json();
    
    // 必須フィールドの検証
    if (!template) {
      return NextResponse.json(
        { error: 'テンプレートデータが必要です' },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using mock data');
      return NextResponse.json(generateMockStep2Analysis(template));
    }

    // Step2専用のプロンプトを作成
    const prompt = createStep2AnalysisPrompt(template, focusAreas);
    
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

    // AI応答を解析してテンプレート形式に変換
    const analysisResult = parseStep2Response(generatedText, template);
    
    return NextResponse.json(analysisResult);
    
  } catch (error) {
    console.error('Step2 Analysis API error:', error);
    
    // エラー時はモックデータを返す
    try {
      const { template } = await request.json();
      return NextResponse.json(generateMockStep2Analysis(template));
    } catch (parseError) {
      console.error('Failed to parse request JSON for fallback:', parseError);
      return NextResponse.json({ error: 'Analysis failed and unable to generate fallback data' }, { status: 500 });
    }
  }
}

function createStep2AnalysisPrompt(template, focusAreas = ['currentAnalysis', 'projectDesign']) {
  const companyInfo = `
企業名: ${template.companyProfile.name || '情報不足により特定不可'}
業界: ${template.companyProfile.industry.join(', ') || '情報不足により特定不可'}
従業員数: ${template.companyProfile.employeeCount || '情報不足により特定不可'}
事業内容: ${template.companyProfile.businessDescription || '情報不足により特定不可'}
`;

  const researchInfo = `
ディープリサーチ: ${template.researchData.deepResearchMemo || '情報なし'}
最近の動き: ${template.researchData.recentNews || '情報なし'}
組織特徴: ${template.researchData.organizationCulture || '情報なし'}
仮説・洞察: ${template.researchData.hypothesisInsights || '情報なし'}
`;

  const currentInfo = `
事業フェーズ: ${template.currentAnalysis.businessPhase || '情報なし'}
これまでの取り組み: ${template.currentAnalysis.previousEfforts || '情報なし'}
失敗理由: ${template.currentAnalysis.failureReasons || '情報なし'}
不足スキル: ${template.currentAnalysis.missingSkills.join(', ') || '情報なし'}
外部人材経験: ${template.currentAnalysis.externalTalentExperience || '情報なし'}
`;

  const projectInfo = `
課題要約: ${template.projectDesign.challengeSummary || '情報なし'}
緊急性理由: ${template.projectDesign.urgencyReason || '情報なし'}
理想状態: ${template.projectDesign.idealState3Months || '情報なし'}
期待成果物: ${template.projectDesign.deliverables.join(', ') || '情報なし'}
稼働イメージ: ${template.projectDesign.workingHours || '情報なし'}
`;

  return `
企業の現状分析とプロジェクト設計の補完・深掘り分析を行ってください。

## 企業基本情報
${companyInfo}

## 事前リサーチ情報
${researchInfo}

## 現状分析（既存情報）
${currentInfo}

## プロジェクト設計（既存情報）
${projectInfo}

## 分析指示
以下の形式で、不足している情報の補完と深掘り分析を行ってください。
既に入力されている情報は活かしつつ、不足部分を補ってください。

### 現状分析補完
事業フェーズ分析：[企業の現在の成長段階と特徴を分析]
課題カテゴリー：[主要な課題領域をカンマ区切りで]
チーム構成分析：[推定される組織体制と課題]
不足機能分析：[特定された不足スキル・機能の詳細分析]
副業受け入れ体制：[組織の外部人材受け入れ準備状況]
意思決定プロセス：[推定される意思決定の流れ]

### プロジェクト設計補完
課題の背景分析：[なぜこの課題が発生しているかの構造分析]
放置リスク分析：[課題を放置した場合の具体的リスク]
成功指標提案：[定量・定性の成功測定指標]
スコープ提案：[含むべき内容と除外すべき内容]
フェーズ分け提案：[第1フェーズと第2フェーズの具体的内容]
予算妥当性：[稼働時間と予算の妥当性評価]

【重要な指示】
- 提供された情報から明確に判断できない項目については、推測や創作をせず「詳細な情報収集が必要」と記載してください
- 既存の入力情報は尊重し、それをベースに補完・深掘りしてください
- 現実的で実行可能な提案を心がけてください
- 副業/兼業人材の制約（リモート中心、月10-80時間）を考慮してください
`;
}

function parseStep2Response(text, originalTemplate) {
  return {
    currentAnalysis: {
      businessPhase: originalTemplate.currentAnalysis.businessPhase || extractBusinessPhase(text),
      challengeCategories: extractChallengeCategories(text),
      previousEfforts: originalTemplate.currentAnalysis.previousEfforts || extractSection(text, 'これまでの取り組み'),
      failureReasons: originalTemplate.currentAnalysis.failureReasons || extractSection(text, 'うまくいかなかった理由'),
      teamComposition: extractTeamComposition(text),
      missingSkills: originalTemplate.currentAnalysis.missingSkills.length > 0 
        ? originalTemplate.currentAnalysis.missingSkills 
        : extractMissingSkills(text),
      externalTalentExperience: originalTemplate.currentAnalysis.externalTalentExperience || '',
      externalTalentResult: '',
      freelanceReadiness: extractFreelanceReadiness(text),
      freelanceReadinessDetails: extractSection(text, '副業受け入れ体制') || '詳細な情報収集が必要',
      competitorServices: [],
      decisionProcess: extractDecisionProcess(text),
      decisionTimeline: '',
      barriers: []
    },
    projectDesign: {
      challengeSummary: originalTemplate.projectDesign.challengeSummary || extractSection(text, '課題の背景分析'),
      urgencyReason: originalTemplate.projectDesign.urgencyReason || extractSection(text, '緊急性理由'),
      risksIfIgnored: extractSection(text, '放置リスク分析') || '詳細な情報収集が必要',
      idealState3Months: originalTemplate.projectDesign.idealState3Months || '詳細な情報収集が必要',
      successMetrics: extractSuccessMetrics(text),
      deliverables: originalTemplate.projectDesign.deliverables.length > 0 
        ? originalTemplate.projectDesign.deliverables 
        : extractDeliverables(text),
      scope: extractProjectScope(text),
      phases: extractProjectPhases(text),
      workingHours: originalTemplate.projectDesign.workingHours || '',
      budget: originalTemplate.projectDesign.budget
    },
    metadata: {
      step2Completed: true,
      analysisTimestamp: new Date().toISOString(),
      focusAreas: ['currentAnalysis', 'projectDesign']
    }
  };
}

function extractBusinessPhase(text) {
  const phaseText = extractSection(text, '事業フェーズ分析');
  if (!phaseText) return '';
  
  if (phaseText.includes('立ち上げ') || phaseText.includes('0→1')) return 'startup';
  if (phaseText.includes('成長') || phaseText.includes('1→10')) return 'growth';
  if (phaseText.includes('拡大') || phaseText.includes('10→100')) return 'expansion';
  if (phaseText.includes('成熟')) return 'mature';
  
  return '';
}

function extractChallengeCategories(text) {
  const categoryText = extractSection(text, '課題カテゴリー');
  if (!categoryText || categoryText.includes('詳細な情報')) {
    return [];
  }
  return categoryText.split(/[,、]/).map(cat => cat.trim()).filter(cat => cat);
}

function extractTeamComposition(text) {
  const teamText = extractSection(text, 'チーム構成分析');
  if (!teamText || teamText.includes('詳細な情報')) {
    return [];
  }
  
  return [{
    department: '推定部門',
    headcount: 0,
    mainRole: teamText
  }];
}

function extractMissingSkills(text) {
  const skillsText = extractSection(text, '不足機能分析');
  if (!skillsText || skillsText.includes('詳細な情報')) {
    return [];
  }
  return skillsText.split(/[,、]/).map(skill => skill.trim()).filter(skill => skill);
}

function extractFreelanceReadiness(text) {
  const readinessText = extractSection(text, '副業受け入れ体制');
  if (!readinessText) return '';
  
  if (readinessText.includes('整備済み') || readinessText.includes('準備済み')) return 'ready';
  if (readinessText.includes('一部') || readinessText.includes('部分的')) return 'partial';
  if (readinessText.includes('未整備') || readinessText.includes('準備不足')) return 'not_ready';
  
  return '';
}

function extractDecisionProcess(text) {
  const processText = extractSection(text, '意思決定プロセス');
  if (!processText) return '';
  
  if (processText.includes('即決') || processText.includes('すぐ')) return 'immediate';
  if (processText.includes('上長') || processText.includes('マネージャー')) return 'manager_approval';
  if (processText.includes('稟議')) return 'ringi';
  if (processText.includes('役員') || processText.includes('経営陣')) return 'executive';
  
  return '';
}

function extractSuccessMetrics(text) {
  const metricsText = extractSection(text, '成功指標提案');
  if (!metricsText || metricsText.includes('詳細な情報')) {
    return {
      quantitative: [],
      qualitative: []
    };
  }
  
  return {
    quantitative: ['定量指標の特定には詳細な情報収集が必要'],
    qualitative: ['定性指標の特定には詳細な情報収集が必要']
  };
}

function extractDeliverables(text) {
  const deliverablesText = extractSection(text, 'スコープ提案');
  if (!deliverablesText || deliverablesText.includes('詳細な情報')) {
    return ['詳細な成果物定義には追加情報が必要'];
  }
  
  return [deliverablesText];
}

function extractProjectScope(text) {
  return {
    included: ['詳細なスコープ定義には追加情報が必要'],
    excluded: ['対象外項目の特定には詳細な情報収集が必要']
  };
}

function extractProjectPhases(text) {
  const phasesText = extractSection(text, 'フェーズ分け提案');
  if (!phasesText || phasesText.includes('詳細な情報')) {
    return [{
      name: '情報収集・詳細設計',
      period: '期間未定',
      goal: '詳細な要件定義とプロジェクト設計',
      mainActivities: ['詳細なヒアリング', '要件整理', '実行計画策定']
    }];
  }
  
  return [{
    name: '第1フェーズ',
    period: '4-6週間',
    goal: phasesText,
    mainActivities: ['詳細分析', '戦略策定', '実行準備']
  }];
}

function extractSection(text, sectionName) {
  const regex = new RegExp(`${sectionName}[：:]\\s*([\\s\\S]*?)(?=\\n\\n|\\n###|$)`, 'i');
  const match = text.match(regex);
  if (match) {
    return match[1].trim();
  }
  return null;
}

function generateMockStep2Analysis(template) {
  return {
    currentAnalysis: {
      businessPhase: template.currentAnalysis.businessPhase || 'growth',
      challengeCategories: template.currentAnalysis.challengeCategories.length > 0 
        ? template.currentAnalysis.challengeCategories 
        : ['組織スケール', 'プロセス効率化', 'データ活用'],
      previousEfforts: template.currentAnalysis.previousEfforts || '詳細な情報収集が必要です',
      failureReasons: template.currentAnalysis.failureReasons || '根本原因の特定には追加ヒアリングが必要',
      teamComposition: [{
        department: '推定営業部',
        headcount: 5,
        mainRole: '新規開拓と既存顧客対応'
      }],
      missingSkills: template.currentAnalysis.missingSkills.length > 0 
        ? template.currentAnalysis.missingSkills 
        : ['データ分析スキル', 'マーケティング自動化', 'プロジェクト管理'],
      externalTalentExperience: template.currentAnalysis.externalTalentExperience || 'none',
      externalTalentResult: '詳細な経験内容の確認が必要',
      freelanceReadiness: 'partial',
      freelanceReadinessDetails: '基本的な受け入れ体制は整っているが、運用ルールの明文化が必要',
      competitorServices: [],
      decisionProcess: 'manager_approval',
      decisionTimeline: '1-2ヶ月',
      barriers: ['予算調整', '社内理解促進']
    },
    projectDesign: {
      challengeSummary: template.projectDesign.challengeSummary || '事業成長に伴う組織スケールとプロセス最適化の課題',
      urgencyReason: template.projectDesign.urgencyReason || '競合他社との差別化と市場シェア確保のため',
      risksIfIgnored: '機会損失の拡大、組織効率の低下、競争力の減退',
      idealState3Months: template.projectDesign.idealState3Months || 'データ活用による意思決定の高速化と業務プロセスの標準化',
      successMetrics: {
        quantitative: ['業務効率20%向上', 'リードタイム30%短縮'],
        qualitative: ['チーム連携の円滑化', '意思決定スピードの向上']
      },
      deliverables: template.projectDesign.deliverables.length > 0 
        ? template.projectDesign.deliverables 
        : ['現状分析レポート', '改善提案書', '実行ロードマップ'],
      scope: {
        included: ['業務プロセス分析', 'ツール導入支援', '運用ルール策定'],
        excluded: ['システム開発', '人事制度変更', '組織改編']
      },
      phases: [{
        name: '現状分析・戦略策定',
        period: '4-6週間',
        goal: '詳細な現状分析と改善戦略の策定',
        mainActivities: ['業務フロー分析', 'ボトルネック特定', '改善案策定']
      }],
      workingHours: template.projectDesign.workingHours || 'standard_20h',
      budget: template.projectDesign.budget.monthlyBudget > 0 
        ? template.projectDesign.budget 
        : { monthlyBudget: 50, duration: 3, totalBudget: 150 }
    },
    metadata: {
      step2Completed: true,
      analysisTimestamp: new Date().toISOString(),
      isMockData: true,
      focusAreas: ['currentAnalysis', 'projectDesign']
    }
  };
}