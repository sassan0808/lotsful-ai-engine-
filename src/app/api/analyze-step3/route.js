import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';

export async function POST(request) {
  try {
    const body = await request.json();
    const { template, selectedIndustries, selectedItems, workingHours } = body;

    if (!template) {
      return NextResponse.json(
        { error: 'Template is required' },
        { status: 400 }
      );
    }

    const prompt = `
あなたは経営コンサルタントとして、企業の業務切り出し・副業/兼業人材活用の提案を行います。
以下の蓄積された情報を基に、包括的な5タブ提案書のうち、Tab1（課題整理）とTab2（プロジェクト設計）を生成してください。

【重要な制約事項】
1. 提供された情報に基づいて分析し、不明な項目は「情報不足により特定不可」と明記
2. 副業/兼業人材の制約を考慮（リモート前提、月${workingHours || 30}時間稼働）
3. 具体的で実行可能な提案を心がける
4. 推測や創作は禁止、根拠のある情報のみ使用

【蓄積テンプレート情報】
会社情報:
${JSON.stringify(template.companyProfile, null, 2)}

リサーチデータ:
${JSON.stringify(template.researchData, null, 2)}

現状分析:
${JSON.stringify(template.currentAnalysis, null, 2)}

プロジェクト設計:
${JSON.stringify(template.projectDesign, null, 2)}

【選択された業界】
${selectedIndustries?.join(', ') || '未選択'}

【選択された業務項目】
${selectedItems?.map(item => `- ${item.category} / ${item.phase}: ${item.item}`).join('\n') || '未選択'}

【分析要求】
上記の情報を基に、以下の形式でTab1とTab2の内容を生成してください。

必ず以下のJSON形式で回答してください：

{
  "challengeAnalysis": {
    "companyName": "企業名",
    "industryName": "業界",
    "employeeCount": "従業員数",
    "challengeMapping": [
      {
        "area": "領域1",
        "current": "現状の詳細",
        "ideal": "理想状態の詳細",
        "gap": "ギャップ分析"
      }
    ],
    "surfaceChallenges": "表面的に見えている課題",
    "rootChallenges": "根本的な課題",
    "impactRisks": {
      "shortTerm": "3ヶ月以内の具体的リスク",
      "mediumTerm": "6ヶ月以内の具体的リスク",
      "longTerm": "1年以内の具体的リスク"
    }
  },
  "projectDesign": {
    "mission": "プロジェクトで実現すること",
    "scopeIncluded": ["含むもの1", "含むもの2"],
    "scopeExcluded": ["含まないもの1", "含まないもの2"],
    "phases": [
      {
        "name": "フェーズ名",
        "period": "期間",
        "purpose": "このフェーズのゴール",
        "tasks": [
          {
            "name": "タスク名",
            "detail": "具体的な作業内容",
            "deadline": "期限"
          }
        ],
        "deliverables": ["成果物1", "成果物2"],
        "milestone": "達成基準"
      }
    ]
  }
}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const analysisResult = JSON.parse(jsonMatch[0]);
    
    // Add metadata
    analysisResult.metadata = {
      analysisDate: new Date().toISOString(),
      inputDataSummary: {
        selectedItemsCount: selectedItems?.length || 0,
        workingHours: workingHours || 30,
        selectedIndustries
      },
      templateVersion: template.metadata?.version || '1.0'
    };

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Error in analyze-step3:', error);
    
    // Return fallback response
    return NextResponse.json({
      challengeAnalysis: {
        companyName: template?.companyProfile?.name || '情報不足により特定不可',
        industryName: selectedIndustries?.join(', ') || '情報不足により特定不可',
        employeeCount: template?.companyProfile?.employeeCount || '情報不足により特定不可',
        challengeMapping: [
          {
            area: '情報不足',
            current: 'テンプレート情報が不完全です',
            ideal: '完全な情報に基づく分析が必要',
            gap: '追加情報の収集が必要'
          }
        ],
        surfaceChallenges: '情報不足により特定不可',
        rootChallenges: '情報不足により特定不可',
        impactRisks: {
          shortTerm: '情報不足により予測不可',
          mediumTerm: '情報不足により予測不可',
          longTerm: '情報不足により予測不可'
        }
      },
      projectDesign: {
        mission: '情報不足により特定不可',
        scopeIncluded: ['詳細情報の収集', '課題の明確化'],
        scopeExcluded: ['憶測に基づく提案'],
        phases: [
          {
            name: '情報収集フェーズ',
            period: '未定',
            purpose: '適切な分析のための情報収集',
            tasks: [
              {
                name: '追加ヒアリング',
                detail: '必要情報の収集',
                deadline: '情報提供次第'
              }
            ],
            deliverables: ['情報収集レポート'],
            milestone: '必要情報の収集完了'
          }
        ]
      },
      metadata: {
        analysisDate: new Date().toISOString(),
        inputDataSummary: {
          selectedItemsCount: selectedItems?.length || 0,
          workingHours: workingHours || 30,
          selectedIndustries
        },
        isFallback: true,
        error: error.message
      }
    });
  }
}