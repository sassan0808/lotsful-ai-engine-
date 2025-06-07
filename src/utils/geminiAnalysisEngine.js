export const analyzeWithGemini = async (analysisData) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyInfo: analysisData.companyInfo,
        challenges: analysisData.challenges,
        selectedIndustries: analysisData.selections.selectedIndustries,
        selectedItems: analysisData.selections.selectedItems,
        workingHours: analysisData.selections.workingHours
      }),
    });

    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Analysis request failed: ${response.status} ${response.statusText}`);
    }

    const results = await response.json();
    return results;
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    
    // Return mock data as fallback
    return generateMockAnalysis(analysisData);
  }
};

const generateMockAnalysis = (analysisData) => {
  const { companyInfo, challenges, selections } = analysisData;
  
  return {
    projectDefinition: {
      projectName: "統合型デジタル変革プロジェクト",
      goalDescription: "企業のデジタル化を推進し、競争力強化と業務効率向上を実現する",
      successCriteria: "3ヶ月で基盤構築、6ヶ月で運用開始、1年で目標ROI達成",
      timeline: `${selections.workingHours}時間/月での6ヶ月プロジェクト`
    },
    integratedApproach: {
      strategicPlanning: "現状分析→戦略設計→実行計画策定の3段階アプローチ",
      execution: "優先度の高い領域から段階的実装、早期成果創出を重視",
      analysis: "データ駆動型の継続的改善サイクル確立",
      roadmap: "フェーズ1: 基盤整備、フェーズ2: 本格展開、フェーズ3: 最適化"
    },
    requiredExpertise: {
      roleDefinition: "戦略コンサルティングとデジタル実行を兼ね備えた統合型プロフェッショナル",
      experienceLevel: "5年以上の戦略コンサルティング経験＋3年以上のデジタル実装経験",
      skillSet: [
        "戦略企画・事業計画策定",
        "デジタル技術知識",
        "プロジェクトマネジメント",
        "データ分析・BI構築",
        "チェンジマネジメント"
      ]
    },
    remoteWorkPlan: {
      communicationFrequency: "週2回の定期MTG＋必要に応じたアドホック相談",
      deliverables: "週次進捗レポート、月次成果報告、フェーズ完了時の詳細分析",
      collaborationTools: "Slack/Teams + Notion/Confluence + 週次ビデオ会議"
    },
    expectedOutcome: {
      shortTerm: "現状分析完了、改善計画策定、クイックウィン施策実行",
      mediumTerm: "主要施策の実装完了、初期効果測定、改善サイクル確立",
      longTerm: "目標ROI達成、組織能力向上、持続的改善体制構築"
    },
    riskMitigation: {
      potentialChallenges: [
        "社内理解・協力の不足",
        "技術的な実装上の課題",
        "予算・リソース制約",
        "スケジュール遅延リスク"
      ],
      mitigationStrategies: [
        "経営層との密接な連携体制構築",
        "段階的実装による リスク分散",
        "外部パートナー活用による リソース補完",
        "定期的な進捗確認と計画調整"
      ]
    },
    metadata: {
      analysisDate: new Date().toISOString(),
      inputDataSummary: {
        selectedItemsCount: selections.selectedItems.length,
        workingHours: selections.workingHours,
        selectedIndustries: selections.selectedIndustries
      },
      isMockData: true
    }
  };
};