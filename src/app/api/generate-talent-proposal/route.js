import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { template } = await request.json();

    // モックデータとして人材提案を生成
    const talentProposal = generateMockTalentProposal(template);

    return NextResponse.json({
      success: true,
      talentProposal,
      metadata: {
        timestamp: new Date().toISOString(),
        isMockData: true,
        confidence: 85
      }
    });

  } catch (error) {
    console.error('Talent proposal generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate talent proposal',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// モック人材提案生成関数
function generateMockTalentProposal(template) {
  const { companyProfile, projectDesign, currentAnalysis } = template;
  
  // 業界とプロジェクト内容に基づいて推奨体制を決定
  const isMarketingProject = projectDesign.challengeSummary?.toLowerCase().includes('マーケティング') ||
                            projectDesign.challengeSummary?.toLowerCase().includes('売上');
  const isTechProject = projectDesign.challengeSummary?.toLowerCase().includes('dx') ||
                       projectDesign.challengeSummary?.toLowerCase().includes('システム');
  
  let recommendedTeam = {
    title: "マーケティング強化体制",
    reason: "現在の課題が売上向上とマーケティング効率化に集中しており、戦略立案と実行推進の両面でのサポートが必要なため"
  };

  if (isTechProject) {
    recommendedTeam = {
      title: "DX推進体制",
      reason: "デジタル化課題に対して、戦略策定から技術実装まで段階的に推進できる体制が必要なため"
    };
  }

  // ポジション定義
  const positions = [
    {
      id: "position1",
      title: isMarketingProject ? "マーケティング戦略アドバイザー" : "DX戦略コンサルタント",
      basicInfo: {
        monthlyHours: 25,
        duration: 6,
        workStyle: "リモート"
      },
      workingPattern: {
        type: "standard",
        monthlyHours: 25,
        description: "戦略立案と一部実行を担当",
        details: [
          "週2-3回の稼働",
          "戦略MTG + 実務推進",
          "月次レビューによる方向性調整"
        ]
      },
      mission: isMarketingProject 
        ? "マーケティング戦略の立案と実行体制の構築により、3ヶ月で売上向上の基盤を確立する"
        : "DX戦略の策定と推進体制の構築により、デジタル化による業務効率向上を実現する",
      tasks: [
        {
          category: "戦略",
          task: isMarketingProject ? "マーケティング戦略立案" : "DX戦略策定",
          hoursPerWeek: 8,
          importance: "★★★"
        },
        {
          category: "実行",
          task: isMarketingProject ? "キャンペーン企画・実行支援" : "システム要件定義支援",
          hoursPerWeek: 10,
          importance: "★★☆"
        },
        {
          category: "管理",
          task: "プロジェクト進行管理・レポーティング",
          hoursPerWeek: 7,
          importance: "★★☆"
        }
      ],
      requirements: {
        mandatorySkills: [
          isMarketingProject 
            ? "BtoBマーケティング戦略立案・実行経験3年以上"
            : "DX戦略策定・推進経験3年以上",
          "事業会社での実務経験",
          "プロジェクト管理スキル"
        ],
        preferredSkills: [
          isMarketingProject ? "デジタルマーケティング領域の知見" : "クラウド・SaaS導入経験",
          "チームマネジメント経験",
          "同業界での経験"
        ],
        personalityTraits: [
          "論理的思考と実行力を兼ね備えた人材",
          "ステークホルダーとの調整能力",
          "成果にコミットする姿勢"
        ]
      },
      profileExample: isMarketingProject 
        ? `例：大手IT企業のマーケティングマネージャー
- 年商100億円規模の事業でBtoBマーケを5年経験  
- デジタル施策で年間リード3,000件獲得の実績
- 現在も現役で最新トレンドを把握`
        : `例：大手SIerのDXコンサルタント
- 製造業・小売業でのDX推進経験5年
- クラウド移行プロジェクトを10社以上支援
- 業務プロセス改善による30%効率化を実現`
    },
    {
      id: "position2", 
      title: isMarketingProject ? "マーケティング実行担当" : "システム実装エンジニア",
      basicInfo: {
        monthlyHours: 30,
        duration: 4,
        workStyle: "ハイブリッド"
      },
      workingPattern: {
        type: "execution",
        monthlyHours: 30,
        description: "実務の中心的推進を担当",
        details: [
          "週3-4回の稼働",
          "プロジェクトの実質的リード",
          "週次進捗レビュー"
        ]
      },
      mission: isMarketingProject
        ? "マーケティング施策の実行とPDCAサイクルの確立により、具体的な成果創出を実現する"
        : "システム実装とデータ基盤構築により、DX推進の土台を確立する",
      tasks: [
        {
          category: "実行",
          task: isMarketingProject ? "広告運用・コンテンツ制作" : "システム開発・導入",
          hoursPerWeek: 20,
          importance: "★★★"
        },
        {
          category: "分析",
          task: isMarketingProject ? "効果測定・レポート作成" : "データ分析・改善提案",
          hoursPerWeek: 8,
          importance: "★★☆"
        }
      ],
      requirements: {
        mandatorySkills: [
          isMarketingProject 
            ? "デジタル広告運用経験2年以上"
            : "Webアプリケーション開発経験3年以上",
          "データ分析スキル"
        ],
        personalityTraits: [
          "実行力とスピード感を重視",
          "数値にコミットする姿勢"
        ]
      },
      profileExample: isMarketingProject
        ? `例：広告代理店のデジタルマーケター
- Google/Facebook広告で月500万円の運用実績
- BtoB領域でのリードジェン経験豊富`
        : `例：スタートアップのフルスタックエンジニア
- React/Node.jsでのWebアプリ開発経験
- AWS/GCPでのインフラ構築経験`
    }
  ];

  // チームプラン
  const teamPlans = [
    {
      id: "plan_standard",
      name: "プランA：スタンダード",
      type: "standard",
      composition: [
        { positionId: "position1", monthlyHours: 25 },
        { positionId: "position2", monthlyHours: 30 }
      ],
      totalMonthlyHours: 55,
      features: [
        "バランスの取れた体制",
        "戦略と実行の分離",
        "最も成功事例が多いパターン"
      ]
    },
    {
      id: "plan_light",
      name: "プランB：ライト",
      type: "light", 
      composition: [
        { positionId: "position1", monthlyHours: 35 }
      ],
      totalMonthlyHours: 35,
      features: [
        "コミュニケーションコストが低い",
        "統一感のある推進",
        "予算効率が良い"
      ],
      notes: [
        "1人への依存度が高い",
        "専門性では劣る可能性"
      ]
    },
    {
      id: "plan_advisory",
      name: "プランC：アドバイザリー", 
      type: "advisory",
      composition: [
        { positionId: "position1", monthlyHours: 15 },
        { positionId: "position2", monthlyHours: 25 }
      ],
      totalMonthlyHours: 40,
      features: [
        "高度な戦略性を確保",
        "実行も並行して推進", 
        "段階的な体制構築に最適"
      ]
    }
  ];

  return {
    recommendedTeam,
    positions,
    teamPlans,
    summary: {
      totalCost: calculateTotalCost(teamPlans[0], positions),
      expectedOutcome: projectDesign.idealState3Months || "3ヶ月で具体的な成果を創出",
      timeline: `${projectDesign.phases?.length || 3}段階での推進（合計${positions[0]?.basicInfo.duration || 6}ヶ月）`
    }
  };
}

// コスト計算（簡易版）
function calculateTotalCost(standardPlan, positions) {
  let totalCost = 0;
  standardPlan.composition.forEach(comp => {
    const position = positions.find(p => p.id === comp.positionId);
    if (position) {
      // 仮単価：1時間あたり5,000円として計算
      totalCost += comp.monthlyHours * 5000;
    }
  });
  return totalCost;
}