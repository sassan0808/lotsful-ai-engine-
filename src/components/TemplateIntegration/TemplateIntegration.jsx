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
import { downloadPDF } from '../../utils/pdfGenerator';

const TemplateIntegration = ({ onTemplateUpdate, onContinueToAnalysis }) => {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSections, setEditingSections] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState(new Set(['basic', 'research', 'analysis', 'project', 'business']));
  const [qualityScore, setQualityScore] = useState(0);
  const [missingFields, setMissingFields] = useState([]);

  // テンプレート読み込み
  useEffect(() => {
    const loadedTemplate = TemplateManager.loadTemplate();
    setTemplate(loadedTemplate);
    calculateQualityScore(loadedTemplate);
    setLoading(false);
  }, []);

  // 分析精度スコア計算
  const calculateQualityScore = (templateData) => {
    if (!templateData) return;

    const analysisWeights = [
      // 🔴 超重要（15-20点）- AI分析の核となる情報
      { section: 'metadata', field: 'selectedBusinessItems', weight: 20, label: '選択された業務項目', category: 'critical' },
      { section: 'companyProfile', field: 'name', weight: 15, label: '企業名', category: 'critical' },
      { section: 'currentAnalysis', field: 'challengeCategories', weight: 15, label: '課題カテゴリ', category: 'critical' },
      
      // 🟡 重要（8-12点）- 分析精度を大幅向上
      { section: 'researchData', field: 'deepResearchMemo', weight: 12, label: 'ディープリサーチメモ', category: 'important' },
      { section: 'projectDesign', field: 'challengeSummary', weight: 10, label: '課題要約', category: 'important' },
      { section: 'companyProfile', field: 'industry', weight: 10, label: '業界', category: 'important' },
      { section: 'currentAnalysis', field: 'previousEfforts', weight: 8, label: 'これまでの取り組み', category: 'important' },
      { section: 'currentAnalysis', field: 'teamComposition', weight: 8, label: 'チーム構成', category: 'important' },
      
      // 🟢 中程度（5-7点）- 背景理解に必要
      { section: 'projectDesign', field: 'urgencyReason', weight: 7, label: '緊急性の理由', category: 'moderate' },
      { section: 'currentAnalysis', field: 'failureReasons', weight: 6, label: '失敗理由', category: 'moderate' },
      { section: 'projectDesign', field: 'idealState3Months', weight: 6, label: '3ヶ月後の理想状態', category: 'moderate' },
      { section: 'currentAnalysis', field: 'missingSkills', weight: 6, label: '不足スキル', category: 'moderate' },
      { section: 'researchData', field: 'organizationCulture', weight: 5, label: '組織文化・特徴', category: 'moderate' },
      { section: 'researchData', field: 'hypothesisInsights', weight: 5, label: '仮説・洞察', category: 'moderate' },
      
      // 🔵 補助的（2-4点）- あると良い
      { section: 'companyProfile', field: 'businessDescription', weight: 4, label: '事業内容', category: 'supplementary' },
      { section: 'projectDesign', field: 'budget', weight: 4, label: '予算', category: 'supplementary' },
      { section: 'companyProfile', field: 'employeeCount', weight: 3, label: '従業員数', category: 'supplementary' },
      { section: 'companyProfile', field: 'revenue', weight: 3, label: '年商', category: 'supplementary' },
      { section: 'companyProfile', field: 'headquarters', weight: 2, label: '本社所在地', category: 'supplementary' },
      { section: 'researchData', field: 'recentNews', weight: 2, label: '最近の動き・ニュース', category: 'supplementary' },
      
      // Step3固有の重要項目
      { section: 'metadata', field: 'actualWorkingHours', weight: 12, label: '実際の稼働時間', category: 'important' },
      { section: 'metadata', field: 'talentCount', weight: 10, label: '希望人数', category: 'important' },
    ];

    let totalScore = 0;
    let maxScore = 0;
    const missing = [];

    analysisWeights.forEach(({ section, field, weight, label, category }) => {
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
        missing.push({ section, field, weight, label, category });
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

  // PDF出力処理
  const handlePDFExport = async () => {
    if (!template) {
      alert('テンプレートデータが見つかりません');
      return;
    }

    try {
      console.log('PDF export started with template:', template);
      const result = await downloadPDF(template);
      console.log('PDF export result:', result);
      
      if (result && result.success) {
        alert(`PDF出力完了: ${result.filename}`);
      } else {
        const errorMessage = result && result.error ? result.error : 'undefined';
        console.error('PDF export failed:', errorMessage);
        alert(`PDF出力エラー: ${errorMessage}`);
      }
    } catch (error) {
      console.error('PDF export error:', error);
      alert(`PDF出力中にエラーが発生しました: ${error.message}`);
    }
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
              <div className="text-sm text-gray-500">分析精度スコア</div>
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">🎯 分析精度向上のための推奨入力</h4>
            <ul className="text-sm space-y-1">
              {missingFields
                .sort((a, b) => b.weight - a.weight) // 重要度順にソート
                .slice(0, 5)
                .map((field, index) => {
                  const emoji = field.category === 'critical' ? '🔴' : 
                               field.category === 'important' ? '🟡' : 
                               field.category === 'moderate' ? '🟢' : '🔵';
                  const impact = field.weight >= 15 ? '大きく影響' :
                                field.weight >= 8 ? '向上' :
                                field.weight >= 5 ? '改善' : '補強';
                  return (
                    <li key={index} className={`${
                      field.category === 'critical' ? 'text-red-700' :
                      field.category === 'important' ? 'text-orange-700' :
                      field.category === 'moderate' ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      {emoji} <strong>{field.label}</strong> (+{field.weight}点) - 分析精度を{impact}
                    </li>
                  );
                })}
              {missingFields.length > 5 && (
                <li className="text-blue-600">他 {missingFields.length - 5} 項目...</li>
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

      {/* 事前リサーチ情報 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <SectionHeader title="事前リサーチ情報" sectionId="research" icon={Eye} />
        {expandedSections.has('research') && (
          <div className="p-6 space-y-4">
            <FieldEditor
              label="ディープリサーチメモ"
              value={template.researchData?.deepResearchMemo}
              onChange={(value) => handleFieldUpdate('researchData', 'deepResearchMemo', value)}
              multiline
            />
            <FieldEditor
              label="最近の動き・ニュース"
              value={template.researchData?.recentNews}
              onChange={(value) => handleFieldUpdate('researchData', 'recentNews', value)}
              multiline
            />
            <FieldEditor
              label="組織文化・特徴"
              value={template.researchData?.organizationCulture}
              onChange={(value) => handleFieldUpdate('researchData', 'organizationCulture', value)}
              multiline
            />
            <FieldEditor
              label="仮説・洞察"
              value={template.researchData?.hypothesisInsights}
              onChange={(value) => handleFieldUpdate('researchData', 'hypothesisInsights', value)}
              multiline
            />
          </div>
        )}
      </div>

      {/* 現状分析 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <SectionHeader title="現状分析" sectionId="analysis" icon={CheckCircle} />
        {expandedSections.has('analysis') && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldEditor
                label="事業フェーズ"
                value={template.currentAnalysis?.businessPhase}
                onChange={(value) => handleFieldUpdate('currentAnalysis', 'businessPhase', value)}
              />
              <FieldEditor
                label="外部人材経験"
                value={template.currentAnalysis?.externalTalentExperience}
                onChange={(value) => handleFieldUpdate('currentAnalysis', 'externalTalentExperience', value)}
              />
            </div>
            <FieldEditor
              label="課題カテゴリ"
              value={template.currentAnalysis?.challengeCategories?.join(', ')}
              onChange={(value) => handleFieldUpdate('currentAnalysis', 'challengeCategories', value.split(',').map(s => s.trim()))}
            />
            <FieldEditor
              label="これまでの取り組み"
              value={template.currentAnalysis?.previousEfforts}
              onChange={(value) => handleFieldUpdate('currentAnalysis', 'previousEfforts', value)}
              multiline
            />
            <FieldEditor
              label="失敗理由"
              value={template.currentAnalysis?.failureReasons}
              onChange={(value) => handleFieldUpdate('currentAnalysis', 'failureReasons', value)}
              multiline
            />
            <FieldEditor
              label="不足スキル"
              value={template.currentAnalysis?.missingSkills?.join(', ')}
              onChange={(value) => handleFieldUpdate('currentAnalysis', 'missingSkills', value.split(',').map(s => s.trim()))}
            />
          </div>
        )}
      </div>

      {/* プロジェクト設計 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <SectionHeader title="プロジェクト設計" sectionId="project" icon={FileText} />
        {expandedSections.has('project') && (
          <div className="p-6 space-y-4">
            <FieldEditor
              label="課題要約"
              value={template.projectDesign?.challengeSummary}
              onChange={(value) => handleFieldUpdate('projectDesign', 'challengeSummary', value)}
              multiline
            />
            <FieldEditor
              label="緊急性の理由"
              value={template.projectDesign?.urgencyReason}
              onChange={(value) => handleFieldUpdate('projectDesign', 'urgencyReason', value)}
              multiline
            />
            <FieldEditor
              label="3ヶ月後の理想状態"
              value={template.projectDesign?.idealState3Months}
              onChange={(value) => handleFieldUpdate('projectDesign', 'idealState3Months', value)}
              multiline
            />
            <FieldEditor
              label="期待成果物"
              value={template.projectDesign?.deliverables?.join(', ')}
              onChange={(value) => handleFieldUpdate('projectDesign', 'deliverables', value.split(',').map(s => s.trim()))}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FieldEditor
                label="月額予算"
                value={template.projectDesign?.budget?.monthlyBudget?.toString()}
                onChange={(value) => handleFieldUpdate('projectDesign', 'budget', {
                  ...template.projectDesign?.budget,
                  monthlyBudget: parseInt(value) || 0
                })}
              />
              <FieldEditor
                label="期間(ヶ月)"
                value={template.projectDesign?.budget?.duration?.toString()}
                onChange={(value) => handleFieldUpdate('projectDesign', 'budget', {
                  ...template.projectDesign?.budget,
                  duration: parseInt(value) || 0
                })}
              />
              <FieldEditor
                label="総予算"
                value={template.projectDesign?.budget?.totalBudget?.toString()}
                onChange={(value) => handleFieldUpdate('projectDesign', 'budget', {
                  ...template.projectDesign?.budget,
                  totalBudget: parseInt(value) || 0
                })}
              />
            </div>
          </div>
        )}
      </div>

      {/* 選択業務項目 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <SectionHeader title="選択業務項目" sectionId="business" icon={CheckCircle} />
        {expandedSections.has('business') && (
          <div className="p-6 space-y-4">
            {template.metadata?.selectedBusinessItems?.length > 0 ? (
              <div>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-900">
                      選択項目数: {template.metadata.selectedBusinessItems.length}項目
                    </span>
                    <div className="text-sm text-blue-700">
                      稼働時間: {template.metadata.actualWorkingHours || '未設定'}時間/月 | 
                      人数: {template.metadata.talentCount || 1}名
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {template.metadata.selectedBusinessItems.map((item, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">{item.category}</span>
                          <span className="mx-2 text-gray-400">/</span>
                          <span className="text-gray-700">{item.phase}</span>
                        </div>
                        <span className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded">
                          業務項目
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{item.item || item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>業務項目が選択されていません</p>
                <p className="text-sm mt-2">Step3で業務項目を選択してください</p>
              </div>
            )}
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
              分析精度スコア: {qualityScore}/100 
              {qualityScore >= 70 ? ' - 高精度分析が可能です' : 
               qualityScore >= 50 ? ' - 分析実行可能（推奨項目の入力で精度向上）' : 
               ' - 重要項目の入力で分析精度が大幅に向上します'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handlePDFExport}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
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