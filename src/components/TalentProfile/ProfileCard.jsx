import React from 'react';
import { 
  User, Briefcase, Hash, Clock, 
  MapPin, DollarSign, CheckCircle, Star,
  TrendingUp, Award
} from 'lucide-react';

const ProfileCard = ({ profile }) => {
  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <User className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{profile.role}</h3>
              <p className="text-sm text-gray-500">{profile.category}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full ${getMatchScoreColor(profile.matchScore)}`}>
            <span className="text-sm font-semibold">{profile.matchScore}% マッチ</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              理想的な人材像
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">現職:</span> {profile.idealProfile.currentJob}</p>
              <p><span className="font-medium">経験:</span> {profile.idealProfile.experience}</p>
              <p><span className="font-medium">副業動機:</span> {profile.idealProfile.sideJobMotivation}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                必須スキル
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.requiredSkills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                歓迎スキル
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.preferredSkills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <Hash className="h-4 w-4 mr-2" />
              検索用ハッシュタグ
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.hashtags.map((tag, index) => (
                <span key={index} className="text-primary-600 text-sm hover:underline cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                働き方
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><MapPin className="inline h-3 w-3 mr-1" /> {profile.workStyle.remote}</p>
                <p><Clock className="inline h-3 w-3 mr-1" /> {profile.workStyle.hours}</p>
                <p>ミーティング: {profile.workStyle.meeting || '週1-2回'}</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                報酬
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium">{profile.compensation.range}</p>
                <p>{profile.compensation.type}</p>
                <p className="text-xs">{profile.compensation.bonus}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              期待される成果
            </h4>
            <p className="text-sm text-gray-600">{profile.expectedOutcome}</p>
          </div>

          <div className="bg-secondary-50 rounded-lg p-3">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <Award className="h-4 w-4 mr-2" />
              想定される職種タイトル例
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.exampleTitles.map((title, index) => (
                <span key={index} className="text-sm text-secondary-700">
                  {title}
                  {index < profile.exampleTitles.length - 1 && ' / '}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;