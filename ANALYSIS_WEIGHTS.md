# 分析精度スコア - 重要度設定一覧

## コンセプト
AI分析の精度向上のため、各データ項目に重要度（重み）を設定。
重要度の高い情報はAI分析時により重視され、ユーザーにも優先入力を促す。

## 重要度分類

### 🔴 超重要（15-20点）- AI分析の核となる情報
| セクション | フィールド | 日本語表示 | 重要度 | 理由 |
|------------|------------|------------|--------|------|
| metadata | selectedBusinessItems | 選択された業務項目 | 20 | 人材要件の直接的根拠、最も重要 |
| companyProfile | name | 企業名 | 15 | 分析対象の基本識別情報 |
| currentAnalysis | challengeCategories | 課題カテゴリ | 15 | プロジェクトの方向性を決定 |

### 🟡 重要（8-12点）- 分析精度を大幅向上
| セクション | フィールド | 日本語表示 | 重要度 | 理由 |
|------------|------------|------------|--------|------|
| researchData | deepResearchMemo | ディープリサーチメモ | 12 | 企業理解の基盤情報 |
| projectDesign | challengeSummary | 課題要約 | 10 | 解決すべき課題の明確化 |
| companyProfile | industry | 業界 | 10 | 業界特性に応じた分析に必要 |
| currentAnalysis | previousEfforts | これまでの取り組み | 8 | 失敗要因の分析に重要 |
| currentAnalysis | teamComposition | チーム構成 | 8 | 人材要件の背景理解 |

### 🟢 中程度（5-7点）- 背景理解に必要
| セクション | フィールド | 日本語表示 | 重要度 | 理由 |
|------------|------------|------------|--------|------|
| projectDesign | urgencyReason | 緊急性の理由 | 7 | プロジェクト優先度の理解 |
| currentAnalysis | failureReasons | 失敗理由 | 6 | 過去の課題要因の把握 |
| projectDesign | idealState3Months | 3ヶ月後の理想状態 | 6 | 成果目標の明確化 |
| currentAnalysis | missingSkills | 不足スキル | 6 | 必要人材スキルの直接指標 |
| researchData | organizationCulture | 組織文化・特徴 | 5 | カルチャーフィットの判断 |
| researchData | hypothesisInsights | 仮説・洞察 | 5 | 深い企業理解の示唆 |

### 🔵 補助的（2-4点）- あると良い
| セクション | フィールド | 日本語表示 | 重要度 | 理由 |
|------------|------------|------------|--------|------|
| companyProfile | businessDescription | 事業内容 | 4 | 業務理解の補強 |
| projectDesign | budget | 予算 | 4 | プロジェクト規模の把握 |
| companyProfile | employeeCount | 従業員数 | 3 | 企業規模の参考情報 |
| companyProfile | revenue | 年商 | 3 | 企業規模の参考情報 |
| companyProfile | headquarters | 本社所在地 | 2 | 地域性の参考情報 |
| researchData | recentNews | 最近の動き・ニュース | 2 | 企業動向の補強情報 |

## 特別な重み付け項目

### Step3固有の重要項目
| 項目 | 日本語表示 | 重要度 | 理由 |
|------|------------|--------|------|
| metadata.actualWorkingHours | 実際の稼働時間 | 12 | 人材要件の具体的条件 |
| metadata.talentCount | 希望人数 | 10 | チーム構成の基本設計 |

## スコア計算ロジック

```javascript
const calculateAnalysisScore = (template) => {
  const maxPossibleScore = 177; // 全項目の重要度合計
  let currentScore = 0;
  
  weights.forEach(({ section, field, weight }) => {
    const value = template[section]?.[field];
    if (hasValidValue(value)) {
      currentScore += weight;
    }
  });
  
  return Math.round((currentScore / maxPossibleScore) * 100);
};
```

## AI分析での活用方法

### プロンプト生成時の重み付け
1. **超重要項目（15-20点）**: プロンプトの最上部で強調
2. **重要項目（8-12点）**: 詳細分析対象として明記
3. **中程度項目（5-7点）**: 補完情報として活用
4. **補助的項目（2-4点）**: 参考情報として末尾に配置

### 欠損情報の優先度表示
- 20点項目が欠損 → 「🔴 分析精度に大きく影響」
- 10-15点項目が欠損 → 「🟡 入力推奨」
- 5-8点項目が欠損 → 「🟢 より良い分析のために」
- 2-4点項目が欠損 → 「🔵 参考情報として」

## 運用方針

1. **動的調整**: 実際の分析結果を見て重要度を調整
2. **業界特化**: 将来的に業界別の重み付けも検討
3. **フェーズ別**: プロジェクトフェーズにより重要度を変更

---

最終更新: 2025年6月9日
重要度合計: 177点（全項目入力時の最大スコア）