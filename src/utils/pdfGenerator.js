import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';

// 日本語フォントの登録
Font.register({
  family: 'NotoSansJP',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/ea/notosansjapanese/v6/NotoSansJP-Regular.otf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/ea/notosansjapanese/v6/NotoSansJP-Bold.otf', 
      fontWeight: 700,
    },
  ],
});

// 日本語対応のスタイル定義
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'NotoSansJP',
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'NotoSansJP',
  },
  subHeader: {
    fontSize: 10,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666666',
    fontFamily: 'NotoSansJP',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2563EB',
    fontFamily: 'NotoSansJP',
  },
  fieldContainer: {
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
    fontFamily: 'NotoSansJP',
  },
  fieldValue: {
    fontSize: 9,
    color: '#111827',
    lineHeight: 1.4,
    fontFamily: 'NotoSansJP',
  },
  listItem: {
    fontSize: 9,
    marginBottom: 2,
    paddingLeft: 10,
    fontFamily: 'NotoSansJP',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginVertical: 15,
  },
  scoreSection: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
  },
  scoreTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 5,
    fontFamily: 'NotoSansJP',
  },
  guideSection: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 4,
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 5,
    fontFamily: 'NotoSansJP',
  },
  guideText: {
    fontSize: 9,
    color: '#064E3B',
    lineHeight: 1.3,
    fontFamily: 'NotoSansJP',
  }
});

// PDFドキュメントコンポーネント
const LotsfulPDFDocument = ({ template }) => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${(now.getMonth() + 1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // 分析精度スコア計算
  const calculateScore = () => {
    let score = 0;
    if (template.companyProfile?.name && template.companyProfile.name !== '情報不足により特定不可') score += 15;
    if (template.currentAnalysis?.challengeCategories?.length > 0) score += 15;
    if (template.metadata?.selectedBusinessItems?.length > 0) score += 20;
    if (template.researchData?.deepResearchMemo && template.researchData.deepResearchMemo !== '情報不足により特定不可') score += 12;
    if (template.metadata?.actualWorkingHours) score += 12;
    if (template.metadata?.talentCount) score += 10;
    return Math.round((score / 177) * 100);
  };

  const analysisScore = calculateScore();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <Text style={styles.header}>Lotsful 1次情報統合レポート</Text>
        <Text style={styles.subHeader}>生成日時: {dateStr}</Text>
        
        <View style={styles.separator} />

        {/* 企業基本情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>企業基本情報</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>企業名</Text>
            <Text style={styles.fieldValue}>{template.companyProfile?.name || '情報不足により特定不可'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>業界</Text>
            <Text style={styles.fieldValue}>
              {template.companyProfile?.industry?.length > 0 ? template.companyProfile.industry.join(', ') : '情報不足により特定不可'}
            </Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>従業員数</Text>
            <Text style={styles.fieldValue}>{template.companyProfile?.employeeCount || '情報不足により特定不可'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>年商</Text>
            <Text style={styles.fieldValue}>{template.companyProfile?.revenue || '情報不足により特定不可'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>本社所在地</Text>
            <Text style={styles.fieldValue}>{template.companyProfile?.headquarters || '情報不足により特定不可'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>事業内容</Text>
            <Text style={styles.fieldValue}>{template.companyProfile?.businessDescription || '情報不足により特定不可'}</Text>
          </View>
        </View>

        {/* 事前リサーチ情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 事前リサーチ情報</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>ディープリサーチメモ</Text>
            <Text style={styles.fieldValue}>{template.researchData?.deepResearchMemo || '情報不足により特定不可'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>最近の動き・ニュース</Text>
            <Text style={styles.fieldValue}>{template.researchData?.recentNews || '情報不足により特定不可'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>組織文化・特徴</Text>
            <Text style={styles.fieldValue}>{template.researchData?.organizationCulture || '情報不足により特定不可'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>仮説・洞察</Text>
            <Text style={styles.fieldValue}>{template.researchData?.hypothesisInsights || '情報不足により特定不可'}</Text>
          </View>
        </View>

        {/* 現状分析 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 現状分析</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>事業フェーズ</Text>
            <Text style={styles.fieldValue}>{template.currentAnalysis?.businessPhase || '情報不足により特定不可'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>課題カテゴリ</Text>
            <Text style={styles.fieldValue}>
              {template.currentAnalysis?.challengeCategories?.length > 0 ? 
                template.currentAnalysis.challengeCategories.join(', ') : 
                '情報不足により特定不可'}
            </Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>これまでの取り組み</Text>
            <Text style={styles.fieldValue}>{template.currentAnalysis?.previousEfforts || '情報不足により特定不可'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>失敗理由</Text>
            <Text style={styles.fieldValue}>{template.currentAnalysis?.failureReasons || '情報不足により特定不可'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>不足スキル</Text>
            <Text style={styles.fieldValue}>
              {template.currentAnalysis?.missingSkills?.length > 0 ? 
                template.currentAnalysis.missingSkills.join(', ') : 
                '情報不足により特定不可'}
            </Text>
          </View>
        </View>

        {/* プロジェクト設計 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 プロジェクト設計</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>課題要約</Text>
            <Text style={styles.fieldValue}>{template.projectDesign?.challengeSummary || '情報不足により特定不可'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>緊急性の理由</Text>
            <Text style={styles.fieldValue}>{template.projectDesign?.urgencyReason || '情報不足により特定不可'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>3ヶ月後の理想状態</Text>
            <Text style={styles.fieldValue}>{template.projectDesign?.idealState3Months || '情報不足により特定不可'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>稼働時間</Text>
            <Text style={styles.fieldValue}>
              {template.metadata?.actualWorkingHours ? 
                `${template.metadata.actualWorkingHours}時間/月` : 
                '情報不足により特定不可'}
            </Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>希望人数</Text>
            <Text style={styles.fieldValue}>
              {template.metadata?.talentCount ? 
                `${template.metadata.talentCount}名` : 
                '情報不足により特定不可'}
            </Text>
          </View>
        </View>

        {/* 選択業務項目 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 選択業務項目</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>選択項目数</Text>
            <Text style={styles.fieldValue}>
              {template.metadata?.selectedBusinessItems?.length || 0}項目
            </Text>
          </View>
          
          {template.metadata?.selectedBusinessItems?.map((item, index) => (
            <Text key={index} style={styles.listItem}>
              ・ {item.category} / {item.phase}: {item.item || item.title}
            </Text>
          ))}
          
          {(!template.metadata?.selectedBusinessItems || template.metadata.selectedBusinessItems.length === 0) && (
            <Text style={styles.fieldValue}>業務項目が選択されていません</Text>
          )}
        </View>

        {/* データ品質・生成情報 */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreTitle}>📈 データ品質・生成情報</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>分析精度スコア</Text>
            <Text style={styles.fieldValue}>{analysisScore}/100</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>完了ステップ</Text>
            <Text style={styles.fieldValue}>
              {template.metadata?.step1Completed ? 'Step1 完了' : 'Step1 未完了'} / 
              {template.metadata?.step2Completed ? 'Step2 完了' : 'Step2 未完了'} / 
              {template.metadata?.step3Completed ? 'Step3 完了' : 'Step3 未完了'}
            </Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>生成システム</Text>
            <Text style={styles.fieldValue}>Lotsful AI Engine v1.0</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>最終更新</Text>
            <Text style={styles.fieldValue}>{template.metadata?.lastUpdated || new Date().toISOString()}</Text>
          </View>
        </View>

        {/* 活用ガイド */}
        <View style={styles.guideSection}>
          <Text style={styles.guideTitle}>活用ガイド</Text>
          <Text style={styles.guideText}>
            ※このPDFは「1次情報」です。
          </Text>
          <Text style={styles.guideText}>
            以下の用途でご活用ください：
          </Text>
          <Text style={styles.guideText}>
            1. 外部AIツール分析: Claude、ChatGPT等に入力
          </Text>
          <Text style={styles.guideText}>
            2. 社内共有: 関係者への情報共有資料
          </Text>
          <Text style={styles.guideText}>
            3. 提案書作成: 他システムでの2次加工素材
          </Text>
          <Text style={styles.guideText}>
            4. バックアップ: システム非依存の情報保存
          </Text>
          <Text style={styles.guideText}>
            5. 顧客説明: 分析プロセスの透明性確保
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export const downloadPDF = async (template, filename) => {
  try {
    console.log('Starting PDF generation...');
    
    // ブラウザ環境チェック
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in browser environment');
    }
    
    // テンプレートデータ検証
    if (!template) {
      throw new Error('Template data is required');
    }
    
    console.log('Creating PDF document component...');
    
    // PDFを生成
    const doc = <LotsfulPDFDocument template={template} />;
    
    console.log('Generating PDF blob...');
    const blob = await pdf(doc).toBlob();
    
    console.log('PDF blob generated successfully, size:', blob.size);
    
    // ファイル名生成
    const companyName = template.companyProfile?.name || 'Unknown';
    const cleanCompanyName = companyName.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_');
    const now = new Date();
    const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const finalFilename = filename || `lotsful_${cleanCompanyName}_${dateStr}.pdf`;
    
    console.log('Starting download with filename:', finalFilename);
    
    // ダウンロード実行
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('PDF download completed successfully');
    
    return { success: true, filename: finalFilename };
  } catch (error) {
    console.error('PDF generation failed:', error);
    return { success: false, error: error.message };
  }
};