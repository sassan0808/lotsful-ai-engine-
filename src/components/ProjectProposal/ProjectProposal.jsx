"use client";

import React, { useState } from 'react';
import { 
  Target, Clock, Users, TrendingUp, CheckCircle, AlertTriangle,
  Download, ArrowLeft, Lightbulb, Calendar, DollarSign, 
  MessageSquare, FileText, Star, Zap
} from 'lucide-react';

const ProjectProposal = ({ proposal, onReset }) => {
  console.log('ProjectProposal rendered with proposal:', proposal);
  const [activeSection, setActiveSection] = useState('challenges');

  const handleExport = () => {
    const exportData = {
      analysisDate: new Date().toISOString(),
      proposal
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-proposal-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sections = [
    { id: 'challenges', label: '課題整理', icon: Target },
    { id: 'design', label: 'プロジェクト設計', icon: TrendingUp },
    { id: 'talent', label: '人材提案', icon: Users },
    { id: 'outcome', label: '期待成果', icon: Star },
    { id: 'implementation', label: '実施要項', icon: AlertTriangle }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ヘッダーボタン */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>新しい分析を開始</span>
        </button>
        
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>提案書をエクスポート</span>
        </button>
      </div>

      {/* メインタイトル */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">AI分析完了</h1>
        <h2 className="text-xl mb-2">{proposal.projectDefinition?.projectName || proposal.projectProposal?.title || 'プロジェクト名未設定'}</h2>
        <p className="opacity-90">{proposal.projectDefinition?.goalDescription || proposal.companyAnalysis?.summary || 'プロジェクト説明未設定'}</p>
      </div>

      {/* ナビゲーションタブ */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-shrink-0 px-6 py-4 flex items-center space-x-2 transition-all ${
                  activeSection === section.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium whitespace-nowrap">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* セクション内容 */}
        <div className="p-6">
          {activeSection === 'challenges' && <ChallengesSection proposal={proposal} />}
          {activeSection === 'design' && <DesignSection proposal={proposal} />}
          {activeSection === 'talent' && <TalentSection proposal={proposal} />}
          {activeSection === 'outcome' && <OutcomeSection proposal={proposal} />}
          {activeSection === 'implementation' && <ImplementationSection proposal={proposal} />}
        </div>
      </div>

      {/* AI分析情報 */}
      {proposal.metadata && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">AI分析情報</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p>分析日時: {new Date(proposal.metadata.analysisDate).toLocaleString('ja-JP')}</p>
            {proposal.metadata.inputDataSummary && (
              <>
                <p>選択項目数: {proposal.metadata.inputDataSummary.selectedItemsCount}</p>
                <p>想定稼働時間: {proposal.metadata.inputDataSummary.workingHours}時間/月</p>
              </>
            )}
            {proposal.metadata.isMockData && (
              <p className="text-yellow-600">※ デモ用モックデータです</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ChallengesSection = ({ proposal }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tab1: 課題整理（自動生成）</h3>
      <p className="text-sm text-gray-600">現状分析、課題マッピング、課題の深掘りを表示します</p>
    </div>

    {/* 現状分析 */}
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-blue-900">現状分析</h4>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-2">企業名</h5>
            <p className="text-blue-800 text-sm font-medium">{proposal.challengeAnalysis?.companyName || 'データが見つかりません'}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h5 className="font-semibold text-green-900 mb-2">業界</h5>
            <p className="text-green-800 text-sm">{proposal.challengeAnalysis?.industryName || 'データが見つかりません'}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h5 className="font-semibold text-purple-900 mb-2">従業員数</h5>
            <p className="text-purple-800 text-sm">{proposal.challengeAnalysis?.employeeCount || 'データが見つかりません'}</p>
          </div>
        </div>
      </div>
    </div>

    {/* 課題マッピング */}
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-yellow-50 px-6 py-4 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-yellow-900">課題マッピング</h4>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">領域</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">現状</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">理想</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">ギャップ</th>
              </tr>
            </thead>
            <tbody>
              {proposal.challengeAnalysis?.challengeMapping?.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">{row.area}</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700 text-sm">{row.current}</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700 text-sm">{row.ideal}</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700 text-sm">{row.gap}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="4" className="border border-gray-300 px-4 py-3 text-center text-gray-500">
                    データが見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* 課題の深掘り */}
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-red-50 px-6 py-4 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-red-900">課題の深掘り</h4>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 rounded-lg p-4">
            <h5 className="font-semibold text-red-900 mb-2">表面的な課題</h5>
            <p className="text-red-800 text-sm">{proposal.challengeAnalysis?.surfaceChallenges || 'データが見つかりません'}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <h5 className="font-semibold text-orange-900 mb-2">本質的な課題</h5>
            <p className="text-orange-800 text-sm">{proposal.challengeAnalysis?.rootChallenges || 'データが見つかりません'}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 mb-3">放置した場合の影響</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-100 rounded p-3">
              <h6 className="font-medium text-yellow-900 text-sm mb-1">短期（3ヶ月）</h6>
              <p className="text-yellow-800 text-xs">{proposal.challengeAnalysis?.impactRisks?.shortTerm || 'データが見つかりません'}</p>
            </div>
            <div className="bg-orange-100 rounded p-3">
              <h6 className="font-medium text-orange-900 text-sm mb-1">中期（6ヶ月）</h6>
              <p className="text-orange-800 text-xs">{proposal.challengeAnalysis?.impactRisks?.mediumTerm || 'データが見つかりません'}</p>
            </div>
            <div className="bg-red-100 rounded p-3">
              <h6 className="font-medium text-red-900 text-sm mb-1">長期（1年）</h6>
              <p className="text-red-800 text-xs">{proposal.challengeAnalysis?.impactRisks?.longTerm || 'データが見つかりません'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DesignSection = ({ proposal }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tab2: プロジェクト設計（自動生成）</h3>
      <p className="text-sm text-gray-600">プロジェクト概要、スコープ定義、フェーズ設計を表示します</p>
    </div>

    {/* プロジェクト概要 */}
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-purple-50 px-6 py-4 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-purple-900">プロジェクト概要</h4>
      </div>
      <div className="p-6 space-y-4">
        <div className="bg-purple-50 rounded-lg p-4">
          <h5 className="font-semibold text-purple-900 mb-2">ミッション</h5>
          <p className="text-purple-800 text-sm">{proposal.projectDesign?.mission || 'データが見つかりません'}</p>
        </div>
      </div>
    </div>

    {/* スコープ定義 */}
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-teal-50 px-6 py-4 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-teal-900">スコープ定義</h4>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-lg p-4">
            <h5 className="font-semibold text-green-900 mb-3">含むもの</h5>
            <div className="space-y-2">
              {proposal.projectDesign?.scopeIncluded?.map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-green-800 text-sm">{item}</p>
                </div>
              )) || <p className="text-green-500 text-sm">データが見つかりません</p>}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <h5 className="font-semibold text-red-900 mb-3">含まないもの</h5>
            <div className="space-y-2">
              {proposal.projectDesign?.scopeExcluded?.map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{item}</p>
                </div>
              )) || <p className="text-red-500 text-sm">データが見つかりません</p>}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* フェーズ設計 */}
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-blue-900">フェーズ設計</h4>
      </div>
      <div className="p-6 space-y-6">
        {proposal.projectDesign?.phases?.map((phase, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200">
              <h5 className="font-semibold text-indigo-900">
                Phase {index + 1}: {phase.name} ({phase.period})
              </h5>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-indigo-50 rounded-lg p-3">
                <h6 className="font-medium text-indigo-900 mb-1">目的</h6>
                <p className="text-indigo-800 text-sm">{phase.purpose}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h6 className="font-medium text-gray-900 mb-2">主要タスク</h6>
                  <div className="space-y-2">
                    {phase.tasks?.map((task, taskIndex) => (
                      <div key={taskIndex} className="bg-white rounded p-2">
                        <p className="font-medium text-gray-900 text-sm">{task.name}</p>
                        <p className="text-gray-600 text-xs mt-1">詳細: {task.detail}</p>
                        <p className="text-gray-500 text-xs">期限: {task.deadline}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <h6 className="font-medium text-yellow-900 mb-2">成果物</h6>
                    <div className="space-y-1">
                      {phase.deliverables?.map((deliverable, delIndex) => (
                        <p key={delIndex} className="text-yellow-800 text-sm">{deliverable}</p>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3">
                    <h6 className="font-medium text-green-900 mb-1">マイルストーン</h6>
                    <p className="text-green-800 text-sm">{phase.milestone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )) || (
          <div className="text-center py-6">
            <p className="text-gray-500">フェーズデータが見つかりません</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const TalentSection = ({ proposal }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tab3: 人材提案（手動生成）</h3>
      <p className="text-sm text-gray-600">人材要件定義、人材タイプ提案、稼働条件を生成します</p>
    </div>
    <div className="bg-gray-100 rounded-lg p-6 text-center">
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-4">
        AI分析で生成
      </button>
      <p className="text-gray-500">ボタンをクリックして人材提案を生成してください</p>
    </div>
  </div>
);

const ImplementationSection = ({ proposal }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tab5: 実施要項（手動生成）</h3>
      <p className="text-sm text-gray-600">契約形態、費用構造、実施体制を生成します</p>
    </div>
    <div className="bg-gray-100 rounded-lg p-6 text-center">
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-4">
        AI分析で生成
      </button>
      <p className="text-gray-500">ボタンをクリックして実施要項を生成してください</p>
    </div>
  </div>
);

const OutcomeSection = ({ proposal }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tab4: 期待成果（手動生成）</h3>
      <p className="text-sm text-gray-600">定量的成果、定性的成果、時系列効果を生成します</p>
    </div>
    <div className="bg-gray-100 rounded-lg p-6 text-center">
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-4">
        AI分析で生成
      </button>
      <p className="text-gray-500">ボタンをクリックして期待成果を生成してください</p>
    </div>
  </div>
);


export default ProjectProposal;