"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Info } from 'lucide-react';
import { BUSINESS_CATEGORIES, DETAILED_BUSINESS_ITEMS, getBusinessItems } from '../../data/businessCategories';

const BusinessMatrix = ({ selectedItems, onSelectionChange, workingHours, onWorkingHoursChange, talentCount, onTalentCountChange }) => {
  const [expandedCells, setExpandedCells] = useState(new Set());
  const [hoveredCell, setHoveredCell] = useState(null);

  const toggleCellExpansion = (categoryIndex, phaseIndex) => {
    const cellKey = `${categoryIndex}-${phaseIndex}`;
    const newExpanded = new Set(expandedCells);
    
    if (newExpanded.has(cellKey)) {
      newExpanded.delete(cellKey);
    } else {
      newExpanded.add(cellKey);
    }
    
    setExpandedCells(newExpanded);
  };

  const isCellExpanded = (categoryIndex, phaseIndex) => {
    return expandedCells.has(`${categoryIndex}-${phaseIndex}`);
  };

  const isItemSelected = (category, phase, item) => {
    return selectedItems.some(selected => 
      selected.category === category && 
      selected.phase === phase && 
      selected.item === item
    );
  };

  const handleItemToggle = (category, phase, item) => {
    const isSelected = isItemSelected(category, phase, item);
    
    if (isSelected) {
      // アイテムを削除
      const newSelectedItems = selectedItems.filter(selected => 
        !(selected.category === category && selected.phase === phase && selected.item === item)
      );
      onSelectionChange(newSelectedItems);
    } else {
      // アイテムを追加
      const newSelectedItems = [...selectedItems, { category, phase, item }];
      onSelectionChange(newSelectedItems);
    }
  };

  const getCellItemsCount = (category, phase) => {
    const items = getBusinessItems(category, phase);
    return items.length;
  };

  const getCellSelectedCount = (category, phase) => {
    return selectedItems.filter(selected => 
      selected.category === category && selected.phase === phase
    ).length;
  };

  const getCellColor = (category) => {
    const colors = {
      '事業開発': 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      'マーケティング': 'bg-green-50 border-green-200 hover:bg-green-100', 
      'セールス': 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      '広報': 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      '人事': 'bg-pink-50 border-pink-200 hover:bg-pink-100',
      '経営企画・バックオフィス': 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      'IT/DX': 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100'
    };
    return colors[category] || 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  };

  const getCategoryHeaderColor = (category) => {
    const colors = {
      '事業開発': 'bg-blue-600 text-white',
      'マーケティング': 'bg-green-600 text-white',
      'セールス': 'bg-yellow-600 text-white', 
      '広報': 'bg-purple-600 text-white',
      '人事': 'bg-pink-600 text-white',
      '経営企画・バックオフィス': 'bg-indigo-600 text-white',
      'IT/DX': 'bg-cyan-600 text-white'
    };
    return colors[category] || 'bg-gray-600 text-white';
  };

  return (
    <div className="space-y-6">
      {/* 稼働時間設定 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Info className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-800">想定稼働時間</h3>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            月間稼働時間:
          </label>
          <input
            type="range"
            min="10"
            max="80"
            step="5"
            value={workingHours}
            onChange={(e) => onWorkingHoursChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-lg font-semibold text-primary-600 min-w-[80px]">
            {workingHours}時間/月
          </span>
        </div>
        
        {/* 人数選択 */}
        <div className="flex items-center space-x-4 mt-4">
          <label className="text-sm font-medium text-gray-700">
            副業人材希望人数:
          </label>
          <select
            value={talentCount || 1}
            onChange={(e) => onTalentCountChange && onTalentCountChange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num}名</option>
            ))}
          </select>
          <span className="text-lg font-semibold text-green-600">
            {talentCount || 1}名
          </span>
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          副業/兼業人材の一般的な稼働時間: 10-80時間/月（推奨30時間）
          <br />
          {talentCount > 1 && (
            <span className="text-blue-600">
              {talentCount}名で{workingHours}時間の場合：1名{Math.round(workingHours / talentCount)}時間ずつ または 分担調整可能
            </span>
          )}
        </div>
      </div>

      {/* 選択サマリー */}
      <div className="bg-primary-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-primary-600" />
            <span className="font-semibold text-primary-900">選択済み項目</span>
          </div>
          <span className="text-primary-700 font-semibold">
            {selectedItems.length} 項目選択中
          </span>
        </div>
        {selectedItems.length > 0 && (
          <div className="mt-2 text-sm text-primary-700">
            {BUSINESS_CATEGORIES.categories.map(category => {
              const categoryItems = selectedItems.filter(item => item.category === category);
              return categoryItems.length > 0 && (
                <span key={category} className="inline-block mr-4">
                  {category}: {categoryItems.length}項目
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 業務マトリックス */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">業務選択マトリックス</h3>
          <p className="text-sm text-gray-600 mt-1">
            各セルをクリックして詳細項目を表示し、必要な業務をチェックしてください
          </p>
        </div>

        {/* マトリックステーブル */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* ヘッダー行 */}
            <thead>
              <tr>
                <th className="w-48 p-4 bg-gray-100 border-r border-gray-200 text-left font-semibold text-gray-900">
                  業務分類 / フェーズ
                </th>
                {BUSINESS_CATEGORIES.phases.map((phase) => (
                  <th key={phase} className="p-4 bg-gray-100 border-r border-gray-200 text-center font-semibold text-gray-900 min-w-[200px]">
                    {phase}
                  </th>
                ))}
              </tr>
            </thead>

            {/* 業務分類行 */}
            <tbody>
              {BUSINESS_CATEGORIES.categories.map((category, categoryIndex) => (
                <React.Fragment key={category}>
                  <tr className="border-b border-gray-200">
                    {/* カテゴリ名セル */}
                    <td className={`p-4 border-r border-gray-200 font-semibold ${getCategoryHeaderColor(category)}`}>
                      {category}
                    </td>

                    {/* 各フェーズのセル */}
                    {BUSINESS_CATEGORIES.phases.map((phase, phaseIndex) => {
                      const cellKey = `${categoryIndex}-${phaseIndex}`;
                      const isExpanded = isCellExpanded(categoryIndex, phaseIndex);
                      const itemsCount = getCellItemsCount(category, phase);
                      const selectedCount = getCellSelectedCount(category, phase);
                      
                      return (
                        <td 
                          key={phase} 
                          className={`p-2 border-r border-gray-200 align-top ${getCellColor(category)}`}
                          onMouseEnter={() => setHoveredCell(cellKey)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {/* セルヘッダー */}
                          <button
                            onClick={() => toggleCellExpansion(categoryIndex, phaseIndex)}
                            className="w-full flex items-center justify-between p-2 rounded-lg transition-all hover:shadow-md"
                          >
                            <div className="flex items-center space-x-2">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
                              <span className="text-sm font-medium text-gray-700">
                                {itemsCount}項目
                              </span>
                            </div>
                            {selectedCount > 0 && (
                              <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                                {selectedCount}
                              </span>
                            )}
                          </button>

                          {/* 展開された詳細項目リスト */}
                          {isExpanded && (
                            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                              {getBusinessItems(category, phase).map((item, itemIndex) => (
                                <label
                                  key={itemIndex}
                                  className="flex items-start space-x-2 p-2 rounded-md hover:bg-white hover:shadow-sm cursor-pointer transition-all"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isItemSelected(category, phase, item)}
                                    onChange={() => handleItemToggle(category, phase, item)}
                                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  />
                                  <span className="text-xs text-gray-700 leading-tight">
                                    {item}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 選択項目詳細（下部に表示） */}
      {selectedItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">選択された業務項目</h4>
          <div className="space-y-3">
            {BUSINESS_CATEGORIES.categories.map(category => {
              const categoryItems = selectedItems.filter(item => item.category === category);
              return categoryItems.length > 0 && (
                <div key={category} className="border-l-4 border-primary-500 pl-4">
                  <h5 className="font-semibold text-gray-800 mb-2">{category}</h5>
                  <div className="space-y-1">
                    {BUSINESS_CATEGORIES.phases.map(phase => {
                      const phaseItems = categoryItems.filter(item => item.phase === phase);
                      return phaseItems.length > 0 && (
                        <div key={phase} className="ml-4">
                          <span className="text-sm font-medium text-gray-600">{phase}:</span>
                          <ul className="mt-1 space-y-1">
                            {phaseItems.map((selectedItem, index) => (
                              <li key={index} className="text-sm text-gray-700 ml-4">
                                • {selectedItem.item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessMatrix;