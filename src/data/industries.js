export const INDUSTRIES = {
  // Eコマース・デジタル
  'D2C': {
    category: 'Eコマース・デジタル',
    description: '消費者直販ビジネス',
    commonChallenges: ['ブランディング', 'CRM構築', 'マーケティング自動化']
  },
  'EC': {
    category: 'Eコマース・デジタル', 
    description: '電子商取引',
    commonChallenges: ['サイト最適化', '在庫管理', '顧客体験向上']
  },
  '物流': {
    category: 'Eコマース・デジタル',
    description: '物流・配送業',
    commonChallenges: ['効率化', 'DX推進', '在庫最適化']
  },

  // マーケティング・広告
  '広告': {
    category: 'マーケティング・広告',
    description: '広告代理店・広告業',
    commonChallenges: ['クリエイティブ制作', 'データ分析', 'ROI改善']
  },

  // 人材・HR
  '人材': {
    category: '人材・HR',
    description: '人材紹介・派遣業',
    commonChallenges: ['マッチング精度向上', 'DX推進', '採用効率化']
  },
  'HRテック': {
    category: '人材・HR',
    description: 'HR関連テクノロジー',
    commonChallenges: ['プロダクト開発', 'ユーザー獲得', 'AI活用']
  },

  // 飲食・食品
  '飲食': {
    category: '飲食・食品',
    description: '飲食店・レストラン',
    commonChallenges: ['オペレーション効率化', 'デジタル化', '顧客体験向上']
  },
  'フードテック': {
    category: '飲食・食品',
    description: '食品関連テクノロジー',
    commonChallenges: ['プロダクト開発', '食品安全', 'サプライチェーン']
  },

  // 教育
  '教育': {
    category: '教育',
    description: '教育機関・学習塾',
    commonChallenges: ['オンライン化', '学習効果測定', '生徒管理']
  },
  'エドテック': {
    category: '教育',
    description: '教育関連テクノロジー',
    commonChallenges: ['プロダクト開発', 'ユーザー体験', 'データ分析']
  },

  // 行政・公共
  '官公庁・自治体': {
    category: '行政・公共',
    description: '官公庁・地方自治体',
    commonChallenges: ['デジタル化', '住民サービス向上', '業務効率化']
  },

  // ライフスタイル・美容
  'ライフスタイル': {
    category: 'ライフスタイル・美容',
    description: 'ライフスタイル関連サービス',
    commonChallenges: ['ブランディング', 'コミュニティ形成', 'オムニチャネル']
  },
  '美容・コスメ': {
    category: 'ライフスタイル・美容',
    description: '美容・化粧品業界',
    commonChallenges: ['D2C展開', 'インフルエンサー活用', 'パーソナライゼーション']
  },
  'ファッション・アパレル': {
    category: 'ライフスタイル・美容',
    description: 'ファッション・アパレル',
    commonChallenges: ['EC強化', '在庫管理', 'ブランド体験向上']
  },

  // モビリティ・自動車
  'MaaS': {
    category: 'モビリティ・自動車',
    description: 'モビリティ・アズ・ア・サービス',
    commonChallenges: ['プラットフォーム開発', 'データ統合', 'ユーザー体験']
  },
  '自動車・モビリティ': {
    category: 'モビリティ・自動車',
    description: '自動車・モビリティ業界',
    commonChallenges: ['電動化対応', 'コネクテッド化', 'サービス化']
  },

  // スマートシティ・シェアリング
  'スマートシティ': {
    category: 'スマートシティ・シェアリング',
    description: 'スマートシティ関連',
    commonChallenges: ['IoT統合', 'データ分析', '住民参加促進']
  },
  'シェアリングエコノミー': {
    category: 'スマートシティ・シェアリング',
    description: 'シェアリングサービス',
    commonChallenges: ['プラットフォーム運営', '信頼性確保', 'マッチング改善']
  },

  // 小売・流通
  '小売': {
    category: '小売・流通',
    description: '小売業・流通業',
    commonChallenges: ['オムニチャネル', 'DX推進', '顧客データ活用']
  },

  // アグリテック
  'アグリテック': {
    category: 'アグリテック',
    description: '農業関連テクノロジー',
    commonChallenges: ['IoT活用', 'データ分析', '生産性向上']
  },

  // ヘルスケア・医療
  'ヘルスケア': {
    category: 'ヘルスケア・医療',
    description: 'ヘルスケア・健康管理',
    commonChallenges: ['デジタルヘルス', 'データ活用', '予防医療']
  },
  'ヘルステック': {
    category: 'ヘルスケア・医療',
    description: 'ヘルスケア関連テクノロジー',
    commonChallenges: ['規制対応', 'データセキュリティ', 'エビデンス構築']
  },
  '医療・介護・福祉': {
    category: 'ヘルスケア・医療',
    description: '医療・介護・福祉',
    commonChallenges: ['人手不足対応', 'デジタル化', '質の向上']
  },

  // エンターテイメント・ゲーム
  'ゲーム': {
    category: 'エンターテイメント・ゲーム',
    description: 'ゲーム開発・運営',
    commonChallenges: ['ユーザー獲得', '収益化', 'グローバル展開']
  },
  'e-sports': {
    category: 'エンターテイメント・ゲーム',
    description: 'eスポーツ',
    commonChallenges: ['大会運営', 'コミュニティ形成', '収益化']
  },
  'エンタメ': {
    category: 'エンターテイメント・ゲーム',
    description: 'エンターテイメント',
    commonChallenges: ['コンテンツ制作', 'ファン獲得', 'デジタル配信']
  },

  // コンサルティング・制作
  'コンサルティング': {
    category: 'コンサルティング・制作',
    description: 'コンサルティング業',
    commonChallenges: ['サービス差別化', 'ナレッジ管理', '人材育成']
  },
  'Webコンサルティング': {
    category: 'コンサルティング・制作',
    description: 'Webコンサルティング',
    commonChallenges: ['デジタル戦略', 'ROI測定', 'チーム体制構築']
  },
  'Web制作': {
    category: 'コンサルティング・制作',
    description: 'Web制作・開発',
    commonChallenges: ['技術力向上', '案件管理', 'クライアント満足度']
  },

  // SaaS・IT
  'SaaS': {
    category: 'SaaS・IT',
    description: 'SaaS・クラウドサービス',
    commonChallenges: ['顧客獲得', 'チャーン改善', 'プロダクト改善']
  },
  'IT・通信': {
    category: 'SaaS・IT',
    description: 'IT・通信業界',
    commonChallenges: ['技術革新対応', 'セキュリティ強化', 'DX支援']
  },

  // 先端技術
  'XR(VR, AR, MR)': {
    category: '先端技術',
    description: 'XR（VR/AR/MR）',
    commonChallenges: ['コンテンツ制作', 'ハードウェア対応', '体験設計']
  },
  'AI': {
    category: '先端技術',
    description: 'AI・人工知能',
    commonChallenges: ['アルゴリズム開発', 'データ収集', '実用化']
  },
  'IoT': {
    category: '先端技術',
    description: 'IoT・モノのインターネット',
    commonChallenges: ['デバイス連携', 'データ処理', 'セキュリティ']
  },
  'ブロックチェーン': {
    category: '先端技術',
    description: 'ブロックチェーン',
    commonChallenges: ['実用化', '規制対応', 'スケーラビリティ']
  },
  '宇宙': {
    category: '先端技術',
    description: '宇宙関連事業',
    commonChallenges: ['技術開発', '規制対応', '事業化']
  },

  // スポーツ・メディア
  'スポーツ': {
    category: 'スポーツ・メディア',
    description: 'スポーツ関連事業',
    commonChallenges: ['ファン獲得', 'デジタル化', '収益源多様化']
  },
  'メディア': {
    category: 'スポーツ・メディア',
    description: 'メディア・出版',
    commonChallenges: ['デジタル化', 'コンテンツ戦略', '収益化']
  },

  // 金融・フィンテック
  'フィンテック': {
    category: '金融・フィンテック',
    description: 'フィンテック・金融IT',
    commonChallenges: ['規制対応', 'セキュリティ', 'ユーザー体験']
  },
  'インシュアテック': {
    category: '金融・フィンテック',
    description: '保険テクノロジー',
    commonChallenges: ['データ分析', 'リスク評価', 'デジタル化']
  },
  '金融': {
    category: '金融・フィンテック',
    description: '金融・銀行・証券',
    commonChallenges: ['デジタル化', 'フィンテック対応', 'コンプライアンス']
  },

  // 観光・レジャー
  '観光・レジャー': {
    category: '観光・レジャー',
    description: '観光・レジャー・旅行',
    commonChallenges: ['デジタル化', '体験価値向上', 'インバウンド対応']
  },

  // バイオ・化学
  'バイオテック': {
    category: 'バイオ・化学',
    description: 'バイオテクノロジー',
    commonChallenges: ['研究開発', '規制対応', '事業化']
  },

  // 不動産・建設
  '不動産': {
    category: '不動産・建設',
    description: '不動産業',
    commonChallenges: ['プロップテック活用', 'DX推進', '顧客体験向上']
  },
  '建設': {
    category: '不動産・建設',
    description: '建設業',
    commonChallenges: ['生産性向上', 'DX推進', '安全性確保']
  },

  // 商社・製造
  '商社': {
    category: '商社・製造',
    description: '商社・貿易',
    commonChallenges: ['デジタル化', '新規事業開発', 'グローバル対応']
  },
  '機械・ハードウェア': {
    category: '商社・製造',
    description: '機械・ハードウェア製造',
    commonChallenges: ['IoT対応', '予知保全', 'サービス化']
  },
  'ロボット': {
    category: '商社・製造',
    description: 'ロボット開発・製造',
    commonChallenges: ['AI統合', '実用化', 'コスト削減']
  },

  // エネルギー・環境
  'エネルギー': {
    category: 'エネルギー・環境',
    description: 'エネルギー・電力',
    commonChallenges: ['再生可能エネルギー', 'スマートグリッド', '脱炭素']
  },
  'SDGs': {
    category: 'エネルギー・環境',
    description: 'SDGs関連事業',
    commonChallenges: ['持続可能性', '社会課題解決', '測定・報告']
  },
  'ESG': {
    category: 'エネルギー・環境',
    description: 'ESG・サステナビリティ',
    commonChallenges: ['ESG経営', 'サステナビリティ報告', 'ステークホルダー対応']
  },

  // その他
  'その他': {
    category: 'その他',
    description: 'その他業界',
    commonChallenges: ['デジタル化', '業務効率化', '新規事業開発']
  }
};

export const INDUSTRY_CATEGORIES = [
  'Eコマース・デジタル',
  'マーケティング・広告', 
  '人材・HR',
  '飲食・食品',
  '教育',
  '行政・公共',
  'ライフスタイル・美容',
  'モビリティ・自動車',
  'スマートシティ・シェアリング',
  '小売・流通',
  'アグリテック',
  'ヘルスケア・医療',
  'エンターテイメント・ゲーム',
  'コンサルティング・制作',
  'SaaS・IT',
  '先端技術',
  'スポーツ・メディア',
  '金融・フィンテック',
  '観光・レジャー',
  'バイオ・化学',
  '不動産・建設',
  '商社・製造',
  'エネルギー・環境',
  'その他'
];

// 業種一覧を取得する関数
export const getIndustryList = () => {
  return Object.keys(INDUSTRIES);
};

// カテゴリ別に業種を取得する関数
export const getIndustriesByCategory = (category) => {
  return Object.entries(INDUSTRIES)
    .filter(([_, industryData]) => industryData.category === category)
    .map(([industry, _]) => industry);
};

// 全業種をカテゴリ別にグループ化して取得する関数
export const getIndustriesGroupedByCategory = () => {
  const grouped = {};
  INDUSTRY_CATEGORIES.forEach(category => {
    grouped[category] = getIndustriesByCategory(category);
  });
  return grouped;
};