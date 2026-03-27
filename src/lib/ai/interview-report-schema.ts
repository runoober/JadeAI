import { z } from 'zod/v4';

const questionEvaluationSchema = z.object({
  question: z.string().describe('The interview question asked'),
  answerSummary: z.string().describe('Brief summary of the candidate answer'),
  score: z.number().min(1).max(5).describe('Score from 1 to 5'),
  highlights: z.array(z.string()).describe('Strengths in the answer'),
  weaknesses: z.array(z.string()).describe('Areas for improvement'),
  referenceTips: z.string().describe('Reference answer direction or tips'),
  marked: z.boolean().describe('Whether the candidate marked this for review'),
  hinted: z.boolean().describe('Whether the candidate used a hint'),
  skipped: z.boolean().describe('Whether the candidate skipped this question'),
});

const roundEvaluationSchema = z.object({
  roundId: z.string().describe('The round ID'),
  interviewerType: z.string().describe('Type of interviewer'),
  interviewerName: z.string().describe('Name of the interviewer'),
  score: z.number().min(0).max(100).describe('Round score 0-100'),
  feedback: z.string().describe('Overall feedback for this round'),
  questions: z.array(questionEvaluationSchema).describe('Per-question evaluations'),
});

const dimensionScoreSchema = z.object({
  dimension: z.string().describe('Dimension name'),
  score: z.number().min(0).max(100).describe('Score for this dimension'),
  maxScore: z.number().describe('Max score, always 100'),
});

const improvementItemSchema = z.object({
  priority: z.enum(['high', 'medium', 'low']).describe('Priority level'),
  area: z.string().describe('Area to improve'),
  description: z.string().describe('What to improve and why'),
  resources: z.array(z.string()).describe('Recommended learning resources'),
});

export const interviewReportSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall interview score 0-100'),
  dimensionScores: z.array(dimensionScoreSchema).describe('Radar chart dimension scores'),
  roundEvaluations: z.array(roundEvaluationSchema).describe('Per-round detailed evaluations'),
  overallFeedback: z.string().describe('Comprehensive feedback summary'),
  improvementPlan: z.array(improvementItemSchema).describe('Prioritized improvement suggestions'),
});

export type InterviewReportOutput = z.infer<typeof interviewReportSchema>;
