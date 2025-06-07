"use client";

import React, { useState } from 'react';
import { Tag, Search, X } from 'lucide-react';
import { INDUSTRIES, INDUSTRY_CATEGORIES, getIndustriesGroupedByCategory } from '../../data/industries';

const IndustrySelector = ({ selectedIndustries, onIndustryChange, autoDetectedIndustries = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set(['Eコマース・デジタル']));
  
  const groupedIndustries = getIndustriesGroupedByCategory();
  
  const filteredIndustries = searchTerm
    ? Object.keys(INDUSTRIES).filter(industry =>
        industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        INDUSTRIES[industry].description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleIndustry = (industry) => {
    const newSelected = selectedIndustries.includes(industry)
      ? selectedIndustries.filter(i => i !== industry)
      : [...selectedIndustries, industry];
    onIndustryChange(newSelected);
  };

  const removeIndustry = (industry) => {
    onIndustryChange(selectedIndustries.filter(i => i !== industry));
  };

  const clearAll = () => {
    onIndustryChange([]);
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Tag className="h-8 w-8 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">業種・領域選択</h2>
        </div>
        <p className="text-gray-600">
          企業の業種・領域を選択してください。複数選択可能です。
        </p>
      </div>

      {/* AI自動判定結果 */}
      {autoDetectedIndustries.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">AI判定結果</h3>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            企業情報の分析により、以下の業界が自動判定されました：
          </p>
          <div className="flex flex-wrap gap-2">
            {autoDetectedIndustries.map((industry) => (
              <span 
                key={industry} 
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-300"
              >
                ✓ {industry}
              </span>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            これらの業界は既に選択済みです。必要に応じて下記から追加・削除できます。
          </p>
        </div>
      )}

      {/* 選択済み業種表示 */}
      {selectedIndustries.length > 0 && (
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-primary-900">
              選択済み業種 ({selectedIndustries.length})
            </span>
            <button
              onClick={clearAll}
              className="text-sm text-primary-600 hover:text-primary-800 underline"
            >
              すべてクリア
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedIndustries.map((industry) => (
              <span
                key={industry}
                className={`inline-flex items-center space-x-1 px-3 py-1 text-sm rounded-full ${
                  autoDetectedIndustries.includes(industry) 
                    ? 'bg-blue-600 text-white border border-blue-700' 
                    : 'bg-primary-600 text-white'
                }`}
              >
                <span>{autoDetectedIndustries.includes(industry) ? '🤖 ' : ''}{industry}</span>
                <button
                  onClick={() => removeIndustry(industry)}
                  className="ml-1 hover:bg-primary-700 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 検索バー */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="業種を検索..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 業種選択エリア */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          {filteredIndustries ? (
            // 検索結果表示
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                検索結果 ({filteredIndustries.length}件)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredIndustries.map((industry) => (
                  <IndustryCard
                    key={industry}
                    industry={industry}
                    isSelected={selectedIndustries.includes(industry)}
                    onToggle={() => toggleIndustry(industry)}
                  />
                ))}
              </div>
            </div>
          ) : (
            // カテゴリ別表示
            <div className="space-y-6">
              {INDUSTRY_CATEGORIES.map((category) => (
                <div key={category} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {groupedIndustries[category]?.length || 0}業種
                      </span>
                      <div className={`transform transition-transform ${expandedCategories.has(category) ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                  
                  {expandedCategories.has(category) && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {groupedIndustries[category]?.map((industry) => (
                        <IndustryCard
                          key={industry}
                          industry={industry}
                          isSelected={selectedIndustries.includes(industry)}
                          onToggle={() => toggleIndustry(industry)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 推奨業種 */}
      <div className="bg-yellow-50 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">💡 推奨業種選択</h4>
        <p className="text-sm text-yellow-800 mb-3">
          より精度の高い分析のため、以下のような観点で業種を選択することをお勧めします：
        </p>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• メイン事業領域（例：EC、SaaS）</li>
          <li>• 関連する技術領域（例：AI、フィンテック）</li>
          <li>• ターゲット市場（例：B2B、B2C）</li>
          <li>• 成長段階や特性（例：スタートアップ、DX推進中）</li>
        </ul>
      </div>
    </div>
  );
};

const IndustryCard = ({ industry, isSelected, onToggle }) => {
  const industryData = INDUSTRIES[industry];
  
  return (
    <button
      onClick={onToggle}
      className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
        isSelected
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className={`font-semibold mb-1 ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
            {industry}
          </h4>
          <p className={`text-sm ${isSelected ? 'text-primary-700' : 'text-gray-600'}`}>
            {industryData.description}
          </p>
          {industryData.commonChallenges && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {industryData.commonChallenges.slice(0, 2).map((challenge, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2 py-1 rounded-full ${
                      isSelected
                        ? 'bg-primary-200 text-primary-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {challenge}
                  </span>
                ))}
                {industryData.commonChallenges.length > 2 && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isSelected
                        ? 'bg-primary-200 text-primary-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    +{industryData.commonChallenges.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className={`ml-2 ${isSelected ? 'text-primary-600' : 'text-gray-300'}`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default IndustrySelector;