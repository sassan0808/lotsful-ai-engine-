"use client";

import React, { useState } from 'react';
import { Building2, FileText, Sparkles, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const CompanyInfoInput = ({ companyInfo, onCompanyInfoChange }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState(null);

  const handleTextChange = (value) => {
    onCompanyInfoChange({
      rawText: value,
      extracted: extractedInfo
    });
  };

  const handleAIExtraction = async () => {
    if (!companyInfo.rawText.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyInfo: companyInfo.rawText
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const extracted = await response.json();
      setExtractedInfo(extracted);
      onCompanyInfoChange({
        rawText: companyInfo.rawText,
        extracted: extracted
      });
    } catch (error) {
      console.error('Company analysis error:', error);
      // Fallback to mock analysis
      const extracted = extractCompanyInfo(companyInfo.rawText);
      setExtractedInfo(extracted);
      onCompanyInfoChange({
        rawText: companyInfo.rawText,
        extracted: extracted
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 簡易的な企業情報抽出（実際にはGemini APIで処理）
  const extractCompanyInfo = (text) => {
    const lowerText = text.toLowerCase();
    
    // 企業名抽出
    let companyName = '';
    const companyPatterns = [
      /株式会社([^\s\n。、]+)/,
      /([^\s\n。、]+)株式会社/,
      /合同会社([^\s\n。、]+)/,
      /([^\s\n。、]+)合同会社/
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match) {
        companyName = match[0];
        break;
      }
    }

    // 業界判定
    const industries = [];
    const industryKeywords = {
      'IT・テクノロジー': ['it', 'テック', 'ソフトウェア', 'システム', 'ai', 'dx'],
      'EC': ['ec', 'eコマース', 'オンライン', '通販', 'ネットショップ'],
      'D2C': ['d2c', 'direct', 'ダイレクト', '直販'],
      'SaaS': ['saas', 'クラウド', 'サービス'],
      '製造業': ['製造', 'メーカー', '工場', '生産'],
      '小売': ['小売', '店舗', 'リテール'],
      '金融': ['金融', '銀行', '証券', '保険'],
      'ヘルスケア': ['医療', 'ヘルスケア', '健康', '病院'],
      '教育': ['教育', '学習', 'スクール', '研修'],
      '人材': ['人材', '採用', 'hr', '人事'],
      'マーケティング': ['マーケティング', '広告', 'pr', '宣伝']
    };

    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        industries.push(industry);
      }
    });

    // 規模判定
    let size = '規模不明';
    if (lowerText.includes('従業員') || lowerText.includes('社員')) {
      if (lowerText.match(/\d+名/) || lowerText.match(/\d+人/)) {
        const numberMatch = text.match(/(\d+)(?:名|人)/);
        if (numberMatch) {
          const count = parseInt(numberMatch[1]);
          if (count <= 10) size = '1-10名';
          else if (count <= 50) size = '11-50名';
          else if (count <= 100) size = '51-100名';
          else if (count <= 500) size = '101-500名';
          else size = '501名以上';
        }
      }
    }

    // 事業内容抽出
    let mainBusiness = '';
    const businessPatterns = [
      /事業内容[：:]\s*([^\n。]+)/,
      /主な事業[：:]\s*([^\n。]+)/,
      /サービス[：:]\s*([^\n。]+)/
    ];
    
    for (const pattern of businessPatterns) {
      const match = text.match(pattern);
      if (match) {
        mainBusiness = match[1].trim();
        break;
      }
    }

    // 最近の動向抽出
    const recentTrends = [];
    const trendKeywords = [
      'dx', 'デジタル化', '新規事業', '海外展開', 'ipo', '資金調達',
      '成長', '拡大', '強化', '改善', '導入', '開始'
    ];
    
    trendKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        recentTrends.push(keyword);
      }
    });

    return {
      companyName: companyName || '企業名不明',
      industry: industries.length > 0 ? industries : ['その他'],
      size: size,
      mainBusiness: mainBusiness || '事業内容の詳細が必要',
      recentTrends: recentTrends
    };
  };

  const sampleTexts = [
    `株式会社テックイノベーション
IT・テクノロジー企業
従業員数: 50名
主な事業: SaaS型クラウドサービスの開発・運営
最近の動向: AI技術を活用した新サービスの開発を進めており、海外展開も検討中。DX推進により業務効率化を図っている。`,
    
    `グロースマーケティング合同会社
デジタルマーケティング支援企業
従業員数: 25名
事業内容: D2C企業向けのマーケティング支援、EC事業のグロースハッキング
近況: 急成長中のスタートアップで、資金調達を完了。チーム拡大を進めている。`,
    
    `ヘルステック・ジャパン株式会社
ヘルスケアテクノロジー企業
従業員: 80名
サービス: 医療データ分析プラットフォーム、オンライン診療システム
現状: 病院・クリニックへの導入が加速。規制対応と技術開発を並行して進行中。`
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Building2 className="h-8 w-8 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">企業基本情報</h2>
        </div>
        <p className="text-gray-600">
          商談前に収集した企業情報を入力してください。AIが自動で重要な情報を抽出します。
        </p>
      </div>

      {/* サンプルテキスト */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 mb-2">入力例</p>
            <div className="space-y-2">
              {sampleTexts.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => handleTextChange(sample)}
                  className="text-left text-xs text-blue-700 hover:text-blue-900 hover:underline block w-full p-2 bg-white rounded border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  {sample.split('\n')[0]}...
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* メインテキストエリア */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          企業情報
        </label>
        <textarea
          value={companyInfo.rawText}
          onChange={(e) => handleTextChange(e.target.value)}
          rows="12"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
          placeholder="企業情報を貼り付けてください...

例：
• 企業HP、IR資料、プレスリリースの内容
• ディープリサーチで収集した情報
• 業界レポートの該当企業部分
• LinkedInやWantedlyの企業情報
• ニュース記事や業界情報

含めると良い情報：
- 企業名、業界、従業員数
- 主な事業内容・サービス
- 最近の動向・ニュース
- 成長段階・資金調達状況
- 技術スタック・使用ツール"
        />
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            文字数: {companyInfo.rawText.length}
          </div>
          
          {companyInfo.rawText.trim() && (
            <button
              onClick={handleAIExtraction}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Sparkles className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'AI分析中...' : 'AI分析実行'}</span>
            </button>
          )}
        </div>
      </div>

      {/* AI抽出結果 */}
      {extractedInfo && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI抽出結果</h3>
          </div>
          
          <div className="space-y-4">
            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">企業名</label>
                <p className="text-sm text-gray-900">{extractedInfo.companyName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">企業規模</label>
                <p className="text-sm text-gray-900">{extractedInfo.companySize}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">成長ステージ</label>
                <p className="text-sm text-gray-900">{extractedInfo.growthStage}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">分析信頼度</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{width: `${extractedInfo.confidence}%`}}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{extractedInfo.confidence}%</span>
                </div>
              </div>
            </div>

            {/* 業界（自動連携対象） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                業界 <span className="text-primary-600 text-xs">(Step 3に自動連携)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {extractedInfo.industries.map((industry, index) => (
                  <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full border border-primary-200">
                    <CheckCircle className="h-3 w-3 inline mr-1" />
                    {industry}
                  </span>
                ))}
                {extractedInfo.industries.length === 0 && (
                  <span className="text-sm text-gray-500">業界を特定できませんでした</span>
                )}
              </div>
            </div>

            {/* 事業内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">事業内容</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{extractedInfo.businessDescription}</p>
            </div>

            {/* 組織特徴 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">組織特徴</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{extractedInfo.organizationFeatures}</p>
            </div>

            {/* 主要課題 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">推定される主要課題</label>
              <div className="space-y-1">
                {extractedInfo.mainChallenges && extractedInfo.mainChallenges.length > 0 ? (
                  extractedInfo.mainChallenges.map((challenge, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                      <AlertCircle className="h-3 w-3 text-orange-500" />
                      <span>{challenge}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">課題を特定できませんでした</span>
                )}
              </div>
            </div>
          </div>
          
          {/* 注意事項 */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                AI抽出結果は参考情報です。次のステップで詳細な課題や要望を入力することで、より精度の高い分析が可能になります。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyInfoInput;