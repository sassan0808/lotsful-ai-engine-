export const SKILL_CATEGORIES = {
  technical: {
    frontend: ['React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Next.js', 'Nuxt.js'],
    backend: ['Node.js', 'Python', 'Java', 'Ruby', 'PHP', 'Go', 'C#', '.NET'],
    database: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB'],
    cloud: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
    mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android'],
    data: ['Python', 'R', 'SQL', 'Tableau', 'Power BI', 'Machine Learning', 'Deep Learning']
  },
  business: {
    marketing: ['SEO', 'SEM', 'SNS運用', 'コンテンツマーケティング', 'メールマーケティング', 'グロースハック'],
    sales: ['営業戦略', 'インサイドセールス', 'カスタマーサクセス', 'SFA/CRM', '営業支援'],
    consulting: ['戦略立案', '業務改善', 'プロセス設計', 'プロジェクト管理', 'ファシリテーション'],
    design: ['UI/UX', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'After Effects']
  },
  soft: {
    communication: ['プレゼンテーション', 'ドキュメント作成', 'ファシリテーション', 'チームビルディング'],
    management: ['プロジェクト管理', 'アジャイル', 'スクラム', 'リーダーシップ', 'メンタリング'],
    analysis: ['データ分析', '要件定義', '課題分析', 'ロジカルシンキング', 'KPI設計']
  }
};

export const TALENT_PROFILES = {
  'エンジニア': {
    categories: ['フロントエンド', 'バックエンド', 'フルスタック', 'インフラ', 'モバイル'],
    requiredSkills: ['プログラミング', 'Git', 'アジャイル開発'],
    hashtags: ['#エンジニア', '#開発', '#プログラミング', '#テックパートナー'],
    typicalBackground: ['大手IT企業', 'スタートアップ', 'フリーランス'],
    workStyle: {
      remote: '完全リモート可',
      hours: '週10-20時間',
      flexibility: '高'
    }
  },
  'データサイエンティスト': {
    categories: ['分析', '機械学習', 'BI'],
    requiredSkills: ['Python/R', '統計学', 'SQL', '機械学習'],
    hashtags: ['#データサイエンス', '#AI', '#機械学習', '#データ分析'],
    typicalBackground: ['研究機関', 'コンサルティングファーム', 'テック企業'],
    workStyle: {
      remote: 'リモート中心',
      hours: '週15-25時間',
      flexibility: '中'
    }
  },
  'マーケター': {
    categories: ['デジタル', 'コンテンツ', 'グロース', 'ブランディング'],
    requiredSkills: ['MA/CRM', 'データ分析', 'SEO/SEM', 'SNS運用'],
    hashtags: ['#マーケティング', '#グロース', '#デジタルマーケ', '#CMO'],
    typicalBackground: ['広告代理店', 'メーカー', 'EC企業'],
    workStyle: {
      remote: 'ハイブリッド',
      hours: '週10-20時間',
      flexibility: '高'
    }
  },
  'デザイナー': {
    categories: ['UI/UX', 'グラフィック', 'プロダクト', 'ブランド'],
    requiredSkills: ['Figma', 'Adobe Creative Suite', 'プロトタイピング'],
    hashtags: ['#デザイナー', '#UIUX', '#クリエイティブ', '#デザイン'],
    typicalBackground: ['デザイン事務所', 'Web制作会社', 'フリーランス'],
    workStyle: {
      remote: '完全リモート可',
      hours: '週10-30時間',
      flexibility: '高'
    }
  },
  'コンサルタント': {
    categories: ['戦略', '業務改善', 'IT', '人事'],
    requiredSkills: ['問題解決', 'プレゼンテーション', '分析力', 'ファシリテーション'],
    hashtags: ['#コンサルタント', '#戦略', '#業務改善', '#経営支援'],
    typicalBackground: ['コンサルティングファーム', '事業会社', '独立コンサル'],
    workStyle: {
      remote: 'ハイブリッド',
      hours: '週15-30時間',
      flexibility: '中'
    }
  },
  'プロジェクトマネージャー': {
    categories: ['IT', '新規事業', 'DX', '業務改善'],
    requiredSkills: ['プロジェクト管理', 'スクラム', 'ステークホルダー管理'],
    hashtags: ['#PM', '#プロジェクトマネージャー', '#スクラム', '#アジャイル'],
    typicalBackground: ['SIer', 'コンサル', 'スタートアップ'],
    workStyle: {
      remote: 'ハイブリッド',
      hours: '週20-30時間',
      flexibility: '中'
    }
  }
};