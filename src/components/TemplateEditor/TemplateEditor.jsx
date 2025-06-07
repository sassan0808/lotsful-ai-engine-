"use client";

import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, BarChart3, Target, Sparkles, Save, 
  ChevronDown, ChevronUp, Loader2, CheckCircle, AlertTriangle,
  Edit3, FileText, Users, MapPin, Calendar
} from 'lucide-react';
import { TemplateManager } from '../../utils/templateManager';

const TemplateEditor = ({ onTemplateUpdate }) => {
  const [template, setTemplate] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    company: true,
    research: true,
    analysis: true,
    project: false
  });
  const [hasChanges, setHasChanges] = useState(false);

  // テンプレート初期化
  useEffect(() => {
    const loadedTemplate = TemplateManager.loadTemplate();
    setTemplate(loadedTemplate);
  }, []);

  // セクション展開/折りたたみ
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // フィールド値更新
  const updateField = (section, field, value) => {
    if (!template) return;
    
    const updatedTemplate = {
      ...template,
      [section]: {
        ...template[section],
        [field]: value
      }
    };
    
    setTemplate(updatedTemplate);
    setHasChanges(true);
  };

  // ネストされたフィールド更新
  const updateNestedField = (section, parentField, field, value) => {
    if (!template) return;
    
    const updatedTemplate = {
      ...template,
      [section]: {
        ...template[section],
        [parentField]: {
          ...template[section][parentField],
          [field]: value
        }
      }
    };
    
    setTemplate(updatedTemplate);
    setHasChanges(true);
  };

  // 配列フィールド更新
  const updateArrayField = (section, field, index, value) => {
    if (!template) return;
    
    const updatedArray = [...template[section][field]];
    updatedArray[index] = value;
    
    updateField(section, field, updatedArray);
  };

  // 配列項目追加
  const addArrayItem = (section, field, defaultValue = '') => {
    if (!template) return;
    
    const updatedArray = [...template[section][field], defaultValue];
    updateField(section, field, updatedArray);
  };

  // 配列項目削除
  const removeArrayItem = (section, field, index) => {
    if (!template) return;
    
    const updatedArray = template[section][field].filter((_, i) => i !== index);
    updateField(section, field, updatedArray);
  };

  // テンプレート保存
  const saveTemplate = () => {
    if (!template) return;
    
    TemplateManager.saveTemplate(template);
    setHasChanges(false);
    
    // 上位コンポーネントに通知
    if (onTemplateUpdate) {
      onTemplateUpdate(template);
    }
  };

  // AI分析実行
  const handleAIAnalysis = async () => {
    if (!template) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze-step2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: template,
          focusAreas: ['currentAnalysis', 'projectDesign']
        })
      });

      if (!response.ok) {
        throw new Error('Step2 analysis failed');
      }

      const analysisResult = await response.json();
      
      // AI分析結果でテンプレートを更新
      const updatedTemplate = TemplateManager.updateStep2(
        analysisResult.currentAnalysis,
        analysisResult.projectDesign
      );
      
      setTemplate(updatedTemplate);
      setHasChanges(false);
      
      if (onTemplateUpdate) {
        onTemplateUpdate(updatedTemplate);
      }
    } catch (error) {
      console.error('Step2 AI analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!template) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">テンプレートを読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Edit3 className="h-8 w-8 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">情報統合編集</h2>
        </div>
        <p className="text-gray-600">
          これまでの情報を確認・編集し、追加情報を入力してください。AI分析で不足情報を補完できます。
        </p>
      </div>

      {/* 保存状況 */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">未保存の変更があります</span>
            </div>
            <button
              onClick={saveTemplate}
              className="flex items-center space-x-2 px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>保存</span>
            </button>
          </div>
        </div>
      )}

      {/* 🏢 会社情報セクション */}
      <CompanyInfoSection 
        template={template}
        expanded={expandedSections.company}
        onToggle={() => toggleSection('company')}
        onUpdate={updateField}
        onUpdateArray={updateArrayField}
        onAddArray={addArrayItem}
        onRemoveArray={removeArrayItem}
      />

      {/* 🔍 リサーチデータセクション */}
      <ResearchDataSection 
        template={template}
        expanded={expandedSections.research}
        onToggle={() => toggleSection('research')}
        onUpdate={updateField}
        onUpdateArray={updateArrayField}
        onAddArray={addArrayItem}
        onRemoveArray={removeArrayItem}
      />

      {/* 📊 現状分析セクション */}
      <CurrentAnalysisSection 
        template={template}
        expanded={expandedSections.analysis}
        onToggle={() => toggleSection('analysis')}
        onUpdate={updateField}
        onUpdateNested={updateNestedField}
        onUpdateArray={updateArrayField}
        onAddArray={addArrayItem}
        onRemoveArray={removeArrayItem}
      />

      {/* 🎯 プロジェクト設計セクション */}
      <ProjectDesignSection 
        template={template}
        expanded={expandedSections.project}
        onToggle={() => toggleSection('project')}
        onUpdate={updateField}
        onUpdateNested={updateNestedField}
        onUpdateArray={updateArrayField}
        onAddArray={addArrayItem}
        onRemoveArray={removeArrayItem}
      />

      {/* アクションボタン */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={saveTemplate}
            disabled={!hasChanges}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save className="h-4 w-4" />
            <span>変更を保存</span>
          </button>
          
          {!hasChanges && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">保存済み</span>
            </div>
          )}
        </div>

        <button
          onClick={handleAIAnalysis}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>AI分析中...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>AI分析で情報補完</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// 🏢 会社情報セクション
const CompanyInfoSection = ({ template, expanded, onToggle, onUpdate, onUpdateArray, onAddArray, onRemoveArray }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
    >
      <div className="flex items-center space-x-2">
        <Building2 className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">🏢 会社情報</h3>
        {template.metadata.step1Completed && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Step1完了</span>
        )}
      </div>
      {expanded ? <ChevronUp className="h-5 w-5 text-blue-600" /> : <ChevronDown className="h-5 w-5 text-blue-600" />}
    </button>
    
    {expanded && (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">企業名</label>
            <input
              type="text"
              value={template.companyProfile.name}
              onChange={(e) => onUpdate('companyProfile', 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="株式会社○○"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">従業員数</label>
            <select
              value={template.companyProfile.employeeCount}
              onChange={(e) => onUpdate('companyProfile', 'employeeCount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              <option value="startup">スタートアップ</option>
              <option value="1-10">1-10名</option>
              <option value="11-50">11-50名</option>
              <option value="51-100">51-100名</option>
              <option value="101-300">101-300名</option>
              <option value="301-1000">301-1000名</option>
              <option value="1000+">1000名以上</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年商</label>
            <select
              value={template.companyProfile.revenue}
              onChange={(e) => onUpdate('companyProfile', 'revenue', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              <option value="under_100m">1億未満</option>
              <option value="100m-500m">1-5億</option>
              <option value="500m-1b">5-10億</option>
              <option value="1b-5b">10-50億</option>
              <option value="5b-10b">50-100億</option>
              <option value="10b+">100億以上</option>
              <option value="unknown">不明</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">本社所在地</label>
            <input
              type="text"
              value={template.companyProfile.headquarters || ''}
              onChange={(e) => onUpdate('companyProfile', 'headquarters', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="東京都渋谷区..."
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">業界</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {template.companyProfile.industry.map((industry, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200 flex items-center space-x-1">
                <span>{industry}</span>
                <button
                  onClick={() => onRemoveArray('companyProfile', 'industry', index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <button
            onClick={() => onAddArray('companyProfile', 'industry', '')}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            + 業界を追加
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">事業内容</label>
          <textarea
            value={template.companyProfile.businessDescription || ''}
            onChange={(e) => onUpdate('companyProfile', 'businessDescription', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="主な事業やサービスの内容..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">主要顧客層</label>
          <input
            type="text"
            value={template.companyProfile.mainCustomers || ''}
            onChange={(e) => onUpdate('companyProfile', 'mainCustomers', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="BtoB企業、一般消費者など..."
          />
        </div>
      </div>
    )}
  </div>
);

// 🔍 リサーチデータセクション
const ResearchDataSection = ({ template, expanded, onToggle, onUpdate, onUpdateArray, onAddArray, onRemoveArray }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 transition-colors"
    >
      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-green-900">🔍 事前リサーチ情報</h3>
      </div>
      {expanded ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
    </button>
    
    {expanded && (
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ディープリサーチメモ</label>
          <textarea
            value={template.researchData.deepResearchMemo}
            onChange={(e) => onUpdate('researchData', 'deepResearchMemo', e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="企業HP、プレスリリース、SNSなどから収集した詳細情報..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">最近の動き・ニュース</label>
          <textarea
            value={template.researchData.recentNews}
            onChange={(e) => onUpdate('researchData', 'recentNews', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="最近のプレスリリース、資金調達、事業展開など..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">組織の特徴・文化</label>
          <textarea
            value={template.researchData.organizationCulture}
            onChange={(e) => onUpdate('researchData', 'organizationCulture', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="採用ページ、社員インタビューから読み取れる組織の特徴..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">仮説・洞察</label>
          <textarea
            value={template.researchData.hypothesisInsights}
            onChange={(e) => onUpdate('researchData', 'hypothesisInsights', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="リサーチから読み取れる課題仮説や商談での確認事項..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">商談確認事項</label>
          {template.researchData.meetingCheckpoints.map((checkpoint, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={checkpoint}
                onChange={(e) => onUpdateArray('researchData', 'meetingCheckpoints', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="商談で確認したいポイント..."
              />
              <button
                onClick={() => onRemoveArray('researchData', 'meetingCheckpoints', index)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => onAddArray('researchData', 'meetingCheckpoints', '')}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            + 確認事項を追加
          </button>
        </div>
      </div>
    )}
  </div>
);

// 📊 現状分析セクション
const CurrentAnalysisSection = ({ template, expanded, onToggle, onUpdate, onUpdateNested, onUpdateArray, onAddArray, onRemoveArray }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 transition-colors"
    >
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-900">📊 現状分析</h3>
      </div>
      {expanded ? <ChevronUp className="h-5 w-5 text-purple-600" /> : <ChevronDown className="h-5 w-5 text-purple-600" />}
    </button>
    
    {expanded && (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">事業フェーズ</label>
            <select
              value={template.currentAnalysis.businessPhase}
              onChange={(e) => onUpdate('currentAnalysis', 'businessPhase', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              <option value="startup">立ち上げ期（0→1）</option>
              <option value="growth">成長期（1→10）</option>
              <option value="expansion">拡大期（10→100）</option>
              <option value="mature">成熟期</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">外部人材活用経験</label>
            <select
              value={template.currentAnalysis.externalTalentExperience}
              onChange={(e) => onUpdate('currentAnalysis', 'externalTalentExperience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              <option value="none">なし</option>
              <option value="contractor">業務委託</option>
              <option value="temp">派遣</option>
              <option value="consultant">コンサル</option>
              <option value="freelance">副業</option>
              <option value="other">その他</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">これまでの取り組み</label>
          <textarea
            value={template.currentAnalysis.previousEfforts}
            onChange={(e) => onUpdate('currentAnalysis', 'previousEfforts', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="これまでに実施した施策や取り組み..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">うまくいかなかった理由</label>
          <textarea
            value={template.currentAnalysis.failureReasons}
            onChange={(e) => onUpdate('currentAnalysis', 'failureReasons', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="過去の取り組みで課題となった点..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">不足している機能・スキル</label>
          {template.currentAnalysis.missingSkills.map((skill, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={skill}
                onChange={(e) => onUpdateArray('currentAnalysis', 'missingSkills', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="不足しているスキル・機能..."
              />
              <button
                onClick={() => onRemoveArray('currentAnalysis', 'missingSkills', index)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => onAddArray('currentAnalysis', 'missingSkills', '')}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            + スキルを追加
          </button>
        </div>
      </div>
    )}
  </div>
);

// 🎯 プロジェクト設計セクション
const ProjectDesignSection = ({ template, expanded, onToggle, onUpdate, onUpdateNested, onUpdateArray, onAddArray, onRemoveArray }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 transition-colors"
    >
      <div className="flex items-center space-x-2">
        <Target className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-orange-900">🎯 プロジェクト設計</h3>
      </div>
      {expanded ? <ChevronUp className="h-5 w-5 text-orange-600" /> : <ChevronDown className="h-5 w-5 text-orange-600" />}
    </button>
    
    {expanded && (
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">解決したい課題の要約</label>
          <textarea
            value={template.projectDesign.challengeSummary}
            onChange={(e) => onUpdate('projectDesign', 'challengeSummary', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="1-2行で課題を要約..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">なぜ今なのか（緊急性）</label>
          <textarea
            value={template.projectDesign.urgencyReason}
            onChange={(e) => onUpdate('projectDesign', 'urgencyReason', e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="今取り組む必要がある理由..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">3ヶ月後の理想状態</label>
          <textarea
            value={template.projectDesign.idealState3Months}
            onChange={(e) => onUpdate('projectDesign', 'idealState3Months', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="3ヶ月後に実現したい状態..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">期待する成果物</label>
          {template.projectDesign.deliverables.map((deliverable, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={deliverable}
                onChange={(e) => onUpdateArray('projectDesign', 'deliverables', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="具体的な成果物..."
              />
              <button
                onClick={() => onRemoveArray('projectDesign', 'deliverables', index)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => onAddArray('projectDesign', 'deliverables', '')}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            + 成果物を追加
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">稼働イメージ</label>
            <select
              value={template.projectDesign.workingHours}
              onChange={(e) => onUpdate('projectDesign', 'workingHours', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              <option value="light_10h">週10時間（ライト）- アドバイザー的</option>
              <option value="standard_20h">週20時間（スタンダード）- 実務も担当</option>
              <option value="commit_30h">週30時間（ハイコミット）- がっつり推進</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">想定予算（月額万円）</label>
            <input
              type="number"
              value={template.projectDesign.budget.monthlyBudget}
              onChange={(e) => onUpdateNested('projectDesign', 'budget', 'monthlyBudget', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="月額予算"
            />
          </div>
        </div>
      </div>
    )}
  </div>
);

export default TemplateEditor;