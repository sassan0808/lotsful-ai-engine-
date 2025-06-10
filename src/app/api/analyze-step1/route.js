import { NextResponse } from 'next/server';

export async function POST(request) {
  let requestData;
  
  try {
    // リクエストボディを一度だけ読み込む
    requestData = await request.json();
    const { researchText } = requestData;
    
    // 必須フィールドの検証
    if (!researchText || researchText.trim().length === 0) {
      return NextResponse.json(
        { error: 'リサーチテキストが必要です' },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using enhanced mock data');
      // 環境変数がない場合でも、基本的な解析を実行
      return NextResponse.json(generateMockStep1Analysis(researchText));
    }

    // Step1専用のプロンプトを作成
    const prompt = createStep1AnalysisPrompt(researchText);
    
    // Gemini API呼び出し
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('Invalid response from Gemini API');
    }

    // AI応答を解析してテンプレート形式に変換
    const analysisResult = parseStep1Response(generatedText, researchText);
    
    return NextResponse.json(analysisResult);
    
  } catch (error) {
    console.error('Step1 Analysis API error:', error);
    
    // エラー時はモックデータを返す
    if (requestData && requestData.researchText) {
      return NextResponse.json(generateMockStep1Analysis(requestData.researchText));
    } else {
      console.error('Request data not available for fallback');
      return NextResponse.json(generateMockStep1Analysis(''));
    }
  }
}

function createStep1AnalysisPrompt(researchText) {
  return `
企業のディープリサーチ情報から、構造化された企業情報を抽出してください。

## リサーチテキスト
${researchText}

## 抽出指示
以下の形式で情報を抽出してください。情報が見つからない項目は「情報不足により特定不可」と記載してください。

### 企業基本情報
企業名：[正式な企業名]
業界：[業界名をカンマ区切りで複数可]
設立年：[設立年または「情報不足により特定不可」]
上場：[上場/非上場または「情報不足により特定不可」]
従業員数：[1-10名/11-50名/51-100名/101-300名/301-1000名/1000名以上のいずれかまたは「情報不足により特定不可」]
年商：[1億未満/1-5億/5-10億/10-50億/50-100億/100億以上/不明のいずれかまたは「情報不足により特定不可」]
本社所在地：[所在地または「情報不足により特定不可」]
事業内容：[事業内容の詳細または「情報不足により特定不可」]
主要顧客層：[主要顧客の特徴または「情報不足により特定不可」]

### リサーチから読み取れる情報
組織の特徴・文化：[組織の特徴を3-5行で記述]
最近の動き・ニュース：[最近の重要な動きを記述]
仮説・洞察：[このリサーチから読み取れる課題や機会の仮説]

【重要な指示】
- 提供されたリサーチテキストから明確に判断できない項目については、推測や創作をせず「情報不足により特定不可」と記載してください
- 業界は可能な限り具体的に抽出し、複数業界にまたがる場合はすべて記載してください
- 事業フェーズや成長段階についても洞察があれば記載してください
`;
}

function parseStep1Response(text, originalResearchText) {
  return {
    companyProfile: {
      name: extractFieldValue(text, '企業名') || '情報不足により特定不可',
      industry: extractIndustries(text) || [],
      establishedYear: extractYear(text, '設立年'),
      isPublic: extractPublicStatus(text),
      employeeCount: extractEmployeeCount(text) || '',
      revenue: extractRevenue(text) || '',
      headquarters: extractFieldValue(text, '本社所在地') || '情報不足により特定不可',
      businessDescription: extractFieldValue(text, '事業内容') || '情報不足により特定不可',
      mainCustomers: extractFieldValue(text, '主要顧客層') || '情報不足により特定不可',
    },
    researchData: {
      deepResearchMemo: originalResearchText,
      recentNews: extractFieldValue(text, '最近の動き・ニュース') || '情報不足により特定不可',
      organizationCulture: extractFieldValue(text, '組織の特徴・文化') || '情報不足により特定不可',
      hypothesisInsights: extractFieldValue(text, '仮説・洞察') || '情報不足により特定不可',
      meetingCheckpoints: [],
    },
    metadata: {
      step1Completed: true,
      analysisTimestamp: new Date().toISOString(),
    }
  };
}

function extractFieldValue(text, fieldName) {
  const regex = new RegExp(`${fieldName}[：:]\\s*(.+?)(?=\\n|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function extractIndustries(text) {
  const industryText = extractFieldValue(text, '業界');
  if (!industryText || industryText.includes('情報不足')) {
    return [];
  }
  return industryText.split(/[,、]/).map(industry => industry.trim()).filter(industry => industry);
}

function extractYear(text, fieldName) {
  const yearText = extractFieldValue(text, fieldName);
  if (!yearText || yearText.includes('情報不足')) {
    return undefined;
  }
  const match = yearText.match(/(\d{4})/);
  return match ? parseInt(match[1]) : undefined;
}

function extractPublicStatus(text) {
  const publicText = extractFieldValue(text, '上場');
  if (!publicText || publicText.includes('情報不足')) {
    return undefined;
  }
  return publicText.includes('上場');
}

function extractEmployeeCount(text) {
  const empText = extractFieldValue(text, '従業員数');
  if (!empText || empText.includes('情報不足')) {
    return '';
  }
  
  const mappings = {
    '1-10': '1-10',
    '11-50': '11-50', 
    '51-100': '51-100',
    '101-300': '101-300',
    '301-1000': '301-1000',
    '1000': '1000+',
  };
  
  for (const [key, value] of Object.entries(mappings)) {
    if (empText.includes(key)) {
      return value;
    }
  }
  
  return 'startup';
}

function extractRevenue(text) {
  const revenueText = extractFieldValue(text, '年商');
  if (!revenueText || revenueText.includes('情報不足')) {
    return '';
  }
  
  const mappings = {
    '1億未満': 'under_100m',
    '1-5億': '100m-500m',
    '5-10億': '500m-1b',
    '10-50億': '1b-5b',
    '50-100億': '5b-10b',
    '100億以上': '10b+',
    '不明': 'unknown',
  };
  
  for (const [key, value] of Object.entries(mappings)) {
    if (revenueText.includes(key)) {
      return value;
    }
  }
  
  return 'unknown';
}

function generateMockStep1Analysis(researchText) {
  // 基本的な企業情報抽出を試行
  let companyName = '情報不足により特定不可';
  let industries = [];
  
  if (researchText) {
    // 企業名を簡易抽出
    const companyMatches = researchText.match(/株式会社[^\s\n。、]+|[^\s\n。、]+株式会社|合同会社[^\s\n。、]+|[^\s\n。、]+合同会社/);
    if (companyMatches) {
      companyName = companyMatches[0];
    }
    
    // 業界を簡易抽出
    const industryKeywords = {
      'IT・テクノロジー': ['IT', 'テック', 'ソフトウェア', 'システム', 'AI', 'DX', 'イノベーション', '技術'],
      'EC・Eコマース': ['EC', 'Eコマース', 'オンライン', '通販'],
      'コンサルティング': ['コンサル', 'アドバイザリー', '支援'],
      '人材・HR': ['人材', '採用', 'HR', '人事', 'はたらく'],
      'マーケティング': ['マーケティング', '広告', 'PR'],
      'SaaS': ['SaaS', 'クラウド', 'サービス'],
      '新規事業開発': ['新規事業', 'ベンチャー', 'スタートアップ', '事業創出']
    };
    
    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      if (keywords.some(keyword => researchText.includes(keyword))) {
        industries.push(industry);
      }
    });
    
    if (industries.length === 0) {
      industries = ['その他'];
    }
  }

  return {
    companyProfile: {
      name: companyName,
      industry: industries,
      employeeCount: '情報不足により特定不可',
      revenue: '情報不足により特定不可',
      headquarters: '情報不足により特定不可',
      businessDescription: researchText ? researchText.substring(0, 200) + '...' : '情報不足により特定不可',
      mainCustomers: '情報不足により特定不可',
    },
    researchData: {
      deepResearchMemo: researchText,
      recentNews: '詳細なリサーチ情報が必要です',
      organizationCulture: '組織の特徴を把握するには更なる調査が必要',
      hypothesisInsights: '具体的な仮説を立てるには追加情報が必要です',
      meetingCheckpoints: [
        '事業内容の詳細確認',
        '組織体制・人員構成',
        '現在の課題と目標'
      ],
    },
    metadata: {
      step1Completed: true,
      analysisTimestamp: new Date().toISOString(),
      isMockData: true,
    }
  };
}