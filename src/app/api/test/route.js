import { NextResponse } from 'next/server';

export async function GET() {
  const modelInfo = {
    analyzeEndpoint: 'gemini-2.5-flash-preview-05-20',
    companyAnalysisEndpoint: 'gemini-2.5-flash-preview-05-20',
    apiVersion: 'v1beta'
  };

  return NextResponse.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    geminiModel: modelInfo,
    env: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      keyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) + '...'
    }
  });
}