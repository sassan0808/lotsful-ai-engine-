"use client";

import React, { useState } from 'react';
import { Building, Users, TrendingUp, Clock, DollarSign, Loader2, Send } from 'lucide-react';
import { analyzeCompanyInput } from '../../utils/analysisEngine';
import { INDUSTRY_BENCHMARKS } from '../../data/industryBenchmarks';

const StructuredInput = ({ onAnalyze, isAnalyzing, setIsAnalyzing }) => {
  const [formData, setFormData] = useState({
    basicInfo: {
      companyName: '',
      industry: '',
      employeeCount: '',
      revenue: ''
    },
    currentSituation: {
      challenges: '',
      painPoints: '',
      goals: '',
      timeline: '',
      budget: ''
    },
    resources: {
      currentTeam: '',
      skills: '',
      tools: ''
    }
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);

    // Simulate API call delay
    setTimeout(() => {
      const results = analyzeCompanyInput(formData);
      onAnalyze(results);
      setIsAnalyzing(false);
    }, 2000);
  };

  const industries = Object.keys(INDUSTRY_BENCHMARKS);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Building className="h-5 w-5 text-primary-600" />
          <h4 className="text-lg font-semibold text-gray-800">基本情報</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              会社名
            </label>
            <input
              type="text"
              value={formData.basicInfo.companyName}
              onChange={(e) => handleInputChange('basicInfo', 'companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="株式会社〇〇"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              業界
            </label>
            <select
              value={formData.basicInfo.industry}
              onChange={(e) => handleInputChange('basicInfo', 'industry', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">選択してください</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              従業員数
            </label>
            <select
              value={formData.basicInfo.employeeCount}
              onChange={(e) => handleInputChange('basicInfo', 'employeeCount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">選択してください</option>
              <option value="1-10">1-10名</option>
              <option value="11-50">11-50名</option>
              <option value="51-100">51-100名</option>
              <option value="101-500">101-500名</option>
              <option value="501+">501名以上</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              年商
            </label>
            <select
              value={formData.basicInfo.revenue}
              onChange={(e) => handleInputChange('basicInfo', 'revenue', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              <option value="under-100m">1億円未満</option>
              <option value="100m-1b">1億円〜10億円</option>
              <option value="1b-10b">10億円〜100億円</option>
              <option value="10b-100b">100億円〜1000億円</option>
              <option value="over-100b">1000億円以上</option>
            </select>
          </div>
        </div>
      </div>

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
              value={formData.currentSituation.challenges}
              onChange={(e) => handleInputChange('currentSituation', 'challenges', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例：エンジニア不足で開発スピードが遅い、マーケティングの専門知識が不足..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              具体的な困りごと
            </label>
            <textarea
              value={formData.currentSituation.painPoints}
              onChange={(e) => handleInputChange('currentSituation', 'painPoints', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例：新機能の開発が遅れている、広告のROIが改善しない..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              達成したい目標
            </label>
            <textarea
              value={formData.currentSituation.goals}
              onChange={(e) => handleInputChange('currentSituation', 'goals', e.target.value)}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例：3ヶ月以内に新サービスをリリース、売上を20%向上..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="inline h-4 w-4 mr-1" />
                希望タイムライン
              </label>
              <select
                value={formData.currentSituation.timeline}
                onChange={(e) => handleInputChange('currentSituation', 'timeline', e.target.value)}
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
                value={formData.currentSituation.budget}
                onChange={(e) => handleInputChange('currentSituation', 'budget', e.target.value)}
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
              value={formData.resources.currentTeam}
              onChange={(e) => handleInputChange('resources', 'currentTeam', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例：エンジニア3名、デザイナー1名、マーケター2名"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              チームの主なスキル
            </label>
            <input
              type="text"
              value={formData.resources.skills}
              onChange={(e) => handleInputChange('resources', 'skills', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例：React, Node.js, AWS, デジタルマーケティング"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              使用中のツール・技術
            </label>
            <input
              type="text"
              value={formData.resources.tools}
              onChange={(e) => handleInputChange('resources', 'tools', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例：GitHub, Slack, Google Analytics, Salesforce"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isAnalyzing}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>分析中...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>AI分析を開始</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default StructuredInput;