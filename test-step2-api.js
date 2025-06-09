#!/usr/bin/env node

// Step2 API の動作テスト用スクリプト
const testPayload = {
  "template": {
    "companyProfile": {
      "name": "テスト株式会社",
      "industry": ["IT", "SaaS"],
      "employeeCount": "1-10",
      "businessDescription": "クラウドサービス開発"
    },
    "researchData": {
      "deepResearchMemo": "成長段階のスタートアップ",
      "recentNews": "シリーズA調達完了",
      "organizationCulture": "アジャイル開発",
      "hypothesisInsights": "スケール課題",
      "meetingCheckpoints": []
    },
    "currentAnalysis": {
      "businessPhase": "growth",
      "previousEfforts": "マーケティング強化",
      "failureReasons": "リソース不足",
      "missingSkills": ["データ分析", "マーケティング"],
      "externalTalentExperience": "none"
    },
    "projectDesign": {
      "challengeSummary": "マーケティング最適化",
      "urgencyReason": "競合対策",
      "idealState3Months": "売上20%向上",
      "deliverables": ["戦略書", "実行計画"],
      "workingHours": "standard_20h",
      "budget": {
        "monthlyBudget": 50,
        "duration": 3,
        "totalBudget": 150
      }
    }
  },
  "focusAreas": ["currentAnalysis", "projectDesign"],
  "freeText": "商談議事録：現在の最大の課題はマーケティングの効果測定ができていないこと。3ヶ月以内にデータドリブンなマーケティング体制を構築したい。"
};

console.log('🧪 Step2 API テスト開始');
console.log('📝 テストペイロード:');
console.log(JSON.stringify(testPayload, null, 2));

fetch('http://localhost:3000/api/analyze-step2', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload)
})
.then(response => {
  console.log(`\n📊 レスポンス ステータス: ${response.status}`);
  
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`HTTP Error: ${response.status}`);
  }
})
.then(data => {
  console.log('✅ API コール成功');
  console.log('📋 レスポンスデータ:');
  console.log(JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('❌ API コール失敗:', error.message);
  console.error('💡 確認事項:');
  console.error('  - Next.jsサーバーが起動しているか (npm run dev)');
  console.error('  - GEMINI_API_KEY が正しく設定されているか (.env.local)');
});