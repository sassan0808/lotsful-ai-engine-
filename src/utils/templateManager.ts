// テンプレート管理システム
import React from 'react';
import { LotsfulTemplate, createEmptyTemplate, PartialLotsfulTemplate } from '../types/template';

const TEMPLATE_STORAGE_KEY = 'lotsful_template';

export class TemplateManager {
  // テンプレートを読み込み
  static loadTemplate(): LotsfulTemplate {
    if (typeof window === 'undefined') {
      // サーバーサイドでは空のテンプレートを返す
      return createEmptyTemplate();
    }

    try {
      const stored = sessionStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 既存テンプレートに新しい構造をマージ（後方互換性）
        return this.mergeWithDefaults(parsed);
      }
    } catch (error) {
      console.warn('Failed to load template from storage:', error);
    }

    return createEmptyTemplate();
  }

  // テンプレートを保存
  static saveTemplate(template: LotsfulTemplate): void {
    if (typeof window === 'undefined') return;

    try {
      // 最終更新日時を更新
      const updatedTemplate = {
        ...template,
        metadata: {
          ...template.metadata,
          lastUpdated: new Date().toISOString(),
        },
      };

      sessionStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updatedTemplate));
    } catch (error) {
      console.error('Failed to save template to storage:', error);
    }
  }

  // 部分更新
  static updateTemplate(updates: PartialLotsfulTemplate): LotsfulTemplate {
    const currentTemplate = this.loadTemplate();
    const updatedTemplate = this.deepMerge(currentTemplate, updates);
    this.saveTemplate(updatedTemplate);
    return updatedTemplate;
  }

  // Step1の更新（企業情報・リサーチデータ）
  static updateStep1(companyProfile: Partial<LotsfulTemplate['companyProfile']>, researchData: Partial<LotsfulTemplate['researchData']>): LotsfulTemplate {
    const currentTemplate = this.loadTemplate();
    
    const updates: PartialLotsfulTemplate = {
      companyProfile: { ...currentTemplate.companyProfile, ...companyProfile },
      researchData: { ...currentTemplate.researchData, ...researchData },
      metadata: {
        ...currentTemplate.metadata,
        step1Completed: true,
      },
    };

    return this.updateTemplate(updates);
  }

  // Step2の更新（現状分析・プロジェクト設計）
  static updateStep2(currentAnalysis: Partial<LotsfulTemplate['currentAnalysis']>, projectDesign: Partial<LotsfulTemplate['projectDesign']>): LotsfulTemplate {
    const currentTemplate = this.loadTemplate();
    
    const updates: PartialLotsfulTemplate = {
      currentAnalysis: { ...currentTemplate.currentAnalysis, ...currentAnalysis },
      projectDesign: { ...currentTemplate.projectDesign, ...projectDesign },
      metadata: {
        ...currentTemplate.metadata,
        step2Completed: true,
      },
    };

    return this.updateTemplate(updates);
  }

  // 人材提案の生成と保存
  static async generateTalentProposal(): Promise<LotsfulTemplate> {
    const currentTemplate = this.loadTemplate();
    
    try {
      const response = await fetch('/api/generate-talent-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: currentTemplate
        })
      });

      if (!response.ok) {
        throw new Error('Talent proposal generation failed');
      }

      const result = await response.json();
      
      // 人材提案をテンプレートに保存
      const updatedTemplate = {
        ...currentTemplate,
        matchingStrategy: {
          ...currentTemplate.matchingStrategy,
          talentProposal: result.talentProposal
        },
        metadata: {
          ...currentTemplate.metadata,
          lastUpdated: new Date().toISOString(),
        }
      };

      this.saveTemplate(updatedTemplate);
      
      // 分析履歴を追加
      this.addAnalysisHistory(
        4, // Step4として人材提案を扱う
        'talentProposal',
        { templateData: currentTemplate },
        result
      );

      return updatedTemplate;
    } catch (error) {
      console.error('Talent proposal generation error:', error);
      throw error;
    }
  }

  // Step3の更新（業務選択項目）
  static updateStep3(template: LotsfulTemplate, stepData: { selectedBusinessItems: any[], workingHours: number }): LotsfulTemplate {
    // 稼働時間を適切な型にマッピング
    let workingHoursType: 'light_10h' | 'standard_20h' | 'commit_30h' | '' = '';
    if (stepData.workingHours <= 10) {
      workingHoursType = 'light_10h';
    } else if (stepData.workingHours <= 20) {
      workingHoursType = 'standard_20h';
    } else if (stepData.workingHours <= 30) {
      workingHoursType = 'commit_30h';
    } else {
      workingHoursType = 'commit_30h'; // 30時間以上も commit_30h とする
    }

    const updates: PartialLotsfulTemplate = {
      metadata: {
        ...template.metadata,
        step3Completed: true,
        selectedBusinessItems: stepData.selectedBusinessItems,
        // 実際の稼働時間数値もメタデータに保存
        actualWorkingHours: stepData.workingHours,
      },
      projectDesign: {
        ...template.projectDesign,
        workingHours: workingHoursType,
      },
    };

    const updatedTemplate = this.deepMerge(template, updates);
    this.saveTemplate(updatedTemplate);
    return updatedTemplate;
  }

  // 分析履歴を追加
  static addAnalysisHistory(step: number, analysisType: string, inputData: any, outputData: any): void {
    const template = this.loadTemplate();
    const historyEntry = {
      step,
      timestamp: new Date().toISOString(),
      analysisType,
      inputData,
      outputData,
    };

    template.metadata.analysisHistory.push(historyEntry);
    this.saveTemplate(template);
  }

  // テンプレートをクリア
  static clearTemplate(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(TEMPLATE_STORAGE_KEY);
  }

  // テンプレートをエクスポート
  static exportTemplate(): string {
    const template = this.loadTemplate();
    return JSON.stringify(template, null, 2);
  }

  // テンプレートをインポート
  static importTemplate(templateJson: string): LotsfulTemplate {
    try {
      const parsed = JSON.parse(templateJson);
      const mergedTemplate = this.mergeWithDefaults(parsed);
      this.saveTemplate(mergedTemplate);
      return mergedTemplate;
    } catch (error) {
      console.error('Failed to import template:', error);
      throw new Error('Invalid template format');
    }
  }

  // デバッグ用：テンプレートの状況を確認
  static getTemplateStatus(): {
    hasData: boolean;
    step1Completed: boolean;
    step2Completed: boolean;
    step3Completed: boolean;
    selectedItemsCount: number;
    lastUpdated: string;
  } {
    const template = this.loadTemplate();
    return {
      hasData: template.companyProfile.name !== '' || template.researchData.deepResearchMemo !== '',
      step1Completed: template.metadata.step1Completed,
      step2Completed: template.metadata.step2Completed,
      step3Completed: template.metadata.step3Completed,
      selectedItemsCount: template.metadata.selectedBusinessItems.length,
      lastUpdated: template.metadata.lastUpdated,
    };
  }

  // プライベート: デフォルト値とマージ（後方互換性）
  private static mergeWithDefaults(stored: any): LotsfulTemplate {
    const defaultTemplate = createEmptyTemplate();
    return this.deepMerge(defaultTemplate, stored);
  }

  // プライベート: 深いマージ
  private static deepMerge(target: any, source: any): any {
    if (source === null || source === undefined) return target;
    if (typeof source !== 'object') return source;
    
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (Array.isArray(source[key])) {
          result[key] = [...source[key]];
        } else if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }
}

// React Hook用のユーティリティ
export const useTemplate = () => {
  const [template, setTemplate] = React.useState<LotsfulTemplate>(createEmptyTemplate());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadedTemplate = TemplateManager.loadTemplate();
    setTemplate(loadedTemplate);
    setLoading(false);
  }, []);

  const updateTemplate = React.useCallback((updates: PartialLotsfulTemplate) => {
    const updatedTemplate = TemplateManager.updateTemplate(updates);
    setTemplate(updatedTemplate);
    return updatedTemplate;
  }, []);

  const clearTemplate = React.useCallback(() => {
    TemplateManager.clearTemplate();
    const emptyTemplate = createEmptyTemplate();
    setTemplate(emptyTemplate);
  }, []);

  return {
    template,
    loading,
    updateTemplate,
    clearTemplate,
    status: TemplateManager.getTemplateStatus(),
  };
};

export default TemplateManager;