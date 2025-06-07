import { NextResponse } from 'next/server';
import { INDUSTRIES } from '../../../data/industries.js';

export async function POST(request) {
  try {
    const { companyInfo } = await request.json();
    
    if (!companyInfo || companyInfo.trim().length < 100) {
      return NextResponse.json(
        { error: 'Company information is too short. Please provide at least 100 characters.' },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using mock analysis');
      return NextResponse.json(generateMockCompanyAnalysis(companyInfo));
    }

    // Create analysis prompt for Gemini
    const prompt = createCompanyAnalysisPrompt(companyInfo);
    
    try {
      // Call Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
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

      // Parse the AI response
      const analysisResult = parseCompanyAnalysisResponse(generatedText, companyInfo);
      
      return NextResponse.json(analysisResult);
      
    } catch (apiError) {
      console.error('Gemini API error:', apiError);
      // Fallback to mock analysis
      return NextResponse.json(generateMockCompanyAnalysis(companyInfo));
    }
    
  } catch (error) {
    console.error('Company analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function createCompanyAnalysisPrompt(companyInfo) {
  const industryList = Object.keys(INDUSTRIES).join(', ');
  
  return `
以下の企業情報を分析し、指定フォーマットで結果を出力してください。

## 企業情報
${companyInfo}

## 利用可能な業界カテゴリ
${industryList}

## 出力フォーマット（必ずこの形式で出力してください）

### 企業名
[企業名を特定]

### 業界
[上記リストから最も適切な業界を1-3つ選択]

### 企業規模
[従業員数規模: スタートアップ/中小企業/中堅企業/大企業]

### 事業内容
[主要な事業内容を1-2行で要約]

### 組織特徴
[組織の特徴や文化を1-2行で要約]

### 成長ステージ
[創業期/成長期/拡大期/成熟期のいずれか]

### 主要課題
[現在直面していると推測される課題を2-3個]

簡潔で正確な分析を心がけ、推測は最小限に留めてください。
`;
}

function parseCompanyAnalysisResponse(text, originalCompanyInfo) {
  // Basic parsing of structured response
  const sections = {
    企業名: extractSection(text, '企業名'),
    業界: extractSection(text, '業界'),
    企業規模: extractSection(text, '企業規模'),
    事業内容: extractSection(text, '事業内容'),
    組織特徴: extractSection(text, '組織特徴'),
    成長ステージ: extractSection(text, '成長ステージ'),
    主要課題: extractSection(text, '主要課題')
  };

  // Parse industries from the response
  const detectedIndustries = parseIndustries(sections.業界);

  return {
    companyName: sections.企業名 || '企業名を特定できませんでした',
    industries: detectedIndustries,
    companySize: sections.企業規模 || '規模不明',
    businessDescription: sections.事業内容 || '事業内容を特定できませんでした',
    organizationFeatures: sections.組織特徴 || '組織特徴を特定できませんでした',
    growthStage: sections.成長ステージ || '成長ステージ不明',
    mainChallenges: parseChallenges(sections.主要課題),
    analysisDate: new Date().toISOString(),
    originalText: originalCompanyInfo,
    confidence: calculateConfidence(sections)
  };
}

function extractSection(text, sectionName) {
  const regex = new RegExp(`###?\\s*${sectionName}[\\s\\S]*?(?=###|$)`, 'i');
  const match = text.match(regex);
  if (match) {
    return match[0]
      .replace(/###?\s*[^:：\n]+[:：]?\s*/, '')
      .replace(/\[|\]/g, '')
      .trim();
  }
  return null;
}

function parseIndustries(industryText) {
  if (!industryText) return [];
  
  const availableIndustries = Object.keys(INDUSTRIES);
  const detectedIndustries = [];
  
  // Check for exact matches first
  for (const industry of availableIndustries) {
    if (industryText.includes(industry)) {
      detectedIndustries.push(industry);
    }
  }
  
  // If no exact matches, try fuzzy matching
  if (detectedIndustries.length === 0) {
    const text = industryText.toLowerCase();
    
    // Common mappings
    const mappings = {
      'it': ['IT'],
      'ソフトウェア': ['SaaS'],
      'システム': ['SaaS', 'IT'],
      'テクノロジー': ['IT', 'SaaS'],
      '製造': ['製造業'],
      '小売': ['小売'],
      '金融': ['金融'],
      'コンサル': ['コンサル'],
      '医療': ['医療'],
      '教育': ['教育'],
      '不動産': ['不動産'],
      'ec': ['EC'],
      'eコマース': ['EC'],
      '電子商取引': ['EC'],
      '人材': ['人材'],
      '広告': ['広告'],
      'マーケティング': ['広告'],
      '物流': ['物流'],
      'fintech': ['FinTech'],
      'プロップテック': ['PropTech'],
      'edtech': ['EdTech'],
      'healthtech': ['HealthTech']
    };
    
    for (const [keyword, industries] of Object.entries(mappings)) {
      if (text.includes(keyword)) {
        detectedIndustries.push(...industries);
      }
    }
  }
  
  // Remove duplicates and limit to 3
  return [...new Set(detectedIndustries)].slice(0, 3);
}

function parseChallenges(challengeText) {
  if (!challengeText) return [];
  
  // Split by common delimiters and clean up
  return challengeText
    .split(/[、,，\n\r•\-\*]/)
    .map(challenge => challenge.trim())
    .filter(challenge => challenge.length > 0 && challenge.length < 100)
    .slice(0, 5);
}

function calculateConfidence(sections) {
  const filledSections = Object.values(sections).filter(section => section && section.length > 0).length;
  const totalSections = Object.keys(sections).length;
  return Math.round((filledSections / totalSections) * 100);
}

function generateMockCompanyAnalysis(companyInfo) {
  // Try to extract basic info from the text
  const text = companyInfo.toLowerCase();
  
  // Simple industry detection based on keywords
  let detectedIndustries = [];
  if (text.includes('it') || text.includes('ソフトウェア') || text.includes('システム')) {
    detectedIndustries.push('SaaS');
  }
  if (text.includes('ec') || text.includes('eコマース') || text.includes('通販')) {
    detectedIndustries.push('EC');
  }
  if (text.includes('製造') || text.includes('メーカー')) {
    detectedIndustries.push('製造業');
  }
  if (text.includes('小売') || text.includes('店舗')) {
    detectedIndustries.push('小売');
  }
  if (text.includes('金融') || text.includes('銀行') || text.includes('保険')) {
    detectedIndustries.push('金融');
  }
  
  // Default to SaaS if nothing detected
  if (detectedIndustries.length === 0) {
    detectedIndustries = ['SaaS'];
  }

  return {
    companyName: '分析対象企業',
    industries: detectedIndustries,
    companySize: '中小企業',
    businessDescription: 'デジタル技術を活用したビジネスソリューションの提供',
    organizationFeatures: 'イノベーション重視、フラットな組織構造',
    growthStage: '成長期',
    mainChallenges: [
      'デジタル変革の推進',
      '営業プロセスの効率化',
      '人材リソースの最適化'
    ],
    analysisDate: new Date().toISOString(),
    originalText: companyInfo,
    confidence: 75,
    isMockData: true
  };
}