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
      companyName: '分析対象企業（フォールバック）',
      industryName: selectedIndustries?.join(', ') || '対象業界',
      employeeCount: '中小企業（50-200名）',
      
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
        workingHours: workingHours || 30,
        selectedIndustries
      },
      isMockData: true
    }
  };
};