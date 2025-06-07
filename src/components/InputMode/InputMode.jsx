"use client";

import React, { useState } from 'react';
import { FileText, PenTool } from 'lucide-react';
import StructuredInput from './StructuredInput';
import FreeformInput from './FreeformInput';

const InputMode = ({ onAnalyze, isAnalyzing, setIsAnalyzing }) => {
  const [inputMode, setInputMode] = useState('structured');

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">入力モード選択</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setInputMode('structured')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                inputMode === 'structured'
                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>構造化入力</span>
            </button>
            <button
              onClick={() => setInputMode('freeform')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                inputMode === 'freeform'
                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <PenTool className="h-4 w-4" />
              <span>自由記述</span>
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {inputMode === 'structured' ? (
            <p>フォーム形式で体系的に情報を入力してください。より精度の高い分析が可能です。</p>
          ) : (
            <p>自由な文章で課題や要望を記述してください。AIが内容を解析します。</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        {inputMode === 'structured' ? (
          <StructuredInput 
            onAnalyze={onAnalyze} 
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        ) : (
          <FreeformInput 
            onAnalyze={onAnalyze}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        )}
      </div>
    </div>
  );
};

export default InputMode;