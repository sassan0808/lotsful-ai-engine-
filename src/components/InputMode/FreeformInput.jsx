"use client";

import React, { useState } from 'react';
import { MessageSquare, Loader2, Send, Lightbulb } from 'lucide-react';
import { analyzeCompanyInput } from '../../utils/analysisEngine';

const FreeformInput = ({ onAnalyze, isAnalyzing, setIsAnalyzing }) => {
  const [freeformText, setFreeformText] = useState('');

  const examplePrompts = [
    '新規ECサイトを立ち上げたいが、エンジニアとマーケティングの知識が不足している',
    'DXを推進したいが、社内にIT人材がおらず、何から始めればいいかわからない',
    'AIを活用した新サービスを開発したいが、機械学習エンジニアが見つからない',
    'グローバル展開を考えているが、海外マーケティングの経験者が社内にいない'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!freeformText.trim()) return;

    setIsAnalyzing(true);

    // Simulate API call delay
    setTimeout(() => {
      // Parse freeform text into structured data
      const parsedData = parseFreeformText(freeformText);
      const results = analyzeCompanyInput(parsedData);
      onAnalyze(results);
      setIsAnalyzing(false);
    }, 2000);
  };

  const parseFreeformText = (text) => {
    // Simple parsing logic - in production, this would use NLP
    const lowerText = text.toLowerCase();
    
    // Detect industry
    let industry = 'その他';
    if (lowerText.includes('it') || lowerText.includes('テック') || lowerText.includes('ソフトウェア')) {
      industry = 'IT・テクノロジー';
    } else if (lowerText.includes('製造') || lowerText.includes('メーカー')) {
      industry = '製造業';
    } else if (lowerText.includes('小売') || lowerText.includes('ec') || lowerText.includes('通販')) {
      industry = '小売・流通';
    } else if (lowerText.includes('金融') || lowerText.includes('銀行') || lowerText.includes('保険')) {
      industry = '金融・保険';
    } else if (lowerText.includes('医療') || lowerText.includes('ヘルスケア')) {
      industry = 'ヘルスケア・医療';
    }

    // Detect timeline
    let timeline = 'medium';
    if (lowerText.includes('至急') || lowerText.includes('すぐ') || lowerText.includes('急')) {
      timeline = 'urgent';
    } else if (lowerText.includes('長期') || lowerText.includes('じっくり')) {
      timeline = 'long';
    }

    // Detect budget
    let budget = 'medium';
    if (lowerText.includes('予算が限られ') || lowerText.includes('低予算')) {
      budget = 'low';
    } else if (lowerText.includes('予算は潤沢') || lowerText.includes('投資可能')) {
      budget = 'high';
    }

    return {
      basicInfo: {
        companyName: '入力企業',
        industry: industry,
        employeeCount: '11-50',
        revenue: '100m-1b'
      },
      currentSituation: {
        challenges: text,
        painPoints: text,
        goals: extractGoals(text),
        timeline: timeline,
        budget: budget
      },
      resources: {
        currentTeam: '既存チームあり',
        skills: '基本的なビジネススキル',
        tools: '一般的なビジネスツール'
      }
    };
  };

  const extractGoals = (text) => {
    const lowerText = text.toLowerCase();
    const goals = [];
    
    if (lowerText.includes('立ち上げ') || lowerText.includes('新規')) {
      goals.push('新規事業・サービスの立ち上げ');
    }
    if (lowerText.includes('改善') || lowerText.includes('効率')) {
      goals.push('業務効率化・改善');
    }
    if (lowerText.includes('売上') || lowerText.includes('成長')) {
      goals.push('売上・事業成長');
    }
    if (lowerText.includes('dx') || lowerText.includes('デジタル')) {
      goals.push('デジタル化・DX推進');
    }
    
    return goals.join('、') || 'ビジネス課題の解決';
  };

  const handleExampleClick = (example) => {
    setFreeformText(example);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 mb-2">記入例</p>
            <div className="space-y-2">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(prompt)}
                  className="text-left text-sm text-blue-700 hover:text-blue-900 hover:underline block"
                >
                  • {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="inline h-4 w-4 mr-1" />
            課題や要望を自由に記述してください
          </label>
          <textarea
            value={freeformText}
            onChange={(e) => setFreeformText(e.target.value)}
            rows="8"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="例：弊社は製造業で従業員50名程度の会社です。最近、IoTを活用した新しい製品ラインを立ち上げたいと考えていますが、社内にIoTの専門知識を持つエンジニアがいません。また、データ分析を行って製品改善につなげたいのですが、データサイエンティストも不在です。3ヶ月以内にプロトタイプを作成し、6ヶ月以内に本格的な開発を開始したいと考えています。予算は月50万円程度を想定しています。"
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            ※ 会社の規模、業界、具体的な課題、希望する期間、予算感などを含めると、より精度の高い分析が可能です
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isAnalyzing || !freeformText.trim()}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>分析中...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>AI分析を開始</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FreeformInput;