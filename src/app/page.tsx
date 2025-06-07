"use client";

import { Sparkles, Target, TrendingUp, Shield } from 'lucide-react';
import ThreeStepFlow from '@/components/ThreeStepFlow/ThreeStepFlow';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Lotsful AI Engine
              </h1>
              <span className="text-sm text-gray-500 ml-2">
                業務切り出し可視化システム
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">業務切り出し</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">AI分析</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">プロジェクト提案</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              企業情報から最適な業務切り出しプロジェクトを提案
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              AIが企業の情報と課題を分析し、副業/兼業人材を活用した統合的なプロジェクトを自動設計。
              リモートワーク中心、月10-80時間（デフォルト30時間）の制約下で最大の成果を生み出すプランを提案します。
            </p>
          </div>

          <ThreeStepFlow />
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 Lotsful AI Engine. All rights reserved.</p>
            <p className="mt-1">
              AI駆動型業務切り出し可視化システム
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}