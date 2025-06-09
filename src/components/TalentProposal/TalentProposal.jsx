"use client";

import React, { useState } from 'react';
import { 
  Users, Target, Clock, MapPin, Star, Lightbulb, 
  CheckCircle, ChevronDown, ChevronUp, Download, Share2
} from 'lucide-react';

const TalentProposal = ({ proposal, onExport, onShare }) => {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    positions: true,
    plans: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getWorkingPatternIcon = (type) => {
    switch (type) {
      case 'advisor': return '💡';
      case 'standard': return '⚡';
      case 'execution': return '🚀';
      case 'fullcommit': return '🔥';
      default: return '💼';
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">人材提案書</h2>
          </div>
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

        {/* 推奨体制概要 */}
        <div className="bg-primary-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">
            推奨体制：{proposal.recommendedTeam.title}
          </h3>
          <p className="text-primary-800">
            <span className="font-medium">選定理由：</span>
            {proposal.recommendedTeam.reason}
          </p>
        </div>
      </div>

      {/* ポジション詳細 */}
      <div className="bg-white rounded-lg shadow-lg">
        <div 
          className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('positions')}
        >
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">ポジション詳細</h3>
          </div>
          {expandedSections.positions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        
        {expandedSections.positions && (
          <div className="p-6 space-y-8">
            {proposal.positions.map((position, index) => (
              <PositionDetail key={position.id} position={position} index={index + 1} />
            ))}
          </div>
        )}
      </div>

      {/* 体制オプション */}
      <div className="bg-white rounded-lg shadow-lg">
        <div 
          className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('plans')}
        >
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">体制オプション</h3>
          </div>
          {expandedSections.plans ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        
        {expandedSections.plans && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {proposal.teamPlans.map((plan) => (
                <TeamPlanCard key={plan.id} plan={plan} positions={proposal.positions} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ポジション詳細コンポーネント
const PositionDetail = ({ position, index }) => {
  const getImportanceStars = (importance) => {
    return '★'.repeat(importance) + '☆'.repeat(5 - importance);
  };

  const getWorkingPatternIcon = (type) => {
    switch (type) {
      case 'advisor': return '💡';
      case 'standard': return '⚡';
      case 'execution': return '🚀';
      case 'fullcommit': return '🔥';
      default: return '💼';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h4 className="text-xl font-bold text-gray-900 mb-2">
          Position {index}: {position.title}
        </h4>
      </div>

      {/* 基本情報 */}
      <div className="mb-6">
        <h5 className="text-lg font-semibold text-gray-800 mb-3">基本情報</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">稼働: 月{position.basicInfo.monthlyHours}時間</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">期間: {position.basicInfo.duration}ヶ月</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">形態: {position.basicInfo.workStyle}</span>
          </div>
        </div>
      </div>

      {/* 稼働パターン */}
      <div className="mb-6">
        <h5 className="text-lg font-semibold text-gray-800 mb-3">稼働パターン</h5>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getWorkingPatternIcon(position.workingPattern.type)}</span>
            <span className="font-medium text-blue-900">
              推奨稼働：週{Math.round(position.basicInfo.monthlyHours / 4)}時間
            </span>
          </div>
          <p className="text-blue-800 mb-3">{position.workingPattern.description}</p>
          <ul className="space-y-1">
            {position.workingPattern.details.map((detail, idx) => (
              <li key={idx} className="text-sm text-blue-700">• {detail}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ミッション */}
      <div className="mb-6">
        <h5 className="text-lg font-semibold text-gray-800 mb-3">ミッション</h5>
        <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{position.mission}</p>
      </div>

      {/* 業務内容 */}
      <div className="mb-6">
        <h5 className="text-lg font-semibold text-gray-800 mb-3">業務内容</h5>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">カテゴリ</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">具体的業務</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">稼働配分</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">重要度</th>
              </tr>
            </thead>
            <tbody>
              {position.tasks.map((task, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium text-gray-800">{task.category}</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">{task.task}</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">{task.hoursPerWeek}時間/週</td>
                  <td className="border border-gray-300 px-4 py-2">{getImportanceStars(task.importance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 要件定義 */}
      <div className="mb-6">
        <h5 className="text-lg font-semibold text-gray-800 mb-3">要件定義</h5>
        <div className="space-y-4">
          <div>
            <h6 className="font-medium text-gray-700 mb-2">必須スキル</h6>
            <div className="space-y-1">
              {position.requirements.mandatorySkills.map((skill, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <span className="text-red-500">🔴</span>
                  <span className="text-sm text-gray-700">{skill}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h6 className="font-medium text-gray-700 mb-2">歓迎スキル</h6>
            <div className="space-y-1">
              {position.requirements.preferredSkills.map((skill, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <span className="text-yellow-500">🟡</span>
                  <span className="text-sm text-gray-700">{skill}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h6 className="font-medium text-gray-700 mb-2">求める人物像</h6>
            <div className="space-y-1">
              {position.requirements.personalityTraits.map((trait, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Lightbulb className="h-3 w-3 text-yellow-500" />
                  <span className="text-sm text-gray-700">{trait}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 想定プロフィール */}
      <div>
        <h5 className="text-lg font-semibold text-gray-800 mb-3">想定プロフィール</h5>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-green-800 whitespace-pre-line">{position.profileExample}</p>
        </div>
      </div>
    </div>
  );
};

// チームプランカード
const TeamPlanCard = ({ plan, positions }) => {
  const getPlanColor = (type) => {
    switch (type) {
      case 'standard': return 'border-green-200 bg-green-50';
      case 'light': return 'border-blue-200 bg-blue-50';
      case 'advisory': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPlanIcon = (type) => {
    switch (type) {
      case 'standard': return '⭐';
      case 'light': return '💡';
      case 'advisory': return '🎯';
      default: return '📋';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getPlanColor(plan.type)}`}>
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">{getPlanIcon(plan.type)}</span>
        <h6 className="font-semibold text-gray-800">{plan.name}</h6>
        {plan.type === 'standard' && (
          <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">推奨</span>
        )}
      </div>

      <div className="mb-3">
        <h7 className="font-medium text-gray-700 mb-1 block">構成：</h7>
        {plan.composition.map((comp, idx) => {
          const position = positions.find(p => p.id === comp.positionId);
          return (
            <div key={idx} className="text-sm text-gray-600 mb-1">
              • {position?.title}：月{comp.monthlyHours}時間
            </div>
          );
        })}
        <div className="text-sm font-medium text-gray-700 mt-2">
          合計稼働：月{plan.totalMonthlyHours}時間
        </div>
      </div>

      <div className="mb-3">
        <h7 className="font-medium text-gray-700 mb-1 block">特徴：</h7>
        <ul className="space-y-1">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="text-sm text-gray-600">• {feature}</li>
          ))}
        </ul>
      </div>

      {plan.notes && plan.notes.length > 0 && (
        <div>
          <h7 className="font-medium text-gray-700 mb-1 block">注意点：</h7>
          <ul className="space-y-1">
            {plan.notes.map((note, idx) => (
              <li key={idx} className="text-sm text-gray-600">• {note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TalentProposal;