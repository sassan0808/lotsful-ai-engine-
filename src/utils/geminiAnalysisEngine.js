export const analyzeWithGemini = async (analysisData) => {
  console.log('analyzeWithGemini called with:', analysisData);
  
  try {
    const requestBody = {
      companyInfo: analysisData.companyInfo,
      challenges: analysisData.challenges,
      selectedIndustries: analysisData.selections.selectedIndustries,
      selectedItems: analysisData.selections.selectedItems,
      workingHours: analysisData.selections.workingHours
    };
    
    console.log('Sending request to /api/analyze with:', requestBody);
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Analysis request failed: ${response.status} ${response.statusText}`);
    }

    const results = await response.json();
    console.log('API response received:', results);
    return results;
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    
    // Return mock data as fallback
    return generateMockAnalysis(analysisData);
  }
};

const generateMockAnalysis = (analysisData) => {
  const { companyInfo, challenges, selections } = analysisData;
  const { selectedIndustries, selectedItems, workingHours } = selections;
  
  return {
    // Tab1: 課題整理
    challengeAnalysis: {
      // 現状分析
      companyName: '情報不足により特定不可',
      industryName: selectedIndustries?.join(', ') || '情報不足により特定不可',
      employeeCount: '情報不足により特定不可',
      
      // 課題マッピング
      challengeMapping: [
        { 
          area: '情報不足', 
          current: '具体的な現状情報が不足', 
          ideal: '詳細なヒアリングと現状調査が必要', 
          gap: '適切な課題分析には更なる情報収集が必要' 
        }
      ],
      
      // 課題の深掘り
      surfaceChallenges: '詳細な課題情報が必要です。具体的な問題点をお教えください。',
      rootChallenges: '根本原因の特定には、より詳細な企業情報と具体的な課題内容が必要です。',
      impactRisks: {
        shortTerm: '情報不足により影響予測不可',
        mediumTerm: '情報不足により影響予測不可',
        longTerm: '情報不足により影響予測不可'
      }
    },
    
    // Tab2: プロジェクト設計
    projectDesign: {
      // プロジェクト概要
      mission: '具体的なプロジェクト目標の設定には、より詳細な企業情報と課題の明確化が必要です。',
      scopeIncluded: [
        '詳細な現状分析とヒアリング',
        '課題の具体化と優先度設定',
        '情報収集に基づく適切なスコープ策定'
      ],
      scopeExcluded: [
        '情報不足による憶測に基づく提案',
        '根拠不明な推測での計画策定'
      ],
      
      // フェーズ設計
      phases: [
        {
          name: '情報収集・課題特定',
          period: '期間未定（情報次第）',
          purpose: '適切なプロジェクト設計のために必要な情報を収集する',
          tasks: [
            { 
              name: '詳細な企業情報のヒアリング', 
              detail: '事業内容、組織構成、現状課題の詳細把握', 
              deadline: '情報提供次第' 
            },
            { 
              name: '具体的課題の特定', 
              detail: '表面的な問題から根本原因まで段階的に特定', 
              deadline: '情報提供次第' 
            }
          ],
          deliverables: ['📄 情報収集レポート', '📊 課題特定書'],
          milestone: '十分な情報に基づく適切なプロジェクト設計が可能になる段階'
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
      isMockData: true
    }
  };
};