"use client";

import React, { useState } from 'react';
import { 
  FileText, Target, Users, TrendingUp, Settings,
  Download, Share2, Loader2, Sparkles
} from 'lucide-react';
import TalentProposal from '../TalentProposal/TalentProposal';

const ProposalTabs = ({ template, analysisResult, onExport, onShare }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [isGeneratingTalent, setIsGeneratingTalent] = useState(false);
  const [talentProposal, setTalentProposal] = useState(null);

  // デバッグ：受信したデータを確認
  console.log('=== PROPOSAL TABS DEBUG ===');
  console.log('Received template:', template);
  console.log('Received analysisResult:', analysisResult);
  console.log('analysisResult type:', typeof analysisResult);
  console.log('=== PROPOSAL TABS DEBUG END ===');

  // タブ定義
  const tabs = [
    { id: 1, name: '課題整理', icon: FileText, color: 'blue' },
    { id: 2, name: 'プロジェクト設計', icon: Target, color: 'purple' },
    { id: 3, name: '人材提案', icon: Users, color: 'green' },
    { id: 4, name: '期待成果', icon: TrendingUp, color: 'orange' },
    { id: 5, name: '実施要項', icon: Settings, color: 'gray' }
  ];

  // 人材提案生成
  const handleGenerateTalentProposal = async () => {
    console.log('=== TALENT PROPOSAL GENERATION START ===');
    console.log('Function called successfully!');
    console.log('Template data:', template);
    console.log('isGeneratingTalent before:', isGeneratingTalent);
    
    setIsGeneratingTalent(true);
    console.log('setIsGeneratingTalent(true) called');
    
    try {
      console.log('Starting API call to /api/generate-talent-proposal');
      
      const response = await fetch('/api/generate-talent-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: template
        })
      });

      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`Talent proposal generation failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Talent proposal generated successfully:', result);
      setTalentProposal(result.talentProposal);
      console.log('setTalentProposal called with:', result.talentProposal);
    } catch (error) {
      console.error('Talent proposal generation error:', error);
      alert('人材提案の生成に失敗しました: ' + error.message);
    } finally {
      setIsGeneratingTalent(false);
      console.log('setIsGeneratingTalent(false) called');
      console.log('=== TALENT PROPOSAL GENERATION END ===');
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">プロジェクト提案書</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onShare}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>共有</span>
            </button>
            <button
              onClick={onExport}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>PDF出力</span>
            </button>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="flex space-x-2 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? `border-${tab.color}-600 text-${tab.color}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* タブコンテンツ */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 1 && <ChallengeAnalysisTab analysisResult={analysisResult} />}
        {activeTab === 2 && <ProjectDesignTab template={template} analysisResult={analysisResult} />}
        {activeTab === 3 && (
          <TalentProposalTab 
            talentProposal={talentProposal}
            onGenerate={handleGenerateTalentProposal}
            isGenerating={isGeneratingTalent}
            analysisResult={analysisResult}
          />
        )}
        {activeTab === 4 && <ExpectedResultsTab template={template} />}
        {activeTab === 5 && <ImplementationTab template={template} />}
      </div>
    </div>
  );
};

// Tab 1: 課題整理
const ChallengeAnalysisTab = ({ analysisResult }) => {
  // APIレスポンスの構造を確認
  console.log('=== CHALLENGE ANALYSIS TAB DEBUG ===');
  console.log('analysisResult in Tab1:', analysisResult);
  console.log('analysisResult.tab1:', analysisResult?.tab1);
  console.log('analysisResult.metadata:', analysisResult?.metadata);
  console.log('=== CHALLENGE ANALYSIS TAB DEBUG END ===');
  
  // tab1のcontentから情報を抽出、もしくはmetadata.templateから取得
  const template = analysisResult?.metadata?.template || {};
  const company = template?.companyProfile || {};
  const challenges = template?.currentAnalysis || {};
  const tab1Content = analysisResult?.tab1?.content || '';

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">課題整理</h3>
      
      {/* 現状分析 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">現状分析</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">企業名：</span>
            <span className="font-medium">{company.name || '未設定'}</span>
          </div>
          <div>
            <span className="text-gray-600">業界：</span>
            <span className="font-medium">{company.industry?.join(', ') || '未設定'}</span>
          </div>
          <div>
            <span className="text-gray-600">従業員数：</span>
            <span className="font-medium">{company.employeeCount || '未設定'}</span>
          </div>
          <div>
            <span className="text-gray-600">事業フェーズ：</span>
            <span className="font-medium">{challenges.businessPhase || '未設定'}</span>
          </div>
        </div>
      </div>

      {/* 課題マッピング */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">課題マッピング</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">領域</th>
                <th className="border border-gray-300 px-4 py-2 text-left">現状</th>
                <th className="border border-gray-300 px-4 py-2 text-left">理想</th>
                <th className="border border-gray-300 px-4 py-2 text-left">ギャップ</th>
              </tr>
            </thead>
            <tbody>
              {(challenges.challengeCategories || []).map((category, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 px-4 py-2">{category}</td>
                  <td className="border border-gray-300 px-4 py-2">{challenges.previousEfforts || '情報なし'}</td>
                  <td className="border border-gray-300 px-4 py-2">{analysisResult?.projectDesign?.idealState3Months || '未設定'}</td>
                  <td className="border border-gray-300 px-4 py-2">{challenges.failureReasons || '分析中'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 課題の深掘り */}
      <div className="space-y-4">
        <div>
          <h5 className="font-medium text-gray-700 mb-2">表面的な課題</h5>
          <p className="text-gray-600 bg-gray-50 rounded p-3">
            {challenges.challengeCategories?.join('、') || '情報が不足しています'}
          </p>
        </div>
        
        <div>
          <h5 className="font-medium text-gray-700 mb-2">本質的な課題</h5>
          <p className="text-gray-600 bg-gray-50 rounded p-3">
            {analysisResult?.projectDesign?.challengeSummary || '分析中です'}
          </p>
        </div>

        <div>
          <h5 className="font-medium text-gray-700 mb-2">放置した場合の影響</h5>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-sm font-medium text-gray-600">短期（3ヶ月）:</span>
              <span className="text-sm text-gray-600">{analysisResult?.projectDesign?.risksIfIgnored || '機会損失の拡大'}</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-sm font-medium text-gray-600">中期（6ヶ月）:</span>
              <span className="text-sm text-gray-600">競合他社との差が拡大</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-sm font-medium text-gray-600">長期（1年）:</span>
              <span className="text-sm text-gray-600">市場での競争力低下</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI生成コンテンツ表示 */}
      {tab1Content && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            AI分析結果
          </h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">{tab1Content}</pre>
        </div>
      )}
    </div>
  );
};

// Tab 2: プロジェクト設計
const ProjectDesignTab = ({ template, analysisResult }) => {
  const projectTemplate = analysisResult?.metadata?.template?.projectDesign || template?.projectDesign || {};
  const tab2Content = analysisResult?.tab2?.content || '';
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">プロジェクト設計</h3>
      
      {/* プロジェクト概要 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ミッション</h4>
        <p className="text-blue-800">
          {project.idealState3Months || 'プロジェクトで実現すること'}
        </p>
      </div>

      {/* スコープ定義 */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">スコープ定義</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-green-700 mb-2">含むもの</h5>
            <ul className="space-y-1">
              {(project.scope?.included || []).map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-red-700 mb-2">含まないもの</h5>
            <ul className="space-y-1">
              {(project.scope?.excluded || []).map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-red-600">✗</span>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* フェーズ設計 */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">フェーズ設計</h4>
        {(project.phases || []).map((phase, idx) => (
          <div key={idx} className="mb-6 border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-800 mb-2">
              Phase {idx + 1}: {phase.name}（{phase.period}）
            </h5>
            <p className="text-sm text-gray-600 mb-3">目的: {phase.goal}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h6 className="font-medium text-gray-700 mb-2">主要タスク</h6>
                <ul className="space-y-1">
                  {(phase.mainActivities || []).map((task, tidx) => (
                    <li key={tidx} className="text-sm text-gray-600">• {task}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h6 className="font-medium text-gray-700 mb-2">成果物</h6>
                <ul className="space-y-1">
                  {(project.deliverables || []).slice(idx * 2, idx * 2 + 2).map((deliverable, didx) => (
                    <li key={didx} className="text-sm text-gray-600">📄 {deliverable}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI生成コンテンツ表示 */}
      {tab2Content && (
        <div className="mt-6 bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            AI分析結果
          </h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">{tab2Content}</pre>
        </div>
      )}
    </div>
  );
};

// Tab 3: 人材提案
const TalentProposalTab = ({ talentProposal, onGenerate, isGenerating, analysisResult }) => {
  const tab3Content = analysisResult?.tab3?.content || '';
  const handleClick = (e) => {
    console.log('=== BUTTON CLICK DEBUG ===');
    console.log('Event:', e);
    console.log('Event type:', e.type);
    console.log('Target:', e.target);
    console.log('onGenerate:', typeof onGenerate);
    console.log('onGenerate function:', onGenerate);
    console.log('isGenerating:', isGenerating);
    console.log('talentProposal:', talentProposal);
    console.log('=========================');
    
    // Prevent any default behavior
    e.preventDefault();
    e.stopPropagation();
    
    if (typeof onGenerate === 'function') {
      console.log('Calling onGenerate function...');
      onGenerate();
    } else {
      console.error('onGenerate is not a function:', onGenerate);
    }
  };

  if (!talentProposal) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Tab3: 人材提案（手動生成）</h4>
          <p className="text-gray-600 mb-2">人材要件定義、人材タイプ提案、稼働条件を生成します</p>
          <p className="text-gray-500 text-sm">ボタンをクリックして人材提案を生成してください</p>
        </div>
        <button
          onClick={handleClick}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all mx-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>生成中...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>AI分析で生成</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TalentProposal 
        proposal={talentProposal} 
        onExport={() => console.log('Export from TalentProposal')}
        onShare={() => console.log('Share from TalentProposal')}
      />
      
      {/* AI生成コンテンツ表示 */}
      {tab3Content && (
        <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            AI分析結果
          </h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">{tab3Content}</pre>
        </div>
      )}
    </div>
  );
};

// Tab 4: 期待成果（プレースホルダー）
const ExpectedResultsTab = ({ template }) => {
  return (
    <div className="text-center py-12">
      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 mb-4">期待成果の詳細はフェーズ2で実装予定です</p>
      <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed">
        手動生成（Coming Soon）
      </button>
    </div>
  );
};

// Tab 5: 実施要項（プレースホルダー）
const ImplementationTab = ({ template }) => {
  return (
    <div className="text-center py-12">
      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 mb-4">実施要項の詳細はフェーズ2で実装予定です</p>
      <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed">
        手動生成（Coming Soon）
      </button>
    </div>
  );
};

export default ProposalTabs;