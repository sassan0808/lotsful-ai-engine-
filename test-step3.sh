#!/bin/bash

# Step3 API テスト用スクリプト

echo "Testing Step3 API..."

curl -X POST http://localhost:3000/api/analyze-step3 \
  -H "Content-Type: application/json" \
  -d '{
    "template": {
      "companyProfile": {
        "name": "株式会社テスト企業",
        "industry": ["IT・ソフトウェア"],
        "employeeCount": "100-500人",
        "businessDescription": "クラウドサービスの開発・提供"
      },
      "researchData": {
        "deepResearchMemo": "成長期のIT企業。営業体制の強化が課題",
        "recentNews": "新サービスのリリースを計画中"
      },
      "currentAnalysis": {
        "businessPhase": "成長期",
        "challengeCategories": ["営業強化", "組織拡大"],
        "missingSkills": ["法人営業", "マーケティング戦略"]
      },
      "projectDesign": {
        "challengeSummary": "営業体制の構築と売上拡大",
        "idealState3Months": "営業プロセスの確立"
      },
      "metadata": {
        "step1Completed": true,
        "step2Completed": true
      }
    },
    "selectedIndustries": ["IT・ソフトウェア"],
    "selectedItems": [
      {
        "category": "セールス",
        "phase": "戦略立案",
        "item": "営業戦略策定"
      },
      {
        "category": "セールス", 
        "phase": "実行/運用",
        "item": "法人営業支援"
      }
    ],
    "workingHours": 40
  }' | jq '.'