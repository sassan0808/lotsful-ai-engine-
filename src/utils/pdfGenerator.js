import jsPDF from 'jspdf';
import 'jspdf-autotable';

// 日本語フォント対応のため、フォントファイルを埋め込み用に準備
// 実際の運用では、フォントファイルを追加する必要がある
// 今回は基本的なASCII文字とひらがな・カタカナ・漢字の代替表示で対応

export const generatePrimaryDataPDF = (template) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // フォント設定（日本語対応）
  doc.setFont('helvetica');
  
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 7;
  
  // ヘッダー
  doc.setFontSize(20);
  doc.text('Lotsful 1次情報統合レポート', margin, yPosition);
  yPosition += 15;
  
  doc.setFontSize(10);
  const now = new Date();
  const dateStr = `生成日時: ${now.getFullYear()}年${(now.getMonth() + 1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  doc.text(dateStr, margin, yPosition);
  yPosition += 15;
  
  // 区切り線
  doc.line(margin, yPosition, 190, yPosition);
  yPosition += 10;
  
  // セクション追加のヘルパー関数
  const addSection = (title, emoji) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${emoji} ${title}`, margin, yPosition);
    yPosition += 10;
    
    doc.line(margin, yPosition, 190, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  };
  
  // テキストフィールド追加のヘルパー関数
  const addField = (label, value, multiline = false) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}: `, margin, yPosition);
    
    doc.setFont('helvetica', 'normal');
    const displayValue = value && value !== '情報不足により特定不可' ? value : '情報不足により特定不可';
    
    if (multiline && displayValue.length > 60) {
      const lines = doc.splitTextToSize(displayValue, 160);
      doc.text(lines, margin + 5, yPosition + lineHeight);
      yPosition += lines.length * lineHeight + 3;
    } else {
      const shortValue = displayValue.length > 80 ? displayValue.substring(0, 80) + '...' : displayValue;
      doc.text(shortValue, margin + 40, yPosition);
      yPosition += lineHeight;
    }
  };
  
  // 配列フィールド追加のヘルパー関数
  const addArrayField = (label, array) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}: `, margin, yPosition);
    yPosition += lineHeight;
    
    doc.setFont('helvetica', 'normal');
    if (array && array.length > 0) {
      array.forEach((item, index) => {
        if (yPosition > pageHeight - 15) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`  • ${item}`, margin + 5, yPosition);
        yPosition += lineHeight;
      });
    } else {
      doc.text('  情報不足により特定不可', margin + 5, yPosition);
      yPosition += lineHeight;
    }
    yPosition += 3;
  };
  
  // 1. 企業基本情報
  addSection('企業基本情報', '🏢');
  
  if (template.companyProfile) {
    addField('企業名', template.companyProfile.name);
    addArrayField('業界', template.companyProfile.industry);
    addField('従業員数', template.companyProfile.employeeCount);
    addField('年商', template.companyProfile.revenue);
    addField('本社所在地', template.companyProfile.headquarters);
    addField('事業内容', template.companyProfile.businessDescription, true);
    addField('主要顧客層', template.companyProfile.mainCustomers, true);
  }
  
  yPosition += 5;
  
  // 2. 事前リサーチ情報
  addSection('事前リサーチ情報', '🔍');
  
  if (template.researchData) {
    addField('ディープリサーチ', template.researchData.deepResearchMemo, true);
    addField('最近の動き', template.researchData.recentNews, true);
    addField('組織特徴', template.researchData.organizationCulture, true);
    addField('仮説・洞察', template.researchData.hypothesisInsights, true);
    
    if (template.researchData.meetingCheckpoints && template.researchData.meetingCheckpoints.length > 0) {
      addArrayField('ミーティングチェックポイント', template.researchData.meetingCheckpoints);
    }
  }
  
  yPosition += 5;
  
  // 3. 現状分析
  addSection('現状分析', '📊');
  
  if (template.currentAnalysis) {
    addField('事業フェーズ', template.currentAnalysis.businessPhase);
    addArrayField('課題カテゴリ', template.currentAnalysis.challengeCategories);
    addField('これまでの取り組み', template.currentAnalysis.previousEfforts, true);
    addField('失敗理由', template.currentAnalysis.failureReasons, true);
    addArrayField('不足スキル', template.currentAnalysis.missingSkills);
    addField('外部人材経験', template.currentAnalysis.externalTalentExperience);
    addField('意思決定プロセス', template.currentAnalysis.decisionProcess);
    
    if (template.currentAnalysis.teamComposition && template.currentAnalysis.teamComposition.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('チーム構成: ', margin, yPosition);
      yPosition += lineHeight;
      
      doc.setFont('helvetica', 'normal');
      template.currentAnalysis.teamComposition.forEach(team => {
        if (yPosition > pageHeight - 15) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`  • ${team.department}: ${team.headcount}名 (${team.mainRole})`, margin + 5, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 3;
    }
  }
  
  yPosition += 5;
  
  // 4. プロジェクト設計
  addSection('プロジェクト設計', '🎯');
  
  if (template.projectDesign) {
    addField('解決したい課題', template.projectDesign.challengeSummary, true);
    addField('緊急性の理由', template.projectDesign.urgencyReason, true);
    addField('3ヶ月後の理想状態', template.projectDesign.idealState3Months, true);
    addField('稼働時間', template.projectDesign.workingHours);
    
    if (template.projectDesign.deliverables) {
      addArrayField('期待成果物', template.projectDesign.deliverables);
    }
    
    if (template.projectDesign.budget) {
      const budget = template.projectDesign.budget;
      addField('予算', `月${budget.monthlyBudget || 0}万円 × ${budget.duration || 0}ヶ月 = 総額${budget.totalBudget || 0}万円`);
    }
    
    if (template.projectDesign.scope) {
      addArrayField('スコープ(含む)', template.projectDesign.scope.included);
      addArrayField('スコープ(含まない)', template.projectDesign.scope.excluded);
    }
  }
  
  yPosition += 5;
  
  // 5. 選択業務項目
  addSection('選択業務項目', '🔧');
  
  if (template.metadata && template.metadata.selectedBusinessItems && template.metadata.selectedBusinessItems.length > 0) {
    doc.text(`選択項目数: ${template.metadata.selectedBusinessItems.length}項目`, margin, yPosition);
    yPosition += lineHeight + 3;
    
    template.metadata.selectedBusinessItems.forEach((item, index) => {
      if (yPosition > pageHeight - 15) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`• ${item.category} / ${item.phase}: ${item.item || item.title}`, margin + 5, yPosition);
      yPosition += lineHeight;
    });
  } else {
    doc.text('業務項目が選択されていません', margin, yPosition);
    yPosition += lineHeight;
  }
  
  yPosition += 10;
  
  // 6. データ品質・生成情報
  addSection('データ品質・生成情報', '📈');
  
  // 分析精度スコア計算（簡易版）
  const calculateSimpleScore = () => {
    let score = 0;
    if (template.companyProfile?.name) score += 15;
    if (template.currentAnalysis?.challengeCategories?.length > 0) score += 15;
    if (template.metadata?.selectedBusinessItems?.length > 0) score += 20;
    if (template.researchData?.deepResearchMemo) score += 12;
    if (template.metadata?.actualWorkingHours) score += 12;
    if (template.metadata?.talentCount) score += 10;
    return Math.round((score / 177) * 100);
  };
  
  const analysisScore = calculateSimpleScore();
  addField('分析精度スコア', `${analysisScore}/100`);
  
  const completedSteps = [
    template.metadata?.step1Completed ? 'Step1 ✓' : 'Step1 ×',
    template.metadata?.step2Completed ? 'Step2 ✓' : 'Step2 ×', 
    template.metadata?.step3Completed ? 'Step3 ✓' : 'Step3 ×'
  ];
  addField('完了ステップ', completedSteps.join(' / '));
  addField('生成システム', 'Lotsful AI Engine v1.0');
  addField('データソース', 'Step1-4累積テンプレートデータ');
  addField('最終更新', template.metadata?.lastUpdated || new Date().toISOString());
  
  yPosition += 10;
  
  // 7. 活用ガイド
  addSection('活用ガイド', '📋');
  
  doc.text('※このPDFは「1次情報」です。', margin, yPosition);
  yPosition += lineHeight;
  doc.text('　以下の用途でご活用ください：', margin, yPosition);
  yPosition += lineHeight + 3;
  
  const usageGuide = [
    '1. 外部AIツール分析: Claude、ChatGPT等に入力',
    '2. 社内共有: 関係者への情報共有資料',
    '3. 提案書作成: 他システムでの2次加工素材',
    '4. バックアップ: システム非依存の情報保存',
    '5. 顧客説明: 分析プロセスの透明性確保'
  ];
  
  usageGuide.forEach(guide => {
    if (yPosition > pageHeight - 15) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(guide, margin + 5, yPosition);
    yPosition += lineHeight;
  });
  
  return doc;
};

export const downloadPDF = (template, filename) => {
  try {
    const doc = generatePrimaryDataPDF(template);
    
    // ファイル名生成
    const companyName = template.companyProfile?.name || 'Unknown';
    const now = new Date();
    const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const finalFilename = filename || `lotsful_${companyName}_${dateStr}.pdf`;
    
    // ダウンロード実行
    doc.save(finalFilename);
    
    return { success: true, filename: finalFilename };
  } catch (error) {
    console.error('PDF generation failed:', error);
    return { success: false, error: error.message };
  }
};