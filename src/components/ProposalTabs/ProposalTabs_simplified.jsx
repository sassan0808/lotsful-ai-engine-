"use client";

import React, { useState } from 'react';
import { 
  FileText, Target, Users, TrendingUp, Settings,
  Download, Share2, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import TalentProposal from '../TalentProposal/TalentProposal';

const ProposalTabs = ({ template, analysisResult, onExport, onShare }) => {
  const [activeTab, setActiveTab] = useState(1);

  // デバッグ：受信したデータを確認
  console.log('=== PROPOSAL TABS DEBUG ===');
  console.log('Received analysisResult:', analysisResult);
  console.log('=== PROPOSAL TABS DEBUG END ===');

  // タブ定義
  const tabs = [
    { id: 1, name: '課題整理', icon: FileText, color: 'blue' },
    { id: 2, name: 'プロジェクト設計', icon: Target, color: 'purple' },
    { id: 3, name: '人材提案', icon: Users, color: 'green' },
    { id: 4, name: '期待成果', icon: TrendingUp, color: 'orange' },
    { id: 5, name: '実施要項', icon: Settings, color: 'gray' }
  ];

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
        {activeTab === 2 && <ProjectDesignTab analysisResult={analysisResult} />}
        {activeTab === 3 && <TalentProposalTab analysisResult={analysisResult} />}
        {activeTab === 4 && <ExpectedResultsTab />}
        {activeTab === 5 && <ImplementationTab />}
      </div>
    </div>
  );
};

// Tab 1: 課題整理（AI生成結果のみ表示）
const ChallengeAnalysisTab = ({ analysisResult }) => {
  const tab1Content = analysisResult?.tab1?.content || '';
  
  if (!tab1Content) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          課題整理が生成されていません
        </h3>
        <p className="text-gray-600">
          Step4で最終AI分析を実行してください。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center mb-4">
          <Sparkles className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">課題整理</h3>
          <span className="ml-3 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            AI生成
          </span>
        </div>
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
            {tab1Content}
          </pre>
        </div>
      </div>
    </div>
  );
};

// Tab 2: プロジェクト設計（AI生成結果のみ表示）
const ProjectDesignTab = ({ analysisResult }) => {
  const tab2Content = analysisResult?.tab2?.content || '';
  
  if (!tab2Content) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          プロジェクト設計が生成されていません
        </h3>
        <p className="text-gray-600">
          Step4で最終AI分析を実行してください。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center mb-4">
          <Sparkles className="h-6 w-6 text-purple-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">プロジェクト設計</h3>
          <span className="ml-3 px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
            AI生成
          </span>
        </div>
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
            {tab2Content}
          </pre>
        </div>
      </div>
    </div>
  );
};

// Tab 3: 人材提案（AI生成結果のみ表示）
const TalentProposalTab = ({ analysisResult }) => {
  const tab3Content = analysisResult?.tab3?.content || '';
  
  if (!tab3Content) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          人材提案が生成されていません
        </h3>
        <p className="text-gray-600">
          Step4で最終AI分析を実行してください。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center mb-4">
          <Sparkles className="h-6 w-6 text-green-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">人材提案</h3>
          <span className="ml-3 px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            AI生成
          </span>
        </div>
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
            {tab3Content}
          </pre>
        </div>
      </div>
    </div>
  );
};

// Tab 4: 期待成果（プレースホルダー）
const ExpectedResultsTab = () => {
  return (
    <div className="text-center py-12">
      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">期待成果</h3>
      <p className="text-gray-600 mb-4">
        Coming Soon - 手動生成ボタンで生成可能
      </p>
      <button
        disabled
        className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
      >
        AI分析で生成（開発予定）
      </button>
    </div>
  );
};

// Tab 5: 実施要項（プレースホルダー）
const ImplementationTab = () => {
  return (
    <div className="text-center py-12">
      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">実施要項</h3>
      <p className="text-gray-600 mb-4">
        Coming Soon - 手動生成ボタンで生成可能
      </p>
      <button
        disabled
        className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
      >
        AI分析で生成（開発予定）
      </button>
    </div>
  );
};

export default ProposalTabs;