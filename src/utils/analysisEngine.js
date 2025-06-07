import { INDUSTRY_BENCHMARKS } from '../data/industryBenchmarks';
import { TALENT_PROFILES } from '../data/skillMappings';

export const analyzeCompanyInput = (inputData) => {
  const { basicInfo, currentSituation, resources } = inputData;
  
  const challenges = extractChallenges(currentSituation);
  const priorities = prioritizeChallenges(challenges, basicInfo.industry);
  const talentProfiles = generateTalentProfiles(priorities, basicInfo, resources);
  
  return {
    challenges,
    priorities,
    talentProfiles,
    summary: generateAnalysisSummary(talentProfiles, challenges)
  };
};

const extractChallenges = (situation) => {
  const { challenges, painPoints, goals } = situation;
  const allText = `${challenges} ${painPoints} ${goals}`.toLowerCase();
  
  const challengeKeywords = {
    'エンジニア不足': ['エンジニア', '開発者', '技術者', 'プログラマー'],
    'DX推進': ['dx', 'デジタル', '変革', 'トランスフォーメーション'],
    'マーケティング強化': ['マーケティング', '集客', '認知', 'ブランディング'],
    'データ活用': ['データ', '分析', 'bi', 'アナリティクス'],
    '業務効率化': ['効率', '自動化', '改善', 'プロセス'],
    'セキュリティ': ['セキュリティ', 'セキュア', '脆弱性', '情報保護']
  };
  
  const detectedChallenges = [];
  Object.entries(challengeKeywords).forEach(([challenge, keywords]) => {
    if (keywords.some(keyword => allText.includes(keyword))) {
      detectedChallenges.push(challenge);
    }
  });
  
  return detectedChallenges.length > 0 ? detectedChallenges : ['デジタル化推進'];
};

const prioritizeChallenges = (challenges, industry) => {
  const industryData = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['その他'];
  const industryPriorities = industryData.commonChallenges;
  
  return challenges.sort((a, b) => {
    const aIndex = industryPriorities.indexOf(a);
    const bIndex = industryPriorities.indexOf(b);
    
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });
};

const generateTalentProfiles = (priorities, basicInfo, resources) => {
  const profiles = [];
  
  priorities.forEach((challenge, index) => {
    const talentType = mapChallengeToTalent(challenge);
    const profile = createDetailedProfile(talentType, challenge, basicInfo, resources, index);
    profiles.push(profile);
  });
  
  return profiles.slice(0, 3); // 最大3つのプロファイルを返す
};

const mapChallengeToTalent = (challenge) => {
  const mapping = {
    'エンジニア不足': 'エンジニア',
    'DX推進': 'コンサルタント',
    'マーケティング強化': 'マーケター',
    'データ活用': 'データサイエンティスト',
    '業務効率化': 'プロジェクトマネージャー',
    'セキュリティ': 'エンジニア'
  };
  
  return mapping[challenge] || 'コンサルタント';
};

const createDetailedProfile = (talentType, challenge, basicInfo, resources, priority) => {
  const baseProfile = TALENT_PROFILES[talentType];
  const matchScore = calculateMatchScore(challenge, basicInfo, resources, priority);
  
  return {
    id: Date.now() + priority,
    role: talentType,
    category: baseProfile.categories[0],
    matchScore,
    idealProfile: {
      currentJob: generateCurrentJob(talentType, basicInfo.industry),
      experience: generateExperience(talentType, challenge),
      sideJobMotivation: generateMotivation(talentType)
    },
    requiredSkills: baseProfile.requiredSkills,
    preferredSkills: generatePreferredSkills(talentType, challenge),
    hashtags: baseProfile.hashtags,
    workStyle: {
      ...baseProfile.workStyle,
      hours: adjustWorkingHours(basicInfo, resources)
    },
    compensation: generateCompensation(basicInfo, talentType),
    expectedOutcome: generateExpectedOutcome(challenge, talentType),
    exampleTitles: generateExampleTitles(talentType)
  };
};

const calculateMatchScore = (challenge, basicInfo, resources, priority) => {
  let score = 85; // 基本スコア
  
  // 優先度による調整
  score -= priority * 3;
  
  // 予算による調整
  if (basicInfo.budget && basicInfo.budget.includes('高')) {
    score += 5;
  }
  
  // タイムラインによる調整
  if (resources.timeline && resources.timeline.includes('急')) {
    score += 3;
  }
  
  return Math.min(Math.max(score, 70), 98);
};

const generateCurrentJob = (talentType, industry) => {
  const examples = {
    'エンジニア': ['大手IT企業のシニアエンジニア', 'スタートアップのテックリード', 'フリーランスエンジニア'],
    'データサイエンティスト': ['研究機関のデータアナリスト', 'コンサルファームのデータサイエンティスト', 'AI企業の機械学習エンジニア'],
    'マーケター': ['広告代理店のアカウントプランナー', 'EC企業のマーケティングマネージャー', 'SaaS企業のグロースハッカー'],
    'デザイナー': ['デザイン事務所のアートディレクター', 'IT企業のプロダクトデザイナー', 'フリーランスUXデザイナー'],
    'コンサルタント': ['戦略コンサルティングファームのマネージャー', '独立系コンサルタント', 'IT企業の事業開発マネージャー'],
    'プロジェクトマネージャー': ['SIerのPMO', 'コンサルファームのプロジェクトマネージャー', 'スタートアップのプロダクトマネージャー']
  };
  
  return examples[talentType][Math.floor(Math.random() * examples[talentType].length)];
};

const generateExperience = (talentType, challenge) => {
  const baseYears = {
    'エンジニア': '5-10年',
    'データサイエンティスト': '3-7年',
    'マーケター': '5-10年',
    'デザイナー': '5-10年',
    'コンサルタント': '7-15年',
    'プロジェクトマネージャー': '5-12年'
  };
  
  return `${challenge}に関する実務経験${baseYears[talentType]}`;
};

const generateMotivation = (talentType) => {
  const motivations = {
    'エンジニア': 'スキルアップと新技術への挑戦',
    'データサイエンティスト': '異業種データの分析機会',
    'マーケター': '新しい業界でのマーケティング経験',
    'デザイナー': 'クリエイティブな自由度の高いプロジェクト',
    'コンサルタント': '経営層との直接的な関わり',
    'プロジェクトマネージャー': '複雑なプロジェクトのリード経験'
  };
  
  return motivations[talentType];
};

const generatePreferredSkills = (talentType, challenge) => {
  const skillMap = {
    'エンジニア': ['クラウドアーキテクチャ', 'マイクロサービス', 'DevOps'],
    'データサイエンティスト': ['ディープラーニング', 'ビッグデータ処理', 'A/Bテスト'],
    'マーケター': ['MA運用', 'インフルエンサーマーケティング', 'グロースハック'],
    'デザイナー': ['デザインシステム構築', 'ユーザビリティテスト', 'プロトタイピング'],
    'コンサルタント': ['業界知識', 'ワークショップファシリテーション', 'チェンジマネジメント'],
    'プロジェクトマネージャー': ['リスク管理', 'ベンダーマネジメント', 'アジャイルコーチング']
  };
  
  return skillMap[talentType] || [];
};

const adjustWorkingHours = (basicInfo, resources) => {
  if (resources.timeline && resources.timeline.includes('急')) {
    return '週20-30時間';
  }
  return '週10-20時間';
};

const generateCompensation = (basicInfo, talentType) => {
  const industryData = INDUSTRY_BENCHMARKS[basicInfo.industry] || INDUSTRY_BENCHMARKS['その他'];
  const baseRange = industryData.averageBudget;
  
  const talentMultiplier = {
    'エンジニア': 1.2,
    'データサイエンティスト': 1.3,
    'マーケター': 1.0,
    'デザイナー': 1.0,
    'コンサルタント': 1.4,
    'プロジェクトマネージャー': 1.1
  };
  
  const multiplier = talentMultiplier[talentType] || 1.0;
  
  return {
    range: `月額${Math.floor(baseRange.min * multiplier / 1000)}万円〜${Math.floor(baseRange.max * multiplier / 1000)}万円`,
    type: '業務委託契約',
    bonus: '成果に応じたインセンティブあり'
  };
};

const generateExpectedOutcome = (challenge, talentType) => {
  const outcomes = {
    'エンジニア不足': '開発スピードの向上と技術的課題の解決',
    'DX推進': 'デジタル化ロードマップの策定と実行支援',
    'マーケティング強化': '新規顧客獲得の増加とブランド認知度向上',
    'データ活用': 'データドリブンな意思決定プロセスの確立',
    '業務効率化': '業務プロセスの最適化と生産性向上',
    'セキュリティ': 'セキュリティリスクの低減と対策強化'
  };
  
  return outcomes[challenge] || '課題解決と組織能力の向上';
};

const generateExampleTitles = (talentType) => {
  const titles = {
    'エンジニア': ['シニアフルスタックエンジニア', 'テクニカルアドバイザー', 'アーキテクト'],
    'データサイエンティスト': ['データ分析コンサルタント', 'AIスペシャリスト', 'データストラテジスト'],
    'マーケター': ['グロースマーケター', 'デジタルマーケティングアドバイザー', 'CMOアドバイザー'],
    'デザイナー': ['プロダクトデザインリード', 'UXコンサルタント', 'デザインディレクター'],
    'コンサルタント': ['戦略アドバイザー', 'DXコンサルタント', 'ビジネスアーキテクト'],
    'プロジェクトマネージャー': ['プログラムマネージャー', 'PMOアドバイザー', 'アジャイルコーチ']
  };
  
  return titles[talentType] || ['スペシャリスト', 'アドバイザー', 'コンサルタント'];
};

const generateAnalysisSummary = (profiles, challenges) => {
  return {
    mainFindings: `${challenges.length}つの主要課題を特定し、${profiles.length}つの人材プロファイルを提案`,
    recommendedAction: '優先度の高い人材から順次採用を検討',
    estimatedTimeline: '初期成果は3ヶ月以内に期待可能'
  };
};