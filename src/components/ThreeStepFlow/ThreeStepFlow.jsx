"use client";

import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { ArrowRight, ArrowLeft, Loader2, Send, CheckCircle } from 'lucide-react';
import CompanyInfoInput from '../CompanyInfo/CompanyInfoInput';
import ChallengesInput from '../ChallengesInput/ChallengesInput';
import TemplateEditor from '../TemplateEditor/TemplateEditor';
import IndustrySelector from '../IndustrySelector/IndustrySelector';
import BusinessMatrix from '../BusinessMatrix/BusinessMatrix';
import TemplateIntegration from '../TemplateIntegration/TemplateIntegration';
import ProjectProposal from '../ProjectProposal/ProjectProposal';
import ProposalTabs from '../ProposalTabs/ProposalTabs';
import { analyzeWithGemini } from '../../utils/geminiAnalysisEngine';
import { TemplateManager } from '../../utils/templateManager';

const ThreeStepFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  
  // analysisResults変更時のデバッグログ
  useEffect(() => {
    console.log('🎯 analysisResults state changed:', {
      hasResults: !!analysisResults,
      type: typeof analysisResults,
      value: analysisResults
    });
  }, [analysisResults]);
  const [template, setTemplate] = useState(null);
  const [isTemplateFinalAnalyzing, setIsTemplateFinalAnalyzing] = useState(false);

  // 従来の状態（後方互換性のため維持）
  const [companyInfo, setCompanyInfo] = useState({
    rawText: '',
    extracted: null
  });

  const [challenges, setChallenges] = useState({
    structured: {
      mainChallenges: '',
      specificIssues: '',
      goals: '',
      timeline: '',
      budget: '',
      currentTeam: '',
      tools: ''
    },
    freeText: {
      meetingNotes: '',
      transcript: ''
    }
  });

  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedBusinessItems, setSelectedBusinessItems] = useState([]);
  const [workingHours, setWorkingHours] = useState(30);
  const [talentCount, setTalentCount] = useState(1);

  // テンプレート初期化
  useEffect(() => {
    const loadedTemplate = TemplateManager.loadTemplate();
    setTemplate(loadedTemplate);
    
    // テンプレートから業界情報を復元
    if (loadedTemplate?.companyProfile?.industry?.length > 0) {
      setSelectedIndustries(loadedTemplate.companyProfile.industry);
    }
    
    // 既存状態に反映（業界自動連携）
    if (loadedTemplate.companyProfile.industry.length > 0) {
      setSelectedIndustries(loadedTemplate.companyProfile.industry);
    }
    
    // 既存の企業情報状態を復元
    if (loadedTemplate.researchData.deepResearchMemo) {
      setCompanyInfo({
        rawText: loadedTemplate.researchData.deepResearchMemo,
        extracted: {
          companyProfile: loadedTemplate.companyProfile,
          researchData: loadedTemplate.researchData
        }
      });
    }
  }, []);

  // 企業情報変更時の業界自動連携とテンプレート更新
  const handleCompanyInfoChange = (newCompanyInfo) => {
    setCompanyInfo(newCompanyInfo);
    
    // Step1 AI分析結果がある場合
    if (newCompanyInfo.extracted && newCompanyInfo.extracted.companyProfile) {
      // テンプレートにStep1結果を保存
      TemplateManager.updateStep1(
        newCompanyInfo.extracted.companyProfile,
        newCompanyInfo.extracted.researchData
      );
      
      // 業界を自動連携
      const extractedIndustries = newCompanyInfo.extracted.companyProfile.industry || [];
      setSelectedIndustries(prev => {
        const newIndustries = [...prev];
        extractedIndustries.forEach(industry => {
          if (!newIndustries.includes(industry)) {
            newIndustries.push(industry);
          }
        });
        return newIndustries;
      });
      
      // テンプレート状態も更新
      const updatedTemplate = TemplateManager.loadTemplate();
      setTemplate(updatedTemplate);
    }
    
    // 従来ロジック（後方互換性）
    if (newCompanyInfo.extracted && newCompanyInfo.extracted.industries) {
      const extractedIndustries = newCompanyInfo.extracted.industries;
      setSelectedIndustries(prev => {
        const newIndustries = [...prev];
        extractedIndustries.forEach(industry => {
          if (!newIndustries.includes(industry)) {
            newIndustries.push(industry);
          }
        });
        return newIndustries;
      });
    }
  };

  // テンプレート更新ハンドラー
  const handleTemplateUpdate = (updatedTemplate) => {
    setTemplate(updatedTemplate);
    
    // 業界情報をStep3に反映
    if (updatedTemplate.companyProfile.industry.length > 0) {
      setSelectedIndustries(updatedTemplate.companyProfile.industry);
    }
  };

  const steps = [
    { 
      id: 1, 
      title: '企業基本情報', 
      description: 'ディープリサーチ情報入力',
      required: true
    },
    { 
      id: 2, 
      title: '情報統合編集', 
      description: 'テンプレート確認・追加情報入力',
      required: false
    },
    { 
      id: 3, 
      title: '業務選択', 
      description: '必要な業務を選択',
      required: true
    },
    { 
      id: 4, 
      title: 'データ統合確認', 
      description: 'テンプレートデータ統合・最終確認',
      required: true
    },
  ];

  const canProceedToStep = (step) => {
    switch (step) {
      case 2:
        return companyInfo.rawText.trim().length > 0;
      case 3:
        return true; // ステップ2は任意なので常に進める
      case 4:
        return selectedBusinessItems.length > 0 && selectedIndustries.length > 0;
      default:
        return true;
    }
  };

  const canAnalyze = () => {
    const result = selectedBusinessItems.length > 0 && selectedIndustries.length > 0;
    console.log('canAnalyze check:', {
      selectedBusinessItems: selectedBusinessItems.length,
      selectedIndustries: selectedIndustries.length,
      result
    });
    return result;
  };

  const handleNext = () => {
    if (currentStep < 4 && canProceedToStep(currentStep + 1)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      // 5タブ提案書表示中にStep4に戻る場合、分析結果をクリア
      if (analysisResults && currentStep === 4) {
        setAnalysisResults(null);
        setIsTemplateFinalAnalyzing(false);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  // Step3完了時の処理（業務選択のみ）
  const handleStep3Complete = () => {
    // 最新のテンプレートを取得
    const currentTemplate = TemplateManager.loadTemplate();
    
    // 選択された業務項目をテンプレートに保存
    const updatedTemplate = TemplateManager.updateStep3(currentTemplate, {
      selectedBusinessItems,
      workingHours,
      talentCount
    });
    setTemplate(updatedTemplate);
    
    // Step4に進む
    setCurrentStep(4);
  };

  // 分析開始のコールバック
  const handleAnalysisStart = () => {
    console.log('🚀 Analysis started from TemplateIntegration');
    setIsTemplateFinalAnalyzing(true);
  };

  // 分析エラーのコールバック
  const handleAnalysisError = () => {
    console.log('❌ Analysis failed from TemplateIntegration');
    setIsTemplateFinalAnalyzing(false);
  };


  // 分析完了のコールバック（結果受信）- 確実動作版
  const handleFinalAnalyze = (analysisResults) => {
    console.log('🎯 === handleFinalAnalyze CALLED ===');
    console.log('🎯 Received analysisResults:', analysisResults);
    console.log('🎯 Current analysisResults before set:', analysisResults);
    
    // まず分析状態をクリア
    setIsTemplateFinalAnalyzing(false);
    
    // 確実に状態を更新するために、関数型更新を使用
    setAnalysisResults(prev => {
      console.log('🔄 setAnalysisResults function called. prev:', prev);
      console.log('🔄 setting new value:', analysisResults);
      return analysisResults;
    });
    
    console.log('✅ setAnalysisResults called');
    
    // 強制的に再レンダリングを促すため
    setTimeout(() => {
      console.log('⏰ Timeout check - current analysisResults should be set');
    }, 100);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setAnalysisResults(null);
    setCompanyInfo({ rawText: '', extracted: null });
    setChallenges({
      structured: {
        mainChallenges: '',
        specificIssues: '',
        goals: '',
        timeline: '',
        budget: '',
        currentTeam: '',
        tools: ''
      },
      freeText: {
        meetingNotes: '',
        transcript: ''
      }
    });
    setSelectedIndustries([]);
    setSelectedBusinessItems([]);
    setWorkingHours(30);
    setTalentCount(1);
    
    // テンプレートもクリア
    TemplateManager.clearTemplate();
    setTemplate(TemplateManager.loadTemplate());
  };

  // 分析結果表示中 - コメントアウトして5タブ表示に移行
  // if (analysisResults) {
  //   console.log('Rendering ProjectProposal with results:', analysisResults);
  //   return <ProjectProposal proposal={analysisResults} onReset={handleReset} />;
  // }

  // コンポーネントレンダー時のデバッグ
  console.log('🔄 ThreeStepFlow RENDER:', {
    currentStep,
    hasAnalysisResults: !!analysisResults,
    isTemplateFinalAnalyzing,
    timestamp: new Date().toLocaleTimeString()
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ステップインジケーター */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep === step.id
                      ? 'bg-primary-600 text-white'
                      : currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    currentStep === step.id ? 'text-primary-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                  {step.required && (
                    <div className="text-xs text-red-500 mt-1">必須</div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* メインコンテンツエリア */}
      {!analysisResults && (
        <div className="bg-white rounded-lg shadow-lg">
          {/* ステップコンテンツ */}
          <div className="p-8">
          {currentStep === 1 && (
            <CompanyInfoInput
              companyInfo={companyInfo}
              onCompanyInfoChange={handleCompanyInfoChange}
              template={template}
            />
          )}

          {currentStep === 2 && (
            <TemplateEditor
              onTemplateUpdate={handleTemplateUpdate}
            />
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <IndustrySelector
                selectedIndustries={selectedIndustries}
                onIndustryChange={setSelectedIndustries}
                autoDetectedIndustries={companyInfo.extracted?.industries || []}
              />
              
              {selectedIndustries.length > 0 && (
                <div className="border-t pt-8">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      業務項目選択
                    </h3>
                    <p className="text-gray-600">
                      切り出したい業務項目をマトリックスから選択してください
                    </p>
                  </div>
                  <BusinessMatrix
                    selectedItems={selectedBusinessItems}
                    onSelectionChange={setSelectedBusinessItems}
                    workingHours={workingHours}
                    onWorkingHoursChange={setWorkingHours}
                    talentCount={talentCount}
                    onTalentCountChange={setTalentCount}
                  />
                </div>
              )}
            </div>
          )}

          {(() => {
            console.log('=== RENDER CONDITIONS CHECK ===');
            console.log('currentStep:', currentStep);
            console.log('analysisResults:', analysisResults);
            console.log('typeof analysisResults:', typeof analysisResults);
            console.log('!!analysisResults:', !!analysisResults);
            console.log('isTemplateFinalAnalyzing:', isTemplateFinalAnalyzing);
            
            if (currentStep === 4 && !analysisResults) {
              console.log('✅ RENDERING: TemplateIntegration');
              return (
                <TemplateIntegration
                  onTemplateUpdate={handleTemplateUpdate}
                  onContinueToAnalysis={handleFinalAnalyze}
                  onAnalysisStart={handleAnalysisStart}
                  onAnalysisError={handleAnalysisError}
                  isAnalyzing={isTemplateFinalAnalyzing}
                />
              );
            } else if (currentStep === 4 && analysisResults) {
              console.log('✅ RENDERING: ProposalTabs');
              console.log('analysisResults content:', analysisResults);
              return (
                <div className="bg-white rounded-lg shadow-sm">
                  <ProposalTabs 
                    template={template}
                    analysisResult={analysisResults}
                    onExport={() => alert('PDF出力機能は今後実装予定です')}
                    onShare={() => alert('共有機能は今後実装予定です')}
                  />
                </div>
              );
            } else {
              console.log('❌ NO RENDERING: conditions not met');
              return null;
            }
          })()}
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex items-center justify-between p-8 bg-gray-50 rounded-b-lg">
          <div>
            {currentStep > 1 && !analysisResults && (
              <button
                onClick={handlePrevious}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>前へ</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* 進捗情報 */}
            <div className="text-sm text-gray-600">
              {currentStep === 1 && (
                <span>
                  {companyInfo.rawText.length > 0 ? '✓ ' : ''}
                  文字数: {companyInfo.rawText.length}
                </span>
              )}
              {currentStep === 2 && (
                <span>任意入力（スキップ可能）</span>
              )}
              {currentStep === 3 && (
                <span>
                  業種: {selectedIndustries.length}個、
                  業務: {selectedBusinessItems.length}項目、
                  人数: {talentCount}名
                </span>
              )}
              {currentStep === 4 && !analysisResults && (
                <span>データ統合・確認画面</span>
              )}
              {currentStep === 4 && analysisResults && (
                <span>5タブ提案書完成</span>
              )}
            </div>

            {/* アクションボタン */}
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canProceedToStep(currentStep + 1)}
                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span>{currentStep === 2 ? '次へ (スキップ可)' : '次へ'}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            ) : currentStep === 3 ? (
              <button
                onClick={handleStep3Complete}
                disabled={!canProceedToStep(4)}
                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span>データ統合・確認へ</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
      )}
      
      {/* 5タブ提案書完成時のナビゲーション */}
      {analysisResults && (
        <div className="bg-white rounded-lg shadow-lg mt-6">
          <div className="flex items-center justify-between p-8 bg-gray-50 rounded-lg">
            <div>
              <button
                onClick={handlePrevious}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>データ確認に戻る</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span>5タブ提案書が完成しました</span>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <span>新しい分析を開始</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step3完了メッセージ */}
      {currentStep === 3 && canProceedToStep(4) && !isAnalyzing && !analysisResults && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">
              業務選択完了！次のステップでデータを統合・確認してからAI分析を実行します。
            </span>
          </div>
        </div>
      )}

    </div>
  );
};

export default ThreeStepFlow;