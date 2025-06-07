"use client";

import React, { useState } from 'react';
import { 
  Target, Clock, Users, TrendingUp, CheckCircle, AlertTriangle,
  Download, ArrowLeft, Lightbulb, Calendar, DollarSign, 
  MessageSquare, FileText, Star, Zap
} from 'lucide-react';

const ProjectProposal = ({ proposal, onReset }) => {
  console.log('ProjectProposal rendered with proposal:', proposal);
  const [activeSection, setActiveSection] = useState('overview');

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
    { id: 'overview', label: 'プロジェクト概要', icon: Target },
    { id: 'approach', label: '統合アプローチ', icon: TrendingUp },
    { id: 'expertise', label: '必要な専門性', icon: Users },
    { id: 'remote', label: 'リモートワーク計画', icon: MessageSquare },
    { id: 'outcome', label: '期待される成果', icon: Star },
    { id: 'risks', label: 'リスク対策', icon: AlertTriangle }
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
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
        <h2 className="text-xl mb-2">{proposal.projectDefinition?.projectName}</h2>
        <p className="opacity-90">{proposal.projectDefinition?.goalDescription}</p>
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
          {activeSection === 'overview' && <OverviewSection proposal={proposal} />}
          {activeSection === 'approach' && <ApproachSection proposal={proposal} />}
          {activeSection === 'expertise' && <ExpertiseSection proposal={proposal} />}
          {activeSection === 'remote' && <RemoteWorkSection proposal={proposal} />}
          {activeSection === 'outcome' && <OutcomeSection proposal={proposal} />}
          {activeSection === 'risks' && <RisksSection proposal={proposal} />}
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

const OverviewSection = ({ proposal }) => {
  console.log('OverviewSection proposal:', proposal);
  console.log('projectDefinition:', proposal.projectDefinition);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">プロジェクト目標</h3>
          </div>
          <p className="text-blue-800">{proposal.projectDefinition?.goalDescription || 'データが見つかりません'}</p>
        </div>

      <div className="bg-green-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-900">成功基準</h3>
        </div>
        <p className="text-green-800">{proposal.projectDefinition?.successCriteria || 'データが見つかりません'}</p>
      </div>
    </div>

    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-3">
        <Clock className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">実施期間</h3>
      </div>
      <p className="text-gray-700">{proposal.projectDefinition?.timeline || 'データが見つかりません'}</p>
    </div>
  </div>
  );
};

const ApproachSection = ({ proposal }) => {
  console.log('ApproachSection integratedApproach:', proposal.integratedApproach);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">戦略立案フェーズ</h4>
          <p className="text-purple-800 text-sm">{proposal.integratedApproach?.strategicPlanning}</p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">実行・運用フェーズ</h4>
          <p className="text-yellow-800 text-sm">{proposal.integratedApproach?.execution}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-cyan-50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-900 mb-2">分析・最適化フェーズ</h4>
          <p className="text-cyan-800 text-sm">{proposal.integratedApproach?.analysis}</p>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <h4 className="font-semibold text-indigo-900 mb-2">実行ロードマップ</h4>
          <p className="text-indigo-800 text-sm">{proposal.integratedApproach?.roadmap}</p>
        </div>
      </div>
    </div>
  </div>
);

const ExpertiseSection = ({ proposal }) => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-3">
        <Users className="h-5 w-5 text-primary-600" />
        <h3 className="font-semibold text-primary-900">求める人材像</h3>
      </div>
      <p className="text-primary-800 mb-4">{proposal.requiredExpertise?.roleDefinition}</p>
      <p className="text-sm text-primary-700">
        <strong>経験レベル:</strong> {proposal.requiredExpertise?.experienceLevel}
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">必要スキルセット</h4>
        <div className="space-y-2">
          {proposal.requiredExpertise?.skillSet?.map((skill, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">{skill}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">想定される人材タイプ</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• 戦略コンサルティングファーム出身者</p>
          <p>• 事業会社での実行経験豊富な専門家</p>
          <p>• スタートアップでの横断的業務経験者</p>
          <p>• フリーランスとしての専門性保有者</p>
        </div>
      </div>
    </div>
  </div>
);

const RemoteWorkSection = ({ proposal }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">コミュニケーション</h3>
        </div>
        <p className="text-blue-800 text-sm">{proposal.remoteWorkPlan?.communicationFrequency}</p>
      </div>

      <div className="bg-green-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <FileText className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-900">成果物・報告</h3>
        </div>
        <p className="text-green-800 text-sm">{proposal.remoteWorkPlan?.deliverables}</p>
      </div>

      <div className="bg-purple-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">コラボレーション</h3>
        </div>
        <p className="text-purple-800 text-sm">{proposal.remoteWorkPlan?.collaborationTools}</p>
      </div>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start space-x-2">
        <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-medium mb-1">リモートワーク成功のポイント</p>
          <ul className="space-y-1 text-xs">
            <li>• 明確な目標設定と定期的な進捗確認</li>
            <li>• 非同期コミュニケーションの活用</li>
            <li>• 成果物ベースでの評価体制</li>
            <li>• 必要に応じた対面でのキックオフ</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const OutcomeSection = ({ proposal }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-green-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-900">短期成果（3ヶ月）</h3>
        </div>
        <p className="text-green-800 text-sm">{proposal.expectedOutcome?.shortTerm}</p>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">中期成果（6ヶ月）</h3>
        </div>
        <p className="text-blue-800 text-sm">{proposal.expectedOutcome?.mediumTerm}</p>
      </div>

      <div className="bg-purple-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Star className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">長期成果（1年）</h3>
        </div>
        <p className="text-purple-800 text-sm">{proposal.expectedOutcome?.longTerm}</p>
      </div>
    </div>

    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="font-semibold text-gray-900 mb-3">ROI期待値</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600 mb-2">投資回収期間: 6-9ヶ月</p>
          <p className="text-gray-600">期待ROI: 200-300%</p>
        </div>
        <div>
          <p className="text-gray-600 mb-2">組織能力向上: 定性的価値</p>
          <p className="text-gray-600">継続的改善: プロセス化による持続性</p>
        </div>
      </div>
    </div>
  </div>
);

const RisksSection = ({ proposal }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-red-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-red-900">想定される課題</h3>
        </div>
        <div className="space-y-2">
          {proposal.riskMitigation?.potentialChallenges?.map((challenge, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <span className="text-red-800 text-sm">{challenge}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-900">対策・軽減策</h3>
        </div>
        <div className="space-y-2">
          {proposal.riskMitigation?.mitigationStrategies?.map((strategy, index) => (
            <div key={index} className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span className="text-green-800 text-sm">{strategy}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-blue-50 rounded-lg p-6">
      <h4 className="font-semibold text-blue-900 mb-3">成功要因</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
        <div>
          <p className="mb-2">• 経営層のコミット</p>
          <p className="mb-2">• 現場の協力体制</p>
          <p>• 適切な権限委譲</p>
        </div>
        <div>
          <p className="mb-2">• 明確な目標設定</p>
          <p className="mb-2">• 定期的な進捗確認</p>
          <p>• 柔軟な計画調整</p>
        </div>
      </div>
    </div>
  </div>
);

export default ProjectProposal;