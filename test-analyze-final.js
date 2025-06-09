// analyze-final API テストスクリプト
const testAnalyzeFinal = async () => {
  console.log('🧪 analyze-final API テスト開始');
  
  const testTemplate = {
    companyProfile: {
      name: "パーソルイノベーション株式会社",
      industry: ["人材", "テクノロジー"],
      employeeCount: "1000-5000",
      businessDescription: "人材関連サービス"
    },
    researchData: {
      deepResearchMemo: "転職・人材紹介サービス大手",
      organizationCulture: "データドリブン",
      recentNews: "AI人材マッチング強化",
      hypothesisInsights: "デジタル化推進"
    },
    currentAnalysis: {
      businessPhase: "expansion",
      challengeCategories: ["効率化", "データ活用"],
      previousEfforts: "システム導入",
      failureReasons: "運用体制不備",
      missingSkills: ["データ分析", "AI開発"]
    },
    projectDesign: {
      challengeSummary: "データ活用による効率化",
      urgencyReason: "競合優位性確保",
      idealState3Months: "データドリブンマッチング実現",
      deliverables: ["データ分析基盤", "マッチングアルゴリズム"]
    },
    metadata: {
      selectedBusinessItems: [
        { category: "データ活用", phase: "分析", item: "データ分析基盤構築" },
        { category: "AI/ML", phase: "開発", item: "マッチングアルゴリズム開発" }
      ],
      actualWorkingHours: 30,
      talentCount: 1
    }
  };

  const payload = {
    template: testTemplate,
    selectedItems: testTemplate.metadata.selectedBusinessItems,
    workingHours: 30,
    talentCount: 1,
    selectedIndustries: ["人材"]
  };

  console.log('📝 テストペイロード:');
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await fetch('http://localhost:3000/api/analyze-final', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ API レスポンス成功');
    console.log('📊 分析結果:');
    console.log('Tab1:', result.tab1?.content?.substring(0, 200) + '...');
    console.log('Tab2:', result.tab2?.content?.substring(0, 200) + '...');
    console.log('Tab3:', result.tab3?.content?.substring(0, 200) + '...');
    
    // 企業名が正しく取得できているかチェック
    if (result.tab1?.content?.includes('パーソルイノベーション株式会社')) {
      console.log('✅ 企業名が正しく表示されています');
    } else if (result.tab1?.content?.includes('情報不足により特定不可')) {
      console.log('❌ 企業名が「情報不足により特定不可」になっています');
    } else {
      console.log('⚠️ 企業名の表示状況が不明です');
    }

  } catch (error) {
    console.error('❌ API コール失敗:', error.message);
    console.log('💡 確認事項:');
    console.log('  - Next.jsサーバーが起動しているか (npm run dev)');
    console.log('  - GEMINI_API_KEY が正しく設定されているか (.env.local)');
  }
};

// Node.js環境での実行
if (typeof fetch === 'undefined') {
  // Node.js 18未満の場合はnode-fetchを使用
  const { default: fetch } = require('node-fetch');
  global.fetch = fetch;
}

testAnalyzeFinal();