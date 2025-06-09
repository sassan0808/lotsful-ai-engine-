"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Edit, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  FileText,
  Download
} from 'lucide-react';
import { TemplateManager } from '../../utils/templateManager';

const TemplateIntegration = ({ onTemplateUpdate, onContinueToAnalysis }) => {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSections, setEditingSections] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState(new Set(['basic', 'project', 'business']));
  const [qualityScore, setQualityScore] = useState(0);
  const [missingFields, setMissingFields] = useState([]);

  // テンプレート読み込み
  useEffect(() => {
    const loadedTemplate = TemplateManager.loadTemplate();
    setTemplate(loadedTemplate);
    calculateQualityScore(loadedTemplate);
    setLoading(false);
  }, []);

  // データ品質スコア計算
  const calculateQualityScore = (templateData) => {
    if (!templateData) return;

    const checkFields = [
      // 企業基本情報
      { section: 'companyProfile', field: 'name', weight: 10 },
      { section: 'companyProfile', field: 'industry', weight: 8 },
      { section: 'companyProfile', field: 'employeeCount', weight: 5 },
      { section: 'companyProfile', field: 'revenue', weight: 5 },
      { section: 'companyProfile', field: 'businessDescription', weight: 8 },
      
      // リサーチ情報
      { section: 'researchData', field: 'deepResearchMemo', weight: 10 },
      { section: 'researchData', field: 'organizationCulture', weight: 6 },
      { section: 'researchData', field: 'hypothesisInsights', weight: 8 },
      
      // 現状分析
      { section: 'currentAnalysis', field: 'businessPhase', weight: 6 },
      { section: 'currentAnalysis', field: 'challengeCategories', weight: 8 },
      { section: 'currentAnalysis', field: 'previousEfforts', weight: 6 },
      { section: 'currentAnalysis', field: 'teamComposition', weight: 7 },
      
      // プロジェクト設計
      { section: 'projectDesign', field: 'challengeSummary', weight: 8 },
      { section: 'projectDesign', field: 'urgencyReason', weight: 5 },
      { section: 'projectDesign', field: 'idealState3Months', weight: 6 },
      { section: 'projectDesign', field: 'budget', weight: 5 },
    ];

    let totalScore = 0;
    let maxScore = 0;
    const missing = [];

    checkFields.forEach(({ section, field, weight }) => {
      maxScore += weight;
      const value = templateData[section]?.[field];
      
      if (value && value !== '' && value !== '情報不足により特定不可') {
        if (Array.isArray(value) && value.length > 0) {
          totalScore += weight;
        } else if (typeof value === 'object' && Object.keys(value).length > 0) {
          totalScore += weight;
        } else if (typeof value === 'string') {
          totalScore += weight;
        } else if (typeof value === 'number') {
          totalScore += weight;
        }
      } else {
        missing.push({ section, field, weight });
      }
    });

    const score = Math.round((totalScore / maxScore) * 100);
    setQualityScore(score);
    setMissingFields(missing);
  };

  // セクション展開/折りたたみ
  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // 編集モード切り替え
  const toggleEdit = (sectionId) => {
    const newEditing = new Set(editingSections);
    if (newEditing.has(sectionId)) {
      newEditing.delete(sectionId);
    } else {
      newEditing.add(sectionId);
    }
    setEditingSections(newEditing);
  };

  // データ更新
  const handleFieldUpdate = (section, field, value) => {
    const updatedTemplate = {
      ...template,
      [section]: {
        ...template[section],
        [field]: value
      }
    };
    setTemplate(updatedTemplate);
    TemplateManager.saveTemplate(updatedTemplate);
    calculateQualityScore(updatedTemplate);
    if (onTemplateUpdate) {
      onTemplateUpdate(updatedTemplate);
    }
  };

  // 配列フィールド更新
  const handleArrayFieldUpdate = (section, field, index, value) => {
    const currentArray = template[section][field] || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    handleFieldUpdate(section, field, newArray);
  };

  // 配列アイテム追加
  const addArrayItem = (section, field) => {
    const currentArray = template[section][field] || [];
    const newArray = [...currentArray, ''];
    handleFieldUpdate(section, field, newArray);
  };

  // 配列アイテム削除
  const removeArrayItem = (section, field, index) => {
    const currentArray = template[section][field] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    handleFieldUpdate(section, field, newArray);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">テンプレートデータを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          テンプレートデータが見つかりません
        </h3>
        <p className="text-gray-600">
          Step1-3を完了してからお試しください。
        </p>
      </div>
    );
  }

  const SectionHeader = ({ title, sectionId, icon: Icon }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => toggleEdit(sectionId)}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => toggleSection(sectionId)}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        >
          {expandedSections.has(sectionId) ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );

  const FieldEditor = ({ label, value, onChange, multiline = false, isArray = false }) => {
    if (isArray) {
      const arrayValue = value || [];
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          {arrayValue.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={item}
                onChange={(e) => onChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={() => removeArrayItem('', '', index)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => addArrayItem('', '')}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            + 項目を追加
          </button>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        {multiline ? (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        ) : (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* データ品質スコア */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">テンプレートデータ統合・確認</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">{qualityScore}/100</div>
              <div className="text-sm text-gray-500">データ品質スコア</div>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              qualityScore >= 80 ? 'bg-green-100 text-green-600' :
              qualityScore >= 60 ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              {qualityScore >= 80 ? (
                <CheckCircle className="h-8 w-8" />
              ) : (
                <AlertCircle className="h-8 w-8" />
              )}
            </div>
          </div>
        </div>

        {missingFields.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">不足情報の改善提案</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {missingFields.slice(0, 5).map((field, index) => (
                <li key={index}>• {field.section}.{field.field} の入力で品質向上</li>
              ))}
              {missingFields.length > 5 && (
                <li className="text-yellow-600">他 {missingFields.length - 5} 項目...</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* 企業基本情報 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <SectionHeader title="企業基本情報" sectionId="basic" icon={FileText} />
        {expandedSections.has('basic') && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldEditor
                label="企業名"
                value={template.companyProfile?.name}
                onChange={(value) => handleFieldUpdate('companyProfile', 'name', value)}
              />
              <FieldEditor
                label="業界"
                value={template.companyProfile?.industry?.join(', ')}
                onChange={(value) => handleFieldUpdate('companyProfile', 'industry', value.split(',').map(s => s.trim()))}
              />
              <FieldEditor
                label="従業員数"
                value={template.companyProfile?.employeeCount}
                onChange={(value) => handleFieldUpdate('companyProfile', 'employeeCount', value)}
              />
              <FieldEditor
                label="年商"
                value={template.companyProfile?.revenue}
                onChange={(value) => handleFieldUpdate('companyProfile', 'revenue', value)}
              />
              <FieldEditor
                label="本社所在地"
                value={template.companyProfile?.headquarters}
                onChange={(value) => handleFieldUpdate('companyProfile', 'headquarters', value)}
              />
            </div>
            <FieldEditor
              label="事業内容"
              value={template.companyProfile?.businessDescription}
              onChange={(value) => handleFieldUpdate('companyProfile', 'businessDescription', value)}
              multiline
            />
          </div>
        )}
      </div>

      {/* 分析準備完了・実行ボタン */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary-900 mb-2">
              最終AI分析の準備
            </h3>
            <p className="text-primary-700 text-sm">
              データ品質スコア: {qualityScore}/100 
              {qualityScore >= 70 ? ' - 分析実行可能' : ' - もう少し情報を追加することをお勧めします'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              <Download className="h-4 w-4" />
              <span>PDF出力</span>
            </button>
            <button
              onClick={onContinueToAnalysis}
              disabled={qualityScore < 50}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-5 w-5" />
              <span>最終AI分析を開始</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateIntegration;