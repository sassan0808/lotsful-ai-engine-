// lotsful プロジェクト×人材マッチングシート テンプレート型定義

export interface CompanyProfile {
  name: string;
  industry: string[];
  establishedYear?: number;
  isPublic?: boolean;
  marketListing?: string;
  employeeCount: 'startup' | '1-10' | '11-50' | '51-100' | '101-300' | '301-1000' | '1000+' | '';
  revenue: 'under_100m' | '100m-500m' | '500m-1b' | '1b-5b' | '5b-10b' | '10b+' | 'unknown' | '';
  headquarters?: string;
  offices?: string[];
  businessDescription?: string;
  mainCustomers?: string;
}

export interface ResearchData {
  deepResearchMemo: string;
  recentNews: string;
  organizationCulture: string;
  hypothesisInsights: string;
  meetingCheckpoints: string[];
}

export interface TeamComposition {
  department: string;
  headcount: number;
  mainRole: string;
}

export interface CurrentAnalysis {
  businessPhase: 'startup' | 'growth' | 'expansion' | 'mature' | '';
  challengeCategories: string[];
  previousEfforts: string;
  failureReasons: string;
  teamComposition: TeamComposition[];
  missingSkills: string[];
  externalTalentExperience: 'none' | 'contractor' | 'temp' | 'consultant' | 'freelance' | 'other' | '';
  externalTalentResult: string;
  freelanceReadiness: 'ready' | 'partial' | 'not_ready' | '';
  freelanceReadinessDetails: string;
  competitorServices: string[];
  decisionProcess: 'immediate' | 'manager_approval' | 'ringi' | 'executive' | '';
  decisionTimeline: string;
  barriers: string[];
}

export interface SuccessMetrics {
  quantitative: string[];
  qualitative: string[];
}

export interface ProjectScope {
  included: string[];
  excluded: string[];
}

export interface ProjectPhase {
  name: string;
  period: string;
  goal: string;
  mainActivities: string[];
}

export interface Budget {
  monthlyBudget: number;
  duration: number;
  totalBudget: number;
}

export interface ProjectDesign {
  challengeSummary: string;
  urgencyReason: string;
  risksIfIgnored: string;
  idealState3Months: string;
  successMetrics: SuccessMetrics;
  deliverables: string[];
  scope: ProjectScope;
  phases: ProjectPhase[];
  workingHours: 'light_10h' | 'standard_20h' | 'commit_30h' | '';
  budget: Budget;
}

export interface IndustryExperience {
  preferredIndustry: string[];
  preferredRole: string[];
  preferredCompanySize: 'large' | 'mid' | 'startup' | 'any' | '';
}

export interface TalentRequirements {
  expectedRole: ('strategy' | 'execution' | 'specialist' | 'mentor' | 'hybrid')[];
  engagementType: ('project_leader' | 'project_member' | 'advisor' | 'spot_consultation')[];
  requiredSkills: string[];
  preferredSkills: string[];
  industryExperience: IndustryExperience;
  personalityType: ('self_driven' | 'collaborative' | 'leader' | 'craftsman')[];
  mindset: string[];
  cultureFit: string;
}

export interface ProjectCheckpoints {
  projectChecklist: {
    goalClear: boolean;
    scopeAppropriate: boolean;
    timelineRealistic: boolean;
    budgetReasonable: boolean;
    deliverablesDefinied: boolean;
    internalCooperationSecured: boolean;
  };
  talentChecklist: {
    roleClear: boolean;
    skillsRealistic: boolean;
    talentAvailableInMarket: boolean;
    budgetSkillBalanceGood: boolean;
    receptionSystemReady: boolean;
  };
}

// 人材提案の型定義
export interface WorkingPattern {
  type: 'advisor' | 'standard' | 'execution' | 'fullcommit';
  monthlyHours: number;
  description: string;
  details: string[];
}

export interface TaskAllocation {
  category: '戦略' | '実行' | '分析' | '管理';
  task: string;
  hoursPerWeek: number;
  importance: '★★★' | '★★☆' | '★☆☆';
}

export interface TalentPosition {
  id: string;
  title: string;
  basicInfo: {
    monthlyHours: number;
    duration: number;
    workStyle: 'リモート' | 'ハイブリッド' | '出社';
  };
  workingPattern: WorkingPattern;
  mission: string;
  tasks: TaskAllocation[];
  requirements: {
    mandatorySkills: string[];
    preferredSkills: string[];
    personalityTraits: string[];
  };
  profileExample: string;
}

export interface TeamPlan {
  id: string;
  name: string;
  type: 'standard' | 'light' | 'advisory';
  composition: {
    positionId: string;
    monthlyHours: number;
  }[];
  totalMonthlyHours: number;
  features: string[];
  notes?: string[];
}

export interface TalentProposal {
  recommendedTeam: {
    title: string;
    reason: string;
  };
  positions: TalentPosition[];
  teamPlans: TeamPlan[];
  summary: {
    totalCost: number;
    expectedOutcome: string;
    timeline: string;
  };
}

export interface MatchingStrategy {
  proposedTalentPatterns: string[];
  talentProposal?: TalentProposal;
}

export interface MeetingMemo {
  impressiveComments: string;
  hiddenNeeds: string;
  otherObservations: string;
  additionalNotes: string;
}

export interface TemplateMetadata {
  step1Completed: boolean;
  step2Completed: boolean;
  step3Completed: boolean;
  selectedBusinessItems: Array<{
    category: string;
    phase: string;
    title: string;
    workingHours: number;
  }>;
  analysisHistory: Array<{
    step: number;
    timestamp: string;
    analysisType: string;
    inputData: any;
    outputData: any;
  }>;
  lastUpdated: string;
  version: string;
  actualWorkingHours?: number; // 実際の稼働時間数値
  talentCount?: number; // 希望人数
}

// メインテンプレート構造
export interface LotsfulTemplate {
  companyProfile: CompanyProfile;
  researchData: ResearchData;
  currentAnalysis: CurrentAnalysis;
  projectDesign: ProjectDesign;
  talentRequirements: TalentRequirements;
  projectCheckpoints: ProjectCheckpoints;
  matchingStrategy: MatchingStrategy;
  meetingMemo: MeetingMemo;
  metadata: TemplateMetadata;
}

// 部分更新用の型
export type PartialLotsfulTemplate = Partial<LotsfulTemplate>;

// 各ステップでの更新対象セクション
export interface Step1UpdateSections {
  companyProfile: Partial<CompanyProfile>;
  researchData: Partial<ResearchData>;
}

export interface Step2UpdateSections {
  currentAnalysis: Partial<CurrentAnalysis>;
  projectDesign: Partial<ProjectDesign>;
}

export interface Step3UpdateSections {
  talentRequirements: Partial<TalentRequirements>;
  projectCheckpoints: Partial<ProjectCheckpoints>;
  matchingStrategy: Partial<MatchingStrategy>;
}

// 初期化用のデフォルトテンプレート
export const createEmptyTemplate = (): LotsfulTemplate => ({
  companyProfile: {
    name: '',
    industry: [],
    employeeCount: '',
    revenue: '',
    offices: [],
  },
  researchData: {
    deepResearchMemo: '',
    recentNews: '',
    organizationCulture: '',
    hypothesisInsights: '',
    meetingCheckpoints: [],
  },
  currentAnalysis: {
    businessPhase: '',
    challengeCategories: [],
    previousEfforts: '',
    failureReasons: '',
    teamComposition: [],
    missingSkills: [],
    externalTalentExperience: '',
    externalTalentResult: '',
    freelanceReadiness: '',
    freelanceReadinessDetails: '',
    competitorServices: [],
    decisionProcess: '',
    decisionTimeline: '',
    barriers: [],
  },
  projectDesign: {
    challengeSummary: '',
    urgencyReason: '',
    risksIfIgnored: '',
    idealState3Months: '',
    successMetrics: {
      quantitative: [],
      qualitative: [],
    },
    deliverables: [],
    scope: {
      included: [],
      excluded: [],
    },
    phases: [],
    workingHours: '',
    budget: {
      monthlyBudget: 0,
      duration: 0,
      totalBudget: 0,
    },
  },
  talentRequirements: {
    expectedRole: [],
    engagementType: [],
    requiredSkills: [],
    preferredSkills: [],
    industryExperience: {
      preferredIndustry: [],
      preferredRole: [],
      preferredCompanySize: '',
    },
    personalityType: [],
    mindset: [],
    cultureFit: '',
  },
  projectCheckpoints: {
    projectChecklist: {
      goalClear: false,
      scopeAppropriate: false,
      timelineRealistic: false,
      budgetReasonable: false,
      deliverablesDefinied: false,
      internalCooperationSecured: false,
    },
    talentChecklist: {
      roleClear: false,
      skillsRealistic: false,
      talentAvailableInMarket: false,
      budgetSkillBalanceGood: false,
      receptionSystemReady: false,
    },
  },
  matchingStrategy: {
    proposedTalentPatterns: [],
  },
  meetingMemo: {
    impressiveComments: '',
    hiddenNeeds: '',
    otherObservations: '',
    additionalNotes: '',
  },
  metadata: {
    step1Completed: false,
    step2Completed: false,
    step3Completed: false,
    selectedBusinessItems: [],
    analysisHistory: [],
    lastUpdated: new Date().toISOString(),
    version: '1.0',
  },
});