import React from 'react';
import { ArrowLeft, Target, Users, TrendingUp, Download } from 'lucide-react';
import ProfileCard from '../TalentProfile/ProfileCard';

const AnalysisResults = ({ results, onReset }) => {
  const { challenges, priorities, talentProfiles, summary } = results;

  const handleExport = () => {
    // Export functionality would be implemented here
    const exportData = {
      analysisDate: new Date().toISOString(),
      challenges,
      priorities,
      talentProfiles,
      summary
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talent-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
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
          <span>結果をエクスポート</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI分析結果</h2>
          <div className="bg-primary-50 rounded-lg p-4">
            <p className="text-primary-900">
              {summary.mainFindings}
            </p>
            <p className="text-primary-700 mt-2">
              推奨アクション: {summary.recommendedAction}
            </p>
            <p className="text-primary-600 text-sm mt-1">
              {summary.estimatedTimeline}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-gray-800">特定された課題</h3>
            </div>
            <ul className="space-y-1">
              {challenges.map((challenge, index) => (
                <li key={index} className="text-sm text-gray-600">
                  • {challenge}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-800">優先順位</h3>
            </div>
            <ol className="space-y-1">
              {priorities.map((priority, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {index + 1}. {priority}
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-gray-800">推奨人材</h3>
            </div>
            <ul className="space-y-1">
              {talentProfiles.map((profile, index) => (
                <li key={index} className="text-sm text-gray-600">
                  • {profile.role} ({profile.matchScore}%マッチ)
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">推奨する副業人材プロファイル</h3>
          <div className="space-y-6">
            {talentProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;