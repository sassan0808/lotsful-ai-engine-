"use client";

import React, { useState } from 'react';
import { MessageSquare, FileText, Users, TrendingUp, Clock, DollarSign, Edit3 } from 'lucide-react';

const ChallengesInput = ({ challenges, onChallengesChange }) => {
  const [activeTab, setActiveTab] = useState('structured');

  const handleStructuredChange = (field, value) => {
    onChallengesChange({
      ...challenges,
      structured: {
        ...challenges.structured,
        [field]: value
      }
    });
  };

  const handleFreeTextChange = (field, value) => {
    onChallengesChange({
      ...challenges,
      freeText: {
        ...challenges.freeText,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <MessageSquare className="h-8 w-8 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">課題・ニーズ情報</h2>
        </div>
        <p className="text-gray-600">
          商談で聞き取った情報を入力してください。すべて任意項目のため、入力できる範囲で構いません。
        </p>
      </div>

      {/* タブ切り替え */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setActiveTab('structured')}
            className={`flex-1 px-6 py-4 flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'structured'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="font-medium">構造化入力</span>
          </button>
          <button
            onClick={() => setActiveTab('freetext')}
            className={`flex-1 px-6 py-4 flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'freetext'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Edit3 className="h-5 w-5" />
            <span className="font-medium">自由記述</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'structured' ? (
            <StructuredTab challenges={challenges} onStructuredChange={handleStructuredChange} />
          ) : (
            <FreeTextTab challenges={challenges} onFreeTextChange={handleFreeTextChange} />
          )}
        </div>
      </div>
    </div>
  );
};

const StructuredTab = ({ challenges, onStructuredChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-sm text-primary-600 bg-primary-50 p-3 rounded-lg">
        💡 商談中にリアルタイムで入力できるよう、簡潔な項目に絞っています。すべて任意入力です。
      </div>

      {/* 現在の状況 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <h4 className="text-lg font-semibold text-gray-800">現在の状況</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              主な課題・チャレンジ
            </label>
            <textarea
              value={challenges.structured.mainChallenges}
              onChange={(e) => onStructuredChange('mainChallenges', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例：マーケティングROIが低い、エンジニア不足、DX推進が遅れている..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              具体的な困りごと
            </label>
            <textarea
              value={challenges.structured.specificIssues}
              onChange={(e) => onStructuredChange('specificIssues', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例：新規顧客獲得コストが高い、開発速度が遅い、データ分析ができていない..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              達成したい目標
            </label>
            <textarea
              value={challenges.structured.goals}
              onChange={(e) => onStructuredChange('goals', e.target.value)}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例：3ヶ月で売上20%向上、半年でDX推進、新サービスローンチ..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="inline h-4 w-4 mr-1" />
                希望タイムライン
              </label>
              <select
                value={challenges.structured.timeline}
                onChange={(e) => onStructuredChange('timeline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                <option value="urgent">至急（1ヶ月以内）</option>
                <option value="short">短期（1-3ヶ月）</option>
                <option value="medium">中期（3-6ヶ月）</option>
                <option value="long">長期（6ヶ月以上）</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="inline h-4 w-4 mr-1" />
                想定予算
              </label>
              <select
                value={challenges.structured.budget}
                onChange={(e) => onStructuredChange('budget', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                <option value="low">低（月20万円未満）</option>
                <option value="medium">中（月20-50万円）</option>
                <option value="high">高（月50-100万円）</option>
                <option value="very-high">非常に高（月100万円以上）</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 現在のリソース */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-primary-600" />
          <h4 className="text-lg font-semibold text-gray-800">現在のリソース</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              現在のチーム構成
            </label>
            <input
              type="text"
              value={challenges.structured.currentTeam}
              onChange={(e) => onStructuredChange('currentTeam', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例：エンジニア3名、マーケター2名、デザイナー1名..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              使用中のツール・技術
            </label>
            <input
              type="text"
              value={challenges.structured.tools}
              onChange={(e) => onStructuredChange('tools', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例：Salesforce、Google Analytics、Slack、AWS..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FreeTextTab = ({ challenges, onFreeTextChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
        💡 商談メモや文字起こしデータをそのまま貼り付けてください。AIが重要な情報を自動抽出します。
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            商談メモ
          </label>
          <textarea
            value={challenges.freeText.meetingNotes}
            onChange={(e) => onFreeTextChange('meetingNotes', e.target.value)}
            rows="8"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="商談中に取ったメモを自由に入力してください...

例：
- 顧客の課題や要望
- 現在の状況・困りごと
- 達成したい目標
- 予算感・タイムライン
- 意思決定者の関心事項
- 競合との比較検討状況
- その他気になったポイント"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文字起こしデータ
          </label>
          <textarea
            value={challenges.freeText.transcript}
            onChange={(e) => onFreeTextChange('transcript', e.target.value)}
            rows="10"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="商談の文字起こしデータを貼り付けてください...

録音アプリやZoomの文字起こし機能で取得したテキストをそのまま貼り付けることで、AIがより詳細な分析を行います。

※ 機密情報が含まれる場合はご注意ください"
          />
        </div>
      </div>

      {/* データ利用に関する注意 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <MessageSquare className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">データの取り扱いについて</p>
            <p>
              入力された情報はAI分析にのみ使用され、分析完了後は安全に削除されます。
              機密性の高い情報については、必要に応じて匿名化してご入力ください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesInput;