'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { InterviewReport, InterviewSession, RoundEvaluation, DimensionScore, ImprovementItem } from '@/types/interview';

interface ExportButtonsProps {
  report: InterviewReport;
  session: InterviewSession;
}

export function ExportButtons({ report, session }: ExportButtonsProps) {
  const t = useTranslations('interview.report');
  const [pdfLoading, setPdfLoading] = useState(false);

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filePrefix = `interview-report-${session.jobTitle}-${new Date(session.createdAt).toISOString().slice(0, 10)}`;

  const exportMarkdown = () => {
    downloadFile(generateMarkdown(report, session), `${filePrefix}.md`, 'text/markdown');
  };

  const exportPdf = async () => {
    setPdfLoading(true);
    try {
      const html = generatePdfHtml(report, session);
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(html);
      printWindow.document.close();
      // Wait for content to render then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 300);
      };
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportPdf} disabled={pdfLoading}>
        {pdfLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <FileDown className="mr-1 h-4 w-4" />}
        {t('exportPdf')}
      </Button>
      <Button variant="outline" size="sm" onClick={exportMarkdown}>
        <FileText className="mr-1 h-4 w-4" />
        {t('exportMarkdown')}
      </Button>
    </div>
  );
}

function getGradeLabel(score: number): { zh: string; color: string } {
  if (score >= 90) return { zh: '优秀', color: '#16a34a' };
  if (score >= 75) return { zh: '良好', color: '#2563eb' };
  if (score >= 60) return { zh: '合格', color: '#ca8a04' };
  return { zh: '需提升', color: '#dc2626' };
}

function starHtml(score: number): string {
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < score ? '#facc15' : '#e5e7eb'};">★</span>`
  ).join('');
}

function generatePdfHtml(report: InterviewReport, session: InterviewSession): string {
  const grade = getGradeLabel(report.overallScore);
  const rounds = report.roundEvaluations as RoundEvaluation[];
  const dimensions = report.dimensionScores as DimensionScore[];
  const improvements = report.improvementPlan as ImprovementItem[];
  const date = new Date(session.createdAt).toLocaleDateString();

  const priorityColors: Record<string, { bg: string; text: string }> = {
    high: { bg: '#fef2f2', text: '#dc2626' },
    medium: { bg: '#fefce8', text: '#ca8a04' },
    low: { bg: '#f0fdf4', text: '#16a34a' },
  };
  const priorityLabels: Record<string, string> = { high: '高', medium: '中', low: '低' };

  return `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<title>面试报告 - ${session.jobTitle}</title>
<style>
  @page { margin: 20mm 15mm; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; color: #18181b; font-size: 13px; line-height: 1.7; background: white; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }

  /* Header */
  .header { display: flex; align-items: center; gap: 24px; padding-bottom: 24px; border-bottom: 2px solid #f4f4f5; margin-bottom: 28px; }
  .score-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 3px solid ${grade.color}; }
  .score-number { font-size: 28px; font-weight: 800; color: ${grade.color}; line-height: 1; }
  .score-label { font-size: 11px; font-weight: 600; color: ${grade.color}; margin-top: 2px; }
  .header-info h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .header-info p { font-size: 12px; color: #71717a; }

  /* Section */
  .section { margin-bottom: 28px; }
  .section-title { font-size: 15px; font-weight: 700; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #f4f4f5; color: #18181b; }

  /* Feedback */
  .feedback { background: #fafafa; border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.8; white-space: pre-wrap; }

  /* Dimensions */
  .dim-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .dim-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #fafafa; border-radius: 6px; }
  .dim-name { flex: 1; font-size: 12px; }
  .dim-bar { width: 120px; height: 6px; background: #f4f4f5; border-radius: 3px; overflow: hidden; }
  .dim-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #ec4899, #f472b6); }
  .dim-score { font-size: 12px; font-weight: 700; color: #ec4899; width: 28px; text-align: right; }

  /* Round */
  .round { border: 1px solid #f4f4f5; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
  .round-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fafafa; }
  .round-name { font-weight: 600; font-size: 14px; }
  .round-score { font-size: 18px; font-weight: 800; color: #ec4899; }
  .round-feedback { padding: 12px 16px; font-size: 12px; color: #52525b; border-bottom: 1px solid #f4f4f5; }
  .question { padding: 12px 16px; border-bottom: 1px solid #f4f4f5; }
  .question:last-child { border-bottom: none; }
  .q-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .q-num { font-size: 11px; font-weight: 600; color: #a1a1aa; }
  .q-stars { font-size: 12px; letter-spacing: 1px; }
  .q-tag { font-size: 9px; padding: 1px 6px; border-radius: 3px; font-weight: 600; }
  .q-tag-review { background: #fef3c7; color: #92400e; }
  .q-tag-hint { background: #fef9c3; color: #854d0e; }
  .q-tag-skip { background: #f4f4f5; color: #71717a; }
  .q-text { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .q-answer { font-size: 12px; color: #52525b; margin-bottom: 6px; }
  .q-detail { font-size: 11px; margin-bottom: 3px; }
  .q-detail-label { font-weight: 600; }
  .q-detail-green { color: #16a34a; }
  .q-detail-red { color: #dc2626; }
  .q-detail-blue { color: #2563eb; }

  /* Improvement */
  .imp-item { display: flex; gap: 12px; padding: 12px; background: #fafafa; border-radius: 8px; margin-bottom: 8px; }
  .imp-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; white-space: nowrap; height: fit-content; }
  .imp-content { flex: 1; }
  .imp-area { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
  .imp-desc { font-size: 12px; color: #52525b; margin-bottom: 4px; }
  .imp-resources { font-size: 11px; color: #71717a; }

  /* Footer */
  .footer { text-align: center; padding-top: 20px; border-top: 1px solid #f4f4f5; margin-top: 28px; font-size: 11px; color: #a1a1aa; }

  @media print {
    .page { padding: 0; }
    .round, .section { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="score-circle">
      <div class="score-number">${report.overallScore}</div>
      <div class="score-label">${grade.zh}</div>
    </div>
    <div class="header-info">
      <h1>${session.jobTitle}</h1>
      <p>${date} · ${rounds.length} 轮面试 · ${rounds.reduce((s, r) => s + r.questions.length, 0)} 题</p>
    </div>
  </div>

  <!-- Overall Feedback -->
  <div class="section">
    <div class="section-title">总体评价</div>
    <div class="feedback">${report.overallFeedback}</div>
  </div>

  <!-- Dimensions -->
  <div class="section">
    <div class="section-title">能力维度</div>
    <div class="dim-grid">
      ${dimensions.map(d => `
        <div class="dim-item">
          <span class="dim-name">${d.dimension}</span>
          <div class="dim-bar"><div class="dim-fill" style="width:${d.score}%"></div></div>
          <span class="dim-score">${d.score}</span>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Round Evaluations -->
  <div class="section">
    <div class="section-title">分轮评估</div>
    ${rounds.map(r => `
      <div class="round">
        <div class="round-header">
          <span class="round-name">${r.interviewerName} · ${r.interviewerType}</span>
          <span class="round-score">${r.score}</span>
        </div>
        <div class="round-feedback">${r.feedback}</div>
        ${r.questions.map((q, qi) => `
          <div class="question">
            <div class="q-header">
              <span class="q-num">Q${qi + 1}</span>
              <span class="q-stars">${starHtml(q.score)}</span>
              ${q.marked ? '<span class="q-tag q-tag-review">标记复习</span>' : ''}
              ${q.hinted ? '<span class="q-tag q-tag-hint">使用提示</span>' : ''}
              ${q.skipped ? '<span class="q-tag q-tag-skip">已跳过</span>' : ''}
            </div>
            <div class="q-text">${q.question}</div>
            <div class="q-answer">${q.answerSummary}</div>
            ${q.highlights.length ? `<div class="q-detail"><span class="q-detail-label q-detail-green">亮点：</span>${q.highlights.join('；')}</div>` : ''}
            ${q.weaknesses.length ? `<div class="q-detail"><span class="q-detail-label q-detail-red">不足：</span>${q.weaknesses.join('；')}</div>` : ''}
            <div class="q-detail"><span class="q-detail-label q-detail-blue">参考：</span>${q.referenceTips}</div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>

  <!-- Improvement Plan -->
  <div class="section">
    <div class="section-title">改进建议</div>
    ${improvements.map(item => {
      const pc = priorityColors[item.priority] || priorityColors.medium;
      return `
        <div class="imp-item">
          <span class="imp-badge" style="background:${pc.bg};color:${pc.text};">${priorityLabels[item.priority] || item.priority}</span>
          <div class="imp-content">
            <div class="imp-area">${item.area}</div>
            <div class="imp-desc">${item.description}</div>
            ${item.resources.length ? `<div class="imp-resources">推荐资源：${item.resources.join('；')}</div>` : ''}
          </div>
        </div>
      `;
    }).join('')}
  </div>

  <div class="footer">Generated by JadeAI · ${date}</div>
</div>
</body>
</html>`;
}

function generateMarkdown(report: InterviewReport, session: InterviewSession): string {
  const lines: string[] = [];
  const rounds = report.roundEvaluations as RoundEvaluation[];

  lines.push(`# 面试报告：${session.jobTitle}`);
  lines.push(`> 日期：${new Date(session.createdAt).toLocaleDateString()} · 综合评分：${report.overallScore}/100\n`);
  lines.push(`## 总体评价\n\n${report.overallFeedback}\n`);

  lines.push(`## 能力维度\n`);
  for (const d of report.dimensionScores) {
    lines.push(`- **${d.dimension}**：${d.score}/100`);
  }
  lines.push('');

  lines.push(`## 分轮评估\n`);
  for (const r of rounds) {
    lines.push(`### ${r.interviewerName}（${r.interviewerType}）— ${r.score}/100\n`);
    lines.push(`${r.feedback}\n`);
    for (const q of r.questions) {
      const tags = [q.marked && '📌复习', q.hinted && '💡提示', q.skipped && '⏭跳过'].filter(Boolean).join(' ');
      lines.push(`#### Q: ${q.question} ${'⭐'.repeat(q.score)} ${tags}\n`);
      lines.push(`**回答摘要**：${q.answerSummary}\n`);
      if (q.highlights.length) lines.push(`✅ **亮点**：${q.highlights.join('；')}\n`);
      if (q.weaknesses.length) lines.push(`❌ **不足**：${q.weaknesses.join('；')}\n`);
      lines.push(`📖 **参考**：${q.referenceTips}\n`);
    }
  }

  lines.push(`## 改进建议\n`);
  for (const item of report.improvementPlan) {
    const label = { high: '🔴 高', medium: '🟡 中', low: '🟢 低' }[item.priority] || item.priority;
    lines.push(`### [${label}] ${item.area}\n`);
    lines.push(`${item.description}\n`);
    if (item.resources.length) lines.push(`> 推荐资源：${item.resources.join('；')}\n`);
  }

  lines.push(`\n---\n*Generated by JadeAI*`);
  return lines.join('\n');
}
