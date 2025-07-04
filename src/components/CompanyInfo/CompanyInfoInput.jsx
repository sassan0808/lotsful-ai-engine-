"use client";

import React, { useState } from 'react';
import { Building2, FileText, Sparkles, AlertCircle, CheckCircle, Loader2, Eye } from 'lucide-react';

const CompanyInfoInput = ({ companyInfo, onCompanyInfoChange, template }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState(null);

  // 初期化時にStep1完了状態を確認
  React.useEffect(() => {
    if (template?.metadata?.step1Completed && !analysisCompleted) {
      setAnalysisCompleted(true);
      setExtractedInfo({
        companyProfile: template.companyProfile,
        researchData: template.researchData
      });
    }
  }, [template, analysisCompleted]);

  const handleTextChange = (value) => {
    onCompanyInfoChange({
      rawText: value,
      extracted: template // テンプレート情報を保持
    });
  };

  const handleAIExtraction = async () => {
    if (!companyInfo.rawText.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // 新しいStep1専用API を使用
      const response = await fetch('/api/analyze-step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          researchText: companyInfo.rawText
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysisResult = await response.json();
      
      // Step1内で結果を表示
      setExtractedInfo(analysisResult);
      setAnalysisCompleted(true);
      
      // テンプレート形式で上位コンポーネントに通知（テンプレート更新を促す）
      onCompanyInfoChange({
        rawText: companyInfo.rawText,
        extracted: analysisResult // 完全なテンプレート構造
      });
    } catch (error) {
      console.error('Step1 analysis error:', error);
      alert('AI分析に失敗しました。再度お試しください。');
      // エラー時はテンプレート更新を行わない
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
    `パーソルイノベーション株式会社
パーソルイノベーション株式会社は、パーソルグループの一員として2019年に設立された企業で、新規事業創出やオープンイノベーション推進を主な目的としています。同社は「はたらく」に関するサービスを中心に、社会課題の解決を目指しながら新たな価値を提供することを目指しています。

特徴と役割：
• 新規事業創出: パーソルグループ内で新規事業アイデアを提案できるプログラム「Drit」を運営し、社員のアイデアを具体化・事業化するための支援を行っています。
• インキュベーションスタジオ: 事業化検証から成長までをサポートする体制を整備し、マーケティングやプロダクト開発、顧客獲得支援などを提供しています。
• 豊富なアセット活用: パーソルグループのノウハウや顧客基盤、技術トレンドを活用し、事業開発を推進しています。

事業内容：
• 新規事業創造
• オープンイノベーション推進
• グループ会社の経営計画・管理

サービス例：
• TECH PLAY Academy
• lotsful（副業マッチングサービス）
• Reskilling Camp
• 転職管理マイリストなど

会社概要：
• 設立年月: 2019年4月
• 代表者: 大浦征也
• 所在地: 東京都港区北青山2-9-5 スタジアムプレイス青山6階

強み：
• ベンチャー企業並みのスピード感と、大企業ならではの安定基盤を兼ね備えた環境
• 社員のスキルアップを目的とした勉強会や生成AIの活用方法に関する情報共有など、最新技術への対応力

パーソルイノベーション株式会社は、社会課題の解決を目指しながら、社員のアイデアを事業化するための支援を行い、革新的なサービスを生み出すことに注力しています。`
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
              <button
                onClick={() => handleTextChange(sampleTexts[0])}
                className="text-left text-xs text-blue-700 hover:text-blue-900 hover:underline block w-full p-2 bg-white rounded border border-blue-200 hover:border-blue-300 transition-colors"
              >
                パーソルイノベーション株式会社...
              </button>
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

      {/* Step1 AI分析結果表示 */}
      {analysisCompleted && extractedInfo && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI分析結果</h3>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Step1完了</span>
          </div>
          
          <div className="space-y-6">
            {/* 🏢 企業基本情報セクション */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                🏢 企業基本情報
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700">企業名</label>
                  <p className="text-sm text-blue-900">{extractedInfo.companyProfile?.name || '情報不足により特定不可'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">従業員数</label>
                  <p className="text-sm text-blue-900">{extractedInfo.companyProfile?.employeeCount || '情報不足により特定不可'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">年商</label>
                  <p className="text-sm text-blue-900">{extractedInfo.companyProfile?.revenue || '情報不足により特定不可'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">本社所在地</label>
                  <p className="text-sm text-blue-900">{extractedInfo.companyProfile?.headquarters || '情報不足により特定不可'}</p>
                </div>
              </div>
              
              {/* 業界（自動連携対象） */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-blue-700">業界</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {extractedInfo.companyProfile?.industry?.map((industry, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {industry}
                    </span>
                  )) || <span className="text-sm text-blue-900">情報不足により特定不可</span>}
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-blue-700">事業内容</label>
                <p className="text-sm text-blue-900">{extractedInfo.companyProfile?.businessDescription || '情報不足により特定不可'}</p>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-blue-700">主要顧客層</label>
                <p className="text-sm text-blue-900">{extractedInfo.companyProfile?.mainCustomers || '情報不足により特定不可'}</p>
              </div>
            </div>
            
            {/* 🔍 事前リサーチ情報セクション */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                🔍 事前リサーチ情報
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-700">最近の動き・ニュース</label>
                  <p className="text-sm text-green-900">{extractedInfo.researchData?.recentNews || '情報不足により特定不可'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-green-700">組織の特徴・文化</label>
                  <p className="text-sm text-green-900">{extractedInfo.researchData?.organizationCulture || '情報不足により特定不可'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-green-700">仮説・洞察</label>
                  <p className="text-sm text-green-900">{extractedInfo.researchData?.hypothesisInsights || '情報不足により特定不可'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-green-700">商談確認事項</label>
                  <div className="mt-1">
                    {extractedInfo.researchData?.meetingCheckpoints?.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-green-900 space-y-1">
                        {extractedInfo.researchData.meetingCheckpoints.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-900">情報不足により特定不可</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">次のステップ</p>
                <p className="text-sm text-yellow-700 mt-1">
                  企業基本情報の抽出が完了しました。Step2では現状分析とプロジェクト設計の情報を追加入力します。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* テンプレート情報表示（後方互換性） */}
      {!analysisCompleted && template?.metadata?.step1Completed && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">既存のテンプレート情報</h3>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Step1完了済み</span>
          </div>
          
          <div className="space-y-6">
            {/* 🏢 企業基本情報 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                🏢 企業基本情報
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700">企業名</label>
                  <p className="text-sm text-blue-900">{template.companyProfile?.name || '情報不足により特定不可'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">従業員数</label>
                  <p className="text-sm text-blue-900">{template.companyProfile?.employeeCount || '情報不足により特定不可'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">年商</label>
                  <p className="text-sm text-blue-900">{template.companyProfile?.revenue || '情報不足により特定不可'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">本社所在地</label>
                  <p className="text-sm text-blue-900">{template.companyProfile?.headquarters || '情報不足により特定不可'}</p>
                </div>
              </div>
              
              {/* 業界（自動連携対象） */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  業界 <span className="text-primary-600 text-xs">(Step3に自動連携)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {(template.companyProfile?.industry || []).map((industry, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full border border-primary-200">
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                      {industry}
                    </span>
                  ))}
                  {(!template.companyProfile?.industry || template.companyProfile.industry.length === 0) && (
                    <span className="text-sm text-gray-500">業界を特定できませんでした</span>
                  )}
                </div>
              </div>
              
              {/* 事業内容 */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-blue-700">事業内容</label>
                <p className="text-sm text-blue-900 bg-white p-3 rounded border border-blue-200">{template.companyProfile?.businessDescription || '情報不足により特定不可'}</p>
              </div>
            </div>

            {/* 🔍 事前リサーチ情報 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                事前リサーチ情報
              </h4>
              
              {/* 組織特徴 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-green-700">組織文化・特徴</label>
                <p className="text-sm text-green-900 bg-white p-3 rounded border border-green-200">{template.researchData?.organizationCulture || '情報不足により特定不可'}</p>
              </div>

              {/* 最近の動き */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-green-700">最近の動き・ニュース</label>
                <p className="text-sm text-green-900 bg-white p-3 rounded border border-green-200">{template.researchData?.recentNews || '情報不足により特定不可'}</p>
              </div>

              {/* 仮説・洞察 */}
              <div>
                <label className="block text-sm font-medium text-green-700">仮説・洞察</label>
                <p className="text-sm text-green-900 bg-white p-3 rounded border border-green-200">{template.researchData?.hypothesisInsights || '情報不足により特定不可'}</p>
              </div>
            </div>
          </div>
          
          {/* 注意事項 */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                テンプレート情報が正常に保存されました。Step2で詳細情報を追加し、Step3で業務項目を選択してください。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyInfoInput;